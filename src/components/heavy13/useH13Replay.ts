"use client";

import { useState } from 'react';
import { useGameCounter, useReplayFrames, useReplayPlayer } from '@/hooks/useReplayFrames';
import type { H13Room } from '@/lib/heavy13Room';

/** 복기 for 무거운 13: a snapshot of the table after every reveal, placement, collapse and pass. */
export function useH13Replay(view: H13Room | null) {
  const [replaying, setReplaying] = useState(false);
  const gameNo = useGameCounter(view?.phase, 'playing');
  const inGame = view && view.phase !== 'lobby' ? view : null;
  const g = inGame?.game;
  const frames = useReplayFrames(inGame ? `${inGame.sid}-${gameNo}` : null,
    inGame ? { ...inGame, deadline: Number.POSITIVE_INFINITY } : null,
    g ? `${g.round}|${g.phase}|${g.seq}|${g.current}|${g.passed.length}|${g.resolvingPasses}` : '');
  const open = replaying && view?.phase === 'finished';
  const player = useReplayPlayer(Math.max(0, frames.length - 1), open, 1100);
  return { frame: open ? frames[player.at] : null, player, canReplay: frames.length > 1, open: () => setReplaying(true), close: () => setReplaying(false) };
}
