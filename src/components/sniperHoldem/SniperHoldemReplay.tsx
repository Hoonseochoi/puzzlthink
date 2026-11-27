"use client";

import { useState } from 'react';
import { type ShEvent, type ShRoundLog, type ShTarget, type SniperHoldem, SH_SEATS, shEvaluate, shTargetOf, shVisible } from '@/lib/sniperHoldem';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayControls, ReplayHeader } from '../ui/ReplayBar';
import type { ShCopy } from './copy';
import { Scope, ShCard, ShChip } from './SniperHoldemParts';
import { logLine } from './SniperHoldemTable';

/** What this browser saw of one round: the cards it could see and the round's moves in order. */
export type ShSeen = { round: number; board: (number | null)[]; hands: (number[] | null)[]; events: ShEvent[] };
type Recording = { gid: string | null; seq: number; rounds: Record<number, ShSeen> };

/** The current round's events, oldest first (the log is newest first and starts each round with a 'round' event). */
function roundEvents(g: SniperHoldem): ShEvent[] {
  const out: ShEvent[] = [];
  for (const e of g.log) { if (e.k === 'round') break; out.push(e); }
  return out.reverse();
}

/**
 * Records each round as it is played, for the 복기. `revealAll` (the AI match, where every card is in this browser
 * anyway and only AIs are at the table): everyone's private cards. Otherwise only what `viewer` could see — their own
 * cards and the hands shown down — so a room never shows a folded player's cards.
 * Kept in memory only: after a reload the 복기 falls back to the match record (hands shown down and what each put in).
 */
export function useShReplayRecorder(g: SniperHoldem | null | undefined, viewer: number | null, revealAll: boolean): Record<number, ShSeen> {
  const [rec, setRec] = useState<Recording>({ gid: null, seq: -1, rounds: {} });
  const gid = g?.gid ?? null;
  if (g && (rec.gid !== gid || rec.seq !== g.seq)) {
    const fresh = rec.gid !== gid;
    const prev = fresh ? undefined : rec.rounds[g.round];
    const hands = Array.from({ length: SH_SEATS }, (_, s) => {
      const h = g.hands[s];
      if (!h || h.length < 2 || h.some((c) => c === null)) return prev?.hands[s] ?? null;
      return revealAll || shVisible(g, viewer, s) ? (h as number[]) : prev?.hands[s] ?? null;
    });
    const seen: ShSeen = { round: g.round, board: g.board.slice(0, 4).map((c, i) => (i < g.shown ? c : prev?.board[i] ?? null)), hands, events: roundEvents(g) };
    // Keep the longest event list seen for the round (the log is capped, so a late snapshot could be shorter).
    if (prev && prev.events.length > seen.events.length) seen.events = prev.events;
    setRec({ gid, seq: g.seq, rounds: { ...(fresh ? {} : rec.rounds), [g.round]: seen } });
  }
  return rec.gid === gid ? rec.rounds : {};
}

