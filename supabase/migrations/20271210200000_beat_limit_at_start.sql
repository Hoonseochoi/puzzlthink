-- Map challenges (슬리더링크 and the logic puzzles): a beat run is judged against the record the player was shown when
-- it started, not the record at the moment it ends (owner report 11/28: someone else took the map meanwhile, and a run
-- inside the shown record was recorded as a fail: 97 슬리더링크 and 4 노노그램 runs).
-- Such a run is a clear; the map stays with whoever holds the faster record now (the result carries outrun / outrun_by).
alter table public.slither_runs add column if not exists limit_ms integer;
alter table public.logic_runs add column if not exists limit_ms integer;
-- open beat runs: the best guess at the record they were shown is the one standing now
update public.slither_runs r set limit_ms = c.holder_ms from public.slither_challenges c where c.id = r.challenge_id and r.kind = 'beat' and r.finished_at is null and r.limit_ms is null;
update public.logic_runs r set limit_ms = b.holder_ms from public.logic_boards b where b.id = r.board_id and r.kind = 'beat' and r.finished_at is null and r.limit_ms is null;

CREATE OR REPLACE FUNCTION public.logic_start_beat(p_board text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare b public.logic_boards; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into b from public.logic_boards where id = p_board and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if b.holder = auth.uid() then raise exception 'mine'; end if;
  if exists (select 1 from public.logic_runs r where r.board_id = b.id and r.user_id = auth.uid()) then raise exception 'tried'; end if;
  update public.logic_runs set finished_at = now(), result = 'fail' where user_id = auth.uid() and game = b.game and finished_at is null;
  update public.logic_boards set attempts = attempts + 1 where id = b.id;
  insert into public.logic_runs (board_id, game, user_id, kind, limit_ms) values (b.id, b.game, auth.uid(), 'beat', b.holder_ms) returning id into rid;
  return jsonb_build_object('run', rid, 'board', b.id, 'seed', b.seed, 'size', b.size, 'limit_ms', b.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = b.holder));
end; $function$;

CREATE OR REPLACE FUNCTION public.slither_start_beat(p_challenge text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare c public.slither_challenges; rid uuid;
begin
  if auth.uid() is null then raise exception 'sign_in'; end if;
  select * into c from public.slither_challenges where id = p_challenge and published_at is not null for update;
  if not found then raise exception 'not_found'; end if;
  if exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) then raise exception 'tried'; end if;
  update public.slither_challenges set attempts = attempts + 1 where id = c.id;
  insert into public.slither_runs (challenge_id, user_id, kind, limit_ms) values (c.id, auth.uid(), 'beat', c.holder_ms) returning id into rid;
  return jsonb_build_object('run', rid, 'challenge', c.id, 'seed', c.seed, 'dots', c.dots, 'limit_ms', c.holder_ms,
    'holder', (select coalesce(nullif(p.nickname, ''), 'Player') from public.profiles p where p.id = c.holder));
end; $function$;

