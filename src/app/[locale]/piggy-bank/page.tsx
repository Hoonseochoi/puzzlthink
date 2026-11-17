import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PiggyBankGame from '@/components/piggyBank/PiggyBankGame';

// Draft page: not in the sitemap, the menus or search results yet.
export const metadata: Metadata = { title: '돼지 저금통 (초안)', robots: { index: false, follow: false } };

export default async function PiggyBankPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PiggyBankGame />;
}
