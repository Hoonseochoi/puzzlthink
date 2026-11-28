"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Copy, Crown, Dices, Loader2, Lock, PenLine, Share2, Swords, Timer, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResultActions from '@/components/ResultActions';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, RESULT_PRIMARY, SHELL, STAGE } from '@/components/ui/gameUi';
import type { EqsRoomHook } from '@/hooks/useEquationSignalRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { generateEquation, glyph, isEquation, keyMarks, markGuess, type Mark } from '@/lib/equationSignal';
import { DUEL_MAX_GUESSES, type DuelRoom, duelCanGuess, duelCommit, duelDone } from '@/lib/equationSignalDuel';
import { reportGame } from '@/lib/stats';
import { SignalKeypad, SignalLegend, SignalRow, useDraft, useSignalKeys } from './SignalParts';
import { EQS_ACCENT, EQS_ROOT_STYLE, eqsCopy, eqsDuelCopy } from './copy';

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
const pretty = (text: string) => [...text].map(glyph).join(' ');

/**
 * What this browser keeps about its own puzzle for one match (`sid`): when the writing clock started here, and once
 * written, the equation and its salt. Saved so a refresh does not lose it; it is sent to nobody before the reveal.
 */
type Secret = { sid: string; at: number; solveAt?: number; eq?: string; salt?: string; auto?: boolean };
const secretKey = (code: string) => `puzzlthink_eqs_duel_${code}`;
const readSecret = (code: string): Secret | null => { try { return JSON.parse(localStorage.getItem(secretKey(code)) || 'null'); } catch { return null; } };
const randomSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

