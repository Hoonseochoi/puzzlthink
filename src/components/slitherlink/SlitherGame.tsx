"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronDown, Clock3, Crown, Eraser, Flag, History, Infinity as InfinityIcon, Lightbulb, Loader2, PenLine, RefreshCw, RotateCcw, SkipForward, Undo2, Swords, Timer, Trash2, Trophy, X } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/components/AuthProvider';
import BugReport from '@/components/BugReport';
import ShareButtons from '@/components/ShareButtons';
import RankMove from '@/components/RankMove';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { CoffeeNudge } from '@/components/SupportLink';
import { SLITHER_SIZES, type Mark, type SlitherSize, type Puzzle, formatClock, generatePuzzle, hintEdges, isSolved, loopOrder, newSeed } from '@/lib/slitherlink';
import { type BoardRow, type FinishResult, type RankRow, type RivalRow, type SlitherRun, boardPath, countPractice, fetchBoard, fetchBoards, fetchMe, fetchRanking, fetchRivals, finishCleared, finishRun, startBeat, startNew } from '@/lib/slitherChallenge';
import { reportGame } from '@/lib/stats';
import SlitherHistory from './SlitherHistory';
import ClearRate from '../ClearRate';
import SlitherBoard, { SLITHER_ACCENT, SLITHER_INK, type Tool, undoOf, useUndoKey } from './SlitherBoard';
import SlitherUpdate from './SlitherUpdate';

type Mode = 'challenge' | 'beat' | 'practice';
type Step = { changes: [number, Mark][]; hint?: boolean; at?: [number, number]; t?: number };
type Phase = 'lobby' | 'starting' | 'play' | 'solved' | 'reveal' | 'gaveUp' | 'failed';
const MODES: Mode[] = ['challenge', 'beat', 'practice'];
const SIZE_KEY = 'puzzlthink_slither_size';
const REVEAL_MS = 2600;
const CHALLENGE_HINTS = 1;
// Leaving the board (another tab or app) for this long counts as an exit; AWAY_LIMIT exits void a challenge clear under 20 minutes.
const AWAY_MIN_MS = 2000;
const AWAY_LIMIT = 3;

/** Replays the steps up to `at`: the marks then, and which edges hints had fixed. */
function frameAt(edgeCount: number, steps: Step[], at: number) {
  const marks = new Array<Mark>(edgeCount).fill(0);
  const locked = new Set<number>();
  for (const step of steps.slice(0, at)) for (const [e, v] of step.changes) { marks[e] = v; if (step.hint) locked.add(e); }
  return { marks, locked };
}

/** Wall-clock time for the run timer (kept outside the component: it is only read in event handlers). */
const clockNow = () => Date.now();

const readMode = (): Mode => {
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'practice' || m === 'beat' ? m : 'challenge';
};

/**
 * 슬리더링크.
 * - 새로운 챌린지: a fresh random 11×11 board from the server, timed; clearing it ranks you and publishes the board.
 * - 기존 챌린지 깨기: a published board within its holder's time (one try per board); beat it to take it over.
 * - 연습: any size, unlimited hints, give up to see the answer.
 */
