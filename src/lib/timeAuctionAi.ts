// AI bidders for 시간 경매. Each AI decides at the start of an auction how long it will hold (or to sit out), using
// only what a player at the table could know: the public log (who won each auction and the time on the board when it
// stopped), everyone's tokens, and its own remaining time and past bids. It never sees who is pressing now, anyone
// else's remaining time, or losing bids. Five styles, two levels (normal: noisy, no counting; hard: counts the most
// time each rival can still have and plays the end game exactly).
import { TA_UNIT, type TimeAuction, taSafeTokens } from './timeAuction';

export type TaStyle = 'steady' | 'rush' | 'lurk' | 'penny' | 'count';
export type TaLevel = 'normal' | 'hard';
export const TA_STYLES: TaStyle[] = ['steady', 'rush', 'lurk', 'penny', 'count'];

/** Names and one-line descriptions shown on the table and in the rules sheet. */
export const TA_PERSONA: Record<TaStyle, { name: string; nameEn: string; color: string; ko: string; en: string }> = {
  steady: { name: '신중', nameEn: 'Steady', color: '#5ec8ff', ko: '필요한 만큼만, 평소 낙찰가 근처로 입찰해요.', en: 'Bids only as often as it needs, near the usual price.' },
  rush: { name: '돌격', nameEn: 'Rush', color: '#ff5b5b', ko: '초반에 크게 질러 표식을 먼저 모아요.', en: 'Spends big early to bank tokens first.' },
  lurk: { name: '잠복', nameEn: 'Lurker', color: '#b48cff', ko: '초반엔 거의 쉬다가 후반에 시간을 몰아 써요.', en: 'Sits out early, then pours its time into the late auctions.' },
  penny: { name: '줍줍', nameEn: 'Penny', color: '#ffd166', ko: '짧은 입찰로 아무도 없는 경매를 노려요. 들키면 마이너스 바둑알이에요.', en: 'Short bids hoping nobody else bothers — risky with the minus stone.' },
  count: { name: '계산', nameEn: 'Counter', color: '#3ddc97', ko: '낙찰 시간을 세어 상대의 남은 시간 한도를 계산해요.', en: 'Counts winning times to cap what each rival can have left.' },
};

/** What one seat may know at the start of an auction. */
export type TaAiView = {
  seat: number;
  round: number;
  rounds: number;
  startBank: number;
  myBank: number;
  tokens: number[];
  minus: number[]; // minus stones (public)
  inGame: boolean[];
  log: { outcome: TimeAuction['log'][number]['outcome']; winner: number | null; price: number }[];
};

export const taAiView = (g: TimeAuction, seat: number): TaAiView => ({
  seat, round: g.round, rounds: g.rounds, startBank: g.startBank, myBank: g.bank[seat], tokens: [...g.tokens], minus: [...g.minus], inGame: [...g.inGame],
  log: g.log.map((r) => ({ outcome: r.outcome, winner: r.winner, price: r.price })),
});

const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/**
 * The most time each seat can still have: its start time minus what it paid in auctions it won (public). Losing bids
 * are unknown, so this is an upper bound.
 */
export function taUpperBanks(v: TaAiView): number[] {
  return v.inGame.map((on, s) => (on ? v.startBank - v.log.reduce((sum, r) => sum + (r.winner === s ? r.price : 0), 0) : 0));
}

/**
 * How long to hold this auction, in ms after the countdown ends — or null to let go during the countdown.
 * `rand` returns [0, 1) (Math.random in play, a seeded generator in simulations).
 */
