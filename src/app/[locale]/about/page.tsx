import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import InfoArticle from '@/components/InfoArticle';

const BASE_URL = 'https://www.puzzlthink.com';
type Section = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Info' });
  const canonical = `${BASE_URL}/${locale}/about`;
  return { title: t('aboutTitle'), description: t('aboutDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/about`, en: `${BASE_URL}/en/about` } } };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Info' });
  return (
    <InfoArticle eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} subtitle={t('aboutDescription')} sections={t.raw('aboutSections') as Section[]}>

    </InfoArticle>
  );
}
