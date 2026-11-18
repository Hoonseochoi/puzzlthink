// 결! 합!: every card combines three ternary attributes. Three cards form a "hap"
// when, for every attribute, the values are either all identical or all different.

export type Ternary = 0 | 1 | 2;
export type GyulCard = { id: number; shape: Ternary; color: Ternary; background: Ternary };
export type Hap = [number, number, number]; // board indexes, always sorted

export const GYUL_ROUNDS = 10;

export const GYUL_DECK: readonly GyulCard[] = Array.from({ length: 27 }, (_, id) => ({
  id,
  shape: Math.floor(id / 9) as Ternary,
  color: (Math.floor(id / 3) % 3) as Ternary,
  background: (id % 3) as Ternary,
}));

const validAttribute = (values: Ternary[]) => new Set(values).size !== 2;

export function isHap(cards: readonly GyulCard[]) {
  return cards.length === 3
    && validAttribute(cards.map((card) => card.shape))
    && validAttribute(cards.map((card) => card.color))
    && validAttribute(cards.map((card) => card.background));
}

export const hapKey = (hap: readonly number[]) => [...hap].sort((a, b) => a - b).join('-');

export function allHaps(cards: readonly GyulCard[]): Hap[] {
  const out: Hap[] = [];
  for (let a = 0; a < cards.length - 2; a += 1) {
    for (let b = a + 1; b < cards.length - 1; b += 1) {
      for (let c = b + 1; c < cards.length; c += 1) {
        if (isHap([cards[a], cards[b], cards[c]])) out.push([a, b, c]);
      }
    }
  }
  return out;
}

export function remainingHaps(cards: readonly GyulCard[], found: readonly string[]) {
  const used = new Set(found);
  return allHaps(cards).filter((hap) => !used.has(hapKey(hap)));
}

export function dealGyulCards(rand: () => number = Math.random): GyulCard[] {
  const deck = [...GYUL_DECK];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, 9);
}
