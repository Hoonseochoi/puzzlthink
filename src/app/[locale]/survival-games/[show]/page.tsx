// /[locale]/survival-games/<show>: one brain-survival show or season. Slugs come from src/content/shows.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ShowPage from '@/components/shows/ShowPage';
import { SHOWS_WRITTEN, showBySlug, showLocale, showPath } from '@/content/shows';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; show: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWS_WRITTEN.map((show) => ({ show: show.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, show: slug } = await params;
  const show = showBySlug(slug);
  if (!show) return {};
  const { meta } = show[showLocale(locale)];
  return pageMetadata({ locale, path: showPath(show), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function ShowRoute({ params }: Params) {
  const { locale, show: slug } = await params;
  const show = showBySlug(slug);
  if (!show) notFound();
  setRequestLocale(locale);
  return <ShowPage show={show} locale={locale} />;
}
