// 어려움 클리어 인증서: shared game info and data access (used by the popup, the public page and the image).
import type { GameId } from './stats';

export const HARD_CLEAR_EVENT = 'puzzlthink:hard-clear';
/** id/no are missing when the player is signed out (they get a number after signing in). */
export type HardClearDetail = { game: GameId; id?: string; no?: number; delayMs: number };

export type Cert = { game: GameId; clear_no: number; nickname: string; cleared_at: string; total: number };

type Href = '/piggy-bank' | '/nemo-count' | '/black-white' | '/black-white-2' | '/laser-janggi' | '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
export const CERT_GAMES: Record<GameId, { ko: string; en: string; href: Href; color: string }> = {
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
  if (!url || !key || !/^[0-9a-f]{12}$/.test(id)) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/hard_clear_cert`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id }), next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Cert[];
    return rows[0] ?? null;
  } catch { return null; }
}

export const formatClearDate = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600_000); // KST
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
};
