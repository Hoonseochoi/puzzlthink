"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, History, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import GameUpdates from '@/components/GameUpdates';
import { MINE_OBLIVION_ROOM } from '@/hooks/useMineOblivionRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { useEndReveal } from '@/hooks/useEndReveal';
import { type MoLevel } from '@/lib/mineOblivionAi';
import { MO_MOVE_LIMIT } from '@/lib/mineOblivion';
import { type MoRoom, createMoRoom } from '@/lib/mineOblivionRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { EndRevealBanner } from '../ui/EndReveal';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { MO_ACCENT, MO_ROOT_STYLE, type MoCopy, endingText, moCopy } from './copy';
import MineOblivionTable, { moName } from './MineOblivionTable';
import MineOblivionResult, { useMoReport } from './MineOblivionResult';
import MineOblivionReplay from './MineOblivionReplay';
import MineOblivionTutorial, { useMoTutorial } from './MineOblivionTutorial';
import { MineStone, TreasureStone, WalkerStone } from './MineStones';

function readLevel(): MoLevel {
  if (typeof window === 'undefined') return 'normal';
  return new URLSearchParams(window.location.search).get('difficulty') === 'hard' ? 'hard' : 'normal';
}

/** The headline of the end reveal: who won, and how. */
export function revealText(room: MoRoom, mySeat: number | null, t: MoCopy) {
  const g = room.game;
  const head = g.winner === null ? t.draw : g.winner === mySeat ? t.winYou : mySeat === 0 || mySeat === 1 ? t.loseYou : t.win(moName(room, g.winner, mySeat, t));
  return `${head} · ${g.score[0]} : ${g.score[1]} · ${endingText(t, g.ending, MO_MOVE_LIMIT, g.resigned !== undefined ? moName(room, g.resigned, mySeat, t) : '')}`;
}

/** 망각의 지뢰 against the AI, all in this browser. */
export default function MineOblivionGame() {
  const locale = useLocale();
  const t = moCopy(locale);
  const [level] = useState(readLevel);
  const create = useCallback(() => createMoRoom({ id: 'me', name: t.you, at: 0 }, { solo: true, level }), [t.you, level]);
  const { state, dispatch, reset } = useLocalRoom(MINE_OBLIVION_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const tutorial = useMoTutorial();
  const finished = state?.phase === 'finished';
  const resultKey = state && finished ? `mo-${state.game.gid}` : null;
  const reveal = useEndReveal(resultKey);
  useMoReport(state, 0, 'ai');
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);
  const again = () => { setClosedKey(null); setReplaying(false); reset(); };

  return (
    <div className={SHELL} style={MO_ROOT_STYLE}>
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/mine-of-oblivion" backLabel={t.back} title={t.title} titleClass="font-black !text-[15px] min-[400px]:!text-lg sm:!text-xl" subtitle={`AI · ${t.levelName[level]}`}>
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <GameUpdates game="mine_oblivion" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={again} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && replaying && finished
          ? <MineOblivionReplay room={state} mySeat={0} t={t} onClose={() => { setReplaying(false); setClosedKey(resultKey); }} onShowResult={() => { setReplaying(false); setClosedKey(null); }} />
          : state && <MineOblivionTable room={state} mySeat={0} onAction={dispatch} t={t} reveal={finished} />}
        {finished && reveal.showResult && closedKey === resultKey && !replaying && (
          <div className="mx-auto mt-3 grid max-w-[560px] grid-cols-3 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-3`}><History size={14} />{t.replay}</button>
            <button type="button" onClick={again} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {state && finished && <EndRevealBanner show={reveal.revealing} text={revealText(state, 0, t)} color={MO_ACCENT} onSkip={reveal.skip} />}
      {state && finished && reveal.showResult && closedKey !== resultKey && !replaying && (
        <MineOblivionResult room={state} mySeat={0} t={t} onAgain={again} onClose={() => setClosedKey(resultKey)} onReplay={() => setReplaying(true)} />
      )}
      {rulesOpen && <MineOblivionRules t={t} onClose={() => setRulesOpen(false)} />}
      {tutorial.open && <MineOblivionTutorial t={t} onDone={tutorial.close} />}
    </div>
  );
}

/** Rules at a glance, what you see vs remember, how this differs from the show, and the AI levels. */
export function MineOblivionRules({ t, onClose }: { t: MoCopy; onClose: () => void }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-h-[85vh] max-w-md overflow-y-auto text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <div className="mt-3 flex items-center justify-center gap-3"><WalkerStone seat={0} size={40} /><MineStone size={44} state="armed" /><TreasureStone size={40} /><WalkerStone seat={1} size={40} /></div>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL_TITLE} mt-5`}>{t.seeTitle}</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-[12px] leading-5 text-white/60">
          <ul>{t.see.map((l) => <li key={l} className="break-keep">· {l}</li>)}</ul>
          <ul className="text-(--accent)/85">{t.remember.map((l) => <li key={l} className="break-keep">· {l}</li>)}</ul>
        </div>
        <p className={`${PANEL_TITLE} mt-5`}>{t.siteDiff}</p>
        <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-white/60">{t.siteDiffs.map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
        <p className="mt-4 break-keep text-[11px] leading-4 text-white/45">{t.aiNote}</p>
      </div>
    </div>
  );
}
