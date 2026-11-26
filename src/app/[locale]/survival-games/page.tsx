// /survival-games: the 두뇌 서바이벌 게임 정리 hub — every written show, most recently released first, the show
// games the site has made playable, and the shows still to be written up.
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { card, prose, rich } from '@/components/guide/GuideBlocks';
import { SHOW_UI } from '@/components/shows/ui';
import { SECTION_PATH, SHOWS_PLANNED, SHOWS_WRITTEN, gamePath, showLocale, showPath } from '@/content/shows';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: (shows: string) => `두뇌 서바이벌 게임 정리 — ${shows}${shows.endsWith('방송') ? '' : ' 방송'} 게임 규칙`,
    metaDescription: (shows: string, games: number) => `${shows}에 나온 게임 ${games}개를 최근 방송 순으로 정리했어요. 게임마다 인원·준비물, 진행 순서, 승리 조건, 예외 규칙과 승부를 가르는 지점, 비슷한 보드게임을 담았어요.`,
    keywords: ['두뇌 서바이벌 게임', '두뇌 서바이벌 게임 규칙', '방송 보드게임'],
    eyebrow: 'BRAIN SURVIVAL GAMES', title: '두뇌 서바이벌 게임 정리',
    lead: '방송에서 본 그 게임, 규칙부터 승부처까지 한 페이지에.',
    intro: [
      '두뇌 서바이벌 방송은 매 회 새로운 게임을 만들어 내요. 화면으로 보면 금방 지나가 버리는 규칙을, 게임마다 한 페이지씩 **인원·준비물 → 진행 순서 → 승리 조건 → 예외 규칙** 순서로 다시 정리했어요. 그다음에는 규칙만 보고 따져 본 "승부를 가르는 지점"과, 같은 원리를 쓰는 실제 보드게임을 함께 소개해요.',
      '가장 최근에 공개된 방송부터 차례로 정리하고 있어요. 누가 이기고 누가 탈락했는지는 적지 않아요. PUZZLTHINK에서 직접 만들어 둔 게임은 바로 플레이할 수 있게 연결했어요.',
    ],
  },
  en: {
    metaTitle: (shows: string) => `Brain-survival show games — ${shows}: every game explained`,
    metaDescription: (shows: string, games: number) => `The ${games} games of ${shows}, newest show first. Each game: players and components, how a round goes, how to win, edge cases, what decides it, and similar board games.`,
    keywords: ['Korean brain survival show games', 'game show board games'],
    eyebrow: 'BRAIN SURVIVAL GAMES', title: 'Brain-survival show games',
    lead: 'The game you saw on the show — rules to the deciding moves, on one page.',
    intro: [
      'Korean brain-survival shows invent new games every episode, and the rules fly past on screen. Here each game gets its own page, laid out as **players and components → how a round goes → how to win → edge cases**, then what really decides it (reasoned from the rules alone) and real board games built on the same idea.',
      'Shows are covered newest first. No page says who won or was eliminated. Games that PUZZLTHINK has built are linked so you can play them straight away.',
    ],
  },
} as const;

/** The shows written so far, for the title and description: they always say exactly what the section covers. */
function covered(loc: 'ko' | 'en') {
  const names = SHOWS_WRITTEN.map((s) => s.short[loc]);
  const list = names.length <= 3 ? names.join(loc === 'ko' ? '·' : ', ') : `${names.slice(0, 3).join(loc === 'ko' ? '·' : ', ')}${loc === 'ko' ? ` 외 ${names.length - 3}개 방송` : ` and ${names.length - 3} more shows`}`;
  return { list, games: SHOWS_WRITTEN.reduce((n, s) => n + s.games.length, 0) };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = showLocale(locale);
  const c = COPY[loc];
  const { list, games } = covered(loc);
  return pageMetadata({ locale, path: SECTION_PATH, title: c.metaTitle(list), description: c.metaDescription(list, games), keywords: [...c.keywords, ...SHOWS_WRITTEN.flatMap((s) => s[loc].meta.keywords.slice(0, 2))] });
}

