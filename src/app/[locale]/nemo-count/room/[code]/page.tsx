import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import NemoRoomView from '@/components/nemoCount/NemoRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NemoOnline' });
  return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } };
}

export default async function NemoRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <NemoRoomView code={code} />;
}
