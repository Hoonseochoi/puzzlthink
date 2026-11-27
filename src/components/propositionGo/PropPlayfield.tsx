"use client";

// The board, the tray and the proposition cards for one puzzle. Placing is tap-tap (pick a stone, tap a point) or a
// drag; the next stone in the tray is picked by itself, a placed stone is picked up by tapping it, tapping a point
// with another stone swaps them, and undo takes back any move. Cards light up as soon as the stones they name are
// down; the stones a card is about hop when it turns true and wince when it turns false.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eraser, Undo2, VenetianMask } from 'lucide-react';
import { type Prop, type PublicPuzzle, REGION_MASK, type Truth, isSolved, liveTruth, propStones } from '@/lib/propositionGo';
import { stoneName } from '@/lib/propositionGoText';
import { BOARD_BG, type CardState, type Mood, NeonGrid, PgStone, PropCard, Sparks } from './PropParts';

type Board = { cells: number[]; history: number[][] };
type Action = { t: 'place'; stone: number; cell: number } | { t: 'remove'; stone: number } | { t: 'undo' } | { t: 'clear' };

function reduce(b: Board, a: Action): Board {
  if (a.t === 'undo') return b.history.length ? { cells: b.history[b.history.length - 1], history: b.history.slice(0, -1) } : b;
  const next = b.cells.slice();
  if (a.t === 'clear') { if (next.every((c) => c < 0)) return b; next.fill(-1); }
  else if (a.t === 'remove') { if (next[a.stone] < 0) return b; next[a.stone] = -1; }
  else {
    const from = next[a.stone];
    if (from === a.cell) return b;
    const other = next.indexOf(a.cell);
    if (other >= 0) next[other] = from; // swap (back to the tray when the moving stone came from it)
    next[a.stone] = a.cell;
  }
  return { cells: next, history: [...b.history.slice(-80), b.cells] };
}

/** Values per point (stone + 1, 0 = empty), the trace's view of the board. */
const pointValues = (cells: number[]) => { const v = new Array<number>(16).fill(0); cells.forEach((c, s) => { if (c >= 0) v[c] = s + 1; }); return v; };
export type TraceInput = (changes: [number, number][], gesture: number, kind: 'play' | 'undo' | 'wipe') => void;

/** Stones a card is about, for the reactions and the focus highlight. */
function aboutStones(p: Prop, cells: number[]): number[] {
  const named = propStones(p);
  if (named) return named;
  if (p.t === 'with') return [p.s];
  if (p.t === 'count') return cells.flatMap((c, s) => (c >= 0 && (REGION_MASK[p.r] >> c) & 1 ? [s] : []));
  return [];
}
const focusMask = (p: Prop) => (p.t === 'in' || p.t === 'out' || p.t === 'count' ? REGION_MASK[p.r] : p.t === 'if' ? REGION_MASK[p.ra] | REGION_MASK[p.rb] : 0);

export type Finish = { kind: 'solved' } | { kind: 'lie'; lie: number } | null;

