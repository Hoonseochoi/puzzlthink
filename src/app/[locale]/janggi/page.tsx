import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import JanggiGame from '@/components/janggi/JanggiGame';
import JanggiGuide from '@/components/janggi/JanggiGuide';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Janggi' });
  const canonical = `${BASE_URL}/${locale}/janggi`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/janggi`, en: `${BASE_URL}/en/janggi` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function JanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Janggi' });
  const g = await getTranslations({ locale, namespace: 'JanggiGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'VideoGame', name: t('metaTitle'), alternateName: ['십이장기', '12장기', 'Sibi Janggi'], description: t('metaDescription'), url: `${BASE_URL}/${locale}/janggi`, inLanguage: locale, genre: ['Strategy', 'Board game'], gamePlatform: 'Web browser', playMode: ['SinglePlayer', 'MultiPlayer'], applicationCategory: 'Game', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL } },
          { '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
        ],
      }} />
      <JanggiGame />
      <JanggiGuide locale={locale} />
    </>
  );
}
