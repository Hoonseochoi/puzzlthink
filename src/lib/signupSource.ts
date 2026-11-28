// Which sign-in button brought a new member (header, result screen, open room, …), kept for the first sign-in only.
const KEY = 'puzzlthink_signup_source';
const FRESH_MS = 30 * 60 * 1000;

export type SignupSource = 'hidden_word_liar' | 'hidden_word_plus' | 'header' | 'header_menu' | 'result' | 'open_room' | 'game_open' | 'home_open' | 'hard_clear' | 'hell' | 'hell_clear' | 'records' | 'slitherlink' | 'masyu_challenge' | 'masyu_beat' | 'nonogram_challenge' | 'nonogram_beat' | 'starbattle_challenge' | 'starbattle_beat' | 'binairo_challenge' | 'binairo_beat' | 'onestroke_challenge' | 'onestroke_beat' | 'colorlink_challenge' | 'colorlink_beat' | 'magicswap_challenge' | 'magicswap_beat' | 'lounge' | 'mine_oblivion' | 'other';

/** Remembers the button the player is about to sign in with (survives the Google redirect). */
export function markSignupSource(source: SignupSource) {
  try {
    const path = window.location.pathname.replace(/^\/(ko|en)(?=\/|$)/, '') || '/';
    sessionStorage.setItem(KEY, JSON.stringify({ source, path, at: Date.now() }));
  } catch { /* storage optional */ }
}

/** The remembered button, once (null if none or stale). */
export function takeSignupSource(): { source: string; path: string } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && Date.now() - v.at < FRESH_MS ? { source: String(v.source), path: String(v.path) } : null;
  } catch { return null; }
}
