"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, Bot, Check, Copy, Crown, Loader2, Lock, Share2, Swords, Timer, Trophy, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, INPUT, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, playerRow } from '@/components/ui/gameUi';
import { useCardJanggiRoom } from '@/hooks/useCardJanggiRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { CJ_IDLE_LOSS, CJ_MOVE_SEC, CJ_PROXY_SEC } from '@/lib/cardJanggiRoom';
import { CJ_ACCENT, CJ_ROOT_STYLE, cjCopy } from './copy';
import { CJ_PATH, CjRules } from './CardJanggiGame';
import { CjPiece } from './CjParts';
import CjResult, { useCjReport } from './CjResult';
import CjTable from './CjTable';

export default function CardJanggiRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const t = cjCopy(locale);
  const [defaultName] = useState(() => `${t.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useCardJanggiRoom(code, defaultName);
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    const link = window.setTimeout(() => setShareUrl(`${window.location.origin}/${locale}${CJ_PATH}/room/${code}`), 0);
    return () => { window.clearTimeout(slow); window.clearTimeout(link); };
  }, [code, locale]);

  useCjReport(state, mySeat, 'friend');

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t.emptySeat;
  const names: [string, string] = [0, 1].map((s) => (s === mySeat ? `${seatName(s)} (${t.me})` : seatName(s))) as [string, string];
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t.title}`, text: t.shareText, url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };
  const notice = status === 'unconfigured' ? t.unconfigured : status === 'error' ? t.connectionError
    : !state && waitedLong ? t.roomNotFound : state && !me?.isHost && !hostOnline ? t.hostOffline : null;
  const finished = state?.phase === 'finished';
  const resultKey = state ? `${state.sid}-${finished}` : '';

  return (
    <div className={SHELL} style={CJ_ROOT_STYLE}>
      <RoomAlerts alerts={alerts} accent={CJ_ACCENT} joinText={t.joined} leaveText={t.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref={CJ_PATH} backLabel={t.back} title={t.title} subtitle={<span className="font-mono">{t.online} · {code}</span>}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="card_janggi" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-3 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t.connecting}</p> : <Link href={CJ_PATH} className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t.backToEntry}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mx-auto max-w-[460px] space-y-5 py-2">
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="h-14 w-14"><CjPiece seat={0} king size={56} /></span>
                <span className="font-mono text-sm font-black text-white/30">VS</span>
                <span className="h-14 w-14"><CjPiece seat={1} king size={56} /></span>
              </div>
              <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                <p className={PANEL_TITLE}>{t.inviteTitle}</p>
                <p className="mt-2 text-sm text-white/60">{t.inviteDesc}</p>
                <InviteCode code={code} />
                <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                  <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t.copied : t.copy}</button>
                  <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t.share}</button>
                </div>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t.nickname} className={INPUT} />
                <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t.rename}</button>
              </form>
              {me?.isHost ? (
                <div className="space-y-2">
                  <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(176,124,255,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                    {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t.start : t.startLocked}
                  </button>
                  <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t.startReady : t.startLockedHint}</p>
                </div>
              ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t.roomFull : t.waitingHost}</p>}
            </div>
          </section>
          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t.players}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} data-chat-seat={occupant?.id} className={`${playerRow(false)} ${occupant ? '' : 'opacity-50'}`}>
                      <span className="h-9 w-9 shrink-0"><CjPiece seat={seat} king size={36} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{seatName(seat)}{occupant?.id === me?.id ? ` (${t.me})` : ''}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t.host} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{occupant ? t.ready : t.waiting}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ul className="mt-4 space-y-2 text-xs leading-5 text-white/60">
                <li className="flex gap-2"><Timer size={14} className="mt-0.5 shrink-0 text-(--accent)" /><span className="break-keep">{t.timeRule(CJ_MOVE_SEC, CJ_PROXY_SEC)}</span></li>
                <li className="flex gap-2"><Bot size={14} className="mt-0.5 shrink-0 text-[#ffb547]" /><span className="break-keep">{t.idleRule(CJ_IDLE_LOSS)}</span></li>
              </ul>
            </section>
            <section className={PANEL}><p className={PANEL_TITLE}>{t.rules}</p><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol></section>
          </aside>
        </main>
      ) : (
        <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
          <CjTable room={state} mySeat={mySeat} onAction={dispatch} t={t} names={names}
            onResign={mySeat === null ? undefined : () => { if (window.confirm(t.resignConfirm)) dispatch({ t: 'resign' }); }} />
          {finished && closedKey === resultKey && (
            <div className="mx-auto mt-2 max-w-[480px]"><button type="button" onClick={() => setClosedKey(null)} className={`${BTN} w-full py-3`}><Trophy size={14} />{t.showResult}</button></div>
          )}
        </main>
      )}
      {state && finished && closedKey !== resultKey && (
        <CjResult room={state} mySeat={mySeat} names={names} t={t} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t.rematchWait} onClose={() => setClosedKey(resultKey)} path={CJ_PATH} />
      )}
      {rulesOpen && <CjRules t={t} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
