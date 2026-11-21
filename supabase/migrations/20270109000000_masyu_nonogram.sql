-- 마슈 · 노노그램 challenge, the 슬리더링크 way: 새로운 맵 (clear a fresh board to own it) and 맵 뺏기 (beat its holder's
-- time to take it over), ranked by boards owned (맵 수집).
-- Boards are built in the browser from a seed (same seed → same board). The pool keeps each seed with its one answer.
-- Anti-cheat (light, like 슬리더링크): the server times every run; one try per board; a clear must replay — the move log
-- (cell / edge, value, ms) is applied here and has to end exactly on the answer, in time order inside the run;
-- too fast, or 3+ exits from the board (2 s or more) before 20 minutes, flags the run instead of counting it.
-- Fill the pool with: node scripts/logic-pool.ts > pool.sql, then apply pool.sql to this database.

create table if not exists public.logic_pool (
  game text not null check (game in ('masyu', 'nonogram')),
  seed integer not null,
  size integer not null,
  answer text not null,
  used boolean not null default false,
  primary key (game, seed)
);
create index if not exists logic_pool_free on public.logic_pool (game) where not used;
alter table public.logic_pool enable row level security;
revoke all on public.logic_pool from anon, authenticated;

create table if not exists public.logic_boards (
  id text primary key,
  game text not null check (game in ('masyu', 'nonogram')),
  seed integer not null,
  size integer not null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  first_user uuid references auth.users (id) on delete set null,
  first_ms integer,
  holder uuid references auth.users (id) on delete set null,
  holder_ms integer,
  attempts integer not null default 0,
  takeovers integer not null default 0
);
create index if not exists logic_boards_pub on public.logic_boards (game, published_at desc) where published_at is not null;
create index if not exists logic_boards_holder on public.logic_boards (game, holder) where published_at is not null;
alter table public.logic_boards enable row level security;
revoke all on public.logic_boards from anon, authenticated;

create table if not exists public.logic_runs (
  id uuid primary key default gen_random_uuid(),
  board_id text not null references public.logic_boards (id) on delete cascade,
  game text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('new', 'beat')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ms integer,
  result text check (result in ('clear', 'fail')),
  flag text,
  unique (board_id, user_id)
);
create index if not exists logic_runs_user on public.logic_runs (user_id, game);
alter table public.logic_runs enable row level security;
revoke all on public.logic_runs from anon, authenticated;

-- Fastest plausible clear per game (a 10×10 마슈 / 15×15 노노그램 under this is not a person).
create or replace function public.logic_floor_ms(p_game text) returns integer language sql immutable as $$
  select case p_game when 'masyu' then 15000 else 25000 end;
$$;

