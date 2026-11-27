// The 슬리더링크 share card: a 1200×675 PNG (16:9, fits X, Instagram, KakaoTalk) of the solved board in the
// player's theme, with the size, mode, time and the PUZZLTHINK name and link. Drawn on a canvas in the browser.
import { type Puzzle, edgeAt, geometry } from './slitherlink';
import type { SlitherTheme } from './slitherTheme';
import { CUTE_DIGITS, DIGIT_PEN, DIGIT_STRIPE, bulbIndex, starPath, starSpot } from './slitherGlyphs';
import { rng } from './slitherlink';

export const SHARE_W = 1200;
export const SHARE_H = 675;

export type ShareCardText = {
  title: string;    // 슬리더링크
  cleared: string;  // 클리어!
  kicker: string;   // MERRY CHRISTMAS / PUZZLTHINK
  detail: string;   // 11×11 · 연습
  timeLabel: string; time: string;
  extra?: string;   // 힌트 0개
  url: string;      // puzzlthink.com/slitherlink
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

/** Shrinks the font until `text` fits `max` pixels wide. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, max: number) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; } while (ctx.measureText(text).width > max && (s -= 2) > 12);
  return s;
}

/** Draws the solved board (the answer loop) at (x, y), `size` px square. */
export function drawBoard(ctx: CanvasRenderingContext2D, puzzle: Puzzle, theme: SlitherTheme, x: number, y: number, size: number) {
  const b = theme.board, n = puzzle.dots, u = size / n, g = geometry(puzzle.rows, puzzle.cols);
  const festive = theme.id !== 'classic';
  const P = (v: number) => v * u;
  ctx.save();
  ctx.translate(x, y);
  roundRect(ctx, 0, 0, size, size, Math.max(10, u * 0.3));
  if (b.bg2) { const gr = ctx.createLinearGradient(0, 0, size, size); gr.addColorStop(0, b.bg); gr.addColorStop(0.45, b.bg); gr.addColorStop(1, b.bg2); ctx.fillStyle = gr; } else ctx.fillStyle = b.bg;
  ctx.fill();
  ctx.save(); ctx.clip();
  // Clues.
  puzzle.clues.forEach((v, cell) => {
    if (v < 0) return;
    const r = Math.floor(cell / puzzle.cols), c = cell % puzzle.cols;
    if (theme.numerals === 'cute') {
      ctx.save(); ctx.translate(P(c + 1), P(r + 1)); ctx.scale(u, u);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const path = new Path2D(CUTE_DIGITS[v]);
      ctx.strokeStyle = b.num; ctx.lineWidth = DIGIT_PEN; ctx.stroke(path);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = DIGIT_STRIPE; ctx.setLineDash([0.05, 0.075]); ctx.stroke(path);
      ctx.restore();
    } else {
      ctx.fillStyle = b.num; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `600 ${P(0.56)}px Georgia, 'Times New Roman', serif`;
      ctx.fillText(String(v), P(c + 1), P(r + 1.03));
    }
  });
  // The loop.
  const edges = puzzle.solution.flatMap((on, e) => (on ? [e] : []));
  ctx.strokeStyle = b.line; ctx.lineWidth = P(0.1); ctx.lineCap = 'round';
  for (const e of edges) {
    const { horizontal, r, c } = edgeAt(g, e);
    ctx.beginPath(); ctx.moveTo(P(c + 0.5), P(r + 0.5)); ctx.lineTo(P(horizontal ? c + 1.5 : c + 0.5), P(horizontal ? r + 0.5 : r + 1.5)); ctx.stroke();
  }
  // Lit fairy lights.
  if (theme.line === 'garland' && b.bulbs) {
    for (const e of edges) {
      const { horizontal, r, c } = edgeAt(g, e);
      const cx = P(horizontal ? c + 1 : c + 0.5), cy = P(horizontal ? r + 0.5 : r + 1);
      const color = b.bulbs[bulbIndex(horizontal, r, c, b.bulbs.length)];
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, P(0.3));
      glow.addColorStop(0, `${color}bf`); glow.addColorStop(0.45, `${color}48`); glow.addColorStop(1, `${color}00`);
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, P(0.3), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = P(0.018);
      ctx.beginPath(); ctx.arc(cx, cy, P(0.08), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(cx - P(0.024), cy - P(0.026), P(0.022), 0, Math.PI * 2); ctx.fill();
    }
  }
  // Dots.
  ctx.fillStyle = b.dot;
  for (let i = 0; i < n * n; i++) { ctx.beginPath(); ctx.arc(P((i % n) + 0.5), P(Math.floor(i / n) + 0.5), P(festive ? 0.07 : 0.075), 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // The star on top of the loop.
  if (theme.effects.celebrate) {
    const spot = starSpot(g, puzzle.solution);
    if (spot) {
      const sx = P(spot.x), sy = P(spot.y);
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, P(0.6));
      halo.addColorStop(0, 'rgba(255,226,122,0.85)'); halo.addColorStop(1, 'rgba(255,226,122,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sx, sy, P(0.6), 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(sx, sy); ctx.scale(u, u);
      const star = new Path2D(starPath(0.36, 0.46));
      ctx.fillStyle = '#ffd34d'; ctx.fill(star); ctx.strokeStyle = '#c98a00'; ctx.lineWidth = 0.03; ctx.lineJoin = 'round'; ctx.stroke(star);
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Renders the whole card and returns it as a PNG. */
export async function renderShareCard(puzzle: Puzzle, theme: SlitherTheme, text: ShareCardText, fontFamily: string): Promise<Blob> {
  try { await document.fonts?.ready; } catch { /* no font API */ }
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_W; canvas.height = SHARE_H;
  const ctx = canvas.getContext('2d')!;
  const k = theme.card;
  const bg = ctx.createLinearGradient(0, 0, SHARE_W * 0.4, SHARE_H);
  bg.addColorStop(0, k.bg[0]); bg.addColorStop(1, k.bg[1]);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  const boardSize = 555, bx = 60, by = (SHARE_H - boardSize) / 2;
  const glow = ctx.createRadialGradient(bx + boardSize / 2, SHARE_H / 2, 40, bx + boardSize / 2, SHARE_H / 2, 470);
  glow.addColorStop(0, k.glow); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  // Snow on the festive card (the same flakes for the same board).
  if (theme.effects.snow) {
    const rand = rng(puzzle.seed ^ 0x5eed);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 90; i++) {
      ctx.globalAlpha = 0.18 + rand() * 0.5;
      ctx.beginPath(); ctx.arc(rand() * SHARE_W, rand() * SHARE_H, 1 + rand() * 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // Board with a soft shadow.
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = theme.board.bg; roundRect(ctx, bx, by, boardSize, boardSize, 18); ctx.fill(); ctx.restore();
  drawBoard(ctx, puzzle, theme, bx, by, boardSize);

  // Right column.
  const tx = 676, tw = SHARE_W - tx - 60;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  // Kicker pill.
  const ks = fit(ctx, text.kicker, 900, 22, fontFamily, tw);
  const kw = ctx.measureText(text.kicker).width + 34;
  ctx.fillStyle = k.accent; roundRect(ctx, tx, 78, kw, 42, 21); ctx.fill();
  ctx.fillStyle = theme.id === 'classic' ? '#ffffff' : '#2a1a00'; ctx.font = `900 ${ks}px ${fontFamily}`; ctx.fillText(text.kicker, tx + 17, 107);
  // Title.
  ctx.fillStyle = k.text; fit(ctx, text.title, 900, 84, fontFamily, tw); ctx.fillText(text.title, tx - 3, 208);
  ctx.fillStyle = k.accent; fit(ctx, text.cleared, 900, 64, fontFamily, tw); ctx.fillText(text.cleared, tx - 2, 282);
  // Detail.
  ctx.fillStyle = k.sub; fit(ctx, text.detail, 800, 30, fontFamily, tw); ctx.fillText(text.detail, tx, 336);
  // Time box.
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(ctx, tx, 368, tw, 132, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = k.sub; ctx.font = `800 22px ${fontFamily}`; ctx.fillText(text.timeLabel, tx + 24, 406);
  ctx.fillStyle = k.text; ctx.font = `900 72px ui-monospace, 'SF Mono', Menlo, Consolas, monospace`; ctx.fillText(text.time, tx + 22, 478);
  if (text.extra) { ctx.fillStyle = k.sub; ctx.textAlign = 'right'; fit(ctx, text.extra, 800, 22, fontFamily, tw / 2); ctx.fillText(text.extra, tx + tw - 24, 406); ctx.textAlign = 'left'; }
  // Brand + link.
  ctx.fillStyle = k.text; ctx.font = `900 34px ${fontFamily}`; ctx.fillText('PUZZLTHINK', tx, 568);
  ctx.fillStyle = k.sub; fit(ctx, text.url, 700, 24, fontFamily, tw); ctx.fillText(text.url, tx, 604);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas'))), 'image/png'));
}
