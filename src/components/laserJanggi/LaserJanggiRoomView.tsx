"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, Clock3, Copy, Crown, Flag, Loader2, Lock, RotateCcw, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { legalActions, type LaserAction } from '@/lib/laserJanggi';
import { LASER_TURN_OPTIONS } from '@/lib/laserJanggiRoom';
import LaserBoard from './LaserBoard';
import LaserPiece from './LaserPiece';
import { LASER_CYAN } from './theme';

export default function LaserJanggiRoomView({ code }: { code: string }) {
  const t = useTranslations('LaserJanggiOnline');
  const tg = useTranslations('LaserJanggi');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useLaserJanggiRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- share URLs require the browser origin
    setShareUrl(`${window.location.origin}/${locale}/laser-janggi/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: tg('title'), text: t('shareText'), url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError') : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const animating = !!state && now < state.shotAt + 900;
  const myTurn = !!state && state.phase === 'playing' && mySeat === state.current && !animating;
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const selected = state?.pieces.find((item) => item.id === selectedId) ?? null;
  const rotations = state && selected ? legalActions(state.pieces, state.current).filter((a) => a.type === 'rotate' && a.pieceId === selected.id) : [];
  const play = (action: LaserAction) => { if (myTurn) { setSelectedId(null); dispatch({ t: 'play', action }); } };
  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const result = !state ? '' : state.reason === 'turn-limit' ? t('draw') : state.winner === null ? '' : `${seatName(state.winner)} · ${state.reason === 'king' ? t('byKing') : state.reason === 'resign' ? t('byResign') : t('byTimeout')}`;
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? result : animating ? tg('laserFiring') : myTurn ? t('yourTurn') : t('waitingFor', { player: seatName(state.current) });

  return <div className={SHELL} style={{ ...accentVars(LASER_CYAN, '#041015'), backgroundImage: fog('35, 190, 220') }}>
    <Shards /><RoomAlerts alerts={alerts} accent={LASER_CYAN} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
    <GameHeader backHref="/laser-janggi" backLabel={tc('laserJanggi')} title={tg('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
    {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}
    {!state ? <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">{!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p> : <Link href="/laser-janggi" className={BTN_ACCENT}>{t('back')}</Link>}</main> :
    <main className={MAIN}>
      <section className={STAGE}>
        <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2"><div><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : state.phase === 'finished' ? tg('result') : tg('turn', { turn: state.turn })}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>{state.phase === 'playing' && <div className={timer(seconds <= 10 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`}</div>}</div>
        {state.phase === 'lobby' ? <div className="mx-auto max-w-[460px] space-y-5 py-3">
          <div className="flex justify-center gap-3"><div className="h-16 w-16"><LaserPiece piece={{ id:'lobby-b',owner:0,type:'laser',row:0,col:0,direction:1 }} /></div><span className="self-center font-mono font-black text-white/25">VS</span><div className="h-16 w-16"><LaserPiece piece={{ id:'lobby-r',owner:1,type:'laser',row:0,col:0,direction:3 }} /></div></div>
          <div className={PANEL}><p className={PANEL_TITLE}>{t('inviteTitle')}</p><p className="mt-2 text-sm text-white/55">{t('inviteDesc')}</p><InviteCode code={code} /><div className="mt-4 flex gap-2 rounded-md border border-white/10 bg-black/40 p-2"><span className="min-w-0 flex-1 truncate px-2 py-2 font-mono text-xs text-white/60">{shareUrl}</span><button onClick={copyLink} className={BTN}>{copied ? <Check size={14} /> : <Copy size={14} />}</button><button onClick={shareLink} className={BTN_ACCENT}><Share2 size={14} />{t('share')}</button></div></div>
          <div className={PANEL}><p className={PANEL_TITLE}>{t('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-2">{LASER_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t:'config', turnSec:sec })} className={`py-2.5 ${seg(state.turnSec === sec)}`}>{t('seconds',{n:sec})}</button>)}</div></div>
          <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex gap-2"><input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} className={INPUT} /><button className={BTN}>{t('rename')}</button></form>
          {me?.isHost ? <button onClick={() => dispatch({t:'start'})} disabled={!full} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-black ${full ? 'bg-[#59e6ff] text-[#041015]' : 'border border-dashed border-white/20 text-white/35'}`}>{full ? <Swords size={16}/> : <Lock size={15}/>} {full ? t('start') : t('startLocked')}</button> : <p className="text-center text-sm text-white/45">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
        </div> : <><LaserBoard pieces={state.pieces} current={state.current} interactive={myTurn} selectedId={selectedId} shot={state.shot} onSelect={(id) => setSelectedId((v) => v === id ? null : id)} onMove={play} />{selected && myTurn && <div className="mx-auto mt-3 flex max-w-[700px] items-center justify-between rounded-[10px] border border-[#59e6ff]/20 bg-black/50 px-3 py-2"><span className="text-xs font-black">{tg(`pieces.${selected.type}.name`)}</span><div className="flex gap-2"><button onClick={() => { const a=rotations.find((x) => x.type==='rotate'&&x.delta===-1); if(a) play(a); }} className={BTN}><ChevronLeft size={15}/>{tg('rotateLeft')}</button><button onClick={() => { const a=rotations.find((x) => x.type==='rotate'&&x.delta===1); if(a) play(a); }} className={BTN}>{tg('rotateRight')}<ChevronRight size={15}/></button></div></div>}</>}
      </section>
      <aside className="flex flex-col gap-4">
        <section className={PANEL}><div className="mb-3 flex justify-between"><p className={PANEL_TITLE}>{t('players')}</p><span className={CHIP}><Users size={12}/>{state.seats.filter(Boolean).length}/2</span></div>{[0,1].map((seat) => { const p=state.seats[seat]; return <div key={seat} className={`${playerRow(state.phase==='playing'&&state.current===seat)} ${p?'':'opacity-45'}`}><span className="h-8 w-8"><LaserPiece piece={{id:`seat-${seat}`,owner:seat as 0|1,type:'king',row:0,col:0,direction:0}} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{seatName(seat)}{p?.id===me?.id?` (${t('me')})`:''}</p><p className="text-[10px] text-white/40">{seat===0?t('cyanRole'):t('redRole')}</p></div>{seat===0&&<Crown size={12} className="text-[#ffd166]"/>}{p&&<span className={`h-1.5 w-1.5 rounded-full ${online.has(p.id)?'bg-[#3ddc97]':'bg-white/20'}`}/>}</div>; })}</section>
        <section className={NOTE}><p className={PANEL_TITLE}>{tg('quickRules')}</p><ol className="mt-3 space-y-3 text-xs leading-5 text-white/60">{['quick1','quick2','quick3','quick4'].map((key,i)=><li key={key} className="flex gap-3"><span className="font-mono text-[#59e6ff]">0{i+1}</span>{tg(key)}</li>)}</ol></section>
        {state.phase==='finished'&&me?.isHost&&<button onClick={() => dispatch({t:'start'})} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14}/>{t('rematch')}</button>}
        {state.phase==='playing'&&mySeat!==null&&<button onClick={() => { if(window.confirm(t('resignConfirm'))) dispatch({t:'resign'}); }} className={`${BTN} py-2.5 text-white/45`}><Flag size={13}/>{t('resign')}</button>}
        <div className="rounded-[12px] border border-white/10 bg-black/25 p-3 text-[10px] leading-4 text-white/35">{t('timeoutRule')}</div>
      </aside>
    </main>}
  </div>;
}
