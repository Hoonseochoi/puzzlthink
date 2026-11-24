import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import HellPageClient from '@/components/hell/HellPageClient';
import { HELL_LIVE } from '@/lib/hell';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Hell' });
  return pageMetadata({
    locale, path: '/hell', title: t('metaTitle'), description: t('metaDescription'), noIndex: !HELL_LIVE.length,
    keywords: locale === 'en' ? ['very hard AI', 'hell mode', 'Wallgo AI', 'Janggi AI', 'Blind Gomoku AI'] : ['AI 헬모드', '매우 어려움 AI', '벽바둑 AI', '십이장기 AI', '러시아장기 AI', '블라인드 오목 AI', '블랙피스'],
  });
}

/** AI 헬모드: the games with a 매우 어려움 AI, the black-piece race and my record. */
export default async function HellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HellPageClient />;
}
