-- Profile icons (the stone a player shows everywhere), earned four ways:
--   w{week}-{place}  피스 경쟁전 weekly top three (1W platinum, 2W jewels), kept for good.
--   h{week}-{place}  블랙피스 경쟁전 (AI 헬모드) weekly top three, kept for good. Weeks are 7 days now:
--                    1W = launch → 2026-12-02 00:00 KST, then 2W, 3W… every 7 days.
--   m2048            reached a 2048 block in 2048, kept for good.
--   c-{game}         the game's ranking #1 (the board /ranking/{game} puts on top). Held only while #1:
--                    when someone takes the top spot the icon moves to them.
-- A newly earned icon becomes the player's stone at once (they can switch back in 기록실 › 닉네임). A chosen icon
-- that is no longer held (a lost #1) falls back to the most recently earned icon still held, else the default look.
-- public.icon_tick() runs every 5 minutes (pg_cron): freezes finished weeks, hands out their icons, moves crowns.

create table if not exists public.profile_icons (
  user_id uuid not null references auth.users(id) on delete cascade,
  icon text not null check (icon ~ '^([wh][0-9]{1,3}-[123]|m2048|c-[a-z0-9_]{1,40})$'),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,          -- c-{game} only: lost the #1
  seen boolean not null default false,
  primary key (user_id, icon)
);
alter table public.profile_icons enable row level security;
revoke all on public.profile_icons from public, anon, authenticated;

alter table public.stone_choices drop constraint if exists stone_choices_stone_check;
alter table public.stone_choices add constraint stone_choices_stone_check
  check (stone ~ '^(black|white|red|blue|[wh][0-9]{1,3}-[123]|m2048|c-[a-z0-9_]{1,40})$');

-- Give (or give back) an icon. Newly given → it becomes the player's stone. Returns true when new.
CREATE OR REPLACE FUNCTION public.grant_icon(p_user uuid, p_icon text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_new boolean;
begin
  insert into public.profile_icons as i (user_id, icon) values (p_user, p_icon)
  on conflict (user_id, icon) do update set revoked_at = null, granted_at = now(), seen = false
   where i.revoked_at is not null
  returning true into v_new;
  if coalesce(v_new, false) then
    insert into public.stone_choices (user_id, stone) values (p_user, p_icon)
    on conflict (user_id) do update set stone = excluded.stone, updated_at = now();
  end if;
  return coalesce(v_new, false);
end; $function$;
revoke all on function public.grant_icon(uuid, text) from public, anon, authenticated;

-- The stone a player shows: their pick if still theirs, else the latest icon they hold, else null (default look).
CREATE OR REPLACE FUNCTION public.effective_stone(p_user uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(
    (select c.stone from public.stone_choices c
      where c.user_id = p_user
        and (c.stone in ('black', 'white', 'red', 'blue')
             or exists (select 1 from public.profile_icons i where i.user_id = p_user and i.icon = c.stone and i.revoked_at is null))),
    (select i.icon from public.profile_icons i where i.user_id = p_user and i.revoked_at is null order by i.granted_at desc, i.icon limit 1)
  );
$function$;
revoke all on function public.effective_stone(uuid) from public, anon, authenticated;

-- My options: the colours are always open; icons I hold, newest first.
CREATE OR REPLACE FUNCTION public.my_stone_options()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'chosen', public.effective_stone(auth.uid()),
    'earned', coalesce((select jsonb_agg(i.icon order by i.granted_at desc, i.icon)
                          from public.profile_icons i where i.user_id = auth.uid() and i.revoked_at is null), '[]'::jsonb),
    'lost', coalesce((select jsonb_agg(i.icon order by i.revoked_at desc)
                        from public.profile_icons i where i.user_id = auth.uid() and i.revoked_at is not null), '[]'::jsonb)
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_my_stone(p_stone text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if p_stone is null or p_stone = '' then
    delete from public.stone_choices where user_id = auth.uid();
    return null;
  end if;
  if p_stone not in ('black', 'white', 'red', 'blue')
     and not exists (select 1 from public.profile_icons i where i.user_id = auth.uid() and i.icon = p_stone and i.revoked_at is null) then
    raise exception 'not earned';
  end if;
  insert into public.stone_choices (user_id, stone) values (auth.uid(), p_stone)
  on conflict (user_id) do update set stone = excluded.stone, updated_at = now();
  return p_stone;
end; $function$;

-- Everyone's stone by nickname (players who picked one or hold an icon).
CREATE OR REPLACE FUNCTION public.stone_choices_public()
 RETURNS TABLE(nickname text, stone text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.nickname, s.stone
    from (select u.user_id, public.effective_stone(u.user_id) as stone
            from (select c.user_id from public.stone_choices c
                  union select i.user_id from public.profile_icons i where i.revoked_at is null) u) s
    join public.profiles p on p.id = s.user_id
   where s.stone is not null and p.nickname is not null and btrim(p.nickname) <> '';
$function$;

-- Icons I got but have not been told about yet (the "new icon" popup), and marking them told.
CREATE OR REPLACE FUNCTION public.my_new_icons()
 RETURNS TABLE(icon text, granted_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select i.icon, i.granted_at from public.profile_icons i
   where i.user_id = auth.uid() and i.revoked_at is null and not i.seen
   order by i.granted_at desc, i.icon;
$function$;

CREATE OR REPLACE FUNCTION public.mark_icons_seen(p_icons text[])
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.profile_icons set seen = true where user_id = auth.uid() and icon = any(p_icons);
$function$;

-- 2048: the moment a 2048 block appears (the game calls this) and any saved game with one (trigger below).
CREATE OR REPLACE FUNCTION public.claim_icon_2048()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then return false; end if;
  return public.grant_icon(auth.uid(), 'm2048');
end; $function$;

CREATE OR REPLACE FUNCTION public.grant_icon_2048_on_result()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.game = 'merge2048' and new.user_id is not null and (new.detail ->> 'max') ~ '^[0-9]{1,7}$' and (new.detail ->> 'max')::int >= 2048 then
    begin
      perform public.grant_icon(new.user_id, 'm2048');
    exception when others then null; -- never block saving the game
    end;
  end if;
  return new;
end; $function$;
drop trigger if exists grant_icon_2048 on public.game_results;
create trigger grant_icon_2048 after insert on public.game_results for each row execute function public.grant_icon_2048_on_result();

-- ─── 피스 경쟁전 2W: 2026-11-25 00:00 → 2026-12-02 00:00 KST (one week) ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.competition_ranking(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hard as (
    select r.user_id, r.game, r.played_at,
           row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= timestamptz '2026-11-25 00:00:00+09'
       and r.played_at < timestamptz '2026-12-02 00:00:00+09'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win
      from hard h where h.nth <= 5
     group by h.user_id, h.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  ), prev_totals as (
    select h.user_id, count(*)::bigint as pieces, max(h.played_at) as last_win
      from hard h, cutoff c
     where h.nth <= 5 and h.played_at < c.t
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
$function$;

-- Which finished weeks are frozen (so the tick does each once).
create table if not exists public.contest_frozen (
  kind text not null,       -- 'piece' | 'hell'
  week integer not null,
  frozen_at timestamptz not null default now(),
  primary key (kind, week)
);
alter table public.contest_frozen enable row level security;
revoke all on public.contest_frozen from public, anon, authenticated;
insert into public.contest_frozen (kind, week) values ('piece', 1) on conflict do nothing;

CREATE OR REPLACE FUNCTION public.finalize_piece_weeks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r record;
begin
  if now() < timestamptz '2026-12-02 00:00:00+09' or exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = 2) then return; end if;
  insert into public.piece_race_final (week, rank, user_id, pieces, per_game, last_win)
  with hard as (
    select r.user_id, r.game, r.played_at, row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= timestamptz '2026-11-25 00:00:00+09' and r.played_at < timestamptz '2026-12-02 00:00:00+09'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win from hard h where h.nth <= 5 group by h.user_id, h.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win from wins w group by w.user_id
  )
  select 2, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
    from totals t join public.profiles p on p.id = t.user_id
   where p.show_in_hall
  on conflict (week, rank) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece', 2);
  for r in select f.user_id, f.rank from public.piece_race_final f where f.week = 2 and f.rank <= 3 order by f.rank desc loop
    perform public.grant_icon(r.user_id, 'w2-' || r.rank);
  end loop;
end; $function$;
revoke all on function public.finalize_piece_weeks() from public, anon, authenticated;

-- ─── 블랙피스 경쟁전: 7-day weeks ──────────────────────────────────────────────────────────────────────────────

-- Week n's bounds: 1W = everything before 2026-12-02 00:00 KST (launch week), then 7 days each.
CREATE OR REPLACE FUNCTION public.hell_week_bounds(p_week integer)
 RETURNS TABLE(starts timestamp with time zone, ends timestamp with time zone)
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case when p_week <= 1 then '-infinity'::timestamptz
              else timestamptz '2026-12-02 00:00:00+09' + (p_week - 2) * interval '7 days' end,
         timestamptz '2026-12-02 00:00:00+09' + (greatest(p_week, 1) - 1) * interval '7 days';
$function$;

CREATE OR REPLACE FUNCTION public.hell_week_of(p_at timestamp with time zone)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case when p_at < timestamptz '2026-12-02 00:00:00+09' then 1
              else 2 + floor(extract(epoch from (p_at - timestamptz '2026-12-02 00:00:00+09')) / 604800)::int end;
$function$;

-- One hell week's standings (counted the same way as before: a win within 60 s of the last one in that game is not counted).
CREATE OR REPLACE FUNCTION public.black_piece_rows(p_week integer)
 RETURNS TABLE(user_id uuid, rn integer, pieces bigint, per_game jsonb, last_win timestamp with time zone, prev_rn integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select * from public.hell_week_bounds(p_week)
  ), cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hell as (
    select r.user_id, r.game, r.played_at,
           lag(r.played_at) over (partition by r.user_id, r.game order by r.played_at) as prev_at
      from public.game_results r, b
     where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku')
       and r.mode = 'ai' and r.result = 'win'
       and public.is_hell_clear(r.game, r.mode, r.result, r.detail)
       and r.played_at >= b.starts and r.played_at < b.ends
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
  select k.user_id, k.rn::int, k.pieces, k.per_game, k.last_win, y.rn::int
    from ranked k left join prev_ranked y on y.user_id = k.user_id;
$function$;
revoke all on function public.black_piece_rows(integer) from public, anon, authenticated;

-- The live board: this hell week only.
CREATE OR REPLACE FUNCTION public.black_piece_ranking(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select k.rn, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), k.prev_rn
    from public.black_piece_rows(public.hell_week_of(now())) k join public.profiles p on p.id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$function$;

create table if not exists public.black_piece_final (
  week smallint not null,
  rank integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  pieces bigint not null,
  per_game jsonb not null,
  last_win timestamptz not null,
  primary key (week, rank)
);
alter table public.black_piece_final enable row level security;
revoke all on public.black_piece_final from public, anon, authenticated;

-- A finished hell week's frozen board (prev_rank = rank, so nothing shows as moved).
CREATE OR REPLACE FUNCTION public.black_piece_final_board(p_week integer, p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select f.rank, coalesce(p.nickname, 'Player'), p.avatar_url, f.pieces, f.per_game, f.last_win, f.user_id = auth.uid(), f.rank
    from public.black_piece_final f join public.profiles p on p.id = f.user_id
   where f.week = p_week and (f.rank <= least(greatest(p_limit, 1), 100) or f.user_id = auth.uid())
   order by f.rank;
$function$;

CREATE OR REPLACE FUNCTION public.finalize_hell_weeks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare w integer; r record;
begin
  for w in 1 .. public.hell_week_of(now()) - 1 loop
    continue when exists (select 1 from public.contest_frozen f where f.kind = 'hell' and f.week = w);
    insert into public.black_piece_final (week, rank, user_id, pieces, per_game, last_win)
    select w, k.rn, k.user_id, k.pieces, k.per_game, k.last_win from public.black_piece_rows(w) k
    on conflict (week, rank) do nothing;
    insert into public.contest_frozen (kind, week) values ('hell', w);
    for r in select f.user_id, f.rank from public.black_piece_final f where f.week = w and f.rank <= 3 order by f.rank desc loop
      perform public.grant_icon(r.user_id, 'h' || w || '-' || r.rank);
    end loop;
  end loop;
end; $function$;
revoke all on function public.finalize_hell_weeks() from public, anon, authenticated;

-- ─── Per-game #1 crowns ─────────────────────────────────────────────────────────────────────────────────────

create table if not exists public.game_crowns (
  game text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  since timestamptz not null default now()
);
alter table public.game_crowns enable row level security;
revoke all on public.game_crowns from public, anon, authenticated;

-- Each game's #1, the same board the ranking page puts on its podium: the map ranking (logic puzzles), the
-- 챌린지 도전 score (2048), else the Hall of Fame (AI wins), else 네모 세기's challenge (hard → normal → easy),
-- else open matches.
CREATE OR REPLACE FUNCTION public.refresh_game_crowns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  g text; v_board text; v_uid uuid; v_cur uuid; v_hall jsonb; d text;
  games text[] := array['card_janggi', 'color_link_duel', 'hit_stay', 'point_omok', 'merge2048', 'magicswap', 'binairo', 'onestroke',
    'colorlink', 'starbattle', 'masyu', 'nonogram', 'two_sided_poker', 'monorail', 'four_three', 'flip_omok', 'nine_mens_morris',
    'wallgo2', 'slitherlink', 'gyulhap', 'indian_poker', 'wallgo', 'heavy13', 'janggi', 'russian_janggi', 'russian_roulette',
    'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'hexagon', 'piggy_bank', 'sudoku'];
  no_hall text[] := array['nemo_count', 'gyulhap', 'slitherlink', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048'];
begin
  select coalesce(jsonb_object_agg(s.game, s.user_id), '{}'::jsonb) into v_hall
    from (select distinct on (h.game) h.game, h.user_id from public.hall_ranking() h where h.rn = 1 order by h.game, h.rn, h.user_id) s;
  foreach g in array games loop
    v_uid := null;
    v_board := case g when 'slitherlink' then 'slither' when 'binairo' then 'binairo' when 'onestroke' then 'onestroke'
      when 'colorlink' then 'colorlink' when 'magicswap' then 'magicswap' when 'starbattle' then 'starbattle'
      when 'masyu' then 'masyu' when 'nonogram' then 'nonogram' when 'merge2048' then 'merge2048' end;
    if v_board is not null then
      select c.user_id into v_uid from public.challenge_rows(v_board) c where c.rnk = 1 order by c.sub nulls last, c.user_id limit 1;
    elsif g = 'nemo_count' then
      foreach d in array array['hard', 'normal', 'easy'] loop
        select b.user_id into v_uid from (
          select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
            from public.game_results r
           where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = d and (r.detail ->> 'correct') ~ '^[0-9]+$'
             and not (r.detail ? 'voided')
           order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
        ) b join public.profiles p on p.id = b.user_id
         where p.show_in_hall and b.correct > 0
         order by b.correct desc, b.avg_ms asc nulls last, b.played_at limit 1;
        exit when v_uid is not null;
      end loop;
      if v_uid is null then select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1; end if;
    else
      if not (g = any(no_hall)) then v_uid := (v_hall ->> g)::uuid; end if;
      if v_uid is null and g <> 'sudoku' then
        select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1;
      end if;
    end if;

    select c.user_id into v_cur from public.game_crowns c where c.game = g;
    if v_uid is not distinct from v_cur then continue; end if;
    if v_cur is not null then
      update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-' || g and revoked_at is null;
    end if;
    if v_uid is null then
      delete from public.game_crowns where game = g;
    else
      insert into public.game_crowns (game, user_id, since) values (g, v_uid, now())
      on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
      perform public.grant_icon(v_uid, 'c-' || g);
    end if;
  end loop;
end; $function$;
revoke all on function public.refresh_game_crowns() from public, anon, authenticated;

-- Who holds each game's #1 icon now (by nickname).
CREATE OR REPLACE FUNCTION public.game_crowns_public()
 RETURNS TABLE(game text, nickname text, since timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select c.game, coalesce(nullif(p.nickname, ''), 'Player'), c.since
    from public.game_crowns c join public.profiles p on p.id = c.user_id
   order by c.game;
$function$;

-- Every 5 minutes.
CREATE OR REPLACE FUNCTION public.icon_tick()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.finalize_piece_weeks();
  perform public.finalize_hell_weeks();
  perform public.refresh_game_crowns();
end; $function$;
revoke all on function public.icon_tick() from public, anon, authenticated;

-- ─── Backfill (order matters: the last icon given becomes the stone, so 1W champions keep their champion stone) ──

select public.refresh_game_crowns();
select public.grant_icon(u.user_id, 'm2048')
  from (select distinct r.user_id from public.game_results r
         where r.game = 'merge2048' and r.user_id is not null
           and (r.detail ->> 'max') ~ '^[0-9]{1,7}$' and (r.detail ->> 'max')::int >= 2048) u;
select public.grant_icon(f.user_id, 'w' || f.week || '-' || f.rank)
  from (select * from public.piece_race_final where rank <= 3 order by week, rank desc) f;

select cron.unschedule(jobid) from cron.job where jobname = 'icon-tick';
select cron.schedule('icon-tick', '*/5 * * * *', 'select public.icon_tick()');

grant execute on function public.my_stone_options() to authenticated;
grant execute on function public.set_my_stone(text) to authenticated;
grant execute on function public.stone_choices_public() to anon, authenticated;
grant execute on function public.my_new_icons() to authenticated;
grant execute on function public.mark_icons_seen(text[]) to authenticated;
grant execute on function public.claim_icon_2048() to authenticated;
revoke execute on function public.my_new_icons() from anon;
revoke execute on function public.mark_icons_seen(text[]) from anon;
revoke execute on function public.claim_icon_2048() from anon;
grant execute on function public.black_piece_ranking(integer) to anon, authenticated;
grant execute on function public.black_piece_final_board(integer, integer) to anon, authenticated;
grant execute on function public.game_crowns_public() to anon, authenticated;

notify pgrst, 'reload schema';
