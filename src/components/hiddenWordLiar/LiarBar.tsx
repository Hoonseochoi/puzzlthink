"use client";

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/components/AuthProvider';
import { myName } from '@/lib/hiddenWordLiar';
import { LiarStone } from './LiarArt';
import { useLiarQueue } from './LiarQueue';

/**
 * The home's 라이어 게임 신청 bar (under the 오픈 대전 bar): one tap puts a signed-in player in the matchmaking queue,
 * and the site-wide popup (LiarQueueListener) calls them in when enough players are waiting. Signed out, it opens the game page.
 */
export default function LiarBar({ className = '' }: { className?: string }) {
  const en = useLocale() === 'en';
  const { user, nickname } = useAuth();
  const q = useLiarQueue();
  const queued = !!q.state?.queued;
  useEffect(() => { if (user) void q.refresh(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = (nickname || myName(en ? 'Player' : '플레이어')).slice(0, 16);
  return (
    <div className={`flex h-12 items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#2c1f5c_0%,#120e22_80%)] py-1 pl-1.5 pr-1 text-white ${className}`}>
      <Link href="/hidden-word-liar" className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="-my-2 shrink-0"><LiarStone id="bar" name="" size={40} /></span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-black leading-4">{en ? 'Hidden Word: Liar' : '히든 워드: 라이어'} <span className="rounded bg-[#ff5a3d] px-1 text-[9px] align-middle">NEW</span></span>
          <span className="block truncate text-[10.5px] font-bold leading-4 text-white/60">{queued ? (en ? 'Signed up · a popup calls you when players gather' : '참가 신청 완료 · 인원이 모이면 팝업으로 알려 드려요') : (en ? '4–10 players · find the one liar' : '4~10명 · 단 한 명의 라이어를 찾아라')}</span>
        </span>
      </Link>
      {!user
        ? <Link href="/hidden-word-liar" className="shrink-0 rounded-[10px] bg-[#a98bff] px-3 py-1.5 text-[12px] font-black text-[#1a1030]">{en ? 'Play' : '게임 신청'}</Link>
        : queued
          ? <button type="button" disabled={q.busy} onClick={() => { void q.leave(); }} className="flex shrink-0 items-center gap-1 rounded-[10px] bg-white/10 px-2.5 py-1.5 text-[12px] font-black"><Check size={12} strokeWidth={3} className="text-[#3fd67a]" />{en ? 'Cancel' : '신청 취소'}</button>
          : <button type="button" disabled={q.busy} onClick={() => { void q.join(name); }} className="shrink-0 rounded-[10px] bg-[#a98bff] px-3 py-1.5 text-[12px] font-black text-[#1a1030] active:scale-95">{en ? 'Join queue' : '게임 신청'}</button>}
    </div>
  );
}
