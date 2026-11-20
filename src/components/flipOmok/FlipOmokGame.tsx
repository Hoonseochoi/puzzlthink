"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, RotateCcw, Sparkles, Undo2, Users } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { SIZE, chooseMove, coordinateLabel, emptyBoard, isFull, other, play, type Board, type FlipDifficulty, type Line, type Player } from '@/lib/flipOmok';

const ACCENT = '#5fd3a6';
type Mode = 'ai' | 'local';
interface Snapshot { board: Board; turn: Player; last: number | null; flipped: number[] }

const MARGIN = 4.2;
const pos = (v: number) => MARGIN + v * ((100 - MARGIN * 2) / (SIZE - 1));
const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

function Stone({ p, latest, flip }: { p: Player; latest: boolean; flip: boolean }) {
  return <span className={`relative block h-full w-full rounded-full ${flip ? 'flip-omok-flip' : ''} ${p === 1 ? 'shadow-[0_3px_7px_rgba(0,0,0,.6)]' : 'shadow-[0_3px_7px_rgba(0,0,0,.35)]'}`}
    style={{ background: p === 1 ? 'radial-gradient(circle at 35% 30%, #5a5f69, #0a0b0e 70%)' : 'radial-gradient(circle at 35% 30%, #ffffff, #c9ced8 80%)' }}>
    {latest && <span className={`absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full ${p === 1 ? 'bg-[#5fd3a6]' : 'bg-[#e0553f]'}`} />}
  </span>;
}

