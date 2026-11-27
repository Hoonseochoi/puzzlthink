"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bot, Check, Copy, Crown, Loader2, Share2, Star, UserRound, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import AwayBanner from '@/components/ui/AwayBanner';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, HEADING, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { Link } from '@/i18n/routing';
import { useFourThreeRoom } from '@/hooks/useFourThreeRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { FT_HUMANS, FT_TURN_OPTIONS, missionSucceeded, outcomeFor } from '@/lib/fourThreeRoom';
import { reportGame } from '@/lib/stats';
import { REVEAL_MS } from '@/hooks/useEndReveal';
import { FT_ACCENT, FT_INK } from './FourThreeParts';
import FourThreeResult from './FourThreeResult';
import FourThreeTable from './FourThreeTable';
import GameUpdates from '@/components/GameUpdates';

/** Friend / open room: two or three people (an ally AI fills the third seat) against the Special Guest AI. */
export default function FourThreeRoomView({ code }: { code: string }) {
  const t = useTranslations('FourThree');
  const to = useTranslations('FourThreeOnline');
  const locale = useLocale();
  const [defaultName] = useState(() => `${to('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useFourThreeRoom(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  // Report a finished game once, when the room moves into "finished".
  const prevPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = state?.phase ?? null;
    if (phase === 'finished' && prevPhase.current && prevPhase.current !== 'finished' && mySeat !== null && state && !state.ai[mySeat]) {
      reportGame(`four-three-friend-${state.sid}-${mySeat}`, 'four_three', 'friend', outcomeFor(state, mySeat), {
        mission: missionSucceeded(state) ? 'ok' : 'fail', pieces: state.pieces[mySeat], humans: state.seats.filter((s, i) => s && !state.ai[i]).length,
      }, { revealDelayMs: REVEAL_MS + 300 });
    }
    prevPhase.current = phase;
  });

  useEffect(() => {
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/four-three/room/${code}`);
    return () => window.clearTimeout(slow);
  }, [code, locale]);

  const online = new Set(peers.map((p) => p.id));
  const humans = state ? state.seats.slice(0, FT_HUMANS).filter(Boolean).length : 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t('title')}`, text: to('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } }
    copyLink();
  };
  const notice = status === 'unconfigured' ? to('unconfigured') : status === 'error' ? to('connectionError')
    : !state && waitedLong ? to('roomNotFound') : state && !me?.isHost && !hostOnline ? to('hostOffline') : null;
  const canStart = humans >= 2;

  return (
    <div className={SHELL} style={{ ...accentVars(FT_ACCENT, FT_INK), backgroundImage: fog('255, 181, 46') }}>
      <Shards />
      <RoomAlerts alerts={alerts} accent={FT_ACCENT} joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/four-three" backLabel={t('title')} title={t('title')} subtitle={`ONLINE · ${code.toUpperCase()}`}>
        <GameUpdates game="four_three" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffb3a8] lg:px-6"><WifiOff size={14} />{notice}</p>}
      {state?.phase === 'playing' && <AwayBanner seats={state.seats} away={state.away} mySeat={mySeat} onRejoin={() => dispatch({ t: 'rejoin' })} />}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p>
            : <Link href="/four-three" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{to('back')}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <main className="relative z-10 mx-auto grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
          <section className={`space-y-5 ${STAGE}`}>
            <div className="px-1 sm:px-2"><p className={`mb-1 ${KICKER}`}>LOBBY</p><h1 className={HEADING}>{to('lobbyTitle')}</h1></div>
            <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
              <p className={PANEL_TITLE}>{to('inviteTitle')}</p>
              <p className="mt-2 text-sm text-white/60">{to('inviteDesc')}</p>
              <InviteCode code={code} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button type="button" onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button>
                <button type="button" onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{to('share')}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {state.seats.slice(0, FT_HUMANS).map((seat, i) => (
                <div key={i} data-chat-seat={seat?.id} className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[0.04]' : 'border-dashed border-white/15 bg-transparent text-white/40'}`}>
                  {seat ? <UserRound size={14} /> : <Bot size={14} />}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t('you')})` : seat.name) : to('allySeat')}</span>
                  {i === 0 && <Crown size={11} className="text-[#f2c14e]" />}
                  {seat && <span className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-[10px] border border-[#ff4d5e]/40 bg-[#ff4d5e]/10 px-3 py-2.5 text-[#ff8b96]">
                <Star size={14} /><span className="min-w-0 flex-1 truncate text-xs font-bold">{to('guestSeat')}</span>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className={INPUT} />
              <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{to('rename')}</button>
            </form>
            {me?.isHost
              ? <button type="button" disabled={!canStart} onClick={() => dispatch({ t: 'start' })} className={`w-full py-3.5 text-sm ${BTN_ACCENT}`}>{!canStart ? to('needTwo') : humans < FT_HUMANS ? to('startWithAlly') : to('start')}</button>
              : <p className="text-center text-sm text-white/50">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}
          </section>
          <aside className="space-y-4">
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{to('turnTime')}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">{FT_TURN_OPTIONS.map((sec) => <button key={sec} type="button" disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2 disabled:cursor-default ${seg(state.turnSec === sec)}`}>{to('seconds', { n: sec })}</button>)}</div>
              {!me?.isHost && <p className="mt-2 text-[10px] text-white/40">{to('hostSets')}</p>}
            </section>
            <section className={NOTE}>
              <h2 className={PANEL_TITLE}>{t('quickRules')}</h2>
              <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(k)}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      ) : (
        <main className="relative z-10 mx-auto w-full max-w-[860px] px-3 py-3 sm:px-4 sm:py-5 lg:py-8">
          <section className={STAGE}><FourThreeTable room={state} mySeat={mySeat} onAction={dispatch} /></section>
        </main>
      )}
      {state?.phase === 'finished' && <FourThreeResult room={state} mySeat={mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={to('rematchWait')} exitPath="/four-three" />}
    </div>
  );
}
