-- 히든 워드: 라이어 — 토론 시간 연장 (owner 11/28): in the talk phase each player may press ⏱ +30 s once a game;
-- all of a game's extensions together add at most 90 s ('talkExtendCap'). Separate from the clue-turn ⏱ (hwl_extend).
-- Per-game stamps (talk_ext_game) instead of resets, so hwl_begin is untouched. hwl_view is redefined from
-- 20271210000000_hwl_liar_knows.sql (adds talkExtended per member / me and the room's talkExt seconds); hwl_cfg from
-- 20271209200000_hwl_rematch_invite.sql (adds talkExtend / talkExtendCap). Needs both of those first.
-- Test: scripts/hidden-word-liar/test_talk_extend.sql (scratch DB).

alter table public.hwl_members add column if not exists talk_ext_game int;   -- the game in which this seat used 토론 ⏱
alter table public.hwl_rooms add column if not exists talk_ext_game int;
alter table public.hwl_rooms add column if not exists talk_ext_secs int not null default 0;

create or replace function public.hwl_cfg()
returns jsonb language sql immutable as $$ select jsonb_build_object(
  'hot', 85,                       -- a clue this close to the answer shows as 85+ (its number hidden)
  'cards', 8, 'turn', 20, 'talk', 45, 'talkBig', 60, 'vote', 20, 'runoff', 15, 'last', 20, 'decide', 15, 'guess', 30,
  'again', 25, 'houseLobby', 25, 'revotes', 1, 'extend', 30,   -- ⏱ seconds a player may add to their own turn, once a game
  'talkExtend', 30, 'talkExtendCap', 90,   -- 토론 ⏱ +30 s: once a game per player, +90 s at most a game
  'readyWait', 10,                 -- 한 판 더: once 4 are ready, the rest get this long before it starts
  'revealBase', 4, 'revealSeat', 0.8, 'revealGuess', 2,   -- seconds of the end-of-game show
  'min', 4, 'max', 10, 'liarWin', 3, 'citizenWin', 1, 'dailyCap', 7   -- 피스 from this game per player per KST day (owner 11/28)
) $$;

-- 토론 ⏱ +30 s (owner 11/28): in the talk phase every player may add 30 s once a game; the game's talk time grows by
-- at most 'talkExtendCap' (90 s) in all, so a table cannot talk forever.
create or replace function public.hwl_talk_extend(p_code text, p_key text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; cfg jsonb := public.hwl_cfg(); used int;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or not m.playing or m.gone or r.phase <> 'talk' or r.deadline <= now() then return jsonb_build_object('error', 'turn'); end if;
  if m.talk_ext_game is not distinct from r.game_no then return jsonb_build_object('error', 'used'); end if;
  used := case when r.talk_ext_game = r.game_no then r.talk_ext_secs else 0 end;
  if used + (cfg ->> 'talkExtend')::int > (cfg ->> 'talkExtendCap')::int then return jsonb_build_object('error', 'cap'); end if;
  update public.hwl_members set talk_ext_game = r.game_no where code = p_code and seat = m.seat;
  update public.hwl_rooms set talk_ext_game = r.game_no, talk_ext_secs = used + (cfg ->> 'talkExtend')::int,
         deadline = deadline + make_interval(secs => (cfg ->> 'talkExtend')::int) where code = p_code;
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true, 'total', used + (cfg ->> 'talkExtend')::int);
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
    'talkExt', case when r.talk_ext_game = r.game_no then r.talk_ext_secs else 0 end,
    'accused', r.accused, 'excluded', to_jsonb(r.excluded), 'revotes', r.revotes, 'cfg', public.hwl_cfg(),
    'reveal', case when over and r.reveal_at is not null then jsonb_build_object(
      'at', floor(extract(epoch from r.reveal_at) * 1000), 'until', floor(extract(epoch from r.reveal_until) * 1000)) end,
    'me', case when m.seat is null then null else jsonb_build_object(
      'seat', m.seat, 'playing', m.playing, 'talkExtended', m.talk_ext_game is not distinct from r.game_no, 'maskUsed', m.mask_used, 'extended', m.extended, 'talk', m.talk, 'decide', m.decide, 'ready', m.ready,
      'piecesToday', case when m.uid is not null then public.hwl_pieces_today(m.uid) end,
      'liar', m.playing and m.seat = r.liar and (running or over),   -- only ever about the viewer themselves
      'word', case when m.playing and (running or over) and (m.seat <> r.liar or over) then r.answer end,
      'voted', (select v.target from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = m.seat)) end,
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'seat', x.seat, 'name', x.name, 'playing', x.playing, 'gone', x.gone, 'ready', x.ready, 'here', x.key_hash is not null,
        'member', x.uid is not null, 'talked', x.talk is not null, 'decided', x.decide is not null, 'mask', x.mask_used, 'extended', x.extended, 'talkExtended', x.talk_ext_game is not distinct from r.game_no,
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

revoke all on function public.hwl_talk_extend(text, text) from public;
grant execute on function public.hwl_talk_extend(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