export default function FlipOmokGame() {
  const t = useTranslations('FlipOmok');
  const [mode, setMode] = useState<Mode>('ai');
  const [difficulty, setDifficulty] = useState<FlipDifficulty>('normal');
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Player>(1);
  const [last, setLast] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [win, setWin] = useState<Line | null>(null);
  const [draw, setDraw] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [toast, setToast] = useState<{ n: number; who: Player; key: number } | null>(null);
  const toastKey = useRef(0);

  const over = !!win || draw;
  const aiTurn = mode === 'ai' && turn === 2 && !over;
  const started = history.length > 0;

  const apply = (at: number, p: Player) => {
    const res = play(board, at, p);
    setHistory((h) => [...h, { board, turn, last, flipped }]);
    setBoard(res.board);
    setLast(at);
    setFlipped(res.flipped);
    if (res.flipped.length) { toastKey.current += 1; setToast({ n: res.flipped.length, who: p, key: toastKey.current }); }
    if (res.win) setWin(res.win);
    else if (isFull(res.board)) setDraw(true);
    else setTurn(other(p));
  };

  const place = (at: number) => {
    if (over || aiTurn || board[at]) return;
    apply(at, turn);
  };

  useEffect(() => {
    if (!aiTurn) return;
    const timer = window.setTimeout(() => apply(chooseMove(board, 2, difficulty), 2), 520);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, board]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const reset = (nextMode = mode) => {
    setMode(nextMode); setBoard(emptyBoard()); setTurn(1); setLast(null); setFlipped([]); setWin(null); setDraw(false); setHistory([]); setToast(null);
  };

  // Against MIRA, undo takes back the AI's reply too.
  const undo = () => {
    if (!history.length || aiTurn) return;
    const back = mode === 'ai' && history.length >= 2 && !(win && win.owner === 1) ? 2 : 1;
    const snap = history[history.length - back];
    setBoard(snap.board); setTurn(snap.turn); setLast(snap.last); setFlipped(snap.flipped); setWin(null); setDraw(false);
    setHistory((h) => h.slice(0, h.length - back));
  };

  const name = (p: Player) => mode === 'ai' ? (p === 1 ? t('you') : 'MIRA') : (p === 1 ? t('black') : t('white'));
  const count = (p: Player) => board.filter((c) => c === p).length;
  const status = win ? t('wins', { name: name(win.owner) }) : draw ? t('draw') : aiTurn ? t('aiThinking') : t('turnOf', { name: name(turn) });
  const preview = hover !== null && !board[hover] && !over && !aiTurn ? play(board, hover, turn).flipped : [];
  const flippedSet = new Set(flipped);
  const previewSet = new Set(preview);

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#06261a'), backgroundImage: fog('60, 190, 140') }}>
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle={t('subtitle')}>
        <LanguageSwitcher compact dark />
        <button type="button" onClick={undo} disabled={!history.length || aiTurn} className={`${BTN} disabled:opacity-35`}><Undo2 size={14} /><span className="hidden sm:inline">{t('undo')}</span></button>
        <button type="button" onClick={() => reset()} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE} id="play">
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div>
              <p className={KICKER}>{over ? t('resultKicker') : t('moveKicker', { n: history.length + 1 })}</p>
              <h1 className="mt-1 text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl">{status}</h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-black">
              <span className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${turn === 1 && !over ? 'border-[#5fd3a6]/60 bg-[#5fd3a6]/10' : 'border-white/10 bg-black/40'}`}><i className="h-3 w-3 rounded-full bg-[#111]" />{count(1)}</span>
              <span className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${turn === 2 && !over ? 'border-[#5fd3a6]/60 bg-[#5fd3a6]/10' : 'border-white/10 bg-black/40'}`}><i className="h-3 w-3 rounded-full bg-[#eef0f4]" />{count(2)}</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[700px] rounded-[10px] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.7)]" style={{ background: 'linear-gradient(135deg,#5fd3a6,#2b2f37 45%,#e0553f)' }}>
            <div className="relative h-full w-full overflow-hidden rounded-[8px]" style={{ background: 'radial-gradient(circle at 50% 40%, #e9c98d, #c99a57 75%)' }} onMouseLeave={() => setHover(null)}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                {Array.from({ length: SIZE }, (_, i) => <g key={i}>
                  <line x1={pos(i)} y1={pos(0)} x2={pos(i)} y2={pos(SIZE - 1)} stroke="#5b3d1c" strokeOpacity=".55" strokeWidth=".22" />
                  <line x1={pos(0)} y1={pos(i)} x2={pos(SIZE - 1)} y2={pos(i)} stroke="#5b3d1c" strokeOpacity=".55" strokeWidth=".22" />
                </g>)}
                {STARS.map(([r, c]) => <circle key={`${r}${c}`} cx={pos(c)} cy={pos(r)} r=".7" fill="#5b3d1c" fillOpacity=".7" />)}
                {win && <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke="#e0553f" strokeWidth="1.2" strokeLinecap="round" />}
              </svg>
              {board.map((cell, at) => {
                const r = Math.floor(at / SIZE), c = at % SIZE;
                const canPlace = !cell && !over && !aiTurn;
                return (
                  <button key={at} type="button" disabled={!canPlace} aria-label={coordinateLabel(at)}
                    onClick={() => place(at)} onMouseEnter={() => setHover(at)}
                    className={`absolute z-10 h-[6.2%] w-[6.2%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none [perspective:300px] ${canPlace ? 'cursor-pointer' : ''}`}
                    style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}>
                    {cell ? <span className={`relative block h-full w-full ${previewSet.has(at) ? 'opacity-55 ring-2 ring-[#e0553f] rounded-full' : ''}`}>
                      {/* key changes on a flip so the animation replays */}
                      <Stone key={`${cell}-${flippedSet.has(at) ? history.length : 0}`} p={cell as Player} latest={at === last} flip={flippedSet.has(at)} />
                    </span>
                      : hover === at && canPlace ? <span className="block h-full w-full rounded-full opacity-45" style={{ background: turn === 1 ? '#111' : '#fff' }} /> : null}
                  </button>
                );
              })}
              {toast && <div key={toast.key} className="flip-omok-toast pointer-events-none absolute left-1/2 top-[44%] z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-5 py-2.5 text-lg font-black text-white shadow-2xl sm:text-2xl">
                <Sparkles size={18} className="mr-1.5 inline text-[#5fd3a6]" />{t('flipToast', { n: toast.n })}
              </div>}
            </div>
          </div>
          {preview.length > 0 && <p className="mt-2 text-center text-[11px] font-bold text-[#ffb3a5]">{t('previewHint', { n: preview.length })}</p>}
          {over && <div className="mt-4 flex justify-center"><button type="button" onClick={() => reset()} className={`${BTN_ACCENT} px-6 py-3 text-sm`}><RotateCcw size={15} />{t('again')}</button></div>}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('mode')}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {(['ai', 'local'] as Mode[]).map((m) => <button key={m} type="button" onClick={() => reset(m)} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-black transition ${mode === m ? 'bg-[#5fd3a6] text-[#06261a]' : 'border border-white/10 bg-white/[.03] text-white/50 hover:text-white'}`}>{m === 'ai' ? <Bot size={14} /> : <Users size={14} />}{t(`modes.${m}`)}</button>)}
            </div>
            {mode === 'ai' && <>
              <p className={`${PANEL_TITLE} mt-4`}>{t('difficulty')}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(['easy', 'normal', 'hard'] as FlipDifficulty[]).map((d) => <button key={d} type="button" disabled={started} onClick={() => setDifficulty(d)} className={`rounded-md px-2 py-2 text-xs font-black transition ${difficulty === d ? 'bg-[#5fd3a6] text-[#06261a]' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{t(`levels.${d}`)}</button>)}
              </div>
              {started && <p className="mt-2 text-[10px] text-white/35">{t('difficultyLocked')}</p>}
            </>}
          </section>

          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">
              {(t.raw('rules') as string[]).map((rule) => <li key={rule} className="flex gap-2.5 break-keep"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#5fd3a6]" />{rule}</li>)}
            </ul>
          </section>

          <section className="rounded-[14px] border border-[#5fd3a6]/30 bg-[#5fd3a6]/[.07] p-4">
            <p className={PANEL_TITLE}>{t('devTitle')}</p>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('devNote')}</p>
          </section>
          {last !== null && <p className="text-center text-[11px] text-white/35">{t('lastMove', { name: name(board[last] as Player), at: coordinateLabel(last) })}</p>}
        </aside>
      </main>
    </div>
  );
}
