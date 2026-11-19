-- 슬리더링크: rank players by how many boards they own (맵 수집), not by time.
-- Owning = being the current holder of a published board; losing a board to a faster player lowers your count.

create or replace function public.slither_owner_rows()
returns table(user_id uuid, maps integer, best_ms integer, rnk integer)
language sql stable security definer set search_path = public as $$
  with owned as (
    select c.holder as user_id, count(*)::int as maps, min(c.holder_ms) as best_ms
      from public.slither_challenges c where c.published_at is not null and c.holder is not null group by c.holder
  )
  select o.user_id, o.maps, o.best_ms, (rank() over (order by o.maps desc))::int
    from owned o join public.profiles p on p.id = o.user_id where p.show_in_hall;
$$;
revoke all on function public.slither_owner_rows() from public, anon, authenticated;

drop function if exists public.slither_ranking(integer);
create or replace function public.slither_ranking(p_limit integer default 10)
returns table(rank integer, nickname text, maps integer, is_me boolean, board text, board_ms integer, tried boolean)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.maps, x.user_id = auth.uid(), b.id, b.holder_ms, b.tried
    from public.slither_owner_rows() x
    join public.profiles p on p.id = x.user_id
    left join lateral (
      -- One of their boards to try: one I haven't tried yet if there is any, newest first.
      select c.id, c.holder_ms,
             auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) as tried
        from public.slither_challenges c
       where c.holder = x.user_id and c.published_at is not null
       order by 3, c.published_at desc limit 1
    ) b on true
   order by x.rnk, x.best_ms limit least(greatest(p_limit, 1), 50);
$$;

drop function if exists public.slither_me();
create or replace function public.slither_me()
returns table(rank integer, maps integer, total integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, x.maps, (select count(*)::int from public.slither_owner_rows()) from public.slither_owner_rows() x where x.user_id = auth.uid();
$$;

-- Same rules as before; the place returned is now my place by boards owned (after this clear).
create or replace function public.slither_finish(p_run uuid, p_cleared boolean, p_hints integer default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer; mine integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = auth.uid() and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  ok := p_cleared and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= c.holder_ms + 1500);
  update public.slither_runs set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = auth.uid(), first_ms = took, holder = auth.uid(), holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' then
    update public.slither_challenges set holder = auth.uid(), holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.slither_owner_rows() x where x.user_id = auth.uid();
    select count(*)::int into total from public.slither_owner_rows();
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine);
end; $$;

revoke all on function public.slither_ranking(integer) from public;
revoke all on function public.slither_me() from public, anon;
revoke all on function public.slither_finish(uuid, boolean, integer) from public, anon;
grant execute on function public.slither_ranking(integer) to anon, authenticated;
grant execute on function public.slither_me() to authenticated;
grant execute on function public.slither_finish(uuid, boolean, integer) to authenticated;
drop function if exists public.slither_rows();
