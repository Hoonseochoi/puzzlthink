import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import InfoArticle from '@/components/InfoArticle';

const BASE_URL = 'https://www.puzzlthink.com';
type Section = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Info' });
  const canonical = `${BASE_URL}/${locale}/contact`;
  return { title: t('contactTitle'), description: t('contactDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/contact`, en: `${BASE_URL}/en/contact` } } };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Info' });
  return (
    <InfoArticle eyebrow={t('contactEyebrow')} title={t('contactTitle')} subtitle={t('contactDescription')} sections={t.raw('contactSections') as Section[]} accent="#4b7bff">
      <a href={`mailto:${t('email')}`} className="mt-8 inline-flex rounded-full bg-[#17201e] px-5 py-3 text-sm font-bold text-white hover:bg-black">{t('email')}</a>
    </InfoArticle>
  );
}
