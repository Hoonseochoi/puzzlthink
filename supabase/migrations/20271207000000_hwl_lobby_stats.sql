-- 히든 워드: 라이어 home card: how many are waiting in the 공개방 queue and how many 공개방 games are being played now.
-- Counts only; anyone may read them.
create or replace function public.hwl_lobby_stats()
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'waiting', (select count(*) from public.hwl_queue w where w.seen_at > now() - interval '75 seconds'),
    'rooms', (select count(*) from public.hwl_rooms r where r.kind = 'house' and r.phase not in ('done', 'closed')));
$$;
revoke all on function public.hwl_lobby_stats() from public;
grant execute on function public.hwl_lobby_stats() to anon, authenticated;
