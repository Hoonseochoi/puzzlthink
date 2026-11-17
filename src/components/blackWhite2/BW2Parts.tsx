"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, FastForward, RotateCcw, Send } from 'lucide-react';
import { PANEL, PANEL_TITLE, seg } from '@/components/ui/gameUi';
import {
  BW2_MAIN_ROUNDS, BW2_OVERTIME_ROUNDS,
  type BW2Color, type BW2Round, type BW2Side, type BW2Stage,
  bw2ColorOf, bw2GaugeOf, bw2Other, bw2ScoresOf, bw2StageRounds, readBw2Game, readBw2Round,
} from '@/lib/blackWhite2';

const CARD_SIZE = {
  xs: 'h-8 w-6 rounded-[5px] text-[10px]',
  sm: 'h-12 w-9 rounded-[7px] text-sm',
  md: 'h-[72px] w-[52px] rounded-[9px] text-xl',
  lg: 'h-[112px] w-20 rounded-[12px] text-4xl sm:h-[132px] sm:w-[94px] sm:text-5xl',
} as const;

export function BW2Card({ color, points = null, size = 'md', dim = false, selected = false, anim, className = '' }: {
  color: BW2Color; points?: number | null; size?: keyof typeof CARD_SIZE; dim?: boolean; selected?: boolean; anim?: 'lay' | 'flip'; className?: string;
}) {
  const black = color === 'black';
  return (
    <span className={`relative inline-flex shrink-0 flex-col items-center justify-center overflow-hidden border font-black tabular-nums leading-none transition ${CARD_SIZE[size]}
      ${black ? 'border-[#55555e] bg-gradient-to-b from-[#33343b] to-[#050506] text-[#f4efe4] shadow-[0_8px_22px_rgba(0,0,0,.58),inset_0_1px_0_rgba(255,255,255,.14)]'
        : 'border-white bg-gradient-to-b from-[#fffdf8] to-[#c9c2b5] text-[#0d0d10] shadow-[0_8px_22px_rgba(0,0,0,.48),inset_0_-2px_0_rgba(0,0,0,.14)]'}
      ${selected ? '-translate-y-1 ring-2 ring-[#ef3340] ring-offset-2 ring-offset-[#121217]' : ''} ${dim ? 'opacity-25 saturate-0' : ''}
      ${anim === 'lay' ? 'bw-lay' : anim === 'flip' ? 'bw-flip' : ''} ${className}`}>
      <i className={`absolute inset-x-[16%] top-[12%] h-px ${black ? 'bg-white/15' : 'bg-black/10'}`} />
      {points === null ? <i className={`h-4 w-4 rotate-45 rounded-[2px] ${black ? 'bg-white/15' : 'bg-black/15'}`} /> : points}
      <small className={`absolute bottom-[8%] text-[7px] font-black tracking-[0.15em] ${black ? 'text-white/30' : 'text-black/30'}`}>{black ? 'BLACK' : 'WHITE'}</small>
    </span>
  );
}

export function GaugeLights({ level, points, compact = false }: { level: number; points?: number | null; compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1" aria-label={`${level}/5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <i key={index} className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-3.5 sm:w-3.5'} rotate-45 rounded-[2px] border transition-all ${index < level ? 'border-[#ef3340]/70 bg-[#ef3340] shadow-[0_0_9px_rgba(239,51,64,.75)]' : 'border-white/15 bg-black/40'}`} />
        ))}
      </div>
      {points !== undefined && points !== null && points >= 0 && <span className="ml-1 font-mono text-[11px] font-black tabular-nums text-white/70">{points}P</span>}
    </div>
  );
}

