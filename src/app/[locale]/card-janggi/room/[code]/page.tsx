import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import CardJanggiRoomView from '@/components/cardJanggi/CardJanggiRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '카드 장기 · ONLINE | PUZZLTHINK', robots: { index: false, follow: false } };

export default async function CardJanggiRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <CardJanggiRoomView code={code} />;
}
