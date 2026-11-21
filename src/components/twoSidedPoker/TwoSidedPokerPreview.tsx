/**
 * Card art for the game list (same frame as the other home-page previews): one card opened up —
 * an ivory public front and a violet private back — over a pot of chips, with the 양면베팅 bonus.
 */
export default function TwoSidedPokerPreview() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#100d1c] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(155,135,255,.32),transparent_62%)]" />
      <div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
      <div className="relative -mt-[10%] flex w-[78%] items-center justify-center">
        <span className="relative flex aspect-[5/7] w-[42%] -rotate-[7deg] items-center justify-center rounded-[12%] border-2 border-white bg-[linear-gradient(150deg,#fffdf6,#d9d0bf)] text-[24px] font-black text-[#15151b] shadow-[0_10px_24px_rgba(0,0,0,.5)] sm:text-[60px]">
          <span className="absolute left-[9%] top-[5%] font-mono text-[5px] font-bold tracking-widest text-black/35 sm:text-[10px]">FRONT</span>
          9
        </span>
        <span className="z-10 -mx-[3%] h-[46%] w-[3%] rounded-full bg-[#9b87ff] shadow-[0_0_12px_#9b87ff]" />
        <span className="relative flex aspect-[5/7] w-[42%] rotate-[7deg] items-center justify-center overflow-hidden rounded-[12%] border-2 border-[#9b87ff] bg-[linear-gradient(150deg,#3a2f6e,#17122e)] text-[24px] font-black text-[#9b87ff] shadow-[0_10px_28px_rgba(155,135,255,.45)] sm:text-[60px]">
          <span className="absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 7px, rgba(155,135,255,.4) 7px 8px)' }} />
          <span className="absolute left-[9%] top-[5%] font-mono text-[5px] font-bold tracking-widest text-[#9b87ff]/80 sm:text-[10px]">BACK</span>
          <span className="relative">?</span>
        </span>
      </div>
      {/* Chip stacks on the felt */}
      <div className="absolute bottom-[13%] left-[14%] h-[17%] w-[15%]">{[0, 1, 2, 3].map((i) => <i key={i} className="absolute left-0 aspect-[1/0.62] w-full rounded-[50%] border border-black/40" style={{ bottom: `${i * 18}%`, background: 'radial-gradient(ellipse at 50% 35%, #ffffff55, #f2c14e 58%)', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.35)' }} />)}</div>
      <div className="absolute bottom-[13%] right-[14%] h-[17%] w-[15%]">{[0, 1, 2].map((i) => <i key={i} className="absolute left-0 aspect-[1/0.62] w-full rounded-[50%] border border-black/40" style={{ bottom: `${i * 18}%`, background: 'radial-gradient(ellipse at 50% 35%, #ffffff55, #9b87ff 58%)', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.35)' }} />)}</div>
      <span className="absolute bottom-2 rounded-full bg-[#9b87ff] px-2 py-0.5 text-[7px] font-black tracking-wider text-[#120d26] sm:bottom-4 sm:text-[10px]">BOTH +10</span>
    </div>
  );
}
