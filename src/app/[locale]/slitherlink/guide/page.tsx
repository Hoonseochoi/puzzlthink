import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import SlitherDiagram from '@/components/slitherlink/SlitherDiagram';
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, SITE_URL } from '@/lib/seo';
import { EXAMPLE, GUIDE_COPY, TECH_FIGURES } from '@/lib/slitherGuide';

const PATH = '/slitherlink/guide';
const copyFor = (locale: string) => GUIDE_COPY[locale === 'en' ? 'en' : 'ko'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = copyFor(locale);
  return pageMetadata({ locale, path: PATH, title: c.metaTitle, description: c.metaDescription, keywords: c.keywords });
}

/** The example board after step `i`: everything decided so far, with step i's own edges highlighted. */
function exampleFrame(i: number) {
  const lines: number[] = [], crosses: number[] = [];
  EXAMPLE.steps.slice(0, i + 1).forEach((step) => step.forEach(([e, v]) => (v === 1 ? lines : crosses).push(e)));
  return { lines, crosses, fresh: EXAMPLE.steps[i].map(([e]) => e) };
}

const card = 'rounded-[18px] border border-white/10 bg-white/[0.035]';

/** 슬리더링크 공략: patterns with pictures, the dot rule, advanced tricks and a worked 5×5, for first-timers. */
export default async function SlitherGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = copyFor(locale);
  const toc = [
    { id: 'rules', title: c.rulesTitle },
    ...c.sections.map((s) => ({ id: s.id, title: s.title })),
    { id: 'example', title: c.exampleTitle },
    { id: 'mistakes', title: c.mistakesTitle },
    { id: 'faq', title: c.faqTitle },
  ];
  const solved = exampleFrame(EXAMPLE.steps.length - 1);

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: '#8f7cff' }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'Article', headline: c.metaTitle, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}${PATH}`, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK' } },
        faqJsonLd(c.faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: locale === 'en' ? 'Slitherlink' : '슬리더링크', path: '/slitherlink' }, { name: c.title, path: PATH }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/slitherlink" className="text-xs font-bold text-white/45 hover:text-white">← {c.back}</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-[#a99bff]">{c.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-2 text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <p className="mt-5 break-keep text-[15px] leading-8 text-white/60">{c.intro}</p>

        <ul className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-white/60">
          {c.legend.map((item, i) => <li key={item} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1"><span className={`h-2 w-2 rounded-full ${['bg-[#ff3d7f]', 'bg-[#8f86c9]', 'bg-[#ffb020]'][i]}`} />{item}</li>)}
        </ul>

        <nav className={`mt-8 p-5 ${card}`} aria-label={c.tocTitle}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{c.tocTitle}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {toc.map((item, i) => <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-[#a99bff]"><span className="mr-2 font-mono text-[#a99bff]">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>)}
          </ol>
        </nav>

        <section id="rules" className="mt-14 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{c.rulesTitle}</h2>
          <div className="mt-5 grid items-center gap-5 sm:grid-cols-[1fr_220px]">
            <ol className="space-y-3">
              {c.rules.map((rule, i) => <li key={rule} className="flex gap-3 break-keep text-[15px] leading-7 text-white/75"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8f7cff] text-xs font-black text-white">{i + 1}</span>{rule}</li>)}
            </ol>
            <SlitherDiagram rows={EXAMPLE.rows} cols={EXAMPLE.cols} clues={EXAMPLE.clues} lines={solved.lines} cell={36} label={c.exampleSteps[8].title} />
          </div>
          <h3 className="mt-10 text-lg font-black">{c.principleTitle}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {c.principles.map((p) => <div key={p.title} className={`p-5 ${card}`}><p className="font-black text-[#ffcc4d]">{p.title}</p><p className="mt-2 break-keep text-sm leading-7 text-white/60">{p.body}</p></div>)}
          </div>
        </section>

        {c.sections.map((section, si) => (
          <div key={section.id}>
            <section id={section.id} className="mt-16 scroll-mt-20">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{section.title}</h2>
              {section.intro && <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{section.intro}</p>}
              <div className="mt-6 space-y-4">
                {section.techs.map((tech) => {
                  const fig = TECH_FIGURES[tech.id];
                  return (
                    <div key={tech.id} className={`grid items-center gap-5 p-5 sm:grid-cols-[180px_1fr] ${card}`}>
                      <div className="mx-auto w-full max-w-[200px]"><SlitherDiagram {...fig} label={tech.title} /></div>
                      <div><h3 className="text-base font-black">{tech.title}</h3><p className="mt-2 break-keep text-sm leading-7 text-white/60">{tech.body}</p></div>
                    </div>
                  );
                })}
              </div>
            </section>
            {si !== 1 && <AdSlot placement="inline" tone="dark" className="mt-12" />}
          </div>
        ))}

        <section id="example" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{c.exampleTitle}</h2>
          <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{c.exampleIntro}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {c.exampleSteps.map((step, i) => {
              const f = exampleFrame(i);
              return (
                <li key={step.title} className={`p-4 ${card}`}>
                  <SlitherDiagram rows={EXAMPLE.rows} cols={EXAMPLE.cols} clues={EXAMPLE.clues} lines={f.lines} crosses={f.crosses} fresh={f.fresh} cell={40} label={step.title} />
                  <p className="mt-4 font-black text-[#ffcc4d]">{step.title}</p>
                  <p className="mt-1.5 break-keep text-sm leading-7 text-white/65">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <AdSlot placement="inline" tone="dark" className="mt-12" />

        <section id="mistakes" className="mt-16 scroll-mt-20 grid gap-4 sm:grid-cols-2">
          <div className={`p-5 ${card}`}>
            <h2 className="text-lg font-black">{c.mistakesTitle}</h2>
            <ul className="mt-3 space-y-3">{c.mistakes.map((m) => <li key={m} className="break-keep text-sm leading-7 text-white/60">✕ {m}</li>)}</ul>
          </div>
          <div className={`p-5 ${card}`}>
            <h2 className="text-lg font-black">{c.tipsTitle}</h2>
            <ol className="mt-3 space-y-3">{c.tips.map((tip, i) => <li key={tip} className="break-keep text-sm leading-7 text-white/60"><span className="mr-1.5 font-mono font-black text-[#a99bff]">{i + 1}.</span>{tip}</li>)}</ol>
          </div>
        </section>

        <section className="mt-12 rounded-[22px] bg-gradient-to-br from-[#8f7cff] to-[#5b45c9] p-7 text-center">
          <h2 className="text-2xl font-black">{c.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-md break-keep text-sm leading-7 text-white/85">{c.ctaBody}</p>
          <Link href="/slitherlink" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#3b2a9e] hover:brightness-95"><Play size={16} fill="currentColor" />{c.ctaPlay}</Link>
        </section>

        <section id="faq" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{c.faqTitle}</h2>
          <div className="mt-5 space-y-3">
            {c.faq.map((f) => <details key={f.q} className={`group p-5 ${card}`}><summary className="cursor-pointer list-none font-black">{f.q}</summary><p className="mt-2 break-keep text-sm leading-7 text-white/60">{f.a}</p></details>)}
          </div>
        </section>
      </article>
    </main>
  );
}
