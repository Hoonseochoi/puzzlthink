-- 스타배틀 (Star Battle): third logic puzzle on the 마슈 / 노노그램 challenge tables.
-- Same flow as 20270109000000_masyu_nonogram.sql; this only adds 'starbattle' to every game list.
-- Generated from the live definitions on 2026-11-22 so later edits by other changes are kept.

alter table public.logic_pool drop constraint logic_pool_game_check;
alter table public.logic_pool add constraint logic_pool_game_check check (game in ('masyu', 'nonogram', 'starbattle'));

alter table public.logic_boards drop constraint logic_boards_game_check;
alter table public.logic_boards add constraint logic_boards_game_check check (game in ('masyu', 'nonogram', 'starbattle'));

alter table public.game_results drop constraint game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle'));

alter table public.game_plays_daily drop constraint game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle'));

-- Fastest believable clear: a 10×10 Star Battle can go in well under a minute.
CREATE OR REPLACE FUNCTION public.logic_floor_ms(p_game text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case p_game when 'masyu' then 15000 when 'starbattle' then 8000 else 25000 end;
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
  if p_game not in ('masyu', 'nonogram', 'starbattle') then raise exception 'game'; end if;
  -- Any run of this game still open ends as a fail (one board at a time).
  update public.logic_runs set finished_at = now(), result = 'fail' where user_id = auth.uid() and game = p_game and finished_at is null;
  select * into pick from public.logic_pool where game = p_game and not used order by random() limit 1 for update skip locked;
  if pick.seed is null then raise exception 'pool_empty'; end if;
  update public.logic_pool set used = true where game = pick.game and seed = pick.seed;
  insert into public.logic_boards (id, game, seed, size) values (bid, p_game, pick.seed, pick.size);
  insert into public.logic_runs (board_id, game, user_id, kind) values (bid, p_game, auth.uid(), 'new') returning id into rid;
  return jsonb_build_object('run', rid, 'board', bid, 'seed', pick.seed, 'size', pick.size);
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
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle');
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
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram', 'starbattle'] loop
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
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$;

notify pgrst, 'reload schema';
