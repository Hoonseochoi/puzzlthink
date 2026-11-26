// /board-games: 보드게임 백과 hub — every encyclopedia article, grouped by category.
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { ARTICLES, CATEGORIES, WIKI_BASE, wikiLocale, wikiPath } from '@/content/encyclopedia';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: '보드게임 백과 — 장르, 역사, 개념으로 보는 보드게임의 세계 | PUZZLTHINK',
    metaDescription: '추상 전략·블러핑·베팅·n목 같은 장르, 바둑·장기·오목·스도쿠의 역사, 완전 정보·제로섬·풀린 게임 같은 개념까지. 보드게임과 퍼즐의 세계를 PUZZLTHINK 게임과 함께 정리했어요.',
    keywords: ['보드게임 백과', '보드게임 종류', '보드게임 장르', '추상 전략 게임', '바둑 역사', '오목 렌주', '스도쿠 역사', '완전 정보 게임', '블러핑 게임'],
    eyebrow: 'PUZZLTHINK ENCYCLOPEDIA', title: '보드게임 백과',
    lead: '어떤 게임이 있고, 무엇이 그 게임을 재미있게 만드는지.',
    intro: [
      '보드게임은 종류가 정말 많아요. 수천 년 된 바둑부터 신문 한 귀퉁이에서 시작된 스도쿠, 방송에서 처음 본 심리전 게임까지요. 이 백과는 그 넓은 세계를 장르, 계보, 개념이라는 세 갈래 길로 나눠 안내해요.',
      '글마다 그 주제에 속하는 PUZZLTHINK 게임을 함께 연결했어요. 읽다가 궁금해지면 바로 한 판 두어 보고, 게임을 하다가 “이런 게임은 원래 어디서 왔지?” 싶을 때 다시 찾아와 주세요. 사실관계는 여러 자료로 교차 확인했고, 글은 모두 PUZZLTHINK가 직접 썼어요.',
    ],
    count: (n: number) => `글 ${n}편`, read: '읽기',
  },
  en: {
    metaTitle: 'Board game encyclopedia — genres, history and the ideas behind board games',
    metaDescription: 'Genres like abstract strategy, bluffing, betting and n-in-a-row; the history of go, the chess family, gomoku and sudoku; ideas like perfect information, zero-sum and solved games — each tied to games you can play on PUZZLTHINK.',
    keywords: ['board game encyclopedia', 'types of board games', 'board game genres', 'abstract strategy games', 'history of go', 'gomoku renju', 'history of sudoku', 'perfect information', 'bluffing games'],
    eyebrow: 'PUZZLTHINK ENCYCLOPEDIA', title: 'Board game encyclopedia',
    lead: 'What games are out there, and what makes each one fun.',
    intro: [
      'There are a lot of board games — from go, thousands of years old, to sudoku, which started in a corner of a puzzle magazine, to the mind games people first saw on TV. This encyclopedia walks through that world along three paths: genres, lineages and concepts.',
      'Every article links to the PUZZLTHINK games that belong to its topic. Read, then play a round; or come back when a game leaves you wondering where it came from. Facts are cross-checked against several sources, and every article is written by PUZZLTHINK.',
    ],
    count: (n: number) => `${n} articles`, read: 'Read',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[wikiLocale(locale)];
  return pageMetadata({ locale, path: WIKI_BASE, title: c.metaTitle, description: c.metaDescription, keywords: [...c.keywords] });
}

export default async function BoardGamesHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = wikiLocale(locale);
  const c = COPY[loc];

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14">
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}${WIKI_BASE}`,
          mainEntity: { '@type': 'ItemList', itemListElement: ARTICLES.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a[loc].title, url: `${SITE_URL}/${locale}${wikiPath(a.slug)}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: WIKI_BASE }]),
      ] }} />
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-[#ffcc4d]">{c.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80">{c.lead}</p>
        <div className="mt-5 max-w-3xl space-y-4">{c.intro.map((para) => <p key={para} className="break-keep text-[15px] leading-8 text-white/60">{para}</p>)}</div>
        <p className="mt-8 text-xs font-black tracking-[0.1em] text-white/40">{c.count(ARTICLES.length)}</p>
        <nav className="mt-3 flex flex-wrap gap-2 text-xs font-black">
          {CATEGORIES.map((cat) => <a key={cat.id} href={`#${cat.id}`} className="rounded-full border border-white/15 px-3 py-1.5 text-white/70 hover:text-white" style={{ borderColor: `${cat.accent}66` }}>{cat[loc].title}</a>)}
        </nav>

        {CATEGORIES.map((cat) => {
          const list = ARTICLES.filter((a) => a.category === cat.id);
          if (!list.length) return null;
          return (
            <section key={cat.id} id={cat.id} className="mt-14 scroll-mt-20" style={{ ['--accent' as string]: cat.accent }}>
              <h2 className="text-2xl font-black tracking-[-0.03em]"><span className="mr-2 inline-block h-3 w-3 rounded-full bg-(--accent)" />{cat[loc].title}</h2>
              <p className="mt-2 max-w-3xl break-keep text-sm leading-7 text-white/55">{cat[loc].blurb}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {list.map((a) => (
                  <li key={a.slug} className="flex flex-col rounded-[18px] border border-white/10 bg-white/[0.035] p-5">
                    <h3 className="text-lg font-black"><Link href={wikiPath(a.slug)} className="hover:text-(--accent)">{a[loc].title}</Link></h3>
                    <p className="mt-1.5 break-keep text-sm leading-7 text-white/55">{a[loc].summary}</p>
                    <Link href={wikiPath(a.slug)} className="mt-auto pt-3 text-xs font-black text-(--accent) hover:underline">{c.read} →</Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
