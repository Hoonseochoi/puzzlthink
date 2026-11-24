"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CjRoom } from '@/lib/cardJanggiRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import { type CjCopy, sideColor } from './copy';

/** One record per match for this player: the match result, how many rounds, and why it ended. */
export function useCjReport(room: CjRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const done = room?.phase === 'finished' && mySeat !== null;
  const sid = room?.sid;
  useEffect(() => {
    if (!done || !room || mySeat === null) return;
    const result = room.winner === 'draw' ? 'draw' : room.winner === mySeat ? 'win' : 'loss';
    reportGame(`card_janggi-${mode}-${sid}-${room.results.length}-${room.reason}`, 'card_janggi', mode, result, {
      ...(mode === 'ai' ? { difficulty: 'hard' } : {}),
      wins: room.wins, rounds: room.results.length, reason: room.reason,
      endings: room.results.map((r) => r.reason),
    }, { revealDelayMs: 1200 });
  }, [done, room, mySeat, mode, sid]);
}

export default function CjResult({ room, mySeat, names, t, onAgain, waitingLabel, onClose, path }: {
  room: CjRoom; mySeat: number | null; names: [string, string]; t: CjCopy; onAgain?: () => void; waitingLabel?: string; onClose: () => void; path: string;
}) {
  const viewer = mySeat ?? 0;
  const won = mySeat !== null && room.winner === mySeat;
  const title = room.winner === 'draw' ? t.matchDraw : mySeat === null ? t.winnerIs(names[room.winner as number]) : won ? t.matchWin : t.matchLose;
  const why = room.reason === 'resign' || room.reason === 'idle' ? (won ? t.reason : t.reasonLost)[room.reason] : null;
  return (
    <div className={`${MODAL_BACKDROP} !z-[80]`}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${MODAL} text-white`}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>CARD JANGGI · {t.round(room.results.length)}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${won ? 'text-[#ffd36b]' : STEEL_TEXT}`}>{title}</h2>
        {why && <p className="mt-1 text-xs font-bold text-white/45">{why}</p>}
        <div className="mt-4 flex items-center justify-center gap-4 font-mono text-5xl font-black">
          <span style={{ color: sideColor(viewer) }}>{room.wins[viewer]}</span><span className="text-white/25">:</span><span style={{ color: sideColor(1 - viewer) }}>{room.wins[1 - viewer]}</span>
        </div>
        <p className="mt-1 text-[11px] font-bold text-white/40">{names[viewer]} · {names[1 - viewer]}</p>
        <ol className="mt-4 space-y-1.5 text-left">
          {room.results.map((r, i) => {
            const mine = r.winner === viewer;
            return (
              <li key={i} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px]">
                <span className="font-mono text-[10px] font-black text-white/40">R{i + 1}</span>
                <span className="text-[10px] font-bold text-white/45">{r.first === viewer ? t.firstFull : t.secondFull}</span>
                <span className="min-w-0 flex-1 truncate text-white/60">{r.reason ? (r.winner === 'draw' || mine || mySeat === null ? t.reason : t.reasonLost)[r.reason] : ''}</span>
                <b className={r.winner === 'draw' ? 'text-white/50' : mine ? 'text-[#ffd36b]' : 'text-white/45'}>{r.winner === 'draw' ? t.roundDraw : mySeat === null ? names[r.winner] : mine ? 'WIN' : 'LOSE'}</b>
              </li>
            );
          })}
        </ol>
        <div className="mt-5"><ResultActions won={mySeat === null ? undefined : won} onAgain={onAgain} waitingLabel={waitingLabel} gamePath={path} exitPath={path} primaryClass={RESULT_PRIMARY} /></div>
      </motion.div>
    </div>
  );
}
