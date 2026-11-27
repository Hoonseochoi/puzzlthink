"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, History, ShieldCheck, X } from 'lucide-react';
import { SH_SEATS } from '@/lib/sniperHoldem';
import { SH_PERSONA } from '@/lib/sniperHoldemAi';
import type { SniperHoldemRoom } from '@/lib/sniperHoldemRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import type { ShCopy } from './copy';
import { Scope, ShAvatar, ShChip } from './SniperHoldemParts';
import { personaCopy } from './personas';

/** My settled place (1 = first to safety … last = eliminated), or null while I am still at the table. */
export const shMyPlace = (room: SniperHoldemRoom | null, mySeat: number | null) => (room && mySeat !== null && room.phase !== 'lobby' && !room.game.absent?.[mySeat] ? room.game.place[mySeat] : null);

/**
 * Records my result once my place is settled: reaching safety is a win, being the one eliminated a loss. A player
 * who reaches safety early is recorded right away (the others play on).
 */
export function useSniperHoldemReport(room: SniperHoldemRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const place = shMyPlace(room, mySeat);
  const g = room?.game;
  const gid = g?.gid;
  const rounds = g?.round ?? 0;
  const players = g?.players ?? 0;
  const out = !!(g && mySeat !== null && g.out[mySeat]);
  const humans = room ? room.ai.filter((ai, i) => !ai && room.seats[i]).length : 0;
  const level = room?.level;
  const chips = room?.chips;
  useEffect(() => {
    if (place === null || !gid || mySeat === null) return;
    reportGame(`sniper_holdem-${mode}-${gid}-${mySeat}`, 'sniper_holdem', mode, out ? 'loss' : 'win',
      // 'difficulty' (what earns the 어려움 certificate) only for the first to safety at a hard table: at five,
      // simply not being the one eliminated would be too easy a clear. Every AI match keeps its level in 'ai'.
      { place, players, rounds, chips, ...(mode === 'ai' ? { ai: level, ...(level === 'hard' && place === 1 && !out ? { difficulty: 'hard' } : {}) } : { humans }) }, { revealDelayMs: 1200 });
  }, [place, gid, mySeat, mode, rounds, players, out, humans, level, chips]);
}

/** Seat names as the table shows them: 나 / the AI's persona / the player's name. */
export const shNamer = (room: SniperHoldemRoom, mySeat: number | null, t: ShCopy, locale: string) => (s: number) => {
  if (s === mySeat) return t.you;
  const style = room.seats[s]?.id.startsWith('ai-') ? room.style[s] : null;
  return style ? (locale === 'en' ? SH_PERSONA[style].nameEn : SH_PERSONA[style].name) : room.seats[s]?.name ?? `P${s + 1}`;
};

/**
 * The result waits a moment after my place is settled, so the hand that settled it (the final showdown) is seen
 * first instead of the match ending at once.
 */
export function useResultDelay(done: boolean, key: string, ms = 3200) {
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setReady(key), ms);
    return () => window.clearTimeout(timer);
  }, [done, key, ms]);
  return done && ready === key;
}

/** Standings: who reached safety in what order, and who was eliminated. */
export default function SniperHoldemResult({ room, mySeat, t, locale, onAgain, onClose, onReplay, waitingLabel }: {
  room: SniperHoldemRoom; mySeat: number | null; t: ShCopy; locale: string; onAgain?: () => void; onClose: () => void; onReplay?: () => void; waitingLabel?: string;
}) {
  const g = room.game;
  const nameOf = shNamer(room, mySeat, t, locale);
  const seats = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => !g.absent?.[s]);
  const order = seats.sort((a, b) => (g.place[a] ?? 9) - (g.place[b] ?? 9) || g.chips[b] - g.chips[a]);
  const myPlace = mySeat === null ? null : g.place[mySeat];
  const iOut = mySeat !== null && g.out[mySeat];
  const loser = seats.find((s) => g.out[s]);
  return (
    <div className={`${MODAL_BACKDROP} !z-[80]`}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${MODAL} max-h-[92vh] max-w-md overflow-y-auto text-white`}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{g.phase === 'finished' ? t.final : t.safeKicker} · {t.rounds(g.round)}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${myPlace && !iOut ? 'text-[#7ef0b0]' : STEEL_TEXT}`}>
          {myPlace && !iOut ? t.youSafe(myPlace) : iOut ? t.youOut : loser !== undefined ? t.eliminatedIs(nameOf(loser)) : t.watching}
        </h2>
        {g.phase !== 'finished' && <p className="mt-2 text-xs font-bold text-white/45">{t.othersPlaying}</p>}
        <ol className="mt-5 space-y-1.5 text-left">
          {order.map((s, i) => {
            const persona = room.seats[s]?.id.startsWith('ai-') && room.style[s] ? SH_PERSONA[room.style[s]!] : null;
            const out = g.out[s];
            return (
              <motion.li key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${out ? 'border-(--accent)/40 bg-(--accent)/[0.08]' : s === mySeat ? 'border-[#7ef0b0]/40 bg-[#7ef0b0]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
                <span className="w-6 font-mono text-lg font-black text-white/40">{g.place[s] ?? '–'}</span>
                <ShAvatar name={persona ? nameOf(s) : room.seats[s]?.name ?? nameOf(s)} color={persona?.color} human={!persona} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{nameOf(s)}</span>
                  {/* The reveal: what this personality was really doing all match. */}
                  {persona && room.style[s] && <span className="block break-keep text-[10.5px] font-bold leading-4 text-white/45">{personaCopy(room.style[s]!, locale).style}</span>}
                </span>
                {g.safe[s] ? <span className="flex items-center gap-1 text-xs font-black text-[#7ef0b0]"><ShieldCheck size={14} />{t.safe}</span>
                  : out ? <span className="flex items-center gap-1 text-xs font-black text-[#ff9aa4]"><Scope size={13} />{t.placeOut}</span>
                    : <ShChip n={g.chips[s]} className="text-xs text-white/70" />}
              </motion.li>
            );
          })}
        </ol>
        {/* 게임 보기: back to the table (the final hand stays on it); 복기: the match again, hand by hand. */}
        <ResultActions replay={
          <div className={`mt-5 grid gap-2 ${onReplay && g.rounds.length ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button type="button" onClick={onClose} className="flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 py-3 text-sm font-extrabold text-white/80 hover:bg-white/10"><Eye size={15} />{t.viewGame}</button>
            {onReplay && g.rounds.length > 0 && <button type="button" onClick={onReplay} className="flex items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 py-3 text-sm font-extrabold text-(--accent) hover:bg-(--accent)/20"><History size={15} />{t.replay}</button>}
          </div>
        } won={myPlace === null ? undefined : !iOut} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/sniper-holdem" primaryClass={RESULT_PRIMARY} />
      </motion.div>
    </div>
  );
}
