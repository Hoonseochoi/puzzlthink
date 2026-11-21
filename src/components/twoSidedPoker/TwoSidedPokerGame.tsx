"use client";

import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Layers2, RotateCcw, SquareStack, Swords } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, DIAMOND, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL, accentVars, fog, seg } from '@/components/ui/gameUi';
import {
  TSP_AI_TARGET, TSP_BONUS, TSP_ROUNDS, type TspFace, type TspLevel, type TspLog, type TspState, applyTspAction, chooseTspAiAction, chooseTspAiFace,
  chooseTspFaces, newTspGame, startTspRound, tspActions, tspBackCandidates, tspPower,
} from '@/lib/twoSidedPoker';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, type TspCopy, tspCopy } from './copy';
import { ChipCount, TwoFaceCard, VisibilityTag } from './TwoSidedPokerParts';

const FACES: TspFace[] = ['front', 'back', 'both'];
const FACE_ICON = { front: SquareStack, back: SquareStack, both: Layers2 } as const;

function logLine(t: TspCopy, entry: TspLog) {
  const who = entry.side === 0 ? t.you : t.ai;
  const what = entry.kind === 'check' ? t.logCheck : entry.kind === 'call' ? t.logCall : entry.kind === 'fold' ? t.logFold : t.logRaise(entry.total);
  return `${who} ${what}`;
}

