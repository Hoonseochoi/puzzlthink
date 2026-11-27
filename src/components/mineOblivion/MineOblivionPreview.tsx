import { MineStone, TreasureStone, WalkerStone } from './MineStones';

/** A 5×5 corner of the minefield at dusk: the art for the entry screen and the home card. Fluid: fills its box. */
function Field() {
  const tiles = ['#3a3524', '#353322', '#3d3826', '#33301f', '#383424'];
  const fit = 'h-[82%] w-[82%]';
  const items: Record<number, React.ReactNode> = {
    6: <MineStone state="dormant" mark="#ff7a6e" className={fit} />,
    8: <TreasureStone className={fit} />,
    12: <WalkerStone seat={0} glow className={fit} />,
    13: <span className="rounded-full border-2 border-black bg-[#ffd23f] px-[0.35em] font-mono font-black leading-none text-black" style={{ fontSize: '9cqw' }}>3</span>,
    16: <MineStone state="armed" mark="#ffd76b" className={fit} />,
    18: <WalkerStone seat={1} className={fit} />,
    24: <MineStone state="blast" className="h-[96%] w-[96%]" />,
  };
  return (
    <div className="@container w-full rounded-[10px] p-[3%]" style={{ background: 'repeating-linear-gradient(135deg,#f5c518 0 9px,#141006 9px 18px)' }}>
      <div className="grid grid-cols-5 overflow-hidden rounded-[6px]">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className="flex aspect-square items-center justify-center border-[0.5px] border-black/35" style={{ background: tiles[(i * 7) % tiles.length] }}>{items[i]}</span>
        ))}
      </div>
    </div>
  );
}

export default function MineOblivionPreview() {
  return (
    <div className="relative mx-auto flex h-[250px] w-[250px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-[#ffb020]/30 md:w-full" style={{ background: 'radial-gradient(120% 80% at 50% 0%, #6a3050 0%, #2a1a33 45%, #0d0b12 85%)' }}>
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/45">MINE OF OBLIVION</p>
      <div className="w-[74%]"><Field /></div>
    </div>
  );
}

/** Home-card picture (in the 300px preview box like the other games). */
export function MineOblivionTile() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl" style={{ background: 'radial-gradient(120% 80% at 50% 0%, #6a3050 0%, #2a1a33 45%, #0d0b12 85%)' }}>
      <div className="w-[80%]"><Field /></div>
      <span className="absolute left-2 top-2 rounded-full bg-[#ffb020] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-black sm:left-3 sm:top-3">MINE</span>
    </div>
  );
}
