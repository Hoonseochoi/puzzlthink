-- Items paid with 피스 / 블랙피스, first used by 망각의 지뢰 (AI matches only), written so any game can use them.
--
--   black_piece_spends   블랙피스 spent (same shape as piece_spends). The black-piece board (black_piece_rows) now
--                        subtracts them, so spending lowers the member's weekly black-piece count (owner's call).
--   item_uses            one row per item used, any game: user id, game, item, currency and cost, match id, AI level,
--                        move number, time. No nickname / email / IP (house rule).
--   spend_currency()     internal: charges p_amount of 'piece' or 'black_piece' atomically (per-member lock, the
--                        balance never goes below zero) and returns the balance left, or -1 when short.
--   my_wallet()          members: { pieces, black_pieces } right now.
--   mo_use_item()        망각의 지뢰: price and per-game cap from mo_item_cfg() (mirrors src/lib/mineOblivionItems.ts),
--                        a nonce per tap so a double tap never charges twice, then spend_currency + item_uses.
--   Certification        a result whose detail has 'items' is not a hard clear (certificate, x- icon, HIDDEN MISSION),
--                        earns no 피스 (piece_balance, 피스 경쟁전, lounge) and is not a win in 명예의 전당 / crowns.
--                        A trigger writes 'items' into a 망각의 지뢰 AI result whenever item_uses has rows for its
--                        match id (detail.gid), even if the browser left the flag out.
--
-- The match itself runs in the browser, so the server cannot check that an item was really needed or that the result
-- is real: it only charges correctly, logs, and keeps item games out of what certifies skill.
-- Order: after 20271201000000_mine_oblivion.sql. Idempotent. Re-run after any migration that re-creates
-- piece_balance / competition_ranking / finalize_piece_weeks / lounge_pieces / hall_ranking / is_hard_clear /
-- black_piece_rows wholesale (section 6 patches whatever is live). Rollback at the end.

-- 1. 블랙피스 spends ─────────────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.black_piece_spends (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null default 1 check (amount > 0),
  reason text not null,
  ref uuid,
  spent_at timestamptz not null default now()
);
create index if not exists black_piece_spends_user_idx on public.black_piece_spends (user_id, spent_at);
alter table public.black_piece_spends enable row level security;   -- definer functions only

-- The wins that count on a hell week's board (the body of black_piece_rows up to `counted`, unchanged).
create or replace function public.black_piece_counted(p_week integer)
returns table(user_id uuid, game text, played_at timestamptz)
language sql stable security definer set search_path to 'public'
as $function$
  with b as (
    select * from public.hell_week_bounds(p_week)
  ), hell as (
    select r.user_id, r.game, r.played_at,
           lag(r.played_at) over (partition by r.user_id, r.game order by r.played_at) as prev_at
      from public.game_results r, b
     where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel')
       and r.mode = 'ai' and r.result = 'win'
       and public.is_hell_clear(r.game, r.mode, r.result, r.detail)
       and r.played_at >= b.starts and r.played_at < b.ends
  ), spaced as (
    select h.* from hell h where h.prev_at is null or h.played_at - h.prev_at >= interval '60 seconds'
  ), numbered as (
    select s.*,
           row_number() over (partition by s.user_id, s.game order by s.played_at) as k,
           count(*) filter (where s.played_at < timestamptz '2026-11-25 23:06:00+00') over (partition by s.user_id, s.game) as before_cap
      from spaced s
  )
  select n.user_id, n.game, n.played_at from numbered n
   where n.game <> 'russian_janggi' or n.k <= greatest(30, n.before_cap);
$function$;
revoke all on function public.black_piece_counted(integer) from public, anon, authenticated;

