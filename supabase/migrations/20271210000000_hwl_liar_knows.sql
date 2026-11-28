-- 히든 워드: 라이어 — the liar knows (owner 11/28): the liar is told "당신은 라이어입니다" and is dealt no word at all
-- (hwl_rooms.decoy stays null; the liar's browser never receives a word: me.word is null and me.liar = true, for the
-- viewer only). Their clues still score against the citizens' word. And the liar never speaks first: hwl_begin swaps
-- the liar out of the first place of the turn order (the same order every round), the rest stays random.
-- Redefined from 20271209000000_hwl_last_words.sql: hwl_begin, hwl_view, hwl_clue (own-word rule for citizens only),
-- hwl_chat (a citizen's line with the answer is refused; the liar's line with it is hidden from the others).
-- Test: scripts/hidden-word-liar/test_liar_knows.sql (scratch DB). Undo: re-run the four functions from 20271209000000.

create or replace function public.hwl_begin(p_code text, p_seats smallint[])
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; cfg jsonb := public.hwl_cfg(); a text; cl text; d text; n int := coalesce(array_length(p_seats, 1), 0); lr smallint; ord smallint[]; k int;
begin
  select * into r from public.hwl_rooms where code = p_code;
  select t.word, t.cluster into a, cl from public.hw_targets t
   where t.cluster not in ('한글자', '원작', '시간') and not (t.word = any (r.recent))
     and (select count(*) from public.hw_targets s where s.cluster = t.cluster) >= 3
   order by random() limit 1;
  if a is null then   -- every word used: start over
    update public.hwl_rooms set recent = '{}' where code = p_code;
    select t.word, t.cluster into a, cl from public.hw_targets t where t.cluster not in ('한글자', '원작', '시간') order by random() limit 1;
  end if;
  d := null;   -- the liar gets no word (owner 11/28): they know they are the liar
  lr := p_seats[1 + floor(random() * n)::int];
  ord := (select array_agg(x order by random()) from unnest(p_seats) x);
  if ord[1] = lr and n > 1 then   -- the liar never speaks first: swap them with a random later seat
    k := 2 + floor(random() * (n - 1))::int;
    ord[1] := ord[k]; ord[k] := lr;
  end if;
  update public.hwl_members set playing = seat = any (p_seats), ready = false, talk = null, decide = null, mask_used = false, extended = false, pieces = null,
         gone = case when seat = any (p_seats) then false else gone end
   where code = p_code;
  delete from public.hwl_clues where code = p_code and game_no <= r.game_no - 3;   -- keep a little history only
  delete from public.hwl_votes where code = p_code and game_no <= r.game_no - 3;
  update public.hwl_rooms set
    game_no = r.game_no + 1, phase = 'cards', deadline = now() + make_interval(secs => (cfg ->> 'cards')::int),
    answer = a, decoy = d, cluster = cl, liar = lr,
    turn_order = ord,
    round = 1, pos = 0, rounds_max = case when n <= 6 then 3 else 2 end,
    runoff = null, accused = null, outcome = null, reason = null, guess = null, valid = null,
    excluded = '{}', revotes = 0, reveal_at = null, reveal_until = null,
    recent = (r.recent || a)[greatest(1, array_length(r.recent || a, 1) - 40):]
   where code = p_code;
end $$;

