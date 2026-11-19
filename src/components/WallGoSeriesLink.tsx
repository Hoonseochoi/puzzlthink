import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

/** Links 벽바둑 and 벽바둑 II to each other from their guides (helps players and search engines find the other one). */
export default async function WallGoSeriesLink({ locale, to }: { locale: string; to: 'wallgo' | 'wallgo2' }) {
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const two = to === 'wallgo2';
  return (
    <Link href={two ? '/wallgo-2' : '/wallgo'} className="mt-6 flex items-center justify-between gap-3 rounded-[14px] border border-[#e0283a]/35 bg-[#e0283a]/[0.07] px-4 py-3.5 transition hover:bg-[#e0283a]/[0.12]">
      <span className="min-w-0">
        <span className="block text-[10px] font-black tracking-[0.18em] text-[#ff4d5e]">{t(two ? 'seriesNextKicker' : 'seriesPrevKicker')}</span>
        <span className="mt-0.5 block break-keep text-sm font-extrabold">{t(two ? 'seriesNextTitle' : 'seriesPrevTitle')}</span>
        <span className="mt-0.5 block break-keep text-xs text-white/50">{t(two ? 'seriesNextDesc' : 'seriesPrevDesc')}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-[#ff4d5e]" />
    </Link>
  );
}
