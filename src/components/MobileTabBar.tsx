"use client";

import { useTranslations } from 'next-intl';
import { Gamepad2, Home, MessageCircle, Sparkles, Trophy } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { isGamePath, openLounge, useLoungeUnread, useOnlineCount } from '@/lib/siteBus';

/**
 * Phones only: the bottom tab bar on every page outside a game — 홈, 게임, 라운지 (the raised middle button: it
 * opens the lounge drawer and shows how many are online), 기록실, 아이콘. Inside a game the bar is gone (boards
 * and their buttons reach the bottom edge) and the lounge is a handle on the right edge instead (LoungeChat).
 */
export default function MobileTabBar() {
  const t = useTranslations('TabBar');
  const pathname = usePathname();
  const online = useOnlineCount();
  const unread = useLoungeUnread();
  if (isGamePath(pathname)) return null;

  const tab = (href: '/' | '/games' | '/records' | '/icons', label: string, icon: React.ReactNode) => {
    const on = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link href={href} aria-current={on ? 'page' : undefined} className={`relative flex flex-col items-center gap-0.5 pt-2 text-[10px] font-black transition active:scale-95 ${on ? 'text-[#17201e]' : 'text-black/35'}`}>
        {on && <i className="absolute top-0 h-[3px] w-6 rounded-full bg-[#17201e]" />}
        {icon}{label}
      </Link>
    );
  };

  return (
    <>
      {/* keeps the page's last lines clear of the bar */}
      <div className="h-[calc(62px+env(safe-area-inset-bottom))] bg-[#f3f0e8] sm:hidden" aria-hidden="true" />
      <nav aria-label={t('label')} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end border-t border-black/10 bg-[#fbfaf5]/95 px-1 pb-[max(env(safe-area-inset-bottom),6px)] backdrop-blur sm:hidden">
        {tab('/', t('home'), <Home size={20} />)}
        {tab('/games', t('games'), <Gamepad2 size={20} />)}
        <button type="button" onClick={openLounge} aria-label={t('lounge')} className="relative flex flex-col items-center gap-0.5 text-[10px] font-black text-[#17201e] active:scale-95">
          <span className="relative -mt-5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#17201e] text-[#ffd36e] shadow-[0_8px_20px_rgba(23,32,30,.35)] ring-4 ring-[#fbfaf5]">
            <MessageCircle size={22} />
            {unread > 0 && <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#ff3b4f] px-1 text-center font-mono text-[10px] font-black leading-[17px] text-white ring-2 ring-[#fbfaf5]">{unread > 99 ? '99+' : unread}</span>}
          </span>
          <span className="flex items-center gap-1">
            {online != null ? <><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c47c] opacity-70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34c47c]" /></span>{t('online', { n: online.toLocaleString() })}</> : t('lounge')}
          </span>
        </button>
        {tab('/records', t('records'), <Trophy size={20} />)}
        {tab('/icons', t('icons'), <Sparkles size={20} />)}
      </nav>
    </>
  );
}
