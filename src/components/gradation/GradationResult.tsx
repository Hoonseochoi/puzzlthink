"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { GR_CUPS, GR_PERSONA, grTier } from '@/lib/gradation';
import type { GradationRoom } from '@/lib/gradationRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import type { GrCopy } from './copy';
import { GrCup } from './GradationParts';

/**
 * Records the match once it is over: AI matches count as hard (Hall of Fame, certificate, pieces);
 * friend and open rooms as friend games.
 */
export function useGradationReport(room: GradationRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const g = room?.game;
  const over = room?.phase === 'finished' && !!g && g.winner !== null;
  const gid = g?.gid;
  const winner = g?.winner ?? null;
  const score = g && mySeat !== null ? `${g.score[mySeat]}-${g.score[1 - mySeat]}` : '';
  const sets = g?.set ?? 1;
  const style = room?.style ?? null;
  const resigned = room?.resigned ?? null;
  useEffect(() => {
    if (!over || !gid || mySeat === null || winner === null) return;
    const result = winner === -1 ? 'draw' : winner === mySeat ? 'win' : 'loss';
    const detail: Record<string, unknown> = { score, sets };
    if (mode === 'ai') { detail.difficulty = 'hard'; if (style) detail.ai = style; }
    if (resigned !== null) detail.resigned = resigned === mySeat ? 'me' : 'opponent';
    reportGame(`gradation-${mode}-${gid}-${mySeat}`, 'gradation', mode, result, detail, { revealDelayMs: 1200 });
  }, [over, gid, mySeat, winner, mode, score, sets, style, resigned]);
}

export default function GradationResult({ room, mySeat, t, locale, onAgain, onClose, waitingLabel }: {
  room: GradationRoom; mySeat: number | null; t: GrCopy; locale: string; onAgain?: () => void; onClose: () => void; waitingLabel?: string;
}) {
  const g = room.game;
  const en = locale === 'en';
  const me = mySeat ?? 0;
  const opp = 1 - me;
  const persona = room.style ? GR_PERSONA[room.style] : null;
  const nameOf = (s: number) => (s === mySeat ? t.you : room.ai[s] && persona ? (en ? persona.nameEn : persona.name) : room.seats[s]?.name ?? `P${s + 1}`);
  const won = g.winner === me;
  const headline = g.winner === -1 ? t.draw : mySeat === null ? t.winnerIs(nameOf(g.winner ?? 0)) : won ? t.youWin : t.youLose;
  const row = (s: number) => {
    const cups = g.rows[s];
    if (!cups) return null;
    // Which round each cup went out in (positions are known once the match is over).
    const roundOf = new Map<number, number>();
    g.log.forEach((l, i) => { if (l.pos[s] !== null) roundOf.set(l.pos[s]!, i + 1); });
    return (
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-left text-[11px] font-black text-white/60">{g.winner === s && <Crown size={12} className="text-[#ffd36b]" />}{nameOf(s)}</p>
        <div className="grid grid-cols-7 items-end gap-1">
          {Array.from({ length: GR_CUPS }, (_, p) => (
            <div key={p} className="flex flex-col items-center">
              <GrCup fluid tier={grTier(p)} value={cups[p]} />
              <span className="font-mono text-[9px] font-bold text-white/35">{roundOf.has(p) ? `R${roundOf.get(p)}` : '–'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className={`${MODAL_BACKDROP} !z-[80]`}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${MODAL} max-w-md text-white`}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{t.final}{g.set > 1 ? ` · ${t.rematchNote(g.set - 1)}` : ''}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${won ? 'text-[#ffd36b]' : STEEL_TEXT}`}>{headline}</h2>
        {room.resigned !== null && <p className="mt-1 text-xs font-bold text-white/45">{t.resigned(nameOf(room.resigned))}</p>}
        <div className="mx-auto mt-4 flex w-fit overflow-hidden rounded-md border border-[#cbb6ff]/40 bg-black/50 font-serif text-4xl font-bold">
          <span className={`w-14 py-1.5 ${won ? 'text-(--accent)' : 'text-white'}`}>{g.score[me]}</span>
          <span className="w-px bg-[#cbb6ff]/40" />
          <span className={`w-14 py-1.5 ${g.winner === opp ? 'text-[#ff8a7a]' : 'text-white'}`}>{g.score[opp]}</span>
        </div>
        {g.rows[0] && g.rows[1] && (
          <div className="mt-5 space-y-3 rounded-[12px] border border-white/10 bg-black/30 p-3">
            <p className="text-left text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{t.bothRows}</p>
            {row(me)}
            {row(opp)}
          </div>
        )}
        <ResultActions won={mySeat === null || g.winner === -1 ? undefined : won} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/gradation" primaryClass={RESULT_PRIMARY} />
      </motion.div>
    </div>
  );
}
