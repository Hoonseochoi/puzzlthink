"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { HIT_STAY_ROOM } from '@/hooks/useHitStayRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { HS_PERSONA, HS_STYLES } from '@/lib/hitStay';
import { createHitStayRoom } from '@/lib/hitStayRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { HS_ROOT_STYLE, type HsCopy, hsCopy } from './copy';
import { HsAvatar } from './HitStayParts';
import HitStayResult, { hsMyPlace, useHitStayReport } from './HitStayResult';
import HitStayTable from './HitStayTable';

/** HIT, STAY against four AI players, all in this browser. */
export default function HitStayGame() {
  const locale = useLocale();
  const t = hsCopy(locale);
  const create = useCallback(() => createHitStayRoom({ id: 'me', name: t.you, at: 0 }, { solo: true }), [t.you]);
  const { state, dispatch, reset } = useLocalRoom(HIT_STAY_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const finished = state?.phase === 'finished';
  // My result shows once my place is settled: at the end, or as soon as I am knocked out.
  const done = !!state && (finished || hsMyPlace(state, 0) !== null);
  const resultKey = state ? `${state.game.gid}-${finished}` : '';
  useHitStayReport(state, 0, 'ai');
  // The site lounge button would sit over the hand and the action dock: hidden while the table is open.
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);

  return (
    <div className={SHELL} style={HS_ROOT_STYLE}>
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/hit-stay" backLabel={t.back} title={t.title} titleClass="font-black [font-family:Georgia,serif] !text-[14px] !tracking-[0.02em] min-[400px]:!text-lg sm:!text-xl sm:!tracking-[0.06em]" subtitle="SOLO · AI 4">
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="hit_stay" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && <HitStayTable room={state} mySeat={0} onAction={dispatch} t={t} locale={locale} />}
        {done && closedKey === resultKey && (
          <div className="mx-auto mt-2 grid max-w-[760px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {done && closedKey !== resultKey && <HitStayResult room={state} mySeat={0} t={t} locale={locale} onAgain={() => { setClosedKey(null); reset(); }} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <HitStayRules t={t} locale={locale} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

/** Rules at a glance and who the AI players are. */
export function HitStayRules({ t, locale, onClose }: { t: HsCopy; locale: string; onClose: () => void }) {
  const en = locale === 'en';
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL_TITLE} mt-6`}>{t.aiPersonas}</p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5">
          {HS_STYLES.map((style) => {
            const p = HS_PERSONA[style];
            return <li key={style} className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2"><HsAvatar name={en ? p.nameEn : p.name} color={p.color} size={24} /><b className="text-sm">{en ? p.nameEn : p.name}</b></li>;
          })}
        </ul>
        <p className="mt-2 text-[11px] text-white/40">{t.personaNote}</p>
      </div>
    </div>
  );
}
