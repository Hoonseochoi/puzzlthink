import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import WebOnlyNotice from '@/components/playApp/WebOnlyNotice';

// Served by the proxy, inside the Google Play app only, in place of a game the app does not offer (src/lib/playApp.ts).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function WebOnlyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <main data-ptk-rewritten=""><WebOnlyNotice locale={locale} /></main>;
}
