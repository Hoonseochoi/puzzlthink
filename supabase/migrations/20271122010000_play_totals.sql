-- Home counter: games finished today (KST) and in total, from the per-day play counter (count_play).
-- Counting started on 2026-11-16, so the total covers plays from that day on (guests included).
create or replace function public.play_totals()
returns table(today bigint, total bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(sum(count) filter (where day = (now() at time zone 'Asia/Seoul')::date), 0)::bigint,
         coalesce(sum(count), 0)::bigint
    from public.game_plays_daily;
$$;
revoke all on function public.play_totals() from public;
grant execute on function public.play_totals() to anon, authenticated;

notify pgrst, 'reload schema';
