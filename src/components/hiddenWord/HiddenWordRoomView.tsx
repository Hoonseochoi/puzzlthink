"use client";

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Check, Copy, Crown, Loader2, Lock, RotateCcw, Send, Share2, Swords, Trophy, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import HomeButton from '@/components/ui/HomeButton';
import { useBackClose } from '@/hooks/useBackClose';
import InviteCode from '@/components/ui/InviteCode';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, INPUT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL, PANEL_TITLE, SHELL, STAGE } from '@/components/ui/gameUi';
import { useHiddenWordRoom } from '@/hooks/useHiddenWordRoom';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link, useRouter } from '@/i18n/routing';
import { roomIsBusy } from '@/hooks/useRealtimeRoom';
import { HWP_CHANNEL } from '@/hooks/useHiddenWordParty';
import { HW_ENVELOPES, type HwLevel, hwClean, isHwWord } from '@/lib/hiddenWord';
import { HWR_CFG, type HwrRoom, type HwrTurn, hwrDeal, hwrHintsLeft, hwrLock, hwrReveal, hwrScore, hwrUsed } from '@/lib/hiddenWordRoom';
import { reportGame } from '@/lib/stats';
import { HW_ACCENT, HW_GOLD, HWP_ACCENT, type HwCopy, hwCopy, hwRootStyle } from './copy';
import { EditionMark, Envelope, SecretCard, SimRow, StageTrack, TimerRing, WordCard } from './HiddenWordParts';

type Errors = 'invalid' | 'secret' | 'duplicate' | 'unknown' | 'server' | null;
const PHASE_SECS = { hint: HWR_CFG.hintSecs, guess: HWR_CFG.guessSecs } as const;

/** 히든 워드 with a friend, 1:1: the same four turns as against MORA, in a room. level 'plus': a 확장판 room
 * (its own channel and link, the 확장 words). */
