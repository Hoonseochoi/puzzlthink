import { CUTE_DIGITS, DIGIT_PEN, bulbIndex, starPath } from './slitherGlyphs';

// Shared pieces for generated link-preview (Open Graph) images.
export const OG_SIZE = { width: 1200, height: 630 };

/** Loads a Google font subset containing exactly `text`, as TTF for ImageResponse. */
export async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null; // Fall back to the default font rather than failing the build.
  }
}

export async function fontsFor(text: string, hanja = '') {
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 900; style: 'normal' }[] = [];
  const sans = await loadFont('Noto Sans KR', 900, text);
  if (sans) fonts.push({ name: 'Noto Sans KR', data: sans, weight: 900, style: 'normal' });
  const sans4 = await loadFont('Noto Sans KR', 400, text);
  if (sans4) fonts.push({ name: 'Noto Sans KR', data: sans4, weight: 400, style: 'normal' });
  if (hanja) {
    const serif = await loadFont('Noto Serif KR', 900, hanja);
    if (serif) fonts.push({ name: 'Noto Serif KR', data: serif, weight: 900, style: 'normal' });
  }
  return fonts;
}

/**
 * Drawing a preview image costs seconds of CPU on the edge, and chat apps give up on a slow image. This keeps
 * the finished PNG in the Cloudflare cache of that location for a week; `key` must change when the picture
 * does. Where there is no edge cache (next dev, build) it just renders.
 */
