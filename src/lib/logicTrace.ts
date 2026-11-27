// Input trace for a logic challenge run (새로운 맵 · 맵 뺏기), kept with the run so a record can be reviewed later for
// automation, the way 슬리더링크 runs are. Recording only: nothing here decides whether a clear counts.
// A step is one input as the game applied it: { c: [[cell or edge, new value], …], t: ms since the run started },
// plus u: 1 (made by undo), w: 1 (clear-all / reset), d: 1 (more of the drag the step before began).
import type { LogicBoard } from './logicPuzzles';

export type LogicTraceStep = { c: [number, number][]; t: number; u?: 1; w?: 1; d?: 1 };
export type LogicTraceSignals = {
  cleared: boolean;
  /** Steps recorded, kept in the payload, and dropped past the cap. */
  steps: number; kept: number; dropped: number;
  /** Inputs (a tap, a whole drag, an undo or a reset count once). */
  inputs: number;
  /** Values set (not cleared) by the player's own inputs, and how many of those disagreed with the answer then (null: no single answer). */
  adds: number; wrong: number | null;
  /** Marks the player cleared by hand, undo presses and clear-alls (슬리더링크 `wipes`). */
  erases: number; undos: number; wipes: number;
  /** Times the player left the board (tab or app), and for how long in all. */
  away: { n: number; ms: number };
  /** Real presses by pointer type, and key presses. */
  ptr: { mouse: number; touch: number; pen: number; key: number };
  /** Events not made by the user agent (dispatched from script). */
  untrusted: number;
  /** Inputs with no real press, drag or key within 1.5 s before them. */
  noEvent: number;
  /** Mouse: gaps between two presses, gaps with at most one pointer move in between, median moves per gap. */
  mouseGaps: number; stillGaps: number; movesMed: number | null;
  webdriver: boolean;
  /** Time between inputs (ms): median, 10th percentile, coefficient of variation, longest. */
  gap: { med: number; p10: number; cv: number; max: number } | null;
  /** Pauses of 3 s+: how many and how even (cv); bursts = pauses followed by 5+ inputs under 0.6 s apart. */
  pauses: { n: number; cv: number | null }; bursts: number;
  suspects: ('webdriver' | 'no_wrong' | 'even_gaps' | 'no_move' | 'no_event' | 'untrusted' | 'think_burst')[];
};
export type LogicTrace = { steps: LogicTraceStep[]; signals: LogicTraceSignals };

const MAX_STEPS = 4000;
const MAX_CHANGES = 12000; // a long drag or a reset carries many changes in one step
const EVENT_WINDOW_MS = 1500;
const PAUSE_MS = 3000;
const BURST_GAP_MS = 600;
const BURST_LEN = 5;
const MOVE_SAMPLES = 1000;

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const quantile = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
const cvOf = (xs: number[]) => {
  if (xs.length < 2) return null;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (!mean) return 0;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
  return round(sd / mean);
};

