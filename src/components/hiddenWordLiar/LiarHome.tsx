"use client";

import { type ReactNode, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, BookOpen, Check, Crown, Loader2, Trophy, Users } from 'lucide-react';
import GameUpdates from '@/components/GameUpdates';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import StoneAvatar from '@/components/StoneAvatar';
import { markSignupSource } from '@/lib/signupSource';
import { type LiarRankRow, LIAR_ACCENT, createLiarRoom, isLiarCode, liarMyStats, liarRanking, myName } from '@/lib/hiddenWordLiar';
import { CrownStone } from '@/components/CrownIcons';
import { LiarStone } from './LiarArt';
import { useLiarQueue } from './LiarQueue';
import LiarTutorial, { TutorialButton } from './LiarTutorial';
import { liarCopy } from './copy';

const T = {
  ko: {
    back: '홈', tag: '한 명만 다른 단어를 받았어요. 본인도 몰라요.',
    sub: '돌아가며 명사 하나씩. 단서 옆에 정답과의 유사도가 떠요. 숫자와 말솜씨로 단 한 명의 라이어를 찾으세요.',
    players: '4~10명', minutes: '한 판 4~8분', open: '공개방 · 친구방',
    queueBtn: '오픈방 참가 신청', queueing: '참가 신청 완료', queuedNote: '다른 게임 하고 있어도 돼요. 인원이 모이면 팝업으로 알려 드려요.', cancel: '신청 취소', friendBtn: '친구랑 하기',
    queueNote: '신청해 두고 다른 게임을 해도 돼요. 사람이 모이면 어디서든 팝업으로 불러요.',
    loginNote: '구글 로그인 후 바로 시작해요.', joinPh: '방 코드 5자리', join: '입장',
    today: (left: number, cap: number) => `오늘 남은 피스 ${left}/${cap}`,
    how: '이렇게 해요',
    steps: [
      { t: '제시어 확인', d: '모두 같은 단어, 한 명만 닮은 단어. 라이어도 자기가 라이어인 줄 몰라요.' },
      { t: '한 마디씩', d: '명사 하나를 말하면 정답과의 유사도가 옆에 떠요. 85 이상은 🔥85+로 가려져요.' },
      { t: '지목!', d: '아이콘을 눌러 투표. 지목된 라이어는 정답을 맞히면 역전승.' },
    ],
    rankTitle: '공개방 랭킹', rankNote: '공개방 판만 세요 · 승점 = 라이어 승 ×3 + 플레이어 승',
    liarW: (n: number) => `라이어 ${n}승`, citW: (n: number) => `플레이어 ${n}승`, mine: '내 공개방 기록', none: '아직 공개방 기록이 없어요. 첫 1위의 주인공이 되어 보세요!',
    rewards: '보상', rewardLiar: '라이어로 승리', rewardCit: '플레이어로 승리', pieces: (n: number) => `피스 ${n}개`, daily: '하루 7개까지 (공개방·친구방 합산)',
    iconLiar: '라이어로 첫 승리', iconCrown: '공개방 랭킹 1위', guide: '자세한 규칙과 공략',
  },
  en: {
    back: 'Home', tag: 'One player got a different word, and doesn\'t know it.',
    sub: 'One noun each, in turn. Each clue shows its similarity to the answer. Read the numbers and the talk to find the one liar.',
    players: '4–10 players', minutes: '4–8 min', open: 'Matchmaking · friends',
    queueBtn: 'Join open room', queueing: 'Signed up', queuedNote: 'Play anything meanwhile: a popup calls you when enough players gather.', cancel: 'Cancel', friendBtn: 'Play with friends',
    queueNote: 'Sign up and keep playing other games; a popup calls you in from any page.',
    loginNote: 'Sign in with Google to start.', joinPh: '5-letter code', join: 'Join',
    today: (left: number, cap: number) => `Pieces left today ${left}/${cap}`,
    how: 'How it works',
    steps: [
      { t: 'Check your word', d: 'Everyone shares a word except one look-alike. The liar doesn\'t know it.' },
      { t: 'One word each', d: 'Say a noun; its similarity to the answer appears. 85+ hides as 🔥85+.' },
      { t: 'Accuse!', d: 'Tap to vote. An accused liar can still win by guessing the word.' },
    ],
    rankTitle: 'Matchmaking ranking', rankNote: 'Matchmaking games only · points = liar wins ×3 + player wins',
    liarW: (n: number) => `${n} as liar`, citW: (n: number) => `${n} as player`, mine: 'My matchmaking record', none: 'No matchmaking records yet. Be the first #1!',
    rewards: 'Rewards', rewardLiar: 'Win as the liar', rewardCit: 'Win as a player', pieces: (n: number) => `${n} pieces`, daily: 'Up to 7 a day (both room kinds)',
    iconLiar: 'First liar win', iconCrown: 'Matchmaking #1', guide: 'Full rules and tips',
  },
};

