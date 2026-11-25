-- 히든 워드: the ranking score is the average points of a match plus a bonus for matches played, instead of
-- the plain total. Skill decides, and playing more still counts:
--     score = average points per match + 0.3 x matches (up to 20 matches, so at most +6)
-- A player is ranked from 3 finished matches. Ties: more matches, then who got there first.
-- The shared board 'hidden_word' (challenge_rows -> 기록실, ranking page, podium, crown icon) carries the
-- score x 10 as its integer; the pages show it with one decimal.

create or replace function public.hw_rank_score(p_avg numeric, p_games int)
returns numeric language sql immutable
as $$ select round(p_avg + least(p_games, 20) * 0.3, 1) $$;

create or replace function public.hw_rank_rows()
returns table (user_id uuid, points int, games int, rnk int)
language sql stable security definer set search_path = public, pg_temp
as $$
  select t.user_id, (t.score * 10)::int, t.games, (row_number() over (order by t.score desc, t.games desc, t.last_at))::int
    from (select r.user_id, public.hw_rank_score(avg(r.points), count(*)::int) as score, count(*)::int as games, max(r.played_at) as last_at
            from public.hw_results r group by r.user_id) t
    join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.games >= 3 and t.score > 0;
$$;
revoke all on function public.hw_rank_rows() from public, anon, authenticated;

-- The in-game ranking sheet: score = avg + bonus. `points` (total) stays for pages loaded before this change.
-- My own row comes back even before 3 matches, with a null rank.
drop function if exists public.hw_ranking(int);
create function public.hw_ranking(p_limit int default 20)
returns table (rank int, nickname text, avatar_url text, points int, games int, best int, wins int, is_me boolean, avg numeric, bonus numeric, score numeric)
language sql stable security definer set search_path = public, pg_temp
as $$
  with tot as (
    select r.user_id, sum(r.points)::int as points, count(*)::int as games, max(r.points)::int as best,
           count(*) filter (where r.points > r.ai_points)::int as wins, max(r.played_at) as last_at,
           round(avg(r.points), 1) as avg, public.hw_rank_score(avg(r.points), count(*)::int) as score
      from public.hw_results r group by r.user_id
  ), ranked as (
    select t.user_id, (row_number() over (order by t.score desc, t.games desc, t.last_at))::int as rnk
      from tot t join public.profiles p on p.id = t.user_id
     where t.games >= 3 and t.score > 0 and (p.show_in_hall or t.user_id = auth.uid())
  )
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), '익명'), p.avatar_url, t.points, t.games, t.best, t.wins, t.user_id = auth.uid(),
         t.avg, round(least(t.games, 20) * 0.3, 1), t.score
    from tot t join public.profiles p on p.id = t.user_id left join ranked x on x.user_id = t.user_id
   where x.rnk <= greatest(1, least(p_limit, 100)) or t.user_id = auth.uid()
   order by x.rnk nulls last;
$$;
grant execute on function public.hw_ranking(int) to anon, authenticated;

notify pgrst, 'reload schema';
