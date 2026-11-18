"use client";

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Coins } from 'lucide-react';
import { RR_CHAMBERS, RR_MANIPULATE_AT, RR_PLAYERS, type RussianRoulette } from '@/lib/russianRoulette';
import { type RRFrame as Frame, rouletteFrames } from '@/lib/russianRouletteReplay';
import { type ReplayPlayer, useReplayPlayer } from '@/hooks/useReplayFrames';
import { ReplayControls, ReplayHeader } from '../ui/ReplayBar';
import { PANEL } from '../ui/gameUi';
import RouletteCharacter from './RouletteCharacter';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Step-through replay (복기) of a finished 러시안 룰렛: every action, with the real bullets shown. */
export default function RouletteReplay({ game, name, open, onClose }: { game: RussianRoulette; name: (seat: number) => string; open: boolean; onClose: () => void }) {
  const frames = useMemo(() => rouletteFrames(game), [game]);
  const player = useReplayPlayer(frames.length - 1, open, 1100);
  const frame = frames[player.at];
  return <RouletteReplayView frame={frame} player={player} name={name} onClose={onClose} />;
}

function RouletteReplayView({ frame, player, name, onClose }: { frame: Frame; player: ReplayPlayer; name: (seat: number) => string; onClose: () => void }) {
  const t = useTranslations('RussianRoulette');
  const tc = useTranslations('Common');
  const s = frame.step;
  const pairText = (p: number) => ({ a: LETTERS[p], b: LETTERS[(p + 1) % RR_CHAMBERS] });
  const caption = !s ? tc('replayStart')
    : s.k === 'public' ? t('logPublic', { player: name(s.seat), ...pairText(s.pair) })
      : s.k === 'private' ? (s.pair === undefined ? t('replayPrivateHidden', { player: name(s.seat) }) : t('replayPrivate', { player: name(s.seat), ...pairText(s.pair) }))
        : s.k === 'rotate' ? t('logRotate', { player: name(s.seat), n: s.steps })
          : s.k === 'fund' ? (s.swap !== null ? t('replaySwap', { player: name(s.seat), ...pairText(s.swap) }) : t('replayFund', { player: name(s.seat), amount: s.amount, pool: Math.min(s.pool, RR_MANIPULATE_AT) }))
            : s.fired ? t('replayFire', { chamber: LETTERS[s.chamber], player: name(s.seat) }) : t('replayFireEmpty', { chamber: LETTERS[s.chamber], player: name(s.seat) });
  const actor = s?.seat ?? null;

  return (
    <div className="mx-auto max-w-[760px]">
      <ReplayHeader player={player} caption={`R${frame.round} · ${caption}`} onClose={onClose} />
      <section className={`${PANEL} space-y-4`}>
        {/* Cylinder: chamber, real bullet, and who it would hit with the muzzle where it is now. */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {Array.from({ length: RR_CHAMBERS }, (_, c) => {
            const target = (frame.muzzle + c) % RR_PLAYERS;
            const focus = frame.focus.includes(c);
            const firedHere = s?.k === 'fire' && s.chamber === c;
            return (
              <div key={c} className={`flex flex-col items-center rounded-[10px] border px-1 py-2 transition ${focus ? 'border-(--accent) bg-(--accent)/15 shadow-[0_0_16px_var(--accent-glow)]' : 'border-white/10 bg-black/30'}`}>
                <span className="font-mono text-xs font-black text-white/70">{LETTERS[c]}</span>
                <span className={`mt-1.5 flex h-7 w-7 items-center justify-center rounded-full border ${frame.chambers[c] ? 'border-[#ff7268] bg-[#ff7268]/25' : 'border-white/15 bg-white/[0.03]'}`}>
                  {frame.chambers[c] && <i className={`h-3.5 w-3.5 rounded-full bg-[#ff5b50] ${firedHere && s.fired ? 'shadow-[0_0_14px_#ff5b50]' : ''}`} />}
                </span>
                {frame.checked[c] && <span className="mt-1 text-[8px] font-black text-[#8ff0c6]">{t('replayLegendInspected')}</span>}
                <span className="mt-1 w-full truncate text-center text-[9px] font-bold text-white/45">→ {name(target)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] leading-4 text-white/35">{t('replayHint')}</p>
        {/* Players and their credits at this moment. */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-[10px] font-black tracking-widest text-white/35"><Coins size={11} />{t('replayCredits')}</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {frame.credits.map((credit, seat) => {
              const hit = frame.hits.includes(seat);
              return (
                <div key={seat} className={`rounded-[10px] border p-2 text-center ${seat === actor ? 'border-(--accent)/60 bg-white/[0.06]' : hit ? 'border-[#ff7268]/35 bg-[#ff7268]/10' : 'border-white/10 bg-black/30'}`}>
                  <RouletteCharacter seat={seat} hit={hit} label={name(seat)} className="mx-auto h-9" />
                  <p className="mt-1 truncate text-[9px] font-bold text-white/60">{name(seat)}</p>
                  <p className={`font-mono text-sm font-black ${credit ? 'text-white' : 'text-white/30'}`}>{credit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <ReplayControls player={player} onShowResult={onClose} />
    </div>
  );
}
