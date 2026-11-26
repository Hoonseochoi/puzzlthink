-- 히든워드: the second answer is no longer free. It costs one 피스 (the 피스 경쟁전 count), once per word.
-- A spent piece comes off the player's 경쟁전 count: the live ranking, the frozen final and the game all read it.

create table if not exists public.piece_spends (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null default 1 check (amount > 0),
  reason text not null,
  ref uuid,
  spent_at timestamptz not null default now()
);
create index if not exists piece_spends_user_idx on public.piece_spends (user_id, spent_at);
alter table public.piece_spends enable row level security;   -- written and read by the definer functions only

-- A player's 피스 left in the running 경쟁전 week: hard-AI wins (five per game) minus what was spent.
create or replace function public.piece_balance(p_user uuid)
 returns integer language sql stable security definer set search_path to 'public'
as $$
  select case when p_user is null then 0 else greatest(0, (
    select coalesce(sum(least(n, 5)), 0) from (
      select count(*) as n from public.game_results r
       where r.user_id = p_user and r.mode = 'ai' and r.result = 'win'
         and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
         and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
         and r.played_at >= timestamptz '2026-11-25 00:00:00+09' and r.played_at < timestamptz '2026-12-02 00:00:00+09'
       group by r.game) t
  ) - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = p_user and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0))::int end;
$$;
revoke all on function public.piece_balance(uuid) from public, anon, authenticated;

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
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0)::bigint as pieces, e.per_game, e.last_win from (
      select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
        from wins w group by w.user_id) e
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  ), prev_totals as (
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09' and x.spent_at < e.t), 0)::bigint as pieces, e.last_win from (
      select h.user_id, count(*)::bigint as pieces, max(h.played_at) as last_win, c.t
        from hard h, cutoff c
       where h.nth <= 5 and h.played_at < c.t
       group by h.user_id, c.t) e
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), y.rn::integer
    from ranked k join public.profiles p on p.id = k.user_id
    left join prev_ranked y on y.user_id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$function$;

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
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0)::bigint as pieces, e.per_game, e.last_win from (
      select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win from wins w group by w.user_id) e
  )
  select 2, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
    from totals t join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.pieces > 0
  on conflict (week, rank) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece', 2);
  for r in select f.user_id, f.rank from public.piece_race_final f where f.week = 2 and f.rank <= 3 order by f.rank desc loop
    perform public.grant_icon(r.user_id, 'w2-' || r.rank);
  end loop;
end; $function$;

