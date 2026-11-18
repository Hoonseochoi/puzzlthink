"use client";

import { type PokerRound } from '@/lib/indianPoker';

export function PokerCard({ value, hidden = false, label, compact = false }: { value: number; hidden?: boolean; label?: string; compact?: boolean }) {
  return (
    <div className="text-center">
      <div className={`relative flex items-center justify-center rounded-[14px] border bg-[linear-gradient(145deg,#fffdf6,#dfd7c7)] font-black text-[#18191d] shadow-[0_12px_32px_rgba(0,0,0,.38)] ${compact ? 'h-16 w-11 text-2xl' : 'h-36 w-24 text-6xl sm:h-44 sm:w-28'}`}>
        {hidden ? '?' : value}
        {!hidden && !compact && <><span className="absolute left-2 top-1.5 text-sm">{value}</span><span className="absolute bottom-1.5 right-2 rotate-180 text-sm">{value}</span></>}
      </div>
      {label && <p className="mt-2 max-w-28 truncate text-[10px] font-black text-white/50">{label}</p>}
    </div>
  );
}

export function ChipStack({ count, tone = 'gold' }: { count: number; tone?: 'gold' | 'red' }) {
  const shown = Math.min(8, Math.max(1, count));
  const color = tone === 'gold' ? '#ffcf3f' : '#ff5568';
  return <span className="relative inline-block h-7 w-9" title={String(count)}>{Array.from({ length: shown }).map((_, i) => <i key={i} className="absolute left-0 h-2 w-9 rounded-full border border-black/40" style={{ bottom: i * 2.4, background: color }} />)}<b className="absolute -right-6 top-1 font-mono text-xs text-white">{count}</b></span>;
}

export function PokerTable({ cards, names, reveal, bets, chips, carry }: { cards: [number, number]; names: [string, string]; reveal: boolean; bets: [number, number]; chips: [number, number]; carry: number }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#bd8d38]/35 bg-[radial-gradient(ellipse_at_center,#195744,#0b2c26_72%)] px-4 py-7 shadow-[inset_0_0_70px_rgba(0,0,0,.55),0_18px_50px_rgba(0,0,0,.25)] sm:px-8 sm:py-10">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-3"><PokerCard value={cards[0]} hidden={!reveal} label={names[0]} /><ChipStack count={chips[0]} /></div>
        <div className="text-center"><p className="text-[10px] font-black tracking-[.2em] text-white/40">POT</p><p className="font-mono text-3xl font-black text-[#ffcf3f]">{bets[0] + bets[1] + carry}</p><p className="mt-1 text-[10px] text-white/35">{bets[0]} : {bets[1]}</p></div>
        <div className="flex flex-col items-center gap-3"><PokerCard value={cards[1]} hidden={false} label={names[1]} /><ChipStack count={chips[1]} tone="red" /></div>
      </div>
    </div>
  );
}

export function PokerHistory({ rounds }: { rounds: PokerRound[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">{rounds.slice(-10).map((round, i) => <span key={i} className="flex items-center gap-1 rounded-md border border-white/10 bg-black/25 px-2 py-1 text-[10px] font-bold text-white/55"><b className="text-white">{round.cards[0]}:{round.cards[1]}</b>{round.winner === 'draw' ? 'D' : `P${round.winner + 1}`}</span>)}</div>
  );
}
