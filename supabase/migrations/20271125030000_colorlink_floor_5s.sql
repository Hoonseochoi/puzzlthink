-- 컬러 잇기 (colorlink): lower the "implausibly fast" floor from 8 s to 5 s.
-- A real player (190 clean clears, fastest 8.0 s) kept getting flagged at 6.9–8.0 s; the other games are unchanged.
CREATE OR REPLACE FUNCTION public.logic_floor_ms(p_game text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case p_game when 'masyu' then 15000 when 'starbattle' then 8000 when 'binairo' then 10000 when 'onestroke' then 8000 when 'colorlink' then 5000 when 'magicswap' then 15000 else 25000 end;
$function$;
