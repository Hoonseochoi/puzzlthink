"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Check, Clock3, Crown, Hand, Info, X } from 'lucide-react';
import { type Chip, type Color, type LogEntry, CHIPS, COLORS, LIMIT, ROUNDS, canPass, sum } from '@/lib/heavy13';
import type { H13Action, H13Room } from '@/lib/heavy13Room';
import { ChipToken, CubeStack, RockCard } from './Bits';
import { STAND, SAND, SAND_INK } from './theme';
import TurnDrawer from '../ui/TurnDrawer';
import { BTN_ACCENT, DIAMOND, accentVars, HEADING, KICKER, PANEL, PANEL_TITLE, WELL, timer } from '../ui/gameUi';

/** Everything on the table. `room` should already be the redacted view for this player. */
export default function Heavy13Table({ room, mySeat, onAction, online }: {
  room: H13Room; mySeat: number | null; onAction: (action: H13Action) => void; online: boolean;
}) {
  const t = useTranslations('Heavy13');
  const g = room.game;
  const [card, setCard] = useState<number | null>(null);
  const [chip, setChip] = useState<Chip | null>(null);
  const [startTip, setStartTip] = useState(false); // "what does the start player do?" panel
  const [closedFor, setClosedFor] = useState<string | null>(null); // the turn whose drawer was tucked away
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(timer); }, []);

  const me = mySeat !== null ? g.players[mySeat] : null;
  const name = (seat: number) => (seat === mySeat ? t('you') : room.seats[seat]?.name ?? '');
  const iSubmitted = mySeat !== null && room.submitted[mySeat];
  const myTurn = g.phase === 'place' && g.current === mySeat && mySeat !== null;
  const mySub = myTurn ? g.subs[mySeat!] : null;
  const seconds = Number.isFinite(room.deadline) && room.deadline < Number.MAX_SAFE_INTEGER ? Math.max(0, Math.ceil((room.deadline - now) / 1000)) : null;
  // Each of my turns gets a key; a new one opens the drawer again (a pass brings a second placement turn).
  const turnKey = me && g.phase === 'submit' && !iSubmitted ? `s-${g.round}` : myTurn && mySub ? `p-${g.round}-${g.resolvingPasses ? 'r' : 'm'}` : null;
  const drawerOpen = turnKey !== null && closedFor !== turnKey;
  const lastLog = g.log[0];
  // `g.passed` is consumed again while deferred players place, so derive the complete
  // current-round pass history from the immutable log for display.
  const roundStart = g.log.findIndex((entry) => entry.k === 'round' && entry.round === g.round);
  const passOrder = g.log.slice(0, roundStart < 0 ? g.log.length : roundStart)
    .filter((entry): entry is Extract<LogEntry, { k: 'pass' }> => entry.k === 'pass')
    .reverse()
    .map((entry) => entry.seat);
  const fresh = (c: Color) => lastLog && (lastLog.k === 'place' || lastLog.k === 'collapse') && lastLog.color === c;
  const status = g.phase === 'finished' ? t('finished') : g.phase === 'submit' ? (iSubmitted || mySeat === null ? t('waitingSubmit', { n: room.submitted.filter(Boolean).length, total: g.players.length }) : t('chooseSubmit'))
    : myTurn ? t('yourPlacement') : t('placing', { player: name(g.current ?? 0) });

  const doSubmit = () => { if (card === null || !chip) return; onAction({ t: 'submit', sub: { card, chip } }); setCard(null); setChip(null); };
  const preview = (color: Color, value: number) => {
    const s = sum(g.stands[color]);
    return s + value >= LIMIT ? t('previewCollapse', { n: g.stands[color].length }) : t('previewSafe', { s: s + value });
  };
  const logLine = (e: LogEntry) => {
    switch (e.k) {
      case 'place': return t('logPlace', { player: name(e.seat), card: e.card, stand: t(`stand_${e.color}`) });
      case 'collapse': return t('logCollapse', { player: name(e.seat), card: e.card, stand: t(`stand_${e.color}`), n: e.count });
      case 'pass': return t('logPass', { player: name(e.seat) });
      case 'round': return t('logRound', { round: e.round, player: name(e.start) });
      case 'refill': return t('logRefill');
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-3 px-1 sm:px-2">
        <div className="min-w-0">
          <p className={`mb-1 ${KICKER}`}>ROUND {String(Math.min(g.round, ROUNDS)).padStart(2, '0')} / {ROUNDS}{g.round > ROUNDS / 2 ? ' · HAND 2' : ' · HAND 1'}</p>
          <h2 className={`truncate ${HEADING}`}>{status}</h2>
        </div>
        {seconds !== null && g.phase !== 'finished' && (
          <span className={timer(seconds <= 10 && (myTurn || (g.phase === 'submit' && !iSubmitted)))}><Clock3 size={16} />{seconds}s</span>
        )}
      </div>

      {g.phase === 'place' && (
        <div className="flex min-h-9 items-center gap-2 rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-2 sm:px-3">
          <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{t('passOrder')}</span>
          {passOrder.length ? <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
            {passOrder.map((seat, index) => <li key={seat} className="flex items-center gap-1 rounded-full border border-[#e6c48a]/25 bg-[#e6c48a]/10 px-2 py-1 text-[10px] font-bold text-[#f1d9ad]"><span className="font-mono text-[8px] text-[#e6c48a]/65">{index + 1}</span><span className="max-w-20 truncate">{name(seat)}</span></li>)}
          </ol> : <span className="text-[10px] text-white/30">{t('passOrderEmpty')}</span>}
        </div>
      )}

      {/* Stands */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {COLORS.map((c) => {
          const cubes = g.stands[c];
          const total = sum(cubes);
          const danger = total >= 10;
          return (
            <section key={c} className="flex flex-col rounded-[14px] border p-2.5 sm:p-3" style={{ borderColor: `${STAND[c].main}55`, background: STAND[c].soft }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-black" style={{ color: STAND[c].main }}><ChipToken chip={c} size={14} />{t(`stand_${c}`)}</span>
                <span className="text-[10px] font-bold text-white/45">{t('cubes', { n: cubes.length })}</span>
              </div>
              <p className={`mt-1 font-mono text-3xl font-black tabular-nums sm:text-4xl ${danger ? 'text-[#ff8a7a]' : 'text-white'}`}>{total}<span className="text-sm text-white/35">/{LIMIT}</span></p>
              <div className="mt-1.5 flex h-1.5 gap-[2px]">
                {Array.from({ length: LIMIT - 1 }).map((_, i) => <span key={i} className="flex-1 rounded-[1px]" style={{ background: i < total ? (i >= 9 ? '#ff6b5a' : STAND[c].main) : 'rgba(255,255,255,0.08)' }} />)}
              </div>
              <CubeStack cubes={cubes} color={STAND[c].main} freshLast={!!fresh(c)} className="mt-2 min-h-[110px] sm:mt-3 sm:min-h-[150px]" />
            </section>
          );
        })}
      </div>

      {/* Players */}
      <div className={`grid gap-1.5 sm:gap-2 ${g.players.length === 4 ? 'grid-cols-4 sm:grid-cols-4' : g.players.length <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-7'}`}>
        {Array.from({ length: g.players.length }, (_, s) => {
          const p = g.players[s];
          const sub = g.phase === 'place' ? g.subs[s] : null;
          const orderIdx = g.phase === 'place' ? g.placedOrder.indexOf(s) : -1;
          const active = g.phase === 'place' && g.current === s;
          return (
            <div key={s} className={`relative flex min-w-0 flex-col items-center rounded-[9px] border px-1.5 pb-1.5 pt-2 text-center sm:rounded-[10px] sm:px-2 sm:py-2.5 ${active ? 'border-(--accent)/60 bg-white/[0.06] shadow-[inset_0_0_20px_var(--accent-glow),0_0_16px_var(--accent-glow)]' : s === mySeat ? 'border-white/25 bg-white/[0.06]' : 'border-white/10 bg-black/30'}`}>
              {g.start === s && <button type="button" onClick={() => setStartTip((open) => !open)} title={t('startTipTitle')} aria-expanded={startTip} aria-controls="h13-start-tip" className="absolute -top-1.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-sm bg-(--accent) px-1 py-0.5 text-[7px] font-black text-(--accent-ink) hover:brightness-110 sm:-top-2 sm:px-1.5 sm:text-[8px]"><Crown size={7} />{t('startMark')}<Info size={7} className="hidden opacity-70 sm:block" /></button>}
              <span className="flex w-full min-w-0 items-center justify-center gap-0.5 truncate text-[9px] font-extrabold sm:gap-1 sm:text-[11px]">{room.ai[s] && <Bot size={9} className="shrink-0 text-white/40 sm:h-[11px] sm:w-[11px]" />}<span className="truncate">{name(s)}</span></span>
              <span className="mt-0.5 flex items-baseline gap-0.5 sm:mt-1 sm:block"><b className="font-mono text-base font-black sm:text-xl" style={{ color: p.penalty ? '#ff8a7a' : '#ffffff' }}>{p.penalty}</b><span className="text-[7px] font-bold text-white/35 sm:block sm:text-[9px]">{t('penalty')}</span></span>
              <div className="mt-0.5 flex h-5 items-center justify-center gap-0.5 sm:mt-1.5 sm:h-7 sm:gap-1">
                {g.phase === 'submit' && (room.submitted[s] ? <Check size={14} className="text-[#34c47c]" /> : <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />)}
                {sub && <><ChipToken chip={sub.chip} size={13} /><span className="origin-center scale-[.7] sm:scale-100"><RockCard value={sub.card} size="sm" /></span></>}
              </div>
              {orderIdx >= 0 && <span className="text-[8px] font-bold text-white/40 sm:text-[9px]">#{orderIdx + 1}</span>}
              {passOrder.includes(s) && <span className="h13-pass-pop absolute -right-1 top-[38%] z-20 rounded-md border border-[#e6c48a]/55 bg-[#211a10] px-1.5 py-1 text-[8px] font-black text-[#f5dba8] shadow-[0_5px_14px_rgba(0,0,0,.55)] after:absolute after:-bottom-1 after:left-2 after:h-2 after:w-2 after:rotate-45 after:border-b after:border-r after:border-[#e6c48a]/55 after:bg-[#211a10] sm:right-1 sm:text-[9px]">{t('passBubble')}</span>}
            </div>
          );
        })}
      </div>
      {startTip && (
        <div id="h13-start-tip" role="note" className="relative rounded-[10px] border border-(--accent)/30 bg-black/50 p-3 pr-9 text-[11px] leading-5 text-white/70">
          <button type="button" onClick={() => setStartTip(false)} aria-label={t('startTipClose')} className="absolute right-2 top-2 rounded p-1 text-white/40 hover:text-white"><X size={13} /></button>
          <p className="flex items-center gap-1 text-xs font-extrabold text-(--accent)"><Crown size={12} />{t('startTipTitle')}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">{(t.raw('startTipPoints') as string[]).map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      )}

      {/* My controls: a drawer from the right edge, opened by itself on my turn. */}
      <TurnDrawer active={turnKey !== null} open={drawerOpen} onOpen={() => setClosedFor(null)} onClose={() => setClosedFor(turnKey)} label={t('drawerHandle')} closeLabel={t('drawerClose')} style={accentVars(SAND, SAND_INK)}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-black text-(--accent)">{status}</p>
          {seconds !== null && <span className="font-mono text-xs font-bold text-white/55"><Clock3 size={12} className="mr-1 inline" />{seconds}s</span>}
        </div>
        {/* The stands at a glance, so the board can stay covered. */}
        <div className="mb-4 grid grid-cols-3 gap-1.5">
          {COLORS.map((c) => (
            <div key={c} className="rounded-md border px-2 py-1.5" style={{ borderColor: `${STAND[c].main}55`, background: STAND[c].soft }}>
              <span className="flex items-center gap-1 text-[10px] font-black" style={{ color: STAND[c].main }}><ChipToken chip={c} size={11} />{t(`stand_${c}`)}</span>
              <span className={`font-mono text-lg font-black ${sum(g.stands[c]) >= 10 ? 'text-[#ff8a7a]' : 'text-white'}`}>{sum(g.stands[c])}<span className="text-[10px] text-white/35">/{LIMIT} · {g.stands[c].length}</span></span>
            </div>
          ))}
        </div>
        {me && g.phase === 'submit' && !iSubmitted && (
          <section className="space-y-3">
            <p className={PANEL_TITLE}>{t('myCards')}</p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((v) => {
                const has = me.cards.includes(v);
                return <button key={v} type="button" disabled={!has} onClick={() => setCard(v)} aria-label={t('cardLabel', { n: v })}><RockCard value={v} dim={!has} selected={card === v} /></button>;
              })}
            </div>
            <p className={PANEL_TITLE}>{t('myChips')}</p>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <button key={c} type="button" disabled={!me.chips[c]} onClick={() => setChip(c)} className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold transition ${chip === c ? 'border-(--accent) bg-(--accent)/15 shadow-[0_0_14px_var(--accent-glow)]' : 'border-white/10 bg-black/30 hover:border-white/25'} disabled:opacity-30`}>
                  <ChipToken chip={c} size={20} />{t(`chip_${c}`)}<span className="text-white/40">×{me.chips[c]}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={doSubmit} disabled={card === null || !chip} className={`w-full py-3 text-sm ${BTN_ACCENT}`}>{t('submit')}</button>
          </section>
        )}
        {myTurn && mySub && (
          <section className="space-y-3">
            <div className="flex items-center gap-3"><ChipToken chip={mySub.chip} size={26} /><RockCard value={mySub.card} /><p className="text-xs text-white/60">{mySub.chip === 'w' ? t('chooseStand') : t('placeOn', { stand: t(`stand_${mySub.chip}`) })}</p></div>
            <div className="grid grid-cols-2 gap-2">
              {(mySub.chip === 'w' ? [...COLORS] : [mySub.chip]).map((c) => (
                <button key={c} type="button" onClick={() => onAction({ t: 'place', color: c })} className="rounded-[10px] border px-2 py-2.5 text-left transition hover:brightness-125" style={{ borderColor: `${STAND[c].main}80`, background: STAND[c].soft }}>
                  <span className="block text-xs font-black" style={{ color: STAND[c].main }}>{t('placeHere', { stand: t(`stand_${c}`) })}</span>
                  <span className="block text-[10px] text-white/55">{preview(c, mySub.card)}</span>
                </button>
              ))}
              {canPass(g) && <button type="button" onClick={() => onAction({ t: 'pass' })} className="flex flex-col items-start rounded-[10px] border border-white/15 bg-black/30 px-2 py-2.5 text-left hover:bg-white/10"><span className="flex items-center gap-1 text-xs font-black"><Hand size={12} />{t('pass')}</span><span className="text-[10px] text-white/50">{t('passHint')}</span></button>}
            </div>
          </section>
        )}

      </TurnDrawer>
      {me && g.phase === 'submit' && iSubmitted && <p className={`${WELL} p-3 text-center text-xs text-white/55`}>{t('submittedWait')}</p>}

      <section className={`min-h-[142px] ${PANEL}`}>
        <p className={`mb-3 ${PANEL_TITLE}`}>{t('log')}</p>
        <ul className="space-y-2">{g.log.slice(0, online ? 6 : 8).map((e, i) => <li key={`${g.seq}-${i}`} className={`flex gap-2 text-[11px] leading-relaxed ${i === 0 ? 'text-white/80' : 'text-white/45'}`}>{i === 0 ? <span className={DIAMOND} /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{logLine(e)}</span></li>)}</ul>
      </section>
    </div>
  );
}
