"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, Check, Copy, Crown, History, Loader2, Scale, Share2, Trophy, UserRound, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { useMineOblivionRoom } from '@/hooks/useMineOblivionRoom';
import { useEndReveal } from '@/hooks/useEndReveal';
import type { MoRoom, MoRoomAction } from '@/lib/mineOblivionRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import RoomAlerts from '../RoomAlerts';
import AwayBanner from '../ui/AwayBanner';
import GameHeader from '../ui/GameHeader';
import { EndRevealBanner } from '../ui/EndReveal';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, INPUT, KICKER, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL } from '../ui/gameUi';
import { MO_ACCENT, MO_ROOT_STYLE, type MoCopy, moCopy } from './copy';
import { MineOblivionRules, revealText } from './MineOblivionGame';
import MineOblivionTable from './MineOblivionTable';
import MineOblivionResult, { useMoReport } from './MineOblivionResult';
import MineOblivionReplay from './MineOblivionReplay';
import { WalkerStone } from './MineStones';
import { KakaoInviteButton } from '@/components/ui/KakaoShareButton';

/** A 1:1 망각의 지뢰 room with a friend (or an open room). */
export default function MineOblivionRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const t = moCopy(locale);
  const [defaultName] = useState(() => `${t.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useMineOblivionRoom(code, defaultName);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');
  const onAction = useCallback((a: MoRoomAction) => dispatch(a), [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShareUrl(`${window.location.origin}/${locale}/mine-of-oblivion/room/${code}`), 0);
    const late = window.setTimeout(() => setWaitedLong(true), 6000);
    return () => { window.clearTimeout(timer); window.clearTimeout(late); };
  }, [code, locale]);

  const online = new Set(peers.map((peer) => peer.id));
  const humans = state?.seats.filter((seat, i) => seat && !state.ai[i]).length ?? 0;
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: `PUZZLTHINK ${t.title}`, text: t.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };
  const notice = status === 'unconfigured' ? t.unconfigured : status === 'error' ? t.connectionError : !state && waitedLong ? t.roomNotFound : state && !me?.isHost && !hostOnline ? t.hostOffline : null;
  const finished = state?.phase === 'finished';
  const resultKey = state && finished ? `mo-${state.game.gid}` : null;
  const reveal = useEndReveal(resultKey);
  useMoReport(state, mySeat, 'friend');
  useEffect(() => { if (!finished) { const id = window.setTimeout(() => setReplaying(false), 0); return () => window.clearTimeout(id); } }, [finished]);

  return (
    <div className={SHELL} style={MO_ROOT_STYLE}>
      <RoomAlerts alerts={alerts} accent={MO_ACCENT} joinText={t.joined} leaveText={t.left2} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/mine-of-oblivion" backLabel={t.back} title={t.title} titleClass="font-black !text-[15px] min-[400px]:!text-lg sm:!text-xl" subtitle={<span className="font-mono">{t.online} · {code}</span>}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="mine_oblivion" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <p className="relative z-10 mx-auto mt-3 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ff948d]"><WifiOff size={14} />{notice}</p>}
      {state?.phase === 'playing' && <AwayBanner seats={state.seats} away={state.away} mySeat={mySeat} onRejoin={() => dispatch({ t: 'rejoin' })} />}

      {!state ? (
        <main className="relative z-10 flex min-h-[65vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/45"><Loader2 size={16} className="animate-spin" />{t.connecting}</p> : <Link href="/mine-of-oblivion" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t.backToEntry}</Link>}
        </main>
      ) : state.phase === 'lobby' ? (
        <Lobby state={state} code={code} me={me} mySeat={mySeat} online={online} humans={humans} t={t}
          copied={copied} onCopy={copyLink} onShare={shareLink} nameDraft={nameDraft} setNameDraft={setNameDraft}
          onRename={() => { rename(nameDraft); setNameDraft(''); }} dispatch={dispatch} />
      ) : (
        <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
          {replaying && finished
            ? <MineOblivionReplay room={state} mySeat={mySeat} t={t} onClose={() => { setReplaying(false); setClosedKey(resultKey); }} onShowResult={() => { setReplaying(false); setClosedKey(null); }} />
            : <MineOblivionTable room={state} mySeat={mySeat} onAction={onAction} t={t} rooms reveal={finished} />}
          {finished && reveal.showResult && closedKey === resultKey && !replaying && (
            <div className="mx-auto mt-3 grid max-w-[560px] grid-cols-2 gap-2">
              <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
              <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-3`}><History size={14} />{t.replay}</button>
            </div>
          )}
        </main>
      )}
      {state && finished && <EndRevealBanner show={reveal.revealing} text={revealText(state, mySeat, t)} color={MO_ACCENT} onSkip={reveal.skip} />}
      {finished && state && reveal.showResult && closedKey !== resultKey && !replaying && (
        <MineOblivionResult room={state} mySeat={mySeat} t={t} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} waitingLabel={t.rematchWait} onClose={() => setClosedKey(resultKey)} onReplay={() => setReplaying(true)} />
      )}
      {rulesOpen && <MineOblivionRules t={t} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

function Lobby({ state, code, me, mySeat, online, humans, t, copied, onCopy, onShare, nameDraft, setNameDraft, onRename, dispatch }: {
  state: MoRoom; code: string; me: { id: string; name: string; isHost: boolean } | null; mySeat: number | null; online: Set<string>; humans: number;
  t: MoCopy; copied: boolean; onCopy: () => void; onShare: () => void;
  nameDraft: string; setNameDraft: (v: string) => void; onRename: () => void; dispatch: (a: MoRoomAction) => void;
}) {
  const host = !!me?.isHost;
  return (
    <main className="relative z-10 mx-auto grid w-full max-w-[960px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-8">
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
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {state.seats.map((seat, i) => (
            <li key={i} data-chat-seat={seat?.id} className={`flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-2.5 ${seat ? 'border-white/15 bg-white/[.04]' : 'border-dashed border-white/10 text-white/30'}`}>
              {seat ? <WalkerStone seat={i as 0 | 1} size={22} /> : <UserRound size={13} className="opacity-40" />}
              <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{seat ? (seat.id === me?.id ? `${seat.name} (${t.you})` : seat.name) : t.emptySeat}</span>
              {i === 0 && <Crown size={11} className="text-[#ffd36b]" />}
              {seat && <i className={`h-1.5 w-1.5 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/20'}`} />}
            </li>
          ))}
        </ul>
        <form onSubmit={(event) => { event.preventDefault(); onRename(); }} className="mt-4 flex gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t.nickname} className={INPUT} /><button className={`px-4 ${BTN}`}>{t.rename}</button></form>
        {host
          ? <button type="button" onClick={() => dispatch({ t: 'start' })} disabled={humans < 2} className={`mt-4 w-full py-3.5 text-sm ${BTN_ACCENT} disabled:opacity-40`}>{humans < 2 ? t.needTwo : t.start}</button>
          : <p className="mt-4 text-center text-sm text-white/40">{mySeat === null ? t.roomFull : t.waitingHost}</p>}
      </section>
      <aside className="space-y-4">
        <section className={PANEL}>
          <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><Scale size={11} />{t.fairTitle}</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/60">{t.fair.map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
        </section>
        <section data-focus-hide className={NOTE}><p className={PANEL_TITLE}>{t.rules}</p><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol></section>
      </aside>
    </main>
  );
}
