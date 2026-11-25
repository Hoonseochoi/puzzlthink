"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CldRoom, CldSeat } from '@/lib/colorLinkDuelRoom';
import { other } from '@/lib/colorLinkDuelRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import type { CldCopy } from './copy';

/** Records the match once it is over (one record per match and seat). */
export function useCldReport(room: CldRoom | null, mySeat: CldSeat | null, mode: 'ai' | 'friend') {
  const finished = room?.phase === 'finished';
  const sid = room?.sid;
  const winner = room?.winner;
  const score = room?.score.join(':');
  const reason = room?.reason;
  const rounds = room?.log.length ?? 0;
  // Games saved before AI levels existed were played against the full AI on a board tier: they stay recorded by tier.
  const difficulty = room?.level ?? room?.tier ?? 'hard';
  const layout = room?.layout;
  useEffect(() => {
    if (!finished || !sid || mySeat === null || winner === null || winner === undefined) return;
    reportGame(`color_link_duel-${mode}-${sid}-${mySeat}`, 'color_link_duel', mode, winner === mySeat ? 'win' : 'loss',
      // The AI game's difficulty is the AI's level: 'hell' (매우 어려움) is the full AI, the one that earns black pieces.
      { score, rounds, reason, board: layout, ...(mode === 'ai' ? { difficulty } : {}) }, { revealDelayMs: 900 });
  }, [finished, sid, mySeat, winner, mode, score, rounds, reason, difficulty, layout]);
}

/** The final score, round by round, and play again. */
export default function CldResult({ room, mySeat, names, t, onAgain, onClose, waitingLabel }: {
  room: CldRoom; mySeat: CldSeat | null; names: [string, string]; t: CldCopy; onAgain?: () => void; onClose: () => void; waitingLabel?: string;
}) {
  const me = mySeat ?? 0;
  const won = mySeat !== null && room.winner === mySeat;
  return (
    <div className={`${MODAL_BACKDROP} !z-[80]`}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${MODAL} max-w-sm text-white`}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{t.final}{room.reason === 'resign' && room.winner !== null ? ` · ${t.resigned(names[other(room.winner)])}` : ''}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${won ? 'text-[#ffd36b]' : STEEL_TEXT}`}>{mySeat === null ? names[room.winner ?? 0] : won ? t.youWin : t.youLose}</h2>
        <p className="mt-3 font-mono text-5xl font-black tabular-nums">{room.score[me]}<span className="mx-2 text-white/25">:</span>{room.score[other(me)]}</p>
        <div className="mt-2 flex justify-center gap-6 text-[11px] font-bold text-white/45"><span>{names[me]}</span><span>{names[other(me)]}</span></div>
        <ol className="mt-5 space-y-1.5 text-left">
          {room.log.map((log, i) => (
            <motion.li key={log.round} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
              className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12px] ${log.winner === me ? 'border-[#ffd36b]/40 bg-[#ffd36b]/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
              <span className="font-mono text-white/40">R{log.round}</span>
              <span className={`font-black ${log.winner === me ? 'text-[#ffd36b]' : 'text-white/70'}`}>{names[log.winner]}</span>
              <span className="min-w-0 flex-1 truncate text-right text-white/40">{log.reason === 'timeout' ? t.reason.timeout(names[other(log.winner)]) : t.reason[log.reason](log.declarer !== null ? names[other(log.declarer)] : '')}</span>
            </motion.li>
          ))}
        </ol>
        <ResultActions won={mySeat === null ? undefined : won} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/color-link-duel" exitPath="/color-link-duel" primaryClass={RESULT_PRIMARY} />
      </motion.div>
    </div>
  );
}
