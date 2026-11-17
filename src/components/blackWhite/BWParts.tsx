"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, FastForward, RotateCcw } from 'lucide-react';
import { PANEL, PANEL_TITLE, seg } from '@/components/ui/gameUi';
import { type BWColor, type BWRound, type Side, ROUNDS, TILES, colorOf, colorsLeft, handOf, other, readGame, readRound, scoresOf } from '@/lib/blackWhite';

const SIZE = {
  xs: 'h-[26px] w-[19px] rounded-[4px] text-[11px]',
  sm: 'h-10 w-[30px] rounded-[5px] text-base',
  md: 'h-[58px] w-[42px] rounded-[7px] text-2xl sm:h-16 sm:w-12 sm:text-[28px]',
  hand: 'aspect-[5/7] w-full max-w-[48px] rounded-[6px] text-xl min-[400px]:text-2xl sm:text-[28px]',
  lg: 'h-[92px] w-[66px] rounded-[10px] text-5xl sm:h-[112px] sm:w-20 sm:text-6xl',
} as const;

/** One tile. `n` null shows the back (colour only). */
export function BWTile({ color, n = null, size = 'md', dim = false, selected = false, anim, className = '' }: {
  color: BWColor; n?: number | null; size?: keyof typeof SIZE; dim?: boolean; selected?: boolean; anim?: 'lay' | 'flip'; className?: string;
}) {
  const black = color === 'black';
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center border font-black tabular-nums leading-none transition ${SIZE[size]}
      ${black ? 'border-[#55555e] bg-gradient-to-b from-[#34343b] to-[#050506] text-[#f4efe4] shadow-[0_6px_16px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.14)]'
        : 'border-white bg-gradient-to-b from-[#fffdf8] to-[#cfc8ba] text-[#0d0d10] shadow-[0_6px_16px_rgba(0,0,0,.45),inset_0_-2px_0_rgba(0,0,0,.12)]'}
      ${selected ? '-translate-y-2 ring-2 ring-[#e9c46a] ring-offset-2 ring-offset-[#121217]' : ''} ${dim ? 'opacity-20 saturate-0' : ''}
      ${anim === 'lay' ? 'bw-lay' : anim === 'flip' ? 'bw-flip' : ''} ${className}`}>
      {n === null
        ? <i className={`h-[22%] w-[22%] rotate-45 rounded-[2px] ${black ? 'bg-white/15' : 'bg-black/15'}`} aria-hidden />
        : n}
    </span>
  );
}

/** Score pips: one per round, from `me`'s side (win, loss, draw, not played). */
export function RoundPips({ rounds, me }: { rounds: BWRound[]; me: Side }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: ROUNDS }, (_, i) => {
        const r = rounds[i];
        const cls = !r ? 'border border-white/15 bg-transparent' : r.winner === null ? 'bg-white/35' : r.winner === me ? 'bg-[#e9c46a] shadow-[0_0_8px_rgba(233,196,106,.7)]' : 'bg-[#ff5d6c]';
        return <span key={i} className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${cls}`} />;
      })}
    </div>
  );
}

