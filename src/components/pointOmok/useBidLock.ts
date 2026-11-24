"use client";

import { useEffect, useRef, useState } from 'react';
import { evenSplit } from '@/lib/pointOmok';
import { type PoAction, type PoRoom, budgetOf, commitHash, knowsBudget } from '@/lib/pointOmokRoom';

type Stored = { bets: number[]; salt: string; hash: string };
const read = (key: string): Stored | null => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
const write = (key: string, value: Stored) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* optional */ } };
const randomSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * This player's bid for the round: the draft on the steppers, locking it (only a hash goes out), and sending
 * the bid itself once both players have locked. The bid and its salt wait in sessionStorage, so a reload
 * between locking and revealing loses nothing. At the last second a draft is locked as it stands.
 */
export function useBidLock(state: PoRoom | null, mySeat: 0 | 1 | null, dispatch: (action: PoAction) => void) {
  const key = state && mySeat !== null ? `po_bid_${state.sid}_${state.round}_${mySeat}` : '';
  const ready = !!state && mySeat !== null && knowsBudget(state, mySeat);
  const budget = ready ? budgetOf(state!, mySeat!) : 0;
  const [draft, setDraft] = useState<{ key: string; bets: number[] }>({ key: '', bets: [1, 1, 1] });
  const stored = key ? read(key) : null;
  const bets = stored?.bets ?? (draft.key === key ? draft.bets : evenSplit(budget || 3));
  const committed = !!state && mySeat !== null && state.commits[mySeat] !== null;
  const locked = committed || !!stored;
  const bidding = !!state && state.phase === 'bid' && mySeat !== null && ready;

  const setBet = (index: number, value: number) => setDraft({ key, bets: bets.map((b, i) => (i === index ? value : b)) });
  const setAll = (next: number[]) => setDraft({ key, bets: next });

  const lock = () => {
    if (!state || mySeat === null || !bidding || locked) return;
    const total = bets.reduce((a, b) => a + b, 0);
    if (bets.some((b) => b < 1) || total > budget) return;
    const salt = randomSalt();
    const hash = commitHash(state.sid, state.round, mySeat, bets, salt);
    write(key, { bets, salt, hash });
    dispatch({ t: 'commit', hash });
  };

  // Resend a lock or a reveal the host has not taken in yet (a broadcast can be lost); lock at the last second.
  const lockRef = useRef(lock);
  useEffect(() => { lockRef.current = lock; });
  const revealSent = useRef('');
  useEffect(() => {
    if (!state || mySeat === null || !key) return;
    const tick = () => {
      const saved = read(key);
      if (state.phase === 'bid' && !saved && ready && state.deadline - Date.now() < 1500) lockRef.current();
      if (state.phase === 'bid' && saved && state.commits[mySeat] === null) dispatch({ t: 'commit', hash: saved.hash });
      if (state.phase === 'reveal' && saved && state.commits[mySeat] === saved.hash && !state.revealed[mySeat]) dispatch({ t: 'reveal', bets: saved.bets, salt: saved.salt });
    };
    // A reveal goes out at once; the rest are checked on a short beat.
    if (state.phase === 'reveal' && revealSent.current !== key) { revealSent.current = key; tick(); }
    const timer = window.setInterval(tick, 1200);
    return () => window.clearInterval(timer);
  }, [state, mySeat, key, ready, dispatch]);

  return { bets, budget, ready, locked, bidding, setBet, setAll, lock };
}
