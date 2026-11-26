"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Crown, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { rankImagePath, rankPath, rankSlug } from '@/lib/rankings';
import { type GameId, HALL_RANK_EVENT, type HallRankDetail } from '@/lib/stats';
import ShareButtons from './ShareButtons';
import { CelebrationSupport } from './SupportLink';

export const GAME_LABEL: Record<GameId, string> = { hidden_word: 'hiddenWord', hidden_word_plus: 'hiddenWordPlus', equation_signal: 'equationSignal', equation_tower: 'equationTower', gradation: 'gradation', card_janggi: 'cardJanggi', color_link_duel: 'colorLinkDuel', hit_stay: 'hitStay', time_auction: 'timeAuction', point_omok: 'pointOmok', merge2048: 'merge2048', magicswap: 'magicswap', four_three: 'fourThree', binairo: 'binairo', onestroke: 'onestroke', colorlink: 'colorlink', starbattle: 'starbattle', masyu: 'masyu', nonogram: 'nonogram', two_sided_poker: 'twoSidedPoker', monorail: 'monorail', flip_omok: 'flipOmok', nine_mens_morris: 'nineMensMorris', wallgo2: 'wallgo2', slitherlink: 'slitherlink', gyulhap: 'gyulhap', indian_poker: 'indianPoker', wallgo: 'wallgo', heavy13: 'heavy13', janggi: 'janggi', russian_janggi: 'russianJanggi', russian_roulette: 'russianRoulette', blind_gomoku: 'blindGomoku', laser_janggi: 'laserJanggi', nemo_count: 'nemoCount', black_white: 'blackWhite', black_white_2: 'blackWhite2', piggy_bank: 'piggyBank', hexagon: 'hexagon', sudoku: 'sudoku' };
const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = ['#ffd36e', '#ff6b4a', '#65e5ff', '#3ddc97', '#a978ed', '#ffffff', '#f2b84b'];

/** Full-screen confetti bursts from both lower corners, then a gentle rain from the top. */
export function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; };
    resize();
    window.addEventListener('resize', resize);

    type P = { x: number; y: number; vx: number; vy: number; w: number; h: number; rot: number; vr: number; color: string; life: number };
    const parts: P[] = [];
    const burst = (x: number, y: number, angle: number, n: number) => {
      for (let i = 0; i < n; i += 1) {
        const a = angle + (Math.random() - 0.5) * 0.9;
        const speed = 9 + Math.random() * 11;
        parts.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, w: 5 + Math.random() * 6, h: 8 + Math.random() * 8, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, color: COLORS[i % COLORS.length], life: 1 });
      }
    };
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const shots = [
      window.setTimeout(() => { burst(0, H(), -Math.PI / 3, 90); burst(W(), H(), (-2 * Math.PI) / 3, 90); }, 0),
      window.setTimeout(() => { burst(W() * 0.25, H(), -Math.PI / 2.4, 60); burst(W() * 0.75, H(), -Math.PI / 1.7, 60); }, 700),
      window.setTimeout(() => { burst(0, H() * 0.7, -Math.PI / 4, 70); burst(W(), H() * 0.7, (-3 * Math.PI) / 4, 70); }, 1500),
    ];
    let frame = 0;
    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      for (let i = parts.length - 1; i >= 0; i -= 1) {
        const p = parts[i];
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.vy > 0) p.life -= 0.006;
        if (p.life <= 0 || p.y > H() + 40) { parts.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 1.5);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
        ctx.restore();
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => { shots.forEach((s) => window.clearTimeout(s)); window.cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[101] h-full w-full" />;
}

/** "You made the Hall of Fame" popup with fireworks, shown when a saved win lifts the player into the top 3. */
export default function HallCelebration() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [shown, setShown] = useState<HallRankDetail | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    const onRank = (e: Event) => {
      const detail = (e as CustomEvent<HallRankDetail>).detail;
      timers.push(window.setTimeout(() => setShown(detail), detail.delayMs));
    };
    window.addEventListener(HALL_RANK_EVENT, onRank);
    return () => { window.removeEventListener(HALL_RANK_EVENT, onRank); timers.forEach((id) => window.clearTimeout(id)); };
  }, []);

  if (!shown) return null;
  const close = () => setShown(null);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="hall-congrats-title">
      <Fireworks />
      <div className="hall-pop relative w-full max-w-sm overflow-hidden rounded-[26px] border border-[#ffd36e]/40 bg-gradient-to-b from-[#2a210f] to-[#141109] p-7 text-center text-white shadow-[0_0_120px_rgba(255,211,110,.35)]">
        <button onClick={close} aria-label={t('hallCongratsClose')} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffd36e]/15 ring-1 ring-[#ffd36e]/40">
          <Crown size={34} className="text-[#ffd36e]" />
          <span className="absolute -bottom-1 -right-1 text-3xl">{MEDALS[shown.rank - 1] ?? '🏅'}</span>
        </div>
        <p className="mt-5 text-[10px] font-black tracking-[0.3em] text-[#ffd36e]">{t('hallCongratsEyebrow')}</p>
        <h2 id="hall-congrats-title" className="mt-1 text-2xl font-black tracking-tight">{t('hallCongratsTitle')}</h2>
        <p className="mt-3 inline-block rounded-full bg-[#ffd36e] px-4 py-1.5 text-sm font-black text-[#2a2118]">{t('hallCongratsRank', { game: t(GAME_LABEL[shown.game]), rank: shown.rank })}</p>
        <p className="mt-3 text-xs leading-5 text-white/60">{t('hallCongratsDesc')}</p>
        <div className="mt-6 grid gap-2">
          <ShareButtons path={rankPath(locale, shown.game)} imagePath={rankImagePath(shown.game, locale)} fileName="puzzlthink-hall.png" text={t('shareHallRank', { game: t(GAME_LABEL[shown.game]), rank: shown.rank })} />
          <CelebrationSupport place="hall" />
          <button onClick={() => { close(); router.push(`/ranking/${rankSlug(shown.game)}`); }} className="rounded-[12px] bg-[#ffd36e] py-3 text-sm font-black text-[#2a2118] hover:bg-[#ffe09a]">{t('hallCongratsView')}</button>
          <button onClick={close} className="rounded-[12px] border border-white/15 bg-white/5 py-3 text-xs font-bold text-white/75 hover:bg-white/10">{t('hallCongratsClose')}</button>
        </div>
      </div>
    </div>
  );
}
