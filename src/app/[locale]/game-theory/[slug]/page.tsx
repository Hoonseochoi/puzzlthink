// /[locale]/game-theory/<slug>: one article of the 게임 이론 section (registry: src/content/game-theory).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import GTArticlePage from '@/components/game-theory/GTArticlePage';
import { ARTICLES, articleBySlug, articlePath, gtLocale } from '@/content/game-theory';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  const { meta } = article[gtLocale(locale)];
  return pageMetadata({ locale, path: articlePath(slug), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function GameTheoryArticleRoute({ params }: Params) {
  const { locale, slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  setRequestLocale(locale);
  return <GTArticlePage article={article} locale={locale} />;
}
