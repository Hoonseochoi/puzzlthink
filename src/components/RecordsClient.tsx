"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock3, Crown, Gamepad2, Medal, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { type GameId, type HallEntry, type Profile, type ResultRow, fetchHallOfFame, fetchMyRecords, saveProfile } from '@/lib/stats';
import AuthButton from './AuthButton';
import { avatarUrl, displayName, useAuth } from './AuthProvider';
import AdSlot from './AdSlot';

const GAMES: { id: GameId; href: string; color: string }[] = [
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a' },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061' },
  { id: 'janggi', href: '/janggi', color: '#e8a33c' },
  { id: 'russian_janggi', href: '/russian-janggi', color: '#f2b84b' },
  { id: 'russian_roulette', href: '/russian-roulette', color: '#65e5ff' },
  { id: 'blind_gomoku', href: '/blind-gomoku', color: '#d39b2f' },
  { id: 'laser_janggi', href: '/laser-janggi', color: '#28b9d7' },
  { id: 'nemo_count', href: '/nemo-count', color: '#7d86a8' },
  { id: 'sudoku', href: '/play', color: '#4b7bff' },
];
/** Common message key for each game's name. */
const GAME_LABEL: Record<GameId, string> = { wallgo: 'wallgo', heavy13: 'heavy13', janggi: 'janggi', russian_janggi: 'russianJanggi', russian_roulette: 'russianRoulette', blind_gomoku: 'blindGomoku', laser_janggi: 'laserJanggi', nemo_count: 'nemoCount', sudoku: 'sudoku' };
const MEDALS = ['🥇', '🥈', '🥉'];

function formatDuration(seconds: number, t: (k: string, v?: Record<string, number>) => string) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
  return h ? t('hoursMinutes', { h, m }) : t('minutes', { m });
}

function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  return src
    // eslint-disable-next-line @next/next/no-img-element -- external Google avatar
    ? <img src={src} alt="" referrerPolicy="no-referrer" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
    : <span className="flex shrink-0 items-center justify-center rounded-full bg-[#17201e] font-black text-white" style={{ width: size, height: size, fontSize: size * 0.4 }}>{name.slice(0, 1) || '?'}</span>;
}

