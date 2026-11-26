"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BrainCircuit, Clock3, Info, RotateCcw, Trophy } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg, timer } from '@/components/ui/gameUi';
import { useLocalIndianPoker } from '@/hooks/useIndianPokerRoom';
import { POKER_AI_TARGET, POKER_TELLS, type PokerDifficulty } from '@/lib/indianPoker';
import { pokerPersonaOf } from '@/lib/indianPokerRoom';
import { personaName, personaTalk, shouldTalk } from '@/lib/aiPersona';
import { PersonaReveal, PersonaRoster, PersonaTag, usePersonaSay } from '@/components/ui/AiPersona';
import { reportGame } from '@/lib/stats';
import { PokerHistory, PokerStage, pokerView } from './IndianPokerParts';
import { IndianPokerResultModal } from './IndianPokerResult';
import GameUpdates from '@/components/GameUpdates';

const ACCENT = '#e6b94f';

export default function IndianPokerGame() {
  const t = useTranslations('IndianPoker');
  const { state, dispatch } = useLocalIndianPoker();
  const [now, setNow] = useState(() => Date.now());
  const [closedSid, setClosedSid] = useState<string | null>(null); // the result popup was closed for this match
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id); }, []);
  const en = useLocale() === 'en';
  const [say, talk] = usePersonaSay();
  const persona = state ? pokerPersonaOf(state, 1) : 'calc';
  // Table talk on public events only: a new match, the AI's own fold or big bet, each hand's result, the end.
  const seen = useRef({ sid: '', hands: 0, act: '' });
  useEffect(() => {
    if (!state) return;
    const s = seen.current;
    if (state.sid !== s.sid) { seen.current = { sid: state.sid, hands: state.rounds.length, act: '' }; talk(personaTalk(persona, 'hello', en)); return; }
    const act = state.lastAct && state.lastAct.side === 1 ? `${state.rounds.length}-${state.lastAct.kind}-${state.lastAct.total}` : '';
    let ev: Parameters<typeof personaTalk>[1] | null = null;
    if (state.phase === 'finished' && s.hands !== -1) { ev = state.winner === 1 ? 'winGame' : state.winner === 0 ? 'loseGame' : null; s.hands = -1; }
    else if (state.rounds.length > s.hands && s.hands !== -1) { const w = state.rounds.at(-1)!.winner; ev = w === 1 ? 'winRound' : w === 0 ? 'loseRound' : null; s.hands = state.rounds.length; }
    else if (act && act !== s.act && state.lastAct) { ev = state.lastAct.kind === 'fold' ? 'fold' : state.lastAct.kind === 'allIn' || state.lastAct.add >= 4 ? 'bold' : null; }
    s.act = act || s.act;
    if (ev && shouldTalk(ev)) talk(personaTalk(persona, ev, en));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reacts to the room state only
  }, [state]);
  useEffect(() => {
    if (!state || state.phase !== 'finished') return;
    reportGame(`indian-poker-ai-${state.sid}`, 'indian_poker', 'ai', state.winner === 'draw' ? 'draw' : state.winner === 0 ? 'win' : 'loss', { chips: state.chips[0], against: state.chips[1], hands: state.rounds.length, difficulty: state.aiLevel, persona: pokerPersonaOf(state, 1) });
  }, [state]);
  if (!state) return null;

  const view = pokerView(state, 0);
  const names: [string, string] = [t('you'), personaName(persona, en)];
  const myTurn = state.phase === 'playing' && state.turn === 0;
  const seconds = Math.max(0, Math.ceil((state.deadline - now) / 1000));
  const finished = state.phase === 'finished';
  const again = () => { setClosedSid(null); dispatch({ t: 'start' }); };
  const reason = state.winner === 'draw' ? t('end.drawReason') : state.winner === 0 ? t('end.byChips', { n: state.rounds.length }) : t('end.lostChips', { n: state.rounds.length });

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('230, 185, 79') }}>
      <GameHeader ai backHref="/indian-poker" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}><GameUpdates game="indian_poker" /><BugReport /><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <PersonaTag id={persona} en={en} say={say} className="mb-2 px-1" />
          <PokerStage
            view={view} names={names} canAct onBet={(total) => dispatch({ t: 'bet', total })} onFold={() => dispatch({ t: 'fold' })}
            kicker={t('hand', { n: state.rounds.length + (state.phase === 'playing' ? 1 : 0) })} waitText={t('aiTurn')}
            clock={state.phase === 'playing' ? <div className={timer(myTurn && seconds <= 8)}><Clock3 size={14} />0:{String(seconds).padStart(2, '0')}</div> : null}
            footer={finished && <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setClosedSid(null)} className={`${BTN} py-3 text-xs`}><Trophy size={14} />{t('end.showResult')}</button>
              <button type="button" onClick={again} className={`${BTN_ACCENT} py-3 text-sm`}><RotateCcw size={14} />{t('again')}</button>
            </div>}
          />
        </section>
        <aside className="flex flex-col gap-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('difficulty')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as PokerDifficulty[]).map((level) => <button key={level} title={t(`levelTips.${level}`)} disabled={state.phase === 'reveal' || (state.phase === 'playing' && state.opened)} onClick={() => dispatch({ t: 'config', aiLevel: level })} className={`py-2.5 ${seg(state.aiLevel === level)} disabled:opacity-40`}>{t(`levels.${level}`)}<span className="mt-0.5 block text-[9px] opacity-55">~{POKER_AI_TARGET[level]}%</span></button>)}</div><p className="mt-2 text-[10px] leading-4 text-white/40">{t('targetNote')}</p><p className={`${PANEL_TITLE} mt-4`}>{t('personaTitle')}</p><div className="mt-2"><PersonaRoster en={en} note={t('personaNote')} /></div></section>
          <section className={PANEL}><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.16em] text-white/35"><Info size={12} />{t('tooltipsTitle')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('tips') as string[]).map((tip) => <li key={tip} className="flex gap-2"><BrainCircuit size={12} className="mt-1 shrink-0 text-(--accent)" /><span>{tip}</span></li>)}</ul></section>
          <section className={PANEL}><p className={PANEL_TITLE}>{t('history')}</p><div className="mt-3"><PokerHistory rounds={view.rounds} names={names} /></div></section>
          <section className={NOTE}><p className={PANEL_TITLE}>{t('quickRules')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('quick') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul></section>
        </aside>
      </main>
      {finished && state.winner !== null && closedSid !== state.sid && (
        <IndianPokerResultModal
          winner={state.winner} chips={state.chips[0]} reason={`${reason} · ${t('end.level', { level: t(`levels.${state.aiLevel}`) })}`}
          rounds={view.rounds} names={names} onClose={() => setClosedSid(state.sid)} onAgain={again}
          extra={<PersonaReveal id={persona} en={en} tell={POKER_TELLS[persona]} />}
        />
      )}
    </div>
  );
}
