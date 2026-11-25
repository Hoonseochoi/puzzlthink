"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Check, Clock, Eye, Crown, Gamepad2, Medal, Palette, Skull, Sparkles, Swords, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { GameId } from '@/lib/stats';
import { CERT_GAMES, HARD_GAMES } from '@/lib/hardClear';
import { HELL_GAMES } from '@/lib/hell';
import { gameFromSlug, rankSlug } from '@/lib/rankings';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { CHAMPION_LOOKS, STONE_COLORS, Stone } from './StoneAvatar';
import { MY_ICON_ANCHOR } from './StonePicker';
import { M2048_TIERS } from './ProfileIcons';
import { PLAY_HOURS } from './BadgeIcons';
import { MISSIONS, type Mission } from './MissionIcons';

const CROWN_GAMES = (Object.keys(CERT_GAMES) as GameId[]).filter((g) => gameFromSlug(rankSlug(g)));

/**
 * 아이콘 컬렉션 (/icons): every profile icon by theme with a one-line condition for getting it — the free colours,
 * 피스 경쟁전 champions (per week), 블랙피스 weekly top three, 2048, play time, match wins / 매우 어려움, each game's
 * 어려움 clear, and each game's #1 (with who holds it now).
 * Signed in, icons you own are ticked.
 */
