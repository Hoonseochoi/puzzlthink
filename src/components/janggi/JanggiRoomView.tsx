"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, Clock3, Copy, Crown, Eye, Flag, Loader2, Lock, Share2, Swords, Users, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Side } from '@/lib/janggi';
import { TURN_OPTIONS } from '@/lib/janggiRoom';
import { useJanggiRoom } from '@/hooks/useJanggiRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import RoomAlerts from '../RoomAlerts';
import LanguageSwitcher from '../LanguageSwitcher';
import JanggiPiece from './JanggiPiece';
import JanggiResult from './JanggiResult';
import JanggiTable from './JanggiTable';
import { GOLD_TEXT, J_PANEL, J_TITLE, JANGGI_FOG, SIDE_COLORS, hanjaFont } from './theme';

export default function JanggiRoomView({ code }: { code: string }) {
  const t = useTranslations('JanggiOnline');
  const tj = useTranslations('Janggi');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useJanggiRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/janggi/room/${code}`);
    return () => { window.clearInterval(timer); window.clearTimeout(slow); };
  }, [code, locale]);

  const viewer: Side = mySeat ?? 0;
  const online = new Set(peers.map((peer) => peer.id));
  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const names = [0, 1].map((seat) => (state?.seats[seat]?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat)));
  const full = !!state && state.seats.every(Boolean);
  const game = state?.game;
  const myTurn = !!state && state.phase === 'playing' && mySeat !== null && game?.turn === mySeat;
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 十二將棋', text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? tj('gameOver') : myTurn ? tj('yourTurn') : t('waitingFor', { player: seatName(game!.turn) });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0c10] text-[#eceff4]" style={{ backgroundImage: JANGGI_FOG }}>
      <RoomAlerts alerts={alerts} accent="#e8c170" joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/janggi" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className={`${hanjaFont.className} ${GOLD_TEXT} text-xl tracking-[0.18em]`}>十二將棋</strong>
          <span className="hidden text-[9px] font-bold tracking-[0.18em] text-[#e8c170]/70 sm:inline">ONLINE · 1:1 · {code.toUpperCase()}</span>
        </div>
        <LanguageSwitcher compact dark />
      </header>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1100px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state || !game ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/janggi" className="rounded-[12px] bg-[#e8c170] px-4 py-2.5 text-sm font-black text-[#1a1408]">{t('back')}</Link>}
        </main>
      ) : (
        <main className="relative z-10 mx-auto grid w-full max-w-[1100px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
          <section className="rounded-[20px] border border-white/10 bg-white/[0.02] p-3 sm:p-5">
            <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#e8c170]">{state.phase === 'lobby' ? 'LOBBY' : `MOVE ${String(game.ply + 1).padStart(2, '0')}`}</p>
                <h1 className="mt-1 truncate text-lg font-extrabold tracking-tight">{heading}</h1>
              </div>
              {state.phase === 'playing' && (
                <div className={`flex min-w-[78px] items-center justify-center gap-2 rounded-full px-3 py-2 font-mono text-sm font-bold ${seconds <= 10 && myTurn ? 'animate-pulse bg-[#ff5b3a] text-white' : 'border border-white/15 bg-black/50 text-white/80'}`}>
                  <Clock3 size={14} />{`${String(Math.floor(seconds / 60)).padStart(1, '0')}:${String(seconds % 60).padStart(2, '0')}`}
                </div>
              )}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex justify-center gap-3 py-2">
                  <JanggiPiece type="wang" owner={0} className="h-16 w-16" />
                  <span className={`${hanjaFont.className} self-center text-2xl text-white/30`}>對</span>
                  <JanggiPiece type="wang" owner={1} flipped className="h-16 w-16" />
                </div>
                <div className="rounded-[16px] border border-[#e8c170]/30 bg-black/40 p-5">
                  <p className={J_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#0a0c10] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#e8c170] px-3 py-2 text-xs font-black text-[#1a1408]"><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <div className={J_PANEL}>
                  <p className={J_TITLE}>{t('turnTime')}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {TURN_OPTIONS.map((sec) => (
                      <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`rounded-[10px] py-2.5 text-sm font-black transition ${state.turnSec === sec ? 'bg-white text-[#0a0c10]' : 'border border-white/10 bg-white/[0.03] text-white/50 enabled:hover:text-white'} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>
                    ))}
                  </div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSetsTime')}</p>}
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className="min-w-0 flex-1 rounded-[12px] border border-white/10 bg-[#0a0c10] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e8c170]/60" />
                  <button type="submit" className="shrink-0 rounded-[12px] border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10">{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(232,193,112,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-black transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-[#e8c170] text-[#1a1408] hover:bg-[#f3d38d]' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-[#e8c170]' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>
                )}
              </div>
            ) : (
              <>
                <JanggiTable game={game} viewer={viewer} canAct={myTurn} onAction={(action) => dispatch({ t: 'act', action })} />
                {mySeat === null && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={J_PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={J_TITLE}>{t('players')}</h2><span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const active = state.phase === 'playing' && game.turn === seat;
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} className={`flex items-center gap-3 rounded-[12px] border p-3 ${active ? 'border-[#e8c170]/50 bg-white/[0.04]' : 'border-transparent'} ${occupant ? '' : 'opacity-50'}`}>
                      <JanggiPiece type="wang" owner={seat as Side} showReading={false} className="h-10 w-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#e8c170]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{state.phase === 'lobby' ? (occupant ? t('ready') : t('waiting')) : state.first === seat ? t('firstMover') : t('secondMover')}</p>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: SIDE_COLORS[seat] }} />
                    </div>
                  );
                })}
              </div>
              {state.phase !== 'lobby' && <p className="mt-3 text-[11px] text-white/40">{t('turnTimeInfo', { n: state.turnSec })}</p>}
            </section>
            <section className="rounded-[16px] border border-white/10 bg-black/40 p-5">
              <h2 className={J_TITLE}>{tj('quickRules')}</h2>
              <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-[#e8c170]">0{i + 1}</span><span>{tj(key)}</span></li>)}</ol>
              <p className="mt-3 text-[11px] text-white/40">{t('timeoutRule')}</p>
            </section>
            {state.phase === 'playing' && mySeat !== null && (
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className="flex items-center justify-center gap-2 rounded-[12px] border border-white/10 py-2.5 text-xs font-bold text-white/45 hover:text-white"><Flag size={13} />{tj('resign')}</button>
            )}
          </aside>
        </main>
      )}

      {state?.phase === 'finished' && game && (
        <JanggiResult game={game} viewer={mySeat} names={state.seats.map((seat) => seat?.name ?? '')}
          onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} againLabel={t('rematch')} waitingLabel={t('rematchWait')} exitPath="/janggi" />
      )}
    </div>
  );
}