export default function EquationSignalDuelView({ code, room }: { code: string; room: EqsRoomHook }) {
  const locale = useLocale();
  const c = eqsCopy(locale);
  const d = eqsDuelCopy(locale);
  const { status, peers, hostOnline, me, mySeat, dispatch, rename } = room;
  const state = room.state as DuelRoom;
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  // A duel view only renders once the room state has arrived (never on the server), so localStorage is there.
  const [secret, setSecretState] = useState<Secret | null>(() => readSecret(code));
  const draft = useDraft();
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');
  const listRef = useRef<HTMLDivElement>(null);
  const sent = useRef(new Map<string, number>()); // action key → when this browser last sent it (retries)

  const saveSecret = useCallback((next: Secret) => {
    setSecretState(next);
    try { localStorage.setItem(secretKey(code), JSON.stringify(next)); } catch { /* storage is optional */ }
  }, [code]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/equation-signal/room/${code}`);
    return () => window.clearInterval(tick);
  }, [code, locale]);

  const { phase, sid } = state;
  const inGame = mySeat !== null;
  const opp = mySeat === null ? 1 : 1 - mySeat;
  const mine = secret?.sid === sid ? secret : null;

  // Clocks run on this browser's clock from when each step arrived here (the host's own deadlines add a grace).
  useEffect(() => {
    if (!inGame) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this step arrived here (kept in localStorage)
    if (phase === 'write' && !mine) { saveSecret({ sid, at: Date.now() }); draft.clear(); }
    else if (phase === 'solve' && mine && !mine.solveAt) { saveSecret({ ...mine, solveAt: Date.now() }); draft.clear(); }
  }, [phase, sid, mine, inGame, saveSecret]); // eslint-disable-line react-hooks/exhaustive-deps

  const writeLeft = phase === 'write' && mine ? Math.max(0, state.writeSec * 1000 - (now - mine.at)) : 0;
  const solveLeft = phase === 'solve' ? Math.max(0, state.solveSec * 1000 - (now - (mine?.solveAt ?? now))) : 0;

  const commit = useCallback((eq: string, auto: boolean) => {
    if (!mine || mine.eq) return;
    const salt = randomSalt();
    saveSecret({ ...mine, eq, salt, auto });
    dispatch({ t: 'commit', hash: duelCommit(sid, salt, eq), auto });
  }, [mine, sid, saveSecret, dispatch]);

  // The writing clock ran out here: a random equation, from the same generator as solo play.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock is the external event here
    if (phase === 'write' && inGame && mine && !mine.eq && writeLeft <= 0) commit(generateEquation(), true);
  }, [phase, inGame, mine, writeLeft, commit]);

  // This browser's duties, retried every few seconds until the host's state shows them done:
  // its commitment, colours for the opponent's guesses at my equation, and the reveal at the end.
  useEffect(() => {
    if (!inGame || !mine?.eq || !mine.salt) return;
    const once = (key: string, run: () => void) => {
      const last = sent.current.get(key) ?? 0;
      if (now - last < 3000) return;
      sent.current.set(key, now);
      run();
    };
    if (phase === 'write' && !state.commits[mySeat]) once(`${sid}-commit`, () => dispatch({ t: 'commit', hash: duelCommit(sid, mine.salt!, mine.eq!), auto: mine.auto }));
    if (phase === 'solve') state.rows[opp].forEach((row, i) => {
      if (!row.m) once(`${sid}-mark-${i}`, () => dispatch({ t: 'mark', i, m: markGuess(mine.eq!, row.g).join('') }));
    });
    if (phase === 'reveal' && state.commits[mySeat] && !state.reveals[mySeat]) once(`${sid}-reveal`, () => dispatch({ t: 'reveal', eq: mine.eq!, salt: mine.salt! }));
  }, [now, state, phase, sid, mine, inGame, mySeat, opp, dispatch]);

  const myRows = inGame ? state.rows[mySeat] : [];
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [myRows.length]);

  // Record the match once (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (phase !== 'finished' || !state.result || !inGame) return;
    const { winner, reason } = state.result;
    const solvedAt = state.rows[mySeat].findIndex((r) => r.m === 'ggggggggg');
    reportGame(`equation_signal-duel-${sid}`, 'equation_signal', 'friend', winner === null ? 'draw' : winner === mySeat ? 'win' : 'loss',
      { mode: 'duel', players: 2, guesses: state.rows[mySeat].length, solved: solvedAt >= 0, reason });
  }, [phase, state, sid, inGame, mySeat]);

  const writing = phase === 'write' && inGame && !!mine && !mine.eq;
  const guessing = inGame && duelCanGuess(state, mySeat);
  const validDraft = draft.full && isEquation(draft.text);
  const submit = useCallback(() => {
    if (writing) { if (validDraft) commit(draft.text, false); return; }
    if (!guessing || !draft.full) return;
    dispatch({ t: 'guess', text: draft.text });
    draft.clear();
  }, [writing, validDraft, commit, guessing, draft, dispatch]);
  const { setCursor, clear, type } = draft;
  const move = useCallback((delta: number) => setCursor((i) => i + delta), [setCursor]);
  const fillRandom = () => { clear(); for (const ch of generateEquation()) type(ch); };
  useSignalKeys(writing || guessing, draft.type, draft.back, submit, move);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: c.title, text: c.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };

  const notice = status === 'unconfigured' ? c.unconfigured : status === 'error' ? c.connectionError : !me?.isHost && !hostOnline ? c.hostOffline : null;
  const name = (seat: number) => state.seats[seat]?.name ?? c.emptySeat;
  const seated = state.seats.filter(Boolean).length;
  const shown = myRows.map((row) => ({ guess: row.g, marks: [...row.m] as Mark[] }));
  const pending = myRows.some((r) => !r.m);
  const mySolve = myRows.findIndex((r) => r.m === 'ggggggggg');
  const oppRows = state.rows[opp];
  const oppSolve = oppRows.findIndex((r) => r.m === 'ggggggggg');
  const urgent = (ms: number) => ms < 20_000;
  const kicker = phase === 'lobby' ? 'LOBBY · 1:1' : phase === 'write' ? d.writeKicker : phase === 'solve' ? d.solveKicker : phase === 'reveal' ? d.revealKicker : d.resultKicker;
  const result = state.result;
  const heading = phase === 'lobby' ? d.lobbyTitle : phase === 'write' ? d.writeHeading : phase === 'solve' ? d.solveHeading : phase === 'reveal' ? d.revealHeading
    : !result ? '' : result.winner === null ? d.draw : !inGame ? d.winnerIs(name(result.winner)) : result.winner === mySeat ? d.win : d.loss;

  return (
    <div className={SHELL} style={EQS_ROOT_STYLE}>
      <Shards tint="#26301a" />
      <RoomAlerts alerts={alerts} accent={EQS_ACCENT} joinText={c.joined} leaveText={c.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/equation-signal" backLabel={c.back} title={c.title} titleClass="font-black" subtitle={`1:1 · ${seated}/2 · ${code.toUpperCase()}`}>
        <GameUpdates game="equation_signal" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={KICKER}>{kicker}</p>
              <h1 className={`mt-1 break-keep ${HEADING}`}>{heading}</h1>
            </div>
            {phase === 'write' && inGame && <span data-testid="duel-clock" className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-sm font-black ${urgent(writeLeft) ? 'bg-[#e5484d]/20 text-[#ff9b94]' : 'bg-white/10 text-white/80'}`}><Timer size={14} />{clock(writeLeft)}</span>}
            {phase === 'solve' && <span data-testid="duel-clock" className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-sm font-black ${urgent(solveLeft) ? 'bg-[#e5484d]/20 text-[#ff9b94]' : 'bg-white/10 text-white/80'}`}><Timer size={14} />{clock(solveLeft)}</span>}
          </div>

          {phase === 'lobby' && (
            <div className="mx-auto max-w-[480px] space-y-4 py-2">
              <div className={PANEL}>
                <p className={PANEL_TITLE}>{c.inviteTitle}</p>
                <p className="mt-2 text-sm text-white/55">{d.inviteDesc}</p>
                <InviteCode code={code} />
                <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                  <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? c.copied : c.copy}</button>
                  <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{c.share}</button>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={c.nickname} className={INPUT} />
                <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{c.rename}</button>
              </form>
              {me?.isHost ? (
                <button onClick={() => dispatch({ t: 'start' })} disabled={seated < 2} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= 2 ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                  {seated >= 2 ? <Swords size={16} /> : <Lock size={15} />}{seated >= 2 ? d.start : d.needPlayer}
                </button>
              ) : <p className="text-center text-sm text-white/50">{mySeat === null ? c.roomFull : c.waitingHost}</p>}
            </div>
          )}

          {phase === 'write' && (
            <div className="mx-auto max-w-[460px]">
              {!inGame ? <p className="py-10 text-center text-sm text-white/50">{c.spectating}</p> : writing ? (
                <>
                  <p className="mb-3 break-keep text-xs leading-5 text-white/55">{d.writeDesc(Math.round(state.writeSec / 60) || 1)}</p>
                  <SignalRow text={draft.cells} cursor={draft.cursor} onCell={draft.setCursor} />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p data-testid="duel-validity" className={`text-xs font-bold ${!draft.full ? 'text-white/45' : validDraft ? 'text-[#7ee2ae]' : 'text-[#ff9b94]'}`}>{!draft.full ? d.fill : validDraft ? d.valid : d.invalid}</p>
                    <button type="button" onClick={fillRandom} className={`${BTN} !py-1.5`}><Dices size={13} />{d.random}</button>
                  </div>
                  <div className="mt-3"><SignalKeypad marks={{}} onSymbol={draft.type} onBack={draft.back} onEnter={submit} canEnter={validDraft} enterLabel={d.submit} /></div>
                </>
              ) : (
                <div className="space-y-3 py-2">
                  {mine?.eq && <MyPuzzle label={d.mine} eq={mine.eq} note={mine.auto ? d.autoPicked : undefined} />}
                  <p className="text-center text-xs text-white/50">{d.waitOpp}</p>
                </div>
              )}
              <p data-testid="duel-opp-status" className={`mt-4 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-black ${state.commits[opp] ? 'bg-[#2fbf71]/15 text-[#7ee2ae]' : 'bg-white/5 text-white/50'}`}>
                {state.commits[opp] ? <Check size={13} /> : <PenLine size={13} className="animate-pulse" />}{state.commits[opp] ? d.oppDone : d.oppWriting}
              </p>
            </div>
          )}

          {phase === 'solve' && (
            <div className="mx-auto max-w-[460px]">
              {!inGame ? <p className="py-10 text-center text-sm text-white/50">{c.spectating}</p> : (
                <>
                  <div ref={listRef} className="max-h-[34svh] space-y-1 overflow-y-auto pr-0.5 sm:space-y-1.5">
                    {shown.map((row, i) => <SignalRow key={i} text={row.guess} marks={row.marks.length ? row.marks : null} pop={i === shown.length - 1} />)}
                    {guessing && <SignalRow text={draft.cells} cursor={draft.cursor} onCell={draft.setCursor} />}
                  </div>
                  <div className="mt-3 space-y-2">
                    {mySolve >= 0 ? <p className="rounded-md bg-[#2fbf71]/15 py-2.5 text-center text-sm font-black text-[#7ee2ae]">{d.solvedWait(mySolve + 1)}</p>
                      : duelDone(state, mySeat) ? <p className="rounded-md bg-white/5 py-2.5 text-center text-sm font-bold text-white/55">{d.outOfGuesses}</p> : (
                        <>
                          <div className="flex items-center justify-between"><SignalLegend g={c.legendG} y={c.legendY} r={c.legendR} /><span className="shrink-0 font-mono text-[10px] font-bold text-white/40">{pending ? <span className="inline-flex items-center gap-1 text-(--accent)"><Loader2 size={11} className="animate-spin" />{d.marking}</span> : d.guessesLeft(DUEL_MAX_GUESSES - myRows.length)}</span></div>
                          <SignalKeypad marks={keyMarks(shown.filter((r) => r.marks.length))} onSymbol={draft.type} onBack={draft.back} onEnter={submit} canEnter={draft.full && guessing} enterLabel={c.submit} disabled={pending} />
                        </>
                      )}
                  </div>
                </>
              )}
            </div>
          )}

          {phase === 'reveal' && <p className="flex items-center justify-center gap-2 py-12 text-sm text-white/55"><Loader2 size={16} className="animate-spin" />{d.revealHeading}</p>}

          {phase === 'finished' && result && (
            <div className="mx-auto max-w-[560px] py-2">
              <p className="text-center text-xs font-bold text-white/60">
                {result.winner !== null && inGame && result.winner !== mySeat && d.reasonLoss[result.reason] ? d.reasonLoss[result.reason] : d.reason[result.reason]}
                <span className="ml-2 font-mono text-white/40">{d.score(state.wins[0], state.wins[1])}</span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[0, 1].map((seat) => {
                  const rows = state.rows[seat];
                  const solvedAt = rows.findIndex((r) => r.m === 'ggggggggg');
                  const eq = state.reveals[1 - seat]?.eq;
                  return (
                    <div key={seat} data-testid={`duel-result-${seat}`} className={`min-w-0 rounded-[12px] border p-2 ${result.winner === seat ? 'border-[#ffcf3f]/50 bg-[#ffcf3f]/[.07]' : 'border-white/10 bg-black/30'}`}>
                      <p className="flex items-center gap-1 truncate text-xs font-black">{result.winner === seat && <Crown size={12} className="shrink-0 text-[#ffcf3f]" />}{name(seat)}{seat === mySeat ? ` (${c.me})` : ''}</p>
                      <p className={`mt-0.5 text-[11px] font-bold ${solvedAt >= 0 ? 'text-[#7ee2ae]' : 'text-white/40'}`}>{solvedAt >= 0 ? d.inGuesses(solvedAt + 1) : d.failed}</p>
                      <div className="mt-2 rounded-md bg-black/40 px-1.5 py-1.5 text-center">
                        <p className="text-[9px] font-black tracking-wider text-white/40">{d.problemBy(name(1 - seat))}{state.auto[1 - seat] ? ` · ${d.autoTag}` : ''}</p>
                        <p className="mt-0.5 whitespace-nowrap font-mono text-[15px] font-black text-(--accent)">{eq ? [...eq].map(glyph).join('') : d.hidden}</p>
                      </div>
                      <div className="mt-2 space-y-[3px]">{rows.map((r, i) => <SignalRow key={i} text={r.g} marks={r.m || null} small />)}</div>
                    </div>
                  );
                })}
              </div>
              <ResultActions won={inGame ? result.winner === mySeat : undefined} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={d.rematchWait} gamePath="/equation-signal" primaryClass={RESULT_PRIMARY} />
            </div>
          )}

          {status !== 'online' && !notice && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Loader2 size={13} className="animate-spin" />{c.connecting}</p>}
        </section>

        <aside className="flex flex-col gap-4">
          {phase === 'solve' && inGame && (
            <section className={PANEL}>
              {mine?.eq && <MyPuzzle label={d.mine} eq={mine.eq} note={mine.auto ? d.autoPicked : undefined} small />}
              <p className={`${PANEL_TITLE} mt-3`}>{d.opp(name(opp))}</p>
              {oppSolve >= 0 && <p className="mt-1 text-[11px] font-black text-[#ff9b94]">{d.oppSolved} · {d.inGuesses(oppSolve + 1)}</p>}
              <div data-testid="duel-opp-rows" className="mt-2 space-y-[3px]">
                {oppRows.length ? oppRows.map((r, i) => <SignalRow key={i} text={r.g} marks={r.m || null} small />) : <p className="text-xs text-white/40">{d.noGuessYet}</p>}
              </div>
            </section>
          )}
          <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
            <p className={PANEL_TITLE}>{d.rulesTitle}</p>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{d.rules.map((line, i) => <li key={line} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
          </section>
        </aside>
      </main>
    </div>
  );
}

function MyPuzzle({ label, eq, note, small = false }: { label: string; eq: string; note?: string; small?: boolean }) {
  return (
    <div className="rounded-[12px] border border-(--accent)/40 bg-(--accent)/[0.07] p-3 text-center">
      <p className={KICKER}>{label}</p>
      <p className={`mt-1 font-mono font-black tracking-wide ${small ? 'text-lg' : 'text-2xl'}`}>{pretty(eq)}</p>
      {note && <p className="mt-1 text-[11px] font-bold text-[#f2c230]">{note}</p>}
    </div>
  );
}
