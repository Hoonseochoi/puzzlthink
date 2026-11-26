// One 보드게임 백과 article: header, contents, sections, the PUZZLTHINK games in its topic, related articles and sources.
// Server-rendered; the section blocks use the shared guide renderer so articles look like the guide pages.
import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Library, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { Section, card, prose, rich } from '@/components/guide/GuideBlocks';
import { anyGuidePath } from '@/content/guides';
import { WIKI_BASE, articleBySlug, categoryOf, wikiLocale, wikiPath } from '@/content/encyclopedia';
import type { WikiArticle } from '@/content/encyclopedia/types';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const UI = {
  ko: {
    hub: '보드게임 백과', toc: '목차', games: 'PUZZLTHINK에서 해 볼 수 있는 게임', gamesLead: '이 글에서 다룬 성격을 가진 게임이에요. 읽은 내용을 바로 손으로 확인해 보세요.',
    related: '함께 읽으면 좋은 글', sources: '참고 자료', sourcesLead: '사실 확인에 참고한 자료예요. 본문은 PUZZLTHINK가 직접 정리해 새로 쓴 글이에요.',
    updated: '마지막 수정', play: '게임 하기', guide: '공략 보기', all: '보드게임 백과 전체 보기',
  },
  en: {
    hub: 'Board game encyclopedia', toc: 'Contents', games: 'Try it on PUZZLTHINK', gamesLead: 'Games here that share what this article is about. Play one and see it for yourself.',
    related: 'Read next', sources: 'Sources', sourcesLead: 'Consulted to check the facts. The text itself is written by PUZZLTHINK.',
    updated: 'Last updated', play: 'Play', guide: 'Guide', all: 'All encyclopedia articles',
  },
} as const;

export default async function WikiArticlePage({ article, locale }: { article: WikiArticle; locale: string }) {
  const loc = wikiLocale(locale);
  const c = article[loc];
  const ui = UI[loc];
  const cat = categoryOf(article.category);
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const path = wikiPath(article.slug);
  const games = article.games.map((g) => {
    const catalog = GAMES.find((x) => x.id === g.game);
    return catalog ? { ...g, name: tc(g.game), href: catalog.href, guide: anyGuidePath(g.game), color: catalog.color } : null;
  }).filter((x) => x !== null);
  const related = article.related.map(articleBySlug).filter((a) => a !== null);
  const toc = [
    ...c.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(games.length ? [{ id: 'games', title: ui.games }] : []),
    { id: 'sources', title: ui.sources },
  ];
  const adAfter = c.sections.length > 3 ? 1 : -1;

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: cat.accent }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: c.title, description: c.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          dateModified: article.updated, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          isPartOf: { '@type': 'CollectionPage', name: ui.hub, url: `${SITE_URL}/${locale}${WIKI_BASE}` },
          ...(article.sources.some((s) => s.url) ? { citation: article.sources.filter((s) => s.url).map((s) => s.url) } : {}),
        },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.hub, path: WIKI_BASE }, { name: c.title, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href="/" className="hover:text-white">PUZZLTHINK</Link><span>/</span>
          <Link href={WIKI_BASE} className="hover:text-white">{ui.hub}</Link><span>/</span>
          <Link href={`${WIKI_BASE}#${cat.id}`} className="hover:text-white">{cat[loc].title}</Link>
        </nav>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{cat[loc].title.toUpperCase()}</p>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <div className="mt-5 space-y-4">{c.intro.map((para, i) => <p key={i} className={`${prose} text-white/60`}>{rich(para)}</p>)}</div>
        <p className="mt-5 text-[11px] font-bold text-white/35">{ui.updated} · {article.updated}</p>

        <nav className={`mt-8 p-5 ${card}`} aria-label={ui.toc}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{ui.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {toc.map((item, i) => (
              <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>
            ))}
          </ol>
        </nav>

        {c.sections.map((section, i) => (
          <Fragment key={section.id}>
            <Section section={section} />
            {i === adAfter && <AdSlot placement="inline" tone="dark" className="mt-14" />}
          </Fragment>
        ))}

        {games.length > 0 && (
          <section id="games" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{ui.games}</h2>
            <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{ui.gamesLead}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {games.map((g) => (
                <li key={g.game} className={`flex flex-col p-5 ${card}`}>
                  <p className="flex items-center gap-2 font-black"><span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />{g.name}</p>
                  <p className="mt-1.5 break-keep text-[13px] leading-6 text-white/55">{rich(g[loc])}</p>
                  <div className="mt-auto flex gap-4 pt-3 text-xs font-black">
                    <Link href={g.href} className="inline-flex items-center gap-1 text-(--accent) hover:underline"><Play size={12} fill="currentColor" />{ui.play}</Link>
                    {g.guide && <Link href={g.guide} className="inline-flex items-center gap-1 text-white/65 hover:text-white"><BookOpen size={13} />{ui.guide}</Link>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <AdSlot placement="inline" tone="dark" className="mt-12" />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-black tracking-[-0.03em]">{ui.related}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug} className={`p-5 ${card}`}>
                  <p className="text-[11px] font-black" style={{ color: categoryOf(r.category).accent }}>{categoryOf(r.category)[loc].title}</p>
                  <h3 className="mt-1 font-black"><Link href={wikiPath(r.slug)} className="hover:text-(--accent)">{r[loc].title}</Link></h3>
                  <p className="mt-1.5 break-keep text-[13px] leading-6 text-white/55">{r[loc].summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="sources" className="mt-16 scroll-mt-20">
          <h2 className="text-xl font-black tracking-[-0.03em]">{ui.sources}</h2>
          <p className="mt-2 break-keep text-[13px] leading-6 text-white/45">{ui.sourcesLead}</p>
          <ul className="mt-4 space-y-1.5 text-[13px] leading-6 text-white/55">
            {article.sources.map((s) => (
              <li key={s.title + s.site} className="break-keep">
                · {s.url ? <a href={s.url} rel="nofollow noopener" target="_blank" className="underline decoration-white/20 underline-offset-2 hover:text-white">{s.title}</a> : s.title} <span className="text-white/35">— {s.site}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link href={WIKI_BASE} className="mt-12 inline-flex items-center gap-2 text-sm font-black text-(--accent) hover:underline"><Library size={15} />{ui.all} →</Link>
      </article>
    </main>
  );
}
