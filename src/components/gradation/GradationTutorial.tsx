"use client";

import InlineSteps from '@/components/ui/InlineSteps';
import { GrCube, GrCup } from './GradationParts';

const TIERS = [0, 1, 2, 3, 2, 1, 0];
const ROW = [0, 1, 3, 5, 6, 7, 8];

const TEXT = {
  ko: [
    ['7개의 큐브 통', '통은 양 끝이 검정, 가운데로 갈수록 밝아져요(검정·회색·밝은·흰·밝은·회색·검정). 상대는 내 통의 색만 볼 수 있어요.'],
    ['큐브 7개 배치', '0~9 큐브(각 2개) 중 7개를 통마다 1개씩 넣어요. 왼쪽→오른쪽 오름차순, 합계 30 이하. 제한 시간 5분이에요.'],
    ['색만 보고 대응', '선 플레이어가 통 1개를 내면 상대는 그 통의 색만 보고 자기 통 1개를 내요. 밝은 통일수록 가운데 숫자, 끝 검정 통은 아주 작거나 아주 큰 숫자예요.'],
    ['큰 쪽이 1점', '두 큐브를 공개해 큰 쪽이 1점, 같으면 점수 없음. 이긴 사람이 다음 선. 7라운드 뒤 점수가 높은 쪽 승리, 동점이면 다시 배치해 재대결해요.'],
  ],
  en: [
    ['Seven cups', 'The cups are dark at both ends and lighter toward the middle (dark · grey · light · white · light · grey · dark). Your opponent sees only the shade of a cup.'],
    ['Place seven cubes', 'Put 7 of your cubes (0–9, two each) one per cup: rising left to right, total 30 or less. You have 5 minutes.'],
    ['Answer by shade', 'The lead hands in a cup; the other side sees only its shade and hands in one of theirs. Light cups hold middle numbers; the dark end cups hold very small or very large ones.'],
    ['Higher scores 1', 'Both cubes are shown: the higher scores a point, a tie scores none, and the winner leads next. After 7 rounds the higher score wins; a tie means new rows and a rematch.'],
  ],
} as const;

/** The entry screen's four tutorial cards: the cups, the row, a shade, the reveal. */
export function GradationTutorialSteps({ locale }: { locale: string }) {
  const steps = TEXT[locale === 'en' ? 'en' : 'ko'];
  const visuals = [
    <div key="cups" className="grid w-[240px] grid-cols-7 items-end gap-1">{TIERS.map((tier, i) => <GrCup key={i} fluid tier={tier} />)}</div>,
    <div key="row" className="flex w-[240px] flex-col items-center gap-2"><div className="grid w-full grid-cols-7 items-end gap-1">{TIERS.map((tier, i) => <GrCup key={i} fluid tier={tier} value={ROW[i]} />)}</div><span className="font-mono text-[11px] font-black text-(--accent)">0+1+3+5+6+7+8 = 30</span></div>,
    <div key="shade" className="flex items-end gap-5"><div className="w-14"><GrCup fluid tier={2} value={null} selected /></div><span className="pb-4 text-sm font-black text-white/40">vs</span><div className="w-14"><GrCup fluid tier={0} value={null} /></div></div>,
    <div key="reveal" className="flex items-center gap-4"><GrCube value={7} size={52} /><span className="font-mono text-sm font-black text-white/40">&gt;</span><GrCube value={5} size={52} faded /><span className="rounded-md bg-(--accent) px-2 py-0.5 text-xs font-black text-(--accent-ink)">+1</span></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
