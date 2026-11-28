import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import GameListClient from '@/components/GameListClient';
import JsonLd from '@/components/JsonLd';
import { GAMES } from '@/lib/gameCatalog';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'GameList' });
  return pageMetadata({ locale, path: '/game-list', title: t('metaTitle', { count: GAMES.length }), description: t('metaDescription', { count: GAMES.length }), keywords: t.raw('keywords') as string[] });
}

/** Every game in two columns: its picture and name, nothing else. */
export default async function GameListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'GameList' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-24 pt-6 text-[#17201e] sm:px-5 sm:pt-10">
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'ItemList', name: t('title'), numberOfItems: GAMES.length, itemListElement: GAMES.map((game, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${locale}${game.href}`, name: tc(game.id) })) },
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/game-list' }]),
      ] }} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{t('title')}</h1>
        <p className="mt-1 text-xs font-bold text-black/45">{t('intro')}</p>
        {/* /game-list is the "play" page and /games the "rules" page: each links to the other. */}
        <Link href="/games" className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-black/60 underline-offset-2 hover:text-black hover:underline">{t('rulesLink')}<ArrowRight size={12} /></Link>
        <GameListClient />
      </div>
    </main>
  );
}
