import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import LogicGuidePage from '@/components/logic/LogicGuidePage';
import { GUIDE_COPY } from '@/lib/logicGuide';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = GUIDE_COPY.onestroke[locale === 'en' ? 'en' : 'ko'];
  return pageMetadata({ locale, path: '/one-stroke/guide', title: c.metaTitle, description: c.metaDescription, keywords: c.keywords });
}

export default async function OneStrokeGuideRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LogicGuidePage game="onestroke" locale={locale} />;
}
