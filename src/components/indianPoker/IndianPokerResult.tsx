"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy, X } from 'lucide-react';
import { Fireworks } from '@/components/HallCelebration';
import ResultActions from '@/components/ResultActions';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '@/components/ui/gameUi';
import { Link } from '@/i18n/routing';
import { type PokerRound, type PokerSide } from '@/lib/indianPoker';
import { ChipStack, PokerHistory } from './IndianPokerParts';

/** Match numbers from the viewer's side (side 0). */
function matchStats(rounds: PokerRound[]) {
  let best = 0, run = 0;
  for (const r of rounds) { run = r.winner === 0 ? run + 1 : 0; best = Math.max(best, run); }
  return {
    hands: rounds.length,
    biggest: Math.max(0, ...rounds.map((r) => (r.winner === 0 ? r.pot : 0))),
    best,
    tenFolds: rounds.filter((r) => r.tenPenalty && r.reason === 'fold' && r.winner === 1).length,
  };
}

/** Final chips, counted up from zero when the popup opens. */
function BigCount({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / 1100);
      setShown(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="font-mono text-5xl font-black text-[#ffcf3f] drop-shadow-[0_0_18px_rgba(255,207,63,.5)]">{shown}</span>;
}

/**
 * End of a match: who won and why, the final stack, a few numbers and the revealed hands,
 * then the shared sign-in / quit / again / share actions (with the sponsor card).
 */
export function IndianPokerResultModal({ winner, chips, reason, rounds, names, onClose, onAgain, waitingLabel }: {
  winner: PokerSide | 'draw'; chips: number; reason: string; rounds: PokerRound[]; names: [string, string];
  onClose: () => void; onAgain?: () => void; waitingLabel?: string;
}) {
  const t = useTranslations('IndianPoker');
  const won = winner === 0;
  const stats = matchStats(rounds);
  return (
    <div className={MODAL_BACKDROP} role="dialog" aria-modal="true" aria-labelledby="ip-result-title">
      {won && <Fireworks />}
      <div className={`${MODAL} hall-pop max-h-[92vh] overflow-y-auto`}>
        <button type="button" onClick={onClose} aria-label={t('end.close')} className={MODAL_CLOSE}><X size={16} /></button>
        <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-(--accent)">{winner === 'draw' ? 'DRAW' : won ? 'WIN' : 'LOSE'}</p>
        <h2 id="ip-result-title" className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{winner === 'draw' ? t('end.drawTitle') : won ? t('end.winTitle') : t('end.loseTitle')}</h2>
        <p className="mt-2 text-sm text-white/55">{reason}</p>

        <div className="mt-5 flex items-center justify-center gap-4 rounded-[14px] border border-[#ffcf3f]/25 bg-[#ffcf3f]/[0.06] py-4">
          {chips > 0 && <ChipStack count={chips} bare />}
          <div className="text-left"><p className="text-[10px] font-black tracking-[.16em] text-white/40">{t('end.finalChips')}</p><BigCount value={chips} /></div>
        </div>

        <dl className="mt-3 grid grid-cols-4 gap-1.5">
          {([[t('end.hands'), stats.hands], [t('end.biggest'), stats.biggest], [t('end.bestStreak'), stats.best], [t('end.tenFolds'), stats.tenFolds]] as [string, number][]).map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-black/30 px-1 py-2"><dt className="text-[9px] font-bold text-white/40">{label}</dt><dd className="mt-0.5 font-mono text-lg font-black text-white">{value}</dd></div>
          ))}
        </dl>
        {rounds.length > 0 && <div className="mt-3 text-left"><PokerHistory rounds={rounds} names={names} /></div>}

        <ResultActions replay={
          <div className="mt-3 rounded-[12px] border border-[#ffd36e]/30 bg-[#ffd36e]/[0.07] px-4 py-3 text-left">
            <p className="flex items-center gap-1.5 text-xs font-black text-[#ffd36e]"><Trophy size={13} />{t('end.rankingTitle')}</p>
            <Link href="/ranking/indian-poker" className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ffd36e]/40 bg-[#ffd36e]/10 px-3 py-1.5 text-xs font-black text-[#ffd36e] hover:bg-[#ffd36e]/20">🏆 {t('end.rankingButton')}</Link>
          </div>
        } won={won} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/indian-poker" exitPath="/indian-poker" primaryClass={RESULT_PRIMARY} />
      </div>
    </div>
  );
}
