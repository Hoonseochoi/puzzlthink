"use client";

import { useTranslations } from 'next-intl';
import { Bot } from 'lucide-react';
import { ranking } from '@/lib/heavy13';
import type { H13Room } from '@/lib/heavy13Room';
import ResultActions from '../ResultActions';
import { KICKER, MODAL, MODAL_BACKDROP, RESULT_PRIMARY, STEEL_TEXT } from '../ui/gameUi';

export default function Heavy13Result({ room, mySeat, onAgain, waitingLabel, exitPath }: { room: H13Room; mySeat: number | null; onAgain?: () => void; waitingLabel?: string; exitPath: string }) {
  const t = useTranslations('Heavy13');
  const order = ranking(room.game);
  const players = room.game.players;
  // Players with equal penalties and equally recent last penalty share a rank (e.g. several 1st places).
  const rankOf = (s: number) => 1 + order.filter((o) => players[o].penalty < players[s].penalty || (players[o].penalty === players[s].penalty && players[o].lastPenaltyAt < players[s].lastPenaltyAt)).length;
  const name = (s: number) => (s === mySeat ? t('you') : room.seats[s]?.name ?? '');
  return (
    <div className={MODAL_BACKDROP}>
      <div className={MODAL}>
        <p className={`${KICKER} tracking-[0.3em]`}>FINAL</p>
        <h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{mySeat !== null ? t('yourRank', { n: rankOf(mySeat) }) : t('finished')}</h2>
        <ol className="mt-5 space-y-1.5 text-left">
          {order.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${s === mySeat ? 'border-(--accent)/50 bg-white/[0.06]' : 'border-white/5 bg-white/[0.03]'}`}>
              <span className={`w-6 font-mono font-black ${rankOf(s) === 1 ? 'text-(--accent)' : i >= order.length - 2 ? 'text-[#ff8a7a]' : 'text-white/50'}`}>{rankOf(s)}</span>
              <span className="flex min-w-0 flex-1 items-center gap-1 truncate font-bold">{room.ai[s] && <Bot size={12} className="text-white/40" />}{name(s)}</span>
              {rankOf(s) === 1 && <span className="rounded-sm bg-(--accent) px-1.5 text-[9px] font-black text-(--accent-ink)">{t('winner')}</span>}
              {i >= 5 && <span className="rounded-sm bg-[#f0524f]/80 px-1.5 text-[9px] font-black text-white">{t('eliminated')}</span>}
              <span className="font-mono font-black text-[#ff8a7a]">{room.game.players[s].penalty}</span>
            </li>
          ))}
        </ol>
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/heavy13" exitPath={exitPath} primaryClass={RESULT_PRIMARY} />
      </div>
    </div>
  );
}
