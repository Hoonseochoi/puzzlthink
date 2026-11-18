"use client";

import { useEffect, useState } from 'react';

type Recording<T> = { key: string | null; sigs: string[]; frames: T[] };

/**
 * Records a snapshot every time `sig` changes during one game (identified by `gameKey`),
 * so a finished game can be stepped through move by move (복기). A new key starts a new recording.
 * Snapshots are kept in this browser only, so they cover what this player saw.
 */
export function useReplayFrames<T>(gameKey: string | null, frame: T | null, sig: string): T[] {
  const [rec, setRec] = useState<Recording<T>>({ key: null, sigs: [], frames: [] });
  // Adjusting state while rendering (React's "storing information from previous renders" pattern).
  if (rec.key !== gameKey) setRec({ key: gameKey, sigs: frame ? [sig] : [], frames: frame ? [frame] : [] });
  else if (frame && rec.sigs[rec.sigs.length - 1] !== sig) setRec({ key: gameKey, sigs: [...rec.sigs, sig], frames: [...rec.frames, frame] });
  return rec.key === gameKey ? rec.frames : [];
}

const STEP_MS = 1000;

/** Step position and autoplay for a replay of `total` steps (0 = opening, total = final position). */
export function useReplayPlayer(total: number, open: boolean, stepMs = STEP_MS) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(open); // mounted already open → start playing
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setAt(0); setPlaying(true); } else setPlaying(false); }

  useEffect(() => {
    if (!open || !playing) return;
    if (at >= total) { const stop = window.setTimeout(() => setPlaying(false), 0); return () => window.clearTimeout(stop); }
    const timer = window.setTimeout(() => setAt((n) => Math.min(total, n + 1)), stepMs);
    return () => window.clearTimeout(timer);
  }, [open, playing, at, total, stepMs]);

  const go = (n: number) => { setPlaying(false); setAt(Math.max(0, Math.min(total, n))); };
  const toggle = () => { if (at >= total) { setAt(0); setPlaying(true); } else setPlaying((p) => !p); };
  return { at: Math.min(at, total), total, playing, go, toggle };
}

export type ReplayPlayer = ReturnType<typeof useReplayPlayer>;

/** A number that goes up each time `phase` enters `startPhase` (a new game in the same room). */
export function useGameCounter(phase: string | null | undefined, startPhase: string) {
  const [seen, setSeen] = useState<{ n: number; phase: string | null }>({ n: 0, phase: null });
  const now = phase ?? null;
  if (now !== seen.phase) setSeen({ n: seen.n + (now === startPhase ? 1 : 0), phase: now });
  return seen.n + (now !== seen.phase && now === startPhase ? 1 : 0);
}
