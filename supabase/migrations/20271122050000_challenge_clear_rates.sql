-- 홈 카드의 챌린지 성공률: every challenge run of a game (새로운 맵 + 맵 뺏기) against the runs that cleared, so players can
-- tell at a glance how hard the game is. A run still open after 3 hours (the longest a clear may take) was abandoned and
-- counts as a try; one opened in the last 3 hours may still be in play and isn't counted yet.
create or replace function public.challenge_clear_rates()
returns table(game text, attempts integer, clears integer)
language sql stable security definer set search_path = public as $$
  select r.game, count(*)::int, (count(*) filter (where r.result = 'clear'))::int
    from public.logic_runs r
   where r.finished_at is not null or r.started_at < now() - interval '3 hours'
   group by r.game
  union all
  select 'slitherlink', count(*)::int, (count(*) filter (where s.result = 'clear'))::int
    from public.slither_runs s
   where s.finished_at is not null or s.started_at < now() - interval '3 hours';
$$;
revoke all on function public.challenge_clear_rates() from public;
grant execute on function public.challenge_clear_rates() to anon, authenticated;
