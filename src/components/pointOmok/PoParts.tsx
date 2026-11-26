"use client";

import { useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { PO_SIZE, colOf, coordinate, rowOf, type PoBoard as Board, type PoLine } from '@/lib/pointOmok';
import PieceStone from '../PieceStone';

export const PO_ACCENT = '#ff5d8f';
export const PO_INK = '#22060f';
/** Point labels ①②③ in line order. */
export const POINT_MARKS = ['1', '2', '3'];

const MARGIN = 4.6;
const SPAN = 100 - MARGIN * 2;
const at = (v: number) => MARGIN + v * (SPAN / (PO_SIZE - 1));
const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

/** A go stone: seat 0 black, seat 1 white; a player's own 바둑알 inside a black or white ring when they have one. */
export function PoStone({ seat, className = '' }: { seat: number; className?: string }) {
  return (
    <PieceStone seat={seat} color={seat === 0 ? '#22252d' : '#e9ecf2'} className={className}>
    <span
      className={`block h-full w-full rounded-full ${seat === 0 ? 'border border-white/15 shadow-[0_3px_8px_rgba(0,0,0,.7)]' : 'border border-white/80 shadow-[0_3px_8px_rgba(0,0,0,.45)]'} ${className}`}
      style={{ background: seat === 0 ? 'radial-gradient(circle at 34% 30%, #5a5f6b 0%, #15171c 45%, #050507 100%)' : 'radial-gradient(circle at 34% 30%, #ffffff 0%, #e9ecf2 45%, #aab1be 100%)' }}
    />
    </PieceStone>
  );
}

/**
 * The 15×15 board. Shows only what is public: the stones, the points put up this round, the points being picked,
 * and the stones that just landed (`dropped`, animated). Labels name the coordinate and, for a stone, its colour.
 */
export function PoBoardView({ board, triple, picked = [], hints = [], interactive = false, dropped, lines, onTap, stoneLabel }: {
  board: Board;
  triple?: readonly number[] | null;
  picked?: number[];
  hints?: number[];
  interactive?: boolean;
  dropped?: { cells: readonly number[]; key: string } | null;
  lines?: PoLine[] | null;
  onTap?: (cell: number) => void;
  stoneLabel: (seat: number) => string;
}) {
  const hintSet = new Set(hints);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[720px] select-none rounded-[10px] bg-gradient-to-br from-[#ff5d8f] via-[#2a2233] to-[#5b8cff] p-[2px] shadow-[0_24px_60px_rgba(0,0,0,.75)]">
      <div className="absolute inset-[2px] overflow-hidden rounded-[8px] bg-[#12131a]" style={{ backgroundImage: 'radial-gradient(circle at 50% 42%, rgba(255,93,143,.09), transparent 55%), linear-gradient(150deg,#171824,#0b0c11)' }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {Array.from({ length: PO_SIZE }, (_, i) => (
            <g key={i}>
              <line x1={at(i)} y1={at(0)} x2={at(i)} y2={at(PO_SIZE - 1)} stroke="#c9cfe3" strokeOpacity=".22" strokeWidth=".28" />
              <line x1={at(0)} y1={at(i)} x2={at(PO_SIZE - 1)} y2={at(i)} stroke="#c9cfe3" strokeOpacity=".22" strokeWidth=".28" />
            </g>
          ))}
          {STARS.map(([r, c]) => <circle key={`${r}-${c}`} cx={at(c)} cy={at(r)} r=".7" fill="#c9cfe3" fillOpacity=".45" />)}
        </svg>
        {board.map((seat, cell) => {
          const r = rowOf(cell), c = colOf(cell);
          const point = triple ? triple.indexOf(cell) : -1;
          const pick = picked.indexOf(cell);
          const hint = hintSet.has(cell);
          const drop = dropped?.cells.includes(cell);
          const can = interactive && seat < 0;
          return (
            <button
              key={cell} type="button" disabled={!can}
              aria-label={seat >= 0 ? `${coordinate(cell)} ${stoneLabel(seat)}` : point >= 0 ? `${coordinate(cell)} ${POINT_MARKS[point]}` : coordinate(cell)}
              aria-pressed={can ? pick >= 0 : undefined}
              onClick={() => onTap?.(cell)}
              className={`absolute z-10 h-[6.4%] w-[6.4%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none ${can ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70' : ''}`}
              style={{ left: `${at(c)}%`, top: `${at(r)}%` }}
            >
              {seat >= 0 && <span className={`absolute inset-[4%] ${drop ? 'po-drop' : ''}`} key={drop ? dropped!.key : 'still'}><PoStone seat={seat} /></span>}
              {drop && <span key={`f-${dropped!.key}`} className="po-flash pointer-events-none absolute inset-0 rounded-full border-2 border-(--accent)" />}
              {seat < 0 && point >= 0 && (
                <span className="po-breathe absolute inset-[8%] flex items-center justify-center rounded-full bg-(--accent)/25 font-mono text-[min(2.6vw,15px)] font-black text-white">{POINT_MARKS[point]}</span>
              )}
              {seat < 0 && point < 0 && pick >= 0 && (
                <span className="absolute inset-[6%] flex items-center justify-center rounded-full border-2 border-(--accent) bg-(--accent)/35 font-mono text-[min(2.6vw,15px)] font-black text-white shadow-[0_0_12px_var(--accent-glow)]">✓</span>
              )}
              {seat < 0 && point < 0 && pick < 0 && hint && <span className="absolute inset-[26%] rounded-full border border-dashed border-(--accent) bg-(--accent)/15" />}
              {can && pick < 0 && !hint && <span className="absolute inset-[30%] rounded-full bg-white/0 transition hover:bg-white/25" />}
            </button>
          );
        })}
        {lines && lines.length > 0 && (
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden>
            {lines.map((l) => (
              <g key={`${l.from}-${l.to}`}>
                <line x1={at(colOf(l.from))} y1={at(rowOf(l.from))} x2={at(colOf(l.to))} y2={at(rowOf(l.to))} stroke={l.seat === 0 ? '#ff5d8f' : '#5b8cff'} strokeWidth="1.5" strokeLinecap="round" className="blind-gomoku-win-line" />
                <line x1={at(colOf(l.from))} y1={at(rowOf(l.from))} x2={at(colOf(l.to))} y2={at(rowOf(l.to))} stroke="#fff" strokeWidth=".35" strokeLinecap="round" className="blind-gomoku-win-line" />
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

/** A big round +/- button that repeats while held (so a thumb can run a number up quickly). */
function HoldButton({ onStep, disabled, label, children }: { onStep: () => void; disabled: boolean; label: string; children: React.ReactNode }) {
  const timer = useRef<number | null>(null);
  const step = useRef(onStep);
  useEffect(() => { step.current = onStep; }, [onStep]);
  const stop = () => { if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => stop, []);
  useEffect(() => { if (disabled) stop(); }, [disabled]);
  const start = () => {
    stop();
    let delay = 380;
    const run = () => { step.current(); delay = Math.max(70, delay * 0.72); timer.current = window.setTimeout(run, delay); };
    timer.current = window.setTimeout(run, delay);
  };
  return (
    <button
      type="button" aria-label={label} disabled={disabled}
      onClick={onStep}
      onPointerDown={(event) => { if (event.pointerType !== 'mouse' || event.button === 0) start(); }}
      onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={(event) => event.preventDefault()}
      className="flex h-11 w-12 shrink-0 touch-manipulation items-center justify-center rounded-[11px] border border-white/12 bg-white/[.06] text-white transition active:scale-95 active:bg-(--accent) active:text-(--accent-ink) disabled:opacity-25 disabled:active:scale-100"
    >{children}</button>
  );
}

/** One point's bid: its mark, −, the number, +, and "all the rest here". */
export function BidRow({ index, cell, value, onChange, max, locked, labels }: {
  index: number; cell: number; value: number; onChange: (v: number) => void; max: number; locked: boolean;
  labels: { minus: string; plus: string; rest: string; point: string };
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-[12px] border border-white/10 bg-black/35 p-1 sm:gap-2 sm:p-1.5">
      <div className="flex w-10 shrink-0 flex-col items-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent)/25 font-mono text-xs font-black text-white ring-2 ring-(--accent)">{POINT_MARKS[index]}</span>
        <span className="font-mono text-[9px] leading-3 text-white/40">{coordinate(cell)}</span>
      </div>
      <HoldButton label={`${labels.point} ${POINT_MARKS[index]} ${labels.minus}`} disabled={locked || value <= 1} onStep={() => onChange(Math.max(1, value - 1))}><Minus size={22} strokeWidth={3} /></HoldButton>
      <output aria-live="polite" className="min-w-0 flex-1 text-center font-mono text-[26px] font-black tabular-nums text-white">{value}</output>
      <HoldButton label={`${labels.point} ${POINT_MARKS[index]} ${labels.plus}`} disabled={locked || value >= max} onStep={() => onChange(Math.min(max, value + 1))}><Plus size={22} strokeWidth={3} /></HoldButton>
      <button type="button" disabled={locked || value >= max} onClick={() => onChange(max)} className="h-11 w-14 shrink-0 rounded-[11px] border border-(--accent)/40 px-1 text-[10px] font-black leading-tight text-(--accent) transition active:scale-95 disabled:opacity-25">{labels.rest}</button>
    </div>
  );
}

/** Budget as a strip of units: the three bids in turn, then what is left — the half that carries over brighter. */
export function BudgetStrip({ budget, bets }: { budget: number; bets: number[] }) {
  const tints = ['bg-(--accent)', 'bg-[#ff9db9]', 'bg-[#ffd0de]'];
  const units: string[] = [];
  bets.forEach((b, i) => { for (let k = 0; k < b; k += 1) units.push(tints[i]); });
  const carry = Math.floor((budget - units.length) / 2);
  for (let k = 0; units.length < budget; k += 1) units.push(k < carry ? 'bg-[#7ff0bf]/70' : 'bg-white/10');
  return (
    <div className="flex h-2 w-full gap-[2px]" aria-hidden>
      {units.map((tint, i) => <span key={i} className={`h-full flex-1 rounded-[2px] ${tint}`} />)}
    </div>
  );
}