export default function HiddenWordRoomView({ code, level = 'basic' }: { code: string; level?: HwLevel }) {
  const locale = useLocale();
  const t = hwCopy(locale, level);
  const plus = level === 'plus';
  const path = plus ? '/hidden-word-plus' : '/hidden-word';
  const r = t.room;
  const [defaultName] = useState(() => `${r.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useHiddenWordRoom(code, defaultName, level);
  const [now, setNow] = useState(() => Date.now());
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [waitedLong, setWaitedLong] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [starting, setStarting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  useBackClose(rulesOpen, () => setRulesOpen(false));
  const [seenAt, setSeenAt] = useState({ key: '', at: 0 });
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}${path}/room/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale, path]);

  const phase = state?.phase;
  const turn = state?.t ?? null;
  // Clocks run on this browser from when the phase arrived here (the host's clock may differ).
  const phaseKey = state && turn && (phase === 'hint' || phase === 'guess') ? `${state.sid}-${state.round}-${state.turnNo}-${phase}-${turn.stage}` : '';
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks when this phase arrived here
    if (phaseKey && phaseKey !== seenAt.key) setSeenAt({ key: phaseKey, at: Date.now() });
  }, [phaseKey, seenAt.key]);
  const seconds = phaseKey && (phase === 'hint' || phase === 'guess')
    ? Math.max(0, Math.ceil((PHASE_SECS[phase] * 1000 - (now - (seenAt.key === phaseKey ? seenAt.at : now))) / 1000)) : null;

  // Host: out of time below the cut, look up the closest word for the board.
  const revealKey = state && turn && phase === 'reveal' && me?.isHost ? `${state.sid}-${state.round}-${state.turnNo}-${turn.stage}` : '';
  const revealed = useRef('');
  useEffect(() => {
    if (!revealKey || revealed.current === revealKey || !turn) return;
    revealed.current = revealKey;
    void hwrReveal(turn.lock, hwrUsed(turn)).then((rev) => dispatch({ t: 'reveal', rev: rev ?? null }));
  }, [revealKey, turn, dispatch]);

  // Each player records the finished match once.
  useEffect(() => {
    if (!state || state.phase !== 'finished' || (mySeat !== 0 && mySeat !== 1) || !state.history.length) return;
    const mine = state.scores[mySeat], theirs = state.scores[1 - mySeat];
    reportGame(`${plus ? 'hidden_word_plus' : 'hidden_word'}-friend-${state.sid}`, plus ? 'hidden_word_plus' : 'hidden_word', 'friend', mine > theirs ? 'win' : mine < theirs ? 'loss' : 'draw', { mode: 'friend', score: mine, opponent: theirs });
  }, [state, mySeat, plus]);

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: t.title, text: r.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } void copyLink(); };
  const start = async () => {
    if (starting) return;
    setStarting(true);
    const deal = await hwrDeal(state?.level ?? level);
    setStarting(false);
    if (deal && !deal.error && Array.isArray(deal.envelopes)) dispatch({ t: 'start', deal: deal.deal, envelopes: deal.envelopes });
  };

  // A code typed on the 확장판 entry screen comes here; if it is a party room, go there instead.
  const router = useRouter();
  useEffect(() => {
    if (!plus || state || !waitedLong) return;
    let live = true;
    void roomIsBusy(HWP_CHANNEL, code).then((busy) => { if (busy && live) router.replace(`/hidden-word-plus/party/${code}`); });
    return () => { live = false; };
  }, [plus, state, waitedLong, code, router]);

  const notice = status === 'unconfigured' ? r.unconfigured : status === 'error' ? r.connectionError : !state && waitedLong ? r.roomNotFound : state && !me?.isHost && !hostOnline ? r.hostOffline : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? r.guest;
  const seated = state ? state.seats.filter(Boolean).length : 0;
  const playing = mySeat === 0 || mySeat === 1;

  return (
    <div className={SHELL} style={hwRootStyle(level)} data-hw={level}>
      <RoomAlerts alerts={alerts} accent={plus ? HWP_ACCENT : HW_ACCENT} joinText={r.joined} leaveText={r.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref={path} backLabel={t.back} title={plus ? <>{t.title}<EditionMark label={t.edition} /></> : t.title} titleClass="font-black !text-[13px] !tracking-[0.04em] min-[400px]:!text-[15px] sm:!text-xl sm:!tracking-[0.12em]" subtitle={`${r.subtitle} · ${code.toUpperCase()}`}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <span className="hidden sm:contents"><GameUpdates game={plus ? 'hidden_word_plus' : 'hidden_word'} /><BugReport /><LanguageSwitcher compact dark /></span>
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-3 flex max-w-[640px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      <main className="relative z-10 mx-auto w-full max-w-[640px] px-3 pb-10 pt-3 sm:px-4 sm:pt-5">
        {!state ? (
          <div className={`${STAGE} flex min-h-[320px] flex-col items-center justify-center gap-3 text-center`}>
            {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{r.connecting}</p> : <Link href={path} className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{r.backToGame}</Link>}
          </div>
        ) : phase === 'lobby' ? (
          <div className="space-y-4">
            <div className={PANEL}>
              <p className={PANEL_TITLE}>{r.inviteTitle}</p>
              <p className="mt-2 text-sm text-white/55">{r.inviteDesc}</p>
              <InviteCode code={code} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button type="button" onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? r.copied : r.copy}</button>
                <button type="button" onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{r.share}</button>
              </div>
            </div>
            <div className={PANEL}>
              {[0, 1].map((seat) => (
                <p key={seat} className={`flex items-center gap-2 py-1.5 text-sm font-extrabold ${state.seats[seat] ? '' : 'text-white/35'}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 font-mono text-xs">{seat + 1}</span>
                  {state.seats[seat] ? name(seat) : '—'}{state.seats[seat]?.id === me?.id ? ` (${t.you})` : ''}{seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}
                </p>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={r.nickname} className={INPUT} />
              <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{r.rename}</button>
            </form>
            {me?.isHost ? (
              <button type="button" onClick={() => void start()} disabled={seated < 2 || starting} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seated >= 2 ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                {starting ? <Loader2 size={16} className="animate-spin" /> : seated >= 2 ? <Swords size={16} /> : <Lock size={15} />}{starting ? r.starting : seated >= 2 ? r.start : r.needFriend}
              </button>
            ) : <p className="text-center text-sm text-white/50">{mySeat === null ? r.roomFull : r.waitingHost}</p>}
          </div>
        ) : (
          <>
            <Hud state={state} mySeat={mySeat} name={name} t={t} />
            <div className="mt-3">
              {phase === 'envelope' && <EnvelopeStage state={state} mySeat={mySeat} t={t} plus={plus} onPick={(i) => dispatch({ t: 'envelope', i })} />}
              {phase === 'pick' && (state.setter === mySeat
                ? <PickStage hand={state.hands[mySeat]} deal={state.deal} t={t} plus={plus} onPick={(word, lock) => dispatch({ t: 'pick', word, lock })} />
                : <Waiting text={r.pickWait(name(state.setter))} />)}
              {turn && (phase === 'hint' || phase === 'reveal' || phase === 'guess' || phase === 'turnEnd') && (
                <TurnStage key={`${state.sid}-${state.round}-${state.turnNo}`} state={state} turn={turn} mySeat={mySeat} name={name} seconds={seconds} t={t}
                  onHint={(word, s, rev) => dispatch({ t: 'hint', word, s, rev })} onGuess={(words, s) => dispatch({ t: 'guess', words, s })} onNext={() => dispatch({ t: 'next' })} />
              )}
              {phase === 'finished' && <OverStage state={state} mySeat={mySeat} name={name} t={t} isHost={!!me?.isHost} starting={starting} onAgain={() => void start()} />}
              {!playing && phase !== 'finished' && <p className="mt-3 text-center text-xs text-white/45">{r.spectating}</p>}
            </div>
          </>
        )}
      </main>
      {rulesOpen && (
        <div className={MODAL_BACKDROP} onClick={() => setRulesOpen(false)}>
          <div className={MODAL} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setRulesOpen(false)} className={MODAL_CLOSE} aria-label={t.close}><X size={16} /></button>
            <p className={PANEL_TITLE}>{r.rulesTitle}</p>
            <ol className="mt-3 space-y-2.5 text-[13px] leading-6 text-white/70">{r.rules.map((line, i) => <li key={line} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
          </div>
        </div>
      )}
    </div>
  );
}

