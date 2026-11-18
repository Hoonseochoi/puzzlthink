import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import NemoGame from '@/components/nemoCount/NemoGame';
import { duelImagePath, duelTime, fetchDuel } from '@/lib/nemoDuel';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, id } = await params;
  const duel = await fetchDuel(id);
  const t = await getTranslations({ locale, namespace: 'NemoCount' });
  if (!duel) return { title: t('duelNotFound'), robots: { index: false, follow: false } };
  const run = duel.creator_run ?? { correct: 0, ms: 0 };
  const title = t('duelMetaTitle', { name: duel.creator, correct: run.correct, n: duel.count, time: duelTime(run.ms) });
  const base = pageMetadata({ locale, path: `/nemo-count/duel/${id}`, title, description: t('duelMetaDesc', { level: t(`level_${duel.difficulty}`), n: duel.count, total: duel.total }), noIndex: true });
  const image = { url: duelImagePath(id, locale), width: 1200, height: 630, alt: title };
  return { ...base, openGraph: { ...base.openGraph, images: [image] }, twitter: { ...base.twitter, images: [image.url] } };
}

/** A 네모 세기 도전장 link: the sender's boards, ready to play. */
export default async function NemoDuelPage({ params }: Params) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const duel = await fetchDuel(id);
  if (!duel) notFound();
  return <NemoGame duel={duel} />;
}
