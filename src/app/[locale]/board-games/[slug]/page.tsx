// /[locale]/board-games/<slug>: one 보드게임 백과 article per entry in src/content/encyclopedia. Unknown slugs 404.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import WikiArticlePage from '@/components/encyclopedia/WikiArticlePage';
import { ARTICLES, articleBySlug, wikiLocale, wikiPath } from '@/content/encyclopedia';
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
  const { meta } = article[wikiLocale(locale)];
  return pageMetadata({ locale, path: wikiPath(slug), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function WikiArticleRoute({ params }: Params) {
  const { locale, slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  setRequestLocale(locale);
  return <WikiArticlePage article={article} locale={locale} />;
}
