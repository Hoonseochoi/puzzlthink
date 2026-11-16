import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RecordsClient from '@/components/RecordsClient';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Records' });
  const canonical = `${BASE_URL}/${locale}/records`;
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/records`, en: `${BASE_URL}/en/records` } } };
}

export default async function RecordsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RecordsClient />;
}
