"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronRight, Clock3, Copy, Crown, Eye, Flag, Loader2, Lock, RotateCcw, Share2, Swords, Trophy, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useMorrisRoom } from '@/hooks/useMorrisRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { reportGame } from '@/lib/stats';
import { Link } from '@/i18n/routing';
import { flying, moveLabel, newMorris, onBoard, placing, stallLeft, type Player } from '@/lib/morris';
import { MORRIS_TURN_OPTIONS, colorOf, matchWinner, seatToMove } from '@/lib/morrisRoom';
import { HandRow, MORRIS_ACCENT, MORRIS_INK, MorrisBoard, MorrisStone, useMorrisPicker } from './MorrisParts';
import { ScoreDots } from './MorrisGame';
import GameUpdates from '@/components/GameUpdates';

export default function MorrisRoomView({ code }: { code: string }) {
  const t = useTranslations('MorrisOnline');
  const tm = useTranslations('Morris');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useMorrisRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/nine-mens-morris/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  // Record a finished match once for each player.
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const w = matchWinner(state);
    reportGame(`morris-friend-${state.sid}-${state.rounds.length}`, 'nine_mens_morris', 'friend', w === 'draw' ? 'draw' : w === mySeat ? 'win' : 'loss',
      { rounds: state.rounds.length, score: `${state.wins[mySeat]}-${state.wins[1 - mySeat]}`, turnSec: state.turnSec });
  }, [state, mySeat]);

  const game = state?.game ?? newMorris();
  const playing = state?.phase === 'playing';
  const toMove = state ? seatToMove(state) : 0;
  const myTurn = !!state && playing && mySeat === toMove;
  const picker = useMorrisPicker(game, myTurn, (move) => dispatch({ t: 'move', move }));

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const names = [0, 1].map((seat) => (state?.seats[seat]?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat)));
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const breakLeft = state ? Math.max(0, Math.ceil((state.breakEnd - now) / 1000)) : 0;
  const myColor: Player | null = state && mySeat !== null ? colorOf(state, mySeat) : null;
  const stall = stallLeft(game);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${tm('title')}`, text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  const lastRound = state?.rounds.at(-1);
  const roundText = () => {
    if (!state || !lastRound) return '';
    const reason = tm(`reason.${lastRound.reason ?? 'pieces'}`);
    if (lastRound.winner === 'draw') return `${tm('roundDraw')} · ${reason}`;
    return `${mySeat === null ? t('roundWinner', { player: seatName(lastRound.winner) }) : lastRound.winner === mySeat ? tm('roundWin') : tm('roundLoss')} · ${reason}`;
  };
  const matchText = () => {
    if (!state) return '';
    const w = matchWinner(state);
    if (w === 'draw') return tm('matchDraw');
    if (w === null) return '';
    return mySeat === null ? t('matchWinner', { player: seatName(w) }) : w === mySeat ? tm('matchWin') : tm('matchLoss');
  };
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? matchText() : state.phase === 'roundEnd' ? roundText()
    : myTurn ? (picker.removing ? tm('pickRemove') : placing(game) ? tm('pickPlace') : picker.selected !== null ? tm('pickTarget') : flying(game) ? tm('pickFly') : tm('pickPiece'))
      : t('waitingFor', { player: seatName(toMove) });

  const phaseOf = (p: Player) => (placing(game, p) ? tm('phasePlace') : flying(game, p) ? tm('phaseFly') : tm('phaseMove'));
  const roundNo = state ? state.rounds.length + (state.phase === 'playing' ? 1 : 0) : 1;

  return (
    <div className={SHELL} style={{ ...accentVars(MORRIS_ACCENT, MORRIS_INK), backgroundImage: fog('62, 201, 214') }}>
      <Shards />
      <RoomAlerts alerts={alerts} accent={MORRIS_ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader backHref="/nine-mens-morris" backLabel={tc('nineMensMorris')} title={tm('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <GameUpdates game="nine_mens_morris" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/nine-mens-morris" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
              <div className="min-w-0">
                <p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : state.phase === 'finished' ? tm('matchKicker') : tm('roundKicker', { n: roundNo })}{playing && stall !== null ? ` · ${tm('stallLeft', { n: stall })}` : ''}</p>
                <h1 className={`mt-1 ${HEADING}`}>{heading}</h1>
              </div>
              {playing && <div className={timer(seconds <= 10 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}
              {state.phase !== 'lobby' && !playing && <ScoreDots you={state.wins[mySeat ?? 0]} them={state.wins[1 - (mySeat ?? 0)]} />}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex justify-center gap-3 py-2">
                  <div className="h-16 w-16"><MorrisStone color={0} /></div>
                  <span className="self-center font-mono text-sm font-black text-white/30">VS</span>
                  <div className="h-16 w-16"><MorrisStone color={1} /></div>
                </div>
                <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                  <p className={PANEL_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{t('turnTime')}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {MORRIS_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}
                  </div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSetsTime')}</p>}
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(62,201,214,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : (
              <>
                <div className="relative">
                  <MorrisBoard board={picker.board} marks={picker.marks} selected={picker.selected} last={game.last} onPoint={picker.onPoint} />
                  {!playing && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/55 p-4 backdrop-blur-[2px]">
                      <div className="bw-result w-full max-w-[320px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center shadow-[0_0_60px_rgba(62,201,214,.25)]">
                        <Trophy className="mx-auto text-(--accent)" size={28} />
                        <p className={`${KICKER} mt-3`}>{state.phase === 'finished' ? tm('matchKicker') : tm('roundKicker', { n: state.rounds.length })}</p>
                        <h2 className="mt-1 text-xl font-black">{state.phase === 'finished' ? matchText() : roundText()}</h2>
                        <p className="mt-3 font-mono text-3xl font-black">{state.wins[mySeat ?? 0]}<span className="mx-2 text-white/30">:</span>{state.wins[1 - (mySeat ?? 0)]}</p>
                        {state.phase === 'roundEnd' && <p className="mt-3 flex items-center justify-center gap-1 text-xs text-white/55"><ChevronRight size={13} />{t('nextIn', { n: breakLeft })}</p>}
                        {state.phase === 'finished' && (me?.isHost
                          ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button>
                          : <p className="mt-3 text-[11px] text-white/45">{t('rematchWait')}</p>)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex min-h-9 flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-white/45">
                  <span>{game.last ? t('lastMove', { move: moveLabel(game.last) }) : tm('firstHint')}</span>
                  {picker.selected !== null && myTurn && <button type="button" onClick={picker.cancel} className={`${BTN} py-1.5`}><X size={12} />{tm('cancel')}</button>}
                </div>
                {mySeat === null && <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-2 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-1.5">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  const color = colorOf(state, seat);
                  const inGame = state.phase !== 'lobby';
                  return (
                    <div key={seat} data-chat-seat={occupant?.id} className={`${playerRow(playing && toMove === seat)} ${occupant ? '' : 'opacity-50'}`}>
                      <div className="h-10 w-10 shrink-0"><MorrisStone color={inGame ? color : (seat as Player)} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                          {inGame && <span className="ml-auto shrink-0 font-mono text-xs font-black text-(--accent)">{state.wins[seat]}</span>}
                        </div>
                        {inGame ? <>
                          <p className="text-[10px] text-white/45">{color === 0 ? tm('black') : tm('white')} · {phaseOf(color)}</p>
                          <div className="mt-1.5"><HandRow color={color} count={game.hand[color]} /></div>
                          <p className="mt-1 text-[10px] text-white/40">{tm('onBoard', { n: onBoard(game.board, color) })} · {tm('captured', { n: game.captured[color] })}</p>
                        </> : <p className="text-[11px] text-white/45">{occupant ? t('ready') : t('waiting')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {state.phase !== 'lobby' && <p className="mt-3 text-[11px] text-white/40">{t('turnTimeInfo', { n: state.turnSec })}{myColor !== null ? ` · ${t('youAre', { color: myColor === 0 ? tm('black') : tm('white') })}` : ''}</p>}
            </section>

            <section className={NOTE}>
              <h2 className={PANEL_TITLE}>{tm('quickRules')}</h2>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{tm(key)}</span></li>)}</ol>
            </section>
            {playing && mySeat !== null && (
              <button onClick={() => { if (window.confirm(tm('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{tm('resign')}</button>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}
