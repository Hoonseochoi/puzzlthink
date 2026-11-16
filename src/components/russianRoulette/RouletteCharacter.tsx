"use client";

const CHARACTER_BOARD = '/russian-roulette/character-board-v1.jpg';

export default function RouletteCharacter({ seat, selected = false, hit = false, suspected = false, label, className = '' }: {
  seat: number; selected?: boolean; hit?: boolean; suspected?: boolean; label?: string; className?: string;
}) {
  const portrait = seat % 6;
  const column = portrait % 2;
  const row = Math.floor(portrait / 2);
  return (
    <span role={label ? 'img' : undefined} aria-label={label} className={`relative block aspect-square transition duration-300 ${selected ? 'scale-110' : ''} ${className}`}>
      <span className={`absolute inset-0 overflow-hidden rounded-[16%] bg-[#080b10] shadow-[0_8px_22px_rgba(0,0,0,.65)] ring-2 transition ${selected ? 'ring-[#65e5ff] shadow-[0_0_30px_rgba(101,229,255,.5)]' : suspected ? 'ring-[#ffcf58]/70' : 'ring-white/10'}`}>
        <span
          className={`absolute inset-0 bg-cover transition duration-300 ${hit ? 'scale-95 grayscale opacity-45' : 'scale-[1.03]'}`}
          style={{
            backgroundImage: `url(${CHARACTER_BOARD})`,
            backgroundPosition: `${column * 100}% ${row * 50}%`,
            backgroundSize: '200% 300%',
          }}
        />
        {selected && <span className="absolute inset-0 bg-[radial-gradient(circle,transparent_42%,rgba(101,229,255,.22)_100%)]" />}
      </span>
      {suspected && <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#121722] bg-[#ffcf58] text-[11px] text-[#4a3100] shadow-[0_0_16px_rgba(255,207,88,.55)]">●</span>}
      {hit && <span className="absolute inset-0 flex items-center justify-center rounded-[16%] bg-[#d83143]/45 text-3xl font-black text-white shadow-[inset_0_0_30px_rgba(216,49,67,.7)]">×</span>}
    </span>
  );
}
