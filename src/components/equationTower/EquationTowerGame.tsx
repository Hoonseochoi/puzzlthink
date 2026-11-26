"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Blocks, RotateCcw, SkipForward, Timer, Trophy, Undo2 } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, seg } from '@/components/ui/gameUi';
import { BoardExitRule, BoardExitToast, exitDetail, useBoardExits } from '@/hooks/useBoardExits';
import { CHALLENGE_MS, LEVELS, type Level, asLevel, type Block, type Stacks, type TowerRound, applyMove, createBlocks, dealStacks, generateRound, legalMove, roundPoints, solvedStack } from '@/lib/equationTower';
import { reportGame } from '@/lib/stats';
import { type Held, TargetCard, TowerStacks, moveOf } from './TowerParts';
import { EQT_ROOT_STYLE, eqtCopy } from './copy';

type Mode = 'practice' | 'challenge';
type Phase = 'intro' | 'play' | 'done' | 'summary';
type Played = { round: TowerRound; moves: number; points: number };
const BEST_KEY = 'puzzlthink_equation_tower_best'; // best 10-minute challenge score (the challenge is 어려움 only now)

const readMode = (): Mode => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'challenge' ? 'challenge' : 'practice');
const readLevel = (): Level => (typeof window !== 'undefined' ? asLevel(new URLSearchParams(window.location.search).get('level')) : 'normal');
// '_hard' held 어려움 challenge bests for the short while both levels had a challenge.
const readBest = (): number => { try { return Math.max(Number(localStorage.getItem(BEST_KEY)) || 0, Number(localStorage.getItem(`${BEST_KEY}_hard`)) || 0); } catch { return 0; } };
const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export default function EquationTowerGame() {
  const c = eqtCopy(useLocale());
  const [mode, setMode] = useState<Mode>(readMode);
  const [level, setLevel] = useState<Level>(readLevel); // practice level; the challenge is always 어려움
  const [building, setBuilding] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [stacks, setStacks] = useState<Stacks>([[], [], [], []]);
  const [origin, setOrigin] = useState<Stacks>([[], [], [], []]); // the stacks when this round began
  const [round, setRound] = useState<TowerRound | null>(null);
  const [index, setIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [held, setHeld] = useState<Held | null>(null);
  const [played, setPlayed] = useState<Played[]>([]);
  const [challengeEnd, setChallengeEnd] = useState(0);
  const [voided, setVoided] = useState(false);
  const [best, setBest] = useState(readBest);
  const active: Level = mode === 'challenge' ? 'hard' : level;
  const [now, setNow] = useState(() => Date.now());
  const { exits: exitCount, warn: exitWarn } = useBoardExits(mode === 'challenge' && challengeEnd > 0);
  const reported = useRef('');
  const gen = useRef(0); // bumped when the mode or level changes, so a round still being picked is dropped

  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(timer); }, []);

  // 어려움 searches about ten million positions (a fraction of a second): show "picking" and let the screen paint first.
  const beginRound = (b: Block[], s: Stacks, i: number, lv: Level = active) => {
    setBuilding(true); setHeld(null);
    const mine = gen.current;
    window.setTimeout(() => {
      if (mine !== gen.current) return;
      setRound(generateRound(s, b, Math.random, lv)); setOrigin(s); setStacks(s); setIndex(i); setMoves(0); setPhase('play'); setBuilding(false);
    }, 30);
  };

  const start = (m: Mode = mode) => {
    if (building) return;
    const lv: Level = m === 'challenge' ? 'hard' : level;
    const b = createBlocks(Math.random, lv);
    setBlocks(b); setPlayed([]); setVoided(false); reported.current = '';
    setChallengeEnd(m === 'challenge' ? Date.now() + CHALLENGE_MS : 0);
    beginRound(b, dealStacks(b), 0, lv);
  };

  const switchMode = (m: Mode, lv: Level = level) => {
    gen.current += 1; setBuilding(false);
    setMode(m); setLevel(lv); setPhase('intro'); setPlayed([]); setChallengeEnd(0); setRound(null); setHeld(null);
    const url = new URL(window.location.href); url.searchParams.set('mode', m);
    if (m === 'practice' && lv === 'hard') url.searchParams.set('level', lv); else url.searchParams.delete('level');
    window.history.replaceState(null, '', url);
  };

  /** Practice counts each round as one play; the challenge is recorded once, at the end. */
  const reportPractice = (entry: Played) =>
    reportGame(`equation_tower-practice-${Date.now()}`, 'equation_tower', 'solo', entry.points > 0 ? 'win' : 'loss', { mode: 'practice', level: active, moves: entry.moves, par: entry.round.par });

  const finishChallenge = useCallback((list: Played[]) => {
    setPhase('summary'); setChallengeEnd(0); setHeld(null);
    const key = `challenge-${list.length}-${list[0]?.round.id ?? ''}`;
    if (reported.current === key) return;
    reported.current = key;
    const score = list.reduce((s, p) => s + p.points, 0);
    const exits = exitDetail(exitCount());
    setVoided('voided' in exits);
    if (score > best && !('voided' in exits)) { setBest(score); try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* optional */ } }
    reportGame(`equation_tower-solo-${Date.now()}`, 'equation_tower', 'solo', score > 0 ? 'win' : 'loss', {
      ...exits, mode: 'challenge', level: 'hard', score, rounds: list.filter((p) => p.points > 0).length, perfect: list.filter((p) => p.points === 3).length, skipped: list.filter((p) => p.points === 0).length,
    });
  }, [best, exitCount]);

  const challengeLeft = challengeEnd ? Math.max(0, challengeEnd - now) : 0;
  useEffect(() => {
    if (!challengeEnd || challengeLeft > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ends the challenge when its clock reaches zero
    finishChallenge(played);
  }, [challengeEnd, challengeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = (entry: Played) => {
    setPlayed((p) => [...p, entry]);
    if (mode === 'practice') reportPractice(entry);
    setHeld(null); setPhase('done');
  };

  const drop = (to: number) => {
    if (phase !== 'play' || !held || !round) return;
    const move = moveOf(held, to);
    if (!legalMove(stacks, move)) return;
    const after = applyMove(stacks, move);
    setStacks(after); setHeld(null); setMoves(moves + 1);
    if (solvedStack(after, blocks, round.target, round.floors) >= 0) close({ round, moves: moves + 1, points: roundPoints(moves + 1, round.par) });
  };
  const reset = () => { setStacks(origin); setMoves(0); setHeld(null); };
  const skip = () => { if (phase === 'play' && round) close({ round, moves, points: 0 }); };
  const next = () => { if (!building) beginRound(blocks, stacks, index + 1); };

  const score = played.reduce((s, p) => s + p.points, 0);
  const last = played.at(-1);
  const win = round && (phase === 'done' || phase === 'play') ? solvedStack(stacks, blocks, round.target, round.floors) : -1;

  return (
    <div className={SHELL} style={EQT_ROOT_STYLE}>
      <Shards tint="#33211a" />
      <BoardExitToast warn={exitWarn} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={c.title} titleClass="font-black" subtitle={c.subtitle}>
        <GameUpdates game="equation_tower" /><BugReport /><LanguageSwitcher compact dark />
        {phase !== 'intro' && <button type="button" onClick={() => switchMode(mode)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{c.restart}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {([['practice', Blocks, c.modePractice], ['challenge', Timer, c.modeChallenge]] as const).map(([m, Icon, label]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{label}</button>
            ))}
          </div>
          {mode === 'practice' && <div className="mb-4 flex items-center gap-2">
            <span className="shrink-0 text-[11px] font-black text-white/45">{c.level}</span>
            <div className="grid flex-1 grid-cols-2 gap-1.5">
              {LEVELS.map((lv) => (
                <button key={lv} type="button" onClick={() => switchMode(mode, lv)} className={`py-2 text-xs ${seg(level === lv)}`}>{c.levelName[lv]}</button>
              ))}
            </div>
          </div>}

          {phase === 'intro' && (
            <div className="mx-auto max-w-md py-8 text-center">
              {mode === 'practice' ? <Blocks size={36} className="mx-auto text-(--accent)" /> : <Timer size={36} className="mx-auto text-(--accent)" />}
              <h1 className="mt-4 text-2xl font-black">{mode === 'practice' ? c.practiceTitle : c.challengeTitle}</h1>
              <p className="mt-2 break-keep text-sm leading-6 text-white/55">{mode === 'practice' ? c.practiceDesc : c.challengeDesc}</p>
              <p className="mt-3 inline-flex rounded-full bg-(--accent)/15 px-3 py-1 text-[11px] font-black text-(--accent)">{c.levelName[active]} · {c.levelNote[active]}</p>
              {mode === 'challenge' && <p className="mt-4 text-xs font-bold text-white/40">{c.best(best)}</p>}
              <button type="button" onClick={() => start()} disabled={building} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm disabled:opacity-60`}>{building ? c.building : mode === 'practice' ? c.startPractice : c.startChallenge}</button>
              {mode === 'challenge' && <BoardExitRule />}
            </div>
          )}

          {phase === 'summary' && (
            <div className="mx-auto max-w-lg py-6">
              {voided && <BoardExitRule voided />}
              <div className="text-center"><Trophy size={34} className="mx-auto text-[#ffcf3f]" /><p className={`${KICKER} mt-3`}>{c.timeUp}</p><h1 className="mt-1 text-3xl font-black">{c.summary(score)}</h1></div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[[c.statRounds, played.filter((p) => p.points > 0).length], [c.statPerfect, played.filter((p) => p.points === 3).length], [c.statSkipped, played.filter((p) => p.points === 0).length]].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] border border-white/10 bg-black/40 p-3"><p className="text-[10px] font-black tracking-widest text-white/35">{label}</p><p className="mt-1 font-mono text-xl font-black">{value}</p></div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-white/40">{c.best(best)}</p>
              <ul className="mt-4 space-y-1.5">{played.map((p, i) => (
                <li key={p.round.id} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-white/45">R{i + 1} · {c.historyLine(p.round.target, p.round.floors)}</span>
                  <span className="min-w-0 flex-1 truncate text-right text-white/60">{p.points ? c.historyMoves(p.moves, p.round.par) : c.skippedRound}</span>
                  <span className={`w-8 text-right font-mono font-black ${p.points ? 'text-[#7ee2ae]' : 'text-white/35'}`}>{p.points ? `+${p.points}` : '0'}</span>
                </li>
              ))}</ul>
              <button type="button" onClick={() => start()} disabled={building} className={`${BTN_ACCENT} mt-5 w-full py-3 disabled:opacity-60`}><RotateCcw size={14} />{building ? c.building : c.again}</button>
            </div>
          )}

          {round && (phase === 'play' || phase === 'done') && (
            <div className="mx-auto max-w-[520px]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={KICKER}>{c.roundKicker(index + 1)} · {c.levelName[active]}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-white/60">
                    <span className="font-black text-(--accent)">{c.score(score)}</span>
                    <span>{c.moves(moves)}</span>
                    {mode === 'challenge' && <span className={`flex items-center gap-1 font-black ${challengeLeft < 60_000 ? 'text-[#ff7b71]' : 'text-white/70'}`}><Timer size={13} />{clock(challengeLeft)}</span>}
                  </p>
                </div>
                <TargetCard target={round.target} floors={round.floors} c={c} />
              </div>

              <TowerStacks
                blocks={blocks} stacks={stacks} c={c} held={held} winStack={win}
                onPick={phase === 'play' ? (s, count) => setHeld({ from: s, count, flip: false }) : undefined}
                onDrop={drop} onFlip={() => setHeld((h) => (h ? { ...h, flip: !h.flip } : h))} onCancel={() => setHeld(null)}
              />

              {phase === 'play' && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={reset} disabled={moves === 0} className={`flex-1 py-2.5 ${BTN} disabled:opacity-40`}><Undo2 size={14} />{c.reset}</button>
                  <button type="button" onClick={skip} className={`flex-1 py-2.5 ${BTN}`}><SkipForward size={14} />{c.skip}</button>
                </div>
              )}

              {phase === 'done' && last && (
                <div className={`mt-3 rounded-[12px] border p-4 text-center ${last.points ? 'border-[#2fbf71]/50 bg-[#2fbf71]/10' : 'border-white/15 bg-black/40'}`}>
                  <p className={`text-sm font-black ${last.points ? 'text-[#7ee2ae]' : 'text-white/60'}`}>{last.points ? `${c.solved(last.moves)} ${c.gotPoints(last.points)}` : c.skippedRound}</p>
                  <p className="mt-1 text-xs text-white/50">{c.par(last.round.par)}</p>
                  <button type="button" onClick={next} disabled={building} className={`${BTN_ACCENT} mt-3 w-full py-3 disabled:opacity-60`}><SkipForward size={14} />{building ? c.building : c.next}</button>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{c.session}</p><span className="font-mono text-[11px] text-white/45">{c.score(score)}</span></div>
            {played.length === 0 ? <p className="mt-3 text-xs text-white/40">{c.noneYet}</p> : (
              <ul className="mt-3 space-y-1.5">{[...played].reverse().slice(0, 8).map((p) => (
                <li key={p.round.id} className="flex items-center justify-between rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="text-white/60">{c.historyLine(p.round.target, p.round.floors)}</span>
                  <span className={`font-mono ${p.points ? 'text-[#7ee2ae]' : 'text-white/35'}`}>{p.points ? c.historyMoves(p.moves, p.round.par) : c.skippedRound}</span>
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
