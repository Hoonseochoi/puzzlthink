// AI bidders for 시간 경매. Each AI decides at the start of an auction how long it will hold (or to sit out), using
// only what a player at the table could know: the public log (who won each auction, the time on the board when it
// stopped, the piece's value, who took the minus stone), everyone's points, the visible order of pieces still to
// come, and its own remaining time. It never sees who is pressing now, anyone else's remaining time or losing bids.
//
// A roster of ten personalities (more than there are seats), each a parameterised style with a tell. Every match
// rolls a fresh "mind" per AI seat (rollTaMind): the personality plus random aggression, patience, chaos (how often
// it breaks character) and a seed for its mood, so the same personality never plays the same match twice.
// Every personality bids WELL: they share one valuation (price per point, points still needed, counting rivals'
// time, never bidding short into the minus stone) and differ only in which pieces they go for, when they spend and
// how they bait. Levels apply on top of the same personality: at 어려움 it plays at full strength; at 보통 it keeps
// only a rough count of its own time, reads prices from the median, bids noisily and does not count or punish.
import { TA_UNIT, type TimeAuction, taLotValue } from './timeAuction';

export type TaStyle = 'steady' | 'rush' | 'snipe' | 'calc' | 'even' | 'bluff' | 'chaser' | 'fickle' | 'dumper' | 'watcher';
export type TaLevel = 'normal' | 'hard';
export const TA_STYLES: TaStyle[] = ['steady', 'rush', 'snipe', 'calc', 'even', 'bluff', 'chaser', 'fickle', 'dumper', 'watcher'];

type Bi = { ko: string; en: string };
/**
 * Character (name, face = a site profile icon id, colour, table blurb) and, revealed after the match, the style and
 * its tell. Talk lines are said sparingly at the table (win / minus).
 */
