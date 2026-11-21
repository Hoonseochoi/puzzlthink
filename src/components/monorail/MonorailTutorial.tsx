"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { newMonorail, type MonorailState, type RailTile } from '@/lib/monorail';
import { MonorailBoard } from './MonorailParts';

const tile = (r: number, c: number, shape: RailTile['shape'], skin = 0): RailTile => ({ r, c, shape, skin });
const state = (tiles: RailTile[], proof: RailTile[] | null = null): MonorailState => ({ ...newMonorail(), tiles, proof });

function Mini({ value, pending = [] }: { value: MonorailState; pending?: RailTile[] }) {
  return <div className="w-[190px]"><MonorailBoard state={value} pending={pending} pad={1} minView={4} className="!rounded-[10px] !p-[2%]" /></div>;
}

export function MonorailTutorialSteps() {
  const t = useTranslations('MonorailTutorial');
  const base = [tile(3, 4, 'se'), tile(3, 5, 'sw')];
  const loop = [tile(4, 3, 'se'), tile(5, 3, 'ne'), tile(5, 4, 'h'), tile(5, 5, 'h'), tile(5, 6, 'nw'), tile(4, 6, 'sw')];
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <Mini value={state([])} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <Mini value={state(base)} pending={[tile(2, 4, 'se', 3), tile(2, 5, 'sw', 4)]} /> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <Mini value={state([...base, tile(2, 4, 'h')])} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <Mini value={state(loop)} /> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <Mini value={state(base, loop)} /> },
  ];
  return <InlineSteps steps={steps} />;
}
