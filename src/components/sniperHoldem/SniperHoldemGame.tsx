"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { SNIPER_HOLDEM_ROOM } from '@/hooks/useSniperHoldemRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { type ShChips, SH_CHIPS_QUICK, SH_CHIPS_SHOW, shTarget } from '@/lib/sniperHoldem';
import { type ShLevel, SH_PERSONA, SH_STYLES } from '@/lib/sniperHoldemAi';
import { createSniperHoldemRoom } from '@/lib/sniperHoldemRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { SH_ROOT_STYLE, type ShCopy, shCopy } from './copy';
import { ShAvatar } from './SniperHoldemParts';
import SniperHoldemResult, { shMyPlace, useSniperHoldemReport } from './SniperHoldemResult';
import SniperHoldemTable, { Ladder } from './SniperHoldemTable';

/** Reads ?difficulty=normal|hard, ?players=2..5 and ?chips=24 from the entry screen's buttons. */
function readOptions() {
  if (typeof window === 'undefined') return { level: 'normal' as ShLevel, size: 5, chips: SH_CHIPS_SHOW as ShChips };
  const q = new URLSearchParams(window.location.search);
  const level = (['easy', 'normal', 'hard'].includes(q.get('difficulty') ?? '') ? q.get('difficulty') : 'normal') as ShLevel;
  const size = Math.min(5, Math.max(2, Number(q.get('players')) || 5));
  const chips: ShChips = q.get('chips') === '24' ? SH_CHIPS_QUICK : SH_CHIPS_SHOW;
  return { level, size, chips };
}

/** 스나이퍼 홀덤 against the AI, all in this browser. */
export default function SniperHoldemGame() {
  const locale = useLocale();
  const t = shCopy(locale);
  const [opts] = useState(readOptions);
  const create = useCallback(() => createSniperHoldemRoom({ id: 'me', name: t.you, at: 0 }, { solo: true, ...opts }), [t.you, opts]);
  const { state, dispatch, reset } = useLocalRoom(SNIPER_HOLDEM_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const finished = state?.phase === 'finished';
  const done = !!state && (finished || shMyPlace(state, 0) !== null);
  const resultKey = state ? `${state.game.gid}-${finished}` : '';
  useSniperHoldemReport(state, 0, 'ai');
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);
  const subtitle = `AI ${opts.size - 1} · ${t.levelName[opts.level]}${opts.chips === SH_CHIPS_QUICK ? ` · ${opts.chips}` : ''}`;

  return (
    <div className={SHELL} style={SH_ROOT_STYLE}>
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/sniper-holdem" backLabel={t.back} title={t.title} titleClass="font-black !text-[15px] !tracking-[0.02em] min-[400px]:!text-lg sm:!text-xl" subtitle={subtitle}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="sniper_holdem" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && <SniperHoldemTable room={state} mySeat={0} onAction={dispatch} t={t} locale={locale} />}
        {done && closedKey === resultKey && (
          <div className="mx-auto mt-2 grid max-w-[760px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={() => { setClosedKey(null); reset(); }} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {done && closedKey !== resultKey && state && <SniperHoldemResult room={state} mySeat={0} t={t} locale={locale} onAgain={() => { setClosedKey(null); reset(); }} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <SniperHoldemRules t={t} locale={locale} players={state?.game.players ?? opts.size} start={state?.game.startChips ?? opts.chips} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

/** Rules at a glance, the hand ranking, ties, how this table differs from the show, and the AI players. */
export function SniperHoldemRules({ t, locale, players, start, onClose }: { t: ShCopy; locale: string; players: number; start: number; onClose: () => void }) {
  const en = locale === 'en';
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-h-[85vh] max-w-md overflow-y-auto text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <div className="mt-5"><Ladder t={t} /></div>
        <p className={`${PANEL_TITLE} mt-5`}>{t.siteDiff}</p>
        <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-white/60">{t.siteDiffs(players, shTarget(start, players), start).map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
        <p className={`${PANEL_TITLE} mt-5`}>{t.aiPersonas}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{SH_STYLES.map((style) => { const p = SH_PERSONA[style]; return <span key={style} className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-1 pr-2.5 text-[11px] font-bold"><ShAvatar name={en ? p.nameEn : p.name} color={p.color} size={18} />{en ? p.nameEn : p.name}</span>; })}</div>
        <p className="mt-2 text-[11px] text-white/40">{t.personaNote}</p>
      </div>
    </div>
  );
}
