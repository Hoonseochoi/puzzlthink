"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Dir, type M2State, type Tile, move } from '@/lib/merge2048';
import { playMergeNote } from '@/lib/gameAudio';

export type M2View = { ghosts: Tile[]; merged: number[]; spawned: number | null; gained: number; key: number };
const EMPTY_VIEW: M2View = { ghosts: [], merged: [], spawned: null, gained: 0, key: 0 };

/**
 * One local board with its move animation: the swallowed blocks (`ghosts`) stay for the slide, merged blocks
 * pop, the new block grows in. `onMoved` sees every new state (to save or send it).
 */
export function useM2Game(onMoved?: (next: M2State, prev: M2State) => void) {
  const [game, setGameState] = useState<M2State | null>(null);
  const [view, setView] = useState<M2View>(EMPTY_VIEW);
  const ref = useRef<M2State | null>(null);
  const keyRef = useRef(0);
  const ghostTimer = useRef<number | undefined>(undefined);
  const moved = useRef(onMoved);
  useEffect(() => { moved.current = onMoved; }, [onMoved]);
  useEffect(() => () => window.clearTimeout(ghostTimer.current), []);

  const setGame = useCallback((next: M2State | null) => {
    ref.current = next;
    setGameState(next);
    setView({ ...EMPTY_VIEW, key: ++keyRef.current });
  }, []);

  const step = useCallback((dir: Dir) => {
    const prev = ref.current;
    if (!prev) return false;
    const result = move(prev, dir);
    if (!result) return false;
    ref.current = result.state;
    setGameState(result.state);
    setView({ ghosts: result.ghosts, merged: result.merged, spawned: result.spawned, gained: result.gained, key: ++keyRef.current });
    window.clearTimeout(ghostTimer.current);
    ghostTimer.current = window.setTimeout(() => setView((v) => ({ ...v, ghosts: [] })), 130);
    if (result.merged.length) playMergeNote(Math.max(...result.state.tiles.filter((t) => result.merged.includes(t.id)).map((t) => t.v)));
    moved.current?.(result.state, prev);
    return true;
  }, []);

  return { game, view, step, setGame, current: ref };
}
