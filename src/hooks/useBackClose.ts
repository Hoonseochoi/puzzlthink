"use client";

import { useEffect, useRef } from 'react';
import { dropLayer, forgetLayer, hasLayer, pushLayer } from '@/lib/backStack';

/**
 * The system back (Android back gesture, the browser's back) closes a popup while it is open, instead of leaving the game
 * under it. Opening the popup adds a history entry at the same address (hash included, so GameGate stays on the game);
 * back pops it and calls `onClose`. Closing the popup another way (✕, a tap outside) pops that entry again, so the
 * history is as it was. If the player follows a link out of the popup (the address changed), the entry is left alone.
 * The entries share one stack with the game's 전체 모드 (src/lib/backStack.ts), so a back press closes only the top one.
 */
export function useBackClose(open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    if (!open) return;
    let id: number | null = null;
    // Next tick: a dev-mode double mount must not push twice (its back would then close the popup at once).
    const timer = window.setTimeout(() => { id = pushLayer(() => { id = null; close.current(); }); }, 0);
    return () => {
      window.clearTimeout(timer);
      if (hasLayer(id)) dropLayer(id); else forgetLayer(id);
    };
  }, [open]);
}
