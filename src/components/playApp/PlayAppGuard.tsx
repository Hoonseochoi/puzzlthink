"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { isBlockedInPlayApp, isPlayApp } from '@/lib/playApp';
import WebOnlyNotice from './WebOnlyNotice';

/**
 * Backstop for client-side navigation inside the Google Play app: the proxy already serves /web-only for blocked
 * pages on a full load, but a client-side route change might not pass through it. Renders nothing on the web.
 */
export default function PlayAppGuard() {
  const pathname = usePathname();
  const locale = useLocale();
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the app-mode flag the head script set
    setBlocked(isPlayApp() && isBlockedInPlayApp(pathname, GAMES));
  }, [pathname]);
  return blocked ? <WebOnlyNotice locale={locale} fixed /> : null;
}
