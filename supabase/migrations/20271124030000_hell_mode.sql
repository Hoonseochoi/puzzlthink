-- AI 헬모드: '매우 어려움' (difficulty = 'hell') AI in 벽바둑 II, 벽바둑 (1:1 only), 십이장기, 러시아장기, 블라인드 오목.
-- Hell wins earn black pieces (블랙피스 경쟁전) and a separately numbered certificate. They are never gold pieces or
-- 어려움 certificates: those count difficulty = 'hard' only. They do count toward the AI Hall of Fame (any non-easy win).
-- Apply by hand: docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < this file

-- A win against the hell AI that counts.
create or replace function public.is_hell_clear(p_game text, p_mode text, p_result text, p_detail jsonb)
returns boolean language sql immutable set search_path = public as $$
  select p_result = 'win' and p_mode = 'ai'
     and coalesce(p_detail ->> 'difficulty', p_detail ->> 'level', '') = 'hell'
     and p_game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku')
     and (p_game not in ('wallgo', 'wallgo2') or coalesce(p_detail ->> 'players', '') = '2');
$$;

-- 블랙피스 경쟁전: one black piece per hell win, no cap. Results are reported by the browser, so a win only counts
-- when it comes at least 60 seconds after the player's previous hell win in the same game (a real hell game takes
-- longer than that; a script replaying inserts gets far less out of it).
-- Ranked by pieces; a tie goes to whoever reached that count first. Players hidden from the Hall of Fame are left out.
-- prev_rank: the rank at the start of today (KST); null = not on the board then (shown as NEW).
create or replace function public.black_piece_ranking(p_limit integer default 50)
returns table(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  with cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hell as (
    select r.user_id, r.game, r.played_at,
           lag(r.played_at) over (partition by r.user_id, r.game order by r.played_at) as prev_at
      from public.game_results r
     where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku')
       and r.mode = 'ai' and r.result = 'win'
       and public.is_hell_clear(r.game, r.mode, r.result, r.detail)
  ), counted as (
    select h.* from hell h where h.prev_at is null or h.played_at - h.prev_at >= interval '60 seconds'
  ), wins as (
    select c.user_id, c.game, count(*) as n, max(c.played_at) as last_win from counted c group by c.user_id, c.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  ), prev_totals as (
    select c.user_id, count(*)::bigint as pieces, max(c.played_at) as last_win
      from counted c, cutoff x where c.played_at < x.t group by c.user_id
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
revoke all on function public.black_piece_ranking(integer) from public;
grant execute on function public.black_piece_ranking(integer) to anon, authenticated;

-- 매우 어려움 클리어 인증서: the Nth player to beat a game's hell AI. Same shape as hard_clears, numbered on its own.
-- Ids start with 'h' so the shared /cert/{id} page knows which kind it is.
create table if not exists public.hell_clears (
  id text primary key,
  game text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  clear_no integer not null,
  cleared_at timestamptz not null,
  seen boolean not null default false,
  created_at timestamptz not null default now(),
  unique (game, user_id),
  unique (game, clear_no)
);
alter table public.hell_clears enable row level security; -- no direct access; only through the functions below
revoke all on public.hell_clears from public, anon, authenticated;

-- Issues (or returns) my certificate for a game I have beaten on hell. is_new is true the first time it is shown.
create or replace function public.claim_hell_clear(p_game text)
returns table(id text, clear_no integer, is_new boolean)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  first_win timestamptz;
  cert public.hell_clears;
begin
  if uid is null then return; end if;
  select * into cert from public.hell_clears h where h.game = p_game and h.user_id = uid;
  if not found then
    select min(r.played_at) into first_win from public.game_results r
     where r.user_id = uid and r.game = p_game and public.is_hell_clear(r.game, r.mode, r.result, r.detail);
    if first_win is null then return; end if;
    perform pg_advisory_xact_lock(hashtext('hell_clear:' || p_game));
    insert into public.hell_clears (id, game, user_id, clear_no, cleared_at)
    values ('h' || substr(md5(random()::text || clock_timestamp()::text || uid::text), 1, 12), p_game, uid,
            coalesce((select max(h.clear_no) from public.hell_clears h where h.game = p_game), 0) + 1, first_win)
    on conflict (game, user_id) do nothing;
    select * into cert from public.hell_clears h where h.game = p_game and h.user_id = uid;
  end if;
  return query select cert.id, cert.clear_no, not cert.seen;
  if not cert.seen then update public.hell_clears h set seen = true where h.id = cert.id; end if;
end; $$;
revoke all on function public.claim_hell_clear(text) from public, anon;
grant execute on function public.claim_hell_clear(text) to authenticated;

-- One certificate for its public page and image (nickname only).
create or replace function public.hell_clear_cert(p_id text)
returns table(game text, clear_no integer, nickname text, cleared_at timestamptz, total integer)
language sql stable security definer set search_path = public as $$
  select h.game, h.clear_no, coalesce(nullif(p.nickname, ''), 'Player'), h.cleared_at,
         (select count(*)::int from public.hell_clears t where t.game = h.game)
    from public.hell_clears h left join public.profiles p on p.id = h.user_id
   where h.id = p_id;
$$;
revoke all on function public.hell_clear_cert(text) from public;
grant execute on function public.hell_clear_cert(text) to anon, authenticated;

-- My hell certificates, for the records page and the hell page.
create or replace function public.my_hell_clears()
returns table(id text, game text, clear_no integer, cleared_at timestamptz)
language sql stable security definer set search_path = public as $$
  select h.id, h.game, h.clear_no, h.cleared_at from public.hell_clears h where h.user_id = auth.uid() order by h.cleared_at;
$$;
revoke all on function public.my_hell_clears() from public, anon;
grant execute on function public.my_hell_clears() to authenticated;

-- How many players hold each game's hell certificate (the hell page shows "N명 클리어").
create or replace function public.hell_clear_counts()
returns table(game text, clears integer)
language sql stable security definer set search_path = public as $$
  select h.game, count(*)::int from public.hell_clears h group by h.game;
$$;
revoke all on function public.hell_clear_counts() from public;
grant execute on function public.hell_clear_counts() to anon, authenticated;

-- The live island announces each new hell certificate ("…님이 벽바둑 매우 어려움을 N번째로 클리어!").
alter table public.live_events drop constraint if exists live_events_kind_check;
alter table public.live_events add constraint live_events_kind_check
  check (kind = any (array['slither_claim', 'slither_take', 'open_win', 'hall_rank', 'hard_clear', 'hell_clear']));
create or replace function public.live_on_hell_clear()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.live_emit('hell_clear', new.game, public.live_name(new.user_id), null, new.clear_no);
  return new;
exception when others then
  return new;
end; $$;
drop trigger if exists live_on_hell_clear on public.hell_clears;
create trigger live_on_hell_clear after insert on public.hell_clears for each row execute function public.live_on_hell_clear();

notify pgrst, 'reload schema';
