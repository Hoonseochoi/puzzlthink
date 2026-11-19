import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import HomeClient from '@/components/HomeClient';
import JsonLd from '@/components/JsonLd';
import { GAMES } from '@/lib/gameCatalog';
import AdSlot from '@/components/AdSlot';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });
  return pageMetadata({ locale, path: '', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebSite', name: 'PUZZLTHINK', url: `${BASE_URL}/${locale}`, description: t('metaDescription'), inLanguage: locale, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL, logo: `${BASE_URL}/logo.png`, email: 'contact@puzzlthink.com' } },
        { '@type': 'ItemList', name: t('seoTitle'), itemListElement: GAMES.map((game, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE_URL}/${locale}${game.href}`, name: tc(game.id) })) },
      ] }} />
      <HomeClient />
      <section className="bg-[#f3f0e8] px-5 pb-20">
        <AdSlot placement="inline" className="mx-auto mb-12 max-w-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{t('seoTitle')}</h2>
          <p className="mt-4 text-sm leading-7 text-black/55">{t('seoBody')}</p>
        </div>
      </section>
    </>
  );
}