/** Top strip: names, scores, round pips and who leads. */
export function Scoreboard({ rounds, me, names, leader, finished }: { rounds: BWRound[]; me: Side; names: [string, string]; leader: Side; finished: boolean }) {
  const t = useTranslations('BlackWhite');
  const s = scoresOf(rounds);
  const opp = other(me);
  const side = (who: Side, align: 'left' | 'right') => (
    <div className={`min-w-0 flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <p className={`flex items-center gap-1.5 truncate text-[11px] font-bold text-white/55 ${align === 'right' ? 'justify-end' : ''}`}>
        {!finished && leader === who && <span className="rounded-[3px] bg-[#e9c46a] px-1 text-[9px] font-black text-[#17120a]">{t('leadBadge')}</span>}
        <span className="truncate">{names[who === me ? 0 : 1]}</span>
      </p>
      <p className={`font-mono text-3xl font-black tabular-nums sm:text-4xl ${who === me ? 'text-[#f4efe4]' : 'text-white/70'}`}>{s[who]}</p>
    </div>
  );
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-black/40 px-4 py-3">
      {side(me, 'left')}
      <div className="flex flex-col items-center gap-1.5">
        <span className="font-mono text-[10px] font-black tracking-[0.2em] text-white/35">{finished ? 'FINAL' : `ROUND ${Math.min(rounds.length + 1, ROUNDS)}/${ROUNDS}`}</span>
        <RoundPips rounds={rounds} me={me} />
      </div>
      {side(opp, 'right')}
    </div>
  );
}

/** The other side's tiles so far: colours only, plus how many of each colour they still hold. */
export function OpponentTrack({ rounds, me, laid, name }: { rounds: BWRound[]; me: Side; laid: BWColor | null; name: string }) {
  const t = useTranslations('BlackWhite');
  const opp = other(me);
  const left = colorsLeft(rounds, opp, laid);
  return (
    <div className="rounded-[12px] border border-white/10 bg-black/30 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className={PANEL_TITLE}>{t('oppPlayed', { name })}</p>
        <p className="flex items-center gap-2 text-[11px] font-bold text-white/55">
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-[2px] border border-white/30 bg-black" />{left.black}</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-[2px] bg-[#f4efe4]" />{left.white}</span>
          <span className="text-white/35">{t('left')}</span>
        </p>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: ROUNDS }, (_, i) => {
          const r = rounds[i];
          if (!r) return <span key={i} className="h-[26px] w-[19px] rounded-[4px] border border-dashed border-white/10" />;
          return <span key={i} className="flex flex-col items-center gap-0.5"><BWTile size="xs" color={r.colors[opp]} /></span>;
        })}
      </div>
    </div>
  );
}

/** My tiles. Played ones stay in place, faded, with the round's result under them. */
export function Hand({ rounds, me, laid, selected, onSelect, disabled }: {
  rounds: BWRound[]; me: Side; laid: number | null; selected: number | null; onSelect: (n: number) => void; disabled: boolean;
}) {
  const t = useTranslations('BlackWhite');
  const left = handOf(rounds, me, laid);
  return (
    <div className="grid grid-cols-9 gap-1 sm:gap-2">
      {TILES.map((n) => {
        const played = rounds.find((r) => r.tiles[me] === n);
        const free = left.includes(n);
        const mark = played ? (played.winner === null ? t('markDraw') : played.winner === me ? t('markWin') : t('markLoss')) : n === laid ? t('markLaid') : '';
        return (
          <button key={n} type="button" disabled={disabled || !free} onClick={() => onSelect(n)} aria-pressed={selected === n}
            className="flex min-w-0 flex-col items-center gap-1 disabled:cursor-default">
            <BWTile color={colorOf(n)} n={n} size="hand" dim={!free} selected={selected === n} className={free && !disabled ? 'hover:-translate-y-1' : ''} />
            <span className={`h-3 text-[9px] font-black ${played?.winner === me ? 'text-[#e9c46a]' : played && played.winner !== null ? 'text-[#ff8b96]' : 'text-white/40'}`}>{mark}</span>
          </button>
        );
      })}
    </div>
  );
}

/** The table for the current round: each side's slot, and the result of the round just played. */
export function Table({ me, leader, myTile, theirColor, result, names, waiting }: {
  me: Side; leader: Side; myTile: number | null; theirColor: BWColor | null; result: BWRound | null; names: [string, string]; waiting: string | null;
}) {
  const t = useTranslations('BlackWhite');
  const opp = other(me);
  const shownMine = result ? result.tiles[me] : myTile;
  const shownTheirs = result ? result.colors[opp] : theirColor;
  const slot = (who: Side) => {
    const mine = who === me;
    const order = (result ? result.leader : leader) === who ? t('first') : t('second');
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-black tracking-[0.14em] text-white/40">{mine ? names[0] : names[1]} · {order}</span>
        <div className="flex h-[96px] w-[70px] items-center justify-center rounded-[12px] border border-dashed border-white/15 bg-black/30 sm:h-[118px] sm:w-[86px]">
          {mine && shownMine !== null && <BWTile key={`m${shownMine}`} color={colorOf(shownMine)} n={shownMine} size="lg" anim="lay" />}
          {!mine && shownTheirs && <BWTile key={`t${shownTheirs}${result ? 'r' : ''}`} color={shownTheirs} size="lg" anim="lay" />}
        </div>
      </div>
    );
  };
  const banner = result && (result.winner === null ? { text: t('roundDraw'), cls: 'text-white/80' }
    : result.winner === me ? { text: t('roundWin'), cls: 'text-[#e9c46a] drop-shadow-[0_0_14px_rgba(233,196,106,.7)]' }
      : { text: t('roundLoss'), cls: 'text-[#ff7a87] drop-shadow-[0_0_14px_rgba(255,93,108,.6)]' });
  return (
    <div className="relative flex items-center justify-center gap-6 rounded-[14px] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.07),transparent_70%)] px-3 py-5 sm:gap-12 sm:py-7">
      {slot(me)}
      <div className="flex w-20 flex-col items-center sm:w-28">
        {banner ? <span key={`${result!.tiles.join('-')}`} className={`bw-result text-center text-lg font-black tracking-[0.12em] sm:text-2xl ${banner.cls}`}>{banner.text}</span>
          : <span className="font-mono text-xs font-black text-white/25">VS</span>}
        {!banner && waiting && <span className="mt-2 animate-pulse text-center text-[10px] font-bold text-white/45">{waiting}</span>}
      </div>
      {slot(opp)}
    </div>
  );
}

type Memo = 'none' | 'out' | 'maybe';

/** The player's own notes on the other side's tiles (tap to cross out, tap again for "?"). */
export function MemoPad({ resetKey }: { resetKey: string }) {
  const t = useTranslations('BlackWhite');
  const [memo, setMemo] = useState<{ key: string; marks: Memo[] }>({ key: resetKey, marks: TILES.map(() => 'none') });
  const marks = memo.key === resetKey ? memo.marks : TILES.map((): Memo => 'none');
  const cycle = (n: number) => setMemo({ key: resetKey, marks: marks.map((m, i) => (i === n ? (m === 'none' ? 'out' : m === 'out' ? 'maybe' : 'none') : m)) });
  return (
    <section className={PANEL}>
      <p className={PANEL_TITLE}>{t('memoTitle')}</p>
      <div className="mt-3 grid grid-cols-9 gap-1">
        {TILES.map((n) => (
          <button key={n} type="button" onClick={() => cycle(n)} className="relative flex justify-center" aria-label={`${n}`}>
            <BWTile color={colorOf(n)} n={n} size="sm" dim={marks[n] === 'out'} />
            {marks[n] === 'out' && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-black text-[#ff5d6c]">×</span>}
            {marks[n] === 'maybe' && <span className="pointer-events-none absolute -right-0.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e9c46a] text-[10px] font-black text-[#17120a]">?</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 break-keep text-[10px] leading-4 text-white/40">{t('memoHint')}</p>
    </section>
  );
}

/** The round log during the game: what I saw (my tile, their colour, the result). */
export function RoundLog({ rounds, me }: { rounds: BWRound[]; me: Side }) {
  const t = useTranslations('BlackWhite');
  const opp = other(me);
  if (!rounds.length) return null;
  return (
    <section className={PANEL}>
      <p className={PANEL_TITLE}>{t('logTitle')}</p>
      <ol className="mt-3 space-y-1.5">
        {rounds.map((r, i) => (
          <li key={i} className="flex items-center gap-2 text-[11px] text-white/60">
            <span className="w-6 font-mono text-white/35">R{i + 1}</span>
            <span className="w-7 text-[10px] font-bold text-white/35">{r.leader === me ? t('first') : t('second')}</span>
            <BWTile size="xs" color={r.colors[me]} n={r.tiles[me]} />
            <span className="text-white/25">vs</span>
            <BWTile size="xs" color={r.colors[opp]} />
            <span className={`ml-auto font-black ${r.winner === null ? 'text-white/50' : r.winner === me ? 'text-[#e9c46a]' : 'text-[#ff8b96]'}`}>
              {r.winner === null ? t('markDraw') : r.winner === me ? t('markWin') : t('markLoss')}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** What a revealed round says, from my side. */
function roundNote(t: ReturnType<typeof useTranslations>, r: BWRound, me: Side) {
  const kind = readRound(r);
  if (kind === 'draw') return { text: t('readDraw', { n: r.tiles[0] }), tone: 'even' as const };
  const iWon = r.winner === me;
  const win = r.tiles[r.winner!], lose = r.tiles[other(r.winner!)];
  if (kind === 'edge') return { text: iWon ? t('readEdgeWin', { win, lose }) : t('readEdgeLoss', { win, lose }), tone: iWon ? 'good' as const : 'bad' as const };
  if (kind === 'bait') return { text: iWon ? t('readBaitLoss', { win, lose }) : t('readBaitWin', { win, lose }), tone: iWon ? 'bad' as const : 'good' as const };
  if (kind === 'overkill') return { text: iWon ? t('readOverWin', { win, lose }) : t('readOverLoss', { win, lose }), tone: 'meh' as const };
  return { text: iWon ? t('readSolidWin', { win, lose }) : t('readSolidLoss', { win, lose }), tone: iWon ? 'good' as const : 'bad' as const };
}

const TONE = { good: 'border-[#e9c46a]/40 bg-[#e9c46a]/10 text-[#f3d98f]', bad: 'border-[#ff5d6c]/35 bg-[#ff5d6c]/10 text-[#ff9aa4]', meh: 'border-white/15 bg-white/5 text-white/60', even: 'border-white/15 bg-white/5 text-white/60' };

/**
 * After the game: every tile is turned over round by round, with the running score and a short read
 * of each round (a one-point squeeze, a cheap tile that drew out a big one, a big tile spent on a small one).
 */
export function Replay({ rounds, me, names, override, children }: { rounds: BWRound[]; me: Side; names: [string, string]; override?: string | null; children?: React.ReactNode }) {
  const t = useTranslations('BlackWhite');
  const opp = other(me);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [truth, setTruth] = useState(true);
  const read = readGame(rounds, me);
  const done = step >= rounds.length;

  useEffect(() => {
    if (!playing || done) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 950);
    return () => window.clearTimeout(timer);
  }, [playing, step, done]);

  const running = scoresOf(rounds.slice(0, step));
  const final = done ? read.scores : running;
  const verdictKey = `verdict.${read.verdict}` as const;
  const spareMine = handOf(rounds, me), spareTheirs = handOf(rounds, opp);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,.16),transparent_65%)] px-4 py-6 text-center">
        <p className="font-mono text-[10px] font-black tracking-[0.3em] text-white/40">{t('replayKicker')}</p>
        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-8">
          <div className="min-w-0 flex-1 text-right"><p className="truncate text-xs font-bold text-white/55">{names[0]}</p></div>
          <p className="font-mono text-5xl font-black tabular-nums text-[#f4efe4] sm:text-6xl">{final[me]}<span className="mx-2 text-white/25 sm:mx-3">:</span>{final[opp]}</p>
          <div className="min-w-0 flex-1 text-left"><p className="truncate text-xs font-bold text-white/55">{names[1]}</p></div>
        </div>
        {done && override ? <h2 className="bw-result mt-3 text-2xl font-black text-white sm:text-3xl">{override}</h2> : done ? (
          <div className="bw-result">
            <h2 className={`mt-3 text-2xl font-black sm:text-3xl ${read.diff > 0 ? 'text-[#e9c46a]' : read.diff < 0 ? 'text-[#ff8b96]' : 'text-white'}`}>{t(`${verdictKey}.title`)}</h2>
            <p className="mx-auto mt-1.5 max-w-md break-keep text-xs leading-5 text-white/60 sm:text-sm">
              {read.diff === 0 ? t('diffDraw') : read.diff > 0 ? t('diffWin', { n: read.diff }) : t('diffLoss', { n: -read.diff })} · {t(`${verdictKey}.desc`)}
            </p>
          </div>
        ) : <p className="mt-3 animate-pulse text-xs font-bold text-white/45">{t('revealing')}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <button type="button" onClick={() => { setStep(0); setPlaying(true); }} className={`flex items-center gap-1.5 px-3 py-2 ${seg(false)}`}><RotateCcw size={13} />{t('replayAgain')}</button>
          {!done && <button type="button" onClick={() => { setStep(rounds.length); setPlaying(false); }} className={`flex items-center gap-1.5 px-3 py-2 ${seg(false)}`}><FastForward size={13} />{t('replaySkip')}</button>}
        </div>
        <button type="button" onClick={() => setTruth((v) => !v)} className={`flex items-center gap-1.5 px-3 py-2 ${seg(truth)}`}>
          {truth ? <Eye size={13} /> : <EyeOff size={13} />}{truth ? t('viewTruth') : t('viewSeen')}
        </button>
      </div>

      <ol className="space-y-1.5">
        {rounds.map((r, i) => {
          const shown = i < step;
          const score = scoresOf(rounds.slice(0, i + 1));
          const note = roundNote(t, r, me);
          const decisive = read.decisive === i;
          return (
            <li key={i} className={`grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-[12px] border px-2.5 py-2 transition sm:grid-cols-[36px_1fr_auto] sm:gap-3 sm:px-3 ${decisive && shown ? 'border-[#e9c46a]/50 bg-[#e9c46a]/[.06]' : 'border-white/[.07] bg-black/30'} ${shown ? '' : 'opacity-40'}`}>
              <span className="font-mono text-[11px] font-black text-white/40">R{i + 1}</span>
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <BWTile size="sm" color={r.colors[me]} n={r.tiles[me]} className={r.winner === me && shown ? 'ring-2 ring-[#e9c46a]' : ''} />
                  <span className="text-[10px] font-black text-white/30">{r.leader === me ? t('first') : ''}</span>
                </span>
                <span className="text-[10px] font-black text-white/25">vs</span>
                <span className="flex items-center gap-1.5">
                  {shown && truth
                    ? <BWTile key="open" size="sm" color={r.colors[opp]} n={r.tiles[opp]} anim="flip" className={r.winner === opp ? 'ring-2 ring-[#ff5d6c]' : ''} />
                    : <BWTile key="back" size="sm" color={r.colors[opp]} />}
                  <span className="text-[10px] font-black text-white/30">{r.leader === opp ? t('first') : ''}</span>
                </span>
                {shown && <span className={`hidden min-w-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-bold sm:inline ${TONE[note.tone]}`}>{truth ? note.text : (r.winner === null ? t('markDraw') : r.winner === me ? t('markWin') : t('markLoss'))}</span>}
              </div>
              <span className="font-mono text-xs font-black tabular-nums text-white/70">{shown ? `${score[me]}:${score[opp]}` : '–'}</span>
              {shown && <span className={`col-span-3 -mt-0.5 truncate rounded-full border px-2 py-0.5 text-[10px] font-bold sm:hidden ${TONE[note.tone]}`}>{truth ? note.text : (r.winner === null ? t('markDraw') : r.winner === me ? t('markWin') : t('markLoss'))}</span>}
              {shown && decisive && <span className="col-span-3 text-[10px] font-black tracking-[0.12em] text-[#e9c46a]">{t('decisive')}</span>}
            </li>
          );
        })}
      </ol>

      {done && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: t('statWaste'), mine: read.waste[me], theirs: read.waste[opp], hint: t('statWasteHint') },
            { label: t('statBait'), mine: read.baits[me], theirs: read.baits[opp], hint: t('statBaitHint') },
            { label: t('statEdge'), mine: read.edges[me], theirs: read.edges[opp], hint: t('statEdgeHint') },
          ].map((s) => (
            <div key={s.label} className="rounded-[12px] border border-white/10 bg-black/30 px-2 py-3" title={s.hint}>
              <p className="text-[10px] font-black text-white/45">{s.label}</p>
              <p className="mt-1 font-mono text-lg font-black tabular-nums text-[#f4efe4]">{s.mine}<span className="mx-1 text-white/25">:</span><span className="text-white/60">{s.theirs}</span></p>
              <p className="mt-0.5 break-keep text-[9px] leading-3 text-white/35">{s.hint}</p>
            </div>
          ))}
        </div>
      )}

      {done && truth && spareMine.length > 0 && (
        <div className="rounded-[12px] border border-white/10 bg-black/30 px-3 py-3">
          <p className={PANEL_TITLE}>{t('unplayed')}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
            {[{ name: names[0], tiles: spareMine }, { name: names[1], tiles: spareTheirs }].map((s) => (
              <div key={s.name} className="flex items-center gap-2"><span className="w-16 truncate text-[11px] font-bold text-white/50">{s.name}</span>
                <span className="flex gap-1">{s.tiles.map((n) => <BWTile key={n} size="xs" color={colorOf(n)} n={n} />)}</span></div>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
