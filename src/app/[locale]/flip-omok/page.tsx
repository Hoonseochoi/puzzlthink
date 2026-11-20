import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FlipOmokGame from '@/components/flipOmok/FlipOmokGame';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FlipOmok' });
  return pageMetadata({ locale, path: '/flip-omok', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[], noIndex: true });
}

export default async function FlipOmokPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FlipOmokGame />;
}
