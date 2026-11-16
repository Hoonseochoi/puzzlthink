import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isRoomCode } from '@/lib/room';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RussianRouletteRoomView from '@/components/russianRoulette/RussianRouletteRoomView';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianRouletteOnline' });
  return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } };
}

export default async function RussianRouletteRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <RussianRouletteRoomView code={code} />;
}
