// 어려움 클리어 인증서: shared game info and data access (used by the popup, the public page and the image).
import type { GameId } from './stats';

export const HARD_CLEAR_EVENT = 'puzzlthink:hard-clear';
/** id/no are missing when the player is signed out (they get a number after signing in). */
export type HardClearDetail = { game: GameId; id?: string; no?: number; delayMs: number };

/** tier 'hell' = 매우 어려움 certificate (its own numbering, id starts with 'h'). */
export type Cert = { game: GameId; clear_no: number; nickname: string; cleared_at: string; total: number; tier: 'hard' | 'hell' };

type Href = '/card-janggi' | '/hit-stay' | '/point-omok' | '/2048' | '/magic-square' | '/four-three' | '/binairo' | '/one-stroke' | '/color-link' | '/star-battle' | '/masyu' | '/nonogram' | '/two-sided-poker' | '/monorail' | '/flip-omok' | '/nine-mens-morris' | '/wallgo-2' | '/slitherlink' | '/gyulhap' | '/indian-poker' | '/hexagon' | '/piggy-bank' | '/nemo-count' | '/black-white' | '/black-white-2' | '/laser-janggi' | '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
export const CERT_GAMES: Record<GameId, { ko: string; en: string; href: Href; color: string }> = {
  card_janggi: { ko: '카드 장기', en: 'Card Janggi', href: '/card-janggi', color: '#b07cff' },
  hit_stay: { ko: 'Hit,Stay', en: 'Hit,Stay', href: '/hit-stay', color: '#6f7dff' },
  point_omok: { ko: '포인트 오목', en: 'Point Omok', href: '/point-omok', color: '#ff5d8f' },
  merge2048: { ko: '2048', en: '2048', href: '/2048', color: '#ff8fa3' },
  magicswap: { ko: '마방진 스왑', en: 'Magic Square Swap', href: '/magic-square', color: '#e45bd6' },
  binairo: { ko: '비나이로', en: 'Binairo', href: '/binairo', color: '#3f8cff' },
  onestroke: { ko: '한붓길', en: 'One Stroke', href: '/one-stroke', color: '#ff8a2b' },
  colorlink: { ko: '컬러 잇기', en: 'Color Link', href: '/color-link', color: '#21c2b5' },
  starbattle: { ko: '스타배틀', en: 'Star Battle', href: '/star-battle', color: '#ffc23d' },
  masyu: { ko: '마슈', en: 'Masyu', href: '/masyu', color: '#ff4d5e' },
  nonogram: { ko: '노노그램', en: 'Nonogram', href: '/nonogram', color: '#3fcf6a' },
  two_sided_poker: { ko: '양면포커', en: 'Two-Sided Poker', href: '/two-sided-poker', color: '#9b87ff' },
  monorail: { ko: '모노레일', en: 'Monorail', href: '/monorail', color: '#f3b64a' },
  four_three: { ko: '4인 3목', en: '4 Player 3 In a Row', href: '/four-three', color: '#ffb52e' },
  flip_omok: { ko: '뒤집기 오목', en: 'Flip Omok', href: '/flip-omok', color: '#3fb8ff' },
  nine_mens_morris: { ko: '나인 멘스 모리스', en: "Nine Men's Morris", href: '/nine-mens-morris', color: '#3ec9d6' },
  wallgo2: { ko: '벽바둑 II', en: 'Wallgo II', href: '/wallgo-2', color: '#e0283a' },
  slitherlink: { ko: '슬리더링크', en: 'Slitherlink', href: '/slitherlink', color: '#8f7cff' },
  gyulhap: { ko: '결합', en: 'Gyul! Hap!', href: '/gyulhap', color: '#ffcf3f' },
  indian_poker: { ko: '인디언 포커', en: 'Indian Poker', href: '/indian-poker', color: '#e6b94f' },
  wallgo: { ko: '벽바둑', en: 'Wallgo', href: '/wallgo', color: '#ff6b4a' },
  heavy13: { ko: '무거운 13', en: 'Heavy 13', href: '/heavy13', color: '#c9a061' },
  janggi: { ko: '십이장기', en: '12 Janggi', href: '/janggi', color: '#e8a33c' },
  russian_janggi: { ko: '러시아장기', en: 'Russian Janggi', href: '/russian-janggi', color: '#e2283c' },
  russian_roulette: { ko: '러시안 룰렛', en: 'Russian Roulette', href: '/russian-roulette', color: '#238ca8' },
  blind_gomoku: { ko: '블라인드 오목', en: 'Blind Gomoku', href: '/blind-gomoku', color: '#d39b2f' },
  laser_janggi: { ko: '레이저 장기', en: 'Laser Janggi', href: '/laser-janggi', color: '#28b9d7' },
  nemo_count: { ko: '네모 세기', en: 'Nemo Count', href: '/nemo-count', color: '#7d86a8' },
  black_white: { ko: '흑과 백', en: 'Black & White', href: '/black-white', color: '#9a9aa6' },
  black_white_2: { ko: '흑과 백 II', en: 'Black & White II', href: '/black-white-2', color: '#ef3340' },
  hexagon: { ko: '헥사곤', en: 'Hexagon', href: '/hexagon', color: '#e8b04a' },
  piggy_bank: { ko: '돼지 저금통', en: 'Piggy Bank', href: '/piggy-bank', color: '#e0a91c' },
  sudoku: { ko: '스도쿠', en: 'Sudoku', href: '/play', color: '#4b7bff' },
};

/** "러시아장기 AI 어려움" / "Russian Janggi · Hard AI" (Sudoku has no AI). */
export function clearLabel(game: GameId, locale: string) {
  const g = CERT_GAMES[game];
  if (locale === 'en') return game === 'sudoku' ? `${g.en} · Hard` : `${g.en} · Hard AI`;
  return game === 'sudoku' ? `${g.ko} 어려움` : `${g.ko} AI 어려움`;
}

/** A win that earns a certificate (same rule as the SQL function is_hard_clear). */
export function isHardClear(game: GameId, mode: string, result: string, detail: Record<string, unknown>) {
  if (result !== 'win') return false;
  const level = (detail.difficulty ?? detail.level) as string | undefined;
  return (mode === 'ai' && level === 'hard') || (game === 'sudoku' && mode === 'solo' && level === 'hard');
}

export const certPath = (locale: string, id: string) => `/${locale}/cert/${id}`;
export const certImagePath = (id: string, locale: string) => `/api/cert/${id}?l=${locale === 'en' ? 'en' : 'ko'}`;

/** Server-side lookup through the public REST endpoint (no session needed). */
export async function fetchCert(id: string): Promise<Cert | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hell = /^h[0-9a-f]{12}$/.test(id);
  if (!url || !key || (!hell && !/^[0-9a-f]{12}$/.test(id))) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/${hell ? 'hell_clear_cert' : 'hard_clear_cert'}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id }), next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Omit<Cert, 'tier'>[];
    return rows[0] ? { ...rows[0], tier: hell ? 'hell' : 'hard' } : null;
  } catch { return null; }
}

export const formatClearDate = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600_000); // KST
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
};
