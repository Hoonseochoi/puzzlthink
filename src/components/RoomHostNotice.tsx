"use client";

import { useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { Crown } from 'lucide-react';
import { hostNoticesServer, hostNoticesSnapshot, subscribeHostNotices } from '@/lib/roomHost';

/** Top-center toast when a room's host left and someone else took over (see useRealtimeRoom). */
export default function RoomHostNotice() {
  const notices = useSyncExternalStore(subscribeHostNotices, hostNoticesSnapshot, hostNoticesServer);
  const en = useLocale() === 'en';
  if (!notices.length) return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-36 z-[61] flex flex-col items-center gap-2 px-4">
      {notices.map((n) => (
        <div key={n.id} className="flex max-w-[460px] animate-[roomAlertIn_.25s_ease-out] items-start gap-2.5 rounded-2xl border border-[#ffd36b]/40 bg-[#121317]/95 px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,0,0,.5)] backdrop-blur">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffd36b]"><Crown size={13} className="text-black/80" /></span>
          <span className="break-keep">
            {en
              ? (n.mine ? 'The host left, so you are the host now.' : `The host left. ${n.name} is the host now.`)
              : (n.mine ? '방장이 나가서 내가 방장이 됐어요.' : `방장이 나가서 ${n.name}님이 방장이 됐어요.`)}
            {n.restarted && <span className="mt-0.5 block text-[12px] font-semibold text-white/60">{en ? 'Hidden cards left with the old host, so this hand starts over.' : '숨겨진 카드는 나간 방장만 알고 있어서, 이번 판은 새로 시작해요.'}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
