"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, X } from 'lucide-react';
import { LiarStone } from './LiarArt';

// 히든 워드: 라이어 tutorial (six swipeable cards) and the in-game tip bubbles.
// The tutorial opens by itself the first time a player enters a room (until 「다시 보지 않기」), and from the room's
// header menu or the entry page any time (openLiarTutorial()). Tips show the first TIP_TIMES times each, a tap
// dismisses one for good, and the header's "도움말 다시 보기" brings them all back.

const OFF_KEY = 'hwl_tutorial_off';
const OPEN_EVENT = 'hwl-tutorial';
const TIP_EVENT = 'hwl-tips';
const TIP_TIMES = 3;
const tipKey = (id: string) => `hwl_tip_${id}`;
export const tutorialOff = () => { try { return localStorage.getItem(OFF_KEY) === '1'; } catch { return false; } };
export const openLiarTutorial = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const resetLiarTips = () => {
  try { Object.keys(localStorage).filter((k) => k.startsWith('hwl_tip_')).forEach((k) => localStorage.removeItem(k)); } catch { /* optional */ }
  window.dispatchEvent(new Event(TIP_EVENT));
};

const COPY = {
  ko: {
    title: '라이어 게임 하는 법', skip: '건너뛰기', next: '다음', start: '시작하기', off: '다시 보지 않기', open: '튜토리얼',
    cards: [
      { t: '한 명만 다른 단어', d: '모두 같은 제시어를 받는데, 한 명만 같은 묶음의 비슷한 단어를 받아요. 그 사람이 라이어예요. 라이어 본인도 몰라요!' },
      { t: '떠오르는 명사 하나', d: '내 차례가 되면 테이블 가운데 칸에 제시어에서 연상되는 명사를 하나 적어요. 20초 안에! 같은 단어는 다시 못 써요.' },
      { t: '숫자를 읽어요', d: '단서 옆 숫자는 시민 제시어와 얼마나 비슷한지예요. 85 이상은 🔥85+로 가려져요. 혼자 숫자가 어긋나는 사람이 수상해요.' },
      { t: '지목할까, 한 바퀴 더?', d: '한 바퀴가 끝나면 다 같이 골라요. 라이어 같은 사람이 있으면 지목, 아직 모르겠으면 한 바퀴 더. 아이콘을 눌러 👁 의심 표시도 할 수 있어요.' },
      { t: '최후의 발언 → 검거', d: '가장 많이 뽑힌 사람은 20초 동안 변론해요. 그다음 나머지가 「검거하기」나 「다시 투표하기」를 골라요. 다시 투표는 한 판에 한 번!' },
      { t: '마지막 기회와 피스', d: '검거된 사람이 라이어면 시민 제시어를 한 번 맞힐 수 있어요. 맞히면 라이어 역전승. 라이어로 이기면 피스 3개, 시민으로 이기면 1개(하루 7개까지).' },
    ],
  },
  en: {
    title: 'How to play Liar', skip: 'Skip', next: 'Next', start: 'Start', off: 'Don\'t show again', open: 'Tutorial',
    cards: [
      { t: 'One word is different', d: 'Everyone gets the same word except one player, who gets a look-alike from the same group. That player is the liar, and they don\'t know it!' },
      { t: 'Say one noun', d: 'On your turn, type one noun the word brings to mind in the box in the middle of the table. 20 seconds! Words already said can\'t be used again.' },
      { t: 'Read the numbers', d: 'The number by each clue is how close it is to the citizens\' word. 85+ is hidden as 🔥85+. Someone whose numbers are off is suspicious.' },
      { t: 'Accuse or one more round?', d: 'After a round, everyone picks: accuse if someone looks like the liar, or go round again. Tap a player to mark 👁 suspicion.' },
      { t: 'Last words → arrest', d: 'The most-voted player gets 20 s to defend themselves, then the others choose Arrest or Vote again (once a game).' },
      { t: 'Last chance and pieces', d: 'An arrested liar gets one guess at the citizens\' word. Right, and the liar wins. Win as the liar for 3 pieces, as a citizen for 1 (7 a day).' },
    ],
  },
};