export const TA_PERSONA: Record<TaStyle, { name: string; nameEn: string; face: string; color: string; blurb: Bi; label: Bi; tell: Bi; win: Bi; minus: Bi }> = {
  // Call signs as in 스나이퍼 홀덤 where the temperament is the same (에이스 balanced, 아울 tight, 징크스 bluffing,
  // 바이퍼 venomous, 모노 patient); the rest are this game's own.
  steady: { name: '에이스', nameEn: 'ACE', face: 'w1-2', color: '#ff7a59',
    blurb: { ko: '기본기가 최고의 무기.', en: 'Fundamentals win.' },
    label: { ko: '균형형', en: 'Balanced' }, tell: { ko: '필요한 만큼만, 평소 낙찰가보다 조금 높게 들어와요. 읽히는 대신 흔들리지 않아요.', en: 'Bids only as often as it needs, a little above the usual price — readable, but steady.' },
    win: { ko: '계획대로예요.', en: 'As planned.' }, minus: { ko: '이번엔 서둘렀네요.', en: 'I rushed that one.' } },
  rush: { name: '블리츠', nameEn: 'BLITZ', face: 'm4096', color: '#ff5b5b',
    blurb: { ko: '선점이 곧 승리.', en: 'First in, first ahead.' },
    label: { ko: '초반 선점형', en: 'Early pressure' }, tell: { ko: '시간이 많은 초반에 적극적으로 따서 앞서 나가고, 후반엔 아껴 써요.', en: 'Takes pieces early while everyone is rich, then plays lean late.' },
    win: { ko: '먼저 간다!', en: 'Off first!' }, minus: { ko: '너무 앞서갔나.', en: 'Too far ahead of myself.' } },
  snipe: { name: '모노', nameEn: 'MONO', face: 'hc', color: '#5fb8ff',
    blurb: { ko: '기다림도 실력이에요.', en: 'Patience is a skill.' },
    label: { ko: '후반 집중형', en: 'Patient' }, tell: { ko: '1점짜리는 웬만하면 넘기고, 2·3점 바둑알과 막판을 위해 시간을 모아요.', en: 'Lets most 1-pointers go and saves its time for 2- and 3-pointers and the end.' },
    win: { ko: '기다린 보람이 있네요.', en: 'Worth the wait.' }, minus: { ko: '…타이밍이 빗나갔어요.', en: '…timing was off.' } },
  calc: { name: '오라클', nameEn: 'ORACLE', face: 'w1-1', color: '#3ddc97',
    blurb: { ko: '숫자는 거짓말을 안 해요.', en: 'Numbers never lie.' },
    label: { ko: '계산형', en: 'Calculator' }, tell: { ko: '낙찰 시간을 세어 상대가 가질 수 있는 시간을 넘기는 순간 확실하게 따요.', en: 'Counts winning prices and strikes when it can outlast what anyone can have left.' },
    win: { ko: '계산 끝.', en: 'Calculated.' }, minus: { ko: '오차 범위 밖이네요.', en: 'Outside my margin.' } },
  even: { name: '페이서', nameEn: 'PACER', face: 'w1-3', color: '#e0c38a',
    blurb: { ko: '처음부터 끝까지 같은 속도로.', en: 'Same pace, start to finish.' },
    label: { ko: '균등 분배형', en: 'Even pacer' }, tell: { ko: '남은 시간을 남은 점수에 맞춰 나눠, 여러 경매에 꾸준히 제값을 걸어요.', en: 'Splits its time by the points still to come and pays a fair price across many auctions.' },
    win: { ko: '예산 안이에요.', en: 'Within budget.' }, minus: { ko: '페이스가 흔들렸네요.', en: 'Lost my pace.' } },
  bluff: { name: '징크스', nameEn: 'JINX', face: 'o-2', color: '#c08bff',
    blurb: { ko: '내가 누르고 있을까, 아닐까?', en: 'Am I holding, or not?' },
    label: { ko: '미끼형', en: 'Baiter' }, tell: { ko: '1점짜리에 평소 값 근처로 자주 들어와 남들이 값을 올리게 만들고, 진짜 승부는 2·3점에서 해요.', en: 'Often in for 1-pointers near the usual price so others pay up; saves its real fights for 2s and 3s.' },
    win: { ko: '진짜였을까요?', en: 'Was I bluffing?' }, minus: { ko: '아무 일도 없었어요.', en: 'Nothing happened.' } },
  chaser: { name: '헌터', nameEn: 'HUNTER', face: 'w2-2', color: '#ff9f43',
    blurb: { ko: '방금 이긴 사람, 다음은 내 차례야.', en: 'Whoever just won — I’m next.' },
    label: { ko: '추격형', en: 'Chaser' }, tell: { ko: '직전 낙찰가를 기준으로 조금 더 걸어 앞선 사람을 쫓아가요.', en: 'Prices off the last winning bid and goes a little over to chase the leader.' },
    win: { ko: '따라잡았다!', en: 'Caught you!' }, minus: { ko: '놓쳤네…', en: 'Lost the trail…' } },
  fickle: { name: '카멜레온', nameEn: 'CHAMELEON', face: 'w2-3', color: '#21c2b5',
    blurb: { ko: '오늘의 나는 어제와 달라요.', en: 'Not who I was yesterday.' },
    label: { ko: '변신형', en: 'Shape-shifter' }, tell: { ko: '초반·중반·후반에 다른 성향으로 바꿔 둬요. 직전 몇 경매가 지금의 모습이에요.', en: 'Plays a different style early, mid and late: its last few auctions show the current one.' },
    win: { ko: '기분 좋은데요?', en: 'Feeling good!' }, minus: { ko: '기분이 바뀌었어요.', en: 'Mood changed.' } },
  dumper: { name: '바이퍼', nameEn: 'VIPER', face: 'hm-hard', color: '#4fd18b',
    blurb: { ko: '마이너스는 남이 가져가야죠.', en: 'Minus stones are for others.' },
    label: { ko: '마이너스 떠넘기기형', en: 'Minus dumper' }, tell: { ko: '1점짜리 경매에 제값으로 자주 끼어들어, 짧게 입찰한 사람에게 마이너스를 떠넘겨요.', en: 'Joins 1-point auctions at a fair price so short bidders get stuck with the minus.' },
    win: { ko: '덤으로 하나 챙겼네요.', en: 'Picked one up on the side.' }, minus: { ko: '…내가 받을 줄은.', en: '…didn’t see that coming.' } },
  watcher: { name: '아울', nameEn: 'OWL', face: 'm65536', color: '#9aa4b8',
    blurb: { ko: '싼 건 쳐다보지도 않아요.', en: 'Cheap ones? Not even a glance.' },
    label: { ko: '선별형', en: 'Selective' }, tell: { ko: '1점짜리 경매는 건너뛰고, 2·3점 바둑알에서 확실하게 이겨요.', en: 'Skips 1-point pieces and wins 2- and 3-pointers decisively.' },
    win: { ko: '기다리면 오는 법.', en: 'Good things come to those who wait.' }, minus: { ko: '부엉…', en: 'Hoo…' } },
};

