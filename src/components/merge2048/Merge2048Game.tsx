"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Stone } from '@/components/StoneAvatar';
import { checkNewIcons } from '@/components/IconUnlock';
import { Infinity as InfinityIcon, Leaf, Medal, Play, RotateCcw, Trophy, Undo2, Volume2, VolumeX } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { mergeSoundOn, setMergeSound, unlockGameAudio } from '@/lib/gameAudio';
import { type Dir, type M2State, isState, maxTile, newGame, randomSeed } from '@/lib/merge2048';
import { reportGame } from '@/lib/stats';
import { BlockCollection, BlockFace, M2Board, M2_ACCENT, M2_INK, StatBox, legendKey, useM2Input } from './M2Parts';
import EndlessTop from './EndlessTop';
import Merge2048Result, { type M2Place } from './Merge2048Result';
import { getSupabase } from '@/lib/supabase';
import { useM2Game } from './useM2Game';
import { useFocusPlay } from '@/components/focus/focusStore';

type Mode = 'free' | 'endless';
const SAVE_KEY = 'puzzlthink_2048_free'; // the free game in progress
const BEST_KEY = 'puzzlthink_2048_best'; // best free score
const RUN_KEY = 'puzzlthink_2048_endless'; // the 챌린지 도전 run in progress
const RUN_START_KEY = 'puzzlthink_2048_endless_start';
const RUN_BEST_KEY = 'puzzlthink_2048_endless_best';
const TOP_KEY = 'puzzlthink_2048_top'; // biggest block ever made (for the collection)

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Optional. */ } };
const readNum = (key: string) => Number(read(key)) || 0;
// Old links (?mode=challenge, the former 10-minute challenge) open 챌린지 도전.
const readMode = (): Mode => {
  if (typeof window === 'undefined') return 'free';
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'endless' || m === 'challenge' ? 'endless' : 'free';
};
/** A new 챌린지 도전 board, saved at once so a reload continues it. */
function freshRun(at: number): M2State {
  const fresh = newGame(randomSeed());
  write(RUN_KEY, JSON.stringify(fresh)); write(RUN_START_KEY, String(at));
  return fresh;
}
const loadSaved = (key: string): M2State | null => {
  try { const saved = JSON.parse(read(key) || 'null'); if (isState(saved) && !saved.over) return saved; } catch { /* none */ }
  return null;
};

/**
 * Free play (undo, saved as you go) and 챌린지 도전: one board until no move is left, no undo, the final score goes on
 * the ranking. A 챌린지 도전 run is saved as you go too, so a reload continues it (the spawns come from the saved
 * generator state, so reloading does not reroll anything).
 */
