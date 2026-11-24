import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Skull, Swords } from 'lucide-react';
import CertShare from '@/components/CertShare';
import { Link } from '@/i18n/routing';
import { CERT_GAMES, certImagePath, clearLabel, fetchCert, formatClearDate } from '@/lib/hardClear';
import { HELL_GAMES, hellHref, hellLabel } from '@/lib/hell';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, id } = await params;
  const cert = await fetchCert(id);
  const t = await getTranslations({ locale, namespace: cert?.tier === 'hell' ? 'Hell' : 'Cert' });
  if (!cert) return { title: t('notFound'), robots: { index: false, follow: false } };
  const label = cert.tier === 'hell' ? hellLabel(cert.game, locale) : clearLabel(cert.game, locale);
  const hell = cert.tier === 'hell';
  const title = t(hell ? 'certMetaTitle' : 'metaTitle', { name: cert.nickname, n: cert.clear_no, label });
  const base = pageMetadata({ locale, path: `/cert/${id}`, title, description: t(hell ? 'certMetaDescription' : 'metaDescription', { label }), noIndex: true });
  const image = { url: certImagePath(id, locale), width: 1200, height: 630, alt: title };
  return { ...base, openGraph: { ...base.openGraph, images: [image] }, twitter: { ...base.twitter, images: [image.url] } };
}

/** Public certificate page: what a shared link opens. 매우 어려움 certificates get the dark neon hell look. */
export default async function CertPage({ params }: Params) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const cert = await fetchCert(id);
  if (!cert || !CERT_GAMES[cert.game]) notFound();
  const game = CERT_GAMES[cert.game];

  if (cert.tier === 'hell') {
    const t = await getTranslations({ locale, namespace: 'Hell' });
    const label = hellLabel(cert.game, locale);
    const hellGame = HELL_GAMES.find((g) => g.stat === cert.game);
    return (
      <main className="hell-surface min-h-[80vh] px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-[11px] font-black tracking-[0.3em] text-[#ff3355]">{t('certEyebrow')}</p>
          <h1 className="mt-2 text-center text-2xl font-black tracking-tight sm:text-3xl"><span className="hell-neon !text-white">{t('pageTitle', { name: cert.nickname, n: cert.clear_no, label })}</span></h1>
          <p className="mt-2 text-center text-sm text-white/55">{t('pageSub', { date: formatClearDate(cert.cleared_at), total: cert.total })}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated PNG, already sized */}
          <img src={certImagePath(id, locale)} alt={t('imageAlt', { label, n: cert.clear_no })} width={1200} height={630} className="mt-6 w-full rounded-[16px] shadow-[0_0_60px_rgba(255,36,72,.35)] ring-1 ring-[#ff3355]/40" />
          <div className="mx-auto mt-6 max-w-sm space-y-3">
            {hellGame?.hell.live
              ? <a href={`/${locale}${hellHref(hellGame)}`} className="hell-btn flex items-center justify-center gap-2 rounded-[12px] py-3.5 text-sm font-black text-white"><Swords size={16} />{t('certChallenge')}</a>
              : <Link href="/hell" className="hell-btn flex items-center justify-center gap-2 rounded-[12px] py-3.5 text-sm font-black text-white"><Skull size={16} />{t('bannerCta')}</Link>}
            <CertShare id={id} text={t('shareText', { n: cert.clear_no, label })} />
          </div>
          <p className="mt-8 text-center text-[11px] leading-5 text-white/35">{t('certNote')}</p>
        </div>
      </main>
    );
  }

  const t = await getTranslations({ locale, namespace: 'Cert' });
  const label = clearLabel(cert.game, locale);
  return (
    <main className="min-h-[80vh] bg-[#0b0c10] px-4 py-10 text-white sm:py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-[11px] font-black tracking-[0.3em] text-[#d9b25f]">{t('eyebrow')}</p>
        <h1 className="mt-2 text-center text-2xl font-black tracking-tight sm:text-3xl">{t('pageTitle', { name: cert.nickname, n: cert.clear_no, label })}</h1>
        <p className="mt-2 text-center text-sm text-white/55">{t('pageSub', { date: formatClearDate(cert.cleared_at), total: cert.total })}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated PNG, already sized */}
        <img src={certImagePath(id, locale)} alt={t('imageAlt', { label, n: cert.clear_no })} width={1200} height={630} className="mt-6 w-full rounded-[16px] shadow-[0_30px_80px_rgba(0,0,0,.6)]" />
        <div className="mx-auto mt-6 max-w-sm space-y-3">
          <Link href={game.href} className="flex items-center justify-center gap-2 rounded-[12px] border border-[#d9b25f]/50 bg-[#d9b25f]/10 py-3.5 text-sm font-black text-[#ffe3a1] hover:bg-[#d9b25f]/20"><Swords size={16} />{t('challenge', { label })}</Link>
          <CertShare id={id} text={t('shareText', { n: cert.clear_no, label })} />
        </div>
        <p className="mt-8 text-center text-[11px] leading-5 text-white/35">{t('note')}</p>
      </div>
    </main>
  );
}
