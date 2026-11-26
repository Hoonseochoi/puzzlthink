-- 스나이퍼 홀덤 (sniper_holdem) in the shared records: results and play counts, its #1 crown icon ('c-sniper_holdem',
-- already allowed by the c-[a-z0-9_] icon pattern) and the 어려움 clear list of the HIDDEN MISSION (mission_games 'hard').
-- Generated from the live definitions on 2026-11-26 (each function below is the live one plus sniper_holdem; if another
-- branch's migration ran first, rebuild from the live pg_get_functiondef instead of applying this copy as is).
-- Hall of Fame, the open ranking, hard clears (is_hard_clear) and the open-room list are game-agnostic.
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('sniper_holdem', 'wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('sniper_holdem', 'wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word'));

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('sniper_holdem', 'wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$;

CREATE OR REPLACE FUNCTION public.refresh_game_crowns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  g text; v_board text; v_uid uuid; v_cur uuid; v_hall jsonb; d text;
  games text[] := array['sniper_holdem', 'hidden_word', 'equation_signal', 'equation_tower', 'gradation', 'card_janggi', 'color_link_duel', 'hit_stay', 'point_omok', 'merge2048', 'magicswap', 'binairo', 'onestroke',
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
    if v_cur is not null and v_uid is not null then   -- taken by someone: the old #1 is told at their next visit
      insert into public.crown_losses (user_id, game, taker) values (v_cur, g, v_uid);
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

CREATE OR REPLACE FUNCTION public.mission_games(p_kind text)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case p_kind
    when 'hard' then array['sniper_holdem', 'card_janggi', 'color_link_duel', 'gradation', 'point_omok', 'two_sided_poker', 'monorail', 'flip_omok',
                           'nine_mens_morris', 'wallgo2', 'indian_poker', 'piggy_bank', 'black_white', 'black_white_2', 'laser_janggi',
                           'blind_gomoku', 'wallgo', 'russian_roulette', 'heavy13', 'janggi', 'russian_janggi', 'sudoku']
    when 'hell' then array['wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel']
  end;
$function$;

notify pgrst, 'reload schema';
