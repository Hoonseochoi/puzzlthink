// 명제 바둑 guide. Rules and numbers follow src/lib/propositionGo.ts (4×4 points, 4 stones on 기본 and 5 on 심화 and
// 거짓말, the proposition grammar, liveTruth: a card lights once the stones it names are down; isSolved: every card
// true, or on 거짓말 exactly one false), the daily run in supabase/migrations/20271202100000_proposition_go.sql
// (one ranked attempt a day, 10-minute clock, 피스 hint = 1 piece, at most one per puzzle, +30 s each) and the
// PropositionGo messages. The example boards are the tutorial's (PropositionGoGame.tsx TUTORIAL), checked by hand:
// each has exactly one answer.
import type { GameGuide } from './types';

const STONE = { red: '#ff4d5e', blue: '#3f8cff', green: '#34c463' };
type Fig = { stones: [keyof typeof STONE, number][]; lit?: number[] };

/** A 4×4 go board with stones on points (cells = row * 4 + col). */
function Board({ fig, label }: { fig: Fig; label: string }) {
  const at = (c: number) => ({ x: 12 + (c & 3) * 24, y: 12 + (c >> 2) * 24 });
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[200px]">
      <rect x="1" y="1" width="94" height="94" rx="9" fill="#0d0a1c" stroke="#9b7bff" strokeOpacity=".6" />
      <path d="M12 12H84M12 36H84M12 60H84M12 84H84M12 12V84M36 12V84M60 12V84M84 12V84" stroke="#8b5cff" strokeOpacity=".35" strokeWidth="2.6" />
      <path d="M12 12H84M12 36H84M12 60H84M12 84H84M12 12V84M36 12V84M60 12V84M84 12V84" stroke="#c9b6ff" strokeWidth=".7" />
      {fig.lit?.map((c) => { const p = at(c); return <circle key={`l${c}`} cx={p.x} cy={p.y} r="9" fill="#5ff0ff" fillOpacity=".15" stroke="#5ff0ff" strokeWidth=".8" />; })}
      {fig.stones.map(([colour, c]) => {
        const p = at(c);
        return (
          <g key={`${colour}${c}`}>
            <circle cx={p.x} cy={p.y} r="9" fill={STONE[colour]} stroke="#000" strokeWidth=".8" />
            <rect x={p.x - 3.6} y={p.y - 3.5} width="2.2" height="4.6" rx="1.1" fill="#17201e" /><rect x={p.x + 1.4} y={p.y - 3.5} width="2.2" height="4.6" rx="1.1" fill="#17201e" />
          </g>
        );
      })}
    </svg>
  );
}
const fig = (f: Fig, label: string) => <Board fig={f} label={label} />;

// 튜토리얼 2: 빨강은 모서리 · 빨강은 1행 · 파랑은 빨강 바로 오른쪽 · 초록은 파랑 바로 아래 → 빨강 (1,1), 파랑 (1,2), 초록 (2,2).
const T2_CORNERS: Fig = { stones: [], lit: [0, 3, 12, 15] };
const T2_ROW: Fig = { stones: [['red', 0]], lit: [0, 3] };
const T2_DONE: Fig = { stones: [['red', 0], ['blue', 1], ['green', 5]] };
// 튜토리얼 3: "빨강은 1행" 과 "빨강은 4행" 은 함께 참일 수 없다 → 거짓말은 둘 중 하나. 4행이면 초록이 판 밖 → 거짓말은 4행 카드.
const T3_CLASH: Fig = { stones: [], lit: [0, 12] };
const T3_DONE: Fig = { stones: [['red', 0], ['blue', 1], ['green', 5]] };

