// AI personalities shared by the betting games (흑과 백, 흑과 백 II, 인디언 포커, 양면 포커, Hit,Stay).
//
// A persona is a *style*, never a skill level: every persona works from the same full-strength estimate the game's
// best AI uses (exact counting, the same Monte Carlo), and only chooses differently between moves that estimate
// rates as close — which risks it prefers, when it spends, how it bets around the same odds, how it reacts to what
// the human has shown this match. Each game defines what each persona means in its own decision space; this file
// holds what the five games share: the cast (names, faces, blurbs, table talk), a seeded per-match variation and
// mood, and small helpers for reading the human's habits from visible information.

export type PersonaId = 'calc' | 'aggro' | 'careful' | 'bluffer' | 'trap' | 'chaser' | 'whim' | 'grinder' | 'opener' | 'closer';
export const PERSONA_IDS: readonly PersonaId[] = ['calc', 'aggro', 'careful', 'bluffer', 'trap', 'chaser', 'whim', 'grinder', 'opener', 'closer'];

type Text = { ko: string; en: string };
export type Persona = {
  id: PersonaId;
  name: string;
  nameEn: string;
  /** Face colour: the site's 바둑알 in this colour. */
  color: string;
  /** The style's name, shown on the result screen (the reveal). */
  style: Text;
  /** One line at the table: character, not a spoiler of the style. */
  blurb: Text;
  /** What the style does, for the reveal. Games can give a sharper one of their own. */
  plays: Text;
};

export const PERSONAS: Record<PersonaId, Persona> = {
  calc: {
    id: 'calc', name: '제로', nameEn: 'ZERO', color: '#7fb4ff',
    style: { ko: '계산기', en: 'The Calculator' },
    blurb: { ko: '말이 없다. 대신 무언가를 계속 세고 있다.', en: 'Says little. Keeps counting something.' },
    plays: { ko: '확률이 가장 높은 수를 고르고, 비슷하면 가장 무난한 쪽으로 갑니다.', en: 'Takes the highest-odds move; between close ones, the plainest.' },
  },
  aggro: {
    id: 'aggro', name: '레오', nameEn: 'LEO', color: '#ff6b6b',
    style: { ko: '공격형', en: 'The Attacker' },
    blurb: { ko: '먼저 치고 나가는 걸 좋아한다.', en: 'Likes to hit first.' },
    plays: { ko: '비슷한 수라면 더 세게 — 큰 수, 큰 베팅으로 압박을 겁니다.', en: 'Between close moves, the harder one: big plays and big bets.' },
  },
  careful: {
    id: 'careful', name: '모아', nameEn: 'MOA', color: '#9aa4b8',
    style: { ko: '신중형', en: 'The Careful One' },
    blurb: { ko: '아끼는 게 이기는 거라고 믿는다.', en: 'Believes saving is winning.' },
    plays: { ko: '확실하지 않으면 아낍니다. 큰 자원은 꼭 필요할 때만 꺼냅니다.', en: 'Saves unless sure; spends big only when it must.' },
  },
  bluffer: {
    id: 'bluffer', name: '루나', nameEn: 'LUNA', color: '#ffc04d',
    style: { ko: '블러퍼', en: 'The Bluffer' },
    blurb: { ko: '표정만으로는 절대 알 수 없다.', en: 'You will never read it from her face.' },
    plays: { ko: '약할 때 강한 척, 강할 때 약한 척하는 빈도가 가장 높습니다.', en: 'Plays weak as strong (and strong as weak) more often than anyone.' },
  },
  trap: {
    id: 'trap', name: '카이', nameEn: 'KAI', color: '#c08bff',
    style: { ko: '함정 설치형', en: 'The Trapper' },
    blurb: { ko: '져 주는 척이 특기다.', en: 'Good at looking beaten.' },
    plays: { ko: '강한 패를 숨기고 작게 시작해 상대가 먼저 크게 오게 만듭니다.', en: 'Hides strength and starts small so you are the one to go big.' },
  },
  chaser: {
    id: 'chaser', name: '베가', nameEn: 'VEGA', color: '#ff9f43',
    style: { ko: '추격자', en: 'The Chaser' },
    blurb: { ko: '뒤처지면 눈빛이 달라진다.', en: 'Changes when it falls behind.' },
    plays: { ko: '앞서면 지키고, 뒤처지면 위험을 감수하며 몰아붙입니다.', en: 'Guards a lead; when behind, takes the risks to catch up.' },
  },
  whim: {
    id: 'whim', name: '미로', nameEn: 'MIRO', color: '#ff7ad9',
    style: { ko: '변덕쟁이', en: 'The Wildcard' },
    blurb: { ko: '오늘 기분이 어떤지는 본인도 모른다.', en: 'Even it does not know its mood today.' },
    plays: { ko: '비슷한 수 사이에서 가장 자주 바꿔 둡니다. 패턴이 거의 없습니다.', en: 'Switches between close moves the most; leaves almost no pattern.' },
  },
  grinder: {
    id: 'grinder', name: '도담', nameEn: 'DODAM', color: '#5fcf8f',
    style: { ko: '버티기형', en: 'The Grinder' },
    blurb: { ko: '오래 가는 승부를 좋아한다.', en: 'Likes a long fight.' },
    plays: { ko: '크게 잃지 않는 쪽을 고르고, 작은 이득을 쌓아 끝까지 버팁니다.', en: 'Avoids big losses and piles up small edges to the end.' },
  },
  opener: {
    id: 'opener', name: '하루', nameEn: 'HARU', color: '#3fd0c9',
    style: { ko: '초반 승부사', en: 'The Fast Starter' },
    blurb: { ko: '시작하자마자 흐름을 가져오려 한다.', en: 'Wants the momentum from the first move.' },
    plays: { ko: '초반에 자원을 써서 앞서 나가고, 앞선 뒤에는 지킵니다.', en: 'Spends early to get ahead, then protects the lead.' },
  },
  closer: {
    id: 'closer', name: '녹스', nameEn: 'NOX', color: '#5b6cff',
    style: { ko: '막판 승부사', en: 'The Closer' },
    blurb: { ko: '진짜 승부는 마지막에 한다.', en: 'Saves the real fight for the end.' },
    plays: { ko: '초반엔 아끼며 정보를 모으고, 막판에 힘을 몰아 씁니다.', en: 'Saves and watches early, then puts everything into the end.' },
  },
};

