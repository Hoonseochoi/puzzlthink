"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronRight, Coins, Eye, EyeOff, LockKeyhole, RefreshCw, RotateCw, ShieldQuestion, Volume2, VolumeX, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { type RRAction } from '@/lib/russianRoulette';
import type { RussianRouletteRoom, RussianRouletteRoomAction } from '@/lib/russianRouletteRoom';
import { playCylinderSpin, playDryFire, playRevolverShot, unlockGameAudio } from '@/lib/gameAudio';
import RouletteCharacter from './RouletteCharacter';
import { RR_FIRE_FLASH_MS, RR_FIRE_LEAD_MS, RR_FIRE_ROTATE_MS, RR_FIRE_STEP_MS } from './firing';
import { RR_PANEL, RR_TITLE } from './theme';

type Pending = 'publicInspect' | 'privateInspect' | 'manipulate' | null;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const POSITIONS = [
  { left: '50%', top: '11%' }, { left: '88%', top: '30%' }, { left: '88%', top: '70%' },
  { left: '50%', top: '84%' }, { left: '12%', top: '70%' }, { left: '12%', top: '30%' },
];

export default function RussianRouletteTable({ room, mySeat, onAction, online }: {
  room: RussianRouletteRoom; mySeat: number | null; onAction: (action: RussianRouletteRoomAction) => void; online: boolean;
}) {
  const t = useTranslations('RussianRoulette');
  const [pending, setPending] = useState<Pending>(null);
  const [amount, setAmount] = useState<1 | 2 | 3>(1);
  const [suspected, setSuspected] = useState<number[]>([]);
  const game = room.game;
  // Muzzle turns are public; every player sees the same direction.
  const viewMuzzle = game.muzzle;
  const previousMuzzle = useRef(viewMuzzle);
  const totalRotation = game.rotations?.reduce((sum, steps) => sum + steps, 0) ?? 0;
  const pointerAngle = ((game.baseMuzzle ?? viewMuzzle) * 60) + totalRotation * 60;
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(soundOn);
  const [firingShot, setFiringShot] = useState(-1);
  const [revealedShots, setRevealedShots] = useState(0);
  const [firingAngle, setFiringAngle] = useState(-90);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const myTurn = mySeat !== null && game.phase === 'playing' && game.turn === mySeat && !room.ai[mySeat];
  const myCredits = mySeat === null ? null : game.credits[mySeat];
  const myFund = mySeat === null ? 0 : game.manipulation[mySeat];
  const needsPair = pending === 'manipulate' && myFund + amount >= 6;
  const privateIntel = mySeat === null ? Array(6).fill(null) : game.privateIntel[mySeat];
  const confirmedBullets = useMemo(() => game.publicIntel.map((value, i) => value ?? privateIntel[i]).map((value, i) => value ? LETTERS[i] : null).filter(Boolean), [game.publicIntel, privateIntel]);
  const visibleHits = game.phase === 'finished'
    ? game.shots.slice(0, revealedShots).filter((shot) => shot.fired).map((shot) => shot.target)
    : game.hits;

  // Speech bubble over whoever just acted: public inspections say which chambers, everything else stays secret.
  const [bubble, setBubble] = useState<{ seat: number; text: string; id: number } | null>(null);
  const actionKey = JSON.stringify(game.log.slice(0, 2));
  const previousKey = useRef(actionKey);
  useEffect(() => {
    if (previousKey.current === actionKey) return;
    previousKey.current = actionKey;
    const entry = game.log.find((e) => e.k !== 'round' && e.k !== 'pass' && e.k !== 'fire');
    if (!entry || !('seat' in entry)) return;
    const text = entry.k === 'publicInspect' ? t('bubblePublic', { a: LETTERS[entry.pair], b: LETTERS[(entry.pair + 1) % 6] })
      : entry.k === 'rotate' ? t('bubbleRotate', { n: entry.steps }) : t('bubbleSecret');
    const id = Date.now();
    const show = window.setTimeout(() => setBubble({ seat: entry.seat, text, id }), 0);
    const hide = window.setTimeout(() => setBubble((current) => current?.id === id ? null : current), 2300);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [actionKey, game.log, t]);

  useEffect(() => {
    if (previousMuzzle.current !== viewMuzzle && soundRef.current) playCylinderSpin();
    previousMuzzle.current = viewMuzzle;
  }, [viewMuzzle]);

  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    if (game.phase !== 'finished' || !game.shots.length) return;
    const timers: number[] = [];
    const firstTargetAngle = game.shots[0].target * 60 - 90;
    game.shots.forEach((shot, index) => {
      const aimAt = RR_FIRE_LEAD_MS + index * RR_FIRE_STEP_MS;
      timers.push(window.setTimeout(() => {
        setFiringShot(index);
        setFiringAngle(firstTargetAngle + index * 60);
        if (soundRef.current) playCylinderSpin();
      }, aimAt));
      timers.push(window.setTimeout(() => {
        setRevealedShots(index + 1);
        if (shot.fired) {
          setMuzzleFlash(true);
          if (soundRef.current) playRevolverShot();
        } else if (soundRef.current) playDryFire();
      }, aimAt + RR_FIRE_ROTATE_MS));
      timers.push(window.setTimeout(() => setMuzzleFlash(false), aimAt + RR_FIRE_ROTATE_MS + RR_FIRE_FLASH_MS));
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [game.phase, game.shots]);

  const act = (action: RRAction) => { unlockGameAudio(); onAction({ t: 'act', action }); setPending(null); };
  const toggleSound = () => {
    const next = !soundOn;
    soundRef.current = next;
    setSoundOn(next);
    if (next) unlockGameAudio();
  };
  const choosePair = (pair: number) => {
    if (!myTurn) return;
    if (pending === 'publicInspect') act({ kind: 'publicInspect', pair });
    if (pending === 'privateInspect') act({ kind: 'privateInspect', pair });
    if (pending === 'manipulate' && needsPair) act({ kind: 'manipulate', amount, pair });
  };
  const toggleSuspected = (seat: number) => {
    setSuspected((current) => current.includes(seat) ? current.filter((value) => value !== seat) : current.length < 2 ? [...current, seat] : [current[1], seat]);
  };
  const playerName = (seat: number) => seat === mySeat ? t('you') : room.seats[seat]?.name ?? `P${seat + 1}`;
  const currentShot = firingShot >= 0 ? game.shots[firingShot] : null;
  const currentShotResolved = currentShot !== null && revealedShots > firingShot;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="relative min-h-[560px] overflow-hidden rounded-[24px] border border-white/10 bg-[#080c12]/75 shadow-[inset_0_0_80px_rgba(46,189,224,.05)] sm:min-h-[650px]">
        <div className="absolute left-2 top-2 z-30 w-[104px] rounded-[12px] border border-[#65e5ff]/20 bg-[#0b111b]/90 p-2 sm:p-3 shadow-xl backdrop-blur sm:left-4 sm:top-4 sm:w-[188px]">
          <p className={RR_TITLE}>{t('confirmedTitle')}</p>
          <div className="mt-2 flex min-h-8 flex-wrap gap-1.5">
            {confirmedBullets.length ? confirmedBullets.map((letter) => <span key={letter} className="flex items-center gap-1 rounded-full bg-[#ffcf58]/15 px-2 py-1 font-mono text-[11px] font-black text-[#ffcf58]"><i className="h-2 w-2 rounded-full bg-[#ffcf58]" />{letter}</span>) : <span className="text-[11px] leading-5 text-white/35">{t('confirmedNone')}</span>}
          </div>
        </div>

        <div className="absolute inset-0">
          {POSITIONS.map((position, seat) => {
            const current = game.turn === seat && game.phase === 'playing';
            const hit = visibleHits.includes(seat);
            return (
              <button key={seat} type="button" onClick={() => toggleSuspected(seat)} style={position} className="absolute z-20 flex w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col items-center sm:w-[148px]" aria-label={t('markSuspect', { player: playerName(seat) })}>
                <AnimatePresence>{bubble?.seat === seat && <motion.span key={bubble.id} initial={{ opacity: 0, y: seat === 0 ? -6 : 6, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: .9 }} role="status" className={`pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-black shadow-[0_8px_24px_rgba(0,0,0,.55)] ${seat === 0 ? 'top-[calc(100%+4px)]' : 'bottom-[calc(100%+6px)]'} ${bubble.text === t('bubbleSecret') ? 'border-[#a978ed]/50 bg-[#1b1428] text-[#d7c2fb]' : 'border-[#ffcf58]/50 bg-[#262012] text-[#ffe29a]'}`}>{bubble.text}<i className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-[#ffffff00] ${seat === 0 ? '-top-1' : '-bottom-1'} ${bubble.text === t('bubbleSecret') ? 'bg-[#1b1428]' : 'bg-[#262012]'}`} /></motion.span>}</AnimatePresence>
                <RouletteCharacter seat={seat} selected={current} hit={hit} suspected={suspected.includes(seat)} label={playerName(seat)} className="h-[76px] sm:h-[104px]" />
                <span className={`mt-1.5 max-w-full truncate rounded-full border px-2.5 py-1 text-[10px] font-black backdrop-blur ${current ? 'border-[#65e5ff]/50 bg-[#65e5ff]/15 text-[#a7efff]' : 'border-white/10 bg-black/55 text-white/70'}`}><b className="mr-1 font-mono text-[#65e5ff]">{LETTERS[seat]}</b>{playerName(seat)}</span>
                <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-white/35"><Coins size={9} />{seat === mySeat ? game.credits[seat] : game.credits[seat] === 0 ? t('empty') : '••'} {game.credits[seat] === 0 && <span className="text-[#ff7b71]">· PASS</span>}</span>
              </button>
            );
          })}
        </div>

        <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 sm:h-[390px] sm:w-[390px]">
          <div className="absolute inset-[4%] rounded-full border border-[#65e5ff]/25 bg-[radial-gradient(circle,#263341_0%,#121923_62%,#080b10_63%)] shadow-[0_0_70px_rgba(67,204,235,.16),inset_0_0_45px_rgba(0,0,0,.8)]" />
          <div className={`pointer-events-none absolute left-1/2 top-1/2 z-30 h-[47%] w-4 origin-bottom transition-transform duration-[650ms] ease-[cubic-bezier(.2,.8,.2,1)] ${game.phase === 'finished' ? 'opacity-0' : ''}`} style={{ transform: `translate(-50%,-100%) rotate(${pointerAngle}deg)` }}>
            <span className="absolute left-1/2 top-[10px] h-[16%] w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-[#65e5ff]/0 to-[#65e5ff] shadow-[0_0_14px_#65e5ff]" />
            <span className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[9px] border-b-[15px] border-x-transparent border-b-[#65e5ff] drop-shadow-[0_0_8px_#65e5ff]" />
          </div>
          <div className="absolute inset-[20%] z-10 rounded-full border border-white/10 bg-[#0c1118] shadow-[inset_0_0_40px_#000]" />
          <div className={`absolute inset-0 z-20 transition-opacity duration-500 ${game.phase === 'finished' ? 'opacity-25' : ''}`}>
          {Array.from({ length: 6 }, (_, chamber) => {
            const angle = (chamber * 60 - 90) * Math.PI / 180;
            const left = 50 + Math.cos(angle) * 30;
            const top = 50 + Math.sin(angle) * 30;
            const publicValue = game.publicIntel[chamber];
            const privateValue = privateIntel[chamber];
            const value = game.phase === 'finished' ? game.chambers[chamber] : publicValue ?? privateValue;
            const source = game.phase === 'finished' ? 'final' : publicValue !== null ? 'public' : privateValue !== null ? 'private' : 'unknown';
            const active = pending !== null && (pending !== 'manipulate' || needsPair);
            return (
              <button key={chamber} type="button" disabled={!active || !myTurn} onClick={() => choosePair(chamber)} style={{ left: `${left}%`, top: `${top}%` }} className={`absolute z-20 flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] transition sm:h-[78px] sm:w-[78px] ${active && myTurn ? 'cursor-pointer hover:scale-110 hover:border-[#65e5ff]' : ''} ${source === 'public' ? 'border-[#ffcf58]/70 bg-[#302818]' : source === 'private' ? 'border-[#a978ed]/70 bg-[#271d35]' : source === 'final' ? 'border-white/35 bg-[#171d26]' : 'border-[#323c48] bg-[#111720]'}`}>
                <span className="absolute -top-4 rounded-full bg-[#0b1017] px-1.5 font-mono text-[9px] font-black text-white/45">{LETTERS[chamber]}</span>
                {value === true ? <span className="h-[52%] w-[52%] rounded-full border-4 border-[#8b5a2b] bg-[radial-gradient(circle_at_42%_35%,#fff3b0,#d99830_34%,#7b421a_70%)] shadow-[0_0_18px_rgba(255,207,88,.4)]" /> : value === false ? <span className="h-[44%] w-[44%] rounded-full border-2 border-white/15 bg-black/45" /> : <ShieldQuestion size={24} className="text-white/20" />}
                {source === 'private' && <LockKeyhole size={11} className="absolute -bottom-3 rounded-full bg-[#a978ed] p-0.5 text-white" />}
              </button>
            );
          })}
          </div>
          <div className="absolute left-1/2 top-1/2 z-30 flex h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/10 bg-[#090d13] shadow-xl">
            <span className="font-mono text-[9px] font-black tracking-[0.15em] text-[#65e5ff]/60">ROUND</span>
            <strong className="font-mono text-2xl text-white">{String(game.round).padStart(2, '0')}</strong>
          </div>
          {game.phase === 'finished' && firingShot >= 0 && <div className="pointer-events-none absolute -inset-[4%] z-50">
            <motion.div animate={{ rotate: firingAngle }} transition={{ duration: RR_FIRE_ROTATE_MS / 1000, ease: [.2, .75, .2, 1] }} className="absolute inset-[5%] flex items-center justify-center">
              <motion.img src="/russian-roulette/revolver-v1.png" alt="" animate={muzzleFlash ? { x: [0, -13, 4, 0], scale: [1, 1.035, .99, 1] } : { x: 0, scale: 1 }} transition={{ duration: .28 }} className="w-[94%] drop-shadow-[0_18px_24px_rgba(0,0,0,.72)]" />
              {muzzleFlash && <motion.span initial={{ scale: .15, opacity: 1 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: RR_FIRE_FLASH_MS / 1000 }} className="absolute right-[-2%] top-1/2 h-20 w-20 -translate-y-1/2 bg-[radial-gradient(circle,#fff_0%,#ffe58c_28%,#ff8a28_55%,transparent_72%)] [clip-path:polygon(50%_0%,61%_31%,98%_18%,72%_48%,100%_68%,65%_66%,61%_100%,43%_72%,15%_92%,27%_58%,0%_42%,38%_38%)] sm:h-28 sm:w-28" />}
            </motion.div>
            {currentShot && <div className="absolute bottom-[2%] left-1/2 min-w-40 -translate-x-1/2 rounded-full border border-white/10 bg-[#080c12]/90 px-4 py-2 text-center shadow-xl backdrop-blur">
              <p className="font-mono text-[9px] font-black tracking-[.12em] text-[#65e5ff]">{LETTERS[currentShot.chamber]} → {playerName(currentShot.target)}</p>
              <p className={`mt-0.5 text-[10px] font-black ${currentShotResolved && currentShot.fired ? 'text-[#ff7268]' : 'text-white/45'}`}>{currentShotResolved ? currentShot.fired ? t('loadedShot') : t('emptyShot') : t('cylinderTurning')}</p>
            </div>}
          </div>}
        </div>

        {pending && <div className="absolute bottom-3 left-1/2 z-40 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-[14px] border border-[#65e5ff]/25 bg-[#0b111b]/95 p-3 shadow-2xl backdrop-blur">
          <div><p className="text-xs font-black text-[#a7efff]">{t(`pending_${pending}`)}</p><p className="mt-0.5 text-[10px] text-white/40">{pending === 'manipulate' && !needsPair ? t('submitReady') : t('chooseAdjacent')}</p></div>
          <div className="flex items-center gap-2">{pending === 'manipulate' && !needsPair && <button onClick={() => act({ kind: 'manipulate', amount })} className="rounded-[10px] bg-[#65e5ff] px-3 py-2 text-xs font-black text-[#071016]"><Check size={14} /></button>}<button onClick={() => setPending(null)} className="rounded-[10px] border border-white/10 p-2 text-white/50"><X size={14} /></button></div>
        </div>}
      </section>

      <aside className="flex flex-col gap-3">
        <section className={RR_PANEL}>
          <div className="flex items-center justify-between"><p className={RR_TITLE}>{t('terminal')}</p><div className="flex items-center gap-2"><button onClick={toggleSound} aria-label={soundOn ? t('soundOn') : t('soundOff')} className="rounded-full border border-white/10 p-1.5 text-white/35 transition hover:text-white/70">{soundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button><span className={`h-2 w-2 rounded-full ${myTurn ? 'animate-pulse bg-[#65e5ff]' : 'bg-white/15'}`} /></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[12px] bg-white/[0.04] p-3"><p className="text-[9px] font-black tracking-widest text-white/30">CREDIT</p><p className="mt-1 font-mono text-2xl font-black text-[#ffcf58]">{myCredits ?? '—'}</p></div>
            <div className="rounded-[12px] bg-white/[0.04] p-3"><p className="text-[9px] font-black tracking-widest text-white/30">CONTROL</p><p className="mt-1 font-mono text-2xl font-black text-[#a978ed]">{myFund}<span className="text-xs text-white/25">/6</span></p></div>
          </div>
          <p className="mt-3 min-h-9 text-xs leading-5 text-white/50">{game.phase === 'finished' ? t('finished') : myTurn ? t('yourTurn') : t('waiting', { player: playerName(game.turn) })}</p>
        </section>

        <section className={`${RR_PANEL} space-y-1.5`}>
          <p className={`${RR_TITLE} mb-2`}>{t('actions')}</p>
          <ActionButton icon={<Eye size={15} />} label={t('publicInspect')} cost={1} disabled={!myTurn || (myCredits ?? 0) < 1} active={pending === 'publicInspect'} onClick={() => setPending('publicInspect')} />
          <ActionButton icon={<EyeOff size={15} />} label={t('privateInspect')} cost={2} disabled={!myTurn || (myCredits ?? 0) < 2} active={pending === 'privateInspect'} onClick={() => setPending('privateInspect')} />
          <ActionButton icon={<RotateCw size={15} />} label={t('rotate1')} cost={3} disabled={!myTurn || (myCredits ?? 0) < 3} onClick={() => act({ kind: 'rotate1' })} />
          <ActionButton icon={<RefreshCw size={15} />} label={t('rotate2')} cost={4} disabled={!myTurn || (myCredits ?? 0) < 4} onClick={() => act({ kind: 'rotate2' })} />
          <button disabled={!myTurn || (myCredits ?? 0) < 1} onClick={() => setPending('manipulate')} className={`w-full rounded-[11px] border p-2.5 text-left transition disabled:opacity-25 ${pending === 'manipulate' ? 'border-[#a978ed]/70 bg-[#a978ed]/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
            <span className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs font-extrabold"><LockKeyhole size={15} className="text-[#a978ed]" />{t('manipulate')}</span><span className="text-[9px] font-black text-[#a978ed]">1–3</span></span>
          </button>
          {pending === 'manipulate' && <div className="grid grid-cols-3 gap-1.5 pt-1">{([1, 2, 3] as const).map((value) => <button key={value} disabled={(myCredits ?? 0) < value} onClick={() => setAmount(value)} className={`rounded-[9px] border py-2 font-mono text-xs font-black ${amount === value ? 'border-[#a978ed] bg-[#a978ed]/20 text-[#d8baff]' : 'border-white/10 text-white/40'} disabled:opacity-20`}>+{value}</button>)}</div>}
        </section>

        <section className={RR_PANEL}>
          <p className={RR_TITLE}>{t('intelLegend')}</p>
          <div className="mt-3 space-y-2 text-[10px] text-white/45"><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#ffcf58]" />{t('publicIntel')}</p><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#a978ed]" />{t('privateIntel')}</p><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border border-[#ffcf58]" />{t('virtualTarget')}</p></div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[9px] leading-4 text-white/30">{t('suspectHint')}</p>
          {online && <p className="mt-3 border-t border-white/10 pt-3 text-[9px] leading-4 text-white/25">{t('privacyNote')}</p>}
        </section>
        <section className={RR_PANEL}>
          <p className={RR_TITLE}>{t('actionHistory')}</p>
          <div className="mt-3 space-y-2">{game.log.slice(0, 5).map((entry, index) => {
            const text = entry.k === 'round' ? t('logRound', { round: entry.round, player: playerName(entry.start) })
              : entry.k === 'publicInspect' ? t('logPublic', { player: playerName(entry.seat), a: LETTERS[entry.pair], b: LETTERS[(entry.pair + 1) % 6] })
                : entry.k === 'rotate' ? t('logRotate', { player: playerName(entry.seat), n: entry.steps })
                  : entry.k === 'pass' ? t('logPass', { player: playerName(entry.seat) })
                    : entry.k === 'fire' ? `${LETTERS[entry.chamber]} → ${playerName(entry.seat)} ${entry.fired ? '●' : '○'}`
                      : t('logSecret', { player: playerName(entry.seat) });
            return <p key={`${entry.k}-${index}`} className="flex gap-2 text-[10px] leading-4 text-white/40"><i className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${index === 0 ? 'bg-[#65e5ff]' : 'bg-white/15'}`} />{text}</p>;
          })}</div>
        </section>
      </aside>
    </div>
  );
}

function ActionButton({ icon, label, cost, disabled, active, onClick }: { icon: React.ReactNode; label: string; cost: number; disabled: boolean; active?: boolean; onClick: () => void }) {
  return <button disabled={disabled} onClick={onClick} className={`flex w-full items-center justify-between rounded-[11px] border p-2.5 transition disabled:opacity-25 ${active ? 'border-[#65e5ff]/70 bg-[#65e5ff]/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}><span className="flex items-center gap-2 text-xs font-extrabold text-white/80">{icon}{label}</span><span className="flex items-center gap-1 font-mono text-[9px] font-black text-[#ffcf58]"><Coins size={10} />{cost}<ChevronRight size={12} className="text-white/20" /></span></button>;
}
