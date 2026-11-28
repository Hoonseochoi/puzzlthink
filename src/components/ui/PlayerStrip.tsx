"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '../AuthProvider';
import PlayerPlate from '../match/PlayerPlate';

/** A player in the strip: their seat (to match `me`), name, and whether the seat is an AI. */
export type StripPlayer = { seat: number; name: string; ai?: boolean };

/** The seated players of a room (`local`: a game against the AI in this browser, so every seat but 0 is the AI). */
export function roomPlayers(state: { seats: ({ name: string } | null)[]; ai?: unknown } | null | undefined, local = false): StripPlayer[] | undefined {
  if (!state) return undefined;
  const ai = Array.isArray(state.ai) ? (state.ai as unknown[]) : [];
  // Locally seat 0 is called "나"/"You": leave it blank so the strip shows the nickname (or 게스트).
  return state.seats.flatMap((s, seat) => (s ? [{ seat, name: local && seat === 0 ? '' : s.name, ai: local ? seat !== 0 : !!ai[seat] }] : []));
}

/**
 * The slim bar under a game's top bar: everyone's profile icon and nickname, so players keep seeing their own
 * icon (and the supporter cover) and their opponents'. `players` for a room; `ai` (a label, or true) against the
 * AI; neither for a solo game, which shows just you.
 * `place`: 'bar' (its own row, every width), 'mobile' (its own row below 1024px) or 'header' (inside the top bar
 * from 1024px — GameHeader uses 'mobile' + 'header' so desktop boards keep their height).
 */
export default function PlayerStrip({ players, me = null, ai, tone = 'dark', place = 'bar' }: {
  players?: StripPlayer[]; me?: number | null; ai?: string | boolean; tone?: 'dark' | 'light'; place?: 'bar' | 'mobile' | 'header';
}) {
  const light = tone === 'light';
  const t = useTranslations('PlayerStrip');
  const { nickname } = useAuth();
  const self = nickname || null;
  const list: (StripPlayer & { mine: boolean })[] = players?.length
    ? players.map((p) => ({ ...p, mine: p.seat === me, name: (p.seat === me && self) || p.name || t('guest') }))
    : [{ seat: 0, name: self ?? t('guest'), mine: true }, ...(ai ? [{ seat: 1, name: typeof ai === 'string' ? ai : t('ai'), ai: true, mine: false }] : [])];
  return (
    // A solo game's strip only names me: off in 전체 모드, where every line of height goes to the board.
    <div aria-label={t('label')} data-focus-hide={list.length < 2 ? '' : undefined} className={place === 'header'
      ? 'hidden min-w-0 flex-1 overflow-x-auto px-2 [scrollbar-width:none] lg:block'
      : `relative z-10 overflow-x-auto border-b px-3 py-1 backdrop-blur [scrollbar-width:none] ${place === 'mobile' ? 'lg:hidden' : ''} ${light ? 'border-black/[.06] bg-white/60' : 'border-white/[.06] bg-black/35'}`}>
      {/* w-max + mx-auto: centred when it fits, scrolls from the first player when it does not. */}
      <div className="mx-auto flex w-max items-center gap-1.5">
      {list.map((p, i) => (
        <span key={`${p.seat}-${i}`} className="contents">
          {i > 0 && (list.length === 2
            ? <span className="shrink-0 px-0.5 font-mono text-[10px] font-black tracking-[0.12em] text-white/35">VS</span>
            : <span className="h-1 w-1 shrink-0 rounded-full bg-white/20" />)}
          <PlayerPlate name={p.name} mine={p.mine} ai={p.ai} light={light} meLabel={t('me')} />
        </span>
      ))}
      </div>
    </div>
  );
}
