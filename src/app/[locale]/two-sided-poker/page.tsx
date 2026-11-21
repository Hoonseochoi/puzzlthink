import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import TwoSidedPokerGate from '@/components/twoSidedPoker/TwoSidedPokerGate';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/two-sided-poker',
    title: korean ? '양면포커 — 더 지니어스 데스매치, AI와 칩 40개 심리전' : 'Two-Sided Poker — The Genius death match vs AI',
    description: korean
      ? '더 지니어스 양면포커 규칙 그대로. 공개된 앞면과 나만 아는 뒷면 중 어느 면에 칩을 걸지, 언제 양면베팅(+10)으로 승부할지 정하세요. 200장 카드 카운팅까지.'
      : 'The Genius two-sided poker rules: bet your public front or secret back, or both for +10. 40 chips each, 200-card shoe, card counting.',
    keywords: korean ? ['양면포커', '더 지니어스 양면포커', '양면베팅', '더 지니어스 데스매치', '포커 심리전', 'AI 포커'] : ['two-sided poker', 'The Genius', 'death match game', 'bluffing game', 'AI poker'],
  });
}

export default async function TwoSidedPokerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TwoSidedPokerGate locale={locale} />;
}
