-- Records for Russian roulette and Russian janggi, a 5-win minimum for the Hall of Fame,
-- and my_hall_rank() so the site can congratulate a player who just entered the top 3.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261117000000_players_records.sql.

-- 1) Allow the two new games ------------------------------------------------------------
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi'));

-- 2) One ranking used by both the public hall and the player's own rank -------------------
-- Wins against AI (solved puzzles for sudoku); at least 5 wins to be ranked.
create or replace function public.hall_ranking()
returns table (game text, user_id uuid, rn bigint, wins bigint, games bigint)
language sql stable security definer set search_path = public as $$
  with scored as (
    select r.game, r.user_id,
           count(*) filter (where r.result = 'win') as wins,
           count(*) as games,
           max(r.played_at) filter (where r.result = 'win') as last_win
      from public.game_results r
     where (r.mode = 'ai' or (r.game = 'sudoku' and r.mode = 'solo'))
     group by r.game, r.user_id
  )
  select s.game, s.user_id,
         row_number() over (partition by s.game order by s.wins desc, s.games asc, s.last_win asc),
         s.wins, s.games
    from scored s join public.profiles p on p.id = s.user_id
   where s.wins >= 5 and p.show_in_hall;
$$;
revoke execute on function public.hall_ranking() from public, anon, authenticated;

create or replace function public.hall_of_fame(p_limit integer default 3)
returns table (game text, rank integer, nickname text, avatar_url text, wins bigint, games bigint)
language sql stable security definer set search_path = public as $$
  select h.game, h.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, h.wins, h.games
    from public.hall_ranking() h join public.profiles p on p.id = h.user_id
   where h.rn <= least(greatest(p_limit, 1), 10)
   order by h.game, h.rn;
$$;

-- The signed-in player's rank (1–3) in one game, or null.
create or replace function public.my_hall_rank(p_game text)
returns integer
language sql stable security definer set search_path = public as $$
  select h.rn::integer from public.hall_ranking() h
   where h.game = p_game and h.user_id = auth.uid() and h.rn <= 3;
$$;

grant execute on function public.hall_of_fame(integer) to anon, authenticated;
grant execute on function public.my_hall_rank(text) to authenticated;
revoke execute on function public.my_hall_rank(text) from anon;
