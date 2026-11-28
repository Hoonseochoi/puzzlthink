"use client";

// 명제 바둑 (Proposition Go), a PUZZLTHINK ORIGINAL. Three ways in:
//  - 오늘의 명제 (daily): the same three puzzles for everyone today, one ranked attempt, one clock for the run;
//    the server sends one puzzle at a time, keeps the answers, and sells a 피스 hint (+30 s).
//  - 연습 (practice): untimed, free hints, from a practice set the daily never uses.
//  - 튜토리얼: three tiny boards that teach placing, all-true and the lie.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, Check, ChevronRight, Crown, Flag, Flame, GraduationCap, Lightbulb, Loader2, RotateCcw, Share2, Timer, Trophy, Users, VenetianMask, Eye } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/components/AuthProvider';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Piece } from '@/components/CompetitionBoard';
import { BlackPiece } from '@/components/hell/BlackPiece';
import StoneAvatar from '@/components/StoneAvatar';
import PieceNews, { checkPieceNews } from '@/components/PieceNews';
import { SageToken } from '@/components/SageToken';
import { ResultBannerSlot } from '@/components/ads/HiddenLogAd';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { type Prop, type PublicPuzzle, type Tier, HINT_CAP, HINT_PENALTY_MS, STONE_HINT_PENALTY_MS, encodeCells, evalProp } from '@/lib/propositionGo';
import { type PgPodiumRow, type PgRankRow, type PgResult, type PgToday, type PgView, type PracticePuzzle, PG_FAST_MS, PG_TOP_PIECES, buyHint, buyStoneHint, clock, dayBefore, fetchPodium, fetchRanking, fetchToday, giveUp, loadPractice, msToNextDay, solveStage, startRun } from '@/lib/propositionGoClient';
import { walletChanged } from '@/lib/pieceWallet';
import { type LogicTraceRecorder, startLogicTrace } from '@/lib/logicTrace';
import { reportGame } from '@/lib/stats';
import PropPlayfield, { type Finish, type TraceInput } from './PropPlayfield';
import { OriginalMark, PG_ACCENT, PG_INK, PgDefs, PgStone } from './PropParts';

type Mode = 'daily' | 'practice' | 'tutorial';
const readMode = (): Mode => {
  if (typeof window === 'undefined') return 'daily';
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'practice' || m === 'tutorial' ? m : 'daily';
};
const TIER_KEY: Record<Tier, string> = { 1: 'tier1', 2: 'tier2', 3: 'tier3' };
const SOLVE_PAUSE_MS = 1100;

