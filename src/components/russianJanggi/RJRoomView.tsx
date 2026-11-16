"use client";

import BugReport from '@/components/BugReport';
import InviteCode from '@/components/ui/InviteCode';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Crown, Eye, Flag, Loader2, Lock, Share2, Swords, Users, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Side } from '@/lib/russianJanggi';
import { useRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { reportGame } from '@/lib/stats';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import RoomAlerts from '../RoomAlerts';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, SHELL, STAGE, playerRow } from '../ui/gameUi';
import RJPiece from './RJPiece';
import RJResult from './RJResult';
import RJTable from './RJTable';
import TurnClock from './TurnClock';
import { RESULT_DELAY_MS, RulesPanel } from './RJGame';
import RJReplay from './RJReplay';
import { RJ_PANEL, RJ_ROOT, RJ_SHARD, RJ_TITLE, SIDE_COLORS } from './theme';

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
  const [resultFor, setResultFor] = useState<string | null>(null); // game key whose result popup is open
  const [replayFor, setReplayFor] = useState<string | null>(null); // game key being replayed
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

  // Each finished game gets a key, so a rematch starts with the popup closed again.
  const finishedKey = state?.phase === 'finished' && state.game ? `${state.sid}-${state.first}-${state.game.moves?.length ?? 0}-${state.game.reason}` : null;
  // Leave the final board up for a moment before the result pops up.
  useEffect(() => {
    if (!finishedKey) return;
    const timer = window.setTimeout(() => setResultFor(finishedKey), RESULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [finishedKey]);
  const showReplay = !!finishedKey && replayFor === finishedKey;

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
    <div className={SHELL} style={RJ_ROOT}>
      <WallGoShards tint={RJ_SHARD} />
      <RoomAlerts alerts={alerts} accent="#f2b84b" joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader backHref="/russian-janggi" backLabel={tg('title')} title={tg('title')} subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state || !game ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/russian-janggi" className={`${BTN_ACCENT} !px-4 !py-2.5 !text-sm`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className={`mb-1 ${KICKER}`}>{state.phase === 'lobby' ? 'LOBBY' : `MOVE ${String(game.ply + 1).padStart(2, '0')}`}</p>
                <h1 className={`flex items-center gap-2 truncate ${HEADING}`}>
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
                <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                  <p className={RJ_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`${BTN} shrink-0`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className={`${BTN_ACCENT} shrink-0`}><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`${BTN} shrink-0 !px-4 !py-2.5`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(242,184,75,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>
                )}
              </div>
            ) : (
              <>
                {showReplay
                  ? <RJReplay game={game} viewer={viewer} names={[names[0], names[1]]} onShowResult={() => { setReplayFor(null); setResultFor(finishedKey); }} onClose={() => setReplayFor(null)} />
                  : <RJTable game={game} viewer={viewer} canAct={myTurn} onAction={(action) => dispatch({ t: 'act', action })} names={[names[0], names[1]]} />}
                {skipNote && <p className="mx-auto mt-3 max-w-[440px] rounded-md border border-(--accent)/30 bg-(--accent)/10 px-3 py-2 text-center text-xs font-bold text-[#ffdc95]">{skipNote}</p>}
                {mySeat === null && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={RJ_PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={RJ_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const active = state.phase === 'playing' && game.turn === seat;
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} className={`${playerRow(active)} ${occupant ? '' : 'opacity-50'}`}>
                      <RJPiece owner={seat as Side} size={1} className="h-9 w-9 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[seat]}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-(--accent)" aria-label={t('host')} />}
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
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`${BTN} !py-2.5 !text-white/45 hover:!text-white`}><Flag size={13} />{tg('resign')}</button>
            )}
          </aside>
        </main>
      )}

      {state?.phase === 'finished' && game && resultFor === finishedKey && !showReplay && (
        <RJResult game={game} viewer={mySeat} names={state.seats.map((seat) => seat?.name ?? '')}
          onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t('rematchWait')} exitPath="/russian-janggi"
          onReplay={() => { setResultFor(null); setReplayFor(finishedKey); }} onClose={() => setResultFor(null)} />
      )}
    </div>
  );
}
