"use client";

import { useTranslations } from 'next-intl';
import { Bot } from 'lucide-react';
import { ranking } from '@/lib/heavy13';
import type { H13Room } from '@/lib/heavy13Room';

export default function Heavy13Result({ room, mySeat, onAgain, waitingLabel }: { room: H13Room; mySeat: number | null; onAgain?: () => void; waitingLabel?: string }) {
  const t = useTranslations('Heavy13');
  const order = ranking(room.game);
  const players = room.game.players;
  // Players with equal penalties and equally recent last penalty share a rank (e.g. several 1st places).
  const rankOf = (s: number) => 1 + order.filter((o) => players[o].penalty < players[s].penalty || (players[o].penalty === players[s].penalty && players[o].lastPenaltyAt < players[s].lastPenaltyAt)).length;
  const name = (s: number) => (s === mySeat ? t('you') : room.seats[s]?.name ?? '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-[#e6c48a]/30 bg-[#14161b] p-6 shadow-[0_0_80px_rgba(230,196,138,.15)]">
        <p className="text-center text-[10px] font-black tracking-[0.3em] text-[#e6c48a]">FINAL</p>
        <h2 className="mt-1 text-center text-2xl font-black">{mySeat !== null ? t('yourRank', { n: rankOf(mySeat) }) : t('finished')}</h2>
        <ol className="mt-5 space-y-1.5">
          {order.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm ${s === mySeat ? 'bg-white/10' : 'bg-white/[0.03]'}`}>
              <span className={`w-6 font-mono font-black ${rankOf(s) === 1 ? 'text-[#e6c48a]' : i >= 5 ? 'text-[#ff8a7a]' : 'text-white/50'}`}>{rankOf(s)}</span>
              <span className="flex min-w-0 flex-1 items-center gap-1 truncate font-bold">{room.ai[s] && <Bot size={12} className="text-white/40" />}{name(s)}</span>
              {rankOf(s) === 1 && <span className="rounded bg-[#e6c48a] px-1.5 text-[9px] font-black text-[#2a2118]">{t('winner')}</span>}
              {i >= 5 && <span className="rounded bg-[#f0524f]/80 px-1.5 text-[9px] font-black text-white">{t('eliminated')}</span>}
              <span className="font-mono font-black text-[#ff8a7a]">{room.game.players[s].penalty}</span>
            </li>
          ))}
        </ol>
        {onAgain ? <button onClick={onAgain} className="mt-5 w-full rounded-[12px] bg-[#e6c48a] py-3 text-sm font-black text-[#2a2118]">{t('playAgain')}</button> : <p className="mt-5 text-center text-xs text-white/45">{waitingLabel}</p>}
      </div>
    </div>
  );
}
