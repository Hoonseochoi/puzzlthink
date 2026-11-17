"use client";

import { useEffect, useRef, useState } from 'react';
import { Crown, Eye, Hand, RotateCcw, Send, Timer } from 'lucide-react';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import {
  type Color, type Memory, type PbEvent, type PbLevel, type PbState, ANSWER_MS, DOUBT_MS, PB_MAX_PUT, PB_WIN, RESET_VOTES,
  aiAllIn, aiAnswer, aiDoubts, aiPut, allInGuess, answerCount, answerTimeout, createPiggyBank, doubt, freshMemory, noDoubt, putCoins, ranking, remember, voteReset,
} from '@/lib/piggyBank';

// Draft (not linked from the site yet): 돼지 저금통 against three AI players. Korean text only for now.
const ACCENT = '#ff8fab';
const ME = 0;
const NAMES = ['나', '토끼', '곰', '여우'];
const COLOR_KO: Record<Color, string> = { black: '흑', white: '백' };
// How long an announcement stays up (there is no log: it's a memory game). Coin drops a little longer.
const SHOW_MS = 4200;
const PUT_SHOW_MS = 6000;

function PigIcon({ label, size = 'md', open = false }: { label: number; size?: 'sm' | 'md'; open?: boolean }) {
  const box = size === 'md' ? 'h-14 w-16 text-[11px]' : 'h-9 w-11 text-[9px]';
  return (
    <span className={`relative inline-flex ${box} items-center justify-center rounded-[45%] border-2 border-[#ff6f95] bg-gradient-to-b from-[#ffc2d1] to-[#ff8fab] shadow-[0_6px_14px_rgba(255,111,149,.35)] ${open ? 'opacity-40' : ''}`}>
      <i className="absolute -top-1.5 left-2 h-3 w-3 rotate-45 rounded-sm bg-[#ff8fab]" /><i className="absolute -top-1.5 right-2 h-3 w-3 rotate-45 rounded-sm bg-[#ff8fab]" />
      <i className="absolute left-1/2 top-0 h-1 w-4 -translate-x-1/2 rounded-full bg-[#7a2a40]" /> {/* coin slot */}
      <b className="relative font-mono font-black text-[#7a2a40]">#{label}</b>
    </span>
  );
}

const Coin = ({ color, n }: { color: Color; n: number }) => (
  <span className="inline-flex items-center gap-1 font-mono text-sm font-black">
    <i className={`h-3.5 w-3.5 rounded-full border ${color === 'black' ? 'border-white/30 bg-[#111]' : 'border-black/20 bg-[#f4efe4]'}`} />{n}
  </span>
);

