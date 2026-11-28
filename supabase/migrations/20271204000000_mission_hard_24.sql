-- HIDDEN MISSION · ALL HARD: any 24 of the games with a 어려움 AI cleared on 어려움 or above (owner, 11/28),
-- instead of every one of them, so new games no longer move the goal. ALL HELL is unchanged.
create or replace function public.mission_hard_need() returns integer language sql immutable as $$ select 24 $$;

create or replace function public.check_clear_missions(p_user uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if p_user is null then return; end if;
  if (select count(*) from unnest(public.mission_games('hard')) g
       where exists (select 1 from public.hard_clears h where h.user_id = p_user and h.game = g)
          or exists (select 1 from public.hell_clears h where h.user_id = p_user and h.game = g)) >= public.mission_hard_need() then
    perform public.grant_icon(p_user, 'hm-hard');
  end if;
  if not exists (select 1 from unnest(public.mission_games('hell')) g
                  where not exists (select 1 from public.hell_clears h where h.user_id = p_user and h.game = g)) then
    perform public.grant_icon(p_user, 'hm-hell');
  end if;
end; $function$;

-- Anyone who already has 24 gets it now.
do $$
declare u uuid;
begin
  for u in select user_id from (select user_id, game from public.hard_clears union select user_id, game from public.hell_clears) c
            where game = any(public.mission_games('hard')) group by user_id having count(distinct game) >= public.mission_hard_need()
  loop perform public.check_clear_missions(u); end loop;
end $$;
