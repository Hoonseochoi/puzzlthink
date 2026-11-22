"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Copy, Crown, Flag, History, Loader2, RotateCcw, Share2, Swords, Trophy, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, INPUT, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { useTwoSidedPokerRoom } from '@/hooks/useTwoSidedPokerRoom';
import { reportGame } from '@/lib/stats';
import { tspView } from '@/lib/twoSidedPoker';
import { TSP_TURN_OPTIONS } from '@/lib/twoSidedPokerRoom';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, tspCopy } from './copy';
import { TspCountingPanel, TspHistoryPanel, TspRulesPanel, TspStage } from './TwoSidedPokerTable';
import { TspReplay, TspResultModal } from './TwoSidedPokerResult';

export default function TwoSidedPokerRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const t = tspCopy(locale);
  const r = t.room;
  const [defaultName] = useState(() => `${r.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, hostOnline, me, mySeat, dispatch, rename } = useTwoSidedPokerRoom(code, defaultName);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [closedSid, setClosedSid] = useState<string | null>(null); // the result popup was closed for this match
  const [replaying, setReplaying] = useState(false);
  const [shareUrl] = useState(() => (typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}/two-sided-poker/room/${code}`));

  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || state.winner === null || !state.game) return;
    reportGame(`two-sided-poker-friend-${state.sid}`, 'two_sided_poker', 'friend', state.winner === mySeat ? 'win' : 'loss', { hands: state.game.hand, chips: state.game.chips[mySeat], reason: state.reason });
  }, [state, mySeat]);

  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* clipboard optional */ } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: t.title, url: shareUrl }); return; } catch { /* cancelled */ } } copy(); };
  const shell = { ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) };
  const header = <GameHeader backHref="/two-sided-poker" backLabel={t.title} title={t.title} subtitle={r.online(code)}><BugReport /><LanguageSwitcher compact dark /></GameHeader>;

  if (!state) {
    return <div className={SHELL} style={shell}>{header}<main className="flex min-h-[70vh] items-center justify-center">{status === 'online' ? <Loader2 className="animate-spin" /> : <p className="flex items-center gap-2 text-sm text-white/50"><WifiOff size={15} />{status === 'error' ? r.connectionError : r.connecting}</p>}</main></div>;
  }

  const seatName = (n: number) => state.seats[n]?.name ?? r.emptySeat;
  // Spectators watch from the guest seat: the redacted state they receive hides the host's back anyway.
  const viewer = (mySeat ?? 1) as 0 | 1;
  const rival = (1 - viewer) as 0 | 1;
  const full = state.seats.every(Boolean);
  const game = state.game;
  const running = state.phase === 'bet' || state.phase === 'reveal';
  const badge = (n: number) => (mySeat === n ? r.me : (seatName(n).trim()[0] ?? '?').toUpperCase());

  const finishedStatus = state.phase === 'finished' && state.winner !== null
    ? `${r.winner(seatName(state.winner))}${state.reason === 'resign' ? ` · ${r.byResign}` : state.reason === 'timeout' ? ` · ${r.byTimeout}` : ''}`
    : undefined;
  const finished = state.phase === 'finished' && !!game;
  const won = mySeat !== null && state.winner === mySeat;
  const rematch = () => { setReplaying(false); setClosedSid(null); dispatch({ t: 'start' }); };
  const footer = state.phase === 'reveal'
    ? <p className="text-center text-xs font-bold text-white/45">{r.nextSoon}</p>
    : finished
      ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setReplaying(false); setClosedSid(null); }} className={`${BTN} py-3 text-xs`}><Trophy size={14} />{t.end.showResult}</button>
            <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-3 text-xs`}><History size={14} />{t.end.replay}</button>
          </div>
          {me?.isHost ? <button type="button" onClick={rematch} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{r.rematch}</button> : <p className="text-center text-xs text-white/45">{r.rematchWait}</p>}
        </div>
      )
      : null;
  const endReason = state.reason === 'resign' ? (won ? t.end.byResign : t.end.resigned)
    : state.reason === 'timeout' ? (won ? t.end.byTimeout : t.end.timedOut)
      : won ? t.end.byChips(game?.hand ?? 0) : t.end.lostChips(game?.hand ?? 0);

  return (
    <div className={SHELL} style={shell}>
      {header}
      {!hostOnline && !me?.isHost && <p className="mx-auto mt-3 max-w-[1180px] px-4 text-xs text-[#ffb3aa]">{r.hostOffline}</p>}
      <main className={MAIN}>
        <section className={STAGE}>
          {state.phase === 'lobby' || !game ? (
            <div className="mx-auto max-w-md space-y-4 py-4">
              <div className="px-1"><p className="font-mono text-[10px] font-bold tracking-[0.25em] text-(--accent)">{r.lobby}</p><h1 className="mt-1 text-xl font-extrabold">{r.lobbyTitle}</h1></div>
              <section className={PANEL}>
                <p className={PANEL_TITLE}>{r.invite}</p>
                <InviteCode code={code} />
                <div className="mt-3 flex gap-2"><button type="button" onClick={copy} className={`${BTN} flex-1`}><Copy size={14} />{copied ? r.copied : r.copy}</button><button type="button" onClick={share} className={`${BTN_ACCENT} flex-1`}><Share2 size={14} />{r.share}</button></div>
              </section>
              <form onSubmit={(e) => { e.preventDefault(); rename(name); setName(''); }} className="flex gap-2"><input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder={me?.name ?? ''} maxLength={16} /><button type="submit" className={BTN}>{r.rename}</button></form>
              {me?.isHost
                ? <button type="button" disabled={!full} onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 text-sm disabled:opacity-35`}><Swords size={15} />{full ? r.start : r.startLocked}</button>
                : <p className="text-center text-sm text-white/45">{mySeat === null ? r.roomFull : r.waitingHost}</p>}
            </div>
          ) : replaying && finished ? (
            <TspReplay t={t} rounds={tspView(game, viewer).rounds} names={[seatName(viewer), seatName(rival)]} onClose={() => { setReplaying(false); setClosedSid(state.sid); }} onShowResult={() => { setReplaying(false); setClosedSid(null); }} />
          ) : (
            <TspStage
              t={t} state={tspView(game, viewer)} names={[seatName(viewer), seatName(rival)]} badges={[badge(viewer), badge(rival)]}
              canAct={mySeat !== null && state.phase === 'bet'} onAct={(action) => dispatch({ t: 'act', action })}
              waitText={r.waitingFor(seatName(game.turn))} status={finishedStatus} deadline={state.phase === 'bet' ? state.deadline : undefined} footer={footer}
            />
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="mb-3 flex items-center justify-between"><p className={PANEL_TITLE}>{r.players}</p><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
            {[0, 1].map((seat) => (
              <div key={seat} data-chat-seat={state.seats[seat]?.id} className={`${playerRow(state.phase === 'bet' && game?.turn === seat)} mb-2`}>
                <span className="h-3 w-3 rounded-full" style={{ background: seat === viewer ? TSP_ACCENT : '#ff8a5c' }} />
                <span className="min-w-0 flex-1 truncate text-sm font-black">{seatName(seat)}{mySeat === seat ? ` (${r.me})` : ''}</span>
                {game && <span className="font-mono text-xs font-black text-white/60">{game.chips[seat]}</span>}
                {state.timeouts[seat] > 0 && running && <span className="text-[10px] font-bold text-[#ff9aa4]">{r.timeouts(state.timeouts[seat])}</span>}
                {seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}
              </div>
            ))}
          </section>
          {me?.isHost && !running && (
            <section className={PANEL}>
              <p className={PANEL_TITLE}>{r.turnTime}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">{TSP_TURN_OPTIONS.map((sec) => <button key={sec} type="button" onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2 ${seg(state.turnSec === sec)}`}>{sec}s</button>)}</div>
            </section>
          )}
          {game && <TspCountingPanel t={t} state={tspView(game, viewer)} />}
          {game && <TspHistoryPanel t={t} state={tspView(game, viewer)} />}
          <TspRulesPanel t={t} />
          {running && mySeat !== null && <button type="button" onClick={() => window.confirm(r.resignConfirm) && dispatch({ t: 'resign' })} className={`${BTN} text-white/50`}><Flag size={13} />{r.resign}</button>}
        </aside>
      </main>
      {finished && game && !replaying && closedSid !== state.sid && (
        <TspResultModal
          t={t} won={won} chips={game.chips[viewer]} title={mySeat === null && state.winner !== null ? t.end.winner(seatName(state.winner)) : won ? t.end.win : t.end.lose}
          reason={endReason} rounds={tspView(game, viewer).rounds} rankingNote={t.end.rankingRoom}
          onReplay={() => setReplaying(true)} onClose={() => setClosedSid(state.sid)}
          onAgain={me?.isHost ? rematch : undefined} waitingLabel={me?.isHost ? undefined : r.rematchWait}
        />
      )}
    </div>
  );
}
