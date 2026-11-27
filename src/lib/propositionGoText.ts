// 명제 바둑: a proposition as a short line of tokens — stone chips, region chips (a mini board with the cells lit)
// and a few words — in Korean (first) or English. `propText` gives the same line as plain text (share text, alt
// text, the length budget in scripts/proposition-go/check.ts).
import { type Prop, type RegionId, STONES } from './propositionGo';

export type Token =
  | { k: 'w'; v: string }
  | { k: 'stone'; colour: number }
  | { k: 'region'; r: RegionId; label: string };

type Loc = 'ko' | 'en';

/** 받침 test for 은/는, 이/가, 와/과. */
const hasFinal = (word: string) => {
  const ch = word.charCodeAt(word.length - 1);
  return ch >= 0xac00 && ch <= 0xd7a3 && (ch - 0xac00) % 28 !== 0;
};
const josa = (word: string, withFinal: string, without: string) => (hasFinal(word) ? withFinal : without);

const KO_REGION: Record<RegionId, string> = {
  r0: '1행', r1: '2행', r2: '3행', r3: '4행', c0: '1열', c1: '2열', c2: '3열', c3: '4열',
  corner: '모서리', edge: '가장자리', center: '가운데', top: '위쪽 절반', bottom: '아래쪽 절반', left: '왼쪽 절반', right: '오른쪽 절반',
};
const EN_REGION: Record<RegionId, { at: string; many: string }> = {
  r0: { at: 'in row 1', many: 'in row 1' }, r1: { at: 'in row 2', many: 'in row 2' }, r2: { at: 'in row 3', many: 'in row 3' }, r3: { at: 'in row 4', many: 'in row 4' },
  c0: { at: 'in column 1', many: 'in column 1' }, c1: { at: 'in column 2', many: 'in column 2' }, c2: { at: 'in column 3', many: 'in column 3' }, c3: { at: 'in column 4', many: 'in column 4' },
  corner: { at: 'in a corner', many: 'in the corners' }, edge: { at: 'on the edge', many: 'on the edge' }, center: { at: 'in the middle', many: 'in the middle' },
  top: { at: 'in the top half', many: 'in the top half' }, bottom: { at: 'in the bottom half', many: 'in the bottom half' },
  left: { at: 'in the left half', many: 'in the left half' }, right: { at: 'in the right half', many: 'in the right half' },
};

/** Region chip label (short; the chip's mini board says the rest). */
export const regionLabel = (r: RegionId, locale: Loc, many = false) => (locale === 'ko' ? KO_REGION[r] : EN_REGION[r][many ? 'many' : 'at']);

