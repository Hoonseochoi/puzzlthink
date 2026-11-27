"use client";

import { type MineOblivion, type MoBreakdownLine, type MoSeat, decidingLine, moBreakdown } from '@/lib/mineOblivion';
import type { MoCopy } from './copy';
import { MineStone, TreasureStone, WALKER, WalkerStone } from './MineStones';

const sign = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

/**
 * 점수 내역: where each player's points came from (treasure, mines, numbers, total), from the step log, so it always
 * adds up to the score. The line with the biggest gap between the two is marked 승부처. Result screen and end of 복기.
 */
export default function MineOblivionBreakdown({ g, seats, names, t, upTo }: { g: MineOblivion; seats: [MoSeat, MoSeat]; names: [string, string]; t: MoCopy; upTo?: number }) {
  const b = seats.map((s) => moBreakdown(g, s, upTo)) as [ReturnType<typeof moBreakdown>, ReturnType<typeof moBreakdown>];
  const decided = decidingLine(b[0], b[1]);
  const c = t.breakdown;
  const rows: { key: MoBreakdownLine | 'total'; label: string; icon: React.ReactNode; value: (i: 0 | 1) => number; sub: (i: 0 | 1) => string }[] = [
    { key: 'numbers', label: c.numbers, icon: <span className="flex h-4 w-4 items-center justify-center rounded-full border border-black bg-[#ffd23f] font-mono text-[9px] font-black text-black">3</span>,
      value: (i) => b[i].numbers, sub: (i) => c.cells(b[i].numberCells) },
    { key: 'treasure', label: c.treasure, icon: <TreasureStone size={16} />,
      value: (i) => b[i].treasure, sub: (i) => (b[i].treasures.length ? b[i].treasures.map((x) => `${c.order(x.order)} +${x.value}`).join(' · ') : c.none) },
    { key: 'mines', label: c.mines, icon: <MineStone size={16} state="blast" />,
      value: (i) => b[i].minePoints, sub: (i) => [b[i].mines ? c.mineCalc(b[i].mines) : c.none, b[i].shielded ? c.shielded(b[i].shielded) : ''].filter(Boolean).join(' · ') },
  ];
  return (
    <div className="rounded-[12px] border border-white/10 bg-black/30 p-2" data-testid="mo-breakdown">
      <div className="grid grid-cols-[minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-1.5 px-1 pb-1 text-[11px] font-bold text-white/60">
        <span className="font-black tracking-[.14em] text-(--accent)">{c.title}</span>
        {seats.map((s, i) => <span key={s} className="flex min-w-0 items-center justify-end gap-1"><span className="truncate">{names[i]}</span><WalkerStone seat={s} size={16} /></span>)}
      </div>
      {rows.map((r) => {
        const hot = r.key === decided;
        return (
          <div key={r.key} className={`grid grid-cols-[minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-1.5 rounded-[8px] px-1 py-1 ${hot ? 'bg-(--accent)/14 ring-1 ring-(--accent)/55' : ''}`}>
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1 text-[12px] font-black text-white/85">{r.icon}{r.label}</span>
              {hot && <span className="mt-0.5 w-fit rounded-full bg-(--accent) px-1.5 text-[9px] font-black leading-[14px] text-(--accent-ink)">{c.decided}</span>}
            </span>
            {([0, 1] as const).map((i) => (
              <span key={i} className="min-w-0 text-right">
                <b className="block font-mono text-[15px] font-black leading-5 tabular-nums" style={{ color: r.key === 'mines' && r.value(i) < 0 ? '#ff8a7a' : WALKER[seats[i]].color }}>{sign(r.value(i))}</b>
                <span className="block break-keep text-[10px] leading-3 text-white/45">{r.sub(i)}</span>
              </span>
            ))}
          </div>
        );
      })}
      <div className="mt-1 grid grid-cols-[minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-1.5 border-t border-white/10 px-1 pt-1.5">
        <span className="text-[12px] font-black text-white">{c.total}</span>
        {([0, 1] as const).map((i) => <b key={i} className="text-right font-mono text-lg font-black tabular-nums" style={{ color: WALKER[seats[i]].color }}>{b[i].total}</b>)}
      </div>
      <p className="mt-1 break-keep px-1 text-[10px] leading-[13px] text-white/40">{c.note}</p>
    </div>
  );
}
