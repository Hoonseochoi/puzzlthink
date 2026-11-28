"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, ChevronRight, Loader2, Users } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import StoneAvatar from '@/components/StoneAvatar';
import { markSignupSource } from '@/lib/signupSource';
import { type LiarOpenRoom, type LiarRankRow, createLiarRoom, liarLobbyStats, liarRanking, myName } from '@/lib/hiddenWordLiar';
import { LiarStone } from './LiarArt';
import { useLiarQueue } from './LiarQueue';
import { liarCopy } from './copy';

const MEDAL = ['#ffd36e', '#d9dee8', '#e0a070'];
const KAKAO_ICON = <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden><path d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 6l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.3 0 .5.1.8.1 5 0 9-3.1 9-7s-4-7.3-9-7.3z" fill="#191600" /></svg>;

/** The home preview tile: the masked stone over a little table of clue chips. */
export function LiarTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_30%,#3b2a75,#15111f_72%)]">
      <div className="w-[62%]"><LiarStone id="tile" name="" size={200} /></div>
      <div className="-mt-1 flex gap-1 text-[9px] font-black">
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[#241457]">공 <b className="text-[#ff9a3d]">72</b></span>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[#241457]">선수 <b className="text-[#ff5a3d]">85+</b></span>
      </div>
    </div>
  );
}

/**
 * 오늘의 추천 for 히든 워드: 라이어, in place of the plain hero link: the masked stone, the 공개방 top three, and two
 * actions right there: 「오픈방 참가 신청」 (joins the matchmaking queue; the site-wide popup calls the player in) and
 * 「친구랑 하기」 (opens a friend room, whose lobby leads with the KakaoTalk invite: on the mobile web
 * the Kakao share leaves the page, so it must not fire before the host is in their room). `web` = the wider home's larger card.
 */
