import { getTranslations } from 'next-intl/server';
import HomeClient from '@/components/HomeClient';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing' });

  return {
    title: t('subtitle'),
    description: t('description'),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PUZZL THINK',
    url: 'https://puzzlthink.com',
    logo: 'https://puzzlthink.com/logo.png',
    sameAs: [
      'https://twitter.com/puzzlthink',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
