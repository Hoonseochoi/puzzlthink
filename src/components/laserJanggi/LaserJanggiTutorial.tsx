"use client";

import { useTranslations } from 'next-intl';
import { Move, RotateCw, Zap } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { initialLaserPieces, type LaserPieceType } from '@/lib/laserJanggi';
import LaserPiece from './LaserPiece';

const TYPES: LaserPieceType[] = ['laser', 'splitter', 'king', 'triangle', 'square'];

function PieceRow() {
  const pieces = initialLaserPieces();
  return <div className="flex gap-1">{TYPES.map((type) => <div key={type} className="h-12 w-12"><LaserPiece piece={pieces.find((item) => item.owner === 0 && item.type === type)!} /></div>)}</div>;
}

function BeamDemo() {
  return <div className="relative h-28 w-56 overflow-hidden rounded-lg border border-[#59e6ff]/20 bg-[#05080d]">
    <span className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2"><LaserPiece piece={{ id: 'demo-laser', owner: 0, type: 'laser', row: 0, col: 0, direction: 1 }} /></span>
    <span className="absolute left-[56px] top-1/2 h-[2px] w-[80px] -translate-y-1/2 bg-[#59e6ff] shadow-[0_0_10px_#59e6ff]" />
    <span className="absolute right-7 top-1/2 h-12 w-12 -translate-y-1/2"><LaserPiece piece={{ id: 'demo-tri', owner: 1, type: 'triangle', row: 0, col: 0, direction: 1 }} /></span>
    <span className="absolute right-[48px] top-1 h-[42px] w-[2px] bg-[#ff4d6d] shadow-[0_0_10px_#ff4d6d]" />
  </div>;
}

export function LaserJanggiTutorialSteps() {
  const t = useTranslations('LaserJanggiTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <PieceRow /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="flex gap-7 text-[#59e6ff]"><span className="flex flex-col items-center gap-2"><Move size={35} /><b className="text-xs">8-WAY · 1</b></span><span className="flex flex-col items-center gap-2"><RotateCw size={35} /><b className="text-xs">90°</b></span></div> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <BeamDemo /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="flex items-center gap-4"><Zap size={35} className="text-[#59e6ff]" /><span className="text-2xl font-black text-white/35">→</span><div className="h-16 w-16"><LaserPiece piece={{ id: 'demo-king', owner: 1, type: 'king', row: 0, col: 0, direction: 0 }} /></div></div> },
  ];
  return <InlineSteps steps={steps} />;
}
