"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, Check, Copy, Crown, Flag, Loader2, Share2, Timer, Trophy, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BugReport from '@/components/BugReport';
import { useAuth } from '@/components/AuthProvider';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useGradationRoom } from '@/hooks/useGradationRoom';
import { useGradationChampion } from '@/hooks/useGradationChampion';
import { type GradationRoom, GR_MAX_MISSES, GR_PLACE_SEC, GR_TURN_SEC } from '@/lib/gradationRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import RoomAlerts from '../RoomAlerts';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL } from '../ui/gameUi';
import { GR_ACCENT, GR_ROOT_STYLE, type GrCopy, grCopy } from './copy';
import { GradationRules } from './GradationGame';
import { GradationCrown } from './GradationParts';
import GradationResult, { useGradationReport } from './GradationResult';
import GradationTable from './GradationTable';
import { KakaoInviteButton } from '@/components/ui/KakaoShareButton';

const TITLE_CLASS = 'font-black [font-family:Georgia,serif] !text-[14px] !tracking-normal min-[400px]:!text-lg sm:!text-xl sm:!tracking-[0.08em]';

/** A 1:1 그라데이션 room with a friend (or an open room). */
export default function GradationRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const t = grCopy(locale);
  const { nickname } = useAuth();
  const [defaultName] = useState(() => `${t.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useGradationRoom(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const timer = window.setTimeout(() => setShareUrl(`${window.location.origin}/${locale}/gradation/room/${code}`), 0);
    const late = window.setTimeout(() => setWaitedLong(true), 6000);
    return () => { window.clearTimeout(timer); window.clearTimeout(late); };
  }, [code, locale]);

  const online = new Set(peers.map((peer) => peer.id));
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t.title}`, text: t.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const notice = status === 'unconfigured' ? t.unconfigured : status === 'error' ? t.connectionError : !state && waitedLong ? t.roomNotFound : state && !me?.isHost && !hostOnline ? t.hostOffline : null;
  const finished = state?.phase === 'finished';
  const resultKey = state ? `${state.game.gid}-${finished}` : '';
  useGradationReport(state, mySeat, 'friend');
  const resign = () => { if (window.confirm(t.resignConfirm)) dispatch({ t: 'resign' }); };

  return (
    <div className={SHELL} style={GR_ROOT_STYLE}>
      <RoomAlerts alerts={alerts} accent={GR_ACCENT} joinText={t.joined} leaveText={t.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/gradation" backLabel={t.back} title={t.title} titleClass={TITLE_CLASS} subtitle={<span className="font-mono">{t.online} · {code}</span>}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        {state?.phase === 'playing' && mySeat !== null && <button type="button" onClick={resign} className={BTN} aria-label={t.resign}><Flag size={14} /><span className="hidden sm:inline">{t.resign}</span></button>}
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-3 flex max-w-[1100px] items-center gap-2 px-4 text-xs text-[#ff948d]"><WifiOff size={14} />{notice}</p>}

      {!state ? (
        <main className="relative z-10 flex min-h-[65vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 size={16} className="animate-spin" />{t.connecting}</p> : <Link href="/gradation" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t.backToEntry}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <Lobby state={state} code={code} me={me} mySeat={mySeat} online={online} t={t}
          copied={copied} onCopy={copyLink} onShare={shareLink} nameDraft={nameDraft} setNameDraft={setNameDraft}
          onRename={() => { rename(nameDraft); setNameDraft(''); }} onStart={() => dispatch({ t: 'start' })} />
      ) : (
        <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
          <GradationTable room={state} mySeat={mySeat} onAction={dispatch} t={t} locale={locale} myNick={nickname} />
          {finished && closedKey === resultKey && (
            <div className="mx-auto mt-2 max-w-[760px]"><button type="button" onClick={() => setClosedKey(null)} className={`${BTN} w-full py-3`}><Trophy size={14} />{t.showResult}</button></div>
          )}
        </main>
      )}
      {state && finished && closedKey !== resultKey && <GradationResult room={state} mySeat={mySeat} t={t} locale={locale} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t.rematchWait} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <GradationRules t={t} locale={locale} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

function Lobby({ state, code, me, mySeat, online, t, copied, onCopy, onShare, nameDraft, setNameDraft, onRename, onStart }: {
  state: GradationRoom; code: string; me: { id: string; name: string; isHost: boolean } | null; mySeat: number | null; online: Set<string>;
  t: GrCopy; copied: boolean; onCopy: () => void; onShare: () => void;
  nameDraft: string; setNameDraft: (v: string) => void; onRename: () => void; onStart: () => void;
}) {
  const champion = useGradationChampion();
  const full = state.seats.every(Boolean);
  return (
    <main className="relative z-10 mx-auto grid w-full max-w-[1000px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8">
      <section className={STAGE}>
        <p className={KICKER}>{t.lobby}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#eef1f7] sm:text-2xl">{t.lobbyTitle}</h1>
        <div className={`mt-4 border-(--accent)/30 p-4 sm:p-5 ${WELL}`}>
          <p className={PANEL_TITLE}>{t.inviteTitle}</p>
          <p className="mt-2 text-xs leading-5 text-white/50">{t.inviteDesc}</p>
          <div className="mt-3 rounded-md border border-white/10 bg-[#0b0b0e] p-3"><p className="text-[9px] font-black tracking-widest text-white/25">INVITE CODE</p><p className="mt-1 font-mono text-3xl font-black tracking-[.25em] text-(--accent)">{code}</p></div>
          <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={onCopy} className={`py-2.5 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t.copied : t.copy}</button><button type="button" onClick={onShare} className={`py-2.5 ${BTN_ACCENT}`}><Share2 size={14} />{t.share}</button></div>
          <KakaoInviteButton code={code} host={me?.name} />
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          {state.seats.map((seat, i) => (
            <li key={i} data-chat-seat={seat?.id} className={`flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-3 ${seat ? 'border-white/15 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>
              <UserRound size={14} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t.you})` : seat.name) : t.needTwo}</span>
              {seat && champion && seat.name.trim() === champion.trim() && <GradationCrown size={16} title={t.champion} />}
              {i === 0 && <Crown size={11} className="text-[#ffd36b]" />}
              {seat && <i className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/20'}`} />}
            </li>
          ))}
        </ul>
        <form onSubmit={(event) => { event.preventDefault(); onRename(); }} className="mt-4 flex gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t.nickname} className={INPUT} /><button className={`px-4 ${BTN}`}>{t.rename}</button></form>
        {me?.isHost
          ? <button type="button" disabled={!full} onClick={onStart} className={`mt-4 w-full py-3.5 text-sm ${BTN_ACCENT}`}>{full ? t.start : t.needTwo}</button>
          : <p className="mt-4 text-center text-sm text-white/40">{mySeat === null ? t.roomFull : t.waitingHost}</p>}
      </section>
      <aside className="space-y-4">
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t.turnTime}</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/65">
            <li className="flex gap-2"><Timer size={14} className="mt-0.5 shrink-0 text-(--accent)" /><span className="break-keep">{t.placeRule(GR_PLACE_SEC / 60)}</span></li>
            <li className="flex gap-2"><Timer size={14} className="mt-0.5 shrink-0 text-[#ffb547]" /><span className="break-keep">{t.turnRule(GR_TURN_SEC, GR_MAX_MISSES)}</span></li>
          </ul>
        </section>
        <section className={NOTE}><p className={PANEL_TITLE}>{t.rules}</p><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol></section>
      </aside>
    </main>
  );
}
