import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RJRoomView from '@/components/russianJanggi/RJRoomView';

const ROOM_CODE = /^[a-z0-9]{6}$/;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianJanggiOnline' });
  return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } };
}

export default async function RussianJanggiRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!ROOM_CODE.test(code)) notFound();
  setRequestLocale(locale);
  return <RJRoomView code={code} />;
}