/** Little drawings for the three how-to steps. */
function StepArt({ i }: { i: number }) {
  if (i === 0) return (
    <div className="flex items-center gap-1.5">
      <span className="rounded-lg bg-white px-2 py-1 text-[12px] font-black text-[#241457] shadow">냉면</span>
      <span className="rounded-lg bg-white px-2 py-1 text-[12px] font-black text-[#241457] shadow">냉면</span>
      <span className="rounded-lg bg-[#ff5a3d] px-2 py-1 text-[12px] font-black text-white shadow">김밥?</span>
    </div>
  );
  if (i === 1) return (
    <div className="flex items-center gap-1.5 text-[11px] font-black">
      <span className="rounded-full bg-white px-2 py-0.5 text-[#241457]">얼음물 <b className="text-[#ffb020]">65</b></span>
      <span className="rounded-full bg-white px-2 py-0.5 text-[#241457]">겨자 <b className="text-[#ff5a3d]">🔥85+</b></span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      {['#ff9ab8', '#7fd0ff', '#ffd36e'].map((c, k) => <span key={c} className={`h-6 w-6 rounded-full ring-2 ${k === 1 ? 'ring-[#ff5a3d]' : 'ring-white/30'}`} style={{ background: c }} />)}
      <span className="ml-1 rounded-full bg-[#ff5a3d] px-1.5 text-[10px] font-black text-white">🗳 3</span>
    </div>
  );
}

