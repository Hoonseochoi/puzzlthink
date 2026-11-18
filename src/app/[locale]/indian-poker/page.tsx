import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import IndianPokerGame from '@/components/indianPoker/IndianPokerGame';
import { IndianPokerTutorialSteps } from '@/components/indianPoker/IndianPokerTutorial';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'IndianPoker' }); return pageMetadata({ locale, path: '/indian-poker', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] }); }
export default async function IndianPokerPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); const t = await getTranslations({ locale, namespace: 'IndianPoker' }); const g = await getTranslations({ locale, namespace: 'IndianPokerGuide' }); const faq = g.raw('faq') as { q: string; a: string }[]; return <><JsonLd data={{ '@context': 'https://schema.org', '@graph': [gameJsonLd({ locale, path: '/indian-poker', name: t('metaTitle'), alternateName: ['인디언 포커', 'Indian Poker'], description: t('metaDescription'), genre: ['Poker', 'Bluffing'], players: { min: 1, max: 2 }, show: 'genius1' }), faqJsonLd(faq), breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/indian-poker' }])] }} /><GameGate game="indianPoker" accent="#e6b94f" ink="#17120a" hero={<GameIntroHero locale={locale} id="indianPoker" />} tutorial={<IndianPokerTutorialSteps />} guide={<TextGuide locale={locale} namespace="IndianPokerGuide" />}><IndianPokerGame /></GameGate></>; }