CREATE OR REPLACE FUNCTION public.hw_view(p_id uuid, s jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select (s - 'aiWords' - 'seed' - 'envelopes')
      || jsonb_build_object('id', p_id, 'now', (extract(epoch from clock_timestamp()) * 1000)::bigint, 'cfg', public.hw_cfg() - 'aiNoise' - 'aiBase' - 'aiGap')
      || jsonb_build_object('pieces', public.piece_balance(auth.uid()))
      || case when s -> 't' ->> 'kind' = 'guess' and s ->> 'phase' = 'guess' then jsonb_build_object('t', (s -> 't') - 'word') else '{}'::jsonb end
$function$;

CREATE OR REPLACE FUNCTION public.hw_act(p_game uuid, p_action jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  cfg jsonb := public.hw_cfg();
  g public.hw_games; s jsonb; t jsonb; kind text := p_action ->> 't'; phase text;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  mult int; stage int; w text; ws text[]; sc numeric; late boolean; closed boolean; ok boolean;
  hand jsonb; clues jsonb; banned text[]; used text[]; sims jsonb; n int;
begin
  select * into g from public.hw_games where id = p_game for update;
  if not found or (g.user_id is not null and g.user_id is distinct from auth.uid()) then
    return jsonb_build_object('error', 'missing');
  end if;
  s := g.state; t := s -> 't'; phase := s ->> 'phase'; mult := (s ->> 'round')::int; stage := (t ->> 'stage')::int;
  late := (s ->> 'deadline') is not null and now_ms > (s ->> 'deadline')::bigint + 3000;

  if phase = 'envelope' and kind = 'envelope' then
    hand := s -> 'envelopes' -> (p_action ->> 'i')::int;
    if hand is null then return public.hw_view(g.id, s); end if;
    s := s || jsonb_build_object('hand', hand, 'envelope', (p_action ->> 'i')::int, 'aiWords', to_jsonb(array(
      select word from (select distinct on (cluster) word from public.hw_targets where not (hand ? word) order by cluster, random()) x
       order by random() limit 2)));
    s := public.hw_begin_turn(s, now_ms);
    perform public.count_play('hidden_word', 'ai');

  elsif phase = 'pick' and kind = 'pick' then
    w := p_action ->> 'word';
    if not (s -> 'hand' ? w) then return public.hw_view(g.id, s); end if;
    s := s || jsonb_build_object('hand', (s -> 'hand') - w, 'phase', 'hint', 'deadline', now_ms + (cfg ->> 'hintSecs')::int * 1000,
      't', t || jsonb_build_object('word', w));

  elsif phase = 'hint' and kind in ('hint', 'timeout') then
    if kind = 'timeout' and now_ms < (s ->> 'deadline')::bigint - 1500 then return public.hw_view(g.id, s); end if;
    closed := false;
    if kind = 'hint' and not late then
      w := normalize(btrim(coalesce(p_action ->> 'word', '')), NFC);
      if w !~ '^[가-힣]{1,8}$' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid'); end if;
      if w = t ->> 'word' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'secret'); end if;
      if exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w)
         or exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w) then
        return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate');
      end if;
      sc := public.hw_score(t ->> 'word', w);
      if sc is null then return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown'); end if;
      t := jsonb_set(t, '{hints}', (t -> 'hints') || jsonb_build_object('w', w, 's', sc, 'stage', stage, 'by', 'me'));
      closed := sc >= (cfg ->> 'cut')::numeric;
      select count(*) into n from jsonb_array_elements(t -> 'hints') h where (h ->> 'stage')::int = stage and h ->> 'by' = 'me';
    end if;
    if kind = 'hint' and not late and not closed and n < (cfg ->> 'maxHints')::int then
      s := s || jsonb_build_object('t', t);   -- the hint phase goes on
    else
      if not closed then   -- out of hints or time: the closest unused word of the list is revealed
        select h.word, h.score into w, sc from public.hw_hints h
         where h.target = t ->> 'word' and not exists (select 1 from jsonb_array_elements(t -> 'hints') x where x ->> 'w' = h.word)
         order by h.score desc, h.word limit 1;
        if w is not null then
          t := jsonb_set(t, '{hints}', (t -> 'hints') || jsonb_build_object('w', w, 's', sc, 'stage', stage, 'by', 'reveal'));
        end if;
      end if;
      -- the AI answers: every hint so far, and its own wrong answers with their shown %
      select coalesce(jsonb_agg(jsonb_build_object('w', h ->> 'w', 's', h -> 's')), '[]'::jsonb) into clues from jsonb_array_elements(t -> 'hints') h;
      select coalesce(array_agg(x.w), '{}') into banned from jsonb_array_elements(t -> 'guesses') gs, jsonb_array_elements_text(gs -> 'w') x(w);
      select clues || coalesce(jsonb_agg(jsonb_build_object('w', b, 's', public.hw_score(t ->> 'word', b))), '[]'::jsonb) into clues from unnest(banned) b;
      -- a word given as a hint cannot be the hidden word: the AI never answers one
      ws := public.hw_ai_guess(clues, banned || array(select h ->> 'w' from jsonb_array_elements(t -> 'hints') h), (s ->> 'seed')::int, (t ->> 'chance')::boolean and stage >= 2);
      ok := (t ->> 'word') = any (ws);
      select jsonb_agg(public.hw_score(t ->> 'word', x)) into sims from unnest(ws) x;
      t := jsonb_set(t, '{guesses}', (t -> 'guesses') || jsonb_build_object('w', to_jsonb(ws), 's', sims, 'stage', stage, 'by', 'ai', 'ok', ok));
      if array_length(ws, 1) > 1 then t := t || jsonb_build_object('chance', false); end if;
      if ok then
        n := (cfg -> 'guessPoints' ->> (stage - 1))::int * mult;
        t := t || jsonb_build_object('ai', (t ->> 'ai')::int + n, 'solved', stage);
        s := s || jsonb_build_object('ai', (s ->> 'ai')::int + n, 'phase', 'turnEnd', 'deadline', null, 't', t);
      else
        n := (cfg -> 'setPoints' ->> (stage - 1))::int * mult;
        t := t || jsonb_build_object('me', (t ->> 'me')::int + n);
        s := s || jsonb_build_object('me', (s ->> 'me')::int + n);
        if stage >= (cfg ->> 'stages')::int then
          s := s || jsonb_build_object('phase', 'turnEnd', 'deadline', null, 't', t || jsonb_build_object('solved', 0));
        else
          s := s || jsonb_build_object('deadline', now_ms + (cfg ->> 'hintSecs')::int * 1000 + 6000, 't', t || jsonb_build_object('stage', stage + 1));
        end if;
      end if;
    end if;

  elsif phase = 'guess' and kind in ('guess', 'timeout') then
    if kind = 'timeout' and now_ms < (s ->> 'deadline')::bigint - 1500 then return public.hw_view(g.id, s); end if;
    ws := '{}';
    if kind = 'guess' and not late then
      select coalesce(array_agg(normalize(btrim(x), NFC)), '{}') into ws from jsonb_array_elements_text(coalesce(p_action -> 'words', '[]'::jsonb)) x;
      n := coalesce(array_length(ws, 1), 0);
      if n < 1 or n > 2 or (n = 2 and (not (t ->> 'chance')::boolean or ws[1] = ws[2])) then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid'); end if;
      foreach w in array ws loop
        if w !~ '^[가-힣]{1,8}$' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid', 'word', w); end if;
        if exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w)
           or exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w) then   -- a hint is never the answer
          return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate', 'word', w);
        end if;
        if not exists (select 1 from public.hw_vocab v where v.word = w) then return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown', 'word', w); end if;
      end loop;
      if n = 2 then   -- the second answer costs one 피스 (signed-in players with a piece left)
        if auth.uid() is null or public.piece_balance(auth.uid()) < 1 then return public.hw_view(g.id, s) || jsonb_build_object('error', 'nopiece'); end if;
        insert into public.piece_spends (user_id, reason, ref) values (auth.uid(), 'hidden_word', g.id);
      end if;
    end if;
    ok := (t ->> 'word') = any (ws);
    select coalesce(jsonb_agg(public.hw_score(t ->> 'word', x)), '[]'::jsonb) into sims from unnest(ws) x;
    t := jsonb_set(t, '{guesses}', (t -> 'guesses') || jsonb_build_object('w', to_jsonb(ws), 's', sims, 'stage', stage, 'by', 'me', 'ok', ok));
    if array_length(ws, 1) > 1 then t := t || jsonb_build_object('chance', false); end if;
    if ok then
      n := (cfg -> 'guessPoints' ->> (stage - 1))::int * mult;
      t := t || jsonb_build_object('me', (t ->> 'me')::int + n, 'solved', stage);
      s := s || jsonb_build_object('me', (s ->> 'me')::int + n, 'phase', 'turnEnd', 'deadline', null, 't', t);
    else
      n := (cfg -> 'setPoints' ->> (stage - 1))::int * mult;
      t := t || jsonb_build_object('ai', (t ->> 'ai')::int + n);
      s := s || jsonb_build_object('ai', (s ->> 'ai')::int + n);
      if stage >= (cfg ->> 'stages')::int then
        s := s || jsonb_build_object('phase', 'turnEnd', 'deadline', null, 't', t || jsonb_build_object('solved', 0));
      else
        select coalesce(array_agg(h ->> 'w'), '{}') into used from jsonb_array_elements(t -> 'hints') h;
        t := t || jsonb_build_object('stage', stage + 1, 'hints', (t -> 'hints') || public.hw_ai_hints(t ->> 'word', stage + 1, used));
        s := s || jsonb_build_object('deadline', now_ms + (cfg ->> 'guessSecs')::int * 1000 + 6000, 't', t);
      end if;
    end if;

  elsif phase = 'turnEnd' and kind = 'next' then
    s := s || jsonb_build_object('history', (s -> 'history') || (t || jsonb_build_object('round', mult)));
    if (s ->> 'turnNo')::int = 0 then
      s := public.hw_begin_turn(s || jsonb_build_object('turnNo', 1), now_ms);
    elsif mult = 1 then
      s := public.hw_begin_turn(s || jsonb_build_object('round', 2, 'turnNo', 0), now_ms);
    else
      s := (s - 't') || jsonb_build_object('phase', 'over', 'deadline', null);
      -- a match started signed out counts for whoever finishes it signed in
      if exists (select 1 from public.profiles p where p.id = coalesce(g.user_id, auth.uid())) then
        insert into public.hw_results (game_id, user_id, points, ai_points) values (g.id, coalesce(g.user_id, auth.uid()), (s ->> 'me')::int, (s ->> 'ai')::int)
        on conflict do nothing;
        -- the shared records too: 내 기록, play history (needs 20271126020000_hidden_word_records.sql for the game id)
        insert into public.game_results (id, user_id, game, mode, result, detail)
        values (g.id, coalesce(g.user_id, auth.uid()), 'hidden_word', 'solo',
                case when (s ->> 'me')::int > (s ->> 'ai')::int then 'win' when (s ->> 'me')::int < (s ->> 'ai')::int then 'loss' else 'draw' end,
                jsonb_build_object('mode', 'match', 'score', (s ->> 'me')::int, 'ai', (s ->> 'ai')::int))
        on conflict do nothing;
        s := s || jsonb_build_object('recorded', true);
      end if;
    end if;

  else
    return public.hw_view(g.id, s);
  end if;

  update public.hw_games set state = s, updated_at = now() where id = g.id;
  return public.hw_view(g.id, s);
end $function$;

notify pgrst, 'reload schema';
