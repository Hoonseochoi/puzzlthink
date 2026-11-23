"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Leaf, Play, RotateCcw, Timer, Trophy, Undo2, Volume2, VolumeX } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { BoardExitRule, BoardExitToast, exitDetail, useBoardExits } from '@/hooks/useBoardExits';
import { mergeSoundOn, setMergeSound, unlockGameAudio } from '@/lib/gameAudio';
import { type Dir, type M2State, isState, maxTile, newGame, randomSeed } from '@/lib/merge2048';
import { reportGame } from '@/lib/stats';
import { BlockCollection, BlockFace, M2Board, M2_ACCENT, M2_INK, StatBox, clock, useM2Input } from './M2Parts';
import { useM2Game } from './useM2Game';

type Mode = 'free' | 'challenge';
export const CHALLENGE_MS = 10 * 60_000;
const SAVE_KEY = 'puzzlthink_2048_free'; // the free game in progress
const BEST_KEY = 'puzzlthink_2048_best'; // best free score
const CH_BEST_KEY = 'puzzlthink_2048_challenge_best';
const TOP_KEY = 'puzzlthink_2048_top'; // biggest block ever made (for the collection)

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Optional. */ } };
const readNum = (key: string) => Number(read(key)) || 0;
const readMode = (): Mode => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'challenge' ? 'challenge' : 'free');
const loadFree = (): M2State => {
  try { const saved = JSON.parse(read(SAVE_KEY) || 'null'); if (isState(saved) && !saved.over) return saved; } catch { /* fresh game */ }
  return newGame(randomSeed());
};

