// /guides: every game that has a dedicated guide page (the shared route's guides and the 8 logic-puzzle guides).
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen, Play } from 'lucide-react';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { guideListings, guideLocale } from '@/content/guides';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: '게임 공략 모음 — 벽바둑·십이장기·논리 퍼즐 규칙과 전략 | PUZZLTHINK',
    metaDescription: 'PUZZLTHINK 게임별 공략을 한곳에 모았어요. 규칙의 예외 상황, 첫 수부터 끝내기까지의 전략, 자주 하는 실수, 용어 정리와 FAQ를 게임마다 자세히 정리했어요.',
    keywords: ['게임 공략', '보드게임 공략', '벽바둑 공략', '십이장기 공략', '논리 퍼즐 공략', '데블스플랜 게임 공략', '더 지니어스 게임 공략'],
    eyebrow: 'PUZZLTHINK GUIDES', title: '게임 공략',
    lead: '규칙을 아는 것과 잘 두는 것 사이의 거리를 줄여 드려요.',
    intro: [
      '여기 있는 공략은 게임마다 따로 쓴 긴 글이에요. 게임 화면 아래의 짧은 설명보다 한 걸음 더 들어가서, 규칙이 애매해지는 순간(이럴 땐 어떻게 되지?)을 먼저 정리하고, 처음 두는 사람이 바로 써먹을 수 있는 원칙부터 상위권이 신경 쓰는 수읽기까지 단계별로 나눴어요.',
      '모든 규칙과 숫자는 PUZZLTHINK에서 실제로 돌아가는 게임 규칙을 기준으로 썼어요. 공략을 읽고 바로 한 판 두어 보면 훨씬 빨리 늘어요.',
    ],
    count: (n: number) => `공략 ${n}개`, guide: '공략 읽기', play: '게임 하기',
  },
  en: {
    metaTitle: 'Game guides — rules, strategy and tips for every PUZZLTHINK game',
    metaDescription: 'In-depth guides for PUZZLTHINK games: the edge cases of the rules, strategy from the first move to the endgame, common mistakes, a glossary and an FAQ for each game.',
    keywords: ['game guides', 'board game strategy', 'Wallgo strategy', '12 Janggi strategy', 'logic puzzle guide', "Devil's Plan games", 'The Genius games'],
    eyebrow: 'PUZZLTHINK GUIDES', title: 'Game guides',
    lead: 'Closing the gap between knowing the rules and playing well.',
    intro: [
      'Each guide here is a long article written for one game. They go a step beyond the short notes under each board: the edge cases of the rules come first ("what happens if…?"), then strategy split into levels, from principles a first-timer can use right away to the reading that top players care about.',
      'Every rule and number is taken from the game as it actually runs on PUZZLTHINK. Read a guide, then play a game straight away — it sticks much faster.',
    ],
    count: (n: number) => `${n} guides`, guide: 'Read guide', play: 'Play',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[guideLocale(locale)];
  return pageMetadata({ locale, path: '/guides', title: c.metaTitle, description: c.metaDescription, keywords: [...c.keywords] });
}

export default async function GuidesHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[guideLocale(locale)];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const list = guideListings(locale);

  return (
    <main className="min-h-screen bg-[#0a0b10] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14">
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}/guides`,
          mainEntity: { '@type': 'ItemList', itemListElement: list.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.title, url: `${SITE_URL}/${locale}${l.path}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: '/guides' }]),
      ] }} />
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <p className="mt-6 font-mono text-[10px] font-bold tracking-[0.2em] text-[#ffcc4d]">{c.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/80">{c.lead}</p>
        <div className="mt-5 max-w-3xl space-y-4">{c.intro.map((p) => <p key={p} className="break-keep text-[15px] leading-8 text-white/60">{p}</p>)}</div>
        <p className="mt-8 text-xs font-black tracking-[0.1em] text-white/40">{c.count(list.length)}</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {list.map((item) => {
            const game = GAMES.find((g) => g.id === item.game)!;
            return (
              <li key={item.game} className="flex flex-col rounded-[18px] border border-white/10 bg-white/[0.035] p-5" style={{ ['--accent' as string]: game.color }}>
                <p className="flex items-center gap-2 text-[11px] font-black text-white/45"><span className="h-2.5 w-2.5 rounded-full bg-(--accent)" />{tc(item.game)}</p>
                <h2 className="mt-2 text-lg font-black"><Link href={item.path} className="hover:text-(--accent)">{item.title}</Link></h2>
                <p className="mt-1.5 break-keep text-sm leading-7 text-white/55">{item.summary}</p>
                <div className="mt-auto flex gap-4 pt-4 text-xs font-black">
                  <Link href={item.path} className="inline-flex items-center gap-1 text-(--accent) hover:underline"><BookOpen size={13} />{c.guide}</Link>
                  <Link href={game.href} className="inline-flex items-center gap-1 text-white/60 hover:text-white"><Play size={12} fill="currentColor" />{c.play}</Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
