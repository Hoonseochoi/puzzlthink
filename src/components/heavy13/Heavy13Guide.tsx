import { getTranslations } from 'next-intl/server';
import type { Chip } from '@/lib/heavy13';
import { ChipToken, RockCard, StandMini } from './Bits';
import AdSlot from '@/components/AdSlot';

type Item = { title: string; body: string; tag?: string };
type Faq = { q: string; a: string };

const ORDER_EXAMPLE: [string, Chip, number, number][] = [
  ['①', 'r', 6, 2], ['②', 'b', 5, 6], ['③', 'r', 5, 7], ['④', 'r', 5, 3], ['⑤', 'g', 6, 1], ['⑥', 'b', 5, 4], ['⑦', 'g', 5, 5],
];

export default async function Heavy13Guide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Heavy13Guide' });
  const ts = await getTranslations({ locale, namespace: 'Heavy13' });
  const rules = t.raw('rules') as string[];
  const strategies = t.raw('strategies') as Item[];
  const faq = t.raw('faq') as Faq[];
  const stand = (c: 'r' | 'g' | 'b') => ts(`stand_${c}`);

  return (
    <section className="border-t border-white/10 bg-[#0e1013] px-5 py-16 text-[#eef0f3]">
      <AdSlot placement="inline" tone="dark" className="mx-auto mb-12 max-w-3xl" />
      <article className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#e6c48a]">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55">{t('intro')}</p>

        <section className="mt-6 rounded-[16px] border border-[#e6c48a]/25 bg-[#e6c48a]/[0.05] p-4">
          <h2 className="text-sm font-extrabold text-[#e6c48a]">{t('motifTitle')}</h2>
          <p className="mt-1.5 text-[13px] leading-6 text-white/60">{t('motifBody')}</p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
          <span className="text-xs font-bold text-white/55">{t('kitLabel')}</span>
          {[0, 1, 2, 3, 4, 5, 6].map((v) => <RockCard key={v} value={v} size="sm" />)}
          <span className="mx-1 h-6 w-px bg-white/10" />
          {(['r', 'r', 'g', 'g', 'b', 'b', 'w'] as Chip[]).map((c, i) => <ChipToken key={i} chip={c} size={18} />)}
        </div>

        <h2 className="mt-12 text-xl font-extrabold">{t('rulesTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/55">{rules.map((r) => <li key={r}>{r}</li>)}</ol>

        <h2 className="mt-14 text-xl font-extrabold">{t('orderTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('orderBody')}</p>
        <div className="mt-4 grid grid-cols-7 gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.03] p-3 sm:gap-3">
          {ORDER_EXAMPLE.map(([seat, chip, card, order]) => (
            <div key={seat} className="flex flex-col items-center gap-1.5 text-center">
              <span className={`text-xs font-black ${seat === '④' ? 'text-[#e6c48a]' : 'text-white/60'}`}>{seat}{seat === '④' ? '★' : ''}</span>
              <ChipToken chip={chip} size={18} />
              <RockCard value={card} size="sm" />
              <span className="rounded-full bg-white/10 px-1.5 font-mono text-[10px] font-black">#{order}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/40">{t('orderCaption')}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <section className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-extrabold">{t('collapseTitle')}</h3>
            <div className="mt-3 flex items-end gap-3">
              <StandMini color="r" cubes={[6, 5]} label={stand('r')} />
              <span className="pb-10 text-white/40">+</span>
              <RockCard value={5} />
              <span className="pb-10 text-white/40">→</span>
              <StandMini color="r" cubes={[5]} label={stand('r')} glow />
            </div>
            <p className="mt-3 text-[13px] leading-6 text-white/55">{t('collapseBody')}</p>
          </section>
          <section className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-extrabold">{t('passTitle')}</h3>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              {['A', 'B', 'C', 'D'].map((p, i) => <span key={p} className={`flex h-9 w-9 items-center justify-center rounded-full ${i < 2 ? 'border border-dashed border-white/30 text-white/40' : 'bg-white/10'}`}>{p}</span>)}
              <span className="text-white/40">→</span>
              {['C', 'D', 'B', 'A'].map((p) => <span key={p} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6c48a]/20 text-[#e6c48a]">{p}</span>)}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-white/55">{t('passBody')}</p>
          </section>
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('strategyTitle')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {strategies.map((s) => (
            <section key={s.title} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
              {s.tag && <span className="rounded border border-[#e6c48a]/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-[#e6c48a]">{s.tag}</span>}
              <h3 className="mt-2 text-sm font-extrabold">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-white/55">{s.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">{faq.map((f) => <div key={f.q}><dt className="text-sm font-extrabold">{f.q}</dt><dd className="mt-1 text-sm leading-7 text-white/55">{f.a}</dd></div>)}</dl>
        <p className="mt-12 text-[11px] leading-5 text-white/30">{t('disclaimer')}</p>
      </article>
    </section>
  );
}
