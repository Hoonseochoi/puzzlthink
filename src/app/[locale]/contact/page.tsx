import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import InfoArticle from '@/components/InfoArticle';

type Section = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Info' });
  return pageMetadata({ locale, path: '/contact', title: t('contactTitle'), description: t('contactDescription') });
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
