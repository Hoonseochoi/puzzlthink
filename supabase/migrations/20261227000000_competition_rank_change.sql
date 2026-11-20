-- 피스 경쟁전: daily rank change. prev_rank is where each player stood at the start of today (KST midnight),
-- computed from the same wins with played_at before then; null = not on the board yesterday (shown as NEW).
drop function if exists public.competition_ranking(integer);
create function public.competition_ranking(p_limit integer default 50)
returns table(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  with cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hard as (
    select r.user_id, r.game, r.played_at,
           row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
       and r.game not in ('russian_roulette', 'indian_poker')
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
  ), prev_totals as (
    -- nth counts from the first win, so the 30-per-game cap holds for yesterday's board too.
    select h.user_id, count(*)::bigint as pieces, max(h.played_at) as last_win
      from hard h, cutoff c
     where h.nth <= 30 and h.played_at < c.t
     group by h.user_id
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), y.rn::integer
    from ranked k join public.profiles p on p.id = k.user_id
    left join prev_ranked y on y.user_id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$$;
revoke all on function public.competition_ranking(integer) from public;
grant execute on function public.competition_ranking(integer) to anon, authenticated;
