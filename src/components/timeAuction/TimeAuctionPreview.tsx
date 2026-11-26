"use client";

/** Entry-screen art: the auction board stopped at a winning time over the big red button. */
export default function TimeAuctionPreview() {
  return (
    <div className="relative mx-auto flex h-[230px] w-[240px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,59,48,.28),rgba(10,10,12,.96)_70%)] md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">TIME AUCTION</p>
      <div className="rounded-lg border border-white/10 bg-black px-4 py-1.5 font-mono text-[40px] font-black leading-none tracking-tight text-[#ff3b30] [text-shadow:0_0_18px_#ff3b30]">1:49.8</div>
      <div className="mt-4 flex h-[92px] w-[92px] items-center justify-center rounded-full border-[5px] border-[#ff3b30] bg-[radial-gradient(circle_at_50%_35%,#ff6a5f,#7a0d07_75%)] shadow-[0_0_40px_rgba(255,59,48,.45)]">
        <span className="font-mono text-[11px] font-black tracking-[0.3em] text-white">HOLD</span>
      </div>
      <p className="mt-3 font-mono text-[10px] font-black tracking-[0.3em] text-white/45">10:00 × 19</p>
    </div>
  );
}

/** Home-card picture, laid out in the 300px preview box like the other games. */
export function TimeAuctionTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_28%,#5a1410,#0b0b0e_72%)] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <div className="rounded-md bg-black px-3 py-1 font-mono text-[28px] font-black leading-none text-[#ff3b30] [text-shadow:0_0_14px_#ff3b30]">2:15.6</div>
      <div className="mt-3 h-16 w-16 rounded-full border-4 border-[#ff3b30] bg-[radial-gradient(circle_at_50%_35%,#ff6a5f,#7a0d07_75%)] shadow-[0_0_30px_rgba(255,59,48,.5)]" />
      <span className="absolute left-2 top-2 rounded-full bg-[#ff3b30] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-white sm:left-3 sm:top-3">HOLD</span>
    </div>
  );
}
