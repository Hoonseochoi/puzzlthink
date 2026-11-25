import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import GradationRoomView from '@/components/gradation/GradationRoomView';
import { isRoomCode } from '@/lib/room';

export const metadata: Metadata = { title: '그라데이션 · ONLINE | PUZZLTHINK', robots: { index: false, follow: false } };

export default async function GradationRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <GradationRoomView code={code} />;
}
