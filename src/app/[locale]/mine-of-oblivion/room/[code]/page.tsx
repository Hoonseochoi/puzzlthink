import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import MineOblivionRoomView from '@/components/mineOblivion/MineOblivionRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '망각의 지뢰 · ONLINE | PUZZLTHINK', robots: { index: false, follow: false } };

export default async function MineOblivionRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <MineOblivionRoomView code={code} />;
}
