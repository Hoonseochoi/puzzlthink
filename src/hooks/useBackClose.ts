"use client";

import { useEffect, useRef } from 'react';

/**
 * The system back (Android back gesture, the browser's back) closes a popup while it is open, instead of leaving the game
 * under it. Opening the popup adds a history entry at the same address (hash included, so GameGate stays on the game);
 * back pops it and calls `onClose`. Closing the popup another way (✕, a tap outside) pops that entry again, so the
 * history is as it was. If the player follows a link out of the popup (the address changed), the entry is left alone.
 * (No marker in history.state: the router rewrites the state of every push.)
 */
export function useBackClose(open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    if (!open) return;
    let href = '';
    let popped = false;
    const onPop = () => { popped = true; close.current(); };
    // Next tick: a dev-mode double mount must not push twice (its back would then close the popup at once).
    const timer = window.setTimeout(() => {
      href = window.location.href;
      window.history.pushState(null, '', href);
      window.addEventListener('popstate', onPop);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
      if (href && !popped && window.location.href === href) window.history.back();
    };
  }, [open]);
}
