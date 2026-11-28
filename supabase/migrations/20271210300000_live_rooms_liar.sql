-- 오픈 대전 현황 (지금 플레이 중): 히든 워드: 라이어 runs in its own tables (hwl_rooms), not live_friend_rooms, so it
-- never showed. Add its games in progress: 공개방 (house) as open, 친구 방 (friend) as friend, channel 'hidden-word-liar-room'.
create or replace function public.live_rooms()
returns table(channel text, open_n integer, friend_n integer)
language sql stable security definer set search_path = public as $$
  select regexp_replace(room, '-[0-9]{4}$', ''), count(*) filter (where open)::int, count(*) filter (where not open)::int
    from public.live_friend_rooms where seen_at > now() - interval '150 seconds'
   group by 1
  union all
  select 'hidden-word-liar-room', count(*) filter (where r.kind = 'house')::int, count(*) filter (where r.kind <> 'house')::int
    from public.hwl_rooms r
   where r.phase not in ('lobby', 'done', 'closed')
  having count(*) > 0;
$$;