export async function cachedImage(key: string, render: () => Promise<Response>): Promise<Response> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const url = `https://og-cache.puzzlthink.com/${encodeURIComponent(key)}`;
  try {
    const hit = await cache?.match(url);
    if (hit) return new Response(hit.body, { headers: { 'Content-Type': 'image/png' } });
  } catch { /* render instead */ }
  const res = await render();
  if (!cache || !res.ok) return res;
  const png = await res.arrayBuffer();
  try {
    await cache.put(url, new Response(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' } }));
  } catch { /* still serve it */ }
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}

export const ogLocale = (locale: string) => (locale === 'en' ? 'en' : 'ko');

// ---------- mini drawings (Satori: every multi-child div needs display:flex) ----------

export function WallGoMini({ size = 300 }: { size?: number }) {
  const cell = size / 7;
  const walls: [number, number, 'h' | 'v'][] = [[1, 2, 'v'], [2, 2, 'v'], [3, 4, 'h'], [3, 5, 'h'], [4, 1, 'h'], [4, 2, 'h'], [5, 5, 'v']];
  const pieces: [number, number, string][] = [[1, 3, '#e0283a'], [4, 4, '#6f86b8'], [5, 1, '#9aa1ad'], [2, 5, '#e0283a']];
  return (
    <div style={{ display: 'flex', position: 'relative', width: size, height: size, background: '#17181e', border: '3px solid #8d95a8', borderRadius: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => <div key={`v${i}`} style={{ position: 'absolute', left: cell * (i + 1), top: 0, width: 1, height: size, background: '#2a2c35' }} />)}
      {Array.from({ length: 6 }).map((_, i) => <div key={`h${i}`} style={{ position: 'absolute', top: cell * (i + 1), left: 0, height: 1, width: size, background: '#2a2c35' }} />)}
      {walls.map(([r, c, d]) => <div key={`w${r}${c}${d}`} style={{ position: 'absolute', left: d === 'v' ? cell * c - 4 : cell * c, top: d === 'v' ? cell * r : cell * r - 4, width: d === 'v' ? 8 : cell, height: d === 'v' ? cell : 8, borderRadius: 3, background: '#e6e9f0' }} />)}
      {pieces.map(([r, c, color]) => (
        <div key={`p${r}${c}`} style={{ position: 'absolute', left: cell * c + cell * 0.18, top: cell * r + cell * 0.18, width: cell * 0.64, height: cell * 0.64, borderRadius: 999, background: color, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: cell * 0.1 }}>
          <div style={{ width: cell * 0.09, height: cell * 0.2, borderRadius: 99, background: '#fff', transform: 'rotate(-20deg)' }} />
          <div style={{ width: cell * 0.08, height: cell * 0.18, borderRadius: 99, background: '#fff', transform: 'rotate(-20deg)' }} />
        </div>
      ))}
    </div>
  );
}

export function JanggiTile({ glyph, color, size = 110, flipped = false }: { glyph: string; color: string; size?: number; flipped?: boolean }) {
  return (
    <div style={{ display: 'flex', width: size, height: size, borderRadius: size * 0.2, background: 'linear-gradient(#fffdf7, #efe5cf)', boxShadow: '0 8px 20px rgba(0,0,0,.45)', justifyContent: 'center', alignItems: 'center', transform: flipped ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <div style={{ display: 'flex', width: size * 0.84, height: size * 0.84, borderRadius: size * 0.15, border: `3px solid ${color}`, justifyContent: 'center', alignItems: 'center', fontFamily: 'Noto Serif KR', fontSize: size * 0.5, color }}>{glyph}</div>
    </div>
  );
}

export function SudokuMini({ size = 260 }: { size?: number }) {
  const digits = '8.4..2.1.7..6.9.3.5.....1.9..4...8.7..1.5...3..2..6.4.....9.2.1.6..8.4.5.7..3.1.6';
  const cell = (size - 1) / 9; // borders are inside each cell; -1px avoids float wrap
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', width: size + 8, height: size + 8, padding: 4, background: '#17201e', borderRadius: 14 }}>
      {Array.from({ length: 81 }).map((_, i) => {
        const r = Math.floor(i / 9), c = i % 9, d = digits[i];
        return <div key={i} style={{ display: 'flex', width: cell, height: cell, justifyContent: 'center', alignItems: 'center', background: r === 4 || c === 4 ? '#edf2ff' : '#fff', borderRight: c === 2 || c === 5 ? '2px solid #17201e' : '1px solid #e3e3e3', borderBottom: r === 2 || r === 5 ? '2px solid #17201e' : '1px solid #e3e3e3', fontSize: cell * 0.55, color: r === 4 && c === 4 ? '#4b7bff' : '#17201e' }}>{d === '.' ? '' : d}</div>;
      })}
    </div>
  );
}

// ---------- shared game card (newer games) ----------

/**
 * Standard link-preview card: show tag, big title, one line, mode chips on the left; the game's own
 * mini drawing on the right. `accent` tints the glow and the highlighted chip.
 */
export function GameOgCard({ kicker, title, sub, modes, accent, glow, art }: {
  kicker: string; title: string; sub: string; modes: string[]; accent: string; glow: string; art: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#0b0c10', backgroundImage: `radial-gradient(ellipse 65% 60% at 80% 40%, ${glow}, rgba(11,12,16,0) 70%)`, fontFamily: 'Noto Sans KR', color: '#eef0f3', padding: '56px 64px', gap: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 999, border: '2px solid rgba(255,45,85,0.7)', background: '#0b0a10', fontSize: 22, fontWeight: 900, color: '#ff5c7a', letterSpacing: 2 }}>{kicker}</div>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 900, letterSpacing: -4, marginTop: 16, lineHeight: 1.05 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 27, fontWeight: 400, marginTop: 10, color: 'rgba(238,240,243,0.72)' }}>{sub}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
          {modes.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 12, fontSize: 22, fontWeight: 900, background: i === 0 ? accent : 'rgba(255,255,255,0.08)', color: i === 0 ? '#111318' : '#eef0f3' }}>{m}</div>)}
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(238,240,243,0.45)', marginTop: 34 }}>PUZZLTHINK · puzzlthink.com</div>
      </div>
      <div style={{ display: 'flex' }}>{art}</div>
    </div>
  );
}

/** Text that a card draws, for loading just those glyphs. */
export const ogText = (c: { kicker: string; title: string; sub: string; modes: string[] }, extra = '') => `PUZZLTHINK puzzlthink.com${c.kicker}${c.title}${c.sub}${c.modes.join('')}${extra}`;

// ---------- trending cards (벽바둑 · 벽바둑 II · 슬리더링크) ----------

/**
 * Link-preview card for the games people are coming for right now: show tag + "요즘 인기" badge, big title,
 * one short hook line, and a bright "무료 · 바로 플레이" chip first so it reads as playable at a glance.
 */