CREATE OR REPLACE FUNCTION public.logic_finish(p_run uuid, p_steps jsonb, p_away jsonb DEFAULT '[]'::jsonb, p_trace jsonb DEFAULT NULL::jsonb, p_signals jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r public.logic_runs; b public.logic_boards; want text; took integer; marks smallint[]; st jsonb; i integer; v integer; t integer;
        last_t integer := 0; cells integer; start_cells smallint[]; fixed_text text; good boolean := false; v_flag text; exits integer := 0; ok boolean; place integer; total integer; mine integer; rival_name text;
        v_trace jsonb; v_signals jsonb; trace_n integer;
begin
  select * into r from public.logic_runs where id = p_run and user_id = auth.uid() and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into b from public.logic_boards where id = r.board_id for update;
  select lp.answer into want from public.logic_pool lp where lp.game = b.game and lp.seed = b.seed;
  if p_steps is not null and jsonb_typeof(p_steps) = 'array' and jsonb_array_length(p_steps) between 1 and 6000 and want is not null then
    -- 마방진 스왑: the pool keeps the scrambled start; the replay begins there and the cells hold 1…n².
    if b.game = 'magicswap' then
      start_cells := string_to_array(split_part(want, '|', 1), ',')::smallint[]; fixed_text := split_part(want, '|', 2);
      marks := start_cells; cells := b.size * b.size;
    else marks := array_fill(0::smallint, array[length(want)]); cells := length(want); end if;
    good := true;
    for st in select * from jsonb_array_elements(p_steps) loop
      if jsonb_typeof(st) <> 'array' or jsonb_array_length(st) <> 3 then good := false; exit; end if;
      i := (st ->> 0)::int; v := (st ->> 1)::int; t := (st ->> 2)::int;
      if i < 0 or i >= cells or (b.game = 'magicswap' and (v < 1 or v > cells)) or (b.game <> 'magicswap' and v not in (0, 1, 2)) or t < last_t or t > took + 2000 then good := false; exit; end if;
      marks[i + 1] := v; last_t := t;
    end loop;
    if good and b.game = 'magicswap' then
      -- The fixed tiles (after '|', 0-based) must still hold their starting numbers.
      good := public.magic_square_ok(marks, b.size)
        and not exists (select 1 from unnest(string_to_array(nullif(fixed_text, ''), ',')::int[]) f where marks[f + 1] is distinct from start_cells[f + 1]);
    elsif good then
      -- Answers with a '2' (비나이로's white stones) compare raw marks; elsewhere a ✕ (2) counts as empty.
      good := (select string_agg(case when m = 1 then '1' when m = 2 and position('2' in want) > 0 then '2' else '0' end, '' order by k) from unnest(marks) with ordinality u(m, k)) = want;
      -- 컬러 잇기: another filling that follows the rules counts too (some boards have more than one).
      if not good and b.game = 'colorlink' then good := public.colorlink_ok(marks, want, b.size); end if;
    end if;
    if good then
      select count(*) into exits from jsonb_array_elements(coalesce(p_away, '[]'::jsonb)) a
       where jsonb_typeof(a) = 'array' and (a ->> 1)::numeric - (a ->> 0)::numeric >= 2000;
      if took < public.logic_floor_ms(b.game) then v_flag := 'fast';
      elsif exits >= 3 and took < 20 * 60 * 1000 then v_flag := 'away'; end if;
    end if;
  end if;
  -- The input trace, kept for review only (it decides nothing): an array of at most 4,000 steps in 300,000 characters,
  -- signals an object in 8,000. Anything larger is cut or left out, and the signals say so.
  if p_trace is not null and jsonb_typeof(p_trace) = 'array' and length(p_trace::text) <= 300000 then
    trace_n := jsonb_array_length(p_trace);
    v_trace := case when trace_n > 4000 then (select jsonb_agg(e order by k) from jsonb_array_elements(p_trace) with ordinality x(e, k) where k <= 4000) else p_trace end;
  end if;
  if p_signals is not null and jsonb_typeof(p_signals) = 'object' and length(p_signals::text) <= 8000 then v_signals := p_signals; end if;
  if p_trace is not null and (v_trace is null or trace_n > 4000) then
    v_signals := coalesce(v_signals, '{}'::jsonb) || jsonb_build_object('serverCut', case when v_trace is null then 'refused' else 'cut' end);
  elsif p_signals is not null and v_signals is null then
    v_signals := jsonb_build_object('serverCut', 'signals');
  end if;
  ok := good and v_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= coalesce(r.limit_ms, b.holder_ms) + 1500);
  update public.logic_runs set finished_at = now(), ms = took, result = case when ok then 'clear' else 'fail' end, flag = v_flag,
         steps = v_trace, signals = v_signals where id = r.id;
  if ok and r.kind = 'new' and b.published_at is null then
    update public.logic_boards set published_at = now(), first_user = auth.uid(), first_ms = took, holder = auth.uid(), holder_ms = took where id = b.id;
  elsif ok and r.kind = 'beat' and took <= b.holder_ms + 1500 then
    if b.holder is not null and b.holder <> auth.uid() then
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = b.holder);
    end if;
    update public.logic_boards set holder = auth.uid(), holder_ms = least(took, b.holder_ms), takeovers = takeovers + 1 where id = b.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.logic_owner_rows(b.game) x where x.user_id = auth.uid();
    select count(*)::int into total from public.logic_owner_rows(b.game);
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', good and v_flag is not null, 'flag', v_flag, 'rival', rival_name, 'board', b.id,
    'outrun', ok and r.kind = 'beat' and took > b.holder_ms + 1500,
    'outrun_by', case when ok and r.kind = 'beat' and took > b.holder_ms + 1500 then (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = b.holder) end, 'outrun_ms', case when ok and r.kind = 'beat' and took > b.holder_ms + 1500 then b.holder_ms end);
end; $function$;

CREATE OR REPLACE FUNCTION public.slither_finish_checked(p_run uuid, p_user uuid, p_cleared boolean, p_hints integer, p_flag text, p_marks integer, p_erases integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer; mine integer;
        rival uuid; rival_name text; took_n integer; lost_n integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = p_user and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  -- a hint that was not paid for (an older page): take the piece now if the player has one
  if coalesce(p_hints, 0) > 0 and not exists (select 1 from public.piece_spends x where x.ref = r.id and x.reason = 'slither_hint')
     and public.piece_balance(p_user) >= 1 then
    insert into public.piece_spends (user_id, reason, ref) values (p_user, 'slither_hint', r.id);
  end if;
  ok := p_cleared and p_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= coalesce(r.limit_ms, c.holder_ms) + 1500);
  update public.slither_runs
     set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end,
         flag = case when p_cleared then p_flag end, mark_moves = p_marks, erase_moves = p_erases
   where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = p_user, first_ms = took, holder = p_user, holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' and took <= c.holder_ms + 1500 then
    rival := c.holder;
    if rival is not null and rival <> p_user then
      insert into public.slither_takeovers (challenge_id, taker, loser) values (c.id, p_user, rival);
      took_n := public.slither_took(p_user, rival);
      lost_n := public.slither_took(rival, p_user);
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = rival);
    end if;
    update public.slither_challenges set holder = p_user, holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.slither_owner_rows() x where x.user_id = p_user;
    select count(*)::int into total from public.slither_owner_rows();
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', p_cleared and p_flag is not null, 'flag', case when p_cleared then p_flag end,
    'rival', rival_name, 'took_n', took_n, 'lost_n', lost_n,
    'outrun', ok and r.kind = 'beat' and took > c.holder_ms + 1500,
    'outrun_by', case when ok and r.kind = 'beat' and took > c.holder_ms + 1500 then (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = c.holder) end, 'outrun_ms', case when ok and r.kind = 'beat' and took > c.holder_ms + 1500 then c.holder_ms end);
end; $function$;
