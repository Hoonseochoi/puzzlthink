/**
 * "App mode": the site running inside the Google Play app (a Trusted Web Activity, package below).
 * The website itself never changes. Everything the Play app hides is decided in THIS file, one switch per item:
 *  - PLAY_APP_HIDDEN_GAMES — catalog ids of games the app does not offer (empty: every game is in the app). Add one
 *    id to hide a game everywhere in the app; its pages then show the neutral "웹에서 이용할 수 있어요" screen.
 *  - PLAY_APP_HIDE — whole kinds of things: ads, the 히든로그 banner, support links, the install prompt, the
 *    long-form article sections.
 *
 * How it works, without a flash of web-only content and without making any page dynamic:
 *  1. Detection: the app's start URL carries `?app=play`, and Chrome gives the first page of every app launch (deep
 *     links included) the referrer `android-app://com.puzzlthink.app`. Either one turns app mode on.
 *  2. The proxy (src/proxy.ts) sees the same signals on the request, sets the session cookie `ptk_app=play`, and
 *     rewrites requests for blocked pages (a hidden game's pages, the article sections) to the neutral /web-only
 *     page, so they never even render. The rewrite is never cached (no-store), so web visitors are unaffected.
 *  3. playAppHeadScript() runs first thing in <head>, before anything paints: it remembers app mode in
 *     sessionStorage (per tab, so it never leaks into a normal Chrome tab even though the app shares Chrome's
 *     cookies), keeps the cookie in step, and sets <html data-app="play">. It also adds the AdSense script, but
 *     only outside app mode.
 *  4. playAppCss() hides everything marked for app mode once that attribute is set. Markers:
 *       data-play-game="<game id>"      a card / row / item for one game (catalog id 'hitStay' or stats id 'hit_stay')
 *       data-play-hide="<kind>"         one of the PLAY_APP_HIDE keys
 *       any <a> pointing at a blocked page or at the support site (no marker needed)
 *       .play-only                      shown only in app mode (e.g. the neutral notice inside a gated page)
 *  5. isPlayApp() / usePlayApp() are the switch for client code that must not run in the app (ad impressions, …).
 */

/** The Play app's package id (permanent once uploaded to Google Play). */
export const PLAY_APP_PACKAGE = 'com.puzzlthink.app';

/**
 * SHA-256 certificate fingerprints served in /.well-known/assetlinks.json (src/app/.well-known/assetlinks.json).
 * Without the right one Android shows the app with a browser address bar.
 *  - upload: the upload key in ~/.config/puzzlthink/play/upload-keystore.jks (signs the .aab you upload, and the
 *    local test .apk).
 *  - playAppSigning: PLACEHOLDER — after the first upload, copy "SHA-256 certificate fingerprint" from Play Console →
 *    the app → Test and release → App integrity → App signing (App signing key certificate), paste it here, deploy.
 *    The Play Store installs copies signed with THAT key. Empty = left out of the file.
 */
export const PLAY_APP_FINGERPRINTS = {
  upload: 'FC:DA:A4:31:09:BD:76:2C:FC:38:81:9F:1A:13:F3:B0:57:1C:F7:FD:78:A3:32:60:1B:FF:97:F3:8A:6C:6E:09',
  playAppSigning: '43:33:23:43:6A:89:50:BE:55:C5:06:D4:5D:6E:0E:71:6E:6D:E2:C8:BE:8F:4F:B3:40:20:36:1D:AE:50:14:C4', // Play App Signing key (Play Console → App signing, 2026-11-27)
} as const;

/**
 * The closed test's opt-in link (Play Console → Test and release → Closed testing → Testers → "Join on the web" /
 * "Copy link", https://play.google.com/apps/testing/com.puzzlthink.app). Empty: members who signed up as testers
 * (src/components/AppTesterInvite.tsx) are told the install link will appear once the test opens. Set: they get an
 * "앱 받기" button to it, "테스트 앱 설치" takes 자율 후원's place in the header, and an install popup opens on every
 * visit until "이미 설치했어요" (Android; elsewhere one "Android only" line). Testers are invited by email; list them
 * with scripts/play/testers.sh.
 */
export const PLAY_TESTER_OPT_IN_URL = 'https://play.google.com/apps/testing/com.puzzlthink.app';

/**
 * Whether new members can still sign up as testers. false (2026-11-28, the owner closed it at 237 testers): the recruit
 * popup, cards and strip are gone for everyone who has not joined, and app_tester_join refuses new sign-ups
 * (supabase/migrations/20271202200000_app_testers_closed.sql). Members who already joined keep everything: the install
 * button and popup, their records row and the withdraw control.
 */
export const PLAY_TESTER_RECRUIT_OPEN: boolean = false;