export default function IconCollection() {
  const t = useTranslations('IconCollection');
  const ti = useTranslations('Icons');
  const tr = useTranslations('Records');
  const locale = useLocale();
  const { user } = useAuth();
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [holders, setHolders] = useState<Map<string, string>>(new Map());
  const [openTop, setOpenTop] = useState<Map<number, string>>(new Map());
  const [playSec, setPlaySec] = useState<number | null>(null);
  const [mission, setMission] = useState<{ hard: number; hell: number; ranked: number; avg: number | null } | null>(null);

  useEffect(() => {
    let alive = true;
    getSupabase()?.rpc('game_crowns_public').then(({ data }) => {
      if (alive && Array.isArray(data)) setHolders(new Map((data as { game: string; nickname: string }[]).map((r) => [r.game, r.nickname])));
    });
    getSupabase()?.rpc('open_total_ranking', { p_limit: 3 }).then(({ data }) => {
      if (alive && Array.isArray(data)) setOpenTop(new Map((data as { rank: number; nickname: string }[]).filter((r) => r.rank <= 3).map((r) => [r.rank, r.nickname])));
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    if (!user) { setOwned(new Set()); return; }
    getSupabase()?.rpc('my_stone_options').then(({ data }) => {
      const earned = (data as { earned?: string[] } | null)?.earned;
      if (!alive || !Array.isArray(earned)) return;
      // A 블랙피스 icon looks the same every week, so owning any week's place counts for that place.
      setOwned(new Set([...earned, ...earned.filter((i) => /^h\d+-[123]$/.test(i)).map((i) => `h-${i.slice(-1)}`)]));
    });
    const sb = getSupabase();
    if (sb) Promise.all([sb.rpc('my_hard_clears'), sb.rpc('my_hell_clears'), sb.rpc('my_game_ranks')]).then(([h, l, r]) => {
      if (!alive) return;
      const games = (d: unknown) => new Set((Array.isArray(d) ? (d as { game: string }[]) : []).map((x) => x.game));
      const hard = games(h.data), hell = games(l.data);
      const ranks = Array.isArray(r.data) ? (r.data as { game: string; rank: number }[]) : [];
      setMission({
        hard: HARD_GAMES.filter((g) => hard.has(g) || hell.has(g)).length,
        hell: HELL_GAMES.filter((g) => hell.has(g.stat)).length,
        ranked: new Set(ranks.map((x) => x.game)).size,
        avg: ranks.length ? ranks.reduce((a, x) => a + x.rank, 0) / ranks.length : null,
      });
    });
    getSupabase()?.rpc('my_play_time').then(({ data }) => { if (alive && typeof data === 'number') setPlaySec(data); });
    return () => { alive = false; };
  }, [user]);

  const cell = (icon: string, name: string, sub?: React.ReactNode, ownKey = icon, href?: string) => {
    const mine = owned.has(ownKey);
    const body = (
      <>
        {mine && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b4a] text-white" title={t('owned')}><Check size={10} strokeWidth={3} /></span>}
        <Stone name={name} size={56} icon={icon} />
        <span className="mt-1.5 line-clamp-2 break-keep text-center text-[11px] font-black leading-tight">{name}</span>
        {sub && <span className="mt-0.5 line-clamp-1 w-full break-all text-center text-[10px] font-bold text-black/45">{sub}</span>}
      </>
    );
    const cls = `relative flex flex-col items-center rounded-2xl border px-1.5 pb-2.5 pt-3 ${mine ? 'border-[#ff6b4a]/60 bg-[#fff0eb]' : 'border-black/10 bg-white'}`;
    return <li key={icon}>{href ? <Link href={href} className={`${cls} transition hover:border-black/25`}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
  };

  const section = (key: string, icon: React.ReactNode, title: string, rule: string, items: React.ReactNode, dark = false) => (
    <section key={key} className={`mt-6 rounded-[26px] border p-5 sm:p-6 ${dark ? 'hell-surface border-[#ff3355]/40 text-white' : 'border-black/10 bg-[#f9f7f1]'}`}>
      <h2 className="flex items-center gap-2 text-lg font-black">{icon}{title}</h2>
      <p className={`mt-1.5 inline-flex break-keep rounded-full px-3 py-1 text-[11px] font-black ${dark ? 'bg-[#ff2448]/20 text-[#ff8ea0]' : 'bg-[#17201e] text-[#ffe08a]'}`}>{rule}</p>
      {items}
    </section>
  );
  const grid = 'mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6';
  const gameName = (g: GameId) => CERT_GAMES[g][locale === 'en' ? 'en' : 'ko'];

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <div className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">ICON COLLECTION</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-black/55">{t('intro')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={{ pathname: '/records', hash: MY_ICON_ANCHOR }} className="flex items-center gap-2 rounded-2xl bg-[#17201e] px-5 py-3 text-sm font-black text-white">{t('pick')}<ArrowRight size={15} /></Link>
          {user && <span className="rounded-full border border-[#ff6b4a]/40 bg-[#fff0eb] px-3 py-1.5 text-xs font-black text-[#c2410c]">{t('ownedCount', { n: [...owned].filter((i) => !i.startsWith('h-')).length })}</span>}
        </div>

        {/* HIDDEN MISSION: the three rarest icons, with this player's progress */}
        <section className="relative mt-6 overflow-hidden rounded-[26px] border border-[#a98bff]/40 bg-[radial-gradient(ellipse_at_50%_0%,#2a1670,#0c0630_70%)] p-5 text-white sm:p-6">
          <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ff6bc4]/20 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#7cf3ff]/15 blur-3xl" />
          <h2 className="relative flex items-center gap-2 font-mono text-lg font-black tracking-[0.18em]"><Eye size={18} className="text-[#ffd36b]" />{t('missionTitle')}</h2>
          <p className="relative mt-1.5 inline-flex break-keep rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-[#ffe08a]">{t('missionRule')}</p>
          <ul className="relative mt-5 grid gap-3 sm:grid-cols-3">
            {MISSIONS.map((m: Mission) => {
              const icon = `hm-${m}`;
              const mine = owned.has(icon);
              const total = m === 'hard' ? HARD_GAMES.length : m === 'hell' ? HELL_GAMES.length : CROWN_GAMES.length;
              const done = m === 'hard' ? mission?.hard : m === 'hell' ? mission?.hell : mission?.ranked;
              const key = m === 'hard' ? 'Hard' : m === 'hell' ? 'Hell' : 'Rank';
              return (
                <li key={m} className={`relative flex flex-col items-center rounded-2xl border px-3 pb-4 pt-5 text-center ${mine ? 'border-[#ffd36b]/70 bg-[#ffd36b]/10' : 'border-white/10 bg-white/[0.04]'}`}>
                  {mine && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffd36b] text-[#2a1d05]" title={t('owned')}><Check size={12} strokeWidth={3} /></span>}
                  <Stone name={t(`mission${key}`)} size={96} icon={icon} />
                  <span className="mt-3 font-mono text-sm font-black tracking-[0.12em] text-[#ffe08a]">{t(`mission${key}`)}</span>
                  <span className="mt-1 break-keep text-[11px] font-bold leading-4 text-white/60">{t(`mission${key}Desc`)}</span>
                  {user ? (mission && done !== undefined && (
                    <div className="mt-3 w-full">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#7cf3ff,#a98bff,#ff6bc4,#ffd36b)]" style={{ width: `${Math.min(100, (done / total) * 100)}%` }} /></div>
                      <p className="mt-1.5 font-mono text-[10px] font-black text-white/55">{mine ? t('missionDone') : m === 'rank' && mission.avg !== null ? t('missionAvg', { n: done, total, avg: mission.avg.toFixed(1) }) : t('missionCount', { n: done, total })}</p>
                    </div>
                  )) : <p className="mt-3 text-[10px] font-bold text-white/40">{t('missionLocked')}</p>}
                </li>
              );
            })}
          </ul>
        </section>

        {section('colors', <Palette size={18} className="text-[#3f8cff]" />, t('colorsTitle'), t('colorsRule'),
          <ul className={grid}>{STONE_COLORS.map((c) => cell(c, tr(`stoneColor.${c}`), undefined, '__free__'))}</ul>)}

        {section('piece', <Crown size={18} className="text-[#e8a33c]" />, t('pieceTitle'), t('pieceRule'),
          Object.keys(CHAMPION_LOOKS).map(Number).sort((a, b) => b - a).map((week) => (
            <div key={week} className="mt-4">
              <p className="text-[11px] font-black text-black/45">{t('pieceWeek', { n: week })}</p>
              <ul className={`${grid} mt-2`}>{([1, 2, 3] as const).map((place) => cell(`w${week}-${place}`, tr(`stoneChampName.w${week}_${place}`), t('place', { n: place })))}</ul>
            </div>
          )))}

        {section('hell', <Skull size={18} className="text-[#ff3355]" />, t('hellTitle'), t('hellRule'),
          <ul className={grid}>{([1, 2, 3] as const).map((place) => (
            <li key={place} className={`relative flex flex-col items-center rounded-2xl border px-1.5 pb-2.5 pt-3 ${owned.has(`h-${place}`) ? 'border-[#ff2bd6]/70 bg-[#ff2bd6]/10' : 'border-white/10 bg-white/[0.04]'}`}>
              {owned.has(`h-${place}`) && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff2bd6] text-white"><Check size={10} strokeWidth={3} /></span>}
              <Stone name={ti(`hellName${place}`)} size={56} icon={`h1-${place}`} />
              <span className="mt-1.5 text-center text-[11px] font-black">{ti(`hellName${place}`)}</span>
              <span className="mt-0.5 text-[10px] font-bold text-[#ff8ea0]">{t('place', { n: place })}</span>
            </li>
          ))}</ul>, true)}

        {section('open', <Swords size={18} className="text-[#5b6cff]" />, t('openTitle'), t('openRule'),
          <ul className={grid}>{([1, 2, 3] as const).map((place) => cell(`o-${place}`, ti('openLabel', { place }), openTop.get(place) ?? t('noHolder')))}</ul>)}

        {section('m2048', <Sparkles size={18} className="text-[#e8b730]" />, t('m2048Title'), t('m2048Rule'),
          <ul className={grid}>{M2048_TIERS.map((n) => cell(`m${n}`, ti('m2048', { n })))}</ul>)}

        {section('play', <Clock size={18} className="text-[#7a4cff]" />, t('playTitle'), t('playRule'),
          <>
            {user && playSec !== null && (
              <div className="mt-3 max-w-md">
                <p className="text-[11px] font-black text-black/55">{t('playMine', { h: (playSec / 3600).toFixed(1) })}</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#c77a45,#b9c2cf,#f5c53a,#b48cff)]" style={{ width: `${Math.min(100, playSec / 3600)}%` }} /></div>
              </div>
            )}
            <ul className={grid}>{PLAY_HOURS.map((h) => cell(`t${h}`, ti('playHours', { n: h })))}</ul>
          </>)}

        {section('badges', <Trophy size={18} className="text-[#ff8a5c]" />, t('badgeTitle'), t('badgeRule'),
          <ul className={grid}>{cell('fw', ti('friendWin'))}{cell('ow', ti('openWin'))}{cell('hc', ti('hellClear'))}</ul>)}

        {section('hard', <Medal size={18} className="text-[#8a94a3]" />, t('hardTitle'), t('hardRule'),
          <ul className={grid}>{HARD_GAMES.map((g) => cell(`x-${g}`, gameName(g), undefined, `x-${g}`, CERT_GAMES[g].href))}</ul>)}

        {section('crowns', <Gamepad2 size={18} className="text-[#ff6b4a]" />, t('crownTitle'), t('crownRule'),
          <ul className={grid}>{CROWN_GAMES.map((g) => cell(`c-${g}`, gameName(g), holders.get(g) ?? t('noHolder'), `c-${g}`, `/ranking/${rankSlug(g)}`))}</ul>)}
      </div>
    </main>
  );
}
