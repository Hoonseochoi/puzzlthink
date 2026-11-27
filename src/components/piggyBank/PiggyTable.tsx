"use client";

import { useEffect, useState } from 'react';
import { Crown, Hand, RotateCcw, Send } from 'lucide-react';
import { BTN, BTN_ACCENT, HEADING, KICKER, PANEL, PANEL_TITLE, STAGE } from '@/components/ui/gameUi';
import HomeButton from '@/components/ui/HomeButton';
import {
  type Color, type PbAction, type PbEvent, type PbState, ANSWER_MS, DOUBT_MS, PB_MAX_PUT, PUT_MS, PB_WIN, RESET_VOTES, ranking,
} from '@/lib/piggyBank';
import { CoinCount, CoinDot, GoldPig, Pedestal, TimerRing } from './PiggyParts';

// The 돼지 저금통 table, shared by the solo game and friend rooms. `me` is the seat shown at the bottom
// (a spectator sees seat 0's side and cannot act). In-game text is Korean only for now.
export const COLOR_KO: Record<Color, string> = { black: '흑', white: '백' };
// How long an announcement stays up (there is no log: it's a memory game). Coin drops a little longer.
const SHOW_MS = 4200;
const PUT_SHOW_MS = 6000;

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

export function PiggyTable({ s, me: seat, onAct, onAgain, seatIds }: { s: PbState; me: number | null; onAct: (a: PbAction) => void; onAgain?: () => void; seatIds?: (string | undefined)[] }) {
  const me = seat ?? 0;
  const spectator = seat === null;
  const [now, setNow] = useState(() => Date.now());
  const [shown, setShown] = useState<{ seq: number; at: number }>({ seq: -1, at: 0 });
  const [black, setBlack] = useState(1);
  const [white, setWhite] = useState(0);
  const [allIn, setAllIn] = useState<Record<number, { black: number; white: number }>>({});
  const [replay, setReplay] = useState(false);
  const [small, setSmall] = useState(false); // phones: smaller boxes around the table
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setSmall(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    return () => { mq.removeEventListener('change', sync); window.clearInterval(tick); };
  }, []);
  // Show each announcement for a few seconds.
  useEffect(() => {
    if (s.seq === shown.seq) return;
    const id = window.setTimeout(() => setShown({ seq: s.seq, at: Date.now() }), 0);
    return () => window.clearTimeout(id);
  }, [s.seq, shown.seq]);
  const shownSeq = shown.seq, shownAt = shown.at;

  const mine = s.players[me];
  const secs = Math.max(0, Math.ceil((s.deadline - now) / 1000));
  const event = shownSeq === s.seq && now - shownAt < (s.last?.k === 'put' ? PUT_SHOW_MS : SHOW_MS) ? s.last : null;
  const myPut = !spectator && s.phase === 'put' && s.turn === me;
  const myAnswer = !spectator && s.phase === 'answer' && s.turn === me;
  const canDoubt = !spectator && s.phase === 'doubt' && s.answer?.seat !== me && !s.passed.includes(me);
  const myAllIn = !spectator && s.phase === 'allIn' && s.allInSeats.includes(me);
  const votes = s.players.filter((p) => p.resetVote).length;
  // Score pop-ups on the seats while a reveal is up.
  const revealing = now < s.holdUntil;
  const delta: Record<number, number> = {};
  if (revealing && s.last?.k === 'doubt') { delta[s.last.seat] = s.last.right ? 1 : -1; if (s.last.right) delta[s.last.target] = -1; }
  if (revealing && s.last?.k === 'allIn') delta[s.last.seat] = s.last.right ? 3 : -2;
  const askPig = s.players[s.turn].upper;
  const status = s.phase === 'finished' ? '게임 종료'
    : s.phase === 'allIn' ? '리셋 직전 — 전체 맞히기 도전'
      : s.phase === 'put' ? (myPut ? '아래칸 저금통에 동전을 넣고 전달할 사람을 고르세요' : `${s.players[s.turn].name}이(가) 동전을 넣는 중…`)
        : s.phase === 'answer' ? (myAnswer ? `#${askPig ? s.pigs[askPig].label : ''} 저금통 속 ${COLOR_KO[s.ask]} 동전은 몇 개?` : `${s.players[s.turn].name}이(가) 대답하는 중…`)
          : s.answer!.seat === me ? '다른 사람들이 의심할지 기다리는 중…' : `${s.players[s.answer!.seat].name}의 대답 — 의심할까요?`;

  const putTotal = black + white;
  const step = (which: Color, d: number) => {
    const b = which === 'black' ? Math.max(0, black + d) : black;
    const w = which === 'white' ? Math.max(0, white + d) : white;
    if (b + w > PB_MAX_PUT) return;
    setBlack(b); setWhite(w);
  };

  return (
    <>
        <section className={STAGE}>
          <div className="mb-3 px-1">
            <p className={KICKER}>{s.phase === 'finished' ? 'RESULT' : `다음 질문 · ${COLOR_KO[s.ask]}`}</p>
            <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
          </div>

          {/* The table: four players around it (me at the bottom), the clock in the middle. */}
          <div className="relative mx-auto grid w-full max-w-[680px] grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-y-1 overflow-hidden rounded-[22px] border border-white/10 px-1 py-3 sm:gap-y-2 sm:p-5"
            style={{ background: 'radial-gradient(ellipse at 50% 45%, #4a5278 0%, #2b3150 50%, #181b2e 100%)' }}>
            <div className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #fff 0 1px, transparent 2px)', backgroundSize: '38px 38px, 53px 53px' }} />
            {[{ seat: (me + 2) % 4, cls: 'col-start-2 row-start-1' }, { seat: (me + 1) % 4, cls: 'col-start-1 row-start-2' }, { seat: (me + 3) % 4, cls: 'col-start-3 row-start-2' }, { seat: me, cls: 'col-start-2 row-start-3' }].map(({ seat, cls }) => {
              const p = s.players[seat];
              const speaking = s.answer?.seat === seat && s.phase === 'doubt';
              const buzz = !!event && event.k === 'doubt' && event.seat === seat;
              const active = s.turn === seat && s.phase !== 'finished';
              return (
                <div key={seat} data-chat-seat={seatIds?.[seat]} className={`relative flex flex-col items-center ${cls}`}>
                  <div className={`mb-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${active ? 'bg-[#ffd84a] text-[#2a1d00]' : 'bg-black/40 text-white/80'}`}>
                    {active && <span className="rounded-full bg-[#ff3b5c] px-1.5 text-[9px] text-white">차례</span>}
                    <span className="max-w-[72px] truncate">{p.name}</span>
                    <span className="font-mono">{p.score}점</span>
                    {p.resetVote && <RotateCcw size={10} />}
                    {s.phase === 'doubt' && s.passed.includes(seat) && <span className="rounded-full bg-white/15 px-1.5 text-[9px]">패스</span>}
                  </div>
                  {speaking && (
                    <span key={s.seq} className="bw-result absolute -top-1 right-0 z-10 translate-x-1/3 rounded-lg bg-[#efe9ff] px-2 py-1 text-xs font-black text-[#2b2f4a] shadow-lg sm:text-sm">
                      {COLOR_KO[s.answer!.color]}{s.answer!.value}
                    </span>
                  )}
                  {delta[seat] ? <span key={`d${s.seq}`} className={`bw-result absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-sm font-black ${delta[seat] > 0 ? 'bg-[#3ddc97] text-[#06291a]' : 'bg-[#ff3b5c] text-white'}`}>{delta[seat] > 0 ? `+${delta[seat]}` : delta[seat]}</span> : null}
                  <Pedestal small={small} active={active} buzz={buzz} resetVoted={p.resetVote}
                    onReset={!spectator && seat === me && s.phase !== 'finished' && s.phase !== 'allIn' ? () => onAct({ t: 'vote' }) : undefined}
                    onBuzz={seat === me && canDoubt && !revealing ? () => onAct({ t: 'doubt' }) : undefined}
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
                <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2"><HomeButton block className="!rounded-md" />{onAgain && <button type="button" onClick={onAgain} className={`${BTN_ACCENT} w-full py-3`}>다시 하기</button>}</div>
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
                <p className="text-center text-[11px] text-white/45">아래칸 #{mine.lower ? s.pigs[mine.lower].label : ''}에 넣어요 · 1~{PB_MAX_PUT}개 (지금 {putTotal}개)</p>
                <div className="grid grid-cols-3 gap-2">
                  {s.players.map((p, i) => i === me ? null : (
                    <button key={i} type="button" disabled={putTotal < 1} onClick={() => onAct({ t: 'put', black, white, to: i })} className={`${BTN_ACCENT} py-3 disabled:opacity-40`}><Send size={13} />{p.name}에게</button>
                  ))}
                </div>
              </div>
            ) : myAnswer ? (
              <div>
                <p className="text-center text-sm font-black">#{askPig ? s.pigs[askPig].label : ''} 속 {COLOR_KO[s.ask]} 동전 개수</p>
                <div className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                  {Array.from({ length: 24 }, (_, n) => <button key={n} type="button" onClick={() => onAct({ t: 'answer', value: n })} className={`${BTN} py-2.5 font-mono`}>{n}</button>)}
                </div>
                <p className="mt-2 text-center text-[10px] text-white/40">{ANSWER_MS / 1000}초 안에 대답하지 않으면 0개로 처리돼요</p>
              </div>
            ) : (
              <p className="py-3 text-center text-xs text-white/45">
                {s.phase === 'doubt' && s.answer ? (s.answer.seat === me ? '다른 사람들이 의심할지 고르는 중…' : s.passed.includes(me) ? '의심 안 함 — 다른 사람을 기다리는 중…' : '의심할지 골라 주세요')
                  : '공개되는 숫자를 기억하세요. 대답이 나오면 10초 동안 의심할 수 있어요.'}
              </p>
            )}
          </div>
        </section>

      {/* Doubt window: after each answer, everyone else chooses "doubt" or "no doubt" within 10 seconds. */}
      {canDoubt && !revealing && s.answer && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:inset-0 sm:items-center sm:bg-black/40">
          <div className="hall-pop w-full max-w-sm rounded-[22px] border border-[#ff4d6d]/40 bg-[#1b1e33]/97 p-5 text-center shadow-[0_0_60px_rgba(255,77,109,.3)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-[0.3em] text-[#ff8b96]">DOUBT?</p>
              <span className={`rounded-md px-2 py-1 font-mono text-sm font-black ${secs <= 3 ? 'bg-[#ff3b5c] text-white' : 'bg-black/40'}`}>{secs}s</span>
            </div>
            <p className="mt-2 text-sm text-white/70">{s.players[s.answer.seat].name}의 대답</p>
            <p className="mt-1 flex items-center justify-center gap-2 text-2xl font-black">
              #{s.pigs[s.answer.pig]?.label} 속 <CoinDot color={s.answer.color} size={18} />{COLOR_KO[s.answer.color]} {s.answer.value}개
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onAct({ t: 'pass' })} className={`${BTN} py-3.5 text-sm`}>의심 안 함</button>
              <button type="button" onClick={() => onAct({ t: 'doubt' })} className="flex items-center justify-center gap-2 rounded-md bg-[#ff4d6d] py-3.5 text-sm font-black text-white shadow-[0_0_20px_rgba(255,77,109,.5)] hover:brightness-110"><Hand size={16} />의심</button>
            </div>
            <p className="mt-2 text-[10px] text-white/40">대답이 틀렸으면 +1, 맞았으면 −1 · 모두 의심 안 함이면 바로 넘어가요</p>
          </div>
        </div>
      )}

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
              <button type="button" onClick={() => onAct({ t: 'allIn', guess: null })} className={`${BTN} py-3`}>도전 안 함</button>
              <button type="button" onClick={() => onAct({ t: 'allIn', guess: Object.fromEntries(Object.values(s.pigs).map((p) => [p.id, { black: allIn[p.id]?.black ?? 1, white: allIn[p.id]?.white ?? 1 }])) })} className={`${BTN_ACCENT} py-3`}>도전하기</button>
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
      {replay && s.phase === 'finished' && <PiggyReplay s={s} onClose={() => setReplay(false)} />}
      {s.phase === 'finished' && !revealing && !replay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="hall-pop w-full max-w-sm rounded-[24px] border border-[#ffd84a]/40 bg-gradient-to-b from-[#2b3150] to-[#151829] p-6 text-center shadow-[0_0_100px_rgba(255,216,74,.25)]">
            <Crown size={34} className="mx-auto text-[#ffd84a]" />
            <h2 className="mt-2 text-2xl font-black">{ranking(s)[0] === me ? '1위!' : `${ranking(s).indexOf(me) + 1}위`}</h2>
            <ol className="mt-4 space-y-1.5">{ranking(s).map((seat, r) => (
              <li key={seat} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${seat === me ? 'bg-[#ffd84a] text-[#2a1d00]' : 'bg-white/[.06]'}`}>
                <span className="w-9 font-mono font-black">{r + 1}위</span><span className="flex-1 text-left font-bold">{s.players[seat].name}</span>
                <span className="font-mono font-black">{s.players[seat].score}점</span>
              </li>))}
            </ol>
            <button type="button" onClick={() => setReplay(true)} className={`${BTN} mt-5 w-full py-3`}>저금통 복기 보기</button>
            {!onAgain && <p className="mt-2 text-[11px] text-white/40">방장이 다시 시작하면 새 판이 열려요</p>}
            <div className={`mt-2 grid gap-2 ${onAgain ? 'grid-cols-[1fr_2fr]' : ''}`}><HomeButton block className="!rounded-md" />{onAgain && <button type="button" onClick={onAgain} className={`${BTN_ACCENT} w-full py-3`}>다시 하기</button>}</div>
          </div>
        </div>
      )}
    </>
  );
}

/** Side panel: reset vote and the rules. */
export function PiggyAside({ s, me, onAct }: { s: PbState | null; me: number | null; onAct: (a: PbAction) => void }) {
  const votes = s ? s.players.filter((p) => p.resetVote).length : 0;
  const voted = !!s && me !== null && s.players[me].resetVote;
  return (
      <aside className="flex flex-col gap-4">
        <section className={PANEL}>
          <p className={PANEL_TITLE}>리셋</p>
          <p className="mt-2 break-keep text-xs leading-5 text-white/55">{RESET_VOTES}명이 누르면 모든 저금통이 흑1·백1로 돌아가요. 누르지 않은 사람은 그 직전에 전체 맞히기에 도전할 수 있어요.</p>
          <button type="button" disabled={!s || me === null || voted || s.phase === 'finished' || s.phase === 'allIn'} onClick={() => onAct({ t: 'vote' })} className={`${BTN} mt-3 w-full py-2.5 disabled:opacity-40`}><RotateCcw size={13} />리셋 투표 ({votes}/{RESET_VOTES})</button>
        </section>
        <section className={PANEL}>
          <p className={PANEL_TITLE}>규칙 요약</p>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">
            {[
              '내 차례: 아래칸 저금통에 동전 1~5개(흑·백)를 넣고, 넣은 개수를 말한 뒤 원하는 사람에게 전달해요.',
              '전달하면 내 위칸 저금통이 아래칸으로 내려와요.',
              '받은 사람은 20초 안에 받은 저금통 속 지정 색(흑→백→흑…) 동전 개수를 말해요.',
              '대답이 나오면 10초 동안 의심 / 의심 안 함을 골라요. 모두 의심 안 함이면 바로 넘어가요. 의심하면 열어서 확인: 틀렸으면 의심한 사람 +1·대답한 사람 −1, 맞았으면 의심한 사람 −1.',
              '연 저금통은 빠지고, 감점된 사람이 새 저금통(흑1·백1)을 받아 차례를 이어가요.',
              `누군가 ${PB_WIN}점이 되면 끝나고, 점수 순으로 순위가 정해져요.`,
            ].map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{r}</span></li>)}
          </ul>
        </section>
      </aside>
  );
}

/** After the game: every pig's story — the coins that went in, resets, and how it ended. */
export function PiggyReplay({ s, onClose }: { s: PbState; onClose: () => void }) {
  const name = (i: number) => s.players[i].name;
  const labels = [...new Set(s.log.flatMap((l) => ('label' in l ? [l.label] : [])))].sort((a, b) => a - b);
  const left = new Map(Object.values(s.pigs).map((p) => [p.label, p]));
  const story = (label: number) => {
    const rows: { text: React.ReactNode; tone?: 'good' | 'bad' | 'muted' }[] = [];
    let black = 1, white = 1, started = false, opened = false;
    for (const l of s.log) {
      if (l.k === 'reset') { if (started && !opened) { black = 1; white = 1; rows.push({ text: <>리셋 → <CoinCount color="black" n={1} /> <CoinCount color="white" n={1} /></>, tone: 'muted' }); } continue; }
      if (l.label !== label) continue;
      if (l.k === 'start' || l.k === 'new') { started = true; rows.push({ text: <>{l.k === 'new' ? `${name(l.seat)}에게 새로 지급` : `${name(l.seat)} 시작`} · <CoinCount color="black" n={1} /> <CoinCount color="white" n={1} /></>, tone: 'muted' }); }
      if (l.k === 'put') { black += l.black; white += l.white; rows.push({ text: <><b>{name(l.seat)}</b> +<CoinCount color="black" n={l.black} /> <CoinCount color="white" n={l.white} /> → {name(l.to)} <span className="text-white/40">(합계 {black}·{white})</span></> }); }
      if (l.k === 'open') opened = true;
      if (l.k === 'open') rows.push({ text: <>개봉 <CoinCount color="black" n={l.black} /> <CoinCount color="white" n={l.white} /> · {name(l.target)} “{COLOR_KO[l.color]}{l.value}” · {name(l.by)} {l.right ? '의심 성공' : '의심 실패'}</>, tone: l.right ? 'good' : 'bad' });
    }
    const end = left.get(label);
    if (end) rows.push({ text: <>끝까지 남음 · <CoinCount color="black" n={end.black} /> <CoinCount color="white" n={end.white} /></>, tone: 'good' });
    return rows;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="hall-pop max-h-[90svh] w-full max-w-xl overflow-y-auto rounded-t-[22px] border border-white/10 bg-[#1b1e33] p-5 sm:rounded-[22px]">
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-black tracking-[0.3em] text-[#ffd84a]">REPLAY</p><h2 className="mt-1 text-xl font-black">저금통 복기</h2></div>
          <button type="button" onClick={onClose} className={`${BTN} py-2`}>닫기</button>
        </div>
        <p className="mt-1 text-xs text-white/50">저금통마다 누가 동전을 얼마나 넣었는지, 어떻게 끝났는지 보여줘요.</p>
        <div className="mt-4 space-y-3">
          {labels.map((label) => (
            <section key={label} className="rounded-2xl bg-white/[.05] p-3">
              <div className="flex items-center gap-2"><GoldPig label={label} size={40} /><span className="text-sm font-black">#{label} 저금통</span></div>
              <ol className="mt-2 space-y-1 border-l border-white/10 pl-3">
                {story(label).map((row, i) => (
                  <li key={i} className={`flex flex-wrap items-center gap-1 text-xs leading-5 ${row.tone === 'good' ? 'text-[#7ff0bf]' : row.tone === 'bad' ? 'text-[#ff9aa4]' : row.tone === 'muted' ? 'text-white/50' : 'text-white/80'}`}>{row.text}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
