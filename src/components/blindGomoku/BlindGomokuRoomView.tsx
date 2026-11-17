"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, EyeOff, Flag, Loader2, Lock, RotateCcw, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { reportGame } from '@/lib/stats';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { STONE_COLORS, colorsInPlay, findWinningLine, type StoneColor } from '@/lib/blindGomoku';
import { BG_TURN_OPTIONS, REVEALS, ownerOf, roomPlayableColors, seatToMove } from '@/lib/blindGomokuRoom';
import BlindGomokuBoard from './BlindGomokuBoard';
import BlindStone from './BlindStone';
import { ColorPicker, ReplayBar, useReplay } from './BlindParts';

const ACCENT = '#ffd166';

export default function BlindGomokuRoomView({ code }: { code: string }) {
  const t = useTranslations('BlindGomokuOnline');
  const tb = useTranslations('BlindGomoku');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useBlindGomokuRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [color, setColor] = useState<StoneColor>('red');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/blind-gomoku/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const moves = state?.moves ?? [];
  const finished = state?.phase === 'finished';
  const gameKey = state ? `${state.sid}-${state.first}-${state.phase}-${moves.length}` : '';
  const replay = useReplay(moves, finished, gameKey);

  // Record a finished game once for each player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const mine = ownerOf(state, mySeat);
    reportGame(`blind_gomoku-friend-${state.sid}-${state.first}-${state.moves.length}-${state.reason}`, 'blind_gomoku', 'friend',
      state.winner === 'draw' ? 'draw' : state.winner === mine ? 'win' : 'loss',
      { reason: state.reason, colors: state.colorCount ?? 7, mustChange: !!state.mustChange, moves: state.moves.length, turnSec: state.turnSec });
  }, [state, mySeat]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const names = [0, 1].map((seat) => (state?.seats[seat]?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat)));
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const toMove = state ? seatToMove(state) : 0;
  const myTurn = !!state && state.phase === 'playing' && mySeat === toMove;
  const iAmBlack = !!state && mySeat !== null && ownerOf(state, mySeat) === 'black';
  const peeking = myTurn && !!state && now < state.revealUntil;
  const peekSeconds = state ? Math.max(0, Math.ceil((state.revealUntil - now) / 1000)) : 0;
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const copyColor = state && moves.length % 2 === 1 ? moves.at(-1)!.color : null; // white must copy this
  const colorCount = state?.colorCount ?? STONE_COLORS.length;
  const mustChange = !!state?.mustChange;
  const playable = state ? roomPlayableColors(state) : colorsInPlay(colorCount);
  const blackColor = playable.includes(color) ? color : playable[0]; // picked colour, kept within the rule

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 블라인드 오목', text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  const resultText = () => {
    if (!state) return '';
    if (state.winner === 'draw') return tb('draw');
    const winnerSeat = state.winner === 'black' ? state.first : 1 - state.first;
    const reason = state.reason === 'resign' ? t('byResign') : state.reason === 'timeout' ? t('byTimeout') : t('byFive');
    return mySeat === null ? t('winnerIs', { player: seatName(winnerSeat), reason }) : winnerSeat === mySeat ? t('youWin', { reason }) : t('youLose', { reason });
  };
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : finished ? resultText()
    : peeking ? tb('revealing', { seconds: peekSeconds }) : myTurn ? (iAmBlack ? tb('yourTurn') : t('yourTurnWhite')) : t('waitingFor', { player: seatName(toMove) });

  const boardMoves = finished ? moves.slice(0, replay.step) : moves;
  const replayLine = finished ? findWinningLine(boardMoves, boardMoves.at(-1)) : null;
  const flipped = finished ? replay.truth : peeking;
  const place = (row: number, col: number) => dispatch({ t: 'place', row, col, color: iAmBlack ? blackColor : undefined });

  // The host sets the colour rule in the lobby, or between games before a rematch.
  const colorRulePanel = state && (
      <div className={PANEL}>
        <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{tb('colorRule')}</p><span className="text-[10px] font-bold text-white/35">{tb('colorCountValue', { count: colorCount })}</span></div>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {[2, 3, 4, 5, 6, 7].map((n) => <button key={n} disabled={!me?.isHost} aria-pressed={colorCount === n} onClick={() => dispatch({ t: 'config', colorCount: n })} className={`py-2 font-mono ${seg(colorCount === n)} disabled:cursor-default`}>{n}</button>)}
        </div>
        <label className={`mt-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2.5 text-xs font-bold ${me?.isHost ? 'cursor-pointer' : ''}`}>
          <span>{tb('mustChange')}<span className="mt-0.5 block text-[10px] font-medium text-white/40">{tb('mustChangeDesc')}</span></span>
          <input type="checkbox" checked={mustChange} disabled={!me?.isHost} onChange={(event) => dispatch({ t: 'config', mustChange: event.target.checked })} className="h-4 w-4 accent-[#ffd166]" />
        </label>
        <p className="mt-2 text-[11px] text-white/40">{me?.isHost ? t('colorRuleHost') : t('colorRuleGuest')}</p>
      </div>
  );

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('190, 132, 35') }}>
      <Shards />
      <RoomAlerts alerts={alerts} accent={ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader backHref="/blind-gomoku" backLabel={tc('blindGomoku')} title={tb('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/blind-gomoku" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
              <div className="min-w-0">
                <p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : finished ? tb('resultKicker') : tb('turnKicker', { turn: Math.floor(moves.length / 2) + 1 })}</p>
                <h1 className={`mt-1 ${HEADING}`}>{heading}</h1>
              </div>
              {state.phase === 'playing' && <div className={timer(seconds <= 10 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}
              {finished && <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${replay.truth ? 'border-[#ffd166]/60 bg-[#ffd166]/15 text-[#ffe6a1]' : 'border-white/10 bg-black/40 text-white/45'}`}>{replay.truth ? <Eye size={15} /> : <EyeOff size={15} />}{replay.truth ? tb('truthVisible') : tb('colorsOnly')}</div>}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex justify-center gap-3 py-2">
                  <div className="h-16 w-16"><BlindStone color="#ef4957" owner="black" /></div>
                  <span className="self-center font-mono text-sm font-black text-white/30">VS</span>
                  <div className="h-16 w-16"><BlindStone color="#ef4957" owner="white" /></div>
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
                    {BG_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}
                  </div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSetsTime')}</p>}
                </div>
                {colorRulePanel}
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(255,209,102,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : (
              <>
                <BlindGomokuBoard moves={boardMoves} flipped={flipped} interactive={myTurn && !peeking} previewColor={iAmBlack ? blackColor : (copyColor ?? blackColor)} winningLine={finished ? replayLine : null} onPlace={place} />
                {finished && <ReplayBar moves={moves} replay={replay} />}
                {mySeat === null && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  const owner = ownerOf(state, seat);
                  return (
                    <div key={seat} className={`${playerRow(state.phase === 'playing' && toMove === seat)} ${occupant ? '' : 'opacity-50'}`}>
                      <div className="h-10 w-10 shrink-0"><BlindStone color={seat === 0 ? '#ef4957' : '#4e87ed'} owner={owner} revealed={state.phase !== 'lobby'} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{state.phase === 'lobby' ? (occupant ? t('ready') : t('waiting')) : owner === 'black' ? t('blackRole') : t('whiteRole')}</p>
                      </div>
                      {state.phase !== 'lobby' && <span className="font-mono text-[10px] text-white/45" title={t('peeksLeft')}><Eye size={11} className="mr-1 inline" />{state.reveals[seat]}/{REVEALS}</span>}
                    </div>
                  );
                })}
              </div>
              {state.phase !== 'lobby' && <p className="mt-3 text-[11px] text-white/40">{t('turnTimeInfo', { n: state.turnSec })}</p>}
              {state.phase !== 'lobby' && <p className="mt-1 text-[11px] text-white/40">{tb('colorCountValue', { count: colorCount })}{mustChange ? ` · ${tb('mustChange')}` : ''}</p>}
            </section>

            {state.phase === 'playing' && mySeat !== null && <>
              <ColorPicker selected={blackColor} onSelect={setColor} disabled={!myTurn || peeking} locked={iAmBlack ? null : copyColor} note={iAmBlack ? t('blackPicks') : t('whiteCopies')}
                colors={colorsInPlay(colorCount)} blocked={iAmBlack && mustChange ? moves.at(-1)?.color : null} />
              <section className="rounded-[14px] border border-[#ffd166]/30 bg-[#ffd166]/[.07] p-4">
                <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('peekTitle')}</p><span className="rounded-md border border-[#ffd166]/30 bg-black/25 px-2 py-1 font-mono text-[10px] font-black text-[#ffe39a]">{tb('usesLeft', { count: state.reveals[mySeat] })}</span></div>
                <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('peekDesc')}</p>
                <button type="button" onClick={() => dispatch({ t: 'reveal' })} disabled={!myTurn || peeking || state.reveals[mySeat] <= 0 || moves.length === 0} className={`${BTN_ACCENT} mt-3 w-full py-3`}>
                  {peeking ? <EyeOff size={15} /> : <Eye size={15} />}{peeking ? tb('revealingButton', { seconds: peekSeconds }) : tb('revealButton')}
                </button>
              </section>
            </>}

            {finished && me?.isHost && colorRulePanel}
            {finished && me?.isHost && <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t('rematch')}</button>}
            {finished && !me?.isHost && <p className="text-center text-[11px] text-white/40">{t('rematchWait')}</p>}

            <section className={NOTE}>
              <h2 className={PANEL_TITLE}>{tb('quickRules')}</h2>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
            </section>
            {state.phase === 'playing' && mySeat !== null && (
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}
