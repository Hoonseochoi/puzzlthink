-- SCRATCH DATABASE ONLY (hwl_dev, after test_games.sql made the bot users): the liar knows and has no word, and never
-- speaks first. Run after applying 20271210000000_hwl_liar_knows.sql there:
--   docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_liar_knows.sql
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'lkkey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;

do $$
declare c text; r public.hwl_rooms; v jsonb; res jsonb; liar_first int := 0; firsts int[] := '{0,0,0,0,0,0}'; liars int[] := '{0,0,0,0,0,0}'; n int := 6; deals int := 600;
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  c := public.hwl_create(pg_temp.key(1), '봇1') ->> 'code';
  for i in 2..n loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_join(c, pg_temp.key(i), '봇' || i); end loop;

  -- A. over many deals the liar is never first, the order is a full shuffle, and both the liar and the first seat vary
  for d in 1..deals loop
    perform public.hwl_begin(c, array[0,1,2,3,4,5]::smallint[]);
    select * into r from public.hwl_rooms where code = c;
    if r.turn_order[1] = r.liar then liar_first := liar_first + 1; end if;
    if (select array_agg(x order by x) from unnest(r.turn_order) x) <> array[0,1,2,3,4,5]::smallint[] then raise exception 'A: not a permutation %', r.turn_order; end if;
    if r.decoy is not null then raise exception 'A: a decoy was dealt'; end if;
    firsts[r.turn_order[1] + 1] := firsts[r.turn_order[1] + 1] + 1;
    liars[r.liar + 1] := liars[r.liar + 1] + 1;
  end loop;
  if liar_first > 0 then raise exception 'A: the liar spoke first % times', liar_first; end if;
  if (select min(x) from unnest(firsts) x) < deals / n / 3 or (select min(x) from unnest(liars) x) < deals / n / 3 then raise exception 'A: not random enough % %', firsts, liars; end if;
  raise notice 'A ok: % deals, liar never first; first seats % liars %', deals, firsts, liars;

  -- B. views: the liar knows and has no word; citizens get the word and no liar identity
  select * into r from public.hwl_rooms where code = c;
  for s in 0..n - 1 loop
    perform pg_temp.as_user(pg_temp.uid(s + 1));
    v := public.hwl_view(c, pg_temp.key(s + 1));
    if v -> 'liar' <> 'null'::jsonb then raise exception 'B: liar seat in the view'; end if;
    if s = r.liar then
      if not (v -> 'me' ->> 'liar')::boolean or v -> 'me' ->> 'word' is not null then raise exception 'B: liar view %', v -> 'me'; end if;
      if v::text like '%' || r.answer || '%' then raise exception 'B: answer leaked to the liar'; end if;
    else
      if (v -> 'me' ->> 'liar')::boolean or v -> 'me' ->> 'word' <> r.answer then raise exception 'B: citizen view %', v -> 'me'; end if;
    end if;
  end loop;
  raise notice 'B ok: liar view has no word (me.liar only for themselves), citizen views name no liar';

  -- C. chat: a citizen writing the answer is refused; the liar writing it is hidden from the others
  update public.hwl_rooms set phase = 'talk', deadline = now() + interval '40 seconds' where code = c;
  perform pg_temp.as_user(pg_temp.uid(((r.liar + 1) % n) + 1));
  res := public.hwl_chat(c, pg_temp.key(((r.liar + 1) % n) + 1), r.answer || '를 말하면 안 되지');
  if res ->> 'error' <> 'word' then raise exception 'C: citizen answer %', res; end if;
  perform pg_temp.as_user(pg_temp.uid(r.liar + 1));
  res := public.hwl_chat(c, pg_temp.key(r.liar + 1), '혹시 ' || r.answer || '?');
  if (res ->> 'ok') is null then raise exception 'C: liar line refused %', res; end if;
  perform pg_temp.as_user(pg_temp.uid(((r.liar + 1) % n) + 1));
  v := public.hwl_chat_since(c, pg_temp.key(((r.liar + 1) % n) + 1), 0);
  if v -> -1 ->> 'text' is not null then raise exception 'C: the liar''s answer line shown to a citizen'; end if;
  raise notice 'C ok: citizen answer refused, liar answer hidden';

  -- D. clues: the liar has no own-word rule (any noun goes, scored against the answer); a citizen still cannot say theirs
  update public.hwl_rooms set phase = 'clue', pos = (select array_position(turn_order, liar) - 1 from public.hwl_rooms where code = c), deadline = now() + interval '20 seconds' where code = c;
  perform pg_temp.as_user(pg_temp.uid(r.liar + 1));
  res := public.hwl_clue(c, pg_temp.key(r.liar + 1), '사람', false);
  if (res ->> 'ok') is null then raise exception 'D: liar clue %', res; end if;
  update public.hwl_rooms set phase = 'clue', pos = 0, deadline = now() + interval '20 seconds' where code = c;   -- seat 1 of the order: never the liar
  select * into r from public.hwl_rooms where code = c;
  perform pg_temp.as_user(pg_temp.uid(r.turn_order[1] + 1));
  res := public.hwl_clue(c, pg_temp.key(r.turn_order[1] + 1), r.answer, false);
  if res ->> 'error' <> 'own' then raise exception 'D: citizen own word %', res; end if;
  raise notice 'D ok: liar clue accepted, citizen own word refused';
end $$;
