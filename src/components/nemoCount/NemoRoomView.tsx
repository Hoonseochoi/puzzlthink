"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BellRing, Check, Clock3, Copy, Crown, Hand, Loader2, Lock, RotateCcw, Share2, Swords, ThumbsDown, ThumbsUp, Trophy, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import RoomEmotes from '@/components/RoomEmotes';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useNemoRoom } from '@/hooks/useNemoRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { NEMO_DIFFICULTIES, formatMs } from '@/lib/nemoCount';
import { BUZZ_MS, REBUZZ_MS, VOTE_MS, NEMO_MAX_PLAYERS, NEMO_MIN_PLAYERS, NEMO_PROBLEM_OPTIONS, NEMO_TIME_OPTIONS, nemoRanking } from '@/lib/nemoCountRoom';
import { reportGame } from '@/lib/stats';
import { CoffeeNudge } from '@/components/SupportLink';
import { AnswerInput, NEMO_ACCENT, NEMO_INK, NemoBoardView, SolutionReplay, TargetPlate } from './NemoParts';

export default function NemoRoomView({ code }: { code: string }) {
  const t = useTranslations('NemoOnline');
  const tn = useTranslations('NemoCount');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename, emote } = useNemoRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/nemo-count/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  // Count the 10-second answer window from when this browser saw the buzz (not the host's clock).
  const [buzzSeen, setBuzzSeen] = useState({ key: '', at: 0 });
  const buzzKey = state?.buzz ? `${state.index}-${state.buzz.seat}-${state.buzz.until}` : '';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this buzz arrived here
    if (buzzKey !== buzzSeen.key) setBuzzSeen({ key: buzzKey, at: Date.now() });
  }, [buzzKey, buzzSeen.key]);

  const [coolSeen, setCoolSeen] = useState({ key: '', at: 0 });
  const myCooldown = state && mySeat !== null && state.cooldown[mySeat] ? `${state.index}-${state.cooldown[mySeat]}` : '';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when my wrong answer came back
    if (myCooldown && myCooldown !== coolSeen.key) setCoolSeen({ key: myCooldown, at: Date.now() });
  }, [myCooldown, coolSeen.key]);
  const [voteSeen, setVoteSeen] = useState({ key: '', at: 0 });
  const voteKey = state?.vote ? `${state.index}-${state.vote.seat}-${state.vote.until}` : '';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this pass proposal arrived here
    if (voteKey !== voteSeen.key) setVoteSeen({ key: voteKey, at: Date.now() });
  }, [voteKey, voteSeen.key]);

  // Record each finished game once per player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || !state.players.includes(mySeat)) return;
    const rank = nemoRanking(state).indexOf(mySeat) + 1;
    reportGame(`nemo_count-friend-${state.sid}`, 'nemo_count', 'friend', rank === 1 ? 'win' : 'loss',
      { rank, players: state.players.length, correct: state.scores[mySeat], timeMs: state.times[mySeat], difficulty: state.difficulty, problems: state.problems.length });
  }, [state, mySeat]);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: tn('title'), text: t('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError') : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const problem = state && (state.phase === 'playing' || state.phase === 'reveal') ? state.problems[state.index] : null;
  const playing = state?.phase === 'playing';
  const inGame = !!state && mySeat !== null && state.players.includes(mySeat);
  // After a wrong answer this player waits a moment before buzzing again (timed locally, like the buzz).
  const coolKey = state && mySeat !== null && state.cooldown[mySeat] ? `${state.index}-${state.cooldown[mySeat]}` : '';
  const coolLeft = coolKey && coolSeen.key === coolKey ? Math.max(0, REBUZZ_MS - (now - coolSeen.at)) : 0;
  const cooling = coolLeft > 0;
  const myBuzz = !!state?.buzz && state.buzz.seat === mySeat;
  const buzzLeft = state?.buzz ? Math.max(0, BUZZ_MS - (now - buzzSeen.at)) : 0;
  const problemLeft = state && state.timeSec && playing ? Math.max(0, state.problemEnd - now) : null;
  const elapsed = state && problem ? (state.phase === 'reveal' ? (state.results.at(-1)?.ms ?? state.revealUntil - state.problemStart) : now - state.problemStart) : 0;
  const lastResult = state?.phase === 'reveal' ? state.results.at(-1) : null;
  const vote = playing ? state!.vote : null;
  const voteLeft = vote ? Math.max(0, VOTE_MS - (now - voteSeen.at)) : 0;
  const myVoteDone = !!vote && mySeat !== null && (vote.seat === mySeat || vote.yes.includes(mySeat));
  const voters = vote ? state!.players.filter((p) => p !== vote.seat).length : 0;
  const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? t('finished')
    : lastResult ? (lastResult.winner !== null ? t('solvedBy', { player: name(lastResult.winner), time: formatMs(lastResult.ms ?? 0) }) : lastResult.reason === 'time' ? t('timeUp') : t('passAgreed'))
      : state.vote ? t('voteHeading', { player: name(state.vote.seat) })
      : state.buzz ? (myBuzz ? t('yourBuzz') : t('buzzing', { player: name(state.buzz.seat) }))
        : cooling ? t('wrongRetry', { s: Math.ceil(coolLeft / 1000) }) : tn('howMany');

  return (
    <div className={SHELL} style={{ ...accentVars(NEMO_ACCENT, NEMO_INK), backgroundImage: fog('120, 130, 160') }}>
      <Shards tint="#2a2f45" />
      <RoomAlerts alerts={alerts} accent={NEMO_ACCENT} joinText={(n) => t('joined', { name: n })} leaveText={(n) => t('left', { name: n })} /><RoomEmotes peers={peers} onEmote={emote} />
      <GameHeader backHref="/nemo-count" backLabel={tc('nemoCount')} title={tn('title')} titleClass="font-black" subtitle={`ONLINE · ${seated}/${NEMO_MAX_PLAYERS} · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p> : <Link href="/nemo-count" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : state.phase === 'finished' ? 'RESULT' : t('problemKicker', { n: state.index + 1, total: state.problems.length })}</p>
                <h1 className={`mt-1 break-keep ${HEADING}`}>{heading}</h1>
                {problem && <p className="mt-2 flex items-center gap-3 font-mono text-xs text-white/55">
                  <span className="flex items-center gap-1"><Clock3 size={13} />{formatMs(elapsed)}</span>
                  {problemLeft !== null && <span className={timer(problemLeft < 20_000)}>{clock(problemLeft)}</span>}
                </p>}
              </div>
              {problem && <TargetPlate target={problem.target} />}
            </div>

            {state.phase === 'lobby' && (
              <div className="mx-auto max-w-[480px] space-y-4 py-2">
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/55">{t('inviteDesc')}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{tn('difficulty')}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{NEMO_DIFFICULTIES.map((d) => <button key={d} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', difficulty: d })} className={`py-2 ${seg(state.difficulty === d)} disabled:cursor-default`}>{tn(`level_${d}`)}</button>)}</div>
                  <p className={`${PANEL_TITLE} mt-4`}>{t('problemCount')}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{NEMO_PROBLEM_OPTIONS.map((n) => <button key={n} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', problemCount: n })} className={`py-2 ${seg(state.problemCount === n)} disabled:cursor-default`}>{t('problems', { n })}</button>)}</div>
                  <p className={`${PANEL_TITLE} mt-4`}>{t('timeLimit')}</p>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">{NEMO_TIME_OPTIONS.map((s) => <button key={s} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', timeSec: s })} className={`py-2 text-[11px] ${seg(state.timeSec === s)} disabled:cursor-default`}>{s ? t('minutes', { n: s / 60 }) : t('noLimit')}</button>)}</div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSets')}</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <button onClick={() => dispatch({ t: 'start' })} disabled={seated < NEMO_MIN_PLAYERS} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= NEMO_MIN_PLAYERS ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                    {seated >= NEMO_MIN_PLAYERS ? <Swords size={16} /> : <Lock size={15} />}{seated >= NEMO_MIN_PLAYERS ? t('start', { n: seated }) : t('needPlayers')}
                  </button>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            )}

            {problem && state.phase === 'playing' && <NemoBoardView board={problem} fitHeight />}
            {problem && state.phase === 'reveal' && (
              <div>
                <p className="mb-3 rounded-md bg-(--accent)/10 py-2 text-center text-sm font-black text-(--accent)">{tn('answerIs', { n: problem.answer })}</p>
                <SolutionReplay key={`${state.sid}-${state.index}`} board={problem} auto fitHeight stepMs={Math.max(120, Math.min(700, 5000 / Math.max(1, problem.answer)))} />
              </div>
            )}

            {playing && inGame && (
              <div className="mx-auto mt-4 max-w-md space-y-2">
                {myBuzz ? (
                  <>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#ffcf3f] transition-[width] duration-200" style={{ width: `${(buzzLeft / BUZZ_MS) * 100}%` }} /></div>
                    <AnswerInput onSubmit={(value) => dispatch({ t: 'answer', value })} placeholder={t('answerIn', { s: Math.ceil(buzzLeft / 1000) })} submitLabel={tn('submit')} />
                  </>
                ) : (
                  <button type="button" onClick={() => dispatch({ t: 'buzz' })} disabled={!!state.buzz || !!state.vote || cooling}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#e5484d] py-4 text-lg font-black text-white shadow-[0_10px_0_#8d1e22,0_18px_30px_rgba(229,72,77,.35)] transition active:translate-y-[6px] active:shadow-[0_4px_0_#8d1e22] disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none">
                    <BellRing size={20} />{cooling ? t('buzzIn', { s: Math.ceil(coolLeft / 1000) }) : state.buzz ? t('someoneAnswering') : state.vote ? t('voteInProgress') : t('buzzer')}
                  </button>
                )}
                {vote && (
                  <div className="rounded-[12px] border border-(--accent)/40 bg-(--accent)/10 p-3">
                    <p className="text-center text-sm font-black">{vote.seat === mySeat ? t('voteWaiting', { yes: vote.yes.length, total: voters }) : t('voteAsk', { player: name(vote.seat) })}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-(--accent) transition-[width] duration-200" style={{ width: `${(voteLeft / VOTE_MS) * 100}%` }} /></div>
                    {!myVoteDone && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => dispatch({ t: 'vote', agree: true })} className={`${BTN_ACCENT} py-2.5`}><ThumbsUp size={14} />{t('agree')}</button>
                        <button type="button" onClick={() => dispatch({ t: 'vote', agree: false })} className={`${BTN} py-2.5`}><ThumbsDown size={14} />{t('decline')}</button>
                      </div>
                    )}
                    {myVoteDone && vote.seat !== mySeat && <p className="mt-2 text-center text-[11px] text-white/50">{t('voted')}</p>}
                  </div>
                )}
                {!myBuzz && !vote && (
                  <button type="button" onClick={() => dispatch({ t: 'pass' })} disabled={!!state.buzz || state.passesLeft[mySeat!] <= 0 || state.proposed.includes(mySeat!)} className={`w-full py-2.5 ${BTN} disabled:opacity-35`}>
                    <Hand size={14} />{state.proposed.includes(mySeat!) && state.passesLeft[mySeat!] > 0 ? t('passTried') : t('pass', { n: state.passesLeft[mySeat!] })}
                  </button>
                )}
                {(state.wrong[mySeat!]?.length ?? 0) > 0 && <p className="text-center text-xs font-bold text-[#ff9b94]">{t('yourWrong', { list: state.wrong[mySeat!].join(', ') })}</p>}
              </div>
            )}
            {playing && !inGame && <p className="mt-4 text-center text-xs text-white/45">{t('spectating')}</p>}

            {state.phase === 'finished' && (
              <div className="mx-auto max-w-md py-4">
                <Trophy size={34} className="mx-auto text-[#ffcf3f]" />
                <ol className="mt-4 space-y-2">{nemoRanking(state).map((seat, i) => (
                  <li key={seat} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${i === 0 ? 'border-[#ffcf3f]/50 bg-[#ffcf3f]/10' : 'border-white/10 bg-black/30'}`}>
                    <span className="w-6 text-center font-mono text-sm font-black text-(--accent)">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-black">{name(seat)}{seat === mySeat ? ` (${t('me')})` : ''}</span>
                    <span className="font-mono text-sm font-black">{t('correctN', { n: state.scores[seat] })}</span>
                    <span className="w-16 text-right font-mono text-[11px] text-white/45">{state.scores[seat] ? formatMs(state.times[seat]) : '—'}</span>
                  </li>
                ))}</ol>
                <p className="mt-2 text-center text-[11px] text-white/40">{t('tieRule')}</p>
                {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="mt-4 text-center text-xs text-white/45">{t('rematchWait')}</p>}
                <CoffeeNudge className="mt-4" />
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{seated}/{NEMO_MAX_PLAYERS}</span></div>
              <div className="space-y-2">
                {state.seats.map((seat, i) => {
                  if (!seat && state.phase !== 'lobby') return null;
                  const misses = state.wrong[i]?.length ?? 0;
                  const buzzing = state.buzz?.seat === i;
                  return (
                    <div key={i} className={`${playerRow(buzzing)} ${seat ? '' : 'opacity-40'}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-black ${buzzing ? 'bg-[#e5484d] text-white' : 'bg-white/10 text-white/60'}`}>{buzzing ? <BellRing size={15} /> : i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-extrabold">{seat ? name(i) : t('emptySeat')}{seat?.id === me?.id ? ` (${t('me')})` : ''}{i === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}</p>
                        {state.phase !== 'lobby' && seat && <p className="text-[10px] text-white/45">{t('scoreLine', { n: state.scores[i], pass: state.passesLeft[i] })}{misses ? ` · ${t('wrongMark', { n: misses })}` : ''}</p>}
                      </div>
                      {state.phase !== 'lobby' && seat && <span className="font-mono text-lg font-black text-(--accent)">{state.scores[i]}</span>}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
              <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
              <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(['r1', 'r2', 'r3', 'r4'] as const).map((key, i) => <li key={key} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      )}
    </div>
  );
}
