"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, DoorOpen, Loader2, Trophy, Users } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import StoneAvatar from '@/components/StoneAvatar';
import { markSignupSource } from '@/lib/signupSource';
import { type LiarRankRow, LIAR_ACCENT, createLiarRoom, isLiarCode, liarMyStats, liarRanking, myName } from '@/lib/hiddenWordLiar';
import { CrownStone } from '@/components/CrownIcons';
import { LiarStone } from './LiarArt';
import { useLiarQueue } from './LiarQueue';

const T = {
  ko: {
    back: '홈', title: '히든 워드: 라이어', tag: '한 명만 다른 단어를 받았어요. 본인도 몰라요.',
    sub: '돌아가며 명사 하나씩 말하면 정답과의 유사도가 옆에 떠요. 숫자와 말솜씨로 라이어를 찾아내세요. 4~10명.',
    queueTitle: '공개방 신청', queueDesc: '신청해 두고 다른 게임을 하고 있어도 돼요. 사람이 모이면 어디서든 팝업으로 알려드려요.',
    queueBtn: '🎭 라이어 게임 신청', queueing: (n: number) => `대기 중 · ${n}명 기다리는 중`, cancel: '신청 취소', loginNeeded: '로그인하고 신청하기',
    friendTitle: '친구방', friendDesc: '링크나 카카오톡으로 친구를 불러 4~10명이 함께.', create: '친구방 만들기', joinPh: '방 코드 5자리', join: '입장',
    loginFriend: '로그인하고 방 만들기', rankTitle: '라이어 랭킹', rankNote: '승점 = 라이어로 승리 ×3 + 플레이어로 승리 ×1',
    liarW: (n: number) => `라이어로 ${n}승`, citW: (n: number) => `플레이어로 ${n}승`, mine: '내 기록', none: '아직 기록이 없어요. 첫 1위가 되어 보세요!',
    rewards: '보상', rewardLiar: '라이어로 승리 피스 3개', rewardCit: '플레이어로 승리 피스 1개', iconLiar: '라이어로 첫 승리 시 라이어 아이콘', iconCrown: '랭킹 1위 왕관 아이콘',
    how: '이렇게 해요', rules: ['모두 같은 제시어를 받지만 한 명은 같은 묶음의 다른 단어를 받아요. 그 사람이 라이어인데, 본인도 몰라요.', '차례대로 명사 하나씩. 단서 옆에 시민 제시어와의 유사도가 떠요 (85 이상은 🔥85+).', '1바퀴가 돈 뒤부터 "지목하자 / 한 바퀴 더" 다수결. 지목된 사람이 라이어면 정답을 한 번 맞힐 수 있어요.', '라이어가 지목을 피하거나 정답을 맞히면 라이어 승, 아니면 시민 승.', '🎭 가면: 한 판에 한 번, 내 단서 숫자를 끝날 때까지 숨겨요. 👁 아이콘을 눌러 의심 표시.'],
  },
  en: {
    back: 'Home', title: 'Hidden Word: Liar', tag: 'One player got a different word, and doesn\'t know it.',
    sub: 'Take turns saying one noun; each shows its similarity to the answer. Read the numbers and the talk to find the liar. 4–10 players.',
    queueTitle: 'Matchmaking', queueDesc: 'Sign up and keep playing other games. A popup finds you on any page when enough players are in.',
    queueBtn: '🎭 Join the liar queue', queueing: (n: number) => `In queue · ${n} waiting`, cancel: 'Cancel', loginNeeded: 'Sign in to join',
    friendTitle: 'Friend room', friendDesc: 'Invite 4–10 friends by link or KakaoTalk.', create: 'Create room', joinPh: '5-letter code', join: 'Join',
    loginFriend: 'Sign in to create', rankTitle: 'Liar ranking', rankNote: 'Points = liar wins ×3 + player wins ×1',
    liarW: (n: number) => `${n} as liar`, citW: (n: number) => `${n} as player`, mine: 'Me', none: 'No records yet. Be the first #1!',
    rewards: 'Rewards', rewardLiar: 'Liar win: 3 pieces', rewardCit: 'Player win: 1 piece', iconLiar: 'Liar icon for your first liar win', iconCrown: '#1 crown icon',
    how: 'How to play', rules: ['Everyone gets the same word except one player, who gets a look-alike and does not know it.', 'Say one noun each in turn; its similarity to the citizens\' word appears (85+ shows as 🔥85+).', 'After round 1, vote "accuse" or "one more round". An accused liar gets one guess at the word.', 'The liar wins by escaping the vote or guessing the word; otherwise the citizens win.', '🎭 Mask: once a game, hide your clue\'s number until the end. Tap players to mark 👁 suspicion.'],
  },
};