-- The board: as before, minus what each member spent that week (yesterday's rank: minus what was spent before today).
create or replace function public.black_piece_rows(p_week integer)
returns table(user_id uuid, rn integer, pieces bigint, per_game jsonb, last_win timestamptz, prev_rn integer)
language sql stable security definer set search_path to 'public'
as $function$
  with b as (
    select * from public.hell_week_bounds(p_week)
  ), cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), counted as (
    select * from public.black_piece_counted(p_week)
  ), spent as (
    select x.user_id, sum(x.amount)::bigint as total, coalesce(sum(x.amount) filter (where x.spent_at < c.t), 0)::bigint as before_cut
      from public.black_piece_spends x, b, cutoff c
     where x.spent_at >= b.starts and x.spent_at < b.ends
     group by x.user_id
  ), wins as (
    select c.user_id, c.game, count(*) as n, max(c.played_at) as last_win from counted c group by c.user_id, c.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint - coalesce(max(sp.total), 0) as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w left join spent sp on sp.user_id = w.user_id group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  ), prev_totals as (
    select c.user_id, count(*)::bigint - coalesce(max(sp.before_cut), 0) as pieces, max(c.played_at) as last_win
      from counted c cross join cutoff x left join spent sp on sp.user_id = c.user_id
     where c.played_at < x.t group by c.user_id
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  )
  select k.user_id, k.rn::int, k.pieces, k.per_game, k.last_win, y.rn::int
    from ranked k left join prev_ranked y on y.user_id = k.user_id;
$function$;
revoke all on function public.black_piece_rows(integer) from public, anon, authenticated;

-- A member's 블랙피스 now: this hell week's counted wins minus this week's spends (the board shows the same number).
create or replace function public.black_piece_balance(p_user uuid)
returns integer language sql stable security definer set search_path to 'public'
as $function$
  select case when p_user is null then 0 else greatest(0,
    (select count(*) from public.black_piece_counted(public.hell_week_of(now())) c where c.user_id = p_user)
    - (select coalesce(sum(x.amount), 0) from public.black_piece_spends x, public.hell_week_bounds(public.hell_week_of(now())) b
        where x.user_id = p_user and x.spent_at >= b.starts and x.spent_at < b.ends))::int end;
$function$;
revoke all on function public.black_piece_balance(uuid) from public, anon, authenticated;

-- 2. Any currency ──────────────────────────────────────────────────────────────────────────────────────────────────
create or replace function public.currency_balance(p_user uuid, p_currency text)
returns integer language sql stable security definer set search_path to 'public'
as $$
  select case p_currency when 'piece' then public.piece_balance(p_user) when 'black_piece' then public.black_piece_balance(p_user) end;
$$;
revoke all on function public.currency_balance(uuid, text) from public, anon, authenticated;

create or replace function public.my_wallet()
returns jsonb language sql stable security definer set search_path to 'public'
as $$
  select jsonb_build_object('pieces', public.piece_balance(auth.uid()), 'black_pieces', public.black_piece_balance(auth.uid()));
$$;
revoke all on function public.my_wallet() from public, anon;
grant execute on function public.my_wallet() to authenticated;

-- Charges a member. One member's spends run one at a time (advisory lock), so two taps can never both pass the
-- balance check. Returns the balance left, or -1 (nothing charged) when the member does not have p_amount.
create or replace function public.spend_currency(p_user uuid, p_currency text, p_amount integer, p_game text, p_reason text, p_ref uuid default null)
returns integer language plpgsql security definer set search_path to 'public'
as $$
declare bal integer;
begin
  if p_user is null or p_amount is null or p_amount < 1 or p_currency not in ('piece', 'black_piece') then return -1; end if;
  perform pg_advisory_xact_lock(hashtext('wallet:' || p_user::text));
  bal := public.currency_balance(p_user, p_currency);
  if bal < p_amount then return -1; end if;
  if p_currency = 'piece' then
    insert into public.piece_spends (user_id, amount, reason, ref) values (p_user, p_amount, p_game || ':' || p_reason, p_ref);
  else
    insert into public.black_piece_spends (user_id, amount, reason, ref) values (p_user, p_amount, p_game || ':' || p_reason, p_ref);
  end if;
  return bal - p_amount;
end $$;
revoke all on function public.spend_currency(uuid, text, integer, text, text, uuid) from public, anon, authenticated;

