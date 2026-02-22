"use client";

import { useTranslations } from 'next-intl';
import type { EscapeStory } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  story: EscapeStory;
  foundClueIds: string[];
  onHotspotClick: (clueId: string) => void;
  className?: string;
};

export default function CaseRoomBox({ story, foundClueIds, onHotspotClick, className }: Props) {
  const t = useTranslations('Escape');
  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl min-h-[280px] md:min-h-[360px]', className)}
      style={{ background: story.roomBackground }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 p-4 flex flex-col justify-between min-h-full">
        <span className="text-slate-300/80 text-sm font-medium">{story.title} · {t('caseScene')}</span>
        <div className="flex-1 relative">
          {story.hotspots.map((hotspot) => {
            const found = foundClueIds.includes(hotspot.clueId);
            return (
              <button
                key={hotspot.id}
                type="button"
                aria-label={hotspot.label || t('clueLabel')}
                className={cn(
                  'absolute border-2 rounded-lg transition-all flex items-center justify-center',
                  found
                    ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                    : 'border-amber-400/70 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 hover:scale-105'
                )}
                style={{
                  left: `${hotspot.position.left}%`,
                  top: `${hotspot.position.top}%`,
                  width: `${hotspot.position.width}%`,
                  height: `${hotspot.position.height}%`,
                }}
                onClick={() => !found && onHotspotClick(hotspot.clueId)}
              >
                <span className="material-symbols-outlined text-[20px] md:text-[24px]">
                  {found ? 'check_circle' : 'search'}
                </span>
                {hotspot.label && <span className="sr-only">{hotspot.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
