import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import PiggyBankRoomView from '@/components/piggyBank/PiggyBankRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '돼지 저금통 친구 대전', robots: { index: false, follow: false } };

export default async function PiggyBankRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <PiggyBankRoomView code={code} />;
}
