"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings2, Swords, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { CERT_GAMES } from '@/lib/hardClear';
import { isGamePath } from '@/lib/siteBus';
import type { GameId } from '@/lib/stats';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { GAME_LABEL } from './HallCelebration';
import { Stone } from './StoneAvatar';
import { MY_ICON_ANCHOR } from './StonePicker';

export type CrownLoss = { game: string; taker: string };

/**
 * "○○ 1위를 △△님께 빼앗겼어요": the next time a player opens the site after someone took a game's #1 (and its icon)
 * from them. One game at a time, with two ways on: 복수하러 가기 (the game) and 아이콘 설정으로 가기 (기록실 › 내 프로필
 * 아이콘, since the lost icon is no longer worn). Not shown in the middle of a game: it waits for the next page outside one.
 */
export default function CrownLost() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [losses, setLosses] = useState<CrownLoss[]>([]);
  const inGame = isGamePath(pathname);
  const userId = user?.id;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId || inGame) return;
    let alive = true;
    // after the "new icon" popup had its turn
    const timer = window.setTimeout(async () => {
      const { data } = await supabase.rpc('my_crown_losses');
      const rows = (Array.isArray(data) ? (data as CrownLoss[]) : []).filter((r) => CERT_GAMES[r.game as GameId]);
      if (!alive || !rows.length) return;
      setLosses(rows);
      supabase.rpc('mark_crown_losses_seen', { p_games: rows.map((r) => r.game) }).then(() => {});
    }, 2600);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [userId, inGame]);

  if (!losses.length || !user) return null;
  return <CrownLostCard loss={losses[0]} more={losses.length - 1} onNext={() => setLosses((list) => list.slice(1))} onClose={() => setLosses([])} />;
}

export function CrownLostCard({ loss, more, onNext, onClose }: { loss: CrownLoss; more: number; onNext: () => void; onClose: () => void }) {
  const t = useTranslations('Icons');
  const tc = useTranslations('Common');
  const game = tc(GAME_LABEL[loss.game as GameId]);
  const href = CERT_GAMES[loss.game as GameId].href;
  return (
    <div className="fixed inset-0 z-[112] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="crown-lost-title">
      <div className="hall-pop relative my-auto w-full max-w-sm overflow-hidden rounded-[30px] border border-[#ff3355]/30 bg-gradient-to-b from-[#2a0c14] via-[#15090d] to-[#0a0708] px-6 pb-6 pt-7 text-center text-white shadow-[0_0_120px_rgba(255,51,85,.3),inset_0_1px_0_rgba(255,255,255,.1)]">
        <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ff3355]/25 blur-3xl" />
        <button type="button" onClick={more > 0 ? onNext : onClose} aria-label={t('close')} className="absolute right-4 top-4 z-10 text-white/40 hover:text-white"><X size={18} /></button>

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#ff3355] px-3 py-1 font-mono text-[10px] font-black tracking-[0.22em] text-white">#1 LOST</span>

        {/* my lost #1 icon, greyed and tipped over, with the new #1 above it */}
        <div className="relative mx-auto mt-5 flex h-[150px] w-[220px] items-end justify-center">
          <span className="absolute left-3 bottom-1 rotate-[-14deg] opacity-60 grayscale"><Stone name="me" size={84} icon={`c-${loss.game}`} /></span>
          <span className="absolute right-2 top-0 flex flex-col items-center drop-shadow-[0_0_22px_rgba(255,204,77,.45)]">
            <Stone name={loss.taker} size={104} icon={`c-${loss.game}`} />
          </span>
          <span className="absolute left-[74px] top-[52px] flex h-9 w-9 items-center justify-center rounded-full bg-[#ff3355] text-white shadow-[0_0_18px_rgba(255,51,85,.7)]"><Swords size={17} /></span>
        </div>
        <p className="relative mt-2 text-[13px] font-black text-[#ffe08a]">{t('crownLostNewTop', { name: loss.taker })}</p>

        <h2 id="crown-lost-title" className="relative mt-3 break-keep text-[23px] font-black leading-tight tracking-[-0.03em]">{t('crownLostTitle', { game, name: loss.taker })}</h2>
        <p className="relative mt-2 break-keep text-[12.5px] leading-5 text-white/60">{t('crownLostBody')}</p>
        {more > 0 && <p className="relative mt-1 text-[11px] font-bold text-white/40">{t('crownLostMore', { n: more })}</p>}

        <Link href={href} onClick={onClose} className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff3355] py-3 text-sm font-black text-white transition hover:brightness-110"><Swords size={16} />{t('crownLostRevenge')}</Link>
        <Link href={{ pathname: '/records', hash: MY_ICON_ANCHOR }} onClick={onClose} className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/80 transition hover:bg-white/10"><Settings2 size={14} />{t('crownLostIcons')}</Link>
        {more > 0 && <button type="button" onClick={onNext} className="relative mt-2 w-full py-1.5 text-[11px] font-bold text-white/45 hover:text-white/80">{t('crownLostNext')}</button>}
      </div>
    </div>
  );
}
