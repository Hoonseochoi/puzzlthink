-- Hotfix (owner report 11/28): a 공개방 (house) table closed after a game when fewer than 5 pressed 한 판 더 within
-- 25 s, though 4+ players were still seated. Now 4 ready is enough, and the room keeps waiting while 4+ remain.
CREATE OR REPLACE FUNCTION public.hwl_step(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.hwl_rooms; alive smallint[]; rdy smallint[];
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found or r.deadline is null or r.deadline > now() then return false; end if;
  if r.phase = 'lobby' then   -- house rooms only: start with whoever arrived
    select coalesce(array_agg(seat order by seat), '{}') into alive from public.hwl_members where code = p_code and key_hash is not null and not gone;
    delete from public.hwl_members where code = p_code and key_hash is null;
    if coalesce(array_length(alive, 1), 0) >= (public.hwl_cfg() ->> 'min')::int then perform public.hwl_begin(p_code, alive);
    else update public.hwl_rooms set phase = 'closed', deadline = null where code = p_code; end if;
  elsif r.phase = 'cards' then
    perform public.hwl_settle_turn(p_code);
  elsif r.phase = 'clue' then
    insert into public.hwl_clues (code, game_no, n, seat, round)
    values (p_code, r.game_no, (select count(*) from public.hwl_clues where code = p_code and game_no = r.game_no), r.turn_order[r.pos + 1], r.round);
    update public.hwl_rooms set pos = pos + 1 where code = p_code;
    perform public.hwl_settle_turn(p_code);
  elsif r.phase = 'talk' then
    perform public.hwl_after_talk(p_code);
  elsif r.phase in ('vote', 'runoff') then
    perform public.hwl_after_vote(p_code);
  elsif r.phase = 'last' then
    update public.hwl_members set decide = null where code = p_code;
    update public.hwl_rooms set phase = 'decide', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'decide')::int) where code = p_code;
  elsif r.phase = 'decide' then
    perform public.hwl_after_decide(p_code);
  elsif r.phase = 'guess' then
    perform public.hwl_finish(p_code, 'citizens', 'missed');
  elsif r.phase = 'done' and r.kind = 'house' then
    select coalesce(array_agg(seat order by seat), '{}') into rdy from public.hwl_members where code = p_code and ready and not gone;
    -- 4+ pressed 한 판 더 → play again. Otherwise keep waiting while 4+ are still here (up to 3 minutes after the
    -- game), so a slow table is not thrown out; close only when too few remain or the wait runs out.
    if coalesce(array_length(rdy, 1), 0) >= (public.hwl_cfg() ->> 'min')::int then perform public.hwl_begin(p_code, rdy);
    elsif (select count(*) from public.hwl_members where code = p_code and not gone) >= (public.hwl_cfg() ->> 'min')::int
          and now() < coalesce(r.reveal_until, now()) + interval '3 minutes' then
      update public.hwl_rooms set deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'again')::int) where code = p_code;
    else update public.hwl_rooms set phase = 'closed', deadline = null where code = p_code; end if;
  else
    return false;
  end if;
  -- too few left to play on: the game does not count
  select * into r from public.hwl_rooms where code = p_code;
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide') and coalesce(array_length(public.hwl_alive(p_code), 1), 0) < 3 then
    perform public.hwl_finish(p_code, 'void', 'void');
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $function$;
