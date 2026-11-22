// Edge numbering shared by the line boards (마슈 order: horizontals first, then verticals). Plain module.

/** Edge index between two neighbouring cells (마슈 numbering: horizontals first, then verticals), or -1. */
export function edgeOf(n: number, a: number, b: number) {
  const [x, y] = a < b ? [a, b] : [b, a];
  if (y === x + 1 && Math.floor(x / n) === Math.floor(y / n)) return Math.floor(x / n) * (n - 1) + (x % n);
  if (y === x + n) return n * (n - 1) + x;
  return -1;
}
/** The two cells of an edge. */
export function edgeCells(n: number, e: number): [number, number] {
  const H = n * (n - 1);
  if (e < H) { const r = Math.floor(e / (n - 1)), c = e % (n - 1); return [r * n + c, r * n + c + 1]; }
  const i = e - H;
  return [i, i + n];
}
