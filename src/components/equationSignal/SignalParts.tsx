"use client";

import { useCallback, useEffect, useReducer } from 'react';
import { CornerDownLeft, Delete } from 'lucide-react';
import { CELLS, type Mark, glyph, markGuess, symbolOf } from '@/lib/equationSignal';
import { LAMP } from './copy';

const EMPTY = Array<string>(CELLS).fill('');

type Draft = { cells: string[]; cursor: number };
type DraftAction = { t: 'type'; ch: string } | { t: 'back' } | { t: 'clear' } | { t: 'cursor'; to: number | ((i: number) => number) };
const clampCell = (i: number) => Math.max(0, Math.min(CELLS - 1, i));
function draftReducer(state: Draft, action: DraftAction): Draft {
  switch (action.t) {
    case 'type': return { cells: state.cells.map((c, i) => (i === state.cursor ? action.ch : c)), cursor: clampCell(state.cursor + 1) };
    case 'back': {
      // Clear this cell, or step back and clear the one before when this one is already empty.
      const at = state.cells[state.cursor] ? state.cursor : clampCell(state.cursor - 1);
      return { cells: state.cells.map((c, i) => (i === at ? '' : c)), cursor: at };
    }
    case 'clear': return { cells: EMPTY, cursor: 0 };
    case 'cursor': return { ...state, cursor: clampCell(typeof action.to === 'function' ? action.to(state.cursor) : action.to) };
  }
}

/** The row being typed: nine cells and a cursor. Typing fills the cell and moves on; Backspace clears back. */
export function useDraft() {
  const [state, dispatch] = useReducer(draftReducer, { cells: EMPTY, cursor: 0 });
  const type = useCallback((ch: string) => dispatch({ t: 'type', ch }), []);
  const back = useCallback(() => dispatch({ t: 'back' }), []);
  const clear = useCallback(() => dispatch({ t: 'clear' }), []);
  const setCursor = useCallback((to: number | ((i: number) => number)) => dispatch({ t: 'cursor', to }), []);
  return { cells: state.cells, cursor: state.cursor, setCursor, type, back, clear, text: state.cells.join(''), full: state.cells.every(Boolean) };
}

/** Keyboard input while `active`: digits and signs, Enter, Backspace, arrows. */
export function useSignalKeys(active: boolean, onSymbol: (ch: string) => void, onBack: () => void, onEnter: () => void, move?: (delta: number) => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || (event.target as HTMLElement)?.tagName === 'INPUT') return;
      const ch = symbolOf(event.key);
      if (ch) { event.preventDefault(); onSymbol(ch); }
      else if (event.key === 'Backspace') { event.preventDefault(); onBack(); }
      else if (event.key === 'Enter') { event.preventDefault(); onEnter(); }
      else if (event.key === 'ArrowLeft') move?.(-1);
      else if (event.key === 'ArrowRight') move?.(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onSymbol, onBack, onEnter, move]);
}

