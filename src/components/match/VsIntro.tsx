"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Crown } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useStoneChoice } from '../StoneAvatar';
import { useIconLabel } from '../useIconLabel';
import { loadCrownHolders } from '../CrownCard';
import { getMatch, getNoMatch, introSeen, markIntroSeen, subscribeMatch, type Match, type MatchPlayer } from '@/lib/matchStore';
import { fetchVersusRecord, type Tally } from '@/lib/stats';
import { RARITY_LOOK, rarityOf, rareLineKey } from './rarity';
import { RimStone } from './PlayerPlate';

const LONG_MS = 2200; // the clock has not started yet (most games wait for the first move or a short countdown)
const SHORT_MS = 1400; // the turn clock is already running: get out of the way sooner
const STILL_MS = 1600; // prefers-reduced-motion: no animation, a little shorter

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Friend / open matches: when a match begins, my icon VS the opponent's, big, with nickname, the icon's name, a line
 * for rare icons ("히든 미션 달성자") and their record against people. About 2 s, tap to skip, once per match (a refresh
 * or reconnect does not replay it). It starts from the room state the host sent, so it never holds up the game:
 * the game runs underneath and the clock is the host's.
 * Mounted once in the layout; `useRealtimeRoom` tells it about the match (lib/matchStore), so every room game gets it.
 */
export default function VsIntro() {
  const match = useSyncExternalStore(subscribeMatch, getMatch, getNoMatch);
  const [shown, setShown] = useState<{ key: string; ms: number } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  const close = useCallback(() => {
    setLeaving(true);
    timers.current.push(window.setTimeout(() => { setShown(null); setLeaving(false); }, reducedMotion() ? 0 : 220));
  }, []);

  const key = match?.key;
  const startable = !!match && (match.sawLobby || match.clock);
  const clock = !!match?.clock;
  useEffect(() => {
    if (!key || !startable || introSeen(key)) return;
    markIntroSeen(key);
    const ms = reducedMotion() ? STILL_MS : clock ? SHORT_MS : LONG_MS;
    // Set from a timer so the overlay mounts after the game screen has painted its first frame of the match.
    const list = timers.current;
    list.push(window.setTimeout(() => { setLeaving(false); setShown({ key, ms }); }, 0));
    list.push(window.setTimeout(close, ms));
  }, [key, startable, clock, close]);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  // A match that ends (the room left) takes its intro with it.
  const live = shown && match && shown.key === match.key ? match : null;
  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [live, close]);

  if (!live || !shown || typeof document === 'undefined') return null;
  return createPortal(<VsCard match={live} ms={shown.ms} leaving={leaving} onSkip={close} />, document.body);
}

