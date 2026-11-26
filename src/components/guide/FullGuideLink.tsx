import { getTranslations } from 'next-intl/server';
import { BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';

/** "자세한 공략 보기": from a game's short inline guide to its dedicated guide page. Colors follow --accent. */
export default async function FullGuideLink({ locale, path }: { locale: string; path: string }) {
  const t = await getTranslations({ locale, namespace: 'Common' });
  return (
    <Link href={path} className="mt-6 inline-flex items-center gap-2 rounded-full border border-(--accent)/50 bg-(--accent)/15 px-4 py-2 text-sm font-black text-(--accent) transition hover:bg-(--accent)/25">
      <BookOpen size={15} />{t('fullGuide')} →
    </Link>
  );
}