/** Query parameter on the app's start URL: /?app=play */
export const PLAY_APP_PARAM = 'app';
export const PLAY_APP_VALUE = 'play';
export const PLAY_APP_COOKIE = 'ptk_app';
const STORAGE_KEY = 'puzzlthink:play-app';

/**
 * Games hidden inside the Play app (catalog ids from src/lib/gameCatalog.ts). Empty: the owner decided to ship every
 * game, betting games included. If the content rating needs it, the betting / poker-type games are, one line each:
 *   'indianPoker', 'twoSidedPoker', 'hitStay', 'sniperHoldem'   (and 'russianRoulette' shows a gun)
 * Ids that are not in the catalog are fine: they simply match nothing.
 */
export const PLAY_APP_HIDDEN_GAMES: readonly string[] = [];

/** Kinds of things hidden inside the Play app. Set one to false to show it in the app again. */
export const PLAY_APP_HIDE = {
  /** AdSense: the script is never loaded and no ad slot (or its space) is shown. */
  ads: true,
  /** The directly sold 히든로그 banner and result card (and their impression/click counting). */
  hiddenlog: true,
  /**
   * The external support/donation page (CTEE) and everything pointing at it, including the fallback support banner
   * and card: support grants an in-app perk (후원자 커버), so Play's payments policy would require Play Billing.
   */
  support: true,
  /** The "앱 설치" (add to home screen) prompts: the user already has the app. */
  install: true,
  /**
   * The long-form article sections: 게임 공략 (/guides and every /<game>/guide), 개발 노트, 보드게임 백과,
   * 서바이벌 게임 정리 and 게임 이론. Links and hubs are hidden; opening one shows the neutral screen. The short
   * rules / FAQ on each game page stay.
   */
  articles: true,
} as const;

/** Article sections blocked while PLAY_APP_HIDE.articles (path prefixes without the locale). /<game>/guide too. */
const ARTICLE_PREFIXES = ['/guides', '/devlog', '/board-games', '/survival-games', '/game-theory'];

/** Routes of hidden games the catalog does not know (yet); ids found in the catalog use their catalog href. */
const FALLBACK_ROUTES: Record<string, string> = {};

/** Hosts of the support/donation site (links to them are hidden in the app while PLAY_APP_HIDE.support). */
const SUPPORT_HOSTS = ['https://ctee.kr'];

type Catalog = readonly { id: string; href: string }[];

/** Route (no locale prefix) of each hidden game, e.g. '/indian-poker'. Pass the catalog's games to resolve hrefs. */
export function hiddenGameRoutes(catalog: Catalog): string[] {
  return PLAY_APP_HIDDEN_GAMES.map((id) => catalog.find((g) => g.id === id)?.href ?? FALLBACK_ROUTES[id]).filter(
    (href): href is string => !!href && href !== '/',
  );
}

/** Catalog id from either spelling used on the site: catalog ('hitStay') or stats/DB ('hit_stay'). */
const catalogId = (id: string) => id.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
/** Stats/DB spelling of a catalog id ('indianPoker' → 'indian_poker'). */
const statsId = (id: string) => id.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** Whether a game (catalog or stats id) is hidden in the Play app. */
export function isHiddenInPlayApp(gameId: string | null | undefined): boolean {
  return !!gameId && PLAY_APP_HIDDEN_GAMES.includes(catalogId(gameId));
}

/** True inside the Play app. Client only (false on the server and before the head script has run). */
export function isPlayApp(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.app === PLAY_APP_VALUE;
}

/**
 * Whether a request comes from the Play app (proxy side): the start-URL parameter, the app's referrer, or the
 * session cookie set by an earlier request.
 */
export function isPlayAppRequest(search: URLSearchParams, referer: string | null, cookie: string | undefined): boolean {
  return search.get(PLAY_APP_PARAM) === PLAY_APP_VALUE
    || (referer ?? '').startsWith(`android-app://${PLAY_APP_PACKAGE}`)
    || cookie === PLAY_APP_VALUE;
}

const stripLocale = (pathname: string) => pathname.replace(/^\/(ko|en)(?=\/|$)/, '') || '/';

/**
 * The hidden game a path belongs to (its play page, guide, rooms or ranking page), or undefined. The locale prefix is
 * optional: '/ko/indian-poker/room/AB12', '/hit-stay/guide' and '/en/ranking/two-sided-poker' all match.
 */
export function hiddenGameOfPath(pathname: string, catalog: Catalog): string | undefined {
  const path = stripLocale(pathname).replace(/^\/ranking(?=\/)/, '');
  return PLAY_APP_HIDDEN_GAMES.find((id) => {
    const r = catalog.find((g) => g.id === id)?.href ?? FALLBACK_ROUTES[id];
    return !!r && r !== '/' && (path === r || path.startsWith(`${r}/`));
  });
}

