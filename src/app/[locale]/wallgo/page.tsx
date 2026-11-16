import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import WallGoGame from '@/components/WallGoGame';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const canonical = `${BASE_URL}/${locale}/wallgo`;
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/wallgo`, en: `${BASE_URL}/en/wallgo` } }, openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, type: 'website' } };
}

export default async function WallGoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WallGoGame />;
}
