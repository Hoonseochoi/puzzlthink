"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { accentVars } from '@/components/ui/gameUi';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Clapperboard, Gauge, Pause, Play, RotateCcw, X } from 'lucide-react';
import { type LogicBoard, type LogicGameId, LOGIC, emptyMarks } from '@/lib/logicPuzzles';
import { type Replay, buildReplay } from '@/lib/logicReplay';
import BinairoBoard from './BinairoBoard';
import ColorLinkBoard from './ColorLinkBoard';
import MasyuBoard from './MasyuBoard';
import NonogramBoard from './NonogramBoard';
import OneStrokeBoard from './OneStrokeBoard';
import StarBoard from './StarBoard';

/** How long a move stays on screen: notes get time to be read, plain moves go quickly. */
const HOLD_NOTE = 2600, HOLD_CELL = 420, HOLD_EDGE = 260;

function ReplayBoard({ board, marks, done }: { board: LogicBoard; marks: number[]; done: boolean }) {
  switch (board.kind) {
    case 'masyu': return <MasyuBoard board={board} marks={marks} readOnly />;
    case 'nonogram': return <NonogramBoard board={board} marks={marks} tool="fill" readOnly solvedGlow={done} />;
    case 'starbattle': return <StarBoard board={board} marks={marks} readOnly solved={done} />;
    case 'binairo': return <BinairoBoard board={board} marks={marks} readOnly solved={done} />;
    case 'onestroke': return <OneStrokeBoard board={board} marks={marks} readOnly solved={done} />;
    default: return <ColorLinkBoard board={board} marks={marks} readOnly solved={done} />;
  }
}

/** Where a cell's center sits inside the board's SVG, as fractions of its box (the nonogram has clue strips). */
function cellFraction(board: LogicBoard, svg: SVGSVGElement, cell: number) {
  const n = board.size, r = Math.floor(cell / n), c = cell % n;
  if (board.kind === 'nonogram') {
    const R = Math.max(1, ...board.clues.rows.map((x) => x.length || 1)), C = Math.max(1, ...board.clues.cols.map((x) => x.length || 1));
    const left = R * 0.66 + 0.3, top = C * 0.66 + 0.3, W = left + n, H = top + n;
    return { x: (left + c + 0.5) / W, y: (top + r + 0.5) / H };
  }
  const vb = svg.viewBox.baseVal;
  return { x: (c + 0.5 - vb.x) / vb.width, y: (r + 0.5 - vb.y) / vb.height };
}

/**
 * 풀이 복기 player: the demo board of a game solved move by move, with speech bubbles on the moves worth explaining.
 * Opens playing; pause, step back and forth, restart, or play at double speed.
 */
