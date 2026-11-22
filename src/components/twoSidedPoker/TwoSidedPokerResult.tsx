"use client";

import { X, Trophy } from 'lucide-react';
import ResultActions from '@/components/ResultActions';
import { ReplayButton, ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, RESULT_PRIMARY, STEEL_TEXT } from '@/components/ui/gameUi';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { Link } from '@/i18n/routing';
import { TSP_ANTE, TSP_START_CHIPS, type TspCard, type TspFace, type TspRound, tspMult } from '@/lib/twoSidedPoker';
import type { TspCopy } from './copy';
import { ChipPile, TwoFaceCard } from './TwoSidedPokerParts';
import { RoundBanner, bubbleText, faceValue } from './TwoSidedPokerTable';

/** Match numbers for the result popup, from the viewer's side (side 0). */
function matchStats(rounds: TspRound[]) {
  return {
    hands: rounds.length,
    doubles: rounds.filter((r) => r.winner === 0 && r.faces[0] === 'both').length,
    biggest: Math.max(0, ...rounds.map((r) => (r.winner === 0 ? r.pot + r.bonus : 0))),
  };
}

/**
 * End of a match: who won and why, a few numbers, 복기, where the result counts in the ranking,
 * then the shared sign-in / quit / again / share actions.
 */
export function TspResultModal({ t, won, chips, title, reason, rounds, rankingNote, onReplay, onClose, onAgain, waitingLabel }: {
  t: TspCopy; won: boolean; chips: number; title: string; reason: string; rounds: TspRound[]; rankingNote: string;
  onReplay: () => void; onClose: () => void; onAgain?: () => void; waitingLabel?: string;
}) {
  const stats = matchStats(rounds);
  return (
    <div className={MODAL_BACKDROP}>
      <div className={`${MODAL} max-h-[92vh] overflow-y-auto`}>
        <button type="button" onClick={onClose} aria-label={t.end.close} className={MODAL_CLOSE}><X size={16} /></button>
        <div className="flex justify-center"><ChipPile count={chips} tone={won ? 'me' : 'ai'} size={34} showZero most={6} /></div>
        <p className="mt-4 font-mono text-[10px] font-bold tracking-[0.3em] text-(--accent)">{won ? 'WIN' : 'LOSE'}</p>
        <h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{title}</h2>
        <p className="mt-2 text-sm text-white/55">{reason}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          {([[t.end.hands, stats.hands], [t.end.doubles, stats.doubles], [t.end.biggest, stats.biggest]] as [string, number][]).map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-black/30 px-2 py-2.5"><dt className="text-[10px] font-bold text-white/40">{label}</dt><dd className="mt-0.5 font-mono text-xl font-black text-white">{value}</dd></div>
          ))}
        </dl>

        {rounds.length > 0 && <ReplayButton onClick={onReplay} />}

        <div className="mt-3 rounded-[12px] border border-[#ffd36e]/30 bg-[#ffd36e]/[0.07] px-4 py-3 text-left">
          <p className="flex items-center gap-1.5 text-xs font-black text-[#ffd36e]"><Trophy size={13} />{t.end.rankingTitle}</p>
          <p className="mt-1 break-keep text-xs leading-5 text-white/60">{rankingNote}</p>
          <Link href="/ranking/two-sided-poker" className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ffd36e]/40 bg-[#ffd36e]/10 px-3 py-1.5 text-xs font-black text-[#ffd36e] hover:bg-[#ffd36e]/20">🏆 {t.end.rankingButton}</Link>
        </div>

        <ResultActions won={won} onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/two-sided-poker" exitPath="/two-sided-poker" primaryClass={RESULT_PRIMARY} />
      </div>
    </div>
  );
}

const shownCard = (card: TspCard): { card: TspCard; hidden: boolean } => ({ card, hidden: card.back === 0 }); // a guest never learns a folded host back

