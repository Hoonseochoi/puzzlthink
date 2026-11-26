"use client";

import { Scope, ShCard } from './SniperHoldemParts';

/** Entry-screen art: four shared cards on the felt, a crosshair on "9 스트레이트". */
export default function SniperHoldemPreview() {
  return (
    <div className="relative mx-auto flex h-[230px] w-[240px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-[#2f6b4f]/50 bg-[radial-gradient(ellipse_at_50%_25%,#1d4a36,#0d1f17_75%)] md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">SNIPER HOLD&apos;EM</p>
      <div className="flex gap-1.5">{[9, 6, 5, 7].map((v, i) => <ShCard key={i} value={v} size="md" delay={0.1 + i * 0.1} />)}</div>
      <div className="mt-4 flex items-center gap-2">
        <ShCard value={8} size="sm" delay={0.6} /><ShCard value={7} size="sm" delay={0.7} />
        <span className="ml-1 flex items-center gap-1.5 rounded-md bg-[#ff4f5e] px-2 py-1 text-[12px] font-black text-white shadow-[0_0_22px_rgba(255,79,94,.6)]"><Scope size={14} />9 스트레이트</span>
      </div>
      <Scope size={120} className="pointer-events-none absolute -right-6 -top-6 text-[#ff4f5e]/15" />
    </div>
  );
}

/** Home-card picture (in the 300px preview box like the other games). */
export function SniperHoldemTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_25%,#1d4a36,#0d1f17_75%)] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <div className="flex gap-1">{[9, 6, 5, 7].map((v, i) => <ShCard key={i} value={v} size="sm" />)}</div>
      <div className="mt-2 flex gap-1"><ShCard value={null} size="sm" /><ShCard value={null} size="sm" /></div>
      <Scope size={86} className="pointer-events-none absolute text-[#ff4f5e]/45" />
      <span className="absolute left-2 top-2 rounded-full bg-[#ff4f5e] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-white sm:left-3 sm:top-3">SNIPE</span>
    </div>
  );
}
