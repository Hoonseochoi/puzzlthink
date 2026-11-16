"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Bot, Check, Copy, Crown, Loader2, Share2, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { AiLevel } from '@/lib/heavy13';
import { H13_TURN_OPTIONS, redactH13 } from '@/lib/heavy13Room';
import { useHeavy13Room } from '@/hooks/useHeavy13Room';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import RoomAlerts from '../RoomAlerts';
import { reportGame } from '@/lib/stats';
import { ranking } from '@/lib/heavy13';
import LanguageSwitcher from '../LanguageSwitcher';
import Heavy13Result from './Heavy13Result';
import Heavy13Table from './Heavy13Table';
import Heavy13Tutorial from './Heavy13Tutorial';
import { H_PANEL, H_TITLE, QUARRY_BG } from './theme';

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
      reportGame(`heavy13-friend-${crypto.randomUUID()}`, 'heavy13', 'friend', rank === 1 ? 'win' : rank >= 6 ? 'loss' : 'draw', { rank, penalty: state.game.players[mySeat].penalty, humans: state.ai.filter((a) => !a).length });
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

  return (
    <div className="relative min-h-screen bg-[#0e1013] text-[#eef0f3]" style={{ backgroundImage: QUARRY_BG }}>
      <RoomAlerts alerts={alerts} accent="#e6c48a" joinText={(name) => to('joined', { name })} leaveText={(name) => to('left', { name })} />
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/heavy13" className="text-white/70 hover:text-white"><ArrowLeft size={17} /></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className="text-xl font-black tracking-tight">{t('title')}</strong>
          <span className="hidden text-[9px] font-bold tracking-[0.18em] text-[#e6c48a]/70 sm:inline">ONLINE · {code.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
          <LanguageSwitcher compact dark />
        </div>
      </header>
      {notice && <p className="mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffb3a8]"><WifiOff size={14} />{notice}</p>}

      {!view ? (
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{to('connecting')}</p>
            : <Link href="/heavy13" className="rounded-[12px] bg-[#e6c48a] px-4 py-2.5 text-sm font-black text-[#2a2118]">{to('back')}</Link>}
        </main>
      ) : view.phase === 'lobby' ? (
        <main className="mx-auto grid w-full max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-5 px-3 py-5 sm:px-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4 rounded-[20px] border border-white/10 bg-black/20 p-4 sm:p-6">
            <h1 className="text-xl font-black">{to('lobbyTitle')}</h1>
            <div className="rounded-[16px] border border-[#e6c48a]/30 bg-black/40 p-4">
              <p className={H_TITLE}>{to('inviteTitle')}</p>
              <p className="mt-2 text-sm text-white/60">{to('inviteDesc')}</p>
              <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#0e1013] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? to('copied') : to('copy')}</button>
                <button onClick={shareLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#e6c48a] px-3 py-2 text-xs font-black text-[#2a2118]"><Share2 size={14} />{to('share')}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {view.seats.map((seat, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-[12px] border px-3 py-2.5 ${seat ? 'border-white/20 bg-white/[0.05]' : 'border-dashed border-white/15 bg-transparent text-white/40'}`}>
                  {seat ? <UserRound size={14} /> : <Bot size={14} />}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t('you')})` : seat.name) : to('aiSeat')}</span>
                  {i === 0 && <Crown size={11} className="text-[#e6c48a]" />}
                  {seat && <span className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#34c47c]' : 'bg-white/25'}`} />}
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={to('nickname')} className="min-w-0 flex-1 rounded-[12px] border border-white/10 bg-[#0e1013] px-3 py-2.5 text-sm outline-none focus:border-[#e6c48a]/60" />
              <button type="submit" className="rounded-[12px] border border-white/15 bg-white/5 px-4 text-xs font-bold">{to('rename')}</button>
            </form>
            {me?.isHost
              ? <button onClick={() => dispatch({ t: 'start' })} className="w-full rounded-[14px] bg-[#e6c48a] py-3.5 text-sm font-black text-[#2a2118]">{humans < 7 ? to('startWithAi', { n: 7 - humans }) : to('start')}</button>
              : <p className="text-center text-sm text-white/50">{mySeat === null ? to('roomFull') : to('waitingHost')}</p>}
          </section>
          <aside className="space-y-4">
            <section className={H_PANEL}>
              <p className={H_TITLE}>{to('submitTime')}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">{H13_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`rounded-[10px] py-2 text-xs font-black ${view.turnSec === sec ? 'bg-white text-[#0e1013]' : 'border border-white/10 text-white/50'}`}>{sec >= 60 ? to('minutes', { n: sec / 60 }) : to('seconds', { n: sec })}</button>)}</div>
              <p className={`${H_TITLE} mt-4`}>{t('aiLevel')}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((l) => <button key={l} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', aiLevel: l })} className={`rounded-[10px] py-2 text-xs font-black ${view.aiLevel === l ? 'bg-white text-[#0e1013]' : 'border border-white/10 text-white/50'}`}>{t(`level_${l}`)}</button>)}</div>
              {!me?.isHost && <p className="mt-2 text-[10px] text-white/40">{to('hostSets')}</p>}
            </section>
            <section className="rounded-[16px] border border-white/10 bg-black/30 p-5">
              <h2 className={H_TITLE}>{t('quickRules')}</h2>
              <ol className="mt-3 space-y-2 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4', 'quick5'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-[#e6c48a]">0{i + 1}</span><span>{t(k)}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1000px] px-3 py-4 sm:px-4 lg:py-8">
          <section className="rounded-[20px] border border-white/10 bg-black/20 p-3 sm:p-5">
            <Heavy13Table room={view} mySeat={mySeat} onAction={dispatch} online />
          </section>
        </main>
      )}
      {showTutorial && <Heavy13Tutorial onClose={() => setShowTutorial(false)} />}
      {view?.phase === 'finished' && <Heavy13Result room={view} mySeat={mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={to('rematchWait')} exitPath="/heavy13" />}
    </div>
  );
}
