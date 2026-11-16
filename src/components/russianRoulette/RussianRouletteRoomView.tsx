"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, Bot, Check, Copy, Crown, Loader2, Share2, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { reportGame } from '@/lib/stats';
import { RR_TURN_OPTIONS, type RRLevel } from '@/lib/russianRouletteRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL, seg } from '../ui/gameUi';
import RoomAlerts from '../RoomAlerts';
import RussianRouletteResult from './RussianRouletteResult';
import RussianRouletteTable from './RussianRouletteTable';
import RussianRouletteTutorial from './RussianRouletteTutorial';
import { RR_ACCENT, RR_ROOT_STYLE, RR_SHARD_TINT } from './theme';

const LEVELS: RRLevel[] = ['easy', 'normal', 'hard'];

export default function RussianRouletteRoomView({ code }: { code: string }) {
  const t = useTranslations('RussianRoulette');
  const to = useTranslations('RussianRouletteOnline');
  const locale = useLocale();
  const [defaultName] = useState(() => `${to('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useRussianRouletteRoom(code, defaultName);
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
      reportGame(`russian_roulette-friend-${crypto.randomUUID()}`, 'russian_roulette', 'friend', state.game.hits.includes(mySeat) ? 'loss' : 'win', { humans: state.ai.filter((a) => !a).length });
    }
    prevPhase.current = phase;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => { setWaitedLong(true); setShareUrl(`${window.location.origin}/${locale}/russian-roulette/room/${code}`); }, 0);
    return () => window.clearTimeout(timer);
  }, [code, locale]);

  const online = new Set(peers.map((peer) => peer.id));
  const humans = state?.seats.filter(Boolean).length ?? 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t('title')}`, text: to('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const notice = status === 'unconfigured' ? to('unconfigured') : status === 'error' ? to('connectionError') : !state && waitedLong ? to('roomNotFound') : state && !me?.isHost && !hostOnline ? to('hostOffline') : null;

  return <div className={SHELL} style={RR_ROOT_STYLE}>
    <WallGoShards tint={RR_SHARD_TINT} />
    <RoomAlerts alerts={alerts} accent={RR_ACCENT} joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
    <GameHeader backHref="/russian-roulette" backLabel={t('title')} title={t('title')} subtitle={<span className="font-mono">ONLINE · {code.toUpperCase()}</span>}>
      <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
      <LanguageSwitcher compact dark />
    </GameHeader>
    {notice && <p className="relative z-10 mx-auto mt-4 flex max-w-[1240px] items-center gap-2 px-4 text-xs text-[#ff948d]"><WifiOff size={14} />{notice}</p>}
    {!state ? <main className="relative z-10 flex min-h-[65vh] items-center justify-center px-4">{!notice ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p> : <Link href="/russian-roulette" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{to('back')}</Link>}</main>
      : state.phase === 'lobby' ? <main className="relative z-10 mx-auto grid w-full max-w-[1050px] gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8">
        <section className={STAGE}>
          <p className={KICKER}>LOBBY</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#eef1f7] sm:text-2xl">{to('lobbyTitle')}</h1>
          <div className={`mt-4 border-(--accent)/30 p-4 sm:p-5 ${WELL}`}>
            <p className={PANEL_TITLE}>{to('inviteTitle')}</p>
            <p className="mt-2 text-xs leading-5 text-white/50">{to('inviteDesc')}</p>
            <div className="mt-3 rounded-md border border-white/10 bg-[#0b0b0e] p-3"><p className="text-[9px] font-black tracking-widest text-white/25">INVITE CODE</p><p className="mt-1 font-mono text-3xl font-black uppercase tracking-[.25em] text-(--accent)">{code}</p></div>
            <div className="mt-2 grid grid-cols-2 gap-2"><button onClick={copyLink} className={`py-2.5 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button><button onClick={shareLink} className={`py-2.5 ${BTN_ACCENT}`}><Share2 size={14} />{to('share')}</button></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{state.seats.map((seat, i) => <div key={i} className={`flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>{seat ? <UserRound size={13} /> : <Bot size={13} />}<span className="min-w-0 flex-1 truncate text-[11px] font-bold">{seat ? seat.id === me?.id ? `${seat.name} (${t('you')})` : seat.name : to('aiSeat')}</span>{i === 0 && <Crown size={10} className="text-[#f2c14e]" />}{seat && <i className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/20'}`} />}</div>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="mt-4 flex gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className={INPUT} /><button className={`px-4 ${BTN}`}>{to('rename')}</button></form>
          {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`mt-4 w-full py-3.5 text-sm ${BTN_ACCENT}`}>{humans < 6 ? to('startWithAi', { n: 6 - humans }) : to('start')}</button> : <p className="mt-4 text-center text-sm text-white/40">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}
        </section>
        <aside className="space-y-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{to('turnTime')}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">{RR_TURN_OPTIONS.map((seconds) => <button key={seconds} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: seconds })} className={`py-2 ${seg(state.turnSec === seconds)}`}>{seconds}s</button>)}</div>
            <p className={`${PANEL_TITLE} mt-5`}>{t('aiLevel')}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((level) => <button key={level} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', aiLevel: level })} className={`py-2 ${seg(state.aiLevel === level)}`}>{t(`level_${level}`)}</button>)}</div>
          </section>
          <section className={NOTE}><p className={PANEL_TITLE}>{t('quickRules')}</p><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{[1, 2, 3, 4].map((n) => <li key={n} className="flex gap-3"><span className="font-mono text-(--accent)">0{n}</span><span>{t(`quick${n}`)}</span></li>)}</ol></section>
        </aside>
      </main>
        : <main className="relative z-10 mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-5 lg:py-7"><RussianRouletteTable room={state} mySeat={mySeat} onAction={dispatch} online /></main>}
    {showTutorial && <RussianRouletteTutorial onClose={() => setShowTutorial(false)} />}
    {state?.phase === 'finished' && <RussianRouletteResult room={state} mySeat={mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={to('rematchWait')} />}
  </div>;
}
