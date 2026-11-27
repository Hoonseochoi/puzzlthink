"use client";

import { useEffect } from 'react';
import { History, X } from 'lucide-react';
import { type MoSeat, other, treasuresBy } from '@/lib/mineOblivion';
import type { MoRoom } from '@/lib/mineOblivionRoom';
import { reportGame } from '@/lib/stats';
import { REVEAL_MS } from '@/hooks/useEndReveal';
import ResultActions from '../ResultActions';
import { BTN, KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import { type MoCopy, endingText } from './copy';
import { MineStone, TreasureStone, WALKER, WalkerStone } from './MineStones';
import { moName } from './MineOblivionTable';
import { playWin } from './sound';

/** Mines each seat stepped on, and how many of them were its own (known once the game is over). */
export function blastStats(room: MoRoom, seat: MoSeat) {
  const g = room.game;
  const own = new Set(g.buried[seat]);
  const hits = g.log.filter((s) => s.seat === seat && s.kind === 'mine');
  return { hits: hits.length, own: hits.filter((s) => own.has(s.to)).length };
}

/** Records my result when the match ends. */
export function useMoReport(room: MoRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const done = room?.phase === 'finished' && room.game.phase === 'finished';
  const gid = room?.game.gid;
  useEffect(() => {
    if (!done || !room || (mySeat !== 0 && mySeat !== 1)) return;
    const g = room.game;
    const me = mySeat as MoSeat;
    const result = g.winner === null ? 'draw' : g.winner === me ? 'win' : 'loss';
    const b = blastStats(room, me);
    if (result === 'win') playWin();
    reportGame(`mine_oblivion-${mode}-${gid}-${me}`, 'mine_oblivion', mode, result, {
      score: g.score[me], opp: g.score[other(me)], treasures: treasuresBy(g, me), blasts: b.hits, ownBlasts: b.own,
      moves: g.log.length, ending: g.ending, first: g.first === me,
      ...(room.ai.some(Boolean) && mode === 'ai' ? { level: room.level } : {}),
    }, { revealDelayMs: REVEAL_MS + 300 });
  }, [done, gid, mySeat, mode, room]);
}

export default function MineOblivionResult({ room, mySeat, t, onAgain, onClose, onReplay, waitingLabel }: {
  room: MoRoom; mySeat: number | null; t: MoCopy; onAgain?: () => void; onClose: () => void; onReplay?: () => void; waitingLabel?: string;
}) {
  const g = room.game;
  const me = mySeat === 0 || mySeat === 1 ? (mySeat as MoSeat) : null;
  const headline = g.winner === null ? t.draw : me === null ? t.win(moName(room, g.winner, mySeat, t)) : g.winner === me ? t.winYou : t.loseYou;
  const order: MoSeat[] = me === null ? [0, 1] : [me, other(me)];
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{t.resultTitle}</p>
        <h2 className={`mt-1 text-3xl font-black ${STEEL_TEXT}`}>{headline}</h2>
        <p className="mt-1 text-[12px] text-white/55">{endingText(t, g.ending, g.log.length, g.resigned !== undefined ? moName(room, g.resigned, mySeat, t) : '')}</p>
        <div className="mt-4 grid gap-2">
          {order.map((s) => {
            const b = blastStats(room, s);
            const won = g.winner === s;
            return (
              <div key={s} className={`flex items-center gap-3 rounded-[12px] border px-3 py-2.5 ${won ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <WalkerStone seat={s} size={40} glow={won} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{moName(room, s, mySeat, t)}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/55">
                    <span className="flex items-center gap-1"><TreasureStone size={14} />{t.stats.treasures} {treasuresBy(g, s)}</span>
                    <span className="flex items-center gap-1"><MineStone size={14} state="blast" />{t.stats.blasts} {b.hits}{b.own ? ` (${t.stats.own} ${b.own})` : ''}</span>
                  </p>
                </div>
                <b className="font-mono text-3xl font-black tabular-nums" style={{ color: WALKER[s].color }}>{g.score[s]}</b>
              </div>
            );
          })}
        </div>
        <p className="mt-3 break-keep text-[11px] leading-4 text-white/45">{t.replayAll}</p>
        <div className="mt-4">
          <ResultActions won={me === null || g.winner === null ? undefined : g.winner === me} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/mine-of-oblivion" exitPath="/mine-of-oblivion" primaryClass={RESULT_PRIMARY}
            replay={onReplay ? <button type="button" onClick={onReplay} className={`${BTN} w-full py-3`}><History size={14} />{t.replay}</button> : undefined} />
        </div>
      </div>
    </div>
  );
}
