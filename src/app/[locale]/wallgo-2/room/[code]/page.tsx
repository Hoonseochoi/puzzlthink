import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isRoomCode } from '@/lib/room';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import WallGoRoom from '@/components/WallGoRoom';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WallGoOnline' });
  return { title: t('v2MetaTitle'), description: t('v2MetaDescription'), robots: { index: false, follow: false } };
}

export default async function WallGo2RoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <WallGoRoom code={code} variant={2} />;
}
