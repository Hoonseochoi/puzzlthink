"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Bot, Check, Copy, Crown, Loader2, Play, Share2, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, INPUT, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { usePiggyRoom } from '@/hooks/usePiggyRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { type PbAction, type PbLevel, ranking } from '@/lib/piggyBank';
import { reportGame } from '@/lib/stats';
import { GoldPig } from './PiggyParts';
import { PiggyAside, PiggyTable } from './PiggyTable';

const ACCENT = '#ffd84a';
const LEVELS: { id: PbLevel; label: string }[] = [{ id: 'easy', label: 'AI 쉬움' }, { id: 'normal', label: 'AI 보통' }, { id: 'hard', label: 'AI 어려움' }];

/** 돼지 저금통 with friends: 2–4 people, the host starts whenever ready and AI players fill the empty seats. */
export default function PiggyBankRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const [defaultName] = useState(() => `게스트 ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = usePiggyRoom(code, defaultName);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/piggy-bank/room/${code}`);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    return () => window.clearTimeout(slow);
  }, [code, locale]);

  // Record a finished game once for each person (first place counts as a win).
  useEffect(() => {
    const g = state?.game;
    if (!state || state.phase !== 'finished' || !g || mySeat === null) return;
    const place = ranking(g).indexOf(mySeat) + 1;
    reportGame(`piggy_bank-friend-${state.sid}`, 'piggy_bank', 'friend', place === 1 ? 'win' : 'loss',
      { place, score: g.players[mySeat].score, players: state.ai.filter((a) => !a).length });
  }, [state, mySeat]);

  const onAct = (action: PbAction) => dispatch({ t: 'act', action });
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 돼지 저금통', text: '돼지 저금통 한 판 하자!', url: shareUrl }); return; } catch { /* cancelled */ } }
    copyLink();
  };

  const seated = state ? state.seats.filter(Boolean).length : 0;
  const online = new Set(peers.map((p) => p.id));
  const notice = status === 'unconfigured' ? '실시간 서버 설정이 필요해요.' : status === 'error' ? '방에 연결하지 못했어요.'
    : !state && waitedLong ? '방을 찾을 수 없어요.' : state && !me?.isHost && !hostOnline ? '방장이 잠시 나갔어요. 방장 브라우저가 게임을 진행해요.' : null;

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#2a1d00'), backgroundImage: fog('90, 110, 210') }}>
      <RoomAlerts alerts={alerts} accent={ACCENT} joinText={(name) => `${name} 님이 들어왔어요`} leaveText={(name) => `${name} 님이 나갔어요`} />
      <GameHeader backHref="/piggy-bank" backLabel="돼지 저금통" title="돼지 저금통" subtitle={`ONLINE · ${code}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />방에 연결하는 중…</p>
            : <Link href="/piggy-bank" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>돼지 저금통으로 돌아가기</Link>}
        </main>
      ) : state.phase === 'lobby' || !state.game ? (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mx-auto max-w-[480px] space-y-5 py-2">
              <div className="flex justify-center gap-2">{[1, 2, 3, 4].map((n) => <GoldPig key={n} label={n} size={48} />)}</div>
              <h1 className="text-center text-xl font-black">친구를 초대하고 시작하세요</h1>
              <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                <p className={PANEL_TITLE}>초대 링크</p>
                <p className="mt-2 text-sm text-white/60">2~4명이 함께할 수 있어요. 빈자리는 시작할 때 AI가 채워요.</p>
                <InviteCode code={code} />
                <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                  <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                  <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? '복사됨' : '복사'}</button>
                  <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />공유</button>
                </div>
              </div>
              <div className={PANEL}>
                <p className={PANEL_TITLE}>AI 기억력 (빈자리)</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {LEVELS.map((l) => <button key={l.id} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', level: l.id })} className={`py-2.5 ${seg(state.level === l.id)} disabled:cursor-default`}>{l.label}</button>)}
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label="닉네임" className={INPUT} />
                <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>이름 변경</button>
              </form>
              {me?.isHost ? (
                <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3.5 text-sm`}>
                  <Play size={15} fill="currentColor" />{seated < 4 ? `시작하기 · 빈자리 ${4 - seated}명은 AI` : '시작하기'}
                </button>
              ) : <p className="text-center text-sm text-white/50">{mySeat === null ? '방이 가득 차서 관전으로 들어왔어요.' : '방장이 시작하기를 기다리는 중…'}</p>}
            </div>
          </section>
          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>플레이어</h2><span className={CHIP}><Users size={12} />{seated}/4</span></div>
              <ul className="space-y-2">
                {state.seats.map((s, i) => (
                  <li key={i} data-chat-seat={s?.id} className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm ${s ? 'border-white/10 bg-white/[.04]' : 'border-dashed border-white/10 text-white/35'}`}>
                    {s ? <span className={`h-2 w-2 rounded-full ${online.has(s.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} /> : <Bot size={13} />}
                    <span className="flex-1 truncate font-bold">{s ? `${s.name}${s.id === me?.id ? ' (나)' : ''}` : '빈자리 → AI'}</span>
                    {i === 0 && s && <Crown size={13} className="text-[#f2c14e]" />}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </main>
      ) : (
        <main className={MAIN}>
          <PiggyTable s={state.game} me={mySeat} seatIds={state.seats.map((seat) => seat?.id)} onAct={onAct} onAgain={me?.isHost ? () => dispatch({ t: 'start' }) : undefined} />
          <PiggyAside s={state.game} me={mySeat} onAct={onAct} />
        </main>
      )}
    </div>
  );
}
