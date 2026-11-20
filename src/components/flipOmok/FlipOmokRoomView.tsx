"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, Flag, Loader2, Lock, RotateCcw, Share2, Swords, Trophy, Users, WifiOff, X } from 'lucide-react';
import { useReplayFrames, useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useFlipOmokRoom } from '@/hooks/useFlipOmokRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { reportGame } from '@/lib/stats';
import { Link } from '@/i18n/routing';
import { coordinateLabel, emptyBoard, forbiddenPoints, owner, type Player } from '@/lib/flipOmok';
import { FLIP_TURN_OPTIONS, colorOf, seatToMove } from '@/lib/flipOmokRoom';
import { Dot, FLIP_ACCENT, FLIP_INK, FlipOmokBoard, MiniBoard } from './FlipOmokParts';
import { FlipLegend, FlipTips } from './FlipOmokGame';

export default function FlipOmokRoomView({ code }: { code: string }) {
  const t = useTranslations('FlipOmokOnline');
  const tf = useTranslations('FlipOmok');
  const tc = useTranslations('Common');
  const [replaying, setReplaying] = useState(false);
  const [hideResult, setHideResult] = useState<string | null>(null); // sid whose result popup was closed
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useFlipOmokRoom(code, defaultName);
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
    setShareUrl(`${window.location.origin}/${locale}/flip-omok/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  // Record a finished game once for each player.
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    reportGame(`flip_omok-friend-${state.sid}`, 'flip_omok', 'friend', state.winner === 'draw' ? 'draw' : state.winner === mySeat ? 'win' : 'loss',
      { moves: state.moves, reason: state.reason, turnSec: state.turnSec });
  }, [state, mySeat]);

  const playing = state?.phase === 'playing';
  const toMove = state ? seatToMove(state) : 0;
  const myTurn = !!state && playing && mySeat === toMove;
  const board = state?.board ?? emptyBoard();
  // 복기: positions seen in this browser during the current game.
  const frames = useReplayFrames(state && state.phase !== 'lobby' ? state.sid : null, state && state.phase !== 'lobby' ? { board: state.board, last: state.last, flipped: state.flipped } : null, String(state?.moves ?? 0));
  const finished = state?.phase === 'finished';
  const replay = useReplayPlayer(Math.max(0, frames.length - 1), replaying && finished, 900);
  const frame = replaying && finished ? frames[replay.at] : null;
  const resultOpen = finished && hideResult !== state?.sid && !frame;
  const banned = useMemo(() => new Set(state && myTurn ? forbiddenPoints(state.board, state.turn) : []), [state, myTurn]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const names = [0, 1].map((seat) => (state?.seats[seat]?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat)));
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const myColor: Player | null = state && mySeat !== null ? colorOf(state, mySeat) : null;
  const colorName = (p: Player) => (p === 1 ? tf('black') : tf('white'));

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${tf('title')}`, text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  const resultText = () => {
    if (!state || state.winner === null) return '';
    const reason = t(`reason.${state.reason ?? 'five'}`);
    if (state.winner === 'draw') return `${tf('draw')} · ${reason}`;
    return `${mySeat === null ? t('winner', { player: seatName(state.winner) }) : state.winner === mySeat ? t('youWin') : t('youLose')} · ${reason}`;
  };
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? resultText()
    : myTurn ? t('yourTurn') : t('waitingFor', { player: seatName(toMove) });

  const result = resultOpen && state && (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
      <div className="relative w-full max-w-[320px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center shadow-[0_0_60px_rgba(103,232,255,.25)]">
        <button type="button" onClick={() => setHideResult(state.sid)} aria-label={tf('viewBoard')} title={tf('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
        <Trophy className="mx-auto text-(--accent)" size={28} />
        <p className={`${KICKER} mt-3`}>RESULT</p>
        <h2 className="mt-1 text-xl font-black">{resultText()}</h2>
        <p className="mt-3 font-mono text-3xl font-black">{state.score[mySeat ?? 0]}<span className="mx-2 text-white/30">:</span>{state.score[1 - (mySeat ?? 0)]}</p>
        {me?.isHost
          ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button>
          : <p className="mt-3 text-[11px] text-white/45">{t('rematchWait')}</p>}
        {frames.length > 1 && <ReplayButton onClick={() => setReplaying(true)} className="!mt-2" />}
        <button type="button" onClick={() => setHideResult(state.sid)} className={`${BTN} mt-2 w-full py-2.5`}><Eye size={14} />{tf('viewBoard')}</button>
      </div>
    </div>
  );

  return (
    <div className={SHELL} style={{ ...accentVars(FLIP_ACCENT, FLIP_INK), backgroundImage: fog('63, 184, 255') }}>
      <RoomAlerts alerts={alerts} accent={FLIP_ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader backHref="/flip-omok" backLabel={tf('title')} title={tf('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/flip-omok" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
              <div className="min-w-0">
                <p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : state.phase === 'finished' ? 'RESULT' : tf('moveKicker', { n: state.moves + 1 })}</p>
                <h1 className={`mt-1 ${HEADING}`}>{heading}</h1>
              </div>
              {playing && <div className={timer(seconds <= 10 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex justify-center py-2"><MiniBoard rows={['.....', '.RBR.', '.....']} flip={[[1, 2]]} ring={[1, 3]} /></div>
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
                    {FLIP_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}
                  </div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSetsTime')}</p>}
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(103,232,255,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : (
              <>
                {frame && <ReplayHeader player={replay} caption={replay.at === 0 ? tc('replayStart') : t('lastMove', { player: colorName(owner(frame.board[frame.last ?? 0]) as Player), at: coordinateLabel(frame.last ?? 0) })} onClose={() => setReplaying(false)} />}
                {frame
                  ? <FlipOmokBoard board={frame.board} last={frame.last} flipped={frame.flipped} flipKey={replay.at} win={replay.at === replay.total ? state.win : null} turn={state.turn} interactive={false} banned={new Set()} onPlace={() => {}} />
                  : <FlipOmokBoard board={board} last={state.last} flipped={state.flipped} flipKey={state.moves} win={state.win} turn={state.turn}
                    interactive={myTurn} banned={banned} onPlace={(at) => dispatch({ t: 'move', at })} overlay={result} />}
                {frame && <ReplayControls player={replay} onShowResult={() => { setReplaying(false); setHideResult(null); }} />}
                {finished && !frame && !resultOpen && <div className="mx-auto mt-2 flex max-w-[440px] flex-wrap items-center justify-center gap-2">
                  <button type="button" onClick={() => setHideResult(null)} className={`${BTN} py-2.5`}><Trophy size={14} />{tc('replayShowResult')}</button>
                  {frames.length > 1 && <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-2.5`}>{tc('replayOpen')}</button>}
                  {me?.isHost && <button type="button" onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} py-2.5`}><RotateCcw size={14} />{t('rematch')}</button>}
                </div>}
                <p className="px-1 text-[11px] text-white/45">{state.last !== null ? t('lastMove', { player: colorName(owner(board[state.last]) as Player), at: coordinateLabel(state.last) }) : t('firstHint')}</p>
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
                      <Dot p={inGame ? color : ((seat + 1) as Player)} size={22} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                          {inGame && <span className="ml-auto shrink-0 font-mono text-xs font-black text-(--accent)">{state.score[seat]}</span>}
                        </div>
                        <p className="text-[11px] text-white/45">{inGame ? `${colorName(color)} · ${t('stones', { n: board.filter((c) => owner(c) === color).length })}` : occupant ? t('ready') : t('waiting')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {state.phase !== 'lobby' && <p className="mt-3 text-[11px] text-white/40">{t('turnTimeInfo', { n: state.turnSec })}{myColor !== null ? ` · ${t('youAre', { color: colorName(myColor) })}` : ''}</p>}
            </section>
            <FlipLegend />
            <FlipTips />
            {playing && mySeat !== null && (
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}
