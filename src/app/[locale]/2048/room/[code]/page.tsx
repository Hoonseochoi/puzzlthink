import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Merge2048RoomView from '@/components/merge2048/Merge2048RoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Merge2048Online' });
  return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } };
}

export default async function Merge2048RoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <Merge2048RoomView code={code} />;
}
