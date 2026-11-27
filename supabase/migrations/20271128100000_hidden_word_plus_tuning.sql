-- 히든 워드 확장판: MORA a little less sharp. Live 11/26–27 (458 recorded 확장 matches) players won 24% (11.8 points
-- to MORA's 18.8) against 42% on 기본; the aim was "a bit harder than 기본", about 30–38%.
-- MORA never sees the player's word (checked 11/27: it guesses from the hints on the board, their shown numbers and its
-- own feel table, among all 186 words); it was simply strong on both sides:
--   - finding the player's word at stage 1: 56% on 확장 vs 48% on 기본 → noise back to 기본's 5.0 (was 3.0)
--   - its hints: players found its word at stage 1 36% vs 47%, missed 17% vs 8% → 1–2 warm-ups (was 1) and closing
--     hints a bit more specific in stages 2 and 3 (aiClose 0 / 0.3 / 0.7, was 0 / 0.15 / 0.4); warm-up ranges unchanged
-- Simulated typical player (scripts/hidden-word/simulate.py, naive setter, ±10 guesser; it predicted live within 2
-- points): 12.3 → 13.4 points, MORA 17.6 → 16.2, wins 26% → 34%. 기본 is unchanged.
-- hw_level_cfg below is the live definition (20271127000000) with only the 'plus' overrides changed.
create or replace function public.hw_level_cfg(p_level text)
returns jsonb language sql immutable
as $$ select public.hw_cfg()
  || jsonb_build_object('aiWarm', jsonb_build_array(jsonb_build_array(72, 86), jsonb_build_array(80, 91), jsonb_build_array(86, 94.5)),
                        'aiWarmN', jsonb_build_array(1, 2), 'aiClose', jsonb_build_array(0, 0.5, 1))
  || case when public.hw_level(p_level) = 'plus' then jsonb_build_object(
       'aiWarm', jsonb_build_array(jsonb_build_array(70, 82), jsonb_build_array(78, 88), jsonb_build_array(85, 93)),
       'aiWarmN', jsonb_build_array(1, 2), 'aiClose', jsonb_build_array(0, 0.3, 0.7),
       'aiNoise', 5.0
     ) else '{}'::jsonb end $$;
revoke all on function public.hw_level_cfg(text) from public, anon, authenticated;