function VsCard({ match, ms, leaving, onSkip }: { match: Match; ms: number; leaving: boolean; onSkip: () => void }) {
  const t = useTranslations('Match');
  const { nickname, user } = useAuth();
  const players = match.players.map((p) => (p.me && nickname ? { ...p, name: nickname } : p));
  const me = players.find((p) => p.me)!;
  const others = players.filter((p) => !p.me);
  const duel = others.length === 1;

  // One lookup per match: each opponent's record against people (signed-in viewers only; the server needs a session)
  // and who holds this game's #1 (cached for the page).
  const [records, setRecords] = useState<Map<string, Tally>>(() => new Map());
  const [crownHolder, setCrownHolder] = useState<string | null>(null);
  const uids = others.map((p) => p.uid).filter((u): u is string => !!u).join(',');
  const asked = useRef(new Set<string>());
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const signedIn = !!user;
  useEffect(() => {
    if (!signedIn || !uids) return;
    for (const uid of uids.split(',')) {
      if (asked.current.has(uid)) continue; // once per opponent per match, however often this re-renders
      asked.current.add(uid);
      fetchVersusRecord(uid).then((r) => { if (mounted.current && r) setRecords((m) => new Map(m).set(uid, r)); });
    }
  }, [signedIn, uids]);
  useEffect(() => {
    if (!match.game) return;
    let alive = true;
    loadCrownHolders().then((m) => { if (alive) setCrownHolder(m.get(match.game!) ?? null); });
    return () => { alive = false; };
  }, [match.game]);

  const size = duel ? 120 : others.length <= 3 ? 84 : 64;
  return (
    <div role="dialog" aria-modal="false" aria-label={t('introLabel')} onPointerDown={onSkip}
      className={`fixed inset-0 z-[90] flex cursor-pointer select-none flex-col items-center justify-center overflow-hidden bg-[#07070b]/90 px-4 text-white backdrop-blur-md ${leaving ? 'vs-out' : 'vs-in'}`}>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#ffd36e]/15 to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#ff4d5e]/15 to-transparent" />
      <p className="vs-rise relative font-mono text-[11px] font-black tracking-[0.35em] text-white/50">{duel ? t('introKicker') : t('introKickerN', { n: players.length })}</p>

      {duel ? (
        <div className="relative mt-6 flex w-full max-w-[420px] items-start justify-between gap-1">
          <Fighter p={me} size={size} side="left" record={null} crown={crownHolder === me.name} />
          <span className="vs-slam mt-[46px] shrink-0 bg-gradient-to-b from-[#fff3b8] via-[#ffd36e] to-[#ff6b4a] bg-clip-text px-1 text-[40px] font-black italic leading-none tracking-tighter text-transparent drop-shadow-[0_0_18px_rgba(255,160,80,.55)]">VS</span>
          <Fighter p={others[0]} size={size} side="right" record={others[0].uid ? records.get(others[0].uid) ?? null : null} crown={crownHolder === others[0].name} />
        </div>
      ) : (
        <>
          <div className="relative mt-5"><Fighter p={me} size={size} side="left" record={null} crown={crownHolder === me.name} /></div>
          <span className="vs-slam relative my-3 bg-gradient-to-b from-[#fff3b8] via-[#ffd36e] to-[#ff6b4a] bg-clip-text text-[30px] font-black italic leading-none text-transparent">VS</span>
          <div className="relative flex max-w-[420px] flex-wrap items-start justify-center gap-x-2 gap-y-3">
            {others.map((p) => <Fighter key={p.seat} p={p} size={size} side="right" record={p.uid ? records.get(p.uid) ?? null : null} crown={crownHolder === p.name} />)}
          </div>
        </>
      )}

      <p className="vs-rise relative mt-8 text-[11px] font-bold text-white/40" style={{ animationDelay: '.5s' }}>{t('introSkip')}</p>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/10"><span className="vs-bar block h-full bg-[#ffd36e]/70" style={{ '--vs-ms': `${ms}ms` } as React.CSSProperties} /></span>
    </div>
  );
}

/** One side of the intro: the icon (framed by its rarity), nickname, icon name, rare line, record. */
function Fighter({ p, size, side, record, crown }: { p: MatchPlayer; size: number; side: 'left' | 'right'; record: Tally | null; crown: boolean }) {
  const t = useTranslations('Match');
  const label = useIconLabel();
  const stone = useStoneChoice(p.name);
  const rarity = rarityOf(stone);
  const line = rareLineKey(stone);
  const look = rarity ? RARITY_LOOK[rarity] : null;
  const games = record ? record.win + record.loss + record.draw : 0;
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center text-center ${side === 'left' ? 'vs-left' : 'vs-right'}`} style={{ maxWidth: size + 40 }}>
      <div className="relative" style={{ filter: look ? `drop-shadow(0 0 ${size / 6}px ${look.glow})` : undefined }}>
        <RimStone name={p.name} size={size} rim={size >= 100 ? 4 : 3} />
        {p.me && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ffd36e] px-2 text-[10px] font-black leading-[17px] text-[#17201e]">{t('me')}</span>}
      </div>
      <p className="vs-rise mt-3 w-full truncate text-[15px] font-black" style={{ animationDelay: '.3s' }}>{p.name}</p>
      {stone && label(stone) !== stone && <p className="vs-rise mt-0.5 line-clamp-2 w-full break-keep text-[10.5px] font-bold leading-tight text-white/55" style={{ animationDelay: '.38s' }}>{label(stone)}</p>}
      {(line || crown) && (
        <span className="vs-rise mt-1.5 inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[10px] font-black" style={{ animationDelay: '.45s', background: crown ? RARITY_LOOK.legend.chip : look?.chip, color: crown ? RARITY_LOOK.legend.ink : look?.ink }}>
          {crown && <Crown size={10} strokeWidth={3} />}{crown ? t('line_gameTop') : t(line!)}
        </span>
      )}
      {games > 0 && <p className="vs-rise mt-1.5 font-mono text-[10.5px] font-black text-white/70" style={{ animationDelay: '.5s' }}>{t('record', { w: record!.win, l: record!.loss })}</p>}
    </div>
  );
}
