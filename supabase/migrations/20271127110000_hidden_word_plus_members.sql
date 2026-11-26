-- 히든 워드 확장판 (level 'plus') is for signed-in members only: starting an AI match or dealing a friend room of
-- that level without a session returns {error: 'login'}. 기본 is unchanged. Bodies are the live definitions
-- (20271127000000_hidden_word_levels.sql) with the one check added.
-- Rollback: re-run the hw_start and hw_room_deal definitions from 20271127000000_hidden_word_levels.sql.

CREATE OR REPLACE FUNCTION public.hw_start(p_level text DEFAULT 'basic'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare lv text := public.hw_level(p_level); d jsonb; s jsonb; gid uuid;
begin
  -- 히든 워드 확장판 is for signed-in members
  if lv = 'plus' and auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  delete from public.hw_games where updated_at < now() - interval '2 days';
  d := public.hw_deal(lv);
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  s := jsonb_build_object('phase', 'envelope', 'level', lv, 'envelopes', d -> 'envelopes', 'hand', '[]'::jsonb,
    'first', case when random() < 0.5 then 'set' else 'guess' end, 'round', 1, 'turnNo', 0,
    'me', 0, 'ai', 0, 'history', '[]'::jsonb, 'deadline', null, 'seed', floor(random() * 1000000)::int);
  insert into public.hw_games (user_id, state) values (auth.uid(), s) returning id into gid;
  return public.hw_view(gid, s);
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_deal(p_level text DEFAULT 'basic'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare lv text := public.hw_level(p_level); d jsonb; did uuid;
begin
  -- 히든 워드 확장판 is for signed-in members
  if lv = 'plus' and auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  d := public.hw_deal(lv);
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words, level) values (array(select jsonb_array_elements_text(d -> 'words')), lv) returning id into did;
  return jsonb_build_object('deal', did, 'level', lv, 'envelopes', d -> 'envelopes', 'cfg', public.hw_level_cfg(lv) - 'aiNoise' - 'aiBase' - 'aiGap' - 'aiWarm' - 'aiWarmN' - 'aiClose');
end $function$;
