"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Loader2, RotateCcw, Send, Sparkles, Trophy, X } from 'lucide-react';
import { Piece } from '@/components/CompetitionBoard';
import { useAuth } from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { setRoomPlaying } from '@/lib/roomChat';
import { type HwAction, type HwEntry, type HwLevel, type HwRankRow, type HwTurn, type HwView, hwAct, hwClean, hwRanking, hwStart, hwState, hwTimeline, isHwLevel, isHwWord, HW_ENVELOPES, HW_LEVELS, HW_RANK_MIN } from '@/lib/hiddenWord';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, INPUT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL, STAGE } from '../ui/gameUi';
import { HW_GOLD, HW_ROOT_STYLE, type HwCopy, hwCopy } from './copy';
import { Envelope, LevelPicker, MoraFace, SecretCard, SimRow, StageTrack, TimerRing, WordCard } from './HiddenWordParts';

const GAME_KEY = 'puzzlthink_hw_game';
const LEVEL_KEY = 'puzzlthink_hw_level';
const byMe = (entry: HwEntry) => ('hint' in entry ? entry.hint.by === 'me' : entry.guess.by === 'me');

/** Points a turn has paid out so far, counting only the answers already shown on the board. */
function shownPoints(turn: HwTurn, entries: HwEntry[], view: HwView) {
  let me = 0, ai = 0;
  for (const entry of entries) {
    if (!('guess' in entry)) continue;
    const win = view.cfg.guessPoints[entry.stage - 1] * view.round, hold = view.cfg.setPoints[entry.stage - 1] * view.round;
    const guesserIsMe = turn.kind === 'guess';
    if (entry.guess.ok) { if (guesserIsMe) me += win; else ai += win; } else if (guesserIsMe) ai += hold; else me += hold;
  }
  return { me, ai };
}

