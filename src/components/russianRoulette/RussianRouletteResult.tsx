"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RussianRouletteRoom } from '@/lib/russianRouletteRoom';
import { playCylinderSpin, playDryFire, playRevolverShot, unlockGameAudio } from '@/lib/gameAudio';
import ResultActions from '../ResultActions';
import RouletteCharacter from './RouletteCharacter';

export default function RussianRouletteResult({ room, mySeat, onAgain, waitingLabel, exitPath = '/' }: {
  room: RussianRouletteRoom; mySeat: number | null; onAgain?: () => void; waitingLabel?: string; exitPath?: string;
}) {
  const t = useTranslations('RussianRoulette');
  const shots = room.game.shots;
  const [activeShot, setActiveShot] = useState(-1);
  const [revealed, setRevealed] = useState(0);
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(shots.length === 0);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(soundOn);
  const hit = mySeat !== null && room.game.hits.includes(mySeat);
  const name = (seat: number) => seat === mySeat ? t('you') : room.seats[seat]?.name ?? `P${seat + 1}`;

  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  useEffect(() => {
    const timers: number[] = [];
    shots.forEach((shot, index) => {
      const start = 450 + index * 1050;
      timers.push(window.setTimeout(() => {
        setActiveShot(index);
        if (soundRef.current) playCylinderSpin();
      }, start));
      timers.push(window.setTimeout(() => {
        setRevealed(index + 1);
        if (shot.fired) {
          setFlash(true);
          if (soundRef.current) playRevolverShot();
        } else if (soundRef.current) playDryFire();
      }, start + 380));
      timers.push(window.setTimeout(() => setFlash(false), start + 650));
    });
    timers.push(window.setTimeout(() => setDone(true), 650 + shots.length * 1050));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [shots]);

  const currentShot = activeShot >= 0 ? shots[activeShot] : null;
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) unlockGameAudio();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <motion.div animate={flash ? { x: [0, -12, 5, 0], rotate: [0, -0.8, 0.35, 0] } : { x: 0, rotate: 0 }} transition={{ duration: .3 }} className="relative w-full max-w-2xl overflow-hidden rounded-[26px] border border-[#65e5ff]/20 bg-[#101722] p-5 text-white shadow-[0_0_90px_rgba(101,229,255,.14)] sm:p-6">
        <div className="flex items-center justify-between"><p className="text-[10px] font-black tracking-[0.28em] text-[#65e5ff]">FINAL TRIGGER</p><button onClick={toggleSound} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-[9px] font-bold text-white/45">{soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}{soundOn ? t('soundOn') : t('soundOff')}</button></div>

        {!done ? <div className="pt-2 text-center">
          <h2 className="text-xl font-black sm:text-2xl">{t('firingSequence')}</h2>
          <p className="mt-1 font-mono text-[10px] tracking-[.16em] text-white/30">{Math.min(revealed + 1, shots.length)} / {shots.length}</p>
          <div className="relative mx-auto mt-2 h-[210px] max-w-[560px] sm:h-[270px]">
            <div className="absolute inset-0 flex items-center justify-center"><motion.img src="/russian-roulette/revolver-v1.png" alt="" animate={activeShot >= 0 ? { y: [0, -2, 0], scale: flash ? [1, 1.035, .99, 1] : [1, 1.006, 1] } : { y: 0, scale: 1 }} transition={{ duration: flash ? .28 : .42 }} className="w-[95%] drop-shadow-[0_22px_28px_rgba(0,0,0,.65)]" /></div>
            {activeShot >= 0 && !flash && <motion.span initial={{ rotate: 0, opacity: .2 }} animate={{ rotate: 300, opacity: [0, .8, 0] }} transition={{ duration: .34 }} className="absolute left-[35%] top-[46%] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#ffcf58]/70 sm:h-20 sm:w-20" />}
            {flash && <motion.span initial={{ scale: .2, opacity: 1 }} animate={{ scale: 1.35, opacity: 0 }} transition={{ duration: .3 }} className="absolute right-[-1%] top-[39%] h-20 w-20 bg-[radial-gradient(circle,#fff_0%,#ffe58c_28%,#ff8a28_55%,transparent_72%)] [clip-path:polygon(50%_0%,61%_31%,98%_18%,72%_48%,100%_68%,65%_66%,61%_100%,43%_72%,15%_92%,27%_58%,0%_42%,38%_38%)] sm:h-28 sm:w-28" />}
          </div>
          <div className="mx-auto -mt-3 flex min-h-20 max-w-xs items-center justify-center gap-3 rounded-[14px] border border-white/10 bg-black/25 p-3">
            {currentShot ? <><RouletteCharacter seat={currentShot.target} hit={flash && currentShot.fired} label={name(currentShot.target)} className="h-14 shrink-0" /><div className="text-left"><p className="font-mono text-[10px] font-black text-[#65e5ff]">{String.fromCharCode(65 + currentShot.chamber)} → {name(currentShot.target)}</p><p className={`mt-1 text-sm font-black ${currentShot.fired && revealed > activeShot ? 'text-[#ff7268]' : 'text-white/55'}`}>{revealed > activeShot ? currentShot.fired ? t('loadedShot') : t('emptyShot') : t('cylinderTurning')}</p></div></> : <p className="text-xs font-bold text-white/40">{t('cylinderTurning')}</p>}
          </div>
          <div className="mt-3 flex min-h-6 flex-wrap justify-center gap-1.5">{shots.slice(0, revealed).map((shot, i) => <span key={i} className={`rounded-full px-2 py-1 font-mono text-[9px] font-black ${shot.fired ? 'bg-[#ff7268]/20 text-[#ff948d]' : 'bg-white/[0.05] text-white/30'}`}>{String.fromCharCode(65 + shot.chamber)} → {name(shot.target)} {shot.fired ? '●' : '○'}</span>)}</div>
        </div> : <>
          <p className="mt-2 text-center text-[9px] font-black tracking-[.2em] text-white/30">{t('resultReady')}</p>
          <h2 className={`mt-1 text-center text-3xl font-black ${hit ? 'text-[#ff7268]' : 'text-[#8ff0c6]'}`}>{mySeat === null ? t('gameOver') : hit ? t('eliminated') : t('survived')}</h2>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {room.seats.map((_, seat) => <div key={seat} className={`rounded-[12px] border p-2 text-center ${room.game.hits.includes(seat) ? 'border-[#ff7268]/35 bg-[#ff7268]/10' : 'border-[#8ff0c6]/20 bg-[#8ff0c6]/[0.05]'}`}><RouletteCharacter seat={seat} hit={room.game.hits.includes(seat)} label={name(seat)} className="mx-auto h-11" /><p className="mt-1 truncate text-[9px] font-bold text-white/55">{name(seat)}</p><p className={`mt-0.5 text-[8px] font-black ${room.game.hits.includes(seat) ? 'text-[#ff7268]' : 'text-[#8ff0c6]'}`}>{room.game.hits.includes(seat) ? t('hit') : t('safe')}</p></div>)}
          </div>
          <div className="mt-4 rounded-[12px] bg-black/25 p-3">
            <p className="text-[9px] font-black tracking-widest text-white/30">FIRING LOG</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{shots.map((shot, i) => <span key={i} className={`rounded-full px-2 py-1 font-mono text-[9px] font-black ${shot.fired ? 'bg-[#ff7268]/20 text-[#ff948d]' : 'bg-white/[0.05] text-white/30'}`}>{String.fromCharCode(65 + shot.chamber)} → {name(shot.target)} {shot.fired ? '●' : '○'}</span>)}</div>
          </div>
          <ResultActions onAgain={onAgain} waitingLabel={waitingLabel} gamePath="/russian-roulette" exitPath={exitPath} primaryClass="rounded-[12px] bg-[#65e5ff] text-[#071016] hover:bg-[#a7efff]" />
        </>}
      </motion.div>
    </div>
  );
}
