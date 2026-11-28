"use client";

import { useFocusResult } from '@/components/focus/focusStore';
import { useCallback, useEffect, useState } from 'react';

/** How long the final position stays on screen before the result popup opens. */
export const REVEAL_MS = 1800;
/** With prefers-reduced-motion the line is drawn at once, so the hold can be shorter. */
const REVEAL_MS_REDUCED = 1100;
/** Never hold longer than this, whatever `until` says (a skewed host clock must not keep the popup away). */
const REVEAL_MAX_MS = 4500;
/** The tap that ended the game must not count as "skip". */
const SKIP_ARM_MS = 300;

/**
 * Hold a game's result popup back for a moment so the player sees how the game ended
 * (the winning line, the deciding capture), then open it.
 *
 * `endKey` is null while the game is on and a string that names this ending once it is over (for
 * example `${sid}-${moves}`): a new key starts a new reveal, the same key never replays one, so a
 * popup the player closed and reopens does not wait again. Any tap or key press skips the wait.
 * Only the popup waits: records and stats should still be sent the moment the game ends.
 *
 * `until` (epoch ms, optional) holds the popup at least until then, for a game whose last move is
 * still animating (for example a reveal that started when the round resolved).
 *
 * Returns `revealing` (the final position is being shown; render the board's highlight and the
 * <EndRevealBanner>), `showResult` (open the popup now) and `skip`.
 */
export function useEndReveal(endKey: string | null | false, ms = REVEAL_MS, until = 0) {
  const key = endKey || null;
  useFocusResult(!!key); // the game is over: nothing is at stake any more (src/components/focus)
  const [done, setDone] = useState<string | null>(null);

  const skip = useCallback(() => { if (key) setDone(key); }, [key]);

  useEffect(() => {
    if (!key || done === key) return;
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = Math.min(REVEAL_MAX_MS, Math.max(reduced ? Math.min(ms, REVEAL_MS_REDUCED) : ms, until - Date.now()));
    const timer = window.setTimeout(() => setDone(key), hold);
    const onTap = () => setDone(key);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') setDone(key); };
    // Capture phase and no preventDefault: the tap still reaches whatever it was on (다시 하기, 나가기, 복기…).
    const arm = window.setTimeout(() => {
      document.addEventListener('pointerdown', onTap, true);
      document.addEventListener('keydown', onKey, true);
    }, SKIP_ARM_MS);
    return () => {
      window.clearTimeout(timer); window.clearTimeout(arm);
      document.removeEventListener('pointerdown', onTap, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [key, done, ms, until]);

  const revealing = !!key && done !== key;
  return { revealing, showResult: !!key && !revealing, skip };
}
