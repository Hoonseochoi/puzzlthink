import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import TimeAuctionRoomView from '@/components/timeAuction/TimeAuctionRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '시간 경매 · ONLINE | PUZZLTHINK', robots: { index: false, follow: false } };

export default async function TimeAuctionRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <TimeAuctionRoomView code={code} />;
}
