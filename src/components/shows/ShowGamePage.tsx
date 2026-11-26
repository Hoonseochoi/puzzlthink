// One game of a brain-survival show: rules in the site's order (인원·준비물 → 진행 순서 → 승리 조건 → 예외 규칙),
// what decides it, the PUZZLTHINK version if there is one, similar board games and references. Server-rendered.
import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';
import { BookOpen, ExternalLink, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { Section, card, prose, rich } from '@/components/guide/GuideBlocks';
import { anyGuidePath } from '@/content/guides';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { KIND_LABEL, SECTION_PATH, gamePath, showLocale, showPath } from '@/content/shows';
import type { Show, ShowGame } from '@/content/shows/types';
import type { GuideSection } from '@/content/guides/types';
import { SHOW_UI } from './ui';

export default async function ShowGamePage({ show, game, locale }: { show: Show; game: ShowGame; locale: string }) {
  const loc = showLocale(locale);
  const ui = SHOW_UI[loc];
  const c = game[loc];
  const s = show[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const path = gamePath(show, game);
  const site = game.site ? GAMES.find((g) => g.id === game.site) ?? null : null;
  const siteGuide = game.site ? anyGuidePath(game.site) : null;
  const accent = show.color;
  const index = show.games.indexOf(game);
  const prev = index > 0 ? show.games[index - 1] : null;
  const next = index < show.games.length - 1 ? show.games[index + 1] : null;
  const related = game.related.map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== undefined);

  const sections: GuideSection[] = [
    { id: 'setup', title: ui.setup, blocks: c.setup },
    { id: 'flow', title: ui.flow, blocks: c.flow },
    { id: 'win', title: ui.win, blocks: c.win },
    { id: 'exceptions', title: ui.exceptions, blocks: c.exceptions },
    { id: 'analysis', title: ui.analysis, blocks: c.analysis },
    ...(c.siteDiff && c.siteDiff.length ? [{ id: 'site', title: ui.siteDiff, blocks: c.siteDiff }] : []),
  ].filter((x) => x.blocks.length > 0);
  const toc = [...sections.map((x) => ({ id: x.id, title: x.title })), { id: 'similar', title: ui.similar }, { id: 'sources', title: ui.sources }];

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: accent }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: c.title, description: c.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          dateModified: game.updated, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          about: [
            { '@type': 'Game', name: c.name },
            { '@type': 'TVSeries', name: s.name },
            ...(site ? [{ '@type': 'VideoGame', name: tc(site.id), url: `${SITE_URL}/${locale}${site.href}` }] : []),
          ],
        },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.section, path: SECTION_PATH }, { name: s.name, path: showPath(show) }, { name: c.name, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href={SECTION_PATH} className="hover:text-white">{ui.section}</Link><span>/</span>
          <Link href={showPath(show)} className="hover:text-white">{s.name}</Link>
        </nav>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{game.when[loc]}{game.episode ? ` · ${game.episode[loc]}` : ''}</p>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/55">{KIND_LABEL[game.kind][loc]}</span>
          {site && <span className="rounded-full bg-(--accent)/15 px-2.5 py-0.5 text-[10px] font-black text-(--accent)">{ui.playable}</span>}
        </div>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{rich(c.lead)}</p>

        {show.spoiler && (
          <aside className="mt-6 rounded-[16px] border border-white/15 bg-white/[0.04] p-4">
            <p className="text-xs font-black text-white/80">{ui.spoilerTitle}</p>
            <p className="mt-1 break-keep text-[13px] leading-6 text-white/55">{ui.spoiler}</p>
          </aside>
        )}

        {site && (
          <section className="mt-6 rounded-[20px] p-6" style={{ background: `linear-gradient(135deg, ${site.color}, color-mix(in srgb, ${site.color} 40%, #000))` }}>
            <h2 className="break-keep text-xl font-black text-white">{ui.playBoxTitle}</h2>
            <p className="mt-1.5 break-keep text-sm leading-7 text-white/90">{ui.playBoxBody}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={site.href} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#17201e] hover:brightness-95"><Play size={15} fill="currentColor" />{ui.play} · {tc(site.id)}</Link>
              {siteGuide && <Link href={siteGuide} className="inline-flex items-center gap-2 rounded-full border border-white/60 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10"><BookOpen size={15} />{ui.guide}</Link>}
            </div>
          </section>
        )}

        <nav className={`mt-8 p-5 ${card}`} aria-label={ui.toc}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{ui.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {toc.map((item, i) => (
              <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>
            ))}
          </ol>
        </nav>

        {sections.map((section) => (
          <Fragment key={section.id}>
            <Section section={section} />
            {section.id === 'analysis' && <AdSlot placement="inline" tone="dark" className="mt-14" />}
          </Fragment>
        ))}

        <section id="similar" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{ui.similar}</h2>
          <div className="mt-6 grid gap-3">
            {c.similar.map((g) => (
              <div key={g.name} className={`p-5 ${card}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-black">{g.name}</h3>
                  <span className="text-xs font-bold text-white/45">{ui.players} · {g.players}</span>
                </div>
                <p className="mt-2 break-keep text-sm leading-7 text-white/65"><span className="mr-1.5 font-black text-(--accent)">{ui.alike}</span>{rich(g.alike)}</p>
                <p className="mt-1 break-keep text-sm leading-7 text-white/65"><span className="mr-1.5 font-black text-white/80">{ui.differs}</span>{rich(g.differs)}</p>
              </div>
            ))}
          </div>
          {related.length > 0 && (
            <>
              <h3 className="mt-8 text-lg font-black">{ui.similarSite}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((g) => (
                  <li key={g.id}><Link href={g.href} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:border-white/40 hover:text-white"><span className="h-2 w-2 rounded-full" style={{ background: g.color }} />{tc(g.id)}</Link></li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section id="sources" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{ui.sources}</h2>
          {c.sourceNote && <p className={`mt-4 ${prose} text-white/55`}>{rich(c.sourceNote)}</p>}
          <ul className="mt-4 space-y-2">
            {game.sources.map((src) => (
              <li key={src.label.ko} className="break-keep text-sm leading-6 text-white/60">
                {src.url ? <a href={src.url} rel="nofollow noopener" target="_blank" className="inline-flex items-center gap-1 hover:text-white">{src.label[loc]}<ExternalLink size={12} /></a> : src.label[loc]}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] font-bold text-white/35">{ui.updated} · {game.updated}</p>
        </section>

        <nav className="mt-14 grid gap-3 sm:grid-cols-2" aria-label={s.name}>
          {prev ? <Link href={gamePath(show, prev)} className={`p-4 ${card} hover:border-white/25`}><p className="text-[11px] font-bold text-white/40">← {ui.prev}</p><p className="mt-1 font-black">{prev[loc].name}</p></Link> : <span />}
          {next ? <Link href={gamePath(show, next)} className={`p-4 text-right ${card} hover:border-white/25`}><p className="text-[11px] font-bold text-white/40">{ui.next} →</p><p className="mt-1 font-black">{next[loc].name}</p></Link> : <span />}
        </nav>
        <Link href={showPath(show)} className="mt-6 inline-block text-sm font-black text-(--accent) hover:underline">← {ui.backShow} · {s.name}</Link>

        <p className="mt-14 text-[11px] leading-5 text-white/30">{s.disclaimer}</p>
      </article>
    </main>
  );
}