create or replace function public.hwl_clue(p_code text, p_key text, p_word text, p_mask boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; w text := public.hwl_clue_word(p_word); own text; sc numeric; masked boolean;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  perform public.hwl_step(p_code);   -- a clock that already ran out comes first
  select * into r from public.hwl_rooms where code = p_code;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.phase <> 'clue' or r.turn_order[r.pos + 1] <> m.seat then return jsonb_build_object('error', 'turn'); end if;
  if w = '' or length(w) > 12 then return jsonb_build_object('error', 'empty'); end if;
  if not exists (select 1 from public.hw_vocab where word = w) then return jsonb_build_object('error', 'vocab'); end if;
  if exists (select 1 from public.hwl_clues where code = p_code and game_no = r.game_no and word = w) then return jsonb_build_object('error', 'dup'); end if;
  own := case when m.seat = r.liar then null else r.answer end;   -- citizens: not their word or part of it (the liar has none)
  if own is not null and (position(own in w) > 0 or position(w in own) > 0) then return jsonb_build_object('error', 'own'); end if;
  sc := coalesce(public.hw_score(r.answer, w), 0);
  masked := coalesce(p_mask, false) and not m.mask_used;
  insert into public.hwl_clues (code, game_no, n, seat, round, word, score, hot, masked)
  values (p_code, r.game_no, (select count(*) from public.hwl_clues where code = p_code and game_no = r.game_no), m.seat, r.round, w,
          sc, sc >= (public.hwl_cfg() ->> 'hot')::numeric, masked);
  if masked then update public.hwl_members set mask_used = true where code = p_code and seat = m.seat; end if;
  update public.hwl_rooms set pos = pos + 1 where code = p_code;
  perform public.hwl_settle_turn(p_code);
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.hwl_chat(p_code text, p_key text, p_text text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; t text; hid boolean := false; nid bigint;
begin
  select * into r from public.hwl_rooms where code = p_code;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null then return jsonb_build_object('error', 'member'); end if;
  t := left(btrim(regexp_replace(coalesce(p_text, ''), '[[:cntrl:][:space:]]+', ' ', 'g')), 100);
  if t = '' then return jsonb_build_object('error', 'empty'); end if;
  if exists (select 1 from public.hwl_chat c where c.code = p_code and c.seat = m.seat and c.at > now() - interval '700 milliseconds') then
    return jsonb_build_object('error', 'fast');
  end if;
  if (select count(*) from public.hwl_chat c where c.code = p_code and c.seat = m.seat and c.at > now() - interval '10 seconds') >= 5 then
    return jsonb_build_object('error', 'burst');
  end if;
  if (select count(*) = 2 and bool_and(x.body = t) from (select c.body from public.hwl_chat c where c.code = p_code and c.seat = m.seat order by c.id desc limit 2) x) then
    return jsonb_build_object('error', 'repeat');
  end if;
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess') then
    if m.playing and m.seat <> r.liar then
      if public.hwl_chat_hits(t, r.answer) then return jsonb_build_object('error', 'word'); end if;   -- a citizen's own word
    else
      hid := public.hwl_chat_hits(t, r.answer);   -- the liar (or someone watching) wrote the answer: hidden from the others
    end if;
  end if;
  insert into public.hwl_chat (code, seat, name, body, hidden) values (p_code, m.seat, m.name, t, hid) returning id into nid;
  delete from public.hwl_chat where code = p_code and id <= nid - 80;
  begin
    perform realtime.send(jsonb_build_object('id', nid), 'c', 'hwl-' || p_code, false);
  exception when others then null;
  end;
  return jsonb_build_object('ok', true, 'id', nid);
end $$;

create or replace function public.hwl_view(p_code text, p_key text)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; over boolean; running boolean;
begin
  select * into r from public.hwl_rooms where code = p_code;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  over := r.phase in ('done', 'closed') and r.game_no > 0;
  running := r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess');
  return jsonb_build_object(
    'code', r.code, 'kind', r.kind, 'v', r.v, 'phase', r.phase, 'now', floor(extract(epoch from now()) * 1000),
    'deadline', case when r.deadline is not null then floor(extract(epoch from r.deadline) * 1000) end,
    'game', r.game_no, 'round', r.round, 'roundsMax', r.rounds_max, 'order', to_jsonb(r.turn_order),
    'turn', case when r.phase = 'clue' then r.turn_order[r.pos + 1] end, 'host', r.host_seat, 'runoff', to_jsonb(r.runoff),
    'accused', r.accused, 'excluded', to_jsonb(r.excluded), 'revotes', r.revotes, 'cfg', public.hwl_cfg(),
    'reveal', case when over and r.reveal_at is not null then jsonb_build_object(
      'at', floor(extract(epoch from r.reveal_at) * 1000), 'until', floor(extract(epoch from r.reveal_until) * 1000)) end,
    'me', case when m.seat is null then null else jsonb_build_object(
      'seat', m.seat, 'playing', m.playing, 'maskUsed', m.mask_used, 'extended', m.extended, 'talk', m.talk, 'decide', m.decide, 'ready', m.ready,
      'piecesToday', case when m.uid is not null then public.hwl_pieces_today(m.uid) end,
      'liar', m.playing and m.seat = r.liar and (running or over),   -- only ever about the viewer themselves
      'word', case when m.playing and (running or over) and (m.seat <> r.liar or over) then r.answer end,
      'voted', (select v.target from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = m.seat)) end,
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'seat', x.seat, 'name', x.name, 'playing', x.playing, 'gone', x.gone, 'ready', x.ready, 'here', x.key_hash is not null,
        'member', x.uid is not null, 'talked', x.talk is not null, 'decided', x.decide is not null, 'mask', x.mask_used, 'extended', x.extended,
        'pieces', case when over then x.pieces end,
        'voted', exists (select 1 from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = x.seat)
      ) order by x.seat), '[]'::jsonb) from public.hwl_members x where x.code = p_code),
    'talk', (select jsonb_build_object('accuse', count(*) filter (where talk = 'accuse'), 'more', count(*) filter (where talk = 'more'))
               from public.hwl_members where code = p_code and playing and not gone),
    'decide', (select jsonb_build_object('arrest', count(*) filter (where decide = 'arrest'), 'revote', count(*) filter (where decide = 'revote'))
               from public.hwl_members where code = p_code and playing and not gone),
    'clues', (select coalesce(jsonb_agg(jsonb_build_object(
        'n', c.n, 'seat', c.seat, 'round', c.round, 'word', c.word, 'hot', c.hot, 'masked', c.masked,
        'score', case when c.word is null then null when over then c.score when c.masked then null when c.hot then null else c.score end,
        'decoyScore', null
      ) order by c.n), '[]'::jsonb) from public.hwl_clues c where c.code = p_code and c.game_no = r.game_no),
    'votes', case when r.phase not in ('vote', 'runoff') then (select coalesce(jsonb_agg(jsonb_build_object('stage', v.stage, 'seat', v.seat, 'target', v.target)), '[]'::jsonb)
                    from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no) end,
    'result', case when over then jsonb_build_object('outcome', r.outcome, 'reason', r.reason, 'answer', r.answer, 'decoy', r.decoy,
                    'liar', r.liar, 'guess', r.guess, 'valid', r.valid) end,
    'liar', case when r.phase = 'guess' or over then r.liar end
  );
end $$;

notify pgrst, 'reload schema';
