"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Eye, Flag, Hexagon, RotateCcw, SkipForward, Timer, Trophy, Tv, Shuffle, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { CHALLENGE_MS, IDLE_MS, MEMORIZE_MS, ROUNDS, type HexRound, broadcastRounds, generateRound, lineOf } from '@/lib/hexagon';
import { reportGame } from '@/lib/stats';
import { BoardExitRule, BoardExitToast, exitDetail, useBoardExits } from '@/hooks/useBoardExits';
import { HEX_ACCENT, HEX_INK, HexBoardView, type TileMark, TargetPlate, TimeBar, revealMarks, togglePick, useLetterKeys } from './HexParts';

type Mode = 'solo' | 'challenge';
type Source = 'random' | 'broadcast';
type Phase = 'intro' | 'memorize' | 'recall' | 'reveal' | 'summary';
type Played = { round: HexRound; found: string[]; wrong: number };
type Flash = { ok: boolean; text: string; at: number } | null;
const BEST_KEY = 'puzzlthink_hexagon_best'; // best 10-minute challenge score

const readMode = (): Mode => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'challenge' ? 'challenge' : 'solo');
const readBest = (): number => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export default function HexagonGame() {
  const t = useTranslations('Hexagon');
  const [mode, setMode] = useState<Mode>(readMode);
  const [source, setSource] = useState<Source>('random');
  const [phase, setPhase] = useState<Phase>('intro');
  const [plan, setPlan] = useState<HexRound[]>([]); // solo: the ten boards for this game
  const [round, setRound] = useState<HexRound | null>(null);
  const [index, setIndex] = useState(0);
  const [phaseAt, setPhaseAt] = useState(0); // memorize start, or last declaration while recalling
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [pick, setPick] = useState('');
  const [played, setPlayed] = useState<Played[]>([]);
  const [challengeEnd, setChallengeEnd] = useState(0);
  const [voided, setVoided] = useState(false); // left the board too often: this challenge isn't ranked
  const { exits: exitCount, warn: exitWarn } = useBoardExits(mode === 'challenge' && challengeEnd > 0);
  const [flash, setFlash] = useState<Flash>(null);
  const [focus, setFocus] = useState<string | null>(null); // answer screen: one line picked out
  const [best, setBest] = useState(readBest);
  const [now, setNow] = useState(() => Date.now());
  const reported = useRef('');

  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(timer); }, []);

  const score = played.reduce((s, p) => s + p.found.length - p.wrong, 0) + (phase === 'recall' || phase === 'memorize' ? found.length - wrong : 0);

  const beginRound = (next: HexRound, i: number) => {
    setRound(next); setIndex(i); setPhase('memorize'); setPhaseAt(Date.now());
    setFound([]); setWrong(0); setPick(''); setFlash(null); setFocus(null);
  };

  const start = (m: Mode = mode, s: Source = source) => {
    const rounds = m === 'solo' && s === 'broadcast' ? broadcastRounds() : m === 'solo' ? Array.from({ length: ROUNDS }, () => generateRound()) : [];
    setPlan(rounds); setPlayed([]); setVoided(false); reported.current = '';
    setChallengeEnd(m === 'challenge' ? Date.now() + CHALLENGE_MS : 0);
    beginRound(m === 'solo' ? rounds[0] : generateRound(), 0);
  };

  const switchMode = (m: Mode) => {
    setMode(m); setPhase('intro'); setRound(null); setPlayed([]); setChallengeEnd(0);
    const url = new URL(window.location.href); url.searchParams.set('mode', m); window.history.replaceState(null, '', url);
  };

  const finish = useCallback((list: Played[]) => {
    setPhase('summary'); setChallengeEnd(0);
    const key = `${mode}-${list.length}-${list[0]?.round.id ?? ''}`;
    if (reported.current === key) return;
    reported.current = key;
    const total = list.reduce((s, p) => s + p.found.length - p.wrong, 0);
    const foundN = list.reduce((s, p) => s + p.found.length, 0);
    const exits = mode === 'challenge' ? exitDetail(exitCount()) : {};
    setVoided('voided' in exits);
    if (mode === 'challenge' && total > best && !('voided' in exits)) { setBest(total); try { localStorage.setItem(BEST_KEY, String(total)); } catch { /* optional */ } }
    reportGame(`hexagon-solo-${Date.now()}`, 'hexagon', 'solo', total > 0 ? 'win' : 'loss', {
      ...exits, mode, source: mode === 'solo' ? source : 'random', score: total, found: foundN, wrong: list.reduce((s, p) => s + p.wrong, 0),
      answers: list.reduce((s, p) => s + p.round.answers.length, 0), rounds: list.length,
    });
  }, [mode, source, best, exitCount]);

  const toReveal = useCallback(() => {
    if (!round) return;
    setPhase('reveal'); setPick('');
    setPlayed((list) => [...list, { round, found, wrong }]);
  }, [round, found, wrong]);

  const toRecall = () => { setPhase('recall'); setPhaseAt(Date.now()); };

  const next = () => {
    if (mode === 'solo') {
      if (index + 1 >= plan.length) { finish(played); return; }
      beginRound(plan[index + 1], index + 1);
    } else beginRound(generateRound(), index + 1);
  };

  // Clocks: 30 s to memorize, 90 s without a declaration ends the round, 10 minutes for the challenge.
  const memoLeft = phase === 'memorize' ? Math.max(0, MEMORIZE_MS - (now - phaseAt)) : 0;
  const idleLeft = phase === 'recall' ? Math.max(0, IDLE_MS - (now - phaseAt)) : 0;
  const challengeLeft = challengeEnd ? Math.max(0, challengeEnd - now) : 0;
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- these move the round on when a clock runs out */
    if (phase === 'memorize' && memoLeft === 0) toRecall();
    else if (phase === 'recall' && idleLeft === 0) toReveal();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [phase, memoLeft, idleLeft]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!challengeEnd || challengeLeft > 0) return;
    // Time is up mid-round: what was found so far still counts.
    const list = phase === 'memorize' || phase === 'recall' ? [...played, ...(round ? [{ round, found, wrong }] : [])] : played;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ends the challenge when its clock reaches zero
    setPlayed(list); finish(list);
  }, [challengeEnd, challengeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = (ok: boolean, text: string) => setFlash({ ok, text, at: Date.now() });
  const declare = useCallback(() => {
    if (phase !== 'recall' || !round) return;
    const line = lineOf(pick);
    if (!line) { say(false, t('notLine')); return; }
    setPick(''); setPhaseAt(Date.now());
    if (found.includes(line)) { setWrong((n) => n + 1); say(false, t('dupWrong', { line })); return; }
    if (!round.answers.includes(line)) { setWrong((n) => n + 1); say(false, t('declWrong', { line })); return; }
    const list = [...found, line];
    setFound(list); say(true, t('declRight', { line }));
    if (list.length === round.answers.length) {
      setPhase('reveal');
      setPlayed((p) => [...p, { round, found: list, wrong }]);
    }
  }, [phase, round, pick, found, wrong, t]);
  const tap = useCallback((letter: string) => setPick((p) => togglePick(p, letter)), []);
  const clear = useCallback(() => setPick(''), []);
  useLetterKeys(phase === 'recall', tap, declare, clear);

  const marks: Record<string, TileMark> = phase === 'recall' ? Object.fromEntries([...pick].map((ch) => [ch, 'pick'])) as Record<string, TileMark>
    : phase === 'reveal' && round ? (focus ? Object.fromEntries([...focus].map((ch) => [ch, found.includes(focus) ? 'found' : 'missed'])) as Record<string, TileMark> : revealMarks(round.answers, found)) : {};
  const pickLine = lineOf(pick);
  const flashOn = flash && now - flash.at < 2200;
  const totalRounds = mode === 'solo' ? plan.length : null;
  const heading = phase === 'memorize' ? t('memorizeHeading') : phase === 'recall' ? t('recallHeading')
    : phase === 'reveal' ? (round && found.length === round.answers.length ? t('allFound') : t('roundOver', { found: found.length, total: round?.answers.length ?? 0 })) : '';
  const totals = { found: played.reduce((s, p) => s + p.found.length, 0), wrong: played.reduce((s, p) => s + p.wrong, 0), answers: played.reduce((s, p) => s + p.round.answers.length, 0) };

  return (
    <div className={SHELL} style={{ ...accentVars(HEX_ACCENT, HEX_INK), backgroundImage: fog('200, 150, 60') }}>
      <Shards tint="#3a2f1a" />
      <BoardExitToast warn={exitWarn} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        {phase !== 'intro' && <button type="button" onClick={() => switchMode(mode)} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('restart')}</span></button>}
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {([['solo', Hexagon], ['challenge', Timer]] as const).map(([m, Icon]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(mode === m)}`}><Icon size={14} />{t(`mode_${m}`)}</button>
            ))}
          </div>

          {phase === 'intro' && (
            <div className="mx-auto max-w-md py-8 text-center">
              {mode === 'solo' ? <Hexagon size={36} className="mx-auto text-(--accent)" /> : <Timer size={36} className="mx-auto text-(--accent)" />}
              <h1 className="mt-4 text-2xl font-black">{t(mode === 'solo' ? 'soloTitle' : 'challengeTitle')}</h1>
              <p className="mt-2 break-keep text-sm leading-6 text-white/55">{t(mode === 'solo' ? 'soloDesc' : 'challengeDesc')}</p>
              {mode === 'solo' && (
                <div className="mt-5 grid grid-cols-2 gap-1.5">
                  <button type="button" onClick={() => setSource('random')} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(source === 'random')}`}><Shuffle size={14} />{t('sourceRandom')}</button>
                  <button type="button" onClick={() => setSource('broadcast')} className={`flex items-center justify-center gap-1.5 py-2.5 ${seg(source === 'broadcast')}`}><Tv size={14} />{t('sourceBroadcast')}</button>
                </div>
              )}
              {mode === 'challenge' && <p className="mt-4 text-xs font-bold text-white/40">{t('bestScore', { n: best })}</p>}
              <button type="button" onClick={() => start()} className={`${BTN_ACCENT} mt-6 w-full py-3.5 text-sm`}><Hexagon size={16} />{t(mode === 'solo' ? 'startSolo' : 'startChallenge')}</button>
              {mode === 'challenge' && <BoardExitRule />}
            </div>
          )}

          {phase === 'summary' && (
            <div className="mx-auto max-w-lg py-6">
              {voided && <BoardExitRule voided />}
              <div className="text-center"><Trophy size={34} className="mx-auto text-[#ffcf3f]" /><p className={`${KICKER} mt-3`}>{mode === 'challenge' ? t('timeUp') : t('gameOver')}</p><h1 className="mt-1 text-3xl font-black">{t('summaryScore', { n: score })}</h1></div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[[t('statFound'), `${totals.found}/${totals.answers}`], [t('statWrong'), String(totals.wrong)], [t('statRounds'), String(played.length)]].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] border border-white/10 bg-black/40 p-3"><p className="text-[10px] font-black tracking-widest text-white/35">{label}</p><p className="mt-1 font-mono text-xl font-black">{value}</p></div>
                ))}
              </div>
              {mode === 'challenge' && <p className="mt-3 text-center text-xs text-white/40">{t('bestScore', { n: best })}</p>}
              <ul className="mt-4 space-y-1.5">{played.map((p, i) => (
                <li key={p.round.id + i} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-white/45">R{i + 1} · {t('targetShort', { n: p.round.target })}</span>
                  <span className="min-w-0 flex-1 truncate text-right text-white/60">{p.round.answers.map((a) => (p.found.includes(a) ? `✓${a}` : a)).join(' ')}</span>
                  <span className={`w-10 text-right font-mono font-black ${p.found.length - p.wrong > 0 ? 'text-[#7ee2ae]' : p.found.length - p.wrong < 0 ? 'text-[#ff9b94]' : 'text-white/40'}`}>{p.found.length - p.wrong > 0 ? '+' : ''}{p.found.length - p.wrong}</span>
                </li>
              ))}</ul>
              <button type="button" onClick={() => start()} className={`${BTN_ACCENT} mt-5 w-full py-3`}><RotateCcw size={14} />{t('again')}</button>
            </div>
          )}

          {round && (phase === 'memorize' || phase === 'recall' || phase === 'reveal') && (
            <>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={KICKER}>{round.broadcast ? t('broadcastKicker', { n: round.broadcast }) : totalRounds ? t('roundKicker', { n: index + 1, total: totalRounds }) : t('challengeKicker', { n: index + 1 })}</p>
                  <h1 className="mt-1 break-keep text-base font-extrabold leading-6 text-[#eef1f7] sm:text-lg">{heading}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-white/55">
                    <span className="font-black text-(--accent)">{t('scoreNow', { n: score })}</span>
                    {mode === 'challenge' && <span className={`flex items-center gap-1 font-black ${challengeLeft < 60_000 ? 'text-[#ff7b71]' : 'text-white/70'}`}><Timer size={13} />{clock(challengeLeft)}</span>}
                  </p>
                </div>
                <TargetPlate target={round.target} hidden={phase === 'memorize'} />
              </div>

              {phase === 'memorize' && <div className="mb-3 space-y-1"><TimeBar left={memoLeft} total={MEMORIZE_MS} /><p className="text-center font-mono text-xs font-black text-(--accent)">{t('memorizeLeft', { s: Math.ceil(memoLeft / 1000) })}</p></div>}
              {phase === 'recall' && <div className="mb-3 space-y-1"><TimeBar left={idleLeft} total={IDLE_MS} color="rgba(255,255,255,.35)" /><p className="text-center text-[11px] text-white/40">{t('idleLeft', { s: Math.ceil(idleLeft / 1000) })}</p></div>}

              <div className={`rounded-[12px] p-1 transition sm:p-3 ${flashOn ? (flash!.ok ? 'bg-[#34c47c]/12 ring-2 ring-[#34c47c]/50' : 'bg-[#ff5d5d]/10 ring-2 ring-[#ff5d5d]/50') : ''}`}>
                <HexBoardView numbers={round.numbers} front={phase !== 'recall'} marks={marks} onTap={tap} disabled={phase !== 'recall'} fitHeight />
              </div>

              <div className="mx-auto mt-3 max-w-md space-y-2">
                {flashOn && <p className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-black ${flash!.ok ? 'bg-[#34c47c]/15 text-[#7ee2ae]' : 'bg-[#ff5d5d]/12 text-[#ff9b94]'}`}>{flash!.ok ? <Check size={15} /> : <X size={15} />}{flash!.text}</p>}

                {phase === 'memorize' && <button type="button" onClick={toRecall} className={`${BTN} w-full py-3`}><Eye size={14} />{t('memorized')}</button>}

                {phase === 'recall' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-md border border-white/15 bg-black/50 font-mono text-2xl font-black tracking-[0.3em]">
                        {pick ? pick : <span className="text-sm font-bold tracking-normal text-white/35">{t('pickHint')}</span>}
                      </div>
                      <button type="button" onClick={declare} disabled={!pickLine} className={`${BTN_ACCENT} h-12 px-5 text-sm`}>{t('declare')}</button>
                    </div>
                    {pick.length === 3 && !pickLine && <p className="text-center text-[11px] font-bold text-[#ff9b94]">{t('notLine')}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={clear} disabled={!pick} className={`flex-1 py-2.5 ${BTN} disabled:opacity-40`}><X size={14} />{t('clear')}</button>
                      <button type="button" onClick={toReveal} className={`flex-1 py-2.5 ${BTN}`}><Flag size={14} />{t('endRound')}</button>
                    </div>
                    <p className="hidden text-center text-[10px] text-white/30 lg:block">{t('keysHint')}</p>
                  </>
                )}

                {phase === 'reveal' && (
                  <>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {round.answers.map((line) => (
                        <button key={line} type="button" onClick={() => setFocus(focus === line ? null : line)} className={`rounded-md px-2.5 py-1.5 font-mono text-sm font-black transition ${found.includes(line) ? 'bg-[#34c47c]/20 text-[#7ee2ae]' : 'bg-[#ffcf3f]/15 text-[#ffd96b]'} ${focus === line ? 'ring-2 ring-white/70' : ''}`}>
                          {found.includes(line) ? '✓ ' : ''}{line}
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-[11px] text-white/45">{t('revealLegend', { wrong })}</p>
                    <button type="button" onClick={next} className={`${BTN_ACCENT} w-full py-3`}><SkipForward size={14} />{mode === 'solo' && index + 1 >= plan.length ? t('seeResult') : t('nextRound')}</button>
                  </>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('session')}</p><span className="font-mono text-[11px] text-white/45">{t('scoreNow', { n: score })}</span></div>
            {played.length === 0 ? <p className="mt-3 text-xs text-white/40">{t('noRoundsYet')}</p> : (
              <ul className="mt-3 space-y-1.5">{[...played].reverse().slice(0, 8).map((p, i) => (
                <li key={`${p.round.id}-${i}`} className="flex items-center justify-between rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="text-white/60">{t('historyLine', { target: p.round.target, found: p.found.length, total: p.round.answers.length })}</span>
                  <span className="font-mono text-white/45">{p.wrong ? t('wrongN', { n: p.wrong }) : ''}</span>
                </li>
              ))}</ul>
            )}
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
