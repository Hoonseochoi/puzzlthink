-- 현황 보고서 for a finished day: admin_report takes an optional p_day (default: today, KST).
-- scripts/report/report.sh --day YYYY-MM-DD | yesterday.
drop function if exists public.admin_report(text);
create or replace function public.admin_report(p_token text, p_day date default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare today date := coalesce(p_day, (now() at time zone 'Asia/Seoul')::date);
begin
  if p_token is null or encode(extensions.digest(p_token, 'sha256'), 'hex') is distinct from (select hash from public.admin_secrets where name = 'report') then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'generated_at', to_char(now() at time zone 'Asia/Seoul', 'YYYY-MM-DD HH24:MI'),
    'visits', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'n', count) order by day), '[]') from public.daily_visits),
    'plays_daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'n', n) order by day), '[]') from (select day, sum(count)::int n from public.game_plays_daily group by day) t),
    'plays_today', (select coalesce(jsonb_agg(jsonb_build_object('game', game, 'mode', mode, 'n', count) order by count desc), '[]') from public.game_plays_daily where day = today),
    'plays_7d', (select coalesce(jsonb_agg(jsonb_build_object('game', game, 'n', n) order by n desc), '[]') from (select game, sum(count)::int n from public.game_plays_daily where day > today - 7 group by game) t),
    'members', (select count(*) from public.profiles),
    'signups_daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]') from (select (created_at at time zone 'Asia/Seoul')::date d, count(*)::int n from public.profiles group by 1) t),
    'signup_sources', (select coalesce(jsonb_agg(jsonb_build_object('source', signup_source, 'n', n) order by n desc), '[]') from (select signup_source, count(*)::int n from public.profiles where signup_source is not null group by 1) t),
    'signup_pages', (select coalesce(jsonb_agg(jsonb_build_object('page', signup_path, 'n', n) order by n desc), '[]') from (select signup_path, count(*)::int n from public.profiles where signup_path is not null group by 1 order by 2 desc limit 8) t),
    'results_daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]') from (select (played_at at time zone 'Asia/Seoul')::date d, count(*)::int n from public.game_results group by 1) t),
    'open', jsonb_build_object(
      'games', (select count(*) from public.game_results where mode = 'friend' and detail ->> 'open' = 'true'),
      'players', (select count(distinct user_id) from public.game_results where mode = 'friend' and detail ->> 'open' = 'true'),
      'today', (select count(*) from public.game_results where mode = 'friend' and detail ->> 'open' = 'true' and (played_at at time zone 'Asia/Seoul')::date = today)),
    'hall', (select coalesce(jsonb_agg(jsonb_build_object('game', game, 'n', n) order by n desc), '[]') from (select game, count(*)::int n from public.hall_ranking() group by game) t),
    'certs', (select coalesce(jsonb_agg(jsonb_build_object('game', game, 'n', n) order by n desc), '[]') from (select game, count(*)::int n from public.hard_clears group by game) t),
    'duels', jsonb_build_object('made', (select count(*) from public.nemo_duels), 'runs', (select count(*) from public.nemo_duel_runs)),
    'support', (select coalesce(jsonb_agg(jsonb_build_object('place', place, 'n', n) order by n desc), '[]') from (select place, sum(count)::int n from public.support_clicks_daily group by place) t),
    'app', (select coalesce(jsonb_agg(jsonb_build_object('event', event, 'platform', platform, 'n', n)), '[]') from (select event, platform, sum(count)::int n from public.app_events_daily group by 1, 2) t),
    'app_today_opens', (select coalesce(sum(count), 0) from public.app_events_daily where event = 'open' and day = today)
  );
end; $$;
revoke all on function public.admin_report(text, date) from public;
grant execute on function public.admin_report(text, date) to anon, authenticated;