const guide: GameGuide = {
  game: 'propositionGo',
  origin: { kind: 'original' },
  updated: '2026-11-28',
  related: ['flipOmok', 'starbattle', 'nonogram', 'slitherlink'],
  ko: {
    meta: {
      title: '명제 바둑 공략 — 명제 카드 읽는 법, 거짓말 찾기, 오늘의 3문제 | PUZZLTHINK ORIGINAL',
      description: 'PUZZLTHINK 오리지널 논리 퍼즐 명제 바둑 공략. 4×4 바둑판에 색 바둑알을 놓아 모든 명제를 참으로 만드는 규칙, 명제 카드 13종 읽는 법, 단서 고르는 순서, "하나는 거짓말" 단계 푸는 법, 오늘의 3문제 타임 챌린지와 피스 힌트까지.',
      keywords: ['명제 바둑', '명제바둑', '논리 퍼즐', '명제 퍼즐', '거짓말 퍼즐', 'PUZZLTHINK 오리지널', '두뇌 퍼즐 게임'],
    },
    title: '명제 바둑 공략',
    lead: '카드가 모두 초록이 되는 자리는 단 하나. 거짓말쟁이 카드도 하나.',
    intro: [
      '명제 바둑은 PUZZLTHINK가 직접 만든 **오리지널 논리 퍼즐**이에요. 4×4 바둑판의 16개 점에 색이 다른 바둑알 4~5개를 하나씩 놓는데, 판 아래의 짧은 명제 카드("빨강은 모서리에 있다", "파랑은 초록보다 위")가 **모두 참**이 되는 배치는 딱 하나뿐이에요. 그 하나를 찾으면 정답이에요.',
      '돌을 놓는 동안 카드는 바로바로 ✓(참)·✗(거짓)·?(아직 모름)으로 바뀌어요. 마지막 단계에서는 카드 하나가 **거짓말**이라, 딱 한 장만 ✗가 되는 배치를 찾아 거짓말쟁이를 밝혀내야 해요. 이 공략은 카드를 읽는 법부터, 어떤 카드부터 보면 빠른지, 거짓말 단계를 푸는 순서와 오늘의 3문제 챌린지 규칙까지 정리해요.',
    ],
    gamePageTitle: '명제 바둑 — 모든 명제를 참으로 만드는 단 하나의 배치',
    summary: '명제 카드 읽는 법, 단서 고르는 순서, 거짓말 찾기, 오늘의 3문제 타임 챌린지와 피스 힌트.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '명제 바둑은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '명제 바둑은 방송이나 기존 보드게임을 옮긴 게 아니라 PUZZLTHINK에서 처음 만든 퍼즐이에요. 뒤집기 오목과 함께 **PUZZLTHINK ORIGINAL** 시리즈로 묶여 있어요. 바둑알 캐릭터가 주인공이라, 자기에 대한 명제가 참이 되면 깡총 뛰고, 거짓이 되면 움찔해요.' },
          { type: 'p', text: '문제는 모두 컴퓨터가 만들고, 만들 때마다 가능한 배치 52만여 가지를 전부 확인해서 **정답이 정확히 하나**인 문제만 내보내요. 찍기가 필요 없도록, 카드를 한 장씩 읽어 나가는 것만으로(어려운 단계는 "여기라면 모순" 한 번까지) 풀리는 문제만 골라요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 4×4 바둑판의 16개 점(교차점)에 돌을 놓아요. 가로줄은 위에서부터 1행~4행, 세로줄은 왼쪽부터 1열~4열이에요.',
            '**돌**: 색이 다른 돌 4개(기본) 또는 5개(심화·거짓말)를 모두, 한 점에 하나씩 놓아요.',
            '**정답**: 모든 명제 카드가 참이 되는 배치. 정답은 딱 하나예요.',
            '**거짓말 단계**: 카드 중 정확히 하나가 거짓이에요. 딱 한 장만 ✗가 되는 배치는 하나뿐이고, 그때 ✗인 카드가 거짓말쟁이예요.',
            '**놓기**: 아래 줄에서 돌을 고르고(자동으로 다음 돌이 골라져요) 점을 누르면 놓여요. 끌어다 놓아도 되고, 놓인 돌을 누르면 다시 집어요. 다른 돌이 있는 점을 누르면 두 돌이 자리를 바꿔요. ↶로 무를 수 있어요.',
            '**카드 상태**: 카드가 말하는 돌이 모두 놓이면 ✓ 또는 ✗로 켜져요. 돌 수를 세는 카드는 판이 정해지는 순간 바로 켜져요. 카드를 누르면 그 카드가 말하는 칸과 돌이 판에 표시돼요.',
          ] },
          { type: 'cards', items: [
            { title: '"빨강은 모서리에 있다"', body: '모서리는 네 귀퉁이 점이에요. 카드의 작은 바둑판 아이콘에 해당 점이 보라색으로 표시돼요.', figure: fig(T2_CORNERS, '모서리 네 점') },
            { title: '"빨강은 1행에 있다" 를 더하면', body: '모서리이면서 1행인 점은 두 곳뿐. 그런데 "파랑은 빨강 바로 오른쪽"이라 오른쪽 끝(1행 4열)은 안 돼요. 빨강은 1행 1열로 정해져요.', figure: fig(T2_ROW, '빨강 후보 두 곳') },
          ] },
        ],
      },
      {
        id: 'cards',
        onGamePage: true,
        title: '명제 카드 13종 읽는 법',
        lead: '모든 카드는 아래 문법 중 하나예요. 짧게 읽고 바로 판에 옮기는 게 속도의 핵심이에요.',
        blocks: [
          { type: 'table', head: ['카드', '뜻', '판에서 보는 법'], rows: [
            ['A는 [영역]에 있다 / 없다', '영역: 1~4행, 1~4열, 모서리(4점), 가장자리(12점), 가운데(4점), 위쪽·아래쪽·왼쪽·오른쪽 절반(8점)', '아이콘의 보라 점이 후보예요'],
            ['A와 B는 붙어 있다 / 안 붙어 있다', '가로나 세로로 바로 옆 점(대각선은 아님)', '한 돌을 놓으면 다른 돌 후보는 최대 4곳'],
            ['A와 B는 대각선 이웃', '대각선으로 바로 옆 점', '후보 최대 4곳, 모서리면 1곳'],
            ['B는 A 바로 아래 / 바로 오른쪽', '바로 한 칸 아래·오른쪽', '두 돌이 한 덩어리처럼 움직여요'],
            ['A와 B는 같은 행 / 같은 열 / 다른 행 / 다른 열', '같은 가로줄·세로줄인지', '행과 열을 헷갈리지 않게 아이콘을 보세요'],
            ['A는 B보다 위 / 왼쪽', '행 번호가 더 작다(엄격히) / 열 번호가 더 작다', 'A가 4행이면 거짓, B가 1행이면 거짓'],
            ['[영역]에 돌이 n개 / 없다', '그 영역에 놓인 돌(색 상관없이)이 정확히 n개', '모든 돌을 다 세야 해요'],
            ['A는 자기 행에 혼자 / A와 같은 행에 돌 n개 더', 'A와 같은 가로줄(세로줄)에 있는 다른 돌의 수', 'A의 줄을 비워 두거나 채워 두기'],
            ['A가 [영역]에 있으면 B는 [영역]에 있다 / 없다', '조건이 맞을 때만 뒤 문장을 확인(조건이 틀리면 카드는 참)', 'A가 그 영역 밖이면 신경 끄기'],
          ] },
          { type: 'callout', tone: 'tip', title: '"보다 위"는 같은 줄이면 거짓', text: '"빨강은 파랑보다 위"는 빨강이 파랑보다 **위쪽 행**에 있어야 참이에요. 같은 행이면 거짓이에요. "왼쪽"도 마찬가지예요.' },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 — 어떤 카드부터 볼까',
        blocks: [
          { type: 'list', items: [
            '**영역 카드 두 장이 같은 돌을 말하면 먼저**: "모서리" + "1행"처럼 겹치는 곳은 1~2점뿐이에요.',
            '**"바로 아래/오른쪽"은 묶음으로**: 두 돌을 한 조각으로 생각하면 후보가 확 줄어요. 오른쪽 끝 열에 있는 돌의 "바로 오른쪽"은 없어요.',
            '**돌 수 세는 카드는 마지막에**: "가운데에 돌 2개" 같은 카드는 다른 돌 자리가 거의 정해진 뒤에 남은 돌을 결정해 줘요.',
            '**확실한 돌만 먼저 놓기**: 놓으면 관련 카드가 바로 켜져서, 틀린 곳이면 즉시 ✗로 알려 줘요. 애매한 돌은 남은 카드를 다 읽은 뒤 놓으세요.',
          ] },
          { type: 'figure', node: fig(T2_DONE, '튜토리얼 2의 정답'), caption: '튜토리얼 2의 정답: 빨강 1행 1열, 파랑 바로 오른쪽, 초록 파랑 바로 아래.' },
        ],
      },
      {
        id: 'lie',
        level: 'intermediate',
        onGamePage: true,
        title: '거짓말 단계 — 부딪히는 두 장을 찾아라',
        blocks: [
          { type: 'p', text: '거짓말 단계에서는 카드 하나가 거짓이에요. 바로 정답을 찾으려 하기보다, **동시에 참일 수 없는 두 장**을 먼저 찾는 게 빨라요. 둘 중 하나가 거짓말쟁이이고, 나머지 카드는 모두 참이니까요.' },
          { type: 'steps', items: [
            { title: '부딪히는 두 장 찾기', body: '"빨강은 1행에 있다"와 "빨강은 4행에 있다"는 함께 참일 수 없어요. 거짓말쟁이는 이 둘 중 하나예요.', figure: fig(T3_CLASH, '1행과 4행') },
            { title: '한쪽씩 믿어 보기', body: '빨강이 4행 1열이라면 "파랑은 빨강 바로 오른쪽", "초록은 파랑 바로 아래"에서 초록이 판 밖으로 나가요. 모순이니 거짓말은 "4행" 카드예요.' },
            { title: '나머지를 모두 참으로', body: '"1행" 카드를 믿고 풀면 빨강 1행 1열, 파랑 그 오른쪽, 초록 파랑 아래. 마지막 돌을 놓는 순간 거짓 카드에 도장이 찍혀요.', figure: fig(T3_DONE, '거짓말 단계 정답') },
          ] },
          { type: 'callout', tone: 'note', title: '"X다"와 "X가 아니다"는 나오지 않아요', text: '거짓말 카드는 정반대 카드(예: "붙어 있다"와 "안 붙어 있다")와 짝지어 나오지 않아요. 부딪히는 두 장은 늘 한 번 생각해야 보이는 사이예요.' },
        ],
      },
      {
        id: 'daily',
        onGamePage: true,
        title: '오늘의 명제 — 3문제 타임 챌린지',
        blocks: [
          { type: 'list', items: [
            '**모두 같은 문제**: 매일 자정(한국 시간)에 기본·심화·거짓말 3문제가 새로 나와요. 오늘 도전하는 모든 사람이 같은 3문제를 풀어요.',
            '**하루 한 번, 시계 하나**: 회원은 하루 한 번 랭킹에 도전할 수 있어요. 시계는 세 문제 전체에 하나이고, 최대 10분이에요. 시작하면 나가거나 새로 고침해도 시계는 멈추지 않아서, 시작 전에 한 번 더 물어봐요. 연습은 언제든 무제한이에요.',
            '**정답은 서버가**: 문제는 한 번에 하나씩 오고, 정답은 서버만 알아요. 판이 풀리면 서버가 확인하고 다음 문제를 보내요.',
            '**힌트 두 가지 (한 판에 합쳐 3개까지)**: **피스 1개**로 정답에 대한 참 명제 한 장을 더 받아요(문제당 1번, 기록 **+30초**). **블랙피스 1개**로는 아직 제자리가 아닌 돌 하나가 정답 자리에 놓이고 잠겨요(**+40초**). 힌트를 쓴 기록에는 랭킹에 💡 표시가 붙어요. 벌점이 빠른 사람의 풀이 시간보다 커서, 힌트로 1위를 살 수는 없어요.',
            '**연속 기록과 왕관**: 매일 깨면 🔥 연속 기록이 쌓여요. 오늘의 1위는 명제 바둑 왕관 아이콘을 쓰고, 더 빠른 사람이 나오면 넘겨줘요.',
            '**주간 랭킹**: 매일 순위대로 1위 20점, 2위 19점 … 20위 1점을 받고, 수요일 0시(한국 시간)부터 일주일 동안 더해요. 오늘 점수도 바로 반영돼서 하루 중에도 주간 순위가 움직여요. 동점이면 그 주 최고 순위가, 그래도 같으면 평균 기록이 빠른 쪽이 앞서요.',
            '**공유**: 결과 카드는 정답 없이 시간과 단계별 기록만 보여 줘요. 친구도 같은 3문제를 풀 수 있어요.',
          ] },
          { type: 'callout', tone: 'tip', title: '처음이라면 연습부터', text: '연습 모드는 시간 제한이 없고 힌트도 무료예요. 튜토리얼 3판을 먼저 해 보면 카드 읽는 법이 금방 손에 익어요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어',
        blocks: [
          { type: 'glossary', items: [
            { term: '명제 카드', def: '판에 대한 짧은 문장 하나. 참(✓)·거짓(✗)·아직 모름(?)으로 표시돼요.' },
            { term: '점', def: '돌을 놓는 바둑판의 교차점. 4×4 판에 16개예요.' },
            { term: '행 / 열', def: '행은 가로줄(위에서 1~4), 열은 세로줄(왼쪽에서 1~4).' },
            { term: '거짓말쟁이', def: '거짓말 단계에서 정답 배치일 때 거짓이 되는 단 한 장의 카드.' },
            { term: '피스 힌트', def: '피스 1개로 받는 참 명제 한 장. 문제당 1번, +30초.' },
            { term: '블랙피스 힌트', def: '블랙피스 1개로 돌 하나를 정답 자리에 놓고 잠그기. +40초. 두 힌트 합쳐 한 판에 3개까지.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '정답이 정말 하나뿐인가요?', a: '네. 문제를 만들 때 가능한 모든 배치(돌 5개면 524,160가지)를 컴퓨터가 전부 확인해서, 모든 카드가 참인 배치가 정확히 하나인 문제만 내보내요. 거짓말 단계는 딱 한 장만 거짓인 배치가 하나뿐이에요.' },
      { q: '찍어야 하는 문제도 있나요?', a: '없어요. 카드를 한 장씩 판에 대 보는 것만으로 풀리거나, 심화·거짓말 단계에서 "이 돌이 여기라면 모순"을 한 번 떠올리면 풀리는 문제만 골라요.' },
      { q: '오늘의 명제는 몇 번 할 수 있나요?', a: '랭킹 도전은 회원당 하루 한 번이에요. 연습 모드는 로그인 없이 몇 번이든 할 수 있어요.' },
      { q: '피스 힌트를 쓰면 1위를 할 수 있나요?', a: '힌트 한 번마다 30초가 더해져요. 문제 하나를 30초 안팎에 푸는 상위권에게는 손해라, 힌트는 막혔을 때 끝까지 가기 위한 구조 장치예요. 힌트를 쓴 기록에는 💡가 붙어요.' },
      { q: '주간 1위는 어떻게 정해지나요?', a: '매일 랭킹에서 1위 20점, 2위 19점 … 20위 1점을 받아 수요일 0시부터 화요일 밤까지 더해요. 매일 꾸준히 상위권에 들수록 유리하고, 오늘 점수는 바로 반영돼요. 지난주 1위도 화면에 작게 남아요.' },
      { q: '시작하고 창을 닫으면 어떻게 되나요?', a: '시계는 서버에서 흐르기 때문에 멈추지 않아요. 다시 들어오면 하던 문제부터 이어서 풀 수 있고, 10분이 지나면 시간 초과로 끝나요.' },
      { q: '"PUZZLTHINK ORIGINAL"은 무슨 뜻인가요?', a: 'TV 프로그램이나 기존 보드게임에서 가져오지 않고 PUZZLTHINK가 규칙부터 직접 만든 게임이라는 표시예요. 명제 바둑과 뒤집기 오목이 이 시리즈예요.' },
    ],
    cta: { title: '오늘의 3문제, 풀어 볼까요?', body: '처음이라면 튜토리얼 3판이면 충분해요. 카드가 하나씩 초록으로 켜지는 맛을 느껴 보세요.', button: '명제 바둑 하러 가기' },
  },
  en: {
    meta: {
      title: 'Proposition Go guide — reading the cards, finding the lie, the daily three | PUZZLTHINK ORIGINAL',
      description: 'Guide to Proposition Go, a PUZZLTHINK original logic puzzle: place coloured go stones on a 4×4 board so every proposition is true. How to read all 13 kinds of card, which cards to read first, how to solve the “one of them lies” stage, and the daily three-puzzle time challenge with piece hints.',
      keywords: ['Proposition Go', 'logic puzzle', 'liar puzzle', 'deduction puzzle', 'PUZZLTHINK original', 'brain puzzle game'],
    },
    title: 'Proposition Go guide',
    lead: 'Exactly one placement turns every card green. Exactly one card is the liar.',
    intro: [
      'Proposition Go is a **PUZZLTHINK original logic puzzle**. You place 4–5 differently coloured stones on the 16 points of a 4×4 go board. Short proposition cards under the board (“Red is in a corner”, “Blue is above Green”) are **all true** for exactly one placement; find it.',
      'While you place stones, each card turns ✓ (true), ✗ (false) or ? (not decided yet) at once. In the last stage one card is a **lie**: find the placement where exactly one card is false, and that card is the liar. This guide covers reading the cards, which cards to read first, the order for the lie stage, and the rules of the daily three-puzzle challenge.',
    ],
    gamePageTitle: 'Proposition Go — the one placement that makes every proposition true',
    summary: 'Reading the cards, which clue first, finding the lie, the daily three-puzzle challenge and piece hints.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Proposition Go?',
        blocks: [
          { type: 'p', text: 'Proposition Go is not taken from a TV show or an existing board game: PUZZLTHINK made it. Together with Flip Omok it forms the **PUZZLTHINK ORIGINAL** series. The go-stone characters are the actors: a stone hops when a card about it turns true and winces when it turns false.' },
          { type: 'p', text: 'Every puzzle is made by computer and checked against all of the 524,160 possible placements, so each one has **exactly one answer**. Only puzzles you can solve by reading the cards one at a time (with at most one “if it were here, a card breaks” on the harder stages) are used: no guessing.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'Rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board**: stones go on the 16 points (intersections) of a 4×4 go board. Rows are numbered 1–4 from the top, columns 1–4 from the left.',
            '**Stones**: place all 4 (basic) or 5 (advanced and lie) differently coloured stones, one per point.',
            '**Answer**: the placement that makes every card true. There is exactly one.',
            '**Lie stage**: exactly one card is false. Only one placement leaves exactly one card ✗, and that card is the liar.',
            '**Placing**: pick a stone in the tray (the next one is picked for you) and tap a point. You can also drag. Tap a placed stone to pick it up; tapping a point with another stone swaps them. ↶ undoes.',
            '**Card states**: a card lights ✓ or ✗ once every stone it names is down. Counting cards light as soon as the board settles them. Tap a card to see its points and stones on the board.',
          ] },
        ],
      },
      {
        id: 'cards',
        onGamePage: true,
        title: 'Reading the 13 kinds of card',
        blocks: [
          { type: 'table', head: ['Card', 'Meaning'], rows: [
            ['A is (not) in [area]', 'Areas: rows 1–4, columns 1–4, the corners (4 points), the edge (12), the middle (4), the top / bottom / left / right half (8)'],
            ['A touches B / does not touch B', 'Side by side, horizontally or vertically (not diagonally)'],
            ['A touches B diagonally', 'Corner to corner'],
            ['B is right below / just right of A', 'Exactly one point down / right'],
            ['A and B share a row / column, or are in different ones', 'Same horizontal / vertical line'],
            ['A is above / left of B', 'A smaller row / column number (strictly)'],
            ['n stones / no stones in [area]', 'Any colour, exactly n'],
            ['A is alone in its row / n more in A’s row', 'How many other stones share A’s line'],
            ['If A’s in [area], B’s (not) in [area]', 'Only checked when the condition holds (otherwise the card is true)'],
          ] },
          { type: 'callout', tone: 'tip', title: '“Above” is false on the same row', text: '“Red is above Blue” needs Red on a **higher row** than Blue. On the same row it is false. “Left of” works the same way.' },
        ],
      },
      {
        id: 'lie',
        level: 'intermediate',
        onGamePage: true,
        title: 'The lie stage — find the two cards that clash',
        blocks: [
          { type: 'p', text: 'Rather than hunting for the answer at once, first look for **two cards that cannot both be true**. One of them is the liar, so every other card is true.' },
          { type: 'steps', items: [
            { title: 'Find the clash', body: '“Red is in row 1” and “Red is in row 4” cannot both hold. The liar is one of them.', figure: fig(T3_CLASH, 'Rows 1 and 4') },
            { title: 'Trust one side', body: 'If Red were in row 4, column 1, “Blue is just right of Red” and “Green is right below Blue” push Green off the board. So the row 4 card is the lie.' },
            { title: 'Make everything else true', body: 'Trusting row 1: Red at row 1 column 1, Blue to its right, Green below Blue. The moment the last stone lands, the lying card is stamped.', figure: fig(T3_DONE, 'Lie stage answer') },
          ] },
        ],
      },
      {
        id: 'daily',
        onGamePage: true,
        title: 'Today’s propositions — the three-puzzle challenge',
        blocks: [
          { type: 'list', items: [
            '**Same puzzles for everyone**: at midnight Korean time a new set of three (basic, advanced, lie) comes out. Everyone plays the same three.',
            '**One attempt, one clock**: members get one ranked attempt a day. One clock runs over all three puzzles, 10 minutes at most, and it keeps running if you leave or reload, so the game asks once more before it starts. Practice is unlimited.',
            '**The server keeps the answers**: puzzles come one at a time; the server checks each solved board and sends the next.',
            '**Two hints (3 per run in all)**: **one piece** buys one more true proposition about the answer (once per puzzle, **+30 s**); **one black piece** puts one stone that is not yet right on its answer point and locks it (**+40 s**). Hinted runs carry a 💡 in the ranking; the penalties outweigh what a fast solver saves, so hints never buy first place.',
            '**Streaks and the crown**: clear every day to build a 🔥 streak. Today’s #1 wears the Proposition Go crown until someone beats the time.',
            '**Weekly ranking**: each day’s ranking gives points, #1 = 20, #2 = 19 … #20 = 1, added up over the week from Wednesday 00:00 Korean time. Today’s points count right away, so the weekly board moves during the day. Ties go to the better best day, then the faster average time.',
            '**Sharing**: the result card shows times, never answers, so friends can play the same three.',
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Is there really only one answer?', a: 'Yes. Every puzzle is checked against all possible placements (524,160 for five stones). Plain stages have exactly one all-true placement; the lie stage has exactly one placement with exactly one false card.' },
      { q: 'Do I ever have to guess?', a: 'No. Puzzles are solvable by reading cards one at a time, or on the harder stages with one “if this stone were here, a card breaks”.' },
      { q: 'How often can I play the daily set?', a: 'One ranked attempt per member per day. Practice is unlimited and needs no account.' },
      { q: 'Can hints win the ranking?', a: 'Each hint adds 30 seconds, which costs a top player more than it saves. Hints are there to get you to the end; hinted runs carry a 💡.' },
      { q: 'How is the weekly #1 decided?', a: 'Each day’s ranking gives #1 20 points, #2 19 … #20 1, added up from Wednesday 00:00 to Tuesday night (Korean time). Steady top finishes win the week; today’s points count right away, and last week’s #1 stays on screen in small print.' },
      { q: 'What if I close the window after starting?', a: 'The clock runs on the server, so it doesn’t stop. Come back and you pick up the puzzle you were on; after 10 minutes the run ends as a timeout.' },
      { q: 'What does PUZZLTHINK ORIGINAL mean?', a: 'A game whose rules PUZZLTHINK made itself, not taken from a TV show or a classic. Proposition Go and Flip Omok are in the series.' },
    ],
    cta: { title: 'Ready for today’s three?', body: 'If it is your first time, the three tutorial boards are enough. Watch the cards turn green one by one.', button: 'Play Proposition Go' },
  },
};

export default guide;
