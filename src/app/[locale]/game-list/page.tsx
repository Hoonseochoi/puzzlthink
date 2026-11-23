import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import GameListClient from '@/components/GameListClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'GameList' });
  return pageMetadata({ locale, path: '/game-list', title: t('metaTitle'), description: t('metaDescription') });
}

/** Every game in two columns: its picture and name, nothing else. */
export default async function GameListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'GameList' });
  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-24 pt-6 text-[#17201e] sm:px-5 sm:pt-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{t('title')}</h1>
        <p className="mt-1 text-xs font-bold text-black/45">{t('intro')}</p>
        <GameListClient />
      </div>
    </main>
  );
}
