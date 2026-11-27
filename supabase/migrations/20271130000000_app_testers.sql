-- Google Play 앱 테스터 모집. A personal developer account needs a closed test with at least 12 testers opted in for
-- 14 days before production; testers are invited by Google account email. A signed-in member presses "동의하고 참여"
-- on the site (src/components/AppTesterInvite.tsx) and their email is kept here, by consent, until the closed test
-- ends or they withdraw. This is the one table that deliberately stores an email.
--
--  * app_testers: one row per member. withdrawn_at set = withdrawn: the email is masked at that moment and the
--    operator's list skips the row. Re-joining stores the full address again and clears withdrawn_at.
--  * No direct client access (RLS on, no policies, no grants). Only the functions below, for the signed-in caller.
--  * Account deletion (delete_my_account → delete_account_data → delete from auth.users) removes the row through the
--    ON DELETE CASCADE foreign key.
--  * Operator list: scripts/play/testers.sh reads the current emails (read-only) into a CSV for Play Console.
--  * PLAY TESTER profile icons (src/components/TesterIcons.tsx): pt-tester is granted on joining and revoked on
--    withdrawing; pt-14d (stayed through the closed test) and pt-founder (the first group) are granted by the operator
--    with scripts/play/grant-icon.sh. Deploy the frontend BEFORE applying this file: older pages do not know the pt-*
--    ids (they show a plain stone, nothing breaks, but the icon would look missing).
--
-- Apply by hand on the live DB:
--   docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20271130000000_app_testers.sql

create table if not exists public.app_testers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  consented_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
alter table public.app_testers enable row level security;
revoke all on public.app_testers from public, anon, authenticated;

-- "ab***@gmail.com": the first two characters of the local part (one if it is that short), then ***.
create or replace function public.app_tester_mask(p_email text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then null
    else left(split_part(p_email, '@', 1), case when length(split_part(p_email, '@', 1)) <= 2 then 1 else 2 end)
      || '***@' || split_part(p_email, '@', 2)
  end;
$$;

-- ─── PLAY TESTER icons ────────────────────────────────────────────────────────────────────────────────────────
-- Both CHECK constraints list every icon id. They are extended from their LIVE definitions at apply time (so ids
-- added by any other migration are kept), and only if pt-* is not there yet.
do $$
declare
  r record;
  v_def text;
  v_new text;
begin
  for r in select c.conrelid::regclass as tbl, c.conname, pg_get_constraintdef(c.oid) as def
             from pg_constraint c
            where c.conname in ('profile_icons_icon_check', 'stone_choices_stone_check')
              and c.connamespace = 'public'::regnamespace
  loop
    v_def := r.def;
    if position('pt-(tester|14d|founder)' in v_def) > 0 then continue; end if;
    if position(')$''::text' in v_def) = 0 then raise exception 'unexpected definition of %: %', r.conname, v_def; end if;
    v_new := replace(v_def, ')$''::text', '|pt-(tester|14d|founder))$''::text');
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I %s', r.tbl, r.conname, v_new);
  end loop;
  if (select count(*) from pg_constraint where conname in ('profile_icons_icon_check', 'stone_choices_stone_check')
        and pg_get_constraintdef(oid) like '%pt-(tester|14d|founder)%') <> 2 then
    raise exception 'icon id constraints were not extended';
  end if;
end $$;

-- Grants a PLAY TESTER icon (like grant_icon(): a real icon, a revoked one comes back, seen = false so the "새 아이콘"
-- popup shows it). Equipping: it goes on at once over a basic colour, an achievement badge or a lower tester icon,
-- but a contest / #1 / 2048 / HIDDEN MISSION icon the member shows now stays on (and is saved as their choice, so
-- the newer tester icon does not take over effective_stone()'s fallback). They can switch in 기록실 any time.
create or replace function public.grant_tester_icon(p_user uuid, p_icon text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new boolean;
  v_cur text;
begin
  if p_user is null or p_icon !~ '^pt-(tester|14d|founder)$' then return false; end if;
  v_cur := public.effective_stone(p_user);
  insert into public.profile_icons as i (user_id, icon) values (p_user, p_icon)
  on conflict (user_id, icon) do update set revoked_at = null, granted_at = now(), seen = false
   where i.revoked_at is not null
  returning true into v_new;
  if coalesce(v_new, false) then
    insert into public.stone_choices (user_id, stone)
    values (p_user, case
      when v_cur is null or v_cur in ('black', 'white', 'red', 'blue') or public.badge_rank(v_cur) is not null
        or (v_cur ~ '^pt-' and (case v_cur when 'pt-founder' then 3 when 'pt-14d' then 2 else 1 end)
                              <= (case p_icon when 'pt-founder' then 3 when 'pt-14d' then 2 else 1 end))
      then p_icon else v_cur end)
    on conflict (user_id) do update set stone = excluded.stone, updated_at = now();
  end if;
  return coalesce(v_new, false);
end;
$$;
revoke all on function public.grant_tester_icon(uuid, text) from public, anon, authenticated;

-- Join (or re-join). p_email null → the caller's sign-in email. Returns the same shape as app_tester_status().
create or replace function public.app_tester_join(p_email text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
begin
  if v_user is null then
    raise exception 'not signed in';
  end if;
  v_email := lower(btrim(coalesce(nullif(btrim(p_email), ''), (select email from auth.users where id = v_user), '')));
  if length(v_email) > 254 or v_email !~ '^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$' then
    raise exception 'invalid email';
  end if;
  insert into public.app_testers (user_id, email, consented_at, withdrawn_at)
  values (v_user, v_email, now(), null)
  on conflict (user_id) do update set email = excluded.email, consented_at = now(), withdrawn_at = null;
  perform public.grant_tester_icon(v_user, 'pt-tester');
  return jsonb_build_object('joined', true, 'email', public.app_tester_mask(v_email));
end;
$$;

-- Withdraw: withdrawn_at is set and the address is replaced by its masked form, so the full email is gone at once
-- (the Play Console list is replaced by the next upload of scripts/play/testers.sh, which skips withdrawn rows).
create or replace function public.app_tester_leave()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not signed in';
  end if;
  update public.app_testers set withdrawn_at = now(), email = public.app_tester_mask(email)
  where user_id = v_user and withdrawn_at is null;
  -- The TESTER icon goes with it; the shown stone falls back as for a lost #1 crown (effective_stone()).
  -- 14 DAYS / FOUNDER, once granted, stay.
  update public.profile_icons set revoked_at = now()
   where user_id = v_user and icon = 'pt-tester' and revoked_at is null;
  return true;
end;
$$;

-- { joined: bool, email: masked address or null }. Signed out → not joined.
create or replace function public.app_tester_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_email text;
begin
  select email into v_email from public.app_testers where user_id = auth.uid() and withdrawn_at is null;
  return jsonb_build_object('joined', v_email is not null, 'email', public.app_tester_mask(v_email));
end;
$$;

revoke all on function public.app_tester_mask(text) from public, anon, authenticated;
revoke all on function public.app_tester_join(text) from public, anon;
revoke all on function public.app_tester_leave() from public, anon;
revoke all on function public.app_tester_status() from public, anon;
grant execute on function public.app_tester_join(text) to authenticated;
grant execute on function public.app_tester_leave() to authenticated;
grant execute on function public.app_tester_status() to authenticated;
