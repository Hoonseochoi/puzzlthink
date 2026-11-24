"use client";

import { HsCard, HsDie } from './HitStayParts';

/** Entry-screen art: the limit die over a fanned hand that lands right on it. */
export default function HitStayPreview() {
  return (
    <div className="relative mx-auto flex h-[230px] w-[240px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(111,125,255,.35),rgba(18,18,23,.95)_70%)] md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">LIMIT</p>
      <HsDie value={9} rollKey={0} size={74} />
      <div className="mt-4 flex items-end">
        {[4, 6, -1].map((value, i) => (
          <span key={i} className="-mx-1.5" style={{ transform: `rotate(${(i - 1) * 9}deg) translateY(${i === 1 ? -6 : 0}px)` }}><HsCard value={value} size="md" delay={0.3 + i * 0.12} /></span>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] font-black tracking-[0.3em]"><span className="text-[#ff4d6d]">HIT</span><span className="mx-2 text-white/30">·</span><span className="text-[#dfe4ff]">STAY</span></p>
    </div>
  );
}

/** Home-card picture (laid out in the 300px preview box like the other games): the die over three cards. */
export function HitStayTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_30%,#3a44b8,#141846_72%)] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <HsDie value={9} rollKey={0} size={64} still />
      <div className="mt-2 flex items-end">
        {[4, 6, -1].map((value, i) => (
          <span key={i} className="-mx-1" style={{ transform: `rotate(${(i - 1) * 10}deg) translateY(${i === 1 ? -5 : 0}px)` }}><HsCard value={value} size="md" /></span>
        ))}
      </div>
      <span className="absolute left-2 top-2 rounded-full bg-[#ff4d6d] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-white sm:left-3 sm:top-3">HIT?</span>
    </div>
  );
}
