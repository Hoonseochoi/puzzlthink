"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, Flag, History, Loader2, Lock, RotateCcw, Share2, Swords, Trophy, Users, WifiOff, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import InviteCode from '@/components/ui/InviteCode';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useMonorailRoom } from '@/hooks/useMonorailRoom';
import { inChallenge, moveText, newMonorail } from '@/lib/monorail';
import { MONORAIL_TURN_OPTIONS, colorOf, seatToMove, winnerSeat } from '@/lib/monorailRoom';
import { reportGame } from '@/lib/stats';
import { useEndReveal } from '@/hooks/useEndReveal';
import { EndRevealBanner } from '@/components/ui/EndReveal';
import { ChallengeBanner, MONORAIL_ACCENT, MONORAIL_INK, MonorailBoard, MonorailTurnDock, ResultExtras, TileDeck, TurnControls, monorailFrames, useFrameCaption, useMonorailDraft } from './MonorailParts';
import GameUpdates from '@/components/GameUpdates';
import { useChatStatus } from '@/hooks/useChatStatus';

const EMPTY_GAME = newMonorail();

export default function MonorailRoomView({ code }: { code: string }) {
  const t = useTranslations('MonorailOnline');
  const tm = useTranslations('Monorail');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useMonorailRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');
  const game = state?.game ?? EMPTY_GAME;
  const playing = state?.phase === 'playing';
  const toMove = state ? seatToMove(state) : 0;
  const myTurn = !!state && playing && mySeat === toMove;
  const draft = useMonorailDraft(game, myTurn);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    setShareUrl(`${window.location.origin}/${locale}/monorail/room/${code}`); // eslint-disable-line react-hooks/set-state-in-effect
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const winner = winnerSeat(state);
    reportGame(`monorail-friend-${state.sid}`, 'monorail', 'friend', winner === mySeat ? 'win' : 'loss', { reason: state.game.reason, moves: state.game.moveNo, turnSec: state.turnSec });
  }, [state, mySeat]);

  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  // The room chat's status line (my move / whose move); the turn clock comes from the room.
  useChatStatus(playing ? { mine: myTurn, who: myTurn ? null : seatName(toMove) } : null);
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* optional */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: tm('title'), text: t('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const commit = () => { if (draft.tiles.length) { dispatch({ t: 'move', move: draft.move }); draft.clear(); } };
  const impossible = () => { dispatch({ t: 'impossible' }); draft.clear(); };
  const prove = () => { if (draft.complete) { dispatch({ t: 'prove', tiles: draft.tiles }); draft.clear(); } };
  const giveUp = () => { if (window.confirm(tm('giveUpConfirm'))) { dispatch({ t: 'give-up' }); draft.clear(); } };
  const challenge = playing && inChallenge(game);
  // The caller is whoever is not answering: the seat opposite the side to move.
  const callerSeat = (1 - toMove) as 0 | 1;
  // 판 보기 / 복기 after the game. A rematch (new sid) brings the result popup back and ends any replay.
  const [view, setView] = useState({ sid: '', showResult: true, replaying: false });
  if (state && view.sid !== state.sid) setView({ sid: state.sid, showResult: true, replaying: false });
  const finished = state?.phase === 'finished';
  const frames = useMemo(() => monorailFrames(game), [game]);
  const replay = useReplayPlayer(frames.length - 1, view.replaying && finished, 1100);
  const frame = view.replaying && finished ? frames[replay.at] : null;
  const seatOfColor = (p: 0 | 1) => (state ? (p === 0 ? state.first : 1 - state.first) : p);
  const caption = useFrameCaption((p) => seatName(seatOfColor(p)));
  const setResult = (showResult: boolean) => setView((v) => ({ ...v, showResult, replaying: false }));
  const reasonText = !game.reason ? '' : game.reason === 'gave-up' ? `${tm('reason.gave-up')} ${game.proof ? tm('gaveUpPossible') : tm('gaveUpImpossible')}` : tm(`reason.${game.reason}`);
  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError') : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const winner = state ? winnerSeat(state) : null;
  const result = !state || state.phase !== 'finished' || winner === null ? '' : mySeat === null ? t('winner', { name: seatName(winner) }) : winner === mySeat ? tm('youWin') : t('youLose');
  // Both players see the final board a moment before the result popup (a tap skips it).
  const reveal = useEndReveal(finished && state ? state.sid : null);
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? result : challenge ? (myTurn ? tm('challengeHeading') : t('waitingFor', { name: seatName(toMove) })) : myTurn ? (draft.tiles.length ? tm('pickMore', { n: 3 - draft.tiles.length }) : tm('yourTurn')) : t('waitingFor', { name: seatName(toMove) });

  return (
    <div className={SHELL} style={{ ...accentVars(MONORAIL_ACCENT, MONORAIL_INK), backgroundImage: fog('116, 44, 52') }}>
      <Shards tint="#5e232d" /><RoomAlerts alerts={alerts} accent={MONORAIL_ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/monorail" backLabel={tc('monorail')} title={tm('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code}`}><GameUpdates game="monorail" /><BugReport /><LanguageSwitcher compact dark /></GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      {!state ? <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">{!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p> : <Link href="/monorail" className={`${BTN_ACCENT} px-4 py-2.5`}>{t('back')}</Link>}</main> : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2"><div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : state.phase === 'finished' ? tm('resultKicker') : tm('matchKicker')}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>{playing && <div className={timer(seconds <= 10 && myTurn)}><Clock3 size={14} />{seconds}</div>}</div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[480px] space-y-5 py-2">
                <div className="rounded-[16px] border border-[#f3b64a]/30 bg-black/35 p-5"><p className={PANEL_TITLE}>{t('inviteTitle')}</p><p className="mt-2 text-sm text-white/55">{t('inviteDesc')}</p><InviteCode code={code} host={me?.name} url={shareUrl} /><div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/40 p-2"><span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/60">{shareUrl}</span><button onClick={copyLink} className={BTN}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button><button onClick={shareLink} className={BTN_ACCENT}><Share2 size={14} />{t('share')}</button></div></div>
                <div className={PANEL}><p className={PANEL_TITLE}>{t('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-2">{MONORAIL_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}</div></div>
                <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2"><input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} className={INPUT} /><button className={BTN}>{t('rename')}</button></form>
                {me?.isHost ? <div><button disabled={!full} onClick={() => dispatch({ t: 'start' })} className={`w-full py-3.5 ${BTN_ACCENT} disabled:opacity-35`}>{full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}</button><p className="mt-2 text-center text-[11px] text-white/40">{full ? t('startReady') : t('startLockedHint')}</p></div> : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : <>
              {challenge && <ChallengeBanner state={game} mine={myTurn} caller={seatName(callerSeat)} answerer={seatName(toMove)} />}
              {frame && <ReplayHeader player={replay} caption={caption(frame)} onClose={() => setView((v) => ({ ...v, replaying: false }))} />}
              <div className="relative">{frame ? <MonorailBoard state={frame.state} /> : <MonorailBoard state={game} pending={draft.tiles} interactive={myTurn} onCell={draft.add} onPending={draft.remove} />}
                <EndRevealBanner show={reveal.revealing && !frame} text={`${result} · ${reasonText}`} onSkip={reveal.skip} />
                {finished && view.showResult && reveal.showResult && !frame && <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[18px] bg-[#19080d]/62 p-5 backdrop-blur-[2px]"><div className="relative w-full max-w-sm rounded-[18px] border border-[#f3b64a]/45 bg-[#241016]/95 p-6 text-center"><button type="button" onClick={() => setResult(false)} aria-label={tm('viewBoard')} title={tm('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button><Trophy size={30} className="mx-auto text-[#f3b64a]" /><h2 className="mt-3 text-2xl font-black">{result}</h2><p className="mt-2 text-sm text-white/55">{reasonText}</p>{me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-5 w-full py-3`}><RotateCcw size={14} />{tm('rematch')}</button> : <p className="mt-4 text-xs text-white/40">{t('rematchWait')}</p>}<ResultExtras canReplay={frames.length > 1} onReplay={() => setView((v) => ({ ...v, replaying: true }))} onViewBoard={() => setResult(false)} /></div></div>}
              </div>
              {frame && <ReplayControls player={replay} onShowResult={() => setResult(true)} />}
              {finished && !frame && !view.showResult && reveal.showResult && <div className="mx-auto mt-3 flex max-w-[440px] flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={() => setResult(true)} className={`${BTN} py-2.5`}><Trophy size={14} />{tc('replayShowResult')}</button>
                {frames.length > 1 && <button type="button" onClick={() => setView((v) => ({ ...v, replaying: true }))} className={`${BTN} py-2.5`}><History size={14} />{tc('replayOpen')}</button>}
                {me?.isHost && <button type="button" onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} py-2.5`}><RotateCcw size={14} />{tm('rematch')}</button>}
              </div>}
              <p className="mt-3 px-1 text-[11px] text-white/40">{game.last ? `${tm('lastMove')}: ${moveText(game.last)}` : tm('firstMove')}</p>
              {mySeat === null && <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
            </>}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}><div className="mb-2 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div><div className="space-y-2">{[0, 1].map((seat) => { const person = state.seats[seat]; return <div key={seat} data-chat-seat={person?.id} className={`${playerRow(playing && toMove === seat)} ${person ? '' : 'opacity-45'}`}><span className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-black ${colorOf(state, seat) === 0 ? 'bg-[#f3b64a] text-[#241607]' : 'bg-[#6d3140] text-[#ffd987]'}`}>{colorOf(state, seat) === 0 ? '1ST' : '2ND'}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-black">{person?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat)}</p>{seat === 0 && <Crown size={12} className="text-[#f3b64a]" />}{person && <i className={`h-1.5 w-1.5 rounded-full ${online.has(person.id) ? 'bg-[#3ddc97]' : 'bg-white/20'}`} />}</div><p className="text-[10px] text-white/40">{state.phase === 'lobby' ? person ? t('ready') : t('waiting') : colorOf(state, seat) === 0 ? tm('first') : tm('second')}</p></div></div>; })}</div>{state.phase !== 'lobby' && <div className="mt-4 border-t border-white/10 pt-4"><TileDeck used={game.tiles.length} /></div>}</section>
            {playing && <section className={`${PANEL} hidden lg:block`}><TurnControls state={game} draft={draft} disabled={!myTurn} onCommit={commit} onImpossible={impossible} onProve={prove} onGiveUp={giveUp} /></section>}
            <section className={NOTE}><h2 className={PANEL_TITLE}>{tm('quickRules')}</h2><ol className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(tm.raw('quickRuleList') as string[]).map((rule, i) => <li key={rule} className="flex gap-2"><span className="font-mono text-[#f3b64a]">0{i + 1}</span><span>{rule}</span></li>)}</ol></section>
            {playing && mySeat !== null && <button onClick={() => { if (window.confirm(tm('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`${BTN} py-2.5 text-white/45`}><Flag size={13} />{tm('resign')}</button>}
          </aside>
        </main>
      )}
      <MonorailTurnDock active={myTurn} state={game} draft={draft} onCommit={commit} onImpossible={impossible} onProve={prove} onGiveUp={giveUp} />
    </div>
  );
}
