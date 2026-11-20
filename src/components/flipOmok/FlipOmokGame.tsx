"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, RotateCcw, Sparkles, Undo2, Users } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, KICKER, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { SIZE, chooseMove, coordinateLabel, emptyBoard, forbiddenPoints, isFlipped, isFull, other, owner, play, type Board, type Cell, type FlipDifficulty, type Line, type Player } from '@/lib/flipOmok';

const ACCENT = '#67e8ff';
type Mode = 'ai' | 'local';
interface Snapshot { board: Board; turn: Player; last: number | null; flipped: number[] }

const MARGIN = 4.2;
const pos = (v: number) => MARGIN + v * ((100 - MARGIN * 2) / (SIZE - 1));
const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

/** Player colours: two neon characters. */
export const STONE_HEX: Record<Player, string> = { 1: '#ff4d6d', 2: '#3fb8ff' };

/** One face of a character stone: glossy colour body with two eyes (squinting while it is being flipped). */
/** Eyes: white on a stone its owner placed, the other side's colour on a stone that was flipped over to them. */
function Face({ p, marked = false, dizzy = false, back = false }: { p: Player; marked?: boolean; dizzy?: boolean; back?: boolean }) {
  const hex = STONE_HEX[p];
  const eye = marked ? STONE_HEX[other(p)] : 'rgba(255,255,255,.95)';
  return <span className={`absolute inset-0 rounded-full border border-white/25 [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`}
    style={{ background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${hex} 55%, white) 0%, ${hex} 48%, color-mix(in srgb, ${hex} 60%, black) 100%)`, boxShadow: `0 4px 10px rgba(0,0,0,.6), 0 0 10px ${hex}88` }}>
    {dizzy ? <>
      <span className="absolute left-[24%] top-[34%] text-[0.5em] font-black leading-none" style={{ color: eye }}>&gt;</span>
      <span className="absolute right-[24%] top-[34%] text-[0.5em] font-black leading-none" style={{ color: eye }}>&lt;</span>
    </> : <>
      <span className="absolute left-[29%] top-[33%] h-[17%] w-[12%] rounded-full" style={{ background: eye, boxShadow: marked ? '0 0 0 1px rgba(255,255,255,.85)' : undefined }} />
      <span className="absolute right-[29%] top-[33%] h-[17%] w-[12%] rounded-full" style={{ background: eye, boxShadow: marked ? '0 0 0 1px rgba(255,255,255,.85)' : undefined }} />
    </>}
  </span>;
}

/** A stone; when `flip` is set it spins over from the opponent's colour to its own. */
function Stone({ cell, latest, flip, delay = 0 }: { cell: Cell; latest: boolean; flip: boolean; delay?: number }) {
  const p = owner(cell) as Player;
  return <span className={`relative block h-full w-full [container-type:size] ${latest ? 'scale-110' : ''} transition-transform`} style={{ fontSize: '100cqw' }}>
    <span className={`relative block h-full w-full [transform-style:preserve-3d] ${flip ? 'flip-omok-turn' : ''}`} style={flip ? { animationDelay: `${delay}ms` } : undefined}>
      <Face p={p} marked={isFlipped(cell)} />
      {flip && <Face p={other(p)} dizzy back />}
    </span>
    {latest && <span className="pointer-events-none absolute -inset-[14%] rounded-full border-2 border-[#ffd76b] shadow-[0_0_10px_#ffd76b]" />}
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
  const count = (p: Player) => board.filter((c) => owner(c) === p).length;
  const status = win ? t('wins', { name: name(win.owner) }) : draw ? t('draw') : aiTurn ? t('aiThinking') : t('turnOf', { name: name(turn) });
  const preview = hover !== null && !board[hover] && !over && !aiTurn ? play(board, hover, turn).flipped : [];
  const flippedSet = new Set(flipped);
  const previewSet = new Set(preview);
  // 쌍삼 points for whoever moves now (hidden while the AI thinks).
  const banned = useMemo(() => new Set(over || aiTurn ? [] : forbiddenPoints(board, turn)), [board, turn, over, aiTurn]);

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#06202a'), backgroundImage: fog('63, 184, 255') }}>
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
              <span className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${turn === 1 && !over ? 'border-[#67e8ff]/60 bg-[#67e8ff]/10' : 'border-white/10 bg-black/40'}`}><i className="h-3 w-3 rounded-full" style={{ background: STONE_HEX[1], boxShadow: `0 0 6px ${STONE_HEX[1]}` }} />{count(1)}</span>
              <span className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${turn === 2 && !over ? 'border-[#67e8ff]/60 bg-[#67e8ff]/10' : 'border-white/10 bg-black/40'}`}><i className="h-3 w-3 rounded-full" style={{ background: STONE_HEX[2], boxShadow: `0 0 6px ${STONE_HEX[2]}` }} />{count(2)}</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[700px] rounded-[10px] bg-gradient-to-br from-[#ff4d6d] via-[#26313f] to-[#3fb8ff] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_30px_rgba(63,184,255,.14)]">
            <div className="relative h-full w-full overflow-hidden rounded-[7px] border border-[#67e8ff]/20 bg-[#080c12] shadow-[inset_0_0_55px_rgba(0,0,0,.9),inset_0_0_24px_rgba(71,213,255,.08)]" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(72,213,255,.09), transparent 50%), linear-gradient(145deg,#0c121a,#06080d)' }} onMouseLeave={() => setHover(null)}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                {Array.from({ length: SIZE }, (_, i) => <g key={i}>
                  <line x1={pos(i)} y1={pos(0)} x2={pos(i)} y2={pos(SIZE - 1)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
                  <line x1={pos(0)} y1={pos(i)} x2={pos(SIZE - 1)} y2={pos(i)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
                </g>)}
                {STARS.map(([r, c]) => <circle key={`${r}${c}`} cx={pos(c)} cy={pos(r)} r=".65" fill="#b8f6ff" style={{ filter: 'drop-shadow(0 0 1.2px #56ddff)' }} />)}
                
              </svg>
              {board.map((cell, at) => {
                const r = Math.floor(at / SIZE), c = at % SIZE;
                const canPlace = !cell && !over && !aiTurn && !banned.has(at);
                return (
                  <button key={at} type="button" disabled={!canPlace} aria-label={coordinateLabel(at)}
                    onClick={() => place(at)} onMouseEnter={() => setHover(at)}
                    className={`absolute z-10 h-[6.2%] w-[6.2%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none [perspective:300px] ${canPlace ? 'cursor-pointer' : ''}`}
                    style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}>
                    {cell ? <span className={`relative block h-full w-full ${previewSet.has(at) ? 'opacity-55 rounded-full ring-2 ring-[#ffd76b] animate-pulse' : ''}`}>
                      {/* key changes on a flip so the animation replays */}
                      <Stone key={`${cell}-${flippedSet.has(at) ? history.length : 0}`} cell={cell} latest={at === last} flip={flippedSet.has(at)} delay={last === null ? 0 : (Math.max(Math.abs(r - Math.floor(last / SIZE)), Math.abs(c - (last % SIZE))) - 1) * 110} />
                    </span>
                      : banned.has(at) ? <svg viewBox="0 0 10 10" className="h-full w-full p-[22%]" aria-hidden><title>{t('banned')}</title><path d="M1 1L9 9M9 1L1 9" stroke="#ff4d6d" strokeOpacity=".75" strokeWidth="1.6" strokeLinecap="round" /></svg>
                      : hover === at && canPlace ? <span className="block h-full w-full rounded-full opacity-45 shadow-[0_0_12px_currentColor]" style={{ background: STONE_HEX[turn], color: STONE_HEX[turn] }} /> : null}
                  </button>
                );
              })}
              {win && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden><g className="flip-omok-win">
                  <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke={STONE_HEX[win.owner]} strokeWidth="1.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 2px ${STONE_HEX[win.owner]})` }} />
                  <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke="#fff" strokeWidth=".4" strokeLinecap="round" />
                </g></svg>}
              {toast && <div key={toast.key} className="flip-omok-toast pointer-events-none absolute left-1/2 top-[44%] z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-5 py-2.5 text-lg font-black text-white shadow-2xl sm:text-2xl">
                <Sparkles size={18} className="mr-1.5 inline" style={{ color: STONE_HEX[toast.who] }} />{t('flipToast', { n: toast.n })}
              </div>}
            </div>
          </div>
          {preview.length > 0 && <p className="mt-2 text-center text-[11px] font-bold text-[#ffd76b]">{t('previewHint', { n: preview.length })}</p>}
          {over && <div className="mt-4 flex justify-center"><button type="button" onClick={() => reset()} className={`${BTN_ACCENT} px-6 py-3 text-sm`}><RotateCcw size={15} />{t('again')}</button></div>}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('mode')}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {(['ai', 'local'] as Mode[]).map((m) => <button key={m} type="button" onClick={() => reset(m)} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-xs font-black transition ${mode === m ? 'bg-[#67e8ff] text-[#06202a]' : 'border border-white/10 bg-white/[.03] text-white/50 hover:text-white'}`}>{m === 'ai' ? <Bot size={14} /> : <Users size={14} />}{t(`modes.${m}`)}</button>)}
            </div>
            {mode === 'ai' && <>
              <p className={`${PANEL_TITLE} mt-4`}>{t('difficulty')}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(['easy', 'normal', 'hard'] as FlipDifficulty[]).map((d) => <button key={d} type="button" disabled={started} onClick={() => setDifficulty(d)} className={`rounded-md px-2 py-2 text-xs font-black transition ${difficulty === d ? 'bg-[#67e8ff] text-[#06202a]' : 'border border-white/10 bg-white/[.03] text-white/45 hover:text-white disabled:opacity-35'}`}>{t(`levels.${d}`)}</button>)}
              </div>
              {started && <p className="mt-2 text-[10px] text-white/35">{t('difficultyLocked')}</p>}
            </>}
          </section>

          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('rulesTitle')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">
              {(t.raw('rules') as string[]).map((rule) => <li key={rule} className="flex gap-2.5 break-keep"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#67e8ff]" />{rule}</li>)}
            </ul>
          </section>

          <section className="rounded-[14px] border border-[#67e8ff]/30 bg-[#67e8ff]/[.07] p-4">
            <p className={PANEL_TITLE}>{t('devTitle')}</p>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('devNote')}</p>
          </section>
          {last !== null && <p className="text-center text-[11px] text-white/35">{t('lastMove', { name: name(owner(board[last]) as Player), at: coordinateLabel(last) })}</p>}
        </aside>
      </main>
    </div>
  );
}