export function chooseTaBid(v: TaAiView, style: TaStyle, level: TaLevel, rand: () => number = Math.random): number | null {
  const bank = v.myBank;
  if (bank < TA_UNIT) return null;
  const hard = level === 'hard';
  const r = (lo: number, hi: number) => lo + (hi - lo) * rand();
  // A normal AI keeps only a rough count of its own spending (as a person would): it believes it has a bit more or
  // less than it really does, so it can plan a hold its time cannot pay for (the button is then pushed out).
  const felt = hard ? bank : bank * r(0.8, 1.3);
  const players = v.inGame.filter(Boolean).length;
  const left = v.rounds - v.round + 1; // this auction included
  const progress = (v.round - 1) / Math.max(1, v.rounds - 1); // 0 at the first auction, 1 at the last
  // Score = stones won − minus stones (the house rule: the shortest of two or more bids takes a −1 stone).
  const score = (s: number) => v.tokens[s] - (v.minus?.[s] ?? 0);
  const mine = score(v.seat);
  const safe = taSafeTokens(v.rounds, players);
  const need = Math.max(0, safe - mine);
  // The usual winning price so far, or a first guess: about a fifth of a bank (the broadcast's first auctions went
  // for 1:23–1:50 of 10:00).
  const prices = v.log.filter((x) => x.outcome !== 'empty').map((x) => x.price);
  // A hard AI reads the price it takes to win as the upper part of what winners have paid (a normal AI, the middle).
  const sorted = [...prices.slice(-8)].sort((a, b) => a - b);
  const quantile = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  const first = v.startBank * 0.17;
  const typical = prices.length >= 2 ? (hard ? quantile(0.6) : median(prices.slice(-6))) : first;
  const noise = hard ? r(0.95, 1.06) : r(0.75, 1.3);
  const perWin = felt / Math.max(1, need);
  const cap = (ms: number) => Math.max(TA_UNIT, Math.min(hard ? bank : felt, ms));
  // Lowest tokens among the others: if nobody is below me, I am the one in danger.
  const others = v.inGame.flatMap((on, s) => (on && s !== v.seat ? [score(s)] : []));
  const bottom = others.length ? Math.min(...others) : 0;
  const behind = mine <= bottom;

  // Counting (every hard AI, and the counter at any level): if I can outlast the most anyone else can possibly hold,
  // the token is mine for sure. Do it when the tokens are needed and the time would not be better spent elsewhere.
  if ((hard || style === 'count') && need > 0) {
    const ub = taUpperBanks(v);
    const rival = Math.max(0, ...ub.filter((_, s) => s !== v.seat && v.inGame[s]));
    const sure = rival + TA_UNIT + (hard ? TA_UNIT : 0);
    if (sure <= bank && (left <= need + 1 || sure <= perWin * (style === 'count' ? 1.0 : 0.9))) return cap(sure + r(0, 60));
  }
  // Out of auctions: everything left goes into the ones that remain.
  if (need > 0 && left <= need) return cap((felt / left) * r(0.97, 1));
  // A hard AI does not join a fight it cannot afford to win while it still has auctions to spare.
  if (hard && perWin < typical * 0.75 && left > need + 1 && rand() < 0.7) return null;
  // Safe already: mostly rest, sometimes a cheap try.
  if (need === 0) {
    // A tiny try risks the minus stone now, so only now and then.
    if (style === 'penny' && rand() < 0.08) return cap(r(0.004, 0.02) * v.startBank);
    if (progress > 0.85 && rand() < 0.35) return cap(bank * r(0.5, 1)); // spend what is left: more time wins ties for 1st
    return rand() < 0.15 ? cap(typical * 0.7 * noise) : null;
  }
  // How eagerly to take part: the wins still needed over the auctions left, shaped by style.
  const pace = need / left;
  let enter: number;
  let bid: number;
  switch (style) {
    case 'steady':
      enter = pace * (behind ? 1.5 : 1.1);
      bid = Math.min(typical * r(1.12, 1.35) * noise, perWin * 0.95);
      break;
    case 'rush':
      enter = progress < 0.45 ? 0.55 : pace * 1.35;
      bid = Math.min(typical * r(1.15, 1.55) * noise, perWin * 1.2, felt * 0.4);
      break;
    case 'lurk':
      if (progress < 0.42) { // saving: sits out, now and then a modest try
        enter = 0.12;
        bid = typical * r(0.6, 0.9);
        break;
      }
      enter = pace * 1.7;
      bid = Math.min(perWin * r(0.78, 0.98) * noise, bank);
      break;
    case 'penny':
      // Short bids hoping nobody else bothers — but a short bid that meets company takes the minus stone, so only
      // right after an expensive auction, when the others are likely tired.
      {
        const last = v.log[v.log.length - 1];
        if (last && last.price > typical * 1.2 && rand() < (hard ? 0.45 : 0.6)) return cap(r(0.004, 0.03) * v.startBank); // 0.5–3.6 s on 2:00
      }
      enter = pace * (behind ? 1.4 : 0.8);
      bid = Math.min(typical * r(1.15, 1.4) * noise, perWin); // when it does go in, it goes in properly
      break;
    case 'count':
    default: {
      // After an expensive auction the others have less to fight with: a good moment to go in.
      const last = v.log[v.log.length - 1];
      const afterBig = !!last && last.price > typical * 1.25;
      enter = pace * (afterBig ? 2.1 : 1.0) * (behind ? 1.35 : 1);
      bid = Math.min(typical * r(1.15, 1.4) * noise, perWin * 1.05);
      break;
    }
  }
  if (rand() >= Math.min(0.95, enter)) return null;
  // A hard AI would rather sit out than enter with a short bid: the shortest of two or more bids takes −1.
  if (hard && bid < typical * 0.45 && left > need) return null;
  // A hard AI avoids round numbers (ties void the token) by adding a few hundredths.
  return cap(bid + (hard ? r(0, 90) : 0));
}

/** A small seeded generator for simulations and tests. */
export function taRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1_000_000) / 1_000_000; };
}
