import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HomeClient from '@/components/HomeClient';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });
  const canonical = `${BASE_URL}/${locale}`;
  return {
    title: t('metaTitle'), description: t('metaDescription'),
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko`, en: `${BASE_URL}/en`, 'x-default': `${BASE_URL}/ko` } },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website', images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'PUZZLTHINK online board games' }] },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeClient />;
}
