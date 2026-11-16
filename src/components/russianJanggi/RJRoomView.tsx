"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, Copy, Crown, Eye, Flag, Loader2, Lock, Share2, Swords, Users, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Side } from '@/lib/russianJanggi';
import { useRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { reportGame } from '@/lib/stats';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import RoomAlerts from '../RoomAlerts';
import LanguageSwitcher from '../LanguageSwitcher';
import RJPiece from './RJPiece';
import RJResult from './RJResult';
import RJTable from './RJTable';
import TurnClock from './TurnClock';
import { RulesPanel } from './RJGame';
import { ACCENT_TEXT, RJ_FOG, RJ_PANEL, RJ_TITLE, SIDE_COLORS } from './theme';

export default function RJRoomView({ code }: { code: string }) {
  const t = useTranslations('RussianJanggiOnline');
  const tg = useTranslations('RussianJanggi');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useRussianJanggiRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [skipNote, setSkipNote] = useState<string | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  // Report a finished game once, when the room moves into "finished".
  const prevPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = state?.phase ?? null;
    if (phase === 'finished' && prevPhase.current && prevPhase.current !== 'finished' && mySeat !== null && state) {
      reportGame(`russian_janggi-friend-${crypto.randomUUID()}`, 'russian_janggi', 'friend', state.game.winner === null ? 'draw' : state.game.winner === mySeat ? 'win' : 'loss', { reason: state.game.reason, moves: state.game.ply });
    }
    prevPhase.current = phase;
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/russian-janggi/room/${code}`);
    return () => { window.clearInterval(timer); window.clearTimeout(slow); };
  }, [code, locale]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const names = [0, 1].map((seat) => (state?.seats[seat]?.id === me?.id ? `${seatName(seat)} (${t('me')})` : seatName(seat))) as [string, string];

  // Briefly say when someone's turn was skipped (time ran out or no legal placement).
  const lastPly = useRef(-1);
  useEffect(() => {
    const game = state?.game;
    if (!game || game.ply === lastPly.current) return;
    lastPly.current = game.ply;
    if (game.skipped === null || state?.phase !== 'playing') return;
    const note = tg('skipped', { player: seatName(game.skipped) });
    const show = window.setTimeout(() => setSkipNote(note), 0);
    const hide = window.setTimeout(() => setSkipNote(null), 2200);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  });

  const viewer: Side = mySeat ?? 0;
  const online = new Set(peers.map((peer) => peer.id));
  const full = !!state && state.seats.every(Boolean);
  const game = state?.game;
  const myTurn = !!state && state.phase === 'playing' && mySeat !== null && game?.turn === mySeat;

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${tg('title')}`, text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : state.phase === 'finished' ? tg('gameOver') : myTurn ? tg('yourTurn') : t('waitingFor', { player: seatName(game!.turn) });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0a0c] text-[#eceff4]" style={{ backgroundImage: RJ_FOG }}>
      <RoomAlerts alerts={alerts} accent="#f2b84b" joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/russian-janggi" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className={`${ACCENT_TEXT} text-xl font-black tracking-[-0.02em]`}>{tg('title')}</strong>
          <span className="hidden text-[9px] font-bold tracking-[0.18em] text-[#f2b84b]/70 sm:inline">ONLINE · 1:1 · {code.toUpperCase()}</span>
        </div>
        <LanguageSwitcher compact dark />
      </header>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1100px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state || !game ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/russian-janggi" className="rounded-[12px] bg-[#f2b84b] px-4 py-2.5 text-sm font-black text-[#1d1405]">{t('back')}</Link>}
        </main>
      ) : (
        <main className="relative z-10 mx-auto grid w-full max-w-[1100px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
          <section className="rounded-[20px] border border-white/10 bg-white/[0.02] p-3 sm:p-5">
            <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#f2b84b]">{state.phase === 'lobby' ? 'LOBBY' : `MOVE ${String(game.ply + 1).padStart(2, '0')}`}</p>
                <h1 className="mt-1 flex items-center gap-2 truncate text-lg font-extrabold tracking-tight">
                  {state.phase === 'playing' && <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: SIDE_COLORS[game.turn], boxShadow: `0 0 10px ${SIDE_COLORS[game.turn]}` }} />}
                  {heading}
                </h1>
              </div>
              {state.phase === 'playing' && <TurnClock remainingMs={state.deadline - now} urgent={myTurn} />}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex items-end justify-center gap-2 py-2">
                  <RJPiece owner={0} size={2} className="h-16 w-16" />
                  <span className="self-center px-2 text-lg font-black text-white/30">VS</span>
                  <RJPiece owner={1} size={2} className="h-16 w-16" />
                </div>
                <div className="rounded-[16px] border border-[#f2b84b]/30 bg-black/40 p-5">
                  <p className={RJ_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#0b0a0c] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#f2b84b] px-3 py-2 text-xs font-black text-[#1d1405]"><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className="min-w-0 flex-1 rounded-[12px] border border-white/10 bg-[#0b0a0c] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2b84b]/60" />
                  <button type="submit" className="shrink-0 rounded-[12px] border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10">{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(242,184,75,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-black transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-[#f2b84b] text-[#1d1405] hover:bg-[#ffcd6e]' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-[#f2b84b]' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>
                )}
              </div>
            ) : (
              <>
                <RJTable game={game} viewer={viewer} canAct={myTurn} onAction={(action) => dispatch({ t: 'act', action })} names={[names[0], names[1]]} />
                {skipNote && <p className="mx-auto mt-3 max-w-[440px] rounded-[12px] border border-[#f2b84b]/30 bg-[#f2b84b]/10 px-3 py-2 text-center text-xs font-bold text-[#ffdc95]">{skipNote}</p>}
                {mySeat === null && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={RJ_PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={RJ_TITLE}>{t('players')}</h2><span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const active = state.phase === 'playing' && game.turn === seat;
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} className={`flex items-center gap-3 rounded-[12px] border p-3 ${active ? 'border-[#f2b84b]/50 bg-white/[0.04]' : 'border-transparent'} ${occupant ? '' : 'opacity-50'}`}>
                      <RJPiece owner={seat as Side} size={1} className="h-9 w-9 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2b84b]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{state.phase === 'lobby' ? (occupant ? t('ready') : t('waiting')) : state.first === seat ? t('firstMover') : t('secondMover')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <RulesPanel extra={t('timeoutRule')} />
            {state.phase === 'playing' && mySeat !== null && (
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className="flex items-center justify-center gap-2 rounded-[12px] border border-white/10 py-2.5 text-xs font-bold text-white/45 hover:text-white"><Flag size={13} />{tg('resign')}</button>
            )}
          </aside>
        </main>
      )}

      {state?.phase === 'finished' && game && (
        <RJResult game={game} viewer={mySeat} names={state.seats.map((seat) => seat?.name ?? '')}
          onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t('rematchWait')} exitPath="/russian-janggi" />
      )}
    </div>
  );
}
