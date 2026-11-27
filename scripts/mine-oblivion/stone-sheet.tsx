// The mine-stone family at 20/32/48/96 px as one HTML sheet: `npx tsx scripts/mine-oblivion/stone-sheet.tsx out.html`
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { Crater, Footprint, MineStone, TreasureStone, WalkerStone } from '../../src/components/mineOblivion/MineStones';
const sizes = [20, 32, 48, 96];
const rows: [string, (s: number) => ReactElement][] = [
  ['잠든 지뢰 (dormant)', (s) => <MineStone size={s} state="dormant" />],
  ['깨어난 지뢰 (armed, 공개)', (s) => <MineStone size={s} state="armed" mark="#ffd76b" />],
  ['폭발 (blast)', (s) => <MineStone size={s} state="blast" />],
  ['보물', (s) => <TreasureStone size={s} />],
  ['찾은 보물', (s) => <TreasureStone size={s} dim />],
  ['나 · 흰 돌 헬멧', (s) => <WalkerStone seat={0} size={s} glow />],
  ['상대 · 검은 돌 헬멧', (s) => <WalkerStone seat={1} size={s} />],
  ['터진 자리 · 발자국', (s) => <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Crater size={s} /><Footprint seat={0} size={Math.max(12, s / 2)} /><Footprint seat={1} size={Math.max(12, s / 2)} /></span>],
];
const body = renderToStaticMarkup(
  <div style={{ padding: 28, fontFamily: 'Apple SD Gothic Neo, sans-serif', color: '#eee', background: 'radial-gradient(120% 60% at 50% -10%, #5b2c4a 0%, #2a1a33 38%, #0d0b12 75%)', width: 760 }}>
    <h1 style={{ margin: '0 0 4px', fontSize: 26 }}>망각의 지뢰 · 바둑알 가족</h1>
    <p style={{ margin: '0 0 18px', color: '#aaa', fontSize: 13 }}>20 / 32 / 48 / 96 px · 순수 SVG, 블러 그림자 없음</p>
    <table style={{ borderCollapse: 'collapse' }}><tbody>
      {rows.map(([label, f]) => (
        <tr key={label} style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <td style={{ padding: '10px 16px 10px 0', fontSize: 14, fontWeight: 700, width: 190 }}>{label}</td>
          {sizes.map((s) => <td key={s} style={{ padding: 10, width: 110, height: 110, background: '#3a3524', border: '1px solid #000' }}><div style={{ display: 'flex', justifyContent: 'center' }}>{f(s)}</div></td>)}
        </tr>
      ))}
    </tbody></table>
  </div>,
);
writeFileSync(process.argv[2], `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0d0b12">${body}</body>`);
