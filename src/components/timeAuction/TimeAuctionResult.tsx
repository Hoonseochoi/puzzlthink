"use client";

import { useEffect } from 'react';
import { Crown, Skull, X } from 'lucide-react';
import { taClock, taStandings } from '@/lib/timeAuction';
import type { TaRoom } from '@/lib/timeAuctionRoom';
import { reportGame } from '@/lib/stats';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';
import type { TaCopy } from './copy';
import { taColor, taName } from './TimeAuctionTable';

/** Records my result when the match ends: 1st place is a win, anything else a loss (survival kept in the detail). */
export function useTaReport(room: TaRoom | null, mySeat: number | null, mode: 'ai' | 'friend') {
  const done = room?.phase === 'finished' && room.game.phase === 'finished';
  const gid = room?.game.gid;
  useEffect(() => {
    if (!done || !room || mySeat === null || !room.game.inGame[mySeat]) return;
    const g = room.game;
    const st = taStandings(g);
    const place = st.place[mySeat] ?? 0;
    reportGame(`time_auction-${mode}-${gid}-${mySeat}`, 'time_auction', mode, place === 1 ? 'win' : 'loss', {
      place, tokens: g.tokens[mySeat], left: g.bank[mySeat], out: st.eliminated.includes(mySeat), format: g.format,
      players: g.inGame.filter(Boolean).length, ...(room.ai.some(Boolean) ? { level: room.level } : {}),
      ...(mode === 'friend' ? { humans: room.ai.filter((ai, i) => !ai && room.seats[i]).length } : {}),
    }, { revealDelayMs: 1200 });
  }, [done, gid, mySeat, mode, room]);
}

/** Final standings and every bid of the match, revealed. */
export default function TimeAuctionResult({ room, mySeat, t, locale, onAgain, onClose, waitingLabel }: {
  room: TaRoom; mySeat: number | null; t: TaCopy; locale: string; onAgain?: () => void; onClose: () => void; waitingLabel?: string;
}) {
  const en = locale === 'en';
  const g = room.game;
  const st = taStandings(g);
  const seats = st.order;
  const mine = mySeat !== null && g.inGame[mySeat] ? mySeat : null;
  const headline = mine === null ? t.resultTitle : st.eliminated.includes(mine) ? t.meOut : st.piece === mine ? t.meWin : t.meSafe;
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-h-[92vh] max-w-xl overflow-y-auto text-left text-white`} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={KICKER}>{t.resultTitle}</p>
        <h2 className={`mt-1 text-2xl font-black ${STEEL_TEXT}`}>{headline}</h2>
        {st.piece === null && <p className="mt-1 text-[11px] text-white/45">{t.noPiece}</p>}
        <ol className="mt-4 grid gap-1.5">
          {seats.map((s) => {
            const out = st.eliminated.includes(s);
            return (
              <li key={s} className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2 ${s === mine ? 'border-(--accent)/60 bg-(--accent)/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <b className="w-8 font-mono text-sm text-white/60">{t.place(st.place[s]!)}</b>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: taColor(room, s) }} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{taName(room, s, t, en, mySeat)}</span>
                {st.piece === s && <span className="flex items-center gap-1 rounded-full bg-[#ffd36b] px-2 py-0.5 text-[10px] font-black text-black"><Crown size={11} />{t.piece}</span>}
                {out && <span className="flex items-center gap-1 rounded-full bg-[#ff3b30] px-2 py-0.5 text-[10px] font-black text-white"><Skull size={11} />{t.eliminated}</span>}
                <span className="font-mono text-sm font-black text-(--accent)">{g.tokens[s]}</span>
                <span className="w-16 text-right font-mono text-[11px] text-white/55">{taClock(g.bank[s])}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 text-right text-[10px] text-white/35">{t.tokens} · {t.left}</p>
        <p className={`${KICKER} mt-5`}>{t.reveal}</p>
        <div className="mt-2 overflow-x-auto rounded-[10px] border border-white/10">
          <table className="w-full min-w-[420px] border-collapse text-[11px]">
            <thead><tr className="bg-white/[0.05] text-white/55">
              <th className="px-1.5 py-1 text-left font-mono">R</th>
              {seats.map((s) => <th key={s} className="max-w-[70px] truncate px-1.5 py-1 text-right font-bold" style={{ color: taColor(room, s) }}>{taName(room, s, t, en, mySeat)}</th>)}
            </tr></thead>
            <tbody>
              {g.log.map((r) => (
                <tr key={r.round} className="odd:bg-white/[0.02]">
                  <td className="px-1.5 py-0.5 font-mono text-white/35">{r.round}</td>
                  {seats.map((s) => {
                    const b = r.bids[s] ?? 0;
                    const win = r.outcome === 'won' && r.winner === s;
                    return <td key={s} className={`px-1.5 py-0.5 text-right font-mono tabular-nums ${win ? 'font-black text-(--accent)' : b ? 'text-white/70' : 'text-white/20'}`}>{b ? taClock(b) : '·'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          <ResultActions won={mine === null ? undefined : st.place[mine] === 1} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/time-auction" exitPath="/time-auction" primaryClass={RESULT_PRIMARY} />
        </div>
      </div>
    </div>
  );
}
