// Shared route for every dedicated game guide: /[locale]/<game>/guide, one page per registered guide in
// src/content/guides. A static `<game>/guide` folder (the 8 logic-puzzle guides) takes precedence over this
// dynamic segment, and slugs without a written guide 404 (dynamicParams = false).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import GuidePage from '@/components/guide/GuidePage';
import { GUIDES, gameHref, guideBySlug, guideLocale, guidePath } from '@/content/guides';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; game: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ game: gameHref(guide.game).slice(1) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, game } = await params;
  const guide = guideBySlug(game);
  if (!guide) return {};
  const { meta } = guide[guideLocale(locale)];
  return pageMetadata({ locale, path: guidePath(guide.game), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function GameGuideRoute({ params }: Params) {
  const { locale, game } = await params;
  const guide = guideBySlug(game);
  if (!guide) notFound();
  setRequestLocale(locale);
  return <GuidePage guide={guide} locale={locale} />;
}
