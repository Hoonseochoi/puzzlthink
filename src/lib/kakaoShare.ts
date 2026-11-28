/**
 * KakaoTalk sharing (Kakao JavaScript SDK, "카카오톡 공유" feed card), with a fallback to the system share sheet and
 * then to copying the link.
 *
 *  - The SDK is never part of page load. It is fetched from Kakao's CDN (pinned version + Kakao's published SRI hash)
 *    the first time a Kakao button is tapped, or on idle once an invite panel is on screen (preloadKakao) so the tap
 *    is instant.
 *  - The JavaScript key is public by design (it only works from the web domains registered on the key's card in
 *    Kakao Developers: puzzlthink.com, www.puzzlthink.com, localhost:3000). NEXT_PUBLIC_KAKAO_JS_KEY overrides it.
 *  - Privacy: Kakao receives only what is printed on the card (title, description, image URL, link). No user ids,
 *    no serverCallbackArgs.
 *  - Google Play app (TWA): KAKAO_IN_PLAY_APP decides. Off until a real-device check; the app then uses the Android
 *    share sheet, which lists KakaoTalk and still shows the page's link preview.
 */
import { isPlayApp } from './playApp';

/** Kakao JS SDK, pinned. Hash from developers.kakao.com/docs/latest/ko/javascript/download (re-checked against the file). */
export const KAKAO_SDK = {
  src: 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.5/kakao.min.js',
  integrity: 'sha384-v6JKY3z4FUkWq21oZDHZe74YvuPk/WUrVLrDHTBojHXClOSa3iXy7sCXPY1jkFbj',
} as const;

/** Public JavaScript key of the PUZZLTHINK Kakao app (not a secret; never put the REST/Admin key here). */
const KAKAO_JS_KEY_PUBLIC = '9febe935e7b9067b4aa2a11e993fa412';
export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || KAKAO_JS_KEY_PUBLIC;

/** Use the Kakao card inside the Google Play app too. Flip to true after checking a send on a real phone. */
export const KAKAO_IN_PLAY_APP = false;

interface KakaoLink { mobileWebUrl: string; webUrl: string }
interface KakaoFeed {
  objectType: 'feed';
  content: { title: string; description?: string; imageUrl: string; imageWidth?: number; imageHeight?: number; link: KakaoLink };
  buttons?: { title: string; link: KakaoLink }[];
}
interface KakaoSdk {
  init(key: string): void;
  isInitialized(): boolean;
  Share: { sendDefault(template: KakaoFeed): void };
}
declare global {
  interface Window { Kakao?: KakaoSdk }
}

let loading: Promise<KakaoSdk> | null = null;

/** Loads (once) and initialises the SDK. Rejects on network/SRI failure or after 8 s; a later call tries again. */
export function loadKakao(): Promise<KakaoSdk> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (loading) return loading;
  loading = new Promise<KakaoSdk>((resolve, reject) => {
    const ready = () => {
      const k = window.Kakao;
      if (!k) { reject(new Error('Kakao missing')); return; }
      try { if (!k.isInitialized()) k.init(KAKAO_JS_KEY); resolve(k); } catch (e) { reject(e); }
    };
    if (window.Kakao) { ready(); return; }
    const s = document.createElement('script');
    s.src = KAKAO_SDK.src;
    s.integrity = KAKAO_SDK.integrity;
    s.crossOrigin = 'anonymous';
    s.async = true;
    s.dataset.kakaoSdk = '1';
    const timer = window.setTimeout(() => reject(new Error('Kakao timeout')), 8000);
    s.onload = () => { window.clearTimeout(timer); ready(); };
    s.onerror = () => { window.clearTimeout(timer); s.remove(); reject(new Error('Kakao load failed')); };
    document.head.appendChild(s);
  });
  loading.catch(() => { loading = null; });
  return loading;
}

/** Warm the SDK when the browser is idle (call when an invite panel opens). No-op where the card is not used. */
export function preloadKakao(): void {
  if (typeof window === 'undefined' || !kakaoUsable()) return;
  const go = () => { loadKakao().catch(() => { /* the tap will fall back */ }); };
  if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 4000 });
  else globalThis.setTimeout(go, 1500);
}

