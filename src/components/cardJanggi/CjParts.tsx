"use client";

import { motion } from 'framer-motion';
import { Crown, Flag } from 'lucide-react';
import { CJ_CELLS, CJ_H, CJ_W, type CjGame, KING_HOME, cellOf, isKing, seatOfPiece, startBoard, xOf, yOf } from '@/lib/cardJanggi';
import { sideColor } from './copy';

export const CARD_EMOJI = ['🐭', '🐴', '🐵', '🐘', '🦒'];

/** The cells lit on a card's 5×5 diagram (centre = the piece), as printed on the show's cards. */
const PATTERN: [number, number][][] = [
  [[1, 0], [-1, 0], [0, 1], [0, -1]],
  [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
  [[1, 1], [1, -1], [-1, 1], [-1, -1], [2, 2], [2, -2], [-2, 2], [-2, -2]],
  [[2, 0], [-2, 0], [0, 2], [0, -2]],
];
const LIT = PATTERN.map((cells) => new Set(cells.map(([dx, dy]) => (dy + 2) * 5 + dx + 2)));

/**
 * A face-up movement card: its 5×5 move diagram in the side's colour, the animal in the middle and its name.
 * `size` is the card width in px.
 */
export function CjCardFace({ card, seat, size = 56, name, dim = false, glow = false }: { card: number; seat: number; size?: number; name?: string; dim?: boolean; glow?: boolean }) {
  const color = sideColor(seat);
  const pad = Math.max(2, Math.round(size * 0.07));
  return (
    <span
      className={`relative inline-flex shrink-0 flex-col items-stretch rounded-[7px] transition ${dim ? 'opacity-35 saturate-50' : ''}`}
      style={{ width: size, padding: pad, background: color, boxShadow: glow ? `0 0 0 2px #fff, 0 0 18px ${color}` : '0 2px 6px rgba(0,0,0,.45)' }}
    >
      <span className="grid aspect-square grid-cols-5 gap-px rounded-[3px] bg-[#c9c4d6]/70 p-px">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className="flex items-center justify-center rounded-[1px]" style={{ background: i === 12 ? color : LIT[card]?.has(i) ? '#a49dba' : '#f5f3fa' }}>
            {i === 12 && <span style={{ fontSize: Math.max(7, size * 0.15), lineHeight: 1 }}>{CARD_EMOJI[card]}</span>}
          </span>
        ))}
      </span>
      {name && <span className="mt-[2px] truncate text-center font-black leading-none text-white" style={{ fontSize: Math.max(8, Math.round(size * 0.17)) }}>{name}</span>}
    </span>
  );
}

/** A face-down card. */
export function CjCardBack({ seat, size = 56, label }: { seat: number; size?: number; label?: string }) {
  const color = sideColor(seat);
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,.45)]"
      style={{ width: size, aspectRatio: '1 / 1.16', background: `repeating-linear-gradient(45deg, ${color} 0 6px, color-mix(in srgb, ${color} 82%, #000) 6px 12px)` }}>
      <span className="flex items-center justify-center rounded-full border-2 border-white/80" style={{ width: size * 0.5, height: size * 0.5 }}>
        <span className="rotate-45 bg-white/85" style={{ width: size * 0.16, height: size * 0.16 }} />
      </span>
      {label && <span className="absolute bottom-0.5 font-mono font-black text-white/90" style={{ fontSize: Math.max(8, size * 0.17) }}>{label}</span>}
    </span>
  );
}

/** An empty slot in a layout. */
export function CjCardSlot({ size = 56, label, active = false }: { size?: number; label?: string; active?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-[7px] border-2 border-dashed font-mono text-sm font-black ${active ? 'border-(--accent) text-(--accent)' : 'border-white/15 text-white/25'}`}
      style={{ width: size, aspectRatio: '1 / 1.16' }}>{label}</span>
  );
}

export function CjPiece({ seat, king, size = '100%' }: { seat: number; king: boolean; size?: string | number }) {
  const color = sideColor(seat);
  return king ? (
    <span className="flex items-center justify-center rounded-full border-2 border-white/90 shadow-[0_4px_10px_rgba(0,0,0,.55)]" style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 70%, #fff), ${color} 55%, color-mix(in srgb, ${color} 70%, #000))` }}>
      <Crown className="h-[56%] w-[56%] text-white drop-shadow" strokeWidth={2.6} />
    </span>
  ) : (
    <span className="block rounded-[18%] border border-white/40 shadow-[0_4px_10px_rgba(0,0,0,.5)]" style={{ width: size, height: size, background: `linear-gradient(160deg, color-mix(in srgb, ${color} 80%, #fff), ${color} 50%, color-mix(in srgb, ${color} 75%, #000))` }} />
  );
}

/** Stable ids for the pieces (by start square), replayed through the round's moves, so moves can animate. */
export function pieceIds(g: CjGame): Map<number, number> {
  const ids = new Map<number, number>();
  startBoard().forEach((p, cell) => { if (p) ids.set(cell, cell); });
  for (const m of g.history) {
    if (m.pass || m.from < 0) continue;
    const id = ids.get(m.from);
    ids.delete(m.from);
    if (id !== undefined) ids.set(m.to, id);
  }
  return ids;
}

/**
 * The board, turned so that `viewer`'s side is at the bottom: 5 columns × 6 rows on screen.
 * Engine x (0–5, seat 0's side first) runs up the screen for seat 0 and down for seat 1.
 */
