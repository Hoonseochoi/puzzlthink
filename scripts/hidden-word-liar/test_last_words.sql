-- SCRATCH DATABASE ONLY (e.g. hwl_dev, after test_games.sql made the bot users): 최후의 발언 → 검거, 다시 투표 → 풀어 주기,
-- the reveal clock, and the chat filter. Run after applying 20271209000000_hwl_last_words.sql there:
--   docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_last_words.sql
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'lwkey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
-- a 5-player room at the vote
create or replace function pg_temp.room() returns text language plpgsql as $$
declare c text;
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  c := public.hwl_create(pg_temp.key(1), '봇1') ->> 'code';
  for i in 2..5 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_join(c, pg_temp.key(i), '봇' || i); end loop;
  perform pg_temp.as_user(pg_temp.uid(1)); perform public.hwl_start(c, pg_temp.key(1));
  update public.hwl_rooms set phase = 'vote', deadline = now() + interval '20 seconds', round = 2 where code = c;
  return c;
end $$;
create or replace function pg_temp.seat_key(c text, s int) returns text language sql as $$ select pg_temp.key(s + 1) $$;   -- seat n = bot n+1
create or replace function pg_temp.all_vote(c text, target int) returns void language plpgsql as $$
begin
  for s in 0..4 loop
    perform pg_temp.as_user(pg_temp.uid(s + 1));
    if s <> target then perform public.hwl_vote(c, pg_temp.seat_key(c, s), target);
    else perform public.hwl_vote(c, pg_temp.seat_key(c, s), (select x from generate_series(0, 4) x
                   where x <> s and not (x::smallint = any ((select excluded from public.hwl_rooms where code = c)::smallint[])) order by x limit 1)); end if;   -- the target votes someone still allowed
  end loop;
end $$;
create or replace function pg_temp.all_decide(c text, choice text) returns void language plpgsql as $$
declare acc int := (select accused from public.hwl_rooms where code = c);
begin
  for s in 0..4 loop if s <> acc then perform pg_temp.as_user(pg_temp.uid(s + 1)); perform public.hwl_decide(c, pg_temp.seat_key(c, s), choice); end if; end loop;
end $$;
create or replace function pg_temp.expire(c text) returns void language plpgsql as $$
begin update public.hwl_rooms set deadline = now() - interval '1 second' where code = c; perform public.hwl_tick(c); end $$;