function ScorePips({ rounds, me, stage }: { rounds: BW2Round[]; me: BW2Side; stage: BW2Stage }) {
  const list = bw2StageRounds(rounds, stage);
  const count = stage === 'main' ? BW2_MAIN_ROUNDS : BW2_OVERTIME_ROUNDS;
  return <div className="flex items-center gap-1">{Array.from({ length: count }, (_, index) => {
    const round = list[index];
    const cls = !round ? 'border border-white/15 bg-transparent' : round.winner === null ? 'bg-white/35' : round.winner === me ? 'bg-[#ef3340] shadow-[0_0_8px_rgba(239,51,64,.8)]' : 'bg-[#f4efe4]';
    return <span key={index} className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${cls}`} />;
  })}</div>;
}

export function BW2Scoreboard({ rounds, me, names, leader, stage, bank, gauges, finished }: {
  rounds: BW2Round[]; me: BW2Side; names: [string, string]; leader: BW2Side; stage: BW2Stage;
  bank: [number, number]; gauges: [number, number]; finished: boolean;
}) {
  const t = useTranslations('BlackWhite2');
  const score = bw2ScoresOf(rounds);
  const opponent = bw2Other(me);
  const side = (who: BW2Side, align: 'left' | 'right') => (
    <div className={`min-w-0 flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <p className={`flex items-center gap-1.5 truncate text-[11px] font-bold text-white/55 ${align === 'right' ? 'justify-end' : ''}`}>
        {!finished && leader === who && <span className="rounded-[3px] bg-[#ef3340] px-1.5 text-[9px] font-black text-white">{t('leadBadge')}</span>}
        <span className="truncate">{names[who]}</span>
      </p>
      <div className={`mt-1 flex items-end gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
        <p className={`font-mono text-3xl font-black tabular-nums sm:text-4xl ${who === me ? 'text-[#f4efe4]' : 'text-white/70'}`}>{score[who]}</p>
        <GaugeLights level={gauges[who]} points={who === me || finished ? bank[who] : null} compact />
      </div>
    </div>
  );
  const played = bw2StageRounds(rounds, stage).length;
  const total = stage === 'main' ? BW2_MAIN_ROUNDS : BW2_OVERTIME_ROUNDS;
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-black/45 px-4 py-3">
      {side(me, 'left')}
      <div className="flex flex-col items-center gap-1.5">
        <span className="font-mono text-[9px] font-black tracking-[0.16em] text-white/35">{finished ? 'FINAL' : stage === 'overtime' ? `OT ${Math.min(played + 1, total)}/${total}` : `ROUND ${Math.min(played + 1, total)}/${total}`}</span>
        <ScorePips rounds={rounds} me={me} stage={stage} />
      </div>
      {side(opponent, 'right')}
    </div>
  );
}

export type BW2LeadView = { side: BW2Side; bid: number | null; color: BW2Color; gaugeAfter: number } | null;

export function BW2Table({ me, leader, names, lead, result, waiting }: {
  me: BW2Side; leader: BW2Side; names: [string, string]; lead: BW2LeadView; result: BW2Round | null; waiting: string | null;
}) {
  const t = useTranslations('BlackWhite2');
  const opponent = bw2Other(me);
  const slot = (who: BW2Side) => {
    const own = who === me;
    const order = (result ? result.leader : leader) === who ? t('first') : t('second');
    const color = result ? result.colors[who] : lead?.side === who ? lead.color : null;
    const points = result ? (own ? result.bids[who] : null) : lead?.side === who && own ? lead.bid : null;
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="max-w-[100px] truncate text-[10px] font-black tracking-[0.1em] text-white/40">{names[who]} · {order}</span>
        <div className="flex h-[118px] w-[88px] items-center justify-center rounded-[14px] border border-dashed border-white/15 bg-black/35 sm:h-[140px] sm:w-[104px]">
          {color && <BW2Card key={`${who}-${color}-${points ?? 'x'}-${!!result}`} color={color} points={points} size="lg" anim={result && !own ? 'flip' : 'lay'} />}
        </div>
        {!result && lead?.side === who && <GaugeLights level={lead.gaugeAfter} compact />}
      </div>
    );
  };
  const banner = result && (result.winner === null ? { text: t('roundDraw'), cls: 'text-white/80' }
    : result.winner === me ? { text: t('roundWin'), cls: 'text-[#ef3340] drop-shadow-[0_0_14px_rgba(239,51,64,.8)]' }
      : { text: t('roundLoss'), cls: 'text-[#f4efe4] drop-shadow-[0_0_12px_rgba(255,255,255,.35)]' });
  return (
    <div className="relative flex items-center justify-center gap-5 rounded-[14px] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(239,51,64,.10),transparent_70%)] px-3 py-5 sm:gap-12 sm:py-7">
      {slot(me)}
      <div className="flex w-20 flex-col items-center sm:w-28">
        {banner ? <span className={`bw-result text-center text-lg font-black tracking-[0.1em] sm:text-2xl ${banner.cls}`}>{banner.text}</span> : <span className="font-mono text-xs font-black text-white/25">VS</span>}
        {!banner && waiting && <span className="mt-2 animate-pulse text-center text-[10px] font-bold text-white/45">{waiting}</span>}
      </div>
      {slot(opponent)}
    </div>
  );
}

export function BidControl({ bank, roundsLeft, value, onChange, onSubmit, disabled }: {
  bank: number; roundsLeft: number; value: number; onChange: (value: number) => void; onSubmit: () => void; disabled: boolean;
}) {
  const t = useTranslations('BlackWhite2');
  const quick = useMemo(() => [...new Set([0, 1, 9, 10, Math.min(bank, Math.max(0, Math.round(bank / Math.max(1, roundsLeft)))), bank])].filter((number) => number <= bank), [bank, roundsLeft]);
  const set = (next: number) => onChange(Math.max(0, Math.min(bank, Number.isFinite(next) ? Math.floor(next) : 0)));
  return (
    <div className="rounded-[14px] border border-white/10 bg-black/35 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div><p className={PANEL_TITLE}>{t('bidTitle')}</p><p className="mt-1 text-[10px] text-white/40">{t('bidHint', { bank })}</p></div>
        <BW2Card color={bw2ColorOf(value)} points={value} size="md" selected />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_84px] gap-3">
        <input type="range" min={0} max={bank} value={value} disabled={disabled} onChange={(event) => set(Number(event.target.value))} className="accent-[#ef3340]" aria-label={t('bidTitle')} />
        <div className="relative"><input type="number" min={0} max={bank} value={value} disabled={disabled} onChange={(event) => set(Number(event.target.value))} className="h-11 w-full rounded-md border border-white/15 bg-black/45 px-3 pr-7 text-right font-mono text-lg font-black text-white outline-none focus:border-[#ef3340]" /><span className="pointer-events-none absolute right-2 top-3 text-[10px] font-black text-white/35">P</span></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">{quick.map((points) => <button key={points} type="button" disabled={disabled} onClick={() => set(points)} className={`min-w-9 px-2.5 py-1.5 ${seg(value === points)}`}>{points}</button>)}</div>
      <button type="button" onClick={onSubmit} disabled={disabled || value > bank} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#ef3340] py-3 text-sm font-extrabold text-white shadow-[0_0_24px_rgba(239,51,64,.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} />{t('submitBid', { points: value })}</button>
    </div>
  );
}

export function BW2RoundLog({ rounds, me }: { rounds: BW2Round[]; me: BW2Side }) {
  const t = useTranslations('BlackWhite2');
  const opponent = bw2Other(me);
  if (!rounds.length) return null;
  return (
    <section className={PANEL}>
      <p className={PANEL_TITLE}>{t('logTitle')}</p>
      <ol className="mt-3 space-y-1.5">{rounds.map((round, index) => (
        <li key={index} className="flex items-center gap-2 text-[11px] text-white/60">
          <span className="w-7 font-mono text-white/35">{round.stage === 'overtime' ? `OT${bw2StageRounds(rounds.slice(0, index + 1), 'overtime').length}` : `R${bw2StageRounds(rounds.slice(0, index + 1), 'main').length}`}</span>
          <BW2Card size="xs" color={round.colors[me]} points={round.bids[me] >= 0 ? round.bids[me] : null} />
          <span className="text-white/25">vs</span><BW2Card size="xs" color={round.colors[opponent]} />
          <GaugeLights level={round.gaugesAfter[opponent]} compact />
          <span className={`ml-auto font-black ${round.winner === null ? 'text-white/50' : round.winner === me ? 'text-[#ef3340]' : 'text-white/80'}`}>{round.winner === null ? t('markDraw') : round.winner === me ? t('markWin') : t('markLoss')}</span>
        </li>
      ))}</ol>
    </section>
  );
}

const TONE = {
  good: 'border-[#ef3340]/40 bg-[#ef3340]/10 text-[#ff9aa1]',
  bad: 'border-white/20 bg-white/[.06] text-white/70',
  even: 'border-white/15 bg-white/[.04] text-white/55',
};

function roundNote(t: ReturnType<typeof useTranslations>, round: BW2Round, me: BW2Side) {
  const kind = readBw2Round(round);
  const winner = round.winner;
  const mine = round.bids[me], theirs = round.bids[bw2Other(me)];
  const won = winner === me;
  const key = kind === 'draw' ? 'readDraw' : kind === 'allIn' ? 'readAllIn' : kind === 'edge' ? (won ? 'readEdgeWin' : 'readEdgeLoss')
    : kind === 'bait' ? (won ? 'readBaitLoss' : 'readBaitWin') : kind === 'overkill' ? (won ? 'readOverWin' : 'readOverLoss')
      : kind === 'sameColor' ? (won ? 'readSameWin' : 'readSameLoss') : kind === 'pressure' ? 'readPressure' : (won ? 'readSolidWin' : 'readSolidLoss');
  return { text: t(key, { mine, theirs }), tone: winner === null ? 'even' as const : won ? 'good' as const : 'bad' as const };
}

export function BW2Replay({ rounds, me, names, override, children }: { rounds: BW2Round[]; me: BW2Side; names: [string, string]; override?: string | null; children?: React.ReactNode }) {
  const t = useTranslations('BlackWhite2');
  const opponent = bw2Other(me);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [truth, setTruth] = useState(true);
  const read = readBw2Game(rounds, me);
  const done = step >= rounds.length;

  useEffect(() => {
    if (!playing || done) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), step === 0 ? 500 : 900);
    return () => window.clearTimeout(timer);
  }, [playing, step, done]);

  const running = bw2ScoresOf(rounds.slice(0, step));
  const score = done ? read.scores : running;
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(239,51,64,.18),transparent_65%)] px-4 py-6 text-center">
        <p className="font-mono text-[10px] font-black tracking-[0.3em] text-white/40">{t('replayKicker')}</p>
        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-8"><p className="min-w-0 flex-1 truncate text-right text-xs font-bold text-white/55">{names[me]}</p><p className="font-mono text-5xl font-black tabular-nums text-[#f4efe4] sm:text-6xl">{score[me]}<span className="mx-2 text-white/25">:</span>{score[opponent]}</p><p className="min-w-0 flex-1 truncate text-left text-xs font-bold text-white/55">{names[opponent]}</p></div>
        {done && override ? <h2 className="bw-result mt-3 text-2xl font-black text-white">{override}</h2> : done ? <div className="bw-result"><h2 className={`mt-3 text-2xl font-black sm:text-3xl ${read.scores[me] > read.scores[opponent] ? 'text-[#ef3340]' : read.scores[me] < read.scores[opponent] ? 'text-white' : 'text-white/80'}`}>{t(`verdict.${read.verdict}.title`)}</h2><p className="mx-auto mt-1.5 max-w-lg break-keep text-xs leading-5 text-white/60 sm:text-sm">{t(`verdict.${read.verdict}.desc`)}</p></div> : <p className="mt-3 animate-pulse text-xs font-bold text-white/45">{t('revealing')}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex gap-1.5"><button type="button" onClick={() => { setStep(0); setPlaying(true); }} className={`flex items-center gap-1.5 px-3 py-2 ${seg(false)}`}><RotateCcw size={13} />{t('replayAgain')}</button>{!done && <button type="button" onClick={() => { setStep(rounds.length); setPlaying(false); }} className={`flex items-center gap-1.5 px-3 py-2 ${seg(false)}`}><FastForward size={13} />{t('replaySkip')}</button>}</div><button type="button" onClick={() => setTruth((value) => !value)} className={`flex items-center gap-1.5 px-3 py-2 ${seg(truth)}`}>{truth ? <Eye size={13} /> : <EyeOff size={13} />}{truth ? t('viewTruth') : t('viewSeen')}</button></div>

      <ol className="space-y-1.5">{rounds.map((round, index) => {
        const shown = index < step;
        const scoreAfter = bw2ScoresOf(rounds.slice(0, index + 1));
        const note = roundNote(t, round, me);
        const decisive = read.decisive === index;
        const stageNo = bw2StageRounds(rounds.slice(0, index + 1), round.stage).length;
        return (
          <li key={index} className={`grid grid-cols-[34px_1fr_auto] items-center gap-2 rounded-[12px] border px-2.5 py-2 transition sm:grid-cols-[44px_1fr_auto] sm:gap-3 sm:px-3 ${decisive && shown ? 'border-[#ef3340]/50 bg-[#ef3340]/[.06]' : 'border-white/[.07] bg-black/30'} ${shown ? '' : 'opacity-40'}`}>
            <span className="font-mono text-[10px] font-black text-white/40">{round.stage === 'overtime' ? `OT${stageNo}` : `R${stageNo}`}</span>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3"><span className="flex items-center gap-1"><BW2Card size="sm" color={round.colors[me]} points={round.bids[me]} className={round.winner === me && shown ? 'ring-2 ring-[#ef3340]' : ''} /><span className="text-[9px] font-black text-white/30">{round.leader === me ? t('first') : ''}</span></span><span className="text-[10px] font-black text-white/25">vs</span><span className="flex items-center gap-1">{shown && truth ? <BW2Card key="open" size="sm" color={round.colors[opponent]} points={round.bids[opponent]} anim="flip" className={round.winner === opponent ? 'ring-2 ring-white/70' : ''} /> : <BW2Card key="back" size="sm" color={round.colors[opponent]} />}<span className="text-[9px] font-black text-white/30">{round.leader === opponent ? t('first') : ''}</span></span>{shown && <span className={`hidden min-w-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-bold sm:inline ${TONE[note.tone]}`}>{truth ? note.text : round.winner === null ? t('markDraw') : round.winner === me ? t('markWin') : t('markLoss')}</span>}</div>
            <span className="font-mono text-xs font-black tabular-nums text-white/70">{shown ? `${scoreAfter[me]}:${scoreAfter[opponent]}` : '–'}</span>
            {shown && <span className={`col-span-3 truncate rounded-full border px-2 py-0.5 text-[10px] font-bold sm:hidden ${TONE[note.tone]}`}>{truth ? note.text : round.winner === null ? t('markDraw') : round.winner === me ? t('markWin') : t('markLoss')}</span>}
            {shown && decisive && <span className="col-span-3 text-[10px] font-black tracking-[0.1em] text-[#ef3340]">{t('decisive')}</span>}
          </li>
        );
      })}</ol>

      {done && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[
        { label: t('statSpent'), mine: read.spent[me], theirs: read.spent[opponent], hint: t('statSpentHint') },
        { label: t('statEfficient'), mine: read.efficientWins[me], theirs: read.efficientWins[opponent], hint: t('statEfficientHint') },
        { label: t('statBait'), mine: read.cheapLosses[me], theirs: read.cheapLosses[opponent], hint: t('statBaitHint') },
        { label: t('statOver'), mine: read.overkills[me], theirs: read.overkills[opponent], hint: t('statOverHint') },
      ].map((stat) => <div key={stat.label} className="rounded-[12px] border border-white/10 bg-black/30 px-2 py-3 text-center" title={stat.hint}><p className="text-[10px] font-black text-white/45">{stat.label}</p><p className="mt-1 font-mono text-lg font-black text-[#f4efe4]">{stat.mine}<span className="mx-1 text-white/25">:</span><span className="text-white/60">{stat.theirs}</span></p><p className="mt-0.5 break-keep text-[9px] leading-3 text-white/35">{stat.hint}</p></div>)}</div>}
      {children}
    </div>
  );
}

export function BW2GaugePanel({ names, me, bank, gauges }: { names: [string, string]; me: BW2Side; bank: [number, number]; gauges: [number, number] }) {
  const t = useTranslations('BlackWhite2');
  return <section className={PANEL}><p className={PANEL_TITLE}>{t('gaugesTitle')}</p><div className="mt-3 space-y-3">{([me, bw2Other(me)] as BW2Side[]).map((side) => <div key={side} className="flex items-center justify-between gap-3"><span className="min-w-0 truncate text-xs font-bold text-white/55">{names[side]}</span><GaugeLights level={gauges[side]} points={side === me ? bank[side] : null} /></div>)}</div><p className="mt-3 break-keep text-[10px] leading-4 text-white/35">{t('gaugesHint')}</p></section>;
}

export const gaugePreview = (points: number) => bw2GaugeOf(points);