/** `stones`: the puzzle's colour indexes (prop stone i is colour stones[i]). */
export function propTokens(p: Prop, stones: number[], locale: Loc): Token[] {
  const S = (i: number): Token => ({ k: 'stone', colour: stones[i] });
  const R = (r: RegionId, many = false): Token => ({ k: 'region', r, label: regionLabel(r, locale, many) });
  const w = (v: string): Token => ({ k: 'w', v });
  const name = (i: number) => (locale === 'ko' ? STONES[stones[i]].ko : STONES[stones[i]].en);
  if (locale === 'ko') {
    const eun = (i: number) => w(josa(name(i), '은', '는'));
    const wa = (i: number) => w(josa(name(i), '과', '와'));
    const ga = (i: number) => w(josa(name(i), '이', '가'));
    switch (p.t) {
      case 'in': return [S(p.s), eun(p.s), R(p.r), w('에 있다')];
      case 'out': return [S(p.s), eun(p.s), R(p.r), w('에 없다')];
      case 'adj': return [S(p.a), wa(p.a), S(p.b), eun(p.b), w('붙어 있다')];
      case 'nadj': return [S(p.a), wa(p.a), S(p.b), eun(p.b), w('안 붙어 있다')];
      case 'diag': return [S(p.a), wa(p.a), S(p.b), eun(p.b), w('대각선 이웃')];
      case 'line': return [S(p.a), wa(p.a), S(p.b), eun(p.b), w(p.d === 'row' ? '같은 행' : '같은 열')];
      case 'nline': return [S(p.a), wa(p.a), S(p.b), eun(p.b), w(p.d === 'row' ? '다른 행' : '다른 열')];
      case 'above': return [S(p.a), eun(p.a), S(p.b), w('보다 위')];
      case 'left': return [S(p.a), eun(p.a), S(p.b), w('보다 왼쪽')];
      case 'next': return [S(p.b), eun(p.b), S(p.a), w(p.d === 'down' ? '바로 아래' : '바로 오른쪽')];
      case 'count': return p.n === 0 ? [R(p.r, true), w('에 돌이 없다')] : [R(p.r, true), w(`에 돌이 ${p.n}개`)];
      case 'with': return p.n === 0
        ? [S(p.s), eun(p.s), w(p.d === 'row' ? '자기 행에 혼자' : '자기 열에 혼자')]
        : [S(p.s), wa(p.s), w(`같은 ${p.d === 'row' ? '행' : '열'}에 돌 ${p.n}개 더`)];
      case 'if': return [S(p.a), ga(p.a), R(p.ra), w('에 있으면'), S(p.b), eun(p.b), R(p.rb), w(p.neg ? '에 없다' : '에 있다')];
    }
  }
  switch (p.t) {
    case 'in': return [S(p.s), w('is'), R(p.r)];
    case 'out': return [S(p.s), w('is not'), R(p.r)];
    case 'adj': return [S(p.a), w('touches'), S(p.b)];
    case 'nadj': return [S(p.a), w('does not touch'), S(p.b)];
    case 'diag': return [S(p.a), w('touches'), S(p.b), w('diagonally')];
    case 'line': return [S(p.a), w('and'), S(p.b), w(p.d === 'row' ? 'share a row' : 'share a column')];
    case 'nline': return [S(p.a), w('and'), S(p.b), w(p.d === 'row' ? 'are in different rows' : 'are in different columns')];
    case 'above': return [S(p.a), w('is above'), S(p.b)];
    case 'left': return [S(p.a), w('is left of'), S(p.b)];
    case 'next': return [S(p.b), w(p.d === 'down' ? 'is right below' : 'is just right of'), S(p.a)];
    case 'count': return p.n === 0 ? [w('No stones'), R(p.r, true)] : [w(p.n === 1 ? '1 stone' : `${p.n} stones`), R(p.r, true)];
    case 'with': return p.n === 0
      ? [S(p.s), w(p.d === 'row' ? 'is alone in its row' : 'is alone in its column')]
      : [w(`${p.n} more in`), S(p.s), w(p.d === 'row' ? "'s row" : "'s column")];
    case 'if': return [w('If'), S(p.a), w("'s"), R(p.ra), w(','), S(p.b), w(p.neg ? "isn't" : "'s"), R(p.rb)];
  }
}

/** A particle or ending glued to the chip before it (no space): 빨강|은, 1행|에 있다, 파랑|보다 위, Red|'s row. */
export const joinsPrev = (t: Token, locale: Loc) => t.k === 'w' && (locale === 'ko' ? /^(은|는|이|가|와|과|에 |에$|보다)/.test(t.v) : /^('s|,)/.test(t.v));

/** The line as plain text (stone names spelled out). */
export function propText(p: Prop, stones: number[], locale: Loc): string {
  const toks = propTokens(p, stones, locale);
  let out = '';
  for (const t of toks) {
    const piece = t.k === 'w' ? t.v : t.k === 'stone' ? (locale === 'ko' ? STONES[t.colour].ko : STONES[t.colour].en) : t.label;
    out += !out || joinsPrev(t, locale) ? piece : ' ' + piece;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** How a stone is called on screen (tray, reactions, aria). */
export const stoneName = (colour: number, locale: Loc) => (locale === 'ko' ? STONES[colour].ko : STONES[colour].en);