export function TrendOgCard({ kicker, hot, title, sub, modes, accent, glow, art }: {
  kicker: string; hot: string; title: string; sub: string; modes: string[]; accent: string; glow: string; art: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#0a0b0f', backgroundImage: `radial-gradient(ellipse 60% 75% at 82% 50%, ${glow}, rgba(10,11,15,0) 72%), radial-gradient(ellipse 50% 40% at 10% 0%, rgba(255,255,255,0.06), rgba(10,11,15,0) 70%)`, fontFamily: 'Noto Sans KR', color: '#f2f4f8', padding: '48px 56px 48px 64px', gap: 36 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', padding: '8px 16px', borderRadius: 999, border: '2px solid rgba(255,77,94,0.75)', fontSize: 22, fontWeight: 900, color: '#ff6b7a' }}>{kicker}</div>
          <div style={{ display: 'flex', padding: '8px 14px', borderRadius: 999, background: '#ffcc33', fontSize: 22, fontWeight: 900, color: '#241a00' }}>{hot}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 112, fontWeight: 900, letterSpacing: -4, marginTop: 14, lineHeight: 1.08 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, marginTop: 6, color: 'rgba(242,244,248,0.86)', letterSpacing: -0.5 }}>{sub}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 30 }}>
          {modes.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 12, fontSize: 22, fontWeight: 900, background: i === 0 ? accent : 'rgba(255,255,255,0.09)', color: i === 0 ? '#ffffff' : '#e6e9ef', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.14)' }}>{m}</div>)}
        </div>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 400, color: 'rgba(242,244,248,0.45)', marginTop: 30 }}>PUZZLTHINK · puzzlthink.com</div>
      </div>
      <div style={{ display: 'flex' }}>{art}</div>
    </div>
  );
}

/**
 * The Christmas-theme board (the game's default look): cream board, the game's own rounded numerals, the finished
 * loop as a lit fairy-light garland and a star on top. One inline SVG.
 */
