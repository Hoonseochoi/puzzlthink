-- Google Play 앱 테스터: remember when a tester's email was put on the Play Console email list (scripts/play/pending.sh,
-- scripts/play/mark-listed.sh). Until then the Play opt-in page does not open for them, so the site shows "곧 열려요"
-- instead of the install button and popup. Everyone who joined before this migration is already on the list.

alter table public.app_testers add column if not exists listed_at timestamptz;
update public.app_testers set listed_at = now() where listed_at is null and withdrawn_at is null;

create or replace function public.app_tester_status()
 returns jsonb language plpgsql stable security definer set search_path to 'public', 'auth'
as $function$
declare
  v_email text; v_listed timestamptz;
begin
  select email, listed_at into v_email, v_listed from public.app_testers where user_id = auth.uid() and withdrawn_at is null;
  return jsonb_build_object('joined', v_email is not null, 'email', public.app_tester_mask(v_email), 'listed', v_listed is not null);
end;
$function$;

create or replace function public.app_tester_join(p_email text default null::text)
 returns jsonb language plpgsql security definer set search_path to 'public', 'auth'
as $function$
declare
  v_user uuid := auth.uid();
  v_email text; v_listed timestamptz;
begin
  if v_user is null then
    raise exception 'not signed in';
  end if;
  v_email := lower(btrim(coalesce(nullif(btrim(p_email), ''), (select email from auth.users where id = v_user), '')));
  if length(v_email) > 254 or v_email !~ '^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$' then
    raise exception 'invalid email';
  end if;
  -- Joining again with the same address that is still on the Play list keeps it listed; a new address starts over.
  insert into public.app_testers (user_id, email, consented_at, withdrawn_at)
  values (v_user, v_email, now(), null)
  on conflict (user_id) do update set
    listed_at = case when public.app_testers.email = excluded.email then public.app_testers.listed_at else null end,
    email = excluded.email, consented_at = now(), withdrawn_at = null
  returning listed_at into v_listed;
  perform public.grant_tester_icon(v_user, 'pt-tester');
  return jsonb_build_object('joined', true, 'email', public.app_tester_mask(v_email), 'listed', v_listed is not null);
end;
$function$;
