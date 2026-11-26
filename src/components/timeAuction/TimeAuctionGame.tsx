"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { TIME_AUCTION_ROOM } from '@/hooks/useTimeAuctionRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { TA_FORMAT_IDS, type TaFormatId } from '@/lib/timeAuction';
import { TA_PERSONA, TA_STYLES, type TaLevel } from '@/lib/timeAuctionAi';
import { Stone } from '../StoneAvatar';
import { type TaRoom, type TaRoomAction, createTaRoom, taNextEventAt } from '@/lib/timeAuctionRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { TA_ROOT_STYLE, type TaCopy, taCopy } from './copy';
import TimeAuctionResult, { useTaReport } from './TimeAuctionResult';
import TimeAuctionTable from './TimeAuctionTable';

/** The match size and AI level from the start link (?format=quick|standard|broadcast&difficulty=normal|hard). */
function linked(): { format: TaFormatId; level: TaLevel } {
  if (typeof window === 'undefined') return { format: 'standard', level: 'hard' };
  const q = new URLSearchParams(window.location.search);
  const format = q.get('format') as TaFormatId | null;
  const level = q.get('difficulty') as TaLevel | null;
  return { format: format && TA_FORMAT_IDS.includes(format) ? format : 'standard', level: level === 'normal' ? 'normal' : 'hard' };
}

/** 시간 경매 against five AI bidders, all in this browser. */
export default function TimeAuctionGame() {
  const locale = useLocale();
  const t = taCopy(locale);
  const create = useCallback(() => createTaRoom({ id: 'me', name: t.you, at: 0 }, { solo: true, ...linked() }), [t.you]);
  const { state, dispatch, reset } = useLocalRoom(TIME_AUCTION_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const finished = state?.phase === 'finished';
  const resultKey = state ? state.game.gid : '';
  useTaReport(state, 0, 'ai');
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);
  const onAction = useCallback((a: TaRoomAction) => dispatch(a), [dispatch]);

  // The host's precise clock: look at the room exactly when the next thing is due (AI let-go, settle, next auction).
  useTaHostClock(state, dispatch);

  return (
    <div className={SHELL} style={TA_ROOT_STYLE}>
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/time-auction" backLabel={t.back} title={t.title} titleClass="font-black !text-[15px] min-[400px]:!text-lg sm:!text-xl" subtitle={state ? `${t.formatShort[state.format]} · AI ${t.levels[state.level]}` : 'SOLO'}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="time_auction" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && state.phase !== 'lobby' && <TimeAuctionTable room={state} mySeat={0} onAction={onAction} t={t} locale={locale} direct rooms={false} />}
        {finished && closedKey === resultKey && (
          <div className="mx-auto mt-3 grid max-w-[760px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {finished && state && closedKey !== resultKey && <TimeAuctionResult room={state} mySeat={0} t={t} locale={locale} onAgain={() => { setClosedKey(null); reset(); }} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <TimeAuctionRules t={t} locale={locale} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

/** Runs a 'tick' at the moment the host's next event is due (finer than the room hook's polling). */
export function useTaHostClock(state: TaRoom | null, dispatch: (a: TaRoomAction) => void, enabled = true) {
  useEffect(() => {
    if (!enabled || !state || state.phase !== 'playing') return;
    const at = taNextEventAt(state);
    if (at >= Number.MAX_SAFE_INTEGER) return;
    const timer = window.setTimeout(() => dispatch({ t: 'tick' }), Math.max(0, at - Date.now()) + 5);
    return () => window.clearTimeout(timer);
  }, [state, dispatch, enabled]);
}

/** Rules at a glance and who the AI players are. */
export function TimeAuctionRules({ t, locale, onClose }: { t: TaCopy; locale: string; onClose: () => void }) {
  const en = locale === 'en';
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL_TITLE} mt-6`}>{t.aiPersonas}</p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2">
          {TA_STYLES.map((style) => {
            const p = TA_PERSONA[style];
            return <li key={style} className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5"><Stone name={p.name} size={26} icon={p.face} cover={false} /><span className="min-w-0"><b className="text-sm">{en ? p.nameEn : p.name}</b><span className="block truncate text-[11.5px] text-white/55">{en ? p.blurb.en : p.blurb.ko}</span></span></li>;
          })}
        </ul>
        <p className="mt-2 text-[11px] text-white/40">{t.personaNote}</p>
        <p className={`${PANEL_TITLE} mt-6`}>{t.fairTitle}</p>
        <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-white/55">{t.fair.map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
      </div>
    </div>
  );
}
