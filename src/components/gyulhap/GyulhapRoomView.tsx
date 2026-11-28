"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock3, Copy, Crown, Flag, Info, Loader2, RotateCcw, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useGyulhapRoom } from '@/hooks/useGyulhapRoom';
import { GYUL_TURN_OPTIONS } from '@/lib/gyulhapRoom';
import { reportGame } from '@/lib/stats';
import { GyulBoard, GyulFound, GyulScore } from './GyulhapParts';
import { useChatStatus } from '@/hooks/useChatStatus';

const ACCENT = '#ffcf3f';
const COLORS = ['#ffcf3f', '#ff5568', '#4ac9ff', '#8ce06b'];

export default function GyulhapRoomView({ code }: { code: string }) {
  const t = useTranslations('GyulhapOnline');
  const tg = useTranslations('Gyulhap');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, hostOnline, me, mySeat, dispatch, rename } = useGyulhapRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [selection, setSelection] = useState<{ key: string; picks: number[] }>({ key: '', picks: [] });
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState(() => typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}/gyulhap/room/${code}`);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const allTied = state.winners.length === state.playerCount;
    reportGame(`gyulhap-friend-${state.sid}`, 'gyulhap', 'friend', allTied ? 'draw' : state.winners.includes(mySeat) ? 'win' : 'loss', {
      score: state.scores[mySeat], opponents: state.scores.filter((_, i) => i !== mySeat), players: state.playerCount, reason: state.reason,
    });
  }, [state, mySeat]);
  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch {} };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: tg('title'), url: shareUrl }); return; } catch {} } copy(); };

  // The room chat's status line (my move / whose move); the turn clock comes from the room. Before the early return (hook order).
  useChatStatus(state?.phase === 'playing' ? { mine: mySeat !== null && state.turn === mySeat, who: state.turn === mySeat ? null : state.seats[state.turn]?.name ?? null } : null);
  if (!state) return <div className={SHELL} style={accentVars(ACCENT, '#17120a')}><GameHeader players={roomPlayers(state)} me={mySeat} backHref="/gyulhap" backLabel={tc('gyulhap')} title={tg('title')} subtitle={`ONLINE · ${code}`} /> <main className="flex min-h-[70vh] items-center justify-center">{status === 'online' ? <Loader2 className="animate-spin" /> : <p className="flex items-center gap-2 text-sm text-white/50"><WifiOff size={15} />{t(status === 'error' ? 'connectionError' : 'connecting')}</p>}</main></div>;
  const seatName = (n: number) => state.seats[n]?.name ?? t('emptySeat');
  const activeCount = state.phase === 'lobby' ? state.seats.filter(Boolean).length : state.playerCount;
  const activeNames = Array.from({ length: state.phase === 'lobby' ? state.seats.length : state.playerCount }, (_, seat) => `${seatName(seat)}${mySeat === seat ? ` (${t('me')})` : ''}`);
  const activeScores = state.phase === 'lobby' ? Array(state.seats.length).fill(0) : state.scores.slice(0, state.playerCount);
  const selectionKey = `${state.round}-${state.turn}`;
  const selected = selection.key === selectionKey ? selection.picks : [];
  const myTurn = state.phase === 'playing' && mySeat !== null && state.turn === mySeat;
  const seconds = Math.max(0, Math.ceil((state.deadline - now) / 1000));
  const toggle = (n: number) => setSelection(() => ({ key: selectionKey, picks: selected.includes(n) ? selected.filter((x) => x !== n) : selected.length < 3 ? [...selected, n] : selected }));
  const allTied = state.phase === 'finished' && state.winners.length === state.playerCount;
  const heading = state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished'
    ? allTied ? tg('draw') : mySeat !== null && state.winners.includes(mySeat) ? tg('win') : tg('lose')
    : myTurn ? tg('yourTurn') : t('waitingFor', { player: seatName(state.turn) });
  const canStart = activeCount >= 2;

  return <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('255,207,63') }}>
    
    <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/gyulhap" backLabel={tc('gyulhap')} title={tg('title')} titleClass="font-black" subtitle={`ONLINE · 2–4 · ${code}`}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
    {!hostOnline && !me?.isHost && <p className="mx-auto mt-3 max-w-[1180px] px-4 text-xs text-[#ffb3aa]">{t('hostOffline')}</p>}
    <main className={MAIN}>
      <section className={STAGE}>
        <div className="mb-3 flex items-end justify-between gap-3 px-1"><div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : tg('round', { n: state.round })}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>{state.phase === 'playing' && <div className={timer(myTurn && seconds <= 3)}><Clock3 size={14} />0:{String(seconds).padStart(2, '0')}</div>}</div>
        {state.phase === 'lobby' ? <div className="mx-auto max-w-md space-y-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('inviteTitle')}</p><InviteCode code={code} host={me?.name} url={shareUrl} /><div className="mt-3 flex gap-2"><button onClick={copy} className={`${BTN} flex-1`}><Copy size={14} />{copied ? t('copied') : t('copy')}</button><button onClick={share} className={`${BTN_ACCENT} flex-1`}><Share2 size={14} />{t('share')}</button></div></section>
          <form onSubmit={(e) => { e.preventDefault(); rename(name); setName(''); }} className="flex gap-2"><input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder={me?.name ?? ''} maxLength={16} /><button className={BTN}>{t('rename')}</button></form>
          {me?.isHost ? <><button disabled={!canStart} onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 disabled:opacity-35`}><Swords size={15} />{canStart ? t('startCount', { n: activeCount }) : t('startLocked')}</button><p className="text-center text-[11px] text-white/40">{t('freeStartHint')}</p></> : <p className="text-center text-sm text-white/45">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
        </div> : <div className="space-y-3"><GyulScore names={activeNames} scores={activeScores} active={state.phase === 'playing' ? state.turn : undefined} /><GyulBoard cards={state.cards} selected={selected} onSelect={toggle} disabled={!myTurn} />
          {state.phase === 'playing' && <GyulFound cards={state.cards} found={state.found} title={tg('foundTitle')} empty={tg('foundEmpty')} className="lg:hidden" />}
          {state.phase === 'playing' && mySeat !== null && <div className="grid grid-cols-3 gap-2"><button title={tg('tooltips.hap')} disabled={!myTurn || selected.length !== 3} onClick={() => dispatch({ t: 'hap', picks: [...selected].sort((a, b) => a - b) as [number, number, number] })} className={`${BTN_ACCENT} py-3 disabled:opacity-35`}>{tg('hap')}</button><button title={tg('tooltips.gyeol')} disabled={!myTurn} onClick={() => dispatch({ t: 'gyeol' })} className={`${BTN} py-3`}>{tg('gyeol')}</button><button title={tg('tooltips.pass')} disabled={!myTurn} onClick={() => dispatch({ t: 'pass' })} className={`${BTN} py-3`}>{tg('pass')}</button></div>}
          {state.phase === 'finished' && (me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="text-center text-xs text-white/45">{t('rematchWait')}</p>)}
        </div>}
      </section>
      <aside className="flex flex-col gap-4">{state.phase === 'playing' && <GyulFound cards={state.cards} found={state.found} title={tg('foundTitle')} empty={tg('foundEmpty')} className="hidden lg:block" />}<section className={PANEL}><div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{t('players')}</p><span className={CHIP}><Users size={12} />{activeCount}/4</span></div>{Array.from({ length: state.phase === 'lobby' ? 4 : state.playerCount }, (_, seat) => <div key={seat} data-chat-seat={state.seats[seat]?.id} className={`${playerRow(state.turn === seat && state.phase === 'playing')} mb-2`}><span className="h-3 w-3 rounded-full" style={{ background: COLORS[seat] }} /><span className="min-w-0 flex-1 truncate text-sm font-black">{seatName(seat)}</span>{seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}</div>)}</section>
        {me?.isHost && state.phase !== 'playing' && <section className={PANEL}><p className={PANEL_TITLE}>{t('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{GYUL_TURN_OPTIONS.map((sec) => <button key={sec} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2 ${seg(state.turnSec === sec)}`}>{sec}s</button>)}</div></section>}
        <section className={PANEL}><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.16em] text-white/35"><Info size={12} />{tg('tooltipsTitle')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(tg.raw('roomTips') as string[]).map((tip) => <li key={tip}>· {tip}</li>)}</ul></section>
        <section className={NOTE}><p className={PANEL_TITLE}>{tg('quickRules')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(tg.raw('quick') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul></section>
        {state.phase === 'playing' && mySeat !== null && <button onClick={() => window.confirm(t('resignConfirm')) && dispatch({ t: 'resign' })} className={`${BTN} text-white/50`}><Flag size={13} />{t('resign')}</button>}
      </aside>
    </main>
  </div>;
}
