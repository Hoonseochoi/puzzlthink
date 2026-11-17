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
