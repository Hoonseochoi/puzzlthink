-- Open-match ranking, per game. Only results from open rooms count (detail.open = true).
-- Order: more wins; then higher win rate; then whoever reached that number of wins first.
-- Players appear from 3 wins. Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

-- All ranked players of one game (internal: not callable from the site).
create or replace function public.open_ranking_rows(p_game text)
returns table (user_id uuid, wins int, losses int, draws int, rnk int)
language sql stable security definer set search_path = public as $$
  with r as (
    select user_id,
           count(*) filter (where result = 'win')::int as wins,
           count(*) filter (where result = 'loss')::int as losses,
           count(*) filter (where result = 'draw')::int as draws,
           max(played_at) filter (where result = 'win') as reached
      from public.game_results
     where game = p_game and mode = 'friend' and detail ->> 'open' = 'true'
     group by user_id
  )
  select user_id, wins, losses, draws,
         (row_number() over (order by wins desc, wins::numeric / greatest(wins + losses + draws, 1) desc, reached asc))::int
    from r where wins >= 3;
$$;
revoke all on function public.open_ranking_rows(text) from public, anon, authenticated;

-- Top of one game's ranking. Names only for players who show themselves in the Hall of Fame.
create or replace function public.open_ranking_top(p_game text, p_limit int default 5)
returns table (rank int, nickname text, avatar_url text, wins int, losses int, draws int)
language sql stable security definer set search_path = public as $$
  select r.rnk, case when p.show_in_hall then coalesce(p.nickname, p.full_name, 'Player') end,
         case when p.show_in_hall then p.avatar_url end, r.wins, r.losses, r.draws
    from public.open_ranking_rows(p_game) r join public.profiles p on p.id = r.user_id
   where r.rnk <= least(greatest(p_limit, 1), 20)
   order by r.rnk;
$$;

-- The signed-in player's place and the two above and below (counts only, no names).
-- Not ranked yet (under 3 wins): one row with rank null and the player's own counts.
create or replace function public.open_ranking_me(p_game text)
returns table (rank int, wins int, losses int, draws int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with rows as (select * from public.open_ranking_rows(p_game)),
       me as (select rnk from rows where user_id = auth.uid())
  select r.rnk, r.wins, r.losses, r.draws, r.user_id = auth.uid()
    from rows r, me where r.rnk between me.rnk - 2 and me.rnk + 2
  union all
  select null, count(*) filter (where result = 'win')::int, count(*) filter (where result = 'loss')::int,
         count(*) filter (where result = 'draw')::int, true
    from public.game_results
   where auth.uid() is not null and user_id = auth.uid() and game = p_game and mode = 'friend'
     and detail ->> 'open' = 'true' and not exists (select 1 from me)
  order by 1 nulls last;
$$;

revoke all on function public.open_ranking_top(text, int) from public;
revoke all on function public.open_ranking_me(text) from public;
grant execute on function public.open_ranking_top(text, int) to anon, authenticated;
grant execute on function public.open_ranking_me(text) to authenticated;

-- Check: both should run without errors (probably empty for now).
select * from public.open_ranking_top('heavy13');
select * from public.open_ranking_me('heavy13');