export default function TwoSidedPokerGame({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const [level, setLevel] = useState<TspLevel>('normal');
  // Only rendered after the player starts (#play), never on the server, so the deal can happen at init.
  const [state, setState] = useState<TspState | null>(() => newTspGame('normal'));
  const [selected, setSelected] = useState<TspFace>('front');
  const [aiPicking, setAiPicking] = useState(false);
  const [struck, setStruck] = useState<number[]>([]);

  // AI betting turn.
  useEffect(() => {
    if (!state || state.phase !== 'bet' || state.turn !== 1) return;
    const id = window.setTimeout(() => setState((s) => (s && s.phase === 'bet' && s.turn === 1 ? applyTspAction(s, 1, chooseTspAiAction(s, 1)) : s)), 850 + Math.random() * 600);
    return () => window.clearTimeout(id);
  }, [state]);

  const candidates = useMemo(() => (state ? tspBackCandidates(state.cards[1].front, state.cards[0]) : []), [state]);
  if (!state) return null;

  const reveal = state.phase === 'reveal' || state.phase === 'finished';
  const last = state.rounds.at(-1);
  const roundDone = reveal && last;
  const myBet = state.phase === 'bet' && state.turn === 0;
  const acts = tspActions(state, 0);
  const pot = state.bets[0] + state.bets[1] + state.carry;
  const lastLog = state.log.at(-1);

  const status = state.phase === 'finished'
    ? (state.winner === 0 ? t.status.gameWin : state.winner === 1 ? t.status.gameLose : t.status.gameDraw)
    : state.phase === 'reveal' && last ? (last.winner === 'draw' ? t.status.draw : last.winner === 0 ? t.status.win : t.status.lose)
      : state.phase === 'pick' ? (aiPicking ? t.status.aiPick : t.status.pick)
        : myBet ? t.status.myBet : t.status.aiBet;

  const lockFace = () => {
    if (state.phase !== 'pick' || aiPicking) return;
    setAiPicking(true);
    const face = selected;
    window.setTimeout(() => {
      setState((s) => (s && s.phase === 'pick' ? chooseTspFaces(s, [face, chooseTspAiFace(s, 1)]) : s));
      setAiPicking(false);
    }, 700);
  };
  const nextRound = () => { setStruck([]); setSelected('front'); setState((s) => (s ? startTspRound(s) : s)); };
  const newGame = () => { setStruck([]); setSelected('front'); setState(newTspGame(level)); };
  const act = (action: Parameters<typeof applyTspAction>[2]) => setState((s) => (s ? applyTspAction(s, 0, action) : s));

  const raiseTargets = acts.canRaise
    ? [...new Set([acts.minRaise, acts.minRaise + 2, acts.minRaise + 5].filter((n) => n < acts.max))].slice(0, 3)
    : [];
  const myFace = state.faces[0];
  const aiFace = state.faces[1];
  const shownFaces = state.phase !== 'pick';

  const faceBadge = (face: TspFace | null, mine: boolean) => (
    <span className={`rounded-md border px-2 py-1 text-[10px] font-black tracking-wide ${face && shownFaces
      ? face === 'both' ? 'border-(--accent) bg-(--accent) text-(--accent-ink)' : 'border-(--accent)/50 bg-(--accent)/15 text-(--accent)'
      : 'border-white/10 bg-white/[0.03] text-white/40'}`}>
      {face && shownFaces ? t.choseFace(mine ? t.you : t.ai, t.face[face]) : t.undecided}
    </span>
  );

  return (
    <div className={SHELL} style={{ ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) }}>
      <GameHeader backHref="/two-sided-poker" backLabel={t.back} title={t.title} subtitle={t.subtitle}><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div><p className={KICKER}>{t.round(state.round, TSP_ROUNDS)}</p><h1 className={`mt-1 ${HEADING}`}>{status}</h1></div>
            <div className="flex gap-1">{Array.from({ length: TSP_ROUNDS }, (_, i) => {
              const r = state.rounds[i];
              return <i key={i} className={`h-2 w-2 rotate-45 rounded-[2px] sm:h-2.5 sm:w-2.5 ${r ? r.winner === 0 ? 'bg-(--accent) shadow-[0_0_8px_var(--accent-glow)]' : r.winner === 1 ? 'bg-[#ff8a5c]' : 'bg-white/40' : i === state.round - 1 ? 'border border-(--accent)' : 'bg-white/10'}`} />;
            })}</div>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden rounded-[12px] border border-(--accent)/20 bg-[radial-gradient(ellipse_at_center,#221b43,#0d0b18_75%)] p-3 shadow-[inset_0_0_80px_rgba(0,0,0,.6)] sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1.2px)', backgroundSize: '18px 18px' }} />

            {/* AI */}
            <div className="relative flex flex-col items-center gap-2.5">
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff8a5c]/15 text-[10px] font-black text-[#ff8a5c]">AI</span><ChipCount count={state.chips[1]} tone="ai" /></span>
                {faceBadge(aiFace, false)}
              </div>
              <TwoFaceCard card={state.cards[1]} showBack={reveal} chosen={shownFaces ? aiFace : null} dimUnchosen={reveal} revealKey={reveal ? `ai-${state.round}` : undefined} />
              <div className="flex gap-1.5"><VisibilityTag mine={false} label={t.publicTag} /><VisibilityTag mine={false} label={reveal ? t.publicTag : t.hiddenTag} /></div>
            </div>

            {/* Pot */}
            <div className="relative my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:my-4">
              <span className="h-px bg-gradient-to-r from-transparent to-white/15" />
              <div className="min-w-[112px] text-center">
                <p className="text-[9px] font-black tracking-[.24em] text-white/35">{t.pot}</p>
                <p className="font-mono text-3xl font-black text-(--accent) drop-shadow-[0_0_14px_var(--accent-glow)]">{pot}</p>
                <p className="font-mono text-[10px] text-white/35">{state.bets[0]} : {state.bets[1]}{state.carry > 0 && <span className="ml-1.5 text-(--accent)/70">{t.carry(state.carry)}</span>}</p>
              </div>
              <span className="h-px bg-gradient-to-l from-transparent to-white/15" />
            </div>
            {lastLog && !roundDone && <p className="relative -mt-1 mb-3 text-center text-[11px] font-bold text-white/45">{logLine(t, lastLog)}</p>}
            {roundDone && <RoundResult t={t} state={state} />}

            {/* Me */}
            <div className="relative flex flex-col items-center gap-2.5">
              <div className="flex gap-1.5"><VisibilityTag mine label={t.publicTag} /><VisibilityTag mine label={t.privateTag} /></div>
              <TwoFaceCard card={state.cards[0]} showBack chosen={state.phase === 'pick' ? selected : myFace} size="lg" dimUnchosen={reveal} />
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-(--accent)/15 text-[10px] font-black text-(--accent)">{t.you}</span><ChipCount count={state.chips[0]} tone="me" /></span>
                {faceBadge(myFace, true)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3">
            {state.phase === 'pick' && (
              <div className={`${WELL} p-2.5 sm:p-3`}>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {FACES.map((face) => {
                    const Icon = FACE_ICON[face];
                    const on = selected === face;
                    return (
                      <button key={face} type="button" aria-pressed={on} disabled={aiPicking} onClick={() => setSelected(face)}
                        className={`rounded-md border p-2.5 text-left transition sm:p-3 ${on ? 'border-(--accent) bg-(--accent)/15 shadow-[inset_0_0_18px_var(--accent-soft)]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                        <span className="flex items-center justify-between"><span className={`flex items-center gap-1.5 text-sm font-black ${on ? 'text-white' : 'text-white/70'}`}><Icon size={14} className={face === 'back' ? 'rotate-180' : ''} />{t.face[face]}</span><b className={`font-mono text-lg font-black ${on ? 'text-(--accent)' : 'text-white/45'}`}>{tspPower(state.cards[0], face)}</b></span>
                        <span className="mt-1 block text-[10px] leading-4 text-white/40">{t.faceHint[face]}</span>
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={lockFace} disabled={aiPicking} className={`${BTN_ACCENT} mt-2.5 w-full py-3 text-sm`}><Swords size={15} />{t.lockFace} · {t.face[selected]}</button>
              </div>
            )}
            {state.phase === 'bet' && (
              <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${myBet ? '' : 'pointer-events-none opacity-40'}`}>
                {acts.canCheck
                  ? <button type="button" onClick={() => act({ t: 'check' })} className={`${BTN_ACCENT} py-3 text-sm`}>{t.check}</button>
                  : <button type="button" onClick={() => act({ t: 'call' })} className={`${BTN_ACCENT} py-3 text-sm`}>{t.call(acts.toCall)}</button>}
                {raiseTargets.map((n) => <button key={n} type="button" onClick={() => act({ t: 'raise', total: n })} className={`${BTN} py-3 text-sm`}>{t.raise(n)}</button>)}
                {acts.canRaise && <button type="button" onClick={() => act({ t: 'raise', total: acts.max })} className={`${BTN} border-(--accent)/40 py-3 text-sm text-(--accent)`}>{t.allIn(acts.max)}</button>}
                {!acts.canCheck && <button type="button" onClick={() => act({ t: 'fold' })} className={`${BTN} py-3 text-sm text-[#ff9aa4]`}>{t.fold}</button>}
              </div>
            )}
            {state.phase === 'reveal' && <button type="button" onClick={nextRound} className={`${BTN_ACCENT} w-full py-3 text-sm`}>{t.next}</button>}
            {state.phase === 'finished' && <button type="button" onClick={newGame} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t.again}</button>}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          {!reveal && (
            <section className={PANEL}>
              <p className={`flex items-center gap-1.5 ${PANEL_TITLE}`}><BrainCircuit size={12} className="text-(--accent)" />{t.deduction}</p>
              <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t.deductionDesc(state.cards[1].front)}</p>
              <p className="mt-3 text-[9px] font-black tracking-[.16em] text-white/30">{t.candidates}</p>
              <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                {candidates.map((n) => {
                  const off = struck.includes(n);
                  return <button key={n} type="button" aria-pressed={off} onClick={() => setStruck((old) => (old.includes(n) ? old.filter((v) => v !== n) : [...old, n]))}
                    className={`aspect-square rounded-md border font-mono text-base font-black transition ${off ? 'border-white/5 bg-black/30 text-white/15 line-through' : 'border-(--accent)/40 bg-(--accent)/10 text-(--accent) hover:-translate-y-0.5'}`}>{n}</button>;
                })}
              </div>
            </section>
          )}
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t.difficulty}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as TspLevel[]).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)}`}>{t.levels[l]}<span className="mt-0.5 block text-[9px] opacity-55">~{TSP_AI_TARGET[l]}%</span></button>)}</div>
            <p className="mt-2 text-[10px] leading-4 text-white/40">{level !== state.level ? `${t.levelLocked} · ` : ''}{t.targetNote}</p>
          </section>
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t.history}</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {state.rounds.length === 0 && <p className="text-xs text-white/35">{t.noHistory}</p>}
              {state.rounds.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-white/[.06] bg-black/25 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-white/35">R{i + 1}</span>
                  <span className="font-bold text-white/70">{t.face[r.faces[0]]} <b className="font-mono text-white">{tspPower(r.cards[0], r.faces[0])}</b> <span className="text-white/30">vs</span> <b className="font-mono text-white">{tspPower(r.cards[1], r.faces[1])}</b> {t.face[r.faces[1]]}</span>
                  <span className={`font-mono font-black ${r.delta[0] > 0 ? 'text-(--accent)' : r.delta[0] < 0 ? 'text-[#ff8a5c]' : 'text-white/40'}`}>{r.delta[0] > 0 ? '+' : ''}{r.delta[0]}</span>
                </div>
              ))}
            </div>
          </section>
          <section className={NOTE}>
            <p className={PANEL_TITLE}>{t.rules}</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{t.ruleLines.map((line) => <li key={line} className="flex gap-2.5"><i className={DIAMOND} /><span className="break-keep">{line}</span></li>)}</ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

function RoundResult({ t, state }: { t: TspCopy; state: TspState }) {
  const r = state.rounds.at(-1)!;
  const mine = r.delta[0];
  const p0 = tspPower(r.cards[0], r.faces[0]);
  const p1 = tspPower(r.cards[1], r.faces[1]);
  return (
    <div className="relative mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-center">
      {r.reason === 'fold'
        ? <span className="text-xs font-bold text-white/60">{r.winner === 0 ? t.foldWin : `${t.you} ${t.logFold}`}</span>
        : <span className="font-mono text-sm font-black text-white">{p0} <span className="text-white/30">vs</span> {p1}</span>}
      <span className={`font-mono text-lg font-black ${mine > 0 ? 'text-(--accent)' : mine < 0 ? 'text-[#ff8a5c]' : 'text-white/50'}`}>{mine > 0 ? '+' : ''}{mine}</span>
      {r.bonus > 0 && <span className="rounded-md bg-(--accent)/15 px-1.5 py-0.5 text-[10px] font-black text-(--accent)">{t.bonus(r.bonus)} (±{TSP_BONUS})</span>}
    </div>
  );
}
