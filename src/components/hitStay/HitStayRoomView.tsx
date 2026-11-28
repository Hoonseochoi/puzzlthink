"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, Bot, Check, Copy, Crown, Loader2, Share2, Timer, Trophy, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useHitStayRoom } from '@/hooks/useHitStayRoom';
import type { HitStayRoom } from '@/lib/hitStayRoom';
import { HS_PICK_SEC, HS_TURN_SEC } from '@/lib/hitStayRoom';
import { HS_PERSONA, HS_PLAYERS, HS_STYLES } from '@/lib/hitStay';
import LanguageSwitcher from '../LanguageSwitcher';
import RoomAlerts from '../RoomAlerts';
import AwayBanner from '../ui/AwayBanner';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL } from '../ui/gameUi';
import { HS_ACCENT, HS_ROOT_STYLE, hsCopy } from './copy';
import { HitStayRules } from './HitStayGame';
import { HsAvatar } from './HitStayParts';
import HitStayResult, { hsMyPlace, useHitStayReport } from './HitStayResult';
import HitStayTable from './HitStayTable';
import { KakaoInviteButton } from '@/components/ui/KakaoShareButton';

/** A 5-seat HIT, STAY table with friends (or an open room); seats nobody takes are played by the AI. */
export default function HitStayRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const t = hsCopy(locale);
  const en = locale === 'en';
  const [defaultName] = useState(() => `${t.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useHitStayRoom(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const timer = window.setTimeout(() => setShareUrl(`${window.location.origin}/${locale}/hit-stay/room/${code}`), 0);
    const late = window.setTimeout(() => setWaitedLong(true), 6000);
    return () => { window.clearTimeout(timer); window.clearTimeout(late); };
  }, [code, locale]);

  const online = new Set(peers.map((peer) => peer.id));
  const humans = state?.seats.filter(Boolean).length ?? 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t.title}`, text: t.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const notice = status === 'unconfigured' ? t.unconfigured : status === 'error' ? t.connectionError : !state && waitedLong ? t.roomNotFound : state && !me?.isHost && !hostOnline ? t.hostOffline : null;
  const finished = state?.phase === 'finished';
  // My result shows once my place is settled: at the end, or as soon as I am knocked out.
  const done = !!state && (finished || hsMyPlace(state, mySeat) !== null);
  const resultKey = state ? `${state.game.gid}-${finished}` : '';
  useHitStayReport(state, mySeat, 'friend');

  return (
    <div className={SHELL} style={HS_ROOT_STYLE}>
      <RoomAlerts alerts={alerts} accent={HS_ACCENT} joinText={t.joined} leaveText={t.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/hit-stay" backLabel={t.back} title={t.title} titleClass="font-black [font-family:Georgia,serif] !text-[14px] !tracking-[0.02em] min-[400px]:!text-lg sm:!text-xl sm:!tracking-[0.06em]" subtitle={<span className="font-mono">{t.online} · {code}</span>}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="hit_stay" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-3 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ff948d]"><WifiOff size={14} />{notice}</p>}
      {state?.phase === 'playing' && <AwayBanner seats={state.seats} away={state.away} mySeat={mySeat} onRejoin={() => dispatch({ t: 'rejoin' })} />}

      {!state ? (
        <main className="relative z-10 flex min-h-[65vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 size={16} className="animate-spin" />{t.connecting}</p> : <Link href="/hit-stay" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t.backToEntry}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <Lobby state={state} code={code} me={me} mySeat={mySeat} online={online} humans={humans} t={t} en={en}
          copied={copied} onCopy={copyLink} onShare={shareLink} nameDraft={nameDraft} setNameDraft={setNameDraft}
          onRename={() => { rename(nameDraft); setNameDraft(''); }} onStart={() => dispatch({ t: 'start' })} onFillAi={(on) => dispatch({ t: 'fillAi', on })} />
      ) : (
        <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
          <HitStayTable room={state} mySeat={mySeat} onAction={dispatch} t={t} locale={locale} />
          {done && closedKey === resultKey && (
            <div className="mx-auto mt-2 max-w-[760px]"><button type="button" onClick={() => setClosedKey(null)} className={`${BTN} w-full py-3`}><Trophy size={14} />{t.showResult}</button></div>
          )}
        </main>
      )}
      {done && closedKey !== resultKey && <HitStayResult room={state} mySeat={mySeat} t={t} locale={locale} onAgain={me?.isHost && finished ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t.rematchWait} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <HitStayRules t={t} locale={locale} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

function Lobby({ state, code, me, mySeat, online, humans, t, en, copied, onCopy, onShare, nameDraft, setNameDraft, onRename, onStart, onFillAi }: {
  state: HitStayRoom; code: string; me: { id: string; name: string; isHost: boolean } | null; mySeat: number | null; online: Set<string>; humans: number;
  t: ReturnType<typeof hsCopy>; en: boolean; copied: boolean; onCopy: () => void; onShare: () => void;
  nameDraft: string; setNameDraft: (v: string) => void; onRename: () => void; onStart: () => void; onFillAi: (on: boolean) => void;
}) {
  const fill = state.fillAi !== false;
  const canStart = fill || humans >= 2;
  return (
    <main className="relative z-10 mx-auto grid w-full max-w-[1050px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8">
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
        <ul className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
          {state.seats.map((seat, i) => (
            <li key={i} data-chat-seat={seat?.id} className={`flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>
              {seat ? <UserRound size={13} /> : fill ? <Bot size={13} /> : <UserRound size={13} className="opacity-40" />}
              <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t.you})` : seat.name) : fill ? t.aiSeat : t.emptySeat}</span>
              {i === 0 && <Crown size={11} className="text-[#ffd36b]" />}
              {seat && <i className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/20'}`} />}
            </li>
          ))}
        </ul>
        <form onSubmit={(event) => { event.preventDefault(); onRename(); }} className="mt-4 flex gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t.nickname} className={INPUT} /><button className={`px-4 ${BTN}`}>{t.rename}</button></form>
        <div className={`mt-4 p-3 ${WELL}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[12px] font-black"><Bot size={14} className="text-(--accent)" />{t.fillAiTitle}</p>
            <div className="grid shrink-0 grid-cols-2 gap-1" role="radiogroup" aria-label={t.fillAiTitle}>
              {[true, false].map((on) => (
                <button key={String(on)} type="button" role="radio" aria-checked={fill === on} disabled={!me?.isHost} onClick={() => onFillAi(on)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-black transition disabled:cursor-default ${fill === on ? 'bg-(--accent) text-black' : 'border border-white/10 text-white/55 enabled:hover:bg-white/10'}`}>{on ? t.fillAiOn : t.fillAiOff}</button>
              ))}
            </div>
          </div>
          <p className="mt-1.5 break-keep text-[11px] leading-4 text-white/45">{fill ? t.fillAiDescOn : t.fillAiDescOff}</p>
        </div>
        {me?.isHost
          ? <button type="button" onClick={onStart} disabled={!canStart} className={`mt-3 w-full py-3.5 text-sm ${BTN_ACCENT} disabled:opacity-40`}>{!canStart ? t.needTwo : fill ? (humans < HS_PLAYERS ? t.startWithAi(HS_PLAYERS - humans) : t.start) : t.startPeople(humans)}</button>
          : <p className="mt-4 text-center text-sm text-white/40">{mySeat === null ? t.roomFull : t.waitingHost}</p>}
      </section>
      <aside className="space-y-4">
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t.turnTime}</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/65">
            <li className="flex gap-2"><Timer size={14} className="mt-0.5 shrink-0 text-(--accent)" /><span className="break-keep">{t.pickRule(HS_PICK_SEC)}</span></li>
            <li className="flex gap-2"><Bot size={14} className="mt-0.5 shrink-0 text-[#ffb547]" /><span className="break-keep">{t.idleRule(HS_TURN_SEC)}</span></li>
          </ul>
          <p className={`${PANEL_TITLE} mt-5`}>{t.aiPersonas}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{HS_STYLES.map((style) => { const p = HS_PERSONA[style]; return <span key={style} className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-1 pr-2.5 text-[11px] font-bold"><HsAvatar name={en ? p.nameEn : p.name} color={p.color} persona={style} size={18} />{en ? p.nameEn : p.name}</span>; })}</div>
          <p className="mt-2 text-[10px] leading-4 text-white/35">{t.personaNote}</p>
        </section>
        <section className={NOTE}><p className={PANEL_TITLE}>{t.rules}</p><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol></section>
      </aside>
    </main>
  );
}