function ReplayDialog({ game, onClose }: { game: LogicGameId; onClose: () => void }) {
  const t = useTranslations('Logic');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const replay: Replay = useMemo(() => buildReplay(game), [game]);
  const { board, frames } = replay;
  const [step, setStep] = useState(0); // frames applied
  const [playing, setPlaying] = useState(true);
  const [fast, setFast] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [pin, setPin] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const marks = useMemo(() => {
    const m = emptyMarks(board);
    for (let k = 0; k < step; k++) for (const [i, v] of frames[k].changes) m[i] = v;
    return m;
  }, [board, frames, step]);
  const done = step >= frames.length;
  // The bubble shows the latest note so far.
  const noteAt = useMemo(() => { for (let k = step - 1; k >= 0; k--) if (frames[k].note) return k; return -1; }, [frames, step]);
  // A note fades after a few more moves (the closing one stays).
  const note = noteAt >= 0 && (step - 1 - noteAt <= 6 || noteAt === frames.length - 1) ? frames[noteAt].note! : null;

  useEffect(() => {
    if (!playing || done) return;
    const f = frames[step];
    const base = f.note ? HOLD_NOTE : board.kind === 'masyu' || board.kind === 'onestroke' || board.kind === 'colorlink' ? HOLD_EDGE : HOLD_CELL;
    const id = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : (frames[step - 1]?.note ? HOLD_NOTE : base) / (fast ? 2 : 1));
    return () => window.clearTimeout(id);
  }, [playing, done, step, frames, fast, board.kind]);
  useEffect(() => { if (done) setPlaying(false); }, [done]); // eslint-disable-line react-hooks/set-state-in-effect -- stop at the end

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') { setPlaying(false); setStep((s) => Math.min(frames.length, s + 1)); }
      else if (e.key === 'ArrowLeft') { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [frames.length, onClose]);

  // Pin the bubble next to the cell it talks about (re-measured when the note or the layout changes).
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current, svg = w?.querySelector('svg[aria-label="board"]') as SVGSVGElement | null;
      if (!w || !svg || !note || note.at === undefined) { setPin(null); return; }
      const box = svg.getBoundingClientRect(), outer = w.getBoundingClientRect();
      const f = cellFraction(board, svg, note.at);
      setPin({ x: box.left - outer.left + f.x * box.width, y: box.top - outer.top + f.y * box.height, below: f.y < 0.5 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [note, board]);

  const text = note ? (locale === 'en' ? note.en : note.ko) : '';
  const spec = LOGIC[game];

  return (
    <div role="dialog" aria-modal="true" aria-label={t('replayTitle', { game: tc(spec.catalog) })} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" style={accentVars(spec.accent, spec.ink)} onClick={onClose}>
      <div className="flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#101217] text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)"><Clapperboard size={12} />REPLAY · {board.size}×{board.size}</p>
            <p className="mt-0.5 text-base font-black">{t('replayTitle', { game: tc(spec.catalog) })}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('tipClose')} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>

        <div ref={wrap} className="relative mx-4 mt-3 [&_svg[aria-label=board]]:max-w-[min(100%,calc(100svh-290px))]">
          <ReplayBoard board={board} marks={marks} done={done} />
          {pin && note && (
            <>
              <span className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-(--accent)" style={{ left: pin.x, top: pin.y }} />
              <span className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--accent)" style={{ left: pin.x, top: pin.y }} />
            </>
          )}
          {note && (
            <div key={noteAt} className="pointer-events-none absolute z-10 w-[min(88%,330px)] -translate-x-1/2 animate-[logic-pop_.3s_ease]"
              style={pin ? { left: `clamp(150px, ${pin.x}px, calc(100% - 150px))`, top: pin.below ? pin.y + 26 : undefined, bottom: pin.below ? undefined : `calc(100% - ${pin.y - 26}px)` } : { left: '50%', top: 10 }}>
              <div className="rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold leading-5 text-[#17201e] shadow-[0_12px_30px_rgba(0,0,0,.45)]">
                <span className="mr-1">💬</span>{text}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-4 pt-3">
          <input type="range" min={0} max={frames.length} value={step} onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }} aria-label={t('replayProgress')} className="w-full accent-(--accent)" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-white/45">{t('replayStep', { k: step, total: frames.length })}</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => { setStep(0); setPlaying(true); }} title={t('replayRestart')} className="rounded-full bg-white/10 p-2 hover:bg-white/15"><RotateCcw size={15} /></button>
              <button type="button" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} title={t('replayPrev')} className="rounded-full bg-white/10 p-2 hover:bg-white/15"><ChevronLeft size={15} /></button>
              <button type="button" onClick={() => { if (done) setStep(0); setPlaying((p) => (done ? true : !p)); }} title={playing ? t('replayPause') : t('replayPlay')} className="rounded-full bg-(--accent) p-2.5 text-(--accent-ink) hover:brightness-110">{playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button>
              <button type="button" onClick={() => { setPlaying(false); setStep((s) => Math.min(frames.length, s + 1)); }} title={t('replayNext')} className="rounded-full bg-white/10 p-2 hover:bg-white/15"><ChevronRight size={15} /></button>
              <button type="button" onClick={() => setFast((f) => !f)} aria-pressed={fast} title={t('replaySpeed')} className={`flex items-center gap-1 rounded-full px-2.5 py-2 text-[11px] font-black ${fast ? 'bg-(--accent)/20 text-(--accent)' : 'bg-white/10 text-white/70'}`}><Gauge size={13} />{fast ? '2×' : '1×'}</button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/35">{t('replayHint')}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Button that opens the replay. `variant`: a full-width card button, a small chip, or `learn` — the
 * "플레이 영상으로 배우기" box beside the game page's "처음이라면?" guide button.
 */
export default function LogicReplayButton({ game, variant = 'card' }: { game: LogicGameId; variant?: 'card' | 'chip' | 'learn' }) {
  const t = useTranslations('Logic');
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === 'learn'
        ? <button type="button" onClick={() => setOpen(true)} className="group mt-1 flex shrink-0 flex-col items-end rounded-[14px] border border-white/15 bg-white/[0.06] px-3.5 py-2 text-right transition hover:bg-white/[0.12]"><span className="text-[11px] font-bold text-white/60">{t('learnKicker')}</span><span className="flex items-center gap-1 text-sm font-black text-white"><Play size={12} fill="currentColor" className="text-(--accent)" />{t('learnButton')}</span></button>
        : variant === 'chip'
        ? <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/50 bg-(--accent)/10 px-3.5 py-1.5 text-xs font-black text-(--accent) hover:bg-(--accent)/20"><Play size={12} fill="currentColor" />{t('replayButton')}</button>
        : <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-black text-white/85 hover:bg-white/[0.08]"><Clapperboard size={15} className="text-(--accent)" />{t('replayButton')}<span className="text-[11px] font-bold text-white/40">· {t('replaySub')}</span></button>}
      {/* On <body>: a transformed ancestor would otherwise trap the fixed overlay inside it. */}
      {open && createPortal(<ReplayDialog game={game} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
