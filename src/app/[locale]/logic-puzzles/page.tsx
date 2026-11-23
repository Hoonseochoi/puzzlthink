import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen, Play, Trophy } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { BinairoPreview, ColorLinkPreview, MagicSwapPreview, MasyuPreview, NonogramPreview, OneStrokePreview, StarBattlePreview } from '@/components/logic/LogicPreview';
import { Link } from '@/i18n/routing';
import { CERT_GAMES } from '@/lib/hardClear';
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, SITE_URL } from '@/lib/seo';
import type { GameId } from '@/lib/stats';

type Puzzle = { id: GameId; common: string; desc: string; href: string; guide: string; rank: string; art?: ReactNode };

// The logic puzzles, easiest rules first. Sudoku's guide is the long guide on its own page.
const PUZZLES: Puzzle[] = [
  { id: 'magicswap', common: 'magicswap', desc: 'magicswapDescription', href: '/magic-square', guide: '/magic-square/guide', rank: '/ranking/magic-square', art: <MagicSwapPreview /> },
  { id: 'binairo', common: 'binairo', desc: 'binairoDescription', href: '/binairo', guide: '/binairo/guide', rank: '/ranking/binairo', art: <BinairoPreview /> },
  { id: 'onestroke', common: 'onestroke', desc: 'onestrokeDescription', href: '/one-stroke', guide: '/one-stroke/guide', rank: '/ranking/one-stroke', art: <OneStrokePreview /> },
  { id: 'colorlink', common: 'colorlink', desc: 'colorlinkDescription', href: '/color-link', guide: '/color-link/guide', rank: '/ranking/color-link', art: <ColorLinkPreview /> },
  { id: 'starbattle', common: 'starbattle', desc: 'starbattleDescription', href: '/star-battle', guide: '/star-battle/guide', rank: '/ranking/star-battle', art: <StarBattlePreview /> },
  { id: 'nonogram', common: 'nonogram', desc: 'nonogramDescription', href: '/nonogram', guide: '/nonogram/guide', rank: '/ranking/nonogram', art: <NonogramPreview /> },
  { id: 'slitherlink', common: 'slitherlink', desc: 'slitherlinkDescription', href: '/slitherlink', guide: '/slitherlink/guide', rank: '/ranking/slitherlink' },
  { id: 'masyu', common: 'masyu', desc: 'masyuDescription', href: '/masyu', guide: '/masyu/guide', rank: '/ranking/masyu', art: <MasyuPreview /> },
  { id: 'sudoku', common: 'sudoku', desc: 'sudokuDescription', href: '/play', guide: '/play#guide', rank: '/ranking/sudoku' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LogicHub' });
  return pageMetadata({ locale, path: '/logic-puzzles', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

/** 논리 퍼즐 hub: every logic puzzle with its guide and ranking, for searches like "논리 퍼즐 온라인". */
export default async function LogicPuzzlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'LogicHub' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const th = await getTranslations({ locale, namespace: 'Home' });
  const why = t.raw('why') as { title: string; body: string }[];
  const faq = t.raw('faq') as { q: string; a: string }[];

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'CollectionPage', name: t('metaTitle'), description: t('metaDescription'), url: `${SITE_URL}/${locale}/logic-puzzles`, inLanguage: locale,
          mainEntity: { '@type': 'ItemList', itemListElement: PUZZLES.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${locale}${p.href}`, name: tc(p.common) })) } },
        faqJsonLd(faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/logic-puzzles' }]),
      ] }} />
      <div className="mx-auto max-w-5xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">{t('eyebrow')}</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl break-keep text-sm leading-7 text-black/55">{t('intro')}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PUZZLES.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-[26px] border border-black/10 bg-[#f9f7f1] p-5 shadow-[0_18px_50px_rgba(30,38,36,0.06)]">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center">
                  {p.art ?? <span className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg" style={{ background: CERT_GAMES[p.id].color }}>{tc(p.common).slice(0, 1)}</span>}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black tracking-[-0.03em]"><Link href={p.href} className="hover:underline">{tc(p.common)}</Link></h2>
                  <p className="mt-1 break-keep text-[13px] leading-6 text-black/55">{th(p.desc)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={p.href} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-[#17201e]" style={{ background: CERT_GAMES[p.id].color }}><Play size={13} fill="currentColor" />{t('play')}</Link>
                <Link href={p.guide} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/70"><BookOpen size={13} />{t('guide')}</Link>
                <Link href={p.rank} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/70"><Trophy size={13} />{t('ranking')}</Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{t('whyTitle')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {why.map((w) => <div key={w.title} className="rounded-[20px] border border-black/10 bg-white/70 p-5"><h3 className="font-black">{w.title}</h3><p className="mt-1.5 break-keep text-sm leading-7 text-black/55">{w.body}</p></div>)}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{t('faqTitle')}</h2>
          <div className="mt-4 space-y-2">
            {faq.map((f) => <details key={f.q} className="rounded-[18px] border border-black/10 bg-white/70 p-5"><summary className="cursor-pointer list-none font-black">{f.q}</summary><p className="mt-2 break-keep text-sm leading-7 text-black/55">{f.a}</p></details>)}
          </div>
        </section>
      </div>
    </main>
  );
}
