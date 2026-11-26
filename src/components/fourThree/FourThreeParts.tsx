"use client";

import { type Board, CELLS, MAX_HEIGHT, SIZE, top } from '@/lib/fourThree';
import PieceStone from '../PieceStone';

export const FT_ACCENT = '#ffb52e';
export const FT_INK = '#2a1a00';
/** Seat / colour order: red, yellow, green, blue. */
export const FT_COLORS = ['#ff4d5e', '#ffc93c', '#3ddc84', '#3f8cff'] as const;
const DARK = ['#a3122a', '#b5850b', '#17904e', '#1d55b8'];
const LIGHT = ['#ffb3bb', '#fff0b3', '#b8f5d2', '#b9d4ff'];
export const COLOR_KEYS = ['red', 'yellow', 'green', 'blue'] as const;

/** A piece: a glossy disc in its colour with the PUZZLTHINK eyes. The guest's pieces wear a small star. */
export function FtPiece({ color, guest = false, className = '', ghost = false }: { color: number; guest?: boolean; className?: string; ghost?: boolean }) {
  return (
    <PieceStone seat={guest ? null : color} colors={FT_COLORS} className={`${ghost ? 'opacity-40' : ''} ${className}`}>
    <svg viewBox="0 0 100 100" className={`block h-full w-full overflow-visible ${ghost ? 'opacity-40' : ''} ${className}`} aria-hidden>
      <defs>
        <radialGradient id={`ftp-${color}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={LIGHT[color]} />
          <stop offset="50%" stopColor={FT_COLORS[color]} />
          <stop offset="100%" stopColor={DARK[color]} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="55" r="44" fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy="50" r="44" fill={`url(#ftp-${color})`} stroke={DARK[color]} strokeWidth="3" />
      <rect x="35" y="33" width="9" height="17" rx="4.5" fill="#17201e" />
      <rect x="56" y="33" width="9" height="17" rx="4.5" fill="#17201e" />
      {guest && <path d="M50 60 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5-3.4 -6.5 3.4 1.3-7.2 -5.2-5 7.2-1z" fill="#17201e" opacity=".8" />}
    </svg>
    </PieceStone>
  );
}

export type CellMark = 'place' | 'pick' | 'target' | null;

/**
 * The 4×4 board, seen slightly from the front so stacks read as towers: each piece in a cell sits a step
 * higher than the one below, and a badge shows the height. `lines` (cell triples) are drawn on top.
 */
export function FtBoard({ board, guest = -1, marks, selected = null, lastTo = null, lastFrom = null, lines = [], onCell, compact = false, className = '' }: {
  board: Board; guest?: number; marks?: CellMark[]; selected?: number | null; lastTo?: number | null; lastFrom?: number | null;
  lines?: number[][]; onCell?: (i: number) => void; compact?: boolean; className?: string;
}) {
  const centre = (i: number) => [((i % SIZE) + 0.5) * 25, (Math.floor(i / SIZE) + 0.5) * 25];
  return (
    <div className={`relative mx-auto aspect-square w-full select-none rounded-[14px] border-4 border-[#3b2a0a] p-[2%] shadow-[0_24px_60px_rgba(0,0,0,.7)] ${compact ? 'max-w-[200px]' : 'max-w-[460px]'} ${className}`}
      style={{ background: 'linear-gradient(145deg, #4a3810, #2c2008)' }}>
      <div className="relative grid h-full w-full grid-cols-4 grid-rows-4 gap-[2%]">
        {Array.from({ length: CELLS }, (_, i) => {
          const stack = board[i];
          const mark = marks?.[i] ?? null;
          const clickable = !!onCell && mark !== null;
          const t = top(stack);
          return (
            <button key={i} type="button" disabled={!clickable} onClick={() => onCell?.(i)}
              aria-label={`${'ABCD'[i % SIZE]}${Math.floor(i / SIZE) + 1}: ${stack.length ? stack.map((c) => ['R', 'Y', 'G', 'B'][c]).join('') : '-'}`}
              className={`group relative overflow-visible rounded-[8%] outline-none transition ${clickable ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-white' : 'cursor-default'}
                ${mark === 'target' ? 'bg-[#8a6a1c] ring-4 ring-inset ring-[#ffd84a]/80' : mark === 'place' ? 'bg-[#7a5d18] hover:bg-[#8f6d1f]' : 'bg-[#6b5320]'}
                ${lastTo === i ? 'shadow-[inset_0_0_0_3px_rgba(255,255,255,.55)]' : lastFrom === i ? 'shadow-[inset_0_0_0_2px_rgba(255,255,255,.25)]' : 'shadow-[inset_0_-4px_0_rgba(0,0,0,.25)]'}`}>
              {/* Lower pieces peek out below the top one. */}
              {stack.map((c, k) => {
                const lift = (k - (stack.length - 1) / 2) * 11;
                const isTop = k === stack.length - 1;
                return (
                  <span key={k} className={`absolute left-[14%] h-[72%] w-[72%] transition ${isTop && selected === i ? 'drop-shadow-[0_0_10px_rgba(255,216,74,.95)]' : ''} ${isTop && mark === 'pick' ? 'group-hover:scale-105' : ''}`}
                    style={{ top: `${14 - lift}%`, zIndex: k + 1 }}>
                    <FtPiece color={c} guest={c === guest} className={isTop ? '' : 'brightness-75'} />
                  </span>
                );
              })}
              {mark === 'pick' && selected !== i && <span className="pointer-events-none absolute inset-[6%] z-10 rounded-full border-2 border-dashed border-white/80" />}
              {selected === i && <span className="pointer-events-none absolute inset-[4%] z-10 animate-pulse rounded-full border-[3px] border-[#ffd84a]" />}
              {mark === 'target' && !stack.length && <span className="absolute inset-[30%] animate-pulse rounded-full bg-[#ffd84a]/50" />}
              {mark === 'place' && !compact && <span className="pointer-events-none absolute inset-[34%] rounded-full border-2 border-white/0 transition group-hover:border-white/50" />}
              {stack.length > 1 && (
                <span className={`absolute right-[5%] top-[5%] z-20 flex items-center gap-[2px] rounded-full bg-black/70 px-1.5 py-0.5 ${compact ? 'scale-75' : ''}`}>
                  {Array.from({ length: MAX_HEIGHT }, (_, k) => <i key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: k < stack.length ? FT_COLORS[stack[k]] : 'rgba(255,255,255,.15)' }} />)}
                </span>
              )}
              {t === -1 && !compact && <span className="absolute bottom-[6%] left-[8%] font-mono text-[9px] font-bold text-white/20">{'ABCD'[i % SIZE]}{Math.floor(i / SIZE) + 1}</span>}
            </button>
          );
        })}
        {lines.length > 0 && (
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-30 h-full w-full" aria-hidden>
            {lines.map((line, k) => {
              const [x1, y1] = centre(line[0]), [x2, y2] = centre(line[2]);
              const c = top(board[line[0]]);
              return <g key={k}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".85" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c === -1 ? '#ffd84a' : FT_COLORS[c]} strokeWidth="2.6" strokeLinecap="round" /></g>;
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

/** A row of the pieces a player still holds (five at the start). */
export function HandRow({ color, count, total = 5, guest = false }: { color: number; count: number; total?: number; guest?: boolean }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count}/${total}`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className="h-4 w-4"><FtPiece color={color} guest={guest} ghost={i >= count} /></span>)}
    </span>
  );
}
