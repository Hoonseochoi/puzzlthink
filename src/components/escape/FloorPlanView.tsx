"use client";

import { useTranslations } from 'next-intl';
import type { Room } from '@/types/escape';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  rooms: Room[];
  floorPlanImage?: string;
  onSelectRoom: (roomId: string) => void;
  /** 활성화할 방 id 목록. 비어 있으면 전부 비활성화, 없으면 전부 활성화 */
  enabledRoomIds?: string[];
  className?: string;
};

export default function FloorPlanView({ rooms, floorPlanImage, onSelectRoom, enabledRoomIds, className }: Props) {
  const t = useTranslations('Escape');
  const isEnabled = (roomId: string) =>
    enabledRoomIds == null || (enabledRoomIds.length > 0 && enabledRoomIds.includes(roomId));

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-stone-600 bg-stone-900/80', className)}>
      <div className="p-3 border-b border-stone-600 bg-stone-800/90">
        <h2 className="text-sm font-bold text-stone-200">{t('floorPlanTitle')}</h2>
        <p className="text-xs text-stone-500 mt-0.5">{t('floorPlanHint')}</p>
      </div>
      <div className="relative w-full aspect-[4/3] min-h-[280px] md:min-h-[340px] bg-stone-800">
        {floorPlanImage && (
          <Image src={floorPlanImage} alt={t('floorPlanAlt')} fill className="object-contain" sizes="(max-width: 768px) 100vw, 66vw" />
        )}
        {/* 방 중심에 버튼 배치 (left/top %, translate(-50%,-50%)로 버튼 중심 정렬) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 pointer-events-auto">
            {rooms.flatMap((room) => {
              const pos = room.floorPlanPosition;
              if (pos == null) return [];
              const positions = Array.isArray(pos) ? pos : [pos];
              const enabled = isEnabled(room.id);
              return positions.map((p, i) => (
                <button
                  key={positions.length > 1 ? `${room.id}-${i}` : room.id}
                  type="button"
                  onClick={() => enabled && onSelectRoom(room.id)}
                  disabled={!enabled}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={cn(
                    'absolute flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 transition-all min-h-[44px] min-w-[80px] max-w-[100px] px-1.5 py-1 pointer-events-auto',
                    enabled
                      ? 'border-stone-600 bg-amber-950/85 hover:border-amber-600/90 hover:bg-amber-900/80 hover:scale-[1.05] active:scale-[0.98] text-stone-200 hover:text-amber-50 shadow-md'
                      : 'border-stone-700 bg-stone-800/90 text-stone-500 cursor-not-allowed opacity-60 grayscale'
                  )}
                >
                  <span className={cn('material-symbols-outlined text-lg', enabled ? 'text-amber-400/90' : 'text-stone-500')}>
                    {room.isGathering ? 'groups' : 'door_open'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight">
                    {room.name}
                  </span>
                </button>
              ));
            })}
          </div>
        </div>
        {/* 위치 정보 없는 방은 하단 그리드로 표시 */}
        {rooms.some((r) => r.floorPlanPosition == null) && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-stone-900/95 border-t border-stone-600 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pointer-events-auto">
            {rooms
              .filter((r) => r.floorPlanPosition == null)
              .map((room) => {
                const enabled = isEnabled(room.id);
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => enabled && onSelectRoom(room.id)}
                    disabled={!enabled}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 text-xs font-medium',
                      enabled
                        ? 'border-stone-600 bg-amber-950/80 hover:border-amber-600/80 text-stone-200'
                        : 'border-stone-700 bg-stone-800/80 text-stone-500 cursor-not-allowed opacity-60 grayscale'
                    )}
                  >
                    <span className="material-symbols-outlined text-lg text-amber-400/90">{room.isGathering ? 'groups' : 'door_open'}</span>
                    {room.name}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
