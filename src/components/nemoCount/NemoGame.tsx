"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Clock3, Flag, GraduationCap, Infinity as InfinityIcon, ListChecks, RotateCcw, SkipForward, Timer, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { CHALLENGE_MS, NEMO_DIFFICULTIES, type NemoDifficulty, type NemoProblem, formatMs, generateProblem, tutorialProblems } from '@/lib/nemoCount';
import { reportGame } from '@/lib/stats';
import { AnswerInput, NEMO_ACCENT, NEMO_INK, NemoBoardView, SolutionReplay, TargetPlate } from './NemoParts';

type Mode = 'challenge' | 'practice' | 'tutorial';
type Attempt = { problem: NemoProblem; given: number | null; correct: boolean; ms: number };
type Verdict = { correct: boolean; given: number | null; ms: number } | null;
const BEST_KEY = 'puzzlthink_nemo_best'; // best challenge score per difficulty

const readMode = (): Mode => {
  if (typeof window === 'undefined') return 'challenge';
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'practice' || m === 'tutorial' ? m : 'challenge';
};
const readBest = (): Partial<Record<NemoDifficulty, number>> => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; } };

export default function NemoGame() {
  const t = useTranslations('NemoCount');
  const [mode, setMode] = useState<Mode>(readMode);
  const [difficulty, setDifficulty] = useState<NemoDifficulty>('normal');
  const [problem, setProblem] = useState<NemoProblem | null>(null);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0); // when the current problem appeared
  const [challengeEnd, setChallengeEnd] = useState(0); // 0 = challenge not running
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [verdict, setVerdict] = useState<Verdict>(null); // practice/tutorial: result for the current problem
  const [wrongTries, setWrongTries] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);
  const [summary, setSummary] = useState<Attempt[] | null>(null);
  const [best, setBest] = useState(readBest);
  const [now, setNow] = useState(() => Date.now());
  const runRef = useRef(0); // bumps on every restart so stale timers do nothing

  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(timer); }, []);

  const newProblem = (m: Mode = mode, d: NemoDifficulty = difficulty, tutorial = tutorialIndex) => {
    setProblem(m === 'tutorial' ? tutorialProblems()[tutorial % 2] : generateProblem(d));
    setStartedAt(Date.now()); setVerdict(null); setWrongTries(0); setShowSolution(false);
  };

  // Switching mode or difficulty starts over.
  const restart = (m: Mode, d: NemoDifficulty) => {
    runRef.current += 1;
    setMode(m); setDifficulty(d); setAttempts([]); setSummary(null); setChallengeEnd(0); setTutorialIndex(0); setFlash(null);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
    if (m === 'challenge') setProblem(null); else newProblem(m, d, 0);
  };

  // First problem for practice/tutorial; the challenge waits for its start button.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the first board is random, so it is made on the client
  useEffect(() => { if (mode !== 'challenge') newProblem(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startChallenge = () => {
    runRef.current += 1;
    setAttempts([]); setSummary(null); setChallengeEnd(Date.now() + CHALLENGE_MS); newProblem('challenge', difficulty);
  };

  const finishChallenge = (list: Attempt[]) => {
    setChallengeEnd(0); setSummary(list); setProblem(null);
    const correct = list.filter((a) => a.correct);
    const score = correct.length;
    if (score > (best[difficulty] ?? -1)) { const next = { ...best, [difficulty]: score }; setBest(next); try { localStorage.setItem(BEST_KEY, JSON.stringify(next)); } catch { /* optional */ } }
    reportGame(`nemo_count-solo-${Date.now()}`, 'nemo_count', 'solo', score > 0 ? 'win' : 'loss', {
      difficulty, correct: score, attempted: list.length,
      avgMs: score ? Math.round(correct.reduce((s, a) => s + a.ms, 0) / score) : null,
      fastestMs: score ? Math.min(...correct.map((a) => a.ms)) : null,
    });
  };

  // The 30 minutes run out.
  const remaining = challengeEnd ? Math.max(0, challengeEnd - now) : 0;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ends the challenge when its clock reaches zero
    if (challengeEnd && remaining === 0) finishChallenge(attempts);
  }, [challengeEnd, remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const elapsed = problem ? (verdict ? verdict.ms : now - startedAt) : 0;

  const submit = (value: number) => {
    if (!problem || verdict) return;
    const ms = Date.now() - startedAt;
    const correct = value === problem.answer;
    setFlash(correct ? 'right' : 'wrong');
    const run = runRef.current;
    window.setTimeout(() => { if (runRef.current === run) setFlash(null); }, 650);
    if (mode === 'challenge') {
      // One try per problem, like the show: right or wrong, the next board comes up.
      const list = [...attempts, { problem, given: value, correct, ms }];
      setAttempts(list);
      newProblem('challenge', difficulty);
      return;
    }
    if (correct) { setVerdict({ correct: true, given: value, ms }); setAttempts((list) => [...list, { problem, given: value, correct: true, ms }]); }
    else setWrongTries((n) => n + 1);
  };

  // Practice: give up and see the answer with its solution replay.
  const reveal = () => {
    if (!problem) return;
    const ms = Date.now() - startedAt;
    setVerdict({ correct: false, given: null, ms }); setShowSolution(true);
    setAttempts((list) => [...list, { problem, given: null, correct: false, ms }]);
  };

  const nextPractice = () => {
    if (mode === 'tutorial') {
      if (tutorialIndex >= 1) { restart('practice', 'easy'); return; }
      setTutorialIndex(1); newProblem('tutorial', difficulty, 1); return;
    }
    newProblem();
  };

  // Pass: count it as missed and go straight to the next board.
  const pass = () => {
    if (!problem) return;
    const ms = Date.now() - startedAt;
    setAttempts((list) => [...list, { problem, given: null, correct: false, ms }]);
    if (mode === 'tutorial') { nextPractice(); return; }
    newProblem(mode, difficulty);
  };

  const correctList = attempts.filter((a) => a.correct);
  const avgMs = correctList.length ? correctList.reduce((s, a) => s + a.ms, 0) / correctList.length : 0;
  const recent = useMemo(() => [...attempts].reverse().slice(0, 8), [attempts]);
  const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
  const heading = verdict?.correct ? t('solvedIn', { time: formatMs(verdict.ms) }) : verdict ? t('gaveUp', { answer: problem?.answer ?? 0 })
    : mode === 'tutorial' ? t(`tutorialHint${tutorialIndex}`) : wrongTries ? t('tryAgain') : t('howMany');

  return (
    <div className={SHELL} style={{ ...accentVars(NEMO_ACCENT, NEMO_INK), backgroundImage: fog('120, 130, 160') }}>
      <Shards tint="#2a2f45" />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => restart(mode, difficulty)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('restart')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          {/* Mode tabs */}
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {([['challenge', Timer], ['practice', InfinityIcon], ['tutorial', GraduationCap]] as const).map(([m, Icon]) => (
              <button key={m} type="button" onClick={() => restart(m, m === 'tutorial' ? difficulty : difficulty)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{t(`mode_${m}`)}</button>
            ))}
          </div>

          {mode === 'challenge' && !challengeEnd && !summary && (
            <div className="mx-auto max-w-md py-10 text-center">
              <Timer size={36} className="mx-auto text-(--accent)" />
              <h1 className="mt-4 text-2xl font-black">{t('challengeTitle')}</h1>
              <p className="mt-2 break-keep text-sm leading-6 text-white/55">{t('challengeDesc')}</p>
              <p className="mt-4 text-xs font-bold text-white/40">{t('bestScore', { level: t(`level_${difficulty}`), n: best[difficulty] ?? 0 })}</p>
              <button type="button" onClick={startChallenge} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm`}><Timer size={16} />{t('startChallenge')}</button>
            </div>
          )}

          {summary && (
            <div className="mx-auto max-w-lg py-6">
              <div className="text-center"><Trophy size={34} className="mx-auto text-[#ffcf3f]" /><p className={`${KICKER} mt-3`}>{t('timeUp')}</p><h1 className="mt-1 text-3xl font-black">{t('summaryScore', { n: summary.filter((a) => a.correct).length })}</h1></div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[[t('statAttempted'), String(summary.length)], [t('statAccuracy'), summary.length ? `${Math.round((summary.filter((a) => a.correct).length / summary.length) * 100)}%` : '—'], [t('statAvg'), summary.some((a) => a.correct) ? formatMs(summary.filter((a) => a.correct).reduce((s, a) => s + a.ms, 0) / summary.filter((a) => a.correct).length) : '—']].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] border border-white/10 bg-black/40 p-3"><p className="text-[10px] font-black tracking-widest text-white/35">{label}</p><p className="mt-1 font-mono text-xl font-black">{value}</p></div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-white/40">{t('bestScore', { level: t(`level_${difficulty}`), n: best[difficulty] ?? 0 })}</p>
              <button type="button" onClick={startChallenge} className={`${BTN_ACCENT} mt-5 w-full py-3`}><RotateCcw size={14} />{t('again')}</button>
            </div>
          )}

          {problem && !summary && (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={KICKER}>{mode === 'tutorial' ? t('tutorialKicker', { n: tutorialIndex + 1 }) : mode === 'challenge' ? t('challengeKicker', { n: attempts.length + 1 }) : t('practiceKicker', { level: t(`level_${difficulty}`) })}</p>
                  <h1 className="mt-1 break-keep text-base font-extrabold leading-6 text-[#eef1f7] sm:text-lg">{heading}</h1>
                  <p className="mt-2 flex items-center gap-3 font-mono text-xs text-white/55">
                    <span className="flex items-center gap-1"><Clock3 size={13} />{formatMs(elapsed)}</span>
                    {mode === 'challenge' && <span className={`flex items-center gap-1 font-black ${remaining < 60_000 ? 'text-[#ff7b71]' : 'text-(--accent)'}`}><Timer size={13} />{clock(remaining)}</span>}
                  </p>
                </div>
                <TargetPlate target={problem.target} />
              </div>

              <div className={`rounded-[12px] p-2 transition sm:p-4 ${flash === 'right' ? 'bg-[#34c47c]/15 ring-2 ring-[#34c47c]/60' : flash === 'wrong' ? 'bg-[#ff5d5d]/12 ring-2 ring-[#ff5d5d]/60' : ''}`}>
                {showSolution || verdict?.correct ? <SolutionReplay board={problem} auto={!verdict?.correct} /> : <NemoBoardView board={problem} />}
              </div>

              <div className="mx-auto mt-4 max-w-md space-y-2">
                {!verdict && <AnswerInput onSubmit={submit} placeholder={t('answerPlaceholder')} submitLabel={t('submit')} />}
                {!verdict && (
                  <div className="flex gap-2">
                    <button type="button" onClick={pass} className={`flex-1 py-2.5 ${BTN}`}><SkipForward size={14} />{t('skip')}</button>
                    {mode !== 'challenge' && <button type="button" onClick={reveal} className={`flex-1 py-2.5 ${BTN}`}><Flag size={14} />{t('reveal')}</button>}
                    {mode === 'challenge' && <button type="button" onClick={() => finishChallenge(attempts)} className={`py-2.5 ${BTN} text-white/45`}>{t('endNow')}</button>}
                  </div>
                )}
                {verdict && (
                  <div className="space-y-2">
                    <p className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-black ${verdict.correct ? 'bg-[#34c47c]/15 text-[#7ee2ae]' : 'bg-white/5 text-white/70'}`}>{verdict.correct ? <Check size={16} /> : <ListChecks size={16} />}{t('answerIs', { n: problem.answer })}</p>
                    <button type="button" onClick={nextPractice} className={`${BTN_ACCENT} w-full py-3`}><SkipForward size={14} />{mode === 'tutorial' && tutorialIndex >= 1 ? t('toPractice') : t('nextProblem')}</button>
                  </div>
                )}
                {wrongTries > 0 && !verdict && <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#ff9b94]"><X size={13} />{t('wrongCount', { n: wrongTries })}</p>}
              </div>
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {mode !== 'tutorial' && (
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{t('difficulty')}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {NEMO_DIFFICULTIES.map((d) => <button key={d} type="button" disabled={!!challengeEnd} onClick={() => restart(mode, d)} className={`py-2.5 ${seg(difficulty === d)} disabled:opacity-40`}>{t(`level_${d}`)}</button>)}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/40">{t(`levelHint_${difficulty}`)}</p>
            </section>
          )}

          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('session')}</p><span className="font-mono text-[11px] text-white/45">{correctList.length}/{attempts.length}</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md border border-white/10 bg-black/30 p-2"><p className="text-[9px] font-black tracking-widest text-white/35">{t('statCorrect')}</p><p className="mt-0.5 font-mono text-lg font-black text-(--accent)">{correctList.length}</p></div>
              <div className="rounded-md border border-white/10 bg-black/30 p-2"><p className="text-[9px] font-black tracking-widest text-white/35">{t('statAvg')}</p><p className="mt-0.5 font-mono text-lg font-black">{correctList.length ? formatMs(avgMs) : '—'}</p></div>
            </div>
            {recent.length > 0 && <ul className="mt-3 space-y-1.5">{recent.map((a, i) => (
              <li key={`${a.problem.id}-${i}`} className="flex items-center justify-between rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                <span className="flex items-center gap-1.5">{a.correct ? <Check size={12} className="text-[#7ee2ae]" /> : <X size={12} className="text-[#ff9b94]" />}<span className="text-white/60">{t('historyLine', { target: a.problem.target, answer: a.problem.answer })}</span></span>
                <span className="font-mono text-white/45">{formatMs(a.ms)}</span>
              </li>
            ))}</ul>}
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