export default function LiarHero({ web = false, todayLabel, onOpen }: { web?: boolean; todayLabel: string; onOpen?: () => void }) {
  const locale = useLocale();
  const en = locale === 'en';
  const t = liarCopy(locale);
  const { user, nickname, signIn } = useAuth();
  const router = useRouter();
  const q = useLiarQueue();
  const [rows, setRows] = useState<LiarRankRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void liarRanking(3).then((r) => setRows(r ?? [])); }, []);
  // 공개방: people waiting in the queue and games being played now, refreshed while the page is visible.
  const [stats, setStats] = useState<{ waiting: number; rooms: number; open?: LiarOpenRoom[] } | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => { if (document.visibilityState === 'visible') void liarLobbyStats().then((s) => { if (alive && s) setStats(s); }); };
    load();
    const id = window.setInterval(load, 20_000);
    return () => { alive = false; window.clearInterval(id); };
  }, [q.state?.queued]);
  useEffect(() => { if (user) void q.refresh(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = (nickname || myName(en ? 'Player' : '플레이어')).slice(0, 16);
  const queued = !!q.state?.queued;
  const login = () => { markSignupSource('hidden_word_liar'); void signIn(); };

  const joinQueue = () => { if (!user) return login(); if (!queued) void q.join(name); };
  const playFriends = async () => {
    if (!user) return login();
    setBusy(true);
    const res = await createLiarRoom(name);
    setBusy(false);
    if (!res?.code) return;
    onOpen?.();
    router.push(`/hidden-word-liar/room/${res.code}`);
  };

  const top = (rows ?? []).filter((r) => r.rank <= 3);
  return (
    <div className={`relative overflow-hidden text-white ${web ? 'flex min-h-[318px] items-center gap-6 rounded-[28px] p-6 lg:min-h-[384px] lg:rounded-[32px] lg:p-9' : 'rounded-[26px] p-4'}`}
      style={{ background: 'radial-gradient(120% 90% at 0% 0%, #d9c8ff 0%, transparent 50%), radial-gradient(90% 80% at 100% 100%, #241457 0%, transparent 60%), linear-gradient(135deg, #8d6cf0 0%, #2a1a5e 100%)' }}>
      <span className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1.4px)] [background-size:14px_14px] [mask-image:linear-gradient(115deg,transparent_25%,#000_95%)]" />
      <span className="home-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {stats && (
        <div className={`absolute z-[1] flex flex-col items-end gap-1 ${web ? 'right-5 top-5 lg:right-7 lg:top-7' : 'right-3 top-3'}`}>
          <span className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] font-black backdrop-blur-sm">
            <Users size={11} className="text-[#d9c8ff]" />{en ? `${stats.waiting} waiting` : `신청 ${stats.waiting}명`}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] font-black backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">{stats.rooms > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3fd67a] opacity-70" />}<span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${stats.rooms > 0 ? 'bg-[#3fd67a]' : 'bg-white/40'}`} /></span>
            {en ? `${stats.rooms} games live` : `진행 중 ${stats.rooms}방`}
          </span>
        </div>
      )}
      <div className="relative min-w-0 flex-1">
        <div className={`flex flex-wrap items-center gap-1.5 ${web ? '' : 'pr-[92px]'}`}>
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-black tracking-[0.12em]">🔥 {todayLabel}</span>
          <span className="rounded-full bg-[#ff4d5e] px-2 py-1 text-[10px] font-black tracking-[0.08em]">NEW</span>
          <span className="rounded-full bg-[#17201e] px-2 py-1 text-[9.5px] font-black tracking-[0.14em] text-[#ffd36e]">PUZZLTHINK ORIGINAL</span>
        </div>
        <div className={`mt-2 flex items-center gap-3 ${web ? '' : ''}`}>
          {!web && <span className="home-float -my-2 shrink-0"><LiarStone id="hero-app" name="" size={92} /></span>}
          <div className="min-w-0">
            <Link href="/hidden-word-liar" onClick={onOpen} className="flex items-center gap-1">
              <b className={`block break-keep font-black leading-[1.05] tracking-[-0.05em] drop-shadow-sm ${web ? 'text-[34px] lg:text-[46px]' : 'text-[25px]'}`}>{t.title}</b>
              <ChevronRight size={web ? 26 : 20} className="shrink-0 opacity-70" />
            </Link>
            <span className={`mt-1 block break-keep font-bold text-white/85 ${web ? 'text-[13px] lg:text-[15px]' : 'text-[11.5px] leading-[15px]'}`}>
              {en ? 'One player got a different word and doesn\'t know it. 4–10 players.' : '한 명만 다른 단어를 받았어요. 본인도 몰라요. 4~10명 파티 게임.'}
            </span>
          </div>
        </div>
        {top.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-[3px]">
            {top.map((e, i) => (
              <span key={e.rank} className="flex items-center gap-1.5 text-[11px] font-black">
                <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-[9px] text-black/70" style={{ background: MEDAL[i] }}>{i + 1}</span>
                <StoneAvatar name={e.nickname} size={16} />
                <span className="min-w-0 max-w-[110px] truncate">{e.nickname}</span>
                <span className="shrink-0 font-bold text-white/70">{en ? `${e.liar_wins} liar · ${e.citizen_wins} player` : `라이어 ${e.liar_wins}승 · 플레이어 ${e.citizen_wins}승`}</span>
              </span>
            ))}
          </div>
        )}
        <div className={`mt-3 grid gap-2 ${web ? 'max-w-[440px] grid-cols-2' : 'grid-cols-2'}`}>
          <button type="button" disabled={q.busy} onClick={joinQueue}
            className={`flex items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-[13px] font-black active:scale-[.98] disabled:opacity-60 ${queued ? 'bg-white/15 text-white ring-1 ring-white/40' : 'bg-white text-[#2a1a5e]'}`}>
            {queued ? <Check size={15} strokeWidth={3} className="text-[#3fd67a]" /> : <Users size={14} />}
            <span className="truncate">{queued ? (en ? 'Signed up' : '참가 신청 완료') : (en ? 'Join open room' : '오픈방 참가 신청')}</span>
          </button>
          <button type="button" disabled={busy} onClick={playFriends}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#FEE500] px-2 py-3 text-[13px] font-black text-[#191600] active:scale-[.98] disabled:opacity-60">
            {busy ? <Loader2 size={14} className="animate-spin" /> : KAKAO_ICON}<span className="truncate">{en ? 'Play with friends' : '친구랑 하기'}</span>
          </button>
        </div>
        {queued && (
          <p className="mt-1.5 break-keep text-[10.5px] font-bold leading-[14px] text-white/80">
            {en ? 'Play anything meanwhile: a popup calls you when enough players gather. ' : '다른 게임 하고 있어도 돼요. 인원이 모이면 팝업으로 알려 드려요. '}
            <button type="button" onClick={() => void q.leave()} disabled={q.busy} className="font-black text-white/55 underline underline-offset-2">{en ? 'Cancel' : '신청 취소'}</button>
          </p>
        )}
        {/* tables that called for players (초대하기): straight in */}
        {!!stats?.open?.length && (
          <div className={`mt-2 flex flex-col gap-1.5 ${web ? 'max-w-[440px]' : ''}`}>
            {stats.open.slice(0, 2).map((o) => (
              <button key={o.code} type="button" onClick={() => { if (!user) return login(); onOpen?.(); router.push(`/hidden-word-liar/room/${o.code}`); }}
                className="flex items-center gap-2 rounded-xl bg-[#ffd36e] px-3 py-2 text-left text-[12.5px] font-black text-[#241457] shadow-[0_6px_20px_rgba(255,211,110,.35)] active:scale-[.98]">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5a3d] opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5a3d]" /></span>
                <span className="flex-1">{en ? `Join now · ${o.seats} seat${o.seats > 1 ? 's' : ''} free (${o.players} playing)` : `지금 바로 참가 · ${o.seats}석 남음 (${o.players}명 참가 중)`}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        )}
        {!user && <p className="mt-1.5 text-[10px] font-bold text-white/60">{en ? 'Sign in with Google to play.' : '구글 로그인 후 바로 시작해요.'}</p>}
      </div>
      {web && <span className="home-float relative shrink-0 rotate-[4deg]"><LiarStone id="hero-web" name="" size={230} /></span>}
    </div>
  );
}
