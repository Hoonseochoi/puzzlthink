import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import CldRoomView from '@/components/colorLinkDuel/CldRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return {
    title: korean ? '컬러 링크 1:1 방' : 'Color Link Duel 1:1 room',
    description: korean ? '친구와 컬러 링크 1:1 대결' : 'A 1:1 game of Color Link Duel with a friend',
    robots: { index: false, follow: false },
  };
}

export default async function ColorLinkDuelRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <CldRoomView code={code} />;
}
