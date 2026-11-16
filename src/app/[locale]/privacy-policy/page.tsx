import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const BASE_URL = 'https://www.puzzlthink.com';
type LegalSection = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  const canonical = `${BASE_URL}/${locale}/privacy-policy`;
  return { title: t('privacyTitle'), description: t('privacyDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/privacy-policy`, en: `${BASE_URL}/en/privacy-policy` } } };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Legal' });
  const sections = t.raw('privacySections') as LegalSection[];
  return <main className="min-h-screen bg-[#f3f0e8] px-5 py-16"><article className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-[#f9f7f1] p-7 shadow-sm sm:p-12"><span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">{t('legal')}</span><h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">{t('privacyTitle')}</h1><p className="mt-2 text-xs text-black/40">{t('lastUpdated')}</p><div className="mt-10 space-y-8">{sections.map((section) => <section key={section.title}><h2 className="text-lg font-extrabold">{section.title}</h2><p className="mt-2 text-sm leading-7 text-black/60">{section.body}</p></section>)}</div></article></main>;
}
