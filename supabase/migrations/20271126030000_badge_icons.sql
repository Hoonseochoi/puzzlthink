-- Achievement icons, a step below the #1 crowns and contest champions (drawn by BadgeIcons.tsx):
--   x-{game}  cleared that game on 어려움 (a hard_clears certificate)
--   hc        cleared any game on 매우 어려움 (a hell_clears certificate)
--   fw / ow   won a friend match / an open match (game_results mode 'friend', detail.open)
--   t10…t100  10 … 100 hours played
-- Badges are never taken back. A newly earned badge is switched on only when the player's stone is unset, a basic
-- colour or a lower badge: it never replaces a crown, a champion stone or a 2048 tile.
--
-- Play time = what the puzzles already recorded in game_results before this migration (ms / durationMs / seconds,
-- each result capped at an hour) + what the client reports from now on with add_play_time() while a game is open,
-- the tab visible and the player active.

-- Allow the new ids (kept the live pattern, which also has o-1…3).
alter table public.profile_icons drop constraint if exists profile_icons_icon_check;
alter table public.profile_icons add constraint profile_icons_icon_check
  check (icon ~ '^([wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123]|x-[a-z0-9_]{1,40}|hc|fw|ow|t(10|20|30|40|50|60|70|80|90|100))$');

alter table public.stone_choices drop constraint if exists stone_choices_stone_check;
alter table public.stone_choices add constraint stone_choices_stone_check
  check (stone ~ '^(black|white|red|blue|[wh][0-9]{1,3}-[123]|m(2048|4096|8192|16384|32768|65536|131072)|c-[a-z0-9_]{1,40}|o-[123]|x-[a-z0-9_]{1,40}|hc|fw|ow|t(10|20|30|40|50|60|70|80|90|100))$');

-- ─── ranking of badges ──────────────────────────────────────────────────────────────────────────────────────────

create or replace function public.badge_rank(p_icon text)
returns int language sql immutable as $$
  select case
    when p_icon ~ '^t(10|20|30|40|50|60|70|80|90|100)$' then 100 + substr(p_icon, 2)::int
    when p_icon = 'hc' then 90
    when p_icon = 'ow' then 80
    when p_icon = 'fw' then 70
    when p_icon ~ '^x-[a-z0-9_]+$' then 60
    else null end;
$$;

-- With no choice saved, show the highest non-badge icon (newest first, as before), else the best badge.
create or replace function public.effective_stone(p_user uuid)
returns text language sql stable security definer set search_path to 'public' as $$
  select coalesce(
    (select c.stone from public.stone_choices c
      where c.user_id = p_user
        and (c.stone in ('black', 'white', 'red', 'blue')
             or exists (select 1 from public.profile_icons i where i.user_id = p_user and i.icon = c.stone and i.revoked_at is null))),
    (select i.icon from public.profile_icons i where i.user_id = p_user and i.revoked_at is null
      order by (public.badge_rank(i.icon) is not null), public.badge_rank(i.icon) desc nulls last, i.granted_at desc, i.icon limit 1)
  );
$$;

-- Gives a badge. p_equip: switch it on if the current stone is unset, a basic colour or a lower badge.
create or replace function public.grant_badge(p_user uuid, p_icon text, p_equip boolean default true)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_new boolean; v_cur text;
begin
  if p_user is null or public.badge_rank(p_icon) is null then return false; end if;
  insert into public.profile_icons (user_id, icon) values (p_user, p_icon)
  on conflict (user_id, icon) do nothing
  returning true into v_new;
  if coalesce(v_new, false) and p_equip then
    select c.stone into v_cur from public.stone_choices c where c.user_id = p_user;
    -- Unset: nothing to save, effective_stone already falls back to the best icon owned.
    if v_cur is not null and (v_cur in ('black', 'white', 'red', 'blue') or coalesce(public.badge_rank(v_cur), 999) < public.badge_rank(p_icon)) then
      update public.stone_choices set stone = p_icon, updated_at = now() where user_id = p_user;
    end if;
  end if;
  return coalesce(v_new, false);
end; $$;
revoke all on function public.grant_badge(uuid, text, boolean) from public, anon, authenticated;

-- ─── certificates → x-{game} / hc ───────────────────────────────────────────────────────────────────────────────

create or replace function public.badge_on_hard_clear()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  begin perform public.grant_badge(new.user_id, 'x-' || new.game); exception when others then null; end;
  return new;
end; $$;
drop trigger if exists badge_on_hard_clear on public.hard_clears;
create trigger badge_on_hard_clear after insert on public.hard_clears for each row execute function public.badge_on_hard_clear();

create or replace function public.badge_on_hell_clear()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  begin perform public.grant_badge(new.user_id, 'hc'); exception when others then null; end;
  return new;
