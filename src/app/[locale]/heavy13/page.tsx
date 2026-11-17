import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { Heavy13TutorialSteps } from '@/components/heavy13/Heavy13Tutorial';
import { SAND, SAND_INK } from '@/components/heavy13/theme';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import Heavy13Game from '@/components/heavy13/Heavy13Game';
import Heavy13Guide from '@/components/heavy13/Heavy13Guide';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Heavy13' });
  return pageMetadata({ locale, path: '/heavy13', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
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
      gameJsonLd({ locale, path: '/heavy13', name: t('metaTitle'), alternateName: ['무거운 13', '무거운13', 'Heavy 13'], description: t('metaDescription'), genre: ['Strategy', 'Party game'], players: { min: 1, max: 7 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/heavy13' }]),
    ] }} />
      <GameGate game="heavy13" accent={SAND} ink={SAND_INK} tutorialKey="puzzlthink_heavy13_tutorial_seen" hero={<GameIntroHero locale={locale} id="heavy13" />} tutorial={<Heavy13TutorialSteps />} guide={<Heavy13Guide locale={locale} />}>
        <Heavy13Game />
      </GameGate>
    </>
  );
}