function Hud({ state, mySeat, name, t }: { state: HwrRoom; mySeat: number | null; name: (s: number) => string; t: HwCopy }) {
  const r = t.room;
  // my seat on the left (seat 0 when watching)
  const left = mySeat === 1 ? 1 : 0, right = 1 - left;
  const turnIndex = state.phase === 'finished' ? 4 : state.phase === 'envelope' ? -1 : (state.round - 1) * 2 + state.turnNo;
  const label = state.phase === 'envelope' ? t.envelopeTitle : state.phase === 'finished' ? t.finalScore
    : state.setter === mySeat ? r.turnSet : mySeat === 0 || mySeat === 1 ? r.turnGuess : r.turnOf(name(state.setter));
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[14px] border border-white/10 bg-[#121217]/85 px-3 py-2.5 backdrop-blur sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-black text-white/60">{name(left)}</p>
        <strong key={state.scores[left]} className="font-mono text-2xl font-black tabular-nums text-(--accent) [animation:hwPop_.4s_ease-out] sm:text-3xl">{state.scores[left]}</strong>
      </div>
      <div className="text-center">
        <p className="font-mono text-[10px] font-black tracking-[0.2em] text-white/50">{t.round(state.round)}{state.round === 2 && <span className="ml-1.5 rounded-sm px-1 py-px tracking-normal" style={{ background: `${HW_GOLD}26`, color: HW_GOLD }}>×2</span>}</p>
        <p className="mt-0.5 text-[11px] font-black text-white/80">{label}</p>
        <div className="mt-1 flex justify-center gap-1" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 w-4 rounded-full ${i < turnIndex ? 'bg-(--accent)' : i === turnIndex ? 'bg-white/70' : 'bg-white/12'}`} />)}</div>
      </div>
      <div className="min-w-0 text-right">
        <p className="truncate text-[11px] font-black text-white/60">{name(right)}</p>
        <strong key={state.scores[right]} className="font-mono text-2xl font-black tabular-nums text-white/85 [animation:hwPop_.4s_ease-out] sm:text-3xl">{state.scores[right]}</strong>
      </div>
    </div>
  );
}

const Waiting = ({ text }: { text: string }) => (
  <section className={`${STAGE} flex min-h-[200px] flex-col items-center justify-center gap-3 text-center`}>
    <Loader2 className="animate-spin text-(--accent)" size={24} /><p className="text-sm font-bold text-white/60">{text}</p>
  </section>
);

function EnvelopeStage({ state, mySeat, t, plus, onPick }: { state: HwrRoom; mySeat: number | null; t: HwCopy; plus: boolean; onPick: (i: number) => void }) {
  const mine = mySeat === 0 || mySeat === 1 ? state.picks[mySeat] : null;
  const theirs = mySeat === 0 || mySeat === 1 ? state.picks[1 - mySeat] : null;
  const canPick = (mySeat === 0 || mySeat === 1) && mine === null;
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <h2 className="text-center text-xl font-black tracking-[-0.03em] sm:text-2xl">{t.envelopeTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{t.room.envelopeDesc}</p>
      <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: HW_ENVELOPES }, (_, i) => (
          <div key={i} className="relative">
            <Envelope n={i + 1} plus={plus} label={t.envelope(i + 1)} state={mine === i ? 'opening' : canPick && theirs !== i && !state.picks.includes(i) ? 'idle' : 'dim'} onPick={() => onPick(i)} />
            {mine === i && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-(--accent) px-2 py-0.5 text-[10px] font-black text-(--accent-ink)">{t.room.envelopeMine}</span>}
          </div>
        ))}
      </div>
      {mine !== null && <p className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-white/55"><Loader2 size={14} className="animate-spin" />{t.room.envelopeWait}</p>}
    </section>
  );
}

function PickStage({ hand, deal, t, plus, onPick }: { hand: string[]; deal: string; t: HwCopy; plus: boolean; onPick: (word: string, lock: string) => void }) {
  const [word, setWord] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const confirm = async () => {
    if (!word || busy) return;
    setBusy(true); setFailed(false);
    const lock = await hwrLock(deal, word);
    setBusy(false);
    if (lock) onPick(word, lock); else setFailed(true);
  };
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <h2 className="text-center text-xl font-black tracking-[-0.03em] sm:text-2xl">{t.pickTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{t.room.pickDesc}</p>
      <div className="mt-5 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3 sm:gap-3">
        {hand.map((card, i) => <WordCard key={card} word={card} index={i} plus={plus} selected={word === card} onClick={() => setWord(card)} />)}
      </div>
      <button type="button" disabled={!word || busy} onClick={() => void confirm()} className={`${BTN_ACCENT} mt-5 w-full !py-3.5 !text-sm`}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}{word ? t.pickConfirm(word) : t.pickTitle}
      </button>
      {failed && <p className="mt-2 text-center text-xs font-bold text-[#ff8a9a]">{t.room.errorServer}</p>}
    </section>
  );
}

function TurnStage({ state, turn, mySeat, name, seconds, t, onHint, onGuess, onNext }: {
  state: HwrRoom; turn: HwrTurn; mySeat: number | null; name: (s: number) => string; seconds: number | null; t: HwCopy;
  onHint: (word: string, s: number, rev: { w: string; s: number } | null) => void; onGuess: (words: string[], s: number[]) => void; onNext: () => void;
}) {
  const r = t.room;
  const phase = state.phase;
  const setter = turn.setter, guesser = 1 - turn.setter;
  const iSet = mySeat === setter, iGuess = mySeat === guesser;
  const ended = phase === 'turnEnd';
  const results = Array.from({ length: HWR_CFG.stages }, (_, i) => {
    const g = turn.guesses.find((x) => x.stage === i + 1);
    if (!g) return null;
    // good / bad from where I sit (watching: from the setter's side)
    return g.ok === (iGuess) ? 'good' as const : 'bad' as const;
  });
  const points = (iGuess ? HWR_CFG.guessPoints : HWR_CFG.setPoints).map((p) => p * state.round);
  const stages = Array.from({ length: HWR_CFG.stages }, (_, i) => i + 1).filter((st) => st <= turn.stage);
  const end = useRef<HTMLDivElement>(null);
  const entries = turn.hints.length + turn.guesses.length;
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [entries, ended]);

  return (
    <section className={`${STAGE} !p-3 sm:!p-5`}>
      <div className="flex items-stretch gap-2">
        <SecretCard label={iSet ? t.myWord : r.secretOf(name(setter))} word={iSet || ended || mySeat === null ? turn.word : undefined} sealedLabel={t.sealed} />
        <StageTrack labels={Array.from({ length: HWR_CFG.stages }, (_, i) => t.stage(i + 1))} points={points} current={ended ? 0 : turn.stage} results={results} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className={PANEL_TITLE}>{t.board}</p>
        {seconds !== null && !ended && (phase === 'hint' || phase === 'guess') && <TimerRing seconds={seconds} total={phase === 'hint' ? HWR_CFG.hintSecs : HWR_CFG.guessSecs} label={t.timeLeft} />}
      </div>
      <ul className="mt-2 space-y-1.5" aria-live="polite">
        {entries === 0 && <li className="rounded-[12px] border border-dashed border-white/10 px-3 py-6 text-center text-[13px] text-white/40">{t.boardEmpty}</li>}
        {stages.map((st) => {
          const hints = turn.hints.filter((h) => h.stage === st);
          const guess = turn.guesses.find((g) => g.stage === st);
          if (!hints.length && !guess) return null;
          return (
            <li key={st} className="list-none">
              <p className="flex items-center gap-2 pb-1.5 pt-1.5 text-[10px] font-black tracking-[0.12em] text-white/35" aria-hidden><span className="h-px flex-1 bg-white/10" />{t.stage(st)}<span className="h-px flex-1 bg-white/10" /></p>
              <ul className="space-y-1.5">
                {hints.map((h) => <SimRow key={h.w} word={h.w} score={h.s} cut={HWR_CFG.cut} tag={h.by === 'reveal' ? t.revealed : h.s >= HWR_CFG.cut ? t.cutPassed : undefined} />)}
                {guess && <>
                  {guess.w.length === 0 && <li className="rounded-[12px] border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[13px] font-bold text-white/45">{r.answerOf(name(guesser))} · {t.pass}</li>}
                  {guess.w.map((w, i) => <SimRow key={w} word={w} score={guess.s[i] ?? 0} cut={HWR_CFG.cut} tag={r.answerOf(name(guesser))} tone={guess.ok && w === turn.word ? (iSet ? 'caught' : 'right') : 'wrong'} />)}
                  <li className={`flex justify-end text-[12px] font-black ${guess.ok === iGuess ? 'text-(--accent)' : 'text-[#ff8a9a]'}`}>
                    {guess.ok ? r.gotIt(name(guesser), HWR_CFG.guessPoints[st - 1] * state.round) : r.defended(name(setter), HWR_CFG.setPoints[st - 1] * state.round)}
                  </li>
                </>}
              </ul>
            </li>
          );
        })}
      </ul>
      <div ref={end} />

      {ended ? <TurnEnd state={state} turn={turn} name={name} t={t} canNext={mySeat === 0 || mySeat === 1} onNext={onNext} />
        : phase === 'reveal' ? <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white/55"><Loader2 size={14} className="animate-spin" />{r.revealing}</p>
        : phase === 'hint' ? (iSet ? <HintDock key={turn.stage} turn={turn} t={t} onSend={onHint} /> : <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white/55"><Loader2 size={14} className="animate-spin" />{r.hintWait(name(setter))}</p>)
        : phase === 'guess' ? (iGuess ? <GuessDock key={turn.stage} turn={turn} t={t} onSend={onGuess} /> : <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white/55"><Loader2 size={14} className="animate-spin" />{r.guessWait(name(guesser))}</p>)
        : null}
    </section>
  );
}

function errorText(t: HwCopy, e: Errors) {
  return e === 'server' ? t.room.errorServer : e ? t.errors[e] : null;
}

function HintDock({ turn, t, onSend }: { turn: HwrTurn; t: HwCopy; onSend: (word: string, s: number, rev: { w: string; s: number } | null) => void }) {
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Errors>(null);
  const left = hwrHintsLeft(turn);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = hwClean(word);
    if (busy || !clean) return;
    if (!isHwWord(clean)) { setError('invalid'); return; }
    if (clean === turn.word) { setError('secret'); return; }
    if (hwrUsed(turn).includes(clean)) { setError('duplicate'); return; }
    setBusy(true); setError(null);
    const scores = await hwrScore(turn.lock, [clean], 'hint');
    if (!scores) { setBusy(false); setError('server'); return; }
    const s = scores[0];
    if (s === null || s === undefined) { setBusy(false); setError('unknown'); return; }
    // the last hint below the cut brings the closest word with it
    const rev = left === 1 && s < HWR_CFG.cut ? await hwrReveal(turn.lock, [...hwrUsed(turn), clean]) : null;
    setBusy(false);
    onSend(clean, s, rev ?? null);
    setWord('');
  }
  const message = errorText(t, error);
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 shadow-[0_-8px_30px_rgba(0,0,0,.5)] backdrop-blur sm:p-3">
      <div className="flex items-center gap-1 px-0.5 pb-2" aria-label={t.hintsLeft(left)}>{Array.from({ length: left }, (_, i) => <span key={i} className="h-1.5 w-5 rounded-full bg-(--accent)" />)}<span className="ml-1.5 text-[11px] font-bold text-white/50">{t.hintsLeft(left)}</span></div>
      <div className="flex gap-2">
        <input className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"
          placeholder={t.hintPlaceholder} aria-label={t.hintPlaceholder} onChange={(event) => { setWord(event.target.value); setError(null); }} />
        <button type="submit" disabled={busy || !word.trim()} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}<span className="hidden min-[380px]:inline">{t.hintSend}</span></button>
      </div>
      <p className={`mt-2 break-keep px-0.5 text-[11.5px] leading-5 ${message ? 'font-bold text-[#ff8a9a]' : 'text-white/45'}`}>{message ?? (left === 1 ? t.hintLast : t.room.hintHelp(HWR_CFG.cut))}</p>
    </form>
  );
}

function GuessDock({ turn, t, onSend }: { turn: HwrTurn; t: HwCopy; onSend: (words: string[], s: number[]) => void }) {
  const [word, setWord] = useState('');
  const [second, setSecond] = useState('');
  const [two, setTwo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Errors>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const words = [word, two ? second : ''].map(hwClean).filter(Boolean);
    if (busy || !words.length) return;
    if (!words.every(isHwWord)) { setError('invalid'); return; }
    if (new Set(words).size !== words.length || words.some((w) => hwrUsed(turn).includes(w))) { setError('duplicate'); return; }
    setBusy(true); setError(null);
    const scores = await hwrScore(turn.lock, words, 'answer');
    setBusy(false);
    if (!scores) { setError('server'); return; }
    if (scores.some((s) => s === null || s === undefined)) { setError('unknown'); return; }
    onSend(words, scores as number[]);
  }
  const change = (set: (v: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => { set(event.target.value); setError(null); };
  const message = errorText(t, error);
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 shadow-[0_-8px_30px_rgba(0,0,0,.5)] backdrop-blur sm:p-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"
            placeholder={t.guessPlaceholder} aria-label={t.guessPlaceholder} onChange={change(setWord)} />
          <button type="submit" disabled={busy || !word.trim() || (two && !second.trim())} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}<span className="hidden min-[380px]:inline">{t.guessSend}</span></button>
        </div>
        {two && <input className={`${INPUT} w-full !py-3 !text-base font-bold`} lang="ko" value={second} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false}
          placeholder={t.secondPlaceholder} aria-label={t.secondPlaceholder} onChange={change(setSecond)} />}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 px-0.5">
        <p className={`break-keep text-[11.5px] leading-5 ${message ? 'font-bold text-[#ff8a9a]' : 'text-white/45'}`}>{message ?? (two ? t.room.chanceHelp : t.guessHelp)}</p>
        <button type="button" disabled={!turn.chance} onClick={() => setTwo((on) => !on)} aria-pressed={two}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-black transition ${!turn.chance ? 'border-white/10 text-white/25' : two ? 'border-[#ffc857] bg-[#ffc857]/20 text-[#ffc857]' : 'border-[#ffc857]/50 text-[#ffc857] hover:bg-[#ffc857]/10'}`}>
          {!turn.chance ? t.room.chanceUsed : two ? t.room.chanceOn : t.room.chance}
        </button>
      </div>
    </form>
  );
}