/** Free play (no clock, undo, saved as you go) and the 10-minute challenge (score is recorded). */
export default function Merge2048Game() {
  const t = useTranslations('Merge2048');
  const [mode, setMode] = useState<Mode>(readMode);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [best, setBest] = useState(0);
  const [chBest, setChBest] = useState(0);
  const [top, setTop] = useState(0);
  const [undo, setUndo] = useState<M2State | null>(null);
  const [toast, setToast] = useState<{ v: number; at: number } | null>(null);
  const [won, setWon] = useState(false); // 2048 made this game: the celebration card
  const [sound, setSound] = useState(true);
  const [voided, setVoided] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const reported = useRef('');
  const startedAt = useRef(0);
  const { exits: exitCount, warn: exitWarn } = useBoardExits(mode === 'challenge' && phase === 'playing');

  const onMoved = useCallback((next: M2State, prev: M2State) => {
    const before = maxTile(prev), after = maxTile(next);
    if (after > before && after >= 64) setToast({ v: after, at: Date.now() });
    if (after >= 2048 && before < 2048) setWon(true);
    if (after > readNum(TOP_KEY)) { write(TOP_KEY, String(after)); setTop(after); }
    if (mode === 'free') {
      write(SAVE_KEY, JSON.stringify(next));
      setUndo(prev);
      if (next.score > readNum(BEST_KEY)) { write(BEST_KEY, String(next.score)); setBest(next.score); }
    }
  }, [mode]);
  const { game, view, step, setGame } = useM2Game(onMoved);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- saved records live in localStorage */
    setBest(readNum(BEST_KEY)); setChBest(readNum(CH_BEST_KEY)); setTop(readNum(TOP_KEY)); setSound(mergeSoundOn());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Free play opens straight onto the saved board; the challenge waits for its start button.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- switching modes resets the board */
    setWon(false); setUndo(null); setToast(null); setVoided(false);
    if (mode === 'free') { setGame(loadFree()); setPhase('playing'); setEndAt(0); }
    else { setGame(null); setPhase('intro'); setEndAt(0); }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mode, setGame]);

  useEffect(() => {
    if (!endAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [endAt]);

  const switchMode = (m: Mode) => {
    setMode(m);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
  };

  const finish = useCallback((final: M2State) => {
    setPhase('done'); setEndAt(0);
    const key = `${mode}-${startedAt.current}-${final.moves}`;
    if (reported.current === key) return;
    reported.current = key;
    const max = maxTile(final);
    if (mode === 'challenge') {
      const exits = exitDetail(exitCount());
      const bad = 'voided' in exits;
      setVoided(bad);
      if (!bad && final.score > readNum(CH_BEST_KEY)) { write(CH_BEST_KEY, String(final.score)); setChBest(final.score); }
      reportGame(`m2-challenge-${startedAt.current}`, 'merge2048', 'solo', final.score > 0 ? 'win' : 'loss', {
        ...exits, mode: 'challenge', score: final.score, max, moves: final.moves, durationMs: Math.min(CHALLENGE_MS, Date.now() - startedAt.current),
      });
    } else {
      write(SAVE_KEY, '');
      reportGame(`m2-free-${startedAt.current}-${final.moves}`, 'merge2048', 'solo', max >= 2048 ? 'win' : 'loss', { mode: 'free', score: final.score, max, moves: final.moves });
    }
  }, [mode, exitCount]);

  // Out of moves ends the game in both modes; the challenge also ends when its ten minutes are up.
  useEffect(() => {
    if (phase === 'playing' && game?.over) { const id = window.setTimeout(() => finish(game), 650); return () => window.clearTimeout(id); }
  }, [phase, game, finish]);
  const left = endAt ? Math.max(0, endAt - now) : 0;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the challenge clock ran out
    if (mode === 'challenge' && phase === 'playing' && endAt && left === 0 && game) finish(game);
  }, [mode, phase, endAt, left, game, finish]);

  const startChallenge = () => {
    unlockGameAudio();
    startedAt.current = Date.now();
    setGame(newGame(randomSeed())); setWon(false); setToast(null); setVoided(false);
    setNow(Date.now()); setEndAt(Date.now() + CHALLENGE_MS); setPhase('playing');
  };
  const newFree = () => {
    startedAt.current = Date.now();
    const fresh = newGame(randomSeed());
    write(SAVE_KEY, JSON.stringify(fresh));
    setGame(fresh); setUndo(null); setWon(false); setToast(null); setPhase('playing');
  };
  const takeBack = () => { if (!undo || mode !== 'free' || phase !== 'playing') return; setGame(undo); write(SAVE_KEY, JSON.stringify(undo)); setUndo(null); };

  const onDir = useCallback((dir: Dir) => { if (phase === 'playing' && !won) { unlockGameAudio(); step(dir); } }, [phase, won, step]);
  useM2Input(boardRef, onDir, phase === 'playing');
  useEffect(() => { if (mode === 'free' && phase === 'playing' && !startedAt.current) startedAt.current = Date.now(); }, [mode, phase]);

  const max = game ? maxTile(game) : 0;
  const toastOn = toast && now - toast.at < 2400;
  // The toast only needs a fresh clock while it shows.
  useEffect(() => { if (!toast) return; const id = window.setInterval(() => setNow(Date.now()), 300); const stop = window.setTimeout(() => window.clearInterval(id), 2600); return () => { window.clearInterval(id); window.clearTimeout(stop); }; }, [toast]);

  return (
    <div className={SHELL} style={{ ...accentVars(M2_ACCENT, M2_INK), backgroundImage: fog('255, 143, 163') }}>
      <Shards tint="#3a2630" />
      <BoardExitToast warn={exitWarn} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title="2048" subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { setMergeSound(!sound); setSound(!sound); }} className={BTN} aria-label={t('sound')}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
        {mode === 'free' ? <button type="button" onClick={newFree} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
          : phase !== 'intro' && <button type="button" onClick={() => { setPhase('intro'); setEndAt(0); setGame(null); }} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('restart')}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {([['free', Leaf], ['challenge', Timer]] as const).map(([m, Icon]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{t(`mode_${m}`)}</button>
            ))}
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-3 flex items-stretch gap-2">
              <StatBox label={t('score')} value={game?.score ?? 0} accent>
                {view.gained > 0 && <span key={view.key} className="m2-float pointer-events-none absolute -top-2 right-2 font-mono text-xs font-black text-(--accent)">+{view.gained}</span>}
              </StatBox>
              <StatBox label={mode === 'free' ? t('best') : t('bestChallenge')} value={mode === 'free' ? Math.max(best, game?.score ?? 0) : chBest} />
              {mode === 'challenge'
                ? <StatBox label={t('timeLeft')} value={<span className={phase === 'playing' && left < 60_000 ? 'text-[#ff7b71]' : ''}>{clock(phase === 'playing' ? left : CHALLENGE_MS)}</span>} />
                : <StatBox label={t('biggest')} value={max || '—'} />}
            </div>

            {phase === 'intro' && mode === 'challenge' ? (
              <div className="rounded-[16px] border border-white/10 bg-black/30 px-5 py-8 text-center">
                <div className="mx-auto h-20 w-20 m2-breathe"><BlockFace v={2048} /></div>
                <h1 className="mt-4 text-2xl font-black">{t('challengeTitle')}</h1>
                <p className="mx-auto mt-2 max-w-sm break-keep text-sm leading-6 text-white/55">{t('challengeDesc')}</p>
                <p className="mt-4 text-xs font-bold text-white/40">{t('bestScore', { n: chBest })}</p>
                <button type="button" onClick={startChallenge} className={`${BTN_ACCENT} mt-6 w-full max-w-xs py-3.5 text-sm`}><Play size={15} fill="currentColor" />{t('startChallenge')}</button>
                <div className="mx-auto max-w-sm"><BoardExitRule /></div>
              </div>
            ) : game && (
              <M2Board tiles={game.tiles} ghosts={view.ghosts} merged={view.merged} spawned={view.spawned} boardRef={boardRef} dim={phase === 'done'}>
                {toastOn && (
                  <div key={toast!.at} className="bw-result pointer-events-none absolute left-1/2 top-[6%] z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#17201e]/90 py-1.5 pl-1.5 pr-3.5 text-xs font-black text-white shadow-xl">
                    <span className="h-7 w-7"><BlockFace v={toast!.v} happy /></span>{t(toast!.v === 128 ? 'evolve' : toast!.v >= 2048 ? 'toastLegend' : 'toastNew', { n: toast!.v })}
                  </div>
                )}
                {won && phase === 'playing' && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-[10px] bg-[#fbfaf5]/85 p-4 text-center text-[#17201e] backdrop-blur-[2px]">
                    <div className="h-24 w-24 m2-breathe"><BlockFace v={2048} happy /></div>
                    <p className="mt-3 text-2xl font-black">{t('won')}</p>
                    <p className="mt-1 break-keep text-xs text-black/55">{t('wonDesc')}</p>
                    <button type="button" onClick={() => setWon(false)} className="mt-4 rounded-md bg-[#17201e] px-5 py-2.5 text-sm font-black text-white">{t('keepGoing')}</button>
                  </div>
                )}
                {phase === 'done' && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-full max-w-[300px] rounded-[16px] bg-[#17201e]/95 p-5 text-white shadow-2xl">
                      <Trophy size={28} className="mx-auto text-[#ffd23f]" />
                      <p className={`${KICKER} mt-2`}>{mode === 'challenge' && game.over === false ? 'TIME UP' : 'NO MORE MOVES'}</p>
                      <p className="mt-1 text-3xl font-black">{t('points', { n: game.score })}</p>
                      <p className="mt-1 text-xs text-white/55">{t('doneBiggest', { n: max })}</p>
                      {voided && <BoardExitRule voided />}
                      <button type="button" onClick={mode === 'challenge' ? startChallenge : newFree} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('again')}</button>
                    </div>
                  </div>
                )}
              </M2Board>
            )}

            {phase !== 'intro' && (
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="min-w-0 break-keep text-[11px] leading-5 text-white/40">{t('controls')}</p>
                {mode === 'free' && <button type="button" onClick={takeBack} disabled={!undo || phase !== 'playing'} className={`${BTN} shrink-0 disabled:opacity-35`}><Undo2 size={14} />{t('undo')}</button>}
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <BlockCollection best={Math.max(top, max)} title={t('collection')} hint={t('collectionHint')} />
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(['quick1', 'quick2', 'quick3', 'quick4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
    </div>
  );
}
