import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SniperHoldemRoomView from '@/components/sniperHoldem/SniperHoldemRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: "Sniper Hold'em · ONLINE | PUZZLTHINK", robots: { index: false, follow: false } };

export default async function SniperHoldemRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <SniperHoldemRoomView code={code} />;
}
