"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Brain } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { idx } from '@/lib/mineOblivion';
import { MODAL, MODAL_BACKDROP, BTN, BTN_ACCENT } from '../ui/gameUi';
import { MO_ROOT_STYLE, type MoCopy, moCopy } from './copy';
import MineOblivionBoard, { type MoFlash, type ShownMine } from './MineOblivionBoard';
import { Crater, MineStone, ProbeStone, RecallStone, SuitStone, TreasureStone, WalkerStone } from './MineStones';

const KEY = 'puzzlthink_mine_oblivion_tutorial';
const S = 7;
const at = (r: number, c: number) => idx(r, c, S);
const MY_MINES = [at(3, 1), at(3, 2)];
// The opponent's two mines in the script sit at (4,3) and (5,3): the 4 and the blast below.
const TREASURES = [at(0, 0), at(3, 3), at(6, 6)];

/** Opens the tutorial on the first game in this browser; `show()` opens it again. */
export function useMoTutorial() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => { try { if (!localStorage.getItem(KEY)) setOpen(true); } catch { /* optional */ } }, 400);
    return () => window.clearTimeout(id);
  }, []);
  const close = useCallback(() => { setOpen(false); try { localStorage.setItem(KEY, '1'); } catch { /* optional */ } }, []);
  return { open, close, show: () => setOpen(true) };
}

const TEXT = {
  ko: [
    ['1. 지뢰 묻기', '반짝이는 두 칸을 눌러 내 지뢰를 묻어 보세요. 실제 판은 11×11, 지뢰는 15개예요.'],
    ['2. 망각', '걷기가 시작되면 내 지뢰도 판에서 사라져요. 어디에 묻었는지 기억하세요!'],
    ['3. 숫자 읽기', '반짝이는 칸으로 가 보세요. 지뢰가 없으면 둘레 8칸의 지뢰 수만큼 점수예요.'],
    ['', '4 = 내 지뢰 2 + 상대 지뢰 2. 숫자는 곧 사라지니 외워 두세요. 오른쪽 두 칸이 수상해요…'],
    ['4. 지뢰!', '이번엔 일부러 오른쪽 칸을 밟아 보세요.'],
    ['', '쾅! −5점. 출발지 옆 세 칸 중 돌아갈 곳을 고르세요. 누구 지뢰였는지는 알려 주지 않아요.'],
    ['5. 보물', '몇 수 뒤, 가운데 보물 바로 옆이에요. 보물을 밟으세요!'],
    ['', '보물 +10, 그리고 처음 밟았으니 둘레 숫자 1점도 더해요. 보물 세 개를 다 찾으면 끝, 점수 높은 쪽이 이겨요.'],
  ],
  en: [
    ['1. Bury', 'Tap the two glowing cells to bury your mines. The real board is 11×11 with 15 mines each.'],
    ['2. Oblivion', 'When the walk starts, even your own mines vanish. Remember where they are!'],
    ['3. Read a number', 'Step onto the glowing cell. On a clear cell you score the mines in the eight cells around it.'],
    ['', '4 = your 2 mines + 2 of theirs. The number fades soon, so remember it. The two cells on the right look suspicious…'],
    ['4. Mine!', 'Now step on the cell to the right, on purpose.'],
    ['', 'Boom! −5. Pick one of the three cells by your start to go back to. Nobody is told whose mine it was.'],
    ['5. Treasure', 'A few moves later you stand next to the centre treasure. Step on it!'],
    ['', 'Treasure +10, plus 1 for the number since you are the first there. When all three treasures are found, the higher score wins.'],
  ],
} as const;

type Stage = { pos: number; targets: number[]; tone: 'move' | 'respawn' | 'bury'; auto?: number };
const STAGES: Stage[] = [
  { pos: at(6, 0), targets: MY_MINES, tone: 'bury' },
  { pos: at(6, 0), targets: [], tone: 'move', auto: 4300 },
  { pos: at(4, 1), targets: [at(4, 2)], tone: 'move' },
  { pos: at(4, 2), targets: [], tone: 'move' },
  { pos: at(4, 2), targets: [at(4, 3)], tone: 'move' },
  { pos: at(4, 3), targets: [at(5, 0), at(5, 1), at(6, 1)], tone: 'respawn' },
  { pos: at(2, 2), targets: [at(3, 3)], tone: 'move' },
  { pos: at(3, 3), targets: [], tone: 'move' },
];