export default function Merge2048Game() {
  const t = useTranslations('Merge2048');
  const [mode, setMode] = useState<Mode>(readMode);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [now, setNow] = useState(() => Date.now());
  const [best, setBest] = useState(0);
  const [runBest, setRunBest] = useState(0);
  const [hasRun, setHasRun] = useState(false); // a 챌린지 도전 run is waiting to be continued
  const [top, setTop] = useState(0);
  const [undo, setUndo] = useState<M2State | null>(null);
  // 전체 모드 while a board is in play. No exit guard: both boards are saved in this browser and pick up again.
  useFocusPlay(phase === 'playing', false);
  const [toast, setToast] = useState<{ v: number; at: number } | null>(null);
  const [won, setWon] = useState(false); // 2048 made this game: the celebration card
  const ti = useTranslations('Icons');
  // The block icons (m2048, m4096 …): 'new' shows the 2048 one on the card, 'signin' asks signed-out players to sign in.
  const [icon2048, setIcon2048] = useState<'new' | 'signin' | null>(null);
  const claimed = useRef(0); // the biggest block already claimed this visit
  const [sound, setSound] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const reported = useRef('');
  const startedAt = useRef(0);
  const [topKey, setTopKey] = useState(0); // refreshes the ranking after a run is recorded
  // The result popup of the board that just ended (closing it leaves the small card on the board).
  const [result, setResult] = useState<{ mode: Mode; score: number; max: number; moves: number; newBest: boolean; place: M2Place | null | 'loading' } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const freeBestBefore = useRef(0); // free-play best when this board began (a new best shows in the result)
  const autoStart = useRef(false); // the result's 챌린지 도전 button: start a run as soon as the mode switches

  const onMoved = useCallback((next: M2State, prev: M2State) => {
    const before = maxTile(prev), after = maxTile(next);
    if (after > before && after >= 64) setToast({ v: after, at: Date.now() });
    if (after >= 2048 && before < 2048) setWon(true);
    if (after > readNum(TOP_KEY)) { write(TOP_KEY, String(after)); setTop(after); }
    if (mode === 'free') {
      write(SAVE_KEY, JSON.stringify(next));
      setUndo(prev);
      if (next.score > readNum(BEST_KEY)) { write(BEST_KEY, String(next.score)); setBest(next.score); }
    } else write(RUN_KEY, JSON.stringify(next));
  }, [mode]);
  const { game, view, step, setGame } = useM2Game(onMoved);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- saved records live in localStorage */
    setBest(readNum(BEST_KEY)); setRunBest(readNum(RUN_BEST_KEY)); setTop(readNum(TOP_KEY)); setSound(mergeSoundOn());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Free play opens straight onto the saved board; 챌린지 도전 waits for its start (or continue) button.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- switching modes resets the board */
    setWon(false); setUndo(null); setToast(null); setResult(null); setResultOpen(false);
    if (mode === 'free') { freeBestBefore.current = readNum(BEST_KEY); setGame(loadSaved(SAVE_KEY) ?? newGame(randomSeed())); setPhase('playing'); }
    else if (autoStart.current) { autoStart.current = false; startedAt.current = Date.now(); setGame(freshRun(startedAt.current)); setHasRun(true); setPhase('playing'); }
    else { setGame(null); setPhase('intro'); setHasRun(!!loadSaved(RUN_KEY)); }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mode, setGame]);

  const switchMode = (m: Mode) => {
    setMode(m);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
  };

  const finish = useCallback((final: M2State) => {
    setPhase('done');
    const key = `${mode}-${startedAt.current}-${final.moves}`;
    if (reported.current === key) return;
    reported.current = key;
    const max = maxTile(final);
    const base = { mode, score: final.score, max, moves: final.moves };
    if (mode === 'endless') {
      write(RUN_KEY, ''); setHasRun(false);
      const newBest = final.score > 0 && final.score > readNum(RUN_BEST_KEY);
      if (newBest) { write(RUN_BEST_KEY, String(final.score)); setRunBest(final.score); }
      setResult({ ...base, newBest, place: 'loading' });
      const runStart = readNum(RUN_START_KEY) || startedAt.current;
      // Save first (signed in), then ask where the score lands, so my own rank already counts this run.
      reportGame(`m2-endless-${runStart}-${final.moves}`, 'merge2048', 'solo', max >= 2048 ? 'win' : 'loss', {
        mode: 'endless', score: final.score, max, moves: final.moves, durationMs: Date.now() - runStart,
      }).catch(() => {}).then(async () => {
        const supabase = getSupabase();
        const { data, error } = supabase ? await supabase.rpc('challenge_place', { p_board: 'merge2048', p_score: final.score }) : { data: null, error: true };
        const row = !error && Array.isArray(data) ? (data[0] as M2Place | undefined) : undefined;
        setResult((r) => (r ? { ...r, place: row ?? null } : r));
        setTopKey((n) => n + 1);
      });
    } else {
      setResult({ ...base, newBest: final.score > 0 && final.score > freeBestBefore.current, place: null });
      write(SAVE_KEY, '');
      reportGame(`m2-free-${startedAt.current}-${final.moves}`, 'merge2048', 'solo', max >= 2048 ? 'win' : 'loss', { mode: 'free', score: final.score, max, moves: final.moves });
    }
    setResultOpen(true);
  }, [mode]);

  // Out of moves ends the game in both modes.
  useEffect(() => {
    if (phase === 'playing' && game?.over) { const id = window.setTimeout(() => finish(game), 900); return () => window.clearTimeout(id); }
  }, [phase, game, finish]);

  const startRun = () => {
    unlockGameAudio();
    startedAt.current = Date.now();
    setGame(freshRun(startedAt.current)); setWon(false); setToast(null); setHasRun(true); setResult(null); setResultOpen(false); setPhase('playing');
  };
  // From the free-play result: switch to 챌린지 도전 and start a run straight away.
  const toChallenge = () => { setResultOpen(false); if (mode === 'endless') startRun(); else { autoStart.current = true; switchMode('endless'); } };
  const continueRun = () => {
    const saved = loadSaved(RUN_KEY);
    if (!saved) { startRun(); return; }
    unlockGameAudio();
    startedAt.current = readNum(RUN_START_KEY) || Date.now();
    setGame(saved); setWon(false); setToast(null); setPhase('playing');
  };
  // Starting over gives up the run in progress (it is not recorded), so it asks first.
  const restartRun = () => { if (phase === 'playing' && game && game.moves > 0 && !window.confirm(t('giveUpConfirm'))) return; startRun(); };
  const newFree = () => {
    startedAt.current = Date.now();
    const fresh = newGame(randomSeed());
    write(SAVE_KEY, JSON.stringify(fresh));
    freeBestBefore.current = readNum(BEST_KEY);
    setGame(fresh); setUndo(null); setWon(false); setToast(null); setResult(null); setResultOpen(false); setPhase('playing');
  };
  const takeBack = () => { if (!undo || mode !== 'free' || phase !== 'playing') return; setGame(undo); write(SAVE_KEY, JSON.stringify(undo)); setUndo(null); };

  const onDir = useCallback((dir: Dir) => { if (phase === 'playing' && !won) { unlockGameAudio(); step(dir); } }, [phase, won, step]);
  useM2Input(boardRef, onDir, phase === 'playing');
  useEffect(() => { if (mode === 'free' && phase === 'playing' && !startedAt.current) startedAt.current = Date.now(); }, [mode, phase]);

  const max = game ? maxTile(game) : 0;
  // Every block from 2048 up is a profile icon: claimed the moment it appears (or when a saved board that has one
  // is opened), and the server gives every tier up to it. A new one pops the "new icon" notice.
  useEffect(() => {
    if (max < 2048 || max <= claimed.current) return;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setIcon2048('signin'); return; }
      if (max <= claimed.current) return;
      claimed.current = max;
      const first = await supabase.rpc('claim_icon_2048', { p_max: max });
      // Before the tiered function is live the server only knows the plain 2048 claim.
      const fresh = first.error ? (await supabase.rpc('claim_icon_2048')).data : first.data;
      if (fresh === true) { setIcon2048('new'); checkNewIcons(900); }
    })();
  }, [max]);
  const toastOn = toast && now - toast.at < 2400;
  // The toast only needs a fresh clock while it shows.
  useEffect(() => { if (!toast) return; const id = window.setInterval(() => setNow(Date.now()), 300); const stop = window.setTimeout(() => window.clearInterval(id), 2600); return () => { window.clearInterval(id); window.clearTimeout(stop); }; }, [toast]);

  return (
    <div className={SHELL} style={{ ...accentVars(M2_ACCENT, M2_INK), backgroundImage: fog('255, 143, 163') }}>
      <Shards tint="#3a2630" />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title="2048" subtitle={t('subtitle')}>
        <GameUpdates game="merge2048" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { setMergeSound(!sound); setSound(!sound); }} className={BTN} aria-label={t('sound')}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
        {mode === 'free' ? <button type="button" onClick={newFree} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
          : phase !== 'intro' && <button type="button" onClick={restartRun} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('restart')}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {([['free', Leaf], ['endless', InfinityIcon]] as const).map(([m, Icon]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{t(`mode_${m}`)}</button>
            ))}
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-3 flex items-stretch gap-2">
              <StatBox label={t('score')} value={game?.score ?? 0} accent>
                {view.gained > 0 && <span key={view.key} className="m2-float pointer-events-none absolute -top-2 right-2 font-mono text-xs font-black text-(--accent)">+{view.gained}</span>}
              </StatBox>
              <StatBox label={mode === 'free' ? t('best') : t('bestEndless')} value={Math.max(mode === 'free' ? best : runBest, game?.score ?? 0)} />
              <StatBox label={t('biggest')} value={max || '—'} />
            </div>

            {phase === 'intro' && mode === 'endless' ? (
              <div className="rounded-[16px] border border-white/10 bg-black/30 px-5 py-8 text-center">
                <div className="mx-auto h-20 w-20 m2-breathe"><BlockFace v={2048} /></div>
                <h1 className="mt-4 text-2xl font-black">{t('endlessTitle')}</h1>
                <p className="mx-auto mt-2 max-w-sm break-keep text-sm leading-6 text-white/55">{t('endlessDesc')}</p>
                <p className="mt-4 text-xs font-bold text-white/40">{t('bestScore', { n: runBest })}</p>
                <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-2">
                  {hasRun && <button type="button" onClick={continueRun} className={`${BTN_ACCENT} w-full py-3.5 text-sm`}><Play size={15} fill="currentColor" />{t('continueRun')}</button>}
                  <button type="button" onClick={hasRun ? () => { if (window.confirm(t('giveUpConfirm'))) startRun(); } : startRun} className={`${hasRun ? BTN : BTN_ACCENT} w-full py-3.5 text-sm`}><InfinityIcon size={15} />{t('startEndless')}</button>
                  <Link href="/ranking/2048" className={`${BTN} w-full py-3 text-sm`}><Medal size={15} />{t('seeRanking')}</Link>
                </div>
              </div>
            ) : game && (
              <M2Board tiles={game.tiles} ghosts={view.ghosts} merged={view.merged} spawned={view.spawned} boardRef={boardRef} dim={phase === 'done'}>
                {toastOn && (
                  <div key={toast!.at} className="bw-result pointer-events-none absolute left-1/2 top-[6%] z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#17201e]/90 py-1.5 pl-1.5 pr-3.5 text-xs font-black text-white shadow-xl">
                    <span className="h-7 w-7"><BlockFace v={toast!.v} happy /></span>{toast!.v >= 2048 ? t('toastLegend', { n: toast!.v, name: t(legendKey(toast!.v)) }) : t(toast!.v === 128 ? 'evolve' : 'toastNew', { n: toast!.v })}
                  </div>
                )}
                {won && phase === 'playing' && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-[10px] bg-[#fbfaf5]/85 p-4 text-center text-[#17201e] backdrop-blur-[2px]">
                    <div className="h-24 w-24 m2-breathe"><BlockFace v={2048} happy /></div>
                    <p className="mt-3 text-2xl font-black">{t('won')}</p>
                    <p className="mt-1 break-keep text-xs text-black/55">{t('wonDesc')}</p>
                    {icon2048 && (
                      <p className={`mt-3 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-black ${icon2048 === 'new' ? 'bg-[#17201e] text-[#ffd36e]' : 'border border-black/10 bg-white text-black/60'}`}>
                        <Stone name="2048" size={26} icon="m2048" />{icon2048 === 'new' ? ti('won2048', { n: 2048 }) : ti('won2048SignIn')}
                      </p>
                    )}
                    <button type="button" onClick={() => setWon(false)} className="mt-4 rounded-md bg-[#17201e] px-5 py-2.5 text-sm font-black text-white">{t('keepGoing')}</button>
                  </div>
                )}
                {phase === 'done' && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-full max-w-[300px] rounded-[16px] bg-[#17201e]/95 p-5 text-white shadow-2xl">
                      <Trophy size={28} className="mx-auto text-[#ffd23f]" />
                      <p className={`${KICKER} mt-2`}>NO MORE MOVES</p>
                      <p className="mt-1 text-3xl font-black">{t('points', { n: game.score })}</p>
                      <p className="mt-1 text-xs text-white/55">{t('doneBiggest', { n: max })}</p>
                      {mode === 'endless' && result?.place && result.place !== 'loading' && <p className="mt-2 text-sm font-black text-[#ffd36e]">{t('placeN', { n: result.place.place })} <span className="text-xs font-bold text-white/45">{t('placeOf', { n: Math.max(result.place.players, result.place.place) })}</span></p>}
                      <button type="button" onClick={mode === 'endless' ? startRun : newFree} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('again')}</button>
                      {result && <button type="button" onClick={() => setResultOpen(true)} className={`${BTN} mt-2 w-full py-2.5`}><Trophy size={14} />{t('showResult')}</button>}
                      {mode === 'endless' && <Link href="/ranking/2048" className={`${BTN} mt-2 w-full py-2.5`}><Medal size={14} />{t('seeRanking')}</Link>}
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

        <aside data-focus-hide={phase === 'playing' ? '' : undefined} className="flex flex-col gap-4">
          {mode === 'endless' && <EndlessTop refresh={topKey} />}
          <BlockCollection best={Math.max(top, max)} title={t('collection')} hint={t('collectionHint')} />
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(['quick1', 'quick2', 'quick3', 'quick4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
      {result && resultOpen && (
        <Merge2048Result {...result} mode={result.mode} onClose={() => setResultOpen(false)}
          onAgain={result.mode === 'endless' ? startRun : newFree} onChallenge={toChallenge} />
      )}
    </div>
  );
}
