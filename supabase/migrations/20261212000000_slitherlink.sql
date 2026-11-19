-- 슬리더링크: records, play counter and the challenge.
-- 새로운 챌린지: a fresh random 11×11 board (seed from the server). Clearing it publishes the board.
-- 기존 챌린지 깨기: play a published board within its holder's time; beating it makes you the holder.
-- Times are measured on the server (start → finish), so a board cannot be "finished" faster than it was played.

alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink'));

create or replace function public.count_play(p_game text, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $$;
revoke all on function public.count_play(text, text) from public;
grant execute on function public.count_play(text, text) to anon, authenticated;

create table if not exists public.slither_challenges (
  id text primary key,
  seed bigint not null,
  dots integer not null default 11,
  created_at timestamptz not null default now(),
  published_at timestamptz,                 -- set when its first player clears it
  first_user uuid references auth.users(id) on delete set null,
  first_ms integer,
  holder uuid references auth.users(id) on delete set null,
  holder_ms integer,
  attempts integer not null default 0,     -- 기존 챌린지 tries
  takeovers integer not null default 0
);
create index if not exists slither_challenges_published on public.slither_challenges (published_at desc) where published_at is not null;

create table if not exists public.slither_runs (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null references public.slither_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('new', 'beat')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ms integer,
  hints integer,
  result text check (result in ('clear', 'fail'))
);
create index if not exists slither_runs_new_clears on public.slither_runs (user_id, ms) where kind = 'new' and result = 'clear';
alter table public.slither_challenges enable row level security;
alter table public.slither_runs enable row level security; -- access only through the functions below

-- Each player's best 새로운 챌린지 time (shown players only), fastest first.
create or replace function public.slither_rows()
returns table(user_id uuid, ms integer, rnk integer)
language sql stable security definer set search_path = public as $$
  with best as (
    select r.user_id, min(r.ms) as ms from public.slither_runs r
     where r.kind = 'new' and r.result = 'clear' group by r.user_id
  )
  select b.user_id, b.ms, (rank() over (order by b.ms))::int
    from best b join public.profiles p on p.id = b.user_id where p.show_in_hall;
$$;
revoke all on function public.slither_rows() from public, anon, authenticated;

create or replace function public.slither_start_new()
returns jsonb language plpgsql security definer set search_path = public as $$
declare cid text := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
        s bigint := floor(random() * 2000000000)::bigint;
        rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  insert into public.slither_challenges (id, seed) values (cid, s);
  insert into public.slither_runs (challenge_id, user_id, kind) values (cid, auth.uid(), 'new') returning id into rid;
  return jsonb_build_object('run', rid, 'challenge', cid, 'seed', s, 'dots', 11);
end; $$;

create or replace function public.slither_start_beat(p_challenge text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.slither_challenges; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into c from public.slither_challenges where id = p_challenge and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if c.holder = auth.uid() then raise exception 'own_board'; end if;
  update public.slither_challenges set attempts = attempts + 1 where id = c.id;
  insert into public.slither_runs (challenge_id, user_id, kind) values (c.id, auth.uid(), 'beat') returning id into rid;
  return jsonb_build_object('run', rid, 'challenge', c.id, 'seed', c.seed, 'dots', c.dots, 'limit_ms', c.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = c.holder));
end; $$;

-- Ends my run. A clear of a new board publishes it; a clear of a published board within the holder's time takes it over.
create or replace function public.slither_finish(p_run uuid, p_cleared boolean, p_hints integer default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = auth.uid() and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  -- Up to 3 hours for a new board; a beat must come within the holder's time (plus a little for the network).
  ok := p_cleared and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= c.holder_ms + 1500);
  update public.slither_runs set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = auth.uid(), first_ms = took, holder = auth.uid(), holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' then
    update public.slither_challenges set holder = auth.uid(), holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if r.kind = 'new' and ok then
    select count(*)::int into total from public.slither_rows();
    select 1 + count(*)::int into place from public.slither_rows() x where x.ms < took;
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total);
end; $$;

