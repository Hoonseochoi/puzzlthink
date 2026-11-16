import type { Side, Size } from '@/lib/russianJanggi';
import { DOME, SIDE_COLORS } from './theme';

/** A dome piece. Size is shown by scale plus 1–3 pips so it reads at a glance. */
export default function RJPiece({ owner, size, className = '', style }: { owner: Side; size: Size; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`relative flex items-center justify-center rounded-full ${className}`}
      style={{ background: DOME[owner], boxShadow: `0 8px 18px rgba(0,0,0,.45), inset 0 -6px 12px rgba(0,0,0,.28), 0 0 22px ${SIDE_COLORS[owner]}33`, ...style }}
    >
      <span className="absolute left-[22%] top-[14%] h-[22%] w-[34%] rotate-[-24deg] rounded-full bg-white/45 blur-[1.5px]" />
      <span className="relative flex gap-[10%]" style={{ width: '50%', justifyContent: 'center' }}>
        {Array.from({ length: size + 1 }, (_, i) => <i key={i} className="block aspect-square w-[22%] rounded-full bg-white/80 shadow-[inset_0_-1px_0_rgba(0,0,0,.2)]" />)}
      </span>
    </span>
  );
}
