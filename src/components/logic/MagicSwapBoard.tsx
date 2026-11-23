"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight, Check, Circle, Sigma } from 'lucide-react';
import { seg } from '@/components/ui/gameUi';
import type { MagicSwapBoard as Board } from '@/lib/logicPuzzles';
import { lineSums, magicSum } from '@/lib/magicswap';

export type MagicTool = 'swap' | 'check' | 'suspect';
/** Notes on a cell, the player's own: 1 = ✓ sure (locked against swaps), 2 = ● suspect. */
type Pin = 0 | 1 | 2;

const LONG_MS = 450;
let gestureSeq = 1;

/**
 * 마방진 스왑 board. Tap two tiles (or drag one onto another) to swap them. The edge shows how far each row and column
 * is from the magic sum (or the sums themselves); both diagonals sit under the board. ✓ locks a tile, ● marks a
 * suspect; a long press cycles ✓ → ● → none whatever the tool.
 */
export default function MagicSwapBoard({ board, marks, onMarks, readOnly = false, solved = false, showAnswer = false, demo }: {
  board: Board;
  marks: number[];
  onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean;
  solved?: boolean;
  showAnswer?: boolean;
  /** Tutorial pictures: a selected tile and notes, without input. */
  demo?: { sel?: number; target?: number; pins?: Record<number, Pin>; sums?: boolean };
}) {
  const t = useTranslations('Logic');
  const n = board.size;
  const M = magicSum(n);
  const cells = showAnswer ? board.answer : marks;
  const [tool, setTool] = useState<MagicTool>('swap');
  const [sel, setSel] = useState<number>(-1);
  const [over, setOver] = useState<number>(-1);
  const [sums, setSums] = useState(false);
  const [pins, setPins] = useState<Pin[]>(() => new Array<Pin>(n * n).fill(0));
  const key = `${board.size}-${board.seed}`;
  const [pinKey, setPinKey] = useState(key);
  // A new board: notes and the selection start over.
  if (pinKey !== key) { setPinKey(key); setPins(new Array<Pin>(n * n).fill(0)); setSel(-1); setTool('swap'); }
  const drag = useRef<{ from: number; to: number; moved: boolean; long: boolean; timer: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (readOnly) setSel(-1); }, [readOnly]); // eslint-disable-line react-hooks/set-state-in-effect -- drop the lifted tile when input stops

  const shownPins = demo?.pins ? Array.from({ length: n * n }, (_, i) => demo.pins![i] ?? 0) : pins;
  const shownSel = demo ? demo.sel ?? -1 : sel;
  const shownOver = demo ? demo.target ?? -1 : over;
  const showSums = demo?.sums ?? sums;
  const live = !readOnly && !demo && !!onMarks;
  const s = lineSums(n, cells);
  const selR = shownSel >= 0 ? Math.floor(shownSel / n) : -1, selC = shownSel >= 0 ? shownSel % n : -1;

  const swap = (i: number, j: number) => {
    if (i === j || pins[i] === 1 || pins[j] === 1) return;
    onMarks?.([[i, cells[j]], [j, cells[i]]], gestureSeq++);
    setSel(-1);
  };
  const setPin = (i: number, p: Pin) => setPins((cur) => cur.map((v, k) => (k === i ? p : v)));
  const tap = (i: number) => {
    if (tool !== 'swap') { const want: Pin = tool === 'check' ? 1 : 2; setPin(i, pins[i] === want ? 0 : want); if (want === 1 && sel === i) setSel(-1); return; }
    if (pins[i] === 1) return;
    if (sel < 0) setSel(i);
    else if (sel === i) setSel(-1);
    else swap(sel, i);
  };
  const cellAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    return el && gridRef.current?.contains(el) ? Number(el.dataset.cell) : -1;
  };

  const onDown = (e: React.PointerEvent, i: number) => {
    if (!live) return;
    e.preventDefault();
    const timer = window.setTimeout(() => {
      const d = drag.current;
      if (!d || d.moved) return;
      d.long = true;
      setPin(i, ((pins[i] + 1) % 3) as Pin);
      if (sel === i) setSel(-1);
      navigator.vibrate?.(12);
    }, LONG_MS);
    drag.current = { from: i, to: -1, moved: false, long: false, timer };
  };
  useEffect(() => {
    if (!live) return;
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const j = cellAt(e.clientX, e.clientY);
      if (j >= 0 && j !== d.from) { d.moved = true; window.clearTimeout(d.timer); d.to = j; setOver(j); }
      else if (d.moved) { d.to = -1; setOver(-1); }
    };
    const up = () => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      window.clearTimeout(d.timer);
      setOver(-1);
      if (d.long) return;
      if (d.moved) { if (d.to >= 0 && tool === 'swap') swap(d.from, d.to); return; }
      tap(d.from);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  });

  const label = (v: number) => {
    if (showSums) return String(v);
    const d = v - M;
    return d === 0 ? '✓' : `${d > 0 ? '+' : '−'}${Math.abs(d)}`;
  };
  const tone = (v: number) => (v === M ? 'text-[#7ee2ae]' : 'text-[#ff9a9a]');
  const edge = (v: number) => `flex items-center justify-center font-mono font-black ${n >= 7 ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-sm'} ${tone(v)}`;
  const tile = n >= 7 ? 'text-base sm:text-2xl' : n === 6 ? 'text-lg sm:text-[26px]' : 'text-xl sm:text-3xl';

  return (
    <div className={`mx-auto w-full ${demo ? 'max-w-[240px]' : 'max-w-[560px]'}`}>
      <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold text-white/55">
        <span>{t('magicTarget')} <b className="font-mono text-base font-black text-(--accent)">{M}</b></span>
        {!demo && <span className="font-mono text-[11px] text-white/40">{t('magicScrambled', { n: board.swaps.length })}</span>}
      </div>
      <div ref={gridRef} className="grid select-none gap-[3px] sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr)) ${n >= 7 ? '1.6rem' : '2rem'}`, touchAction: live ? 'none' : undefined }}>
        {Array.from({ length: n }, (_, r) => [
          ...Array.from({ length: n }, (_, c) => {
            const i = r * n + c, pin = shownPins[i];
            const isSel = i === shownSel, lineHl = !isSel && (r === selR || c === selC);
            return (
              <button key={i} type="button" data-cell={i} disabled={!live} onPointerDown={(e) => onDown(e, i)} onContextMenu={(e) => e.preventDefault()}
                aria-label={`${r + 1}-${c + 1}: ${cells[i]}`} aria-pressed={isSel}
                className={`relative flex aspect-square items-center justify-center rounded-[7px] font-black tabular-nums transition-transform duration-100 sm:rounded-[10px] ${tile}
                  ${solved ? 'bg-(--accent)/25 text-white ring-1 ring-(--accent)/60' : isSel ? 'z-10 scale-[1.07] bg-(--accent) text-(--accent-ink) shadow-[0_6px_18px_rgba(0,0,0,.45)]' : lineHl ? 'bg-white/[0.12] text-white' : 'bg-white/[0.06] text-white/90'}
                  ${pin === 1 && !solved ? 'ring-2 ring-[#7ee2ae]/80' : ''} ${i === shownOver ? 'outline-2 outline-dashed outline-(--accent)' : ''} disabled:cursor-default`}>
                {cells[i]}
                {pin === 1 && !solved && <Check size={10} strokeWidth={4} className="absolute right-[3px] top-[3px] text-[#7ee2ae]" />}
                {pin === 2 && !solved && <span className="absolute left-[4px] top-[4px] h-1.5 w-1.5 rounded-full bg-[#ffc23d] sm:h-2 sm:w-2" />}
              </button>
            );
          }),
          <span key={`r${r}`} className={edge(s.rows[r])}>{label(s.rows[r])}</span>,
        ])}
        {s.cols.map((v, c) => <span key={`c${c}`} className={`${edge(v)} py-1`}>{label(v)}</span>)}
        <span />
      </div>
      <div className="mt-1 flex items-center justify-between px-1 text-[11px] font-bold text-white/45">
        <span>↘ {t('magicDiag')} <b className={`font-mono font-black ${tone(s.down)}`}>{label(s.down)}</b></span>
        <span>↙ {t('magicDiag')} <b className={`font-mono font-black ${tone(s.up)}`}>{label(s.up)}</b></span>
      </div>
      {live && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {([['swap', ArrowLeftRight, t('magicToolSwap')], ['check', Check, t('magicToolCheck')], ['suspect', Circle, t('magicToolSuspect')]] as const).map(([id, Icon, text]) => (
            <button key={id} type="button" onClick={() => { setTool(id); setSel(-1); }} aria-pressed={tool === id} className={`flex flex-col items-center gap-1 py-2 ${seg(tool === id)}`}><Icon size={16} />{text}</button>
          ))}
          <button type="button" onClick={() => setSums((v) => !v)} aria-pressed={sums} className={`flex flex-col items-center gap-1 py-2 ${seg(sums)}`}><Sigma size={16} />{sums ? t('magicShowDiff') : t('magicShowSum')}</button>
        </div>
      )}
    </div>
  );
}