/** One row of nine lamps. `marks` colours them; `cursor` rings the cell being typed; a blank `text` shows colours only. */
export function SignalRow({ text, marks, cursor, onCell, small = false, pop = false, tile = false }: {
  text: string | string[]; marks?: string | Mark[] | null; cursor?: number | null; onCell?: (i: number) => void; small?: boolean; pop?: boolean; tile?: boolean;
}) {
  return (
    <div className={`grid grid-cols-9 ${small ? 'gap-[2px]' : 'gap-1 sm:gap-1.5'}`}>
      {Array.from({ length: CELLS }, (_, i) => {
        const ch = text[i] ?? '';
        const m = marks?.[i] as Mark | undefined;
        const on = cursor === i;
        return (
          <button
            key={i} type="button" disabled={!onCell} onClick={() => onCell?.(i)} tabIndex={onCell ? 0 : -1} aria-label={`${i + 1}${ch ? ` ${glyph(ch)}` : ''}`}
            className={`flex aspect-square items-center justify-center font-mono font-black leading-none transition ${tile ? 'rounded-[5px] text-[16px] sm:rounded-[3px] sm:text-[10px]' : small ? 'rounded-[3px] text-[9px]' : 'rounded-md text-lg sm:rounded-lg sm:text-2xl'} ${m ? 'text-white' : `border bg-black/45 text-[#eef1f7] ${on ? 'border-(--accent) shadow-[0_0_14px_var(--accent-glow)]' : ch ? 'border-white/35' : 'border-white/12'}`} ${onCell ? 'cursor-pointer' : 'cursor-default'} ${pop && m ? 'animate-[signal-pop_.35s_ease-out_both]' : ''}`}
            style={m ? { background: LAMP[m], boxShadow: small ? undefined : `0 0 16px ${LAMP[m]}55, inset 0 -3px 0 rgba(0,0,0,.22)`, animationDelay: pop ? `${i * 55}ms` : undefined } : undefined}
          >
            {glyph(ch)}
          </button>
        );
      })}
    </div>
  );
}

const KEY_ROWS = ['12345', '67890', '+-*/^='];

/** On-screen keys. Each key takes the colour of the best news about its symbol so far. */
export function SignalKeypad({ marks, onSymbol, onBack, onEnter, canEnter, enterLabel, disabled = false }: {
  marks: Record<string, Mark>; onSymbol: (ch: string) => void; onBack: () => void; onEnter: () => void; canEnter: boolean; enterLabel: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {KEY_ROWS.map((row) => (
        <div key={row} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
          {[...row].map((ch) => {
            const m = marks[ch];
            return (
              <button
                key={ch} type="button" disabled={disabled} onClick={() => onSymbol(ch)} aria-label={glyph(ch)}
                className={`flex h-11 items-center justify-center rounded-md font-mono text-lg font-black transition active:scale-95 disabled:opacity-40 sm:h-12 ${m ? 'text-white' : 'border border-white/15 bg-white/[0.07] text-white hover:bg-white/15'}`}
                style={m ? { background: m === 'r' ? '#3a2325' : LAMP[m], color: m === 'r' ? '#ff9b94' : undefined, border: m === 'r' ? '1px solid rgba(229,72,77,.45)' : undefined } : undefined}
              >
                {glyph(ch)}
              </button>
            );
          })}
        </div>
      ))}
      <div className="grid grid-cols-[1fr_2fr] gap-1.5">
        <button type="button" disabled={disabled} onClick={onBack} aria-label="Backspace" className="flex h-11 items-center justify-center rounded-md border border-white/15 bg-white/[0.07] text-white transition hover:bg-white/15 active:scale-95 disabled:opacity-40 sm:h-12"><Delete size={18} /></button>
        <button type="button" disabled={disabled || !canEnter} onClick={onEnter} className="flex h-11 items-center justify-center gap-2 rounded-md bg-(--accent) text-sm font-black text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] transition hover:brightness-110 active:scale-95 disabled:opacity-35 disabled:shadow-none sm:h-12"><CornerDownLeft size={16} />{enterLabel}</button>
      </div>
    </div>
  );
}

/** Green / yellow / red and what they mean. */
export function SignalLegend({ g, y, r }: { g: string; y: string; r: string }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-white/50">
      {([['g', g], ['y', y], ['r', r]] as const).map(([m, label]) => (
        <span key={m} className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full" style={{ background: LAMP[m], boxShadow: `0 0 8px ${LAMP[m]}` }} />{label}</span>
      ))}
    </p>
  );
}

/** Entry-screen and home-tile art: three guesses closing in on 6×7−12=30. */
export function SignalPreview({ compact = false }: { compact?: boolean }) {
  const rows = ['1+2*3^4=5', '30-6*2=18', '6*7-12=30'].map((text) => [text, markGuess('6*7-12=30', text).join('')] as const);
  return (
    <div className={`mx-auto flex w-full flex-col justify-center gap-1.5 ${compact ? 'max-w-[200px]' : 'h-[230px] max-w-[280px] rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(182,227,58,0.16),rgba(10,12,8,0.9)_70%)] p-4'}`}>
      {rows.map(([text, marks]) => <SignalRow key={text} text={text} marks={marks} small={compact} />)}
    </div>
  );
}

/** Home-card picture. */
export function SignalTile() {
  const rows = ['1+2*3^4=5', '30-6*2=18', '6*7-12=30'].map((text) => [text, markGuess('6*7-12=30', text).join('')] as const);
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_30%,#33401a,#0f130a_72%)] px-2 shadow-xl sm:w-[62%] sm:gap-1.5 sm:rounded-2xl sm:border-4 sm:px-3 sm:shadow-2xl">
      {rows.map(([text, marks]) => <div key={text} className="w-full"><SignalRow text={text} marks={marks} small tile /></div>)}
      <span className="absolute left-2 top-2 rounded-full bg-[#b6e33a] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-[#162003] sm:left-3 sm:top-3">= ?</span>
    </div>
  );
}
