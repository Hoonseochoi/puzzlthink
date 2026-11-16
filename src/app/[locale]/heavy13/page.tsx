import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import Heavy13Game from '@/components/heavy13/Heavy13Game';
import Heavy13Guide from '@/components/heavy13/Heavy13Guide';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Heavy13' });
  const canonical = `${BASE_URL}/${locale}/heavy13`;
  return {
    title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/heavy13`, en: `${BASE_URL}/en/heavy13` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function Heavy13Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Heavy13' });
  const g = await getTranslations({ locale, namespace: 'Heavy13Guide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'VideoGame', name: t('metaTitle'), alternateName: ['무거운 13', 'Heavy 13'], description: t('metaDescription'), url: `${BASE_URL}/${locale}/heavy13`, inLanguage: locale, genre: ['Strategy', 'Party game'], gamePlatform: 'Web browser', playMode: ['SinglePlayer', 'MultiPlayer'], numberOfPlayers: 7, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL } },
        { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      ] }} />
      <Heavy13Game />
      <Heavy13Guide locale={locale} />
    </>
  );
}
