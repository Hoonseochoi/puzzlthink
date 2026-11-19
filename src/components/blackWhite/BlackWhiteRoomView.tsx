"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, Flag, Loader2, Lock, RotateCcw, Send, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { reportGame } from '@/lib/stats';
import { type Side, colorOf, nextLeader, other, scoresOf } from '@/lib/blackWhite';
import { BW_FLASH_MS, BW_TURN_OPTIONS, seatToPlay } from '@/lib/blackWhiteRoom';
import { BWTile, Hand, MemoPad, OpponentTrack, Replay, RoundLog, Scoreboard, Table } from './BWParts';

const ACCENT = '#e9c46a';

export default function BlackWhiteRoomView({ code }: { code: string }) {
  const t = useTranslations('BlackWhiteOnline');
  const tb = useTranslations('BlackWhite');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useBlackWhiteRoom(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/black-white/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  // Record a finished game once for each player (reportGame ignores a key it has already sent).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const s = scoresOf(state.rounds);
    reportGame(`black_white-friend-${state.sid}-${state.rounds.length}-${state.reason}`, 'black_white', 'friend',
      state.winner === 'draw' ? 'draw' : state.winner === mySeat ? 'win' : 'loss',
      { reason: state.reason, rounds: state.rounds.length, score: s[mySeat], against: s[1 - mySeat], turnSec: state.turnSec });
  }, [state, mySeat]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const me2: Side = mySeat ?? 0; // spectators watch from seat 0's side
  const opp = other(me2);
  const names: [string, string] = [mySeat === null ? seatName(0) : `${seatName(me2)} (${t('me')})`, seatName(opp)];
  const playing = state?.phase === 'playing';
  const finished = state?.phase === 'finished';
  const rounds = state?.rounds ?? [];
  const lead = state?.lead ?? null;
  const flashing = !!state && rounds.length > 0 && now - state.resolvedAt < BW_FLASH_MS;
  const flash = flashing ? rounds.at(-1)! : null;
  const toPlay = state ? seatToPlay(state) : 0;
  const myTurn = !!playing && mySeat !== null && toPlay === mySeat && !flashing;
  const leader = state ? nextLeader(rounds, state.first) : 0;
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const myLaid = lead && lead.side === me2 && lead.tile >= 0 ? lead.tile : null;
  const theirColor = lead && lead.side === opp ? lead.color : null;
  const pick = myTurn && selected !== null && !(myLaid === selected) ? selected : null;

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 흑과 백', text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } }
    copyLink();
  };
  const submit = () => { if (pick === null) return; dispatch({ t: 'play', tile: pick }); setSelected(null); };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError')
    : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;

  const resultText = () => {
    if (!state) return '';
    if (state.winner === 'draw') return tb('finishedDraw');
    const reason = state.reason === 'resign' ? t('byResign') : state.reason === 'timeout' ? t('byTimeout') : '';
    const w = state.winner as Side;
    return mySeat === null ? t('winnerIs', { player: seatName(w), reason }) : w === mySeat ? t('youWin', { reason }) : t('youLose', { reason });
  };
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : finished ? resultText()
    : flash ? (flash.winner === null ? tb('roundDraw') : flash.winner === me2 ? tb('roundWinLong') : tb('roundLossLong'))
      : myTurn ? (lead ? tb('followYou', { color: tb(`color.${lead.color}`) }) : tb('leadYou'))
        : mySeat === null ? t('waitingFor', { player: seatName(toPlay) })
          : lead?.side === me2 ? t('friendAnswering', { player: seatName(opp) }) : t('friendLeading', { player: seatName(opp) });

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('180, 180, 190') }}>
      <RoomAlerts alerts={alerts} accent={ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      
      <GameHeader backHref="/black-white" backLabel={tc('blackWhite')} title={tb('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>

      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}

      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">
          {!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}
          {notice && <Link href="/black-white" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}
        </main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
              <div className="min-w-0">
                <p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : finished ? tb('resultKicker') : `ROUND ${rounds.length + 1}`}</p>
                <h1 className={`mt-1 ${HEADING}`}>{heading}</h1>
              </div>
              {playing && !flashing && <div className={timer(seconds <= 8 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}
            </div>

            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[460px] space-y-5 py-2">
                <div className="flex justify-center gap-2 py-2">
                  {[8, 3, 0, 5].map((n) => <BWTile key={n} color={colorOf(n)} n={n % 3 === 0 ? null : n} size="md" />)}
                </div>
                <div className="rounded-[12px] border border-(--accent)/30 bg-black/50 p-5">
                  <p className={PANEL_TITLE}>{t('inviteTitle')}</p>
                  <p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p>
                  <InviteCode code={code} />
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                    <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                    <button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button>
                    <button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t('share')}</button>
                  </div>
                </div>
                <div className={PANEL}>
                  <p className={PANEL_TITLE}>{t('turnTime')}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[...BW_TURN_OPTIONS].sort((a, b) => a - b).map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}
                  </div>
                  {!me?.isHost && <p className="mt-2 text-[11px] text-white/40">{t('hostSetsTime')}</p>}
                </div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} />
                  <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button>
                </form>
                {me?.isHost ? (
                  <div className="space-y-2">
                    <button onClick={() => dispatch({ t: 'start' })} disabled={!full} style={{ ['--ready-glow' as string]: 'rgba(233,196,106,.6)' }} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'animate-[readyGlow_1.6s_ease-in-out_infinite] bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>
                      {full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}
                    </button>
                    <p className={`text-center text-[11px] ${full ? 'font-bold text-(--accent)' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p>
                  </div>
                ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : finished ? (
              <Replay key={state.sid} rounds={rounds} me={me2} names={names} override={state.reason === 'score' ? null : resultText()}>
                {me?.isHost
                  ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t('rematch')}</button>
                  : <p className="text-center text-[11px] text-white/40">{t('rematchWait')}</p>}
              </Replay>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Scoreboard rounds={rounds} me={me2} names={names} leader={leader} finished={false} />
                <OpponentTrack rounds={rounds} me={me2} laid={theirColor} name={seatName(opp)} />
                <Table me={me2} leader={leader} names={names} result={flash} myTile={myLaid} theirColor={theirColor}
                  waiting={!myTurn && !flash ? t('waitingShort', { player: seatName(toPlay) }) : null} />
                {mySeat !== null ? (
                  <div className="rounded-[14px] border border-white/10 bg-black/30 p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className={PANEL_TITLE}>{tb('myTiles')}</p>
                      <p className="text-[10px] font-bold text-white/40">{tb('evenOdd')}</p>
                    </div>
                    <Hand rounds={rounds} me={me2} laid={myLaid} selected={pick} onSelect={setSelected} disabled={!myTurn} />
                    <button type="button" onClick={submit} disabled={pick === null} className={`${BTN_ACCENT} mt-3 w-full py-3 text-sm`}>
                      <Send size={15} />{pick !== null ? tb('playTile', { n: pick }) : tb('pickTile')}
                    </button>
                  </div>
                ) : <p className="flex items-center justify-center gap-2 py-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className={PANEL}>
              <div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div>
              <div className="space-y-2">
                {[0, 1].map((seat) => {
                  const occupant = state.seats[seat];
                  return (
                    <div key={seat} data-chat-seat={occupant?.id} className={`${playerRow(!!playing && toPlay === seat)} ${occupant ? '' : 'opacity-50'}`}>
                      <BWTile color={seat === 0 ? 'black' : 'white'} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-extrabold">{seatName(seat)}{occupant?.id === me?.id ? ` (${t('me')})` : ''}</p>
                          {seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" aria-label={t('host')} />}
                          {occupant && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}
                        </div>
                        <p className="text-[11px] text-white/45">{state.phase === 'lobby' ? (occupant ? t('ready') : t('waiting')) : t('scoreLine', { n: scoresOf(rounds)[seat] })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {state.phase !== 'lobby' && <p className="mt-3 text-[11px] text-white/40">{t('turnTimeInfo', { n: state.turnSec })}</p>}
            </section>

            {playing && mySeat !== null && <MemoPad resetKey={state.sid} />}
            {playing && mySeat !== null && <RoundLog rounds={rounds} me={me2} />}
            {finished && me?.isHost && (
              <div className={PANEL}>
                <p className={PANEL_TITLE}>{t('turnTime')}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[...BW_TURN_OPTIONS].sort((a, b) => a - b).map((sec) => <button key={sec} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)}`}>{t('seconds', { n: sec })}</button>)}
                </div>
              </div>
            )}

            <section className={NOTE}>
              <h2 className={PANEL_TITLE}>{tb('quickRules')}</h2>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{(t.raw('quick') as string[]).map((rule, i) => <li key={rule} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{rule}</span></li>)}</ol>
            </section>
            {playing && mySeat !== null && (
              <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>
            )}
          </aside>
        </main>
      )}
    </div>
  );
}