/** Starts recording one run (call when the board appears; `stop` removes the listeners). */
export function startLogicTrace(board: LogicBoard, startedAt: number) {
  // 마방진 스왑 has many magic squares, so a move cannot be called wrong; 비나이로 answers keep both colours.
  const answer = board.kind === 'magicswap' ? null : board.answer;
  const twoColours = !!answer && answer.includes(2);
  const steps: LogicTraceStep[] = [];
  let total = 0, changes = 0, inputs = 0, adds = 0, wrong = 0, erases = 0, undos = 0, wipes = 0, noEvent = 0;
  let lastGesture: number | null = null;
  const starts: number[] = [];
  const ptr = { mouse: 0, touch: 0, pen: 0, key: 0 };
  let untrusted = 0, down = false, lastEventAt = -Infinity;
  let mouseSeen = false, movesSince = 0, mouseGaps = 0, stillGaps = 0;
  const moveSamples: number[] = [];

  const onDown = (e: PointerEvent) => {
    if (!e.isTrusted) { untrusted++; return; }
    const type = e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse';
    ptr[type]++;
    down = true; lastEventAt = Date.now();
    if (type === 'mouse') {
      if (mouseSeen) {
        mouseGaps++;
        if (movesSince <= 1) stillGaps++;
        if (moveSamples.length < MOVE_SAMPLES) moveSamples.push(movesSince);
      }
      mouseSeen = true; movesSince = 0;
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!e.isTrusted) return;
    if (e.pointerType === 'mouse') movesSince++;
    if (e.buttons) lastEventAt = Date.now();
  };
  const onUp = (e: PointerEvent) => { if (e.isTrusted) { down = false; lastEventAt = Date.now(); } };
  const onKey = (e: KeyboardEvent) => { if (!e.isTrusted) { untrusted++; return; } ptr.key++; lastEventAt = Date.now(); };
  const onClick = (e: MouseEvent) => { if (!e.isTrusted) untrusted++; };
  const opts = { capture: true, passive: true } as const;
  window.addEventListener('pointerdown', onDown, opts);
  window.addEventListener('pointermove', onMove, opts);
  window.addEventListener('pointerup', onUp, opts);
  window.addEventListener('pointercancel', onUp, opts);
  window.addEventListener('keydown', onKey, opts);
  window.addEventListener('click', onClick, opts);
  let live = true;
  const stop = () => {
    if (!live) return;
    live = false;
    window.removeEventListener('pointerdown', onDown, opts);
    window.removeEventListener('pointermove', onMove, opts);
    window.removeEventListener('pointerup', onUp, opts);
    window.removeEventListener('pointercancel', onUp, opts);
    window.removeEventListener('keydown', onKey, opts);
    window.removeEventListener('click', onClick, opts);
  };

  /** One applied input: the changes that really happened, its gesture id (-1 undo, -2 clear-all). */
  const input = (real: [number, number][], gesture: number, kind: 'play' | 'undo' | 'wipe') => {
    if (!live || !real.length) return;
    const now = Date.now();
    const t = now - startedAt;
    const drag = kind === 'play' && gesture >= 0 && gesture === lastGesture;
    lastGesture = kind === 'play' ? gesture : null;
    total++;
    if (!drag) {
      inputs++; starts.push(t);
      if (!down && now - lastEventAt > EVENT_WINDOW_MS) noEvent++;
      if (kind === 'undo') undos++;
      if (kind === 'wipe') wipes++;
    }
    if (kind === 'play') {
      for (const [i, v] of real) {
        if (v === 0) { erases++; continue; }
        adds++;
        if (answer && (twoColours ? v !== answer[i] : (v === 1) !== (answer[i] === 1))) wrong++;
      }
    }
    if (steps.length < MAX_STEPS && changes + real.length <= MAX_CHANGES) {
      const step: LogicTraceStep = { c: real.map(([i, v]) => [i, v]), t };
      if (kind === 'undo') step.u = 1;
      if (kind === 'wipe') step.w = 1;
      if (drag) step.d = 1;
      steps.push(step); changes += real.length;
    }
  };

  /** Ends the recording and returns the payload. `away`: [from, to] ms spans the game already keeps. */
  const finish = (cleared: boolean, away: [number, number][]): LogicTrace => {
    stop();
    const gaps = starts.slice(1).map((s, k) => s - starts[k]);
    const sorted = [...gaps].sort((a, b) => a - b);
    const gap = sorted.length ? { med: quantile(sorted, 0.5), p10: quantile(sorted, 0.1), cv: cvOf(gaps) ?? 0, max: sorted[sorted.length - 1] } : null;
    const pauseIdx = gaps.flatMap((g, k) => (g >= PAUSE_MS ? [k] : []));
    const bursts = pauseIdx.filter((k) => gaps.length - k - 1 >= BURST_LEN && gaps.slice(k + 1, k + 1 + BURST_LEN).every((g) => g < BURST_GAP_MS)).length;
    const moves = [...moveSamples].sort((a, b) => a - b);
    const webdriver = typeof navigator !== 'undefined' && navigator.webdriver === true;
    const signals: LogicTraceSignals = {
      cleared, steps: total, kept: steps.length, dropped: total - steps.length, inputs,
      adds, wrong: answer ? wrong : null, erases, undos, wipes,
      away: { n: away.length, ms: away.reduce((a, [f, to]) => a + Math.max(0, to - f), 0) },
      ptr, untrusted, noEvent,
      mouseGaps, stillGaps, movesMed: moves.length ? quantile(moves, 0.5) : null,
      webdriver, gap,
      pauses: { n: pauseIdx.length, cv: cvOf(pauseIdx.map((k) => gaps[k])) }, bursts,
      suspects: [],
    };
    const s = signals.suspects;
    if (webdriver) s.push('webdriver');
    if (cleared && answer && inputs >= 20 && wrong === 0 && erases === 0 && undos === 0 && wipes === 0) s.push('no_wrong');
    if (gap && gaps.length >= 20 && gap.cv < 0.3) s.push('even_gaps');
    if (mouseGaps >= 10 && stillGaps / mouseGaps >= 0.8) s.push('no_move');
    if (noEvent >= 3) s.push('no_event');
    if (untrusted > 0) s.push('untrusted');
    if (bursts >= 3) s.push('think_burst');
    return { steps, signals };
  };

  return { input, finish, stop };
}
export type LogicTraceRecorder = ReturnType<typeof startLogicTrace>;
