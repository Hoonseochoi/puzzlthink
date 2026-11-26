"use client";

import { useState } from 'react';
import { MILLS, POINTS, POS, type Cell, type Move, type MorrisState, type Player, closesMill, legalMoves, placing, removable, targets } from '@/lib/morris';
import PieceStone from '../PieceStone';

export const MORRIS_ACCENT = '#3ec9d6';
export const MORRIS_INK = '#06191c';
export const BOARD_TEAL = '#2fa7b5';

/**
 * A piece: a glossy black or white disc with the PUZZLTHINK eyes (the same face as the home-page pieces).
 * `ghost` draws it faded (a preview), `doomed` marks a piece that can be removed.
 */
export function MorrisStone({ color, className = '', ghost = false, doomed = false, selected = false }: { color: Player; className?: string; ghost?: boolean; doomed?: boolean; selected?: boolean }) {
  const black = color === 0;
  // Over a player's own 바둑알: the same selection ring and removal cross.
  const overlay = (selected || doomed) ? (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      {selected && <circle cx="50" cy="50" r="57" fill="none" stroke={MORRIS_ACCENT} strokeWidth="7" className="animate-pulse" />}
      {doomed && <g stroke="#ff4d5e" strokeWidth="9" strokeLinecap="round"><line x1="22" y1="22" x2="78" y2="78" /><line x1="78" y1="22" x2="22" y2="78" /></g>}
    </svg>
  ) : null;
  return (
    <PieceStone seat={color} color={black ? '#22252d' : '#eceae4'} className={`transition ${ghost ? 'opacity-45' : ''} ${className}`} overlay={overlay}>
    <svg viewBox="0 0 100 100" className={`block h-full w-full overflow-visible transition ${ghost ? 'opacity-45' : ''} ${className}`} aria-hidden>
      <defs>
        <radialGradient id={`ms-${color}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={black ? '#5a5d66' : '#ffffff'} />
          <stop offset="55%" stopColor={black ? '#1d1f25' : '#eceae4'} />
          <stop offset="100%" stopColor={black ? '#050507' : '#b9b5aa'} />
        </radialGradient>
      </defs>
      {selected && <circle cx="50" cy="50" r="57" fill="none" stroke={MORRIS_ACCENT} strokeWidth="7" className="animate-pulse" />}
      <circle cx="50" cy="54" r="46" fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy="50" r="46" fill={`url(#ms-${color})`} stroke={black ? '#000' : '#9b978c'} strokeWidth="2" />
      <rect x="35" y="34" width="9" height="17" rx="4.5" fill={black ? '#ffffff' : '#17201e'} />
      <rect x="56" y="34" width="9" height="17" rx="4.5" fill={black ? '#ffffff' : '#17201e'} />
      {doomed && <g stroke="#ff4d5e" strokeWidth="9" strokeLinecap="round"><line x1="22" y1="22" x2="78" y2="78" /><line x1="78" y1="22" x2="22" y2="78" /></g>}
    </svg>
    </PieceStone>
  );
}

const pct = (n: number) => 7 + n * (86 / 6); // grid 0–6 → % across the board

type Mark = 'target' | 'movable' | 'remove' | null;

/**
 * The 24-point board after the broadcast: teal board, pale lines and round points with their names.
 * Click handling is left to the caller (`onPoint`); `marks` lights up points the player may use.
 */
export function MorrisBoard({ board, marks, selected, last, onPoint, labels = true, mills = true, className = '' }: {
  board: Cell[]; marks?: Mark[]; selected?: number | null; last?: Move | null; onPoint?: (i: number) => void; labels?: boolean; mills?: boolean; className?: string;
}) {
  const many = (marks?.filter((m) => m === 'target').length ?? 0) > 8;
  const lit = mills ? MILLS.filter((m) => m.every((j) => board[j] !== null && board[j] === board[m[0]])) : [];
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[640px] select-none rounded-[14px] p-[2.5%] shadow-[0_24px_60px_rgba(0,0,0,.7)] ${className}`} style={{ background: `linear-gradient(145deg, #3bb8c6, ${BOARD_TEAL} 45%, #23909d)` }}>
      <div className="relative h-full w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {MILLS.map(([a, , c], k) => <line key={k} x1={pct(POS[a].col)} y1={pct(POS[a].row)} x2={pct(POS[c].col)} y2={pct(POS[c].row)} stroke="#dff4f6" strokeWidth="1.5" strokeLinecap="round" />)}
          {lit.map(([a, , c], k) => <line key={`m${k}`} x1={pct(POS[a].col)} y1={pct(POS[a].row)} x2={pct(POS[c].col)} y2={pct(POS[c].row)} stroke="#ffd84a" strokeWidth="2.6" strokeLinecap="round" opacity=".9" />)}
          {last && last.from !== null && <line x1={pct(POS[last.from].col)} y1={pct(POS[last.from].row)} x2={pct(POS[last.to].col)} y2={pct(POS[last.to].row)} stroke="#ff8f4a" strokeWidth="1.4" strokeDasharray="2 1.6" strokeLinecap="round" />}
        </svg>
        {/* While placing, every empty point is a target: mark them softly instead of pulsing all 24. */}
        {POINTS.map((name, i) => {
          const cell = board[i];
          const mark = marks?.[i] ?? null;
          const clickable = !!onPoint && mark !== null;
          const isLast = last?.to === i;
          const removed = last?.remove === i && cell === null;
          return (
            <button key={name} type="button" disabled={!clickable} onClick={() => onPoint?.(i)} aria-label={`${name}${cell === 0 ? ' ●' : cell === 1 ? ' ○' : ''}`}
              className={`group absolute h-[11%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none ${clickable ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-white' : 'cursor-default'}`}
              style={{ left: `${pct(POS[i].col)}%`, top: `${pct(POS[i].row)}%` }}>
              <span className={`absolute inset-[6%] flex items-center justify-center rounded-full font-black transition ${mark === 'target' ? (many ? 'bg-white ring-2 ring-[#ffd84a]/55' : 'bg-white ring-4 ring-[#ffd84a]/80') : 'bg-[#e2f3f5]'} shadow-[inset_0_-3px_0_rgba(0,0,0,.12)]`}>
                {labels && <span className="font-sans text-[clamp(8px,2.2vw,15px)] tracking-tight text-[#1b4a50]">{name}</span>}
              </span>
              {mark === 'target' && cell === null && !many && <span className="absolute inset-[18%] animate-pulse rounded-full bg-[#ffd84a]/45" />}
              {removed && <span className="absolute inset-[14%] rounded-full border-2 border-dashed border-[#ff4d5e]/80" />}
              {cell !== null && (
                <span className={`absolute inset-[2%] transition group-hover:scale-105 ${isLast ? 'drop-shadow-[0_0_8px_rgba(255,216,74,.9)]' : ''}`}>
                  <MorrisStone color={cell} selected={selected === i} doomed={mark === 'remove'} />
                </span>
              )}
              {mark === 'movable' && selected !== i && <span className="pointer-events-none absolute -inset-[4%] rounded-full border-2 border-white/70" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Pieces still to be placed, as a row of small stones. */
export function HandRow({ color, count, total = 9 }: { color: Player; count: number; total?: number }) {
  return (
    <div className="flex flex-wrap gap-[3px]">
      {Array.from({ length: total }, (_, i) => <span key={i} className={`h-3.5 w-3.5 ${i < count ? '' : 'opacity-15'}`}><MorrisStone color={color} /></span>)}
    </div>
  );
}

/**
 * Two-step input: pick a point to place on (or a piece and where it goes); when that closes a mill,
 * pick the enemy piece to remove. Calls `onMove` with a complete legal move.
 */
export function useMorrisPicker(state: MorrisState, enabled: boolean, onMove: (move: Move) => void) {
  const [pick, setPick] = useState<{ key: string; from: number | null; step: { from: number | null; to: number } | null }>({ key: '', from: null, step: null });
  // A new position clears any half-made move.
  const key = `${state.board.join('')}-${state.turn}-${state.hand.join('')}-${enabled}`;
  const current = pick.key === key ? pick : { key, from: null, step: null };
  const p = state.turn;
  const legal = enabled ? legalMoves(state) : [];

  let board = state.board;
  const marks: Mark[] = state.board.map(() => null);
  if (enabled && current.step) {
    board = state.board.slice();
    if (current.step.from !== null) board[current.step.from] = null;
    board[current.step.to] = p;
    for (const r of removable(board, (1 - p) as Player)) marks[r] = 'remove';
  } else if (enabled) {
    if (placing(state)) state.board.forEach((c, i) => { if (c === null) marks[i] = 'target'; });
    else {
      for (const m of legal) if (m.from !== null) marks[m.from] = 'movable';
      if (current.from !== null) for (const t of targets(state, current.from)) marks[t] = 'target';
    }
  }

  const choose = (from: number | null, to: number) => {
    const options = legal.filter((m) => m.from === from && m.to === to);
    if (!options.length) return;
    if (options.length === 1 && options[0].remove === null) { onMove(options[0]); setPick({ key, from: null, step: null }); return; }
    setPick({ key, from, step: { from, to } });
  };

  const onPoint = (i: number) => {
    if (!enabled) return;
    if (current.step) {
      if (marks[i] === 'remove') { onMove({ ...current.step, remove: i }); setPick({ key, from: null, step: null }); }
      return;
    }
    if (placing(state)) { if (state.board[i] === null) choose(null, i); return; }
    if (state.board[i] === p) { setPick({ key, from: current.from === i ? null : i, step: null }); return; }
    if (current.from !== null && state.board[i] === null) choose(current.from, i);
  };

  const cancel = () => setPick({ key, from: null, step: null });
  const removing = enabled && !!current.step;
  // Whether the half-made move just closed a mill (for the prompt text).
  const milled = removing && current.step ? closesMill(state.board, p, current.step.from, current.step.to) : false;
  return { board, marks, selected: current.step ? current.step.to : current.from, onPoint, removing: removing && milled, cancel, step: current.step };
}
