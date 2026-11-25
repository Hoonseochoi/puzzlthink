import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HomeAppPreview from '@/components/HomeAppPreview';

// A design draft of the app-style home (not linked from anywhere, not indexed).
export const metadata: Metadata = { title: 'PUZZLTHINK — 홈 시안', robots: { index: false, follow: false } };

export default async function HomePreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeAppPreview />;
}
