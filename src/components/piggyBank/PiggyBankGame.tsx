"use client";

import { useEffect, useRef, useState } from 'react';
import { Crown, Eye, Hand, RotateCcw, Send } from 'lucide-react';
import GameHeader from '@/components/ui/GameHeader';
import { CoinCount, CoinDot, GoldPig, Pedestal, TimerRing } from './PiggyParts';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import {
  type Color, type Memory, type PbEvent, type PbLevel, type PbState, ANSWER_MS, DOUBT_MS, PB_MAX_PUT, PUT_MS, PB_WIN, RESET_VOTES,
  aiAllIn, aiAnswer, aiDoubts, aiPut, allInGuess, answerCount, finishReset, answerTimeout, createPiggyBank, doubt, freshMemory, noDoubt, putCoins, ranking, remember, voteReset,
} from '@/lib/piggyBank';

// Draft (not linked from the site yet): 돼지 저금통 against three AI players. Korean text only for now.
const ACCENT = '#ffd84a';
const ME = 0;
const NAMES = ['나', '토끼', '곰', '여우'];
const COLOR_KO: Record<Color, string> = { black: '흑', white: '백' };
// How long an announcement stays up (there is no log: it's a memory game). Coin drops a little longer.
const SHOW_MS = 4200;
const PUT_SHOW_MS = 6000;
const HOLD_DOUBT_MS = 3800; // the opened pig stays up this long
const HOLD_ALLIN_MS = 4500;
const HOLD_RESET_MS = 1800;

function describe(e: PbEvent | null, s: PbState) {
  if (!e) return null;
  const name = (i: number) => s.players[i].name;
  const pigLabel = (id: number) => s.pigs[id]?.label;
  switch (e.k) {
    case 'put': return <>{name(e.seat)} → <b>#{pigLabel(e.pig)}</b>에 <CoinCount color="black" n={e.black} /> <CoinCount color="white" n={e.white} /> 넣고 <b>{name(e.to)}</b>에게 전달</>;
    case 'answer': return <><b>{name(e.seat)}</b>: “#{pigLabel(e.pig)} 속 {COLOR_KO[e.color]} 동전은 <b>{e.value}개</b>”</>;
    case 'doubt': return <><b>{name(e.seat)}</b>의 의심 → 열어 보니 <CoinCount color="black" n={e.pigBlack} /> <CoinCount color="white" n={e.pigWhite} /> · {e.right ? <b className="text-[#3ddc97]">의심 성공! {name(e.seat)} +1, {name(e.target)} −1</b> : <b className="text-[#ff8b96]">의심 실패… {name(e.seat)} −1</b>}</>;
    case 'pass': return <>아무도 의심하지 않았어요. {name(e.seat)}의 차례</>;
    case 'allIn': return <><b>{name(e.seat)}</b>의 전체 맞히기 {e.right ? <b className="text-[#3ddc97]">성공! +3</b> : <b className="text-[#ff8b96]">실패 −2</b>}</>;
    case 'reset': return <>리셋! 모든 저금통이 흑1·백1로 돌아갔어요</>;
  }
}

