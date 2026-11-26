import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import AdSlot from '@/components/AdSlot';
import FullGuideLink from '@/components/guide/FullGuideLink';
import { guidePathForNamespace } from '@/content/guides';

type Item = { title: string; body: string; tag?: string };
type Faq = { q: string; a: string };

/**
 * Long-form game guide built from one message namespace: eyebrow, title, intro, rulesTitle/rules,
 * specialTitle/special, strategyTitle/strategyIntro/strategies, faqTitle/faq, disclaimer.
 * `figure` goes between the rules and the special cases (a picture of the pieces, for example).
 * Colors follow the page's --accent (set by GameGate).
 */
export default async function TextGuide({ locale, namespace, figure }: { locale: string; namespace: string; figure?: ReactNode }) {
  const t = await getTranslations({ locale, namespace });
  const rules = t.raw('rules') as string[];
  const special = t.raw('special') as Item[];
  const strategies = t.raw('strategies') as Item[];
  const faq = t.raw('faq') as Faq[];
  const card = 'rounded-[16px] border border-white/10 bg-white/[0.03] p-4';
  const fullGuide = guidePathForNamespace(namespace); // a dedicated /<game>/guide page, when one is written

  return (
    <section id="guide" className="relative z-10 border-t border-white/10 bg-[#0a0c10] px-5 py-16 text-[#eceff4]">
      <AdSlot placement="inline" tone="dark" className="mx-auto mb-12 max-w-3xl" />
      <article className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-(--accent)">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55">{t('intro')}</p>
        {fullGuide && <FullGuideLink locale={locale} path={fullGuide} />}

        <h2 className="mt-12 text-xl font-extrabold">{t('rulesTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/55">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>

        {figure && <div className="mt-8">{figure}</div>}

        <h2 className="mt-14 text-xl font-extrabold">{t('specialTitle')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {special.map((item) => (
            <section key={item.title} className={card}>
              <h3 className="text-sm font-extrabold">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-white/55">{item.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('strategyTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('strategyIntro')}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {strategies.map((item) => (
            <section key={item.title} className={card}>
              {item.tag && <span className="rounded border border-(--accent)/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-(--accent)">{item.tag}</span>}
              <h3 className="mt-2 text-sm font-extrabold">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-white/55">{item.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">{faq.map((item) => <div key={item.q}><dt className="text-sm font-extrabold">{item.q}</dt><dd className="mt-1 text-sm leading-7 text-white/55">{item.a}</dd></div>)}</dl>
        <p className="mt-12 text-[11px] leading-5 text-white/30">{t('disclaimer')}</p>
      </article>
    </section>
  );
}
