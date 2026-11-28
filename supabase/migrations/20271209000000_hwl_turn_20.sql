-- 히든 워드: 라이어 — a clue turn is 20 seconds (was 22), the number every player now sees counting down.
-- The turn's end is still the room's `deadline`; when it passes, hwl_step (called by any client just after the deadline,
-- and by the hwl-tick cron each minute) records a silent clue (word null = "⏰ 시간 초과") and passes the turn on.
-- A timed-out turn does not count as a spoken clue for rewards (unchanged: settle counts clues whose word is not null).
-- Only hwl_cfg changes; everything else reads it at run time. Undo: re-run this with 'turn', 22.
create or replace function public.hwl_cfg()
returns jsonb language sql immutable as $$ select jsonb_build_object(
  'hot', 85,                       -- a clue this close to the answer shows as 85+ (its number hidden)
  'cards', 8, 'turn', 20, 'talk', 45, 'talkBig', 60, 'vote', 20, 'runoff', 15, 'guess', 30, 'again', 25, 'houseLobby', 25,
  'min', 4, 'max', 10, 'liarWin', 3, 'citizenWin', 1, 'dailyCap', 7   -- 피스 from this game per player per KST day (owner 11/28)
) $$;
