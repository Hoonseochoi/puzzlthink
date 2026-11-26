/**
 * "App mode": the site running inside the Google Play app (a Trusted Web Activity, package below).
 * The website itself never changes; inside the Play app some games and all AdSense are hidden.
 *
 * Everything the Play app hides is decided HERE:
 *  - PLAY_APP_HIDDEN_GAMES — add or remove one catalog id to hide or show a game in the app (ids that do not exist
 *    yet are fine: they only ever match nothing).
 *  - PLAY_APP_HIDE — whole kinds of things (ads, support links, the install prompt, the direct-sold banner).
 *
 * How it works, without a flash of web-only content and without making any page dynamic:
 *  1. Detection: the app's start URL carries `?app=play`, and Chrome gives the first page of every app launch (deep
 *     links included) the referrer `android-app://com.puzzlthink.app`. Either one turns app mode on.
 *  2. The proxy (src/proxy.ts) sees the same signals on the request, sets the session cookie `ptk_app=play`, and
 *     rewrites requests for a hidden game's routes (play page, guide, rooms) to the neutral /web-only page, so the
 *     game never even mounts.
 *  3. PLAY_APP_HEAD_SCRIPT runs first thing in <head>, before anything paints: it remembers app mode in
 *     sessionStorage (per tab, so it never leaks to a normal Chrome tab even though the TWA shares Chrome's
 *     cookies), keeps the cookie in step, and sets <html data-app="play">. It also injects the AdSense script, but
 *     only outside app mode.
 *  4. PLAY_APP_CSS hides everything marked for app mode once that attribute is set. Markers:
 *       data-play-game="<game id>"      a card / row / item for one game (catalog id 'hitStay' or stats id 'hit_stay')
 *       data-play-hide="<kind>"         ads | support | install | hiddenlog
 *       any <a> whose href points at a hidden game's route or at the support site (no marker needed)
 *       .play-only                      shown only in app mode (e.g. the "available on the web" notice)
 *  5. isPlayApp() is the switch for client code (effects, event handlers) that must not run in the app.
 */

/** The Play app's package id (permanent once uploaded to Google Play). */
export const PLAY_APP_PACKAGE = 'com.puzzlthink.app';
/**
 * SHA-256 certificate fingerprints served in /.well-known/assetlinks.json (src/app/.well-known/assetlinks.json).
 * Without the right one Android shows the app with a browser address bar.
 *  - upload: the upload key in ~/.config/puzzlthink/play/upload-keystore.jks (signs the .aab you upload, and the
 *    local test .apk).
 *  - playAppSigning: PLACEHOLDER — after the first upload, copy "SHA-256 certificate fingerprint" from Play Console →
 *    the app → Test and release → App integrity → App signing (App signing key certificate) and paste it here.
 *    The Play Store installs copies signed with THAT key. Empty = left out of the file.
 */
export const PLAY_APP_FINGERPRINTS = {
  upload: 'FC:DA:A4:31:09:BD:76:2C:FC:38:81:9F:1A:13:F3:B0:57:1C:F7:FD:78:A3:32:60:1B:FF:97:F3:8A:6C:6E:09',
  playAppSigning: '', // ← PLACEHOLDER: Play App Signing key SHA-256 (see above)
} as const;

/** Query parameter on the app's start URL: /?app=play */
export const PLAY_APP_PARAM = 'app';
export const PLAY_APP_VALUE = 'play';
export const PLAY_APP_COOKIE = 'ptk_app';
const STORAGE_KEY = 'puzzlthink:play-app';

/**
 * Games hidden inside the Play app (catalog ids from src/lib/gameCatalog.ts). Betting / poker-type games: a
 * "simulated gambling" answer on the content-rating questionnaire would raise the rating of the whole app.
 * 러시안 룰렛 (`russianRoulette`) shows a gun; it stays visible unless its id is added here.
 */
export const PLAY_APP_HIDDEN_GAMES: readonly string[] = [
  'indianPoker',
  'twoSidedPoker',
  'hitStay',
  'sniperHoldem',
];

