// A 개발 노트 article: header, contents, sections (guide blocks), sources and "read next". Server-rendered.
import { getTranslations } from 'next-intl/server';
import { NotebookPen, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { Section, card, prose, rich } from '@/components/guide/GuideBlocks';
import PlayAppGate from '@/components/playApp/PlayAppGate';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { DEVLOG_CATEGORIES, devlogLocale, devlogPath, relatedDevlog } from '@/content/devlog';
import type { DevlogArticle } from '@/content/devlog/types';

export const DEVLOG_ACCENT = '#ffcc4d';

const UI = {
  ko: { hub: '개발 노트', toc: '목차', sources: '이 글의 근거', sourcesLead: '이 글은 아래 코드와 커밋 기록, 집계 숫자만으로 썼어요.', published: '처음 씀', updated: '마지막 수정', play: '바로 플레이', next: '다음에 읽을 글', all: '개발 노트 전체 보기' },
  en: { hub: 'Dev notes', toc: 'Contents', sources: 'Where this comes from', sourcesLead: 'This note is written only from the code, the commit history and the aggregate numbers below.', published: 'Published', updated: 'Last updated', play: 'Play now', next: 'Read next', all: 'All dev notes' },
} as const;

export default async function DevlogPage({ article, locale }: { article: DevlogArticle; locale: string }) {
  const loc = devlogLocale(locale);
  const c = article[loc];
  const ui = UI[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const games = article.games.map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== undefined);
  const main = games[0];
  const accent = main?.color && main.color !== '#2b2b31' ? main.color : DEVLOG_ACCENT;
  const path = devlogPath(article.slug);
  const category = DEVLOG_CATEGORIES.find((x) => x.id === article.category)!;
  const next = relatedDevlog(article);
  const adAfter = c.sections.length > 3 ? 1 : -1;

  return (
    <PlayAppGate game={main?.id} locale={locale}>
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: accent }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: c.title, description: c.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          datePublished: article.published, dateModified: article.updated, articleSection: category[loc],
          author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          ...(games.length ? { about: games.map((g) => ({ '@type': 'VideoGame', name: tc(g.id), url: `${SITE_URL}/${locale}${g.href}` })) } : {}),
        },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.hub, path: '/devlog' }, { name: c.title, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href="/devlog" className="hover:text-white">{ui.hub}</Link><span>/</span>
          <Link href={`/devlog#${article.category}`} className="hover:text-white">{category[loc]}</Link>
        </nav>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)"><NotebookPen size={12} />DEV NOTE</p>
          {games.map((g) => <span key={g.id} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/55">{tc(g.id)}</span>)}
        </div>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <div className="mt-5 space-y-4">{c.intro.map((p, i) => <p key={i} className={`${prose} text-white/60`}>{rich(p)}</p>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {main && <Link href={main.href} className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-black text-black/85 hover:brightness-110"><Play size={15} fill="currentColor" />{ui.play}</Link>}
          <p className="text-[11px] font-bold text-white/35">{ui.published} · {article.published}{article.updated !== article.published ? ` · ${ui.updated} · ${article.updated}` : ''}</p>
        </div>

        <nav className={`mt-8 p-5 ${card}`} aria-label={ui.toc}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{ui.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {[...c.sections.map((s) => ({ id: s.id, title: s.title })), { id: 'sources', title: ui.sources }].map((item, i) => (
              <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>
            ))}
          </ol>
        </nav>

        {c.sections.map((section, i) => (
          <div key={section.id}>
            <Section section={section} />
            {i === adAfter && <AdSlot placement="inline" tone="dark" className="mt-14" />}
          </div>
        ))}

        <section id="sources" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{ui.sources}</h2>
          <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{ui.sourcesLead}</p>
          <ul className={`mt-5 space-y-2 p-5 ${card}`}>
            {c.sources.map((s) => <li key={s} className="flex gap-3 break-all text-[13px] leading-6 text-white/55"><span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-(--accent)" /><span>{rich(s)}</span></li>)}
          </ul>
        </section>

        <AdSlot placement="inline" tone="dark" className="mt-12" />

        {next.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-black tracking-[-0.03em]">{ui.next}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {next.map((a) => (
                <li key={a.slug} data-play-game={a.games[0]} className={`p-5 ${card}`}>
                  <Link href={devlogPath(a.slug)} className="font-black hover:text-(--accent)">{a[loc].title}</Link>
                  <p className="mt-1.5 break-keep text-[13px] leading-6 text-white/50">{a[loc].summary}</p>
                </li>
              ))}
            </ul>
            <Link href="/devlog" className="mt-6 inline-block text-sm font-black text-(--accent) hover:underline">{ui.all} →</Link>
          </section>
        )}
      </article>
    </main>
    </PlayAppGate>
  );
}
