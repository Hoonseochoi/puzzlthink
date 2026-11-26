// One show/season: what it is, how a day runs, and every game in broadcast order, each linking to its page
// (and to the playable PUZZLTHINK version where there is one). Server-rendered.
import { ExternalLink, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { Section, card, prose, rich } from '@/components/guide/GuideBlocks';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { KIND_LABEL, SECTION_PATH, gamePath, showLocale, showPath } from '@/content/shows';
import type { Show } from '@/content/shows/types';
import { SHOW_UI } from './ui';

export default function ShowPage({ show, locale }: { show: Show; locale: string }) {
  const loc = showLocale(locale);
  const ui = SHOW_UI[loc];
  const s = show[loc];
  const path = showPath(show);
  const playable = show.games.filter((g) => g.site).length;
  const toc = [
    { id: 'format', title: ui.format },
    { id: 'games', title: ui.games },
    ...(s.extra ?? []).map((x) => ({ id: x.id, title: x.title })),
    { id: 'sources', title: ui.sources },
  ];

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: show.color }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        {
          '@type': 'Article', headline: s.title, description: s.meta.description, inLanguage: locale, url: `${SITE_URL}/${locale}${path}`,
          dateModified: show.updated, author: { '@type': 'Organization', name: 'PUZZLTHINK' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: SITE_URL },
          about: { '@type': 'TVSeries', name: s.name, startDate: show.aired.start, numberOfEpisodes: show.episodes },
        },
        {
          '@type': 'ItemList', name: `${s.name} — ${ui.games}`,
          itemListElement: show.games.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g[loc].name, url: `${SITE_URL}/${locale}${gamePath(show, g)}` })),
        },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: ui.section, path: SECTION_PATH }, { name: s.name, path }]),
      ] }} />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/45">
          <Link href={SECTION_PATH} className="hover:text-white">{ui.section}</Link>
        </nav>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{show.network[loc].toUpperCase()} · {show.aired.start.replace(/-/g, '.')} – {show.aired.end.replace(/-/g, '.')}</p>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/55">{ui.episodes(show.episodes)}</span>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/55">{ui.gameCount(show.games.length)} · {ui.playableCount(playable)}</span>
        </div>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{s.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{rich(s.lead)}</p>
        <div className="mt-5 space-y-4">{s.intro.map((p, i) => <p key={i} className={`${prose} text-white/60`}>{rich(p)}</p>)}</div>

        {show.spoiler && (
          <aside className="mt-6 rounded-[16px] border border-white/15 bg-white/[0.04] p-4">
            <p className="text-xs font-black text-white/80">{ui.spoilerTitle}</p>
            <p className="mt-1 break-keep text-[13px] leading-6 text-white/55">{ui.spoiler}</p>
          </aside>
        )}

        <nav className={`mt-8 p-5 ${card}`} aria-label={ui.toc}>
          <p className="text-[11px] font-black tracking-[0.14em] text-white/40">{ui.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm font-bold">
            {toc.map((item, i) => (
              <li key={item.id}><a href={`#${item.id}`} className="text-white/70 hover:text-(--accent)"><span className="mr-2 font-mono text-(--accent)">{String(i + 1).padStart(2, '0')}</span>{item.title}</a></li>
            ))}
          </ol>
        </nav>

        <Section section={{ id: 'format', title: ui.format, blocks: s.format }} />

        <section id="games" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{ui.games}</h2>
          <ol className="mt-6 space-y-3">
            {show.games.map((g, i) => {
              const site = g.site ? GAMES.find((x) => x.id === g.site) : undefined;
              return (
                <li key={g.slug} data-play-game={g.site} className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center ${card}`}>
                  <span className="font-mono text-sm font-black text-(--accent)">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white/45">{g.when[loc]}{g.episode ? ` · ${g.episode[loc]}` : ''} · {KIND_LABEL[g.kind][loc]}</p>
                    <h3 className="mt-0.5 text-lg font-black"><Link href={gamePath(show, g)} className="hover:text-(--accent)">{g[loc].name}</Link></h3>
                    <p className="mt-1 break-keep text-sm leading-6 text-white/55">{g[loc].summary}</p>
                  </div>
                  {site && <Link href={site.href} className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-(--accent) px-4 py-2 text-xs font-black text-black/85 hover:brightness-110 sm:self-center"><Play size={12} fill="currentColor" />{ui.play}</Link>}
                </li>
              );
            })}
          </ol>
        </section>

        <AdSlot placement="inline" tone="dark" className="mt-14" />

        {(s.extra ?? []).map((x) => <Section key={x.id} section={x} />)}

        <section id="sources" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{ui.sources}</h2>
          <ul className="mt-4 space-y-2">
            {show.sources.map((src) => (
              <li key={src.label.ko} className="break-keep text-sm leading-6 text-white/60">
                {src.url ? <a href={src.url} rel="nofollow noopener" target="_blank" className="inline-flex items-center gap-1 hover:text-white">{src.label[loc]}<ExternalLink size={12} /></a> : src.label[loc]}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] font-bold text-white/35">{ui.updated} · {show.updated}</p>
        </section>

        <Link href={SECTION_PATH} className="mt-12 inline-block text-sm font-black text-(--accent) hover:underline">← {ui.allShows}</Link>
        <p className="mt-14 text-[11px] leading-5 text-white/30">{s.disclaimer}</p>
      </article>
    </main>
  );
}
