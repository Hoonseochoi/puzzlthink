"use client";

import { GoldPig } from './piggyBank/PiggyParts';

/**
 * Square 300×300 pictures for the home cards and the game list, for games whose board does not fit a square
 * on its own. Fixed pixel sizes only (no breakpoints), so they look the same wherever they are scaled.
 */

const FRAME = 'relative h-[300px] w-[300px] overflow-hidden rounded-[28px] border-4 border-[#17201e] shadow-2xl';

// 무거운 13 -----------------------------------------------------------------------------------------
const CUBE_BG = 'linear-gradient(160deg, #f1e6cf 0%, #cdb791 60%, #ad9671 100%)';

function Cube({ value, color }: { value: number; color: string }) {
  return (
    <span className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[7px] text-[15px] font-black text-[#2a2118] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),inset_0_2px_0_rgba(255,255,255,.55),0_3px_8px_rgba(0,0,0,.45)]" style={{ background: CUBE_BG }}>
      <i className="absolute left-[4px] top-[4px] h-[5px] w-[5px] rounded-full" style={{ background: color }} />
      {value}
    </span>
  );
}

/** A porter stand: colour, weight so far out of 13, and its cubes stacked two per row from the bottom. */
function Stand({ color, cubes, bust = false }: { color: string; cubes: number[]; bust?: boolean }) {
  const total = cubes.reduce((a, b) => a + b, 0);
  const rows = Array.from({ length: Math.ceil(cubes.length / 2) }, (_, r) => cubes.slice(r * 2, r * 2 + 2)).reverse();
  return (
    <div className={`flex h-[192px] w-[82px] flex-col rounded-[14px] border-2 p-[7px] ${bust ? 'shadow-[0_0_22px_rgba(255,77,94,.55)]' : ''}`}
      style={{ borderColor: bust ? '#ff4d5e' : `${color}88`, background: `linear-gradient(180deg, ${color}2a, ${color}10)` }}>
      <i className="h-[6px] w-[26px] rounded-full" style={{ background: color }} />
      <p className={`mt-1 font-mono text-[24px] font-black leading-none ${bust ? 'text-[#ff6b78]' : 'text-white'}`}>{total}<span className="text-[11px] text-white/40">/13</span></p>
      <div className="mt-auto flex flex-col gap-[4px]">
        {rows.map((row, r) => <div key={r} className="flex gap-[4px]">{row.map((v, i) => <Cube key={i} value={v} color={color} />)}</div>)}
      </div>
      {/* the stand's foot */}
      <i className="mt-[6px] h-[6px] rounded-full bg-black/40" />
    </div>
  );
}

export function Heavy13Art() {
  return (
    <div className={FRAME} style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a2d36 0%, #17191f 60%, #0e0f13 100%)' }}>
      <div className="absolute inset-x-0 top-[18px] flex justify-center gap-[8px]">
        <Stand color="#f0524f" cubes={[6, 5]} />
        <Stand color="#34c47c" cubes={[3, 2, 4, 3]} />
        <Stand color="#4f7cf0" cubes={[5, 6, 4]} bust />
      </div>
      <span className="absolute right-[18px] top-[10px] rotate-[8deg] rounded-md bg-[#ff4d5e] px-2 py-0.5 text-[12px] font-black tracking-wider text-white shadow-lg">BUST</span>
      {/* hand of rock cards */}
      <div className="absolute inset-x-0 bottom-[16px] flex justify-center gap-[6px]">
        {[4, 7, 2, 9].map((v, i) => (
          <span key={i} className="flex h-[46px] w-[35px] items-center justify-center rounded-[8px] text-[19px] font-black text-[#2a2118] shadow-[0_5px_12px_rgba(0,0,0,.5)]"
            style={{ background: 'linear-gradient(155deg, #efe3cc 0%, #cdb894 55%, #a8936e 100%)', transform: `rotate(${(i - 1.5) * 5}deg) translateY(${Math.abs(i - 1.5) * 3}px)` }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

// 인디언 포커 ---------------------------------------------------------------------------------------
function FaceCard({ value, rotate }: { value: number; rotate: number }) {
  return (
    <div className="relative flex h-[150px] w-[104px] items-center justify-center rounded-[14px] border border-black/10 text-[64px] font-black text-[#18191d] shadow-[0_14px_30px_rgba(0,0,0,.5)]"
      style={{ background: 'linear-gradient(145deg,#fffdf6,#dfd7c7)', transform: `rotate(${rotate}deg)` }}>
      {value}
      <span className="absolute left-[8px] top-[5px] text-[16px]">{value}</span>
      <span className="absolute bottom-[5px] right-[8px] rotate-180 text-[16px]">{value}</span>
    </div>
  );
}

function BackCard({ rotate }: { rotate: number }) {
  return (
    <div className="relative flex h-[150px] w-[104px] items-center justify-center rounded-[14px] border-[5px] border-[#fffaf0] text-[56px] font-black text-[#ffe9a8] shadow-[0_14px_30px_rgba(0,0,0,.5)]"
      style={{ background: 'repeating-linear-gradient(45deg,#8e1f2c 0 8px,#a8283a 8px 16px)', transform: `rotate(${rotate}deg)` }}>
      ?
    </div>
  );
}

function Chips({ n, color }: { n: number; color: string }) {
  return (
    <span className="relative inline-block h-[34px] w-[40px]">
      {Array.from({ length: n }).map((_, i) => <i key={i} className="absolute left-0 h-[9px] w-[40px] rounded-full border border-black/40" style={{ bottom: i * 4, background: color }} />)}
    </span>
  );
}

export function IndianPokerArt() {
  return (
    <div className={FRAME} style={{ background: 'radial-gradient(ellipse at center, #1d6650 0%, #0f3a30 62%, #0a2620 100%)' }}>
      <div className="absolute inset-[10px] rounded-[20px] border-2 border-[#d9a441]/40" />
      <p className="absolute inset-x-0 top-[22px] text-center text-[11px] font-black tracking-[.25em] text-white/45">POT <span className="font-mono text-[20px] tracking-normal text-[#ffcf3f]">12</span></p>
      <div className="absolute left-1/2 top-[64px] flex -translate-x-1/2 items-center">
        <div className="-mr-[18px]"><BackCard rotate={-9} /></div>
        <div className="-ml-[18px] mt-[-10px]"><FaceCard value={8} rotate={8} /></div>
      </div>
      <div className="absolute inset-x-0 bottom-[22px] flex items-end justify-center gap-[44px]">
        <Chips n={5} color="#ffcf3f" />
        <span className="mb-[6px] font-mono text-[14px] font-black text-white/60">VS</span>
        <Chips n={4} color="#ff5568" />
      </div>
    </div>
  );
}

// 돼지 저금통 ---------------------------------------------------------------------------------------
function Coin({ black, className }: { black: boolean; className: string }) {
  return <i className={`absolute h-[30px] w-[30px] rounded-full border-2 shadow-[0_4px_8px_rgba(0,0,0,.45)] ${black ? 'border-[#4a4a6a] bg-gradient-to-b from-[#3b3b5c] to-[#14142a]' : 'border-[#cfcfd8] bg-gradient-to-b from-white to-[#d9d9e2]'} ${className}`} />;
}

export function PiggyBankArt() {
  return (
    <div className={FRAME} style={{ background: 'radial-gradient(ellipse at 50% 45%, #4a5278 0%, #2b3150 55%, #181b2e 100%)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #fff 0 1px, transparent 2px)', backgroundSize: '38px 38px, 53px 53px' }} />
      {/* coins dropping into the slot */}
      <Coin black className="left-[112px] top-[26px]" />
      <Coin black={false} className="left-[150px] top-[48px]" />
      <Coin black className="left-[128px] top-[78px] scale-y-[.55]" />
      {/* the pig */}
      <div className="absolute left-1/2 top-[86px] -translate-x-1/2"><GoldPig label={10} size={190} glow /></div>
      {/* the table: each side's coins */}
      <div className="absolute inset-x-[18px] bottom-[14px] flex items-center justify-between rounded-[16px] bg-black/35 px-[14px] py-[8px]">
        <span className="flex items-center gap-[6px] font-mono text-[20px] font-black text-white"><i className="h-[20px] w-[20px] rounded-full border-2 border-[#4a4a6a] bg-gradient-to-b from-[#3b3b5c] to-[#14142a]" />6</span>
        <span className="flex items-center gap-[6px] font-mono text-[20px] font-black text-white"><i className="h-[20px] w-[20px] rounded-full border-2 border-[#cfcfd8] bg-gradient-to-b from-white to-[#d9d9e2]" />4</span>
      </div>
    </div>
  );
}
