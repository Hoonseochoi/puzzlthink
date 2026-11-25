import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import EquationTowerRoomView from '@/components/equationTower/EquationTowerRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return {
    title: korean ? '수식의 탑 친구 방 — PUZZLTHINK' : 'Tower of Equations room — PUZZLTHINK',
    description: korean ? '링크만 누르면 바로 입장. 수식의 탑을 친구 2~4명과 함께! 가입 없이 무료.' : 'Open the link to join. Play Tower of Equations with 2–4 friends, free and without an account.',
    robots: { index: false, follow: false },
  };
}

export default async function EquationTowerRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <EquationTowerRoomView code={code} />;
}
