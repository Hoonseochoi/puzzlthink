import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import TwoSidedPokerGate from '@/components/twoSidedPoker/TwoSidedPokerGate';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/two-sided-poker',
    title: korean ? '양면포커 - 앞면과 뒷면으로 싸우는 1:1 심리전' : 'Two-Sided Poker - a 1:1 bluffing game of two faces',
    description: korean
      ? '카드 한 장, 숫자 두 개. 공개된 앞면과 나만 아는 뒷면 중 승부할 면을 고르고 AI의 숨은 숫자를 추론하는 1:1 포커 심리전.'
      : 'One card, two numbers. Pick your public front or secret back, read the AI’s hidden number, and bet.',
    keywords: korean ? ['양면포커', '포커 게임', '블러핑 게임', '심리전 게임', '추론 게임', 'AI 포커'] : ['two-sided poker', 'bluffing game', 'poker mind game', 'deduction game', 'AI poker'],
  });
}

export default async function TwoSidedPokerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TwoSidedPokerGate locale={locale} />;
}
