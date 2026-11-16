"use client";

import { useEffect, useRef, useState } from 'react';
import type { Peer } from '@/lib/room';

export type PresenceAlert = { id: number; kind: 'join' | 'leave'; name: string };

const LEAVE_GRACE_MS = 3000; // a refresh rejoins within this window, so it is not a real "leave"

/** Turns presence changes into short-lived join/leave alerts (plus a vibration and tab-title blink). */
export function usePresenceAlerts(peers: Peer[], myId: string | undefined, ready: boolean) {
  const [alerts, setAlerts] = useState<PresenceAlert[]>([]);
  const known = useRef<Map<string, string> | null>(null);
  const pendingLeaves = useRef(new Map<string, number>());
  const seq = useRef(0);

  useEffect(() => {
    if (!ready || !myId) return;
    const current = new Map(peers.map((p) => [p.id, p.name]));
    const push = (kind: PresenceAlert['kind'], name: string) => {
      const id = ++seq.current;
      setAlerts((list) => [...list.slice(-2), { id, kind, name }]);
      window.setTimeout(() => setAlerts((list) => list.filter((a) => a.id !== id)), 4200);
      if (kind === 'join') {
        try { navigator.vibrate?.(120); } catch { /* not supported */ }
        if (document.hidden) blinkTitle(name);
      }
    };
    if (known.current === null) { known.current = current; return; } // first sync: no alerts for people already here
    for (const [id, name] of current) {
      if (id === myId || known.current.has(id)) continue;
      const pending = pendingLeaves.current.get(id);
      if (pending) { window.clearTimeout(pending); pendingLeaves.current.delete(id); continue; } // quick rejoin
      push('join', name);
    }
    for (const [id, name] of known.current) {
      if (id === myId || current.has(id) || pendingLeaves.current.has(id)) continue;
      pendingLeaves.current.set(id, window.setTimeout(() => { pendingLeaves.current.delete(id); push('leave', name); }, LEAVE_GRACE_MS));
    }
    known.current = current;
  }, [peers, myId, ready]);

  return alerts;
}

let blinkTimer: number | undefined;
function blinkTitle(name: string) {
  const original = document.title.replace(/^🔔 .*? · /, '');
  let on = false;
  window.clearInterval(blinkTimer);
  blinkTimer = window.setInterval(() => {
    on = !on;
    document.title = on ? `🔔 ${name} · ${original}` : original;
  }, 1000);
  const stop = () => { if (!document.hidden) { window.clearInterval(blinkTimer); document.title = original; document.removeEventListener('visibilitychange', stop); } };
  document.addEventListener('visibilitychange', stop);
}
