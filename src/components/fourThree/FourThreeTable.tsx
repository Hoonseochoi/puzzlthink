"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Check, Crown, Gem, Hand, Move as MoveIcon, Timer, X } from 'lucide-react';
import { HEADING, KICKER, NOTE, PANEL, PANEL_TITLE, playerRow, seg, timer } from '@/components/ui/gameUi';
import { type Move, CELLS, CELL_NAME, MAX_HEIGHT, NEIGHBORS, ROUNDS, top } from '@/lib/fourThree';
import { type FtAction, type FtRoom, playersWonRound } from '@/lib/fourThreeRoom';
import { type CellMark, COLOR_KEYS, FT_COLORS, FtBoard, FtPiece, HandRow } from './FourThreeParts';
import FourThreeRulesTip from './FourThreeRulesTip';
import { RoomPieces } from '../PieceStone';

/** The play area shared by the AI game and online rooms: status, board, players and the mission track. */
function FourThreeTableInner({ room, mySeat, onAction }: { room: FtRoom; mySeat: number | null; onAction: (a: FtAction) => void }) {
  const t = useTranslations('FourThree');
  const game = room.game;
  const [now, setNow] = useState(() => Date.now());
  const [mode, setMode] = useState<'place' | 'move'>('place');
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 300); return () => window.clearInterval(id); }, []);

  const current = game.order[game.turn];
  const playing = room.phase === 'playing';
  const myTurn = playing && mySeat !== null && current === mySeat && !room.ai[mySeat];
  const myHand = mySeat !== null ? game.hand[mySeat] ?? 0 : 0;
  const myTops = mySeat === null ? [] : game.board.map((s, i) => (top(s) === mySeat && NEIGHBORS[i].some((j) => game.board[j].length < MAX_HEIGHT) ? i : -1)).filter((i) => i >= 0);
  const canPlace = myHand > 0 && game.board.some((s) => s.length < MAX_HEIGHT);
  const effMode: 'place' | 'move' = !canPlace ? 'move' : myTops.length === 0 ? 'place' : mode;

  // A new turn starts with nothing selected.
  const turnKey = `${room.round}-${game.plies}`;
  const [seenKey, setSeenKey] = useState(turnKey);
  if (seenKey !== turnKey) { setSeenKey(turnKey); setSelected(null); }

  const send = (move: Move) => { setSelected(null); onAction({ t: 'move', move }); };
  const marks: CellMark[] = Array.from({ length: CELLS }, (_, i) => {
    if (!myTurn) return null;
    if (effMode === 'place') return game.board[i].length < MAX_HEIGHT ? 'place' : null;
    if (selected !== null && NEIGHBORS[selected].includes(i) && game.board[i].length < MAX_HEIGHT) return 'target';
    return myTops.includes(i) ? 'pick' : null;
  });
  const onCell = (i: number) => {
    if (!myTurn) return;
    if (effMode === 'place') return send({ kind: 'place', to: i });
    if (selected !== null && marks[i] === 'target') return send({ kind: 'move', from: selected, to: i });
    if (myTops.includes(i)) setSelected(selected === i ? null : i);
  };

  const name = (seat: number) => {
    const s = room.seats[seat];
    if (!s) return '—';
    return seat === mySeat && s.name !== t('you') ? `${s.name} (${t('you')})` : s.name;
  };
  const left = Math.max(0, Math.ceil((room.deadline - now) / 1000));
  const last = game.last;
  const lastText = !last ? t('firstHint')
    : last.kind === 'pass' ? t('lastPass', { who: name(last.by) })
      : last.kind === 'place' ? t('lastPlace', { who: name(last.by), cell: CELL_NAME(last.to) })
        : t('lastMove', { who: name(last.by), from: CELL_NAME(last.from), to: CELL_NAME(last.to) });

  const lastResult = room.results[room.results.length - 1];
  const roundText = (r: { winners: number[]; guest: number }) =>
    r.winners.length === 0 ? t('roundNone')
      : r.winners.length > 1 ? (r.winners.includes(r.guest) ? t('roundJointGuest') : t('roundJoint', { names: r.winners.map(name).join(', ') }))
        : r.winners[0] === r.guest ? t('roundGuest') : t('roundWin', { who: name(r.winners[0]) });

  const status = room.phase === 'roundEnd' || room.phase === 'finished' ? (lastResult ? roundText(lastResult) : '')
    : myTurn ? (effMode === 'place' ? t('pickPlace') : selected === null ? t('pickPiece') : t('pickTarget'))
      : room.ai[current] ? t('aiThinking', { who: name(current) }) : t('waitingFor', { who: name(current) });

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
        <div className="min-w-0">
          <p className={KICKER}>{t('roundKicker', { n: Math.min(room.round + 1, ROUNDS), total: ROUNDS })}</p>
          <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FourThreeRulesTip />
          {playing && <span className={timer(left <= 10)}><Timer size={14} />{left}</span>}
        </div>
      </div>

      <div className="relative">
        <FtBoard board={game.board} guest={room.guest} marks={marks} selected={selected} onCell={onCell}
          lastTo={last && last.kind !== 'pass' ? last.to : null} lastFrom={last && last.kind === 'move' ? last.from : null}
          lines={room.phase === 'playing' ? [] : game.lines} />
        {room.phase === 'roundEnd' && lastResult && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-3">
            <div className="rounded-full border border-white/15 bg-black/80 px-4 py-2 text-center text-xs font-black text-white shadow-xl">
              {roundText(lastResult)} · {t('nextIn', { n: Math.max(0, Math.ceil((room.breakEnd - now) / 1000)) })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-10 flex-wrap items-center justify-between gap-2 px-1">
        {myTurn ? (
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" disabled={!canPlace} onClick={() => { setMode('place'); setSelected(null); }} className={`flex items-center gap-1.5 px-3 py-2 disabled:opacity-35 ${seg(effMode === 'place')}`}><Hand size={13} />{t('modePlace', { n: myHand })}</button>
            <button type="button" disabled={myTops.length === 0} onClick={() => setMode('move')} className={`flex items-center gap-1.5 px-3 py-2 disabled:opacity-35 ${seg(effMode === 'move')}`}><MoveIcon size={13} />{t('modeMove')}</button>
          </div>
        ) : <span className="text-[11px] text-white/45">{lastText}</span>}
        {myTurn && <span className="text-[11px] text-white/45">{lastText}</span>}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t('players')}</p>
          <div className="mt-2 space-y-1.5">
            {game.order.map((seat) => {
              const isGuest = seat === room.guest;
              return (
                <div key={seat} data-chat-seat={room.seats[seat]?.id} className={playerRow(playing && current === seat)}>
                  <div className="h-9 w-9 shrink-0"><FtPiece color={seat} guest={isGuest} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-extrabold">
                        {room.ai[seat] && <Bot size={12} className="shrink-0 text-white/40" />}
                        <span className="truncate">{name(seat)}</span>
                        <span className="shrink-0 text-[10px] font-bold" style={{ color: FT_COLORS[seat] }}>{t(`color.${COLOR_KEYS[seat]}`)}</span>
                      </p>
                      {isGuest
                        ? <span className="shrink-0 rounded bg-[#ff4d5e] px-1.5 py-0.5 text-[9px] font-black text-white">{t('guestTag')}</span>
                        : <span className="flex shrink-0 items-center gap-1 font-mono text-xs font-black text-(--accent)"><Gem size={12} />{room.pieces[seat]}</span>}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2"><HandRow color={seat} count={game.hand[seat]} guest={isGuest} />{room.away?.[seat] && <span className="text-[9px] font-bold text-white/40">{t('awayTag')}</span>}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t('mission')}</p>
          <p className="mt-1.5 break-keep text-[11px] leading-4 text-white/50">{t('missionDesc')}</p>
          <ol className="mt-3 grid grid-cols-4 gap-1.5">
            {Array.from({ length: ROUNDS }, (_, i) => {
              const r = room.results[i];
              const ok = r && playersWonRound(r);
              const solo = r && r.winners.length === 1 && r.winners[0] !== r.guest ? r.winners[0] : null;
              return (
                <li key={i} className={`flex aspect-square flex-col items-center justify-center rounded-md border text-[10px] font-black ${!r ? (i === room.round && room.phase !== 'finished' ? 'border-(--accent)/60 text-(--accent)' : 'border-white/10 text-white/30') : ok ? 'border-[#3ddc97]/50 bg-[#3ddc97]/10 text-[#3ddc97]' : 'border-[#ff4d5e]/50 bg-[#ff4d5e]/10 text-[#ff8b96]'}`}>
                  <span>R{i + 1}</span>
                  {r && (ok ? (solo !== null ? <span className="mt-0.5 h-3 w-3"><FtPiece color={solo} /></span> : <Check size={12} />) : <X size={12} />)}
                </li>
              );
            })}
          </ol>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-white/40"><Crown size={11} className="text-(--accent)" />{t('finalNote')}</p>
        </section>
      </div>

      <section className={`mt-4 ${NOTE}`}>
        <h2 className={PANEL_TITLE}>{t('quickRules')}</h2>
        <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
      </section>
    </div>
  );
}

/** FourThreeTable with every player's own 바둑알 on their pieces (PieceStone). */
export default function FourThreeTable(props: Parameters<typeof FourThreeTableInner>[0]) {
  return <RoomPieces seats={props.room.seats} me={props.mySeat} ai={props.room.ai}><FourThreeTableInner {...props} /></RoomPieces>;
}