/** The six cards' drawings, in the table's colours. */
function Art({ i }: { i: number }) {
  const chip = (w: string, n: string, c: string) => <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[12px] font-black text-[#241457] shadow">{w}<span className="rounded-full px-1 text-[10px] text-white" style={{ background: c }}>{n}</span></span>;
  const card = (w: string, liar = false) => <span className={`rounded-md px-2 py-1 text-[12px] font-black shadow ${liar ? 'bg-[#ff5a3d] text-white ring-2 ring-white/70' : 'bg-white text-[#241457]'}`}>{w}</span>;
  if (i === 0) return (
    <div className="flex items-end justify-center gap-2">
      {['커피', '커피', '우유', '커피'].map((w, k) => (
        <div key={k} className="flex flex-col items-center gap-1">{card(w, k === 2)}<span className={k === 2 ? 'hwl-glow rounded-full' : ''}><LiarStone id={`tut0-${k}`} name="" size={k === 2 ? 58 : 46} /></span></div>
      ))}
    </div>
  );
  if (i === 1) return (
    <div className="w-[230px] rounded-2xl border border-[#ffd36e]/60 bg-[#1b1530] p-2.5 shadow-[0_0_30px_rgba(255,211,110,.25)]">
      <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#ffd36e] font-mono text-[12px] font-black">14</span><span className="text-[12px] font-black text-[#ffd36e]">내 차례! 떠오르는 명사 하나</span></div>
      <div className="mt-2 flex gap-1"><span className="flex-1 rounded-xl border-2 border-[#ffd36e] bg-black/60 py-1.5 text-center text-[15px] font-black">원두</span><span className="rounded-xl bg-[#ffd36e] px-2 py-1.5 text-[11px] font-black text-[#241457]">제시어 내기</span></div>
    </div>
  );
  if (i === 2) return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5">{chip('카페', '82', '#ff9a3d')}{chip('원두', '🔥85+', '#ff5a3d')}</div>
      <div className="flex gap-1.5">{chip('아침', '70', '#ff9a3d')}{chip('젖소', '31', '#7fd0ff')}</div>
      <span className="text-[11px] font-bold text-[#ffd36e]">↑ 혼자 숫자가 낮다면…?</span>
    </div>
  );
  if (i === 3) return (
    <div className="grid w-[220px] grid-cols-2 gap-1.5">
      <span className="flex flex-col items-center rounded-xl bg-[#ff8a6d] py-2 text-[13px] font-black text-[#2a0d05]">🗳 지목하자<span className="text-[10px] opacity-70">3</span></span>
      <span className="flex flex-col items-center rounded-xl bg-white/10 py-2 text-[13px] font-black">🔄 한 바퀴 더<span className="text-[10px] opacity-70">1</span></span>
      <span className="col-span-2 mt-1 flex items-center justify-center gap-1 text-[11px] font-black text-[#ffd36e]">👁 2 · 의심 1위</span>
    </div>
  );
  if (i === 4) return (
    <div className="flex flex-col items-center">
      <span className="rounded-full" style={{ filter: 'drop-shadow(0 0 16px rgba(255,138,109,.6))' }}><LiarStone id="tut4" name="" size={64} /></span>
      <span className="mt-1 text-[13px] font-black text-[#ff8a6d]">⚖️ 최후의 발언 20초</span>
      <div className="mt-2 flex gap-1.5"><span className="rounded-xl bg-[#ff8a6d] px-3 py-1.5 text-[12px] font-black text-[#2a0d05]">🚔 검거하기</span><span className="rounded-xl bg-white/10 px-3 py-1.5 text-[12px] font-black">🔄 다시 투표</span></div>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="rotate-[-4deg] rounded-xl border-[3px] border-[#7fe3a0] px-3 py-1 text-[18px] font-black text-[#7fe3a0]">라이어 검거 성공!</span>
      <div className="flex gap-1.5"><span className="rounded-full bg-[#ffd36e] px-2 py-0.5 text-[11px] font-black text-[#3a2600]">🎭 라이어 승 · 피스 +3</span><span className="rounded-full bg-[#ffd36e] px-2 py-0.5 text-[11px] font-black text-[#3a2600]">🕵️ 시민 승 · 피스 +1</span></div>
    </div>
  );
}

/**
 * The tutorial modal. `auto`: open by itself once (unless turned off). `pause`: the game needs the player now
 * (their turn / their guess): the tutorial closes so it never costs them the clock.
 */