export function CjBoard({ g, viewer, selected, targets = [], selectable = [], onCell, flash, labels, hints = [], hintSeat = viewer }: {
  g: CjGame;
  viewer: number;
  selected?: number | null;
  targets?: number[];
  selectable?: number[];
  onCell?: (cell: number) => void;
  flash?: { cell: number; key: string } | null;
  labels: { goal: string; home: string };
  hints?: number[]; // squares a previewed card reaches (from `hintSeat`'s pieces)
  hintSeat?: number;
}) {
  const flip = viewer === 1;
  // screen (col c, row r) → engine cell
  const cellAt = (c: number, r: number) => (flip ? cellOf(r, CJ_H - 1 - c) : cellOf(CJ_W - 1 - r, c));
  const posOf = (cell: number) => (flip ? { c: CJ_H - 1 - yOf(cell), r: xOf(cell) } : { c: yOf(cell), r: CJ_W - 1 - xOf(cell) });
  const ids = pieceIds(g);
  const last = [...g.history].reverse().find((m) => !m.pass);
  const goal = KING_HOME[1 - viewer], home = KING_HOME[viewer];
  const W = 100 / CJ_H, H = 100 / CJ_W;
  const pieces = Array.from({ length: CJ_CELLS }, (_, cell) => cell).filter((cell) => g.board[cell]);
  return (
    <div className="relative aspect-[5/6] w-full select-none rounded-[14px] border border-[#6d5bd0]/50 bg-[#2b2456] p-[2.5%] shadow-[0_20px_50px_rgba(0,0,0,.55),inset_0_0_40px_rgba(0,0,0,.35)]">
      <div className="relative h-full w-full">
        {Array.from({ length: CJ_W }, (_, r) => Array.from({ length: CJ_H }, (_, c) => {
          const cell = cellAt(c, r);
          const isTarget = targets.includes(cell);
          const canPick = selectable.includes(cell);
          const isLast = last && (last.from === cell || last.to === cell);
          return (
            <button
              key={cell} type="button" tabIndex={onCell && (isTarget || canPick) ? 0 : -1} aria-label={`${xOf(cell) + 1}-${yOf(cell) + 1}`}
              onClick={() => onCell?.(cell)}
              className={`absolute border border-[#8f82e6]/35 ${isLast ? 'bg-[#ffd36b]/14' : cell === goal ? 'bg-(--accent)/12' : 'bg-[#3a3172]/60'} ${onCell ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ left: `${c * W}%`, top: `${r * H}%`, width: `${W}%`, height: `${H}%` }}
            >
              {cell === goal && !g.board[cell] && <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-(--accent)/80"><Flag size={16} strokeWidth={2.4} /><span className="text-[9px] font-black">{labels.goal}</span></span>}
              {cell === home && !g.board[cell] && <span className="absolute inset-[18%] rounded-full border-2 border-dashed" style={{ borderColor: `${sideColor(viewer)}88` }} aria-label={labels.home} />}
              {isTarget && (
                <span className={`absolute inset-0 flex items-center justify-center ${g.board[cell] ? '' : ''}`}>
                  {g.board[cell]
                    ? <span className="absolute inset-[6%] animate-pulse rounded-[10px] border-[3px] border-[#ffd36b]" />
                    : <span className="h-[30%] w-[30%] rounded-full bg-[#ffd36b] shadow-[0_0_14px_#ffd36b]" />}
                </span>
              )}
              {canPick && selected !== cell && <span className="absolute inset-[5%] rounded-[10px] border-2 border-white/35" />}
              {hints.includes(cell) && (g.board[cell]
                ? <span className="absolute inset-[4%] z-[1] rounded-[10px] border-[3px]" style={{ borderColor: hintSeat === viewer ? '#5ee7ff' : '#ff4f5e', boxShadow: `0 0 12px ${hintSeat === viewer ? '#5ee7ff' : '#ff4f5e'}` }} />
                : <span className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: hintSeat === viewer ? '#5ee7ff' : '#ff8a96', boxShadow: `0 0 10px ${hintSeat === viewer ? '#5ee7ff' : '#ff4f5e'}` }} />)}
            </button>
          );
        }))}
        {pieces.map((cell) => {
          const p = g.board[cell];
          const { c, r } = posOf(cell);
          return (
            <motion.span
              key={ids.get(cell) ?? `c${cell}`} initial={false} animate={{ left: `${c * W}%`, top: `${r * H}%` }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="pointer-events-none absolute flex items-center justify-center" style={{ width: `${W}%`, height: `${H}%` }}
            >
              <span className={`flex h-[70%] w-[70%] items-center justify-center transition ${selected === cell ? 'scale-110 drop-shadow-[0_0_10px_#ffd36b]' : ''}`}>
                <CjPiece seat={seatOfPiece(p)} king={isKing(p)} />
              </span>
            </motion.span>
          );
        })}
        {flash && (() => {
          const { c, r } = posOf(flash.cell);
          return <span key={flash.key} className="pointer-events-none absolute animate-[poFlash_.7s_ease-out_forwards] rounded-full bg-[#ffd36b]/70" style={{ left: `${c * W + W * 0.15}%`, top: `${r * H + H * 0.15}%`, width: `${W * 0.7}%`, height: `${H * 0.7}%` }} />;
        })()}
      </div>
    </div>
  );
}

/** Square name from `viewer`'s side: columns a–e left to right, rows 1–6 from the bottom. */
export function squareName(cell: number, viewer: number) {
  const c = viewer === 1 ? CJ_H - 1 - yOf(cell) : yOf(cell);
  const r = viewer === 1 ? CJ_W - xOf(cell) : xOf(cell) + 1;
  return `${'abcde'[c]}${r}`;
}
