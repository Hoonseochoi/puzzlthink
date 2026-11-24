import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import HitStayRoomView from '@/components/hitStay/HitStayRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: 'Hit,Stay · ONLINE | PUZZLTHINK', robots: { index: false, follow: false } };

export default async function HitStayRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <HitStayRoomView code={code} />;
}