/** Whether this page should use the Kakao card (false in the Play app unless KAKAO_IN_PLAY_APP). */
export function kakaoUsable(): boolean {
  return KAKAO_IN_PLAY_APP || !isPlayApp();
}

/** The page's own link-preview image (og:image), absolute; the site's default image when the page has none. */
export function pageOgImage(): string {
  const meta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content;
  return new URL(meta || '/opengraph-image', window.location.origin).href;
}

export interface KakaoShareInput {
  title: string;
  description?: string;
  /** Absolute or site-relative; defaults to the page's og:image (already cached — no new drawing). */
  imageUrl?: string;
  /** Absolute or site-relative link the card opens. */
  url: string;
  /** Card button text: 참가하기 for invites, 플레이하기 for game/result shares. */
  buttonTitle: string;
}

export type ShareOutcome = 'kakao' | 'native' | 'copied' | 'none';

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  try {
    const area = document.createElement('textarea');
    area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch { return false; }
}

/** The system share sheet, then copy link. Returns what happened ('none' = the player closed the sheet). */
export async function shareFallback({ title, description, url }: { title: string; description?: string; url: string }): Promise<ShareOutcome> {
  const abs = new URL(url, window.location.origin).href;
  const text = description ? `${title}\n${description}` : title;
  if (navigator.share) {
    try { await navigator.share({ title: 'PUZZLTHINK', text, url: abs }); return 'native'; }
    catch (e) { if ((e as DOMException)?.name === 'AbortError') return 'none'; }
  }
  return (await copyText(`${text}\n${abs}`)) ? 'copied' : 'none';
}

/**
 * Sends a KakaoTalk feed card. Falls back to navigator.share, then copy link, when the SDK cannot load, init or send
 * (offline, blocked, unregistered domain errors that throw) and in the Play app (see KAKAO_IN_PLAY_APP).
 */
export async function shareKakao(input: KakaoShareInput): Promise<ShareOutcome> {
  const url = new URL(input.url, window.location.origin).href;
  if (!kakaoUsable()) return shareFallback({ ...input, url });
  try {
    const kakao = await loadKakao();
    const link = { mobileWebUrl: url, webUrl: url };
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: input.title,
        ...(input.description ? { description: input.description } : {}),
        imageUrl: new URL(input.imageUrl || pageOgImage(), window.location.origin).href,
        imageWidth: 1200,
        imageHeight: 630,
        link,
      },
      buttons: [{ title: input.buttonTitle, link }],
    });
    return 'kakao';
  } catch {
    return shareFallback({ ...input, url });
  }
}

/** Card text for a friend-room invite. `host` is the inviter's nickname as shown in the room (optional). */
export function inviteCopy({ game, code, host, en = false }: { game: string; code: string; host?: string | null; en?: boolean }) {
  const name = host?.trim();
  const room = code.toUpperCase();
  if (en) {
    return {
      title: name ? `${name} invited you to a ${game} friend match` : `You're invited to a ${game} friend match`,
      description: `Room code ${room} · PUZZLTHINK`,
      buttonTitle: 'Join',
    };
  }
  return {
    title: name ? `${name}님이 ${game} 친구 대전에 초대했어요` : `${game} 친구 대전에 초대받았어요`,
    description: `방 코드 ${room} · PUZZLTHINK`,
    buttonTitle: '참가하기',
  };
}

/** Card text for sharing a game or a result. `game` may be '' (a page outside one game, e.g. a ranking). */
export function playCopy({ game, text, en = false }: { game: string; text?: string; en?: boolean }) {
  const site = en ? 'PUZZLTHINK · free web games' : 'PUZZLTHINK 무료 웹 게임';
  return {
    title: text || (game ? (en ? `Play ${game} on PUZZLTHINK` : `${game} 한 판 할래요?`) : site),
    description: game ? `${game} · ${site}` : site,
    buttonTitle: en ? 'Play' : '플레이하기',
  };
}
