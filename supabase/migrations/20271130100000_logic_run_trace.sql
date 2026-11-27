-- 로직 챌린지 (마슈 · 노노그램 · 스타배틀 · 비나이로 · 한붓길 · 컬러 잇기 · 마방진 스왑): keep each run's input trace, the
-- 슬리더링크 way, so a record can be reviewed later for automation (scripts/logic/suspects.sh). Recording only:
-- every check in logic_finish stays as it was, and the trace never fails or flags a run.
-- logic_finish takes two new optional parameters, so the client from before keeps working:
--   p_trace   steps: [{ c: [[cell or edge, value], ...], t: ms since start, u?: 1 undo, w?: 1 clear-all, d?: 1 same drag }, ...]
--   p_signals behavioural counts the client works out at the end (src/lib/logicTrace.ts)
-- The old three-argument function is dropped so a call naming only p_run / p_steps / p_away is not ambiguous.

alter table public.logic_runs add column if not exists steps jsonb;
alter table public.logic_runs add column if not exists signals jsonb;

drop function if exists public.logic_finish(uuid, jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.logic_finish(p_run uuid, p_steps jsonb, p_away jsonb DEFAULT '[]'::jsonb, p_trace jsonb DEFAULT NULL, p_signals jsonb DEFAULT NULL)
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
  ok := good and v_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= b.holder_ms + 1500);
  update public.logic_runs set finished_at = now(), ms = took, result = case when ok then 'clear' else 'fail' end, flag = v_flag,
         steps = v_trace, signals = v_signals where id = r.id;
  if ok and r.kind = 'new' and b.published_at is null then
    update public.logic_boards set published_at = now(), first_user = auth.uid(), first_ms = took, holder = auth.uid(), holder_ms = took where id = b.id;
  elsif ok and r.kind = 'beat' then
    if b.holder is not null and b.holder <> auth.uid() then
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = b.holder);
    end if;
    update public.logic_boards set holder = auth.uid(), holder_ms = least(took, b.holder_ms), takeovers = takeovers + 1 where id = b.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.logic_owner_rows(b.game) x where x.user_id = auth.uid();
    select count(*)::int into total from public.logic_owner_rows(b.game);
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', good and v_flag is not null, 'flag', v_flag, 'rival', rival_name, 'board', b.id);
end; $function$;

revoke all on function public.logic_finish(uuid, jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.logic_finish(uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
