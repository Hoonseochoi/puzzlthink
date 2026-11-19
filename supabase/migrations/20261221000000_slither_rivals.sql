-- 슬리더링크 rivals: every board taken from someone is logged, so a takeover can say
-- "○○님 맵을 3번째 뺏었어요" / "○○님에게 1번 뺏겼어요", the live alert can count it, and the lobby lists my rivals.

create table if not exists public.slither_takeovers (
  id bigint generated always as identity primary key,
  challenge_id text not null references public.slither_challenges(id) on delete cascade,
  taker uuid not null references auth.users(id) on delete cascade,
  loser uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists slither_takeovers_pair on public.slither_takeovers (taker, loser);
create index if not exists slither_takeovers_loser on public.slither_takeovers (loser, taker);
alter table public.slither_takeovers enable row level security; -- read only through the functions below

-- Past takeovers: each board's clears in order; a 기존 챌린지 clear took the board from whoever cleared it before.
insert into public.slither_takeovers (challenge_id, taker, loser, created_at)
select x.challenge_id, x.user_id, x.prev, x.finished_at
  from (select r.challenge_id, r.user_id, r.kind, r.finished_at,
               lag(r.user_id) over (partition by r.challenge_id order by r.finished_at) as prev
          from public.slither_runs r where r.result = 'clear') x
 where x.kind = 'beat' and x.prev is not null and x.prev <> x.user_id
   and not exists (select 1 from public.slither_takeovers);

-- Pair counts: how often a took b's boards.
create or replace function public.slither_took(a uuid, b uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.slither_takeovers t where t.taker = a and t.loser = b;
$$;
revoke all on function public.slither_took(uuid, uuid) from public, anon, authenticated;

-- The checked finish now logs the takeover and returns the pair's tally.
create or replace function public.slither_finish_checked(p_run uuid, p_user uuid, p_cleared boolean, p_hints integer, p_flag text, p_marks integer, p_erases integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer; mine integer;
        rival uuid; rival_name text; took_n integer; lost_n integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = p_user and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  ok := p_cleared and p_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= c.holder_ms + 1500);
  update public.slither_runs
     set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end,
         flag = case when p_cleared then p_flag end, mark_moves = p_marks, erase_moves = p_erases
   where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = p_user, first_ms = took, holder = p_user, holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' then
    rival := c.holder;
    if rival is not null and rival <> p_user then
      insert into public.slither_takeovers (challenge_id, taker, loser) values (c.id, p_user, rival);
      took_n := public.slither_took(p_user, rival);
      lost_n := public.slither_took(rival, p_user);
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = rival);
    end if;
    update public.slither_challenges set holder = p_user, holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.slither_owner_rows() x where x.user_id = p_user;
    select count(*)::int into total from public.slither_owner_rows();
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', p_cleared and p_flag is not null,
    'rival', rival_name, 'took_n', took_n, 'lost_n', lost_n);
end; $$;
revoke all on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) from public, anon, authenticated;
grant execute on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) to service_role;

-- Live alert for a takeover carries the pair's count ("3번째").
create or replace function public.live_on_slither()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.published_at is null and new.published_at is not null then
    perform public.live_emit('slither_claim', 'slitherlink', public.live_name(new.holder), null, new.holder_ms);
  elsif old.holder is distinct from new.holder and old.published_at is not null then
    perform public.live_emit('slither_take', 'slitherlink', public.live_name(new.holder), public.live_name(old.holder),
      case when old.holder is null then null else public.slither_took(new.holder, old.holder) end);
  end if;
  return new;
exception when others then
  return new; -- an alert must never block the game data
end; $$;
revoke all on function public.live_on_slither() from public, anon, authenticated;

-- My rivals: the players I have traded boards with most, both ways.
create or replace function public.slither_rivals(p_limit integer default 5)
returns table(nickname text, took integer, lost integer, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  with mine as (
    select t.loser as other, 1 as took, 0 as lost, t.created_at from public.slither_takeovers t where t.taker = auth.uid()
    union all
    select t.taker, 0, 1, t.created_at from public.slither_takeovers t where t.loser = auth.uid()
  )
  select coalesce(nullif(btrim(p.nickname), ''), 'Player'), sum(m.took)::int, sum(m.lost)::int, max(m.created_at)
    from mine m join public.profiles p on p.id = m.other
   group by m.other, p.nickname
   order by sum(m.took) + sum(m.lost) desc, max(m.created_at) desc
   limit least(greatest(p_limit, 1), 10);
$$;
revoke all on function public.slither_rivals(integer) from public, anon;
grant execute on function public.slither_rivals(integer) to authenticated;