export default function LiarHome({ guide }: { guide?: ReactNode }) {
  const locale = useLocale();
  const en = locale === 'en';
  const t = en ? T.en : T.ko;
  const lc = liarCopy(locale);
  const { user, ready, nickname, signIn } = useAuth();
  const router = useRouter();
  const q = useLiarQueue();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<LiarRankRow[] | null>(null);
  const [stats, setStats] = useState<{ liarWins: number; citizenWins: number; games: number; piecesToday: number; dailyCap: number } | null>(null);
  const name = (nickname || myName(en ? 'Player' : '플레이어')).slice(0, 16);

  useEffect(() => { void liarRanking(20).then((r) => setRows(r ?? [])); }, []);
  useEffect(() => { if (user) { void liarMyStats().then((s) => setStats(s)); void q.refresh(); } }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const login = () => { markSignupSource('hidden_word_liar'); void signIn(); };
  const friends = async () => {
    if (!user) return login();
    setBusy(true);
    const res = await createLiarRoom(name);
    setBusy(false);
    if (!res?.code) return;
    router.push(`/hidden-word-liar/room/${res.code}`);
  };
  const queued = !!q.state?.queued;
  const card = 'rounded-[22px] border border-white/10 bg-white/[.04] p-4';

  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#ece8f7]" style={{ backgroundImage: 'radial-gradient(ellipse 90% 40% at 50% 0%, rgba(150,110,255,.32), transparent 70%)' }}>
      <header className="flex h-12 items-center gap-2 px-3">
        <Link href="/" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-bold text-white/70 hover:bg-white/10"><ArrowLeft size={17} />{t.back}</Link>
        <span className="flex-1" />
        <GameUpdates game="hidden_word_liar" />
      </header>
      <main className="mx-auto grid max-w-[980px] gap-4 px-4 pb-10 lg:grid-cols-[1fr_360px]">
        <section className="grid content-start gap-4">
          {/* hero */}
          <div className="relative overflow-hidden rounded-[28px] p-5" style={{ background: 'radial-gradient(120% 90% at 0% 0%, #cdb9ff 0%, transparent 50%), radial-gradient(90% 80% at 100% 100%, #1d1046 0%, transparent 60%), linear-gradient(135deg, #8d6cf0 0%, #2a1a5e 100%)' }}>
            <span className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1.4px)] [background-size:14px_14px] [mask-image:linear-gradient(115deg,transparent_25%,#000_95%)]" />
            <div className="relative flex items-center gap-3">
              <span className="home-float -my-3 shrink-0"><LiarStone id="hero" name={lc.title} size={104} /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-full bg-[#17201e] px-2 py-0.5 text-[9.5px] font-black tracking-[0.14em] text-[#ffd36e]">PUZZLTHINK ORIGINAL</span>
                  <span className="rounded-full bg-[#ff4d5e] px-2 py-0.5 text-[9.5px] font-black tracking-[0.08em] text-white">NEW</span>
                </div>
                <h1 className="mt-1.5 break-keep text-[27px] font-black leading-[1.05] tracking-[-0.04em] drop-shadow">{lc.title}</h1>
                <p className="mt-1 break-keep text-[13px] font-bold text-[#ffe9a8]">{t.tag}</p>
              </div>
            </div>
            <p className="relative mt-3 break-keep text-[13px] leading-relaxed text-white/85">{t.sub}</p>
            <div className="relative mt-2 flex flex-wrap gap-1.5 text-[10.5px] font-black">
              {[t.players, t.minutes, t.open].map((x) => <span key={x} className="rounded-full bg-black/25 px-2 py-0.5">{x}</span>)}
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <button type="button" disabled={!ready || q.busy} onClick={() => { if (!user) return login(); if (!queued) void q.join(name); }}
                className={`flex items-center justify-center gap-1.5 rounded-2xl px-2 py-3.5 text-[14px] font-black shadow-lg active:scale-[.98] disabled:opacity-60 ${queued ? 'bg-white/15 text-white ring-1 ring-white/40' : 'bg-white text-[#2a1a5e]'}`}>
                {queued ? <Check size={16} strokeWidth={3} className="text-[#3fd67a]" /> : <Users size={15} />}<span className="truncate">{queued ? t.queueing : t.queueBtn}</span>
              </button>
              <button type="button" disabled={!ready || busy} onClick={friends}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#FEE500] px-2 py-3.5 text-[14px] font-black text-[#191600] shadow-lg active:scale-[.98] disabled:opacity-60">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 6l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.3 0 .5.1.8.1 5 0 9-3.1 9-7s-4-7.3-9-7.3z" fill="#191600" /></svg>}
                <span className="truncate">{t.friendBtn}</span>
              </button>
            </div>
            <p className="relative mt-2 break-keep text-[10.5px] font-bold text-white/70">{ready && !user ? t.loginNote : queued ? <>{t.queuedNote} <button type="button" onClick={() => void q.leave()} disabled={q.busy} className="font-black text-white/55 underline underline-offset-2">{t.cancel}</button></> : t.queueNote}</p>
            {stats && <p className="relative mt-2 w-fit rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-black text-[#ffd36e]">🧩 {t.today(Math.max(0, stats.dailyCap - stats.piecesToday), stats.dailyCap)}</p>}
          </div>

          {/* join by code */}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toLowerCase(); if (isLiarCode(c)) router.push(`/hidden-word-liar/room/${c}`); }}>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5))} placeholder={t.joinPh}
              className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 font-mono text-[16px] uppercase tracking-[0.3em] outline-none placeholder:tracking-normal" />
            <button type="submit" disabled={!isLiarCode(code.toLowerCase())} className="rounded-2xl bg-white/10 px-5 text-[14px] font-black disabled:opacity-40">{t.join}</button>
          </form>

          {/* how it works */}
          <div className={card}>
            <h2 className="text-[16px] font-black">{t.how}</h2>
            <ol className="mt-3 grid gap-2.5">
              {t.steps.map((s, i) => (
                <li key={s.t} className="flex items-center gap-3 rounded-2xl bg-black/25 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-black text-[#1a1030]" style={{ background: LIAR_ACCENT }}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black">{s.t}</p>
                    <p className="mt-0.5 break-keep text-[12px] leading-snug text-white/65">{s.d}</p>
                    <div className="mt-2"><StepArt i={i} /></div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <TutorialButton className="rounded-xl bg-[#a98bff]/20 py-2.5 text-[12px] font-black text-[#d9ccff] ring-1 ring-[#a98bff]/40" />
              <a href="#guide" className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 py-2.5 text-[12px] font-bold text-white/75"><BookOpen size={14} />{t.guide}</a>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className={card}>
            <h2 className="text-[15px] font-black">{t.rewards}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] font-bold text-white/75">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2.5"><span className="text-[22px] font-black text-[#ffd36e]">+3</span><span>{t.rewardLiar}</span></div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2.5"><span className="text-[22px] font-black text-[#ffd36e]">+1</span><span>{t.rewardCit}</span></div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2"><LiarStone id="reward" name={t.iconLiar} size={60} /><span className="break-keep">{t.iconLiar}</span></div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2"><CrownStone id="crown" name={t.iconCrown} size={60} game="hidden_word_liar" /><span className="break-keep">{t.iconCrown}</span></div>
            </div>
            <p className="mt-2 text-center text-[11px] text-white/55">{t.daily}</p>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2"><Trophy size={16} className="text-[#ffd36e]" /><h2 className="text-[15px] font-black">{t.rankTitle}</h2></div>
            <p className="mt-0.5 text-[10px] text-white/45">{t.rankNote}</p>
            {stats && stats.games > 0 && <p className="mt-2 rounded-xl bg-[#a98bff]/15 px-3 py-2 text-[12px] font-bold">{t.mine}: {t.liarW(stats.liarWins)} · {t.citW(stats.citizenWins)}</p>}
            {!rows ? <div className="mt-3 flex justify-center"><Loader2 size={16} className="animate-spin text-white/40" /></div>
              : rows.length === 0 ? (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 p-4 text-center">
                  <Crown size={22} className="text-[#ffd36e]" />
                  <p className="break-keep text-[12px] text-white/60">{t.none}</p>
                </div>
              ) : <ol className="mt-2 divide-y divide-white/5">
                  {rows.map((r) => (
                    <li key={`${r.rank}-${r.nickname}`} className={`flex items-center gap-2 py-1.5 ${r.is_me ? 'text-[#ffe9a8]' : ''}`}>
                      <span className={`w-6 text-center font-mono text-[12px] font-black ${r.rank <= 3 ? 'text-[#ffd36e]' : 'text-white/60'}`}>{r.rank}</span>
                      <StoneAvatar name={r.nickname} size={26} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{r.nickname}</span>
                      <span className="text-right text-[10px] leading-tight text-white/60">{t.liarW(r.liar_wins)}<br />{t.citW(r.citizen_wins)}</span>
                    </li>
                  ))}
                </ol>}
          </div>
        </aside>
      </main>
      {guide}
      <LiarTutorial />
    </div>
  );
}