export default async function SurvivalGamesHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = showLocale(locale);
  const c = COPY[loc];
  const ui = SHOW_UI[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const playable = SHOWS_WRITTEN.flatMap((show) => show.games.filter((g) => g.site).map((g) => ({ show, game: g, site: GAMES.find((x) => x.id === g.site)! })));

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: '#ff5d6c' }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription(covered(loc).list, covered(loc).games), inLanguage: locale, url: `${SITE_URL}/${locale}${SECTION_PATH}`,
          mainEntity: { '@type': 'ItemList', itemListElement: SHOWS_WRITTEN.map((show, i) => ({ '@type': 'ListItem', position: i + 1, name: show[loc].name, url: `${SITE_URL}/${locale}${showPath(show)}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: SECTION_PATH }]),
      ] }} />
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{c.eyebrow}</p>
        <h1 className="mt-2 break-keep text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80 sm:text-xl">{c.lead}</p>
        <div className="mt-5 max-w-3xl space-y-4">{c.intro.map((p, i) => <p key={i} className={`${prose} text-white/60`}>{rich(p)}</p>)}</div>

        <section className="mt-12">
          <ul className="grid gap-4">
            {SHOWS_WRITTEN.map((show) => {
              const s = show[loc];
              return (
                <li key={show.slug} className={`p-6 ${card}`} style={{ ['--accent' as string]: show.color }}>
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-(--accent)">{show.network[loc].toUpperCase()} · {ui.aired} {show.aired.start.replace(/-/g, '.')} · {ui.episodes(show.episodes)}</p>
                  <h2 className="mt-1.5 text-2xl font-black tracking-[-0.03em]"><Link href={showPath(show)} className="hover:text-(--accent)">{s.name}</Link></h2>
                  <p className="mt-2 break-keep text-sm leading-7 text-white/60">{s.summary}</p>
                  <ol className="mt-4 flex flex-wrap gap-2">
                    {show.games.map((g) => (
                      <li key={g.slug} data-play-game={g.site}><Link href={gamePath(show, g)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold hover:text-white ${g.site ? 'border-(--accent)/50 text-white/85' : 'border-white/12 text-white/60'}`}>{g.site && <Play size={10} fill="currentColor" className="text-(--accent)" />}{g[loc].name}</Link></li>
                    ))}
                  </ol>
                  <Link href={showPath(show)} className="mt-5 inline-block text-sm font-black text-(--accent) hover:underline">{ui.gameCount(show.games.length)} · {ui.playableCount(show.games.filter((g) => g.site).length)} →</Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{ui.playableAll}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {playable.map(({ show, game, site }) => (
              <li key={`${show.slug}/${game.slug}`} data-play-game={game.site} className={`flex items-center gap-3 p-4 ${card}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: site.color }} />
                <div className="min-w-0 flex-1">
                  <Link href={gamePath(show, game)} className="font-black hover:underline">{game[loc].name}</Link>
                  <p className="text-[11px] font-bold text-white/40">{show[loc].name} · {game.when[loc]}</p>
                </div>
                <Link href={site.href} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/85 hover:bg-white/20"><Play size={11} fill="currentColor" />{tc(site.id)}</Link>
              </li>
            ))}
          </ul>
        </section>

        {SHOWS_PLANNED.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{ui.planned}</h2>
          <p className="mt-2 break-keep text-sm leading-7 text-white/50">{ui.plannedNote}</p>
          <ul className="mt-5 divide-y divide-white/[0.07] rounded-[18px] border border-white/10">
            {SHOWS_PLANNED.map((p) => (
              <li key={p.name.ko} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
                <span className="font-bold text-white/75">{p.name[loc]}</span>
                <span className="font-mono text-xs text-white/40">{p.network[loc]} · {p.released.replace('-', '.')}</span>
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>
    </main>
  );
}
