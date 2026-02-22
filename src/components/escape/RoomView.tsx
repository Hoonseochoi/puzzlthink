"use client";

import type { Room, Clue } from '@/types/escape';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  room: Room;
  cluesInRoom: Clue[];
  foundClueIds: string[];
  onClueFound: (clueId: string) => void;
  onBack: () => void;
  /** When room.isGathering, render this below the room (living room suspects) */
  gatheringContent?: React.ReactNode;
  className?: string;
};

export default function RoomView({
  room,
  cluesInRoom,
  foundClueIds,
  onClueFound,
  onBack,
  gatheringContent,
  className,
}: Props) {
  const t = useTranslations('Escape');

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[280px] md:min-h-[360px] flex flex-col', className)}>
      {/* Room header with back button */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/80 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors"
          aria-label={t('backToList')}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h2 className="text-sm font-bold text-slate-200">{room.name}</h2>
      </div>

      {/* Room interior with magnifying-glass hotspots */}
      <div
        className="relative flex-1 min-h-[220px] md:min-h-[280px] bg-slate-900 bg-cover bg-center"
        style={
          room.image
            ? { backgroundImage: `url(${room.image})` }
            : { background: room.background ?? 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)' }
        }
      >
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-10">
          {cluesInRoom.filter((c) => c.hotspotPosition).map((clue) => {
            const found = foundClueIds.includes(clue.id);
            const pos = clue.hotspotPosition!;
            return (
              <button
                key={clue.id}
                type="button"
                onClick={() => !found && onClueFound(clue.id)}
                aria-label={clue.name}
                className={cn(
                  'absolute rounded-lg flex items-center justify-center transition-all cursor-pointer',
                  found
                    ? 'border-2 border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                    : 'border-0 bg-transparent'
                )}
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `${pos.width}%`,
                  height: `${pos.height}%`,
                }}
              >
                {found && (
                  <span className="material-symbols-outlined text-[22px] md:text-[28px]">
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Living room: suspects gathering */}
      {gatheringContent && (
        <div className="shrink-0 border-t border-slate-700 bg-slate-800/60">
          {gatheringContent}
        </div>
      )}
    </div>
  );
}