end; $$;
drop trigger if exists badge_on_hell_clear on public.hell_clears;
create trigger badge_on_hell_clear after insert on public.hell_clears for each row execute function public.badge_on_hell_clear();

-- ─── friend / open match wins → fw / ow ─────────────────────────────────────────────────────────────────────────

create or replace function public.badge_on_result()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.mode = 'friend' and new.result = 'win' and new.user_id is not null then
    begin
      perform public.grant_badge(new.user_id, case when coalesce(new.detail ->> 'open', '') = 'true' then 'ow' else 'fw' end);
    exception when others then null; -- never block saving the game
    end;
  end if;
  return new;
end; $$;
drop trigger if exists badge_on_result on public.game_results;
create trigger badge_on_result after insert on public.game_results for each row execute function public.badge_on_result();

-- ─── play time → t10 … t100 ─────────────────────────────────────────────────────────────────────────────────────

create table if not exists public.play_time (
  user_id uuid primary key references auth.users (id) on delete cascade,
  base_seconds bigint not null default 0,    -- from game_results before this migration
  tracked_seconds bigint not null default 0, -- reported by add_play_time() since
  last_ping timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.play_time enable row level security;
revoke all on public.play_time from anon, authenticated;

create or replace function public.grant_play_badges(p_user uuid, p_equip boolean default true)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_hours numeric; h int;
begin
  select (base_seconds + tracked_seconds) / 3600.0 into v_hours from public.play_time where user_id = p_user;
  if v_hours is null or v_hours < 10 then return; end if;
  for h in select g from generate_series(10, 100, 10) g where g <= v_hours order by g loop
    perform public.grant_badge(p_user, 't' || h, p_equip);
  end loop;
end; $$;
revoke all on function public.grant_play_badges(uuid, boolean) from public, anon, authenticated;

-- The client reports active play every minute. Each report counts at most the time since the last one (+10 s
-- slack) and never more than 2 minutes, so a busy loop cannot inflate the clock.
create or replace function public.add_play_time(p_seconds int)
returns bigint language plpgsql security definer set search_path to 'public' as $$
declare uid uuid := auth.uid(); v_last timestamptz; v_add int; v_total bigint; v_before bigint;
begin
  if uid is null or p_seconds is null or p_seconds <= 0 then return null; end if;
  insert into public.play_time (user_id) values (uid) on conflict (user_id) do nothing;
  select last_ping, base_seconds + tracked_seconds into v_last, v_before from public.play_time where user_id = uid for update;
  v_add := least(p_seconds, 120);
  if v_last is not null then
    v_add := least(v_add, greatest(0, floor(extract(epoch from now() - v_last))::int + 10));
  end if;
  update public.play_time set tracked_seconds = tracked_seconds + v_add, last_ping = now(), updated_at = now()
   where user_id = uid returning base_seconds + tracked_seconds into v_total;
  if floor(v_total / 36000.0) > floor(v_before / 36000.0) then perform public.grant_play_badges(uid); end if;
  return v_total;
end; $$;
grant execute on function public.add_play_time(int) to authenticated;

create or replace function public.my_play_time()
returns bigint language sql stable security definer set search_path to 'public' as $$
  select coalesce((select base_seconds + tracked_seconds from public.play_time where user_id = auth.uid()), 0);
$$;
grant execute on function public.my_play_time() to authenticated;

-- ─── backfill (not switched on; the popup tells each player once) ───────────────────────────────────────────────

insert into public.play_time (user_id, base_seconds)
select r.user_id,
       floor(sum(least(3600000, greatest(0, coalesce(
         case when (r.detail ->> 'ms') ~ '^[0-9]+(\.[0-9]+)?$' then (r.detail ->> 'ms')::numeric end,
         case when (r.detail ->> 'durationMs') ~ '^[0-9]+(\.[0-9]+)?$' then (r.detail ->> 'durationMs')::numeric end,
         case when (r.detail ->> 'seconds') ~ '^[0-9]+(\.[0-9]+)?$' then (r.detail ->> 'seconds')::numeric * 1000 end,
         0)))) / 1000)::bigint
  from public.game_results r
  join auth.users u on u.id = r.user_id
 group by r.user_id
on conflict (user_id) do update set base_seconds = excluded.base_seconds, updated_at = now();

select public.grant_badge(h.user_id, 'x-' || h.game, false) from public.hard_clears h;
select public.grant_badge(h.user_id, 'hc', false) from (select distinct user_id from public.hell_clears) h;
select public.grant_badge(r.user_id, k, false)
  from (select distinct user_id, case when coalesce(detail ->> 'open', '') = 'true' then 'ow' else 'fw' end k
          from public.game_results where mode = 'friend' and result = 'win') r
  join auth.users u on u.id = r.user_id;
select public.grant_play_badges(p.user_id, false) from public.play_time p where p.base_seconds >= 36000;

notify pgrst, 'reload schema';
