import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import HiddenWordRoomView from '@/components/hiddenWord/HiddenWordRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return {
    title: korean ? '히든 워드 친구 방 — PUZZLTHINK' : 'Hidden Word room — PUZZLTHINK',
    description: korean ? '링크만 누르면 바로 입장. 히든 워드를 친구와 1:1로! 가입 없이 무료.' : 'Open the link to join. Play Hidden Word 1:1 with a friend, free and without an account.',
    robots: { index: false, follow: false },
  };
}

export default async function HiddenWordRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <HiddenWordRoomView code={code} />;
}
