"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BellRing, Check, Copy, Crown, Loader2, Lock, RotateCcw, Share2, Swords, Trophy, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { useHexagonRoom } from '@/hooks/useHexagonRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { IDLE_MS, lineOf } from '@/lib/hexagon';
import { BUZZ_MS, HEX_MAX_PLAYERS, HEX_MEMO_OPTIONS, HEX_MIN_PLAYERS, HEX_ROUND_OPTIONS, hexRanking, isOvertime } from '@/lib/hexagonRoom';
import { reportGame } from '@/lib/stats';
import { HEX_ACCENT, HEX_INK, HexBoardView, type TileMark, TargetPlate, TimeBar, revealMarks, togglePick, useLetterKeys } from './HexParts';

/** When this browser first saw `key` (timers run on local clocks, not the host's). */
function useSeenAt(key: string, now: number) {
  const [seen, setSeen] = useState({ key: '', at: 0 });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this event arrived here
    if (key && key !== seen.key) setSeen({ key, at: Date.now() });
  }, [key, seen.key]);
  return seen.key === key ? seen.at : now;
}

export default function HexagonRoomView({ code }: { code: string }) {
  const t = useTranslations('HexagonOnline');
  const th = useTranslations('Hexagon');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useHexagonRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [pick, setPick] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/hexagon/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const phase = state?.phase;
  const memoAt = useSeenAt(state && phase === 'memorize' ? `${state.sid}-${state.index}-memo` : '', now);
  const idleAt = useSeenAt(state && phase === 'recall' && !state.buzz ? `${state.sid}-${state.index}-${state.last?.at ?? 'start'}` : '', now);
  const buzzAt = useSeenAt(state?.buzz ? `${state.sid}-${state.index}-${state.buzz.seat}-${state.buzz.until}` : '', now);
  const lastAt = useSeenAt(state?.last ? `${state.sid}-${state.index}-${state.last.at}` : '', now);

  const buzzKey = state?.buzz ? `${state.buzz.seat}-${state.buzz.until}` : '';
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a new buzz starts with an empty pick
  useEffect(() => { setPick(''); }, [buzzKey]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the answer highlight belongs to one round
  useEffect(() => { setFocus(null); }, [state?.index]);

  // Record each finished game once per player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || !state.players.includes(mySeat)) return;
    const ranking = hexRanking(state);
    const rank = ranking.indexOf(mySeat) + 1;
    const top = state.scores[ranking[0]];
    const win = state.scores[mySeat] === top && ranking.filter((s) => state.scores[s] === top).length === 1;
    reportGame(`hexagon-friend-${state.sid}`, 'hexagon', 'friend', win ? 'win' : 'loss',
      { rank, players: state.players.length, score: state.scores[mySeat], rounds: state.history.length });
  }, [state, mySeat]);

  const inGame = !!state && mySeat !== null && state.players.includes(mySeat);
  const myBuzz = !!state?.buzz && state.buzz.seat === mySeat;
  const declare = useCallback(() => { if (myBuzz && pick.length === 3) dispatch({ t: 'declare', letters: pick }); }, [myBuzz, pick, dispatch]);
  const tap = useCallback((letter: string) => setPick((p) => togglePick(p, letter)), []);
  const clear = useCallback(() => setPick(''), []);
  useLetterKeys(myBuzz, tap, declare, clear);
  // Space bar buzzes.
  useEffect(() => {
    if (!state || state.phase !== 'recall' || !inGame || state.buzz) return;
    const onKey = (event: KeyboardEvent) => { if (event.code === 'Space' && (event.target as HTMLElement)?.tagName !== 'INPUT') { event.preventDefault(); dispatch({ t: 'buzz' }); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, inGame, dispatch]);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: th('title'), text: t('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError') : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const round = state?.round ?? null;
  const live = phase === 'memorize' || phase === 'recall' || phase === 'reveal';
  const memoLeft = state && phase === 'memorize' ? Math.max(0, state.memoSec * 1000 - (now - memoAt)) : 0;
  const idleLeft = phase === 'recall' && !state?.buzz ? Math.max(0, IDLE_MS - (now - idleAt)) : IDLE_MS;
  const buzzLeft = state?.buzz ? Math.max(0, BUZZ_MS - (now - buzzAt)) : 0;
  const last = state?.last && now - lastAt < 3200 ? state.last : null;
  const lastText = last ? (last.reason === 'right' ? t('lastRight', { player: name(last.seat), line: last.line ?? '' }) : last.reason === 'dup' ? t('lastDup', { player: name(last.seat), line: last.line ?? '' }) : last.reason === 'time' ? t('lastTime', { player: name(last.seat) }) : t('lastWrong', { player: name(last.seat), line: last.line ?? '' })) : '';
  const lastRound = phase === 'reveal' ? state!.history.at(-1) : null;
  const foundLines = lastRound?.found.map((f) => f.line) ?? [];
  const marks: Record<string, TileMark> = myBuzz ? Object.fromEntries([...pick].map((ch) => [ch, 'pick'])) as Record<string, TileMark>
    : lastRound ? (focus ? Object.fromEntries([...focus].map((ch) => [ch, foundLines.includes(focus) ? 'found' : 'missed'])) as Record<string, TileMark> : revealMarks(lastRound.answers, foundLines)) : {};
  const roundLabel = state && live ? (isOvertime(state) ? t('overtimeKicker', { n: state.index - state.rounds + 1 }) : t('roundKicker', { n: state.index + 1, total: state.rounds })) : '';

  const heading = !state ? '' : phase === 'lobby' ? t('lobbyTitle') : phase === 'finished' ? t('finished')
    : phase === 'memorize' ? th('memorizeHeading') : phase === 'reveal' ? th('roundOver', { found: foundLines.length, total: lastRound?.answers.length ?? 0 })
      : state.buzz ? (myBuzz ? t('yourBuzz') : t('buzzing', { player: name(state.buzz.seat) })) : th('recallHeading');

  const ranking = state ? hexRanking(state) : [];
  const top = state && ranking.length ? state.scores[ranking[0]] : 0;

  return (
    <div className={SHELL} style={{ ...accentVars(HEX_ACCENT, HEX_INK), backgroundImage: fog('200, 150, 60') }}>
      <Shards tint="#3a2f1a" />
      <RoomAlerts alerts={alerts} accent={HEX_ACCENT} joinText={(n) => t('joined', { name: n })} leaveText={(n) => t('left', { name: n })} />
      <GameHeader backHref="/hexagon" backLabel={tc('hexagon')} title={th('title')} titleClass="font-black" subtitle={`ONLINE · ${seated}/${HEX_MAX_PLAYERS} · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p> : <Link href="/hexagon" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={KICKER}>{phase === 'lobby' ? 'LOBBY' : phase === 'finished' ? 'RESULT' : roundLabel}</p>
                <h1 className={`mt-1 break-keep ${HEADING}`}>{heading}</h1>
              </div>
              {round && live && <TargetPlate target={round.target} hidden={phase === 'memorize'} />}
            </div>

            {phase === 'lobby' && (
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
                  <p className={PANEL_TITLE}>{t('roundCount')}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">{HEX_ROUND_OPTIONS.map((n) => <button key={n} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', rounds: n })} className={`py-2 ${seg(state.rounds === n)} disabled:cursor-default`}>{t('rounds', { n })}</button>)}</div>
                  <p className={`${PANEL_TITLE} mt-4`}>{t('memoTime')}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{HEX_MEMO_OPTIONS.map((s) => <button key={s} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', memoSec: s })} className={`py-2 ${seg(state.memoSec === s)} disabled:cursor-default`}>{t('seconds', { n: s })}</button>)}</div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSets')}</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <button onClick={() => dispatch({ t: 'start' })} disabled={seated < HEX_MIN_PLAYERS} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= HEX_MIN_PLAYERS ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                    {seated >= HEX_MIN_PLAYERS ? <Swords size={16} /> : <Lock size={15} />}{seated >= HEX_MIN_PLAYERS ? t('start', { n: seated }) : t('needPlayers')}
                  </button>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            )}

            {round && live && (
              <>
                {phase === 'memorize' && <div className="mb-3 space-y-1"><TimeBar left={memoLeft} total={state.memoSec * 1000} /><p className="text-center font-mono text-xs font-black text-(--accent)">{th('memorizeLeft', { s: Math.ceil(memoLeft / 1000) })}</p></div>}
                {phase === 'recall' && !state.buzz && <div className="mb-3 space-y-1"><TimeBar left={idleLeft} total={IDLE_MS} color="rgba(255,255,255,.35)" /><p className="text-center text-[11px] text-white/40">{t('idleLeft', { s: Math.ceil(idleLeft / 1000) })}</p></div>}
                {phase === 'recall' && state.buzz && <div className="mb-3 space-y-1"><TimeBar left={buzzLeft} total={BUZZ_MS} color="#ffcf3f" /><p className="text-center font-mono text-xs font-black text-[#ffcf3f]">{t('buzzLeft', { player: name(state.buzz.seat), s: Math.ceil(buzzLeft / 1000) })}</p></div>}
                <div className={`rounded-[12px] p-1 transition sm:p-3 ${last ? (last.ok ? 'bg-[#34c47c]/12 ring-2 ring-[#34c47c]/50' : 'bg-[#ff5d5d]/10 ring-2 ring-[#ff5d5d]/50') : ''}`}>
                  <HexBoardView numbers={phase === 'recall' ? null : round.numbers} front={phase !== 'recall'} marks={marks} onTap={tap} disabled={!myBuzz} fitHeight />
                </div>
              </>
            )}

            {live && (
              <div className="mx-auto mt-3 max-w-md space-y-2">
                {last && <p className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-black ${last.ok ? 'bg-[#34c47c]/15 text-[#7ee2ae]' : 'bg-[#ff5d5d]/12 text-[#ff9b94]'}`}>{last.ok ? <Check size={15} /> : <X size={15} />}{lastText}</p>}
                {phase === 'recall' && inGame && (myBuzz ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 flex-1 items-center justify-center rounded-md border border-[#ffcf3f]/50 bg-black/50 font-mono text-2xl font-black tracking-[0.3em]">{pick || <span className="text-sm font-bold tracking-normal text-white/35">{th('pickHint')}</span>}</div>
                      <button type="button" onClick={declare} disabled={pick.length !== 3} className={`${BTN_ACCENT} h-12 px-5 text-sm`}>{th('declare')}</button>
                    </div>
                    {pick.length === 3 && !lineOf(pick) && <p className="text-center text-[11px] font-bold text-[#ff9b94]">{t('notLineWarn')}</p>}
                    <button type="button" onClick={clear} disabled={!pick} className={`w-full py-2.5 ${BTN} disabled:opacity-40`}><X size={14} />{th('clear')}</button>
                  </>
                ) : (
                  <button type="button" onClick={() => dispatch({ t: 'buzz' })} disabled={!!state.buzz}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#e5484d] py-4 text-lg font-black text-white shadow-[0_10px_0_#8d1e22,0_18px_30px_rgba(229,72,77,.35)] transition active:translate-y-[6px] active:shadow-[0_4px_0_#8d1e22] disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none">
                    <BellRing size={20} />{state.buzz ? t('someoneAnswering') : t('buzzer')}
                  </button>
                ))}
                {phase === 'recall' && inGame && !state.buzz && <p className="hidden text-center text-[10px] text-white/30 lg:block">{t('spaceHint')}</p>}
                {phase === 'memorize' && <p className="text-center text-xs text-white/45">{t('memoNote')}</p>}
                {phase === 'reveal' && lastRound && (
                  <>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {lastRound.answers.map((line) => {
                        const by = lastRound.found.find((f) => f.line === line);
                        return <button key={line} type="button" onClick={() => setFocus(focus === line ? null : line)} className={`rounded-md px-2.5 py-1.5 font-mono text-sm font-black transition ${by ? 'bg-[#34c47c]/20 text-[#7ee2ae]' : 'bg-[#ffcf3f]/15 text-[#ffd96b]'} ${focus === line ? 'ring-2 ring-white/70' : ''}`}>{line}{by ? <span className="ml-1 font-sans text-[10px] font-bold opacity-80">{name(by.seat)}</span> : null}</button>;
                      })}
                    </div>
                    <p className="text-center text-[11px] text-white/45">{t('nextSoon')}</p>
                  </>
                )}
                {!inGame && phase !== 'reveal' && <p className="text-center text-xs text-white/45">{t('spectating')}</p>}
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
                      <span className="min-w-0 flex-1 truncate text-sm font-black">{name(seat)}{seat === mySeat ? ` (${t('me')})` : ''}</span>
                      <span className="font-mono text-sm font-black">{t('points', { n: state.scores[seat] })}</span>
                    </li>
                  );
                })}</ol>
                <p className="mt-2 text-center text-[11px] text-white/40">{t('tieRule')}</p>
                <ul className="mt-4 space-y-1.5">{state.history.map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-[11px]">
                    <span className="font-mono text-white/45">{i < state.rounds ? `R${i + 1}` : `OT${i - state.rounds + 1}`} · {th('targetShort', { n: h.target })}</span>
                    <span className="min-w-0 flex-1 truncate text-right text-white/60">{h.answers.map((a) => (h.found.some((f) => f.line === a) ? `✓${a}` : a)).join(' ')}</span>
                  </li>
                ))}</ul>
                {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="mt-4 text-center text-xs text-white/45">{t('rematchWait')}</p>}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{seated}/{HEX_MAX_PLAYERS}</span></div>
              <div className="space-y-2">
                {state.seats.map((seat, i) => {
                  if (!seat && phase !== 'lobby') return null;
                  const buzzing = state.buzz?.seat === i;
                  return (
                    <div key={i} data-chat-seat={seat?.id} className={`${playerRow(buzzing)} ${seat ? '' : 'opacity-40'}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-black ${buzzing ? 'bg-[#e5484d] text-white' : 'bg-white/10 text-white/60'}`}>{buzzing ? <BellRing size={15} /> : i + 1}</span>
                      <div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 truncate text-sm font-extrabold">{seat ? name(i) : t('emptySeat')}{seat?.id === me?.id ? ` (${t('me')})` : ''}{i === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}</p></div>
                      {phase !== 'lobby' && seat && <span className={`font-mono text-lg font-black ${state.scores[i] < 0 ? 'text-[#ff9b94]' : 'text-(--accent)'}`}>{state.scores[i]}</span>}
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
