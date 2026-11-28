import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LiarRoomView from '@/components/hiddenWordLiar/LiarRoomView';
import { isLiarCode } from '@/lib/hiddenWordLiar';

// Room pages only: the on-screen keyboard resizes the page (Android Chrome / the Play app) instead of pushing it up,
// so the chat mode can fit the visible part exactly. Other pages keep the default.
export const viewport: Viewport = { themeColor: '#08060e', interactiveWidget: 'resizes-content' };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const korean = (await params).locale !== 'en';
  return {
    title: korean ? '라이어 게임 초대 · 히든 워드: 라이어 | PUZZLTHINK' : 'Liar game invite · Hidden Word: Liar | PUZZLTHINK',
    description: korean ? '친구가 라이어 게임에 초대했어요! 4~10명이 한 마디씩, 단 한 명의 라이어를 찾아보세요.' : 'You are invited to a liar game! 4–10 players, one liar.',
    robots: { index: false, follow: false },
  };
}

export default async function HiddenWordLiarRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isLiarCode(code)) notFound();
  setRequestLocale(locale);
  return <LiarRoomView code={code} />;
}
