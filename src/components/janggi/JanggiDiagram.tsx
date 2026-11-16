import { COLS, DIRS, ROWS, type PieceType, type Side } from '@/lib/janggi';
import JanggiPiece from './JanggiPiece';
import { SIDE_COLORS, SIDE_SOFT } from './theme';

type RC = [number, number];
export type JanggiDiagramSpec = {
  pieces?: [PieceType, Side, number, number][];
  arrows?: [number, number, number, number, ('move' | 'capture' | 'drop')?][];
  dots?: RC[];
  blocked?: RC[];
  glow?: RC[];
  hands?: [Side, PieceType[]][];
};

const CELL = 60, GAP = 6, PAD = 10, HAND = 46;

export default function JanggiDiagram({ spec, label }: { spec: JanggiDiagramSpec; label: string }) {
  const hand = (side: Side) => spec.hands?.find(([s]) => s === side)?.[1] ?? null;
  const top = hand(1) ? HAND : 0;
  const bottom = hand(0) ? HAND : 0;
  const width = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;
  const boardH = PAD * 2 + ROWS * CELL + (ROWS - 1) * GAP;
  const x = (c: number) => PAD + c * (CELL + GAP);
  const y = (r: number) => top + PAD + r * (CELL + GAP);
  const cx = (c: number) => x(c) + CELL / 2, cy = (r: number) => y(r) + CELL / 2;

  const tray = (side: Side, types: PieceType[], ty: number) => (
    <g key={`tray-${side}`}>
      <rect x={PAD} y={ty + 4} width={width - PAD * 2} height={HAND - 8} rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" />
      <circle cx={PAD + 12} cy={ty + HAND / 2} r="3.5" fill={SIDE_COLORS[side]} />
      {types.map((type, i) => <JanggiPiece key={i} type={type} owner={side} flipped={side === 1} showReading={false} x={PAD + 24 + i * 36} y={ty + 7} size={32} />)}
    </g>
  );

  return (
    <svg viewBox={`0 0 ${width} ${top + boardH + bottom}`} role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <marker id="jd-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e8c170" /></marker>
        <marker id="jd-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff5b3a" /></marker>
      </defs>
      {hand(1) && tray(1, hand(1)!, 0)}
      <rect x="1" y={top + 1} width={width - 2} height={boardH - 2} rx="18" fill="#0f1116" stroke="rgba(232,193,112,0.45)" />
      {Array.from({ length: ROWS * COLS }).map((_, i) => {
        const r = Math.floor(i / COLS), c = i % COLS;
        const camp = r === 0 ? 1 : r === ROWS - 1 ? 0 : null;
        return <rect key={i} x={x(c)} y={y(r)} width={CELL} height={CELL} rx="12" fill={camp !== null ? SIDE_SOFT[camp] : 'rgba(255,255,255,0.03)'} stroke="rgba(255,255,255,0.06)" />;
      })}
      {spec.glow?.map(([r, c]) => <rect key={`g${r}${c}`} x={x(c) + 1} y={y(r) + 1} width={CELL - 2} height={CELL - 2} rx="11" fill="none" stroke="#e8c170" strokeWidth="2" />)}
      {spec.pieces?.map(([type, owner, r, c]) => <JanggiPiece key={`p${r}${c}`} type={type} owner={owner} flipped={owner === 1} x={x(c) + 4} y={y(r) + 4} size={CELL - 8} />)}
      {spec.dots?.map(([r, c]) => <circle key={`d${r}${c}`} cx={cx(c)} cy={cy(r)} r="6" fill="#e8c170" />)}
      {spec.blocked?.map(([r, c]) => (
        <g key={`b${r}${c}`} stroke="#ff5b3a" strokeWidth="3" strokeLinecap="round"><line x1={cx(c) - 9} y1={cy(r) - 9} x2={cx(c) + 9} y2={cy(r) + 9} /><line x1={cx(c) + 9} y1={cy(r) - 9} x2={cx(c) - 9} y2={cy(r) + 9} /></g>
      ))}
      {spec.arrows?.map(([r1, c1, r2, c2, kind = 'move']) => {
        const fromHand = r1 < 0 || r1 >= ROWS;
        const ax = fromHand ? cx(c1) : cx(c1), ay = fromHand ? (r1 < 0 ? top - HAND / 2 + 4 : top + boardH + HAND / 2 - 4) : cy(r1);
        const bx = cx(c2), by = cy(r2);
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const ux = (bx - ax) / len, uy = (by - ay) / len;
        const red = kind === 'capture';
        return <line key={`a${r1}${c1}${r2}${c2}`} x1={ax + ux * 16} y1={ay + uy * 16} x2={bx - ux * 14} y2={by - uy * 14} stroke={red ? '#ff5b3a' : '#e8c170'} strokeWidth="3" strokeDasharray={kind === 'drop' ? '5 4' : undefined} strokeLinecap="round" markerEnd={`url(#${red ? 'jd-arrow-red' : 'jd-arrow'})`} />;
      })}
      {hand(0) && tray(0, hand(0)!, top + boardH)}
    </svg>
  );
}

/** 3×3 chart of where one piece can step. */
export function JanggiMoveChart({ type, label }: { type: PieceType; label: string }) {
  const S = 34, G = 4;
  const allowed = new Set(DIRS[type].map(([dr, dc]) => `${dr},${dc}`));
  return (
    <svg viewBox={`0 0 ${S * 3 + G * 2} ${S * 3 + G * 2}`} role="img" aria-label={label} className="h-auto w-full">
      {[-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => {
        const px = (dc + 1) * (S + G), py = (dr + 1) * (S + G);
        if (dr === 0 && dc === 0) return <JanggiPiece key="c" type={type} owner={0} showReading={false} x={px} y={py} size={S} />;
        const ok = allowed.has(`${dr},${dc}`);
        return (
          <g key={`${dr}${dc}`}>
            <rect x={px} y={py} width={S} height={S} rx="8" fill={ok ? 'rgba(232,193,112,0.16)' : 'rgba(255,255,255,0.03)'} stroke={ok ? 'rgba(232,193,112,0.6)' : 'rgba(255,255,255,0.06)'} />
            {ok && <circle cx={px + S / 2} cy={py + S / 2} r="4.5" fill="#e8c170" />}
          </g>
        );
      }))}
    </svg>
  );
}