export default function RecordsClient() {
  const t = useTranslations('Records');
  const tc = useTranslations('Common');
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [hall, setHall] = useState<HallEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [showInHall, setShowInHall] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchHallOfFame().then(({ entries, error }) => { setHall(entries); if (error) setLoadError(error); }); }, []);
  useEffect(() => {
    if (!user) return;
    fetchMyRecords().then(({ profile: p, results: r, error }) => {
      setProfile(p); setResults(r);
      if (p) { setNickname(p.nickname ?? ''); setShowInHall(p.show_in_hall); }
      if (error) setLoadError(error);
    });
  }, [user]);

  const byGame = useMemo(() => {
    const blank = () => ({ ai: { win: 0, loss: 0, draw: 0 }, friend: { win: 0, loss: 0, draw: 0 }, solo: { win: 0, loss: 0, draw: 0 }, total: 0 });
    const map = Object.fromEntries(GAMES.map((g) => [g.id, blank()])) as Record<GameId, ReturnType<typeof blank>>;
    for (const r of results) { if (!map[r.game]) continue; map[r.game][r.mode][r.result] += 1; map[r.game].total += 1; }
    return map;
  }, [results]);

  const onSave = async () => {
    const error = await saveProfile(nickname, showInHall);
    if (!error) { setSaved(true); window.setTimeout(() => setSaved(false), 1800); fetchHallOfFame().then(({ entries }) => setHall(entries)); }
  };

  const needsSetup = loadError && /relation|function|does not exist|schema cache/i.test(loadError);
  const line = (rec: { win: number; loss: number; draw: number }, game: GameId) =>
    game === 'heavy13' ? t('heavyLine', { first: rec.win, mid: rec.draw, out: rec.loss })
      : game === 'russian_roulette' ? t('rouletteLine', { s: rec.win, h: rec.loss })
      : rec.draw ? t('wldLine', { w: rec.win, l: rec.loss, d: rec.draw }) : t('wlLine', { w: rec.win, l: rec.loss });
  const rate = (rec: { win: number; loss: number; draw: number }) => {
    const n = rec.win + rec.loss + rec.draw;
    return n ? `${Math.round((rec.win / n) * 100)}%` : '—';
  };

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">RECORDS</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">{t('intro')}</p>
        {needsSetup && <p className="mt-4 rounded-2xl border border-[#ff6b4a]/30 bg-[#fff0eb] px-4 py-3 text-xs font-bold text-[#c2410c]">{t('setupNeeded')}</p>}

        {/* Hall of fame */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-black"><Trophy size={20} className="text-[#e8a33c]" />{t('hallTitle')}</h2>
          <p className="mt-1 text-xs text-black/45">{t('hallDesc')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((g) => {
              const top = hall.filter((h) => h.game === g.id).sort((a, b) => a.rank - b.rank);
              return (
                <section key={g.id} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-black">{tc(GAME_LABEL[g.id])}</h3><span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} /></div>
                  <ol className="mt-3 space-y-2">
                    {[0, 1, 2].map((i) => {
                      const e = top[i];
                      return (
                        <li key={i} className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 ${e ? 'bg-white' : 'border border-dashed border-black/10'}`}>
                          <span className="w-6 text-center text-lg">{MEDALS[i]}</span>
                          {e ? <>
                            <Avatar src={e.avatar_url} name={e.nickname} size={28} />
                            <span className="min-w-0 flex-1 truncate text-xs font-extrabold">{e.nickname}</span>
                            <span className="shrink-0 font-mono text-[11px] font-black text-black/55">{t(g.id === 'sudoku' ? 'solvedCount' : 'winsCount', { n: e.wins })}</span>
                          </> : <span className="text-[11px] text-black/30">{t('emptySpot')}</span>}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </section>

        {/* My records */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-xl font-black"><Medal size={20} className="text-[#4b7bff]" />{t('myTitle')}</h2>
          {!ready ? null : !user ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-6">
              <p className="text-sm text-black/60">{t('loginPrompt')}</p>
              <AuthButton />
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <section className="flex items-center gap-4 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5">
                  <Avatar src={profile?.avatar_url ?? avatarUrl(user)} name={profile?.nickname ?? displayName(user)} size={56} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{profile?.nickname || displayName(user)}</p>
                    <p className="truncate text-xs text-black/45">{user.email}</p>
                    {profile && <p className="mt-1 text-[11px] text-black/45">{t('joined', { date: new Date(profile.created_at).toLocaleDateString() })}</p>}
                  </div>
                </section>
                <div className="grid grid-cols-2 gap-3">
                  <section className="rounded-[24px] bg-[#17201e] p-4 text-white"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50"><Clock3 size={12} />{t('playTime')}</p><p className="mt-1 text-2xl font-black">{formatDuration(profile?.total_seconds ?? 0, t)}</p></section>
                  <section className="rounded-[24px] border border-black/10 bg-white p-4"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-black/40"><Gamepad2 size={12} />{t('gamesPlayed')}</p><p className="mt-1 text-2xl font-black">{results.length}</p></section>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GAMES.map((g) => {
                  const rec = byGame[g.id];
                  const main = g.id === 'sudoku' ? rec.solo : rec.ai;
                  return (
                    <Link key={g.id} href={g.href} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4 transition hover:-translate-y-0.5 hover:bg-white">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-black">{tc(GAME_LABEL[g.id])}</h3><span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} /></div>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-black/40">{g.id === 'sudoku' ? t('soloLabel') : t('aiLabel')}</p>
                      <p className="mt-0.5 text-xl font-black">{g.id === 'sudoku' ? t('solvedLine', { s: main.win, f: main.loss }) : line(main, g.id)}</p>
                      <p className="text-[11px] text-black/45">{t('winRate', { r: rate(main) })}</p>
                      {g.id !== 'sudoku' && <p className="mt-2 border-t border-black/[0.07] pt-2 text-[11px] text-black/55">{t('friendLabel')} · {line(rec.friend, g.id)}</p>}
                    </Link>
                  );
                })}
              </div>

              <section className="mt-3 flex flex-col gap-3 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">{t('nickname')}</span>
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={16} className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#ff6b4a]/60" />
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-black/60">
                  <input type="checkbox" checked={showInHall} onChange={(e) => setShowInHall(e.target.checked)} className="h-4 w-4 accent-[#17201e]" />{t('showInHall')}
                </label>
                <button onClick={onSave} className="rounded-2xl bg-[#17201e] px-5 py-2.5 text-xs font-black text-white">{saved ? t('saved') : t('save')}</button>
              </section>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-black/40"><Crown size={11} />{t('privacyNote')}</p>
            </>
          )}
        </section>
        <AdSlot placement="inline" className="mt-14" />
      </div>
    </main>
  );
}
