import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isRoomCode } from '@/lib/room';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RJRoomView from '@/components/russianJanggi/RJRoomView';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianJanggiOnline' });
  return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } };
}

export default async function RussianJanggiRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <RJRoomView code={code} />;
}
