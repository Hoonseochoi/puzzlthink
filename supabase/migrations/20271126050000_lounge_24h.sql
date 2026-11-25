-- 라운지: messages older than 24 hours disappear. lounge_state() shows only the last 24 hours, and a pg_cron job
-- deletes older rows every 10 minutes (the send log and reports are kept for moderation).

CREATE OR REPLACE FUNCTION public.lounge_state()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'sender', public.lounge_sender(user_id), 'name', name, 'game', game, 'staff', exists (select 1 from public.lounge_staff st where st.user_id = m.user_id), 'pieces', pieces, 'text', body,
                                                                'at', (extract(epoch from created_at) * 1000)::bigint) order by id)
                            from (select * from public.lounge_messages where created_at > now() - interval '24 hours' order by id desc limit 50) m), '[]'::jsonb),
    'me', case when auth.uid() is null then null else public.lounge_sender(auth.uid()) end,
    'banned_until', (select until from public.lounge_bans where user_id = auth.uid() and until > now()),
    'ban_reason', (select reason from public.lounge_bans where user_id = auth.uid() and until > now()));
$function$;

select cron.unschedule(jobid) from cron.job where jobname = 'lounge-expire';
select cron.schedule('lounge-expire', '*/10 * * * *', $$delete from public.lounge_messages where created_at < now() - interval '24 hours'$$);

delete from public.lounge_messages where created_at < now() - interval '24 hours';

notify pgrst, 'reload schema';
