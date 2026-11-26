// One game-theory article: header, contents, sections, references, the site games it mentions and related
// articles. Server-rendered; styled like the guide pages (src/components/guide/GuidePage.tsx).
import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { card } from '@/components/guide/GuideBlocks';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { CATEGORIES, GT_PATH, articleBySlug, articlePath, gtLocale } from '@/content/game-theory';
import type { GTArticle } from '@/content/game-theory/types';
import { GTSectionView, richText } from './GTBlocks';

export const GT_ACCENT = '#ffcc4d';

const UI = {
  ko: { hub: '게임 이론', toc: '목차', refs: '참고 자료', games: '이 글에 나온 PUZZLTHINK 게임', related: '이어서 읽기', updated: '마지막 수정', play: '게임 하기', all: '게임 이론 글 전체 보기' },
  en: { hub: 'Game theory', toc: 'Contents', refs: 'References', games: 'PUZZLTHINK games in this article', related: 'Read next', updated: 'Last updated', play: 'Play', all: 'All game theory articles' },
} as const;

export default async function GTArticlePage({ article, locale }: { article: GTArticle; locale: string }) {
  const loc = gtLocale(locale);
  const c = article[loc];
  const ui = UI[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const path = articlePath(article.slug);
  const category = CATEGORIES.find((x) => x.id === article.category)!;
  const games = article.games.map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== undefined);
  const related = article.related.map(articleBySlug).filter((a) => a !== null);
  const toc = [...c.sections.map((s) => ({ id: s.id, title: s.title })), { id: 'refs', title: ui.refs }];
  const adAfter = c.sections.length > 3 ? 1 : -1;

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: GT_ACCENT }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: c.title, description: c.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          dateModified: article.updated, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          about: { '@type': 'Thing', name: loc === 'ko' ? '게임 이론' : 'Game theory' }, articleSection: category[loc].title,
        },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.hub, path: GT_PATH }, { name: c.title, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href="/" className="hover:text-white">PUZZLTHINK</Link><span>/</span>
          <Link href={GT_PATH} className="hover:text-white">{ui.hub}</Link><span>/</span>
          <span className="text-white/60">{category[loc].title}</span>
        </nav>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">GAME THEORY · {category.en.title.toUpperCase()}</p>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <div className="mt-5 space-y-4">{c.intro.map((p, i) => <p key={i} className="break-keep text-[15px] leading-8 text-white/60">{richText(p)}</p>)}</div>
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
            <GTSectionView section={section} />
            {i === adAfter && <AdSlot placement="inline" tone="dark" className="mt-14" />}
          </Fragment>
        ))}

        <section id="refs" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{ui.refs}</h2>
          <ul className="mt-5 space-y-2.5">
            {c.refs.map((r) => (
              <li key={r.title} className="flex gap-3 break-keep text-sm leading-7 text-white/60">
                <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                <span>
                  {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/80 underline decoration-white/25 underline-offset-4 hover:text-(--accent)">{r.title}</a> : <span className="text-white/80">{r.title}</span>}
                  {r.note && <span className="text-white/45"> — {r.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <AdSlot placement="inline" tone="dark" className="mt-12" />

        {games.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-black tracking-[-0.03em]">{ui.games}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {games.map((g) => (
                <li key={g.id} className={`flex items-center justify-between gap-3 p-4 ${card}`}>
                  <p className="flex items-center gap-2 font-black"><span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />{tc(g.id)}</p>
                  <Link href={g.href} className="inline-flex items-center gap-1 text-xs font-black text-(--accent) hover:underline"><Play size={12} fill="currentColor" />{ui.play}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-black tracking-[-0.03em]">{ui.related}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((a) => (
                <li key={a.slug} className={`flex flex-col p-5 ${card}`}>
                  <Link href={articlePath(a.slug)} className="flex items-center gap-2 font-black hover:text-(--accent)"><BookOpen size={14} className="text-(--accent)" />{a[loc].title}</Link>
                  <p className="mt-1.5 break-keep text-[13px] leading-6 text-white/55">{a[loc].summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <Link href={GT_PATH} className="mt-8 inline-block text-sm font-black text-(--accent) hover:underline">{ui.all} →</Link>
      </article>
    </main>
  );
}
