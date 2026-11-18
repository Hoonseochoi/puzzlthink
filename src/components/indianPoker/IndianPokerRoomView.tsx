"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock3, Copy, Crown, Flag, Info, Loader2, RotateCcw, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomEmotes from '@/components/RoomEmotes';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useIndianPokerRoom } from '@/hooks/useIndianPokerRoom';
import { maxMatchableBet } from '@/lib/indianPoker';
import { POKER_TURN_OPTIONS } from '@/lib/indianPokerRoom';
import { reportGame } from '@/lib/stats';
import { PokerHistory, PokerTable } from './IndianPokerParts';

const ACCENT = '#e6b94f';

export default function IndianPokerRoomView({ code }: { code: string }) {
  const t = useTranslations('IndianPokerOnline');
  const tg = useTranslations('IndianPoker');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename, emote } = useIndianPokerRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState(() => typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}/indian-poker/room/${code}`);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    reportGame(`indian-poker-friend-${state.sid}`, 'indian_poker', 'friend', state.winner === 'draw' ? 'draw' : state.winner === mySeat ? 'win' : 'loss', { chips: state.chips[mySeat], against: state.chips[1 - mySeat], hands: state.rounds.length, reason: state.reason });
  }, [state, mySeat]);
  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch {} };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: tg('title'), url: shareUrl }); return; } catch {} } copy(); };

  if (!state) return <div className={SHELL} style={accentVars(ACCENT, '#17120a')}><GameHeader backHref="/indian-poker" backLabel={tc('indianPoker')} title={tg('title')} subtitle={`ONLINE · ${code}`} /><main className="flex min-h-[70vh] items-center justify-center">{status === 'online' ? <Loader2 className="animate-spin" /> : <p className="flex items-center gap-2 text-sm text-white/50"><WifiOff size={15} />{t(status === 'error' ? 'connectionError' : 'connecting')}</p>}</main></div>;
  const seatName = (n: number) => state.seats[n]?.name ?? t('emptySeat');
  const me2 = (mySeat ?? 0) as 0 | 1;
  const opp = (1 - me2) as 0 | 1;
  const names: [string, string] = [`${seatName(me2)}${mySeat !== null ? ` (${t('me')})` : ''}`, seatName(opp)];
  const cards = [state.cards[me2], state.cards[opp]] as [number, number];
  const bets = [state.bets[me2], state.bets[opp]] as [number, number];
  const chips = [state.chips[me2], state.chips[opp]] as [number, number];
  const myTurn = state.phase === 'playing' && mySeat !== null && state.turn === mySeat;
  const reveal = state.phase === 'reveal' || state.phase === 'finished';
  const current = Math.max(...state.bets), max = maxMatchableBet(state.chips, state.bets);
  const toCall = mySeat === null ? 0 : Math.max(0, current - state.bets[mySeat]);
  const targets = state.opened ? [current, current + 1, current + 3, max] : [1,3,5,max];
  const unique = [...new Set(targets.filter((n) => n >= (state.opened ? current : 1) && n <= max))];
  const seconds = Math.max(0, Math.ceil((state.deadline - now) / 1000));
  const full = state.seats.every(Boolean);
  const last = state.rounds.at(-1);
  const heading = state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished'
    ? state.winner === 'draw' ? tg('draw') : state.winner === mySeat ? tg('win') : tg('lose')
    : state.phase === 'reveal' && last ? (last.winner === 'draw' ? tg('handDraw') : last.winner === mySeat ? tg('handWin') : tg('handLose'))
      : myTurn ? tg('yourTurn') : t('waitingFor', { player: seatName(state.turn) });

  return <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('230,185,79') }}>
    <RoomEmotes peers={peers} onEmote={emote} />
    <GameHeader backHref="/indian-poker" backLabel={tc('indianPoker')} title={tg('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code}`}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
    {!hostOnline && !me?.isHost && <p className="mx-auto mt-3 max-w-[1180px] px-4 text-xs text-[#ffb3aa]">{t('hostOffline')}</p>}
    <main className={MAIN}><section className={STAGE}>
      <div className="mb-3 flex items-end justify-between gap-3 px-1"><div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : tg('hand', { n: state.rounds.length + (state.phase === 'playing' ? 1 : 0) })}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>{state.phase === 'playing' && <div className={timer(myTurn && seconds <= 8)}><Clock3 size={14} />0:{String(seconds).padStart(2,'0')}</div>}</div>
      {state.phase === 'lobby' ? <div className="mx-auto max-w-md space-y-4"><section className={PANEL}><p className={PANEL_TITLE}>{t('inviteTitle')}</p><InviteCode code={code} /><div className="mt-3 flex gap-2"><button onClick={copy} className={`${BTN} flex-1`}><Copy size={14} />{copied ? t('copied') : t('copy')}</button><button onClick={share} className={`${BTN_ACCENT} flex-1`}><Share2 size={14} />{t('share')}</button></div></section><form onSubmit={(e) => { e.preventDefault(); rename(name); setName(''); }} className="flex gap-2"><input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder={me?.name ?? ''} /><button className={BTN}>{t('rename')}</button></form>{me?.isHost ? <button disabled={!full} onClick={() => dispatch({ t:'start' })} className={`${BTN_ACCENT} w-full py-3 disabled:opacity-35`}><Swords size={15} />{full ? t('start') : t('startLocked')}</button> : <p className="text-center text-sm text-white/45">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}</div>
      : <div className="space-y-3"><div title={tg('tooltips.table')}><PokerTable cards={cards} names={names} reveal={reveal} bets={bets} chips={chips} carry={state.carry} /></div>{myTurn && <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{unique.map((total) => <button key={total} title={tg(state.opened && total === current ? 'tooltips.call' : total === max ? 'tooltips.allIn' : 'tooltips.bet')} onClick={() => dispatch({ t:'bet', total })} className={`${state.opened && total === current ? BTN_ACCENT : BTN} py-3 text-xs`}>{state.opened && total === current ? tg('call', { n: current - state.bets[mySeat!] }) : total === max ? tg('allIn', { n: total - state.bets[mySeat!] }) : tg('bet', { n: total })}</button>)}{state.opened && toCall > 0 && <button title={tg('tooltips.fold')} onClick={() => dispatch({ t:'fold' })} className={`${BTN} py-3 text-xs text-[#ff9aa4]`}>{tg('fold')}</button>}</div>}{state.phase === 'finished' && (me?.isHost ? <button onClick={() => dispatch({ t:'start' })} className={`${BTN_ACCENT} w-full py-3`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="text-center text-xs text-white/45">{t('rematchWait')}</p>)}</div>}
    </section><aside className="flex flex-col gap-4"><section className={PANEL}><div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{t('players')}</p><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>{[0,1].map((seat) => <div key={seat} className={`${playerRow(state.turn === seat && state.phase === 'playing')} mb-2`}><span className="h-3 w-3 rounded-full" style={{ background: seat ? '#ff5568' : ACCENT }} /><span className="min-w-0 flex-1 truncate text-sm font-black">{seatName(seat)}</span>{seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}</div>)}</section>
      {me?.isHost && state.phase !== 'playing' && state.phase !== 'reveal' && <section className={PANEL}><p className={PANEL_TITLE}>{t('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{POKER_TURN_OPTIONS.map((sec) => <button key={sec} onClick={() => dispatch({ t:'config', turnSec: sec })} className={`py-2 ${seg(state.turnSec === sec)}`}>{sec}s</button>)}</div></section>}
      <section className={PANEL}><p className={PANEL_TITLE}>{tg('history')}</p><div className="mt-3"><PokerHistory rounds={state.rounds} /></div></section><section className={PANEL}><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.16em] text-white/35"><Info size={12} />{tg('tooltipsTitle')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(tg.raw('tips') as string[]).map((tip) => <li key={tip}>· {tip}</li>)}</ul></section><section className={NOTE}><p className={PANEL_TITLE}>{tg('quickRules')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(tg.raw('quick') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul></section>{(state.phase === 'playing' || state.phase === 'reveal') && mySeat !== null && <button onClick={() => window.confirm(t('resignConfirm')) && dispatch({ t:'resign' })} className={`${BTN} text-white/50`}><Flag size={13} />{t('resign')}</button>}</aside></main>
  </div>;
}
