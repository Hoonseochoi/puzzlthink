"use client";

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Check, Copy, Crown, KeyRound, Loader2, Lock, RotateCcw, Send, Share2, Swords, Trophy, Users, WifiOff, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RoomAlerts from '@/components/RoomAlerts';
import GameHeader from '@/components/ui/GameHeader';
import InviteCode from '@/components/ui/InviteCode';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, INPUT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL, PANEL_TITLE, SHELL, STAGE } from '@/components/ui/gameUi';
import { useHiddenWordParty } from '@/hooks/useHiddenWordParty';
import { usePresenceAlerts } from '@/hooks/usePresenceAlerts';
import { Link } from '@/i18n/routing';
import { hwClean, isHwWord } from '@/lib/hiddenWord';
import { hwrReveal, hwrScore } from '@/lib/hiddenWordRoom';
import { HWP_CFG, type HwpRoom, type HwpTurn, hwpAnswered, hwpClaim, hwpDeal, hwpGuessers, hwpHintsThisStage, hwpLock, hwpMine, hwpSaveMine, hwpUsed } from '@/lib/hiddenWordParty';
import { reportGame } from '@/lib/stats';
import { HWP_ACCENT, HWP_GOLD, type HwCopy, hwCopy, hwRootStyle } from './copy';
import { EditionMark, Envelope, SimRow, WordCard } from './HiddenWordParts';

type Party = HwCopy['party'];

