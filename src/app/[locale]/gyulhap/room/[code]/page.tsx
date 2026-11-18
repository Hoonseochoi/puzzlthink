import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GyulhapRoomView from '@/components/gyulhap/GyulhapRoomView';
import { isRoomCode } from '@/lib/room';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'GyulhapOnline' }); return { title: t('metaTitle'), description: t('metaDescription'), robots: { index: false, follow: false } }; }
export default async function Page({ params }: { params: Promise<{ locale: string; code: string }> }) { const { locale, code } = await params; if (!isRoomCode(code)) notFound(); setRequestLocale(locale); return <GyulhapRoomView code={code} />; }
