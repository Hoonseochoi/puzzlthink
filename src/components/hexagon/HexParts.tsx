"use client";

import { useEffect } from 'react';
import { CELLS, LETTERS } from '@/lib/hexagon';

export const HEX_ACCENT = '#e8b04a';
export const HEX_INK = '#1c1406';
const SERIF = { fontFamily: '"Times New Roman", "Nanum Myeongjo", Georgia, serif' };
const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// Pointy-top hexes: side s, width √3·s, rows 1.5·s apart. The board is 5 tiles wide and 8·s tall.
const W = Math.sqrt(3);
const BOARD_W = 5 * W, BOARD_H = 8;

export type TileMark = 'found' | 'missed' | 'wrong' | 'pick';

/**
 * The 3-4-5-4-3 board. `front` shows the numbers, otherwise the lettered backs; tiles flip between them.
 * `marks` colours tiles (picked, found, missed); `onTap` makes the backs clickable.
 */
export function HexBoardView({ numbers, front, marks = {}, onTap, disabled, maxWidth = 460, fitHeight = false }: {
  numbers: number[] | null; front: boolean; marks?: Record<string, TileMark>;
  onTap?: (letter: string) => void; disabled?: boolean; maxWidth?: number; fitHeight?: boolean;
}) {
  return (
    <div className="relative mx-auto w-full select-none" style={{ maxWidth: fitHeight ? `min(${maxWidth}px, calc(${(BOARD_W / BOARD_H).toFixed(3)} * 44svh))` : maxWidth, aspectRatio: `${BOARD_W} / ${BOARD_H}` }}>
      {CELLS.map((cell, i) => {
        const letter = LETTERS[i];
        const mark = marks[letter];
        const left = ((cell.q + cell.r / 2 + 2) * W) / BOARD_W * 100;
        const top = ((cell.r + 2) * 1.5) / BOARD_H * 100;
        const value = numbers?.[i];
        const clickable = !!onTap && !disabled && !front;
        const ring = mark === 'pick' ? 'bg-(--accent)' : mark === 'found' ? 'bg-[#34c47c]' : mark === 'missed' ? 'bg-[#ffcf3f]' : mark === 'wrong' ? 'bg-[#ff5d5d]' : 'bg-[#0b0b0e]';
        return (
          <button
            key={letter} type="button" disabled={!clickable} onClick={() => onTap?.(letter)} aria-label={front && value !== undefined ? `${letter} ${value}` : letter} aria-pressed={mark === 'pick'}
            className={`absolute [perspective:600px] ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ left: `${left}%`, top: `${top}%`, width: `${(W / BOARD_W) * 100}%`, height: `${(2 / BOARD_H) * 100}%` }}
          >
            <span className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${front ? '' : '[transform:rotateY(180deg)]'} ${clickable ? 'active:scale-95' : ''}`} style={{ transitionDelay: `${(cell.row * 40 + cell.col * 25)}ms` }}>
              {/* Front: the number */}
              <span className={`absolute inset-0 flex items-center justify-center [backface-visibility:hidden] ${ring}`} style={{ clipPath: HEX_CLIP }}>
                <span className={`absolute inset-[5%] flex items-center justify-center ${mark === 'found' ? 'bg-gradient-to-b from-[#dff7e9] to-[#a9e2c3]' : mark === 'missed' ? 'bg-gradient-to-b from-[#fff4c8] to-[#f2d47a]' : 'bg-gradient-to-b from-[#f4efe2] to-[#d7cfba]'}`} style={{ clipPath: HEX_CLIP }}>
                  <b className="font-black leading-none text-[#17140d]" style={{ ...SERIF, fontSize: 'clamp(16px, 6.2vw, 40px)' }}>{value ?? ''}</b>
                  <span className="absolute bottom-[14%] text-[clamp(7px,1.6vw,10px)] font-black text-black/35">{letter}</span>
                </span>
              </span>
              {/* Back: the letter */}
              <span className={`absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${ring === 'bg-[#0b0b0e]' ? 'bg-[#5a4a2a]' : ring}`} style={{ clipPath: HEX_CLIP }}>
                <span className={`absolute inset-[5%] flex items-center justify-center ${mark === 'pick' ? 'bg-gradient-to-b from-[#4a3a18] to-[#2a210e]' : 'bg-gradient-to-b from-[#2b2f45] to-[#171a2a]'}`} style={{ clipPath: HEX_CLIP }}>
                  <b className={`font-black leading-none ${mark === 'pick' ? 'text-(--accent)' : 'text-[#e9dcc0]'}`} style={{ ...SERIF, fontSize: 'clamp(15px, 5.6vw, 36px)' }}>{letter}</b>
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The TARGET plate. `hidden` shows "?" while the numbers are still up. */
export function TargetPlate({ target, hidden = false, small = false }: { target: number; hidden?: boolean; small?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[6px] border border-(--accent)/30 bg-[#2b2414] text-center shadow-[0_10px_28px_rgba(0,0,0,.5)] ${small ? 'w-16' : 'w-20 sm:w-28'}`}>
      <p className={`whitespace-nowrap bg-[#16120a] font-black text-(--accent) ${small ? 'py-0.5 text-[8px] tracking-[0.12em]' : 'py-1 text-[9px] tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em]'}`} style={SERIF}>TARGET</p>
      <p className={`font-black leading-none ${hidden ? 'text-white/25' : 'text-[#f3e6c4]'} ${small ? 'py-1.5 text-2xl' : 'py-2 text-3xl sm:py-2.5 sm:text-5xl'}`} style={SERIF}>{hidden ? '?' : target}</p>
    </div>
  );
}

/** A thin bar that empties as time runs out. */
export function TimeBar({ left, total, color = 'var(--accent)' }: { left: number; total: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full transition-[width] duration-200" style={{ width: `${Math.max(0, Math.min(1, left / total)) * 100}%`, background: color }} /></div>;
}

/** Letter keys toggle tiles, Enter declares, Backspace/Escape clears (desktop). */
export function useLetterKeys(active: boolean, onLetter: (letter: string) => void, onEnter: () => void, onClear: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const key = event.key.toUpperCase();
      if (key.length === 1 && LETTERS.includes(key)) { event.preventDefault(); onLetter(key); }
      else if (event.key === 'Enter') { event.preventDefault(); onEnter(); }
      else if (event.key === 'Backspace' || event.key === 'Escape') { event.preventDefault(); onClear(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onLetter, onEnter, onClear]);
}

/** Tapping a tile adds it to the pick (up to three) or takes it out again. */
export const togglePick = (pick: string, letter: string) => (pick.includes(letter) ? pick.replace(letter, '') : pick.length >= 3 ? pick : pick + letter);

/** Marks for the answer screen: found lines green, missed ones yellow (a found tile stays green). */
export function revealMarks(answers: string[], found: string[]): Record<string, TileMark> {
  const marks: Record<string, TileMark> = {};
  for (const line of answers) if (!found.includes(line)) for (const ch of line) marks[ch] = 'missed';
  for (const line of found) for (const ch of line) marks[ch] = 'found';
  return marks;
}