-- 새로운 맵: a fresh board from the pool, timed from now.
create or replace function public.logic_start_new(p_game text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare pick public.logic_pool; bid text := substr(md5(random()::text || clock_timestamp()::text), 1, 10); rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  if p_game not in ('masyu', 'nonogram') then raise exception 'game'; end if;
  -- Any run of this game still open ends as a fail (one board at a time).
  update public.logic_runs set finished_at = now(), result = 'fail' where user_id = auth.uid() and game = p_game and finished_at is null;
  select * into pick from public.logic_pool where game = p_game and not used order by random() limit 1 for update skip locked;
  if pick.seed is null then raise exception 'pool_empty'; end if;
  update public.logic_pool set used = true where game = pick.game and seed = pick.seed;
  insert into public.logic_boards (id, game, seed, size) values (bid, p_game, pick.seed, pick.size);
  insert into public.logic_runs (board_id, game, user_id, kind) values (bid, p_game, auth.uid(), 'new') returning id into rid;
  return jsonb_build_object('run', rid, 'board', bid, 'seed', pick.seed, 'size', pick.size);
end; $$;
revoke all on function public.logic_start_new(text) from public, anon;
grant execute on function public.logic_start_new(text) to authenticated;

-- 맵 뺏기: one try per board, within the holder's time.
create or replace function public.logic_start_beat(p_board text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.logic_boards; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into b from public.logic_boards where id = p_board and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if b.holder = auth.uid() then raise exception 'mine'; end if;
  if exists (select 1 from public.logic_runs r where r.board_id = b.id and r.user_id = auth.uid()) then raise exception 'tried'; end if;
  update public.logic_runs set finished_at = now(), result = 'fail' where user_id = auth.uid() and game = b.game and finished_at is null;
  update public.logic_boards set attempts = attempts + 1 where id = b.id;
  insert into public.logic_runs (board_id, game, user_id, kind) values (b.id, b.game, auth.uid(), 'beat') returning id into rid;
  return jsonb_build_object('run', rid, 'board', b.id, 'seed', b.seed, 'size', b.size, 'limit_ms', b.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = b.holder));
end; $$;
revoke all on function public.logic_start_beat(text) from public, anon;
grant execute on function public.logic_start_beat(text) to authenticated;

-- Boards owned per player, ranked by count (ties share a rank, like 슬리더링크).
create or replace function public.logic_owner_rows(p_game text)
returns table(user_id uuid, maps integer, best_ms integer, rnk integer)
language sql stable security definer set search_path = public as $$
  with owned as (
    select b.holder as user_id, count(*)::int as maps, min(b.holder_ms)::int as best_ms
      from public.logic_boards b where b.game = p_game and b.published_at is not null and b.holder is not null group by b.holder
  )
  select o.user_id, o.maps, o.best_ms, (rank() over (order by o.maps desc))::int
    from owned o join public.profiles p on p.id = o.user_id where p.show_in_hall;
$$;
revoke all on function public.logic_owner_rows(text) from public, anon, authenticated;

-- Ends a run. p_steps null = gave up / time up / left. A clear replays the move log [[index, value, ms], ...].
create or replace function public.logic_finish(p_run uuid, p_steps jsonb, p_away jsonb default '[]'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.logic_runs; b public.logic_boards; want text; took integer; marks smallint[]; st jsonb; i integer; v integer; t integer;
        last_t integer := 0; good boolean := false; v_flag text; exits integer := 0; ok boolean; place integer; total integer; mine integer; rival_name text;
begin
  select * into r from public.logic_runs where id = p_run and user_id = auth.uid() and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into b from public.logic_boards where id = r.board_id for update;
  select lp.answer into want from public.logic_pool lp where lp.game = b.game and lp.seed = b.seed;
  if p_steps is not null and jsonb_typeof(p_steps) = 'array' and jsonb_array_length(p_steps) between 1 and 6000 and want is not null then
    marks := array_fill(0::smallint, array[length(want)]);
    good := true;
    for st in select * from jsonb_array_elements(p_steps) loop
      if jsonb_typeof(st) <> 'array' or jsonb_array_length(st) <> 3 then good := false; exit; end if;
      i := (st ->> 0)::int; v := (st ->> 1)::int; t := (st ->> 2)::int;
      if i < 0 or i >= length(want) or v not in (0, 1, 2) or t < last_t or t > took + 2000 then good := false; exit; end if;
      marks[i + 1] := v; last_t := t;
    end loop;
    if good then
      good := (select string_agg(case when m = 1 then '1' else '0' end, '' order by k) from unnest(marks) with ordinality u(m, k)) = want;
    end if;
    if good then
      select count(*) into exits from jsonb_array_elements(coalesce(p_away, '[]'::jsonb)) a
       where jsonb_typeof(a) = 'array' and (a ->> 1)::numeric - (a ->> 0)::numeric >= 2000;
      if took < public.logic_floor_ms(b.game) then v_flag := 'fast';
      elsif exits >= 3 and took < 20 * 60 * 1000 then v_flag := 'away'; end if;
    end if;
  end if;
  ok := good and v_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= b.holder_ms + 1500);
  update public.logic_runs set finished_at = now(), ms = took, result = case when ok then 'clear' else 'fail' end, flag = v_flag where id = r.id;
  if ok and r.kind = 'new' and b.published_at is null then
    update public.logic_boards set published_at = now(), first_user = auth.uid(), first_ms = took, holder = auth.uid(), holder_ms = took where id = b.id;
  elsif ok and r.kind = 'beat' then
    if b.holder is not null and b.holder <> auth.uid() then
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = b.holder);
    end if;
    update public.logic_boards set holder = auth.uid(), holder_ms = least(took, b.holder_ms), takeovers = takeovers + 1 where id = b.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.logic_owner_rows(b.game) x where x.user_id = auth.uid();
    select count(*)::int into total from public.logic_owner_rows(b.game);
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', good and v_flag is not null, 'flag', v_flag, 'rival', rival_name, 'board', b.id);
end; $$;
revoke all on function public.logic_finish(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.logic_finish(uuid, jsonb, jsonb) to authenticated;

-- Ranking by boards owned, with one of each player's boards to try.
create or replace function public.logic_ranking(p_game text, p_limit integer default 10)
returns table(rank integer, nickname text, maps integer, best_ms integer, is_me boolean, board text, board_ms integer, tried boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.maps, x.best_ms, x.user_id = auth.uid(), b.id, b.holder_ms, coalesce(b.tried, false),
         public.rank_prev('chal:' || p_game, x.user_id, x.rnk)
    from public.logic_owner_rows(p_game) x
    join public.profiles p on p.id = x.user_id
    left join lateral (
      select c.id, c.holder_ms,
             auth.uid() is not null and exists (select 1 from public.logic_runs r where r.board_id = c.id and r.user_id = auth.uid()) as tried
        from public.logic_boards c
       where c.game = p_game and c.holder = x.user_id and c.published_at is not null
       order by 3, c.published_at desc limit 1
    ) b on true
   order by x.rnk, x.best_ms limit least(greatest(p_limit, 1), 50);
$$;
revoke all on function public.logic_ranking(text, integer) from public;
grant execute on function public.logic_ranking(text, integer) to anon, authenticated;

-- My place: rank, boards owned, ranked players.
create or replace function public.logic_me(p_game text)
returns table(rank integer, maps integer, total integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, x.maps, (select count(*)::int from public.logic_owner_rows(p_game))
    from public.logic_owner_rows(p_game) x where x.user_id = auth.uid();
$$;
revoke all on function public.logic_me(text) from public, anon;
grant execute on function public.logic_me(text) to authenticated;

-- Published boards, newest first (or one board by id).
create or replace function public.logic_boards_list(p_game text, p_limit integer default 40, p_board text default null)
returns table(id text, holder text, holder_ms integer, first_name text, attempts integer, takeovers integer, published_at timestamptz, tried boolean, mine boolean)
language sql stable security definer set search_path = public as $$
  select c.id, coalesce(nullif(h.nickname, ''), 'Player'), c.holder_ms, coalesce(nullif(f.nickname, ''), 'Player'), c.attempts, c.takeovers, c.published_at,
         auth.uid() is not null and exists (select 1 from public.logic_runs r where r.board_id = c.id and r.user_id = auth.uid()),
         auth.uid() is not null and c.holder = auth.uid()
    from public.logic_boards c
    left join public.profiles h on h.id = c.holder
    left join public.profiles f on f.id = c.first_user
   where c.game = p_game and c.published_at is not null and (p_board is null or c.id = p_board)
   order by c.published_at desc limit least(greatest(p_limit, 1), 100);
$$;
revoke all on function public.logic_boards_list(text, integer, text) from public;
grant execute on function public.logic_boards_list(text, integer, text) to anon, authenticated;

-- 기록실 챌린지 boards 'masyu' / 'nonogram' (score = boards owned, sub = best ms).
CREATE OR REPLACE FUNCTION public.challenge_rows(p_board text)
 RETURNS TABLE(user_id uuid, score integer, sub integer, rnk integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with runs as (
    select r.user_id, (r.detail ->> 'score')::int as score, nullif(r.detail ->> 'durationMs', '')::int as sub, r.played_at
      from public.game_results r
     where p_board in ('gyulhap10', 'gyulhap5') and r.game = 'gyulhap' and r.mode = 'solo'
       and r.detail ->> 'mode' = case p_board when 'gyulhap10' then 'challenge10' else 'challenge5' end
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    select r.user_id, (r.detail ->> 'score')::int, null, r.played_at
      from public.game_results r
     where p_board = 'hexagon' and r.game = 'hexagon' and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    select r.user_id, (r.detail ->> 'correct')::int, nullif(r.detail ->> 'avgMs', '')::int, r.played_at
      from public.game_results r
     where p_board like 'nemo\_%' and r.game = 'nemo_count' and r.mode = 'solo'
       and r.detail ->> 'difficulty' = substr(p_board, 6) and (r.detail ->> 'correct') ~ '^[0-9]+$' and not (r.detail ? 'voided')
  ),
  best as (
    select distinct on (x.user_id) x.user_id, x.score, x.sub, x.played_at
      from runs x where x.score > 0
     order by x.user_id, x.score desc, x.sub asc nulls last, x.played_at
  ),
  ranked as (
    select b.user_id, b.score, b.sub, (row_number() over (order by b.score desc, b.sub asc nulls last, b.played_at))::int as rnk
      from best b join public.profiles p on p.id = b.user_id where p.show_in_hall
  )
  select * from ranked
  union all
  select o.user_id, o.maps, o.best_ms, o.rnk from public.slither_owner_rows() o where p_board = 'slither'
  union all
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram');
$function$;

-- Daily rank-move snapshots include the two new boards.
CREATE OR REPLACE FUNCTION public.rank_snapshot_ensure()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d date := public.kst_today(); b text;
begin
  insert into public.rank_snapshot_days (day) values (d) on conflict do nothing;
  if not found then return; end if;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'hall:' || h.game, h.user_id, h.rn from public.hall_ranking() h where h.rn <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'open:' || g.game, r.user_id, r.rnk
      from (select distinct game from public.game_results where mode = 'friend' and detail ->> 'open' = 'true') g,
           lateral public.open_ranking_rows(g.game) r
     where r.rnk <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'slither', o.user_id, o.rnk from public.slither_owner_rows() o where o.rnk <= 100
    on conflict do nothing;
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $function$;

-- Results and anonymous play counts for the two games.
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram'));
alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram'));

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$;
