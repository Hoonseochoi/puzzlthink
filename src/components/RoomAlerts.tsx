"use client";

import { LogIn, LogOut } from 'lucide-react';
import type { PresenceAlert } from '@/hooks/usePresenceAlerts';

/** Top-center toasts for people joining or leaving a room. */
export default function RoomAlerts({ alerts, joinText, leaveText, accent }: {
  alerts: PresenceAlert[]; joinText: (name: string) => string; leaveText: (name: string) => string; accent: string;
}) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4">
      {alerts.map((a) => (
        <div key={a.id} className="flex animate-[roomAlertIn_.25s_ease-out] items-center gap-2.5 rounded-full border border-white/15 bg-[#121317]/95 px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,0,0,.5)] backdrop-blur">
          {a.kind === 'join'
            ? <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accent }}><LogIn size={13} className="text-black/80" /></span>
            : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15"><LogOut size={13} /></span>}
          {a.kind === 'join' ? joinText(a.name) : leaveText(a.name)}
        </div>
      ))}
    </div>
  );
}
