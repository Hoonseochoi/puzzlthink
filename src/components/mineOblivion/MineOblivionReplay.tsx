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
import { ITEM_ICON } from './MineOblivionItems';

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
  // Items used right after this position (before the next move), and the 방폭복 being worn here.
  const uses = (g.items ?? []).filter((u) => u.n === player.at);
  const allUses = g.items ?? [];
  const suitOn = allUses.find((u) => u.item === 'suit' && u.n <= player.at);
  const suitSpent = suitOn && g.log.some((s) => s.shielded && s.seat === suitOn.seat && s.n <= player.at);
  const probe = uses.find((u) => u.item === 'probe' && u.cell !== undefined);
  const base = step ? `${step.n}. ${stepLine(step, moName(room, step.seat, mySeat, t), t)} (${t.gain(step.gain)})` : t.replayStart;
  const caption = uses.length ? `${base} · ${uses.map((u) => t.items.name[u.item]).join(', ')}` : base;
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
        flash={step ? stepFlash(step, t.savedFlash) : null} label={t.replayTitle}
        probe={probe ? { cell: probe.cell!, number: probe.number ?? 0, key: `rp${player.at}`, label: t.items.probeSaid(probe.number ?? 0) } : null}
        shield={suitOn && !suitSpent ? suitOn.seat : null}
      />
      {allUses.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" data-testid="mo-replay-items">
          <span className="rounded-full bg-[#5ee0c8] px-2 py-0.5 text-[10px] font-black text-[#062320]">{t.items.used}</span>
          {allUses.map((u, i) => (
            <button key={i} type="button" onClick={() => player.go(u.n)} className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${u.n === player.at ? 'border-[#5ee0c8] bg-[#5ee0c8]/20 text-white' : 'border-white/15 text-white/65 hover:border-white/40'}`}>
              {ITEM_ICON[u.item]({ size: 16 })}{t.items.replayUse(t.items.name[u.item], u.n)}{u.item === 'probe' && u.number !== undefined ? ` ◎${u.number}` : ''}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/55">
        {([[WALKER[view].color, t.revealMine], [WALKER[view === 0 ? 1 : 0].color, t.revealOpp], ['#c084fc', t.revealBoth]] as const).map(([c, label]) => (
          <span key={label} className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ boxShadow: `0 0 0 2px ${c}`, background: `${c}22` }}><MineStone size={14} state="armed" /></span>{label}</span>
        ))}
      </p>
      <ReplayControls player={player} onShowResult={onShowResult} />
    </div>
  );
}
