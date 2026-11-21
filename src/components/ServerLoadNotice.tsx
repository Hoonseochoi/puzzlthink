"use client";

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

/** Friend and open rooms run on a small shared server: a heads-up that peak hours can be rough. */
export default function ServerLoadNotice({ dark = true, className = '' }: { dark?: boolean; className?: string }) {
  const t = useTranslations('Common');
  return (
    <p className={`flex items-start gap-1.5 break-keep rounded-md px-2.5 py-2 text-[11px] leading-[1.55] ${dark ? 'bg-[#ffcf3f]/10 text-[#ffdf7e]' : 'bg-[#b7791f]/10 text-[#8a5a12]'} ${className}`}>
      <Info size={13} className="mt-[1px] shrink-0" />{t('serverNotice')}
    </p>
  );
}
