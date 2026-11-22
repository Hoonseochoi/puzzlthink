import { Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, SITE_URL } from '@/lib/seo';
import { FIGURES, GUIDE_COPY } from '@/lib/logicGuide';
import { type LogicGameId, LOGIC, buildBoard } from '@/lib/logicPuzzles';
import LogicDiagram, { type Figure, type Seg } from './LogicDiagram';

const card = 'rounded-[18px] border border-white/10 bg-white/[0.035]';
/** A solved 6×6 마슈 board for the rules section (fixed seed, so the page never changes). */
function exampleMasyu(): Figure {
  const b = buildBoard('masyu', 6, 20270109);
  if (b.kind !== 'masyu') throw new Error('masyu');
  const n = 6, H = n * (n - 1);
  const lines: Seg[] = b.answer.flatMap((v, e) => {
    if (!v) return [];
    if (e < H) { const r = Math.floor(e / (n - 1)), c = e % (n - 1); return [[r, c, r, c + 1] as Seg]; }
    const i = e - H, r = Math.floor(i / n), c = i % n;
    return [[r, c, r + 1, c] as Seg];
  });
  const pearls = b.pearls.flatMap((p, cell) => (p ? [[Math.floor(cell / n), cell % n, p === 2 ? 'b' : 'w'] as [number, number, 'b' | 'w']] : []));
  return { kind: 'masyu', rows: n, cols: n, pearls, lines };
}

/** A solved 6×6 스타배틀 board for the rules section. */
function exampleStar(): Figure {
  const b = buildBoard('starbattle', 6, 20270109);
  if (b.kind !== 'starbattle') throw new Error('starbattle');
  const n = 6;
  const regions = Array.from({ length: n }, (_, r) => b.regions.slice(r * n, r * n + n).map((g) => String.fromCharCode(97 + g)).join(''));
  const stones = b.answer.flatMap((v, i) => (v ? [[Math.floor(i / n), i % n] as [number, number]] : []));
  return { kind: 'star', regions, stones };
}

/** 마슈 / 노노그램 / 스타배틀 공략: rules, techniques with pictures, mistakes, tips and FAQ. */
export default function LogicGuidePage({ game, locale }: { game: LogicGameId; locale: string }) {
  const spec = LOGIC[game];
  const c = GUIDE_COPY[game][locale === 'en' ? 'en' : 'ko'];
  const path = `${spec.path}/guide`;
  const toc = [{ id: 'rules', title: c.rulesTitle }, ...c.sections.map((s) => ({ id: s.id, title: s.title })), { id: 'mistakes', title: c.mistakesTitle }, { id: 'faq', title: c.faqTitle }];
  const hero: Figure = game === 'masyu' ? exampleMasyu() : game === 'starbattle' ? exampleStar() : FIGURES.overlap;
  // Board-shaped pictures sit beside the text; nonogram lines are wide and go above it.
  const square = game !== 'nonogram';
  const principleFigs: Partial<Record<LogicGameId, [string, string]>> = { masyu: ['ruleBlack', 'ruleWhite'], starbattle: ['ruleLines', 'ruleTouch'] };
  const accent = spec.accent;

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: accent }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'Article', headline: c.metaTitle, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK' } },
        faqJsonLd(c.faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.back.replace(/로 돌아가기|Back to /g, ''), path: spec.path }, { name: c.title, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <Link href={spec.path} className="text-xs font-bold text-white/45 hover:text-white">← {c.back}</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{c.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-2 text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <p className="mt-5 break-keep text-[15px] leading-8 text-white/60">{c.intro}</p>

        <nav className={`mt-8 p-5 ${card}`} aria-label={c.tocTitle}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{c.tocTitle}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {toc.map((item, i) => <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>)}
          </ol>
        </nav>

        <section id="rules" className="mt-14 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{c.rulesTitle}</h2>
          <div className={`mt-5 grid items-center gap-6 ${square ? 'sm:grid-cols-[1fr_240px]' : ''}`}>
            <ol className="space-y-3">
              {c.rules.map((rule, i) => <li key={rule} className="flex gap-3 break-keep text-[15px] leading-7 text-white/75"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-xs font-black text-black/80">{i + 1}</span>{rule}</li>)}
            </ol>
            <div className="mx-auto w-full max-w-[260px]"><LogicDiagram fig={hero} label={c.title} id="hero" /></div>
          </div>
          <h3 className="mt-10 text-lg font-black">{c.principleTitle}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {c.principles.map((p, i) => (
              <div key={p.title} className={`p-5 ${card}`}>
                {principleFigs[game] && <div className="mb-4 max-w-[220px]"><LogicDiagram fig={FIGURES[principleFigs[game]![i]]} label={p.title} id={`pr${i}`} /></div>}
                <p className="font-black text-(--accent)">{p.title}</p>
                <p className="mt-2 break-keep text-sm leading-7 text-white/60">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {c.sections.map((section, si) => (
          <div key={section.id}>
            <section id={section.id} className="mt-16 scroll-mt-20">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{section.title}</h2>
              {section.intro && <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{section.intro}</p>}
              <div className="mt-6 space-y-4">
                {section.techs.map((tech) => (
                  <div key={tech.id} className={`grid items-center gap-5 p-5 ${square ? 'sm:grid-cols-[180px_1fr]' : ''} ${card}`}>
                    <div className={`mx-auto w-full ${square ? 'max-w-[200px]' : 'max-w-[420px]'}`}><LogicDiagram fig={FIGURES[tech.id]} label={tech.title} id={tech.id} /></div>
                    <div><h3 className="text-base font-black">{tech.title}</h3><p className="mt-2 break-keep text-sm leading-7 text-white/60">{tech.body}</p></div>
                  </div>
                ))}
              </div>
            </section>
            {si === 0 && <AdSlot placement="inline" tone="dark" className="mt-12" />}
          </div>
        ))}

        <section id="mistakes" className="mt-16 grid scroll-mt-20 gap-4 sm:grid-cols-2">
          <div className={`p-5 ${card}`}>
            <h2 className="text-lg font-black">{c.mistakesTitle}</h2>
            <ul className="mt-3 space-y-3">{c.mistakes.map((m) => <li key={m} className="break-keep text-sm leading-7 text-white/60">✕ {m}</li>)}</ul>
          </div>
          <div className={`p-5 ${card}`}>
            <h2 className="text-lg font-black">{c.tipsTitle}</h2>
            <ol className="mt-3 space-y-3">{c.tips.map((tip, i) => <li key={tip} className="break-keep text-sm leading-7 text-white/60"><span className="mr-1.5 font-mono font-black text-(--accent)">{i + 1}.</span>{tip}</li>)}</ol>
          </div>
        </section>

        <section className="mt-12 rounded-[22px] p-7 text-center" style={{ background: `linear-gradient(135deg, ${accent}, ${game === 'masyu' ? '#b8233a' : game === 'starbattle' ? '#c9821a' : '#1f8a4c'})` }}>
          <h2 className="text-2xl font-black text-white">{c.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-md break-keep text-sm leading-7 text-white/90">{c.ctaBody}</p>
          <Link href={spec.path} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#17201e] hover:brightness-95"><Play size={16} fill="currentColor" />{c.ctaPlay}</Link>
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
