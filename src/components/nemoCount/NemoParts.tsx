"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { type NemoBoard as Board, type NemoRect, solutionRects } from '@/lib/nemoCount';

export const NEMO_ACCENT = '#c8d1e6';
export const NEMO_INK = '#151b2c';
const SERIF = { fontFamily: '"Times New Roman", "Nanum Myeongjo", Georgia, serif' };

/** The TARGET plate in the corner of the broadcast boards. */
export function TargetPlate({ target, small = false }: { target: number; small?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[6px] border border-white/10 bg-[#2c2e4b] text-center shadow-[0_10px_28px_rgba(0,0,0,.5)] ${small ? 'w-16' : 'w-20 sm:w-28'}`}>
      <p className={`whitespace-nowrap bg-[#15162a] font-black text-[#d6d9e8] ${small ? 'py-0.5 text-[8px] tracking-[0.12em]' : 'py-1 text-[9px] tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em]'}`} style={SERIF}>{small ? 'TARGET' : '✦ TARGET ✦'}</p>
      <p className={`font-black leading-none text-[#c9ccd8] ${small ? 'py-1.5 text-2xl' : 'py-2 text-3xl sm:py-2.5 sm:text-5xl'}`} style={SERIF}>{target}</p>
    </div>
  );
}

/**
 * A board: stone-grey cells with navy lines and serif numbers. `highlight` outlines one rectangle
 * (the solution replay or a tutorial example); `ghost` outlines a rectangle that is not allowed.
 */
export function NemoBoardView({ board, highlight, ghost, maxCell = 56, className = '', fitHeight = false }: {
  board: Board; highlight?: NemoRect | null; ghost?: NemoRect | null; maxCell?: number; className?: string;
  fitHeight?: boolean; // keep the board within ~1/3 of the screen height (play screens, so the answer pad fits)
}) {
  const R = board.cells.length;
  const C = Math.max(...board.cells.map((row) => row.length));
  const box = (rect: NemoRect) => ({ left: `${(rect.c1 / C) * 100}%`, top: `${(rect.r1 / R) * 100}%`, width: `${((rect.c2 - rect.c1 + 1) / C) * 100}%`, height: `${((rect.r2 - rect.r1 + 1) / R) * 100}%` });
  return (
    <div className={`relative mx-auto w-full ${className}`} style={{ maxWidth: fitHeight ? `min(${C * maxCell}px, calc(${(C / R).toFixed(3)} * 33svh))` : C * maxCell }}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${C}, minmax(0, 1fr))` }}>
        {Array.from({ length: R * C }, (_, i) => {
          const r = Math.floor(i / C), c = i % C;
          const v = board.cells[r]?.[c] ?? null;
          if (v === null) return <span key={i} className="aspect-square" />;
          return (
            <span key={i} className="relative flex aspect-square items-center justify-center border-[1.5px] border-[#1a1d3a] bg-gradient-to-b from-[#e4e5ea] to-[#c9cbd3] shadow-[inset_0_-2px_5px_rgba(0,0,0,.18)]" style={{ marginLeft: -1.5, marginTop: -1.5 }}>
              {v !== 0 && <b className="text-[clamp(11px,4.2vw,30px)] font-black leading-none text-[#15161d]" style={{ ...SERIF, fontSize: v >= 10 ? 'clamp(10px,3.4vw,25px)' : undefined }}>{v}</b>}
            </span>
          );
        })}
      </div>
      {ghost && <span className="pointer-events-none absolute rounded-[3px] border-[3px] border-dashed border-[#ff5d5d] bg-[#ff5d5d]/10" style={box(ghost)} />}
      {highlight && <span key={`${highlight.r1}-${highlight.c1}-${highlight.r2}-${highlight.c2}`} className="nemo-highlight pointer-events-none absolute rounded-[3px] border-[3px] border-[#ffcf3f] bg-[#ffcf3f]/25 shadow-[0_0_18px_rgba(255,207,63,.6)]" style={box(highlight)} />}
    </div>
  );
}

/**
 * Walks through every rectangle that makes the target, smallest first, outlining each on the board.
 * `auto` starts it playing (used when a room reveals the answer).
 */
export function SolutionReplay({ board, auto = false, stepMs = 700, maxCell, fitHeight = false }: { board: Board; auto?: boolean; stepMs?: number; maxCell?: number; fitHeight?: boolean }) {
  const t = useTranslations('NemoCount');
  const rects = useMemo(() => solutionRects(board), [board]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(auto);
  useEffect(() => {
    if (!playing || !rects.length) return;
    const last = step >= rects.length - 1;
    const timer = window.setTimeout(() => (last ? setPlaying(false) : setStep(step + 1)), stepMs);
    return () => window.clearTimeout(timer);
  }, [playing, step, rects.length, stepMs]);
  const current = rects[step] ?? null;
  const size = current ? `${current.c2 - current.c1 + 1}×${current.r2 - current.r1 + 1}` : '';

  return (
    <div>
      <NemoBoardView board={board} highlight={current} maxCell={maxCell} fitHeight={fitHeight} />
      <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/45 px-3 py-2">
        <p className="min-w-0 text-xs font-bold text-white/70">
          {rects.length ? t('replayStep', { step: step + 1, total: rects.length, size }) : t('replayNone')}
        </p>
        {rects.length > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" aria-label={t('prev')} onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10"><ChevronLeft size={15} /></button>
            <button type="button" aria-label={playing ? t('pause') : t('play')} onClick={() => { if (step + 1 >= rects.length) setStep(0); setPlaying((p) => !p); }} className="rounded-md bg-(--accent) p-1.5 text-(--accent-ink)">{playing ? <Pause size={15} /> : <Play size={15} />}</button>
            <button type="button" aria-label={t('next')} onClick={() => { setPlaying(false); setStep((s) => Math.min(rects.length - 1, s + 1)); }} className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10"><ChevronRight size={15} /></button>
          </div>
        )}
      </div>
      {rects.length > 0 && <input aria-label={t('replaySlider')} type="range" min={0} max={rects.length - 1} value={step} onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }} className="mt-2 w-full accent-[#ffcf3f]" />}
    </div>
  );
}

const noop = () => () => {};
const coarse = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Answer entry. On touch screens it is an on-screen number pad (no system keyboard popping up over the
 * board); with a mouse and keyboard it is a text box you can type into.
 */
export function AnswerInput({ onSubmit, disabled, placeholder, submitLabel, autoFocus = true }: {
  onSubmit: (value: number) => void; disabled?: boolean; placeholder: string; submitLabel: string; autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');
  const touch = useSyncExternalStore(noop, coarse, () => false);
  const send = () => {
    const n = Number(value);
    if (value === '' || !Number.isInteger(n) || n < 0) return;
    onSubmit(n);
    setValue('');
  };

  if (touch) {
    const press = (key: string) => {
      if (disabled) return;
      if (key === 'del') setValue((v) => v.slice(0, -1));
      else if (key === 'ok') send();
      else setValue((v) => (v + key).replace(/^0+(?=\d)/, '').slice(0, 4));
    };
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    return (
      <div className="select-none">
        <div className={`flex h-11 items-center justify-center rounded-md border border-white/15 bg-black/50 font-mono text-2xl font-black tracking-widest ${value ? 'text-white' : 'text-base font-bold tracking-normal text-white/35'}`} aria-live="polite">{value || placeholder}</div>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {keys.map((key) => (
            <button
              key={key} type="button" disabled={disabled || (key === 'ok' && value === '')} onClick={() => press(key)}
              aria-label={key === 'del' ? 'delete' : key === 'ok' ? submitLabel : key}
              className={`h-10 rounded-md text-lg font-black transition active:scale-95 disabled:opacity-35 ${key === 'ok' ? 'bg-(--accent) text-sm text-(--accent-ink)' : key === 'del' ? 'bg-white/10 text-white/70' : 'bg-white/[0.07] text-white'}`}
            >
              {key === 'del' ? '⌫' : key === 'ok' ? submitLabel : key}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex gap-2">
      <input
        value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" autoComplete="off"
        disabled={disabled} placeholder={placeholder} autoFocus={autoFocus} aria-label={placeholder} size={6}
        className="w-0 min-w-0 flex-1 rounded-md border border-white/15 bg-black/50 px-4 py-3 text-center font-mono text-2xl font-black tracking-widest text-white outline-none placeholder:text-base placeholder:tracking-normal placeholder:text-white/30 focus:border-(--accent) disabled:opacity-40"
      />
      <button type="submit" disabled={disabled || value === ''} className="shrink-0 rounded-md bg-(--accent) px-5 text-sm font-black text-(--accent-ink) transition hover:brightness-110 disabled:opacity-40">{submitLabel}</button>
    </form>
  );
}