/** 복기: every finished round of the match, one at a time — cards, the bets in order, the snipes, who took the pot. */
export function SniperHoldemReplay({ g, seen, t, nameOf, mySeat, onClose, onShowResult }: {
  g: SniperHoldem; seen: Record<number, ShSeen>; t: ShCopy; nameOf: (s: number) => string; mySeat: number | null;
  onClose: () => void; onShowResult: () => void;
}) {
  const rounds = g.rounds;
  const player = useReplayPlayer(rounds.length, true, 2600);
  const r: ShRoundLog | null = player.at > 0 ? rounds[player.at - 1] : null;
  const detail = r ? seen[r.round] : undefined;
  const seats = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => !g.absent?.[s]);
  const before = r ? (player.at > 1 ? rounds[player.at - 2].chips : null) : null;
  const caption = r ? `${t.rp.hand(r.round)} · ${r.winners.map(nameOf).join(' · ')} ${r.winners.length > 1 ? t.split : t.winner}` : t.rp.start(g.startChips);

  const cardsOf = (s: number): number[] | null => r?.hands[s] ?? detail?.hands[s] ?? null;
  const board = r ? r.board : [];
  const events = detail?.events ?? [];
  const bets = events.filter((e) => e.k === 'call' || e.k === 'raise' || e.k === 'fold' || e.k === 'board');
  const folded = new Set(events.filter((e): e is Extract<ShEvent, { k: 'fold' }> => e.k === 'fold').map((e) => e.seat));
  const playedIn = (s: number) => !!r && (r.bets?.[s] ?? 0) > 0;
  const hiddenFolds = r && seats.some((s) => playedIn(s) && !cardsOf(s));

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <ReplayHeader player={player} caption={caption} onClose={onClose} />
      <div className="overflow-hidden rounded-[16px] border border-[#2f6b4f]/50 bg-[radial-gradient(ellipse_at_50%_20%,#1d4a36,#0d1f17_75%)] p-3 sm:p-4">
        {r ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-black tracking-[0.2em] text-(--accent)">{t.rp.hand(r.round)} <span className="text-white/40">· {t.first} {nameOf(r.first)}{r.ante ? ` · ${t.anteTitle} ${r.ante}` : ''}</span></p>
              <span className="flex items-center gap-1 text-[11px] font-black text-[#ffd36b]">{t.pot} <ShChip n={r.pot} className="text-sm text-[#ffd36b]" /></span>
            </div>
            <div className="flex justify-center gap-1.5 sm:gap-2.5">{[0, 1, 2, 3].map((i) => <ShCard key={`${r.round}-${i}`} value={board[i] ?? null} size="board" delay={i * 0.05} />)}</div>

            <ul className="space-y-1.5">
              {seats.filter((s) => playedIn(s)).map((s) => {
                const cards = cardsOf(s);
                const hand = r.hand[s] ?? (cards && board.length === 4 ? shEvaluate([...board, ...cards]) : null);
                const won = r.winners.includes(s);
                const said = r.snipes[s];
                const out = folded.has(s) || (!r.hand[s] && !won && r.hands.some(Boolean));
                return (
                  <li key={s} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${won ? 'bg-[#ffd36b]/12 ring-1 ring-[#ffd36b]/30' : 'bg-black/30'}`}>
                    <span className={`w-14 shrink-0 truncate text-xs font-black ${s === mySeat ? 'text-(--accent)' : 'text-white'}`}>{nameOf(s)}</span>
                    <span className="flex shrink-0 gap-[2px]">{(cards ?? [null, null]).map((c, k) => <ShCard key={k} value={c} size="xs" dim={out} mark={r.sniped[s] ? 'hit' : undefined} />)}</span>
                    <span className={`min-w-0 flex-1 truncate text-[12px] font-black ${r.sniped[s] ? 'text-[#ff7a85] line-through' : won ? 'text-[#ffd36b]' : out ? 'text-white/40' : 'text-white/75'}`}>
                      {out ? t.rp.folded : hand ? t.label(shTargetOf(hand)) : cards ? '' : t.rp.hidden}
                    </span>
                    {said && said !== 'pass' && <span className="hidden shrink-0 items-center gap-0.5 text-[10px] font-bold text-[#ffb3ba] min-[380px]:flex"><Scope size={10} />{t.label(said as ShTarget)}</span>}
                    <span className="w-10 shrink-0 text-right font-mono text-[11px] font-bold text-white/55">{t.rp.put(r.bets?.[s] ?? 0)}</span>
                    <span className={`w-9 shrink-0 text-right font-mono text-xs font-black ${r.payouts[s] > 0 ? 'text-[#ffd36b]' : 'text-white/25'}`}>{r.payouts[s] > 0 ? `+${r.payouts[s]}` : '·'}</span>
                  </li>
                );
              })}
            </ul>
            {hiddenFolds && <p className="text-center text-[10px] text-white/40">{t.rp.hiddenNote}</p>}

            <div className="rounded-md border border-white/10 bg-black/40 px-3 py-2">
              <p className="text-[9px] font-black tracking-[.16em] text-white/35">{t.rp.bets}</p>
              {bets.length ? (
                <ol className="mt-1 space-y-0.5 text-[11.5px]">
                  <li className="pt-0.5 text-[10px] font-black text-(--accent)">{t.rp.street1}</li>
                  {bets.map((e, i) => e.k === 'board'
                    ? <li key={i} className="pt-1 text-[10px] font-black text-(--accent)">{t.rp.street2} · {e.cards.join(' · ')}</li>
                    : <li key={i} className={e.k === 'raise' ? 'font-bold text-[#ffd36b]' : e.k === 'fold' ? 'text-white/40' : 'text-white/70'}>{logLine(e, t, nameOf)}</li>)}
                </ol>
              ) : <p className="mt-1 text-[11px] text-white/45">{t.rp.noBets}</p>}
              {r.snipes.some((x) => x && x !== 'pass') && (
                <>
                  <p className="mt-2 text-[9px] font-black tracking-[.16em] text-white/35">{t.rp.snipes}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{seats.filter((s) => r.snipes[s]).map((s) => {
                    const x = r.snipes[s];
                    return <span key={s} className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-black ${x === 'pass' ? 'bg-white/5 text-white/40' : 'bg-(--accent)/15 text-[#ff9aa4]'}`}>{nameOf(s)} {x === 'pass' ? t.snipePass : <><Scope size={10} />{t.label(x as ShTarget)}</>}</span>;
                  })}</div>
                </>
              )}
            </div>

            <div className="border-t border-white/10 pt-2">
              <p className="text-[9px] font-black tracking-[.16em] text-white/35">{t.rp.chipsAfter}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{seats.map((s) => {
                const d = before ? r.chips[s] - before[s] : null;
                return <span key={s} className="text-[11px] font-bold text-white/70">{nameOf(s)} <b className="font-mono text-white">{r.chips[s]}</b>{d ? <span className={`ml-0.5 font-mono text-[10px] ${d > 0 ? 'text-[#7ef0b0]' : 'text-[#ff9aa4]'}`}>{d > 0 ? `+${d}` : d}</span> : null}</span>;
              })}</div>
            </div>
          </div>
        ) : <p className="py-16 text-center text-sm font-bold text-white/60">{t.rp.start(g.startChips)}</p>}
      </div>
      <ReplayControls player={player} onShowResult={onShowResult} />
    </div>
  );
}
