import { isHiddenInPlayApp } from '@/lib/playApp';
import WebOnlyNotice from './WebOnlyNotice';

/**
 * Wraps a page that is about one game (a show-game page, a devlog article). If that game is hidden in the Google Play
 * app (src/lib/playApp.ts), the app shows the neutral "available on the web" notice instead; the web is unchanged.
 */
export default function PlayAppGate({ game, locale, children }: { game: string | null | undefined; locale: string; children: React.ReactNode }) {
  if (!isHiddenInPlayApp(game)) return children;
  return (
    <>
      <div data-play-game={game!}>{children}</div>
      <div className="play-only"><WebOnlyNotice locale={locale} /></div>
    </>
  );
}