export default function SlitherGame() {
  const t = useTranslations('Slitherlink');
  const locale = useLocale();
  const { user, ready, configured, nickname } = useAuth();
  const [mode, setMode] = useState<Mode>('challenge');
  const [size, setSize] = useState<SlitherSize>(9);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [steps, setSteps] = useState<Step[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [phase, setPhase] = useState<Phase>('lobby');
  const [startedAt, setStartedAt] = useState(0);
  const [endMs, setEndMs] = useState(0);
  const [now, setNow] = useState(0);
  const [hints, setHints] = useState(0);
  const [flashArea, setFlashArea] = useState<{ r: number; c: number } | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [run, setRun] = useState<SlitherRun | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankRow[] | null>(null);
  const [me, setMe] = useState<{ rank: number; maps: number; total: number } | null>(null);
  const [boards, setBoards] = useState<BoardRow[] | null>(null);
  const [rivals, setRivals] = useState<RivalRow[]>([]);
  const [listTick, setListTick] = useState(0);
  const [historyOf, setHistoryOf] = useState<string | null>(null); // board whose owner history is open in the list
  const [focus, setFocus] = useState<BoardRow | null>(null); // one board picked from a link or the ranking
  const timers = useRef<number[]>([]);
  // Several pointer moves can arrive before React re-renders, so changes build on the latest marks.
  const marksRef = useRef<Mark[]>([]);
  const phaseRef = useRef<Phase>('lobby');
  const hintsRef = useRef(0);
  const runRef = useRef<SlitherRun | null>(null);
  // Time spent away from the board during a run (another tab or app), sent with a clear for review.
  const awayRef = useRef<{ spans: [number, number][]; since: number | null }>({ spans: [], since: null });
  const [awayWarn, setAwayWarn] = useState<number | null>(null); // "보드를 벗어났어요 (n/3)" after each counted exit
  const stepsRef = useRef<Step[]>([]); // every move this run, for the server's replay
  // 되돌리기: for each of the player's moves, the changes that undo it (an undo is itself a new step in the replay).
  const undoRef = useRef<[number, Mark][][]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const setBoard = (next: Mark[]) => { marksRef.current = next; setMarks(next); };
  const setPhaseNow = (next: Phase) => { phaseRef.current = next; setPhase(next); };

  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };

  /** Lays out a new board and starts the clock. */
  const begin = (dots: number, seed: number) => {
    clearTimers();
    const p = generatePuzzle(dots, seed);
    setPuzzle(p);
    setBoard(new Array<Mark>(p.solution.length).fill(0)); setLocked(new Set()); setSteps([]); stepsRef.current = []; undoRef.current = []; setUndoCount(0);
    setTool('pen'); setPhaseNow('play'); const at = clockNow(); setStartedAt(at); setNow(at); setEndMs(0);
    awayRef.current = { spans: [], since: null };
    hintsRef.current = 0; setHints(0); setFlashArea(null); setRevealed(0); setReplaying(false); setConfirmClear(false); setResult(null); setError(null);
  };

  const startPractice = (s: SlitherSize) => {
    setSize(s); setRun(null); runRef.current = null;
    begin(s, newSeed());
    try { localStorage.setItem(SIZE_KEY, String(s)); } catch { /* optional */ }
  };

  /** Leaving a running challenge counts as giving up (the server keeps the time it started). */
  const abandon = () => {
    const r = runRef.current;
    if (r && phaseRef.current === 'play') finishRun(r.run, false, hintsRef.current);
    runRef.current = null; setRun(null);
  };

  const switchMode = (m: Mode) => {
    abandon(); clearTimers();
    setMode(m); setReplaying(false); setResult(null); setError(null); setFocus(null);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
    if (m === 'practice') {
      let s: SlitherSize = 9;
      try { const saved = Number(localStorage.getItem(SIZE_KEY)); if ((SLITHER_SIZES as readonly number[]).includes(saved)) s = saved as SlitherSize; } catch { /* optional */ }
      startPractice(s);
    } else { setPuzzle(null); setPhaseNow('lobby'); setListTick((n) => n + 1); }
  };

  /** Opens one board's card ("○○님의 맵 해보기") in the 기존 챌린지 tab. */
  const openBoard = (id: string) => {
    if (mode !== 'beat' || phaseRef.current !== 'lobby') switchMode('beat');
    fetchBoard(id).then(({ data }) => { setFocus(data?.[0] ?? null); if (!data?.[0]) setError(t('errStart')); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mode (and a shared board) from the URL once mounted (practice boards are random, so they are made in the browser).
  useEffect(() => {
    switchMode(readMode()); // eslint-disable-line react-hooks/set-state-in-effect -- read once from the URL
    const board = new URLSearchParams(window.location.search).get('board');
    if (board && /^[0-9a-f]{10}$/.test(board)) fetchBoard(board).then(({ data }) => setFocus(data?.[0] ?? null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, on mount
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  useEffect(() => () => clearTimers(), []);
  // Away from the board (tab hidden, or the window lost focus to another app) while a challenge run is on.
  useEffect(() => {
    const away = () => { if (runRef.current && phaseRef.current === 'play' && awayRef.current.since === null) awayRef.current.since = Date.now(); };
    const back = () => {
      const a = awayRef.current;
      if (a.since === null) return;
      if (runRef.current) {
        a.spans.push([a.since, Date.now()]);
        const n = a.spans.filter(([from, to]) => to - from >= AWAY_MIN_MS).length;
        if (Date.now() - a.since >= AWAY_MIN_MS) {
          setAwayWarn(n);
          timers.current.push(window.setTimeout(() => setAwayWarn(null), 4000));
        }
      }
      a.since = null;
    };
    const onVisibility = () => (document.hidden ? away() : back());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', away);
    window.addEventListener('focus', back);
    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('blur', away); window.removeEventListener('focus', back); };
  }, []);
  // Leaving the page mid-challenge ends the run as given up.
  useEffect(() => {
    const onLeave = () => { const r = runRef.current; if (r && phaseRef.current === 'play') finishRun(r.run, false, hintsRef.current); };
    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  // Lobby lists: the time ranking and the published boards.
  useEffect(() => {
    if (mode === 'practice') return;
    let alive = true;
    fetchRanking(10).then(({ data }) => { if (alive) setRanking(data ?? []); });
    if (mode === 'beat') fetchBoards(40).then(({ data }) => { if (alive) setBoards(data ?? []); });
    if (user) fetchMe().then(({ data }) => { if (alive) setMe(data?.[0] ?? null); });
    if (user) fetchRivals(5).then(({ data }) => { if (alive) setRivals(data ?? []); });
    return () => { alive = false; };
  }, [mode, user, listTick]);

  const startRun = async (kind: 'challenge' | 'beat', id?: string) => {
    setPhaseNow('starting'); setError(null);
    const { data, error: err } = kind === 'challenge' ? await startNew() : await startBeat(id!);
    if (!data) { setPhaseNow('lobby'); setError(err?.includes('tried') ? t('errTried') : err?.includes('sign_in') ? t('needSignIn') : t('errStart')); setListTick((n) => n + 1); return; }
    runRef.current = data; setRun(data);
    // The try is spent the moment the board is handed out: drop its 해보기 everywhere at once, so leaving
    // (give up, back, reload) never shows it again, even before the lists refresh from the server.
    if (kind === 'beat' && id) {
      setBoards((list) => list?.map((b) => (b.id === id ? { ...b, tried: true } : b)) ?? list);
      setFocus((f) => (f?.id === id ? { ...f, tried: true } : f));
      setRanking((list) => list?.map((row) => (row.board === id ? { ...row, tried: true } : row)) ?? list);
    }
    begin(data.dots, data.seed);
  };

  const endRun = async (cleared: boolean) => {
    const r = runRef.current;
    if (!r) return;
    const { data } = cleared
      ? await finishCleared(r.run, stepsRef.current.map((st) => (st.hint && st.at ? { h: st.at, t: st.t } : { c: st.changes, t: st.t })), awayRef.current.spans.map(([a, b]) => [a - startedAt, b - startedAt]))
      : await finishRun(r.run, false, hintsRef.current);
    runRef.current = null;
    setResult(data ?? { ok: false, ms: Date.now() - startedAt, rank: null, total: null });
    if (data) reportGame(`slitherlink-${r.run}`, 'slitherlink', 'solo', data.ok ? 'win' : 'loss', { kind: mode === 'beat' ? 'beat' : 'new', ms: data.ms, hints: hintsRef.current });
    setListTick((n) => n + 1);
  };

  const apply = (changes: [number, Mark][], hint = false, at?: [number, number], undoing = false) => {
    if (!puzzle || phaseRef.current !== 'play') return;
    if (!hint && !undoing) { undoRef.current = [...undoRef.current, undoOf(marksRef.current, changes)]; setUndoCount(undoRef.current.length); }
    const next = [...marksRef.current];
    for (const [e, v] of changes) next[e] = v;
    setBoard(next);
    const step: Step = { changes, hint, at, t: Date.now() - startedAt };
    stepsRef.current = [...stepsRef.current, step];
    setSteps(stepsRef.current);
    if (isSolved(puzzle, next)) {
      setPhaseNow('solved'); setEndMs(Date.now() - startedAt);
      if (mode === 'practice') countPractice(); else endRun(true);
    }
  };

  /** Steps back one move; edges a hint has fixed since then stay as they are. */
  const undo = () => {
    if (phaseRef.current !== 'play' || replaying || !undoRef.current.length) return;
    const last = undoRef.current[undoRef.current.length - 1];
    undoRef.current = undoRef.current.slice(0, -1); setUndoCount(undoRef.current.length);
    const changes = last.filter(([e, v]) => !locked.has(e) && marksRef.current[e] !== v);
    if (changes.length) apply(changes, false, undefined, true);
  };
  useUndoKey(undo);

  const hintLimit = mode === 'practice' ? Infinity : CHALLENGE_HINTS;
  const takeHint = (r: number, c: number) => {
    if (!puzzle || hintsRef.current >= hintLimit) return;
    const edges = hintEdges(puzzle, r, c);
    const changes = edges.map((e) => [e, puzzle.solution[e] ? 1 : 2] as [number, Mark]);
    setLocked((set) => new Set([...set, ...edges]));
    hintsRef.current += 1; setHints(hintsRef.current);
    setTool('pen');
    setFlashArea({ r, c });
    timers.current.push(window.setTimeout(() => setFlashArea(null), 1400));
    apply(changes, true, [r, c]);
  };

  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); timers.current.push(window.setTimeout(() => setConfirmClear(false), 2500)); return; }
    setConfirmClear(false);
    const changes = marksRef.current.map((m, e) => [e, 0] as [number, Mark]).filter(([e]) => marksRef.current[e] !== 0 && !locked.has(e));
    if (changes.length) apply(changes);
  };

  // Give up: the answer is drawn around the loop (not for published boards, which others still play).
  const order = useMemo(() => (puzzle ? loopOrder(puzzle) : []), [puzzle]);
  const giveUp = () => {
    if (!puzzle || phaseRef.current !== 'play') return;
    setEndMs(Date.now() - startedAt);
    if (mode !== 'practice') endRun(false);
    if (mode === 'beat') { setPhaseNow('failed'); return; }
    setPhaseNow('reveal'); setRevealed(0);
    const stepMs = Math.max(12, REVEAL_MS / Math.max(1, order.length));
    order.forEach((_, i) => timers.current.push(window.setTimeout(() => setRevealed(i + 1), stepMs * (i + 1))));
    timers.current.push(window.setTimeout(() => setPhaseNow('gaveUp'), stepMs * order.length + 300));
  };

  // 기존 챌린지: the holder's time runs out.
  const limitMs = mode === 'beat' ? run?.limit_ms ?? null : null;
  const elapsed = phase === 'play' ? Math.max(0, now - startedAt) : endMs;
  const timeUp = phase === 'play' && limitMs !== null && elapsed >= limitMs;
  useEffect(() => {
    if (!timeUp) return;
    setEndMs(limitMs ?? 0); setPhaseNow('failed'); endRun(false); // eslint-disable-line react-hooks/set-state-in-effect -- the clock ran out
  }, [timeUp]); // eslint-disable-line react-hooks/exhaustive-deps

  const player = useReplayPlayer(steps.length, replaying, 260);
  const frame = useMemo(() => (puzzle && replaying ? frameAt(puzzle.solution.length, steps, player.at) : null), [puzzle, replaying, steps, player.at]);

  const time = (ms: number) => { const s = Math.round(ms / 1000); return t('minSec', { m: Math.floor(s / 60), s: s % 60 }); };
  const signedIn = !!user;
  const myName = nickname || 'Player';
  const playing = phase === 'play' || phase === 'solved' || phase === 'reveal' || phase === 'gaveUp' || phase === 'failed';
  const done = phase === 'solved' || phase === 'gaveUp' || phase === 'failed';
  const lines = marks.filter((m) => m === 1).length;
  const tools: [Tool, typeof PenLine, string][] = [['pen', PenLine, t('toolPen')], ['eraser', Eraser, t('toolEraser')], ['marker', X, t('toolMarker')]];
  const hintsLeft = hintLimit - hints;
  const dots = puzzle?.dots ?? 11;

  const rankingPanel = (
    <section className={PANEL}>
      <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('rankingTitle')}</p><Trophy size={14} className="text-(--accent)" /></div>
      {me && <p className="mt-2 rounded-md bg-(--accent)/15 px-2.5 py-1.5 text-xs font-black text-(--accent)">{t('myRank', { rank: me.rank, total: me.total, n: me.maps })}</p>}
      {ranking === null ? <p className="mt-3 flex items-center gap-2 text-xs text-white/45"><Loader2 size={13} className="animate-spin" />{t('loading')}</p>
        : ranking.length === 0 ? <p className="mt-3 text-xs text-white/45">{t('rankingEmpty')}</p>
          : <ol className="mt-3 space-y-1">{ranking.map((row) => (
            <li key={`${row.rank}-${row.nickname}`} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${row.is_me ? 'bg-(--accent)/20 font-black' : 'bg-black/25'}`}>
              <span className="w-7 font-mono text-white/50">#{row.rank}</span><span className="min-w-0 flex-1 truncate">{row.nickname}</span><span className="font-mono">{t('mapsCount', { n: row.maps })}</span><RankMove rank={row.rank} prev={row.prev_rank} dark />
              {row.board && !row.is_me && <button type="button" disabled={row.tried} onClick={() => openBoard(row.board!)} title={t('tryBoard', { name: row.nickname })} className="ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-(--accent) ring-1 ring-(--accent)/40 hover:bg-(--accent)/15 disabled:opacity-30">{row.tried ? t('boardTried') : t('rankTry')}</button>}
            </li>
          ))}</ol>}
    </section>
  );

  return (
    <div className={SHELL} style={{ ...accentVars(SLITHER_ACCENT, SLITHER_INK), backgroundImage: fog('120, 100, 220') }}>
      <Shards tint="#2a2450" />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle={t('subtitle')}>
        <SlitherUpdate /><BugReport /><LanguageSwitcher compact dark />
        {mode === 'practice' && <button type="button" onClick={() => startPractice(size)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newBoard')}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {MODES.map((m) => {
              const Icon = m === 'challenge' ? Timer : m === 'beat' ? Swords : InfinityIcon;
              return <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{t(`mode_${m}`)}</button>;
            })}
          </div>

          {/* Lobbies */}
          {mode !== 'practice' && !playing && (
            <div className="mx-auto max-w-lg py-4 text-center">
              {mode === 'challenge' ? <Timer size={34} className="mx-auto text-(--accent)" /> : <Swords size={34} className="mx-auto text-(--accent)" />}
              <h1 className="mt-3 text-2xl font-black">{t(mode === 'challenge' ? 'newTitle' : 'beatTitle')}</h1>
              <p className="mt-2 break-keep text-sm leading-6 text-white/55">{t(mode === 'challenge' ? 'newDesc' : 'beatDesc')}</p>
              {error && <p className="mt-3 text-xs font-bold text-[#ff8f8f]">{error}</p>}
              <p className="mt-3 break-keep text-[11px] leading-5 text-white/40">{t('awayRule', { n: AWAY_LIMIT })}</p>
              {ready && configured && !signedIn ? (
                <div className="mt-5 rounded-[14px] border border-(--accent)/30 bg-(--accent)/[.06] p-4">
                  <p className="break-keep text-xs font-bold leading-5 text-white/65">{t('needSignIn')}</p>
                  <div className="mt-3 flex justify-center"><AuthButton source="slitherlink" /></div>
                </div>
              ) : mode === 'challenge' ? (
                <button type="button" disabled={phase === 'starting'} onClick={() => startRun('challenge')} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm`}>
                  {phase === 'starting' ? <Loader2 size={16} className="animate-spin" /> : <Timer size={16} />}{t('newStart')}
                </button>
              ) : null}
              {mode === 'beat' && focus && (
                <div className="mt-5 rounded-[16px] border border-[#ffcf3f]/40 bg-gradient-to-b from-[#ffcf3f]/12 to-transparent p-5">
                  <Crown size={26} className="mx-auto text-[#ffcf3f]" />
                  <p className="mt-2 text-xl font-black">{t('boardHolder', { name: focus.holder })}</p>
                  <p className="mt-1 text-sm text-white/60">{t('focusLimit', { time: time(focus.holder_ms) })}</p>
                  <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-white/40"><ClearRate ns="Slitherlink" attempts={focus.attempts} clears={focus.takeovers} full />{t('boardMeta', { tries: focus.attempts, wins: focus.takeovers })}</p>
                  <div className="mt-3 text-left"><p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/40">{t('historyTitle')}</p><SlitherHistory id={focus.id} attempts={focus.attempts} clears={focus.takeovers} /></div>
                  <button type="button" disabled={focus.tried || focus.mine || !signedIn || phase === 'starting'} onClick={() => startRun('beat', focus.id)} className={`${BTN_ACCENT} mt-4 w-full py-3.5 text-sm disabled:opacity-40`}>
                    {phase === 'starting' ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} />}
                    {focus.mine ? t('focusMine') : focus.tried ? t('boardTried') : t('tryBoard', { name: focus.holder })}
                  </button>
                </div>
              )}
              {mode === 'beat' && (
                <div className="mt-5 text-left">
                  <div className="mb-2 flex items-center justify-between"><p className={PANEL_TITLE}>{t('boardsTitle')}</p><button type="button" onClick={() => setListTick((n) => n + 1)} aria-label={t('refresh')} className="rounded-md p-1.5 text-white/45 hover:text-(--accent)"><RefreshCw size={14} /></button></div>
                  {boards === null ? <p className="flex items-center gap-2 text-xs text-white/45"><Loader2 size={13} className="animate-spin" />{t('loading')}</p>
                    : boards.length === 0 ? <p className="rounded-md border border-dashed border-white/15 px-3 py-4 text-center text-xs text-white/45">{t('boardsEmpty')}</p>
                      : <ul className="space-y-1.5">{boards.map((b) => (
                        <li key={b.id} className="rounded-md border border-white/10 bg-black/30">
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <button type="button" onClick={() => setHistoryOf((cur) => (cur === b.id ? null : b.id))} aria-expanded={historyOf === b.id} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                              <Crown size={15} className="shrink-0 text-[#ffcf3f]" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-black">{t('boardHolder', { name: b.holder })} · <span className="font-mono text-(--accent)">{time(b.holder_ms)}</span></span>
                                <span className="flex items-center gap-1 truncate text-[11px] text-white/45"><ClearRate ns="Slitherlink" attempts={b.attempts} clears={b.takeovers} className="mr-0.5" /><span className="truncate">{t('boardMeta', { tries: b.attempts, wins: b.takeovers })}</span><ChevronDown size={11} className={`shrink-0 transition ${historyOf === b.id ? 'rotate-180' : ''}`} /></span>
                              </span>
                            </button>
                            <button type="button" disabled={b.tried || !signedIn || phase === 'starting'} onClick={() => startRun('beat', b.id)} className={`${BTN_ACCENT} shrink-0 !px-3 !py-1.5 disabled:opacity-40`}>{b.tried ? t('boardTried') : t('boardGo')}</button>
                          </div>
                          {historyOf === b.id && <div className="border-t border-white/10 px-2.5 py-2"><SlitherHistory id={b.id} attempts={b.attempts} clears={b.takeovers} /></div>}
                        </li>
                      ))}</ul>}
                  <p className="mt-2 text-[11px] leading-5 text-white/40">{t('beatRule')}</p>
                </div>
              )}
            </div>
          )}

          {puzzle && playing && (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className={KICKER}>{mode === 'practice' ? t('practiceKicker', { size: `${dots}×${dots}` }) : mode === 'challenge' ? t('newKicker') : t('beatKicker', { name: run?.holder ?? '' })}</p>
                  <p className="mt-1 flex items-center gap-3 font-mono text-xs text-white/60">
                    {limitMs !== null
                      ? <span className={`flex items-center gap-1 font-black ${limitMs - elapsed < 60_000 ? 'text-[#ff7b71]' : 'text-(--accent)'}`}><Timer size={13} />{formatClock(Math.max(0, limitMs - elapsed))}</span>
                      : <span className="flex items-center gap-1"><Clock3 size={13} />{formatClock(elapsed)}</span>}
                    <span className="flex items-center gap-1"><Lightbulb size={13} />{mode === 'practice' ? t('hintsUsed', { n: hints }) : t('hintsLeft', { n: Math.max(0, hintsLeft) })}</span>
                  </p>
                </div>
                {mode === 'practice' && <div className="flex gap-1">
                  {SLITHER_SIZES.map((s) => <button key={s} type="button" onClick={() => startPractice(s)} className={`px-2.5 py-1.5 ${seg(size === s)}`}>{s}×{s}</button>)}
                </div>}
              </div>

              {replaying && <ReplayHeader player={player} caption={t('replayCaption')} onClose={() => setReplaying(false)} />}

              {awayWarn !== null && <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-[#ff8f8f]/50 bg-black/85 px-4 py-2 text-xs font-black text-[#ffb3b3] shadow-2xl">
                {awayWarn >= AWAY_LIMIT ? t('awayVoid') : t('awayWarn', { n: awayWarn, max: AWAY_LIMIT })}
              </div>}
              <SlitherBoard
                puzzle={puzzle}
                marks={frame ? frame.marks : marks}
                locked={frame ? frame.locked : locked}
                tool={tool}
                readOnly={phase !== 'play' || replaying}
                onEdges={(changes) => apply(changes)}
                onHint={takeHint}
                flashArea={flashArea}
                dimLines={!replaying && (phase === 'reveal' || phase === 'gaveUp')}
                solutionUpTo={!replaying && (phase === 'reveal' || phase === 'gaveUp') ? order.slice(0, revealed) : null}
              />

              {replaying ? <ReplayControls player={player} onShowResult={() => setReplaying(false)} /> : phase === 'play' ? (
                <div className="mx-auto mt-3 max-w-[560px] space-y-2">
                  <div className="grid grid-cols-5 gap-1.5">
                    {tools.map(([id, Icon, label]) => (
                      <button key={id} type="button" onClick={() => setTool(id)} aria-pressed={tool === id} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === id)}`}><Icon size={17} />{label}</button>
                    ))}
                    <button type="button" onClick={undo} disabled={!undoCount} title={t('undoKey')} className={`flex flex-col items-center gap-1 py-2.5 ${seg(false)} disabled:opacity-35`}><Undo2 size={17} />{t('toolUndo')}</button>
                    <button type="button" onClick={clearAll} className={`flex flex-col items-center gap-1 py-2.5 ${confirmClear ? 'rounded-md bg-[#e5484d]/20 text-xs font-extrabold text-[#ff8f8f] ring-1 ring-[#e5484d]/50' : seg(false)}`}><Trash2 size={17} />{confirmClear ? t('clearConfirm') : t('toolClear')}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" disabled={hintsLeft <= 0} onClick={() => setTool(tool === 'hint' ? 'pen' : 'hint')} className={`py-2.5 ${tool === 'hint' ? BTN_ACCENT : BTN} disabled:opacity-40`}><Lightbulb size={14} />{tool === 'hint' ? t('hintPick') : t('hint')}</button>
                    <button type="button" onClick={giveUp} className={`py-2.5 ${BTN}`}><Flag size={14} />{t(mode === 'practice' ? 'giveUp' : 'giveUpChallenge')}</button>
                  </div>
                  <p className="text-center text-[11px] text-white/40">{tool === 'hint' ? t('hintHelp') : t(`help_${tool}`)}</p>
                </div>
              ) : (
                <div className="mx-auto mt-4 max-w-[440px] text-center">
                  {phase === 'solved' && mode === 'practice' && <>
                    <p className="flex items-center justify-center gap-2 text-2xl font-black"><Check size={24} className="text-[#7ee2ae]" />{t('solvedTitle', { time: formatClock(endMs) })}</p>
                    <p className="mt-1 text-xs text-white/50">{t('solvedDesc', { size: `${dots}×${dots}`, hints })}</p>
                  </>}
                  {phase === 'solved' && mode !== 'practice' && (!result ? <p className="flex items-center justify-center gap-2 text-sm text-white/60"><Loader2 size={14} className="animate-spin" />{t('saving')}</p> : <>
                    <p className="flex items-center justify-center gap-2 text-2xl font-black">{result.ok ? <Check size={24} className="text-[#7ee2ae]" /> : <X size={24} className="text-[#ff8f8f]" />}
                      {result.ok ? (mode === 'beat' ? t('beatWin') : t('solvedTitle', { time: time(result.ms) })) : result.flagged ? t('flaggedTitle') : t('tooSlow')}</p>
                    {result.ok && result.rank && <p className="mt-2 inline-block rounded-full bg-(--accent)/15 px-4 py-1.5 text-sm font-black text-(--accent)">{t('rankNow', { rank: result.rank, total: result.total ?? result.rank, n: result.maps ?? 1 })}</p>}
                    {result.ok && <p className="mt-3 flex items-center justify-center gap-1.5 text-base font-black text-[#ffcf3f]"><Crown size={17} />{t('ownerNow', { name: myName })}</p>}
                    {result.ok && result.rival && result.took_n ? (
                      <p className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-1.5 rounded-full bg-[#ff6b5a]/15 px-4 py-1.5 text-sm font-black text-[#ff9a8c]"><Swords size={15} />
                        {t('rivalTook', { name: result.rival, n: result.took_n })}{result.lost_n ? <span className="font-bold text-white/55">· {t('rivalLost', { name: result.rival, n: result.lost_n })}</span> : null}</p>
                    ) : null}
                    <p className="mt-2 break-keep text-xs text-white/50">{result.ok ? (mode === 'beat' ? t('beatWinDesc', { time: time(result.ms) }) : t('publishedDesc')) : result.flagged ? (result.flag === 'left_board' ? t('flaggedAway') : t('flaggedDesc')) : t('tooSlowDesc', { time: time(result.ms) })}</p>
                    {result.ok && run && (
                      <div className="mt-4 rounded-[14px] border border-(--accent)/30 bg-(--accent)/[.06] p-3">
                        <p className="text-xs font-black">{t('shareBoardTitle')}</p>
                        <div className="mt-2"><ShareButtons path={boardPath(locale, run.challenge)} text={t('shareBoardText', { name: myName, time: time(result.ms) })} /></div>
                      </div>
                    )}
                  </>)}
                  {phase === 'failed' && <>
                    <p className="text-lg font-black">{timeUp || (limitMs !== null && endMs >= limitMs) ? t('timeUp') : t('gaveUpBeat')}</p>
                    <p className="mt-1 break-keep text-xs text-white/50">{t('failedBeatDesc')}</p>
                  </>}
                  {phase === 'reveal' && <p className="text-sm font-bold text-white/60">{t('revealing')}</p>}
                  {phase === 'gaveUp' && <p className="text-lg font-black">{t('gaveUpTitle')}</p>}
                  {done && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setReplaying(true)} disabled={!steps.length} className={`py-3 ${BTN} disabled:opacity-40`}><History size={14} />{t('replay')}</button>
                      <button type="button" onClick={() => (mode === 'practice' ? startPractice(size) : mode === 'challenge' ? startRun('challenge') : switchMode('beat'))} className={`py-3 ${BTN_ACCENT}`}>
                        <SkipForward size={14} />{mode === 'practice' ? t('next') : mode === 'challenge' ? t('newAgain') : t('otherBoards')}
                      </button>
                    </div>
                  )}
                  {phase === 'solved' && (mode === 'practice' || result?.ok) && <CoffeeNudge className="mt-4" />}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {mode !== 'practice' && rankingPanel}
          {mode !== 'practice' && rivals.length > 0 && (
            <section className={PANEL}>
              <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('rivalsTitle')}</p><Swords size={14} className="text-[#ff9a8c]" /></div>
              <ol className="mt-3 space-y-1">{rivals.map((row) => (
                <li key={row.nickname + row.last_at} className="flex items-center gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-xs">
                  <span className="min-w-0 flex-1 truncate font-bold">{row.nickname}</span>
                  <span className="shrink-0 font-mono text-[11px]"><span className="text-[#7ee2ae]">{t('rivalTookShort', { n: row.took })}</span><span className="text-white/30"> · </span><span className="text-[#ff9a8c]">{t('rivalLostShort', { n: row.lost })}</span></span>
                </li>
              ))}</ol>
            </section>
          )}
          {mode === 'practice' && puzzle && (
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{t('board')}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[[t('statSize'), `${dots}×${dots}`], [t('statLines'), String(lines)], [t('statHints'), String(hints)]].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-black/30 p-2"><p className="text-[9px] font-black tracking-widest text-white/35">{label}</p><p className="mt-0.5 font-mono text-lg font-black">{value}</p></div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-white/45">{t('sizeHint')}</p>
            </section>
          )}
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(['quick1', 'quick2', 'quick3', 'quick4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
    </div>
  );
}
