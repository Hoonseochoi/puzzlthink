"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Clock3, Eraser, Flag, History, Lightbulb, PenLine, RotateCcw, SkipForward, Trash2, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { CoffeeNudge } from '@/components/SupportLink';
import { ONE_STROKE_SIZES, type Mark, type OneStrokeSize, type Puzzle, formatClock, generatePuzzle, hintEdges, isSolved, loopOrder, newSeed } from '@/lib/oneStroke';
import OneStrokeBoard, { STROKE_ACCENT, STROKE_INK, type Tool } from './OneStrokeBoard';

type Step = { changes: [number, Mark][]; hint?: boolean };
type Phase = 'play' | 'solved' | 'reveal' | 'gaveUp';
const SIZE_KEY = 'puzzlthink_stroke_size';
const REVEAL_MS = 2600;

/** Replays the steps up to `at`: the marks then, and which edges hints had fixed. */
function frameAt(edgeCount: number, steps: Step[], at: number) {
  const marks = new Array<Mark>(edgeCount).fill(0);
  const locked = new Set<number>();
  for (const step of steps.slice(0, at)) for (const [e, v] of step.changes) { marks[e] = v; if (step.hint) locked.add(e); }
  return { marks, locked };
}

/** 규칙 한붓그리기 — practice: pick a size, unlimited hints, give up to see the answer, replay your own lines. */
export default function OneStrokeGame() {
  const t = useTranslations('OneStroke');
  const [size, setSize] = useState<OneStrokeSize>(9);
  const [seed, setSeed] = useState<number | null>(null);
  const puzzle = useMemo<Puzzle | null>(() => (seed === null ? null : generatePuzzle(size, seed)), [size, seed]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [steps, setSteps] = useState<Step[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [phase, setPhase] = useState<Phase>('play');
  const [startedAt, setStartedAt] = useState(0);
  const [endMs, setEndMs] = useState(0);
  const [now, setNow] = useState(0);
  const [hints, setHints] = useState(0);
  const [flashArea, setFlashArea] = useState<{ r: number; c: number } | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const timers = useRef<number[]>([]);
  // Several pointer moves can arrive before React re-renders, so changes build on the latest marks.
  const marksRef = useRef<Mark[]>([]);
  const phaseRef = useRef<Phase>('play');
  const setBoard = (next: Mark[]) => { marksRef.current = next; setMarks(next); };
  const setPhaseNow = (next: Phase) => { phaseRef.current = next; setPhase(next); };

  const start = (s: OneStrokeSize) => {
    timers.current.forEach((id) => window.clearTimeout(id)); timers.current = [];
    const p = generatePuzzle(s, newSeed());
    setSize(s); setSeed(p.seed);
    setBoard(new Array<Mark>(p.solution.length).fill(0)); setLocked(new Set()); setSteps([]);
    setTool('pen'); setPhaseNow('play'); setStartedAt(Date.now()); setEndMs(0); setHints(0); setFlashArea(null); setRevealed(0); setReplaying(false); setConfirmClear(false);
    try { localStorage.setItem(SIZE_KEY, String(s)); } catch { /* optional */ }
  };

  // First board once mounted (random seed, last size used).
  useEffect(() => {
    let s: OneStrokeSize = 9;
    try { const saved = Number(localStorage.getItem(SIZE_KEY)); if ((ONE_STROKE_SIZES as readonly number[]).includes(saved)) s = saved as OneStrokeSize; } catch { /* optional */ }
    start(s); // eslint-disable-line react-hooks/set-state-in-effect -- the board is random, so it is made in the browser
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, on mount

  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(id); }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const apply = (changes: [number, Mark][], hint = false) => {
    if (!puzzle || phaseRef.current !== 'play') return;
    const next = [...marksRef.current];
    for (const [e, v] of changes) next[e] = v;
    setBoard(next);
    setSteps((list) => [...list, { changes, hint }]);
    if (isSolved(puzzle, next)) { setPhaseNow('solved'); setEndMs(Date.now() - startedAt); }
  };

  const takeHint = (r: number, c: number) => {
    if (!puzzle) return;
    const edges = hintEdges(puzzle, r, c);
    const changes = edges.map((e) => [e, puzzle.solution[e] ? 1 : 2] as [number, Mark]);
    setLocked((set) => new Set([...set, ...edges]));
    setHints((n) => n + 1);
    setTool('pen');
    setFlashArea({ r, c });
    timers.current.push(window.setTimeout(() => setFlashArea(null), 1400));
    apply(changes, true);
  };

  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); timers.current.push(window.setTimeout(() => setConfirmClear(false), 2500)); return; }
    setConfirmClear(false);
    const changes = marksRef.current.map((m, e) => [e, 0] as [number, Mark]).filter(([e]) => marksRef.current[e] !== 0 && !locked.has(e));
    if (changes.length) apply(changes);
  };

  // Give up: the answer is drawn around the loop, then the board can be replayed.
  const order = useMemo(() => (puzzle ? loopOrder(puzzle) : []), [puzzle]);
  const giveUp = () => {
    if (!puzzle || phaseRef.current !== 'play') return;
    setPhaseNow('reveal'); setEndMs(Date.now() - startedAt); setRevealed(0);
    const stepMs = Math.max(12, REVEAL_MS / Math.max(1, order.length));
    order.forEach((_, i) => timers.current.push(window.setTimeout(() => setRevealed(i + 1), stepMs * (i + 1))));
    timers.current.push(window.setTimeout(() => setPhaseNow('gaveUp'), stepMs * order.length + 300));
  };

  const player = useReplayPlayer(steps.length, replaying, 260);
  const frame = useMemo(() => (puzzle && replaying ? frameAt(puzzle.solution.length, steps, player.at) : null), [puzzle, replaying, steps, player.at]);

  if (!puzzle) return <div className={SHELL} style={accentVars(STROKE_ACCENT, STROKE_INK)} />;

  const elapsed = phase === 'play' ? Math.max(0, now - startedAt) : endMs;
  const lines = marks.filter((m) => m === 1).length;
  const tools: [Tool, typeof PenLine, string][] = [['pen', PenLine, t('toolPen')], ['eraser', Eraser, t('toolEraser')], ['marker', X, t('toolMarker')]];
  const done = phase === 'solved' || phase === 'gaveUp';

  return (
    <div className={SHELL} style={{ ...accentVars(STROKE_ACCENT, STROKE_INK), backgroundImage: fog('120, 100, 220') }}>
      <Shards tint="#2a2450" />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => start(size)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newBoard')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={KICKER}>{t('practiceKicker', { size: `${size}×${size}` })}</p>
              <p className="mt-1 flex items-center gap-3 font-mono text-xs text-white/60">
                <span className="flex items-center gap-1"><Clock3 size={13} />{formatClock(elapsed)}</span>
                <span className="flex items-center gap-1"><Lightbulb size={13} />{t('hintsUsed', { n: hints })}</span>
              </p>
            </div>
            <div className="flex gap-1">
              {ONE_STROKE_SIZES.map((s) => <button key={s} type="button" onClick={() => start(s)} className={`px-2.5 py-1.5 ${seg(size === s)}`}>{s}×{s}</button>)}
            </div>
          </div>

          {replaying && <ReplayHeader player={player} caption={t('replayCaption')} onClose={() => setReplaying(false)} />}

          <OneStrokeBoard
            puzzle={puzzle}
            marks={frame ? frame.marks : marks}
            locked={frame ? frame.locked : locked}
            tool={tool}
            readOnly={phase !== 'play' || replaying}
            showOverflow
            onEdges={(changes) => apply(changes)}
            onHint={takeHint}
            flashArea={flashArea}
            dimLines={!replaying && (phase === 'reveal' || phase === 'gaveUp')}
            solutionUpTo={!replaying && (phase === 'reveal' || phase === 'gaveUp') ? order.slice(0, revealed) : null}
          />

          {replaying ? <ReplayControls player={player} onShowResult={() => setReplaying(false)} /> : phase === 'play' ? (
            <div className="mx-auto mt-3 max-w-[560px] space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                {tools.map(([id, Icon, label]) => (
                  <button key={id} type="button" onClick={() => setTool(id)} aria-pressed={tool === id} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === id)}`}><Icon size={17} />{label}</button>
                ))}
                <button type="button" onClick={clearAll} className={`flex flex-col items-center gap-1 py-2.5 ${confirmClear ? 'rounded-md bg-[#e5484d]/20 text-xs font-extrabold text-[#ff8f8f] ring-1 ring-[#e5484d]/50' : seg(false)}`}><Trash2 size={17} />{confirmClear ? t('clearConfirm') : t('toolClear')}</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setTool(tool === 'hint' ? 'pen' : 'hint')} className={`py-2.5 ${tool === 'hint' ? BTN_ACCENT : BTN}`}><Lightbulb size={14} />{tool === 'hint' ? t('hintPick') : t('hint')}</button>
                <button type="button" onClick={giveUp} className={`py-2.5 ${BTN}`}><Flag size={14} />{t('giveUp')}</button>
              </div>
              <p className="text-center text-[11px] text-white/40">{tool === 'hint' ? t('hintHelp') : t(`help_${tool}`)}</p>
            </div>
          ) : (
            <div className="mx-auto mt-4 max-w-[440px] text-center">
              {phase === 'solved' && <>
                <p className="flex items-center justify-center gap-2 text-2xl font-black"><Check size={24} className="text-[#7ee2ae]" />{t('solvedTitle', { time: formatClock(endMs) })}</p>
                <p className="mt-1 text-xs text-white/50">{t('solvedDesc', { size: `${size}×${size}`, hints })}</p>
              </>}
              {phase === 'reveal' && <p className="text-sm font-bold text-white/60">{t('revealing')}</p>}
              {phase === 'gaveUp' && <p className="text-lg font-black">{t('gaveUpTitle')}</p>}
              {done && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setReplaying(true)} disabled={!steps.length} className={`py-3 ${BTN} disabled:opacity-40`}><History size={14} />{t('replay')}</button>
                  <button type="button" onClick={() => start(size)} className={`py-3 ${BTN_ACCENT}`}><SkipForward size={14} />{t('next')}</button>
                </div>
              )}
              {phase === 'solved' && <CoffeeNudge className="mt-4" />}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('board')}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[[t('statSize'), `${size}×${size}`], [t('statLines'), String(lines)], [t('statHints'), String(hints)]].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-black/30 p-2"><p className="text-[9px] font-black tracking-widest text-white/35">{label}</p><p className="mt-0.5 font-mono text-lg font-black">{value}</p></div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-white/45">{t('sizeHint')}</p>
          </section>
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(['quick1', 'quick2', 'quick3', 'quick4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
    </div>
  );
}