function TurnEnd({ state, turn, name, t, canNext, onNext }: { state: HwrRoom; turn: HwrTurn; name: (s: number) => string; t: HwCopy; canNext: boolean; onNext: () => void }) {
  const r = t.room;
  const solved = turn.solved ?? 0;
  const last = state.round === 2 && state.turnNo === 1;
  return (
    <div className={`mt-4 rounded-[14px] border p-4 text-center [animation:hwPop_.45s_ease-out_both] ${solved ? 'border-(--accent)/45 bg-(--accent)/[0.08]' : 'border-[#ffc857]/40 bg-[#ffc857]/[0.06]'}`}>
      <p className="text-xs font-bold text-white/50">{t.theWord} · <strong lang="ko" className="text-white">{turn.word}</strong></p>
      <p className={`mt-1 text-lg font-black tracking-[-0.02em] sm:text-xl ${solved ? 'text-(--accent)' : 'text-[#ffc857]'}`}>{solved ? r.endSolved(name(1 - turn.setter), solved) : r.endHeld(name(turn.setter))}</p>
      <div className="mt-2 flex items-center justify-center gap-4 font-mono text-sm font-black">
        <span className="text-white/80">{t.gained(name(0), turn.gained[0])}</span><span className="text-white/25">·</span><span className="text-white/80">{t.gained(name(1), turn.gained[1])}</span>
      </div>
      {canNext && <button type="button" onClick={onNext} className={`${BTN_ACCENT} mt-4 w-full !py-3.5 !text-sm`}><ArrowRight size={15} />{last ? t.toResult : t.next}</button>}
    </div>
  );
}

