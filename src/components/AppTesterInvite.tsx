"use client";

import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Ban, Check, Download, Loader2, Smartphone, Sparkles, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { usePlayApp } from './playApp/usePlayApp';
import { TesterStone } from './TesterIcons';
import { checkNewIcons } from './IconUnlock';
import { refreshStoneChoices } from './StoneAvatar';
import { usePathname } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { PLAY_TESTER_OPT_IN_URL } from '@/lib/playApp';
import { type SignupSource, markSignupSource } from '@/lib/signupSource';
import {
  EMAIL_RE, TESTER_INSTALL_OPEN_EVENT, type TesterStatus, dismissPopup, installPopupDue, inviteEmail, isAndroid,
  joinTester, leaveTester, loadTester, markInstalled, markInstallShown, markPending, maskEmail, popupDue,
  subscribeTester, takePending, testerSnapshot,
} from '@/lib/appTester';

/**
 * Google Play 앱 테스터 모집 — one component set so every place says the same thing (src/lib/appTester.ts):
 *  - <AppTesterPopup />    once after sign-in (layout), never on a game page; "다음에" rests it 3 days, 3 times max.
 *  - <AppTesterCard />     the result screen (ResultActions): one tap, or "로그인하고 참여" when signed out.
 *  - <AppTesterStrip />    the home page.
 *  - <AppTesterSettings /> the records page: the joined state and the withdraw control.
 * Once the closed test is open (PLAY_TESTER_OPT_IN_URL set), members who joined are pushed to install the app:
 *  - <HeaderTesterButton /> takes the header's 자율 후원 place (GlobalHeader; 후원 stays in the phone menu and footer).
 *  - <AppTesterInstallPopup /> on every visit until "이미 설치했어요" (Android), or a one-line note elsewhere.
 * Members who already joined see none of the invitations, and inside the Play app nothing is shown but the
 * records row of a member who joined (so they can still withdraw).
 */

type Tone = 'dark' | 'light';
const LOADING: TesterStatus = { kind: 'loading' };

function useTester() {
  const auth = useAuth();
  const uid = auth.user?.id ?? null;
  const status = useSyncExternalStore(subscribeTester, () => testerSnapshot(uid), () => LOADING);
  useEffect(() => { if (uid) loadTester(uid); }, [uid]);
  return { ...auth, uid, status };
}

/** The TESTER icon a member gets on joining (pt-tester), drawn as on their profile. */
function TesterIcon({ size }: { size: number }) {
  const id = useId().replace(/:/g, '');
  return <TesterStone id={`ati-${id}`} name="TESTER" size={size} tier="tester" />;
}

const ICONS = [Sparkles, null, Smartphone];

