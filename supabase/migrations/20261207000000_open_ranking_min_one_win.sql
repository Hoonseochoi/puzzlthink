-- 오픈 대전 랭킹: one win is enough to be listed (was 3). Applied already.
create or replace function public.open_ranking_rows(p_game text)
returns table(user_id uuid, wins integer, losses integer, draws integer, rnk integer)
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
    from r where wins >= 1;
$$;
