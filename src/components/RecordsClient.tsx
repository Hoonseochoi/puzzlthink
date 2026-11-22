"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Award, Bot, Clock3, Crown, DoorOpen, Flame, Gamepad2, Medal, Swords, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { type GameId, type HallEntry, type Profile, type ResultRow, fetchHallOfFame, fetchMyRecords, isNicknameTaken, saveProfile } from '@/lib/stats';
import { clearLabel } from '@/lib/hardClear';
import { getSupabase } from '@/lib/supabase';
import AuthButton from './AuthButton';
import { avatarUrl, displayName, useAuth } from './AuthProvider';
import StoneAvatar from './StoneAvatar';
import OpenRankingBoard from './OpenRankingBoard';
import RankMove from './RankMove';
import ChallengeRecords from './ChallengeRecords';
import CompetitionBoard from './CompetitionBoard';
import { byGameOrder } from './recordOrder';

const GAMES: { id: GameId; href: string; color: string }[] = [
  { id: 'gyulhap', href: '/gyulhap', color: '#ffcf3f' },
  { id: 'indian_poker', href: '/indian-poker', color: '#e6b94f' },
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a' },
  { id: 'flip_omok', href: '/flip-omok', color: '#3fb8ff' },
  { id: 'nine_mens_morris', href: '/nine-mens-morris', color: '#3ec9d6' },
  { id: 'wallgo2', href: '/wallgo-2', color: '#e0283a' },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061' },
  { id: 'janggi', href: '/janggi', color: '#e8a33c' },
  { id: 'russian_janggi', href: '/russian-janggi', color: '#f2b84b' },
  { id: 'russian_roulette', href: '/russian-roulette', color: '#65e5ff' },
  { id: 'blind_gomoku', href: '/blind-gomoku', color: '#d39b2f' },
  { id: 'laser_janggi', href: '/laser-janggi', color: '#28b9d7' },
  { id: 'black_white', href: '/black-white', color: '#e9c46a' },
  { id: 'black_white_2', href: '/black-white-2', color: '#ef3340' },
  { id: 'hexagon', href: '/hexagon', color: '#e8b04a' },
  { id: 'piggy_bank', href: '/piggy-bank', color: '#e0a91c' },
  { id: 'nemo_count', href: '/nemo-count', color: '#7d86a8' },
  { id: 'sudoku', href: '/play', color: '#4b7bff' },
];
/** Common message key for each game's name. */
const GAME_LABEL: Record<GameId, string> = { starbattle: 'starbattle', masyu: 'masyu', nonogram: 'nonogram', two_sided_poker: 'twoSidedPoker', monorail: 'monorail', flip_omok: 'flipOmok', nine_mens_morris: 'nineMensMorris', wallgo2: 'wallgo2', slitherlink: 'slitherlink', gyulhap: 'gyulhap', indian_poker: 'indianPoker', wallgo: 'wallgo', heavy13: 'heavy13', janggi: 'janggi', russian_janggi: 'russianJanggi', russian_roulette: 'russianRoulette', blind_gomoku: 'blindGomoku', laser_janggi: 'laserJanggi', nemo_count: 'nemoCount', black_white: 'blackWhite', black_white_2: 'blackWhite2', piggy_bank: 'piggyBank', hexagon: 'hexagon', sudoku: 'sudoku' };
const MEDALS = ['🥇', '🥈', '🥉'];
/** Solo challenges have their own tab (they never appear in the AI Hall of Fame). */
const CHALLENGE_GAMES = new Set<GameId>(['slitherlink', 'gyulhap', 'nemo_count', 'hexagon', 'masyu', 'nonogram', 'starbattle']);

function formatDuration(seconds: number, t: (k: string, v?: Record<string, number>) => string) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
  return h ? t('hoursMinutes', { h, m }) : t('minutes', { m });
}

