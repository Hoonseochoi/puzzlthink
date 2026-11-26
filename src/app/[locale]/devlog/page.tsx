// /devlog: the 개발 노트 hub — every developer-notes article, grouped by category.
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NotebookPen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { DEVLOG_ACCENT } from '@/components/devlog/DevlogPage';
import { DEVLOG, DEVLOG_CATEGORIES, devlogByCategory, devlogLocale, devlogPath } from '@/content/devlog';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: '개발 노트 — 게임 AI와 사이트를 만든 기록 | PUZZLTHINK',
    metaDescription: 'PUZZLTHINK를 만들면서 남긴 개발 노트예요. 벽바둑·십이장기·블라인드 오목의 AI가 수를 고르는 방법, 매우 어려움(헬모드) AI의 탐색 구조, 아이콘·명예의 전당·오픈 대전 같은 장치가 생겨난 과정을 코드와 커밋 기록으로 풀어 썼어요.',
    keywords: ['개발 노트', '게임 AI 만들기', '보드게임 AI', '벽바둑 AI', '십이장기 AI', '헬모드 AI', '알파베타 탐색', '웹 게임 개발기', 'PUZZLTHINK'],
    title: '개발 노트',
    lead: '게임과 AI, 그리고 사이트를 만들면서 생긴 일들을 적어 둔 곳이에요.',
    intro: [
      'PUZZLTHINK의 게임은 대부분 직접 짠 규칙 엔진과 AI 위에서 돌아가요. 이 노트는 그 안쪽 이야기예요. 처음엔 어떻게 만들었는지, 어떤 문제가 생겼는지, 그래서 무엇을 바꿨는지를 실제 코드와 커밋 기록을 따라가며 정리했어요.',
      'AI 글에는 난이도별로 AI가 실제로 하는 계산과 일부러 넣은 빈틈까지 그대로 적었어요. 이기고 싶은 분께는 공략이, 만드는 쪽이 궁금한 분께는 개발기가 될 거예요. 숫자는 모두 적어 둔 날짜에 집계한 값이에요.',
    ],
    count: (n: number) => `글 ${n}개`, read: '읽기',
  },
  en: {
    metaTitle: 'Dev notes — how the PUZZLTHINK games and their AIs were built',
    metaDescription: "Developer notes from building PUZZLTHINK: how the Wallgo, 12 Janggi and Blind Gomoku AIs choose a move, how the Very Hard (hell mode) AIs search, and how icons, the Hall of Fame and open matches came to be — told from the code and the commit history.",
    keywords: ['dev notes', 'game AI', 'board game AI', 'Wallgo AI', 'alpha-beta search', 'hell mode AI', 'web game development', 'PUZZLTHINK'],
    title: 'Dev notes',
    lead: 'What happened while building the games, their AIs and the site.',
    intro: [
      'Most PUZZLTHINK games run on rule engines and AIs written for this site. These notes are the inside story: how something was first built, what went wrong, and what was changed — following the actual code and commit history.',
      'The AI notes spell out what each difficulty really computes, including the gaps left in on purpose. If you want to win, read them as strategy; if you build things, read them as a dev diary. Every number is an aggregate taken on the date given.',
    ],
    count: (n: number) => `${n} notes`, read: 'Read',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[devlogLocale(locale)];
  return pageMetadata({ locale, path: '/devlog', title: c.metaTitle, description: c.metaDescription, keywords: [...c.keywords] });
}

export default async function DevlogHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = devlogLocale(locale);
  const c = COPY[loc];
  const tc = await getTranslations({ locale, namespace: 'Common' });

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: DEVLOG_ACCENT }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}/devlog`,
          mainEntity: { '@type': 'ItemList', itemListElement: DEVLOG.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a[loc].title, url: `${SITE_URL}/${locale}${devlogPath(a.slug)}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: '/devlog' }]),
      ] }} />
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <p className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)"><NotebookPen size={12} />PUZZLTHINK DEV NOTES</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80">{c.lead}</p>
        <div className="mt-5 max-w-3xl space-y-4">{c.intro.map((p) => <p key={p} className="break-keep text-[15px] leading-8 text-white/60">{p}</p>)}</div>
        <p className="mt-8 text-xs font-black tracking-[0.1em] text-white/40">{c.count(DEVLOG.length)}</p>

        {DEVLOG_CATEGORIES.map((cat) => {
          const list = devlogByCategory(cat.id);
          if (!list.length) return null;
          return (
            <section key={cat.id} id={cat.id} className="mt-12 scroll-mt-20">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{cat[loc]}</h2>
              <p className="mt-2 break-keep text-sm leading-7 text-white/50">{loc === 'en' ? cat.enLead : cat.koLead}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {list.map((a) => {
                  const game = GAMES.find((g) => g.id === a.games[0]);
                  const accent = game?.color && game.color !== '#2b2b31' ? game.color : DEVLOG_ACCENT;
                  return (
                    <li key={a.slug} className="flex flex-col rounded-[18px] border border-white/10 bg-white/[0.035] p-5" style={{ ['--accent' as string]: accent }}>
                      <p className="flex flex-wrap items-center gap-2 text-[11px] font-black text-white/45">
                        <span className="h-2.5 w-2.5 rounded-full bg-(--accent)" />
                        {a.games.length ? a.games.map((g) => tc(g)).join(' · ') : cat[loc]}
                      </p>
                      <h3 className="mt-2 text-lg font-black"><Link href={devlogPath(a.slug)} className="hover:text-(--accent)">{a[loc].title}</Link></h3>
                      <p className="mt-1.5 break-keep text-sm leading-7 text-white/55">{a[loc].summary}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs font-black">
                        <Link href={devlogPath(a.slug)} className="text-(--accent) hover:underline">{c.read} →</Link>
                        <span className="text-white/30">{a.updated}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
