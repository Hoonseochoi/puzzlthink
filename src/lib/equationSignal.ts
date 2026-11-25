// 수식 신호등 (Equation Signal), the third game of 「데블스 플랜: 데드 어게인」's final.
// A hidden 9-cell equation (digits 0–9 and + − × ÷ = ^). Every guess is 9 cells of anything; each cell
// comes back green (right symbol, right place), yellow (in the equation, another place) or red (not in it,
// or more copies than the equation has). All nine green wins.
// On air each finalist wrote the other's equation; here the board writes it, so one to four can play.

export const CELLS = 9;
export const SYMBOLS = '0123456789+-*/^=';
export const CHALLENGE_MS = 10 * 60 * 1000;
export type Mark = 'g' | 'y' | 'r';

/** What a symbol looks like on the board (× ÷ − instead of * / -). */
export const glyph = (ch: string) => (ch === '*' ? '×' : ch === '/' ? '÷' : ch === '-' ? '−' : ch);
/** Keyboard key → symbol, or null. */
export const symbolOf = (key: string) => (key === 'x' || key === 'X' || key === '×' ? '*' : key === '÷' ? '/' : key === '−' ? '-' : SYMBOLS.includes(key) ? key : null);

const isDigit = (ch: string) => ch >= '0' && ch <= '9';

/**
 * Value of one side: ^ first (right to left), then × ÷, then + −. Null when it is not a well-formed
 * expression (operators side by side or at an end, a number starting with 0) or divides by zero.
 */
export function evaluate(expr: string): number | null {
  const tokens: (number | string)[] = [];
  for (let i = 0; i < expr.length;) {
    if (isDigit(expr[i])) {
      let j = i;
      while (j < expr.length && isDigit(expr[j])) j += 1;
      if (j - i > 1 && expr[i] === '0') return null;
      tokens.push(Number(expr.slice(i, j)));
      i = j;
    } else if ('+-*/^'.includes(expr[i])) { tokens.push(expr[i]); i += 1; } else return null;
  }
  if (tokens.length % 2 === 0) return null;
  for (let i = 0; i < tokens.length; i += 1) if ((typeof tokens[i] === 'number') !== (i % 2 === 0)) return null;
  // Powers, right to left.
  for (let i = tokens.length - 2; i > 0; i -= 2) {
    if (tokens[i] !== '^') continue;
    tokens.splice(i - 1, 3, Math.pow(tokens[i - 1] as number, tokens[i + 1] as number));
  }
  for (let i = 1; i < tokens.length;) {
    if (tokens[i] === '*') tokens.splice(i - 1, 3, (tokens[i - 1] as number) * (tokens[i + 1] as number));
    else if (tokens[i] === '/') {
      if (tokens[i + 1] === 0) return null;
      tokens.splice(i - 1, 3, (tokens[i - 1] as number) / (tokens[i + 1] as number));
    } else i += 2;
  }
  let value = tokens[0] as number;
  for (let i = 1; i < tokens.length; i += 2) value += (tokens[i] === '+' ? 1 : -1) * (tokens[i + 1] as number);
  return Number.isFinite(value) ? value : null;
}

/** A proper answer: 9 cells, at least one =, every side well formed and all sides equal. */
export function isEquation(text: string): boolean {
  if (text.length !== CELLS || !text.includes('=')) return false;
  const values = text.split('=').map(evaluate);
  return values.every((v) => v !== null && Math.abs(v - values[0]!) < 1e-9);
}

/** Colors for a guess. Greens first; then yellows left to right while the answer has copies left. */
export function markGuess(answer: string, guess: string): Mark[] {
  const marks: Mark[] = Array(CELLS).fill('r');
  const left = new Map<string, number>();
  for (let i = 0; i < CELLS; i += 1) {
    if (guess[i] === answer[i]) marks[i] = 'g';
    else left.set(answer[i], (left.get(answer[i]) ?? 0) + 1);
  }
  for (let i = 0; i < CELLS; i += 1) {
    if (marks[i] === 'g') continue;
    const n = left.get(guess[i]) ?? 0;
    if (n > 0) { marks[i] = 'y'; left.set(guess[i], n - 1); }
  }
  return marks;
}
export const solved = (marks: Mark[] | string) => [...marks].every((m) => m === 'g');

/** The best news so far about each symbol, for the keypad. */
export function keyMarks(rows: { guess: string; marks: Mark[] | string }[]): Record<string, Mark> {
  const rank = { r: 0, y: 1, g: 2 } as const;
  const out: Record<string, Mark> = {};
  for (const row of rows) [...row.guess].forEach((ch, i) => {
    const m = row.marks[i] as Mark;
    if (!(ch in out) || rank[m] > rank[out[ch]]) out[ch] = m;
  });
  return out;
}

// ---------- Random equations ----------

const pick = <T,>(list: readonly T[], rand: () => number) => list[Math.floor(rand() * list.length)];
const between = (lo: number, hi: number, rand: () => number) => lo + Math.floor(rand() * (hi - lo + 1));

/** One operand that suits the operator before it: nothing that does no work (+0, ×1, ÷1, ^1). */
function operand(op: string | null, rand: () => number) {
  if (op === '^') return between(2, 3, rand);
  if (op === '/') return between(2, 12, rand);
  if (op === '*') return between(2, rand() < 0.7 ? 12 : 99, rand);
  return between(1, rand() < 0.5 ? 9 : rand() < 0.8 ? 99 : 999, rand);
}

/**
 * A random 9-cell equation: an expression with one to three operators on the left and its value on the
 * right (now and then an expression on both sides). Values are whole and not negative.
 */
export function generateEquation(rand: () => number = Math.random): string {
  const ops = ['+', '+', '+', '-', '-', '-', '*', '*', '*', '/', '/', '^'] as const;
  for (let attempt = 0; attempt < 20000; attempt += 1) {
    const count = pick([1, 1, 2, 2, 2, 3], rand);
    let last = operand(null, rand);
    let left = String(last);
    let powered = false;
    for (let i = 0; i < count; i += 1) {
      let op: string = pick(ops, rand);
      // One power per equation, on a small base (and never stacked: 2^3^2 reads badly).
      if (op === '^' && (powered || last < 2 || last > 12 || left.endsWith(`^${last}`))) op = pick(['+', '-', '*'] as const, rand);
      if (op === '^') powered = true;
      last = operand(op, rand);
      left += op + last;
    }
    const value = evaluate(left);
    if (value === null || value < 1 || !Number.isInteger(value) || value > 99999) continue;
    let right = String(value);
    if (left.length + 1 + right.length < CELLS && rand() < 0.5) {
      // Both sides as expressions, e.g. 3*4=2*6.
      const op = pick(['+', '-', '*'] as const, rand);
      const a = operand(op === '*' ? '*' : null, rand);
      const b = op === '+' ? value - a : op === '-' ? a - value : value / a;
      if (!Number.isInteger(b) || b < (op === '*' ? 2 : 1)) continue;
      right = `${a}${op}${b}`;
    }
    const text = `${left}=${right}`;
    if (text.length !== CELLS || !isEquation(text)) continue;
    // Skip the dull ones: a side that is only zeros and ones tells nothing.
    if (new Set([...text].filter(isDigit)).size < 3) continue;
    return text;
  }
  return '6*7-12=30';
}
