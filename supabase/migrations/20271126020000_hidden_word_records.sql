-- 히든 워드 (hidden_word) in the shared records: results and play counts, the 승점 board 'hidden_word' (total points of
-- finished AI matches) for 기록실 · 랭킹 pages · rank moves, and the 'c-hidden_word' crown icon for its #1.
-- Generated from the live definitions on 2026-11-26 (they already carry equation_signal / equation_tower from another
-- branch): each function below is the live one plus hidden_word. Needs 20271126000000_hidden_word.sql.
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word'));

-- 승점 board rows: total points, fewer matches first on ties, then who got there first. Players hidden from the hall are left out.
create or replace function public.hw_rank_rows()
returns table (user_id uuid, points int, games int, rnk int)
language sql stable security definer set search_path = public, pg_temp
as $$
  select t.user_id, t.points, t.games, (row_number() over (order by t.points desc, t.games, t.last_at))::int
    from (select r.user_id, sum(r.points)::int as points, count(*)::int as games, max(r.played_at) as last_at
            from public.hw_results r group by r.user_id) t
    join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.points > 0;
$$;
revoke all on function public.hw_rank_rows() from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
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
    -- 수식 신호등 · 수식의 탑 10분 챌린지: equations solved / points. For 수식 신호등, sub = guesses used (fewer first on a tie).
    select r.user_id, (r.detail ->> 'score')::int,
           case when r.game = 'equation_signal' and (r.detail ->> 'guesses') ~ '^[0-9]{1,5}$' then (r.detail ->> 'guesses')::int end, r.played_at
      from public.game_results r
     where ((p_board = 'eqsignal' and r.game = 'equation_signal') or (p_board = 'eqtower' and r.game = 'equation_tower'))
       and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^[0-9]{1,4}$' and not (r.detail ? 'voided')
    union all
    -- sub = minus the run's biggest block: the ranking shows it as the player's picture, and on a tied score
    -- the bigger block goes first (sub sorts ascending).
    select r.user_id, (r.detail ->> 'score')::int,
           case when (r.detail ->> 'max') ~ '^[0-9]{1,6}$' then -((r.detail ->> 'max')::int) end, r.played_at
      from public.game_results r
     where p_board = 'merge2048' and r.game = 'merge2048' and r.mode = 'solo' and r.detail ->> 'mode' = 'endless'
       and (r.detail ->> 'score') ~ '^[0-9]+$' and (r.detail ->> 'moves') ~ '^[0-9]+$' and not (r.detail ? 'voided')
       -- A run spawns at most a 4 per move, so its blocks add up to at most 4·(moves + 2), and every point of
       -- score is one of those values merged again (at most 16 times on the way to 131072): drop runs past that.
       and (r.detail ->> 'score')::bigint <= 64 * ((r.detail ->> 'moves')::bigint + 2)
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
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap')
  union all
  select h.user_id, h.points, h.games, h.rnk from public.hw_rank_rows() h where p_board = 'hidden_word';
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
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'eqsignal', 'eqtower', 'hidden_word'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $function$;

CREATE OR REPLACE FUNCTION public.refresh_game_crowns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  g text; v_board text; v_uid uuid; v_cur uuid; v_hall jsonb; d text;
  games text[] := array['hidden_word', 'equation_signal', 'equation_tower', 'gradation', 'card_janggi', 'color_link_duel', 'hit_stay', 'point_omok', 'merge2048', 'magicswap', 'binairo', 'onestroke',
    'colorlink', 'starbattle', 'masyu', 'nonogram', 'two_sided_poker', 'monorail', 'four_three', 'flip_omok', 'nine_mens_morris',
    'wallgo2', 'slitherlink', 'gyulhap', 'indian_poker', 'wallgo', 'heavy13', 'janggi', 'russian_janggi', 'russian_roulette',
    'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'hexagon', 'piggy_bank', 'sudoku'];
  no_hall text[] := array['nemo_count', 'gyulhap', 'slitherlink', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'equation_signal', 'equation_tower'];
begin
  select coalesce(jsonb_object_agg(s.game, s.user_id), '{}'::jsonb) into v_hall
    from (select distinct on (h.game) h.game, h.user_id from public.hall_ranking() h where h.rn = 1 order by h.game, h.rn, h.user_id) s;
  foreach g in array games loop
    v_uid := null;
    v_board := case g when 'slitherlink' then 'slither' when 'binairo' then 'binairo' when 'onestroke' then 'onestroke'
      when 'colorlink' then 'colorlink' when 'magicswap' then 'magicswap' when 'starbattle' then 'starbattle'
      when 'masyu' then 'masyu' when 'nonogram' then 'nonogram' when 'merge2048' then 'merge2048' when 'hidden_word' then 'hidden_word'
      when 'gyulhap' then 'gyulhap10' when 'hexagon' then 'hexagon'
      when 'equation_signal' then 'eqsignal' when 'equation_tower' then 'eqtower' end;
    if v_board is not null then
      select c.user_id into v_uid from public.challenge_rows(v_board) c where c.rnk = 1 order by c.sub nulls last, c.user_id limit 1;
    elsif g = 'nemo_count' then
      foreach d in array array['hard', 'normal', 'easy'] loop
        select b.user_id into v_uid from (
          select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
            from public.game_results r
           where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = d and (r.detail ->> 'correct') ~ '^[0-9]+$'
             and not (r.detail ? 'voided')
           order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
        ) b join public.profiles p on p.id = b.user_id
         where p.show_in_hall and b.correct > 0
         order by b.correct desc, b.avg_ms asc nulls last, b.played_at limit 1;
        exit when v_uid is not null;
      end loop;
      if v_uid is null then select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1; end if;
    else
      if not (g = any(no_hall)) then v_uid := (v_hall ->> g)::uuid; end if;
      if v_uid is null and g not in ('sudoku', 'gradation') then
        select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1;
      end if;
    end if;

    select c.user_id into v_cur from public.game_crowns c where c.game = g;
    if v_uid is not distinct from v_cur then continue; end if;
    if v_cur is not null then
      update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-' || g and revoked_at is null;
    end if;
    if v_uid is null then
      delete from public.game_crowns where game = g;
    else
      insert into public.game_crowns (game, user_id, since) values (g, v_uid, now())
      on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
      perform public.grant_icon(v_uid, 'c-' || g);
    end if;
  end loop;
end; $function$;
revoke all on function public.refresh_game_crowns() from public, anon, authenticated;

notify pgrst, 'reload schema';
