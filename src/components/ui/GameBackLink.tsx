"use client";

import { createContext, useContext, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/routing';

/**
 * Set by GameGate while a game is open: leaves the game for the entry screen of the same page.
 * A plain link to the page the player is already on (e.g. /hidden-word from /hidden-word#play) only drops the hash,
 * so the game stayed on screen and an extra history entry piled up.
 */
export const GameExitContext = createContext<(() => void) | null>(null);

/** The game header's back arrow: inside an open game, back to its own entry screen goes through GameGate. */
export default function GameBackLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const exit = useContext(GameExitContext);
  const pathname = usePathname();
  const toGate = !!exit && href === pathname;
  return (
    <Link
      href={href}
      className={className}
      onClick={toGate ? (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // a new tab still opens the page
        event.preventDefault();
        exit!();
      } : undefined}
    >
      {children}
    </Link>
  );
}