/** 히든 워드 확장판 party room: 2–5 friends, one setter at a time, everyone else answers (rules: src/lib/hiddenWordParty.ts). */
export default function HiddenWordPartyView({ code }: { code: string }) {
  const locale = useLocale();
  const t = hwCopy(locale, 'plus');
  const p = t.party;
  const [defaultName] = useState(() => `${t.room.guest} ${Math.floor(1000 + Math.random() * 9000)}`);
  const { status, state, peers, hostOnline, me, mySeat, dispatch, rename } = useHiddenWordParty(code, defaultName);
  const [now, setNow] = useState(() => Date.now());
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [waitedLong, setWaitedLong] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [starting, setStarting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [error, setError] = useState('');
  const alerts = usePresenceAlerts(peers, me?.id, status === 'online');

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    const slow = window.setTimeout(() => setWaitedLong(true), 6000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the share link needs window.location
    setShareUrl(`${window.location.origin}/${locale}/hidden-word-plus/party/${code}`);
    return () => { window.clearInterval(tick); window.clearTimeout(slow); };
  }, [code, locale]);

  const turn = state?.t ?? null;
  const phase = state?.phase;
  const seconds = state?.deadline ? Math.max(0, Math.ceil((state.deadline - now) / 1000)) : null;
  const name = (seat: number) => state?.seats[seat]?.name ?? t.room.guest;

  // Host: out of time below the cut, the closest list word goes on the board.
  const revealKey = state && turn && phase === 'reveal' && me?.isHost ? `${state.sid}-${state.round}-${state.turnIdx}-${turn.stage}` : '';
  const revealed = useRef('');
  useEffect(() => {
    if (!revealKey || revealed.current === revealKey || !turn) return;
    revealed.current = revealKey;
    void hwrReveal(turn.lock, hwpUsed(turn)).then((rev) => dispatch({ t: 'reveal', rev: rev ?? null }));
  }, [revealKey, turn, dispatch]);

  // Setter: when the turn ends, show everyone the word (only this browser knows it).
  useEffect(() => {
    if (!state || !turn || mySeat !== turn.setter || turn.word || (phase !== 'turnEnd' && phase !== 'finished') || !turn.lock) return;
    const word = hwpMine(state.deal).locks?.[turn.lock];
    if (word) dispatch({ t: 'word', word });
  }, [state, turn, mySeat, phase, dispatch]);

  // Each player records the finished match once (friend matches are not ranked).
  useEffect(() => {
    if (!state || state.phase !== 'finished' || mySeat === null || !state.players.includes(mySeat)) return;
    const mine = state.scores[mySeat]; const best = Math.max(...state.players.map((s) => state.scores[s]));
    const tops = state.players.filter((s) => state.scores[s] === best).length;
    reportGame(`hidden_word_plus-party-${state.sid}`, 'hidden_word_plus', 'friend', mine < best ? 'loss' : tops > 1 ? 'draw' : 'win',
      { mode: 'party', score: mine, players: state.players.length });
  }, [state, mySeat]);

  const start = async () => {
    if (!state || starting) return;
    setStarting(true); setError('');
    const seated = state.seats.filter((s, i) => s && i < state.capacity).length;
    const deal = await hwpDeal(seated);
    setStarting(false);
    if (deal?.deal) dispatch({ t: 'start', deal: deal.deal }); else setError(deal?.error === 'login' ? p.needLogin : t.room.errorServer);
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const shareLink = async () => { if (navigator.share) { try { await navigator.share({ title: t.title, text: p.shareText, url: shareUrl }); return; } catch { /* cancelled */ } } void copyLink(); };

  const notice = status === 'unconfigured' ? t.room.unconfigured : status === 'error' ? t.room.connectionError : !state && waitedLong ? t.room.roomNotFound : state && !me?.isHost && !hostOnline ? t.room.hostOffline : null;
  const seatedNow = state ? state.seats.filter((s, i) => s && i < state.capacity).length : 0;

  return (
    <div className={SHELL} style={hwRootStyle('plus')} data-hw="plus">
      <RoomAlerts alerts={alerts} accent={HWP_ACCENT} joinText={t.room.joined} leaveText={t.room.left} />
      <GameHeader players={roomPlayers(state)} me={mySeat} backHref="/hidden-word-plus" backLabel={t.back} title={<>{t.title}<EditionMark label={t.edition} /></>} titleClass="font-black !text-[13px] !tracking-[0.04em] min-[400px]:!text-[15px] sm:!text-xl sm:!tracking-[0.12em]" subtitle={`${p.subtitle} · ${code.toUpperCase()}`}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <span className="hidden sm:contents"><GameUpdates game="hidden_word_plus" /><BugReport /><LanguageSwitcher compact dark /></span>
      </GameHeader>
      {notice && <div className="relative z-10 mx-auto mt-3 flex max-w-[640px] items-center gap-2 px-4 text-xs text-[#ffc2b5]"><WifiOff size={14} />{notice}</div>}

      <main className="relative z-10 mx-auto w-full max-w-[640px] px-3 pb-10 pt-3 sm:px-4 sm:pt-5">
        {!state ? (
          <div className={`${STAGE} flex min-h-[320px] flex-col items-center justify-center gap-3 text-center`}>
            {!notice ? <p className="flex items-center gap-2 text-sm text-white/50"><Loader2 size={16} className="animate-spin" />{t.room.connecting}</p> : <Link href="/hidden-word-plus" className={`px-4 py-2.5 text-sm ${BTN_ACCENT}`}>{t.room.backToGame}</Link>}
          </div>
        ) : phase === 'lobby' ? (
          <div className="space-y-4">
            <div className={PANEL}>
              <p className={PANEL_TITLE}>{t.room.inviteTitle}</p>
              <p className="mt-2 text-sm text-white/55">{p.inviteDesc}</p>
              <InviteCode code={code} />
              <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-2">
                <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-white/70">{shareUrl}</span>
                <button type="button" onClick={copyLink} className={`shrink-0 ${BTN}`}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? t.room.copied : t.room.copy}</button>
                <button type="button" onClick={shareLink} className={`shrink-0 ${BTN_ACCENT}`}><Share2 size={14} />{t.room.share}</button>
              </div>
            </div>
            <div className={PANEL}>
              <div className="flex items-center justify-between gap-2">
                <p className={PANEL_TITLE}>{p.seats}</p>
                <div className="flex gap-1" role="radiogroup" aria-label={p.seats}>
                  {[2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={state.capacity === n} disabled={!me?.isHost} onClick={() => dispatch({ t: 'capacity', n })}
                      className={`h-8 w-8 rounded-md text-xs font-black transition ${state.capacity === n ? 'bg-(--accent) text-(--accent-ink)' : 'border border-white/15 text-white/60 disabled:opacity-40'}`}>{n}</button>
                  ))}
                </div>
              </div>
              {Array.from({ length: state.capacity }, (_, seat) => (
                <p key={seat} className={`flex items-center gap-2 py-1.5 text-sm font-extrabold ${state.seats[seat] ? '' : 'text-white/35'}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 font-mono text-xs">{seat + 1}</span>
                  {state.seats[seat] ? name(seat) : '—'}{state.seats[seat]?.id === me?.id ? ` (${t.you})` : ''}{seat === 0 && <Crown size={12} className="text-[#f2c14e]" />}
                </p>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); rename(nameDraft); setNameDraft(''); }} className="flex items-center gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={16} placeholder={me?.name ?? ''} aria-label={t.room.nickname} className={INPUT} />
              <button type="submit" className={`shrink-0 px-4 py-2.5 ${BTN}`}>{t.room.rename}</button>
            </form>
            {me?.isHost ? (
              <button type="button" onClick={() => void start()} disabled={seatedNow < 2 || starting} className={`flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm font-extrabold ${seatedNow >= 2 ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110' : 'cursor-not-allowed border border-dashed border-white/20 text-white/40'}`}>
                {starting ? <Loader2 size={16} className="animate-spin" /> : seatedNow >= 2 ? <Swords size={16} /> : <Lock size={15} />}{starting ? t.room.starting : seatedNow >= 2 ? p.start(seatedNow) : t.room.needFriend}
              </button>
            ) : <p className="text-center text-sm text-white/50">{mySeat === null ? t.room.roomFull : t.room.waitingHost}</p>}
            {error && <p className="text-center text-xs font-bold text-[#ff8a9a]">{error}</p>}
          </div>
        ) : (
          <>
            <Scoreboard state={state} mySeat={mySeat} name={name} p={p} />
            <div className="mt-3">
              {phase === 'envelope' && <EnvelopeStage state={state} mySeat={mySeat} name={name} t={t} p={p} onPick={(i) => dispatch({ t: 'envelope', i })} />}
              {phase === 'pick' && turn && (turn.setter === mySeat
                ? <PickStage state={state} t={t} p={p} seconds={seconds} onPick={(lock) => dispatch({ t: 'pick', lock })} />
                : <Waiting text={p.pickWait(name(turn.setter))} seconds={seconds} />)}
              {turn && (phase === 'hint' || phase === 'reveal' || phase === 'answer' || phase === 'turnEnd') && (
                <TurnStage key={`${state.round}-${state.turnIdx}`} state={state} turn={turn} mySeat={mySeat} name={name} t={t} p={p} seconds={seconds}
                  onHint={(word, s, rev) => dispatch({ t: 'hint', word, s, rev })} onAnswer={(words, s) => dispatch({ t: 'answer', words, s })} onNext={() => dispatch({ t: 'next' })} />
              )}
              {phase === 'finished' && <FinalStage state={state} mySeat={mySeat} name={name} t={t} p={p} isHost={!!me?.isHost} starting={starting} onAgain={() => void start()} />}
            </div>
          </>
        )}
      </main>
      {rulesOpen && (
        <div className={MODAL_BACKDROP} onClick={() => setRulesOpen(false)}>
          <div className={`${MODAL} max-w-md !p-6 text-left text-white`} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setRulesOpen(false)} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
            <p className={PANEL_TITLE}>{p.rulesTitle}</p>
            <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{p.rules.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
          </div>
        </div>
      )}
    </div>
  );
}

function Scoreboard({ state, mySeat, name, p }: { state: HwpRoom; mySeat: number | null; name: (s: number) => string; p: Party }) {
  const turn = state.t;
  const answered = turn && state.phase === 'answer' ? hwpAnswered(turn) : [];
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#121217]/85 px-3 py-2.5 backdrop-blur">
      <div className="flex items-center justify-between text-[10px] font-black tracking-[0.16em] text-white/45">
        <span>ROUND {state.round}{state.round === 2 && <span className="ml-1.5 rounded-sm px-1 tracking-normal" style={{ background: `${HWP_GOLD}26`, color: HWP_GOLD }}>×2</span>}</span>
        {turn && <span>{p.turnOf(name(turn.setter))} · {state.turnIdx + 1}/{state.order.length}</span>}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
        {state.players.map((seat) => (
          <li key={seat} className={`flex items-center justify-between gap-1.5 rounded-[9px] border px-2 py-1.5 ${turn?.setter === seat ? 'border-[#ffd66b]/60 bg-[#ffd66b]/10' : seat === mySeat ? 'border-(--accent)/50 bg-(--accent)/10' : 'border-white/10 bg-black/25'}`}>
            <span className="flex min-w-0 items-center gap-1 text-[12px] font-black">{turn?.setter === seat && <KeyRound size={11} className="shrink-0 text-[#ffd66b]" />}<span className="truncate">{name(seat)}</span>{answered.includes(seat) && <Check size={11} className="shrink-0 text-(--accent)" />}</span>
            <span className="font-mono text-sm font-black tabular-nums text-(--accent)">{state.scores[seat]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Waiting({ text, seconds }: { text: string; seconds: number | null }) {
  return <div className={`${STAGE} flex min-h-[200px] flex-col items-center justify-center gap-2 text-center`}><Loader2 className="animate-spin text-(--accent)" size={22} /><p className="text-sm text-white/60">{text}</p>{seconds !== null && <p className="font-mono text-xs text-white/40">{seconds}s</p>}</div>;
}

function EnvelopeStage({ state, mySeat, name, t, p, onPick }: { state: HwpRoom; mySeat: number | null; name: (s: number) => string; t: HwCopy; p: Party; onPick: (i: number) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mine = mySeat !== null ? state.picks[mySeat] : null;
  const claim = async (i: number) => {
    if (busy || mine !== null || mySeat === null || !state.players.includes(mySeat)) return;
    setBusy(true); setError('');
    const m = hwpMine(state.deal);
    const words = await hwpClaim(state.deal, i, m.secret);
    setBusy(false);
    if (!words?.length) { setError(p.envelopeTaken); return; }
    hwpSaveMine(state.deal, { ...m, envelope: i, words });
    onPick(i);
  };
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <h2 className="text-center text-xl font-black tracking-[-0.03em]">{t.envelopeTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{p.envelopeDesc}</p>
      <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-3 gap-3">
        {Array.from({ length: HWP_CFG.envelopes }, (_, i) => {
          const owner = state.picks.findIndex((x) => x === i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <Envelope n={i + 1} plus label={t.envelope(i + 1)} state={mine === i ? 'opening' : owner >= 0 || mine !== null || busy ? 'dim' : 'idle'} onPick={() => void claim(i)} />
              <span className="h-4 truncate text-[10px] font-bold text-white/45">{owner >= 0 ? name(owner) : ''}</span>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-center text-xs font-bold text-[#ff8a9a]">{error}</p>}
      {mine !== null && <p className="mt-4 text-center text-xs text-white/50">{p.envelopeWait}</p>}
    </section>
  );
}

function PickStage({ state, t, p, seconds, onPick }: { state: HwpRoom; t: HwCopy; p: Party; seconds: number | null; onPick: (lock: string) => void }) {
  const [mine] = useState(() => hwpMine(state.deal));
  const [word, setWord] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hand = mine.words.filter((w) => !mine.set.includes(w));
  const pick = async () => {
    if (!word || busy) return;
    setBusy(true);
    const lock = await hwpLock(state.deal, word, mine.secret);
    setBusy(false);
    if (!lock) return;
    const fresh = hwpMine(state.deal);
    hwpSaveMine(state.deal, { ...fresh, set: [...fresh.set, word], locks: { ...(fresh.locks ?? {}), [lock]: word } });
    onPick(lock);
  };
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <h2 className="text-center text-xl font-black tracking-[-0.03em]">{t.pickTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{p.pickDesc}{seconds !== null && ` · ${seconds}s`}</p>
      {hand.length ? (
        <div className="mt-5 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3">{hand.map((card, i) => <WordCard key={card} word={card} index={i} plus selected={word === card} onClick={() => setWord(card)} />)}</div>
      ) : <p className="mt-5 text-center text-sm text-[#ff8a9a]">{p.handLost}</p>}
      <button type="button" disabled={!word || busy} onClick={() => void pick()} className={`${BTN_ACCENT} mt-5 w-full !py-3.5 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}{word ? t.pickConfirm(word) : t.pickTitle}</button>
    </section>
  );
}

function TurnStage({ state, turn, mySeat, name, t, p, seconds, onHint, onAnswer, onNext }: {
  state: HwpRoom; turn: HwpTurn; mySeat: number | null; name: (s: number) => string; t: HwCopy; p: Party; seconds: number | null;
  onHint: (word: string, s: number, rev?: { w: string; s: number } | null) => void; onAnswer: (words: string[], s: number[]) => void; onNext: () => void;
}) {
  const setting = mySeat === turn.setter;
  const guessing = mySeat !== null && hwpGuessers(state, turn).includes(mySeat);
  const ended = state.phase === 'turnEnd';
  const myWord = setting ? hwpMine(state.deal).locks?.[turn.lock] : undefined;
  // answers of a stage are shown once that stage is over (or the turn ended)
  const shownAnswers = turn.answers.filter((a) => a.stage < turn.stage || ended);
  const stages = Array.from({ length: turn.stage }, (_, i) => i + 1);
  const answeredNow = hwpAnswered(turn);
  return (
    <section className={`${STAGE} !p-3 sm:!p-5`}>
      <div className={`flex items-center gap-3 rounded-[14px] border px-3.5 py-3 ${setting || (ended && turn.word) ? 'border-[#ffd66b]/45 bg-[#ffd66b]/[0.06]' : 'border-white/12 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.035)_0_8px,transparent_8px_16px)]'}`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white/[0.06] text-[#ffd66b]">{setting || ended ? <KeyRound size={18} /> : <Lock size={18} />}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-[0.14em] text-white/45">{setting ? t.myWord : p.wordOf(name(turn.setter))} · {t.stage(turn.stage)}</p>
          <strong lang="ko" className="block truncate text-2xl font-black tracking-[-0.03em]" style={{ color: HWP_GOLD }}>{setting ? myWord ?? '???' : ended ? turn.word ?? '…' : '???'}</strong>
        </div>
        {seconds !== null && !ended && <span className="font-mono text-sm font-black tabular-nums text-white/70">{seconds}s</span>}
      </div>

      <ul className="mt-3 space-y-1.5" aria-live="polite">
        {stages.map((stage) => (
          <li key={stage} className="space-y-1.5">
            <p className="flex items-center gap-2 pt-1 text-[10px] font-black tracking-[0.12em] text-white/35"><span className="h-px flex-1 bg-white/10" />{t.stage(stage)}<span className="h-px flex-1 bg-white/10" /></p>
            <ul className="space-y-1.5">
              {turn.hints.filter((h) => h.stage === stage).map((h) => <SimRow key={h.w} word={h.w} score={h.s} cut={HWP_CFG.cut} tag={h.by === 'reveal' ? t.revealed : h.s >= HWP_CFG.cut ? t.cutPassed : undefined} />)}
              {shownAnswers.filter((a) => a.stage === stage).map((a) => a.w.map((w, i) => <SimRow key={`${a.seat}-${w}`} word={w} score={a.s[i] ?? 0} cut={HWP_CFG.cut} tag={name(a.seat)} tone={a.ok && (a.s[i] ?? 0) >= 100 ? 'right' : 'wrong'} />))}
            </ul>
          </li>
        ))}
      </ul>

      {state.phase === 'reveal' && <p className="mt-3 flex items-center gap-2 text-[13px] text-white/55"><Loader2 size={14} className="animate-spin" />{t.room.revealing}</p>}
      {state.phase === 'hint' && (setting ? <HintDock turn={turn} t={t} onHint={onHint} /> : <p className="mt-3 text-[13px] text-white/55">{t.room.hintWait(name(turn.setter))}</p>)}
      {state.phase === 'answer' && (guessing && !answeredNow.includes(mySeat!)
        ? <AnswerDock turn={turn} mySeat={mySeat!} t={t} p={p} onAnswer={onAnswer} />
        : <p className="mt-3 flex items-center gap-2 text-[13px] text-white/55"><Users size={14} />{p.answered(answeredNow.length, hwpGuessers(state, turn).length)}</p>)}
      {ended && (
        <div className="mt-4 rounded-[14px] border border-(--accent)/40 bg-(--accent)/[0.08] p-4 text-center">
          <p className="text-lg font-black">{turn.solved === -1 ? p.turnLost(name(turn.setter)) : turn.solved ? p.found(turn.solved, turn.answers.filter((a) => a.ok && a.stage === turn.solved).map((a) => name(a.seat)).join(', ')) : t.room.endHeld(name(turn.setter))}</p>
          <p className="mt-1 text-[12px] text-white/60">{state.players.filter((s) => turn.gained[s]).map((s) => `${name(s)} +${turn.gained[s]}`).join(' · ') || p.noPoints}</p>
          <button type="button" onClick={onNext} disabled={mySeat === null || !state.players.includes(mySeat)} className={`${BTN_ACCENT} mt-3 w-full !py-3 !text-sm`}><ArrowRight size={15} />{t.next}{seconds !== null && ` · ${seconds}s`}</button>
        </div>
      )}
    </section>
  );
}

function HintDock({ turn, t, onHint }: { turn: HwpTurn; t: HwCopy; onHint: (word: string, s: number, rev?: { w: string; s: number } | null) => void }) {
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const left = HWP_CFG.maxHints - hwpHintsThisStage(turn);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = hwClean(word);
    if (busy || !clean) return;
    if (!isHwWord(clean)) { setError(t.errors.invalid); return; }
    if (hwpUsed(turn).includes(clean)) { setError(t.errors.duplicate); return; }
    setBusy(true); setError('');
    const scores = await hwrScore(turn.lock, [clean], 'hint');
    const s = scores?.[0];
    if (s === undefined || s === null) { setBusy(false); setError(scores ? t.errors.unknown : t.room.errorServer); return; }
    if (s >= 100) { setBusy(false); setError(t.errors.secret); return; }
    const rev = left === 1 && s < HWP_CFG.cut ? await hwrReveal(turn.lock, [...hwpUsed(turn), clean]) : null;
    setBusy(false); setWord('');
    onHint(clean, s, rev);
  };
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 backdrop-blur">
      <p className="px-0.5 pb-2 text-[11px] font-bold text-white/50">{t.hintsLeft(left)}</p>
      <div className="flex gap-2">
        <input className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" spellCheck={false} placeholder={t.hintPlaceholder} aria-label={t.hintPlaceholder} onChange={(e) => { setWord(e.target.value); setError(''); }} />
        <button type="submit" disabled={busy || !word.trim()} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button>
      </div>
      <p className={`mt-2 px-0.5 text-[11.5px] ${error ? 'font-bold text-[#ff8a9a]' : 'text-white/45'}`}>{error || t.room.hintHelp(HWP_CFG.cut)}</p>
    </form>
  );
}

function AnswerDock({ turn, mySeat, t, p, onAnswer }: { turn: HwpTurn; mySeat: number; t: HwCopy; p: Party; onAnswer: (words: string[], s: number[]) => void }) {
  const [word, setWord] = useState('');
  const [second, setSecond] = useState('');
  const [two, setTwo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canTwo = !turn.chance.includes(mySeat);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const words = [word, two ? second : ''].map(hwClean).filter(Boolean);
    if (busy || !words.length) return;
    if (!words.every(isHwWord)) { setError(t.errors.invalid); return; }
    if (new Set(words).size !== words.length || words.some((w) => turn.hints.some((h) => h.w === w))) { setError(t.errors.duplicate); return; }
    setBusy(true); setError('');
    const scores = await hwrScore(turn.lock, words, 'answer');
    setBusy(false);
    if (!scores || scores.some((s) => s === null)) { setError(scores ? t.errors.unknown : t.room.errorServer); return; }
    onAnswer(words, scores as number[]);
  };
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 space-y-2 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 backdrop-blur">
      <div className="flex gap-2">
        <input className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" spellCheck={false} placeholder={t.guessPlaceholder} aria-label={t.guessPlaceholder} onChange={(e) => { setWord(e.target.value); setError(''); }} />
        <button type="submit" disabled={busy || !word.trim() || (two && !second.trim())} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button>
      </div>
      {two && <input className={`${INPUT} w-full !py-3 !text-base font-bold`} lang="ko" value={second} maxLength={12} autoComplete="off" spellCheck={false} placeholder={t.secondPlaceholder} aria-label={t.secondPlaceholder} onChange={(e) => { setSecond(e.target.value); setError(''); }} />}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className={`text-[11.5px] ${error ? 'font-bold text-[#ff8a9a]' : 'text-white/45'}`}>{error || p.answerHelp}</p>
        <button type="button" disabled={!canTwo} onClick={() => setTwo((v) => !v)} aria-pressed={two} className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-black ${!canTwo ? 'border-white/10 text-white/25' : two ? 'border-[#ffd66b] bg-[#ffd66b]/20 text-[#ffd66b]' : 'border-[#ffd66b]/50 text-[#ffd66b]'}`}>{canTwo ? t.room.chance : t.room.chanceUsed}</button>
      </div>
    </form>
  );
}

function FinalStage({ state, mySeat, name, t, p, isHost, starting, onAgain }: { state: HwpRoom; mySeat: number | null; name: (s: number) => string; t: HwCopy; p: Party; isHost: boolean; starting: boolean; onAgain: () => void }) {
  const ranked = [...state.players].sort((a, b) => state.scores[b] - state.scores[a]);
  return (
    <section className={`${STAGE} !p-5 text-center sm:!p-7`}>
      <Trophy size={34} className="mx-auto text-[#ffcf3f]" />
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">{p.winner(ranked.filter((s) => state.scores[s] === state.scores[ranked[0]]).map(name).join(', '))}</h2>
      <ol className="mt-4 space-y-1.5 text-left">
        {ranked.map((seat, i) => (
          <li key={seat} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${seat === mySeat ? 'border-(--accent)/50 bg-(--accent)/10' : 'border-white/10 bg-black/30'}`}>
            <span className="w-5 font-mono text-sm font-black text-white/45">{i + 1}</span><b className="min-w-0 flex-1 truncate text-sm">{name(seat)}</b><span className="font-mono text-lg font-black text-(--accent)">{state.scores[seat]}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-4 space-y-1 text-left">
        {state.history.map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-black/25 px-3 py-1.5 text-[12px]">
            <span className="text-white/55">R{h.round} · {t.room.turnOf(name(h.setter))}</span><strong lang="ko" className="text-white/85">{h.word ?? '—'}</strong>
            <span className="font-mono text-white/60">{h.solved === -1 ? p.skipped : h.solved ? t.histSolved(h.solved) : t.histHeld}</span>
          </li>
        ))}
      </ul>
      {isHost ? <button type="button" disabled={starting} onClick={onAgain} className={`${BTN_ACCENT} mt-5 w-full !py-3.5 !text-sm`}>{starting ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}{t.room.rematch}</button>
        : <p className="mt-5 text-xs text-white/45">{t.room.rematchWait}</p>}
    </section>
  );
}
