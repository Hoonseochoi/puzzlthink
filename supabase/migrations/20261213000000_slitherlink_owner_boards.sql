-- 슬리더링크: "○○님의 맵 해보기" — each ranker's current board, and one board by id (shared links).

drop function if exists public.slither_ranking(integer);
create or replace function public.slither_ranking(p_limit integer default 10)
returns table(rank integer, nickname text, ms integer, is_me boolean, board text, board_ms integer, tried boolean)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.ms, x.user_id = auth.uid(), b.id, b.holder_ms,
         auth.uid() is not null and b.id is not null and exists (select 1 from public.slither_runs r where r.challenge_id = b.id and r.user_id = auth.uid())
    from public.slither_rows() x
    join public.profiles p on p.id = x.user_id
    left join lateral (
      select c.id, c.holder_ms from public.slither_challenges c
       where c.holder = x.user_id and c.published_at is not null
       order by c.published_at desc limit 1
    ) b on true
   order by x.rnk, x.ms limit least(greatest(p_limit, 1), 50);
$$;

create or replace function public.slither_board(p_id text)
returns table(id text, holder text, holder_ms integer, first_name text, attempts integer, takeovers integer, published_at timestamptz, tried boolean, mine boolean)
language sql stable security definer set search_path = public as $$
  select c.id, coalesce(nullif(h.nickname, ''), 'Player'), c.holder_ms, coalesce(nullif(f.nickname, ''), 'Player'), c.attempts, c.takeovers, c.published_at,
         auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()),
         c.holder = auth.uid()
    from public.slither_challenges c
    left join public.profiles h on h.id = c.holder
    left join public.profiles f on f.id = c.first_user
   where c.id = p_id and c.published_at is not null;
$$;

revoke all on function public.slither_ranking(integer) from public;
revoke all on function public.slither_board(text) from public;
grant execute on function public.slither_ranking(integer) to anon, authenticated;
grant execute on function public.slither_board(text) to anon, authenticated;
