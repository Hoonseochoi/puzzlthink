import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import InfoArticle from '@/components/InfoArticle';

type Section = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Info' });
  return pageMetadata({ locale, path: '/about', title: t('aboutTitle'), description: t('aboutDescription') });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Info' });
  const th = await getTranslations({ locale, namespace: 'Home' });
  // The site introduction that used to close the home page opens this one.
  const sections: Section[] = [{ title: th('seoTitle'), body: th('seoBody') }, ...(t.raw('aboutSections') as Section[])];
  return (
    <InfoArticle eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} subtitle={t('aboutDescription')} sections={sections}>

    </InfoArticle>
  );
}
