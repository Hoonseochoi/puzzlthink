"use client";

import { useLocale, useTranslations } from 'next-intl';
import { certImagePath, certPath } from '@/lib/hardClear';
import ShareButtons from './ShareButtons';

/** Share / save-image / copy-link buttons for one certificate. */
export default function CertShare({ id, text, dark = true }: { id: string; text: string; dark?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('Cert');
  return <ShareButtons label={t('share')} path={certPath(locale, id)} text={text} imagePath={certImagePath(id, locale)} fileName={`puzzlthink-clear-${id}.png`} dark={dark} />;
}
