// /[locale]/devlog/<slug>: one 개발 노트 article from src/content/devlog. Unknown slugs 404.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import DevlogPage from '@/components/devlog/DevlogPage';
import { DEVLOG, devlogBySlug, devlogLocale, devlogPath } from '@/content/devlog';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DEVLOG.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = devlogBySlug(slug);
  if (!article) return {};
  const { meta } = article[devlogLocale(locale)];
  return pageMetadata({ locale, path: devlogPath(slug), title: meta.title, description: meta.description, keywords: meta.keywords });
}

export default async function DevlogArticleRoute({ params }: Params) {
  const { locale, slug } = await params;
  const article = devlogBySlug(slug);
  if (!article) notFound();
  setRequestLocale(locale);
  return <DevlogPage article={article} locale={locale} />;
}
