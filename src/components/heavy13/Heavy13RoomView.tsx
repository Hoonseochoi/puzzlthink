"use client";

import BugReport from '@/components/BugReport';
import InviteCode from '@/components/ui/InviteCode';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, Bot, Check, Copy, Crown, Loader2, Share2, Sparkles, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { AiLevel } from '@/lib/heavy13';
import { H13_PLAYER_OPTIONS, H13_TURN_OPTIONS, redactH13 } from '@/lib/heavy13Room';
import { useHeavy13Room } from '@/hooks/useHeavy13Room';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import RoomAlerts from '../RoomAlerts';
import AwayBanner from '../ui/AwayBanner';
import { reportGame } from '@/lib/stats';
import { ranking } from '@/lib/heavy13';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, HEADING, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, seg } from '../ui/gameUi';
import Heavy13Result from './Heavy13Result';
import Heavy13Table from './Heavy13Table';
import { ReplayControls, ReplayHeader } from '../ui/ReplayBar';
import { useH13Replay } from './useH13Replay';
import Heavy13Tutorial from './Heavy13Tutorial';
import { H_ROOT_STYLE, SAND, SHARD_TINT } from './theme';
import GameUpdates from '@/components/GameUpdates';

const LEVELS: AiLevel[] = ['easy', 'normal', 'hard'];

