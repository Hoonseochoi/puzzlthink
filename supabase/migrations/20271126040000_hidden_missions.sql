-- HIDDEN MISSION icons (drawn by MissionIcons.tsx), the rarest on the site:
--   hm-hard  every game with a 어려움 AI (and 스도쿠) cleared on 어려움 or 매우 어려움 (a hard or hell certificate)
--   hm-hell  every 매우 어려움 game cleared (a hell certificate in each)
--   hm-rank  ranked in every game ranking (AI Hall of Fame or challenge board) with an average rank of 10 or better
-- Given with grant_icon (switched on at once, like a #1). Kept for good once earned.
-- When a game gets a 어려움 / 매우 어려움 AI, add it to mission_games() (and HARD_GAMES / HELL_GAMES in the app).

alter table public.profile_icons drop constraint if exists profile_icons_icon_check;
alter table public.profile_icons add constraint profile_icons_icon_check
  check (icon ~ '^([wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123]|x-[a-z0-9_]{1,40}|hc|fw|ow|t(10|20|30|40|50|60|70|80|90|100)|hm-(hard|hell|rank))$');
alter table public.stone_choices drop constraint if exists stone_choices_stone_check;
alter table public.stone_choices add constraint stone_choices_stone_check
  check (stone ~ '^(black|white|red|blue|[wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123]|x-[a-z0-9_]{1,40}|hc|fw|ow|t(10|20|30|40|50|60|70|80|90|100)|hm-(hard|hell|rank))$');

create or replace function public.mission_games(p_kind text)
returns text[] language sql immutable as $$
  select case p_kind
    when 'hard' then array['card_janggi', 'color_link_duel', 'gradation', 'point_omok', 'two_sided_poker', 'monorail', 'flip_omok',
                           'nine_mens_morris', 'wallgo2', 'indian_poker', 'piggy_bank', 'black_white', 'black_white_2', 'laser_janggi',
                           'blind_gomoku', 'wallgo', 'russian_roulette', 'heavy13', 'janggi', 'russian_janggi', 'sudoku']
    when 'hell' then array['wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel']
  end;
$$;

-- ALL HARD / ALL HELL for one player.
create or replace function public.check_clear_missions(p_user uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if p_user is null then return; end if;
  if not exists (select 1 from unnest(public.mission_games('hard')) g
                  where not exists (select 1 from public.hard_clears h where h.user_id = p_user and h.game = g)
                    and not exists (select 1 from public.hell_clears h where h.user_id = p_user and h.game = g)) then
    perform public.grant_icon(p_user, 'hm-hard');
  end if;
  if not exists (select 1 from unnest(public.mission_games('hell')) g
                  where not exists (select 1 from public.hell_clears h where h.user_id = p_user and h.game = g)) then
    perform public.grant_icon(p_user, 'hm-hell');
  end if;
end; $$;
revoke all on function public.check_clear_missions(uuid) from public, anon, authenticated;

create or replace function public.mission_on_clear()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  begin perform public.check_clear_missions(new.user_id); exception when others then null; end;
  return new;
end; $$;
drop trigger if exists mission_on_hard_clear on public.hard_clears;
create trigger mission_on_hard_clear after insert on public.hard_clears for each row execute function public.mission_on_clear();
drop trigger if exists mission_on_hell_clear on public.hell_clears;
create trigger mission_on_hell_clear after insert on public.hell_clears for each row execute function public.mission_on_clear();

-- TOP 10: every player ranked in every game whose average rank is 10 or better. Same boards as my_game_ranks().
create or replace function public.rank_mission_tick()
returns int language plpgsql security definer set search_path to 'public' as $$
declare v_n int := 0; r record;
begin
  for r in
    with boards(game, board) as (values
      ('slitherlink', 'slither'), ('binairo', 'binairo'), ('onestroke', 'onestroke'), ('colorlink', 'colorlink'),
      ('magicswap', 'magicswap'), ('starbattle', 'starbattle'), ('masyu', 'masyu'), ('nonogram', 'nonogram'),
      ('gyulhap', 'gyulhap10'), ('nemo_count', 'nemo_hard'), ('hexagon', 'hexagon'), ('equation_signal', 'eqsignal'),
      ('equation_tower', 'eqtower'), ('merge2048', 'merge2048'), ('hidden_word', 'hidden_word')),
    ranks as (
      select h.game, h.user_id, h.rn::int as rnk from public.hall_ranking() h where h.game not in (select b.game from boards b)
      union all
      select b.game, c.user_id, c.rnk from boards b cross join lateral public.challenge_rows(b.board) c),
    total as (select count(distinct game) as n from ranks)
    select k.user_id from ranks k
     group by k.user_id
    having count(distinct k.game) = (select n from total) and avg(k.rnk) <= 10
  loop
    if public.grant_icon(r.user_id, 'hm-rank') then v_n := v_n + 1; end if;
  end loop;
  return v_n;
end; $$;
revoke all on function public.rank_mission_tick() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'rank-mission-tick';
select cron.schedule('rank-mission-tick', '*/10 * * * *', 'select public.rank_mission_tick()');

-- Backfill.
select public.check_clear_missions(u.user_id)
  from (select user_id from public.hard_clears union select user_id from public.hell_clears) u;
select public.rank_mission_tick();

notify pgrst, 'reload schema';