do $$
declare c text; r public.hwl_rooms; liar int; cit int; cit2 int; res jsonb; v jsonb; secs numeric;
begin
  -- A. the liar is voted out → last words → decide 검거 → guess (missed) → citizens; the show blocks a new game
  c := pg_temp.room(); select * into r from public.hwl_rooms where code = c; liar := r.liar;
  perform pg_temp.all_vote(c, liar);
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'last' or r.accused <> liar then raise exception 'A: not last words (% %)', r.phase, r.accused; end if;
  secs := extract(epoch from r.deadline - now()); if secs < 19.5 or secs > 20.5 then raise exception 'A: last words clock %', secs; end if;
  perform pg_temp.as_user(pg_temp.uid(liar + 1));
  if public.hwl_decide(c, pg_temp.seat_key(c, liar), 'arrest') then raise exception 'A: decide during last words'; end if;
  perform pg_temp.expire(c);
  select * into r from public.hwl_rooms where code = c; if r.phase <> 'decide' then raise exception 'A: not decide %', r.phase; end if;
  if public.hwl_decide(c, pg_temp.seat_key(c, liar), 'revote') then raise exception 'A: the accused decided'; end if;
  perform pg_temp.all_decide(c, 'arrest');
  select * into r from public.hwl_rooms where code = c; if r.phase <> 'guess' then raise exception 'A: not guess %', r.phase; end if;
  perform pg_temp.as_user(pg_temp.uid(liar + 1));
  res := public.hwl_guess(c, pg_temp.seat_key(c, liar), '사람');
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'done' or r.outcome <> 'citizens' or r.reason <> 'missed' then raise exception 'A: result % % %', r.phase, r.outcome, r.reason; end if;
  secs := extract(epoch from r.reveal_until - r.reveal_at); if secs <> 4 + 0.8 * 5 + 2 then raise exception 'A: reveal %', secs; end if;
  perform pg_temp.as_user(pg_temp.uid(1));
  if public.hwl_start(c, pg_temp.key(1)) ->> 'error' <> 'reveal' then raise exception 'A: started during the show'; end if;
  v := public.hwl_view(c, pg_temp.key(1));
  if v -> 'reveal' -> 'until' is null then raise exception 'A: no reveal in view'; end if;
  raise notice 'A ok: last words → 검거 → guess missed → citizens, show % s, start refused', secs;

  -- B. a citizen voted out → 다시 투표 (they are excluded) → another citizen → 풀어 주기 → the liar wins (released)
  c := pg_temp.room(); select * into r from public.hwl_rooms where code = c; liar := r.liar;
  cit := (liar + 1) % 5; cit2 := (liar + 2) % 5;
  perform pg_temp.all_vote(c, cit); perform pg_temp.expire(c);
  perform pg_temp.all_decide(c, 'revote');
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'vote' or r.revotes <> 1 or not (cit::smallint = any (r.excluded)) then raise exception 'B: no re-vote (% % %)', r.phase, r.revotes, r.excluded; end if;
  perform pg_temp.as_user(pg_temp.uid(cit2 + 1));
  if public.hwl_vote(c, pg_temp.seat_key(c, cit2), cit) then raise exception 'B: voted for an excluded player'; end if;
  perform pg_temp.all_vote(c, cit2);
  select * into r from public.hwl_rooms where code = c; if r.phase <> 'last' or r.accused <> cit2 then raise exception 'B: second last words'; end if;
  perform pg_temp.expire(c);
  perform pg_temp.all_decide(c, 'revote');
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'done' or r.outcome <> 'liar' or r.reason <> 'released' then raise exception 'B: result % % %', r.phase, r.outcome, r.reason; end if;
  raise notice 'B ok: 다시 투표 once (excluded), then 풀어 주기 → liar wins (released)';

  -- B2. a citizen arrested → the liar wins (wrong); a tie in decide counts as 다시 투표
  c := pg_temp.room(); select * into r from public.hwl_rooms where code = c; liar := r.liar; cit := (liar + 1) % 5;
  perform pg_temp.all_vote(c, cit); perform pg_temp.expire(c);
  perform pg_temp.expire(c);   -- nobody chose: 0 – 0 → re-vote
  select * into r from public.hwl_rooms where code = c; if r.phase <> 'vote' then raise exception 'B2: 0-0 did not re-vote (%)', r.phase; end if;
  cit2 := (liar + 2) % 5;
  perform pg_temp.all_vote(c, cit2); perform pg_temp.expire(c);
  perform pg_temp.all_decide(c, 'arrest');
  select * into r from public.hwl_rooms where code = c;
  if r.outcome <> 'liar' or r.reason <> 'wrong' then raise exception 'B2: % %', r.outcome, r.reason; end if;
  raise notice 'B2 ok: nobody chose → re-vote; a citizen arrested → liar wins (wrong)';

  -- C. chat filter
  c := pg_temp.room(); select * into r from public.hwl_rooms where code = c; liar := r.liar; cit := (liar + 1) % 5;
  perform pg_temp.as_user(pg_temp.uid(cit + 1));
  res := public.hwl_chat(c, pg_temp.seat_key(c, cit), '혹시 ' || r.answer || '를 좋아해?');
  if res ->> 'error' <> 'word' then raise exception 'C: own word with a particle %', res; end if;
  res := public.hwl_chat(c, pg_temp.seat_key(c, cit), regexp_replace(r.answer, '(.)', '\1 ', 'g'));
  if res ->> 'error' <> 'word' then raise exception 'C: spaced own word %', res; end if;
  res := public.hwl_chat(c, pg_temp.seat_key(c, cit), '수상한데');
  if (res ->> 'ok') is null then raise exception 'C: plain chat %', res; end if;
  perform pg_temp.as_user(pg_temp.uid(liar + 1));
  res := public.hwl_chat(c, pg_temp.seat_key(c, liar), r.answer || '?');   -- the liar says the answer: no error back (that would tell them)
  if (res ->> 'ok') is null then raise exception 'C: liar answer refused %', res; end if;
  v := public.hwl_chat_since(c, pg_temp.seat_key(c, liar), 0);
  if v -> -1 ->> 'text' is null then raise exception 'C: sender lost their own line'; end if;
  perform pg_temp.as_user(pg_temp.uid(cit + 1));
  v := public.hwl_chat_since(c, pg_temp.seat_key(c, cit), 0);
  if v -> -1 ->> 'text' is not null then raise exception 'C: hidden line shown to others: %', v -> -1; end if;
  if v -> 0 ->> 'text' <> '수상한데' then raise exception 'C: plain line %', v -> 0; end if;
  res := public.hwl_chat(c, pg_temp.seat_key(c, cit), '수상한데');
  if res ->> 'error' <> 'fast' then raise exception 'C: flood %', res; end if;
  -- D. no repeated clue, even with a particle or spaces
  update public.hwl_rooms set phase = 'clue', pos = 0, deadline = now() + interval '20 seconds' where code = c;
  select * into r from public.hwl_rooms where code = c;
  perform pg_temp.as_user(pg_temp.uid(r.turn_order[1] + 1));
  res := public.hwl_clue(c, pg_temp.seat_key(c, r.turn_order[1]), '사람', false);
  if (res ->> 'ok') is null then raise exception 'D: first clue %', res; end if;
  perform pg_temp.as_user(pg_temp.uid(r.turn_order[2] + 1));
  res := public.hwl_clue(c, pg_temp.seat_key(c, r.turn_order[2]), ' 사 람을 ', false);
  if res ->> 'error' <> 'dup' then raise exception 'D: repeat with a particle %', res; end if;
  if public.hwl_clue_word('고양이') <> '고양이' or public.hwl_clue_word('바다에서') <> '바다' then raise exception 'D: particles % %', public.hwl_clue_word('고양이'), public.hwl_clue_word('바다에서'); end if;
  -- E. ⏱ +30 s: only on my turn, only once a game
  select * into r from public.hwl_rooms where code = c;
  perform pg_temp.as_user(pg_temp.uid(r.turn_order[r.pos + 2] + 1));
  res := public.hwl_extend(c, pg_temp.seat_key(c, r.turn_order[r.pos + 2]));
  if res ->> 'error' <> 'turn' then raise exception 'E: extended off-turn %', res; end if;
  perform pg_temp.as_user(pg_temp.uid(r.turn_order[r.pos + 1] + 1));
  secs := extract(epoch from r.deadline - now());
  res := public.hwl_extend(c, pg_temp.seat_key(c, r.turn_order[r.pos + 1]));
  if (res ->> 'ok') is null then raise exception 'E: extend %', res; end if;
  if extract(epoch from (select deadline from public.hwl_rooms where code = c) - now()) < secs + 29 then raise exception 'E: deadline not moved'; end if;
  res := public.hwl_extend(c, pg_temp.seat_key(c, r.turn_order[r.pos + 1]));
  if res ->> 'error' <> 'used' then raise exception 'E: second extend %', res; end if;
  v := public.hwl_view(c, pg_temp.seat_key(c, r.turn_order[r.pos + 1]));
  if not (v -> 'me' ->> 'extended')::boolean then raise exception 'E: view'; end if;
  raise notice 'E ok: +30 s once on my turn; off-turn and second time refused';
  raise notice 'D ok: 사람 then " 사 람을 " → dup; 고양이 kept, 바다에서 → 바다';
  raise notice 'C ok: own word refused (particle, spaces), other word hidden from others only, flood held';
end $$;
