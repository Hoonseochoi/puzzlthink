-- 슬리더링크: undo 20261228000000. Taking several boards from the same player is fine after all;
-- one try per board (so nobody takes the same board twice) stays as before.

create or replace function public.slither_start_beat(p_challenge text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.slither_challenges; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into c from public.slither_challenges where id = p_challenge and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) then raise exception 'tried'; end if;
  update public.slither_challenges set attempts = attempts + 1 where id = c.id;
  insert into public.slither_runs (challenge_id, user_id, kind) values (c.id, auth.uid(), 'beat') returning id into rid;
  return jsonb_build_object('run', rid, 'challenge', c.id, 'seed', c.seed, 'dots', c.dots, 'limit_ms', c.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = c.holder));
end; $$;

drop function if exists public.slither_board(text);
create function public.slither_board(p_id text)
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
grant execute on function public.slither_board(text) to anon, authenticated;

drop function if exists public.slither_challenges_list(integer);
create function public.slither_challenges_list(p_limit integer default 30)
returns table(id text, holder text, holder_ms integer, first_name text, attempts integer, takeovers integer, published_at timestamptz, tried boolean)
language sql stable security definer set search_path = public as $$
  select c.id, coalesce(nullif(h.nickname, ''), 'Player'), c.holder_ms, coalesce(nullif(f.nickname, ''), 'Player'), c.attempts, c.takeovers, c.published_at,
         auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid())
    from public.slither_challenges c
    left join public.profiles h on h.id = c.holder
    left join public.profiles f on f.id = c.first_user
   where c.published_at is not null
   order by c.published_at desc limit least(greatest(p_limit, 1), 100);
$$;
grant execute on function public.slither_challenges_list(integer) to anon, authenticated;

drop function if exists public.slither_ranking(integer);
create function public.slither_ranking(p_limit integer default 10)
returns table(rank integer, nickname text, maps integer, is_me boolean, board text, board_ms integer, tried boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.maps, x.user_id = auth.uid(), b.id, b.holder_ms, b.tried, public.rank_prev('slither', x.user_id, x.rnk)
    from public.slither_owner_rows() x
    join public.profiles p on p.id = x.user_id
    left join lateral (
      select c.id, c.holder_ms,
             auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) as tried
        from public.slither_challenges c
       where c.holder = x.user_id and c.published_at is not null
       order by 3, c.published_at desc limit 1
    ) b on true
   order by x.rnk, x.best_ms limit least(greatest(p_limit, 1), 50);
$$;
grant execute on function public.slither_ranking(integer) to anon, authenticated;

drop function if exists public.slither_rival_locked(uuid, uuid);
