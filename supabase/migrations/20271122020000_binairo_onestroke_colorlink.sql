-- 비나이로 · 한붓길 · 컬러 잇기: three more logic puzzles on the challenge tables (same flow as 마슈 / 스타배틀).
-- Generated from the live definitions on 2026-11-22, adding the new games to every game list. Also:
-- - logic_floor_ms: fastest believable clears for the new boards;
-- - logic_finish: 비나이로 answers keep both colours ('1' black, '2' white), so its replay compares the raw marks.

alter table public.logic_pool drop constraint logic_pool_game_check;
alter table public.logic_pool add constraint logic_pool_game_check check (game in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink'));

alter table public.logic_boards drop constraint logic_boards_game_check;
alter table public.logic_boards add constraint logic_boards_game_check check (game in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink'));

alter table public.game_results drop constraint game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink'));

alter table public.game_plays_daily drop constraint game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink'));

CREATE OR REPLACE FUNCTION public.logic_floor_ms(p_game text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case p_game when 'masyu' then 15000 when 'starbattle' then 8000 when 'binairo' then 10000 when 'onestroke' then 8000 when 'colorlink' then 8000 else 25000 end;
$function$;

CREATE OR REPLACE FUNCTION public.logic_start_new(p_game text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare pick public.logic_pool; bid text := substr(md5(random()::text || clock_timestamp()::text), 1, 10); rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  if p_game not in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink') then raise exception 'game'; end if;
  -- Any run of this game still open ends as a fail (one board at a time).
  update public.logic_runs set finished_at = now(), result = 'fail' where user_id = auth.uid() and game = p_game and finished_at is null;
  select * into pick from public.logic_pool where game = p_game and not used order by random() limit 1 for update skip locked;
  if pick.seed is null then raise exception 'pool_empty'; end if;
  update public.logic_pool set used = true where game = pick.game and seed = pick.seed;
  insert into public.logic_boards (id, game, seed, size) values (bid, p_game, pick.seed, pick.size);
  insert into public.logic_runs (board_id, game, user_id, kind) values (bid, p_game, auth.uid(), 'new') returning id into rid;
  return jsonb_build_object('run', rid, 'board', bid, 'seed', pick.seed, 'size', pick.size);
end; $function$;

CREATE OR REPLACE FUNCTION public.logic_finish(p_run uuid, p_steps jsonb, p_away jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      -- Answers with a '2' (비나이로's white stones) compare raw marks; elsewhere a ✕ (2) counts as empty.
      good := (select string_agg(case when m = 1 then '1' when m = 2 and position('2' in want) > 0 then '2' else '0' end, '' order by k) from unnest(marks) with ordinality u(m, k)) = want;
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
end; $function$;

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
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink');
$function$;

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
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $function$;

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$;

notify pgrst, 'reload schema';