/** Chips of side 0 over the match, with the replayed hand marked. */
function ChipFlow({ series, at }: { series: number[]; at: number }) {
  const w = 100, h = 28, max = 80;
  const x = (i: number) => (series.length > 1 ? (i / (series.length - 1)) * w : 0);
  const y = (v: number) => h - (v / max) * h;
  const points = series.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-10 w-full">
      <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,.12)" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <circle cx={x(at)} cy={y(series[at] ?? 40)} r={2.2} fill="#f2c14e" />
    </svg>
  );
}

/** 복기: every hand of the match, one at a time — both cards open, the betting, the result and the chips after it. */
export function TspReplay({ t, rounds, names, onClose, onShowResult }: {
  t: TspCopy; rounds: TspRound[]; names: [string, string]; onClose: () => void; onShowResult: () => void;
}) {
  const player = useReplayPlayer(rounds.length, true, 1800);
  // Chips after each hand, per side (a tie parks the pot in the middle, so the two need not add up to 80).
  const series = rounds.reduce<number[]>((acc, r) => [...acc, acc[acc.length - 1] + r.delta[0]], [TSP_START_CHIPS]);
  const rival = rounds.reduce<number[]>((acc, r) => [...acc, acc[acc.length - 1] + r.delta[1]], [TSP_START_CHIPS]);
  const handPot = (x: TspRound) => 2 * TSP_ANTE + x.levels[0] * tspMult(x.faces[0]) + x.levels[1] * tspMult(x.faces[1]);
  const r = player.at > 0 ? rounds[player.at - 1] : null;
  const caption = r ? t.replay.hand(player.at) : t.replay.start;

  const side = (i: 0 | 1) => {
    if (!r) return null;
    const { card, hidden } = shownCard(r.cards[i]);
    const face = r.faces[i] as TspFace | null;
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className={`justify-self-start truncate text-xs font-black ${i === 0 ? 'text-(--accent)' : 'text-[#ff8a5c]'}`}>{names[i]}</span>
        <TwoFaceCard card={card} showBack={!hidden} chosen={face} dimUnchosen size="md" dealKey={`${player.at}-${i}`} />
        <span className="justify-self-end font-mono text-xs font-black text-white/60">{face ? `${t.face[face]} ${hidden && face !== 'front' ? '?' : faceValue(card, face)}` : ''}</span>
      </div>
    );
  };

  return (
    <div>
      <ReplayHeader player={player} caption={caption} onClose={onClose} />
      <div className="relative overflow-hidden rounded-[12px] border border-(--accent)/20 bg-[radial-gradient(ellipse_at_center,#221b43,#0d0b18_75%)] p-3 sm:p-5">
        {r ? (
          <div className="relative flex flex-col gap-3">
            {side(1)}
            <div className="mx-auto w-full max-w-sm rounded-md border border-white/10 bg-black/40 px-3 py-2">
              <p className="text-[9px] font-black tracking-[.16em] text-white/35">{t.replay.betting}</p>
              {r.log?.length
                ? <ol className="mt-1 space-y-0.5 text-xs">{r.log.map((l, i) => <li key={i} className="flex gap-2"><b className={l.side === 0 ? 'text-(--accent)' : 'text-[#ff8a5c]'}>{names[l.side]}</b><span className="text-white/70">{bubbleText(t, l)}</span></li>)}</ol>
                : <p className="mt-1 text-xs text-white/45">{t.replay.noBetting}</p>}
            </div>
            <RoundBanner t={t} round={r} carry={r.winner === 'draw' ? handPot(r) : 0} />
            {r.reason === 'fold' && r.cards[1].back === 0 && <p className="text-center text-[10px] text-white/40">{t.replay.hiddenBack}</p>}
            {side(0)}
          </div>
        ) : <p className="py-16 text-center text-sm font-bold text-white/60">{t.replay.start}</p>}
        <div className="relative mt-3 border-t border-white/10 pt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-white/40"><span>{t.replay.flow}</span><span className="font-mono"><b className="text-(--accent)">{series[player.at]}</b> : <b className="text-[#ff8a5c]">{rival[player.at]}</b></span></div>
          <ChipFlow series={series} at={player.at} />
        </div>
      </div>
      <ReplayControls player={player} onShowResult={onShowResult} />
    </div>
  );
}
