-- 피스 경쟁전 (records page): one piece per win against the hard AI, across every game, at most 30 pieces per game.
-- Ranked by pieces; a tie goes to whoever reached that count first (wins past a game's cap don't move that time).
-- Players hidden from the Hall of Fame are left out.
-- Returns the top `p_limit` and, when signed in, my own row too (is_me) even if it is outside the top.
create or replace function public.competition_ranking(p_limit integer default 50)
returns table(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean)
language sql stable security definer set search_path = public as $$
  with hard as (
    select r.user_id, r.game, r.played_at,
           row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win
      from hard h where h.nth <= 30
     group by h.user_id, h.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid()
    from ranked k join public.profiles p on p.id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$$;
revoke all on function public.competition_ranking(integer) from public;
grant execute on function public.competition_ranking(integer) to anon, authenticated;
