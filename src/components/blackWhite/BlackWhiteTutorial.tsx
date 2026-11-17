"use client";

import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { TILES, colorOf } from '@/lib/blackWhite';
import { BWTile } from './BWParts';

const Arrow = () => <span className="font-mono text-xs font-black text-white/30">vs</span>;

export function BlackWhiteTutorialSteps() {
  const t = useTranslations('BlackWhiteTutorial');
  const steps = [
    {
      title: t('s1Title'), desc: t('s1Desc'),
      visual: <div className="flex flex-wrap justify-center gap-1">{TILES.map((n) => <BWTile key={n} color={colorOf(n)} n={n} size="sm" />)}</div>,
    },
    {
      title: t('s2Title'), desc: t('s2Desc'),
      visual: (
        <div className="flex items-end gap-4">
          <div className="text-center"><BWTile color="black" size="lg" /><p className="mt-2 text-[10px] font-black text-white/50">{t('them')} · {t('first')}</p></div>
          <Arrow />
          <div className="text-center"><BWTile color="white" n={5} size="lg" /><p className="mt-2 text-[10px] font-black text-white/50">{t('you')} · {t('second')}</p></div>
        </div>
      ),
    },
    {
      title: t('s3Title'), desc: t('s3Desc'),
      visual: (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3"><BWTile color="white" n={5} size="md" /><Arrow /><BWTile color="black" size="md" /></div>
          <span className="rounded-full bg-[#e9c46a] px-3 py-1 text-xs font-black text-[#17120a]">{t('winLabel')}</span>
          <p className="text-[10px] font-bold text-white/40">{t('hiddenNote')}</p>
        </div>
      ),
    },
    {
      title: t('s4Title'), desc: t('s4Desc'),
      visual: (
        <div className="space-y-2">
          <div className="flex gap-1">{[4, 1, 6].map((n, i) => <BWTile key={i} color={colorOf(n)} size="sm" />)}{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="h-10 w-[30px] rounded-[5px] border border-dashed border-white/10" />)}</div>
          <p className="text-center text-[11px] font-bold text-white/55">{t('leftNote')}</p>
        </div>
      ),
    },
    {
      title: t('s5Title'), desc: t('s5Desc'),
      visual: <div className="text-center"><p className="font-mono text-5xl font-black text-[#f4efe4]">5<span className="mx-2 text-white/25">:</span>3</p><p className="mt-2 text-[11px] font-bold text-white/45">{t('endNote')}</p></div>,
    },
    {
      title: t('s6Title'), desc: t('s6Desc'),
      visual: (
        <div className="space-y-1.5">
          {[[1, 8], [7, 6], [0, 5]].map(([a, b], i) => (
            <div key={i} className="flex items-center gap-2">
              <BWTile color={colorOf(a)} n={a} size="sm" /><Arrow /><BWTile color={colorOf(b)} n={b} size="sm" anim="flip" />
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${i === 1 ? 'border-[#e9c46a]/40 text-[#f3d98f]' : i === 0 ? 'border-[#e9c46a]/40 text-[#f3d98f]' : 'border-white/15 text-white/50'}`}>{t(`replay${i + 1}`)}</span>
            </div>
          ))}
          <p className="flex items-center justify-center gap-1 pt-1 text-[10px] font-bold text-white/40"><Eye size={11} />{t('replayNote')}</p>
        </div>
      ),
    },
  ];
  return <InlineSteps steps={steps} />;
}
