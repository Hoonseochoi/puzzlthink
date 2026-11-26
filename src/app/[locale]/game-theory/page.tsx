// /game-theory: the hub of the 게임 이론 section, articles grouped by category (registry: src/content/game-theory).
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { card } from '@/components/guide/GuideBlocks';
import { GT_ACCENT } from '@/components/game-theory/GTArticlePage';
import { ARTICLES, CATEGORIES, GT_PATH, articlePath, gtLocale } from '@/content/game-theory';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: '게임 이론 — 죄수의 딜레마부터 팃포탯·블러핑·경매까지, 서바이벌 게임으로 읽기 | PUZZLTHINK',
    metaDescription: '죄수의 딜레마, 내시 균형, 팃포탯, 치킨 게임, 블러핑, 경매, 연합과 투표까지. 두뇌 서바이벌 게임과 PUZZLTHINK 게임을 예로 들어 게임 이론의 핵심 개념을 쉽고 정확하게 풀어 썼어요.',
    keywords: ['게임 이론', '게임이론 쉽게', '죄수의 딜레마', '내시 균형', '팃포탯', '치킨 게임', '블러핑', '경매 이론', '데블스 플랜 게임 이론', '더 지니어스 게임 이론'],
    eyebrow: 'PUZZLTHINK GAME THEORY', title: '게임 이론',
    lead: '머리싸움에도 문법이 있어요. 서바이벌 게임으로 배우는 전략적 사고.',
    intro: [
      '게임 이론은 여러 사람이 서로의 선택을 의식하며 결정할 때 무슨 일이 일어나는지를 다루는 학문이에요. 이름은 "게임"이지만 경제, 정치, 생물학, 컴퓨터 과학까지 쓰이고, 반대로 우리가 즐기는 보드게임과 방송 속 두뇌 게임을 들여다보는 데도 아주 좋은 도구예요.',
      '이 섹션의 글은 모두 같은 순서로 써 있어요. 구체적인 상황에서 출발해 작은 보수표나 게임 나무로 모형을 만들고, 그 모형이 무엇을 예측하는지, 실제 사람들은 어디서 예측과 다르게 움직이는지, 그리고 게임에서 어떻게 써먹을 수 있는지를 차례로 살펴봐요. 표에 나온 숫자와 균형은 하나하나 직접 확인했고, 학계의 결과는 출처를 글 끝에 적었어요.',
      '처음이라면 기초 개념의 「내시 균형」과 「죄수의 딜레마」부터 읽는 걸 추천해요. 다른 글은 어떤 순서로 읽어도 괜찮아요.',
    ],
    count: (n: number) => `글 ${n}편`, read: '읽기',
  },
  en: {
    metaTitle: 'Game theory — from the prisoner’s dilemma to tit-for-tat, bluffing and auctions, through survival games',
    metaDescription: 'The prisoner’s dilemma, Nash equilibrium, tit-for-tat, chicken, bluffing, auctions, coalitions and voting: the core ideas of game theory explained clearly, with brain-survival show games and PUZZLTHINK games as examples.',
    keywords: ['game theory', 'game theory explained', "prisoner's dilemma", 'Nash equilibrium', 'tit for tat', 'game of chicken', 'bluffing', 'auction theory', "Devil's Plan game theory", 'The Genius game theory'],
    eyebrow: 'PUZZLTHINK GAME THEORY', title: 'Game theory',
    lead: 'Mind games have a grammar. Strategic thinking, learned through survival games.',
    intro: [
      'Game theory studies what happens when several people make decisions while each takes the others’ choices into account. It is called "game" theory, yet it is used in economics, politics, biology and computer science, and it is also a superb lens for the board games we play and the brain games we watch on TV.',
      'Every article here follows the same path: start from a concrete situation, build a small payoff table or game tree, see what the model predicts, look at where real people depart from the prediction, and finish with how to use it in a game. Every number and equilibrium in the tables was checked by hand, and the research results are cited at the end of each article.',
      'If you are new, start with "Nash equilibrium" and "The prisoner’s dilemma" in the foundations. The rest can be read in any order.',
    ],
    count: (n: number) => `${n} articles`, read: 'Read',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[gtLocale(locale)];
  return pageMetadata({ locale, path: GT_PATH, title: c.metaTitle, description: c.metaDescription, keywords: [...c.keywords] });
}

export default async function GameTheoryHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = gtLocale(locale);
  const c = COPY[loc];

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14" style={{ ['--accent' as string]: GT_ACCENT }}>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}${GT_PATH}`,
          mainEntity: { '@type': 'ItemList', itemListElement: ARTICLES.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a[loc].title, url: `${SITE_URL}/${locale}${articlePath(a.slug)}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: GT_PATH }]),
      ] }} />
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{c.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80">{c.lead}</p>
        <div className="mt-5 max-w-3xl space-y-4">{c.intro.map((p) => <p key={p} className="break-keep text-[15px] leading-8 text-white/60">{p}</p>)}</div>
        <p className="mt-8 text-xs font-black tracking-[0.1em] text-white/40">{c.count(ARTICLES.length)}</p>

        <nav className="mt-3 flex flex-wrap gap-2" aria-label={c.title}>
          {CATEGORIES.map((cat) => <a key={cat.id} href={`#${cat.id}`} className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/65 hover:border-(--accent) hover:text-(--accent)">{cat[loc].title}</a>)}
        </nav>

        {CATEGORIES.map((cat) => {
          const list = ARTICLES.filter((a) => a.category === cat.id);
          if (!list.length) return null;
          return (
            <section key={cat.id} id={cat.id} className="mt-14 scroll-mt-20">
              <h2 className="text-2xl font-black tracking-[-0.03em]">{cat[loc].title}</h2>
              <p className="mt-2 break-keep text-sm leading-7 text-white/50">{cat[loc].lead}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {list.map((a) => (
                  <li key={a.slug} className={`flex flex-col p-5 ${card}`}>
                    <h3 className="text-lg font-black"><Link href={articlePath(a.slug)} className="hover:text-(--accent)">{a[loc].title}</Link></h3>
                    <p className="mt-1.5 break-keep text-sm leading-7 text-white/55">{a[loc].summary}</p>
                    <Link href={articlePath(a.slug)} className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-black text-(--accent) hover:underline"><BookOpen size={13} />{c.read}</Link>
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