export default function PropPlayfield({ puzzle, hint, finish, locked, onSolved, trace, initial, answer }: {
  puzzle: PublicPuzzle;
  /** The 피스 hint card once bought (always true). */
  hint?: Prop | null;
  /** Set by the parent once the board is solved: celebration (and, on the 거짓말 tier, which card lied). */
  finish: Finish;
  locked?: boolean;
  onSolved: (cells: number[]) => void;
  trace?: TraceInput;
  /** Practice "show answer": put the stones there. */
  initial?: number[] | null;
  answer?: number[] | null;
}) {
  const t = useTranslations('PropositionGo');
  const locale = useLocale() === 'en' ? 'en' : 'ko';
  const n = puzzle.stones.length;
  const [board, dispatch] = useReducer(reduce, { cells: initial ?? new Array<number>(n).fill(-1), history: [] });
  // One puzzle per mount: the parent gives each puzzle its own key.
  const [selected, setSelected] = useState<number | null>(initial ? null : 0);
  const [focus, setFocus] = useState<number | null>(null);
  const [react, setReact] = useState<Record<number, { mood: Mood; key: number; anim: 'hop' | 'shake' | '' }>>({});
  const [flash, setFlash] = useState<number[]>(() => puzzle.props.map(() => 0));
  const prevStates = useRef<Truth[] | null>(null);
  const solvedRef = useRef(false);
  const gesture = useRef(0);
  const cells = board.cells;

  const apply = useCallback((a: Action, kind: 'play' | 'undo' | 'wipe' = 'play') => {
    if (locked) return;
    const before = pointValues(cells);
    const after = pointValues(a.t === 'undo' ? board.history[board.history.length - 1] ?? cells : reduce({ cells, history: [] }, a).cells);
    const changes: [number, number][] = [];
    after.forEach((v, i) => { if (v !== before[i]) changes.push([i, v]); });
    if (a.t !== 'undo' && !changes.length) return;
    if (a.t === 'undo' && !board.history.length) return;
    gesture.current++;
    trace?.(changes, kind === 'play' ? gesture.current : kind === 'undo' ? -1 : -2, kind);
    dispatch(a);
  }, [cells, board.history, locked, trace]);

  const states: Truth[] = useMemo(() => puzzle.props.map((p) => liveTruth(p, cells)), [puzzle.props, cells]);

  // Cards that changed: pop or nudge them, and make the stones they are about react.
  useEffect(() => {
    const prev = prevStates.current;
    prevStates.current = states;
    if (!prev) return;
    const changed = states.flatMap((s, i) => (s !== prev[i] ? [i] : []));
    if (!changed.length) return;
    setFlash((f) => f.map((v, i) => (changed.includes(i) ? v + 1 : v)));
    const next: Record<number, { mood: Mood; key: number; anim: 'hop' | 'shake' | '' }> = {};
    for (const i of changed) {
      if (states[i] === 'open') continue;
      for (const s of aboutStones(puzzle.props[i], cells)) {
        const good = states[i] === 'true';
        // A wince wins over a smile on the same stone.
        if (next[s]?.mood === 'worried' && good) continue;
        next[s] = { mood: good ? 'happy' : 'worried', key: Date.now() + i, anim: good ? 'hop' : 'shake' };
      }
    }
    if (!Object.keys(next).length) return;
    setReact((r) => ({ ...r, ...next }));
    const timer = window.setTimeout(() => setReact((r) => { const c = { ...r }; for (const k of Object.keys(next)) if (c[+k]?.key === next[+k].key) delete c[+k]; return c; }), 950);
    return () => window.clearTimeout(timer);
  }, [states, puzzle.props, cells]);

  useEffect(() => {
    if (solvedRef.current || locked) return;
    if (isSolved(puzzle, cells)) { solvedRef.current = true; onSolved(cells.slice()); }
  }, [cells, puzzle, onSolved, locked]);

  // Picking: the next stone still in the tray after each placement.
  const nextFree = (cs: number[], after: number) => {
    for (let k = 1; k <= n; k++) { const s = (after + k) % n; if (cs[s] < 0) return s; }
    return null;
  };
  const tapPoint = (cell: number) => {
    if (locked) return;
    const there = cells.indexOf(cell);
    if (selected === null) { if (there >= 0) setSelected(there); return; }
    if (there === selected) { setSelected(null); return; }
    const preview = reduce({ cells, history: [] }, { t: 'place', stone: selected, cell }).cells;
    apply({ t: 'place', stone: selected, cell });
    setSelected(cells[selected] < 0 ? nextFree(preview, selected) : null);
  };
  const tapStone = (s: number) => {
    if (locked) return;
    if (selected !== null && selected !== s && cells[s] >= 0) { tapPoint(cells[s]); return; } // swap onto it
    setSelected(selected === s ? null : s);
  };
  const toTray = (s: number) => {
    apply({ t: 'remove', stone: s });
    setSelected(s);
  };

  // Drag: a press that moves more than 8 px carries the stone; letting go over a point puts it there.
  const [drag, setDrag] = useState<{ s: number; x: number; y: number } | null>(null);
  const press = useRef<{ s: number; x: number; y: number; id: number; moved: boolean } | null>(null);
  const onDown = (s: number) => (e: React.PointerEvent) => {
    if (locked || e.button > 0) return;
    press.current = { s, x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 8) return;
    p.moved = true;
    setDrag({ s: p.s, x: e.clientX, y: e.clientY });
  };
  const onUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved) { tapStone(p.s); return; }
    setDrag(null);
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-pg-cell],[data-pg-tray]') as HTMLElement | null;
    if (el?.dataset.pgCell !== undefined) {
      const cell = Number(el.dataset.pgCell);
      const wasFree = cells[p.s] < 0;
      const preview = reduce({ cells, history: [] }, { t: 'place', stone: p.s, cell }).cells;
      apply({ t: 'place', stone: p.s, cell });
      setSelected(wasFree ? nextFree(preview, p.s) : null);
    } else if (el?.dataset.pgTray !== undefined && cells[p.s] >= 0) toTray(p.s);
  };
  const onCancel = () => { press.current = null; setDrag(null); };

  const focusProp = focus === null ? null : focus === -1 ? hint ?? null : puzzle.props[focus];
  const litMask = focusProp ? focusMask(focusProp) : 0;
  const litStones = focusProp ? new Set(aboutStones(focusProp, cells).concat(propStones(focusProp) ?? [])) : null;
  const done = finish !== null;
  const lieStones = finish?.kind === 'lie' ? new Set(aboutStones(puzzle.props[finish.lie], cells)) : null;

  const moodOf = (s: number): { mood: Mood; anim: string; key: number | string } => {
    if (finish?.kind === 'solved') return { mood: 'proud', anim: 'hop', key: `f${s}` };
    if (lieStones) return lieStones.has(s) ? { mood: 'shock', anim: 'shake', key: `l${s}` } : { mood: 'look', anim: 'hop', key: `l${s}` };
    const r = react[s];
    if (r) return { mood: r.mood, anim: r.anim, key: r.key };
    return { mood: 'idle', anim: '', key: 'i' };
  };

  const cardState = (i: number): CardState => (finish?.kind === 'lie' && finish.lie === i ? 'lie' : states[i]);
  const lie = puzzle.tier === 3;
  const trayStones = puzzle.stones.map((_, s) => s).filter((s) => cells[s] < 0);

  return (
    <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)] sm:items-start sm:gap-4" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel}>
      {/* phone: the tray stands beside the board so every card stays on screen; from sm it sits under it */}
      <div className="flex items-stretch justify-center gap-2 sm:flex-col sm:items-center">
        {/* the go board: stones sit on the 16 points */}
        <div className={`relative aspect-square w-[min(236px,calc(100vw-140px))] shrink-0 select-none sm:w-full sm:max-w-[300px] rounded-[16px] p-[6px] ${BOARD_BG} ${done && finish?.kind === 'solved' ? 'ring-2 ring-[#3fd67a]/80' : done ? 'ring-2 ring-[#ff4d5e]/80' : ''}`}
          style={{ touchAction: 'none' }}>
          <div className="relative h-full w-full rounded-[11px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true"><NeonGrid labels lit={litMask} /></svg>
            {/* points: big hit areas */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
              {Array.from({ length: 16 }, (_, c) => {
                const there = cells.indexOf(c);
                return (
                  <button key={c} type="button" data-pg-cell={c} disabled={locked} onClick={() => tapPoint(c)}
                    aria-label={t('point', { r: (c >> 2) + 1, c: (c & 3) + 1 }) + (there >= 0 ? ` · ${stoneName(puzzle.stones[there], locale)}` : '')}
                    className="group relative flex items-center justify-center outline-none">
                    {there < 0 && selected !== null && !locked && <span className="h-[16%] w-[16%] rounded-full bg-[#c9b6ff]/20 ring-1 ring-[#c9b6ff]/30 transition group-hover:bg-[#5ff0ff]/40" />}
                  </button>
                );
              })}
            </div>
            {/* the stones on the board */}
            {cells.map((c, s) => {
              if (c < 0) return null;
              const m = moodOf(s);
              const isSel = selected === s;
              return (
                <span key={s} className="pg-move pointer-events-none absolute flex h-[25%] w-[25%] items-center justify-center transition-[left,top] duration-150 ease-out"
                  style={{ left: `${(c & 3) * 25}%`, top: `${(c >> 2) * 25}%`, opacity: drag?.s === s ? 0.35 : 1, transitionDelay: '0ms' }}>
                  <span onPointerDown={onDown(s)} role="button" tabIndex={-1} aria-label={stoneName(puzzle.stones[s], locale)}
                    className={`pointer-events-auto relative block h-[86%] w-[86%] cursor-grab touch-none transition-transform duration-150 ${isSel ? '-translate-y-[6%] scale-[1.08]' : ''} ${litStones?.has(s) ? 'rounded-full shadow-[0_0_0_3px_#9b7bff]' : ''}`}>
                    <span key={String(m.key)} className={`block h-full w-full ${m.anim ? `pg-${m.anim}` : ''}`} style={finish ? { animationDelay: `${s * 70}ms` } : undefined}>
                      <PgStone colour={puzzle.stones[s]} size={100} mood={m.mood} blinkDelay={s * 0.9} className="h-full w-full" />
                    </span>
                    {isSel && <span className="pg-glow absolute -inset-[6%] rounded-full ring-2 ring-white/80" />}
                  </span>
                </span>
              );
            })}
            {finish && <Sparks n={14} colours={finish.kind === 'lie' ? ['#ff4d5e', '#c9b6ff', '#ffffff'] : ['#3fd67a', '#ffd36e', '#c9b6ff', '#ffffff']} />}
          </div>
        </div>

        {/* tray: stones still to place, undo and clear */}
        <div data-pg-tray className="flex w-[88px] shrink-0 flex-col gap-1 rounded-[14px] border border-white/10 bg-black/35 p-1.5 sm:h-[52px] sm:w-full sm:max-w-[300px] sm:flex-row sm:items-center sm:py-0">
          <div className="grid min-w-0 flex-1 grid-cols-2 content-start justify-items-center gap-1 sm:flex sm:items-center">
            {trayStones.length === 0 && <span className="col-span-2 px-1 text-center text-[10.5px] font-bold leading-4 text-white/35">{done ? '' : t('allPlaced')}</span>}
            {trayStones.map((s) => (
              <span key={s} onPointerDown={onDown(s)} role="button" tabIndex={0} aria-pressed={selected === s} aria-label={stoneName(puzzle.stones[s], locale)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapStone(s); } }}
                className={`relative h-[36px] w-[36px] shrink-0 cursor-grab sm:h-[42px] sm:w-[42px] touch-none rounded-full transition-transform duration-150 ${selected === s ? '-translate-y-1 scale-110' : 'opacity-90'}`}
                style={{ opacity: drag?.s === s ? 0.35 : undefined }}>
                <PgStone colour={puzzle.stones[s]} size={42} mood={selected === s ? 'look' : 'idle'} blinkDelay={s * 1.3} className="h-full w-full" />
                {selected === s && <span className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-white/85" />}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
          <button type="button" onClick={() => apply({ t: 'undo' }, 'undo')} disabled={locked || !board.history.length} title={t('undo')} aria-label={t('undo')}
            className="flex h-9 flex-1 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 sm:flex-none bg-white/[0.07] text-white/75 transition active:scale-95 disabled:opacity-30"><Undo2 size={17} /></button>
          <button type="button" onClick={() => { apply({ t: 'clear' }, 'wipe'); setSelected(0); }} disabled={locked || cells.every((c) => c < 0)} title={t('clear')} aria-label={t('clear')}
            className="flex h-9 flex-1 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 sm:flex-none bg-white/[0.07] text-white/75 transition active:scale-95 disabled:opacity-30"><Eraser size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {lie && (
          <p className={`flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[11.5px] font-bold leading-4 ${finish?.kind === 'lie' ? 'bg-[#ff4d5e]/20 text-[#ffb3ba]' : 'bg-[#ff4d5e]/10 text-[#ff9aa5]'}`}>
            <VenetianMask size={14} className="shrink-0" />{finish?.kind === 'lie' ? t('lieFound') : t('lieBanner')}
          </p>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {puzzle.props.map((p, i) => (
            <PropCard key={i} prop={p} stones={puzzle.stones} locale={locale} state={cardState(i)} flash={flash[i] ?? 0} focused={focus === i}
              onPress={() => setFocus(focus === i ? null : i)} label={t(`state_${cardState(i)}`)} />
          ))}
          {hint && <PropCard prop={hint} stones={puzzle.stones} locale={locale} state={liveTruth(hint, cells)} hint flash={0} focused={focus === -1} onPress={() => setFocus(focus === -1 ? null : -1)} label={t('hintCard')} />}
        </div>
        {answer && !done && <p className="text-[11px] font-bold text-white/40">{t('answerShown')}</p>}
      </div>

      {drag && (
        <span className="pointer-events-none fixed z-50 -ml-[26px] -mt-[34px] h-[52px] w-[52px]" style={{ left: drag.x, top: drag.y }}>
          <PgStone colour={puzzle.stones[drag.s]} size={52} mood="happy" />
        </span>
      )}
    </div>
  );
}