export default function LiarTutorial({ auto = false, pause = false }: { auto?: boolean; pause?: boolean }) {
  const en = useLocale() === 'en';
  const t = en ? COPY.en : COPY.ko;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [off, setOff] = useState(false);
  const down = useRef<number | null>(null);
  useEffect(() => {
    const show = () => { setStep(0); setOff(tutorialOff()); setOpen(true); };
    window.addEventListener(OPEN_EVENT, show);
    const first = auto && !tutorialOff() ? window.setTimeout(show, 600) : null;
    return () => { window.removeEventListener(OPEN_EVENT, show); if (first) window.clearTimeout(first); };
  }, [auto]);
  useEffect(() => { if (pause && open) { const id = window.setTimeout(() => setOpen(false), 0); return () => window.clearTimeout(id); } }, [pause, open]);
  if (!open) return null;
  const last = step === t.cards.length - 1;
  const close = () => { try { localStorage.setItem(OFF_KEY, off ? '1' : '0'); } catch { /* optional */ } setOpen(false); };
  const go = (d: number) => setStep((s) => Math.max(0, Math.min(t.cards.length - 1, s + d)));
  const c = t.cards[step];
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={close}>
      <div role="dialog" aria-label={t.title} onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => { down.current = e.clientX; }}
        onPointerUp={(e) => { if (down.current != null && Math.abs(e.clientX - down.current) > 40) go(e.clientX < down.current ? 1 : -1); down.current = null; }}
        className="hwl-pop relative flex w-full max-w-[360px] touch-pan-y select-none flex-col overflow-hidden rounded-[28px] border border-[#a98bff]/35 bg-[#15111f] text-white shadow-[0_30px_80px_rgba(0,0,0,.6)]">
        <button type="button" onClick={close} aria-label={t.skip} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70"><X size={16} /></button>
        <div className="flex h-[200px] items-center justify-center bg-[radial-gradient(ellipse_at_50%_30%,#3b2a75,#15111f_75%)]">
          <div key={step} className="hwl-enter">{<Art i={step} />}</div>
        </div>
        <div className="px-6 pb-4 pt-4 text-center">
          <p className="text-[11px] font-black tracking-[0.12em] text-[#c9b6ff]">{step + 1} / {t.cards.length}</p>
          <h3 className="mt-1 text-[20px] font-black tracking-tight">{c.t}</h3>
          <p className="mt-2 min-h-[72px] break-keep text-[13px] font-medium leading-[1.6] text-white/70">{c.d}</p>
        </div>
        <div className="flex justify-center gap-1.5 pb-3">
          {t.cards.map((_, k) => <button key={k} type="button" aria-label={`${k + 1}`} onClick={() => setStep(k)} className={`h-1.5 rounded-full transition-all ${k === step ? 'w-5 bg-[#ffd36e]' : 'w-1.5 bg-white/25'}`} />)}
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          <label className="flex flex-1 items-center gap-1.5 text-[12px] font-bold text-white/60">
            <input type="checkbox" checked={off} onChange={(e) => setOff(e.target.checked)} className="h-4 w-4 accent-[#a98bff]" />{t.off}
          </label>
          {!last && <button type="button" onClick={close} className="px-2 py-2 text-[12px] font-bold text-white/45">{t.skip}</button>}
          <button type="button" onClick={() => (last ? close() : go(1))} className="rounded-xl bg-[#a98bff] px-4 py-2 text-[13px] font-black text-[#1a1030]">{last ? t.start : t.next}</button>
        </div>
      </div>
    </div>
  );
}

/** The entry page's "튜토리얼" button. */
export function TutorialButton({ className = '' }: { className?: string }) {
  const en = useLocale() === 'en';
  return <button type="button" onClick={openLiarTutorial} className={`flex items-center justify-center gap-1.5 ${className}`}><BookOpen size={14} />{en ? COPY.en.open : COPY.ko.open}</button>;
}

/** Whether tip `id` should still show (seen fewer than TIP_TIMES times and not dismissed); re-read when tips are reset. */
export function useTip(id: string | null) {
  const [, force] = useState(0);
  useEffect(() => { const fn = () => force((n) => n + 1); window.addEventListener(TIP_EVENT, fn); return () => window.removeEventListener(TIP_EVENT, fn); }, []);
  const counted = useRef<string | null>(null);
  const count = (() => { if (!id) return TIP_TIMES; try { return Number(localStorage.getItem(tipKey(id)) ?? 0); } catch { return TIP_TIMES; } })();
  const show = !!id && count < TIP_TIMES;
  // one showing = one count (the first time this id appears in this phase)
  useEffect(() => {
    if (!id || !show || counted.current === id) return;
    counted.current = id;
    try { localStorage.setItem(tipKey(id), String(count + 1)); } catch { /* optional */ }
  }, [id, show, count]);
  const dismiss = () => { if (!id) return; try { localStorage.setItem(tipKey(id), String(TIP_TIMES)); } catch { /* optional */ } force((n) => n + 1); };
  return { show, dismiss };
}

/** A speech bubble pointing at something (tap to dismiss). `arrow`: which side the pointer is on. */
export function TipBubble({ text, onClose, arrow = 'down', className = '', style }: { text: string; onClose: () => void; arrow?: 'down' | 'up'; className?: string; style?: React.CSSProperties }) {
  return (
    <button type="button" onClick={onClose} style={style}
      className={`hwl-tip pointer-events-auto absolute z-50 w-max max-w-[250px] rounded-2xl bg-[#fff8e6] px-3 py-2 text-left text-[12px] font-bold leading-snug text-[#2a1a5e] shadow-[0_10px_30px_rgba(0,0,0,.45)] ${className}`}>
      <span className="break-keep">💡 {text}</span>
      <span className="ml-1 text-[10px] font-black text-[#2a1a5e]/45">✕</span>
      <span className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#fff8e6] ${arrow === 'down' ? '-bottom-1.5' : '-top-1.5'}`} />
    </button>
  );
}
