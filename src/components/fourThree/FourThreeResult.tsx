"use client";

import { useTranslations } from 'next-intl';
import { Crown, Gem, LogOut, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BTN, BTN_ACCENT, KICKER, MODAL_BACKDROP } from '@/components/ui/gameUi';
import { type FtRoom, finalists, missionSucceeded, outcomeFor, playerRanking } from '@/lib/fourThreeRoom';
import { FtPiece } from './FourThreeParts';

/** End of the four rounds: did the mission hold, the players' pieces and who goes through. */
export default function FourThreeResult({ room, mySeat, onAgain, waitingLabel, exitPath }: {
  room: FtRoom; mySeat: number | null; onAgain?: () => void; waitingLabel?: string; exitPath: '/' | '/four-three';
}) {
  const t = useTranslations('FourThree');
  const ok = missionSucceeded(room);
  const through = finalists(room);
  const mine = mySeat !== null && mySeat !== room.guest ? outcomeFor(room, mySeat) : null;
  return (
    <div className={MODAL_BACKDROP}>
      <section role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-[18px] border border-white/10 bg-[#121217] p-6 text-center shadow-[0_0_80px_var(--accent-glow)]">
        {ok ? <ShieldCheck className="mx-auto text-[#3ddc97]" size={34} /> : <ShieldAlert className="mx-auto text-[#ff4d5e]" size={34} />}
        <p className={`${KICKER} mt-3`}>{t('resultKicker')}</p>
        <h2 className="mt-1 text-2xl font-black">{ok ? t('missionOk') : t('missionFail')}</h2>
        <p className="mt-1 break-keep text-xs text-white/50">{ok ? t('missionOkDesc') : t('missionFailDesc')}</p>
        <ol className="mt-5 space-y-1.5 text-left">
          {playerRanking(room).map((seat, i) => (
            <li key={seat} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${through.includes(seat) ? 'border-(--accent)/50 bg-(--accent)/10' : 'border-white/10 bg-white/[0.03]'}`}>
              <span className="w-4 font-mono text-xs font-black text-white/40">{i + 1}</span>
              <span className="h-7 w-7 shrink-0"><FtPiece color={seat} /></span>
              <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{room.seats[seat]?.name}{seat === mySeat && room.seats[seat]?.name !== t('you') ? ` (${t('you')})` : ''}</span>
              {through.includes(seat) && <span className="flex items-center gap-1 text-[10px] font-black text-(--accent)"><Crown size={11} />{t('through')}</span>}
              <span className="flex items-center gap-1 font-mono text-sm font-black"><Gem size={12} className="text-(--accent)" />{room.pieces[seat]}</span>
            </li>
          ))}
        </ol>
        {through.length > 2 && <p className="mt-2 text-[10px] text-white/40">{t('tieNote')}</p>}
        {mine && <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-black ${mine === 'win' ? 'bg-(--accent) text-(--accent-ink)' : 'bg-white/10 text-white/70'}`}>{mine === 'win' ? t('youWin') : ok ? t('youMissed') : t('youLose')}</p>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={exitPath} className={`py-3 ${BTN}`}><LogOut size={14} />{t('exit')}</Link>
          {onAgain ? <button type="button" onClick={onAgain} className={`py-3 ${BTN_ACCENT}`}><RotateCcw size={14} />{t('again')}</button>
            : <span className="flex items-center justify-center text-[11px] text-white/45">{waitingLabel}</span>}
        </div>
      </section>
    </div>
  );
}
