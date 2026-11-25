"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Eye, RotateCcw, SkipForward, Target, Timer, Trophy } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, seg } from '@/components/ui/gameUi';
import { BoardExitRule, BoardExitToast, exitDetail, useBoardExits } from '@/hooks/useBoardExits';
import { CHALLENGE_MS, type Mark, generateEquation, glyph, keyMarks, markGuess, solved } from '@/lib/equationSignal';
import { reportGame } from '@/lib/stats';
import { SignalKeypad, SignalLegend, SignalRow, useDraft, useSignalKeys } from './SignalParts';
import { EQS_ROOT_STYLE, eqsCopy } from './copy';

type Mode = 'practice' | 'challenge';
type Phase = 'intro' | 'play' | 'done' | 'summary';
type Row = { guess: string; marks: Mark[] };
type Played = { answer: string; guesses: number; solved: boolean };
const BEST_KEY = 'puzzlthink_equation_signal_best'; // most equations in a 10-minute challenge

const readMode = (): Mode => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'challenge' ? 'challenge' : 'practice');
const readBest = (): number => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
const pretty = (text: string) => [...text].map(glyph).join(' ');

export default function EquationSignalGame() {
  const c = eqsCopy(useLocale());
  const [mode, setMode] = useState<Mode>(readMode);
  const [phase, setPhase] = useState<Phase>('intro');
  const [answer, setAnswer] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [played, setPlayed] = useState<Played[]>([]);
  const [challengeEnd, setChallengeEnd] = useState(0);
  const [voided, setVoided] = useState(false);
  const [best, setBest] = useState(readBest);
  const [now, setNow] = useState(() => Date.now());
  const draft = useDraft();
  const { exits: exitCount, warn: exitWarn } = useBoardExits(mode === 'challenge' && challengeEnd > 0);
  const reported = useRef('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(timer); }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [rows.length]);

  const newEquation = () => { setAnswer(generateEquation()); setRows([]); draft.clear(); setPhase('play'); };

  const start = (m: Mode = mode) => {
    setPlayed([]); setVoided(false); reported.current = '';
    setChallengeEnd(m === 'challenge' ? Date.now() + CHALLENGE_MS : 0);
    newEquation();
  };

  const switchMode = (m: Mode) => {
    setMode(m); setPhase('intro'); setPlayed([]); setChallengeEnd(0); setRows([]); draft.clear();
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
  };

  /** Practice counts each equation as one play; the challenge is recorded once, at the end. */
  const reportPractice = (ok: boolean, guesses: number) =>
    reportGame(`equation_signal-practice-${Date.now()}`, 'equation_signal', 'solo', ok ? 'win' : 'loss', { mode: 'practice', guesses });

  const finishChallenge = useCallback((list: Played[]) => {
    setPhase('summary'); setChallengeEnd(0);
    const key = `challenge-${list.length}-${list[0]?.answer ?? ''}`;
    if (reported.current === key) return;
    reported.current = key;
    const score = list.filter((p) => p.solved).length;
    const exits = exitDetail(exitCount());
    setVoided('voided' in exits);
    if (score > best && !('voided' in exits)) { setBest(score); try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* optional */ } }
    reportGame(`equation_signal-solo-${Date.now()}`, 'equation_signal', 'solo', score > 0 ? 'win' : 'loss', {
      ...exits, mode: 'challenge', score, guesses: list.reduce((s, p) => s + p.guesses, 0), skipped: list.filter((p) => !p.solved).length,
    });
  }, [best, exitCount]);

  const challengeLeft = challengeEnd ? Math.max(0, challengeEnd - now) : 0;
  useEffect(() => {
    if (!challengeEnd || challengeLeft > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ends the challenge when its clock reaches zero
    finishChallenge(played);
  }, [challengeEnd, challengeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(() => {
    if (phase !== 'play' || !draft.full) return;
    const marks = markGuess(answer, draft.text);
    const list = [...rows, { guess: draft.text, marks }];
    setRows(list); draft.clear();
    if (!solved(marks)) return;
    const entry = { answer, guesses: list.length, solved: true };
    setPlayed((p) => [...p, entry]);
    if (mode === 'practice') reportPractice(true, list.length);
    setPhase('done');
  }, [phase, draft, answer, rows, mode]);

  /** Give up on this one: the answer is shown, no point. */
  const skip = () => {
    if (phase !== 'play') return;
    setPlayed((p) => [...p, { answer, guesses: rows.length, solved: false }]);
    if (mode === 'practice') reportPractice(false, rows.length);
    setPhase('done');
  };

  const { setCursor } = draft;
  const move = useCallback((delta: number) => setCursor((i) => i + delta), [setCursor]);
  useSignalKeys(phase === 'play', draft.type, draft.back, submit, move);
  // Enter moves on once an equation is done.
  useEffect(() => {
    if (phase !== 'done') return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Enter') { event.preventDefault(); newEquation(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const score = played.filter((p) => p.solved).length;
  const last = played.at(-1);
  const totals = { guesses: played.reduce((s, p) => s + p.guesses, 0), skipped: played.filter((p) => !p.solved).length };

  return (
    <div className={SHELL} style={EQS_ROOT_STYLE}>
      <Shards tint="#26301a" />
      <BoardExitToast warn={exitWarn} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={c.title} titleClass="font-black" subtitle={c.subtitle}>
        <GameUpdates game="equation_signal" /><BugReport /><LanguageSwitcher compact dark />
        {phase !== 'intro' && <button type="button" onClick={() => switchMode(mode)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{c.restart}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {([['practice', Target, c.modePractice], ['challenge', Timer, c.modeChallenge]] as const).map(([m, Icon, label]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{label}</button>
            ))}
          </div>

          {phase === 'intro' && (
            <div className="mx-auto max-w-md py-8 text-center">
              {mode === 'practice' ? <Target size={36} className="mx-auto text-(--accent)" /> : <Timer size={36} className="mx-auto text-(--accent)" />}
              <h1 className="mt-4 text-2xl font-black">{mode === 'practice' ? c.practiceTitle : c.challengeTitle}</h1>
              <p className="mt-2 break-keep text-sm leading-6 text-white/55">{mode === 'practice' ? c.practiceDesc : c.challengeDesc}</p>
              {mode === 'challenge' && <p className="mt-4 text-xs font-bold text-white/40">{c.best(best)}</p>}
              <button type="button" onClick={() => start()} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm`}>{mode === 'practice' ? c.startPractice : c.startChallenge}</button>
              {mode === 'challenge' && <BoardExitRule />}
            </div>
          )}

          {phase === 'summary' && (
            <div className="mx-auto max-w-lg py-6">
              {voided && <BoardExitRule voided />}
              <div className="text-center"><Trophy size={34} className="mx-auto text-[#ffcf3f]" /><p className={`${KICKER} mt-3`}>{c.timeUp}</p><h1 className="mt-1 text-3xl font-black">{c.summary(score)}</h1></div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[[c.statSolved, String(score)], [c.statGuesses, String(totals.guesses)], [c.statSkipped, String(totals.skipped)]].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] border border-white/10 bg-black/40 p-3"><p className="text-[10px] font-black tracking-widest text-white/35">{label}</p><p className="mt-1 font-mono text-xl font-black">{value}</p></div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-white/40">{c.best(best)}</p>
              <ul className="mt-4 space-y-1.5">{played.map((p, i) => (
                <li key={`${p.answer}-${i}`} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-white/75">{pretty(p.answer)}</span>
                  <span className={`font-mono font-black ${p.solved ? 'text-[#7ee2ae]' : 'text-white/35'}`}>{p.solved ? c.historyLine(p.guesses) : c.skipped}</span>
                </li>
              ))}</ul>
              <button type="button" onClick={() => start()} className={`${BTN_ACCENT} mt-5 w-full py-3`}><RotateCcw size={14} />{c.again}</button>
            </div>
          )}

          {(phase === 'play' || phase === 'done') && (
            <div className="mx-auto max-w-[460px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={KICKER}>{phase === 'play' ? c.guessN(rows.length + 1) : c.answerWas}</p>
                <p className="flex items-center gap-3 font-mono text-xs">
                  <span className="font-black text-(--accent)">{c.solvedCount(score)}</span>
                  {mode === 'challenge' && <span className={`flex items-center gap-1 font-black ${challengeLeft < 60_000 ? 'text-[#ff7b71]' : 'text-white/70'}`}><Timer size={13} />{clock(challengeLeft)}</span>}
                </p>
              </div>

              <div ref={listRef} className="max-h-[38svh] space-y-1 overflow-y-auto pr-0.5 sm:space-y-1.5">
                {rows.map((row, i) => <SignalRow key={i} text={row.guess} marks={row.marks} pop={i === rows.length - 1} />)}
                {phase === 'play' && <SignalRow text={draft.cells} cursor={draft.cursor} onCell={draft.setCursor} />}
              </div>

              {phase === 'done' && last && (
                <div className={`mt-3 rounded-[12px] border p-4 text-center ${last.solved ? 'border-[#2fbf71]/50 bg-[#2fbf71]/10' : 'border-white/15 bg-black/40'}`}>
                  <p className={`text-sm font-black ${last.solved ? 'text-[#7ee2ae]' : 'text-white/60'}`}>{last.solved ? c.solvedIn(last.guesses) : c.answerWas}</p>
                  <p className="mt-1 font-mono text-2xl font-black tracking-wide">{pretty(last.answer)}</p>
                  <button type="button" onClick={newEquation} className={`${BTN_ACCENT} mt-3 w-full py-3`}><SkipForward size={14} />{c.next}</button>
                </div>
              )}

              {phase === 'play' && (
                <div className="mt-3 space-y-2">
                  <SignalLegend g={c.legendG} y={c.legendY} r={c.legendR} />
                  <SignalKeypad marks={keyMarks(rows)} onSymbol={draft.type} onBack={draft.back} onEnter={submit} canEnter={draft.full} enterLabel={c.submit} />
                  <button type="button" onClick={skip} className={`${BTN} w-full py-2.5`}>{mode === 'challenge' ? <SkipForward size={14} /> : <Eye size={14} />}{mode === 'challenge' ? c.skip : c.giveUp}</button>
                  <p className="hidden text-center text-[10px] text-white/30 lg:block">{c.keysHint}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{c.session}</p><span className="font-mono text-[11px] text-white/45">{c.solvedCount(score)}</span></div>
            {played.length === 0 ? <p className="mt-3 text-xs text-white/40">{c.noneYet}</p> : (
              <ul className="mt-3 space-y-1.5">{[...played].reverse().slice(0, 8).map((p, i) => (
                <li key={`${p.answer}-${i}`} className="flex items-center justify-between rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-white/70">{pretty(p.answer)}</span>
                  <span className={`font-mono ${p.solved ? 'text-[#7ee2ae]' : 'text-white/35'}`}>{p.solved ? c.historyLine(p.guesses) : c.skipped}</span>
                </li>
              ))}</ul>
            )}
          </section>
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{c.quickTitle}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{c.quick.map((line, i) => <li key={line} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
          </section>
        </aside>
      </main>
    </div>
  );
}