export default function PropositionGoGame() {
  const t = useTranslations('PropositionGo');
  // The game mounts only once the player starts it (GameGate), on the client: the URL can be read at once.
  const [mode, setModeState] = useState<Mode>(readMode);
  const [running, setRunning] = useState(false); // a daily run on the clock: the mode tabs step aside
  const setMode = (m: Mode) => {
    setModeState(m);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(window.history.state, '', url);
  };
  return (
    <div className={SHELL} style={{ ...accentVars(PG_ACCENT, PG_INK), backgroundImage: fog('155, 123, 255') }}>
      <PgDefs />
      <GameHeader backHref="/proposition-go" backLabel={t('title')} title={t('title')} subtitle={<OriginalMark size="xs" className="align-middle" />}>
        <GameUpdates game="proposition_go" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      <main className={MAIN}>
        <section className="min-w-0">
          {!running && <nav className="mb-2 flex gap-1 rounded-[12px] bg-black/40 p-1" aria-label={t('modes')}>
            {(['daily', 'practice', 'tutorial'] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} aria-current={mode === m}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-1.5 text-[12px] font-black transition ${mode === m ? 'bg-(--accent) text-(--accent-ink) shadow-[0_0_14px_var(--accent-glow)]' : 'text-white/55 hover:text-white'}`}>
                {m === 'daily' ? <CalendarDays size={13} /> : m === 'practice' ? <RotateCcw size={13} /> : <GraduationCap size={13} />}{t(`mode_${m}`)}
              </button>
            ))}
          </nav>}
          {mode === 'daily' ? <Daily onRunning={setRunning} onPractice={() => setMode('practice')} onTutorial={() => setMode('tutorial')} /> : mode === 'practice' ? <Practice /> : <Tutorial onDone={() => setMode('daily')} />}
        </section>
        <aside className="hidden flex-col gap-4 lg:flex">
          <div className={PANEL}><h2 className={PANEL_TITLE}>{t('rulesTitle')}</h2><Rules /></div>
          <div className={PANEL}><h2 className={PANEL_TITLE}>{t('rankingTitle')}</h2><Ranking compact /></div>
        </aside>
      </main>
    </div>
  );
}

function Rules() {
  const t = useTranslations('PropositionGo');
  return (
    <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px] leading-5 text-white/70">
      {(t.raw('rules') as string[]).map((r, i) => <li key={i} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" />{r}</li>)}
    </ul>
  );
}

// ─── The daily run ────────────────────────────────────────────────────────────────────────────────────────────────

function Daily({ onPractice, onTutorial, onRunning }: { onPractice: () => void; onTutorial: () => void; onRunning: (on: boolean) => void }) {
  const t = useTranslations('PropositionGo');
  const { user, ready, configured } = useAuth();
  const [today, setToday] = useState<PgToday | null>(null);
  const [view, setView] = useState<PgView | null>(null);
  const [result, setResult] = useState<PgResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finish, setFinish] = useState<Finish>(null);
  const [now, setNow] = useState(() => Date.now());
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [rankTick, setRankTick] = useState(0);
  const [origin, setOrigin] = useState(0); // local ms when the run's clock read 0
  const expiring = useRef(false);
  const recorder = useRef<LogicTraceRecorder | null>(null);
  const stageKey = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetchToday().then(({ data }) => { if (!alive || !data) return; setToday(data); if (data.status === 'done' && data.result) setResult(data.result); });
    return () => { alive = false; };
  }, [ready, user?.id]);

  const take = useCallback((v: PgView | PgResult | null) => {
    if (!v) return;
    if (v.done) { recorder.current?.stop(); recorder.current = null; setView(null); setResult(v); setRankTick((x) => x + 1); window.dispatchEvent(new Event(RANKED_EVENT)); checkPieceNews(); walletChanged(); return; }
    setOrigin(Date.now() - v.elapsed);
    const key = `${v.run}-${v.stage}`;
    if (stageKey.current !== key) {
      stageKey.current = key;
      recorder.current?.stop();
      recorder.current = startLogicTrace({ kind: 'proposition_go' }, Date.now());
      setFinish(null);
    }
    setView(v);
  }, []);

  // The run's clock; past the limit the server ends the run (asking for it again returns the result).
  const limit = view?.limit ?? 0;
  const running = !!view;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - origin > limit + 1500 && !expiring.current) {
        expiring.current = true;
        startRun().then(({ data }) => take(data)).finally(() => { expiring.current = false; });
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, origin, limit, take]);
  const elapsed = view ? now - origin : 0;
  useEffect(() => () => recorder.current?.stop(), []);

  const start = async () => {
    setBusy(true); setError(null);
    const { data, error: e } = await startRun();
    setBusy(false);
    if (e || !data) { setError(e?.includes('no_pool') ? t('noPool') : t('netError')); return; }
    take(data);
  };

  const onSolved = useCallback((cells: number[]) => {
    const v = view;
    if (!v) return;
    const lie = v.puzzle.tier === 3 ? v.puzzle.props.findIndex((p) => !evalProp(p, cells)) : -1;
    setFinish(lie >= 0 ? { kind: 'lie', lie } : { kind: 'solved' });
    const trace = recorder.current?.finish(true, []) ?? null;
    recorder.current = null;
    const send = solveStage(v.run, v.stage, encodeCells(cells), trace);
    window.setTimeout(async () => {
      const { data, error: e } = await send;
      if (e || !data) { setError(t('netError')); setFinish(null); return; }
      if (!data.done && data.wrong) { setError(t('wrongServer')); setFinish(null); return; }
      take(data);
    }, SOLVE_PAUSE_MS + (lie >= 0 ? 500 : 0));
  }, [view, take, t]);

  useEffect(() => { onRunning(!!view); }, [view, onRunning]);

  const trace: TraceInput = useCallback((c, g, k) => recorder.current?.input(c, g, k), []);
  const hint = async () => {
    if (!view || busy) return;
    setBusy(true); setError(null);
    const { data } = await buyHint(view.run);
    setBusy(false);
    if (data && !data.done && data.error) setError(data.error === 'cap' ? t('hintCapped') : t('noPieces'));
    take(data);
  };
  const boardNow = useRef<number[]>([]);
  const stoneHint = async () => {
    if (!view || busy) return;
    setBusy(true); setError(null);
    const { data } = await buyStoneHint(view.run, boardNow.current.map((c) => (c < 0 ? '-' : c.toString(16))).join(''));
    setBusy(false);
    if (data && !data.done && data.error) setError(data.error === 'cap' ? t('hintCapped') : data.error === 'nothing_left' ? t('stoneHintNone') : t('noBlackPieces'));
    take(data);
  };
  const quit = async () => {
    if (!view) return;
    setConfirmQuit(false); setBusy(true);
    const { data } = await giveUp(view.run);
    setBusy(false);
    take(data);
  };

  if (!ready || (user && !today && !result)) return <div className={`${STAGE} flex h-[420px] items-center justify-center`}><Loader2 className="animate-spin text-(--accent)" /></div>;

  if (result) return <DailyResult result={result} today={today} onPractice={onPractice} rankTick={rankTick} />;

  if (view) {
    const tier = view.puzzle.tier;
    const left = Math.max(0, view.limit - elapsed);
    const hinted = view.hints[view.stage] > 0;
    return (
      <div className={`${STAGE} flex flex-col gap-2.5`}>
        <RunBar stage={view.stage} splits={view.splits} hints={view.hints.map((h, i) => h + (view.stoneHints?.[i] ?? 0))} elapsed={elapsed} left={left} />
        <PropPlayfield key={`${view.run}-${view.stage}`} puzzle={view.puzzle} hint={view.hint} finish={finish} locked={!!finish || busy} onSolved={onSolved} trace={trace} givens={view.givens} cellsRef={boardNow} />
        <HintBar left={view.hintsLeft ?? 0} propUsed={hinted} busy={busy || !!finish} pieces={view.pieces ?? 0} tokens={view.tokens ?? 0} black={view.blackPieces ?? 0} onProp={hint} onStone={stoneHint}
          extra={<button type="button" onClick={() => setConfirmQuit(true)} disabled={busy || !!finish} className="flex items-center gap-1 text-[11px] font-bold text-white/45 hover:text-white disabled:opacity-40"><Flag size={12} />{t('giveUp')}</button>} />
        {error && <p className="text-center text-[12px] font-bold text-[#ff9aa5]">{error}</p>}
        <p className="text-center text-[10.5px] font-bold text-white/35">{t(`${TIER_KEY[tier]}Sub`)}</p>
        {confirmQuit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6" onClick={() => setConfirmQuit(false)}>
            <div className="w-full max-w-xs rounded-[16px] border border-white/10 bg-[#16141f] p-5 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-[15px] font-black">{t('giveUpTitle')}</p>
              <p className="mt-1.5 text-[12px] leading-5 text-white/60">{t('giveUpDesc')}</p>
              <div className="mt-4 flex gap-2"><button type="button" className={`${BTN} flex-1`} onClick={() => setConfirmQuit(false)}>{t('keepGoing')}</button><button type="button" className="flex-1 rounded-md bg-[#ff4d5e] py-2 text-xs font-black text-white" onClick={quit}>{t('giveUp')}</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Before the run: today's card.
  const signedIn = !!user;
  return (
    <div className={`${STAGE} flex flex-col gap-3`}>
      <PieceNews only={['prop_fast', 'prop_top']} onGame />
      <TodayCard today={today} />
      {today?.day && <PropPodium day={today.day} />}
      {signedIn ? (
        <button type="button" onClick={start} disabled={busy || today?.ready === false}
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-[14px] bg-(--accent) text-[16px] font-black text-(--accent-ink) shadow-[0_0_26px_var(--accent-glow)] transition active:scale-[.98] disabled:opacity-50">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Timer size={18} />}{today?.status === 'running' ? t('resume') : t('startDaily')}
        </button>
      ) : configured ? (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border border-(--accent)/40 bg-(--accent)/[0.08] p-4 text-center">
          <p className="text-[13px] font-black">{t('signInTitle')}</p>
          <p className="text-[11.5px] leading-5 text-white/60">{t('signInDesc')}</p>
          <AuthButton full source="other" />
        </div>
      ) : <p className="text-center text-[12px] text-white/50">{t('offline')}</p>}
      {today?.status === 'running' && <p className="-mt-1 text-center text-[11px] font-bold text-[#ffb3ba]">{t('clockRunning')}</p>}
      {error && <p className="text-center text-[12px] font-bold text-[#ff9aa5]">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setShowRanking(true)} className={`${BTN} col-span-2 min-h-[42px] lg:hidden`}><Trophy size={14} />{t('seeRanking')}</button>
        <button type="button" onClick={onTutorial} className={`${BTN} min-h-[42px]`}><GraduationCap size={14} />{t('mode_tutorial')}</button>
        <button type="button" onClick={onPractice} className={`${BTN} min-h-[42px]`}><RotateCcw size={14} />{t('practiceFree')}</button>
      </div>
      <div className="lg:hidden"><h2 className={`${PANEL_TITLE} mb-1`}>{t('rulesTitle')}</h2><Rules /></div>
      {showRanking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:p-6" onClick={() => setShowRanking(false)}>
          <div role="dialog" aria-label={t('rankingTitle')} className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-t-[18px] border border-white/10 bg-[#16141f] p-4 sm:rounded-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className={`${PANEL_TITLE} flex items-center gap-1.5`}><Trophy size={11} />{t('rankingTitle')} · {t('playersToday', { n: today?.players ?? 0 })}</h2>
              <button type="button" onClick={() => setShowRanking(false)} className="text-[12px] font-black text-white/55 hover:text-white">{t('close')}</button>
            </div>
            <Ranking />
          </div>
        </div>
      )}
    </div>
  );
}

function TodayCard({ today }: { today: PgToday | null }) {
  const t = useTranslations('PropositionGo');
  const locale = useLocale();
  const day = today?.day ? new Date(`${today.day}T00:00:00+09:00`) : null;
  const dayLabel = day ? day.toLocaleDateString(locale === 'en' ? 'en-US' : 'ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' }) : '';
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(120%_100%_at_0%_0%,#4a2ca8_0%,#1a0f3a_60%,#0f0a22_100%)] p-4 ring-1 ring-[#c9b6ff]/25">
      <span className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#9b7bff]/25" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <OriginalMark size="sm" />
          <p className="mt-2 text-[11px] font-black tracking-[0.12em] text-[#c9b6ff]">{t('todayKicker')} · {dayLabel}</p>
          <h2 className="mt-0.5 break-keep text-[22px] font-black leading-[1.15] tracking-[-0.04em]">{t('todayTitle')}</h2>
          <p className="mt-1 break-keep text-[12px] font-bold leading-[17px] text-white/65">{t('todayDesc')}</p>
        </div>
        <div className="pg-float flex shrink-0 -space-x-2 pt-1">{[0, 1, 2].map((c) => <PgStone key={c} colour={c} size={30} mood={c === 1 ? 'happy' : 'idle'} blinkDelay={c} />)}</div>
      </div>
      <div className="relative mt-3 grid grid-cols-3 gap-1.5">
        {([1, 2, 3] as Tier[]).map((tier) => (
          <div key={tier} className="rounded-[10px] bg-black/30 px-2 py-1.5 text-center">
            <p className="text-[10px] font-black text-white/45">{tier}/3</p>
            <p className={`flex items-center justify-center gap-1 text-[12.5px] font-black ${tier === 3 ? 'text-[#ff9aa5]' : 'text-white'}`}>{tier === 3 && <VenetianMask size={12} />}{t(TIER_KEY[tier])}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-bold text-white/70">
        <span className="flex items-center gap-1"><Users size={12} />{t('playersToday', { n: today?.players ?? 0 })}</span>
        {today?.top && <span className="flex min-w-0 items-center gap-1"><Crown size={12} className="text-[#ffd36e]" /><span className="max-w-[110px] truncate">{today.top.nickname}</span> {clock(today.top.total, true)}</span>}
        {!!today?.streak && <span className="flex items-center gap-1 text-[#ffb37a]"><Flame size={12} />{t('streakN', { n: today.streak })}</span>}
      </div>
    </div>
  );
}

/**
 * The two hints. 피스: one more true proposition (once per puzzle, +30 s). 블랙피스: one stone shown on its point and
 * locked (+40 s). Both together at most 3 per run (the server checks it too). Practice: both free, no cap.
 */
function HintBar({ left, propUsed, busy, pieces, tokens = 0, black, onProp, onStone, extra, free = false }: {
  left: number | null; propUsed: boolean; busy: boolean; pieces?: number; tokens?: number; black?: number; onProp: () => void; onStone: () => void; extra?: React.ReactNode; free?: boolean;
}) {
  const t = useTranslations('PropositionGo');
  const out = left !== null && left <= 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-black text-white/60">{left === null ? t('hintsFree') : t('hintsLeft', { n: Math.max(0, left), max: HINT_CAP })}</span>
        {extra}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={onProp} disabled={busy || propUsed || out || (!free && (pieces ?? 0) < 1)}
          className="flex min-h-[48px] items-center gap-2 rounded-[12px] border border-[#ffd36e]/40 bg-[#ffd36e]/10 px-2.5 text-left text-[#ffe7a8] transition active:scale-[.98] disabled:opacity-40">
          <Lightbulb size={17} className="shrink-0" />
          <span className="min-w-0 flex-1 leading-[15px]"><b className="block text-[12px] font-black">{propUsed ? t('hintUsed') : t('hintProp')}</b>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#ffe7a8]/65">{free ? t('free') : tokens > 0 ? <><SageToken size={11} />{t('costToken', { s: HINT_PENALTY_MS / 1000, n: tokens })}</> : <><Piece size={9} />{t('costPiece', { s: HINT_PENALTY_MS / 1000, n: pieces ?? 0 })}</>}</span></span>
        </button>
        <button type="button" onClick={onStone} disabled={busy || out || (!free && (black ?? 0) < 1)}
          className="flex min-h-[48px] items-center gap-2 rounded-[12px] border border-[#ff5c77]/45 bg-[linear-gradient(135deg,rgba(255,51,85,.16),rgba(7,6,10,.6))] px-2.5 text-left text-[#ffc2cc] transition active:scale-[.98] disabled:opacity-40">
          <span className="shrink-0"><BlackPiece size={15} glow={false} /></span>
          <span className="min-w-0 flex-1 leading-[15px]"><b className="block text-[12px] font-black">{t('hintStone')}</b>
            <span className="block text-[10px] font-bold text-[#ffc2cc]/65">{free ? t('free') : t('costBlack', { s: STONE_HINT_PENALTY_MS / 1000, n: black ?? 0 })}</span></span>
        </button>
      </div>
    </div>
  );
}

function RunBar({ stage, splits, hints, elapsed, left }: { stage: number; splits: number[]; hints: number[]; elapsed: number; left: number }) {
  const t = useTranslations('PropositionGo');
  const urgent = left < 60_000;
  return (
    <div className="flex items-center gap-2">
      <ol className="flex min-w-0 flex-1 gap-1">
        {([1, 2, 3] as Tier[]).map((tier, i) => {
          const done = i < stage, on = i === stage;
          return (
            <li key={tier} className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-[9px] px-1 text-[11px] font-black transition ${done ? 'bg-[#3fd67a]/20 text-[#8ff0b4]' : on ? (tier === 3 ? 'bg-[#ff4d5e]/20 text-[#ffb3ba] ring-1 ring-[#ff4d5e]/50' : 'bg-(--accent)/25 text-white ring-1 ring-(--accent)/60') : 'bg-white/[0.05] text-white/35'}`}>
              {done ? <Check size={12} strokeWidth={3} /> : tier === 3 ? <VenetianMask size={12} /> : <span>{tier}</span>}
              <span className="truncate">{done ? clock(splits[i] - (splits[i - 1] ?? 0)) : t(TIER_KEY[tier])}</span>
              {hints[i] > 0 && <Lightbulb size={10} className="shrink-0 text-[#ffd36e]" />}
            </li>
          );
        })}
      </ol>
      <span className={`flex h-8 min-w-[74px] items-center justify-center gap-1 rounded-[9px] font-mono text-[15px] font-black ${urgent ? 'bg-[#ff4d5e] text-white' : 'bg-black/50 text-white ring-1 ring-white/10'}`} aria-label={t('elapsed')}>
        <Timer size={13} />{clock(elapsed)}
      </span>
    </div>
  );
}

