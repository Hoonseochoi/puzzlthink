import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';

type LegalSection = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  return pageMetadata({ locale, path: '/terms', title: t('termsTitle'), description: t('termsDescription') });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Legal' });
  const sections = t.raw('termsSections') as LegalSection[];
  return <main className="min-h-screen bg-[#f3f0e8] px-5 py-16"><article className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-[#f9f7f1] p-7 shadow-sm sm:p-12"><span className="text-[10px] font-black tracking-[0.2em] text-[#4b7bff]">{t('legal')}</span><h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">{t('termsTitle')}</h1><p className="mt-2 text-xs text-black/40">{t('lastUpdated')}</p><div className="mt-10 space-y-8">{sections.map((section) => <section key={section.title}><h2 className="text-lg font-extrabold">{section.title}</h2><p className="mt-2 text-sm leading-7 text-black/60">{section.body}</p></section>)}</div></article></main>;
}