function Benefits({ tone, compact }: { tone: Tone; compact?: boolean }) {
  const t = useTranslations('AppTester');
  const lines = [t('benefit1'), t('benefit2'), t('benefit3')];
  return (
    <ul className={compact ? 'mt-2 flex flex-wrap gap-1.5' : 'mt-4 space-y-2'}>
      {lines.map((line, i) => {
        const Icon = ICONS[i];
        return compact
          ? <li key={i} className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-bold ${tone === 'dark' ? 'bg-white/10 text-white/75' : 'bg-[#5b45c9]/8 text-[#4a39a8]'}`}>{Icon ? <Icon size={11} /> : <TesterIcon size={14} />}{line}</li>
          : <li key={i} className="flex items-center gap-2.5 text-sm font-bold">{Icon ? <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b45c9] text-white"><Icon size={14} /></span> : <span className="flex h-7 w-7 shrink-0 items-center justify-center"><TesterIcon size={28} /></span>}<span className="break-keep">{line}</span></li>;
      })}
    </ul>
  );
}

/** "동의하고 참여" with the consent text right at the button (or "로그인하고 참여" when signed out). */
function Consent({ tone, source, onJoined, later, head }: {
  tone: Tone; source: SignupSource; onJoined?: () => void; later?: React.ReactNode;
  /** Slim layout (home strip): this text sits left of the button on one row. */
  head?: React.ReactNode;
}) {
  const t = useTranslations('AppTester');
  const { user, uid, signIn } = useTester();
  const google = inviteEmail(user);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'invalid' | 'failed' | null>(null);
  const dark = tone === 'dark';
  const muted = dark ? 'text-white/55' : 'text-black/50';
  const primary = `inline-flex ${head ? 'shrink-0 px-3.5 py-2 text-[12px]' : 'flex-1 px-4 py-2.5 text-[13px]'} items-center justify-center gap-1.5 rounded-full bg-[#5b45c9] font-black text-white shadow-[0_6px_18px_rgba(91,69,201,.35)] transition active:scale-[.98] disabled:opacity-40`;
  const row = head ? 'flex items-center gap-3' : 'flex gap-2';
  const note = `break-keep leading-4 ${muted} ${head ? 'mt-1.5 text-[10.5px]' : 'mt-2 text-[11px]'}`;

  if (!user || !uid) {
    return (
      <div className={head ? '' : 'mt-3'}>
        <div className={row}>
          {head}
          <button type="button" className={primary} onClick={() => { markSignupSource(source); markPending(); signIn(); }}>{t('loginJoin')}</button>
          {later}
        </div>
        <p className={note}>{t('loginNote')}</p>
      </div>
    );
  }

  const email = google ?? typed.trim();
  const join = async () => {
    if (!google && !EMAIL_RE.test(email)) { setError('invalid'); return; }
    setBusy(true); setError(null);
    const e = await joinTester(uid, google ? null : email);
    setBusy(false);
    if (e) { setError(e); return; }
    refreshStoneChoices();
    checkNewIcons(400); // the TESTER icon's "새 아이콘" celebration
    onJoined?.();
  };
  return (
    <div className={head ? '' : 'mt-3'}>
      {head && !google && <div className="mb-2">{head}</div>}
      {!google && (
        <label className={`mb-2 block text-[11px] font-bold ${muted}`}>{t('emailLabel')}
          <input type="email" inputMode="email" autoComplete="email" value={typed} onChange={(e) => { setTyped(e.target.value); setError(null); }} placeholder="name@gmail.com"
            className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none ${dark ? 'border-white/15 bg-white/10 text-white placeholder:text-white/30 focus:border-[#b9a8ff]' : 'border-black/15 bg-white focus:border-[#5b45c9]'}`} />
          <span className="mt-1 block break-keep font-normal">{t('emailNote')}</span>
        </label>
      )}
      <div className={google ? row : 'flex gap-2'}>
        {google && head}
        <button type="button" className={primary} disabled={busy || (!google && !typed.trim())} onClick={join}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{t('join')}
        </button>
        {later}
      </div>
      <p className={note}>
        {t('consent', { email: google ? maskEmail(google) : t('typedEmail') })}
      </p>
      {error && <p className="mt-1.5 text-[11px] font-bold text-[#e5484d]">{t(error === 'invalid' ? 'invalid' : 'failed')}</p>}
    </div>
  );
}

/** "신청 완료": the install link once the test is open, otherwise where it will appear. */
function Joined({ tone, email, listed = true }: { tone: Tone; email: string; listed?: boolean }) {
  const t = useTranslations('AppTester');
  const muted = tone === 'dark' ? 'text-white/60' : 'text-black/55';
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-black"><BadgeCheck size={16} className="text-[#3ddc97]" />{t('doneTitle')}</p>
      <p className={`mt-1 break-keep text-[12px] leading-5 ${muted}`}>{t('doneEmail', { email })}</p>
      {PLAY_TESTER_OPT_IN_URL && !listed ? (
        // Not on the Play tester list yet (it is updated about once an hour): the Play page would not open.
        <p className={`mt-1 break-keep text-[12px] leading-5 ${muted}`}>{t('doneSoon')}</p>
      ) : PLAY_TESTER_OPT_IN_URL && !isAndroid() ? (
        // The test app is Android only: no install button on iPhone/iPad or a computer.
        <p className={`mt-1 break-keep text-[12px] leading-5 ${muted}`}>{t('installAndroidOnly')}</p>
      ) : PLAY_TESTER_OPT_IN_URL ? (
        <>
          <a href={PLAY_TESTER_OPT_IN_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#3ddc97] px-4 py-2.5 text-[13px] font-black text-[#06231a]"><Download size={14} />{t('getApp')}</a>
          <p className={`mt-2 break-keep text-[11px] leading-4 ${muted}`}>{t('keepInstalled')}</p>
        </>
      ) : <p className={`mt-1 break-keep text-[12px] leading-5 ${muted}`}>{t('doneWait')}</p>}
    </div>
  );
}

const box = (tone: Tone) => tone === 'dark'
  ? 'rounded-[16px] border border-[#b9a8ff]/30 bg-gradient-to-b from-[#7c5cff]/18 to-white/[0.03] p-4 text-left text-white'
  : 'rounded-[20px] border border-[#5b45c9]/20 bg-white p-4 text-left text-[#17201e] shadow-[0_10px_30px_rgba(91,69,201,.08)]';

function Eyebrow({ tone }: { tone: Tone }) {
  const t = useTranslations('AppTester');
  return <p className={`flex items-center gap-1 text-[10px] font-black tracking-[0.14em] ${tone === 'dark' ? 'text-[#c9bcff]' : 'text-[#5b45c9]'}`}><Smartphone size={12} />{t('eyebrow')}</p>;
}

/**
 * The compact invitation (result screen, home). Shown while the member has not joined; after a tap here it turns
 * into "신청 완료" in place. Signed out: "로그인하고 참여".
 */
function Compact({ tone, source, slim, className = '' }: { tone: Tone; source: SignupSource; slim?: boolean; className?: string }) {
  const t = useTranslations('AppTester');
  const { ready, configured, user, status } = useTester();
  const app = usePlayApp();
  const [justJoined, setJustJoined] = useState(false);
  if (app || !ready || !configured) return null;
  if (status.kind === 'joined') {
    // Joined just now here, or joined before and the test is open: the "신청 완료" state with its link.
    if (!justJoined && !(PLAY_TESTER_OPT_IN_URL && source !== 'result')) return null;
    return <div className={`${box(tone)} ${className}`}><Joined tone={tone} email={status.email} listed={status.listed} /></div>;
  }
  if (user && status.kind !== 'not') return null; // loading, or the feature is not live yet
  if (slim) {
    const head = (
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center"><TesterIcon size={40} /></span>
        <span className="min-w-0"><b className="block break-keep text-[13.5px] font-black leading-[18px] tracking-[-0.02em]">{t('stripTitle')}</b><span className="block break-keep text-[11px] font-bold leading-4 text-[#5b45c9]">{t('stripSub')}</span></span>
      </span>
    );
    return <div className={`${box(tone)} !rounded-[18px] !px-3.5 !py-3 ${className}`}><Consent tone={tone} source={source} head={head} onJoined={() => setJustJoined(true)} /></div>;
  }
  return (
    <div className={`${box(tone)} ${className}`}>
      <Eyebrow tone={tone} />
      <p className="mt-1 break-keep text-[15px] font-black leading-5 tracking-[-0.02em]">{t('title')}</p>
      <Benefits tone={tone} compact />
      <Consent tone={tone} source={source} onJoined={() => setJustJoined(true)} />
    </div>
  );
}

export function AppTesterCard({ className }: { className?: string }) {
  return <Compact tone="dark" source="result" className={className} />;
}

export function AppTesterStrip({ className }: { className?: string }) {
  return <Compact tone="light" source="other" slim className={className} />;
}

/** Game pages (and their rooms): the popup never covers a game in progress. */
function onGamePage(path: string) {
  return path !== '/' && ['/hell', ...GAMES.map((g) => g.href)].some((href) => href !== '/' && (path === href || path.startsWith(`${href}/`)));
}

// Read once per page load: "로그인하고 참여" was tapped just before the sign-in redirect.
let pendingOnce: boolean | null = null;
const pendingAfterSignIn = () => (pendingOnce ??= takePending());

/** Once after sign-in (or right after "로그인하고 참여"), off game pages. */
export function AppTesterPopup() {
  const t = useTranslations('AppTester');
  const { user, nicknameSet, status } = useTester();
  const app = usePlayApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const eligible = !!user && !app && status.kind === 'not' && nicknameSet !== false
    && (pendingAfterSignIn() || (popupDue() && !onGamePage(path)));
  useEffect(() => {
    if (!eligible || open) return;
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [eligible, open]);
  if (!open || (status.kind !== 'not' && status.kind !== 'joined')) return null;
  // Joined here while the test is open: <AppTesterInstallPopup /> takes over with the install steps.
  if (status.kind === 'joined' && status.listed && PLAY_TESTER_OPT_IN_URL) return null;

  const later = () => { dismissPopup(); setOpen(false); };
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t('title')} data-tester-recruit className="fixed inset-0 z-[65] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4">
      <section className="w-full max-w-md rounded-t-[24px] bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:rounded-[24px] sm:p-6">
        {status.kind === 'joined' ? (
          <>
            <Joined tone="light" email={status.email} listed={status.listed} />
            <button type="button" onClick={() => setOpen(false)} className="mt-4 flex w-full items-center justify-center rounded-full bg-[#17201e] py-3 text-sm font-black text-white">{t('ok')}</button>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><Eyebrow tone="light" /><h3 className="mt-1.5 break-keep text-xl font-black leading-7 tracking-[-0.03em]">{t('title')}</h3></div>
              <div className="flex shrink-0 items-start">
                <span className="mt-1 drop-shadow-[0_6px_14px_rgba(91,69,201,.35)]"><TesterIcon size={72} /></span>
                <button type="button" onClick={later} className="-mr-2 -mt-1 rounded-md p-2 text-black/35 hover:text-black" aria-label={t('later')}><X size={16} /></button>
              </div>
            </div>
            <p className="mt-1 break-keep text-[13px] leading-5 text-black/55">{t('lead')}</p>
            <Benefits tone="light" />
            <Consent tone="light" source="other"
              later={<button type="button" onClick={later} className="shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold text-black/45 hover:text-black">{t('later')}</button>} />
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}

/** Records page: the member's tester status, the withdraw control, or the invitation. */
export function AppTesterSettings({ className = '' }: { className?: string }) {
  const t = useTranslations('AppTester');
  const { uid, status } = useTester();
  const app = usePlayApp();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!uid || status.kind === 'loading' || status.kind === 'unavailable') return null;
  if (status.kind === 'not') {
    if (left) return <p className={`rounded-[20px] border border-black/10 bg-white p-4 text-xs font-bold text-black/55 ${className}`}>{t('withdrawn')}</p>;
    return app ? null : <Compact tone="light" source="records" className={className} />;
  }
  const leave = async () => {
    setBusy(true); setFailed(false);
    const ok = await leaveTester(uid);
    setBusy(false);
    if (ok) { setLeft(true); refreshStoneChoices(); window.dispatchEvent(new Event('puzzlthink:icons-changed')); } else setFailed(true);
  };
  return (
    <div className={`${box('light')} ${className}`}>
      <Eyebrow tone="light" />
      <div className="mt-1.5"><Joined tone="light" email={status.email} listed={status.listed} /></div>
      <div className="mt-3 border-t border-black/[0.07] pt-3">
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-keep text-[12px] font-bold text-black/60">{t('withdrawConfirm')}</p>
            <button type="button" disabled={busy} onClick={leave} className="inline-flex items-center gap-1 rounded-full bg-[#e5484d] px-3.5 py-1.5 text-[12px] font-black text-white disabled:opacity-40">{busy ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}{t('withdraw')}</button>
            <button type="button" onClick={() => setConfirm(false)} className="rounded-full px-3 py-1.5 text-[12px] font-bold text-black/45">{t('cancel')}</button>
          </div>
        ) : <button type="button" onClick={() => setConfirm(true)} className="text-[12px] font-bold text-black/45 underline underline-offset-2 hover:text-black">{t('withdrawAsk')}</button>}
        {failed && <p className="mt-1.5 text-[11px] font-bold text-[#e5484d]">{t('failed')}</p>}
      </div>
    </div>
  );
}

// ── Install (members who joined, once the closed test is open) ───────────────────────────────────────────────────

/** True for a member who joined as a tester while the closed test is open, outside the Play app. */
export function useTesterInstall() {
  const { status } = useTester();
  const app = usePlayApp();
  return !!PLAY_TESTER_OPT_IN_URL && !app && status.kind === 'joined' && status.listed;
}

const openInstall = () => window.dispatchEvent(new Event(TESTER_INSTALL_OPEN_EVENT));

/**
 * The header's 자율 후원 place for testers: "테스트 앱 설치". On Android it opens the Play opt-in page; elsewhere it
 * explains that the test app is for Android phones. `full` is the phone menu's wide button.
 */
export function HeaderTesterButton({ full = false }: { full?: boolean }) {
  const t = useTranslations('AppTester');
  const [android] = useState(isAndroid);
  const cls = full
    ? 'flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#5b45c9] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#4a39a8]'
    : 'group relative flex h-10 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl bg-[#17113a] pl-1.5 pr-3 text-white shadow-[0_0_14px_rgba(124,92,255,.45),inset_0_0_10px_rgba(198,255,61,.12)] ring-1 ring-[#9b85ff]/70 transition hover:shadow-[0_0_22px_rgba(124,92,255,.75)]';
  const body = full ? <><Download size={15} />{t('headerInstall')}</> : <>
    <span className="shrink-0 transition group-hover:scale-110"><TesterIcon size={30} /></span>
    <span className="flex flex-col items-start leading-none">
      <span className="font-mono text-[9px] font-black tracking-[0.08em] text-[#c6ff3d]">PLAY TESTER</span>
      <span className="mt-[3px] text-[12px] font-black tracking-[-0.02em]">{t('headerInstall')}</span>
    </span>
  </>;
  return android
    ? <a href={PLAY_TESTER_OPT_IN_URL} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
    : <button type="button" onClick={openInstall} className={cls}>{body}</button>;
}

/** Another dialog is up (the nickname prompt, the "새 아이콘" celebration, the recruitment popup): wait for it. */
const otherDialogOpen = () => !!document.querySelector('[aria-labelledby="nickname-title"],[aria-labelledby="icon-unlock-title"],[data-tester-recruit]');

/**
 * Members who joined: on Android, the install steps on every visit (once per tab session, never over a game or
 * another dialog) until "이미 설치했어요"; elsewhere one line that the test app is for Android phones, once.
 * The header button opens it on demand.
 */
export function AppTesterInstallPopup() {
  const t = useTranslations('AppTester');
  const { nicknameSet } = useTester();
  const ready = useTesterInstall();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [android] = useState(isAndroid);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(TESTER_INSTALL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(TESTER_INSTALL_OPEN_EVENT, onOpen);
  }, []);
  const eligible = ready && !open && nicknameSet !== false && !onGamePage(path) && installPopupDue(android);
  useEffect(() => {
    if (!eligible) return;
    const timer = window.setTimeout(() => {
      if (otherDialogOpen()) { setRetry((n) => n + 1); return; }
      markInstallShown(android);
      setOpen(true);
    }, retry ? 1500 : 1800);
    return () => window.clearTimeout(timer);
  }, [eligible, retry, android]);
  if (!open || !ready) return null;

  const close = () => setOpen(false);
  const sheet = 'w-full max-w-md rounded-t-[24px] bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:rounded-[24px] sm:p-6';
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t('installTitle')} className="fixed inset-0 z-[65] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4">
      {android ? (
        <section className={sheet}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[10px] font-black tracking-[0.14em] text-[#5b45c9]"><Smartphone size={12} />{t('installEyebrow')}</p>
              <h3 className="mt-1.5 break-keep text-xl font-black leading-7 tracking-[-0.03em]">{t('installTitle')}</h3>
              <p className="mt-1 break-keep text-[13px] leading-5 text-black/55">{t('installLead')}</p>
            </div>
            <div className="flex shrink-0 items-start">
              <span className="mt-1 drop-shadow-[0_6px_14px_rgba(91,69,201,.35)]"><TesterIcon size={68} /></span>
              <button type="button" onClick={close} className="-mr-2 -mt-1 rounded-md p-2 text-black/35 hover:text-black" aria-label={t('installLater')}><X size={16} /></button>
            </div>
          </div>
          <ol className="mt-4 space-y-2.5">
            {([['installStep1', 'installStep1Desc'], ['installStep2', 'installStep2Desc']] as const).map(([title, desc], i) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-black/[0.07] bg-white p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b45c9] text-[13px] font-black text-white">{i + 1}</span>
                <span className="min-w-0"><b className="block text-sm font-black">{t(title)}</b><span className="mt-0.5 block break-keep text-[12px] leading-[18px] text-black/55">{t(desc)}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex gap-2 rounded-2xl bg-[#fff6dc] px-3 py-2.5 text-[12px] font-bold leading-[18px] text-[#7a5200]"><BadgeCheck size={15} className="mt-px shrink-0" /><span className="break-keep">{t('installKeep')}</span></p>
          <div className="mt-4 flex gap-2">
            <a href={PLAY_TESTER_OPT_IN_URL} target="_blank" rel="noopener noreferrer" onClick={close}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#5b45c9] px-4 py-3 text-[14px] font-black text-white shadow-[0_6px_18px_rgba(91,69,201,.35)] transition active:scale-[.98]"><Download size={15} />{t('installGo')}</a>
            <button type="button" onClick={close} className="shrink-0 rounded-full px-4 py-3 text-[13px] font-bold text-black/45 hover:text-black">{t('installLater')}</button>
          </div>
          <button type="button" onClick={() => { markInstalled(); close(); }} className="mx-auto mt-2 block text-[11.5px] font-bold text-black/40 underline underline-offset-2 hover:text-black">{t('installDone')}</button>
        </section>
      ) : (
        <section className={`${sheet} flex items-center gap-3`}>
          <span className="shrink-0"><TesterIcon size={44} /></span>
          <p className="min-w-0 flex-1 break-keep text-[13px] font-bold leading-5 text-black/70">{t('installAndroidOnly')}</p>
          <button type="button" onClick={close} className="shrink-0 rounded-full bg-[#17201e] px-4 py-2.5 text-[13px] font-black text-white">{t('ok')}</button>
        </section>
      )}
    </div>,
    document.body,
  );
}