export default function LiarHome() {
  const locale = useLocale();
  const en = locale === 'en';
  const t = en ? T.en : T.ko;
  const { user, ready, nickname, signIn } = useAuth();
  const router = useRouter();
  const q = useLiarQueue();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<LiarRankRow[] | null>(null);
  const [stats, setStats] = useState<{ liarWins: number; citizenWins: number; games: number } | null>(null);
  const name = (nickname || myName(en ? 'Player' : '플레이어')).slice(0, 16);

  useEffect(() => { void liarRanking(20).then((r) => setRows(r ?? [])); }, []);
  useEffect(() => { if (user) { void liarMyStats().then(setStats); void q.refresh(); } }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const login = () => { markSignupSource('hidden_word_liar'); void signIn(); };
  const create = async () => {
    if (!user) return login();
    setBusy(true);
    const res = await createLiarRoom(name);
    setBusy(false);
    if (res?.code) router.push(`/hidden-word-liar/room/${res.code}`);
  };
  const queued = !!q.state?.queued;
  const card = 'rounded-3xl border border-white/10 bg-white/[.04] p-4';

  return (
    <div className="min-h-screen bg-[#0d0b14] pb-16 text-[#ece8f7]" style={{ backgroundImage: 'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(150,110,255,.25), transparent 70%)' }}>
      <header className="flex h-12 items-center gap-2 px-3">
        <Link href="/" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-bold text-white/70 hover:bg-white/10"><ArrowLeft size={17} />{t.back}</Link>
      </header>
      <main className="mx-auto grid max-w-[980px] gap-4 px-4 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div className="flex items-center gap-4">
            <LiarStone id="hero" name={t.title} size={112} />
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#c9b6ff]">PUZZLTHINK ORIGINAL</p>
              <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight">{t.title}</h1>
              <p className="mt-1 break-keep text-[14px] font-bold text-[#ffd36e]">{t.tag}</p>
            </div>
          </div>
          <p className="break-keep text-[14px] leading-relaxed text-white/70">{t.sub}</p>

          {/* matchmaking */}
          <div className={`${card} border-[#a98bff]/45 bg-[#1b1530]`}>
            <div className="flex items-center gap-2"><Users size={17} className="text-[#c9b6ff]" /><h2 className="text-[16px] font-black">{t.queueTitle}</h2></div>
            <p className="mt-1 break-keep text-[12px] text-white/60">{t.queueDesc}</p>
            {!ready ? <div className="mt-3 h-12" /> : !user
              ? <button type="button" onClick={login} className="mt-3 w-full rounded-2xl py-3.5 text-[16px] font-black text-[#1a1030]" style={{ background: LIAR_ACCENT }}>{t.loginNeeded}</button>
              : queued
                ? <div className="mt-3 flex items-center gap-2">
                    <span className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-[14px] font-black"><Loader2 size={16} className="animate-spin" />{t.queueing(q.state?.waiting ?? 1)}</span>
                    <button type="button" disabled={q.busy} onClick={() => { void q.leave(); }} className="rounded-2xl bg-white/5 px-4 py-3.5 text-[13px] font-bold text-white/70">{t.cancel}</button>
                  </div>
                : <button type="button" disabled={q.busy} onClick={() => { void q.join(name); }} className="mt-3 w-full rounded-2xl py-3.5 text-[16px] font-black text-[#1a1030] shadow-[0_0_24px_rgba(169,139,255,.45)] disabled:opacity-50" style={{ background: LIAR_ACCENT }}>{t.queueBtn}</button>}
          </div>

          {/* friend room */}
          <div className={card}>
            <div className="flex items-center gap-2"><DoorOpen size={17} className="text-[#c9b6ff]" /><h2 className="text-[16px] font-black">{t.friendTitle}</h2></div>
            <p className="mt-1 break-keep text-[12px] text-white/60">{t.friendDesc}</p>
            <button type="button" disabled={busy || !ready} onClick={create} className="mt-3 w-full rounded-2xl bg-white py-3 text-[15px] font-black text-[#241457] disabled:opacity-50">{user || !ready ? t.create : t.loginFriend}</button>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toLowerCase(); if (isLiarCode(c)) router.push(`/hidden-word-liar/room/${c}`); }}>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5))} placeholder={t.joinPh}
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 font-mono text-[16px] uppercase tracking-[0.3em] outline-none" />
              <button type="submit" disabled={!isLiarCode(code.toLowerCase())} className="rounded-xl bg-white/10 px-4 text-[14px] font-bold disabled:opacity-40">{t.join}</button>
            </form>
          </div>

          <div className={card}>
            <h2 className="text-[15px] font-black">{t.how}</h2>
            <ol className="mt-2 space-y-1.5 text-[13px] text-white/75">
              {t.rules.map((r, i) => <li key={r} className="flex gap-2 break-keep"><span className="font-black text-[#c9b6ff]">{i + 1}</span>{r}</li>)}
            </ol>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className={card}>
            <h2 className="text-[15px] font-black">{t.rewards}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] font-bold text-white/75">
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2"><LiarStone id="reward" name={t.iconLiar} size={64} /><span className="break-keep">{t.iconLiar}</span></div>
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2"><CrownStone id="crown" name={t.iconCrown} size={64} game="hidden_word_liar" /><span className="break-keep">{t.iconCrown}</span></div>
            </div>
            <p className="mt-2 text-[12px] text-white/70">· {t.rewardLiar}<br />· {t.rewardCit}</p>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2"><Trophy size={16} className="text-[#ffd36e]" /><h2 className="text-[15px] font-black">{t.rankTitle}</h2></div>
            <p className="mt-0.5 text-[10px] text-white/45">{t.rankNote}</p>
            {stats && stats.games > 0 && <p className="mt-2 rounded-xl bg-[#a98bff]/15 px-3 py-2 text-[12px] font-bold">{t.mine}: {t.liarW(stats.liarWins)} · {t.citW(stats.citizenWins)}</p>}
            {!rows ? <div className="mt-3 flex justify-center"><Loader2 size={16} className="animate-spin text-white/40" /></div>
              : rows.length === 0 ? <p className="mt-3 text-[12px] text-white/50">{t.none}</p>
              : <ol className="mt-2 divide-y divide-white/5">
                  {rows.map((r) => (
                    <li key={`${r.rank}-${r.nickname}`} className={`flex items-center gap-2 py-1.5 ${r.is_me ? 'text-[#ffe9a8]' : ''}`}>
                      <span className="w-6 text-center font-mono text-[12px] font-black text-white/60">{r.rank}</span>
                      <StoneAvatar name={r.nickname} size={26} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{r.nickname}</span>
                      <span className="text-right text-[10px] leading-tight text-white/60">{t.liarW(r.liar_wins)}<br />{t.citW(r.citizen_wins)}</span>
                    </li>
                  ))}
                </ol>}
          </div>
        </aside>
      </main>
    </div>
  );
}
