// /originals: the PUZZLTHINK ORIGINAL series — games whose rules PUZZLTHINK made itself.
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { GamePreview } from '@/components/HomeClient';
import { FitTile } from '@/components/OpenMatchCard';
import { OriginalMark, PgDefs } from '@/components/propositionGo/PropParts';
import { ORIGINALS } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    metaTitle: 'PUZZLTHINK ORIGINAL — PUZZLTHINK가 직접 만든 게임',
    metaDescription: 'TV 프로그램이나 기존 보드게임을 옮기지 않고, PUZZLTHINK가 규칙부터 직접 만든 게임 시리즈. 명제 바둑, 뒤집기 오목.',
    keywords: ['PUZZLTHINK 오리지널', '창작 보드게임', '창작 퍼즐', '명제 바둑', '뒤집기 오목'],
    title: 'PUZZLTHINK ORIGINAL',
    lead: '어디서도 본 적 없는 게임을, 여기서 처음.',
    intro: [
      'PUZZLTHINK의 게임 대부분은 두뇌 서바이벌 방송이나 오래된 퍼즐·보드게임을 웹에서 할 수 있게 옮긴 거예요. ORIGINAL 시리즈는 다릅니다. 규칙부터 PUZZLTHINK가 직접 만들었고, 여기서만 할 수 있어요.',
      '오리지널 게임은 바둑알 캐릭터가 주인공이에요. 새 오리지널이 나오면 이 목록에 가장 먼저 올라와요.',
    ],
    play: '하러 가기', guide: '공략',
  },
  en: {
    metaTitle: 'PUZZLTHINK ORIGINAL — games PUZZLTHINK made itself',
    metaDescription: 'Not adapted from TV shows or classic board games: a series of games whose rules PUZZLTHINK made. Proposition Go, Flip Omok.',
    keywords: ['PUZZLTHINK original', 'original board game', 'original puzzle', 'Proposition Go', 'Flip Omok'],
    title: 'PUZZLTHINK ORIGINAL',
    lead: 'Games you have not seen anywhere else, first played here.',
    intro: [
      'Most games on PUZZLTHINK bring brain-survival TV games or classic puzzles and board games to the web. The ORIGINAL series is different: PUZZLTHINK made the rules, and you can only play them here.',
      'The go-stone characters are the stars of every original. New originals appear at the top of this list first.',
    ],
    play: 'Play', guide: 'Guide',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return pageMetadata({ locale, path: '/originals', title: c.metaTitle, description: c.metaDescription, keywords: [...c.keywords] });
}

export default async function OriginalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const th = await getTranslations({ locale, namespace: 'Home' });
  return (
    <main className="min-h-screen bg-[radial-gradient(120%_60%_at_50%_0%,#2a1670_0%,#0d0820_60%)] px-5 pb-20 pt-10 text-[#eceff4] sm:pt-14">
      <PgDefs />
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: c.title, description: c.metaDescription, inLanguage: locale, url: `${SITE_URL}/${locale}/originals`,
          mainEntity: { '@type': 'ItemList', itemListElement: ORIGINALS.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: tc(g.id), url: `${SITE_URL}/${locale}${g.href}` })) } },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title, path: '/originals' }]),
      ] }} />
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs font-bold text-white/45 hover:text-white">← PUZZLTHINK</Link>
        <div className="mt-6"><OriginalMark size="md" /></div>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{c.title}</h1>
        <p className="mt-3 break-keep text-lg font-black text-white/85">{c.lead}</p>
        <div className="mt-4 space-y-3">{c.intro.map((p) => <p key={p} className="break-keep text-[15px] leading-7 text-white/65">{p}</p>)}</div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ORIGINALS.map((g) => (
            <li key={g.id} className="overflow-hidden rounded-[22px] bg-black/35 ring-1 ring-white/10">
              <Link href={g.href} className="block aspect-[4/3] overflow-hidden bg-[#17201e]"><FitTile title={tc(g.id)} className="h-full w-full"><GamePreview id={g.id} /></FitTile></Link>
              <div className="p-4">
                <h2 className="text-xl font-black tracking-[-0.03em]">{tc(g.id)}</h2>
                <p className="mt-1 break-keep text-[13px] leading-6 text-white/60">{th(`${g.id}Description`)}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={g.href} className="rounded-full bg-[#b49cff] px-4 py-2 text-[13px] font-black text-[#12062e]">{c.play}</Link>
                  {g.hasGuide && <Link href={`${g.href}/guide`} className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-black text-white/85">{c.guide}</Link>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
