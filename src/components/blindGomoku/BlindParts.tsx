"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Eye, EyeOff, FlipHorizontal2, Pause, Play } from 'lucide-react';
import { STONE_COLORS, coordinateLabel, type GomokuMove, type StoneColor } from '@/lib/blindGomoku';
import { PANEL, PANEL_TITLE } from '@/components/ui/gameUi';
import BlindStone from './BlindStone';

/**
 * Replay of a finished game: starts at the final move with the board flipped to the truth side;
 * `truth` toggles which face is up, so the game can be replayed as the players saw it (colours only)
 * or with black and white showing. A new `key` (a new game) resets it.
 */
export function useReplay(moves: GomokuMove[], active: boolean, key: string) {
  const [state, setState] = useState({ key, step: moves.length, playing: false, truth: true });
  // A new game (or a new finished position) jumps to its last move, truth side up.
  if (state.key !== key) setState({ key, step: moves.length, playing: false, truth: true });
  const current = state.key === key;
  const step = current ? state.step : moves.length;
  const playing = current && state.playing;
  const truth = !current || state.truth;

  useEffect(() => {
    if (!playing || !active) return;
    const timer = window.setInterval(() => {
      setState((s) => (s.step >= moves.length ? { ...s, playing: false } : { ...s, step: s.step + 1 }));
    }, 560);
    return () => window.clearInterval(timer);
  }, [playing, active, moves.length]);

  return {
    step,
    playing,
    truth,
    flip: () => setState((s) => ({ ...s, truth: !s.truth })),
    setStep: (n: number) => setState((s) => ({ ...s, playing: false, step: Math.max(0, Math.min(moves.length, n)) })),
    toggle: () => setState((s) => ({ ...s, playing: !s.playing, step: s.step >= moves.length ? 0 : s.step })),
  };
}

/** Controls under the flipped board after the game: step back and forth, auto-play, slider. */
export function ReplayBar({ moves, replay }: { moves: GomokuMove[]; replay: ReturnType<typeof useReplay> }) {
  const t = useTranslations('BlindGomoku');
  const shown = moves[replay.step - 1];
  return (
    <div className="mt-4 rounded-[12px] border border-white/10 bg-black/45 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`${PANEL_TITLE} flex items-center gap-1.5`}>{t('replay')}<span className="inline-flex items-center gap-1 normal-case tracking-normal text-white/35">{replay.truth ? <Eye size={11} /> : <EyeOff size={11} />}{replay.truth ? t('truthVisible') : t('colorsOnly')}</span></p>
          <p className="mt-1 text-xs font-bold text-white/70">{shown ? t('replayMove', { step: replay.step, total: moves.length, coordinate: coordinateLabel(shown.row, shown.col) }) : t('replayStart')}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay.flip} aria-pressed={replay.truth} className="mr-1 inline-flex items-center gap-1.5 rounded-md border border-[#ffd166]/45 bg-[#ffd166]/10 px-2.5 py-2 text-[11px] font-black text-[#ffe6a1] hover:bg-[#ffd166]/20">
            <FlipHorizontal2 size={14} /><span className="hidden min-[380px]:inline">{replay.truth ? t('flipToColors') : t('flipToTruth')}</span>
          </button>
          <button type="button" aria-label={t('previous')} onClick={() => replay.setStep(replay.step - 1)} className="rounded-md border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"><ChevronLeft size={16} /></button>
          <button type="button" aria-label={replay.playing ? t('pause') : t('play')} onClick={replay.toggle} className="rounded-md bg-[#ffd166] p-2 text-[#17120a]">{replay.playing ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" aria-label={t('next')} onClick={() => replay.setStep(replay.step + 1)} className="rounded-md border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"><ChevronRight size={16} /></button>
        </div>
      </div>
      <input aria-label={t('replaySlider')} type="range" min={0} max={moves.length} value={replay.step} onChange={(event) => replay.setStep(Number(event.target.value))} className="mt-3 w-full accent-[#ffd166]" />
    </div>
  );
}

/** The seven outer colours. When `locked` is set (white must copy), it shows that colour only. */
export function ColorPicker({ selected, onSelect, disabled, locked, note }: {
  selected: StoneColor;
  onSelect: (color: StoneColor) => void;
  disabled: boolean;
  locked?: StoneColor | null;
  note: string;
}) {
  const t = useTranslations('BlindGomoku');
  return (
    <section className={PANEL}>
      <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('chooseColor')}</p><span className="text-[10px] font-bold text-white/35">{note}</span></div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {STONE_COLORS.map((color) => {
          const on = (locked ?? selected) === color.id;
          return (
            <button key={color.id} type="button" disabled={disabled || !!locked} aria-label={t(`colors.${color.id}`)} aria-pressed={on} onClick={() => onSelect(color.id)}
              className={`aspect-square rounded-full border-2 p-[3px] transition ${on ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,.35)]' : `border-transparent ${locked ? 'opacity-20' : 'opacity-65 hover:opacity-100'}`}`}>
              <BlindStone color={color.hex} owner="black" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
