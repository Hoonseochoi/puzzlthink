"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Bot, Check, Copy, Crown, Loader2, Share2, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { reportGame } from '@/lib/stats';
import { RR_TURN_OPTIONS, type RRLevel } from '@/lib/russianRouletteRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import RoomAlerts from '../RoomAlerts';
import RussianRouletteResult from './RussianRouletteResult';
import RussianRouletteTable from './RussianRouletteTable';
import RussianRouletteTutorial from './RussianRouletteTutorial';
import { RR_BG, RR_PANEL, RR_TITLE } from './theme';

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

  return <div className="min-h-screen text-[#edf5f7]" style={{ background: RR_BG }}>
    <RoomAlerts alerts={alerts} accent="#65e5ff" joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 py-2 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/russian-roulette" className="text-white/65 hover:text-white"><ArrowLeft size={17} /></Link><span className="h-5 w-px bg-white/15" /><strong className="truncate text-lg font-black sm:text-xl">{t('title')}</strong><span className="hidden font-mono text-[9px] font-black tracking-[.18em] text-[#65e5ff]/60 sm:inline">ONLINE · {code.toUpperCase()}</span></div><div className="flex items-center gap-1.5"><button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/75"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button><LanguageSwitcher compact dark /></div></header>
    {notice && <p className="mx-auto mt-4 flex max-w-[1240px] items-center gap-2 px-4 text-xs text-[#ff948d]"><WifiOff size={14} />{notice}</p>}
    {!state ? <main className="flex min-h-[65vh] items-center justify-center px-4">{!notice ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p> : <Link href="/russian-roulette" className="rounded-[12px] bg-[#65e5ff] px-4 py-2.5 text-sm font-black text-[#071016]">{to('back')}</Link>}</main>
      : state.phase === 'lobby' ? <main className="mx-auto grid w-full max-w-[1050px] gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8"><section className={`${RR_PANEL} p-5 sm:p-6`}><h1 className="text-2xl font-black">{to('lobbyTitle')}</h1><div className="mt-4 rounded-[15px] border border-[#65e5ff]/20 bg-black/25 p-4"><p className={RR_TITLE}>{to('inviteTitle')}</p><p className="mt-2 text-xs leading-5 text-white/45">{to('inviteDesc')}</p><div className="mt-3 rounded-[12px] border border-white/10 bg-[#080c12] p-3"><p className="text-[9px] font-black tracking-widest text-white/25">INVITE CODE</p><p className="mt-1 font-mono text-3xl font-black uppercase tracking-[.25em] text-[#ffcf58]">{code}</p></div><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-[10px] border border-white/10 py-2.5 text-xs font-bold">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button><button onClick={shareLink} className="flex items-center justify-center gap-2 rounded-[10px] bg-[#65e5ff] py-2.5 text-xs font-black text-[#071016]"><Share2 size={14} />{to('share')}</button></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{state.seats.map((seat, i) => <div key={i} className={`flex min-w-0 items-center gap-2 rounded-[11px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>{seat ? <UserRound size={13} /> : <Bot size={13} />}<span className="min-w-0 flex-1 truncate text-[11px] font-bold">{seat ? seat.id === me?.id ? `${seat.name} (${t('you')})` : seat.name : to('aiSeat')}</span>{i === 0 && <Crown size={10} className="text-[#ffcf58]" />}{seat && <i className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#56db9a]' : 'bg-white/20'}`} />}</div>)}</div><form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="mt-4 flex gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className="min-w-0 flex-1 rounded-[11px] border border-white/10 bg-black/25 px-3 py-2.5 text-sm outline-none focus:border-[#65e5ff]/50" /><button className="rounded-[11px] border border-white/10 px-4 text-xs font-bold">{to('rename')}</button></form>{me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className="mt-4 w-full rounded-[13px] bg-[#65e5ff] py-3.5 text-sm font-black text-[#071016]">{humans < 6 ? to('startWithAi', { n: 6 - humans }) : to('start')}</button> : <p className="mt-4 text-center text-sm text-white/40">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}</section><aside className="space-y-4"><section className={RR_PANEL}><p className={RR_TITLE}>{to('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-2">{RR_TURN_OPTIONS.map((seconds) => <button key={seconds} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: seconds })} className={`rounded-[9px] py-2 text-xs font-black ${state.turnSec === seconds ? 'bg-white text-[#091019]' : 'border border-white/10 text-white/40'}`}>{seconds}s</button>)}</div><p className={`${RR_TITLE} mt-5`}>{t('aiLevel')}</p><div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((level) => <button key={level} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', aiLevel: level })} className={`rounded-[9px] py-2 text-xs font-black ${state.aiLevel === level ? 'bg-white text-[#091019]' : 'border border-white/10 text-white/40'}`}>{t(`level_${level}`)}</button>)}</div></section><section className={RR_PANEL}><p className={RR_TITLE}>{t('quickRules')}</p><ol className="mt-3 space-y-2 text-xs leading-5 text-white/50">{[1, 2, 3, 4].map((n) => <li key={n} className="flex gap-2"><span className="font-mono text-[#65e5ff]">0{n}</span>{t(`quick${n}`)}</li>)}</ol></section></aside></main>
        : <main className="mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-5 lg:py-7"><RussianRouletteTable room={state} mySeat={mySeat} onAction={dispatch} online /></main>}
    {showTutorial && <RussianRouletteTutorial onClose={() => setShowTutorial(false)} />}
    {state?.phase === 'finished' && <RussianRouletteResult room={state} mySeat={mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={to('rematchWait')} />}
  </div>;
}
