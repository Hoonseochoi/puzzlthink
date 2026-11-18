-- 명예의 전당: AI games on "easy" no longer count; only normal and hard (and Sudoku solo, unchanged).
-- Results are still stored and shown in each player's own records.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).
create or replace function public.hall_ranking()
returns table(game text, user_id uuid, rn bigint, wins bigint, games bigint)
language sql stable security definer set search_path = public as $$
  with scored as (
    select r.game, r.user_id,
           count(*) filter (where r.result = 'win') as wins,
           count(*) as games,
           max(r.played_at) filter (where r.result = 'win') as last_win
      from public.game_results r
     where (r.mode = 'ai' and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') <> 'easy')
        or (r.game = 'sudoku' and r.mode = 'solo')
     group by r.game, r.user_id
  )
  select s.game, s.user_id,
         row_number() over (partition by s.game order by s.wins desc, s.games asc, s.last_win asc),
         s.wins, s.games
    from scored s join public.profiles p on p.id = s.user_id
   where s.wins >= 5 and p.show_in_hall;
$$;