/** 히든 워드 against MORA: two rounds, I set a word and guess hers, my points go to the ranking. */
export default function HiddenWordGame() {
  const locale = useLocale();
  const t = hwCopy(locale);
  const { user } = useAuth();
  const [view, setView] = useState<HwView | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState({ offset: 0, now: 0 });
  const [shown, setShown] = useState({ key: '', n: 0 });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);
  /** The level a new match starts at: the last one picked on this browser. */
  const [level, setLevel] = useState<HwLevel>('basic');
  const loading = useRef(false);
  const timedOut = useRef(0);

  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);

  const accept = useCallback((next: HwView) => {
    setClock({ offset: next.now - Date.now(), now: Date.now() });
    setView(next);
    try { localStorage.setItem(GAME_KEY, next.id); } catch { /* private mode: no resume */ }
  }, []);

  const begin = useCallback(async (fresh: boolean, pick?: HwLevel) => {
    if (loading.current) return;
    loading.current = true; setFailed(false); setError(null);
    let saved: string | null = null, chosen: HwLevel = 'basic';
    try {
      saved = fresh ? null : localStorage.getItem(GAME_KEY);
      const stored = localStorage.getItem(LEVEL_KEY);
      if (pick) localStorage.setItem(LEVEL_KEY, pick); else if (isHwLevel(stored)) chosen = stored;
    } catch { /* no storage */ }
    if (pick) chosen = pick;
    let next = saved ? await hwState(saved) : null;
    if (!next || next.phase === 'over') next = await hwStart(chosen);
    loading.current = false;
    setLevel(next?.level ?? chosen);
    if (next && !next.error) accept(next); else setFailed(true);
  }, [accept]);
  useEffect(() => { void begin(false); }, [begin]);

  const act = useCallback(async (action: HwAction) => {
    if (!view || busy) return false;
    setBusy(true);
    const next = await hwAct(view.id, action);
    setBusy(false);
    if (!next) { setError('unavailable'); return false; }
    if (next.error === 'missing') { void begin(true); return false; }
    setError(next.error ?? null);
    if (next.id) accept(next);
    return !next.error;
  }, [view, busy, begin, accept]);

  // The board catches up with the server one entry at a time: my own words at once, MORA's with a beat.
  const turnKey = view ? `${view.id}:${view.round}:${view.turnNo}` : '';
  const timeline = useMemo(() => hwTimeline(view?.t, view?.cfg.stages ?? 3), [view]);
  let n = shown.key === turnKey ? Math.min(shown.n, timeline.length) : 0;
  while (n < timeline.length && byMe(timeline[n])) n++;   // my own words need no beat (and the input must not blink)
  const revealing = n < timeline.length;
  useEffect(() => {
    if (n >= timeline.length) return;
    const timer = window.setTimeout(() => setShown({ key: turnKey, n: n + 1 }), 'hint' in timeline[n] ? 850 : 1700);
    return () => window.clearTimeout(timer);
  }, [n, timeline, turnKey]);

  // Turn clock, from the server's deadline.
  const timed = !!view?.deadline && (view.phase === 'hint' || view.phase === 'guess');
  useEffect(() => {
    if (!timed) return;
    const timer = window.setInterval(() => setClock((c) => ({ ...c, now: Date.now() })), 500);
    return () => window.clearInterval(timer);
  }, [timed]);
  const seconds = timed ? Math.max(0, Math.ceil((view!.deadline! - (clock.now + clock.offset)) / 1000)) : null;
  useEffect(() => {
    if (seconds !== 0 || busy || revealing || !view?.deadline || timedOut.current === view.deadline) return;
    timedOut.current = view.deadline;
    void act({ t: 'timeout' });
  }, [seconds, busy, revealing, view, act]);

  // A new screen (envelopes, word pick, next turn, result) starts from the top.
  const screen = view ? `${turnKey}:${view.phase === 'hint' || view.phase === 'guess' || view.phase === 'turnEnd' ? 'turn' : view.phase}` : '';
  useEffect(() => { if (screen) window.scrollTo({ top: 0 }); }, [screen]);

  const visible = timeline.slice(0, n);
  const turnShown = view?.t ? shownPoints(view.t, visible, view) : { me: 0, ai: 0 };
  const me = view ? view.me - (view.t ? view.t.me - turnShown.me : 0) : 0;
  const ai = view ? view.ai - (view.t ? view.t.ai - turnShown.ai : 0) : 0;

  return (
    <div className={SHELL} style={HW_ROOT_STYLE}>
      <GameHeader ai backHref="/hidden-word" backLabel={t.back} title={t.title} titleClass="font-black !text-[13px] !tracking-[0.04em] min-[400px]:!text-[15px] sm:!text-xl sm:!tracking-[0.12em]" subtitle={t.subtitle}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <button type="button" onClick={() => setRankOpen(true)} className={BTN} aria-label={t.ranking}><Trophy size={14} /><span className="hidden sm:inline">{t.ranking}</span></button>
        <span className="hidden sm:contents"><GameUpdates game="hidden_word" /><BugReport /><LanguageSwitcher compact dark /></span>
        <button type="button" onClick={() => void begin(true, level)} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 mx-auto w-full max-w-[640px] px-3 pb-10 pt-3 sm:px-4 sm:pt-5">
        {!view ? (
          <div className={`${STAGE} flex min-h-[320px] flex-col items-center justify-center gap-3 text-center`} role="status">
            {failed ? <>
              <p className="text-sm text-white/70">{t.offline}</p>
              <button type="button" onClick={() => void begin(false)} className={BTN_ACCENT}><RotateCcw size={14} />{t.retry}</button>
            </> : <><Loader2 className="animate-spin text-(--accent)" size={26} /><p className="text-sm text-white/55">{t.loading}</p></>}
          </div>
        ) : (
          <>
            <Hud view={view} me={me} ai={ai} t={t} thinking={revealing} />
            {!user && view.phase !== 'over' && <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40"><Sparkles size={11} />{t.loginToRecord}</p>}
            <div className="mt-3">
              {view.phase === 'envelope' && <EnvelopeStage key={view.id} t={t} busy={busy} level={view.level ?? 'basic'} onLevel={(next) => void begin(true, next)} onPick={(i) => void act({ t: 'envelope', i })} />}
              {view.phase === 'pick' && <PickStage view={view} t={t} busy={busy} onPick={(word) => void act({ t: 'pick', word })} />}
              {view.t && (view.phase === 'hint' || view.phase === 'guess' || view.phase === 'turnEnd') && (
                <TurnStage key={turnKey} view={view} turn={view.t} visible={visible} pending={revealing ? timeline[n] : null} seconds={seconds} busy={busy} error={error} t={t} act={act} clearError={() => setError(null)} />
              )}
              {view.phase === 'over' && <OverStage view={view} t={t} signedIn={!!user} onAgain={() => void begin(true, view.level ?? 'basic')} onRank={() => setRankOpen(true)} />}
            </div>
          </>
        )}
      </main>
      {rulesOpen && <RulesModal t={t} onClose={() => setRulesOpen(false)} />}
      {rankOpen && <RankModal t={t} level={view?.level ?? level} onClose={() => setRankOpen(false)} />}
    </div>
  );
}

