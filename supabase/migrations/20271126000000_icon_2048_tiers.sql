-- 2048 block icons for every block from 2048 up: m2048, m4096, m8192, m16384, m32768, m65536, m131072 (the biggest
-- a 4×4 board can hold). Making a block gives its icon and every smaller one; all kept for good. The newest
-- (biggest) one becomes the player's stone, like any newly earned icon.
-- Deploy the frontend first: older clients do not know the new ids and would draw a plain stone.

alter table public.profile_icons drop constraint if exists profile_icons_icon_check;
alter table public.profile_icons add constraint profile_icons_icon_check
  check (icon ~ '^([wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40})$');

alter table public.stone_choices drop constraint if exists stone_choices_stone_check;
alter table public.stone_choices add constraint stone_choices_stone_check
  check (stone ~ '^(black|white|red|blue|[wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40})$');

-- Give every block icon up to p_max, smallest first (so the biggest new one ends up as the stone). True when any is new.
CREATE OR REPLACE FUNCTION public.grant_icons_2048(p_user uuid, p_max integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_tier integer; v_new boolean := false;
begin
  if p_user is null or p_max is null then return false; end if;
  foreach v_tier in array array[2048, 4096, 8192, 16384, 32768, 65536, 131072] loop
    exit when v_tier > p_max;
    if public.grant_icon(p_user, 'm' || v_tier) then v_new := true; end if;
  end loop;
  return v_new;
end; $function$;
revoke all on function public.grant_icons_2048(uuid, integer) from public, anon, authenticated;

-- The game calls this the moment a 2048+ block appears. Without an argument (older clients) it is the 2048 icon.
drop function if exists public.claim_icon_2048();
CREATE OR REPLACE FUNCTION public.claim_icon_2048(p_max integer DEFAULT 2048)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null or p_max is null or p_max < 2048 or p_max > 131072 then return false; end if;
  return public.grant_icons_2048(auth.uid(), p_max);
end; $function$;
revoke all on function public.claim_icon_2048(integer) from public, anon;
grant execute on function public.claim_icon_2048(integer) to authenticated;

-- Any saved game with a 2048+ block.
CREATE OR REPLACE FUNCTION public.grant_icon_2048_on_result()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.game = 'merge2048' and new.user_id is not null and (new.detail ->> 'max') ~ '^[0-9]{1,7}$' and (new.detail ->> 'max')::int >= 2048 then
    begin
      perform public.grant_icons_2048(new.user_id, (new.detail ->> 'max')::int);
    exception when others then null; -- never block saving the game
    end;
  end if;
  return new;
end; $function$;

-- Backfill from every saved game.
select public.grant_icons_2048(u.user_id, u.best)
  from (select r.user_id, max((r.detail ->> 'max')::int) as best from public.game_results r
         where r.game = 'merge2048' and r.user_id is not null
           and (r.detail ->> 'max') ~ '^[0-9]{1,7}$' and (r.detail ->> 'max')::int >= 2048
         group by r.user_id) u;

notify pgrst, 'reload schema';
