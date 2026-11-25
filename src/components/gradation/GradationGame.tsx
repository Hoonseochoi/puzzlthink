"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import { useAuth } from '@/components/AuthProvider';
import { GRADATION_ROOM } from '@/hooks/useGradationRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { useGradationChampion } from '@/hooks/useGradationChampion';
import { GR_PERSONA, GR_STYLES } from '@/lib/gradation';
import { createGradationRoom } from '@/lib/gradationRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { GR_ROOT_STYLE, type GrCopy, grCopy } from './copy';
import { GradationCrown, GrAvatar } from './GradationParts';
import GradationResult, { useGradationReport } from './GradationResult';
import GradationTable from './GradationTable';

const TITLE_CLASS = 'font-black [font-family:Georgia,serif] !text-[14px] !tracking-normal min-[400px]:!text-lg sm:!text-xl sm:!tracking-[0.08em]';

/** 그라데이션 against one of the four AI players (drawn at random), all in this browser. */
export default function GradationGame() {
  const locale = useLocale();
  const t = grCopy(locale);
  const en = locale === 'en';
  const { nickname } = useAuth();
  const create = useCallback(() => createGradationRoom({ id: 'me', name: t.you, at: 0 }, { solo: true }), [t.you]);
  const { state, dispatch, reset } = useLocalRoom(GRADATION_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const finished = state?.phase === 'finished';
  const resultKey = state ? `${state.game.gid}-${finished}` : '';
  useGradationReport(state, 0, 'ai');
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);
  const persona = state?.style ? GR_PERSONA[state.style] : null;
  const again = () => { setClosedKey(null); reset(); };

  return (
    <div className={SHELL} style={GR_ROOT_STYLE}>
      <GameHeader backHref="/gradation" backLabel={t.back} title={t.title} titleClass={TITLE_CLASS} subtitle={persona ? t.vsAi(en ? persona.nameEn : persona.name) : 'VS AI'}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={again} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && <GradationTable room={state} mySeat={0} onAction={dispatch} t={t} locale={locale} myNick={nickname} />}
        {finished && closedKey === resultKey && (
          <div className="mx-auto mt-2 grid max-w-[760px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={again} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {state && finished && closedKey !== resultKey && <GradationResult room={state} mySeat={0} t={t} locale={locale} onAgain={again} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <GradationRules t={t} locale={locale} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

/** Rules at a glance, the four AI players and the champion badge. */
export function GradationRules({ t, locale, onClose }: { t: GrCopy; locale: string; onClose: () => void }) {
  const en = locale === 'en';
  const champion = useGradationChampion();
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL_TITLE} mt-6`}>{t.aiPersonas}</p>
        <PersonaList en={en} />
        <p className="mt-2 text-[11px] text-white/40">{t.personaNote}</p>
        <div className="mt-5 flex items-start gap-3 rounded-[12px] border border-[#f2c14e]/30 bg-[#f2c14e]/[0.07] p-3">
          <GradationCrown size={34} title={t.champion} />
          <div className="min-w-0">
            <p className="text-sm font-black text-[#ffd36b]">{t.champion}{champion && <span className="ml-1.5 text-white">· {champion}</span>}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/55 break-keep">{t.championNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PersonaList({ en, compact = false }: { en: boolean; compact?: boolean }) {
  return (
    <ul className={`mt-3 grid gap-1.5 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {GR_STYLES.map((style) => {
        const p = GR_PERSONA[style];
        return (
          <li key={style} className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2">
            <GrAvatar name={en ? p.nameEn : p.name} color={p.color} size={compact ? 22 : 26} />
            <div className="min-w-0"><b className="text-sm">{en ? p.nameEn : p.name}</b>{!compact && <p className="truncate text-[11px] text-white/45">{en ? p.tagEn : p.tag}</p>}</div>
          </li>
        );
      })}
    </ul>
  );
}

