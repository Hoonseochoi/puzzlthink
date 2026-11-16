import { Clock3 } from 'lucide-react';
import { TURN_SECONDS } from '@/lib/russianJanggi';
import { timer } from '../ui/gameUi';

/** The 10-second turn clock: a pill plus a draining bar. */
export default function TurnClock({ remainingMs, urgent }: { remainingMs: number; urgent: boolean }) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const ratio = Math.max(0, Math.min(1, remainingMs / (TURN_SECONDS * 1000)));
  const low = seconds <= 3;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className={timer(low && urgent)}>
        <Clock3 size={13} />{seconds}s
      </div>
      <div className="h-1 w-[76px] overflow-hidden rounded-[1px] bg-white/10">
        <div className="h-full transition-[width] duration-200 ease-linear" style={{ width: `${ratio * 100}%`, background: low ? '#ff4d5e' : 'var(--accent)' }} />
      </div>
    </div>
  );
}
