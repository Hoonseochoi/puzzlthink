import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import GyulhapGame from '@/components/gyulhap/GyulhapGame';
import { GyulhapTutorialSteps } from '@/components/gyulhap/GyulhapTutorial';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Gyulhap' });
  return pageMetadata({ locale, path: '/gyulhap', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function GyulhapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Gyulhap' });
  const g = await getTranslations({ locale, namespace: 'GyulhapGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <><JsonLd data={{ '@context': 'https://schema.org', '@graph': [gameJsonLd({ locale, path: '/gyulhap', name: t('metaTitle'), alternateName: ['결합', '결! 합!', 'Gyul Hap'], description: t('metaDescription'), genre: ['Pattern recognition', 'Strategy'], players: { min: 1, max: 4 }, show: 'genius1' }), faqJsonLd(faq), breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/gyulhap' }])] }} /><GameGate game="gyulhap" accent="#ffcf3f" ink="#17120a" hero={<GameIntroHero locale={locale} id="gyulhap" />} tutorial={<GyulhapTutorialSteps />} guide={<TextGuide locale={locale} namespace="GyulhapGuide" />}><GyulhapGame /></GameGate></>;
}
