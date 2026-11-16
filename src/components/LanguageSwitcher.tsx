"use client";

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('Common');
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === 'ko' ? 'en' : 'ko';

  return (
    <button
      type="button"
      aria-label={t('language')}
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-extrabold uppercase shadow-sm transition hover:bg-white"
    >
      <Languages size={14} />
      {compact ? nextLocale : `${locale} · ${nextLocale}`}
    </button>
  );
}