/** The first-game tutorial: a scripted 7×7 board you play through in five short steps. */
export default function MineOblivionTutorial({ t, onDone, withItems = false }: { t: MoCopy; onDone: () => void; withItems?: boolean }) {
  const locale = useLocale();
  const text = TEXT[locale === 'en' ? 'en' : 'ko'];
  const [step, setStep] = useState(0);
  const [buried, setBuried] = useState<number[]>([]);
  const [respawn, setRespawn] = useState<number | null>(null);
  const stage = STAGES[step];
  useEffect(() => {
    if (!stage.auto) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), stage.auto);
    return () => window.clearTimeout(id);
  }, [stage.auto, step]);

  const tap = (cell: number) => {
    if (step === 0) {
      const next = buried.includes(cell) ? buried : [...buried, cell];
      setBuried(next);
      if (next.length === MY_MINES.length) window.setTimeout(() => setStep(1), 500);
      return;
    }
    if (step === 5) { setRespawn(cell); setStep(6); return; }
    setStep((s) => s + 1);
  };
  const mines: ShownMine[] = step === 0 ? buried.map((cell) => ({ cell, owner: 0, state: 'armed' })) : step === 1 ? MY_MINES.map((cell) => ({ cell, owner: 0, state: 'dormant', fading: true })) : [];
  const flash: MoFlash | null = step === 3 ? { cell: at(4, 2), text: '4', tone: 'score', key: 'n', number: 4 }
    : step === 5 ? { cell: at(4, 3), text: '−5', tone: 'mine', key: 'x' }
      : step === 7 ? { cell: at(3, 3), text: '+11', tone: 'treasure', key: 't' } : null;
  const score = step >= 7 ? 4 - 5 + 11 : step >= 5 ? -1 : step >= 3 ? 4 : 0;
  const pos = step === 6 && respawn === null ? at(2, 2) : stage.pos;
  const [title, desc] = text[step];
  const lastTitle = text.slice(0, step + 1).reverse().find(([h]) => h)?.[0] ?? '';
  return (
    <div className={MODAL_BACKDROP} style={MO_ROOT_STYLE}>
      <div className={`${MODAL} max-w-[400px] p-4 text-left text-white sm:p-5`}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-black tracking-[0.2em] text-(--accent)">{t.tutorial} · {title || lastTitle}</p>
          <b className="font-mono text-sm text-[#ffd76b]">{score}</b>
        </div>
        <p className="mt-2 min-h-[60px] break-keep text-[13px] leading-5 text-white/80">{desc}</p>
        <div className="mt-2">
          <MineOblivionBoard size={S} view={0} pos={[pos, at(0, 6)]} treasures={TREASURES.map((cell) => ({ cell, found: step >= 7 && cell === at(3, 3) }))}
            craters={step >= 5 ? [at(4, 3)] : []} scored={step >= 3 ? [{ cell: at(4, 2), seat: 0 }, ...(step >= 7 ? [{ cell: at(3, 3), seat: 0 as const }] : [])] : []}
            mines={mines} zones={step === 0 ? 'bury' : 'walk'} targets={stage.targets.filter((c) => step !== 0 || !buried.includes(c))} targetTone={stage.tone}
            onCell={tap} flash={flash} shakeKey={step === 5 ? 'x' : null} me={0} label={t.tutorial} />
        </div>
        {withItems && step === 7 && (
          <div className="mt-2 rounded-[10px] border border-white/12 bg-black/35 px-2.5 py-2" data-testid="mo-tutorial-items">
            <p className="text-[10px] font-black tracking-[.16em] text-(--accent)">{t.items.rulesTitle}</p>
            <ul className="mt-1 space-y-1 text-[11px] leading-4 text-white/70">
              {[<ProbeStone key="p" size={18} />, <RecallStone key="r" size={18} />, <SuitStone key="s" size={18} />].map((icon, i) => (
                <li key={i} className="flex items-center gap-1.5"><span className="shrink-0">{icon}</span><span className="break-keep">{t.items.name[(['probe', 'recall', 'suit'] as const)[i]]} · {t.items.desc[(['probe', 'recall', 'suit'] as const)[i]]}</span></li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={onDone} className={`${BTN} py-2`}>{t.tutorialSkip}</button>
          <span className="font-mono text-[10px] text-white/35">{step + 1} / {STAGES.length}</span>
          {step === 3 ? <button type="button" onClick={() => setStep(4)} className={`${BTN_ACCENT} py-2`}>{t.tutorialNext}</button>
            : step === 7 ? <button type="button" onClick={onDone} className={`${BTN_ACCENT} py-2`}>{t.tutorialDone}</button>
              : <span className="w-16" />}
        </div>
      </div>
    </div>
  );
}

const STEPS = {
  ko: [
    ['지뢰 15개를 몰래 묻어요', '11×11 판에 각자 지뢰 15개. 출발지 근처(노란 줄무늬)와 보물 칸은 안 돼요. 두 사람이 같은 칸에 묻으면 겹친 칸(2개)이 돼요.'],
    ['그리고 잊혀져요', '걷기가 시작되면 내 지뢰도 판에서 사라져요. 판에 남는 건 두 말, 발자국, 터진 자리뿐. 지뢰 위치는 기억으로만!'],
    ['숫자 = 둘레 8칸의 지뢰 수', '번갈아 둘레 8칸 중 한 칸으로 옮겨요. 지뢰가 없으면 둘레 지뢰 수만큼 점수. 숫자는 잠깐 보였다가 사라져요. 이미 누가 점수를 받은 칸은 0점.'],
    ['지뢰 −5, 보물 +10·+15·+20', '누구 지뢰든 밟으면 −5점, 출발지 옆으로 돌아가요. 보물은 찾은 순서대로 +10, +15, +20. 세 개를 다 찾으면(또는 70수) 점수 높은 쪽이 이겨요.'],
    ['아이템 (AI 대전)', '회원은 피스로 탐지기(옆 칸 하나의 둘레 지뢰 수)와 기억 되살리기(내 지뢰 2초), 블랙피스로 방폭복(다음 지뢰 무효)을 쓸 수 있어요. 아이템을 쓴 판은 어려움 인증에서 빠져요.'],
  ],
  en: [
    ['Bury 15 mines in secret', '15 mines each on an 11×11 board, never near the starts (striped) or on treasure. If both bury on one cell, it holds two.'],
    ['Then they are forgotten', 'When the walk starts even your own mines vanish. The board keeps only the pieces, footprints and craters. Mines live in your memory.'],
    ['Number = mines around you', 'Take turns moving to one of the eight cells around you. On a clear cell you score the mines around it. The number shows for a moment. A cell someone already scored gives 0.'],
    ['Mine −5, treasure +10 +15 +20', 'Any mine costs 5 and sends you back by your start. Treasure is worth 10, 15, 20 in order found. All three found (or 70 moves): higher score wins.'],
    ['Items (AI matches)', 'Members can spend pieces on Detector (the number of a cell next to you) and Recall (your mines for 2 s), and a black piece on the Blast suit (your next mine costs nothing). Item games do not count for the Hard certificate.'],
  ],
} as const;

/** The entry screen's four tutorial cards. */
export function MineOblivionTutorialSteps({ locale }: { locale: string }) {
  const steps = STEPS[locale === 'en' ? 'en' : 'ko'];
  void moCopy;
  const visuals = [
    <div key="bury" className="flex items-center gap-2"><MineStone size={52} state="armed" mark="#ffd76b" /><MineStone size={40} state="armed" mark="#ff7a6e" /><span className="font-mono text-2xl font-black text-(--accent)">×15</span></div>,
    <div key="forget" className="flex items-center gap-3"><MineStone size={56} state="dormant" className="opacity-40" /><Brain size={34} className="text-(--accent)" /></div>,
    <div key="num" className="flex items-center gap-3"><WalkerStone seat={0} size={48} /><span className="rounded-full border-2 border-black bg-[#ffd23f] px-3 py-0.5 font-mono text-3xl font-black text-black">3</span></div>,
    <div key="end" className="flex items-center gap-3"><span className="relative"><MineStone size={56} state="blast" /></span><Crater size={30} /><TreasureStone size={52} /></div>,
    <div key="items" className="flex items-center gap-2"><ProbeStone size={46} /><RecallStone size={46} /><SuitStone size={46} /></div>,
  ];
  return <InlineSteps steps={steps.map(([title, desc], i) => ({ title, desc, visual: visuals[i] }))} />;
}