function DailyResult({ result, today, onPractice, rankTick }: { result: PgResult; today: PgToday | null; onPractice: () => void; rankTick: number }) {
  const t = useTranslations('PropositionGo');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(() => msToNextDay());
  useEffect(() => { const id = window.setInterval(() => setLeft(msToNextDay()), 1000); return () => window.clearInterval(id); }, []);
  const clear = result.result === 'clear';
  const day = result.day.slice(5).replace('-', '/');
  const tiles = ([1, 2, 3] as Tier[]).map((tier, i) => ({ tier, solved: i < result.solved, ms: i < result.solved ? result.splits[i] - (result.splits[i - 1] ?? 0) : null, hint: result.hints[i] > 0, stone: (result.stoneHints?.[i] ?? 0) }));
  const shareText = useMemo(() => {
    const marks = tiles.map((x) => (x.solved ? (x.stone ? '🖤' : x.hint ? '💡' : x.tier === 3 ? '🎭' : '🟣') : '⬛')).join('');
    const lines = [
      `${t('shareHead', { day })} ${marks}`,
      clear ? `⏱ ${clock(result.total ?? 0, true)}${result.rank ? ` · ${t('shareRank', { n: result.rank, total: result.players })}` : ''}` : t('shareFail', { n: result.solved }),
      result.streak > 1 ? `🔥 ${t('streakN', { n: result.streak })}` : '',
      `https://puzzlthink.com/${locale}/proposition-go`,
    ];
    return lines.filter(Boolean).join('\n');
  }, [tiles, clear, result, day, t, locale]);
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ text: shareText }); return; }
    } catch { /* cancelled: fall back to copying */ }
    try { await navigator.clipboard.writeText(shareText); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* no clipboard */ }
  };
  const hh = Math.floor(left / 3600_000), mm = Math.floor((left % 3600_000) / 60_000), ss = Math.floor((left % 60_000) / 1000);

  const fastMs = result.fastMs ?? PG_FAST_MS;
  return (
    <div className={`${STAGE} flex flex-col gap-3`}>
      <PieceNews only={['prop_fast', 'prop_top']} onGame />
      {/* the share card: no answers on it */}
      <div className="pg-rise relative overflow-hidden rounded-[20px] bg-[radial-gradient(120%_100%_at_100%_0%,#5b37c9_0%,#1a0f3a_55%,#0d0820_100%)] p-4 ring-1 ring-[#c9b6ff]/30">
        <span className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#3fd67a]/10" />
        <div className="relative flex items-center justify-between gap-2">
          <OriginalMark size="sm" />
          <span className="text-[11px] font-black text-white/60">{t('shareHead', { day })}</span>
        </div>
        <div className="relative mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black tracking-[0.12em] text-[#c9b6ff]">{clear ? t('resultClear') : result.result === 'timeout' ? t('resultTimeout') : t('resultGiveup')}</p>
            <p className="font-mono text-[40px] font-black leading-none tracking-[-0.03em]">{clear ? clock(result.total ?? 0, true) : `${result.solved}/3`}</p>
            {clear && result.penalty > 0 && <p className="mt-1 text-[11px] font-bold text-[#ffe7a8]/80">{t('penaltyLine', { raw: clock(result.ms ?? 0, true), s: result.penalty / 1000 })}</p>}
          </div>
          <div className="flex -space-x-2">{[0, 1, 2, 3, 4].map((c) => <PgStone key={c} colour={c} size={30} mood={clear ? 'proud' : c % 2 ? 'worried' : 'look'} className={clear ? 'pg-hop' : ''} />)}</div>
        </div>
        <div className="relative mt-3 grid grid-cols-3 gap-1.5">
          {tiles.map((x) => (
            <div key={x.tier} className={`rounded-[11px] px-2 py-2 text-center ${x.solved ? (x.tier === 3 ? 'bg-[#ff4d5e]/20' : 'bg-[#3fd67a]/15') : 'bg-white/[0.06]'}`}>
              <p className="flex items-center justify-center gap-1 text-[10.5px] font-black text-white/60">{x.tier === 3 && <VenetianMask size={11} />}{t(TIER_KEY[x.tier])}</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[15px] font-black">{x.ms !== null ? clock(x.ms) : '—'}{x.hint && <Lightbulb size={11} className="text-[#ffd36e]" />}{x.stone > 0 && <BlackPiece size={10} glow={false} />}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-black">
          {result.rank && <span className="flex items-center gap-1 text-[#ffd36e]"><Trophy size={13} />{t('rankLine', { n: result.rank, total: result.players })}</span>}
          {result.crown && <span className="flex items-center gap-1 text-[#ffd36e]"><Crown size={13} />{t('crownLine')}</span>}
          {result.streak > 0 && <span className="flex items-center gap-1 text-[#ffb37a]"><Flame size={13} />{t('streakN', { n: result.streak })}</span>}
          {result.flag && <span className="text-[11px] font-bold text-white/45">{t('flagged')}</span>}
        </div>
        {clear && !result.flag && (
          <p data-pg-reward className={`relative mt-2.5 flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11.5px] font-black ${result.reward ? 'bg-[#ffd36e]/15 text-[#ffe7a8]' : 'bg-white/[0.06] text-white/55'}`}>
            <Piece size={10} />{result.reward ? t('rewardEarned', { n: result.reward.amount }) : t('rewardMissed', { m: Math.round(fastMs / 60000) })}
          </p>
        )}
      </div>
      <PropPodium day={result.day} />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={share} className="flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] bg-(--accent) text-[14px] font-black text-(--accent-ink) shadow-[0_0_20px_var(--accent-glow)] active:scale-[.98]"><Share2 size={16} />{copied ? t('copied') : t('share')}</button>
        <button type="button" onClick={onPractice} className={`${BTN} min-h-[48px] text-[13px]`}><RotateCcw size={15} />{t('practiceMore')}</button>
      </div>
      <p className="text-center text-[11.5px] font-bold text-white/50">{t('nextSet', { t: `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}` })}</p>
      <div className="rounded-[14px] border border-white/10 bg-black/30 p-3 lg:hidden">
        <h2 className={`${PANEL_TITLE} mb-2 flex items-center gap-1.5`}><Trophy size={11} />{t('rankingTitle')} · {t('playersToday', { n: today?.players ?? result.players })}</h2>
        <Ranking tick={rankTick} />
      </div>
      <ResultBannerSlot won={clear} />
    </div>
  );
}

/**
 * 명제 바둑 podium: yesterday's final top three (who earned 피스 +5) and today's top three so far, 2nd · 1st · 3rd,
 * each player's stone, time and 💡 for hints.
 */
function PropPodium({ day }: { day: string }) {
  const t = useTranslations('PropositionGo');
  const [which, setWhich] = useState<'today' | 'yesterday'>('today');
  const [rows, setRows] = useState<Record<string, PgPodiumRow[]>>({});
  const own = useRanked();
  const target = which === 'today' ? day : dayBefore(day);
  useEffect(() => {
    let alive = true;
    fetchPodium(target).then(({ data }) => { if (alive) setRows((r) => ({ ...r, [target]: data ?? [] })); });
    return () => { alive = false; };
  }, [target, own]);
  const list = rows[target];
  const order = [2, 1, 3].map((p) => list?.find((r) => r.rank === p));
  return (
    <div data-pg-podium className="rounded-[16px] border border-[#c9b6ff]/20 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(155,123,255,.18),rgba(0,0,0,.25))] p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[12px] font-black text-[#e3d8ff]"><Trophy size={13} className="text-[#ffd36e]" />{t('podiumTitle')}</h3>
        <div className="flex gap-0.5 rounded-full bg-black/40 p-0.5">
          {(['today', 'yesterday'] as const).map((w) => (
            <button key={w} type="button" onClick={() => setWhich(w)} aria-pressed={which === w}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-black transition ${which === w ? 'bg-(--accent) text-(--accent-ink)' : 'text-white/55 hover:text-white'}`}>{w === 'today' ? t('podiumToday') : t('podiumYesterday')}</button>
          ))}
        </div>
      </div>
      {!list ? <div className="flex h-[132px] items-center justify-center"><Loader2 size={16} className="animate-spin text-white/40" /></div>
        : !list.length ? <p className="flex h-[132px] items-center justify-center text-center text-[12px] text-white/45">{which === 'today' ? t('podiumEmptyToday') : t('podiumEmptyYesterday')}</p>
        : (
          <div className="mt-2 grid grid-cols-3 items-end gap-2">
            {order.map((r, i) => {
              const place = [2, 1, 3][i];
              if (!r) return <div key={place} />;
              const block = place === 1 ? 'h-14 bg-gradient-to-b from-[#ffd45c] to-[#e8a33c]' : place === 2 ? 'h-10 bg-gradient-to-b from-[#e7e9ee] to-[#b9bec8]' : 'h-7 bg-gradient-to-b from-[#f0c39a] to-[#c98a55]';
              return (
                <div key={place} className="flex min-w-0 flex-col items-center text-center">
                  <span className={place === 1 ? 'drop-shadow-[0_0_12px_rgba(255,196,60,.6)]' : ''}><StoneAvatar name={r.nickname} size={place === 1 ? 50 : 40} /></span>
                  <span className="mt-1 w-full truncate px-0.5 text-[11.5px] font-black">{r.nickname}</span>
                  <span className="flex items-center gap-0.5 font-mono text-[11px] font-black text-white/75">{clock(r.total, true)}{r.hints > 0 && <span className="text-[10px]">{'💡'.repeat(Math.min(r.hints, 3))}</span>}</span>
                  <span className={`mt-1 flex w-full justify-center rounded-t-[10px] pt-0.5 font-black text-white/90 shadow-[inset_0_2px_0_rgba(255,255,255,.35)] ${block}`}>{place}</span>
                </div>
              );
            })}
          </div>
        )}
      <p className="mt-2 break-keep text-center text-[10.5px] font-bold text-white/45">{which === 'today' ? t('podiumRuleToday', { n: PG_TOP_PIECES }) : t('podiumRuleYesterday', { n: PG_TOP_PIECES })}</p>
    </div>
  );
}
const useRanked = () => {
  const [n, setN] = useState(0);
  useEffect(() => { const on = () => setN((x) => x + 1); window.addEventListener(RANKED_EVENT, on); return () => window.removeEventListener(RANKED_EVENT, on); }, []);
  return n;
};

/** Fired when a daily run ends, so the side panel's ranking picks up the new time. */
const RANKED_EVENT = 'puzzlthink:pg-ranked';
function Ranking({ compact = false, tick = 0 }: { compact?: boolean; tick?: number }) {
  const t = useTranslations('PropositionGo');
  const [rows, setRows] = useState<PgRankRow[] | null>(null);
  const [own, setOwn] = useState(0);
  useEffect(() => { const on = () => setOwn((x) => x + 1); window.addEventListener(RANKED_EVENT, on); return () => window.removeEventListener(RANKED_EVENT, on); }, []);
  useEffect(() => {
    let alive = true;
    fetchRanking(compact ? 10 : 20).then(({ data }) => { if (alive) setRows(data ?? []); });
    return () => { alive = false; };
  }, [compact, tick, own]);
  if (!rows) return <div className="flex h-16 items-center justify-center"><Loader2 size={16} className="animate-spin text-white/40" /></div>;
  if (!rows.length) return <p className="py-2 text-center text-[12px] text-white/45">{t('rankingEmpty')}</p>;
  return (
    <ol className="flex flex-col">
      {rows.map((r) => (
        <li key={`${r.rank}-${r.nickname}`} className={`flex items-center gap-2 rounded-[8px] px-1.5 py-1 text-[12.5px] ${r.is_me ? 'bg-(--accent)/15' : ''}`}>
          <span className={`w-5 text-center font-mono text-[11px] font-black ${r.rank <= 3 ? 'text-[#ffd36e]' : 'text-white/40'}`}>{r.rank}</span>
          <StoneAvatar name={r.nickname} size={20} />
          <span className="min-w-0 flex-1 truncate font-bold">{r.nickname}</span>
          {r.hints > 0 && <span className="flex items-center text-[10px] font-black text-[#ffd36e]"><Lightbulb size={10} />{r.hints}</span>}
          <span className="font-mono text-[12px] font-black text-white/80">{clock(r.total, true)}</span>
        </li>
      ))}
    </ol>
  );
}

// ─── Practice ─────────────────────────────────────────────────────────────────────────────────────────────────────

const SEEN_KEY = 'puzzlthink:pg-practice-seen';
function Practice() {
  const t = useTranslations('PropositionGo');
  const [tier, setTier] = useState<Tier>(1);
  const [set, setSet] = useState<Record<Tier, PracticePuzzle[]> | null>(null);
  const [idx, setIdx] = useState(0);
  const [finish, setFinish] = useState<Finish>(null);
  const [hintOn, setHintOn] = useState(false);
  const [givens, setGivens] = useState<[number, number][]>([]);
  const boardNow = useRef<number[]>([]);
  const [shown, setShown] = useState<number[] | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [solvedMs, setSolvedMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [failed, setFailed] = useState(false);

  const pick = useCallback((s: Record<Tier, PracticePuzzle[]>, tr: Tier) => {
    let seen: Record<string, number[]> = {};
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { /* private mode */ }
    const used = new Set(seen[tr] ?? []);
    const pool = s[tr].map((_, i) => i).filter((i) => !used.has(i));
    const list = pool.length ? pool : s[tr].map((_, i) => i);
    const i = list[Math.floor(Math.random() * list.length)];
    seen[tr] = pool.length ? [...used, i] : [i];
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* private mode */ }
    setIdx(i); setFinish(null); setHintOn(false); setGivens([]); setShown(null); setStartedAt(Date.now()); setSolvedMs(null);
  }, []);
  useEffect(() => { loadPractice().then((s) => { setSet(s); pick(s, 1); }).catch(() => setFailed(true)); }, [pick]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(id); }, []);

  const puzzle = set?.[tier]?.[idx] ?? null;
  const pub: PublicPuzzle | null = useMemo(() => (puzzle ? { tier: puzzle.tier, stones: puzzle.stones, props: puzzle.props } : null), [puzzle]);
  const onSolved = useCallback((cells: number[]) => {
    if (!pub) return;
    const lie = pub.tier === 3 ? pub.props.findIndex((p) => !evalProp(p, cells)) : -1;
    setFinish(lie >= 0 ? { kind: 'lie', lie } : { kind: 'solved' });
    setSolvedMs(Date.now() - startedAt);
    if (!shown) reportGame(`pg-practice-${tier}-${idx}-${startedAt}`, 'proposition_go', 'solo', 'win', { mode: 'practice', tier, hint: hintOn, stoneHints: givens.length }).catch(() => {});
  }, [pub, startedAt, shown, tier, idx, hintOn, givens.length]);
  // Practice 블랙피스 hint (free): a random stone that is not on its point yet.
  const stoneHint = () => {
    if (!puzzle) return;
    const now = boardNow.current;
    const left = puzzle.answer.flatMap((c, s) => (now[s] !== c && !givens.some(([g]) => g === s) ? [s] : []));
    if (!left.length) return;
    const s = left[Math.floor(Math.random() * left.length)];
    setGivens([...givens, [s, puzzle.answer[s]]]);
  };

  if (failed) return <div className={`${STAGE} p-6 text-center text-sm text-white/60`}>{t('netError')}</div>;
  if (!set || !puzzle || !pub) return <div className={`${STAGE} flex h-[420px] items-center justify-center`}><Loader2 className="animate-spin text-(--accent)" /></div>;
  return (
    <div className={`${STAGE} flex flex-col gap-2.5`}>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1">
          {([1, 2, 3] as Tier[]).map((tr) => (
            <button key={tr} type="button" onClick={() => { setTier(tr); pick(set, tr); }}
              className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-[9px] text-[11.5px] font-black transition ${tier === tr ? (tr === 3 ? 'bg-[#ff4d5e] text-white' : 'bg-(--accent) text-(--accent-ink)') : 'bg-white/[0.06] text-white/55'}`}>
              {tr === 3 && <VenetianMask size={12} />}{t(TIER_KEY[tr])}
            </button>
          ))}
        </div>
        <span className="flex h-8 min-w-[64px] items-center justify-center gap-1 rounded-[9px] bg-black/50 font-mono text-[14px] font-black text-white/80 ring-1 ring-white/10"><Timer size={12} />{clock(solvedMs ?? now - startedAt)}</span>
      </div>
      <PropPlayfield key={`${tier}-${idx}-${shown ? 'a' : 'p'}`} puzzle={pub} hint={hintOn ? puzzle.hint : null} finish={finish} locked={!!finish} onSolved={onSolved} initial={shown} answer={shown} givens={shown ? undefined : givens} cellsRef={boardNow} />
      {finish ? (
        <div className="pg-rise flex items-center gap-2 rounded-[14px] bg-[#3fd67a]/15 p-2 pl-3 ring-1 ring-[#3fd67a]/40">
          <p className="min-w-0 flex-1 text-[13px] font-black text-[#bff5cd]">{shown ? t('answerWas') : finish.kind === 'lie' ? t('practiceLie', { t: clock(solvedMs ?? 0) }) : t('practiceSolved', { t: clock(solvedMs ?? 0) })}</p>
          <button type="button" onClick={() => pick(set, tier)} className="flex min-h-[42px] items-center gap-1 rounded-[10px] bg-(--accent) px-3.5 text-[13px] font-black text-(--accent-ink)">{t('nextPuzzle')}<ChevronRight size={15} /></button>
        </div>
      ) : (
        <HintBar left={null} free propUsed={hintOn} busy={false} onProp={() => setHintOn(true)} onStone={stoneHint}
          extra={<button type="button" onClick={() => setShown(puzzle.answer)} className="flex items-center gap-1 text-[11px] font-bold text-white/45 hover:text-white"><Eye size={12} />{t('showAnswer')}</button>} />
      )}
      <p className="text-center text-[10.5px] font-bold text-white/35">{t(`${TIER_KEY[tier]}Sub`)}</p>
    </div>
  );
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** Three tiny boards: one card, all-true, and the lie (each with exactly one answer). */
export const TUTORIAL: { puzzle: PublicPuzzle; key: string }[] = [
  { key: 't1', puzzle: { tier: 1, stones: [0], props: [{ t: 'in', s: 0, r: 'corner' }, { t: 'in', s: 0, r: 'r0' }, { t: 'in', s: 0, r: 'c3' }] } },
  { key: 't2', puzzle: { tier: 1, stones: [0, 1, 2], props: [{ t: 'in', s: 0, r: 'corner' }, { t: 'in', s: 0, r: 'r0' }, { t: 'next', a: 0, b: 1, d: 'right' }, { t: 'next', a: 1, b: 2, d: 'down' }] } },
  { key: 't3', puzzle: { tier: 3, stones: [0, 1, 2], props: [{ t: 'in', s: 0, r: 'c0' }, { t: 'in', s: 0, r: 'r0' }, { t: 'next', a: 0, b: 1, d: 'right' }, { t: 'in', s: 0, r: 'r3' }, { t: 'next', a: 1, b: 2, d: 'down' }] } },
];

function Tutorial({ onDone }: { onDone: () => void }) {
  const t = useTranslations('PropositionGo');
  const [step, setStep] = useState(0);
  const [finish, setFinish] = useState<Finish>(null);
  const cur = TUTORIAL[step];
  const onSolved = useCallback((cells: number[]) => {
    const lie = cur.puzzle.tier === 3 ? cur.puzzle.props.findIndex((p: Prop) => !evalProp(p, cells)) : -1;
    setFinish(lie >= 0 ? { kind: 'lie', lie } : { kind: 'solved' });
  }, [cur]);
  const next = () => { if (step === TUTORIAL.length - 1) { try { localStorage.setItem('puzzlthink:pg-tutorial', '1'); } catch { /* private */ } onDone(); return; } setStep(step + 1); setFinish(null); };
  return (
    <div className={`${STAGE} flex flex-col gap-2.5`}>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-(--accent)/20 px-2 py-0.5 font-mono text-[11px] font-black text-(--accent)">{step + 1}/{TUTORIAL.length}</span>
        <p className="min-w-0 flex-1 break-keep text-[13px] font-black leading-[18px]">{t(`${cur.key}Title`)}</p>
      </div>
      <p className="-mt-1 break-keep text-[12px] leading-[18px] text-white/65">{t(`${cur.key}Desc`)}</p>
      <PropPlayfield key={cur.key} puzzle={cur.puzzle} finish={finish} locked={!!finish} onSolved={onSolved} />
      {finish && (
        <div className="pg-rise flex items-center gap-2 rounded-[14px] bg-[#3fd67a]/15 p-2 pl-3 ring-1 ring-[#3fd67a]/40">
          <p className="min-w-0 flex-1 break-keep text-[12.5px] font-black leading-[17px] text-[#bff5cd]">{t(`${cur.key}Done`)}</p>
          <button type="button" onClick={next} className="flex min-h-[42px] shrink-0 items-center gap-1 rounded-[10px] bg-(--accent) px-3.5 text-[13px] font-black text-(--accent-ink)">{step === TUTORIAL.length - 1 ? t('tutorialEnd') : t('nextStep')}<ChevronRight size={15} /></button>
        </div>
      )}
    </div>
  );
}