export const personaName = (id: PersonaId, en: boolean) => (en ? PERSONAS[id].nameEn : PERSONAS[id].name);
export const isPersonaId = (v: unknown): v is PersonaId => typeof v === 'string' && (PERSONA_IDS as readonly string[]).includes(v);

// ── Random draws and per-match variation ─────────────────────────────────────────────────────────────────────

export type Rand = () => number;

/** Small seeded generator (mulberry32). */
export function seededRand(seed: number): Rand {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i += 1) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

/** `count` distinct personas at random. `avoid` (e.g. last match's) is skipped while enough others remain. */
export function drawPersonas(count: number, rand: Rand = Math.random, avoid: readonly PersonaId[] = []): PersonaId[] {
  const pool = PERSONA_IDS.filter((id) => !avoid.includes(id));
  const list = pool.length >= count ? pool : [...PERSONA_IDS];
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  return shuffled.slice(0, count);
}

export const newPersonaSeed = (rand: Rand = Math.random) => Math.floor(rand() * 2 ** 31);

/**
 * The persona as it plays one match: its id, a seed, and a mood in −1..1 (a little bolder or calmer than usual today).
 * `vary(key, spread)` is a factor in 1±spread, fixed for this match and key — so the same persona tunes its knobs a
 * little differently every match, but consistently within one.
 */
export type PersonaMatch = { id: PersonaId; seed: number; mood: number; vary: (key: string, spread?: number) => number };

export function personaMatch(id: PersonaId, seed: number): PersonaMatch {
  const mood = seededRand(seed ^ 0x5bd1e995)() * 2 - 1;
  return {
    id, seed, mood,
    vary: (key, spread = 0.15) => 1 + (seededRand(seed ^ hash(key))() * 2 - 1) * spread,
  };
}

// ── Reading the human (visible information only) ─────────────────────────────────────────────────────────────

/** A smoothed share: `hits` out of `n`, pulled toward `prior` by `weight` imaginary observations. */
export const smoothedShare = (hits: number, n: number, prior = 0.5, weight = 3) => (hits + prior * weight) / (n + weight);

/**
 * How predictable a run of choices is, 0 (all different) to 1 (always the same), from the share of the most common
 * choice, smoothed so two or three moves never look like a habit.
 */
