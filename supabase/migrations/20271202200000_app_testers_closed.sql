-- Google Play 앱 테스터: recruitment closed (2026-11-28, the owner's call, 237 testers). app_tester_join now only
-- serves members who are already testers (it still answers their status and lets them correct their address);
-- anyone else gets 'recruit closed'. To reopen: re-run 20271130200000_app_testers_listed.sql's app_tester_join and
-- set PLAY_TESTER_RECRUIT_OPEN in src/lib/playApp.ts.
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
  if not exists (select 1 from public.app_testers where user_id = v_user and withdrawn_at is null) then
    raise exception 'recruit closed';
  end if;
  v_email := lower(btrim(coalesce(nullif(btrim(p_email), ''), (select email from auth.users where id = v_user), '')));
  if length(v_email) > 254 or v_email !~ '^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$' then
    raise exception 'invalid email';
  end if;
  update public.app_testers set
    listed_at = case when email = v_email then listed_at else null end,
    email = v_email
  where user_id = v_user and withdrawn_at is null
  returning listed_at into v_listed;
  perform public.grant_tester_icon(v_user, 'pt-tester');
  return jsonb_build_object('joined', true, 'email', public.app_tester_mask(v_email), 'listed', v_listed is not null);
end;
$function$;