function describe(e: PbEvent | null, s: PbState) {
  if (!e) return null;
  const name = (i: number) => s.players[i].name;
  const pigLabel = (id: number) => s.pigs[id]?.label;
  switch (e.k) {
    case 'put': return <>{name(e.seat)} → <b>#{pigLabel(e.pig)}</b>에 <Coin color="black" n={e.black} /> <Coin color="white" n={e.white} /> 넣고 <b>{name(e.to)}</b>에게 전달</>;
    case 'answer': return <><b>{name(e.seat)}</b>: “#{pigLabel(e.pig)} 속 {COLOR_KO[e.color]} 동전은 <b>{e.value}개</b>”</>;
    case 'doubt': return <><b>{name(e.seat)}</b>의 의심 → 열어 보니 <Coin color="black" n={e.pigBlack} /> <Coin color="white" n={e.pigWhite} /> · {e.right ? <b className="text-[#3ddc97]">의심 성공! {name(e.seat)} +1, {name(e.target)} −1</b> : <b className="text-[#ff8b96]">의심 실패… {name(e.seat)} −1</b>}</>;
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
  const stateRef = useRef<PbState | null>(null);
  const memRef = useRef<Memory[]>([]);
  const dueRef = useRef<{ seq: number; at: number; doubtAt: number[] }>({ seq: -1, at: 0, doubtAt: [] });

  const start = () => {
    const s = createPiggyBank(NAMES, [false, true, true, true]);
    stateRef.current = s; memRef.current = s.players.map(() => freshMemory(s));
    dueRef.current = { seq: -1, at: 0, doubtAt: [] };
    setState(s); setShownSeq(-1);
  };
  const apply = (next: PbState | null) => { if (next) { stateRef.current = next; setState(next); } };

  // One clock drives the AI players and the time limits.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      const s = stateRef.current;
      if (!s || s.phase === 'finished') return;
      const due = dueRef.current;
      if (due.seq !== s.seq) {
        // New public event: every AI updates its memory, maybe votes to reset, and picks when to act.
        memRef.current = memRef.current.map((m, i) => (s.players[i].ai ? remember(m, s, level) : m));
        due.seq = s.seq;
        due.at = t + 1200 + Math.random() * 1600;
        due.doubtAt = s.players.map(() => t + 900 + Math.random() * 3500);
        if (s.last?.k === 'put') {
          for (let i = 1; i < s.players.length; i += 1) {
            const unsure = Object.values(memRef.current[i]).reduce((a, m) => a + m.unsure, 0);
            if (unsure >= 4 && Math.random() < 0.25 && !s.players[i].resetVote) { apply(voteReset(stateRef.current!, i)); return; }
          }
        }
      }
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
        const seat = s.allInSeats.find((i) => s.players[i].ai);
        if (seat !== undefined) apply(allInGuess(s, seat, aiAllIn(s, memRef.current[seat])));
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
      <div className={SHELL} style={{ ...accentVars(ACCENT, '#3b0f1c'), backgroundImage: fog('255, 120, 160') }}>
        <GameHeader backHref="/" backLabel="PUZZLTHINK" title="돼지 저금통" subtitle="DRAFT · 4인" />
        <main className="relative z-10 mx-auto max-w-lg px-5 py-14 text-center">
          <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((n) => <PigIcon key={n} label={n} size="sm" />)}</div>
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
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#3b0f1c'), backgroundImage: fog('255, 120, 160') }}>
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title="돼지 저금통" subtitle="DRAFT · 4인">
        <button type="button" onClick={start} className={BTN_ACCENT}><RotateCcw size={14} />새 게임</button>
      </GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className={KICKER}>다음 질문 · <span className="inline-flex items-center gap-1"><i className={`h-2.5 w-2.5 rounded-full ${s.ask === 'black' ? 'bg-[#111] ring-1 ring-white/40' : 'bg-[#f4efe4]'}`} />{COLOR_KO[s.ask]}</span></p>
              <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
            </div>
            {(s.phase === 'answer' || s.phase === 'doubt' || myPut) && <span className="flex items-center gap-1.5 rounded-md border border-white/15 bg-black/50 px-3 py-2 font-mono text-sm font-bold"><Timer size={14} />{secs}s</span>}
          </div>

          {/* Seats: each player's table slot (위칸) and under-table slot (아래칸). */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {s.players.map((p, i) => (
              <div key={i} className={`rounded-[14px] border p-3 ${s.turn === i && s.phase !== 'finished' ? 'border-(--accent)/60 bg-(--accent)/[.07]' : 'border-white/10 bg-black/30'}`}>
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-black">{p.name}{i === ME ? '' : ` · AI`}{p.resetVote && <span className="ml-1.5 rounded bg-white/10 px-1 text-[9px]">리셋</span>}</p>
                  <p className="font-mono text-lg font-black text-(--accent)">{p.score}</p>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <div className="text-center"><p className="text-[9px] font-bold text-white/35">위칸</p><div className="mt-1 flex h-14 items-center">{p.upper ? <PigIcon label={s.pigs[p.upper].label} /> : <span className="h-14 w-16 rounded-[45%] border border-dashed border-white/10" />}</div></div>
                  <div className="text-center"><p className="text-[9px] font-bold text-white/35">아래칸</p><div className="mt-1 flex h-14 items-center">{p.lower ? <PigIcon label={s.pigs[p.lower].label} size="sm" /> : <span className="h-9 w-11 rounded-[45%] border border-dashed border-white/10" />}</div></div>
                </div>
              </div>
            ))}
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
                    {r === 0 && <span className="flex items-center gap-1 text-xs font-black text-[#ffd36e]"><Crown size={12} />피스 3개</span>}
                    {r === 3 && <span className="text-xs font-black text-[#ff8b96]">탈락</span>}
                  </li>))}
                </ol>
                <button type="button" onClick={start} className={`${BTN_ACCENT} mt-4 w-full py-3`}>다시 하기</button>
              </div>
            ) : myAllIn ? (
              <div>
                <p className="text-sm font-black">리셋 직전! 모든 저금통의 동전을 맞혀 보세요 (성공 +3 · 실패 −2)</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.values(s.pigs).map((pig) => (
                    <div key={pig.id} className="flex items-center gap-2 rounded-lg bg-white/[.04] p-2">
                      <PigIcon label={pig.label} size="sm" />
                      {(['black', 'white'] as Color[]).map((c) => (
                        <input key={c} type="number" min={0} value={allIn[pig.id]?.[c] ?? ''} placeholder={COLOR_KO[c]}
                          onChange={(e) => setAllIn((g) => ({ ...g, [pig.id]: { black: g[pig.id]?.black ?? 0, white: g[pig.id]?.white ?? 0, [c]: Number(e.target.value) } }))}
                          className="w-12 rounded-md border border-white/15 bg-black/40 px-1.5 py-1 text-center font-mono text-sm" />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => apply(allInGuess(s, ME, null))} className={`${BTN} py-2.5`}>도전 안 함</button>
                  <button type="button" onClick={() => apply(allInGuess(s, ME, allIn))} className={`${BTN_ACCENT} py-2.5`}>도전!</button>
                </div>
              </div>
            ) : myPut ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-6">
                  {(['black', 'white'] as Color[]).map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <button type="button" onClick={() => step(c, -1)} className={`${BTN} h-9 w-9 !p-0`}>−</button>
                      <Coin color={c} n={c === 'black' ? black : white} />
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
            ) : canDoubt ? (
              <div className="text-center">
                <p className="text-sm">{s.players[s.answer!.seat].name}: “#{s.pigs[s.answer!.pig]?.label} 속 {COLOR_KO[s.answer!.color]} {s.answer!.value}개”</p>
                <button type="button" onClick={() => apply(doubt(s, ME))} className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#ff4d6d] px-8 py-3.5 text-base font-black text-white shadow-[0_0_24px_rgba(255,77,109,.45)] hover:brightness-110"><Hand size={18} />의심!</button>
                <p className="mt-2 text-[10px] text-white/40">{DOUBT_MS / 1000}초 안에 · 성공 +1 / 실패 −1</p>
              </div>
            ) : (
              <p className="py-3 text-center text-xs text-white/45">다른 플레이어의 차례예요. 공개되는 숫자를 기억하세요.</p>
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
                '10초 안에 다른 사람이 의심하면 열어서 확인: 맞으면 의심한 사람 +1·대답한 사람 −1, 틀리면 의심한 사람 −1.',
                '연 저금통은 빠지고, 감점된 사람이 새 저금통(흑1·백1)을 받아 차례를 이어가요.',
                `누군가 ${PB_WIN}점이 되면 끝. 1위는 피스 3개, 꼴찌는 탈락.`,
              ].map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{r}</span></li>)}
            </ul>
          </section>
          <section className={PANEL}>
            <p className={`${PANEL_TITLE} flex items-center gap-1.5`}><Eye size={11} />초안 메모</p>
            <p className="mt-2 break-keep text-[11px] leading-5 text-white/45">방송을 보기 전, 룰 텍스트만으로 만든 초안이에요. 대답 시간 초과는 0개로, 위칸·아래칸 이동은 위 규칙대로 해석했어요.</p>
          </section>
        </aside>
      </main>
    </div>
  );
}
