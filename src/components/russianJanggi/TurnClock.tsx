import { Clock3 } from 'lucide-react';
import { TURN_SECONDS } from '@/lib/russianJanggi';

/** The 10-second turn clock: a pill plus a draining bar. */
export default function TurnClock({ remainingMs, urgent }: { remainingMs: number; urgent: boolean }) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const ratio = Math.max(0, Math.min(1, remainingMs / (TURN_SECONDS * 1000)));
  const low = seconds <= 3;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className={`flex min-w-[64px] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold ${low && urgent ? 'animate-pulse bg-[#ff4d5e] text-white' : 'border border-white/15 bg-black/50 text-white/80'}`}>
        <Clock3 size={13} />{seconds}s
      </div>
      <div className="h-1 w-[64px] overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-[width] duration-200 ease-linear" style={{ width: `${ratio * 100}%`, background: low ? '#ff4d5e' : '#f2b84b' }} />
      </div>
    </div>
  );
}