/** Kinds of things hidden inside the Play app. Set one to false to show it in the app again. */
export const PLAY_APP_HIDE = {
  /** AdSense: the script is never loaded and no ad slot (or its space) is shown. */
  ads: true,
  /** Links to the external support/donation page (it grants in-app perks, so Play's payments policy applies). */
  support: true,
  /** The "앱 설치" (add to home screen) prompts: the user already has the app. */
  install: true,
  /** The directly sold 히든로그 banner (not AdSense). Kept in the app by default. */
  hiddenlog: false,
} as const;

/**
 * Routes of hidden games, for games the catalog does not know yet. Ids found in the catalog use their catalog href;
 * this only covers ids that are not in it (yet).
 */
const FALLBACK_ROUTES: Record<string, string> = {
  sniperHoldem: '/sniper-holdem',
};

/** Hosts of the support/donation site (links to them are hidden in the app while PLAY_APP_HIDE.support). */
const SUPPORT_HOSTS = ['https://ctee.kr'];

/** Route (no locale prefix) of each hidden game, e.g. '/indian-poker'. Pass the catalog's games to resolve hrefs. */
export function hiddenGameRoutes(catalog: readonly { id: string; href: string }[]): string[] {
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

/**
 * The hidden game a path belongs to (its play page, guide, rooms or ranking page), or undefined. The locale prefix is
 * optional: '/ko/indian-poker/room/AB12', '/hit-stay/guide' and '/en/ranking/two-sided-poker' all match.
 */
export function hiddenGameOfPath(pathname: string, catalog: readonly { id: string; href: string }[]): string | undefined {
  const path = pathname.replace(/^\/(ko|en)(?=\/|$)/, '').replace(/^\/ranking(?=\/)/, '') || '/';
  return PLAY_APP_HIDDEN_GAMES.find((id) => {
    const r = catalog.find((g) => g.id === id)?.href ?? FALLBACK_ROUTES[id];
    return !!r && r !== '/' && (path === r || path.startsWith(`${r}/`));
  });
}

const sel = (s: string) => s.replace(/["\\]/g, '\\$&');

/** The stylesheet that does the hiding (inert outside app mode). */
export function playAppCss(routes: readonly string[]): string {
  const A = `html[data-app="${PLAY_APP_VALUE}"]`;
  const hide: string[] = [];
  for (const id of PLAY_APP_HIDDEN_GAMES) for (const x of new Set([id, statsId(id)])) hide.push(`${A} [data-play-game="${sel(x)}"]`);
  for (const [kind, on] of Object.entries(PLAY_APP_HIDE)) if (on) hide.push(`${A} [data-play-hide~="${kind}"]`);
  if (PLAY_APP_HIDE.ads) hide.push(`${A} .ad-slot`, `${A} ins.adsbygoogle`);
  for (const r of routes) {
    const x = sel(r);
    // The route itself and anything under it, with or without a locale prefix, query or hash.
    hide.push(`${A} a[href$="${x}"]`, `${A} a[href*="${x}/"]`, `${A} a[href*="${x}?"]`, `${A} a[href*="${x}#"]`);
    // A list item / card whose only job is that link.
    hide.push(`${A} li:has(> a[href$="${x}"])`, `${A} li:has(> a[href*="${x}/"])`, `${A} li:has(> a[href*="${x}?"])`);
  }
  if (PLAY_APP_HIDE.support) for (const h of SUPPORT_HOSTS) hide.push(`${A} a[href^="${sel(h)}"]`);
  return `.play-only{display:none!important}${A} .play-only{display:revert!important}${hide.join(',')}{display:none!important}`;
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
else if(ck){document.cookie=o.c+'=; path=/; max-age=0; samesite=lax';document.addEventListener('DOMContentLoaded',function(){if(document.querySelector('[data-ptk-web-only]'))location.reload()})}
}catch(e){}
if(o.a&&!(app&&o.h)){var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+o.a;document.head.appendChild(s)}
})(${cfg});`;
}
