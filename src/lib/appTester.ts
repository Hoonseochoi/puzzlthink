/**
 * Google Play 앱 테스터 모집 (supabase/migrations/20271130000000_app_testers.sql). A member taps "동의하고 참여" and
 * the address Google Play invites (their Google sign-in email, or one they type) is stored by consent. The UI is
 * src/components/AppTesterInvite.tsx: the one-time popup, the result-screen card, the home strip and the records row.
 *
 * One small store per tab keeps every place in step: joining in the popup hides the home strip at once.
 */
import type { User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export type TesterStatus =
  | { kind: 'loading' }
  /** The RPCs are not there (migration not applied yet) or failed: show nothing. */
  | { kind: 'unavailable' }
  | { kind: 'not' }
  /** `listed`: the email is on the Play Console tester list, so the Play opt-in page opens for them. */
  | { kind: 'joined'; email: string; listed: boolean };

type Entry = { uid: string; status: TesterStatus };
let entry: Entry | null = null;
const listeners = new Set<() => void>();
const LOADING: TesterStatus = { kind: 'loading' };
const emit = () => listeners.forEach((fn) => fn());
const set = (uid: string, status: TesterStatus) => { entry = { uid, status }; emit(); };
const inflight = new Map<string, Promise<void>>();

export function subscribeTester(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function testerSnapshot(uid: string | null): TesterStatus {
  return uid && entry?.uid === uid ? entry.status : LOADING;
}

type Rpc = { joined?: boolean; email?: string | null; listed?: boolean } | null;
const fromRpc = (data: Rpc): TesterStatus => data?.joined && data.email ? { kind: 'joined', email: data.email, listed: data.listed !== false } : { kind: 'not' };

/** Loads the signed-in member's status once per tab (again after sign-in as someone else). */
export function loadTester(uid: string) {
  if (entry?.uid === uid && entry.status.kind !== 'loading') return Promise.resolve();
  const running = inflight.get(uid);
  if (running) return running;
  const supabase = getSupabase();
  if (!supabase) { set(uid, { kind: 'unavailable' }); return Promise.resolve(); }
  const p = Promise.resolve(supabase.rpc('app_tester_status')).then(({ data, error }) => {
    set(uid, error ? { kind: 'unavailable' } : fromRpc(data as Rpc));
  }, () => set(uid, { kind: 'unavailable' })).finally(() => inflight.delete(uid));
  inflight.set(uid, p);
  return p;
}

/** Joins with the sign-in email (null) or a typed one. Returns an error code, or null on success. */
export async function joinTester(uid: string, email: string | null): Promise<'invalid' | 'failed' | null> {
  const supabase = getSupabase();
  if (!supabase) return 'failed';
  const { data, error } = await supabase.rpc('app_tester_join', { p_email: email });
  if (error) return /invalid email/.test(error.message) ? 'invalid' : 'failed';
  set(uid, fromRpc(data as Rpc));
  return null;
}

export async function leaveTester(uid: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.rpc('app_tester_leave');
  if (error) return false;
  set(uid, { kind: 'not' });
  return true;
}

/** Same rule as the database's app_tester_mask(): "ab***@gmail.com". */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = [email.slice(0, email.lastIndexOf('@')), email.slice(email.lastIndexOf('@') + 1)];
  return `${local.slice(0, local.length <= 2 ? 1 : 2)}***@${domain.toLowerCase()}`;
}

/**
 * The sign-in email when Google Play can invite it (the site signs in with Google only, so normally always), else null
 * and the UI asks for the Google account email instead.
 */
export function inviteEmail(user: User | null): string | null {
  if (!user?.email) return null;
  const providers = [user.app_metadata?.provider, ...((user.app_metadata?.providers as string[] | undefined) ?? [])];
  return providers.includes('google') ? user.email : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// ── The one-time popup ──────────────────────────────────────────────────────────────────────────────────────────
// "다음에" rests it for 3 days; after the third "다음에" it never comes back. Joining ends it too (status hides it).
const DISMISS_KEY = 'puzzlthink:app-tester-dismiss';
const REST_MS = 3 * 24 * 3600_000;
export const MAX_DISMISSALS = 3;
/** Set when a signed-out player taps "로그인하고 참여": the popup opens right after the sign-in redirect. */
const PENDING_KEY = 'puzzlthink:app-tester-pending';

type Dismissal = { n: number; at: number };
function readDismissal(): Dismissal {
  try {
    const v = JSON.parse(localStorage.getItem(DISMISS_KEY) || 'null');
    return v && typeof v.n === 'number' ? v : { n: 0, at: 0 };
  } catch { return { n: 0, at: 0 }; }
}
export function popupDue(now = Date.now()): boolean {
  const d = readDismissal();
  return d.n < MAX_DISMISSALS && now - d.at >= REST_MS;
}
export function dismissPopup() {
  const d = readDismissal();
  try { localStorage.setItem(DISMISS_KEY, JSON.stringify({ n: d.n + 1, at: Date.now() })); } catch { /* private mode: it may come back */ }
}
export function markPending() { try { sessionStorage.setItem(PENDING_KEY, String(Date.now())); } catch { /* optional */ } }
export function takePending(): boolean {
  try {
    const at = Number(sessionStorage.getItem(PENDING_KEY) || 0);
    sessionStorage.removeItem(PENDING_KEY);
    return Date.now() - at < 30 * 60_000;
  } catch { return false; }
}

// ── The install popup (joined testers, once the closed test is open: PLAY_TESTER_OPT_IN_URL set) ──────────────────
// Android: once per browser tab session ("나중에" brings it back next visit) until "이미 설치했어요", which stops it on
// this device for good (the web cannot see whether the app is installed). Elsewhere (iPhone/iPad, desktop) a one-line
// "Android only" note, at most once per device.
const INSTALLED_KEY = 'puzzlthink:app-tester-installed';
const INSTALL_SHOWN_KEY = 'puzzlthink:app-tester-install-shown';
const ELSEWHERE_SHOWN_KEY = 'puzzlthink:app-tester-elsewhere-shown';
/** The header button opens the popup on demand (on any device) with this event. */
export const TESTER_INSTALL_OPEN_EVENT = 'puzzlthink:tester-install-open';

export const isAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
/** iPhone/iPad (iPadOS reports itself as a Mac with touch): there is no app for them, so no tester or install pitch. */
export const isIOS = () => typeof navigator !== 'undefined'
  && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

const read = (s: () => Storage, k: string) => { try { return s().getItem(k); } catch { return null; } };
const write = (s: () => Storage, k: string) => { try { s().setItem(k, '1'); } catch { /* private mode: it may come back */ } };
const local = () => localStorage;
const session = () => sessionStorage;

/** Whether the install popup is due on this visit (Android) or ever again (elsewhere). */
export function installPopupDue(android = isAndroid()): boolean {
  return android
    ? !read(local, INSTALLED_KEY) && !read(session, INSTALL_SHOWN_KEY)
    : !read(local, ELSEWHERE_SHOWN_KEY);
}
/** Marked when the popup opens on its own, so it waits for the next visit (or, elsewhere, never comes back). */
export function markInstallShown(android = isAndroid()) {
  write(android ? session : local, android ? INSTALL_SHOWN_KEY : ELSEWHERE_SHOWN_KEY);
}
/** "이미 설치했어요". */
export function markInstalled() { write(local, INSTALLED_KEY); }
/** Whether this device said "이미 설치했어요" (the header then stops pitching the install). */
export const markedInstalled = () => !!read(local, INSTALLED_KEY);
