"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, Clock3, Copy, Crown, Eye, Loader2, Share2, Users, WifiOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { MODES, type Direction, type PlayerId, getMoveOptions, getTerritory } from '@/lib/wallgo';
import type { LogEntry } from '@/lib/wallgoRoom';
import { useWallGoRoom } from '@/hooks/useWallGoRoom';
import LanguageSwitcher from './LanguageSwitcher';
import WallGoBoard from './WallGoBoard';
import WallGoScoreStrip from './WallGoScoreStrip';
import WallGoCharacter from './WallGoCharacter';
import Shards from './WallGoShards';
import { cinzel, FOG, PANEL, PANEL_TITLE, STEEL_TEXT } from './wallgoTheme';

export default function WallGoRoom({ code }: { code: string }) {
  const t = useTranslations('WallGoOnline');
  const tw = useTranslations('WallGo');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useWallGoRoom(code, defaultName);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/wallgo/room/${code}`);
    return () => { window.clearInterval(timer); window.clearTimeout(slow); };
  }, [code, locale]);

  const mode = state ? MODES[state.mode] : null;
  const walls = useMemo(() => new Set(state?.walls ?? []), [state?.walls]);
  const scoring = state?.phase === 'playing' || state?.phase === 'finished';
  // Territory only means something once every piece is on the board.
  const territory = useMemo(() => getTerritory(scoring ? state!.pieces : [], walls, mode?.totalPieces ?? 6), [scoring, state, walls, mode?.totalPieces]);
  const myTurn = !!state && mySeat !== null && state.current === mySeat && (state.phase === 'placement' || state.phase === 'playing');
  const myMoves = useMemo(() => (
    state && mode && myTurn && state.phase === 'playing' && state.step === 'move'
      ? getMoveOptions(state.pieces, walls, mySeat!, mode.wallBreak && state.breaks[mySeat!]) : []
  ), [state, mode, myTurn, walls, mySeat]);
  const selectedMoves = selectedPieceId ? myMoves.filter((move) => move.pieceId === selectedPieceId) : [];
  const online = new Set(peers.map((peer) => peer.id));
  const names = state ? state.seats.map((seat, i) => seat ? (seat.id === me?.id ? `${seat.name} (${t('me')})` : seat.name) : t('emptySeat', { n: i + 1 })) : [];
  const plainName = (seat?: PlayerId) => (seat === undefined || !state ? '' : state.seats[seat]?.name ?? t('emptySeat', { n: seat + 1 }));
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;

  const handleCellClick = (row: number, col: number) => {
    if (!state || !myTurn) return;
    if (state.phase === 'placement') { dispatch({ t: 'place', row, col }); return; }
    if (state.step !== 'move') return;
    const piece = state.pieces.find((item) => item.row === row && item.col === col);
    if (piece?.player === mySeat) { setSelectedPieceId(piece.id); return; }
    const move = selectedMoves.find((option) => option.to.row === row && option.to.col === col);
    if (move) { dispatch({ t: 'move', pieceId: move.pieceId, row, col }); setSelectedPieceId(null); }
  };
  const placeWall = (direction: Direction) => dispatch({ t: 'wall', direction });

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ }
  };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK WALLGO', text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };

  const logLine = (entry: LogEntry) => t(entry.k, { player: plainName(entry.s), cell: entry.cell ?? '', direction: entry.dir ? tw(entry.dir) : '' });
  const instruction = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle')
    : state.phase === 'finished' ? t('winnerTitle', { player: plainName(state.winner ?? undefined) })
      : !myTurn ? t('waitingFor', { player: plainName(state.current) })
        : state.phase === 'placement' ? tw('placement') : state.step === 'move' ? (selectedPieceId ? tw('chooseMove') : tw('selectPiece')) : tw('placeWall');
  const full = !!state && state.seats.every(Boolean);

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0e] text-[#e6e9f0]" style={{ backgroundImage: FOG }}>
      <Shards />
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/wallgo" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">{tc('wallgo')}</span></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className={`${locale === 'ko' ? 'font-black' : cinzel.className} ${STEEL_TEXT} text-xl tracking-[0.12em]`}>{locale === 'ko' ? tc('wallgo') : 'WALLGO'}</strong>
          <span className="hidden text-[9px] font-bold tracking-[0.16em] text-[#ff4d5e]/70 sm:inline">ONLINE · {mode ? `${mode.id === 'two' ? '1:1' : '1:1:1'} · ` : ''}{code.toUpperCase()}</span>
        </div>
        <LanguageSwitcher compact dark />
      </header>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffb3ba] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/wallgo" className="rounded-md bg-[#e0283a] px-4 py-2.5 text-sm font-bold text-white">{t('backToGame')}</Link>}
        </main>
      ) : (
        <main className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8">
          <section className="rounded-[14px] border border-white/10 bg-[#121217]/85 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:px-2">
              <div className="min-w-0">
                <p className="mb-1 font-mono text-[10px] font-bold tracking-[0.25em] text-[#ff4d5e]">{state.phase === 'lobby' ? 'LOBBY' : `TURN ${String(state.turn).padStart(2, '0')}`}</p>
                <h2 className="text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{instruction}</h2>
              </div>
              {(state.phase === 'placement' || state.phase === 'playing') && (
                <div className={`flex min-w-[82px] items-center justify-center gap-2 rounded-md px-3 py-2.5 font-mono text-base font-bold ${seconds <= 15 && myTurn ? 'animate-pulse bg-[#e0283a] text-white shadow-[0_0_20px_rgba(224,40,58,.6)]' : 'border border-white/15 bg-black/60 text-[#c9cfdc]'}`}>
                  <Clock3 size={16} />{`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}
                </div>
              )}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[560px] space-y-5 py-4">
                <div className="rounded-[12px] border border-[#e0283a]/30 bg-black/50 p-5">
                  <p className={PANEL_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc', { count: (mode?.players.length ?? 2) - 1 })}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className="flex shrink-0 items-center gap-1.5 rounded-md bg-[#e0283a] px-3 py-2 text-xs font-bold text-white hover:bg-[#f0354a]"><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#0b0b0e] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e0283a]/60" />
                  <button type="submit" className="shrink-0 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10">{t('changeName')}</button>
                </form>
                {me?.isHost ? (
                  <button onClick={() => dispatch({ t: 'start' })} disabled={!full} className="w-full rounded-md bg-[#e0283a] py-3.5 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(224,40,58,.45)] transition enabled:hover:bg-[#f0354a] disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none">
                    {full ? t('start') : t('waitingPlayers', { count: state.seats.filter((seat) => !seat).length })}
                  </button>
                ) : (
                  <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>
                )}
              </div>
            ) : (
              <>
                <WallGoScoreStrip players={mode?.players ?? [0, 1, 2]} current={state.current} active={state.phase === 'placement' || state.phase === 'playing'} names={state.seats.map((seat, i) => seat?.name ?? t('emptySeat', { n: i + 1 }))} scores={territory.scores} pieces={(mode?.players ?? []).map((p) => state.pieces.filter((piece) => piece.player === p).length)} total={(mode?.totalPieces ?? 6) / (mode?.players.length ?? 3)} breaks={mode?.wallBreak ? state.breaks : null} unit={tw('unitTiles')} />
                <WallGoBoard
                  pieces={state.pieces} walls={walls} cellOwners={territory.cellOwners} selectedPieceId={selectedPieceId} moves={selectedMoves}
                  wallPieceId={myTurn && state.step === 'wall' ? state.moved : null} playerNames={names} interactivePlayer={mySeat}
                  canPlace={myTurn && state.phase === 'placement'} onCellClick={handleCellClick} onWall={placeWall}
                />
                {mySeat === null && <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={`${state.phase === 'lobby' ? '' : 'hidden lg:block'} ${PANEL}`}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{tw('players')}</h2><span className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"><Users size={12} />{state.seats.filter(Boolean).length}/{state.seats.length}</span></div>
              <div className="space-y-2">
                {state.seats.map((seat, index) => {
                  const player = index as PlayerId;
                  const active = state.current === player && (state.phase === 'placement' || state.phase === 'playing');
                  return (
                    <div key={index} className={`flex items-center gap-3 rounded-[10px] border p-3 ${active ? 'border-[#e0283a]/50 bg-white/[0.04] shadow-[inset_0_0_20px_rgba(224,40,58,.08)]' : 'border-transparent'} ${seat ? '' : 'opacity-50'}`}>
                      <WallGoCharacter player={player} className="h-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{names[index]}</p>
                          {index === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {seat && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(seat.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} aria-label={online.has(seat.id) ? t('online') : t('offline')} />}
                        </div>
                        <p className="text-[11px] text-white/45">{state.phase === 'lobby' ? (seat ? t('ready') : t('waiting')) : tw('areaPieces', { area: territory.scores[player], pieces: state.pieces.filter((piece) => piece.player === player).length, total: (mode?.totalPieces ?? 6) / (mode?.players.length ?? 3) })}</p>
                      </div>
                      {mode?.wallBreak && state.phase !== 'lobby' && <div className="text-right"><p className="text-[9px] font-bold text-white/35">{tw('break')}</p><p className={`text-xs font-black ${state.breaks[player] ? 'text-[#ff4d5e]' : 'text-white/25'}`}>{tw(state.breaks[player] ? 'ready' : 'used')}</p></div>}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rounded-[14px] border border-[#e0283a]/30 bg-black/60 p-5">
              <h2 className={PANEL_TITLE}>{tw('howToPlay')}</h2>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{(mode?.id === 'two' ? ['duelRule1', 'rule1', 'rule2', 'duelRule3'] : ['rule1', 'rule2', 'rule3']).map((key, index) => <li key={key} className="flex gap-3"><span className="font-mono text-[#ff4d5e]">0{index + 1}</span><span>{tw(key)}</span></li>)}</ol>
            </section>
            <section className={`min-h-[142px] ${PANEL}`}>
              <h2 className={`mb-3 ${PANEL_TITLE}`}>{tw('matchLog')}</h2>
              <div className="space-y-2">{state.log.slice(0, 6).map((entry, index) => <div key={`${state.v}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{index === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#e0283a]" /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{logLine(entry)}</span></div>)}</div>
            </section>
          </aside>
        </main>
      )}

      {state?.phase === 'finished' && state.winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[16px] border border-white/10 bg-[#121217] p-7 text-center shadow-[0_0_80px_rgba(224,40,58,.25)]">
            <WallGoCharacter player={state.winner} className="mx-auto h-20" />
            <p className={`${cinzel.className} mt-5 text-xs font-bold tracking-[0.3em] text-[#ff4d5e]`}>{tw('gameOver')}</p>
            <h2 className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{state.winner === mySeat ? tw('youWin') : t('winnerTitle', { player: plainName(state.winner) })}</h2>
            <p className="mt-2 text-sm text-white/50">{tw('finalScore', { score: territory.scores[state.winner], largest: territory.largest[state.winner] })}</p>
            {me?.isHost
              ? <button onClick={() => dispatch({ t: 'start' })} className="mt-6 w-full rounded-md bg-[#e0283a] py-3.5 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(224,40,58,.45)] hover:bg-[#f0354a]">{t('rematch')}</button>
              : <p className="mt-6 text-xs text-white/45">{t('rematchWait')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