/** Whether a path is a long-form article page the app does not show (only while PLAY_APP_HIDE.articles). */
export function isArticlePath(pathname: string): boolean {
  if (!PLAY_APP_HIDE.articles) return false;
  const path = stripLocale(pathname);
  return ARTICLE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) || /^\/[^/]+\/guide(\/|$)/.test(path);
}

/** Whether the Play app shows the neutral "available on the web" screen for this path. */
export function isBlockedInPlayApp(pathname: string, catalog: Catalog): boolean {
  return isArticlePath(pathname) || !!hiddenGameOfPath(pathname, catalog);
}

const sel = (s: string) => s.replace(/["\\]/g, '\\$&');

/** Rules hiding links to a path prefix (with or without locale, query or hash) and list items that only hold one. */
const linkRules = (A: string, prefix: string) => {
  const x = sel(prefix);
  return [
    `${A} a[href$="${x}"]`, `${A} a[href*="${x}/"]`, `${A} a[href*="${x}?"]`, `${A} a[href*="${x}#"]`,
    `${A} li:has(> a[href$="${x}"])`, `${A} li:has(> a[href*="${x}/"])`, `${A} li:has(> a[href*="${x}?"])`,
  ];
};

/** The stylesheet that does the hiding (inert outside app mode). */
export function playAppCss(routes: readonly string[]): string {
  const A = `html[data-app="${PLAY_APP_VALUE}"]`;
  const hide: string[] = [];
  for (const id of PLAY_APP_HIDDEN_GAMES) for (const x of new Set([id, statsId(id)])) hide.push(`${A} [data-play-game="${sel(x)}"]`);
  for (const [kind, on] of Object.entries(PLAY_APP_HIDE)) if (on) hide.push(`${A} [data-play-hide~="${kind}"]`);
  if (PLAY_APP_HIDE.ads) hide.push(`${A} .ad-slot`, `${A} ins.adsbygoogle`);
  for (const r of routes) hide.push(...linkRules(A, r));
  if (PLAY_APP_HIDE.articles) {
    for (const p of ARTICLE_PREFIXES) hide.push(...linkRules(A, p));
    // Every game's full guide page (/<game>/guide) and list items that only link there.
    hide.push(`${A} a[href$="/guide"]`, `${A} a[href*="/guide?"]`, `${A} a[href*="/guide#"]`,
      `${A} li:has(> a[href$="/guide"])`, `${A} li:has(> a[href*="/guide#"])`);
  }
  if (PLAY_APP_HIDE.support) for (const h of SUPPORT_HOSTS) hide.push(`${A} a[href^="${sel(h)}"]`);
  return `html:not([data-app="${PLAY_APP_VALUE}"]) .play-only{display:none!important}`
    + (hide.length ? `${hide.join(',')}{display:none!important}` : '');
}

/**
 * Inline script for the top of <head>. Decides app mode before the first paint, keeps the session cookie in step
 * with it, and loads AdSense only outside app mode. `adsenseClient` is the publisher id ('' = no AdSense).
 */
export function playAppHeadScript(adsenseClient: string): string {
  const cfg = JSON.stringify({ p: PLAY_APP_PARAM, v: PLAY_APP_VALUE, c: PLAY_APP_COOKIE, k: STORAGE_KEY, r: `android-app://${PLAY_APP_PACKAGE}`, a: adsenseClient, h: PLAY_APP_HIDE.ads });
  return `(function(o){var d=document.documentElement,app=false,ss=null;
try{ss=window.sessionStorage}catch(e){}
try{var u=new URL(location.href);
if(u.searchParams.get(o.p)===o.v||document.referrer.indexOf(o.r)===0){app=true;try{ss&&ss.setItem(o.k,'1')}catch(e){}}
else if(ss&&ss.getItem(o.k)==='1')app=true;
var ck=new RegExp('(?:^|; )'+o.c+'='+o.v+'(?:;|$)').test(document.cookie);
if(app){d.setAttribute('data-app',o.v);if(!ck)document.cookie=o.c+'='+o.v+'; path=/; samesite=lax';
if(u.searchParams.has(o.p)){u.searchParams.delete(o.p);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}}
else if(ck){document.cookie=o.c+'=; path=/; max-age=0; samesite=lax';document.addEventListener('DOMContentLoaded',function(){if(document.querySelector('[data-ptk-rewritten]'))location.reload()})}
}catch(e){}
if(o.a&&!(app&&o.h)){var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+o.a;document.head.appendChild(s)}
})(${cfg});`;
}