export default function Heavy13RoomView({ code }: { code: string }) {
  const t = useTranslations('Heavy13');
  const to = useTranslations('Heavy13Online');
  const locale = useLocale();
  const [defaultName] = useState(() => `${to('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useHeavy13Room(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  // Report a finished game once, when the room moves into "finished".
  const prevPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = state?.phase ?? null;
    if (phase === 'finished' && prevPhase.current && prevPhase.current !== 'finished' && mySeat !== null && state) {
      const rank = ranking(state.game).indexOf(mySeat) + 1;
      reportGame(`heavy13-friend-${crypto.randomUUID()}`, 'heavy13', 'friend', rank === 1 ? 'win' : rank >= state.game.players.length - 1 ? 'loss' : 'draw', // bottom two lose, whatever the table size
        { rank, players: state.game.players.length, penalty: state.game.players[mySeat].penalty, humans: state.seats.filter((seat, i) => seat && !state.ai[i]).length });
    }
    prevPhase.current = phase;
  });

  useEffect(() => {
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/heavy13/room/${code}`);
    return () => window.clearTimeout(slow);
  }, [code, locale]);

  const online = new Set(peers.map((p) => p.id));
  const humans = state ? state.seats.filter(Boolean).length : 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 무거운 13', text: to('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } }
    copyLink();
  };
  const notice = status === 'unconfigured' ? to('unconfigured') : status === 'error' ? to('connectionError')
    : !state && waitedLong ? to('roomNotFound') : state && !me?.isHost && !hostOnline ? to('hostOffline') : null;
  // Even the host's own screen shows only what every player may see.
  const view = state ? redactH13(state) : null;
  const replay = useH13Replay(view);
  const playerCount = view?.playerCount ?? 7;
  const fillAi = view?.fillAi ?? true;
  const readyToStart = fillAi || humans === playerCount;
  const openSeats = Math.max(0, playerCount - humans);

  return (
    <div className={SHELL} style={H_ROOT_STYLE}>
      <WallGoShards tint={SHARD_TINT} />
      <RoomAlerts alerts={alerts} accent={SAND} joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/heavy13" backLabel={t('title')} title={t('title')} subtitle={`ONLINE · ${code.toUpperCase()}`}>
        <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
        <GameUpdates game="heavy13" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffb3a8] lg:px-6"><WifiOff size={14} />{notice}</p>}
      {state?.phase === 'playing' && <AwayBanner seats={state.seats} away={state.away} mySeat={mySeat} onRejoin={() => dispatch({ t: 'rejoin' })} />}

      {!view ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p>
            : <Link href="/heavy13" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{to('back')}</Link>}
        </main>
      ) : view.phase === 'lobby' ? (
        <main className="relative z-10 mx-auto grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
          <section className={`space-y-5 ${STAGE}`}>
            <div className="px-1 sm:px-2"><p className={`mb-1 ${KICKER}`}>LOBBY</p><h1 className={HEADING}>{to('lobbyTitle')}</h1></div>
            <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
              <p className={PANEL_TITLE}>{to('inviteTitle')}</p>
              <p className="mt-2 text-sm text-white/60">{to('inviteDesc')}</p>
              <InviteCode code={code} host={me?.name} url={shareUrl} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button>
                <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{to('share')}</button>
              </div>
            </div>
            <div className={`grid gap-2 ${playerCount === 4 ? 'grid-cols-2 sm:grid-cols-4' : playerCount <= 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {view.seats.slice(0, playerCount).map((seat, i) => (
                <div key={i} data-chat-seat={seat?.id} className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[0.04]' : 'border-dashed border-white/15 bg-transparent text-white/40'}`}>
                  {seat ? <UserRound size={14} /> : fillAi ? <Bot size={14} /> : <UserRound size={14} className="opacity-40" />}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t('you')})` : seat.name) : fillAi ? to('aiSeat') : to('friendSeat')}</span>
                  {i === 0 && <Crown size={11} className="text-[#f2c14e]" />}
                  {seat && <span className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className={INPUT} />
              <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{to('rename')}</button>
            </form>
            {me?.isHost
              ? <button disabled={!readyToStart} onClick={() => dispatch({ t: 'start' })} style={{ ['--ready-glow' as string]: 'rgba(230,196,138,.55)' }} className={`w-full py-3.5 text-sm ${BTN_ACCENT} ${readyToStart ? 'animate-[readyGlow_1.6s_ease-in-out_infinite]' : ''}`}>{fillAi ? (openSeats ? to('startWithAi', { n: openSeats }) : to('start')) : readyToStart ? to('startFriendsOnly', { n: playerCount }) : to('waitForFriends', { n: openSeats })}</button>
              : <p className="text-center text-sm text-white/50">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}
          </section>
          <aside className="space-y-4">
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{to('playerCount')}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">{H13_PLAYER_OPTIONS.map((count) => <button key={count} disabled={!me?.isHost || count < humans} onClick={() => dispatch({ t: 'config', playerCount: count })} className={`py-2.5 disabled:cursor-not-allowed disabled:opacity-25 ${seg(playerCount === count)}`}>{to('playersCount', { n: count })}</button>)}</div>
              <label className={`mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/25 px-3 py-2.5 ${me?.isHost ? 'cursor-pointer' : ''}`}>
                <span className="text-xs font-bold">{to('fillAi')}<span className="mt-0.5 block text-[10px] font-medium text-white/40">{to(fillAi ? 'fillAiOn' : 'fillAiOff')}</span></span>
                <input type="checkbox" checked={fillAi} disabled={!me?.isHost} onChange={(event) => dispatch({ t: 'config', fillAi: event.target.checked })} className="h-4 w-4 accent-[#e6c48a]" />
              </label>
              <p className={PANEL_TITLE}>{to('submitTime')}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">{H13_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2 disabled:cursor-default ${seg(view.turnSec === sec)}`}>{sec >= 60 ? to('minutes', { n: sec / 60 }) : to('seconds', { n: sec })}</button>)}</div>
              <p className={`${PANEL_TITLE} mt-4`}>{t('aiLevel')}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((l) => <button key={l} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', aiLevel: l })} className={`py-2 disabled:cursor-default ${seg(view.aiLevel === l)}`}>{t(`level_${l}`)}</button>)}</div>
              {!me?.isHost && <p className="mt-2 text-[10px] text-white/40">{to('hostSets')}</p>}
            </section>
            <section className={NOTE}>
              <div className="mb-3 flex items-center gap-2"><Sparkles size={15} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('quickRules')}</h2></div>
              <ol className="space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4', 'quick5'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span>{t(k)}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      ) : (
        <main className="relative z-10 mx-auto w-full max-w-[1000px] px-3 py-3 sm:px-4 sm:py-5 lg:px-6 lg:py-8">
          <section className={STAGE}>
            {replay.frame ? <>
              <ReplayHeader player={replay.player} onClose={replay.close} />
              <Heavy13Table room={replay.frame} mySeat={null} onAction={() => {}} online />
              <ReplayControls player={replay.player} onShowResult={replay.close} />
            </> : <Heavy13Table room={view} mySeat={mySeat} onAction={dispatch} online />}
          </section>
        </main>
      )}
      {showTutorial && <Heavy13Tutorial onClose={() => setShowTutorial(false)} />}
      {view?.phase === 'finished' && !replay.frame && <Heavy13Result room={view} mySeat={mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={to('rematchWait')} onReplay={replay.canReplay ? replay.open : undefined} />}
    </div>
  );
}
