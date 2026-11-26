// /[locale]/survival-games/<show>/<game>: the rules and analysis of one game from a show.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ShowGamePage from '@/components/shows/ShowGamePage';
import { SHOWS_WRITTEN, gameBySlugs, gamePath, showLocale } from '@/content/shows';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; show: string; game: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWS_WRITTEN.flatMap((show) => show.games.map((game) => ({ show: show.slug, game: game.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, show: showSlug, game: gameSlug } = await params;
  const found = gameBySlugs(showSlug, gameSlug);
  if (!found) return {};
  const { meta } = found.game[showLocale(locale)];
  return pageMetadata({ locale, path: gamePath(found.show, found.game), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function ShowGameRoute({ params }: Params) {
  const { locale, show: showSlug, game: gameSlug } = await params;
  const found = gameBySlugs(showSlug, gameSlug);
  if (!found) notFound();
  setRequestLocale(locale);
  return <ShowGamePage show={found.show} game={found.game} locale={locale} />;
}
