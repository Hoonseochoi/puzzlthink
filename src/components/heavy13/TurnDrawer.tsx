"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SWIPE_PX = 40;
const noop = () => () => {};

/**
 * Your-turn controls as a panel that slides in from the right edge, so you can choose without
 * scrolling below the table. It opens by itself when your turn starts; tap the close tab (or swipe it
 * to the right) to tuck it away, and tap the edge handle (or swipe it left) to bring it back.
 * Outside your turn nothing is shown.
 */
export default function TurnDrawer({ active, open, onOpen, onClose, label, closeLabel, children, style }: {
  active: boolean; // it is your turn, so the drawer (or its handle) is available
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  label: string; // handle text, e.g. "내 차례"
  closeLabel: string;
  children: ReactNode;
  style?: CSSProperties; // the page's accent variables (a portal leaves the page's wrapper)
}) {
  const startX = useRef<number | null>(null);
  // Rendered into <body>: the table sits in a blurred panel, which would otherwise pin `fixed` to it.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const onTouchStart = (event: TouchEvent) => { startX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: TouchEvent) => {
    const from = startX.current;
    startX.current = null;
    const to = event.changedTouches[0]?.clientX;
    if (from === null || to === undefined) return;
    if (open && to - from > SWIPE_PX) onClose();
    if (!open && from - to > SWIPE_PX) onOpen();
  };
  if (!active || !mounted) return null;

  return createPortal(
    <div style={style} className="contents text-[#e6e9f0]">
      {/* Edge handle while tucked away. */}
      <button
        type="button" onClick={onOpen} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} aria-expanded={open} aria-controls="h13-turn-drawer"
        className={`fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1 rounded-l-[12px] border border-r-0 border-(--accent)/60 bg-[#17130c]/95 py-4 pl-2 pr-1.5 text-(--accent) shadow-[0_0_24px_var(--accent-glow)] backdrop-blur transition-transform duration-300 ${open ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <ChevronLeft size={16} className="animate-pulse" />
        <span className="text-xs font-black [writing-mode:vertical-rl]">{label}</span>
      </button>

      <aside
        id="h13-turn-drawer" aria-hidden={!open} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        className={`fixed right-0 top-1/2 z-40 max-h-[calc(100dvh-5rem)] w-[min(88vw,380px)] -translate-y-1/2 overflow-y-auto rounded-l-[16px] border border-r-0 border-(--accent)/45 bg-[#121217]/95 shadow-[-18px_0_50px_rgba(0,0,0,.6)] backdrop-blur-md transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
      >
        <button type="button" onClick={onClose} aria-label={closeLabel} className="absolute left-0 top-1/2 flex h-16 w-5 -translate-y-1/2 items-center justify-center rounded-r-md bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white">
          <ChevronRight size={14} />
        </button>
        <div className="p-4 pl-7">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
