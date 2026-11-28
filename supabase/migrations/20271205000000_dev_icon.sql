-- 개발자 아이콘 dev-founder: a one-of-a-kind profile icon for the site's maker (퍼띵) only. Drawn in
-- src/components/DevIcons.tsx; its rarity in match pieces is 'creator' (src/components/match/rarity.ts).
--
--  * Hidden: it has no unlock rule, no automatic grant and no place in the icon collection. icon_holder_counts() and
--    icon_holders() skip dev-* so no count or holder list shows it. Everyone still sees it on the maker's avatar
--    (stone_choices_public / effective_stone are unchanged).
--  * Granted here, once, with grant_icon(): that also equips it and leaves seen = false, so the "새 아이콘" popup
--    shows it to the maker on the next visit.
--  * Kept on: grant_icon() normally switches the avatar to every newly granted icon (a #1 crown, a contest place,
--    a HIDDEN MISSION). While dev-* is the one shown, a later grant still adds the icon but no longer takes the
--    avatar off it; the maker can switch in 기록실 any time. grant_badge() and grant_tester_icon() already keep it
--    (it is neither a colour, a badge nor a pt-* icon).
--
-- Deploy the frontend BEFORE applying this file: older pages do not know dev-founder (they draw a plain stone).
-- Apply by hand on the live DB:
--   docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20271205000000_dev_icon.sql

-- ─── icon id CHECK constraints ────────────────────────────────────────────────────────────────────────────────
-- Extended from their LIVE definitions at apply time (ids added by any other migration are kept), only once.
do $$
declare
  r record;
  v_new text;
begin
  for r in select c.conrelid::regclass as tbl, c.conname, pg_get_constraintdef(c.oid) as def
             from pg_constraint c
            where c.conname in ('profile_icons_icon_check', 'stone_choices_stone_check')
              and c.connamespace = 'public'::regnamespace
  loop
    if position('|dev-founder' in r.def) > 0 then continue; end if;
    if position(')$''::text' in r.def) = 0 then raise exception 'unexpected definition of %: %', r.conname, r.def; end if;
    v_new := replace(r.def, ')$''::text', '|dev-founder)$''::text');
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I %s', r.tbl, r.conname, v_new);
  end loop;
  if (select count(*) from pg_constraint where conname in ('profile_icons_icon_check', 'stone_choices_stone_check')
        and connamespace = 'public'::regnamespace and pg_get_constraintdef(oid) like '%|dev-founder)$%') <> 2 then
    raise exception 'icon id constraints were not extended';
  end if;
end $$;

-- ─── keep the developer icon on through later grants ──────────────────────────────────────────────────────────
create or replace function public.grant_icon(p_user uuid, p_icon text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_new boolean;
begin
  insert into public.profile_icons as i (user_id, icon) values (p_user, p_icon)
  on conflict (user_id, icon) do update set revoked_at = null, granted_at = now(), seen = false
   where i.revoked_at is not null
  returning true into v_new;
  if coalesce(v_new, false) and (p_icon ~ '^dev-' or coalesce(public.effective_stone(p_user), '') !~ '^dev-') then
    insert into public.stone_choices (user_id, stone) values (p_user, p_icon)
    on conflict (user_id) do update set stone = excluded.stone, updated_at = now();
  end if;
  return coalesce(v_new, false);
end; $$;
revoke all on function public.grant_icon(uuid, text) from public, anon, authenticated;

-- ─── hidden from counts and holder lists ──────────────────────────────────────────────────────────────────────
create or replace function public.icon_holder_counts()
returns table(icon text, holders integer, nickname text)
language sql
stable security definer
set search_path = public
as $$
  with held as (
    select distinct regexp_replace(i.icon, '^h[0-9]+-', 'h-') as icon, i.user_id
      from public.profile_icons i
     where i.revoked_at is null and i.icon !~ '^dev-'
  )
  select h.icon, count(*)::integer,
         -- The name only when exactly one player holds it.
         case when count(*) = 1 then coalesce(nullif(max(p.nickname), ''), 'Player') end
    from held h left join public.profiles p on p.id = h.user_id
   group by h.icon;
$$;

create or replace function public.icon_holders(p_icon text, p_limit integer default 60)
returns table(nickname text, granted_at timestamptz)
language sql
stable security definer
set search_path = public
as $$
  select coalesce(nullif(max(p.nickname), ''), 'Player'), max(i.granted_at) as granted_at
    from public.profile_icons i left join public.profiles p on p.id = i.user_id
   where i.revoked_at is null and i.icon !~ '^dev-' and regexp_replace(i.icon, '^h[0-9]+-', 'h-') = p_icon
   group by i.user_id
   order by granted_at desc
   limit least(greatest(coalesce(p_limit, 60), 1), 100);
$$;

-- ─── the grant: 퍼띵 only ─────────────────────────────────────────────────────────────────────────────────────
select public.grant_icon('414a4682-d008-44a5-8671-9e9fcc0c19ae'::uuid, 'dev-founder')
 where exists (select 1 from auth.users where id = '414a4682-d008-44a5-8671-9e9fcc0c19ae'::uuid);
