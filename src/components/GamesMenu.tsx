"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Grid2X2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';

type Variant = 'nav' | 'cta';

const TRIGGER: Record<Variant, string> = {
  nav: 'flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black aria-expanded:bg-white/70 aria-expanded:text-black',
  cta: 'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#17201e] px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5',
};

/** Desktop dropdown listing every game. Closes on outside click, Esc, Tab and selection. */
export default function GamesMenu({ variant, align = 'left' }: { variant: Variant; align?: 'left' | 'right' }) {
  const t = useTranslations('Common');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const focusItem = (index: number) => {
    const count = GAMES.length + 1; // games + the "about the games" link
    itemRefs.current[(index + count) % count]?.focus();
  };

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      const target = event.key === 'ArrowDown' ? 0 : GAMES.length;
      requestAnimationFrame(() => focusItem(target));
    }
  };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); focusItem(current + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusItem(0); }
    else if (event.key === 'End') { event.preventDefault(); focusItem(GAMES.length); }
    else if (event.key === 'Tab') close();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKey}
        className={TRIGGER[variant]}
      >
        {variant === 'cta' && <Grid2X2 size={14} />}
        {variant === 'cta' ? t('playNow') : t('games')}
        <ChevronDown size={13} className={`transition ${open ? 'rotate-180' : ''} ${variant === 'nav' ? 'opacity-60' : 'opacity-80'}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t('games')}
          onKeyDown={onMenuKey}
          className={`absolute top-full z-50 mt-2 w-60 rounded-2xl border border-black/[0.08] bg-[#f8f6ef] p-1.5 shadow-[0_18px_50px_rgba(30,38,36,0.16)] ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {GAMES.map((game, index) => (
            <Link
              key={game.id}
              ref={(node) => { itemRefs.current[index] = node; }}
              href={game.href}
              role="menuitem"
              onClick={() => close()}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#17201e] outline-none transition hover:bg-white focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#17201e]/20"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: game.color }} />
              {t(game.id)}
            </Link>
          ))}
          <div className="mt-1 border-t border-black/[0.07] pt-1">
            <Link
              ref={(node) => { itemRefs.current[GAMES.length] = node; }}
              href="/games"
              role="menuitem"
              onClick={() => close()}
              className="block rounded-xl px-3 py-2 text-xs font-bold text-black/50 outline-none transition hover:bg-white hover:text-black focus-visible:bg-white"
            >
              {t('gamesIntro')} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
