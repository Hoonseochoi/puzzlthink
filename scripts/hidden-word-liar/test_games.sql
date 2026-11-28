-- SCRATCH DATABASE ONLY (e.g. hwl_dev): inserts fake auth.users / profiles and plays 5 whole 6-player games,
-- raising on any leak (liar seat, other players' words). Run after applying 20271205100000_hidden_word_liar.sql there:
--   docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_games.sql
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false), set_config('request.jwt.claim.sub', u::text, false) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'key-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
do $$ begin
  for i in 1..10 loop
    insert into auth.users (id, email) values (pg_temp.uid(i), 'bot' || i || '@x.test') on conflict do nothing;
    insert into public.profiles (id, nickname) values (pg_temp.uid(i), '봇' || i) on conflict (id) do nothing;
  end loop;
end $$;

-- play one game in a room; p_mode: 'catch-miss' (accuse liar, wrong guess), 'catch-hit' (liar guesses right), 'wrong' (accuse a citizen), 'tie'
create or replace function pg_temp.play(p_code text, n int, p_mode text) returns jsonb language plpgsql as $$
declare r public.hwl_rooms; v jsonb; seat int; w text; res jsonb; guard int := 0; i int; liar int; tgt int; words text[];
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  res := public.hwl_start(p_code, pg_temp.key(1));
  if res ? 'error' then raise exception 'start %', res; end if;
  -- leak checks on the cards
  select * into r from public.hwl_rooms where code = p_code;
  for i in 1..n loop
    perform pg_temp.as_user(pg_temp.uid(i));
    v := public.hwl_view(p_code, pg_temp.key(i));
    if v -> 'liar' <> 'null'::jsonb then raise exception 'liar seat leaked'; end if;
    if (v -> 'me' ->> 'seat')::int = r.liar then
      if v::text like '%' || r.answer || '%' then raise exception 'answer leaked to liar'; end if;
      if v -> 'me' ->> 'word' <> r.decoy then raise exception 'liar word'; end if;
    else
      if v::text like '%"' || r.decoy || '"%' then raise exception 'decoy leaked'; end if;
      if v -> 'me' ->> 'word' <> r.answer then raise exception 'citizen word'; end if;
    end if;
  end loop;
  update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code);
  loop
    guard := guard + 1; if guard > 400 then raise exception 'stuck'; end if;
    select * into r from public.hwl_rooms where code = p_code;
    exit when r.phase in ('done', 'closed');
    if r.phase = 'clue' then
      seat := r.turn_order[r.pos + 1];
      perform pg_temp.as_user(pg_temp.uid(seat + 1));
      -- a clue: a listed hint of the player's own word, or a silent turn now and then
      if random() < 0.1 then update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code); continue; end if;
      select h.word into w from public.hw_hints h where h.target = case when seat = r.liar then r.decoy else r.answer end
        and not exists (select 1 from public.hwl_clues c where c.code = p_code and c.game_no = r.game_no and c.word = h.word) order by random() limit 1;
      if w is null then select word into w from public.hw_vocab where idx = (random() * 70000)::int; end if;
      res := public.hwl_clue(p_code, pg_temp.key(seat + 1), w, random() < 0.15);
      if res ? 'error' then
        if res ->> 'error' not in ('own', 'vocab', 'dup') then raise exception 'clue % %', res, w; end if;
        res := public.hwl_clue(p_code, pg_temp.key(seat + 1), '사람', false);
        if res ? 'error' then update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code); end if;
      end if;
    elsif r.phase = 'talk' then
      for i in 1..n loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_talk(p_code, pg_temp.key(i), case when i % 2 = 0 then 'accuse' else 'more' end); end loop;
      select * into r from public.hwl_rooms where code = p_code;
      if r.phase = 'talk' then update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code); end if;
    elsif r.phase in ('vote', 'runoff') then
      liar := r.liar;
      for i in 1..n loop
        tgt := case p_mode when 'wrong' then (case when liar = 0 then 1 else 0 end) when 'tie' then (case when (i - 1) % 2 = 0 then (i) % n else (i - 2 + n) % n end) else liar end;
        if r.phase = 'runoff' and p_mode = 'tie' then tgt := case when i - 1 = r.runoff[1] then r.runoff[2] when i - 1 = r.runoff[2] then r.runoff[1] when i % 2 = 0 then r.runoff[1] else r.runoff[2] end; end if;
        if tgt = i - 1 then tgt := (i) % n; end if;
        perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_vote(p_code, pg_temp.key(i), tgt);
      end loop;
      select * into r from public.hwl_rooms where code = p_code;
      if r.phase in ('vote', 'runoff') then update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code); end if;
    elsif r.phase = 'guess' then
      perform pg_temp.as_user(pg_temp.uid(r.liar + 1));
      res := public.hwl_guess(p_code, pg_temp.key(r.liar + 1), case when p_mode = 'catch-hit' then r.answer else r.decoy end);
    else
      update public.hwl_rooms set deadline = now() where code = p_code; perform public.hwl_tick(p_code);
    end if;
  end loop;
  select * into r from public.hwl_rooms where code = p_code;
  perform pg_temp.as_user(pg_temp.uid(1));
  v := public.hwl_view(p_code, pg_temp.key(1));
  return jsonb_build_object('mode', p_mode, 'outcome', r.outcome, 'reason', r.reason, 'valid', r.valid, 'rounds', r.round, 'answer', r.answer, 'decoy', r.decoy,
    'clues', (select string_agg(coalesce(word, '…') || ':' || coalesce(score::text, '-') || case when hot then '🔥' else '' end || case when masked then '🎭' else '' end, ' ' order by c.n) from public.hwl_clues c where c.code = p_code and c.game_no = r.game_no),
    'pieces', (select jsonb_agg(mm.pieces order by mm.seat) from public.hwl_members mm where mm. code = p_code));
end $$;

do $$
declare c text; res jsonb; n int := 6; m text;
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  c := public.hwl_create(pg_temp.key(1), 'x') ->> 'code';
  for i in 2..n loop perform pg_temp.as_user(pg_temp.uid(i)); res := public.hwl_join(c, pg_temp.key(i), 'x'); if res ? 'error' then raise exception 'join %', res; end if; end loop;
  foreach m in array array['catch-miss', 'catch-hit', 'wrong', 'tie', 'catch-miss'] loop
    raise notice '%', pg_temp.play(c, n, m);
  end loop;
end $$;
select game, result, detail ->> 'role' role, count(*) from game_results where game = 'hidden_word_liar' group by 1,2,3 order by 1,2,3;
select source, user_id, amount from piece_grants order by user_id, source;
select user_id, icon from profile_icons where icon in ('lw', 'c-hidden_word_liar');
select * from hwl_ranking(10);
select outcome, reason, players, valid from hwl_results order by id;
