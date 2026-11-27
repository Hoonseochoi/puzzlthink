"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Infinity as InfinityIcon, Medal, X } from 'lucide-react';
import { Fireworks } from '@/components/HallCelebration';
import ResultActions from '@/components/ResultActions';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY } from '@/components/ui/gameUi';
import { Link } from '@/i18n/routing';
import { BlockFace } from './M2Parts';

/** Where a challenge score lands: `place` this score takes among `players`, and my own rank and best (signed in). */
export type M2Place = { place: number; players: number; my_rank: number | null; my_best: number | null };

/** The score counted up from zero when the popup opens. */
function CountUp({ value }: { value: number }) {
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
  return <>{shown.toLocaleString()}</>;
}

/**
 * End of a 2048 board. Both modes: score, biggest block, moves, then the shared sponsor card, sign-in prompt and
 * quit / again / share buttons (with the result ad). 챌린지 도전 adds where the score lands on the ranking;
 * free play adds an invitation to try the ranked 챌린지 도전.
 */
export default function Merge2048Result({ mode, score, max, moves, newBest, place, onAgain, onChallenge, onClose }: {
  mode: 'free' | 'endless'; score: number; max: number; moves: number; newBest: boolean;
  place: M2Place | null | 'loading'; onAgain: () => void; onChallenge: () => void; onClose: () => void;
}) {
  const t = useTranslations('Merge2048');
  const ranked = mode === 'endless';
  const p = place && place !== 'loading' ? place : null;
  const podium = ranked && !!p && p.place <= 3;
  return (
    <div className={MODAL_BACKDROP} role="dialog" aria-modal="true" aria-labelledby="m2-result-title">
      {(podium || newBest || max >= 2048) && <Fireworks />}
      <div className={`${MODAL} hall-pop`}>
        <button type="button" onClick={onClose} aria-label={t('closeResult')} className={MODAL_CLOSE}><X size={16} /></button>
        <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-(--accent)">{ranked ? 'CHALLENGE · NO MORE MOVES' : 'NO MORE MOVES'}</p>
        <h2 id="m2-result-title" className="mt-1 text-2xl font-black tracking-tight text-white">{newBest ? t('resultNewBest') : t(ranked ? 'resultChallenge' : 'resultFree')}</h2>

        <div className="mt-5 flex items-center justify-center gap-4 rounded-[16px] border border-(--accent)/30 bg-(--accent)/[0.07] px-4 py-4">
          <div className="h-16 w-16 shrink-0 rounded-[14px] bg-[#fbfaf5] p-1.5 m2-breathe"><BlockFace v={Math.max(2, max)} happy /></div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-black tracking-[.16em] text-white/40">{t('score')}</p>
            <p className="font-mono text-4xl font-black leading-tight text-(--accent) drop-shadow-[0_0_18px_var(--accent-glow)]"><CountUp value={score} /></p>
          </div>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-1.5">
          {([[t('biggest'), max], [t('movesLabel'), moves]] as [string, number][]).map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-black/30 px-1 py-2"><dt className="text-[9px] font-bold tracking-[.12em] text-white/40">{label}</dt><dd className="mt-0.5 font-mono text-lg font-black text-white">{value.toLocaleString()}</dd></div>
          ))}
        </dl>

        <ResultActions won={podium || newBest} onAgain={onAgain} gamePath="/2048" primaryClass={RESULT_PRIMARY} replay={ranked ? (
          <div className="mt-3 rounded-[14px] border border-[#ffd36e]/30 bg-[#ffd36e]/[0.07] px-4 py-3 text-left">
            <p className="flex items-center gap-1.5 text-xs font-black text-[#ffd36e]"><Medal size={13} />{t('rankTitle')}</p>
            {place === 'loading' ? <p className="mt-2 text-sm text-white/45">{t('rankLoading')}</p>
              : !p ? <p className="mt-2 text-sm text-white/45">{t('rankUnavailable')}</p>
                : (
                  <>
                    <p className="mt-1.5 text-white"><span className="text-3xl font-black text-[#ffd36e]">{t('placeN', { n: p.place })}</span><span className="ml-2 text-xs text-white/50">{t('placeOf', { n: Math.max(p.players, p.place) })}</span></p>
                    {p.my_rank !== null && <p className="mt-1 text-xs text-white/60">{t('myRankLine', { rank: p.my_rank, best: (p.my_best ?? 0).toLocaleString() })}</p>}
                  </>
                )}
            <Link href="/ranking/2048" className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-[#ffd36e]/40 bg-[#ffd36e]/10 px-3 py-1.5 text-xs font-black text-[#ffd36e] hover:bg-[#ffd36e]/20">🏆 {t('seeRanking')}<ChevronRight size={13} /></Link>
          </div>
        ) : (
          <div className="mt-3 rounded-[14px] border border-(--accent)/35 bg-gradient-to-b from-(--accent)/[0.12] to-transparent px-4 py-4 text-center">
            <p className="text-sm font-black text-white">{t('tryChallengeTitle')}</p>
            <p className="mt-1 break-keep text-xs leading-5 text-white/55">{t('tryChallengeDesc')}</p>
            <button type="button" onClick={onChallenge} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-(--accent) py-3 text-sm font-black text-(--accent-ink) shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110"><InfinityIcon size={15} />{t('tryChallenge')}</button>
          </div>
        )} />
      </div>
    </div>
  );
}