-- 3. The usage log (any game) ──────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.item_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game text not null,
  item text not null,
  currency text not null check (currency in ('piece', 'black_piece')),
  cost integer not null check (cost >= 0),
  match text,              -- the game's own match / run id
  level text,              -- AI level, when there is one
  move_no integer,         -- moves played when the item was used
  nonce uuid not null,     -- one per tap: a repeated request is answered without charging again
  used_at timestamptz not null default now(),
  unique (user_id, nonce)
);
create index if not exists item_uses_match_idx on public.item_uses (user_id, game, match);
create index if not exists item_uses_time_idx on public.item_uses (game, used_at);
alter table public.item_uses enable row level security;   -- definer functions and the read-only report only

-- 4. 망각의 지뢰 ──────────────────────────────────────────────────────────────────────────────────────────────────
-- Prices and per-game caps: keep in step with MO_ITEMS in src/lib/mineOblivionItems.ts.
create or replace function public.mo_item_cfg()
returns jsonb language sql immutable as $$
  select '{"probe":{"currency":"piece","price":1,"cap":2},"recall":{"currency":"piece","price":1,"cap":2},"suit":{"currency":"black_piece","price":1,"cap":1}}'::jsonb
$$;

create or replace function public.mo_item_state(p_user uuid, p_match text)
returns jsonb language sql stable security definer set search_path to 'public'
as $$
  select jsonb_build_object(
    'pieces', public.piece_balance(p_user), 'black_pieces', public.black_piece_balance(p_user),
    'uses', coalesce((select jsonb_object_agg(u.item, u.n) from (select item, count(*) as n from public.item_uses
       where user_id = p_user and game = 'mine_oblivion' and match = p_match group by item) u), '{}'::jsonb));
$$;
revoke all on function public.mo_item_state(uuid, text) from public, anon, authenticated;

-- Charge for one item in one AI match. Answers { ok, error?, pieces, black_pieces, uses: { item: n } }.
-- error: signin | item | level | match | cap | funds.
create or replace function public.mo_use_item(p_match text, p_item text, p_level text, p_move integer, p_nonce uuid)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  spec jsonb := public.mo_item_cfg() -> p_item;
  used integer; left_n integer; use_id uuid := gen_random_uuid();
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'signin'); end if;
  if spec is null then return jsonb_build_object('ok', false, 'error', 'item'); end if;
  if p_level is null or p_level not in ('normal', 'hard') then return jsonb_build_object('ok', false, 'error', 'level'); end if;
  if p_match is null or p_match !~ '^[a-z0-9]{4,16}$' or p_nonce is null then return jsonb_build_object('ok', false, 'error', 'match'); end if;
  perform pg_advisory_xact_lock(hashtext('wallet:' || uid::text));
  -- The same tap again (a retry, a double tap that got through): already charged, nothing more.
  if exists (select 1 from public.item_uses u where u.user_id = uid and u.nonce = p_nonce) then
    return jsonb_build_object('ok', true, 'again', true) || public.mo_item_state(uid, p_match);
  end if;
  select count(*) into used from public.item_uses u where u.user_id = uid and u.game = 'mine_oblivion' and u.match = p_match and u.item = p_item;
  if used >= (spec ->> 'cap')::int then return jsonb_build_object('ok', false, 'error', 'cap') || public.mo_item_state(uid, p_match); end if;
  left_n := public.spend_currency(uid, spec ->> 'currency', (spec ->> 'price')::int, 'mine_oblivion', p_item, use_id);
  if left_n < 0 then return jsonb_build_object('ok', false, 'error', 'funds') || public.mo_item_state(uid, p_match); end if;
  insert into public.item_uses (id, user_id, game, item, currency, cost, match, level, move_no, nonce)
  values (use_id, uid, 'mine_oblivion', p_item, spec ->> 'currency', (spec ->> 'price')::int, p_match, p_level,
          greatest(0, least(coalesce(p_move, 0), 200)), p_nonce);
  return jsonb_build_object('ok', true) || public.mo_item_state(uid, p_match);
