"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DoorOpen, Loader2, LogIn, Plus, RefreshCw, Swords, X } from 'lucide-react';
import { GAMES, type GameId } from '@/lib/gameCatalog';
import { type OpenRoomAnyRow, listAllOpenRooms } from '@/lib/openRooms';
import AuthButton from './AuthButton';
import { useAuth } from './AuthProvider';
import { GAME_MODES, openRoomHref } from './gameModes';

/** Games that have friend rooms, in home-page order. */
const ROOM_GAMES = GAMES.filter((game) => GAME_MODES[game.id].useRoom);
const colorOf = (id: string) => GAMES.find((game) => game.id === id)?.color ?? '#17201e';

/**
 * The first home card: open rooms across every game. Shows how many rooms are open now,
 * lets a signed-in player create one (pick a game) or join one from the list.
 */
export default function OpenMatchCard({ previews }: { previews: Partial<Record<GameId, ReactNode>> }) {
  const t = useTranslations('OpenMatch');
  const tc = useTranslations('Common');
  const tg = useTranslations('GameGate');
  const locale = useLocale();
  const { user, configured } = useAuth();
  const signedIn = !!user || !configured;
  const [rooms, setRooms] = useState<OpenRoomAnyRow[] | null>(null);
  const [dialog, setDialog] = useState<'join' | 'create' | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => { if (document.visibilityState === 'visible') listAllOpenRooms().then((rows) => { if (alive) setRooms(rows ?? []); }); };
    load();
    const timer = window.setInterval(load, dialog === 'join' ? 8_000 : 20_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [dialog, tick]);

  // A full page load, so the game page reads #play and the open room from the URL as it mounts.
  const go = (game: GameId, code: string, variant: number) => { window.location.assign(new URL(`/${locale}${openRoomHref(game, code, variant)}`, window.location.origin)); };
  const create = async (game: GameId, variant: number) => {
    setCreating(`${game}-${variant}`);
    try { go(game, await GAME_MODES[game].rooms[variant].create(), variant); } catch { setCreating(null); }
  };

  const open = (rooms ?? []).filter((room) => room.game in GAME_MODES && room.players < room.capacity);
  const count = rooms === null ? null : open.length;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#17201e] p-4 text-white shadow-[0_18px_50px_rgba(30,38,36,0.18)] sm:rounded-[32px] sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ffd36e]/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-[#ff4d5e] px-3 py-1 text-[10px] font-black tracking-[0.12em]"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE</span>
        <span className="text-[10px] font-black tracking-[0.16em] text-white/35">OPEN MATCH</span>
      </div>

      {/* A wall of the games you can open a room for. */}
      <div className="relative mt-4 grid grid-cols-5 gap-1.5 sm:mt-6 sm:gap-2.5">
        {ROOM_GAMES.map((game) => (
          <div key={game.id} className="relative aspect-square overflow-hidden rounded-lg bg-white/[.06] ring-1 ring-white/10 sm:rounded-xl" title={tc(game.id)}>
            <div className="absolute left-0 top-0 flex h-[300px] w-[300px] origin-top-left scale-[.2] items-center justify-center min-[400px]:scale-[.21] sm:scale-[.29] md:scale-[.18] lg:scale-[.27]">{previews[game.id]}</div>
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3 sm:mt-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{t('title')}</h2>
          <p className="mt-1 max-w-sm break-keep text-[13px] leading-5 text-white/60 sm:mt-2 sm:text-sm sm:leading-6">{t('desc')}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-3xl font-black text-[#ffd36e] sm:text-4xl">{count ?? '–'}</p>
          <p className="text-[10px] font-bold text-white/45">{t('openNow')}</p>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:mt-5 sm:pt-4">
        <button type="button" onClick={() => setDialog('create')} className="flex flex-col items-center gap-0.5 rounded-2xl border border-white/15 bg-white/[.06] px-2 py-2.5 transition hover:-translate-y-0.5 hover:bg-white/10 sm:py-3">
          <Plus size={15} className="text-[#ffd36e]" /><span className="text-sm font-black">{t('create')}</span><span className="text-[10px] font-bold text-white/45">{t('createDesc')}</span>
        </button>
        <button type="button" onClick={() => setDialog('join')} className="flex flex-col items-center gap-0.5 rounded-2xl bg-[#ffd36e] px-2 py-2.5 text-[#17201e] transition hover:-translate-y-0.5 hover:brightness-105 sm:py-3">
          <DoorOpen size={15} /><span className="text-sm font-black">{t('join')}</span><span className="text-[10px] font-bold text-black/55">{count === null ? t('joinDesc') : t('joinCount', { n: count })}</span>
        </button>
      </div>

      {dialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setDialog(null)}>
          <section onClick={(event) => event.stopPropagation()} className="max-h-[86svh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:rounded-[24px] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-black">{dialog === 'join' ? <DoorOpen size={18} /> : <Swords size={18} />}{dialog === 'join' ? t('joinTitle') : t('createTitle')}</h3>
              <div className="flex items-center gap-1">
                {dialog === 'join' && <button type="button" onClick={() => setTick((n) => n + 1)} className="rounded-md p-2 text-black/40 hover:text-black" aria-label={tg('openRefresh')}><RefreshCw size={15} /></button>}
                <button type="button" onClick={() => setDialog(null)} className="rounded-md p-2 text-black/40 hover:text-black" aria-label={t('close')}><X size={16} /></button>
              </div>
            </div>

            {!signedIn && (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
                <p className="flex items-center gap-1.5 break-keep text-xs font-bold text-black/60"><LogIn size={14} className="shrink-0" />{tg('openLogin')}</p>
                <AuthButton />
              </div>
            )}

            {dialog === 'join' ? (
              <div className="mt-4 space-y-2">
                {rooms === null ? <p className="flex items-center gap-2 text-xs text-black/50"><Loader2 size={13} className="animate-spin" />{tg('openLoading')}</p>
                  : open.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/15 px-4 py-6 text-center">
                      <p className="text-sm font-bold text-black/55">{tg('openEmpty')}</p>
                      <button type="button" onClick={() => setDialog('create')} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#17201e] px-4 py-2 text-xs font-black text-white"><Plus size={13} />{t('create')}</button>
                    </div>
                  ) : open.map((room) => {
                    const game = room.game as GameId;
                    const variants = GAME_MODES[game].rooms;
                    return (
                      <div key={`${room.game}-${room.code}`} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2.5">
                        <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: colorOf(room.game) }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{tc(game)}{variants.length > 1 && variants[room.variant] ? ` · ${tg(`short_${variants[room.variant].label}`)}` : ''}</p>
                          <p className="truncate text-[11px] font-bold text-black/45">{tg('openHost', { name: room.host })} · <span className="font-mono">{room.code}</span></p>
                        </div>
                        <span className="font-mono text-xs font-bold text-black/50">{room.players}/{room.capacity}</span>
                        <button type="button" disabled={!signedIn} onClick={() => go(game, room.code, room.variant)} className="rounded-full bg-[#17201e] px-3.5 py-2 text-xs font-black text-white disabled:opacity-35">{tg('openJoin')}</button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {ROOM_GAMES.flatMap((game) => GAME_MODES[game.id].rooms.map((room, variant) => {
                  const key = `${game.id}-${variant}`;
                  const many = GAME_MODES[game.id].rooms.length > 1;
                  return (
                    <button key={key} type="button" disabled={!signedIn || creating !== null} onClick={() => create(game.id, variant)}
                      className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-3 text-left transition hover:border-black/30 disabled:opacity-40">
                      <span className="h-7 w-1.5 shrink-0 rounded-full" style={{ background: game.color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{tc(game.id)}</span>
                        {many && <span className="block truncate text-[10px] font-bold text-black/45">{tg(`short_${room.label}`)}</span>}
                      </span>
                      {creating === key && <Loader2 size={14} className="shrink-0 animate-spin" />}
                    </button>
                  );
                }))}
              </div>
            )}
            <p className="mt-4 break-keep text-center text-[11px] leading-5 text-black/45">{t('note')}</p>
          </section>
        </div>
      )}
    </div>
  );
}
