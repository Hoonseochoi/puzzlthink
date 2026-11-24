"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Menu, Skull, Trophy, X } from 'lucide-react';
import { usePathname, Link } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { HELL_LIVE } from '@/lib/hell';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import GamesMenu from './GamesMenu';
import { HeaderSupportButton } from './SupportLink';
import { TopBannerSlot } from './ads/HiddenLogAd';

const HIDE_ON = ['/card-janggi', '/point-omok', '/2048', '/magic-square', '/play', '/four-three', '/monorail', '/flip-omok', '/nine-mens-morris', '/hexagon', '/piggy-bank', '/wallgo', '/blind-gomoku', '/black-white', '/laser-janggi', '/nemo-count', '/slitherlink', '/janggi', '/heavy13', '/russian-roulette', '/russian-janggi', '/two-sided-poker', '/masyu', '/nonogram', '/star-battle', '/binairo', '/one-stroke', '/color-link'];
const NAV_LINK = 'rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black';
const MOBILE_LINK = 'rounded-xl px-4 py-3 text-sm font-extrabold hover:bg-white';
/** '매우 어려움 하러가기' (AI 헬모드), shown once a hell AI is live. */
const HELL_LINK = 'flex items-center gap-1.5 rounded-full bg-[#07060a] px-3.5 py-2 text-xs font-black text-[#ff3355] shadow-[0_0_12px_rgba(255,51,85,.35)] ring-1 ring-[#ff3355]/50 transition hover:shadow-[0_0_20px_rgba(255,51,85,.6)]';

export default function GlobalHeader() {
  const pathname = usePathname();
  const t = useTranslations('Common');
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(true);
  if (HIDE_ON.some((segment) => pathname.includes(segment))) return null;

  const links = [
    { href: '/game-list', label: t('gameList') },
    { href: '/records', label: t('records') },
    { href: '/games', label: t('gamesIntro') },
  ] as const;
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-[#f3f0e8]/90 backdrop-blur-xl">
      <TopBannerSlot />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <span className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-[10px] bg-[#17201e] p-2"><i className="rounded-sm bg-[#ff6b4a]" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-[#f2c14e]" /></span>
          <span className="text-sm font-black tracking-[-0.03em]">PUZZLTHINK</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <GamesMenu variant="nav" />
          {HELL_LIVE.length > 0 && <Link href="/hell" className={HELL_LINK}><Skull size={13} />{t('hellMode')}</Link>}
          {links.map((item) => <Link key={item.href} href={item.href} className={NAV_LINK}>{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <HeaderSupportButton />
          <LanguageSwitcher compact />
          <AuthButton source="header" />
          <GamesMenu variant="cta" align="right" />
        </div>

        {/* Phones / installed app: 기록실 one tap away, beside the menu button. */}
        <Link href="/records" onClick={closeMenu} className="ml-auto mr-1 flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-extrabold text-black/75 transition hover:bg-white md:hidden"><Trophy size={14} className="text-[#e8a33c]" />{t('records')}</Link>
        <button type="button" aria-label={t('menu')} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="rounded-xl p-2 transition hover:bg-white md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-black/[0.07] bg-[#f8f6ef] px-5 py-4 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            <button type="button" aria-expanded={gamesOpen} aria-controls="mobile-games" onClick={() => setGamesOpen((value) => !value)} className={`${MOBILE_LINK} flex items-center justify-between text-left`}>
              {t('games')}<ChevronDown size={16} className={`text-black/45 transition ${gamesOpen ? 'rotate-180' : ''}`} />
            </button>
            {gamesOpen && (
              <ul id="mobile-games" className="mb-1 ml-4 flex flex-col gap-0.5 border-l border-black/[0.08] pl-2">
                {GAMES.map((game) => (
                  <li key={game.id}>
                    <Link href={game.href} onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-black/75 hover:bg-white hover:text-black">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: game.color }} />{t(game.id)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {HELL_LIVE.length > 0 && <Link href="/hell" onClick={closeMenu} className={`${HELL_LINK} my-1 w-fit !px-4 !py-3 !text-sm`}><Skull size={15} />{t('hellModeGo')}</Link>}
            {links.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className={MOBILE_LINK}>{item.label}</Link>)}
            <div className="mt-2 flex flex-col gap-2 border-t border-black/[0.07] pt-3"><HeaderSupportButton full /><AuthButton full source="header_menu" /><LanguageSwitcher /></div>
          </nav>
        </div>
      )}
    </header>
  );
}
