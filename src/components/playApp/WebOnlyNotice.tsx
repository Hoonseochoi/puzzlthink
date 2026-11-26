import { Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';

const COPY = {
  ko: { title: '이 게임은 웹에서 이용할 수 있어요', body: '앱에서는 이 게임을 제공하지 않아요. 다른 게임을 즐겨 보세요.', home: '다른 게임 보러 가기' },
  en: { title: 'This game is available on the web', body: 'This game is not offered in the app. Try one of the other games.', home: 'See other games' },
} as const;

/**
 * Neutral screen shown inside the Google Play app in place of a game the app does not offer (see src/lib/playApp.ts).
 * No play button and no link to the game. `fixed` covers the page (used by the client-side guard).
 */
export default function WebOnlyNotice({ locale, fixed = false, className = '' }: { locale: string; fixed?: boolean; className?: string }) {
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return (
    <section data-ptk-web-only="" className={`${fixed ? 'fixed inset-0 z-[2147483000] overflow-auto bg-[#f3f0e8]' : ''} flex min-h-[70vh] items-center justify-center px-6 py-16 ${className}`}>
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#17201e] text-white"><Globe size={26} /></span>
        <h1 className="mt-5 text-xl font-black tracking-[-0.02em] text-[#17201e] break-keep">{c.title}</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-black/55 break-keep">{c.body}</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#17201e] px-5 py-2.5 text-sm font-black text-white">{c.home}</Link>
      </div>
    </section>
  );
}
