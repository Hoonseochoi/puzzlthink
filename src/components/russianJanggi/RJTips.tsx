"use client";

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { type RJState, type Side, top, turningPointAt, turnsOf } from '@/lib/russianJanggi';
import { describeAction } from './describe';
import { MiniBoard } from './RJTutorial';
import { Analyzing, TipList, TipsModal, useFirstMatch } from '../ui/TipsModal';

const LOOK_BACK = 10; // how many of my moves to check, latest first
const BUDGET_MS = 350; // search time per position

export default function RJTips({ game, viewer, onClose }: { game: RJState; viewer: Side; onClose: () => void }) {
  const t = useTranslations('RussianJanggi');
  const indices = useMemo(() => turnsOf(game, viewer).slice(0, LOOK_BACK), [game, viewer]);
  const { done, result } = useFirstMatch(indices, (i) => turningPointAt(game, i, BUDGET_MS), true);
  // Log lines read "{player}: …"; drop the player part here.
  const describe = (before: RJState, action: Parameters<typeof describeAction>[2]) => describeAction(t, before, action, t('you')).replace(/^[^:]+:\s*/, '');

  return (
    <TipsModal title={t('tipsTitle')} closeLabel={t('tipsClose')} onClose={onClose}>
      {!done && <Analyzing label={t('tipsAnalyzing')} />}
      {done && result && (
        <div className="mt-4">
          <p className="text-[11px] font-bold text-(--accent)">{t('tipsMoveNo', { n: result.index + 1 })}</p>
          <div className="mt-3 flex justify-center">
            <MiniBoard
              cells={Array.from({ length: 9 }, (_, i) => { const cup = top(result.before, i); return cup ? [cup.owner, cup.size] : null; })}
              glow={result.better.kind === 'pass' ? [] : [result.better.to]}
              bad={result.played.kind === 'pass' ? [] : [result.played.to]}
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-white/40">{t('tipsLegend')}</p>
          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex gap-2 rounded-md border border-[#ff5b3a]/30 bg-[#ff5b3a]/[0.06] px-3 py-2"><dt className="shrink-0 font-black text-[#ff8a70]">{t('tipsPlayed')}</dt><dd className="text-white/75">{describe(result.before, result.played)}</dd></div>
            <div className="flex gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/[0.08] px-3 py-2"><dt className="shrink-0 font-black text-(--accent)">{t('tipsBetter')}</dt><dd className="text-white/85">{describe(result.before, result.better)}</dd></div>
          </dl>
          <p className="mt-3 text-[13px] leading-6 text-white/65">{t(`tipsOutcome_${result.outcome}`)} {t('tipsPlayedLoses')}</p>
        </div>
      )}
      {done && !result && <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-[13px] leading-6 text-white/60">{t('tipsNotFound')}</p>}
      <TipList heading={t('tipsGeneral')} tips={t.raw('tipsList') as { title: string; body: string }[]} />
    </TipsModal>
  );
}
