"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Copy, Crown, Loader2, Lock, RotateCcw, Share2, Swords, Timer, Trophy, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, playerRow, seg } from '@/components/ui/gameUi';
import { useEquationSignalRoom } from '@/hooks/useEquationSignalRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { glyph, keyMarks, type Mark } from '@/lib/equationSignal';
import { EQS_MAX_GUESSES, EQS_MAX_PLAYERS, EQS_MIN_PLAYERS, EQS_ROUND_OPTIONS, EQS_TIME_OPTIONS, canGuess, eqsRanking, placePoints } from '@/lib/equationSignalRoom';
import { reportGame } from '@/lib/stats';
import { SignalKeypad, SignalLegend, SignalRow, useDraft, useSignalKeys } from './SignalParts';
import { EQS_ACCENT, EQS_ROOT_STYLE, eqsCopy } from './copy';

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
const pretty = (text: string) => [...text].map(glyph).join(' ');

export default function EquationSignalRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const c = eqsCopy(locale);
  const [defaultName] = useState(() => `${c.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useEquationSignalRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  // What this browser typed this round: guests get only colours back while the round is on.
  const [mine, setMine] = useState<{ key: string; list: string[] }>({ key: '', list: [] });
  const [seenAt, setSeenAt] = useState({ key: '', at: 0 });
  const draft = useDraft();
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/equation-signal/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const phase = state?.phase;
  const roundKey = state ? `${state.sid}-${state.index}` : '';
  // Timers run on this browser's clock from when the round arrived here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this round arrived here
    if (phase === 'play' && roundKey !== seenAt.key) { setSeenAt({ key: roundKey, at: Date.now() }); draft.clear(); }
  }, [phase, roundKey, seenAt.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const myRows = state && mySeat !== null ? state.rows[mySeat] : [];
  const myTexts = mine.key === roundKey ? mine.list : [];
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [myRows.length]);

  // Record each finished game once per player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || !state.players.includes(mySeat)) return;
    const ranking = eqsRanking(state);
    const top = state.scores[ranking[0]];
    const tied = ranking.filter((s) => state.scores[s] === top).length;
    const result = state.scores[mySeat] !== top ? 'loss' : tied === 1 ? 'win' : 'draw';
    reportGame(`equation_signal-friend-${state.sid}`, 'equation_signal', 'friend', result,
      { rank: ranking.indexOf(mySeat) + 1, players: state.players.length, score: state.scores[mySeat], rounds: state.history.length });
  }, [state, mySeat]);

  const guessing = !!state && mySeat !== null && canGuess(state, mySeat);
  const submit = useCallback(() => {
    if (!guessing || !draft.full) return;
    setMine((m) => ({ key: roundKey, list: [...(m.key === roundKey ? m.list : []), draft.text] }));
    dispatch({ t: 'guess', text: draft.text });
    draft.clear();
  }, [guessing, draft, roundKey, dispatch]);
  const { setCursor } = draft;
  const move = useCallback((delta: number) => setCursor((i) => i + delta), [setCursor]);
  useSignalKeys(guessing, draft.type, draft.back, submit, move);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: c.title, text: c.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };

  const notice = status === 'unconfigured' ? c.unconfigured : status === 'error' ? c.connectionError : !state && waitedLong ? c.roomNotFound : state && !me?.isHost && !hostOnline ? c.hostOffline : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? c.emptySeat;
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const inGame = !!state && mySeat !== null && state.players.includes(mySeat);
  const live = phase === 'play' || phase === 'reveal';
  const timeLeft = state && phase === 'play' ? Math.max(0, state.roundSec * 1000 - (now - (seenAt.key === roundKey ? seenAt.at : now))) : 0;
  const myPlace = state && mySeat !== null ? state.places.indexOf(mySeat) + 1 : 0;
  const shown = myRows.map((row, i) => ({ guess: row.g || myTexts[i] || '', marks: [...row.m] as Mark[] }));
  const heading = !state ? '' : phase === 'lobby' ? c.lobbyTitle : phase === 'finished' ? c.finished : phase === 'reveal' ? c.revealHeading : c.playHeading;
  const ranking = state ? eqsRanking(state) : [];
  const top = state && ranking.length ? state.scores[ranking[0]] : 0;
  const lastRound = phase === 'reveal' ? state!.history.at(-1) : null;

  return (
    <div className={SHELL} style={EQS_ROOT_STYLE}>
      <Shards tint="#26301a" />
      <RoomAlerts alerts={alerts} accent={EQS_ACCENT} joinText={c.joined} leaveText={c.left} />
      <GameHeader backHref="/equation-signal" backLabel={c.back} title={c.title} titleClass="font-black" subtitle={`ONLINE · ${seated}/${EQS_MAX_PLAYERS} · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{c.connecting}</p> : <Link href="/equation-signal" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{c.backToGame}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={KICKER}>{phase === 'lobby' ? 'LOBBY' : phase === 'finished' ? 'RESULT' : c.roundKicker(state.index + 1, state.rounds)}</p>
                <h1 className={`mt-1 break-keep ${HEADING}`}>{heading}</h1>
              </div>
              {phase === 'play' && <span className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-sm font-black ${timeLeft < 20_000 ? 'bg-[#e5484d]/20 text-[#ff9b94]' : 'bg-white/10 text-white/80'}`}><Timer size={14} />{clock(timeLeft)}</span>}
            </div>

            {phase === 'lobby' && (
              <div className="mx-auto max-w-[480px] space-y-4 py-2">
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{c.inviteTitle}</p>
                  <p className="mt-2 text-sm text-white/55">{c.inviteDesc}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? c.copied : c.copy}</button>
                    <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{c.share}</button>
                  </div>
                </div>
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{c.roundCount}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">{EQS_ROUND_OPTIONS.map((n) => <button key={n} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', rounds: n })} className={`py-2 ${seg(state.rounds === n)} disabled:cursor-default`}>{c.rounds(n)}</button>)}</div>
                  <p className={`${PANEL_TITLE} mt-4`}>{c.roundTime}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{EQS_TIME_OPTIONS.map((s) => <button key={s} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', roundSec: s })} className={`py-2 ${seg(state.roundSec === s)} disabled:cursor-default`}>{c.minutes(s / 60)}</button>)}</div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{c.hostSets}</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={c.nickname} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{c.rename}</button>
                </form>
                {me?.isHost ? (
                  <button onClick={() => dispatch({ t: 'start' })} disabled={seated < EQS_MIN_PLAYERS} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= EQS_MIN_PLAYERS ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                    {seated >= EQS_MIN_PLAYERS ? <Swords size={16} /> : <Lock size={15} />}{seated >= EQS_MIN_PLAYERS ? c.start(seated) : c.needPlayers}
                  </button>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? c.roomFull : c.waitingHost}</p>}
              </div>
            )}

            {phase === 'play' && (
              <div className="mx-auto max-w-[460px]">
                {inGame ? (
                  <>
                    <div ref={listRef} className="max-h-[36svh] space-y-1 overflow-y-auto pr-0.5 sm:space-y-1.5">
                      {shown.map((row, i) => <SignalRow key={i} text={row.guess} marks={row.marks} pop={i === shown.length - 1} />)}
                      {guessing && <SignalRow text={draft.cells} cursor={draft.cursor} onCell={draft.setCursor} />}
                    </div>
                    <div className="mt-3 space-y-2">
                      {myPlace > 0 ? <p className="rounded-md bg-[#2fbf71]/15 py-2.5 text-center text-sm font-black text-[#7ee2ae]">{c.solvedWait(myPlace)}</p>
                        : !guessing ? <p className="rounded-md bg-white/5 py-2.5 text-center text-sm font-bold text-white/55">{c.outOfGuesses}</p> : (
                          <>
                            <div className="flex items-center justify-between"><SignalLegend g={c.legendG} y={c.legendY} r={c.legendR} /><span className="shrink-0 font-mono text-[10px] font-bold text-white/40">{c.guessesLeft(EQS_MAX_GUESSES - myRows.length)}</span></div>
                            <SignalKeypad marks={keyMarks(shown.filter((r) => r.guess))} onSymbol={draft.type} onBack={draft.back} onEnter={submit} canEnter={draft.full} enterLabel={c.submit} />
                          </>
                        )}
                    </div>
                  </>
                ) : <p className="py-10 text-center text-sm text-white/50">{c.spectating}</p>}
              </div>
            )}

            {phase === 'reveal' && lastRound && (
              <div className="mx-auto max-w-[460px] py-2">
                <div className="rounded-[12px] border border-(--accent)/40 bg-(--accent)/[0.07] p-4 text-center">
                  <p className={KICKER}>{c.answerWas}</p>
                  <p className="mt-1 font-mono text-3xl font-black tracking-wide">{pretty(lastRound.answer)}</p>
                </div>
                <ul className="mt-3 space-y-1.5">{state.players.map((seat) => {
                  const place = lastRound.places.indexOf(seat) + 1;
                  return (
                    <li key={seat} className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-black/30 px-3 py-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-black">{name(seat)}{seat === mySeat ? ` (${c.me})` : ''}</span>
                      <span className={`text-xs font-bold ${place ? 'text-[#7ee2ae]' : 'text-white/35'}`}>{place ? `${c.place(place)} · ${c.historyLine(lastRound.guesses[seat])}` : c.notSolved}</span>
                      <span className="w-8 text-right font-mono text-sm font-black text-(--accent)">{place ? c.plus(placePoints(place, state.players.length)) : ''}</span>
                    </li>
                  );
                })}</ul>
                <p className="mt-3 text-center text-[11px] text-white/45">{c.nextSoon}</p>
              </div>
            )}

            {phase === 'finished' && (
              <div className="mx-auto max-w-md py-4">
                <Trophy size={34} className="mx-auto text-[#ffcf3f]" />
                <ol className="mt-4 space-y-2">{ranking.map((seat) => {
                  const rank = ranking.findIndex((s) => state.scores[s] === state.scores[seat]) + 1;
                  return (
                    <li key={seat} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${state.scores[seat] === top ? 'border-[#ffcf3f]/50 bg-[#ffcf3f]/10' : 'border-white/10 bg-black/30'}`}>
                      <span className="w-6 text-center font-mono text-sm font-black text-(--accent)">{rank}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-black">{name(seat)}{seat === mySeat ? ` (${c.me})` : ''}</span>
                      <span className="font-mono text-sm font-black">{c.points(state.scores[seat])}</span>
                    </li>
                  );
                })}</ol>
                <ul className="mt-4 space-y-1.5">{state.history.map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                    <span className="font-mono text-white/45">R{i + 1}</span>
                    <span className="font-mono text-white/75">{pretty(h.answer)}</span>
                    <span className="min-w-0 truncate text-right text-white/55">{h.places.length ? h.places.map((s) => name(s)).join(' › ') : c.notSolved}</span>
                  </li>
                ))}</ul>
                {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{c.rematch}</button> : <p className="mt-4 text-center text-xs text-white/45">{c.rematchWait}</p>}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{c.players}</h2><span className={CHIP}><Users size={12} />{seated}/{EQS_MAX_PLAYERS}</span></div>
              <div className="space-y-2">
                {state.seats.map((seat, i) => {
                  if (!seat && phase !== 'lobby') return null;
                  const place = live ? state.places.indexOf(i) + 1 : 0;
                  const rows = live && i !== mySeat ? state.rows[i] : [];
                  return (
                    <div key={i} data-chat-seat={seat?.id} className={`${playerRow(place > 0)} ${seat ? '' : 'opacity-40'} flex-wrap`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-black ${place ? 'bg-[#2fbf71] text-white' : 'bg-white/10 text-white/60'}`}>{place ? <Check size={15} /> : i + 1}</span>
                      <div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 truncate text-sm font-extrabold">{seat ? name(i) : c.emptySeat}{seat?.id === me?.id ? ` (${c.me})` : ''}{i === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}</p></div>
                      {phase !== 'lobby' && seat && <span className="font-mono text-lg font-black text-(--accent)">{state.scores[i]}</span>}
                      {rows.length > 0 && <div className="w-full space-y-[2px] pt-1">{rows.slice(-6).map((row, r) => <SignalRow key={r} text={row.g} marks={row.m} small />)}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
              <p className={PANEL_TITLE}>{c.rulesTitle}</p>
              <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{c.roomRules.map((line, i) => <li key={line} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      )}
    </div>
  );
}
