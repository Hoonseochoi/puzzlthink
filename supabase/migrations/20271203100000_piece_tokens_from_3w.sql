-- 현자의 징표 begin with 3W (2026-12-02 00:00 KST), not on the day 20271203000000_piece_tokens.sql was applied.
-- The owner: "현자의 징표는 다음 주 수요일에 피스 초기화하면서 주면 되는데". So:
--   * Until period 3 starts, no period's leftover counts as tokens: not granted, not pending. Spendable = this week's
--     pieces only, exactly as before 20271203000000 was applied.
--   * From 2026-12-02 00:00 KST, 1W and 2W leftovers are exchanged together (the weekly job, or the member's own first
--     spend, writes the rows), then every later week as built. One constant says it: piece_tokens_from_period() = 3.
--   * One popup for the combined exchange (my_piece_news merges a member's unseen exchange rows into one item).
-- Undoes today's 1W exchange: deletes the period-1 grant rows and the 'piece_exchange' 1 marker. A spend paid from
-- tokens before this runs (none at the time of writing) is re-attributed to pieces (from_tokens = 0) and listed in a
-- NOTICE if the member does not have the pieces for it (their balance floors at 0, never negative).
-- Everything else (weekly periods, the ledger, 명제 바둑 rewards and podium, the 3W race) is unchanged.
--
-- Apply in one transaction (psql -1 -f …); the file has no BEGIN/COMMIT of its own. Idempotent.
-- Rollback: re-run the piece_token_balance / piece_settle / piece_exchange / finalize_piece_weeks / my_piece_news /
-- mark_piece_news_seen definitions from 20271203000000_piece_tokens.sql (the deleted rows can be rebuilt with
-- select public.piece_exchange(1), which is exactly what that file did).

create or replace function public.piece_tokens_from_period() returns integer language sql immutable parallel safe as $$ select 3 $$;

-- Highest finished period whose leftover counts as tokens at p_now (0 = none yet).
create or replace function public.piece_token_upto(p_now timestamptz default now())
returns integer language sql immutable parallel safe as $$
  select case when public.piece_period_of(p_now) >= public.piece_tokens_from_period() then public.piece_period_of(p_now) - 1 else 0 end;
$$;

create or replace function public.piece_token_balance(p_user uuid, p_now timestamptz default now())
returns integer language sql stable security definer set search_path = public as $$
  select case when p_user is null or public.piece_token_upto(p_now) = 0 then 0 else greatest(0,
      (select coalesce(sum(t.amount), 0) from public.piece_token_grants t where t.user_id = p_user and t.period <= public.piece_token_upto(p_now))
    + (select coalesce(sum(greatest(0, public.piece_period_pieces(p_user, p.n))), 0)
         from generate_series(1, public.piece_token_upto(p_now)) p(n)
        where not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p.n)
          and not exists (select 1 from public.piece_token_grants t where t.user_id = p_user and t.period = p.n))
    - (select coalesce(sum(x.from_tokens), 0) from public.piece_spends x where x.user_id = p_user))::int end;
$$;

create or replace function public.piece_settle(p_user uuid, p_now timestamptz default now())
returns void language sql security definer set search_path = public as $$
  insert into public.piece_token_grants (user_id, period, amount)
  select p_user, p.n, v.amount
    from generate_series(1, public.piece_token_upto(p_now)) p(n)
    cross join lateral (select public.piece_period_pieces(p_user, p.n) as amount) v
   where v.amount > 0
     and not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p.n)
  on conflict (user_id, period) do nothing;
$$;

-- Exchange one finished period for everyone, but never before tokens begin.
create or replace function public.piece_exchange(p_period integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_period > public.piece_token_upto(now()) then return; end if;
  if exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p_period) then return; end if;
  insert into public.piece_token_grants (user_id, period, amount)
  select t.user_id, p_period, t.pieces from public.piece_race_rows(p_period) t where t.pieces > 0
  on conflict (user_id, period) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece_exchange', p_period) on conflict do nothing;
end $$;

create or replace function public.finalize_piece_weeks()
returns void language plpgsql security definer set search_path = public as $$
declare cur integer := public.piece_period_of(now()); p integer;
begin
  for p in 2 .. cur - 1 loop
    if not exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = p) then perform public.piece_race_freeze(p); end if;
  end loop;
  for p in 1 .. public.piece_token_upto(now()) loop
    if not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p) then perform public.piece_exchange(p); end if;
  end loop;
  perform public.prop_settle_podium();
end $$;

-- A member's unseen exchange rows are one popup: total amount, id = the latest period (marking it seen marks all up
-- to it), period = the first one (so the first exchange explains the change).
create or replace function public.my_piece_news()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(n order by n ->> 'at'), '[]'::jsonb) from (
    select jsonb_build_object('kind', 'exchange', 'id', max(t.period), 'period', min(t.period), 'periods', jsonb_agg(t.period order by t.period),
             'amount', sum(t.amount), 'at', max(t.created_at)) as n
      from public.piece_token_grants t
     where t.user_id = auth.uid() and t.seen_at is null   -- rows exist only once tokens have begun
    having count(*) > 0
    union all
    select jsonb_build_object('kind', g.source, 'id', g.id, 'day', g.day, 'amount', g.amount, 'rank', g.rank, 'at', g.created_at,
             'podium', case when g.source = 'prop_top' then (select coalesce(jsonb_agg(to_jsonb(z) order by z.rank), '[]'::jsonb) from public.prop_podium(g.day) z) end)
      from public.piece_grants g where g.user_id = auth.uid() and g.seen_at is null
  ) s;
$$;

create or replace function public.mark_piece_news_seen(p_periods integer[] default '{}', p_grants bigint[] default '{}')
returns void language sql security definer set search_path = public as $$
  update public.piece_token_grants set seen_at = now()
   where user_id = auth.uid() and seen_at is null and period <= (select max(x) from unnest(p_periods) x);
  update public.piece_grants set seen_at = now() where user_id = auth.uid() and id = any(p_grants) and seen_at is null;
$$;

-- Undo today's exchange (only while tokens have not begun: from 3W on this block does nothing).
do $$
declare r record;
begin
  if public.piece_token_upto(now()) > 0 then return; end if;
  for r in
    select x.user_id, sum(x.from_tokens) as tok from public.piece_spends x
     where x.from_tokens > 0 and public.piece_period_of(x.spent_at) < public.piece_tokens_from_period() group by x.user_id
  loop
    update public.piece_spends set from_tokens = 0 where user_id = r.user_id and from_tokens > 0 and public.piece_period_of(spent_at) < public.piece_tokens_from_period();
    if public.piece_period_pieces(r.user_id, public.piece_period_of(now())) < 0 then
      raise notice 'piece tokens undo: member % had % token(s) spent and now lacks the pieces for them (balance shows 0)', r.user_id, r.tok;
    else
      raise notice 'piece tokens undo: member % had % token(s) spent, now charged to this week''s pieces', r.user_id, r.tok;
    end if;
  end loop;
  -- tokens have not begun, so every grant row and exchange marker that exists was written too early
  delete from public.piece_token_grants;
  delete from public.contest_frozen where kind = 'piece_exchange';
end $$;