export function SlitherXmasBoardArt({ size = 430 }: { size?: number }) {
  const bulbs = ['#ff4d5e', '#ffc23d', '#46b4ff', '#ff86c8', '#7be07f'];
  const mids = SL_LOOP.map(([h, r, c]) => ({ x: h ? c + 1 : c + 0.5, y: h ? r + 0.5 : r + 1, k: bulbIndex(!!h, r, c, bulbs.length) }));
  return (
    <div style={{ display: 'flex', padding: 14, borderRadius: 22, background: 'linear-gradient(135deg, #1e6b47, #123528 55%, #1e6b47)', boxShadow: '0 0 60px rgba(255,194,61,0.25)' }}>
      <svg width={size} height={size} viewBox="0 0 8 8">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="0.5" stopColor="#fffaf0" /><stop offset="1" stopColor="#eef5f3" /></linearGradient>
          {bulbs.map((c, i) => <radialGradient key={c} id={`g${i}`}><stop offset="0" stopColor={c} stopOpacity={0.75} /><stop offset="0.45" stopColor={c} stopOpacity={0.28} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>)}
          <radialGradient id="star"><stop offset="0" stopColor="#ffe27a" stopOpacity={0.85} /><stop offset="1" stopColor="#ffe27a" stopOpacity={0} /></radialGradient>
        </defs>
        <rect width={8} height={8} fill="url(#bg)" />
        {SL_CLUES.flatMap((row, r) => [...row].map((ch, c) => ch === '.' ? null : (
          <path key={`n${r}${c}`} d={CUTE_DIGITS[Number(ch)]} transform={`translate(${c + 1} ${r + 1})`} fill="none" stroke="#23935c" strokeWidth={DIGIT_PEN} strokeLinecap="round" strokeLinejoin="round" />
        )))}
        {SL_LOOP.map(([h, r, c], i) => <line key={`l${i}`} x1={c + 0.5} y1={r + 0.5} x2={h ? c + 1.5 : c + 0.5} y2={h ? r + 0.5 : r + 1.5} stroke="#1e6b47" strokeWidth={0.1} strokeLinecap="round" />)}
        {mids.map((m, i) => <circle key={`h${i}`} cx={m.x} cy={m.y} r={0.3} fill={`url(#g${m.k})`} />)}
        {mids.map((m, i) => <circle key={`b${i}`} cx={m.x} cy={m.y} r={0.08} fill={bulbs[m.k]} stroke="#ffffff" strokeWidth={0.018} />)}
        {Array.from({ length: 64 }, (_, i) => <circle key={`d${i}`} cx={(i % 8) + 0.5} cy={Math.floor(i / 8) + 0.5} r={0.07} fill="#2c5747" />)}
        <circle cx={2} cy={0.5} r={0.6} fill="url(#star)" />
        <path d={starPath(0.38, 0.46)} transform="translate(2 0.5)" fill="#ffd34d" stroke="#c98a00" strokeWidth={0.03} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export const trendText = (c: { kicker: string; hot: string; title: string; sub: string; modes: string[] }) => `PUZZLTHINK puzzlthink.com${c.kicker}${c.hot}${c.title}${c.sub}${c.modes.join('')}`;

type WgPiece = { r: number; c: number; p: 0 | 1 | 2; shape?: 'circle' | 'square' };
const WG_COLOR = ['#e0283a', '#6f86b8', '#a3a9b5'];
const WG_TINT = ['rgba(224,40,58,0.30)', 'rgba(111,134,184,0.32)', 'rgba(163,169,181,0.22)'];

/**
 * A 벽바둑 game in progress: two corners already walled off and tinted as someone's ground, pieces with the
 * eyes, a few loose walls. `variant` 2 draws 벽바둑 II's square and round pieces.
 */
export function WallGoBoardArt({ size = 440, variant = 1 }: { size?: number; variant?: 1 | 2 }) {
  const n = 7, cell = size / n;
  const owned: [number, number, 0 | 1][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) owned.push([r, c, 0]);
  for (let r = 4; r < 7; r++) for (let c = 4; c < 7; c++) owned.push([r, c, 1]);
  // [row, col, dir]: 'v' = wall on the left edge of (row, col); 'h' = wall on the top edge.
  const walls: [number, number, 'h' | 'v'][] = [
    [0, 3, 'v'], [1, 3, 'v'], [2, 3, 'v'], [3, 0, 'h'], [3, 1, 'h'], [3, 2, 'h'],
    [4, 4, 'v'], [5, 4, 'v'], [6, 4, 'v'], [4, 4, 'h'], [4, 5, 'h'], [4, 6, 'h'],
    [2, 5, 'h'], [3, 2, 'v'], [1, 5, 'v'],
  ];
  const pieces: WgPiece[] = variant === 2
    ? [{ r: 1, c: 1, p: 0, shape: 'square' }, { r: 2, c: 0, p: 0, shape: 'circle' }, { r: 5, c: 5, p: 1, shape: 'square' }, { r: 4, c: 6, p: 1, shape: 'circle' }, { r: 3, c: 4, p: 2, shape: 'square' }, { r: 1, c: 4, p: 2, shape: 'circle' }]
    : [{ r: 1, c: 1, p: 0 }, { r: 2, c: 0, p: 0 }, { r: 5, c: 5, p: 1 }, { r: 4, c: 6, p: 1 }, { r: 3, c: 4, p: 2 }, { r: 1, c: 4, p: 2 }];
  return (
    <div style={{ display: 'flex', padding: 14, borderRadius: 18, background: 'linear-gradient(135deg, #3a3d47, #1c1e24 55%, #33363f)' }}>
      <div style={{ display: 'flex', position: 'relative', width: size, height: size, background: '#15161b' }}>
        {owned.map(([r, c, p]) => <div key={`o${r}${c}`} style={{ position: 'absolute', left: cell * c, top: cell * r, width: cell, height: cell, background: WG_TINT[p] }} />)}
        {Array.from({ length: n - 1 }).map((_, i) => <div key={`v${i}`} style={{ position: 'absolute', left: cell * (i + 1), top: 0, width: 1, height: size, background: 'rgba(255,255,255,0.09)' }} />)}
        {Array.from({ length: n - 1 }).map((_, i) => <div key={`h${i}`} style={{ position: 'absolute', top: cell * (i + 1), left: 0, height: 1, width: size, background: 'rgba(255,255,255,0.09)' }} />)}
        {walls.map(([r, c, d]) => <div key={`w${r}${c}${d}`} style={{ position: 'absolute', left: d === 'v' ? cell * c - 5 : cell * c + 2, top: d === 'v' ? cell * r + 2 : cell * r - 5, width: d === 'v' ? 10 : cell - 4, height: d === 'v' ? cell - 4 : 10, borderRadius: 4, background: '#f1f3f7' }} />)}
        {pieces.map(({ r, c, p, shape = 'circle' }) => (
          <div key={`p${r}${c}`} style={{ position: 'absolute', left: cell * c + cell * 0.15, top: cell * r + cell * 0.15, width: cell * 0.7, height: cell * 0.7, borderRadius: shape === 'square' ? cell * 0.14 : 999, background: WG_COLOR[p], display: 'flex', justifyContent: 'center', alignItems: 'center', gap: cell * 0.1 }}>
            <div style={{ width: cell * 0.1, height: cell * 0.22, borderRadius: 99, background: '#fff' }} />
            <div style={{ width: cell * 0.1, height: cell * 0.22, borderRadius: 99, background: '#fff' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// A 7×7-cell board with one answer (generatePuzzle(8, 42)); the loop is drawn most of the way round.
const SL_CLUES = ['.23..31', '2210..2', '.1..1..', '23322.1', '2......', '3..13..', '..3.310'];
// Loop edges in drawing order: [horizontal ? 1 : 0, row, col] (dot coordinates).
const SL_LOOP: [number, number, number][] = [[1,0,0],[1,0,1],[1,0,2],[0,0,3],[1,1,2],[1,1,1],[0,1,1],[0,2,1],[0,3,1],[1,4,1],[0,3,2],[1,3,2],[0,3,3],[1,4,3],[1,4,4],[0,3,5],[0,2,5],[0,1,5],[0,0,5],[1,0,5],[0,0,6],[0,1,6],[1,2,6],[0,2,7],[0,3,7],[0,4,7],[1,5,6],[1,5,5],[1,5,4],[0,5,4],[1,6,4],[0,6,5],[1,7,4],[1,7,3],[0,6,3],[1,6,2],[0,6,2],[1,7,1],[1,7,0],[0,6,0],[1,6,0],[0,5,1],[1,5,0],[0,4,0],[0,3,0],[0,2,0],[0,1,0],[0,0,0]];

/** Slitherlink board with the loop being drawn: lilac screen, violet dots and numbers, a bright pink line. */
export function SlitherBoardArt({ size = 430, drawn = 38 }: { size?: number; drawn?: number }) {
  const cells = 7, pad = size * 0.06, step = (size - pad * 2) / cells;
  const at = (v: number) => pad + v * step;
  const line = SL_LOOP.slice(0, drawn);
  const tip = (() => {
    const [h, r, c] = line[line.length - 1], [h2, r2, c2] = SL_LOOP[drawn % SL_LOOP.length];
    const a = h ? [[r, c], [r, c + 1]] : [[r, c], [r + 1, c]];
    const b = h2 ? [[r2, c2], [r2, c2 + 1]] : [[r2, c2], [r2 + 1, c2]];
    return a.find(([y, x]) => b.some(([y2, x2]) => y === y2 && x === x2)) ?? a[1];
  })();
  return (
    <div style={{ display: 'flex', padding: 14, borderRadius: 18, background: 'linear-gradient(135deg, #4a4652, #2a2731 55%, #46424e)' }}>
      <div style={{ display: 'flex', position: 'relative', width: size, height: size, background: '#ecebff' }}>
        {SL_CLUES.flatMap((row, r) => [...row].map((ch, c) => ch === '.' ? null : (
          <div key={`n${r}${c}`} style={{ display: 'flex', position: 'absolute', left: at(c), top: at(r), width: step, height: step, alignItems: 'center', justifyContent: 'center', fontSize: step * 0.56, fontWeight: 900, color: '#4b37b8' }}>{ch}</div>
        )))}
        {line.map(([h, r, c], i) => <div key={`l${i}`} style={{ position: 'absolute', left: at(c) - 4, top: at(r) - 4, width: h ? step + 8 : 8, height: h ? 8 : step + 8, borderRadius: 6, background: '#ff3d7f' }} />)}
        {Array.from({ length: (cells + 1) ** 2 }, (_, i) => <div key={`d${i}`} style={{ position: 'absolute', left: at(i % (cells + 1)) - 5, top: at(Math.floor(i / (cells + 1))) - 5, width: 10, height: 10, borderRadius: 10, background: '#4b37b8' }} />)}
        <div style={{ position: 'absolute', left: at(tip[1]) - 13, top: at(tip[0]) - 13, width: 26, height: 26, borderRadius: 26, background: '#ffffff', border: '6px solid #ff3d7f', boxShadow: '0 0 18px rgba(255,61,127,0.9)' }} />
      </div>
    </div>
  );
}
