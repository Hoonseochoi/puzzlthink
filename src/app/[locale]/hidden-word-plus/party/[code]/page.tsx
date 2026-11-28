import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import HiddenWordPartyView from '@/components/hiddenWord/HiddenWordPartyView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return {
    title: korean ? '히든 워드 확장판 파티방 — PUZZLTHINK' : 'Hidden Word: Expansion party room — PUZZLTHINK',
    description: korean ? '링크만 누르면 바로 입장. 히든 워드 확장판을 2~6명이 방송 메인매치 방식으로!' : 'Open the link to join. Hidden Word: Expansion for 2–6 players, played like the show\'s main match.',
    robots: { index: false, follow: false },
  };
}

export default async function HiddenWordPartyPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <HiddenWordPartyView code={code} />;
}
