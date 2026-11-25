"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BellRing, Check, Copy, Crown, Loader2, Lock, RotateCcw, Share2, Swords, Timer, Trophy, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, playerRow, seg } from '@/components/ui/gameUi';
import { useEquationTowerRoom } from '@/hooks/useEquationTowerRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { solvedStack } from '@/lib/equationTower';
import { ACT_MS, EQT_GOAL_OPTIONS, EQT_MAX_PLAYERS, EQT_MIN_PLAYERS, MAX_BID, OUTBID_MS, THINK_MS, eqtRanking, lowestBid } from '@/lib/equationTowerRoom';
import { reportGame } from '@/lib/stats';
import { type Held, TargetCard, TowerStacks, moveOf } from './TowerParts';
import { EQT_ACCENT, EQT_ROOT_STYLE, eqtCopy } from './copy';

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
const PHASE_MS = { think: THINK_MS, outbid: OUTBID_MS, act: ACT_MS } as const;

export default function EquationTowerRoomView({ code }: { code: string }) {
  const locale = useLocale();
  const c = eqtCopy(locale);
  const [defaultName] = useState(() => `${c.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useEquationTowerRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [pick, setPick] = useState(3); // moves to offer
  const [held, setHeld] = useState<Held | null>(null);
  const [seenAt, setSeenAt] = useState({ key: '', at: 0 });
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/equation-tower/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const phase = state?.phase;
  const timed = phase === 'think' || phase === 'outbid' || phase === 'act';
  // Timers run on this browser's clock from when the phase arrived here.
  const phaseKey = state && timed ? `${state.sid}-${state.index}-${phase}` : '';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this phase arrived here
    if (phaseKey && phaseKey !== seenAt.key) { setSeenAt({ key: phaseKey, at: Date.now() }); setHeld(null); }
  }, [phaseKey, seenAt.key]);

  // Record each finished game once per player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || !state.players.includes(mySeat)) return;
    const ranking = eqtRanking(state);
    const top = state.scores[ranking[0]];
    const tied = ranking.filter((s) => state.scores[s] === top).length;
    const result = state.scores[mySeat] !== top ? 'loss' : tied === 1 ? 'win' : 'draw';
    reportGame(`equation_tower-friend-${state.sid}`, 'equation_tower', 'friend', result,
      { rank: ranking.indexOf(mySeat) + 1, players: state.players.length, score: state.scores[mySeat], rounds: state.index + 1 });
  }, [state, mySeat]);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: c.title, text: c.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } copyLink(); };

  const notice = status === 'unconfigured' ? c.unconfigured : status === 'error' ? c.connectionError : !state && waitedLong ? c.roomNotFound : state && !me?.isHost && !hostOnline ? c.hostOffline : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? c.emptySeat;
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const inGame = !!state && mySeat !== null && state.players.includes(mySeat);
  const round = state?.round ?? null;
  const live = timed || phase === 'reveal';
  const timeLeft = timed ? Math.max(0, PHASE_MS[phase] - (now - (seenAt.key === phaseKey ? seenAt.at : now))) : 0;
  const low = state ? lowestBid(state) : null;
  const myBid = state && mySeat !== null ? state.bids[mySeat] : null;
  const acting = phase === 'act' && state!.actor === mySeat;
  const maxOffer = phase === 'outbid' && low ? low - 1 : MAX_BID;
  const offer = Math.max(1, Math.min(pick, maxOffer));
  const win = state && round && live ? solvedStack(state.stacks, state.blocks, round.target, round.floors) : -1;
  const last = phase === 'reveal' ? state!.last : null;

  const heading = !state ? '' : phase === 'lobby' ? c.lobbyTitle : phase === 'finished' ? c.finished
    : phase === 'think' ? c.thinkHeading
      : phase === 'outbid' ? c.outbidHeading(name(state.bids.findIndex((n) => n === low)), low ?? 0)
        : phase === 'act' ? (acting ? c.actMine(state.movesLeft) : c.actHeading(name(state.actor ?? 0), state.bids[state.actor ?? 0] ?? 0))
          : !last || last.seat === null ? c.resultNone : last.ok ? c.resultOk(name(last.seat), last.delta) : c.resultFail(name(last.seat), last.delta);

  const ranking = state ? eqtRanking(state) : [];
  const top = state && ranking.length ? state.scores[ranking[0]] : 0;

  return (
    <div className={SHELL} style={EQT_ROOT_STYLE}>
      <Shards tint="#33211a" />
      <RoomAlerts alerts={alerts} accent={EQT_ACCENT} joinText={c.joined} leaveText={c.left} />
      <GameHeader backHref="/equation-tower" backLabel={c.back} title={c.title} titleClass="font-black" subtitle={`ONLINE · ${seated}/${EQT_MAX_PLAYERS} · ${code.toUpperCase()}`}>
        <GameUpdates game="equation_tower" /><BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{c.connecting}</p> : <Link href="/equation-tower" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{c.backToGame}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={KICKER}>{phase === 'lobby' ? 'LOBBY' : phase === 'finished' ? 'RESULT' : c.roundKicker(state.index + 1)}</p>
                <h1 className={`mt-1 break-keep ${HEADING} ${last ? (last.ok ? 'text-[#7ee2ae]' : last.seat !== null ? 'text-[#ff9b94]' : '') : ''}`}>{heading}</h1>
                {timed && <p className={`mt-2 flex items-center gap-1.5 font-mono text-xs font-black ${timeLeft < 10_000 ? 'text-[#ff7b71]' : 'text-white/65'}`}><Timer size={13} />{clock(timeLeft)}{phase === 'act' && <span className="ml-2 text-(--accent)">{c.movesLeft(state.movesLeft)}</span>}</p>}
              </div>
              {round && live && <TargetCard target={round.target} floors={round.floors} c={c} />}
            </div>

            {phase === 'lobby' && (
              <div className="mx-auto max-w-[480px] space-y-4 py-2">
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{c.inviteTitle}</p>
                  <p className="mt-2 text-sm text-white/55">{c.inviteDesc}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? c.copied : c.copy}</button>
                    <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{c.share}</button>
                  </div>
                </div>
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{c.goal}</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{EQT_GOAL_OPTIONS.map((n) => <button key={n} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', goal: n })} className={`py-2 ${seg(state.goal === n)} disabled:cursor-default`}>{c.goalN(n)}</button>)}</div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{c.hostSets}</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={c.nickname} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{c.rename}</button>
                </form>
                {me?.isHost ? (
                  <button onClick={() => dispatch({ t: 'start' })} disabled={seated < EQT_MIN_PLAYERS} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= EQT_MIN_PLAYERS ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                    {seated >= EQT_MIN_PLAYERS ? <Swords size={16} /> : <Lock size={15} />}{seated >= EQT_MIN_PLAYERS ? c.start(seated) : c.needPlayers}
                  </button>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? c.roomFull : c.waitingHost}</p>}
              </div>
            )}

            {round && live && (
              <div className="mx-auto max-w-[520px]">
                <TowerStacks
                  blocks={state.blocks} stacks={state.stacks} c={c} held={acting ? held : null} winStack={win}
                  onPick={acting ? (s, count) => setHeld({ from: s, count, flip: false }) : undefined}
                  onDrop={(to) => { if (held) { dispatch({ t: 'move', move: moveOf(held, to) }); setHeld(null); } }}
                  onFlip={() => setHeld((h) => (h ? { ...h, flip: !h.flip } : h))} onCancel={() => setHeld(null)}
                />

                <div className="mx-auto mt-3 max-w-md space-y-2">
                  {(phase === 'think' || phase === 'outbid') && inGame && myBid === null && maxOffer >= 1 && (
                    <>
                      <p className="text-center text-[11px] font-bold text-white/45">{c.bidPick}</p>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxOffer}, minmax(0, 1fr))` }}>
                        {Array.from({ length: maxOffer }, (_, i) => i + 1).map((n) => <button key={n} type="button" onClick={() => setPick(n)} className={`py-2.5 font-mono text-sm ${seg(offer === n)}`}>{n}</button>)}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => dispatch({ t: 'bid', n: offer })}
                          className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#e5484d] py-3.5 text-base font-black text-white shadow-[0_8px_0_#8d1e22,0_16px_28px_rgba(229,72,77,.35)] transition active:translate-y-[5px] active:shadow-[0_3px_0_#8d1e22]">
                          <BellRing size={18} />{phase === 'think' ? c.buzz(offer) : c.outbid(offer)}
                        </button>
                        {phase === 'outbid' && <button type="button" onClick={() => dispatch({ t: 'pass' })} className={`px-5 ${BTN}`}><X size={14} />{c.pass}</button>}
                      </div>
                      <p className="text-center text-[10px] text-white/35">{c.bidOnce}</p>
                    </>
                  )}
                  {phase === 'outbid' && inGame && myBid !== null && <p className="rounded-md bg-white/5 py-2.5 text-center text-sm font-bold text-white/60">{myBid ? c.youBid(myBid) : c.youPassed} {c.waitingOthers}</p>}
                  {phase === 'act' && !acting && <p className="rounded-md bg-white/5 py-2.5 text-center text-sm font-bold text-white/60">{inGame ? c.watching : c.spectating}</p>}
                  {phase !== 'act' && phase !== 'reveal' && !inGame && <p className="text-center text-xs text-white/45">{c.spectating}</p>}
                  {phase === 'reveal' && <p className="text-center text-xs text-white/50">{round.par > 0 ? `${c.par(round.par)} · ` : ''}{c.nextSoon}</p>}
                </div>
              </div>
            )}

            {phase === 'finished' && (
              <div className="mx-auto max-w-md py-4">
                <Trophy size={34} className="mx-auto text-[#ffcf3f]" />
                <ol className="mt-4 space-y-2">{ranking.map((seat) => {
                  const rank = ranking.findIndex((s) => state.scores[s] === state.scores[seat]) + 1;
                  return (
                    <li key={seat} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${state.scores[seat] === top ? 'border-[#ffcf3f]/50 bg-[#ffcf3f]/10' : 'border-white/10 bg-black/30'}`}>
                      <span className="w-6 text-center font-mono text-sm font-black text-(--accent)">{rank}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-black">{name(seat)}{seat === mySeat ? ` (${c.me})` : ''}</span>
                      <span className="font-mono text-sm font-black">{c.points(state.scores[seat])}</span>
                    </li>
                  );
                })}</ol>
                {me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={14} />{c.rematch}</button> : <p className="mt-4 text-center text-xs text-white/45">{c.rematchWait}</p>}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{c.players}</h2><span className={CHIP}><Users size={12} />{seated}/{EQT_MAX_PLAYERS}</span></div>
              <div className="space-y-2">
                {state.seats.map((seat, i) => {
                  if (!seat && phase !== 'lobby') return null;
                  const bid = live ? state.bids[i] : null;
                  const on = state.actor === i && phase === 'act';
                  return (
                    <div key={i} data-chat-seat={seat?.id} className={`${playerRow(on)} ${seat ? '' : 'opacity-40'}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-black ${on ? 'bg-[#e5484d] text-white' : 'bg-white/10 text-white/60'}`}>{on ? <BellRing size={15} /> : i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-extrabold">{seat ? name(i) : c.emptySeat}{seat?.id === me?.id ? ` (${c.me})` : ''}{i === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}</p>
                        {bid !== null && <p className="mt-0.5 text-[10px] font-bold text-white/50">{bid ? c.bidTag(bid) : c.passTag}{state.first === i ? ` · ${c.firstTag}` : ''}</p>}
                      </div>
                      {phase !== 'lobby' && seat && <span className={`font-mono text-lg font-black ${state.scores[i] < 0 ? 'text-[#ff9b94]' : 'text-(--accent)'}`}>{state.scores[i]}<span className="text-[10px] text-white/30">/{state.goal}</span></span>}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rounded-[14px] border border-(--accent)/25 bg-(--accent)/[.05] p-4">
              <p className={PANEL_TITLE}>{c.rulesTitle}</p>
              <ol className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{c.roomRules.map((line, i) => <li key={line} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
            </section>
          </aside>
        </main>
      )}
    </div>
  );
}
