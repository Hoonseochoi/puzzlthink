"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock3, Eye, Flag, Info, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, timer } from '@/components/ui/gameUi';
import { type GyulCard, type Hap, allHaps, dealGyulCards, hapKey, isHap, remainingHaps } from '@/lib/gyulhap';
import { reportGame } from '@/lib/stats';
import { BoardExitRule, BoardExitToast, exitDetail, useBoardExits } from '@/hooks/useBoardExits';
import { GyulBoard, GyulFound, GyulScore } from './GyulhapParts';

const ACCENT = '#ffcf3f';
type Mode = 'challenge10' | 'challenge5' | 'practice';
type Notice = { key: 'hapOk' | 'hapBad' | 'gyeolOk' | 'gyeolBad'; at: number } | null;
const DURATION: Record<Mode, number> = { challenge10: 10 * 60_000, challenge5: 5 * 60_000, practice: 0 };
const readMode = (): Mode => {
  if (typeof window === 'undefined') return 'challenge10';
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'challenge5' || mode === 'practice' ? mode : 'challenge10';
};
const clock = (ms: number) => `${Math.floor(ms / 60_000)}:${String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')}`;

export default function GyulhapGame() {
  const t = useTranslations('Gyulhap');
  const [mode] = useState<Mode>(readMode);
  const [cards, setCards] = useState<GyulCard[]>(dealGyulCards);
  const [found, setFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [notice, setNotice] = useState<Notice>(null);
  const [revealed, setRevealed] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [answerFocus, setAnswerFocus] = useState<Hap | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [endsAt, setEndsAt] = useState(() => DURATION[readMode()] ? Date.now() + DURATION[readMode()] : 0);
  const [finished, setFinished] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const reported = useRef(false);
  const [voided, setVoided] = useState(false); // left the board too often: this run isn't ranked

  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(id); }, []);

  const timeLeft = endsAt ? Math.max(0, endsAt - now) : 0;
  const { exits: exitCount, warn: exitWarn } = useBoardExits(mode !== 'practice' && endsAt > 0 && !finished);
  const answers = allHaps(cards);
  const nextBoard = useCallback(() => {
    setCards(dealGyulCards()); setFound([]); setSelected([]); setRevealed(false); setGaveUp(false); setAnswerFocus(null); setRound((n) => n + 1);
  }, []);
  const finish = useCallback(() => {
    setFinished(true); setEndsAt(0); setSelected([]);
  }, []);

  useEffect(() => {
    if (!endsAt || timeLeft > 0 || finished) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock reaching zero ends a timed challenge
    finish();
  }, [endsAt, timeLeft, finished, finish]);
  useEffect(() => {
    if (!finished || mode === 'practice' || reported.current) return;
    reported.current = true;
    const exits = exitDetail(exitCount());
    setVoided('voided' in exits);
    reportGame(`gyulhap-solo-${startedAt}`, 'gyulhap', 'solo', score > 0 ? 'win' : 'loss', {
      ...exits, mode, score, rounds: round, durationMs: Date.now() - startedAt,
    });
  }, [finished, mode, score, round, startedAt, exitCount]);

  const flash = (key: NonNullable<Notice>['key']) => setNotice({ key, at: Date.now() });
  const toggle = (index: number) => setSelected((old) => old.includes(index) ? old.filter((n) => n !== index) : old.length < 3 ? [...old, index] : old);
  const callHap = () => {
    if (selected.length !== 3 || finished || revealed) return;
    const picks = [...selected].sort((a, b) => a - b) as Hap;
    const key = hapKey(picks);
    const ok = !found.includes(key) && isHap(picks.map((n) => cards[n]));
    setScore((n) => n + (ok ? 1 : -1));
    if (ok) setFound((list) => [...list, key]);
    setSelected([]); flash(ok ? 'hapOk' : 'hapBad');
  };
  const callGyeol = () => {
    if (finished || revealed) return;
    const ok = remainingHaps(cards, found).length === 0;
    setScore((n) => n + (ok ? 3 : -1));
    flash(ok ? 'gyeolOk' : 'gyeolBad');
    if (ok) nextBoard();
  };
  const revealAnswers = (giveUp: boolean) => {
    if (finished) return;
    setSelected([]); setAnswerFocus(answers[0] ?? null); setGaveUp(giveUp); setRevealed(true); setNotice(null);
  };
  const restart = () => {
    const at = Date.now();
    setCards(dealGyulCards()); setFound([]); setSelected([]); setScore(0); setRound(1); setNotice(null); setRevealed(false); setGaveUp(false); setAnswerFocus(null);
    setStartedAt(at); setEndsAt(DURATION[mode] ? at + DURATION[mode] : 0); setFinished(false); setVoided(false); reported.current = false;
  };
  const noticeOn = notice && now - notice.at < 1800;

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('255, 207, 63') }}>
      <BoardExitToast warn={exitWarn} />
      <GameHeader backHref="/gyulhap" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
      </GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div><p className={KICKER}>{t(`modes.${mode}`)} · {t('soloRound', { n: round })}</p><h1 className={`mt-1 ${HEADING}`}>{finished ? t('timeUp', { n: score }) : revealed ? t(gaveUp ? 'giveUpHeading' : 'answerHeading') : noticeOn ? t(`notices.${notice!.key}`) : t('soloPrompt')}</h1></div>
            {mode !== 'practice' && !finished && <div className={timer(timeLeft <= 60_000)}><Clock3 size={14} />{clock(timeLeft)}</div>}
          </div>
          <div className="space-y-3">
            <GyulScore names={[t('you')]} scores={[score]} active={finished ? undefined : 0} />
            <GyulBoard cards={cards} selected={answerFocus ?? selected} onSelect={toggle} disabled={finished || revealed} />
            {!finished && <GyulFound cards={cards} found={found} title={t('foundTitle')} empty={t('foundEmpty')} className="lg:hidden" />}
            {revealed && !finished && <div className="rounded-[14px] border border-(--accent)/35 bg-(--accent)/[.07] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2"><p className={PANEL_TITLE}>{t('answersTitle')}</p><span className="font-mono text-xs font-black text-(--accent)">{t('answerCount', { n: answers.length })}</span></div>
              {answers.length ? <div className="mt-3 flex flex-wrap gap-2">{answers.map((hap) => { const key = hapKey(hap); const used = found.includes(key); const focused = answerFocus && hapKey(answerFocus) === key; return <button key={key} type="button" onClick={() => setAnswerFocus(hap)} className={`rounded-md border px-2.5 py-1.5 font-mono text-xs font-black transition ${focused ? 'border-(--accent) bg-(--accent) text-(--accent-ink)' : used ? 'border-[#34c47c]/40 bg-[#34c47c]/10 text-[#7ee2ae]' : 'border-white/15 bg-black/25 text-white/65'}`}>{hap.map((n) => n + 1).join(' · ')}{used ? ' ✓' : ''}</button>; })}</div> : <p className="mt-3 rounded-md bg-black/25 px-3 py-2 text-center text-sm font-black text-(--accent)">{t('noHapAnswer')}</p>}
              <div className="mt-3 rounded-md border border-white/10 bg-black/25 p-3"><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.14em] text-(--accent)"><Sparkles size={12} />{t('answerTipTitle')}</p><ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-white/60">{(t.raw('answerRevealTips') as string[]).map((tip) => <li key={tip}>· {tip}</li>)}</ul></div>
              <button type="button" onClick={nextBoard} className={`${BTN_ACCENT} mt-3 w-full py-3 text-sm`}><SkipForward size={14} />{t('nextBoard')}</button>
            </div>}
            {!finished && !revealed ? <div className="grid grid-cols-3 gap-2">
              <button type="button" title={t('tooltips.hap')} disabled={selected.length !== 3} onClick={callHap} className={`${BTN_ACCENT} py-3 text-sm disabled:opacity-35`}>{t('hap')}</button>
              <button type="button" title={t('tooltips.gyeol')} onClick={callGyeol} className={`${BTN} py-3 text-sm`}>{t('gyeol')}</button>
              {mode === 'practice' ? <button type="button" onClick={() => revealAnswers(false)} className={`${BTN} py-3 text-sm`}><Eye size={14} />{t('answerCheck')}</button> : <button type="button" onClick={() => revealAnswers(true)} className={`${BTN} py-3 text-sm text-[#ffb2aa]`}><Flag size={14} />{t('giveUp')}</button>}
            </div> : finished ? <button type="button" onClick={restart} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t('again')}</button> : null}
            {mode !== 'practice' && (finished ? voided && <BoardExitRule voided /> : <BoardExitRule />)}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          {!finished && <GyulFound cards={cards} found={found} title={t('foundTitle')} empty={t('foundEmpty')} className="hidden lg:block" />}
          <section className={PANEL}><p className={PANEL_TITLE}>{t('session')}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><p className="text-[10px] text-white/40">{t('score')}</p><b className="font-mono text-xl text-(--accent)">{score}</b></div><div><p className="text-[10px] text-white/40">{t('boards')}</p><b className="font-mono text-xl">{round}</b></div><div><p className="text-[10px] text-white/40">{t('foundLabel')}</p><b className="font-mono text-xl">{found.length}</b></div></div></section>
          <section className={PANEL}><p className="flex items-center gap-1.5 text-[10px] font-black tracking-[.16em] text-white/35"><Info size={12} />{t('tooltipsTitle')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('tips') as string[]).map((tip) => <li key={tip} className="flex gap-2"><Sparkles size={12} className="mt-1 shrink-0 text-(--accent)" /><span>{tip}</span></li>)}</ul></section>
          <section className={NOTE}><p className={PANEL_TITLE}>{t('quickRules')}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{(t.raw('quickSolo') as string[]).map((rule) => <li key={rule}>· {rule}</li>)}</ul></section>
        </aside>
      </main>
    </div>
  );
}
