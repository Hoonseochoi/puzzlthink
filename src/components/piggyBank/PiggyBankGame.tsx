"use client";

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import GameHeader from '@/components/ui/GameHeader';
import { BTN_ACCENT, MAIN, SHELL, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { type PbAction, type PbLevel, type PbState, act, autoAdvance, createPiggyBank, ranking } from '@/lib/piggyBank';
import { GoldPig } from './PiggyParts';
import { PiggyAside, PiggyTable } from './PiggyTable';

// 돼지 저금통 against three AI players; the engine drives the AI and the time limits.
const ME = 0;
const NAMES = ['나', '토끼', '곰', '여우'];
export const PIGGY_ACCENT = '#ffd84a';

export default function PiggyBankGame() {
  const [level, setLevel] = useState<PbLevel>('normal');
  const [state, setState] = useState<PbState | null>(null);
  const stateRef = useRef<PbState | null>(null);

  const start = () => {
    const s = createPiggyBank(NAMES, [false, true, true, true], level);
    stateRef.current = s;
    setState(s);
  };
  const apply = (next: PbState | null) => { if (next) { stateRef.current = next; setState(next); } };
  const onAct = (action: PbAction) => { if (stateRef.current) apply(act(stateRef.current, ME, action)); };

  // AI moves, time limits and reveal pauses.
  useEffect(() => {
    const timer = window.setInterval(() => { if (stateRef.current) apply(autoAdvance(stateRef.current)); }, 200);
    return () => window.clearInterval(timer);
  }, []);

  // Record a finished game once (signed-in players): first place counts as a win.
  useEffect(() => {
    if (!state || state.phase !== 'finished') return;
    const place = ranking(state).indexOf(ME) + 1;
    reportGame(`piggy_bank-ai-${state.order.join('')}-${state.seq}`, 'piggy_bank', 'ai', place === 1 ? 'win' : 'loss',
      { level: state.level, place, score: state.players[ME].score, scores: state.players.map((p) => p.score) });
  }, [state]);

  const shell = { ...accentVars(PIGGY_ACCENT, '#2a1d00'), backgroundImage: fog('90, 110, 210') };
  if (!state) {
    return (
      <div className={SHELL} style={shell}>
        <GameHeader backHref="/piggy-bank" backLabel="돼지 저금통" title="돼지 저금통" subtitle="VS AI · 4인" />
        <main className="relative z-10 mx-auto max-w-lg px-5 py-14 text-center">
          <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((n) => <GoldPig key={n} label={n} size={52} />)}</div>
          <h1 className="mt-6 text-3xl font-black">돼지 저금통</h1>
          <p className="mt-3 break-keep text-sm leading-6 text-white/60">저금통에 넣은 동전을 기억해서 점수를 얻는 게임이에요. 넣은 동전은 잠깐 공개되고 사라지니, 잘 기억하세요. 5점을 먼저 얻으면 끝나요.</p>
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-1.5">
            {(['easy', 'normal', 'hard'] as PbLevel[]).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)}`}>{{ easy: 'AI 쉬움', normal: 'AI 보통', hard: 'AI 어려움' }[l]}</button>)}
          </div>
          <p className="mt-2 text-[11px] text-white/40">AI 3명은 기억력이 서로 달라요. 보통은 쉬움·보통·어려움이 한 명씩이에요.</p>
          <button type="button" onClick={start} className={`${BTN_ACCENT} mt-6 px-8 py-3.5 text-sm`}>게임 시작 (나 + AI 3명)</button>
        </main>
      </div>
    );
  }

  return (
    <div className={SHELL} style={shell}>
      <GameHeader backHref="/piggy-bank" backLabel="돼지 저금통" title="돼지 저금통" subtitle="VS AI · 4인">
        <button type="button" onClick={start} className={BTN_ACCENT}><RotateCcw size={14} />새 게임</button>
      </GameHeader>
      <main className={MAIN}>
        <PiggyTable s={state} me={ME} onAct={onAct} onAgain={start} />
        <PiggyAside s={state} me={ME} onAct={onAct} />
      </main>
    </div>
  );
}