function Avatar({ name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  return <StoneAvatar name={name} size={size} />;
}

export default function RecordsClient() {
  const t = useTranslations('Records');
  const tc = useTranslations('Common');
  const { user, ready, saveNickname } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [hall, setHall] = useState<HallEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [showInHall, setShowInHall] = useState(true);
  const [saved, setSaved] = useState(false);
  const [nameTaken, setNameTaken] = useState(false);
  const [recordView, setRecordView] = useState<'ai' | 'open' | 'challenge' | 'competition'>('ai');
  const [certs, setCerts] = useState<{ id: string; game: GameId; clear_no: number }[]>([]);
  const locale = useLocale();

  // Links can open a tab directly (the home 피스 경쟁전 banner goes to #competition).
  useEffect(() => {
    const tab = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only readable in the browser
    if (tab === 'competition' || tab === 'open' || tab === 'challenge') setRecordView(tab);
  }, []);
  useEffect(() => { fetchHallOfFame().then(({ entries, error }) => { setHall(entries); if (error) setLoadError(error); }); }, []);
  useEffect(() => {
    if (!user) return;
    fetchMyRecords().then(({ profile: p, results: r, error }) => {
      setProfile(p); setResults(r);
      if (p) { setNickname(p.nickname ?? ''); setShowInHall(p.show_in_hall); }
      if (error) setLoadError(error);
    });
    getSupabase()?.rpc('my_hard_clears').then(({ data }) => { if (Array.isArray(data)) setCerts(data); });
  }, [user]);

  const byGame = useMemo(() => {
    const blank = () => ({
      ai: { win: 0, loss: 0, draw: 0 },
      friend: { win: 0, loss: 0, draw: 0 },
      open: { win: 0, loss: 0, draw: 0 },
      solo: { win: 0, loss: 0, draw: 0 },
      total: 0,
    });
    const map = Object.fromEntries(GAMES.map((g) => [g.id, blank()])) as Record<GameId, ReturnType<typeof blank>>;
    for (const r of results) {
      if (!map[r.game]) continue;
      map[r.game][r.mode][r.result] += 1;
      if (r.mode === 'friend' && r.detail.open === true) map[r.game].open[r.result] += 1;
      map[r.game].total += 1;
    }
    return map;
  }, [results]);

  const onSave = async () => {
    const error = await saveProfile(nickname, showInHall);
    setNameTaken(isNicknameTaken(error));
    if (!error && nickname.trim().length >= 2) {
      const trimmed = nickname.trim();
      await saveNickname(trimmed); // rooms and rankings use it from now on
      setNickname(trimmed);
      setProfile((current) => current ? { ...current, nickname: trimmed } : current);
    }
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
  const recordCards = (view: 'ai' | 'open') => {
    const pool = view === 'open' ? GAMES.filter((game) => game.id !== 'sudoku') : GAMES.filter((game) => !CHALLENGE_GAMES.has(game.id));
    const recordOf = (id: GameId) => (view === 'open' ? byGame[id].open : id === 'sudoku' ? byGame[id].solo : byGame[id].ai);
    const games = byGameOrder(pool, (g) => g.id, (g) => { const r = recordOf(g.id); return r.win + r.loss + r.draw > 0; });
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const stats = byGame[game.id];
          const record = view === 'open' ? stats.open : game.id === 'sudoku' ? stats.solo : stats.ai;
          return (
            <Link key={game.id} href={game.href} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4 transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-center justify-between"><h3 className="text-sm font-black">{tc(GAME_LABEL[game.id])}</h3><span className="h-2.5 w-2.5 rounded-full" style={{ background: game.color }} /></div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-black/40">{view === 'open' ? t('openLabel') : game.id === 'sudoku' ? t('soloLabel') : t('aiLabel')}</p>
              <p className="mt-0.5 text-xl font-black">{game.id === 'sudoku' ? t('solvedLine', { s: record.win, f: record.loss }) : line(record, game.id)}</p>
              <p className="text-[11px] text-black/45">{t('winRate', { r: rate(record) })}</p>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">RECORDS</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">{t('intro')}</p>
        {needsSetup && <p className="mt-4 rounded-2xl border border-[#ff6b4a]/30 bg-[#fff0eb] px-4 py-3 text-xs font-bold text-[#c2410c]">{t('setupNeeded')}</p>}

        {/* Account and nickname stay above every record view. */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-black"><Crown size={20} className="text-[#ff6b4a]" />{t('nicknameTitle')}</h2>
          {!ready ? null : !user ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-6">
              <p className="text-sm text-black/60">{t('loginPrompt')}</p>
              <AuthButton source="records" />
            </div>
          ) : (
            <>
              <section className="mt-4 flex flex-col gap-3 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">{t('nickname')}</span>
                  <input value={nickname} onChange={(event) => { setNickname(event.target.value); setNameTaken(false); }} maxLength={16} className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[#ff6b4a]/60" />
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-black/60">
                  <input type="checkbox" checked={showInHall} onChange={(event) => setShowInHall(event.target.checked)} className="h-4 w-4 accent-[#17201e]" />{t('showInHall')}
                </label>
                <button onClick={onSave} className="rounded-2xl bg-[#17201e] px-5 py-2.5 text-xs font-black text-white">{saved ? t('saved') : t('save')}</button>
              </section>
              {nameTaken && <p className="mt-2 text-xs font-bold text-[#c2410c]">{t('nicknameTaken')}</p>}
              <p className="mt-2 break-keep text-[11px] font-bold text-black/55">{t('nicknameNote')}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-black/40"><Crown size={11} />{t('privacyNote')}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
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

              <section className="mt-3 rounded-[24px] border border-[#d9b25f]/40 bg-[#fbf5e6] p-5">
                <h3 className="flex items-center gap-1.5 text-sm font-black"><Award size={16} className="text-[#b8892e]" />{tc('myCerts')}</h3>
                {certs.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {certs.map((c) => (
                      <Link key={c.id} href={`/cert/${c.id}`} className="flex items-center gap-2 rounded-full border border-[#d9b25f]/50 bg-white px-3 py-1.5 text-xs font-bold hover:bg-[#fff8e6]">
                        <span className="font-mono font-black text-[#b8892e]">#{c.clear_no}</span>{clearLabel(c.game, locale)}
                      </Link>
                    ))}
                  </div>
                ) : <p className="mt-2 text-xs text-black/50">{tc('myCertsEmpty')}</p>}
              </section>
            </>
          )}
        </section>

        <div id="competition" className="mt-10 scroll-mt-24 rounded-[22px] border border-black/10 bg-[#e9e5dc] p-1.5" role="tablist" aria-label={t('recordTabsLabel')}>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <button type="button" role="tab" aria-selected={recordView === 'ai'} onClick={() => setRecordView('ai')} className={`flex items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black transition ${recordView === 'ai' ? 'bg-[#17201e] text-white shadow-sm' : 'text-black/50 hover:bg-white/60'}`}><Bot size={16} />{t('aiTab')}</button>
            <button type="button" role="tab" aria-selected={recordView === 'open'} onClick={() => setRecordView('open')} className={`flex items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black transition ${recordView === 'open' ? 'bg-[#ff4d5e] text-white shadow-sm' : 'text-black/50 hover:bg-white/60'}`}><DoorOpen size={16} />{t('openTab')}</button>
            <button type="button" role="tab" aria-selected={recordView === 'challenge'} onClick={() => setRecordView('challenge')} className={`flex items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black transition ${recordView === 'challenge' ? 'bg-[#8f7cff] text-white shadow-sm' : 'text-black/50 hover:bg-white/60'}`}><Flame size={16} />{t('challengeTab')}</button>
            <button type="button" role="tab" aria-selected={recordView === 'competition'} onClick={() => setRecordView('competition')} className={`flex items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black transition ${recordView === 'competition' ? 'bg-[#e8a33c] text-white shadow-sm' : 'text-black/50 hover:bg-white/60'}`}><Swords size={16} />{t('competitionTab')}</button>
          </div>
        </div>

        {recordView === 'ai' ? (
          <>
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-black"><Trophy size={20} className="text-[#e8a33c]" />{t('hallTitle')}</h2>
              <p className="mt-1 text-xs text-black/45">{t('hallDesc')}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byGameOrder(GAMES.filter((g) => !CHALLENGE_GAMES.has(g.id)), (g) => g.id, (g) => hall.some((e) => e.game === g.id)).map((game) => {
                  const top = hall.filter((entry) => entry.game === game.id).sort((a, b) => a.rank - b.rank);
                  return (
                    <section key={game.id} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
                      <div className="flex items-center justify-between"><h3 className="text-sm font-black">{tc(GAME_LABEL[game.id])}</h3><span className="h-2.5 w-2.5 rounded-full" style={{ background: game.color }} /></div>
                      <ol className="mt-3 space-y-2">
                        {[0, 1, 2].map((index) => {
                          const entry = top[index];
                          return (
                            <li key={index} className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 ${entry ? 'bg-white' : 'border border-dashed border-black/10'}`}>
                              <span className="w-6 text-center text-lg">{MEDALS[index]}</span>
                              {entry ? <><Avatar src={entry.avatar_url} name={entry.nickname} size={28} /><span className="min-w-0 flex-1 truncate text-xs font-extrabold">{entry.nickname}</span><span className="shrink-0 font-mono text-[11px] font-black text-black/55">{t(game.id === 'sudoku' ? 'solvedCount' : 'winsCount', { n: entry.wins })}</span><RankMove rank={entry.rank} prev={entry.prev_rank} /></> : <span className="text-[11px] text-black/30">{t('emptySpot')}</span>}
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  );
                })}
              </div>
            </section>
            <section className="mt-14">
              <h2 className="flex items-center gap-2 text-xl font-black"><Medal size={20} className="text-[#4b7bff]" />{t('aiRecordsTitle')}</h2>
              <p className="mt-1 text-xs text-black/45">{t('aiRecordsDesc')}</p>
              {user ? recordCards('ai') : <p className="mt-4 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5 text-sm text-black/55">{t('loginPrompt')}</p>}
            </section>
          </>
        ) : recordView === 'competition' ? (
          <CompetitionBoard />
        ) : recordView === 'challenge' ? (
          <ChallengeRecords results={results} signedIn={!!user} />
        ) : (
          <>
            <OpenRankingBoard />
            <section className="mt-14">
              <h2 className="flex items-center gap-2 text-xl font-black"><Medal size={20} className="text-[#ff4d5e]" />{t('openRecordsTitle')}</h2>
              <p className="mt-1 text-xs text-black/45">{t('openRecordsDesc')}</p>
              {user ? recordCards('open') : <p className="mt-4 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5 text-sm text-black/55">{t('loginPrompt')}</p>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
