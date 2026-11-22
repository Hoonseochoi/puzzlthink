import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LogicRoomView from '@/components/logic/LogicRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LogicOnline' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  return { title: t('metaTitle', { game: tc('binairo') }), description: t('metaDescription', { game: tc('binairo') }), robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  if (!isRoomCode(code)) notFound();
  setRequestLocale(locale);
  return <LogicRoomView game="binairo" code={code} />;
}
