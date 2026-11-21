import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import TwoSidedPokerRoomView from '@/components/twoSidedPoker/TwoSidedPokerRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ko = locale !== 'en';
  return {
    title: ko ? '양면포커 친구 대전 | PUZZLTHINK' : 'Two-Sided Poker with a friend | PUZZLTHINK',
    description: ko ? '초대 코드로 친구와 양면포커 1:1 심리전을 시작하세요.' : 'Start a 1:1 two-sided poker match with a friend by invite code.',
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <TwoSidedPokerRoomView code={code} />;
}