/** One AI seat for one match: its personality and this match's random variation. */
export type TaMind = { style: TaStyle; aggr: number; patience: number; chaos: number; seed: number };

/** A fresh mind for a match: aggression 0.85–1.18, patience 0.7–1.3, chaos (breaking character) 3–12 %. */
export function rollTaMind(style: TaStyle, rand: () => number = Math.random): TaMind {
  return { style, aggr: 0.85 + rand() * 0.33, patience: 0.7 + rand() * 0.6, chaos: 0.03 + rand() * 0.09, seed: Math.floor(rand() * 1e9) };
}

/** Distinct personalities for `n` AI seats (ten in the roster, five at a table: a match never repeats one). */
export function pickTaStyles(n: number, rand: () => number = Math.random): TaStyle[] {
  const pool = [...TA_STYLES];
  for (let i = pool.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return Array.from({ length: n }, (_, i) => pool[i % pool.length]);
}

/** What one seat may know at the start of an auction. */
export type TaAiView = {
  seat: number;
  round: number;
  rounds: number;
  startBank: number;
  myBank: number;
  tokens: number[];
  minus: number[]; // minus stones (public)
  points: number[]; // value of the stones won (public)
  inGame: boolean[];
  log: { outcome: TimeAuction['log'][number]['outcome']; winner: number | null; price: number; value: number; minus: number | null }[];
};

export const taAiView = (g: TimeAuction, seat: number): TaAiView => ({
  seat, round: g.round, rounds: g.rounds, startBank: g.startBank, myBank: g.bank[seat], tokens: [...g.tokens], minus: [...g.minus], points: [...g.points], inGame: [...g.inGame],
  log: g.log.map((r) => ({ outcome: r.outcome, winner: r.winner, price: r.price, value: r.value ?? 1, minus: r.minus ?? null })),
});

const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/**
 * The most time each seat can still have: its start time minus what it paid in auctions it won (public). Losing bids
 * are unknown, so this is an upper bound.
 */
export function taUpperBanks(v: TaAiView): number[] {
  return v.inGame.map((on, s) => (on ? v.startBank - v.log.reduce((sum, r) => sum + (r.winner === s ? r.price : 0), 0) : 0));
}

/** The style to play this auction by (the fickle one changes style with the phase of the match, by its seed). */
function styleNow(mind: TaMind, progress: number): TaStyle {
  if (mind.style !== 'fickle') return mind.style;
  const phases: TaStyle[][] = [['rush', 'even', 'bluff'], ['steady', 'chaser', 'dumper'], ['snipe', 'calc', 'watcher']];
  const phase = Math.min(2, Math.floor(progress * 3));
  return phases[phase][(mind.seed >> (phase * 3)) % phases[phase].length];
}

/**
 * How long to hold this auction, in ms after the countdown ends — or null to let go during the countdown.
 * `rand` returns [0, 1) (Math.random in play, a seeded generator in simulations).
 */
export function chooseTaBid(v: TaAiView, who: TaMind | TaStyle, level: TaLevel, rand: () => number = Math.random): number | null {
  const mind: TaMind = typeof who === 'string' ? { style: who, aggr: 1, patience: 1, chaos: 0.05, seed: 7 } : who;
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
  // Score = points won (piece values 1/2/3) − minus stones (the shortest of two or more bids).
  const score = (s: number) => (v.points?.[s] ?? v.tokens[s]) - (v.minus?.[s] ?? 0);
  const mine = score(v.seat);
  const value = taLotValue(v.round, v.rounds);
  let total = 0, pointsLeft = 0, bigLeft = 0;
  for (let k = 1; k <= v.rounds; k += 1) { const x = taLotValue(k, v.rounds); total += x; if (k >= v.round) { pointsLeft += x; if (x > 1) bigLeft += 1; } }
  const avgLeft = pointsLeft / left;
  const needPts = Math.max(0, Math.floor(total / players) + 1 - mine);
  const need = needPts > 0 ? Math.max(1, Math.ceil(needPts / avgLeft)) : 0;
  // Prices per point so far; a hard AI reads the upper part of them (what it takes to win), a normal AI the middle.
  const perPoint = v.log.filter((x) => x.outcome !== 'empty').map((x) => x.price / Math.max(1, x.value));
  const sorted = [...perPoint.slice(-8)].sort((a, b) => a - b);
  const quantile = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  const unit = perPoint.length >= 2 ? (hard ? quantile(0.6) : median(perPoint.slice(-6))) : v.startBank * 0.12;
  const typical = unit * value;
  const noise = hard ? r(0.95, 1.06) : r(0.75, 1.3);
  const perWin = (felt / Math.max(1, need)) * (value / avgLeft);
  const cap = (ms: number) => Math.max(TA_UNIT, Math.min(hard ? bank : felt, ms));
  const others = v.inGame.flatMap((on, s) => (on && s !== v.seat ? [score(s)] : []));
  const bottom = others.length ? Math.min(...others) : 0;
  const behind = mine <= bottom;
  const last = v.log[v.log.length - 1];
  const afterBig = !!last && last.outcome !== 'empty' && last.price / Math.max(1, last.value) > unit * 1.25;
  const ub = taUpperBanks(v);
  const rival = Math.max(0, ...ub.filter((_, s) => s !== v.seat && v.inGame[s]));

  // Breaking character now and then (more often at hard: its tell is harder to exploit).
  let style = styleNow(mind, progress);
  if (rand() < mind.chaos * (hard ? 1.4 : 0.6)) {
    const other = TA_STYLES[Math.floor(rand() * TA_STYLES.length)];
    style = other === 'fickle' ? 'steady' : other;
  }

  // Counting (hard AIs and the calculator): outlasting the most any rival can possibly hold makes the piece certain.
  if ((hard || style === 'calc') && need > 0) {
    const sure = rival + TA_UNIT + (hard ? TA_UNIT : 0);
    if (sure <= bank && (left <= need + 1 || sure <= perWin * (style === 'calc' ? 1.0 : 0.9))) return cap(sure + r(0, 60));
  }
  // Out of auctions: everything left goes into the ones that remain, weighted by value.
  if (need > 0 && left <= need) return cap(((felt * value) / pointsLeft) * r(0.97, 1));

  // Mind game (at full strength; the hunter looks for it most): a rival who keeps winning at the same price per point is
  // easy to read — when they still need points, bid just over their habit.
  if (hard && rand() < (style === 'chaser' ? 0.6 : 0.35)) {
    for (let s = 0; s < v.inGame.length; s += 1) {
      if (s === v.seat || !v.inGame[s]) continue;
      const theirs = v.log.filter((x) => x.outcome === 'won' && x.winner === s).map((x) => x.price / Math.max(1, x.value));
      if (theirs.length < 2) continue;
      const m = theirs.reduce((a, b) => a + b, 0) / theirs.length;
      const sd = Math.sqrt(theirs.reduce((a, b) => a + (b - m) ** 2, 0) / theirs.length);
      const theyNeed = score(s) <= Math.max(...others, mine);
      if (sd / m < 0.15 && theyNeed && m * value * 1.08 <= Math.min(perWin * 1.3, bank) && ub[s] >= m * value) return cap(m * value * r(1.05, 1.12) + (hard ? r(0, 90) : 0));
    }
  }

  // Safe already: mostly rest; at the end, spend what is left (more time wins ties for 1st).
  if (need === 0) {
    if (progress > 0.85 && rand() < 0.35) return cap(bank * r(0.5, 1));
    return rand() < 0.12 ? cap(typical * r(0.8, 1.1) * noise) : null;
  }
  const pace = need / left;
  let enter = pace;
  let bid = typical;
  switch (style) {
    case 'steady':
      enter = pace * (behind ? 1.3 : 1.0);
      bid = Math.min(typical * r(1.08, 1.3) * noise, perWin * 0.95);
      break;
    case 'rush':
      enter = progress < 0.45 ? 0.45 * mind.aggr : pace * 1.1;
      bid = Math.min(typical * r(1.05, 1.25) * noise * mind.aggr, perWin * 1.15, felt * 0.35);
      break;
    case 'snipe':
      if (value === 1 && progress < 0.75) { enter = 0.08; bid = typical * r(1.1, 1.3); break; }
      enter = Math.min(0.95, (need / Math.max(1, bigLeft + (progress > 0.75 ? left : 0))) * 1.8 * mind.patience + 0.38);
      bid = Math.min(Math.max(perWin * r(0.95, 1.15), typical * 1.3) * noise, bank);
      break;
    case 'calc':
      enter = pace * (afterBig ? 1.6 : 1.0) * (behind ? 1.3 : 1);
      bid = Math.min(typical * r(1.15, 1.4) * noise, Math.max(((bank * value) / pointsLeft) * 2.2, typical * 1.2));
      break;
    case 'even':
      // Spreads its time by value over what is left — but never short enough to be the shortest bid.
      enter = 0.35 + 0.25 * mind.aggr * (behind ? 1.2 : 1);
      bid = Math.max(((felt * value) / pointsLeft) * r(1.9, 2.5) * mind.aggr, typical * r(1.12, 1.3));
      break;
    case 'bluff':
      // On cheap auctions it does not really want, a believable middling hold that makes the winner pay more.
      // Baits on cheap pieces with a fair bid it is happy to win, so the others pay up; real fights on 2s and 3s.
      if (value === 1 && rand() < 0.25 * mind.patience) { enter = 0.75; bid = Math.min(typical * r(1.12, 1.28), perWin * 1.1); break; }
      enter = pace * 1.3;
      bid = Math.min(typical * r(1.15, 1.45) * noise, perWin);
      break;
    case 'chaser': {
      const lastUnit = last && last.outcome === 'won' && last.winner !== v.seat ? last.price / Math.max(1, last.value) : null;
      // Chases only a winner who paid a fair price (not one who overpaid), and never past what the piece is worth to it.
      enter = pace * (behind ? 1.4 : 1.05) * (lastUnit && lastUnit < unit * 1.3 ? 1.25 : 1);
      bid = Math.min(Math.max((lastUnit ?? unit) * value * r(1.03, 1.12), typical * r(1.1, 1.25)) * noise, perWin * 1.05);
      break;
    }
    case 'dumper':
      // Joins cheap auctions with a solid hold so anyone bidding short takes the minus; never bids short itself.
      if (value === 1) { enter = 0.4 * mind.aggr; bid = Math.min(typical * r(1.12, 1.3) * noise, perWin * 1.1); break; }
      enter = pace * 1.3;
      bid = Math.min(typical * r(1.1, 1.35) * noise, perWin);
      break;
    case 'watcher':
      if (value === 1) return null;
      enter = Math.min(0.95, (need / Math.max(1, bigLeft)) * 1.6 + 0.2);
      bid = Math.min(typical * r(1.15, 1.5) * noise * mind.aggr, perWin * 1.3, bank);
      break;
    default:
      break;
  }
  if (rand() >= Math.min(0.95, enter)) return null;
  // Shared judgement at full strength: never enter with a bid well under the going price (the shortest of two or more
  // bids takes −1) unless out of auctions — sitting out costs nothing.
  if (hard && bid < typical * 0.85 && left > need) return null;
  if (hard && perWin < typical * 0.75 && left > need + 1 && style !== 'bluff' && rand() < 0.6) return null;
  // A hard AI avoids round numbers (ties void the piece) by adding a few hundredths.
  return cap(bid + (hard ? r(0, 90) : 0));
}

/** A small seeded generator for simulations and tests. */
export function taRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1_000_000) / 1_000_000; };
}
