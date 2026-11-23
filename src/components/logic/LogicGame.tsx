"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, Clock3, Crown, Eye, Flag, Loader2, PaintBucket, RotateCcw, Sparkles, Swords, Timer, Trash2, Trophy, Undo2, X } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/components/AuthProvider';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RankMove from '@/components/RankMove';
import Shards from '@/components/WallGoShards';
import { ResultBannerSlot } from '@/components/ads/HiddenLogAd';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { type LogicBoard, type LogicGameId, LOGIC, buildBoard, emptyMarks, formatClock, newSeed, solved, startSteps } from '@/lib/logicPuzzles';
import { type LogicBoardRow, type LogicFinish, type LogicRankRow, type LogicRun, type LogicStep, fetchLogicBoard, fetchLogicBoards, fetchLogicMe, fetchLogicRanking, finishMap, startBeatMap, startNewMap } from '@/lib/logicChallenge';
import { reportGame } from '@/lib/stats';
import MasyuBoard from './MasyuBoard';
import NonogramBoard, { type NonoTool } from './NonogramBoard';
import StarBoard from './StarBoard';
import BinairoBoard from './BinairoBoard';
import OneStrokeBoard from './OneStrokeBoard';
import ColorLinkBoard from './ColorLinkBoard';
import MagicSwapBoard from './MagicSwapBoard';
import MagicSwapTutorial from './MagicSwapTutorial';
import LogicRulesTip from './LogicRulesTip';
import LogicReplayButton from './LogicReplay';
import LogicHistory from './LogicHistory';
import ClearRate from '../ClearRate';
import { useUndoKey } from '@/components/slitherlink/SlitherBoard';

type Mode = 'challenge' | 'beat' | 'practice';
type Phase = 'lobby' | 'starting' | 'play' | 'solved' | 'gaveUp' | 'failed';
const MODES: Mode[] = ['challenge', 'beat', 'practice'];
const AWAY_MIN_MS = 2000;
const AWAY_LIMIT = 3;

const readMode = (): Mode => {
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'practice' || m === 'beat' ? m : 'challenge';
};

/** One move = the changes of one tap or drag, kept for undo. */
type Move = { gesture: number; undo: [number, number][] };

/**
 * 마슈 · 노노그램 · 스타배틀 · 마방진 스왑 …, the 슬리더링크 way.
 * - 새로운 맵: a fresh board from the server, timed; clearing it makes the board yours (ranked by boards owned).
 * - 맵 뺏기: someone's board within their time (one try per board); beat it to take it over.
 * - 연습: any size, give up to see the answer.
 */
