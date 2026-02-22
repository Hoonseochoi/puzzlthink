import EscapeLandingClient from '@/components/escape/EscapeLandingClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Escape' });
  return {
    title: t('title'),
    description: t('landingDescription'),
  };
}

export default async function EscapeListPage({ params }: Props) {
  await params;
  return <EscapeLandingClient />;
}
