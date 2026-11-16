import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RJGame from '@/components/russianJanggi/RJGame';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianJanggi' });
  const canonical = `${BASE_URL}/${locale}/russian-janggi`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/russian-janggi`, en: `${BASE_URL}/en/russian-janggi` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function RussianJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RJGame />;
}