export default function PiggyBankGame() {
  const [level, setLevel] = useState<PbLevel>('normal');
  const [state, setState] = useState<PbState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [shownSeq, setShownSeq] = useState(-1);
  const [shownAt, setShownAt] = useState(0);
  const [black, setBlack] = useState(1);
  const [white, setWhite] = useState(0);
  const [allIn, setAllIn] = useState<Record<number, { black: number; white: number }>>({});
  const [small, setSmall] = useState(false); // phones: smaller boxes around the table
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setSmall(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  const stateRef = useRef<PbState | null>(null);
  const memRef = useRef<Memory[]>([]);
  const dueRef = useRef<{ seq: number; at: number; doubtAt: number[] }>({ seq: -1, at: 0, doubtAt: [] });
  const holdRef = useRef(0); // play pauses until then while a pig is opened or a challenge is shown
  const [holdUntil, setHoldUntil] = useState(0); // the same, for rendering

  const start = () => {
    const s = createPiggyBank(NAMES, [false, true, true, true]);
    stateRef.current = s; memRef.current = s.players.map(() => freshMemory(s));
    dueRef.current = { seq: -1, at: 0, doubtAt: [] };
    holdRef.current = 0; setHoldUntil(0); setAllIn({});
    setState(s); setShownSeq(-1);
  };
  const apply = (next: PbState | null) => { if (next) { stateRef.current = next; setState(next); } };

  // One clock drives the AI players and the time limits.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      const s = stateRef.current;
      if (!s) return;
      const due = dueRef.current;
      if (due.seq !== s.seq) {
        // New public event: every AI updates its memory, maybe votes to reset, and picks when to act.
        memRef.current = memRef.current.map((m, i) => (s.players[i].ai ? remember(m, s, level) : m));
        due.seq = s.seq;
        const hold = s.last?.k === 'doubt' ? HOLD_DOUBT_MS : s.last?.k === 'allIn' ? HOLD_ALLIN_MS : s.last?.k === 'reset' ? HOLD_RESET_MS : 0;
        if (hold) {
          holdRef.current = t + hold;
          setHoldUntil(t + hold);
          if (s.phase !== 'finished') apply({ ...s, deadline: s.deadline + hold }); // the reveal doesn't eat into the next player's time
        }
        const base = Math.max(t, holdRef.current);
        due.at = base + 1200 + Math.random() * 1600;
        due.doubtAt = s.players.map(() => base + 700 + Math.random() * 3300); // within the 5-second window
        if (s.last?.k === 'put') {
          for (let i = 1; i < s.players.length; i += 1) {
            const unsure = Object.values(memRef.current[i]).reduce((a, m) => a + m.unsure, 0);
            if (unsure >= 4 && Math.random() < 0.25 && !s.players[i].resetVote) { apply(voteReset(stateRef.current!, i)); return; }
          }
        }
      }
      if (s.phase === 'finished' || t < holdRef.current) return; // the last pig can still be shown opening
      const turnAi = s.players[s.turn].ai;
      if (s.phase === 'put') {
        if (turnAi && t >= due.at) { const m = aiPut(s, s.turn); apply(putCoins(s, s.turn, m.black, m.white, m.to)); }
        else if (!turnAi && t >= s.deadline) { const m = aiPut(s, s.turn); apply(putCoins(s, s.turn, m.black, m.white, m.to)); }
      } else if (s.phase === 'answer') {
        if (turnAi && t >= due.at) apply(answerCount(s, s.turn, aiAnswer(s, s.turn, memRef.current[s.turn])));
        else if (!turnAi && t >= s.deadline) apply(answerTimeout(s));
      } else if (s.phase === 'doubt') {
        const a = s.answer!;
        for (let i = 1; i < s.players.length; i += 1) {
          if (i !== a.seat && t >= due.doubtAt[i] && due.doubtAt[i] > 0) {
            due.doubtAt[i] = 0; // decide once
            if (aiDoubts(s, memRef.current[i])) { apply(doubt(s, i)); return; }
          }
        }
        if (t >= s.deadline) apply(noDoubt(s));
      } else if (s.phase === 'allIn') {
        if (!s.allInSeats.length) { apply(finishReset(s)); return; }
        const seat = s.allInSeats.find((i) => s.players[i].ai);
        if (seat !== undefined && t >= due.at) apply(allInGuess(s, seat, aiAllIn(s, memRef.current[seat])));
        else if (seat === undefined && s.allInSeats.includes(ME) && t >= s.deadline) apply(allInGuess(s, ME, null)); // ran out of time: no challenge
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [level]);

  // Show each announcement for a few seconds.
  useEffect(() => {
    if (!state || state.seq === shownSeq) return;
    const id = window.setTimeout(() => { setShownSeq(state.seq); setShownAt(Date.now()); }, 0);
    return () => window.clearTimeout(id);
  }, [state, shownSeq]);

  if (!state) {
    return (
      <div className={SHELL} style={{ ...accentVars(ACCENT, '#2a1d00'), backgroundImage: fog('90, 110, 210') }}>
        <GameHeader backHref="/" backLabel="PUZZLTHINK" title="돼지 저금통" subtitle="DRAFT · 4인" />
        <main className="relative z-10 mx-auto max-w-lg px-5 py-14 text-center">
          <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((n) => <GoldPig key={n} label={n} size={52} />)}</div>
          <h1 className="mt-6 text-3xl font-black">돼지 저금통 (초안)</h1>
          <p className="mt-3 break-keep text-sm leading-6 text-white/60">저금통에 넣은 동전을 기억해서 점수를 얻는 게임이에요. 넣은 동전은 잠깐 공개되고 사라지니, 잘 기억하세요. 5점을 먼저 얻으면 끝나요.</p>
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-1.5">
            {(['easy', 'normal', 'hard'] as PbLevel[]).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)}`}>{{ easy: 'AI 쉬움', normal: 'AI 보통', hard: 'AI 어려움' }[l]}</button>)}
          </div>
          <button type="button" onClick={start} className={`${BTN_ACCENT} mt-6 px-8 py-3.5 text-sm`}>게임 시작 (나 + AI 3명)</button>
        </main>
      </div>
    );
  }

  const s = state;
  const me = s.players[ME];
  const secs = Math.max(0, Math.ceil((s.deadline - now) / 1000));
  const event = shownSeq === s.seq && now - shownAt < (s.last?.k === 'put' ? PUT_SHOW_MS : SHOW_MS) ? s.last : null;
  const myPut = s.phase === 'put' && s.turn === ME;
  const myAnswer = s.phase === 'answer' && s.turn === ME;
  const canDoubt = s.phase === 'doubt' && s.answer?.seat !== ME;
  const myAllIn = s.phase === 'allIn' && s.allInSeats.includes(ME);
  const votes = s.players.filter((p) => p.resetVote).length;
  // Score pop-ups on the seats while a reveal is up.
  const revealing = now < holdUntil;
  const delta: Record<number, number> = {};
  if (revealing && s.last?.k === 'doubt') { delta[s.last.seat] = s.last.right ? 1 : -1; if (s.last.right) delta[s.last.target] = -1; }
  if (revealing && s.last?.k === 'allIn') delta[s.last.seat] = s.last.right ? 3 : -2;
  const askPig = s.players[s.turn].upper;
  const status = s.phase === 'finished' ? '게임 종료'
    : s.phase === 'allIn' ? '리셋 직전 — 전체 맞히기 도전'
      : s.phase === 'put' ? (myPut ? '아래칸 저금통에 동전을 넣고 전달할 사람을 고르세요' : `${s.players[s.turn].name}이(가) 동전을 넣는 중…`)
        : s.phase === 'answer' ? (myAnswer ? `#${askPig ? s.pigs[askPig].label : ''} 저금통 속 ${COLOR_KO[s.ask]} 동전은 몇 개?` : `${s.players[s.turn].name}이(가) 대답하는 중…`)
          : s.answer!.seat === ME ? '다른 사람들이 의심할지 기다리는 중…' : `${s.players[s.answer!.seat].name}의 대답 — 의심할까요?`;

  const putTotal = black + white;
  const step = (which: Color, d: number) => {
    const b = which === 'black' ? Math.max(0, black + d) : black;
    const w = which === 'white' ? Math.max(0, white + d) : white;
    if (b + w > PB_MAX_PUT) return;
    setBlack(b); setWhite(w);
  };

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#2a1d00'), backgroundImage: fog('90, 110, 210') }}>
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title="돼지 저금통" subtitle="DRAFT · 4인">
        <button type="button" onClick={start} className={BTN_ACCENT}><RotateCcw size={14} />새 게임</button>
      </GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 px-1">
            <p className={KICKER}>{s.phase === 'finished' ? 'RESULT' : `다음 질문 · ${COLOR_KO[s.ask]}`}</p>
            <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
          </div>

          {/* The table: four players around it (me at the bottom), the clock in the middle. */}
          <div className="relative mx-auto grid w-full max-w-[680px] grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-y-1 overflow-hidden rounded-[22px] border border-white/10 px-1 py-3 sm:gap-y-2 sm:p-5"
            style={{ background: 'radial-gradient(ellipse at 50% 45%, #4a5278 0%, #2b3150 50%, #181b2e 100%)' }}>
            <div className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #fff 0 1px, transparent 2px)', backgroundSize: '38px 38px, 53px 53px' }} />
            {[{ seat: 2, cls: 'col-start-2 row-start-1' }, { seat: 1, cls: 'col-start-1 row-start-2' }, { seat: 3, cls: 'col-start-3 row-start-2' }, { seat: ME, cls: 'col-start-2 row-start-3' }].map(({ seat, cls }) => {
              const p = s.players[seat];
              const speaking = s.answer?.seat === seat && s.phase === 'doubt';
              const buzz = !!event && event.k === 'doubt' && event.seat === seat;
              const active = s.turn === seat && s.phase !== 'finished';
              return (
                <div key={seat} className={`relative flex flex-col items-center ${cls}`}>
                  <div className={`mb-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${active ? 'bg-[#ffd84a] text-[#2a1d00]' : 'bg-black/40 text-white/80'}`}>
                    {active && <span className="rounded-full bg-[#ff3b5c] px-1.5 text-[9px] text-white">차례</span>}
                    <span className="max-w-[72px] truncate">{p.name}</span>
                    <span className="font-mono">{p.score}점</span>
                    {p.resetVote && <RotateCcw size={10} />}
                  </div>
                  {speaking && (
                    <span key={s.seq} className="bw-result absolute -top-1 right-0 z-10 translate-x-1/3 rounded-lg bg-[#efe9ff] px-2 py-1 text-xs font-black text-[#2b2f4a] shadow-lg sm:text-sm">
                      {COLOR_KO[s.answer!.color]}{s.answer!.value}
                    </span>
                  )}
                  {delta[seat] ? <span key={`d${s.seq}`} className={`bw-result absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-sm font-black ${delta[seat] > 0 ? 'bg-[#3ddc97] text-[#06291a]' : 'bg-[#ff3b5c] text-white'}`}>{delta[seat] > 0 ? `+${delta[seat]}` : delta[seat]}</span> : null}
                  <Pedestal small={small} active={active} buzz={buzz} resetVoted={p.resetVote}
                    onReset={seat === ME && s.phase !== 'finished' && s.phase !== 'allIn' ? () => apply(voteReset(s, ME)) : undefined}
                    onBuzz={seat === ME && canDoubt && !revealing ? () => apply(doubt(s, ME)) : undefined}
                    upper={p.upper !== null ? s.pigs[p.upper].label : null} lower={p.lower !== null ? s.pigs[p.lower].label : null} />
                </div>
              );
            })}
            <div className="relative col-start-2 row-start-2 flex items-center justify-center px-1 pb-4">
              {s.phase === 'finished' ? <Crown size={40} className="text-[#ffd84a]" />
                : <TimerRing secs={secs} total={(s.phase === 'put' ? PUT_MS : s.phase === 'doubt' ? DOUBT_MS : ANSWER_MS) / 1000} color={s.ask}
                  label={s.phase === 'doubt' ? '의심?' : s.phase === 'answer' ? `${COLOR_KO[s.ask]}?` : s.phase === 'allIn' ? '도전' : '넣기'} />}
              {votes > 0 && s.phase !== 'finished' && <span className="absolute bottom-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-[#1d2036]">리셋 {votes}/{RESET_VOTES}</span>}
            </div>
          </div>

          {/* The latest announcement, only for a few seconds. */}
          <div className="mt-3 flex min-h-[52px] items-center justify-center rounded-[12px] border border-white/10 bg-black/40 px-3 py-2 text-center text-sm">
            {event ? <span key={s.seq} className="bw-result break-keep">{describe(event, s)}</span> : <span className="text-xs text-white/30">공개된 정보는 잠깐만 보여요. 잘 기억하세요!</span>}
          </div>

          {/* Actions */}
          <div className="mt-3 rounded-[14px] border border-white/10 bg-black/30 p-3 sm:p-4">
            {s.phase === 'finished' ? (
              <div className="text-center">
                <p className={PANEL_TITLE}>최종 순위</p>
                <ol className="mt-3 space-y-1.5">{ranking(s).map((seat, r) => (
                  <li key={seat} className="flex items-center gap-3 rounded-lg bg-white/[.04] px-3 py-2 text-sm">
                    <span className="w-6 font-mono font-black">{r + 1}</span><span className="flex-1 text-left font-bold">{s.players[seat].name}</span>
                    <span className="font-mono">{s.players[seat].score}점</span>
                  </li>))}
                </ol>
                <button type="button" onClick={start} className={`${BTN_ACCENT} mt-4 w-full py-3`}>다시 하기</button>
              </div>
            ) : myPut ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-6">
                  {(['black', 'white'] as Color[]).map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <button type="button" onClick={() => step(c, -1)} className={`${BTN} h-9 w-9 !p-0`}>−</button>
                      <CoinCount color={c} n={c === 'black' ? black : white} />
                      <button type="button" onClick={() => step(c, 1)} className={`${BTN} h-9 w-9 !p-0`}>+</button>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[11px] text-white/45">아래칸 #{me.lower ? s.pigs[me.lower].label : ''}에 넣어요 · 1~{PB_MAX_PUT}개 (지금 {putTotal}개)</p>
                <div className="grid grid-cols-3 gap-2">
                  {s.players.map((p, i) => i === ME ? null : (
                    <button key={i} type="button" disabled={putTotal < 1} onClick={() => apply(putCoins(s, ME, black, white, i))} className={`${BTN_ACCENT} py-3 disabled:opacity-40`}><Send size={13} />{p.name}에게</button>
                  ))}
                </div>
              </div>
            ) : myAnswer ? (
              <div>
                <p className="text-center text-sm font-black">#{askPig ? s.pigs[askPig].label : ''} 속 {COLOR_KO[s.ask]} 동전 개수</p>
                <div className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                  {Array.from({ length: 24 }, (_, n) => <button key={n} type="button" onClick={() => apply(answerCount(s, ME, n))} className={`${BTN} py-2.5 font-mono`}>{n}</button>)}
                </div>
                <p className="mt-2 text-center text-[10px] text-white/40">{ANSWER_MS / 1000}초 안에 대답하지 않으면 0개로 처리돼요</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="min-h-5 text-sm">{s.phase === 'doubt' && s.answer ? <>{s.players[s.answer.seat].name}: “#{s.pigs[s.answer.pig]?.label} 속 {COLOR_KO[s.answer.color]} {s.answer.value}개”</> : <span className="text-xs text-white/45">공개되는 숫자를 기억하세요. 대답이 나오면 5초 동안 의심할 수 있어요.</span>}</p>
                <button type="button" disabled={!canDoubt || revealing} onClick={() => apply(doubt(s, ME))}
                  className={`mt-3 inline-flex items-center gap-2 rounded-md px-8 py-3.5 text-base font-black transition ${canDoubt && !revealing ? 'bg-[#ff4d6d] text-white shadow-[0_0_24px_rgba(255,77,109,.55)] hover:brightness-110' : 'cursor-not-allowed bg-white/[.06] text-white/30'}`}>
                  <Hand size={18} />의심!{canDoubt && !revealing ? ` ${secs}` : ''}
                </button>
                <p className="mt-2 text-[10px] text-white/40">{canDoubt ? '성공 +1 / 실패 −1' : s.phase === 'doubt' ? '내 대답은 의심할 수 없어요' : '대답 직후 5초 동안만 눌러요'}</p>
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>리셋</p>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{RESET_VOTES}명이 누르면 모든 저금통이 흑1·백1로 돌아가요. 누르지 않은 사람은 그 직전에 전체 맞히기에 도전할 수 있어요.</p>
            <button type="button" disabled={me.resetVote || s.phase === 'finished' || s.phase === 'allIn'} onClick={() => apply(voteReset(s, ME))} className={`${BTN} mt-3 w-full py-2.5 disabled:opacity-40`}><RotateCcw size={13} />리셋 투표 ({votes}/{RESET_VOTES})</button>
          </section>
          <section className={PANEL}>
            <p className={PANEL_TITLE}>규칙 요약</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">
              {[
                '내 차례: 아래칸 저금통에 동전 1~5개(흑·백)를 넣고, 넣은 개수를 말한 뒤 원하는 사람에게 전달해요.',
                '전달하면 내 위칸 저금통이 아래칸으로 내려와요.',
                '받은 사람은 20초 안에 받은 저금통 속 지정 색(흑→백→흑…) 동전 개수를 말해요.',
                '대답 직후 5초 동안만 의심 버튼이 켜져요. 의심하면 열어서 확인: 대답이 틀렸으면 의심한 사람 +1·대답한 사람 −1, 맞았으면 의심한 사람 −1.',
                '연 저금통은 빠지고, 감점된 사람이 새 저금통(흑1·백1)을 받아 차례를 이어가요.',
                `누군가 ${PB_WIN}점이 되면 끝나고, 점수 순으로 순위가 정해져요.`,
              ].map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{r}</span></li>)}
            </ul>
          </section>
          <section className={PANEL}>
            <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><Eye size={11} />초안 메모</p>
            <p className="mt-2 break-keep text-[11px] leading-5 text-white/45">방송을 보기 전, 룰 텍스트만으로 만든 초안이에요. 대답 시간 초과는 0개로, 위칸·아래칸 이동은 위 규칙대로 해석했어요.</p>
          </section>
        </aside>
      </main>

      {/* A doubted pig is opened in the middle of the table. */}
      {revealing && s.last?.k === 'doubt' && (() => {
        const e = s.last;
        return (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
            <div className="hall-pop w-full max-w-sm rounded-[22px] border border-[#ffd84a]/40 bg-gradient-to-b from-[#2b3150] to-[#151829] p-6 text-center shadow-[0_0_80px_rgba(255,216,74,.25)]">
              <p className="text-[10px] font-black tracking-[0.3em] text-[#ffd84a]">OPEN</p>
              <h2 className="mt-1 text-xl font-black">#{e.label} 저금통 개봉!</h2>
              <div className="mt-3 flex justify-center"><GoldPig label={e.label} size={110} glow /></div>
              <div className="mt-3 space-y-2">
                {(['black', 'white'] as Color[]).map((c) => {
                  const n = c === 'black' ? e.pigBlack : e.pigWhite;
                  return (
                    <div key={c} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${c === e.color ? 'bg-white/10 ring-1 ring-[#ffd84a]/60' : 'bg-white/[.04]'}`}>
                      <span className="w-6 text-xs font-black">{COLOR_KO[c]}</span>
                      <span className="flex flex-1 flex-wrap gap-1">{Array.from({ length: n }, (_, i) => <CoinDot key={i} color={c} size={16} />)}</span>
                      <span className="font-mono text-lg font-black">{n}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-white/70">{s.players[e.target].name}의 대답: <b className="text-white">{COLOR_KO[e.color]} {e.value}개</b></p>
              <p className={`mt-2 text-lg font-black ${e.right ? 'text-[#3ddc97]' : 'text-[#ff8b96]'}`}>
                {e.right ? `의심 성공! ${s.players[e.seat].name} +1 · ${s.players[e.target].name} −1` : `의심 실패… ${s.players[e.seat].name} −1`}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Before a reset: players who did not vote may name every pig's coins. */}
      {myAllIn && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4">
          <div className="hall-pop max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[22px] border border-white/10 bg-[#1b1e33] p-5 sm:rounded-[22px]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-[0.3em] text-[#ffd84a]">ALL-IN CHALLENGE</p>
              <span className="rounded-md bg-black/40 px-2 py-1 font-mono text-sm font-black">{secs}s</span>
            </div>
            <h2 className="mt-1 text-xl font-black">리셋 직전! 전체 맞히기 도전</h2>
            <p className="mt-1 break-keep text-xs leading-5 text-white/60">모든 저금통의 흑·백 개수를 전부 맞히면 <b className="text-[#3ddc97]">+3점</b>, 하나라도 틀리면 <b className="text-[#ff8b96]">−2점</b>이에요. 도전하지 않아도 돼요.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.values(s.pigs).sort((a, b) => a.label - b.label).map((pig) => (
                <div key={pig.id} className="flex items-center gap-2 rounded-xl bg-white/[.05] p-2">
                  <GoldPig label={pig.label} size={44} />
                  {(['black', 'white'] as Color[]).map((c) => {
                    const v = allIn[pig.id]?.[c] ?? 1;
                    const set = (n: number) => setAllIn((g) => ({ ...g, [pig.id]: { black: g[pig.id]?.black ?? 1, white: g[pig.id]?.white ?? 1, [c]: Math.max(0, n) } }));
                    return (
                      <div key={c} className="flex flex-1 items-center justify-center gap-1">
                        <button type="button" onClick={() => set(v - 1)} className="h-7 w-7 rounded-md bg-white/10 text-sm font-black">−</button>
                        <span className="flex w-9 items-center justify-center gap-1 font-mono font-black"><CoinDot color={c} size={11} />{v}</span>
                        <button type="button" onClick={() => set(v + 1)} className="h-7 w-7 rounded-md bg-white/10 text-sm font-black">+</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => apply(allInGuess(s, ME, null))} className={`${BTN} py-3`}>도전 안 함</button>
              <button type="button" onClick={() => apply(allInGuess(s, ME, Object.fromEntries(Object.values(s.pigs).map((p) => [p.id, { black: allIn[p.id]?.black ?? 1, white: allIn[p.id]?.white ?? 1 }]))))} className={`${BTN_ACCENT} py-3`}>도전하기</button>
            </div>
          </div>
        </div>
      )}
      {s.phase === 'allIn' && s.allInSeats.length > 0 && !myAllIn && !revealing && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="hall-pop rounded-full border border-white/15 bg-[#1b1e33]/95 px-4 py-2 text-sm font-black">리셋 직전 · {s.allInSeats.map((i) => s.players[i].name).join(', ')} 전체 맞히기 고민 중…</div>
        </div>
      )}

      {/* All-in result: every pig opened. */}
      {revealing && s.last?.k === 'allIn' && (() => {
        const e = s.last;
        return (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="hall-pop w-full max-w-md rounded-[22px] border border-white/10 bg-gradient-to-b from-[#2b3150] to-[#151829] p-6 text-center">
              <p className="text-[10px] font-black tracking-[0.3em] text-[#ffd84a]">ALL-IN</p>
              <h2 className={`mt-1 text-2xl font-black ${e.right ? 'text-[#3ddc97]' : 'text-[#ff8b96]'}`}>{s.players[e.seat].name} {e.right ? '전체 맞히기 성공! +3' : '전체 맞히기 실패 −2'}</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {e.pigs.map((pig) => (
                  <div key={pig.label} className="rounded-xl bg-white/[.05] p-2">
                    <div className="flex justify-center"><GoldPig label={pig.label} size={44} /></div>
                    <p className="mt-1 flex justify-center gap-2 text-xs"><CoinCount color="black" n={pig.black} /><CoinCount color="white" n={pig.white} /></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {revealing && s.last?.k === 'reset' && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="hall-pop rounded-[22px] border border-white/20 bg-[#1b1e33]/95 px-8 py-6 text-center shadow-2xl">
            <RotateCcw size={30} className="mx-auto text-white" />
            <p className="mt-2 text-2xl font-black">리셋!</p>
            <p className="mt-1 text-xs text-white/60">모든 저금통이 흑1·백1로 돌아갔어요</p>
          </div>
        </div>
      )}

      {/* Game over */}
      {s.phase === 'finished' && !revealing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="hall-pop w-full max-w-sm rounded-[24px] border border-[#ffd84a]/40 bg-gradient-to-b from-[#2b3150] to-[#151829] p-6 text-center shadow-[0_0_100px_rgba(255,216,74,.25)]">
            <Crown size={34} className="mx-auto text-[#ffd84a]" />
            <h2 className="mt-2 text-2xl font-black">{ranking(s)[0] === ME ? '1위!' : `${ranking(s).indexOf(ME) + 1}위`}</h2>
            <ol className="mt-4 space-y-1.5">{ranking(s).map((seat, r) => (
              <li key={seat} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${seat === ME ? 'bg-[#ffd84a] text-[#2a1d00]' : 'bg-white/[.06]'}`}>
                <span className="w-9 font-mono font-black">{r + 1}위</span><span className="flex-1 text-left font-bold">{s.players[seat].name}</span>
                <span className="font-mono font-black">{s.players[seat].score}점</span>
              </li>))}
            </ol>
            <button type="button" onClick={start} className={`${BTN_ACCENT} mt-5 w-full py-3`}>다시 하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
