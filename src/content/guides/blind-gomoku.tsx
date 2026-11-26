// 블라인드 오목 guide. Rules and numbers follow src/lib/blindGomoku.ts (15×15, free gomoku: overlines win and there are
// no forbidden moves, colorsInPlay 2–7, playableColors with the "must change" rule, DIFFICULTY_MEMORY 3 / 8 / 36 /
// whole game, chooseAiMove scoring only the remembered stones), src/lib/blindGomokuRoom.ts (white copies the colour of
// the stone just played, REVEALS 2 × REVEAL_MS 5 s on your own turn, 60/30/90-second turns, a timeout plays a random
// point next to the stones, the third in a row loses, random colours by seat, full board → draw),
// src/lib/blindGomokuHell.ts (VCF/VCT threat search + alpha-beta, it reads ownership from move order only),
// src/components/blindGomoku/BlindGomokuGame.tsx (vs AI you are black, no clock, hell fixed to 2 colours, levels and
// colour rules locked once the first stone is down) and hellAi.ts (1.5 s, 1 s on phones), plus BlindGomokuGuide.
// Coordinates as in coordinateLabel: columns A–P without I, rows 1–15 from the bottom.
import { STONE_COLORS, type StoneColor } from '@/lib/blindGomoku';
import type { GameGuide } from './types';

const COLS = 'ABCDEFGHJKLMNOP';
const HEX = Object.fromEntries(STONE_COLORS.map((c) => [c.id, c.hex])) as Record<StoneColor, string>;
type Stone = [square: string, color: StoneColor];

