-- Nicknames: chosen on first sign-in, shown everywhere (waiting rooms, rankings, Hall of Fame).
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261129000000_open_ranking.sql.

-- 1) Whether the player has chosen a nickname (the site asks once after the first sign-in) -------
alter table public.profiles add column if not exists nickname_set boolean not null default false;

create or replace function public.update_profile(p_nickname text, p_show_in_hall boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  update public.profiles
     set nickname = coalesce(nullif(left(btrim(p_nickname), 16), ''), nickname),
         nickname_set = nickname_set or nullif(btrim(p_nickname), '') is not null,
         show_in_hall = coalesce(p_show_in_hall, show_in_hall)
   where id = auth.uid();
end; $$;
revoke execute on function public.update_profile(text, boolean) from anon;
grant execute on function public.update_profile(text, boolean) to authenticated;

-- 2) Rankings show every player's current nickname (a change shows up at once) ------------------
drop function if exists public.open_ranking_top(text, int);
drop function if exists public.open_ranking_me(text);

create or replace function public.open_ranking_top(p_game text, p_limit int default 5)
returns table (rank int, nickname text, avatar_url text, wins int, losses int, draws int)
language sql stable security definer set search_path = public as $$
  select r.rnk, coalesce(nullif(p.nickname, ''), p.full_name, 'Player'), p.avatar_url, r.wins, r.losses, r.draws
    from public.open_ranking_rows(p_game) r join public.profiles p on p.id = r.user_id
   where r.rnk <= least(greatest(p_limit, 1), 20)
   order by r.rnk;
$$;

create or replace function public.open_ranking_me(p_game text)
returns table (rank int, nickname text, wins int, losses int, draws int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with rows as (select * from public.open_ranking_rows(p_game)),
       me as (select rnk from rows where user_id = auth.uid())
  select r.rnk, coalesce(nullif(p.nickname, ''), p.full_name, 'Player'), r.wins, r.losses, r.draws, r.user_id = auth.uid()
    from rows r join public.profiles p on p.id = r.user_id, me
   where r.rnk between me.rnk - 2 and me.rnk + 2
  union all
  select null, null, count(*) filter (where result = 'win')::int, count(*) filter (where result = 'loss')::int,
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

-- Check: the new column exists, and the ranking functions run.
select count(*) filter (where nickname_set) as chosen, count(*) as players from public.profiles;
select * from public.open_ranking_top('heavy13');
