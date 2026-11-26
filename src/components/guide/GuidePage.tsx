import { Fragment, type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { GAMES } from '@/lib/gameCatalog';
import { SHOWS, SITE_URL, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { anyGuidePath, gameHref, guideListings, guideLocale, guidePath } from '@/content/guides';
import type { GameGuide, GuideBlock, GuideCard, GuideSection } from '@/content/guides/types';

const card = 'rounded-[18px] border border-white/10 bg-white/[0.035]';
const prose = 'break-keep text-[15px] leading-8 text-white/70';

const UI = {
  ko: {
    toc: '목차', faq: '자주 묻는 질문', related: '함께 보면 좋은 게임', allGuides: '모든 게임 공략 보기', back: '게임으로 돌아가기',
    guides: '게임 공략', updated: '마지막 수정', play: '바로 플레이', guide: '공략 보기', game: '게임 하기',
    level: { beginner: '입문', intermediate: '중급', advanced: '고급' }, origin: { classic: '전통 게임', original: 'PUZZLTHINK 오리지널' },
  },
  en: {
    toc: 'Contents', faq: 'FAQ', related: 'Related games', allGuides: 'All game guides', back: 'Back to the game',
    guides: 'Game guides', updated: 'Last updated', play: 'Play now', guide: 'Read guide', game: 'Play',
    level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }, origin: { classic: 'Classic game', original: 'PUZZLTHINK original' },
  },
} as const;

/** `**bold**` inside guide strings. */
function rich(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.length === 1 ? text : parts.map((part, i) => (i % 2 ? <strong key={i} className="font-black text-white/90">{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function CardBody({ item }: { item: GuideCard }) {
  return (
    <div className="min-w-0">
      {item.tag && <span className="rounded border border-(--accent)/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-(--accent)">{item.tag}</span>}
      <h3 className={`${item.tag ? 'mt-2' : ''} text-base font-black`}>{rich(item.title)}</h3>
      <p className="mt-1.5 break-keep text-sm leading-7 text-white/60">{rich(item.body)}</p>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'p': return <p className={prose}>{rich(block.text)}</p>;
    case 'h3': return <h3 className="pt-2 text-lg font-black">{rich(block.text)}</h3>;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className={`flex gap-3 ${prose}`}>
              {block.ordered
                ? <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-xs font-black text-black/80">{i + 1}</span>
                : <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" />}
              <span>{rich(item)}</span>
            </li>
          ))}
        </Tag>
      );
    }
    case 'cards':
      return (
        <div className={`grid gap-3 ${block.columns === 1 ? '' : 'sm:grid-cols-2'}`}>
          {block.items.map((item) => (
            <div key={item.title} className={`flex flex-col gap-4 p-5 ${card} ${item.figure && block.columns === 1 ? 'sm:flex-row sm:items-center' : ''}`}>
              {item.figure && <div className={`mx-auto w-full max-w-[200px] shrink-0 ${block.columns === 1 ? 'sm:mx-0 sm:w-44' : ''}`}>{item.figure}</div>}
              <CardBody item={item} />
            </div>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={item.title} className={`grid items-center gap-5 p-5 ${card} ${item.figure ? 'sm:grid-cols-[180px_1fr]' : ''}`}>
              {item.figure && <div className="mx-auto w-full max-w-[200px]">{item.figure}</div>}
              <div>
                <p className="font-mono text-[11px] font-black tracking-[0.14em] text-(--accent)">STEP {String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1 text-base font-black">{rich(item.title)}</h3>
                <p className="mt-1.5 break-keep text-sm leading-7 text-white/60">{rich(item.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className={`overflow-x-auto ${card}`}>
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            {block.caption && <caption className="px-4 pt-4 text-left text-xs font-bold text-white/45">{block.caption}</caption>}
            <thead><tr>{block.head.map((h) => <th key={h} scope="col" className="border-b border-white/10 px-4 py-3 text-xs font-black tracking-[0.06em] text-(--accent)">{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, r) => <tr key={r} className="border-b border-white/[0.06] last:border-0">{row.map((cell, c) => <td key={c} className={`break-keep px-4 py-3 align-top leading-6 ${c === 0 ? 'font-bold text-white/85' : 'text-white/60'}`}>{rich(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'figure':
      return (
        <figure className={`mx-auto w-full ${block.wide ? 'max-w-xl' : 'max-w-[280px]'}`}>
          {block.node}
          {block.caption && <figcaption className="mt-3 break-keep text-center text-xs leading-5 text-white/45">{rich(block.caption)}</figcaption>}
        </figure>
      );
    case 'callout': {
      const tone = block.tone ?? 'tip';
      const color = tone === 'warn' ? 'border-[#ff5d6c]/40 bg-[#ff5d6c]/[0.07]' : tone === 'note' ? 'border-white/15 bg-white/[0.04]' : 'border-(--accent)/40 bg-(--accent)/[0.07]';
      return (
        <aside className={`rounded-[16px] border p-5 ${color}`}>
          {block.title && <p className={`font-black ${tone === 'warn' ? 'text-[#ff8a95]' : tone === 'note' ? 'text-white/85' : 'text-(--accent)'}`}>{rich(block.title)}</p>}
          <p className={`break-keep text-sm leading-7 text-white/70 ${block.title ? 'mt-1.5' : ''}`}>{rich(block.text)}</p>
        </aside>
      );
    }
    case 'glossary':
      return (
        <dl className={`divide-y divide-white/[0.07] ${card}`}>
          {block.items.map((item) => (
            <div key={item.term} className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
              <dt className="font-black text-(--accent)">{item.term}</dt>
              <dd className="break-keep text-sm leading-7 text-white/65">{rich(item.def)}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

function Section({ section, levelLabel }: { section: GuideSection; levelLabel?: string }) {
  return (
    <section id={section.id} className="mt-16 scroll-mt-20">
      {levelLabel && <span className="mb-3 inline-block rounded-full border border-(--accent)/50 bg-(--accent)/10 px-3 py-1 text-[11px] font-black text-(--accent)">{levelLabel}</span>}
      <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{section.title}</h2>
      {section.lead && <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{rich(section.lead)}</p>}
      <div className="mt-6 space-y-5">{section.blocks.map((block, i) => <Block key={i} block={block} />)}</div>
    </section>
  );
}

/** A game's long-form guide: header, contents, sections, play button, FAQ and related games. Server-rendered. */
export default async function GuidePage({ guide, locale }: { guide: GameGuide; locale: string }) {
  const loc = guideLocale(locale);
  const c = guide[loc];
  const ui = UI[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const catalog = GAMES.find((g) => g.id === guide.game)!;
  const accent = catalog.color;
  const href = gameHref(guide.game);
  const path = guidePath(guide.game);
  const gameName = tc(guide.game);
  const origin = guide.origin.kind === 'show' ? SHOWS[guide.origin.show][loc] : ui.origin[guide.origin.kind];
  const listings = guideListings(locale);
  const related = guide.related.map((id) => {
    const g = GAMES.find((x) => x.id === id);
    if (!g) return null;
    const guidePathOf = anyGuidePath(id);
    return { id, name: tc(id), href: g.href, guide: guidePathOf, summary: listings.find((l) => l.game === id)?.summary, color: g.color };
  }).filter((x) => x !== null);
  // Ads go after the 2nd section and before the FAQ, so long pages carry two units and short ones one.
  const adAfter = c.sections.length > 3 ? 1 : -1;

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: accent }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: c.title, description: c.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          dateModified: guide.updated, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          about: { '@type': 'VideoGame', name: gameName, url: `${SITE_URL}/${locale}${href}` },
        },
        faqJsonLd(c.faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.guides, path: '/guides' }, { name: c.title, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href="/guides" className="hover:text-white">{ui.guides}</Link><span>/</span>
          <Link href={href} className="hover:text-white">{gameName}</Link>
        </nav>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{gameName.toUpperCase()} GUIDE</p>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/55">{origin}</span>
        </div>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <div className="mt-5 space-y-4">{c.intro.map((p, i) => <p key={i} className={`${prose} text-white/60`}>{rich(p)}</p>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-black text-black/85 hover:brightness-110"><Play size={15} fill="currentColor" />{ui.play}</Link>
          <p className="text-[11px] font-bold text-white/35">{ui.updated} · {guide.updated}</p>
        </div>

        <nav className={`mt-8 p-5 ${card}`} aria-label={ui.toc}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{ui.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {[...c.sections.map((s) => ({ id: s.id, title: s.title })), { id: 'faq', title: ui.faq }].map((item, i) => (
              <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>
            ))}
          </ol>
        </nav>

        {c.sections.map((section, i) => (
          <Fragment key={section.id}>
            <Section section={section} levelLabel={section.level ? ui.level[section.level] : undefined} />
            {i === adAfter && <AdSlot placement="inline" tone="dark" className="mt-14" />}
          </Fragment>
        ))}

        <section className="mt-16 rounded-[22px] p-7 text-center" style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 45%, #000))` }}>
          <h2 className="text-2xl font-black text-white">{c.cta.title}</h2>
          <p className="mx-auto mt-2 max-w-md break-keep text-sm leading-7 text-white/90">{c.cta.body}</p>
          <Link href={href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#17201e] hover:brightness-95"><Play size={16} fill="currentColor" />{c.cta.button}</Link>
        </section>

        <AdSlot placement="inline" tone="dark" className="mt-12" />

        <section id="faq" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{ui.faq}</h2>
          <div className="mt-5 space-y-3">
            {c.faq.map((f) => (
              <details key={f.q} className={`group p-5 ${card}`} open>
                <summary className="cursor-pointer list-none font-black">{f.q}</summary>
                <p className="mt-2 break-keep text-sm leading-7 text-white/60">{rich(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-black tracking-[-0.03em]">{ui.related}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id} className={`flex flex-col p-5 ${card}`}>
                  <p className="flex items-center gap-2 font-black"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />{r.name}</p>
                  {r.summary && <p className="mt-1.5 break-keep text-[13px] leading-6 text-white/55">{r.summary}</p>}
                  <div className="mt-auto flex gap-4 pt-3 text-xs font-black">
                    {r.guide && <Link href={r.guide} className="inline-flex items-center gap-1 text-(--accent) hover:underline"><BookOpen size={13} />{ui.guide}</Link>}
                    <Link href={r.href} className="inline-flex items-center gap-1 text-white/65 hover:text-white"><Play size={12} fill="currentColor" />{ui.game}</Link>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/guides" className="mt-6 inline-block text-sm font-black text-(--accent) hover:underline">{ui.allGuides} →</Link>
          </section>
        )}

        {c.disclaimer && <p className="mt-14 text-[11px] leading-5 text-white/30">{c.disclaimer}</p>}
      </article>
    </main>
  );
}
