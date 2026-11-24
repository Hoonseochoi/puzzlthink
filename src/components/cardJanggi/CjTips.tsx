"use client";

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp, X } from 'lucide-react';
import { CJ_H, CJ_W, type CjGame, isKing, seatOfPiece, xOf, yOf } from '@/lib/cardJanggi';
import { judgeMove, type CjJudgement } from '@/lib/cardJanggiAi';
import type { CjRoundResult } from '@/lib/cardJanggiRoom';
import { type CjSpot, checkTips, spotsFor } from '@/lib/cardJanggiTips';
import { Analyzing, TipsModal, useFirstMatch } from '../ui/TipsModal';
import { accentVars } from '../ui/gameUi';
import { CJ_ACCENT, CJ_INK, type CjCopy } from './copy';
import { CARD_EMOJI, CjCardFace, CjPiece, squareName } from './CjParts';

/** The in-game "? 규칙" button: every rule in short lines and the five cards' move shapes. */
export function CjRulesTip({ t, seat }: { t: CjCopy; seat: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" title={t.rulesTitle}
        className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-black text-white/80 ring-1 ring-white/15 hover:bg-(--accent) hover:text-(--accent-ink)">
        <CircleHelp size={13} />{t.tipButton}
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={t.rulesTitle} style={accentVars(CJ_ACCENT, CJ_INK)} className="fixed inset-0 z-[75] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/10 bg-[#14161c] p-5 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-black">{t.rulesTitle}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
            </div>
            <p className="mt-4 text-[11px] font-black tracking-[0.12em] text-white/40">{t.cardsTitle}</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((c) => (
                <div key={c} className="flex flex-col items-center gap-1 text-center">
                  <CjCardFace card={c} seat={seat} size={54} name={t.cards[c]} />
                  <span className="text-[9.5px] font-bold leading-tight text-white/55">{t.cardMoves[c]}</span>
                </div>
              ))}
            </div>
            <ol className="mt-4 space-y-2 text-[13px] leading-6 text-white/75">
              {t.quick.map((rule, i) => <li key={rule} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span><span className="break-keep">{rule}</span></li>)}
            </ol>
            <p className="mt-3 rounded-md bg-white/[0.04] px-3 py-2 text-[11.5px] leading-5 text-white/55">💡 {t.peekHelp}</p>
            <p className="mt-2 text-[11px] leading-5 text-white/40">{t.notes}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** A small board (from `viewer`'s side) with the played move (red) and a better one (accent) as arrows. */
export function CjDiagram({ g, viewer, played, better }: { g: CjGame; viewer: number; played: [number, number]; better: [number, number] }) {
  const flip = viewer === 1;
  const at = (cell: number) => (flip ? { c: CJ_H - 1 - yOf(cell), r: xOf(cell) } : { c: yOf(cell), r: CJ_W - 1 - xOf(cell) });
  const arrow = ([from, to]: [number, number], color: string, id: string) => {
    const a = at(from), b = at(to);
    return (
      <g key={id}>
        <defs><marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={color} /></marker></defs>
        <line x1={a.c + 0.5} y1={a.r + 0.5} x2={b.c + 0.5} y2={b.r + 0.5} stroke={color} strokeWidth={0.12} strokeLinecap="round" markerEnd={`url(#${id})`} opacity={0.95} />
      </g>
    );
  };
  return (
    <div className="relative aspect-[5/6] w-full rounded-[10px] border border-[#6d5bd0]/50 bg-[#2b2456] p-[3%]">
      <div className="relative h-full w-full">
        {Array.from({ length: CJ_W * CJ_H }, (_, cell) => {
          const { c, r } = at(cell);
          const p = g.board[cell];
          const target = cell === better[1] ? 'ring-2 ring-inset ring-(--accent)' : cell === played[1] ? 'ring-2 ring-inset ring-[#ff5d6c]' : '';
          return (
            <span key={cell} className={`absolute flex items-center justify-center border border-[#8f82e6]/30 bg-[#3a3172]/60 ${target}`} style={{ left: `${c * 20}%`, top: `${(r * 100) / 6}%`, width: '20%', height: `${100 / 6}%` }}>
              {p ? <span className="h-[68%] w-[68%]"><CjPiece seat={seatOfPiece(p)} king={isKing(p)} /></span> : null}
            </span>
          );
        })}
        <svg viewBox="0 0 5 6" className="pointer-events-none absolute inset-0 h-full w-full">
          {arrow(played, '#ff5d6c', 'cj-played')}
          {arrow(better, CJ_ACCENT, 'cj-better')}
        </svg>
      </div>
    </div>
  );
}

const LOOK_BACK = 10; // how many of my moves to check, latest first
const BUDGET_MS = 300; // search time per position

/**
 * "필승 꿀팁": the AI replays my moves (latest first, as I saw the board then) and stops at the first one where it finds a
 * clearly better move — or a win I let go. Below, the general tips, with the ones this match bears out marked.
 */
export function CjTips({ results, seat, t, onClose }: { results: CjRoundResult[]; seat: number; t: CjCopy; onClose: () => void }) {
  const spots = useMemo(() => spotsFor(results, seat, LOOK_BACK), [results, seat]);
  const indices = useMemo(() => spots.map((_, i) => i), [spots]);
  const { done, result } = useFirstMatch<{ spot: CjSpot; verdict: CjJudgement }>(indices, (i) => {
    const verdict = judgeMove(spots[i].before, spots[i].played, BUDGET_MS);
    return verdict ? { spot: spots[i], verdict } : null;
  }, true);
  const checks = useMemo(() => checkTips(results, seat), [results, seat]);
  const describe = (g: CjGame, [from, to]: [number, number]) => {
    const piece = g.board[from], target = g.board[to];
    return `${isKing(piece) ? '👑 ' : ''}${squareName(from, seat)} → ${squareName(to, seat)}${target ? ` ✕${isKing(target) ? t.king : ''}` : ''}`;
  };
  const marked = (key: string) => {
    const value = (checks as Record<string, unknown>)[key];
    return value === true || typeof value === 'number';
  };
  const tips = [...t.tipsList].sort((a, b) => Number(marked(b.key)) - Number(marked(a.key)));
  return (
    <TipsModal title={t.tipsTitle} closeLabel={t.close} onClose={onClose}>
      {!done && <Analyzing label={t.tipsAnalyzing} />}
      {done && result && (() => {
        const { spot, verdict } = result;
        const moverN = spot.before.history.filter((m) => m.seat === seat).length + 1;
        return (
          <div className="mt-4">
            <p className="text-[11px] font-bold text-(--accent)">{t.tipsAt(spot.round + 1, moverN)} · {CARD_EMOJI[spot.card]} {t.cards[spot.card]}</p>
            <div className="mx-auto mt-3 w-48"><CjDiagram g={spot.before} viewer={seat} played={verdict.played} better={verdict.better} /></div>
            <p className="mt-2 text-center text-[10px] text-white/40">{t.tipsLegend}</p>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex gap-2 rounded-md border border-[#ff5d6c]/30 bg-[#ff5d6c]/[0.06] px-3 py-2"><dt className="shrink-0 font-black text-[#ff8a96]">{t.tipsPlayed}</dt><dd className="font-mono text-white/75">{describe(spot.before, verdict.played)}</dd></div>
              <div className="flex gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/[0.08] px-3 py-2"><dt className="shrink-0 font-black text-(--accent)">{t.tipsBetter}</dt><dd className="font-mono text-white/85">{describe(spot.before, verdict.better)}</dd></div>
            </dl>
            <p className="mt-3 text-[13px] leading-6 text-white/65">{verdict.missedWin ? t.tipsMissed : t.tipsChance(Math.round(verdict.playedChance * 100), Math.round(verdict.betterChance * 100))}</p>
          </div>
        );
      })()}
      {done && !result && <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-[13px] leading-6 text-white/60">{t.tipsNotFound}</p>}
      <section className="mt-6 border-t border-white/10 pt-4">
        <h3 className="text-xs font-black tracking-[0.14em] text-white/45">{t.tipsGeneral}</h3>
        <ol className="mt-3 space-y-3">
          {tips.map((tip, i) => (
            <li key={tip.key} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span>
              <div>
                <p className="text-[13px] font-extrabold">{tip.title}{marked(tip.key) && <span className="ml-1.5 rounded bg-[#ffd36b] px-1.5 py-px align-middle text-[9px] font-black text-black">{t.tipsThisGame}</span>}</p>
                <p className="mt-0.5 text-[12px] leading-5 text-white/55">{tip.body}</p>
                {tip.key === 'droppedCard' && checks.droppedCard !== null && <p className="mt-0.5 text-[11px] font-bold text-[#ffd36b]">{t.tipsDropped(`${CARD_EMOJI[checks.droppedCard]} ${t.cards[checks.droppedCard]}`)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </TipsModal>
  );
}
