"use client";

import { useMemo } from 'react';
import { type MoSeat, moFrames } from '@/lib/mineOblivion';
import type { MoRoom } from '@/lib/mineOblivionRoom';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayControls, ReplayHeader } from '../ui/ReplayBar';
import type { MoCopy } from './copy';
import MineOblivionBoard from './MineOblivionBoard';
import { allMines, moName, stepFlash, stepLine } from './MineOblivionTable';
import { MineStone, WALKER, WalkerStone } from './MineStones';

/** 복기: every move of the finished game with every mine shown. Rebuilt from the game record (moFrames). */
export default function MineOblivionReplay({ room, mySeat, t, onClose, onShowResult }: { room: MoRoom; mySeat: number | null; t: MoCopy; onClose: () => void; onShowResult?: () => void }) {
  const g = room.game;
  const frames = useMemo(() => moFrames(g), [g]);
  const player = useReplayPlayer(frames.length - 1, true, 1100);
  const f = frames[player.at];
  const view: MoSeat = mySeat === 1 ? 1 : 0;
  const scored = useMemo(() => {
    const seen = new Map<number, MoSeat>();
    for (const s of g.log.slice(0, player.at)) if (s.number !== null && !seen.has(s.to)) seen.set(s.to, s.seat);
    return [...seen.entries()].map(([cell, seat]) => ({ cell, seat }));
  }, [g.log, player.at]);
  const step = f.step;
  const caption = step ? `${step.n}. ${stepLine(step, moName(room, step.seat, mySeat, t), t)} (${t.gain(step.gain)})` : t.replayStart;
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <ReplayHeader player={player} caption={caption} onClose={onClose} />
      <div className="mb-2 flex items-center justify-between gap-2 text-[12px] font-bold">
        {([view, view === 0 ? 1 : 0] as MoSeat[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5"><WalkerStone seat={s} size={24} /><span className="max-w-[9em] truncate text-white/70">{moName(room, s, mySeat, t)}</span><b className="font-mono text-lg" style={{ color: WALKER[s].color }}>{f.score[s]}</b></span>
        ))}
      </div>
      <MineOblivionBoard
        size={g.size} view={view} pos={f.pos} scored={scored} craters={f.craters}
        treasures={g.treasures.map((tr, i) => ({ cell: tr.cell, found: f.found[i] !== null }))}
        mines={allMines(g, f.craters)} ownerRings zones="walk" trails={f.trail} me={mySeat === 0 || mySeat === 1 ? (mySeat as MoSeat) : null}
        flash={step ? stepFlash(step) : null} label={t.replayTitle}
      />
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
        {([[WALKER[view].color, t.revealMine], [WALKER[view === 0 ? 1 : 0].color, t.revealOpp], ['#c084fc', t.revealBoth]] as const).map(([c, label]) => (
          <span key={label} className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ boxShadow: `0 0 0 2px ${c}`, background: `${c}22` }}><MineStone size={14} state="armed" /></span>{label}</span>
        ))}
      </p>
      <ReplayControls player={player} onShowResult={onShowResult} />
    </div>
  );
}
