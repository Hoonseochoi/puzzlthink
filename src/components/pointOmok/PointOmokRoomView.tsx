"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Copy, Crown, Loader2, Lock, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResultActions from '@/components/ResultActions';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, INPUT, MAIN, PANEL, PANEL_TITLE, RESULT_PRIMARY, SHELL, STAGE, accentVars, fog, playerRow } from '@/components/ui/gameUi';
import { usePointOmokRoom } from '@/hooks/usePointOmokRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { reportGame } from '@/lib/stats';
import PoTable from './PoTable';
import { PO_ACCENT, PO_INK, PoStone } from './PoParts';

const PATH = '/point-omok';

export default function PointOmokRoomView({ code }: { code: string }) {
  const t = useTranslations('PointOmokOnline');
  const tp = useTranslations('PointOmok');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = usePointOmokRoom(code, defaultName);
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}${PATH}/room/${code}`);
    return () => window.clearTimeout(slow);
  }, [code, locale]);

  // Record a finished match once for each player.
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    reportGame(`point_omok-friend-${state.sid}-${state.rounds.length}-${state.reason}`, 'point_omok', 'friend',
      state.winner === 'draw' ? 'draw' : state.winner === mySeat ? 'win' : 'loss', { reason: state.reason, rounds: state.rounds.length, fives: state.fives });
  }, [state, mySeat]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${tc('pointOmok')}`, text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };
  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  return (
    <div className={SHELL} style={{ ...accentVars(PO_ACCENT, PO_INK), backgroundImage: fog('255, 93, 143') }}>
      <Shards />
      <RoomAlerts alerts={alerts} accent={PO_ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref={PATH} backLabel={tc('pointOmok')} title={tp('title')} subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href={PATH} className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mx-auto max-w-[460px] space-y-5 py-2">
              <div className="flex justify-center gap-3 py-2">
                <span className="h-14 w-14"><PoStone seat={0} /></span>
                <span className="self-center font-mono text-sm font-black text-white/30">VS</span>
                <span className="h-14 w-14"><PoStone seat={1} /></span>
              </div>
              <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                <p className={PANEL_TITLE}>{t('inviteTitle')}</p>
                <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                <InviteCode code={code} />
                <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                  <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                  <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t('share')}</button>
                </div>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
              </form>
              {me?.isHost ? (
                <div className="space-y-2">
                  <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(255,93,143,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                    {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                  </button>
                  <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                </div>
              ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
            </div>
          </section>
          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} data-chat-seat={occupant?.id} className={`${playerRow(false)} ${occupant ? '' : 'opacity-50'}`}>
                      <span className="h-9 w-9 shrink-0"><PoStone seat={seat} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{seatName(seat)}{occupant?.id === me?.id ? ` (${t('me')})` : ''}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{occupant ? t('ready') : t('waiting')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-white/40">{t('firstChooser')}</p>
            </section>
          </aside>
        </main>
      ) : (
        <PoTable
          state={state} mySeat={mySeat} dispatch={dispatch} names={[seatName(0), seatName(1)]}
          onResign={() => { if (window.confirm(tp('resignConfirm'))) dispatch({ t: 'resign' }); }}
          resultActions={<ResultActions won={mySeat === null ? undefined : state.winner === mySeat} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t('rematchWait')} gamePath={PATH} exitPath={PATH} primaryClass={RESULT_PRIMARY} />}
          asideExtra={(
            <section className={PANEL}>
              <div className="flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}>{code.toUpperCase()}</span></div>
              <div className="mt-2 space-y-1">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  return <p key={seat} data-chat-seat={occupant?.id} className="flex items-center gap-2 text-xs"><span className="h-4 w-4"><PoStone seat={seat} /></span><span className="min-w-0 flex-1 truncate font-bold">{seatName(seat)}{occupant?.id === me?.id ? ` (${t('me')})` : ''}</span>{seat === 0 && <Crown size={11} className="text-[#f2c14e]" />}{occupant && <span className={`h-1.5 w-1.5 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}</p>;
                })}
              </div>
            </section>
          )}
        />
      )}
    </div>
  );
}
