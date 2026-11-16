import { getTranslations } from 'next-intl/server';

type Tip = { title: string; body: string };
type Faq = { q: string; a: string };

export default async function WallGoGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'WallGoGuide' });
  const rules = t.raw('rules') as string[];
  const tips = t.raw('tips') as Tip[];
  const faq = t.raw('faq') as Faq[];

  return (
    <section className="border-t border-black/10 bg-[#f3f0e8] px-5 py-16">
      <article className="mx-auto max-w-3xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 text-sm leading-7 text-black/60">{t('intro')}</p>

        <h2 className="mt-12 text-xl font-extrabold">{t('rulesTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-black/60">
          {rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ol>

        <h2 className="mt-12 text-xl font-extrabold">{t('tipsTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-2xl border border-black/10 bg-[#f9f7f1] p-5">
              <h3 className="text-sm font-extrabold">{tip.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{tip.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-extrabold">{item.q}</dt>
              <dd className="mt-1 text-sm leading-7 text-black/60">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-[11px] leading-5 text-black/35">{t('disclaimer')}</p>
      </article>
    </section>
  );
}
