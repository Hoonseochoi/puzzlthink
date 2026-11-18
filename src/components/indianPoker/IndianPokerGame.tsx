"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BrainCircuit, Clock3, Info, RotateCcw } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg, timer } from '@/components/ui/gameUi';
import { useLocalIndianPoker } from '@/hooks/useIndianPokerRoom';
import { POKER_AI_TARGET, type PokerDifficulty, maxMatchableBet } from '@/lib/indianPoker';
import { reportGame } from '@/lib/stats';
import { PokerHistory, PokerTable } from './IndianPokerParts';

const ACCENT = '#e6b94f';

export default function IndianPokerGame() {
  const t = useTranslations('IndianPoker');
  const { state, dispatch } = useLocalIndianPoker();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (!state || state.phase !== 'finished') return;
    reportGame(`indian-poker-ai-${state.sid}`, 'indian_poker', 'ai', state.winner === 'draw' ? 'draw' : state.winner === 0 ? 'win' : 'loss', { chips: state.chips[0], against: state.chips[1], hands: state.rounds.length, difficulty: state.aiLevel });
  }, [state]);
  if (!state) return null;

  const myTurn = state.phase === 'playing' && state.turn === 0;
  const reveal = state.phase === 'reveal' || state.phase === 'finished';
  const current = Math.max(...state.bets);
  const max = maxMatchableBet(state.chips, state.bets);
  const toCall = Math.max(0, current - state.bets[0]);
  const seconds = Math.max(0, Math.ceil((state.deadline - now) / 1000));
  const targets = state.opened
    ? [current, current + 1, current + 3, max]
    : [1, 3, 5, max];
  const uniqueTargets = [...new Set(targets.filter((n) => n >= (state.opened ? current : 1) && n <= max))];
  const last = state.rounds.at(-1);
  const status = state.phase === 'finished' ? (state.winner === 0 ? t('win') : state.winner === 1 ? t('lose') : t('draw'))
    : state.phase === 'reveal' && last ? (last.winner === 'draw' ? t('handDraw') : last.winner === 0 ? t('handWin') : t('handLose'))
      : myTurn ? t('yourTurn') : t('aiTurn');

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('230, 185, 79') }}>
      <GameHeader backHref="/indian-poker" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}><BugReport /><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2"><div><p className={KICKER}>{t('hand', { n: state.rounds.length + (state.phase === 'playing' ? 1 : 0) })}</p><h1 className={`mt-1 ${HEADING}`}>{status}</h1></div>{state.phase === 'playing' && <div className={timer(myTurn && seconds <= 8)}><Clock3 size={14} />0:{String(seconds).padStart(2, '0')}</div>}</div>
          <div className="space-y-3">
            <div title={t('tooltips.table')}><PokerTable cards={state.cards} names={[t('you'), t('ai')]} reveal={reveal} bets={state.bets} chips={state.chips} carry={state.carry} /></div>
            {myTurn && <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {uniqueTargets.map((total) => <button key={total} title={t(total === current && state.opened ? 'tooltips.call' : total === max ? 'tooltips.allIn' : 'tooltips.bet')} onClick={() => dispatch({ t: 'bet', total })} className={`${total === current && state.opened ? BTN_ACCENT : BTN} py-3 text-xs`}>{total === current && state.opened ? t('call', { n: toCall }) : total === max ? t('allIn', { n: total - state.bets[0] }) : t('bet', { n: total })}</button>)}
              {state.opened && toCall > 0 && <button title={t('tooltips.fold')} onClick={() => dispatch({ t: 'fold' })} className={`${BTN} py-3 text-xs text-[#ff9aa4]`}>{t('fold')}</button>}
            </div>}
            {state.phase === 'finished' && <button onClick={() => dispatch({ t: 'start' })} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t('again')}</button>}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('difficulty')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as PokerDifficulty[]).map((level) => <button key={level} title={t(`levelTips.${level}`)} disabled={state.phase === 'reveal' || (state.phase === 'playing' && state.opened)} onClick={() => dispatch({ t: 'config', aiLevel: level })} className={`py-2.5 ${seg(state.aiLevel === level)} disabled:opacity-40`}>{t(`levels.${level}`)}<span className="mt-0.5 block text-[9px] opacity-55">~{POKER_AI_TARGET[level]}%</span></button>)}</div><p className="mt-2 text-[10px] leading-4 text-white/40">{t('targetNote')}</p></section>
          <section className={PANEL}><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.16em] text-white/35"><Info size={12} />{t('tooltipsTitle')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('tips') as string[]).map((tip) => <li key={tip} className="flex gap-2"><BrainCircuit size={12} className="mt-1 shrink-0 text-(--accent)" /><span>{tip}</span></li>)}</ul></section>
          <section className={PANEL}><p className={PANEL_TITLE}>{t('history')}</p><div className="mt-3"><PokerHistory rounds={state.rounds} /></div></section>
          <section className={NOTE}><p className={PANEL_TITLE}>{t('quickRules')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('quick') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul></section>
        </aside>
      </main>
    </div>
  );
}