/** A crop of the board. Surface view: the colours everyone sees. Revealed view: black / white with move numbers. */
function BlindCrop({ stones, revealed, label, ring = [] }: { stones: Stone[]; revealed?: boolean; label: string; ring?: string[] }) {
  const cols = COLS.slice(COLS.indexOf('E'), COLS.indexOf('M') + 1).split('');
  const rows = [11, 10, 9, 8, 7, 6, 5];
  const G = 10, P = 9, W = P * 2 + (cols.length - 1) * G, H = P * 2 + (rows.length - 1) * G;
  const xy = (s: string) => ({ x: P + cols.indexOf(s[0]) * G, y: P + (11 - Number(s.slice(1))) * G });
  return (
    <svg viewBox={`-6 -2 ${W + 8} ${H + 8}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[300px]">
      <rect x={P - 5} y={P - 5} width={W - 2 * P + 10} height={H - 2 * P + 10} rx="2" fill={revealed ? '#2b2518' : '#1d1a14'} />
      {cols.map((c, i) => <line key={c} x1={P + i * G} y1={P} x2={P + i * G} y2={H - P} stroke="#5d5440" strokeWidth="0.4" />)}
      {rows.map((r, i) => <line key={r} x1={P} y1={P + i * G} x2={W - P} y2={P + i * G} stroke="#5d5440" strokeWidth="0.4" />)}
      {cols.map((c, i) => <text key={`t${c}`} x={P + i * G} y={H + 4} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{c}</text>)}
      {rows.map((r, i) => <text key={`n${r}`} x={-1} y={P + i * G + 1.5} fontSize="4" textAnchor="middle" fill="#9aa1ae" fontFamily="monospace">{r}</text>)}
      {stones.map(([s, color], i) => {
        const { x, y } = xy(s);
        const black = i % 2 === 0; // black moves first: stones 1, 3, 5 … are black
        return (
          <g key={s}>
            <circle cx={x} cy={y} r="4.3" fill={revealed ? (black ? '#111318' : '#eef0f4') : HEX[color]} stroke={ring.includes(s) ? '#ffd166' : '#000'} strokeWidth={ring.includes(s) ? 1 : 0.3} />
            {revealed && <text x={x} y={y + 1.5} fontSize="3.8" textAnchor="middle" fontWeight="800" fill={black ? '#fff' : '#111'}>{i + 1}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// Eight moves, in order. White always copies the colour black just used.
const GAME: Stone[] = [['H8', 'red'], ['H9', 'red'], ['J8', 'blue'], ['G8', 'blue'], ['J7', 'red'], ['K6', 'red'], ['J9', 'green'], ['J10', 'green']];
// Two more: black J6 (yellow) makes four on J6–J9, white answers J5 (yellow).
const GAME10: Stone[] = [...GAME, ['J6', 'yellow'], ['J5', 'yellow']];
// With two colours (the 매우 어려움 rule) and "must change": black alternates red / orange, white follows.
const TWO: Stone[] = [['H8', 'red'], ['J9', 'red'], ['H7', 'orange'], ['H9', 'orange'], ['G7', 'red'], ['J7', 'red'], ['G8', 'orange'], ['F9', 'orange']];
const surface = (stones: Stone[], label: string, ring?: string[]) => <BlindCrop stones={stones} label={label} ring={ring} />;
const revealed = (stones: Stone[], label: string) => <BlindCrop stones={stones} revealed label={label} />;

const guide: GameGuide = {
  game: 'blindGomoku',
  origin: { kind: 'show', show: 'dp1' },
  updated: '2026-11-26',
  related: ['pointOmok', 'flipOmok', 'fourThree', 'nineMensMorris'],
  ko: {
    meta: {
      title: '블라인드 오목 공략 — 색 짝 읽기, 기억 요령, 뒤집어 보기 타이밍 | PUZZLTHINK',
      description: '데블스 플랜 블라인드 오목 공략. 백이 흑의 색을 따라 쓰는 규칙, 같은 색 짝으로 누구 돌인지 읽는 법, 2~7색·직전 색 금지 설정, 5초 뒤집어 보기 두 번의 타이밍, AI 기억력(3·8·36수)과 매우 어려움까지 정리했어요.',
      keywords: ['블라인드 오목 공략', '블라인드 오목 규칙', '블라인드오목', '데블스 플랜 블라인드 오목', '기억력 오목', '블라인드 오목 이기는 법'],
    },
    title: '블라인드 오목 공략',
    lead: '판에는 색만 남고, 흑과 백은 기억 속에만 있어요.',
    intro: [
      '블라인드 오목은 15×15 판에서 5목을 먼저 만드는 오목이지만, **판 위의 돌은 겉색만 보이고 흑·백은 보이지 않아요.** 흑이 매 수 색을 고르면 백은 바로 그 색을 따라 두기 때문에, 같은 색 돌이 늘 흑 하나·백 하나 짝으로 생겨요. 결국 누가 어디에 뒀는지를 기억하는 사람이 판을 읽어요.',
      '이 공략은 "판을 기억하는 방법"에 초점을 맞춰요. 색 짝이 생기는 원리, 수 순서로 주인을 가려내는 법, 색 수와 직전 색 금지 설정이 기억에 주는 영향, 두 번뿐인 뒤집어 보기를 쓰는 타이밍을 정리하고, 그다음 오목 전략과 AI의 기억력을 다뤄요. 좌표는 가로 A~P(I 없음), 세로 1~15(아래부터)예요.',
    ],
    gamePageTitle: '블라인드 오목 — 색 뒤에 숨은 흑과 백',
    summary: '색 짝으로 주인 읽기, 기억 요령, 뒤집어 보기 타이밍, AI 기억력과 매우 어려움.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '블라인드 오목은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '블라인드 오목은 넷플릭스 「데블스 플랜」에 나온 블라인드 오목에서 착안한 변형 오목이에요. 돌의 겉면은 색, 밑면은 흑·백이라, 화면에는 겉색만 보여요. 오목 실력에 기억력과 추리가 더해지는 게임이에요.' },
          { type: 'p', text: '오목 규칙 자체는 단순한 자유 오목(고모쿠)이에요. 33·44 같은 금수가 없고 6목 이상도 이겨요. 어려운 건 수읽기 이전에, 지금 판에서 어느 돌이 내 것인지 정확히 아는 일이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**흑과 백**: 흑(선공)과 백(후공)이 번갈아 한 수씩 둬요. AI 대국에서는 내가 흑이고, 친구 방에서는 흑백이 무작위로 정해져요.',
            '**색 고르기**: 흑은 매 수 쓸 수 있는 색 중 하나를 골라 둬요. 기본은 빨강·주황·노랑·초록·파랑·보라·분홍 7색이고, 게임 전에 2~7색으로 줄일 수 있어요.',
            '**직전 색 금지(선택)**: 이 설정을 켜면 흑은 자기가 바로 전에 쓴 색을 다시 쓸 수 없어요. 2색이면 두 색이 번갈아 나와요.',
            '**백은 따라 쓰기**: 백은 방금 흑이 쓴 색과 같은 겉색으로 둬요. AI도 똑같이 따라요.',
            '**보이는 것**: 판에는 겉색만 보여요. 흑·백은 한 게임에 두 번, 내 차례에 5초 동안 판을 뒤집어 볼 때만 보여요. 보는 동안에는 둘 수 없어요.',
            '**승패**: 어느 쪽이든 5목 이상을 먼저 만들면 판이 뒤집히며 이겨요. 금수는 없어요. 판이 가득 차면 무승부예요.',
            '**시간**: AI 대국에는 시간 제한이 없어요. 친구 방은 한 수 30·60·90초이고, 시간이 지나면 돌 근처 빈칸에 자동으로 한 수가 두어지며 세 번 연속이면 시간패예요.',
          ] },
          { type: 'cards', items: [
            { title: '내가 보는 판 (겉색)', body: '여덟 수를 둔 판이에요. 빨강이 넷, 파랑과 초록이 둘씩 있지만 어느 것이 흑인지는 보이지 않아요.', figure: surface(GAME, '겉색으로 본 판') },
            { title: '실제 판 (흑·백)', body: '같은 판을 뒤집으면 흑 H8·J8·J7·J9, 백 H9·G8·K6·J10이에요. 숫자는 둔 순서예요. 홀수 번째가 흑, 짝수 번째가 백이에요.', figure: revealed(GAME, '흑백으로 본 판') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 장면 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '같은 색이 넷이면 누가 누구예요?', body: '흑이 같은 색을 두 번 쓰면 그 색 짝이 둘 생겨요. 위 판의 빨강 넷은 (1 흑 H8, 2 백 H9)와 (5 흑 J7, 6 백 K6) 두 짝이에요. 색만으로는 구분이 안 되고 순서를 기억해야 해요.' },
            { title: '6목도 이기나요?', body: '네. 자유 오목이라 5목 이상이면 모두 이겨요. 33·44 같은 금수도 없어요.' },
            { title: '뒤집어 보기는 언제 쓸 수 있나요?', body: '내 차례에만, 판에 돌이 하나라도 있을 때 쓸 수 있어요. 5초 동안 판이 뒤집히고, 보는 동안에는 둘 수 없어요. 친구 방에서는 보는 동안에도 내 시간이 흘러가요.' },
            { title: '상대가 5목을 만든 걸 못 봤다면?', body: '5목이 되는 순간 판이 뒤집히며 바로 끝나요. 기억이 틀려 상대 돌을 내 돌로 알고 막지 않으면 그대로 져요.' },
            { title: '백은 색을 고를 수 없나요?', body: '고를 수 없어요. 백은 항상 직전 흑과 같은 색이에요. 그래서 색을 정하는 건 늘 흑이고, 흑이 색으로 자기만의 기억 규칙을 만들 수 있어요.' },
            { title: '게임 중에 설정을 바꿀 수 있나요?', body: '색 수, 직전 색 금지, AI 난이도는 첫 돌을 두기 전에만 바꿀 수 있어요. 매우 어려움은 2색으로 고정돼요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 기억하기 쉬운 판 만들기',
        blocks: [
          { type: 'p', text: '블라인드 오목의 첫 기술은 오목이 아니라 정리예요. 내가 기억하기 쉬운 판을 만들면, 같은 수읽기로도 실수가 크게 줄어요.' },
          { type: 'list', items: [
            '**흑이라면 색에 역할 주기**: 예를 들어 "공격 줄은 빨강, 막는 돌은 파랑"처럼 정해 두면, 나중에 판을 볼 때 "빨강 중 내 것은 줄 위에 있는 것"으로 좁힐 수 있어요.',
            '**짝의 짝꿍을 기억하기**: 같은 색 짝은 늘 "내 돌과 그 직후의 상대 돌"이에요. 내가 빨강을 둔 바로 다음 상대가 어디에 뒀는지, 즉 상대가 무엇을 막았는지를 함께 외우면 짝이 풀려요.',
            '**초반에는 색을 아끼기**: 7색이면 처음 일곱 수 동안 매번 다른 색을 쓰면 색마다 짝이 하나뿐이라 구분이 쉬워요.',
            '**모르면 막기**: 누구 것인지 확실하지 않은 4개짜리 줄이 보이면 일단 막으세요. 내 줄을 내가 막는 손해보다 상대 5목을 허용하는 손해가 훨씬 커요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 읽기 — 겉색만으로 판 다시 세우기',
        lead: '위 판(8수)에서 이어지는 두 수를, 기억과 색 짝만으로 따라가 봐요. 나는 흑이에요.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. 색 짝부터 정리', body: '초록(J9·J10), 파랑(J8·G8)은 짝이 하나씩이라 쉬워요. 나는 J9와 J8에 뒀으니 J10과 G8이 상대 돌이에요. 빨강 넷은 순서를 떠올려요. 첫 수 H8은 내 돌, 바로 이어 H9가 상대. 다섯 번째 J7이 내 돌, 이어 K6가 상대예요.', figure: surface(GAME, '여덟 수 뒤 겉색 판') },
            { title: '2. 내 줄 확인', body: '정리하면 J7·J8·J9가 세로로 이어진 내 3목이고, 위쪽 J10은 상대가 막았어요. 아래쪽 J6과 그 아래 J5가 비어 있어요. 여기에 노랑으로 J6을 두면 J6~J9 4목이에요.' },
            { title: '3. 상대는 J5를 막아요', body: '상대(백)는 노랑으로 J5를 막아요. 이제 J열 줄은 위아래가 다 막힌 4목이라 더 늘어나지 않아요. 겉색으로는 노랑 둘, 빨강 넷, 파랑 둘, 초록 둘이 보이는데, 지금까지의 정리를 기억한다면 판 전체를 머릿속으로 다시 세울 수 있어요.', figure: surface(GAME10, '열 수 뒤 겉색 판', ['J6', 'J5']) },
            { title: '4. 뒤집어 보기로 확인할까?', body: '돌이 열 개뿐이고 짝이 모두 풀렸으니 지금은 아껴요. 뒤집어 보기는 돌이 스무 개를 넘고 같은 색 짝이 여럿 겹쳐 순서가 흐려질 때, 특히 "이 4목이 누구 것이지?" 싶은 결정적인 순간에 쓰는 게 좋아요.', figure: revealed(GAME10, '열 수 뒤 실제 판') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 색 설정과 뒤집어 보기 운영',
        blocks: [
          { type: 'table', caption: '설정에 따라 기억이 쉬워지는 정도', head: ['설정', '판의 모습', '기억 난이도'], rows: [
            ['7색, 직전 색 허용', '흑이 색을 마음대로 골라 짝이 분산돼요', '흑에게 가장 쉬움'],
            ['적은 색 (2~3색)', '같은 색 짝이 빠르게 늘어나요', '양쪽 모두 어려움'],
            ['직전 색 금지', '흑이 색 하나로 줄을 잇기 어려워요', '색으로 역할 나누기가 제한돼요'],
            ['2색 + 직전 색 금지', '빨강·주황이 번갈아 나와요', '순서 기억이 거의 전부예요'],
          ] },
          { type: 'list', items: [
            '**뒤집어 보기 두 번의 배분**: 첫 번째는 중반(돌 20~30개)에 판을 한 번 정리하는 데, 두 번째는 승부처를 위해 남겨 두는 게 무난해요. 둘 다 일찍 쓰면 정작 헷갈리는 종반에 쓸 게 없어요.',
            '**5초 동안 볼 것**: 뒤집어 보는 5초는 짧아요. 전체를 외우려 하지 말고 "4목·열린 3목 후보 줄"과 "헷갈리던 색 짝" 두 가지만 확인하세요.',
            '**백이라면**: 색을 고를 수 없는 대신 흑이 고른 색을 그대로 받아요. 흑이 같은 색을 반복할 때마다 "몇 번째 빨강인지"를 세어 두면 짝을 풀 수 있어요.',
            '**흔들기 (친구 방)**: 상대도 기억에 의존해요. 흑이라면 가끔 색 규칙을 일부러 바꿔 상대가 내 줄을 놓치게 만들 수 있어요. 단, 나도 헷갈리지 않을 만큼만이에요.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: '2색', title: '두 색만 있으면 판은 이렇게 보여요', body: '매우 어려움처럼 2색에 직전 색 금지까지 켜면 흑은 빨강·주황을 번갈아 쓰고 백도 그대로 따라요. 여덟 수 만에 빨강 넷, 주황 넷이 섞여 색은 거의 정보가 되지 않아요. 이런 판에서는 "내가 둔 자리"를 수 순서대로 외우는 수밖에 없어요.', figure: surface(TWO, '2색 판의 겉모습') },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 기억의 빈틈을 공격하기',
        blocks: [
          { type: 'list', items: [
            '**오래된 돌을 다시 살리기 (AI 대국)**: 쉬움·보통·어려움 AI는 최근 3·8·36수만 기억해요. 그보다 오래된 돌은 AI의 계산에서 빈칸처럼 다뤄져요. 초반에 둔 돌과 이어지는 줄을 후반에 완성하면, AI가 위협을 못 보고 막지 않는 경우가 많아요.',
            '**두 방향 위협**: 자유 오목이라 33(열린 3목 두 개)도 둘 수 있어요. 상대가 기억에 자신이 없을수록 두 줄을 동시에 노리는 수가 강해요. 하나를 막는 사이 다른 하나가 4목이 돼요.',
            '**상대의 확인 횟수 세기 (친구 방)**: 상대가 뒤집어 보기를 두 번 다 쓰면 그 뒤로는 기억만으로 둬요. 그때부터 오래된 돌을 활용한 공격이 더 잘 통해요.',
            '**결정적인 수 전에는 반드시 확인**: 내가 4목이라고 믿는 줄의 끝에 두기 전에, 그 줄에 상대 돌이 섞여 있지 않은지 떠올려 보세요. 확신이 없으면 그때가 뒤집어 보기를 쓸 때예요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**같은 색을 계속 쓰기**: 흑이 한 색만 고집하면 그 색 짝이 판을 덮어 나도 헷갈려요.',
            '**뒤집어 보기를 초반에 다 쓰기**: 돌이 적을 때는 기억만으로 충분해요. 정작 필요한 종반에 남지 않아요.',
            '**짝의 상대 돌을 잊기**: 내 돌 위치만 외우고 그 직후 상대가 둔 자리를 잊으면, 같은 색 돌 중 어느 것이 상대 것인지 몰라요.',
            '**확실하지 않은 4목을 내버려 두기**: 상대 4목일 가능성이 조금이라도 있으면 막는 게 안전해요.',
            '**5초 동안 전부 외우려 하기**: 확인할 줄 한두 개만 정해 두고 보세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — AI 기억력, 매우 어려움, 친구 방',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['AI 대국', '나는 흑(선공)이고 시간 제한이 없어요. 뒤집어 보기는 나만 두 번 써요. 난이도와 색 설정은 첫 돌 전에만 바꿀 수 있어요.'],
            ['쉬움', '최근 3수만 기억해요. 그보다 오래된 돌은 계산에 넣지 않아요.'],
            ['보통', '최근 8수를 기억해요.'],
            ['어려움', '최근 36수를 기억해요. 한 판의 대부분을 기억하지만, 긴 판에서는 초반 돌을 잊어요.'],
            ['매우 어려움', '모든 수를 순서대로 기억해요. 밑면을 엿보지는 않지만, 흑이 먼저 두니 홀수 번째 돌이 흑이라는 것만으로 주인을 정확히 알아요. 4·열린 3 연속 공격(VCF·VCT)까지 읽고, 한 수에 1.5초(휴대폰은 1초) 생각해요. 색은 2색으로 고정돼요. AI 헬모드 페이지에서도 시작할 수 있어요.'],
            ['친구 방', '링크나 4자리 코드로 방을 만들어요. 방장이 한 수 시간(30·60·90초), 색 수(2~7), 직전 색 금지를 정해요. 흑백은 무작위이고 두 사람 모두 뒤집어 보기를 두 번씩 써요. 오픈 대전에 방을 열 수도 있어요.'],
            ['복기', '끝난 판은 겉색 면과 흑백 면을 오가며 한 수씩 다시 볼 수 있어요. 겉색 면은 그때 내가 본 화면, 흑백 면은 실제 상황이라 기억이 어디서 틀렸는지 바로 보여요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '겉색', def: '판에 보이는 돌의 색. 흑이 고르고 백이 따라 써요.' },
            { term: '색 짝', def: '흑의 돌과 바로 다음 백의 돌. 같은 색으로 생겨요.' },
            { term: '뒤집어 보기', def: '내 차례에 5초 동안 흑·백을 보는 것. 한 게임에 두 번.' },
            { term: '직전 색 금지', def: '흑이 바로 전에 쓴 색을 다시 쓸 수 없게 하는 설정.' },
            { term: '자유 오목', def: '금수가 없고 6목 이상도 이기는 오목 규칙(고모쿠).' },
            { term: 'VCF · VCT', def: '4목(VCF)이나 4목·열린 3목(VCT)을 이어 상대가 막을 수 없게 만드는 연속 공격.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '블라인드 오목은 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜」의 블라인드 오목에서 착안한 기억력 오목이에요. 돌의 겉색만 보이고, 백이 흑의 색을 따라 쓰기 때문에 누구 돌인지는 기억해야 해요.' },
      { q: '33이나 장목도 되나요?', a: '네. 자유 오목 규칙이라 33·44 금수가 없고, 6목 이상을 만들어도 이겨요.' },
      { q: '뒤집어 보기는 몇 번 쓸 수 있나요?', a: '한 게임에 두 번, 한 번에 5초예요. AI 대국에서는 사람만, 친구 방에서는 두 사람 모두 두 번씩 쓸 수 있어요.' },
      { q: '색 수를 바꿀 수 있나요?', a: '네. 게임 전에 2~7색 중에서 고르고, 직전 색 금지도 켤 수 있어요. 매우 어려움은 2색으로 고정돼요.' },
      { q: 'AI 난이도는 무엇이 다른가요?', a: '기억력이에요. 쉬움은 최근 3수, 보통은 8수, 어려움은 36수를 기억하고, 매우 어려움은 모든 수를 기억하며 연속 공격까지 읽어요.' },
      { q: '친구와 하려면 어떻게 하나요?', a: '친구와 하기로 방을 만들면 초대 링크와 4자리 초대코드가 생겨요. 친구는 링크를 열거나 입장 화면에서 코드를 넣으면 돼요.' },
    ],
    cta: { title: '기억력 오목, 한 판 해 볼까요?', body: '처음엔 7색으로, 색마다 역할을 정해 두고 둬 보세요. 판을 머릿속에 다시 세우는 감각이 생겨요.', button: '블라인드 오목 하러 가기' },
    disclaimer: '블라인드 오목은 방송에 소개된 게임 방식에서 착안해 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Blind Gomoku strategy guide — reading colour pairs, memory tricks and peeks | PUZZLTHINK',
      description: 'A guide to Blind Gomoku from The Devil’s Plan: white copying black’s colour, reading owners from colour pairs, the 2–7 colour and no-repeat settings, when to use your two 5-second peeks, AI memory (3, 8 and 36 moves) and Very Hard.',
      keywords: ['Blind Gomoku strategy', 'Blind Gomoku rules', 'Devil’s Plan blind gomoku', 'memory gomoku', 'how to win Blind Gomoku'],
    },
    title: 'Blind Gomoku strategy guide',
    lead: 'Only colours stay on the board; black and white live in your memory.',
    intro: [
      'Blind Gomoku is five-in-a-row on a 15×15 board, but **the stones show only their outer colour — not whether they are black or white.** Black picks a colour every move and white copies it straight away, so stones of one colour always come in pairs: one black, one white. Whoever remembers who played where can read the board.',
      'This guide is about remembering the board: how colour pairs form, how move order tells you the owner, how the colour settings change the memory load, and when to spend your only two peeks. Then come gomoku strategy and the AI’s memory. Coordinates are columns A–P (no I) and rows 1–15 from the bottom.',
    ],
    gamePageTitle: 'Blind Gomoku — black and white hidden behind colours',
    summary: 'Reading owners from colour pairs, memory tricks, peek timing, AI memory and Very Hard.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is Blind Gomoku?',
        blocks: [
          { type: 'p', text: 'Blind Gomoku is a variant inspired by the blind gomoku in Netflix’s The Devil’s Plan. Each stone is a colour on top and black or white underneath, and only the colour shows. On top of gomoku skill, it tests memory and deduction.' },
          { type: 'p', text: 'The gomoku rules themselves are plain free gomoku: no forbidden moves such as double-threes, and six or more in a row also wins. The hard part comes before any reading ahead — knowing exactly which stones on the board are yours.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Black and white**: black (first) and white (second) alternate one stone at a time. Against the AI you are black; in friend rooms colours are drawn at random.',
            '**Choosing colours**: black picks one of the allowed colours every move. The default is seven — red, orange, yellow, green, blue, purple, pink — and you can cut it to 2–7 before the game.',
            '**No repeat (optional)**: with this setting, black may not reuse the colour it used last. With two colours they simply alternate.',
            '**White copies**: white’s stone always has the colour black just used. The AI follows the same rule.',
            '**What you see**: only the colours. Black and white show only when you flip the board for 5 seconds on your own turn — twice per game. You cannot play while peeking.',
            '**Winning**: the first to make five or more in a row wins and the board flips over. No forbidden moves. A full board is a draw.',
            '**Clocks**: no clock against the AI. Friend rooms use 30, 60 or 90 seconds a move; on a timeout a stone goes on a free point next to the stones, and three timeouts in a row lose.',
          ] },
          { type: 'cards', items: [
            { title: 'The board you see (colours)', body: 'Eight stones. Four red, two blue, two green — and nothing says which are black.', figure: surface(GAME, 'The board by colour') },
            { title: 'The real board (black and white)', body: 'Flipped, it is black H8, J8, J7, J9 and white H9, G8, K6, J10. Numbers show the order: odd moves are black, even moves white.', figure: revealed(GAME, 'The board in black and white') },
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky situations — what happens if…',
        blocks: [
          { type: 'cards', items: [
            { title: 'Four stones of one colour — whose are they?', body: 'Each time black reuses a colour another pair appears. The four reds above are two pairs: (1 black H8, 2 white H9) and (5 black J7, 6 white K6). Colour cannot separate them; only order can.' },
            { title: 'Does six in a row win?', body: 'Yes. This is free gomoku: five or more wins, and there are no forbidden moves.' },
            { title: 'When can I peek?', body: 'Only on your turn, once there is at least one stone. The board flips for 5 seconds and you cannot play meanwhile. In friend rooms your clock keeps running while you look.' },
            { title: 'What if I miss their five?', body: 'The moment a five appears the board flips and the game ends. Misremember an enemy stone as yours, fail to block, and that is the game.' },
            { title: 'Can white choose a colour?', body: 'No. White always takes black’s last colour, so colour is black’s to decide — and black can build a memory system with it.' },
            { title: 'Can I change settings mid-game?', body: 'Colour count, no-repeat and AI level can only be changed before the first stone. Very Hard is fixed at two colours.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — make the board easy to remember',
        blocks: [
          { type: 'p', text: 'The first skill in Blind Gomoku is housekeeping, not gomoku. Build a board you can remember and the same reading makes far fewer mistakes.' },
          { type: 'list', items: [
            '**As black, give colours jobs**: say red for attacking lines, blue for blocking stones. Later, “my reds are the ones on the line” narrows things down.',
            '**Remember each pair’s partner**: a colour pair is always “my stone and their very next stone”. Remember where they answered — what they blocked — and the pair resolves itself.',
            '**Spread colours early**: with seven colours, use a different one for each of the first seven moves and every colour has a single pair, easy to tell apart.',
            '**When unsure, block**: a line of four you cannot attribute should be blocked. Blocking your own line costs less than letting them make five.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Read along — rebuilding the board from colours',
        lead: 'From the eight-stone board above, follow the next two moves using only memory and colour pairs. You are black.',
        blocks: [
          { type: 'steps', items: [
            { title: '1. Sort out the pairs', body: 'Green (J9, J10) and blue (J8, G8) have one pair each, so they are easy: you played J9 and J8, which makes J10 and G8 theirs. For the four reds, recall the order: your first stone H8, their answer H9; your fifth stone J7, their answer K6.', figure: surface(GAME, 'The colours after eight moves') },
            { title: '2. Find your line', body: 'Sorted out, J7–J8–J9 is your vertical three, blocked above by their J10. Below, J6 and J5 are empty. A yellow stone on J6 makes four, J6–J9.' },
            { title: '3. They block J5', body: 'White blocks on J5 — in yellow, of course. The J-file line is now a four closed at both ends and can grow no further. By colour the board shows two yellows, four reds, two blues and two greens; if you kept track, you can rebuild the whole board in your head.', figure: surface(GAME10, 'The colours after ten moves', ['J6', 'J5']) },
            { title: '4. Peek now?', body: 'Only ten stones and every pair is resolved, so save it. Peeks are worth most once there are twenty-plus stones and overlapping pairs blur the order — above all at a decisive “whose four is this?” moment.', figure: revealed(GAME10, 'The real board after ten moves') },
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — colour settings and managing peeks',
        blocks: [
          { type: 'table', caption: 'How the settings change the memory load', head: ['Setting', 'What the board looks like', 'Memory load'], rows: [
            ['7 colours, repeats allowed', 'black spreads pairs across colours at will', 'easiest for black'],
            ['few colours (2–3)', 'pairs of one colour pile up fast', 'hard for both'],
            ['no repeat', 'black cannot run a line in one colour', 'limits colour “jobs”'],
            ['2 colours + no repeat', 'red and orange alternate', 'almost pure order memory'],
          ] },
          { type: 'list', items: [
            '**Splitting your two peeks**: one in the middlegame (20–30 stones) to tidy up your picture, one saved for the decider. Spend both early and you have none left for the confusing endgame.',
            '**What to look at in 5 seconds**: it is short. Do not try to memorise everything; check just the candidate fours and open threes, and the pairs you were unsure of.',
            '**As white**: you cannot choose colours, but you inherit black’s. Count “which red is this?” every time black repeats a colour and the pairs stay solvable.',
            '**Muddying the water (friend rooms)**: the opponent relies on memory too. As black, change your colour habits now and then so they lose track of your line — but only as far as you can keep track yourself.',
          ] },
          { type: 'cards', columns: 1, items: [
            { tag: '2 COLOURS', title: 'What a two-colour board looks like', body: 'With two colours (as in Very Hard) and no repeat switched on, black alternates red and orange and white follows. After eight moves there are four reds and four oranges and colour says almost nothing. On a board like this, the only way is to memorise your own points in order.', figure: surface(TWO, 'A two-colour board') },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — attacking gaps in memory',
        blocks: [
          { type: 'list', items: [
            '**Revive old stones (vs AI)**: the Easy, Normal and Hard AIs remember only the last 3, 8 and 36 moves. Older stones are treated as empty in their calculations. Complete a line late in the game that uses early stones and the AI often fails to see the threat.',
            '**Two-way threats**: free gomoku allows double-threes. The less sure the opponent is of their memory, the stronger a move that aims at two lines at once: while they block one, the other becomes four.',
            '**Count their peeks (friend rooms)**: once they have used both, they play from memory alone, and attacks built on old stones work even better.',
            '**Always check before the decisive move**: before playing the end of a line you believe is your four, make sure no enemy stone is mixed into it. If you are not sure, that is the moment to peek.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**One colour for everything**: if black sticks to one colour, its pairs cover the board and confuse you too.',
            '**Peeking early**: with few stones memory is enough, and nothing is left for the endgame.',
            '**Forgetting the partner stone**: remember only your own stones and you cannot tell which stone of a colour is theirs.',
            '**Ignoring an uncertain four**: if it might be theirs, block it.',
            '**Memorising everything in 5 seconds**: decide on one or two lines to check before you flip.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — AI memory, Very Hard and friend rooms',
        blocks: [
          { type: 'table', head: ['Mode', 'Worth knowing'], rows: [
            ['AI games', 'You are black (first) and there is no clock. Only you get the two peeks. Level and colour settings can be changed only before the first stone.'],
            ['Easy', 'Remembers the last 3 moves; older stones are left out of its calculations.'],
            ['Normal', 'Remembers the last 8 moves.'],
            ['Hard', 'Remembers the last 36 moves — most of a game, but it forgets early stones in long games.'],
            ['Very Hard', 'Remembers every move in order. It never peeks underneath, but since black moves first, the odd-numbered stones are black — order alone tells it every owner. It reads forcing attacks of fours and open threes (VCF/VCT) and thinks about 1.5 seconds a move (1 second on phones). Colours are fixed at two. You can also start it from the AI Hell Mode page.'],
            ['Friend rooms', 'Create a room with a link or 4-digit code. The host sets the move time (30, 60 or 90 s), the number of colours (2–7) and no-repeat. Colours are random and both players get two peeks. You can also open the room in Open match.'],
            ['Replay', 'Finished games can be stepped through on either face: the colour face shows what you saw, the black-and-white face what was really there — so you see exactly where your memory slipped.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Outer colour', def: 'The colour shown on a stone. Black chooses it; white copies it.' },
            { term: 'Colour pair', def: 'A black stone and the white stone played right after it, in the same colour.' },
            { term: 'Peek', def: 'Seeing black and white for 5 seconds on your turn; twice per game.' },
            { term: 'No repeat', def: 'A setting that stops black from reusing the colour it used last.' },
            { term: 'Free gomoku', def: 'Gomoku with no forbidden moves, where six or more in a row also wins.' },
            { term: 'VCF · VCT', def: 'A chain of fours (VCF), or of fours and open threes (VCT), that the opponent cannot stop.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Blind Gomoku?', a: 'A memory gomoku inspired by the blind gomoku in Netflix’s The Devil’s Plan. Only the stones’ colours show, and white copies black’s colour, so you have to remember whose stone is whose.' },
      { q: 'Are double-threes and overlines allowed?', a: 'Yes. Under free gomoku rules there are no forbidden moves, and six or more in a row also wins.' },
      { q: 'How many times can I peek?', a: 'Twice per game, 5 seconds each. Against the AI only you peek; in friend rooms both players get two.' },
      { q: 'Can I change the number of colours?', a: 'Yes, choose 2–7 before the game and optionally turn on no-repeat. Very Hard is fixed at two colours.' },
      { q: 'How do the AI levels differ?', a: 'In memory. Easy remembers the last 3 moves, Normal 8 and Hard 36; Very Hard remembers everything and reads forcing attacks.' },
      { q: 'How do I play with a friend?', a: 'Create a room under Play with friends to get an invite link and a 4-digit code. Your friend opens the link or enters the code on the entry screen.' },
    ],
    cta: { title: 'Ready to test your memory?', body: 'Start with seven colours and give each one a job. You will soon be rebuilding the board in your head.', button: 'Play Blind Gomoku' },
    disclaimer: 'Blind Gomoku is an unofficial fan remake by PUZZLTHINK, inspired by the game shown on the programme; it is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