function Hud({ view, me, ai, t, thinking }: { view: HwView; me: number; ai: number; t: HwCopy; thinking: boolean }) {
  const turnIndex = view.phase === 'over' ? 4 : (view.round - 1) * 2 + view.turnNo;
  const kind = view.t?.kind;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[14px] border border-white/10 bg-[#121217]/85 px-3 py-2.5 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-(--accent) text-xs font-black text-(--accent-ink)">{t.you.slice(0, 2)}</span>
        <strong key={me} className="font-mono text-2xl font-black tabular-nums text-(--accent) [animation:hwPop_.4s_ease-out] sm:text-3xl">{me}</strong>
      </div>
      <div className="text-center">
        <p className="font-mono text-[10px] font-black tracking-[0.2em] text-white/50">{t.round(view.round)}{view.round === 2 && <span className="ml-1.5 rounded-sm px-1 py-px tracking-normal" style={{ background: `${HW_GOLD}26`, color: HW_GOLD }}>×2</span>}{view.level === 'plus' && <span className="ml-1.5 rounded-sm bg-(--accent)/15 px-1 py-px tracking-normal text-(--accent)">{t.levelName.plus}</span>}</p>
        <p className="mt-0.5 text-[11px] font-black text-white/80">{kind ? t[kind === 'set' ? 'turnSet' : 'turnGuess'] : view.phase === 'over' ? t.finalScore : t.envelopeTitle}</p>
        <div className="mt-1 flex justify-center gap-1" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 w-4 rounded-full ${i < turnIndex ? 'bg-(--accent)' : i === turnIndex ? 'bg-white/70' : 'bg-white/12'}`} />)}</div>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2.5">
        <strong key={ai} className="font-mono text-2xl font-black tabular-nums text-white/85 [animation:hwPop_.4s_ease-out] sm:text-3xl">{ai}</strong>
        <span className="flex flex-col items-center"><MoraFace size={32} thinking={thinking} /><span className="mt-0.5 text-[9px] font-black tracking-wider text-white/45">{t.ai}</span></span>
      </div>
    </div>
  );
}

function EnvelopeStage({ t, busy, level, onLevel, onPick }: { t: HwCopy; busy: boolean; level: HwLevel; onLevel: (level: HwLevel) => void; onPick: (i: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <LevelPicker t={t} level={level} disabled={busy || picked !== null} onPick={(next) => { if (next !== level) onLevel(next); }} />
      <h2 className="text-center text-xl font-black tracking-[-0.03em] sm:text-2xl">{t.envelopeTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{t.envelopeDesc}</p>
      <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: HW_ENVELOPES }, (_, i) => (
          <Envelope key={i} n={i + 1} label={t.envelope(i + 1)} state={picked === null ? (busy ? 'dim' : 'idle') : picked === i ? 'opening' : 'dim'}
            onPick={() => { setPicked(i); window.setTimeout(() => onPick(i), 520); }} />
        ))}
      </div>
    </section>
  );
}

function PickStage({ view, t, busy, onPick }: { view: HwView; t: HwCopy; busy: boolean; onPick: (word: string) => void }) {
  const [word, setWord] = useState<string | null>(null);
  return (
    <section className={`${STAGE} !p-5 sm:!p-7`}>
      <h2 className="text-center text-xl font-black tracking-[-0.03em] sm:text-2xl">{t.pickTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm break-keep text-center text-[13px] leading-6 text-white/55">{t.pickDesc}</p>
      <div className="mt-5 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3 sm:gap-3">
        {view.hand.map((card, i) => <WordCard key={card} word={card} index={i} selected={word === card} onClick={() => setWord(card)} />)}
      </div>
      <button type="button" disabled={!word || busy} onClick={() => word && onPick(word)} className={`${BTN_ACCENT} mt-5 w-full !py-3.5 !text-sm`}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}{word ? t.pickConfirm(word) : t.pickTitle}
      </button>
    </section>
  );
}

function TurnStage({ view, turn, visible, pending, seconds, busy, error, t, act, clearError }: {
  view: HwView; turn: HwTurn; visible: HwEntry[]; pending: HwEntry | null; seconds: number | null; busy: boolean; error: string | null;
  t: HwCopy; act: (action: HwAction) => Promise<boolean>; clearError: () => void;
}) {
  const { cfg } = view;
  const setting = turn.kind === 'set';
  const ended = view.phase === 'turnEnd' && !pending;
  const answers = visible.filter((entry) => 'guess' in entry);
  const stageNow = Math.min(cfg.stages, 1 + answers.filter((entry) => 'guess' in entry && !entry.guess.ok).length);
  const results = Array.from({ length: cfg.stages }, (_, i) => {
    const entry = answers.find((x) => x.stage === i + 1);
    if (!entry || !('guess' in entry)) return null;
    return entry.guess.ok === setting ? 'bad' as const : 'good' as const;
  });
  const points = (setting ? cfg.setPoints : cfg.guessPoints).map((p) => p * view.round);
  const myHints = turn.hints.filter((hint) => hint.stage === turn.stage && hint.by === 'me').length;
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [visible.length, ended]);

  return (
    <section className={`${STAGE} !p-3 sm:!p-5`}>
      <div className="flex items-stretch gap-2">
        <SecretCard label={setting ? t.myWord : t.aiWord} word={setting || ended ? turn.word : undefined} sealedLabel={t.sealed} />
        <StageTrack labels={Array.from({ length: cfg.stages }, (_, i) => t.stage(i + 1))} points={points} current={ended ? 0 : stageNow} results={results} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className={PANEL_TITLE}>{t.board}</p>
        {seconds !== null && !pending && !ended && <TimerRing seconds={seconds} total={view.phase === 'hint' ? cfg.hintSecs : cfg.guessSecs} label={t.timeLeft} />}
      </div>
      <ul className="mt-2 space-y-1.5" aria-live="polite">
        {visible.length === 0 && !pending && <li className="rounded-[12px] border border-dashed border-white/10 px-3 py-6 text-center text-[13px] text-white/40">{t.boardEmpty}</li>}
        {visible.map((entry, i) => {
          const first = i === 0 || visible[i - 1].stage !== entry.stage;
          return (
            <FragmentRow key={entry.key} divider={first ? t.stage(entry.stage) : null}>
              {'hint' in entry
                ? <SimRow word={entry.hint.w} score={entry.hint.s} cut={cfg.cut} tag={entry.hint.by === 'reveal' ? t.revealed : entry.hint.s >= cfg.cut ? t.cutPassed : undefined} />
                : <AnswerRows entry={entry} setting={setting} view={view} t={t} />}
            </FragmentRow>
          );
        })}
        {pending && (
          <li className="flex items-center gap-2.5 rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-3 text-[13px] font-bold text-white/60">
            <MoraFace size={24} thinking />{'hint' in pending ? t.aiHinting : t.aiThinking}
          </li>
        )}
      </ul>
      <div ref={end} />

      {ended ? <TurnEnd view={view} turn={turn} t={t} busy={busy} onNext={() => void act({ t: 'next' })} />
        : pending ? null
        : view.phase === 'hint' ? <HintDock key={turn.stage} t={t} cut={cfg.cut} left={cfg.maxHints - myHints} busy={busy} error={error} clearError={clearError} onSend={(word) => act({ t: 'hint', word })} />
        : view.phase === 'guess' ? <GuessDock key={turn.stage} t={t} chance={turn.chance} pieces={view.pieces ?? 0} busy={busy} error={error} clearError={clearError} onSend={(words) => act({ t: 'guess', words })} />
        : null}
    </section>
  );
}

function FragmentRow({ divider, children }: { divider: string | null; children: React.ReactNode }) {
  return <>
    {divider && <li className="flex items-center gap-2 pt-1.5 text-[10px] font-black tracking-[0.12em] text-white/35" aria-hidden><span className="h-px flex-1 bg-white/10" />{divider}<span className="h-px flex-1 bg-white/10" /></li>}
    {children}
  </>;
}

/** An answer on the board: each word with its similarity, then what it paid. */
function AnswerRows({ entry, setting, view, t }: { entry: HwEntry & { guess: HwTurn['guesses'][number] }; setting: boolean; view: HwView; t: HwCopy }) {
  const { guess, stage } = entry;
  const who = guess.by === 'ai' ? t.aiAnswer : t.myAnswer;
  const hold = view.cfg.setPoints[stage - 1] * view.round, win = view.cfg.guessPoints[stage - 1] * view.round;
  const note = guess.ok ? `${t.correct} ${t.gained(setting ? t.ai : t.you, win)}` : setting ? t.defended(hold) : t.missed(hold);
  return <>
    {guess.w.length === 0 && <li className="rounded-[12px] border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[13px] font-bold text-white/45 [animation:hwRowIn_.35s_ease-out_both]">{who} · {t.pass}</li>}
    {guess.w.map((word, i) => <SimRow key={word} word={word} score={guess.s[i] ?? 0} cut={view.cfg.cut} tag={who} tone={guess.ok && word === view.t?.word ? (setting ? 'caught' : 'right') : 'wrong'} />)}
    <li className={`flex justify-end text-[12px] font-black [animation:hwRowIn_.35s_.25s_ease-out_both] ${guess.ok === setting ? 'text-[#ff8a9a]' : 'text-(--accent)'}`}>{note}</li>
  </>;
}

function useWordError(error: string | null, t: HwCopy) {
  const [local, setLocal] = useState<string | null>(null);
  const code = local ?? error;
  return { message: code ? t.errors[code] ?? t.errors.unavailable : null, setLocal };
}

function HintDock({ t, cut, left, busy, error, clearError, onSend }: {
  t: HwCopy; cut: number; left: number; busy: boolean; error: string | null; clearError: () => void; onSend: (word: string) => Promise<boolean>;
}) {
  const [word, setWord] = useState('');
  const { message, setLocal } = useWordError(error, t);
  const input = useRef<HTMLInputElement>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = hwClean(word);
    if (busy || !clean) return;
    if (!isHwWord(clean)) { setLocal('invalid'); return; }
    setLocal(null);
    if (await onSend(clean)) setWord('');
    input.current?.focus();
  }
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 shadow-[0_-8px_30px_rgba(0,0,0,.5)] backdrop-blur sm:p-3">
      <div className="flex items-center justify-between px-0.5 pb-2">
        <span className="flex items-center gap-1" aria-label={t.hintsLeft(left)}>{Array.from({ length: left }, (_, i) => <span key={i} className="h-1.5 w-5 rounded-full bg-(--accent)" />)}<span className="ml-1.5 text-[11px] font-bold text-white/50">{t.hintsLeft(left)}</span></span>
      </div>
      <div className="flex gap-2">
        <input ref={input} className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"
          placeholder={t.hintPlaceholder} aria-label={t.hintPlaceholder} onChange={(event) => { setWord(event.target.value); setLocal(null); if (error) clearError(); }} />
        <button type="submit" disabled={busy || !word.trim()} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}<span className="hidden min-[380px]:inline">{t.hintSend}</span></button>
      </div>
      <p key={message ?? 'ok'} role={message ? 'alert' : undefined} className={`mt-2 break-keep px-0.5 text-[11.5px] leading-5 ${message ? 'font-bold text-[#ff8a9a] [animation:hwShake_.35s]' : 'text-white/45'}`}>{message ?? (left === 1 ? t.hintLast : t.hintHelp(cut))}</p>
    </form>
  );
}

function GuessDock({ t, chance, pieces, busy, error, clearError, onSend }: {
  t: HwCopy; chance: boolean; /** my 피스 left: a second answer costs one */ pieces: number; busy: boolean; error: string | null; clearError: () => void; onSend: (words: string[]) => Promise<boolean>;
}) {
  const [word, setWord] = useState('');
  const [second, setSecond] = useState('');
  const [useChance, setUseChance] = useState(false);
  const { message, setLocal } = useWordError(error, t);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const words = [word, useChance ? second : ''].map(hwClean).filter(Boolean);
    if (busy || !words.length) return;
    if (!words.every(isHwWord)) { setLocal('invalid'); return; }
    if (new Set(words).size !== words.length) { setLocal('duplicate'); return; }
    setLocal(null);
    if (await onSend(words)) { setWord(''); setSecond(''); setUseChance(false); }
  }
  const change = (set: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => { set(event.target.value); setLocal(null); if (error) clearError(); };
  return (
    <form onSubmit={submit} className="sticky bottom-2 z-10 mt-4 rounded-[14px] border border-white/12 bg-[#16161c]/95 p-2.5 shadow-[0_-8px_30px_rgba(0,0,0,.5)] backdrop-blur sm:p-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input className={`${INPUT} !py-3 !text-base font-bold`} lang="ko" value={word} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"
            placeholder={t.guessPlaceholder} aria-label={t.guessPlaceholder} onChange={change(setWord)} />
          <button type="submit" disabled={busy || !word.trim() || (useChance && !second.trim())} className={`${BTN_ACCENT} shrink-0 !px-4 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}<span className="hidden min-[380px]:inline">{t.guessSend}</span></button>
        </div>
        {useChance && <input className={`${INPUT} w-full !py-3 !text-base font-bold`} lang="ko" value={second} maxLength={12} autoComplete="off" autoCorrect="off" spellCheck={false}
          placeholder={t.secondPlaceholder} aria-label={t.secondPlaceholder} onChange={change(setSecond)} />}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 px-0.5">
        <p key={message ?? 'ok'} role={message ? 'alert' : undefined} className={`break-keep text-[11.5px] leading-5 ${message ? 'font-bold text-[#ff8a9a] [animation:hwShake_.35s]' : 'text-white/45'}`}>{message ?? (useChance ? t.chanceHelp(pieces) : chance && pieces < 1 ? t.chanceNeed : t.guessHelp)}</p>
        <button type="button" disabled={!chance || pieces < 1} onClick={() => setUseChance((on) => !on)} aria-pressed={useChance}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-black transition ${!chance || pieces < 1 ? 'border-white/10 text-white/25' : useChance ? 'border-[#ffc857] bg-[#ffc857]/20 text-[#ffc857]' : 'border-[#ffc857]/50 text-[#ffc857] hover:bg-[#ffc857]/10'}`}>
          <span className={!chance || pieces < 1 ? 'opacity-40 grayscale' : ''}><Piece size={11} /></span>{!chance ? t.chanceUsed : pieces < 1 ? t.chanceNoPiece : useChance ? t.chanceOn : t.chance}
        </button>
      </div>
    </form>
  );
}

function TurnEnd({ view, turn, t, busy, onNext }: { view: HwView; turn: HwTurn; t: HwCopy; busy: boolean; onNext: () => void }) {
  const setting = turn.kind === 'set';
  const solved = turn.solved ?? 0;
  const good = setting ? solved === 0 : solved > 0;
  const title = setting ? (solved ? t.endSetLost(solved) : t.endSetHeld) : solved ? t.endGuessWon(solved) : t.endGuessLost;
  const last = view.round === 2 && view.turnNo === 1;
  return (
    <div className={`mt-4 rounded-[14px] border p-4 text-center [animation:hwPop_.45s_ease-out_both] ${good ? 'border-(--accent)/45 bg-(--accent)/[0.08]' : 'border-[#ff5d73]/35 bg-[#ff5d73]/[0.06]'}`}>
      <p className={`text-lg font-black tracking-[-0.02em] sm:text-xl ${good ? 'text-(--accent)' : 'text-[#ff8a9a]'}`}>{title}</p>
      <div className="mt-2 flex items-center justify-center gap-4 font-mono text-sm font-black">
        <span className="text-(--accent)">{t.gained(t.you, turn.me)}</span><span className="text-white/25">·</span><span className="text-white/70">{t.gained(t.ai, turn.ai)}</span>
      </div>
      <button type="button" disabled={busy} onClick={onNext} className={`${BTN_ACCENT} mt-4 w-full !py-3.5 !text-sm`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}{last ? t.toResult : t.next}</button>
    </div>
  );
}

function OverStage({ view, t, signedIn, onAgain, onRank }: { view: HwView; t: HwCopy; signedIn: boolean; onAgain: () => void; onRank: () => void }) {
  const result = view.me > view.ai ? t.overWin : view.me < view.ai ? t.overLoss : t.overDraw;
  const [rows, setRows] = useState<HwRankRow[] | null>(null);
  useEffect(() => { hwRanking(5, view.level ?? 'basic').then(setRows); }, [view.level]);
  const mine = rows?.find((row) => row.is_me);
  return (
    <section className={`${STAGE} !p-5 text-center sm:!p-7`}>
      <p className="font-mono text-[10px] font-black tracking-[0.3em] text-white/40">{t.finalScore.toUpperCase()}</p>
      <h2 className={`mt-1 text-3xl font-black tracking-[-0.04em] [animation:hwPop_.5s_ease-out_both] sm:text-4xl ${view.me >= view.ai ? 'text-(--accent)' : 'text-[#ff8a9a]'}`}>{result}</h2>
      <div className="mt-4 flex items-end justify-center gap-5">
        <div><p className="text-[11px] font-black text-white/45">{t.you}</p><p className="font-mono text-6xl font-black tabular-nums text-(--accent) sm:text-7xl">{view.me}</p></div>
        <span className="pb-4 font-mono text-2xl font-black text-white/20">:</span>
        <div><p className="text-[11px] font-black text-white/45">{t.ai}</p><p className="font-mono text-6xl font-black tabular-nums text-white/75 sm:text-7xl">{view.ai}</p></div>
      </div>
      <p className="mt-3 text-[12px] text-white/50">{view.recorded ? t.recorded : t.loginToRecord}{view.recorded && mine && <b className="ml-1.5 text-(--accent)">{mine.rank ? `#${mine.rank} · ` : ''}{t.rankScore(mine.score)} ({t.rankBreak(mine.avg, mine.bonus)}){!mine.rank && ` · ${t.rankNeed(mine.games, HW_RANK_MIN)}`}</b>}</p>
      {!signedIn && <div className="mt-3 flex justify-center"><AuthButton source="other" /></div>}

      <p className={`${PANEL_TITLE} mt-6 text-left`}>{t.history}</p>
      <ul className="mt-2 space-y-1.5 text-left">
        {view.history.map((turn, i) => {
          const setting = turn.kind === 'set'; const solved = turn.solved ?? 0;
          const outcome = setting ? (solved ? `${t.ai} ${t.histSolved(solved)}` : t.histHeld) : solved ? t.histSolved(solved) : t.histFailed;
          return (
            <li key={i} className="flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-black/30 px-3 py-2">
              <span className="font-mono text-[10px] font-black text-white/35">R{turn.round}</span>
              <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-black ${setting ? 'bg-[#ffc857]/15 text-[#ffc857]' : 'bg-[#5aa9e6]/15 text-[#8cc4f0]'}`}>{setting ? t.histSet : t.histGuess}</span>
              <strong lang="ko" className="min-w-0 flex-1 truncate text-[15px] font-black">{turn.word}</strong>
              <span className="shrink-0 text-[11px] font-bold text-white/50">{outcome}</span>
              <span className="w-9 shrink-0 text-right font-mono text-sm font-black text-(--accent)">+{turn.me}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onRank} className={`${BTN} !py-3 !text-sm`}><Trophy size={15} />{t.ranking}</button>
        <button type="button" onClick={onAgain} className={`${BTN_ACCENT} !py-3 !text-sm`}><RotateCcw size={15} />{t.again}</button>
      </div>
    </section>
  );
}

function RulesModal({ t, onClose }: { t: HwCopy; onClose: () => void }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md !p-6 text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className="mt-4 break-keep border-t border-white/10 pt-3 text-[11.5px] leading-5 text-white/60">{t.levelsAbout}</p>
        <p className="mt-2 break-keep text-[11.5px] leading-5 text-white/45">{t.aboutSim}</p>
      </div>
    </div>
  );
}

function RankModal({ t, level: start, onClose }: { t: HwCopy; level: HwLevel; onClose: () => void }) {
  const [level, setLevel] = useState<HwLevel>(start);
  const [got, setGot] = useState<{ level: HwLevel; rows: HwRankRow[] | null } | null>(null);
  useEffect(() => {
    let live = true;
    hwRanking(20, level).then((rows) => { if (live) setGot({ level, rows }); });
    return () => { live = false; };
  }, [level]);
  const rows = got?.level === level ? got.rows : undefined;
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md !p-6 text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rankTitle}</p>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-[10px] border border-white/10 bg-black/30 p-1" role="tablist" aria-label={t.levelTitle}>
          {HW_LEVELS.map((id) => (
            <button key={id} type="button" role="tab" aria-selected={level === id} onClick={() => setLevel(id)}
              className={`rounded-[8px] py-1.5 text-[12px] font-black transition ${level === id ? 'bg-(--accent) text-(--accent-ink)' : 'text-white/55 hover:text-white'}`}>{t.levelName[id]}</button>
          ))}
        </div>
        <p className="mt-2 break-keep text-[12px] leading-5 text-white/50">{t.rankDesc} {t.rankLevels}</p>
        <p className="mt-2 rounded-[10px] border border-white/10 bg-black/30 px-3 py-2 text-center font-mono text-[11.5px] font-bold text-white/70">{t.rankFormula}</p>
        {rows === undefined ? <div className="grid h-32 place-items-center"><Loader2 className="animate-spin text-(--accent)" size={22} /></div>
          : !rows?.length ? <p className="py-10 text-center text-[13px] text-white/45">{rows === null ? t.offline : t.rankEmpty}</p>
          : <ol className="mt-3 space-y-1.5">
            {rows.map((row) => (
              <li key={`${row.rank ?? 'me'}-${row.nickname}`} className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${row.is_me ? 'border-(--accent)/50 bg-(--accent)/10' : 'border-white/10 bg-black/30'}`}>
                <span className={`w-6 text-center font-mono text-sm font-black ${row.rank && row.rank <= 3 ? 'text-[#ffc857]' : 'text-white/45'}`}>{row.rank ?? '–'}</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-sm">{row.nickname}{row.is_me && <span className="ml-1.5 rounded-sm bg-(--accent) px-1 text-[9px] text-(--accent-ink)">{t.rankMe}</span>}</b><span className="text-[10.5px] text-white/40">{t.rankBreak(row.avg, row.bonus)} · {t.rankGames(row.games, row.wins)}{!row.rank && ` · ${t.rankNeed(row.games, HW_RANK_MIN)}`}</span></span>
                <strong className="shrink-0 font-mono text-base font-black tabular-nums text-(--accent)">{t.rankScore(row.score)}</strong>
              </li>
            ))}
          </ol>}
      </div>
    </div>
  );
}