function OverStage({ state, mySeat, name, t, isHost, starting, onAgain }: { state: HwrRoom; mySeat: number | null; name: (s: number) => string; t: HwCopy; isHost: boolean; starting: boolean; onAgain: () => void }) {
  const r = t.room;
  const [a, b] = state.scores;
  const winner = a === b ? null : a > b ? 0 : 1;
  return (
    <section className={`${STAGE} !p-5 text-center sm:!p-7`}>
      <Trophy size={34} className="mx-auto text-[#ffcf3f]" />
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">{winner === null ? r.draw : r.win(name(winner))}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[0, 1].map((seat) => (
          <div key={seat} className={`rounded-[12px] border p-3 ${winner === seat ? 'border-[#ffcf3f]/50 bg-[#ffcf3f]/10' : 'border-white/10 bg-black/30'}`}>
            <p className="truncate text-xs font-black text-white/60">{name(seat)}{seat === mySeat ? ` (${t.you})` : ''}</p>
            <p className="mt-1 font-mono text-3xl font-black">{state.scores[seat]}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-1.5 text-left">
        {state.history.map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-3 py-2 text-[12px]">
            <span className="text-white/55">R{h.round} · {r.turnOf(name(h.setter))}</span>
            <strong lang="ko" className="text-white/85">{h.word}</strong>
            <span className="font-mono text-white/60">{h.solved ? t.histSolved(h.solved) : t.histHeld}</span>
          </li>
        ))}
      </ul>
      {!isHost && <p className="mt-5 text-xs text-white/45">{r.rematchWait}</p>}
      <div className={`grid gap-2 ${isHost ? 'mt-5 grid-cols-[1fr_2fr]' : 'mt-3'}`}>
        <HomeButton block className="!rounded-md !text-sm" />
        {isHost && <button type="button" disabled={starting} onClick={onAgain} className={`${BTN_ACCENT} w-full !py-3.5 !text-sm`}>{starting ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}{r.rematch}</button>}
      </div>
    </section>
  );
}