end $$;
revoke all on function public.mo_use_item(text, text, text, integer, uuid) from public, anon;
grant execute on function public.mo_use_item(text, text, text, integer, uuid) to authenticated;

-- An item game is marked on the server too: a 망각의 지뢰 AI result gets detail.items from the log of its match.
create or replace function public.mo_items_on_result()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
declare n integer;
begin
  if new.game = 'mine_oblivion' and new.mode = 'ai' and coalesce(new.detail ->> 'gid', '') <> '' then
    select count(*) into n from public.item_uses u where u.user_id = new.user_id and u.game = 'mine_oblivion' and u.match = new.detail ->> 'gid';
    if n > 0 then new.detail := coalesce(new.detail, '{}'::jsonb) || jsonb_build_object('items', n); end if;
  end if;
  return new;
end $$;
drop trigger if exists mo_items_on_result on public.game_results;
create trigger mo_items_on_result before insert on public.game_results for each row execute function public.mo_items_on_result();

-- 5. Not a hard clear (certificate, x- icon via hard_clears, HIDDEN MISSION) ──────────────────────────────────────
create or replace function public.is_hard_clear(p_game text, p_mode text, p_result text, p_detail jsonb)
 returns boolean language sql immutable set search_path to 'public'
as $function$
  select p_result = 'win' and not coalesce(p_detail ? 'items', false) and (
    (p_mode = 'ai' and coalesce(p_detail ->> 'difficulty', p_detail ->> 'level', '') = 'hard')
    or (p_game = 'sudoku' and p_mode = 'solo' and coalesce(p_detail ->> 'difficulty', '') = 'hard'));
$function$;

-- 6. No 피스 earned, no 명예의 전당 / crown win: patch whatever is live (order-independent, idempotent).
do $$
declare
  f record; def text;
  hard_pat text := 'coalesce(r.detail ->> ''difficulty'', r.detail ->> ''level'', '''') = ''hard''';
  hard_new text := 'coalesce(r.detail ->> ''difficulty'', r.detail ->> ''level'', '''') = ''hard'' and not (r.detail ? ''items'')';
begin
  for f in select p.oid, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname in ('piece_balance', 'competition_ranking', 'finalize_piece_weeks', 'lounge_pieces') loop
    def := pg_get_functiondef(f.oid);
    if position(hard_new in def) = 0 then
      if position(hard_pat in def) = 0 then raise exception 'unexpected % definition', f.proname; end if;
      execute replace(def, hard_pat, hard_new);
    end if;
  end loop;
  def := pg_get_functiondef('public.hall_ranking()'::regprocedure);
  if position('not (r.detail ? ''items'')' in def) = 0 then
    if position('filter (where r.result = ''win'') as wins' in def) = 0 or position('filter (where r.result = ''win'') as last_win' in def) = 0 then
      raise exception 'unexpected hall_ranking definition';
    end if;
    def := replace(def, 'filter (where r.result = ''win'') as wins', 'filter (where r.result = ''win'' and not (r.detail ? ''items'')) as wins');
    def := replace(def, 'filter (where r.result = ''win'') as last_win', 'filter (where r.result = ''win'' and not (r.detail ? ''items'')) as last_win');
    execute def;
  end if;
end $$;

notify pgrst, 'reload schema';

-- Rollback (spends already made stay in piece_spends / black_piece_spends; delete them first to give them back):
--   drop trigger mo_items_on_result on public.game_results; drop function public.mo_items_on_result(), public.mo_use_item(text, text, text, integer, uuid),
--   public.mo_item_state(uuid, text), public.mo_item_cfg(), public.my_wallet(), public.spend_currency(uuid, text, integer, text, text, uuid),
--   public.currency_balance(uuid, text), public.black_piece_balance(uuid); drop table public.item_uses;
--   re-create black_piece_rows from 20271126080000_russian_janggi_hell_cap.sql and is_hard_clear without the items test;
--   run section 6 with replace(def, ' and not (r.detail ? ''items'')', ''); then drop black_piece_counted and black_piece_spends.
