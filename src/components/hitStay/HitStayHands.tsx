"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type HitStay, type HsEvent, HS_PLAYERS, hsTotal, hsVisible } from '@/lib/hitStay';
import type { HsCopy } from './copy';
import { HsAvatar, HsCard, HsChip } from './HitStayParts';

type Props = {
  g: HitStay; mySeat: number | null; t: HsCopy; nameOf: (s: number) => string; colorOf: (s: number) => string | undefined; onClose: () => void;
};

/** This round's moves, oldest first, by seat. */
function movesThisRound(g: HitStay) {
  const start = g.log.findIndex((e) => e.k === 'round');
  const events = (start < 0 ? g.log : g.log.slice(0, start)).slice().reverse();
  const bySeat: HsEvent[][] = Array.from({ length: HS_PLAYERS }, () => []);
  for (const e of events) if ('seat' in e) bySeat[e.seat].push(e);
  return bySeat;
}

function MoveChip({ e, t }: { e: HsEvent; t: HsCopy }) {
  const [text, tone] = e.k === 'open' ? [t.handsOpen(e.card), 'bg-white/10 text-white/70']
    : e.k === 'check' ? [t.call(0), 'bg-(--accent)/15 text-[#c9cfff]']
      : e.k === 'call' ? [t.handsCall(e.to), 'bg-(--accent)/15 text-[#c9cfff]']
        : e.k === 'raise' ? [t.handsRaise(e.to), 'bg-[#ffd36b]/15 text-[#ffd36b]']
          : e.k === 'fold' ? [t.fold, 'bg-white/5 text-white/40 line-through']
            : e.k === 'hit' ? [`HIT ${e.card > 0 ? '+' : ''}${e.card}`, 'bg-[#ff4d6d]/20 text-[#ff8fa3]']
              : e.k === 'stay' ? ['STAY', 'bg-[#b9c3ff]/15 text-[#dfe4ff]']
                : ['', ''];
  if (!text) return null;
  return <span className={`rounded-[5px] px-1.5 py-[3px] font-mono text-[10px] font-black ${tone}`}>{text}</span>;
}

/**
 * 패보기: what everyone has shown and done. "This round" lists each player's visible cards, their bet and every
 * move so far; "Last round" keeps the previous showdown (the hands, totals and winners) after the sheet is gone.
 */
export default function HitStayHands({ g, mySeat, t, nameOf, colorOf, onClose }: Props) {
  const last = g.rounds[g.rounds.length - 1];
  const showingLast = g.phase === 'showdown' || g.phase === 'finished';
  const [tab, setTab] = useState<'now' | 'last'>('now');
  const view = tab === 'last' && last ? 'last' : 'now';
  const moves = movesThisRound(g);
  const order = Array.from({ length: HS_PLAYERS }, (_, i) => (g.first + i) % HS_PLAYERS).filter((s) => !g.absent?.[s]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-[2px]" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={(event) => event.stopPropagation()}
        className="mx-auto flex max-h-[82vh] w-full max-w-[560px] flex-col rounded-t-[18px] border border-white/10 bg-[#121217] pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-20px_60px_rgba(0,0,0,.6)]">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15" />
        <div className="flex items-center gap-2 px-4 pb-2 pt-3">
          <p className="flex-1 text-base font-black text-white">{t.handsTitle}</p>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-white/[0.05] p-1">
            {(['now', 'last'] as const).map((key) => (
              <button key={key} type="button" disabled={key === 'last' && !last} onClick={() => setTab(key)}
                className={`rounded px-2.5 py-1 text-[11px] font-black transition disabled:opacity-30 ${view === key ? 'bg-(--accent) text-(--accent-ink)' : 'text-white/55'}`}>
                {key === 'now' ? (showingLast ? t.handsShowdown : t.handsNow) : t.handsLast}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-md p-1.5 text-white/45 hover:bg-white/10"><X size={17} /></button>
        </div>
        <p className="px-4 pb-2 font-mono text-[10px] font-black tracking-[0.18em] text-(--accent)">
          {view === 'now' ? `${t.round(g.round)} · ${t.limit} ${g.limit} · ${t.pot} ${g.bets.reduce((a, b) => a + b, 0)}` : `${t.round(last!.round)} · ${t.limit} ${last!.limit} · ${t.pot} ${last!.pot}`}
        </p>

        <ul className="flex-1 space-y-1.5 overflow-y-auto px-3">
          {order.map((s) => {
            if (view === 'last') {
              const hand = last!.hands?.[s] ?? [];
              const out = last!.folded?.[s] && !hand.length;
              if (out) return null;
              const shown = hand.every((c) => c !== null);
              const total = hsTotal(hand);
              const won = last!.winners.includes(s);
              return (
                <li key={s} className={`rounded-[10px] border px-2.5 py-2 ${won ? 'border-[#ffd36b]/50 bg-[#ffd36b]/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
                  <div className="flex items-center gap-2">
                    <HsAvatar name={nameOf(s)} color={colorOf(s)} size={22} />
                    <b className={`min-w-0 flex-1 truncate text-[13px] ${s === mySeat ? 'text-(--accent)' : 'text-white'}`}>{nameOf(s)}</b>
                    {last!.folded?.[s] ? <span className="text-[11px] font-bold text-white/40">{t.fold}</span>
                      : shown ? <span className={`font-mono text-sm font-black ${total > last!.limit ? 'text-[#ff7a8f]' : 'text-white'}`}>{total}{total > last!.limit ? ` · ${t.bust}` : ''}</span> : null}
                    {won && <span className="rounded bg-[#ffd36b] px-1.5 text-[10px] font-black text-[#2a1d00]">{t.winner}{last!.payouts?.[s] ? ` +${last!.payouts[s]}` : ''}</span>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">{hand.map((c, i) => <HsCard key={i} value={c} size="sm" />)}</div>
                </li>
              );
            }
            const hand = g.hands[s];
            if (g.out[s]) return (
              <li key={s} className="flex items-center gap-2 rounded-[10px] border border-white/5 px-2.5 py-1.5 opacity-40"><HsAvatar name={nameOf(s)} color={colorOf(s)} size={20} /><b className="flex-1 truncate text-xs">{nameOf(s)}</b><span className="text-[11px] font-bold">{t.out}</span></li>
            );
            const visible = hand.map((c, i) => (hsVisible(g, mySeat, s, i) ? c : null));
            const allShown = visible.every((c) => c !== null);
            return (
              <li key={s} className={`rounded-[10px] border px-2.5 py-2 ${g.folded[s] ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex items-center gap-2">
                  <HsAvatar name={nameOf(s)} color={colorOf(s)} size={22} />
                  <b className={`min-w-0 flex-1 truncate text-[13px] ${s === mySeat ? 'text-(--accent)' : 'text-white'}`}>{nameOf(s)}</b>
                  {s === g.first && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[9px] font-black leading-[14px] text-[#2a1d00]">{t.first}</span>}
                  <span className="text-[10px] font-bold text-white/40">{t.handsBet} <b className="font-mono text-xs text-white">{g.bets[s]}</b></span>
                  <HsChip n={g.chips[s]} className="text-[11px] text-white/60" />
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="flex flex-wrap gap-1">{visible.map((c, i) => <HsCard key={i} value={c} size="sm" />)}</span>
                  <span className="ml-auto text-[11px] font-bold text-white/50">{allShown ? hsTotal(visible) : t.openSum(hsTotal(visible))}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">{moves[s].length ? moves[s].map((e, i) => <MoveChip key={i} e={e} t={t} />) : <span className="text-[10px] text-white/30">{t.handsNoMove}</span>}</div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