export default function LogicGame({ game }: { game: LogicGameId }) {
  const spec = LOGIC[game];
  const t = useTranslations('Logic');
  const tc = useTranslations('Common');
  const name = tc(spec.catalog);
  const { user, ready, configured } = useAuth();
  const [mode, setMode] = useState<Mode>('challenge');
  const [size, setSize] = useState<number>(spec.sizes[1]);
  const [board, setBoard] = useState<LogicBoard | null>(null);
  const [historyOf, setHistoryOf] = useState<string | null>(null); // board whose owner history is open in the list
  const minSec = (ms: number) => { const s = Math.floor(ms / 1000); return t('minSec', { m: Math.floor(s / 60), s: s % 60 }); };
  const [marks, setMarks] = useState<number[]>([]);
  const [tool, setTool] = useState<NonoTool>('fill');
  const [phase, setPhase] = useState<Phase>('lobby');
  const [startedAt, setStartedAt] = useState(0);
  const [endMs, setEndMs] = useState(0);
  const [now, setNow] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [run, setRun] = useState<LogicRun | null>(null);
  const [result, setResult] = useState<LogicFinish | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<LogicRankRow[] | null>(null);
  const [me, setMe] = useState<{ rank: number; maps: number; total: number } | null>(null);
  const [boards, setBoards] = useState<LogicBoardRow[] | null>(null);
  const [focus, setFocus] = useState<LogicBoardRow | null>(null);
  const [listTick, setListTick] = useState(0);
  const [awayWarn, setAwayWarn] = useState<number | null>(null);
  const marksRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>('lobby');
  const runRef = useRef<LogicRun | null>(null);
  const startedRef = useRef(0);
  const stepsRef = useRef<LogicStep[]>([]);
  const movesRef = useRef<Move[]>([]);
  const awayRef = useRef<{ spans: [number, number][]; since: number | null }>({ spans: [], since: null });
  const timers = useRef<number[]>([]);
  const boardRef = useRef<LogicBoard | null>(null);

  const setPhaseNow = (p: Phase) => { phaseRef.current = p; setPhase(p); };
  const setWork = (next: number[]) => { marksRef.current = next; setMarks(next); };
  const clearTimers = () => { timers.current.forEach((id) => window.clearTimeout(id)); timers.current = []; };

  const begin = (b: LogicBoard) => {
    clearTimers();
    boardRef.current = b; setBoard(b);
    setWork(emptyMarks(b));
    stepsRef.current = startSteps(b); movesRef.current = []; setUndoCount(0);
    awayRef.current = { spans: [], since: null };
    setTool('fill'); setConfirmClear(false); setResult(null); setError(null);
    const at = Date.now(); startedRef.current = at; setStartedAt(at); setNow(at); setEndMs(0);
    setPhaseNow('play');
  };

  const startPractice = (s: number) => {
    setSize(s); runRef.current = null; setRun(null);
    begin(buildBoard(game, s, newSeed()));
  };

  /** Leaving a running challenge counts as giving up (the server keeps the time it started). */
  const abandon = () => {
    const r = runRef.current;
    if (r && phaseRef.current === 'play') finishMap(r.run, null);
    runRef.current = null; setRun(null);
  };

  const switchMode = (m: Mode) => {
    abandon(); clearTimers();
    setMode(m); setResult(null); setError(null); setFocus(null);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); url.searchParams.delete('board'); window.history.replaceState(null, '', url);
    if (m === 'practice') startPractice(spec.sizes[1]);
    else { boardRef.current = null; setBoard(null); setPhaseNow('lobby'); setListTick((n) => n + 1); }
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('board'); // before switchMode drops it from the URL
    switchMode(readMode()); // eslint-disable-line react-hooks/set-state-in-effect -- read once from the URL
    if (id && /^[0-9a-f]{10}$/.test(id)) fetchLogicBoard(game, id).then(({ data }) => setFocus(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, on mount
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  useEffect(() => () => clearTimers(), []);
  // Leaving the board (another tab or app) during a challenge is counted; 3 exits of 2 s+ before 20 minutes void a clear.
  useEffect(() => {
    const away = () => { if (runRef.current && phaseRef.current === 'play' && awayRef.current.since === null) awayRef.current.since = Date.now(); };
    const back = () => {
      const a = awayRef.current;
      if (a.since === null) return;
      if (runRef.current) {
        a.spans.push([a.since - startedRef.current, Date.now() - startedRef.current]);
        if (Date.now() - a.since >= AWAY_MIN_MS) {
          setAwayWarn(a.spans.filter(([f, to]) => to - f >= AWAY_MIN_MS).length);
          timers.current.push(window.setTimeout(() => setAwayWarn(null), 4000));
        }
      }
      a.since = null;
    };
    const onVis = () => (document.hidden ? away() : back());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', away);
    window.addEventListener('focus', back);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', away); window.removeEventListener('focus', back); };
  }, []);
  useEffect(() => {
    const onLeave = () => { const r = runRef.current; if (r && phaseRef.current === 'play') finishMap(r.run, null); };
    window.addEventListener('pagehide', onLeave);
    return () => window.removeEventListener('pagehide', onLeave);
  }, []);

  // Lobby lists: the ranking (boards owned), my place and the published boards.
  useEffect(() => {
    if (mode === 'practice') return;
    let alive = true;
    fetchLogicRanking(game, 10).then(({ data }) => { if (alive) setRanking(data ?? []); });
    if (mode === 'beat') fetchLogicBoards(game, 40).then(({ data }) => { if (alive) setBoards(data ?? []); });
    if (user) fetchLogicMe(game).then(({ data }) => { if (alive) setMe(data); });
    return () => { alive = false; };
  }, [mode, user, listTick, game]);

  const startRun = async (kind: 'challenge' | 'beat', id?: string) => {
    setPhaseNow('starting'); setError(null);
    const { data, error: err } = kind === 'challenge' ? await startNewMap(game) : await startBeatMap(id!);
    if (!data) {
      setPhaseNow('lobby');
      setError(err?.includes('tried') ? t('errTried') : err?.includes('sign_in') ? t('needSignIn') : err?.includes('pool_empty') ? t('errPool') : err?.includes('mine') ? t('errMine') : t('errStart'));
      setListTick((n) => n + 1);
      return;
    }
    runRef.current = data; setRun(data);
    if (kind === 'beat' && id) {
      setBoards((list) => list?.map((b) => (b.id === id ? { ...b, tried: true } : b)) ?? list);
      setFocus((f) => (f?.id === id ? { ...f, tried: true } : f));
      setRanking((list) => list?.map((row) => (row.board === id ? { ...row, tried: true } : row)) ?? list);
    }
    begin(buildBoard(game, data.size, data.seed));
  };

  const endRun = async (cleared: boolean) => {
    const r = runRef.current;
    if (!r) return;
    runRef.current = null;
    const { data } = await finishMap(r.run, cleared ? stepsRef.current : null, awayRef.current.spans);
    setResult(data ?? { ok: false, ms: Date.now() - startedRef.current, rank: null, total: null, maps: null });
    if (data) reportGame(`${game}-${r.run}`, game, 'solo', data.ok ? 'win' : 'loss', { kind: mode === 'beat' ? 'beat' : 'new', ms: data.ms });
    setListTick((n) => n + 1);
  };

  const apply = (changes: [number, number][], gesture: number, undoing = false) => {
    const b = boardRef.current;
    if (!b || phaseRef.current !== 'play') return;
    const prev = marksRef.current;
    const real = changes.filter(([i, v]) => prev[i] !== v);
    if (!real.length) return;
    const next = [...prev];
    const at = Date.now() - startedRef.current;
    for (const [i, v] of real) { next[i] = v; stepsRef.current.push([i, v, at]); }
    if (!undoing) {
      const last = movesRef.current[movesRef.current.length - 1];
      const inverse = real.map(([i]) => [i, prev[i]] as [number, number]);
      // A drag sends several batches: they form one move, keeping each cell's value from before the drag.
      if (last && last.gesture === gesture) { for (const [i, v] of inverse) if (!last.undo.some(([j]) => j === i)) last.undo.push([i, v]); }
      else movesRef.current.push({ gesture, undo: inverse });
      setUndoCount(movesRef.current.length);
    }
    setWork(next);
    if (solved(b, next)) {
      setEndMs(Date.now() - startedRef.current);
      setPhaseNow('solved');
      if (mode !== 'practice') endRun(true);
    }
  };

  const undo = () => {
    if (phaseRef.current !== 'play') return;
    const move = movesRef.current.pop();
    setUndoCount(movesRef.current.length);
    if (move) apply(move.undo, -1, true);
  };
  useUndoKey(undo);

  const clearAll = () => {
    if (!confirmClear) { setConfirmClear(true); timers.current.push(window.setTimeout(() => setConfirmClear(false), 2500)); return; }
    setConfirmClear(false);
    // Back to a fresh board (비나이로 keeps its starting stones).
    const base = boardRef.current ? emptyMarks(boardRef.current) : [];
    apply(marksRef.current.map((m, i) => [i, base[i] ?? 0] as [number, number]).filter(([i, v]) => marksRef.current[i] !== v), -2);
  };

  const giveUp = () => {
    if (!boardRef.current || phaseRef.current !== 'play') return;
    setEndMs(Date.now() - startedRef.current);
    if (mode !== 'practice') endRun(false);
    setPhaseNow(mode === 'beat' ? 'failed' : 'gaveUp');
  };

  // 맵 뺏기: the holder's time runs out.
  const limitMs = mode === 'beat' ? run?.limit_ms ?? null : null;
  const elapsed = phase === 'play' ? Math.max(0, now - startedAt) : endMs;
  const timeUp = phase === 'play' && limitMs !== null && elapsed >= limitMs;
  useEffect(() => {
    if (!timeUp) return;
    setEndMs(limitMs ?? 0); setPhaseNow('failed'); endRun(false); // eslint-disable-line react-hooks/set-state-in-effect -- the clock ran out
  }, [timeUp]); // eslint-disable-line react-hooks/exhaustive-deps

  const signedIn = !!user;
  const playing = phase !== 'lobby' && phase !== 'starting';
  const done = phase === 'solved' || phase === 'gaveUp' || phase === 'failed';
  const answerLines = useMemo(() => (board?.kind === 'masyu' && phase === 'gaveUp' ? board.answer.flatMap((v, e) => (v ? [e] : [])) : null), [board, phase]);

  const boardView = board && (board.kind === 'masyu'
    ? <MasyuBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solutionLines={answerLines} dimLines={phase === 'gaveUp'} />
    : board.kind === 'nonogram'
      ? <NonogramBoard board={board} marks={marks} tool={tool} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solvedGlow={phase === 'solved'} showAnswer={phase === 'gaveUp'} />
      : board.kind === 'starbattle'
        ? <StarBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solved={phase === 'solved'} showAnswer={phase === 'gaveUp'} />
        : board.kind === 'binairo'
          ? <BinairoBoard board={board} marks={phase === 'gaveUp' ? board.answer : marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solved={phase === 'solved' || phase === 'gaveUp'} />
          : board.kind === 'onestroke'
            ? <OneStrokeBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solved={phase === 'solved'} showAnswer={phase === 'gaveUp'} />
            : board.kind === 'magicswap'
              ? <MagicSwapBoard board={board} marks={marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solved={phase === 'solved'} showAnswer={phase === 'gaveUp'} />
              : <ColorLinkBoard board={board} marks={phase === 'gaveUp' ? board.answer : marks} onMarks={(c, g) => apply(c, g)} readOnly={phase !== 'play'} solved={phase === 'solved' || phase === 'gaveUp'} />);

  const rankingPanel = (
    <section className={PANEL}>
      <div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{t('rankingTitle')}</p><Trophy size={14} className="text-(--accent)" /></div>
      {ranking === null ? <p className="flex items-center gap-2 text-xs text-white/40"><Loader2 size={12} className="animate-spin" />{t('loading')}</p>
        : !ranking.length ? <p className="text-xs leading-5 text-white/45">{t('rankingEmpty')}</p>
        : <ol className="space-y-1.5">
          {ranking.map((row) => (
            <li key={`${row.rank}-${row.nickname}`} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${row.is_me ? 'bg-(--accent)/15 ring-1 ring-(--accent)/40' : 'bg-white/[0.03]'}`}>
              <span className={`w-5 text-center font-mono font-black ${row.rank <= 3 ? 'text-(--accent)' : 'text-white/40'}`}>{row.rank}</span>
              {row.rank === 1 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}
              <span className="min-w-0 flex-1 truncate font-bold">{row.nickname}</span>
              <RankMove rank={row.rank} prev={row.prev_rank} dark />
              <span className="shrink-0 font-mono font-black text-white/80">{t('mapsN', { n: row.maps })}</span>
              {!row.is_me && row.board && <button type="button" disabled={row.tried || !signedIn} onClick={() => { if (mode !== 'beat') switchMode('beat'); startRun('beat', row.board!); }} className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[10px] font-black text-white/80 hover:bg-(--accent) hover:text-(--accent-ink) disabled:opacity-30">{row.tried ? t('boardTried') : t('boardGo')}</button>}
            </li>
          ))}
        </ol>}
      {me && <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/60">{t('myPlace', { rank: me.rank, maps: me.maps, total: me.total })}</p>}
    </section>
  );

  return (
    <div className={SHELL} style={{ ...accentVars(spec.accent, spec.ink), backgroundImage: fog(spec.fog) }}>
      <Shards tint={spec.shard} />
      {game === 'magicswap' && <MagicSwapTutorial />}
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={name} subtitle={spec.latin}>
        <BugReport /><LanguageSwitcher compact dark />
        {mode === 'practice' && <button type="button" onClick={() => startPractice(size)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newBoard')}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {MODES.map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)} aria-pressed={mode === m} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}>
                {m === 'challenge' ? <Sparkles size={14} /> : m === 'beat' ? <Swords size={14} /> : <RotateCcw size={14} />}{t(`mode_${m}`)}
              </button>
            ))}
          </div>

          {!playing ? (
            <div className="mx-auto max-w-[560px] py-4">
              {mode === 'challenge' ? (
                <div className="rounded-[18px] border border-white/10 bg-gradient-to-br from-(--accent)/15 via-white/[0.02] to-transparent p-6 text-center">
                  <p className={KICKER}>NEW MAP · {spec.challengeSize}×{spec.challengeSize}</p>
                  <h2 className="mt-2 text-2xl font-black">{t('newTitle')}</h2>
                  <p className="mt-2 break-keep text-sm leading-6 text-white/60">{t('newDesc', { game: name })}</p>
                  <p className="mt-2 break-keep text-[11px] leading-5 text-white/40">{t('fairNote')}</p>
                  <div className="mt-4"><LogicReplayButton game={game} /></div>
                  {!ready ? null : !signedIn && configured ? (
                    <div className="mt-5 flex flex-col items-center gap-2"><p className="text-xs font-bold text-white/60">{t('needSignIn')}</p><AuthButton source={`${game}_challenge`} /></div>
                  ) : (
                    <button type="button" disabled={phase === 'starting'} onClick={() => startRun('challenge')} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm`}>
                      {phase === 'starting' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}{t('newStart')}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {focus && (
                    <div className="mb-4 rounded-[18px] border border-(--accent)/40 bg-(--accent)/10 p-5">
                      <p className={KICKER}>MAP #{focus.id.slice(0, 4)}</p>
                      <p className="mt-1 text-lg font-black">{t('focusTitle', { name: focus.holder })}</p>
                      <p className="mt-1 text-sm font-bold text-white/75">{t('limitLine', { time: minSec(focus.holder_ms) })}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/45"><ClearRate ns="Logic" attempts={focus.attempts} clears={focus.takeovers} full />{t('boardMeta', { n: focus.attempts, k: focus.takeovers })}</p>
                      <div className="mt-3"><p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-white/40">{t('historyTitle')}</p><LogicHistory id={focus.id} attempts={focus.attempts} clears={focus.takeovers} /></div>
                      <button type="button" disabled={focus.tried || focus.mine || !signedIn || phase === 'starting'} onClick={() => startRun('beat', focus.id)} className={`${BTN_ACCENT} mt-4 w-full py-3.5 text-sm disabled:opacity-40`}>
                        <Swords size={15} />{focus.mine ? t('boardMine') : focus.tried ? t('boardTried') : t('beatStart', { time: formatClock(focus.holder_ms) })}
                      </button>
                    </div>
                  )}
                  <div className="mb-3"><LogicReplayButton game={game} /></div>
                  <p className="mb-2 break-keep text-xs leading-5 text-white/50">{t('beatDesc')}</p>
                  {!signedIn && configured && ready && <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-xs font-bold text-white/60">{t('needSignIn')}</p><AuthButton source={`${game}_beat`} /></div>}
                  {boards === null ? <p className="flex items-center gap-2 py-6 text-xs text-white/40"><Loader2 size={12} className="animate-spin" />{t('loading')}</p>
                    : !boards.length ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/45">{t('boardsEmpty')}</p>
                    : <ul className="space-y-1.5">
                      {boards.map((b) => (
                        <li key={b.id} className="rounded-xl border border-white/10 bg-white/[0.03]">
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <button type="button" onClick={() => setHistoryOf((cur) => (cur === b.id ? null : b.id))} aria-expanded={historyOf === b.id} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--accent)/15 font-mono text-[10px] font-black text-(--accent)">{b.id.slice(0, 3)}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-black">{t('holderMap', { name: b.holder })} · <span className="font-mono text-(--accent)">{minSec(b.holder_ms)}</span></span>
                                <span className="flex items-center gap-1 truncate text-[11px] text-white/45"><ClearRate ns="Logic" attempts={b.attempts} clears={b.takeovers} className="mr-0.5" /><span className="truncate">{t('boardMeta', { n: b.attempts, k: b.takeovers })}</span><ChevronDown size={11} className={`shrink-0 transition ${historyOf === b.id ? 'rotate-180' : ''}`} /></span>
                              </span>
                            </button>
                            <button type="button" disabled={b.tried || b.mine || !signedIn || phase === 'starting'} onClick={() => startRun('beat', b.id)} className={`${BTN_ACCENT} shrink-0 !px-3 !py-1.5 disabled:opacity-40`}>{b.mine ? t('boardMine') : b.tried ? t('boardTried') : t('boardGo')}</button>
                          </div>
                          {historyOf === b.id && <div className="border-t border-white/10 px-2.5 py-2"><LogicHistory id={b.id} attempts={b.attempts} clears={b.takeovers} /></div>}
                        </li>
                      ))}
                    </ul>}
                </div>
              )}
              {error && <p className="mt-3 text-center text-xs font-bold text-[#ff9a9a]">{error}</p>}
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-end justify-between gap-3 px-1">
                <div>
                  <p className={KICKER}>{mode === 'practice' ? t('practiceKicker') : mode === 'beat' ? t('beatKicker', { name: run?.holder ?? '' }) : t('newKicker')} · {board?.size}×{board?.size}</p>
                  {mode === 'practice' && phase === 'play' && (
                    <div className="mt-2 flex gap-1.5">{spec.sizes.map((s) => <button key={s} type="button" onClick={() => startPractice(s)} className={`px-2.5 py-1 ${seg(size === s)}`}>{s}×{s}</button>)}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <LogicRulesTip game={game} running={mode !== 'practice' && phase === 'play'} />
                  <p className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-black ${limitMs !== null && phase === 'play' && limitMs - elapsed < 30000 ? 'animate-pulse bg-(--accent) text-(--accent-ink)' : 'bg-black/50 text-white/85 ring-1 ring-white/10'}`}>
                    {limitMs !== null ? <Timer size={14} /> : <Clock3 size={14} />}{formatClock(limitMs !== null && phase === 'play' ? Math.max(0, limitMs - elapsed) : elapsed)}
                  </p>
                </div>
              </div>
              {awayWarn !== null && <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-[#ff8f8f]/50 bg-black/85 px-4 py-2 text-xs font-black text-[#ffb3b3] shadow-2xl">{awayWarn >= AWAY_LIMIT ? t('awayVoid') : t('awayWarn', { n: awayWarn, max: AWAY_LIMIT })}</div>}

              <div className={phase === 'solved' ? 'animate-[logic-pop_.6s_ease]' : ''}>{boardView}</div>

              {phase === 'play' ? (
                <div className="mx-auto mt-3 max-w-[560px] space-y-2">
                  <div className={`grid gap-1.5 ${game === 'nonogram' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    {game === 'nonogram' && <>
                      <button type="button" onClick={() => setTool('fill')} aria-pressed={tool === 'fill'} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === 'fill')}`}><PaintBucket size={17} />{t('toolFill')}</button>
                      <button type="button" onClick={() => setTool('cross')} aria-pressed={tool === 'cross'} className={`flex flex-col items-center gap-1 py-2.5 ${seg(tool === 'cross')}`}><X size={17} />{t('toolCross')}</button>
                    </>}
                    <button type="button" onClick={undo} disabled={!undoCount} title={t('undoKey')} className={`flex flex-col items-center gap-1 py-2.5 ${seg(false)} disabled:opacity-35`}><Undo2 size={17} />{t('toolUndo')}</button>
                    <button type="button" onClick={clearAll} className={`flex flex-col items-center gap-1 py-2.5 ${confirmClear ? 'rounded-md bg-[#e5484d]/20 text-xs font-extrabold text-[#ff8f8f] ring-1 ring-[#e5484d]/50' : seg(false)}`}><Trash2 size={17} />{confirmClear ? t('clearConfirm') : t(game === 'magicswap' ? 'magicReset' : 'toolClear')}</button>
                  </div>
                  <button type="button" onClick={giveUp} className={`w-full py-2.5 ${BTN}`}><Flag size={14} />{mode === 'practice' ? t('giveUpPractice') : t('giveUpChallenge')}</button>
                  <p className="break-keep text-center text-[11px] leading-5 text-white/40">{t(`help_${game}${game === 'nonogram' ? `_${tool}` : ''}`)}</p>
                </div>
              ) : done && (
                <div className="mx-auto mt-4 max-w-[460px] text-center">
                  {mode === 'practice' ? (phase === 'solved' ? <>
                    <p className="flex items-center justify-center gap-2 text-2xl font-black"><Check size={24} className="text-[#7ee2ae]" />{t('solvedTitle', { time: formatClock(endMs) })}</p>
                    <p className="mt-1 text-xs text-white/50">{t('solvedDesc', { size: `${board?.size}×${board?.size}` })}</p>
                  </> : <p className="flex items-center justify-center gap-2 text-lg font-black text-white/80"><Eye size={18} />{t('answerShown')}</p>)
                    : !result ? <p className="flex items-center justify-center gap-2 text-sm text-white/60"><Loader2 size={15} className="animate-spin" />{t('checking')}</p>
                    : result.ok ? <>
                      <p className="flex items-center justify-center gap-2 text-2xl font-black"><Crown size={24} className="text-[#f2c14e]" />{mode === 'beat' ? t('tookTitle') : t('claimTitle')}</p>
                      <p className="mt-1 text-sm text-white/70">{t('clearLine', { time: formatClock(result.ms) })}{result.rival ? ` · ${t('tookFrom', { name: result.rival })}` : ''}</p>
                      {result.rank && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-(--accent)/15 px-3 py-1 text-xs font-black text-(--accent)"><Trophy size={12} />{t('rankLine', { rank: result.rank, total: result.total ?? 0, maps: result.maps ?? 0 })}</p>}
                    </> : <>
                      <p className="text-xl font-black text-white/85">{phase === 'failed' && mode === 'beat' ? t('beatFail') : t('failTitle')}</p>
                      <p className="mt-1 text-xs text-white/50">{result.flagged ? t(result.flag === 'away' ? 'flagAway' : 'flagFast') : phase === 'gaveUp' ? t('gaveUpDesc') : t('failDesc')}</p>
                    </>}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {mode === 'practice' ? <>
                      <button type="button" onClick={() => startPractice(size)} className={`py-3 ${BTN_ACCENT}`}><RotateCcw size={14} />{t('newBoard')}</button>
                      <button type="button" onClick={() => switchMode('challenge')} className={`py-3 ${BTN}`}><Sparkles size={14} />{t('mode_challenge')}</button>
                    </> : <>
                      <button type="button" onClick={() => startRun('challenge')} className={`py-3 ${BTN_ACCENT}`}><Sparkles size={14} />{t('newAgain')}</button>
                      <button type="button" onClick={() => switchMode('beat')} className={`py-3 ${BTN}`}><Swords size={14} />{t('mode_beat')}</button>
                    </>}
                  </div>
                  {phase === 'solved' && <div className="mt-4"><ResultBannerSlot won /></div>}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {mode !== 'practice' && rankingPanel}
          <section className={NOTE}>
            <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-white/65">{(t.raw(`rules_${game}`) as string[]).map((rule) => <li key={rule} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{rule}</span></li>)}</ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
