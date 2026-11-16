import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HomeClient from '@/components/HomeClient';
import JsonLd from '@/components/JsonLd';
import AdSlot from '@/components/AdSlot';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });
  const canonical = `${BASE_URL}/${locale}`;
  return {
    title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko`, en: `${BASE_URL}/en`, 'x-default': `${BASE_URL}/ko` } },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'PUZZLTHINK', url: `${BASE_URL}/${locale}`, description: t('metaDescription'), inLanguage: locale }} />
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
