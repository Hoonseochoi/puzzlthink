import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import PiggyBankRoomView from '@/components/piggyBank/PiggyBankRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '돼지 저금통 한판 할래? 🐷 초대장이 왔어요', description: '링크만 누르면 바로 입장. 넣은 동전을 기억하고 틀린 대답엔 의심! 최대 4명, 빈자리는 AI가 채워요. 가입 없이 무료.', robots: { index: false, follow: false } };

export default async function PiggyBankRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <PiggyBankRoomView code={code} />;
}
