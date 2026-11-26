import type { StoneOwner } from '@/lib/blindGomoku';
import PieceStone, { usePieceOwner } from '../PieceStone';

export default function BlindStone({ color, owner, revealed = false, latest = false }: {
  color: string;
  owner: StoneOwner;
  revealed?: boolean;
  latest?: boolean;
}) {
  const fill = revealed
    ? owner === 'black' ? 'linear-gradient(145deg,#3d414a 0%,#08090c 72%)' : 'linear-gradient(145deg,#ffffff 0%,#bdc3ce 80%)'
    : `linear-gradient(145deg, color-mix(in srgb, ${color} 72%, white) 0%, ${color} 47%, color-mix(in srgb, ${color} 73%, black) 100%)`;
  const eye = revealed && owner === 'white' ? '#30343b' : '#ffffff';

  // Face up, a stone is its player's own 바둑알 (ring: black or white side). Face down it stays a plain colour, so nothing gives the owner away.
  const mine = usePieceOwner(revealed ? (owner === 'black' ? 0 : 1) : null);
  if (mine) return (
    <span className={`relative block h-full w-full transition-transform duration-300 ${latest ? 'scale-110 rounded-full ring-2 ring-[#ffd76b] ring-offset-2 ring-offset-transparent' : ''}`}>
      <PieceStone seat={owner === 'black' ? 0 : 1} color={owner === 'black' ? '#22252d' : '#e9ecf2'}>{null}</PieceStone>
    </span>
  );
  return (
    <span
      className={`relative block h-full w-full rounded-full border transition-transform duration-300 ${revealed && owner === 'white' ? 'border-white/90 shadow-[0_5px_12px_rgba(0,0,0,.35)]' : 'border-white/20 shadow-[0_5px_12px_rgba(0,0,0,.62)]'} ${latest ? 'scale-110 ring-2 ring-[#ffd76b] ring-offset-2 ring-offset-transparent' : ''}`}
      style={{ background: fill }}
    >
      <span className="absolute left-[29%] top-[33%] h-[15%] w-[11%] rounded-full" style={{ background: eye, opacity: revealed ? 0.72 : 0.9 }} />
      <span className="absolute right-[29%] top-[30%] h-[16%] w-[11%] rounded-full" style={{ background: eye, opacity: revealed ? 0.72 : 0.9 }} />
      {!revealed && <span className="absolute left-[22%] top-[14%] h-[18%] w-[30%] -rotate-[28deg] rounded-full bg-white/30 blur-[.2px]" />}
      {revealed && <span className={`absolute bottom-[18%] left-1/2 -translate-x-1/2 font-mono text-[28%] font-black tracking-tight ${owner === 'white' ? 'text-black/45' : 'text-white/45'}`}>{owner === 'black' ? 'B' : 'W'}</span>}
    </span>
  );
}
