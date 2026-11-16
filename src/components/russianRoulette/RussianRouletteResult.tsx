"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, LockKeyhole } from 'lucide-react';
import { RR_MANIPULATE_AT } from '@/lib/russianRoulette';
import type { RussianRouletteRoom } from '@/lib/russianRouletteRoom';
import ResultActions from '../ResultActions';
import RouletteCharacter from './RouletteCharacter';
import { russianRouletteFiringDuration } from './firing';

export default function RussianRouletteResult({ room, mySeat, onAgain, waitingLabel, exitPath = '/' }: {
  room: RussianRouletteRoom; mySeat: number | null; onAgain?: () => void; waitingLabel?: string; exitPath?: string;
}) {
  const t = useTranslations('RussianRoulette');
  const shots = room.game.shots;
  const [ready, setReady] = useState(shots.length === 0);
  const [showManip, setShowManip] = useState(false);
  const manipHistory = room.game.manipHistory ?? [];
  const letter = (chamber: number) => String.fromCharCode(65 + (chamber % 6));
  const hit = mySeat !== null && room.game.hits.includes(mySeat);
  const name = (seat: number) => seat === mySeat ? t('you') : room.seats[seat]?.name ?? `P${seat + 1}`;

  useEffect(() => {
    if (!shots.length) return;
    const timer = window.setTimeout(() => setReady(true), russianRouletteFiringDuration(shots.length));
    return () => window.clearTimeout(timer);
  }, [shots.length]);

  if (!ready) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[26px] border border-[#65e5ff]/20 bg-[#101722] p-5 text-white shadow-[0_0_90px_rgba(101,229,255,.14)] sm:p-6">
        <p className="text-center text-[10px] font-black tracking-[0.28em] text-[#65e5ff]">FINAL TRIGGER</p>
        <p className="mt-2 text-center text-[9px] font-black tracking-[.2em] text-white/30">{t('resultReady')}</p>
        <h2 className={`mt-1 text-center text-3xl font-black ${hit ? 'text-[#ff7268]' : 'text-[#8ff0c6]'}`}>{mySeat === null ? t('gameOver') : hit ? t('eliminated') : t('survived')}</h2>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {room.seats.map((_, seat) => <div key={seat} className={`rounded-[12px] border p-2 text-center ${room.game.hits.includes(seat) ? 'border-[#ff7268]/35 bg-[#ff7268]/10' : 'border-[#8ff0c6]/20 bg-[#8ff0c6]/[0.05]'}`}><RouletteCharacter seat={seat} hit={room.game.hits.includes(seat)} label={name(seat)} className="mx-auto h-11" /><p className="mt-1 truncate text-[9px] font-bold text-white/55">{name(seat)}</p><p className={`mt-0.5 text-[8px] font-black ${room.game.hits.includes(seat) ? 'text-[#ff7268]' : 'text-[#8ff0c6]'}`}>{room.game.hits.includes(seat) ? t('hit') : t('safe')}</p></div>)}
        </div>
        <div className="mt-4 rounded-[12px] bg-black/25 p-3">
          <p className="text-[9px] font-black tracking-widest text-white/30">FIRING LOG</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{shots.map((shot, i) => <span key={i} className={`rounded-full px-2 py-1 font-mono text-[9px] font-black ${shot.fired ? 'bg-[#ff7268]/20 text-[#ff948d]' : 'bg-white/[0.05] text-white/30'}`}>{String.fromCharCode(65 + shot.chamber)} → {name(shot.target)} {shot.fired ? '●' : '○'}</span>)}</div>
        </div>
        <div className="mt-3 rounded-[12px] border border-[#a978ed]/25 bg-[#a978ed]/[0.06]">
          <button type="button" onClick={() => setShowManip((value) => !value)} aria-expanded={showManip} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-xs font-black text-[#d8baff]">
            <span className="flex items-center gap-2"><LockKeyhole size={14} />{t('revealManipulation')}</span>
            <ChevronDown size={15} className={`transition-transform ${showManip ? 'rotate-180' : ''}`} />
          </button>
          {showManip && <ol className="max-h-56 space-y-1.5 overflow-y-auto border-t border-[#a978ed]/20 px-3 py-2.5">
            {manipHistory.length === 0 ? <li className="text-[11px] text-white/40">{t('manipNone')}</li> : manipHistory.map((entry, i) => <li key={i} className={`flex gap-2 text-[11px] leading-5 ${entry.k === 'swap' ? 'font-black text-[#ffcf58]' : 'text-white/60'}`}>
              <span className="shrink-0 font-mono text-[9px] leading-5 text-white/30">R{entry.round}</span>
              {entry.k === 'fund'
                ? `${t('manipFund', { player: name(entry.seat), amount: entry.amount, pool: entry.pool, max: RR_MANIPULATE_AT })}${entry.lost ? ` · ${t('manipLost', { n: entry.lost })}` : ''}`
                : t('manipSwap', { player: name(entry.seat), a: letter(entry.pair), b: letter(entry.pair + 1) })}
            </li>)}
          </ol>}
        </div>
        <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/russian-roulette" exitPath={exitPath} primaryClass="rounded-[12px] bg-[#65e5ff] text-[#071016] hover:bg-[#a7efff]" />
      </div>
    </div>
  );
}
