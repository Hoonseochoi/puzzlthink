-- 오픈 대전 champions: one board for every game together, by total open-match wins. Its top three hold the
-- icons o-1, o-2, o-3 while they stay there (the icon moves when the place changes hands, like a game's #1).
-- Deploy the frontend first: older clients do not know the new ids and would draw a plain stone.

alter table public.profile_icons drop constraint if exists profile_icons_icon_check;
alter table public.profile_icons add constraint profile_icons_icon_check
  check (icon ~ '^([wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123])$');

alter table public.stone_choices drop constraint if exists stone_choices_stone_check;
alter table public.stone_choices add constraint stone_choices_stone_check
  check (stone ~ '^(black|white|red|blue|[wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123])$');

-- Every player's open-match wins over all games (players who show in the Hall of Fame). Ties: better win rate,
-- then whoever got there first.
CREATE OR REPLACE FUNCTION public.open_total_rows()
 RETURNS TABLE(user_id uuid, wins integer, games integer, rnk integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with r as (
    select g.user_id,
           count(*) filter (where g.result = 'win')::int as wins,
           count(*)::int as games,
           max(g.played_at) filter (where g.result = 'win') as reached
      from public.game_results g join public.profiles p on p.id = g.user_id
     where g.mode = 'friend' and g.detail ->> 'open' = 'true' and g.user_id is not null and p.show_in_hall
     group by g.user_id
  )
  select r.user_id, r.wins, r.games,
         (row_number() over (order by r.wins desc, r.wins::numeric / greatest(r.games, 1) desc, r.reached asc))::int
    from r where r.wins >= 1;
$function$;
revoke all on function public.open_total_rows() from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.open_total_ranking(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, wins integer, games integer, is_me boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select k.rnk, coalesce(nullif(btrim(p.nickname), ''), 'Player'), k.wins, k.games, k.user_id = auth.uid()
    from public.open_total_rows() k join public.profiles p on p.id = k.user_id
   where k.rnk <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rnk;
$function$;
grant execute on function public.open_total_ranking(integer) to anon, authenticated;

-- Move the three icons to whoever holds each place now.
CREATE OR REPLACE FUNCTION public.refresh_open_tops()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_place integer; v_uid uuid;
begin
  for v_place in 1..3 loop
    v_uid := null;
    select t.user_id into v_uid from public.open_total_rows() t where t.rnk = v_place;
    update public.profile_icons set revoked_at = now()
     where icon = 'o-' || v_place and revoked_at is null and user_id is distinct from v_uid;
    if v_uid is not null then perform public.grant_icon(v_uid, 'o-' || v_place); end if;
  end loop;
end; $function$;
revoke all on function public.refresh_open_tops() from public, anon, authenticated;

-- Every 5 minutes (pg_cron job icon-tick).
CREATE OR REPLACE FUNCTION public.icon_tick()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.finalize_piece_weeks();
  perform public.finalize_hell_weeks();
  perform public.refresh_game_crowns();
  perform public.refresh_open_tops();
end; $function$;
revoke all on function public.icon_tick() from public, anon, authenticated;

select public.refresh_open_tops();

notify pgrst, 'reload schema';