-- Top times (새로운 챌린지): "#4 · 39분".
create or replace function public.slither_ranking(p_limit integer default 10)
returns table(rank integer, nickname text, ms integer, is_me boolean)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.ms, x.user_id = auth.uid()
    from public.slither_rows() x join public.profiles p on p.id = x.user_id
   order by x.rnk, x.ms limit least(greatest(p_limit, 1), 50);
$$;

-- My place, if I have cleared a new board.
create or replace function public.slither_me()
returns table(rank integer, ms integer, total integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, x.ms, (select count(*)::int from public.slither_rows()) from public.slither_rows() x where x.user_id = auth.uid();
$$;

-- Published boards for 기존 챌린지 깨기, newest first.
create or replace function public.slither_challenges_list(p_limit integer default 30)
returns table(id text, holder text, holder_ms integer, first_name text, attempts integer, takeovers integer, published_at timestamptz, mine boolean)
language sql stable security definer set search_path = public as $$
  select c.id, coalesce(nullif(h.nickname, ''), 'Player'), c.holder_ms, coalesce(nullif(f.nickname, ''), 'Player'), c.attempts, c.takeovers, c.published_at, c.holder = auth.uid()
    from public.slither_challenges c
    left join public.profiles h on h.id = c.holder
    left join public.profiles f on f.id = c.first_user
   where c.published_at is not null
   order by c.published_at desc limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.slither_start_new() from public;
revoke all on function public.slither_start_beat(text) from public;
revoke all on function public.slither_finish(uuid, boolean, integer) from public;
revoke all on function public.slither_ranking(integer) from public;
revoke all on function public.slither_me() from public;
revoke all on function public.slither_challenges_list(integer) from public;
grant execute on function public.slither_start_new() to authenticated;
grant execute on function public.slither_start_beat(text) to authenticated;
grant execute on function public.slither_finish(uuid, boolean, integer) to authenticated;
grant execute on function public.slither_ranking(integer) to anon, authenticated;
grant execute on function public.slither_me() to authenticated;
grant execute on function public.slither_challenges_list(integer) to anon, authenticated;

-- One try per person per board (a failed board could otherwise be solved from a screenshot and retried).
create or replace function public.slither_start_beat(p_challenge text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.slither_challenges; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into c from public.slither_challenges where id = p_challenge and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) then raise exception 'tried'; end if;
  update public.slither_challenges set attempts = attempts + 1 where id = c.id;
  insert into public.slither_runs (challenge_id, user_id, kind) values (c.id, auth.uid(), 'beat') returning id into rid;
  return jsonb_build_object('run', rid, 'challenge', c.id, 'seed', c.seed, 'dots', c.dots, 'limit_ms', c.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = c.holder));
end; $$;

drop function if exists public.slither_challenges_list(integer);
create or replace function public.slither_challenges_list(p_limit integer default 30)
returns table(id text, holder text, holder_ms integer, first_name text, attempts integer, takeovers integer, published_at timestamptz, tried boolean)
language sql stable security definer set search_path = public as $$
  select c.id, coalesce(nullif(h.nickname, ''), 'Player'), c.holder_ms, coalesce(nullif(f.nickname, ''), 'Player'), c.attempts, c.takeovers, c.published_at,
         auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid())
    from public.slither_challenges c
    left join public.profiles h on h.id = c.holder
    left join public.profiles f on f.id = c.first_user
   where c.published_at is not null
   order by c.published_at desc limit least(greatest(p_limit, 1), 100);
$$;
revoke all on function public.slither_challenges_list(integer) from public;
grant execute on function public.slither_challenges_list(integer) to anon, authenticated;

-- Starting, finishing and "my place" are for signed-in players only.
revoke execute on function public.slither_start_new() from anon;
revoke execute on function public.slither_start_beat(text) from anon;
revoke execute on function public.slither_finish(uuid, boolean, integer) from anon;
revoke execute on function public.slither_me() from anon;
