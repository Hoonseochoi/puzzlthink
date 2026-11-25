"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { HS_PERSONA, HS_PLAYERS } from '@/lib/hitStay';
import type { HitStayRoom } from '@/lib/hitStayRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import type { HsCopy } from './copy';
import { HsAvatar, HsChip } from './HitStayParts';

/** My final place, or null while I am still in the match. */
export const hsMyPlace = (room: HitStayRoom | null, mySeat: number | null) => (room && mySeat !== null && room.phase !== 'lobby' ? room.game.place[mySeat] : null);

/**
 * Records my result once my place is settled: 1st is a win, anything else a loss. A player knocked out
 * early is recorded right away (the others play on).
 */
export function useHitStayReport(room: HitStayRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const place = hsMyPlace(room, mySeat);
  const gid = room?.game.gid;
  const rounds = room?.game.round ?? 0;
  const chips = room && mySeat !== null ? room.game.chips[mySeat] : 0;
  const humans = room ? room.ai.filter((ai) => !ai).length : 0;
  useEffect(() => {
    if (place === null || !gid || mySeat === null) return;
    reportGame(`hit_stay-${mode}-${gid}-${mySeat}`, 'hit_stay', mode, place === 1 ? 'win' : 'loss',
      { place, rounds, chips, ...(mode === 'friend' ? { humans } : {}) }, { revealDelayMs: 1200 });
  }, [place, gid, mySeat, mode, rounds, chips, humans]);
}

/** Final standings: places 1–5 in order, the winner's crown, and play again. Also shown to a player knocked out mid-match. */
export default function HitStayResult({ room, mySeat, t, locale, onAgain, onClose, waitingLabel }: {
  room: HitStayRoom; mySeat: number | null; t: HsCopy; locale: string; onAgain?: () => void; onClose: () => void; waitingLabel?: string;
}) {
  const g = room.game;
  const en = locale === 'en';
  const nameOf = (s: number) => {
    if (s === mySeat) return t.you;
    const style = room.seats[s]?.id.startsWith('ai-') ? room.style[s] : null;
    return style ? (en ? HS_PERSONA[style].nameEn : HS_PERSONA[style].name) : room.seats[s]?.name ?? `P${s + 1}`;
  };
  const order = Array.from({ length: HS_PLAYERS }, (_, s) => s).filter((s) => !g.absent?.[s]).sort((a, b) => (g.place[a] ?? 9) - (g.place[b] ?? 9) || g.chips[b] - g.chips[a]);
  const winner = order[0];
  const myPlace = mySeat === null ? null : g.place[mySeat];
  return (
    <div className={`${MODAL_BACKDROP} !z-[80]`}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${MODAL} max-w-md text-white`}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{g.phase === 'finished' ? t.final : t.knockedOutKicker} · {t.rounds(g.round)}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${myPlace === 1 ? 'text-[#ffd36b]' : STEEL_TEXT}`}>
          {myPlace === 1 ? t.youWin : myPlace ? t.youPlace(myPlace) : t.winnerIs(nameOf(winner))}
        </h2>
        {g.phase !== 'finished' && <p className="mt-2 text-xs font-bold text-white/45">{t.othersPlaying}</p>}
        <ol className="mt-5 space-y-1.5 text-left">
          {order.map((s, i) => {
            const persona = room.seats[s]?.id.startsWith('ai-') && room.style[s] ? HS_PERSONA[room.style[s]!] : null;
            return (
              <motion.li key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${i === 0 ? 'border-[#ffd36b]/50 bg-[#ffd36b]/10' : s === mySeat ? 'border-(--accent)/40 bg-(--accent)/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
                <span className={`w-6 font-mono text-lg font-black ${i === 0 ? 'text-[#ffd36b]' : 'text-white/40'}`}>{g.place[s] ?? '–'}</span>
                <HsAvatar name={nameOf(s)} color={persona?.color} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm font-black">{nameOf(s)}</span>
                {i === 0 && <Crown size={16} className="text-[#ffd36b]" />}
                <HsChip n={g.chips[s]} className="text-xs text-white/70" />
              </motion.li>
            );
          })}
        </ol>
        <ResultActions won={myPlace === null ? undefined : myPlace === 1} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/hit-stay" exitPath="/hit-stay" primaryClass={RESULT_PRIMARY} />
      </motion.div>
    </div>
  );
}