export function habitStrength(choices: readonly (string | number)[]): number {
  if (choices.length < 3) return 0;
  const counts = new Map<string | number, number>();
  for (const c of choices) counts.set(c, (counts.get(c) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const kinds = Math.max(2, counts.size);
  const share = smoothedShare(top, choices.length, 1 / kinds, 2);
  return Math.max(0, Math.min(1, (share - 1 / kinds) / (1 - 1 / kinds)));
}

/**
 * Softmax pick over scored options. `temp` is how far below the best an option may be and still be chosen
 * (in the score's own units): small = nearly always the best.
 */
export function softPick<T>(options: readonly { v: T; s: number }[], temp: number, rand: Rand): T {
  const top = Math.max(...options.map((o) => o.s));
  const w = options.map((o) => Math.exp((o.s - top) / Math.max(1e-6, temp)));
  let r = rand() * w.reduce((a, x) => a + x, 0);
  for (let i = 0; i < options.length; i += 1) { r -= w[i]; if (r <= 0) return options[i].v; }
  return options[0].v;
}

// ── Table talk ───────────────────────────────────────────────────────────────────────────────────────────────

export type TalkEvent = 'hello' | 'winRound' | 'loseRound' | 'bold' | 'fold' | 'winGame' | 'loseGame';

const TALK: Record<PersonaId, Record<TalkEvent, [string, string]>> = {
  calc: { hello: ['계산 시작.', 'Counting.'], winRound: ['예상대로.', 'As expected.'], loseRound: ['오차 범위.', 'Within the margin.'], bold: ['기댓값이 높아.', 'The numbers say so.'], fold: ['손익이 안 맞아.', 'Bad odds.'], winGame: ['확률은 거짓말을 안 해.', 'Odds never lie.'], loseGame: ['표본이 부족했어.', 'Small sample.'] },
  aggro: { hello: ['바로 간다!', 'Here I come!'], winRound: ['이게 나야!', 'That’s me!'], loseRound: ['다음엔 더 세게.', 'Harder next time.'], bold: ['받아 봐!', 'Take this!'], fold: ['…이번만.', '…just this once.'], winGame: ['힘으로 밀었지!', 'Pure power!'], loseGame: ['다음 판, 다시!', 'Again, next game!'] },
  careful: { hello: ['천천히 가자.', 'Slowly now.'], winRound: ['아껴 둔 보람.', 'Saving paid off.'], loseRound: ['괜찮아, 남아 있어.', 'Fine, I still have plenty.'], bold: ['지금이야.', 'Now.'], fold: ['무리하지 않아.', 'No need to force it.'], winGame: ['끝까지 아꼈지.', 'Saved to the end.'], loseGame: ['너무 아꼈나…', 'Saved too much…'] },
  bluffer: { hello: ['내 얼굴 봐 봐.', 'Look at my face.'], winRound: ['믿었어?', 'You believed it?'], loseRound: ['들켰네.', 'Caught.'], bold: ['진짜일까?', 'Real or not?'], fold: ['이번엔 진짜 없어.', 'Nothing this time. Really.'], winGame: ['다 연기였어.', 'All an act.'], loseGame: ['다음엔 안 속을걸?', 'You won’t fall for it twice?'] },
  trap: { hello: ['살살 해 줘.', 'Go easy on me.'], winRound: ['걸렸다.', 'Gotcha.'], loseRound: ['어, 졌네~', 'Oh, I lost~'], bold: ['…', '…'], fold: ['무서워서.', 'Too scary.'], winGame: ['처음부터 함정이었지.', 'A trap from the start.'], loseGame: ['함정을 피했네.', 'You stepped around it.'] },
  chaser: { hello: ['따라잡는 건 자신 있어.', 'I’m good at catching up.'], winRound: ['좁혀졌다!', 'Closing in!'], loseRound: ['아직 멀었어.', 'Not done yet.'], bold: ['여기서 뒤집는다.', 'Turning it here.'], fold: ['기다린다.', 'Waiting.'], winGame: ['역전이다!', 'Comeback!'], loseGame: ['한 끗이 모자랐다.', 'Just short.'] },
  whim: { hello: ['오늘은… 음.', 'Today… hmm.'], winRound: ['그냥 그랬어.', 'Just felt like it.'], loseRound: ['기분 탓이야.', 'Mood thing.'], bold: ['이거다!', 'This one!'], fold: ['갑자기 싫어졌어.', 'Suddenly, no.'], winGame: ['재밌었다~', 'That was fun~'], loseGame: ['다음엔 다르게!', 'Different next time!'] },
  grinder: { hello: ['길게 가 보자.', 'Let’s go long.'], winRound: ['한 칸 더.', 'One more step.'], loseRound: ['버틴다.', 'Holding on.'], bold: ['쌓아 둔 걸 쓸 때.', 'Time to use what I saved.'], fold: ['작게 잃는 게 낫지.', 'Lose small.'], winGame: ['끝까지 버텼다.', 'Outlasted.'], loseGame: ['조금 모자랐어.', 'Not quite enough.'] },
  opener: { hello: ['첫 판부터 간다.', 'From the very first move.'], winRound: ['흐름은 내 거.', 'Momentum’s mine.'], loseRound: ['흐름을 뺏겼네.', 'Lost the momentum.'], bold: ['초반이 전부야.', 'The start is everything.'], fold: ['지킬 때야.', 'Time to protect.'], winGame: ['초반에 끝났지.', 'Over at the start.'], loseGame: ['너무 일찍 썼나.', 'Spent too soon?'] },
  closer: { hello: ['천천히 보자.', 'Let’s watch.'], winRound: ['아직이야.', 'Not yet.'], loseRound: ['계획대로.', 'As planned.'], bold: ['이제 시작이다.', 'Now it begins.'], fold: ['때가 아냐.', 'Not the time.'], winGame: ['마지막에 웃었지.', 'Laughed last.'], loseGame: ['막판이 짧았다.', 'The end came too fast.'] },
};

export const personaTalk = (id: PersonaId, event: TalkEvent, en: boolean) => TALK[id][event][en ? 1 : 0];

/** Talk only now and then, so it stays a moment and not a stream: `chance` is per event. */
export const shouldTalk = (event: TalkEvent, rand: Rand = Math.random) =>
  rand() < ({ hello: 1, winGame: 1, loseGame: 1, bold: 0.45, fold: 0.4, winRound: 0.3, loseRound: 0.3 } as const)[event];
