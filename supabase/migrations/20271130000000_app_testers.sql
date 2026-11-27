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
