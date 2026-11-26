"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Clock3, Copy, Crown, Eye, Flag, Loader2, Lock, RotateCcw, Share2, Swords, Users, WifiOff } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import InviteCode from '@/components/ui/InviteCode';
import { BTN, BTN_ACCENT, CHIP, HEADING, INPUT, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg, timer } from '@/components/ui/gameUi';
import { useBlackWhite2Room } from '@/hooks/useBlackWhite2Room';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { reportGame } from '@/lib/stats';
import { type BW2Side, bw2NextLeader, bw2Other, bw2RoundsLeft, bw2ScoresOf, bw2StageRounds } from '@/lib/blackWhite2';
import { BW2_FLASH_MS, BW2_TURN_OPTIONS, type Bw2FirstChoice, seatToBid } from '@/lib/blackWhite2Room';
import { BW2Card, BW2GaugePanel, type BW2LeadView, BW2Replay, BW2RoundLog, BW2Scoreboard, BW2Table, BidControl } from './BW2Parts';

const ACCENT = '#ef3340';

export default function BlackWhite2RoomView({ code }: { code: string }) {
  const t = useTranslations('BlackWhite2Online');
  const tb = useTranslations('BlackWhite2');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [defaultName] = useState(() => `${t('guest')} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useBlackWhite2Room(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [waitedLong, setWaitedLong] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [bidValue, setBidValue] = useState(10);
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs the browser origin
    setShareUrl(`${window.location.origin}/${locale}/black-white-2/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null) return;
    const score = bw2ScoresOf(state.rounds);
    reportGame(`black_white_2-friend-${state.sid}-${state.rounds.length}-${state.reason}`, 'black_white_2', 'friend', state.winner === 'draw' ? 'draw' : state.winner === mySeat ? 'win' : 'loss', {
      reason: state.reason, rounds: state.rounds.length, score: score[mySeat], against: score[1 - mySeat], turnSec: state.turnSec, overtime: bw2StageRounds(state.rounds, 'overtime').length > 0,
    });
  }, [state, mySeat]);

  const seatName = (seat: number) => state?.seats[seat]?.name ?? t('emptySeat');
  const full = !!state && state.seats.every(Boolean);
  const online = new Set(peers.map((peer) => peer.id));
  const view: BW2Side = mySeat ?? 0;
  const opponent = bw2Other(view);
  const names: [string, string] = [seatName(0), seatName(1)];
  if (mySeat !== null) names[mySeat] = `${seatName(mySeat)} (${t('me')})`;
  const playing = state?.phase === 'playing';
  const finished = state?.phase === 'finished';
  const rounds = state?.rounds ?? [];
  const lead = state?.lead ?? null;
  const flashing = !!state && rounds.length > 0 && now - state.resolvedAt < BW2_FLASH_MS;
  const flash = flashing ? rounds.at(-1)! : null;
  const toPlay = state ? seatToBid(state) : 0;
  const myTurn = !!playing && mySeat !== null && toPlay === mySeat && !flashing;
  const leader = state ? bw2NextLeader(rounds, state.first) : 0;
  const seconds = state ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : 0;
  const myBank = state && mySeat !== null ? Math.max(0, state.bank[mySeat]) : 0;
  const leadView: BW2LeadView = lead ? { side: lead.side, bid: lead.side === view && lead.bid >= 0 ? lead.bid : null, color: lead.color, gaugeAfter: lead.gaugeAfter } : null;

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be blocked. */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK 흑과 백 II', text: t('shareText'), url: shareUrl }); return; } catch { /* Cancelled. */ } } copyLink(); };
  const submit = () => { if (!myTurn) return; dispatch({ t: 'bid', points: Math.min(myBank, bidValue) }); setBidValue(Math.min(10, myBank)); };

  const notice = status === 'unconfigured' ? t('unconfigured') : status === 'error' ? t('connectionError') : !state && waitedLong ? t('roomNotFound') : state && !me?.isHost && !hostOnline ? t('hostOffline') : null;
  const resultText = () => {
    if (!state) return '';
    if (state.winner === 'draw') return tb('finishedDraw');
    const reason = state.reason === 'resign' ? t('byResign') : state.reason === 'timeout' ? t('byTimeout') : '';
    const winner = state.winner as BW2Side;
    return mySeat === null ? t('winnerIs', { player: seatName(winner), reason }) : winner === mySeat ? t('youWin', { reason }) : t('youLose', { reason });
  };
  const heading = !state ? '' : state.phase === 'lobby' ? t('lobbyTitle') : finished ? resultText()
    : flash ? (flash.winner === null ? tb('roundDrawLong') : flash.winner === view ? tb('roundWinLong') : tb('roundLossLong'))
      : myTurn ? (lead ? tb('followYou', { color: tb(`color.${lead.color}`) }) : tb('leadYou'))
        : mySeat === null ? t('waitingFor', { player: seatName(toPlay) }) : lead?.side === view ? t('friendAnswering', { player: seatName(opponent) }) : t('friendLeading', { player: seatName(opponent) });

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#ffffff'), backgroundImage: fog('150, 18, 30') }}>
      <RoomAlerts alerts={alerts} accent={ACCENT} joinText={(name) => t('joined', { name })} leaveText={(name) => t('left', { name })} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/black-white-2" backLabel={tc('blackWhite2')} title={tb('title')} titleClass="font-black" subtitle={`ONLINE · 1:1 · ${code.toUpperCase()}`}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-4 flex max-w-[1180px] items-center gap-2 px-4 text-xs text-[#ffc2b5] lg:px-6"><WifiOff size={14} />{notice}</div>}
      {!state ? (
        <main className="relative z-10 flex min-h-[60vh] items-center justify-center px-4">{!notice && <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t('connecting')}</p>}{notice && <Link href="/black-white-2" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t('back')}</Link>}</main>
      ) : (
        <main className={MAIN}>
          <section className={STAGE}>
            <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2"><div className="min-w-0"><p className={KICKER}>{state.phase === 'lobby' ? 'LOBBY' : finished ? tb('resultKicker') : state.stage === 'overtime' ? tb('overtimeKicker') : `ROUND ${bw2StageRounds(rounds, 'main').length + 1}`}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>{playing && !flashing && <div className={timer(seconds <= 8 && myTurn)}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}</div>
            {state.phase === 'lobby' ? (
              <div className="mx-auto max-w-[480px] space-y-5 py-2">
                <div className="flex justify-center gap-3 py-2"><BW2Card color="black" points={9} size="md" /><BW2Card color="white" size="md" /><BW2Card color="black" size="md" /><BW2Card color="white" points={27} size="md" /></div>
                <div className="rounded-[12px] border border-[#ef3340]/30 bg-black/50 p-5"><p className={PANEL_TITLE}>{t('inviteTitle')}</p><p className="mt-2 text-sm text-white/60">{t('inviteDesc')}</p><InviteCode code={code} /><div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2"><span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span><button onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t('copied') : t('copy')}</button><button onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t('share')}</button></div></div>
                <div className={PANEL}><p className={PANEL_TITLE}>{t('turnTime')}</p><div className="mt-3 grid grid-cols-3 gap-2">{BW2_TURN_OPTIONS.map((sec) => <button key={sec} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', turnSec: sec })} className={`py-2.5 ${seg(state.turnSec === sec)} disabled:cursor-default`}>{t('seconds', { n: sec })}</button>)}</div></div>
                <div className={PANEL}><p className={PANEL_TITLE}>{tb('firstPlayer')}</p><div className="mt-3 grid grid-cols-3 gap-2">{(['host', 'random', 'guest'] as Bw2FirstChoice[]).map((choice) => <button key={choice} disabled={!me?.isHost} onClick={() => dispatch({ t: 'config', firstChoice: choice })} className={`py-2.5 ${seg(state.firstChoice === choice)} disabled:cursor-default`}>{t(`firstChoice.${choice}`)}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-white/40">{t('firstHint')}</p></div>
                <form onSubmit={(event) => { event.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t('nickname')} className={INPUT} /><button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t('rename')}</button></form>
                {me?.isHost ? <div className="space-y-2"><button onClick={() => dispatch({ t: 'start' })} disabled={!full} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold transition ${full ? 'bg-[#ef3340] text-white hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 bg-white/[0.04] text-white/40'}`}>{full ? <Swords size={16} /> : <Lock size={15} />}{full ? t('start') : t('startLocked')}</button><p className={`text-center text-[11px] ${full ? 'font-bold text-[#ff8f97]' : 'text-white/40'}`}>{full ? t('startReady') : t('startLockedHint')}</p></div> : <p className="text-center text-sm text-white/50">{mySeat === null ? t('roomFull') : t('waitingHost')}</p>}
              </div>
            ) : finished ? (
              <BW2Replay key={state.sid} rounds={rounds} me={view} names={names} override={state.reason === 'score' ? null : resultText()}>{me?.isHost ? <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t('rematch')}</button> : <p className="text-center text-[11px] text-white/40">{t('rematchWait')}</p>}</BW2Replay>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <BW2Scoreboard rounds={rounds} me={view} names={names} leader={leader} stage={state.stage} bank={state.bank} gauges={state.gauges} finished={false} />
                {state.stage === 'overtime' && <div className="rounded-[12px] border border-[#ef3340]/30 bg-[#ef3340]/10 px-4 py-3 text-xs font-bold text-[#ffb0b5]">{tb('overtimeNotice')}</div>}
                <BW2Table me={view} leader={leader} names={names} lead={leadView} result={flash} waiting={!myTurn && !flash ? t('waitingShort', { player: seatName(toPlay) }) : null} />
                {mySeat !== null ? <BidControl bank={myBank} roundsLeft={bw2RoundsLeft(rounds, state.stage)} value={Math.min(bidValue, myBank)} onChange={setBidValue} onSubmit={submit} disabled={!myTurn} /> : <p className="flex items-center justify-center gap-2 py-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
              </div>
            )}
          </section>
          <aside className="flex flex-col gap-4">
            <section className={PANEL}><div className="mb-3 flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('players')}</h2><span className={CHIP}><Users size={12} />{state.seats.filter(Boolean).length}/2</span></div><div className="space-y-2">{([0, 1] as BW2Side[]).map((seat) => { const occupant = state.seats[seat]; return <div key={seat} data-chat-seat={occupant?.id} className={`${playerRow(!!playing && toPlay === seat)} ${occupant ? '' : 'opacity-50'}`}><BW2Card color={seat === 0 ? 'black' : 'white'} size="sm" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-extrabold">{seatName(seat)}{occupant?.id === me?.id ? ` (${t('me')})` : ''}</p>{seat === 0 && <Crown size={12} className="shrink-0 text-[#f2c14e]" />}{occupant && <span className={`h-1.5 w-1.5 rounded-full ${online.has(occupant.id) ? 'bg-[#3ddc97]' : 'bg-white/25'}`} />}</div><p className="text-[11px] text-white/45">{state.phase === 'lobby' ? occupant ? t('ready') : t('waiting') : t('scoreLine', { n: bw2ScoresOf(rounds)[seat] })}</p></div></div>; })}</div></section>
            {playing && mySeat !== null && <BW2GaugePanel names={names} me={view} bank={state.bank} gauges={state.gauges} />}
            {playing && mySeat !== null && <BW2RoundLog rounds={rounds} me={view} />}
            <section className={NOTE}><h2 className={PANEL_TITLE}>{tb('quickRules')}</h2><ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{(t.raw('quick') as string[]).map((rule, index) => <li key={rule} className="flex gap-3"><span className="font-mono text-[#ef3340]">0{index + 1}</span><span className="break-keep">{rule}</span></li>)}</ol></section>
            {playing && mySeat !== null && <button onClick={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>}
          </aside>
        </main>
      )}
    </div>
  );
}
