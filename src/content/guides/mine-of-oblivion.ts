// 망각의 지뢰 guide. Rules follow src/lib/mineOblivion.ts (the [show]/[site] rule list at its top: 11×11, 15 mines
// each, the 3×3 no-go block at each start, numbers = live mines in the eight cells around, already-scored cells give
// 0, −5 and a respawn next to the start, treasure 10/15/20, end on the third treasure or 70 moves, equal = draw) and
// src/lib/mineOblivionRoom.ts (120 s to bury, 30 s a move, the 4.2 s memorise moment). AI levels: mineOblivionAi.ts.
// Broadcast facts: src/content/shows/dg1/games-b.ts (mineOfOblivion) and dg2/mine-of-oblivion-2.ts (나무위키).
// Figures: scripts/mine-oblivion/sim.ts, 400 AI matches (seed 20261128, 2026-11-28). Items: src/lib/mineOblivionItems.ts.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'mineOblivion',
  origin: { kind: 'show', show: 'dg1' },
  updated: '2026-11-28',
  related: ['blindGomoku', 'hexagon', 'russianRoulette', 'timeAuction'],
  ko: {
    meta: {
      title: '망각의 지뢰 공략 — 데스게임 6회차 규칙, 숫자 읽기, 지뢰 묻는 법 | PUZZLTHINK',
      description: '넷플릭스 데스게임 6회차 망각의 지뢰 공략. 11×11 판과 지뢰 15개, 둘레 지뢰 수만큼의 점수, 지뢰 −5점과 보물 +10·+15·+20, 보이는 것과 외워야 할 것, 숫자로 상대 지뢰를 추리하는 법, 내 지뢰를 묻는 요령까지.',
      keywords: ['망각의 지뢰 공략', '망각의 지뢰 규칙', '데스게임 망각의 지뢰', '망각의 지뢰 룰', '데스게임 6회차', '지뢰 찾기 추리'],
    },
    title: '망각의 지뢰 공략',
    lead: '지뢰 찾기를 둘이, 기억으로. 내 지뢰는 외워서 피하고 상대 지뢰는 숫자로 추리해요.',
    intro: [
      '망각의 지뢰는 두 사람이 각자 지뢰 15개를 몰래 묻은 판 위를 번갈아 걸으며 점수를 모으고 보물을 찾는 1:1 게임이에요. 지뢰가 없는 칸을 밟으면 둘레 8칸의 지뢰 수만큼 점수를 얻으니, **지뢰 옆이 곧 점수 밭**이에요. 그런데 걷기가 시작되면 판에서 내 지뢰마저 사라져요. 숫자는 한 번 공지되고 끝이고요.',
      '이 공략은 게임 화면의 짧은 규칙보다 깊이 들어가요. 헷갈리기 쉬운 판정, 화면에 남는 것과 외워야 하는 것, 숫자 두세 개로 상대 지뢰 위치를 좁히는 추리, 이기는 지뢰 배치, 그리고 AI 두 단계의 성격까지 담았어요.',
    ],
    gamePageTitle: '망각의 지뢰 온라인 — 데스게임 6회차 1:1 지뢰 게임을 웹에서',
    summary: '둘레 지뢰 수 점수, 망각 규칙, 숫자로 상대 지뢰 추리하기, 이기는 지뢰 배치.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '망각의 지뢰는 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '넷플릭스 「데스게임: 천만원을 걸어라」(2026) 6회차의 1:1 게임이에요. 시즌 2에서는 시한폭탄이 더해진 「망각의 지뢰 2」로 다시 나왔어요. PUZZLTHINK 버전은 시즌 1 규칙을 바탕으로 하고, 시즌 2의 70수 제한을 가져왔어요.' },
          { type: 'p', text: 'AI와 1:1(**보통**·**어려움**)로 하거나, 친구 방·공개방에서 사람끼리 둘 수 있어요. 한 판은 보통 4~7분, 양쪽 합쳐 55수 안팎이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '기본 규칙',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 11×11. 가운데와 왼쪽 위·오른쪽 아래 모서리에 **보물** 3개, 나머지 두 모서리가 출발지예요. 화면은 내 출발지가 왼쪽 아래에 오도록 돌려서 보여 줘요.',
            '**묻기**: 각자 지뢰 **15개**를 몰래 묻어요. 출발지 근처 3×3(노란 줄무늬)과 보물 칸에는 못 묻어요. 상대 지뢰를 모르니 같은 칸에 둘이 겹칠 수 있어요(겹친 칸).',
            '**망각**: 걷기가 시작되면 4초 동안 내 지뢰를 보여 준 뒤 판에서 지워요. 그 뒤로 판에는 지뢰가 전혀 표시되지 않아요. 공개되는 건 지뢰가 든 칸의 **개수**뿐이에요.',
            '**이동**: 번갈아 내 말 둘레 8칸 중 한 칸으로 옮겨요. 상대 말이 있는 칸으로는 못 가고, 제자리에 있을 수 없어요.',
            '**점수**: 지뢰가 없는 칸이면 둘레 8칸의 지뢰 수만큼 점수를 받아요. 내 지뢰도, 상대 지뢰도 세고, 겹친 칸은 2로 세요. 누군가 이미 점수를 받은 칸(발자국)은 다시 밟아도 0점이에요.',
            '**지뢰**: 누구 것이든 밟으면 **−5점**, 그 칸의 지뢰는 모두 사라지고, 출발지 옆 세 칸 중 하나를 골라 돌아가요. 누구 지뢰였는지는 알려 주지 않아요.',
            '**보물**: 찾은 순서대로 **+10, +15, +20**점. 처음 밟은 사람은 그 칸의 둘레 숫자도 함께 받아요.',
            '**끝**: 보물 3개가 모두 발견되면 바로 끝나요. 양쪽 합쳐 **70수**가 되어도 끝나요. 점수가 높은 쪽이 이기고, 같으면 무승부예요.',
          ] },
        ],
      },
      {
        id: 'memory',
        onGamePage: true,
        title: '보이는 것과 외워야 하는 것',
        blocks: [
          { type: 'table', head: ['', '판에 계속 보여요', '잠깐만 보여요 → 외워야 해요'], rows: [
            ['내 지뢰', '—', '묻을 때, 그리고 걷기 시작 4초'],
            ['상대 지뢰', '—', '끝날 때까지 전혀'],
            ['숫자', '—', '밟은 칸 위 3초, 그리고 다음 수가 나올 때까지 아래 안내 칸'],
            ['발자국(이미 점수 받은 칸)', '계속', '—'],
            ['터진 자리', '계속(빈 칸이 됐다는 표시)', '—'],
            ['점수·보물·지뢰 칸 수', '계속', '—'],
          ] },
          { type: 'callout', tone: 'tip', title: '점수판도 정보예요', text: '상대 점수가 3점 올랐다면 그 칸의 숫자는 3이에요. 숫자를 놓쳤어도 점수 변화로 되살릴 수 있어요. 다만 보물을 밟은 수는 보물 점수를 빼고 계산해야 해요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리기 쉬운 판정',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: '겹친 칸', body: '두 사람이 같은 칸에 묻으면 그 칸은 둘레 숫자에 2로 세요. 밟으면 −5점은 한 번이고 지뢰 둘이 함께 사라져요. 시작할 때 공개되는 "지뢰 칸 29"처럼 30보다 작은 수는 겹친 칸이 있다는 뜻이에요.' },
            { title: '터진 자리는 안전', body: '터진 칸의 지뢰는 모두 사라지므로 그 칸은 이제 빈 칸이에요. 아직 아무도 점수를 받지 않았으니 나중에 밟으면 둘레 숫자만큼 점수를 받아요.' },
            { title: '돌아갈 칸은 내가 골라요', body: '지뢰를 밟으면 출발지 옆 세 칸이 파랗게 빛나요. 상대 말이 있는 칸은 고를 수 없어요. 돌아간 칸에서는 점수가 없고, 그걸로 내 차례가 끝나요.' },
            { title: '마지막 보물은 신중하게', body: '세 번째 보물을 찾는 순간 게임이 끝나요. 보물 +20을 더해도 지고 있다면 밟지 마세요. 반대로 앞서고 있다면 서둘러 끝내는 것이 가장 안전해요.' },
            { title: '시간이 다 되면', body: '친구 방에서는 묻기 120초, 한 수 30초예요. 묻기 시간을 넘기면 남은 지뢰가 무작위로 채워지고, 수를 놓치면 그 수는 AI가 대신 두고 "돌아오기"를 누를 때까지 AI가 이어서 둬요. AI 대전에는 시간 제한이 없어요.' },
            { title: '기권', body: '판 아래 깃발 버튼으로 기권할 수 있어요. 바로 패배로 끝나요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문: 내 지뢰 옆을 걸으세요',
        blocks: [
          { type: 'p', text: '지뢰 30개가 100칸에 묻혀 있으니, 아무 정보 없이 새 칸을 밟으면 셋 중 하나는 지뢰예요. 지뢰 한 번은 −5점에 출발지로 돌아가는 시간까지 잃으니, 무작정 걷는 것은 손해예요.' },
          { type: 'list', items: [
            '**내 지뢰 바로 옆 칸**은 내가 아는 안전한 점수 밭이에요. 지뢰를 묻을 때 "내가 걸을 길"을 정하고 그 길 양옆에 묻으세요. 길 자체는 비워 두고요.',
            '숫자가 0인 칸의 둘레 8칸은 모두 안전해요. 0을 본 칸 주변은 마음껏 걸어도 돼요.',
            '외울 범위를 좁히세요. 지뢰 15개를 판 전체에 흩으면 다 외우기 어려워요. 몇 덩어리로 묶으면 기억하기 쉬워요.',
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급: 숫자로 상대 지뢰 좁히기',
        blocks: [
          { type: 'p', text: '숫자에는 내 지뢰도 섞여 있어요. 그래서 공지된 숫자에서 **그 칸 둘레의 내 지뢰 수를 빼면** 상대 지뢰 수가 나와요. 이것이 추리의 출발점이에요.' },
          { type: 'steps', items: [
            { title: '숫자에서 내 몫 빼기', body: '상대가 밟은 칸에서 4가 나왔고, 그 칸 둘레에 내 지뢰가 1개 있다면 상대 지뢰는 3개예요.' },
            { title: '안전한 칸 지우기', body: '둘레 8칸 중 발자국·터진 자리·출발지 구역은 지뢰가 없어요. 남은 칸이 3칸뿐이라면 셋 다 상대 지뢰예요.' },
            { title: '두 숫자 겹치기', body: '이웃한 두 칸의 숫자를 비교하면, 겹치지 않는 가장자리 칸에서 지뢰 수 차이가 드러나요. 지뢰 찾기에서 쓰는 1-2 패턴이 그대로 통해요.' },
            { title: '상대 발자국도 정보', body: '상대가 지나간 칸은 모두 안전한 칸이에요. 상대가 일부러 피해 가는 칸은 상대 지뢰일 가능성이 높아요.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급: 이기는 지뢰 배치',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: '상대의 길목에', body: '보물까지 가장 짧은 길은 정해져 있어요. 상대 출발지에서 가운데와 모서리 보물로 가는 대각선 길목에 지뢰를 몰아 두면, 상대는 돌아가거나 위험을 감수해야 해요.' },
            { title: '보물은 반만 막기', body: '보물 둘레를 지뢰로 둘러싸되 한두 칸은 비워 두세요. 빈 칸은 나만 알고, 둘레 숫자가 높아 상대는 다가오기를 꺼려요. 다 막아 버리면 나도 못 들어가요.' },
            { title: '앞서면 끝내고, 뒤지면 버티기', body: '보물 세 개가 다 나오면 끝나므로, 앞선 쪽은 보물을 서둘러 줍고 뒤진 쪽은 마지막 보물을 남겨 둔 채 점수 밭을 걸어야 해요. 70수 제한도 계산에 넣으세요.' },
            { title: '시뮬레이션으로 본 배치의 힘', body: 'AI 400판을 돌려 보니, 어려움 AI가 보통 AI를 이기는 이유의 상당 부분이 "자기 길은 비우고 상대 길목에 묻는" 배치였어요. 같은 배치를 쓰게 하면 승률 차이가 크게 줄었어요.' },
          ] },
        ],
      },
      {
        id: 'ai',
        title: 'AI 두 단계',
        blocks: [
          { type: 'p', text: '두 AI 모두 **공정하게** 둬요. 자기 지뢰, 판에 보이는 것, 공지된 숫자만 쓰고 내 지뢰는 몰라요.' },
          { type: 'table', head: ['', '보통', '어려움'], rows: [
            ['기억', '사람처럼 잊어요. 자기 지뢰를 처음엔 20개 중 1개꼴, 40수쯤엔 4개 중 1개꼴로 잊고, 오래된 숫자일수록 빨리 잊어요', '본 것을 모두 기억해요'],
            ['추리', '기억나는 숫자로 어림셈', '모든 숫자를 제약으로 놓고, 그에 맞는 상대 지뢰 배치를 수천 번 뽑아 칸마다 지뢰 확률을 계산해요'],
            ['수 읽기', '2수 앞, 약간의 실수', '2수 앞, 보물 경주와 마지막 보물 판단'],
            ['지뢰 배치', '보물 근처와 상대 길목에 느슨하게', '자기 길은 비우고, 상대 길목과 보물 둘레(한 칸은 비움)에 집중'],
            ['자기 지뢰 밟기', '한 판에 0.2번꼴', '거의 없음'],
          ] },
          { type: 'p', text: 'AI끼리 400판(scripts/mine-oblivion/sim.ts)에서 어려움은 보통을 **73.8%** 이겼고, 한 판은 평균 56수, 78%는 보물 세 개로 끝났어요(나머지는 70수 제한).' },
        ],
      },
      {
        id: 'items',
        title: '아이템 (AI 대전)',
        blocks: [
          { type: 'p', text: 'AI 대전(보통·어려움)에서는 로그인한 회원이 다른 게임에서 모은 **피스**와 **블랙피스**로 아이템을 쓸 수 있어요. 친구 방·공개방에는 아이템이 없어요. 사람끼리 돈 주고 도움을 사면 불공평하니까요.' },
          { type: 'table', head: ['아이템', '값', '한 판에', '하는 일'], rows: [
            ['탐지기', '피스 1', '2번', '움직이지 않고 내 둘레 칸 하나를 골라 그 칸 둘레의 지뢰 수를 잠깐 봐요. 그 칸 자체가 지뢰인지는 알려 주지 않아요.'],
            ['기억 되살리기', '피스 1', '2번', '내가 묻은 지뢰(아직 안 터진 것)가 2초 동안 다시 보여요.'],
            ['방폭복', '블랙피스 1', '1번', '켜 두면 다음에 밟는 지뢰가 −5점도, 되돌아가기도 없이 터지기만 해요. 끝까지 지뢰를 안 밟아도 소멸돼요.'],
          ] },
          { type: 'callout', tone: 'tip', title: '언제 쓰면 좋을까', text: '탐지기는 다음에 밟으려는 칸에 쓰면 그 칸 둘레의 숫자를 미리 알 수 있어요. 숫자가 크면 그 칸 자체도 위험할 수 있다는 신호예요. 기억 되살리기는 판 가운데로 들어가기 직전, 방폭복은 보물로 가는 마지막 길이 수상할 때 가장 값어치가 커요. AI와 시뮬레이션한 결과로는 방폭복의 효과가 가장 컸어요.' },
          { type: 'callout', tone: 'note', title: '아이템을 쓴 판의 기록', text: '탐지기와 기억 되살리기는 내 수를 쓰지 않아요. 아이템을 쓴 판은 결과 화면과 기록에 표시되고, 어려움 클리어 인증서·피스 획득·명예의 전당 승수에는 들어가지 않아요. 승패 기록은 그대로 남아요. 블랙피스를 쓰면 이번 주 블랙피스 순위의 개수도 줄어요.' },
        ],
      },
      {
        id: 'differences',
        title: '방송과 다른 점',
        blocks: [
          { type: 'table', head: ['', '방송 (시즌 1)', 'PUZZLTHINK'], rows: [
            ['숫자 공지', '말로 공지', '밟은 칸 위에 3초 + 다음 수까지 안내 칸'],
            ['판에 남는 것', '알려지지 않음', '발자국(이미 점수 받은 칸)과 터진 자리'],
            ['지뢰 뒤 돌아갈 칸', '출발지 주변 3칸 중 하나', '같음, 직접 골라요'],
            ['겹친 칸을 밟으면', '알려지지 않음', '−5점 한 번, 둘 다 사라짐'],
            ['보물 칸의 숫자', '알려지지 않음', '처음 밟은 사람이 받아요'],
            ['끝', '보물 3개', '보물 3개 또는 70수(시즌 2 규칙). 같은 점수는 무승부'],
            ['시간', '묻기 10분', '친구 방: 묻기 120초, 한 수 30초. AI 대전: 제한 없음'],
            ['시한폭탄', '시즌 2에만', '없음'],
            ['연습 게임(9×9)', '있음', '없음 (첫 판에 짧은 튜토리얼)'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어',
        blocks: [
          { type: 'glossary', items: [
            { term: '숫자', def: '밟은 칸 둘레 8칸에 남아 있는 지뢰 수. 내 것과 상대 것을 모두 세요.' },
            { term: '겹친 칸', def: '두 사람이 모두 지뢰를 묻은 칸. 숫자에는 2로 세요.' },
            { term: '발자국', def: '누군가 이미 점수를 받은 칸. 다시 밟아도 0점이고, 지뢰가 없다는 뜻이기도 해요.' },
            { term: '터진 자리', def: '지뢰가 터진 칸. 지뢰가 모두 사라져 빈 칸이 됐어요.' },
            { term: '망각', def: '걷기가 시작되면 내 지뢰마저 판에서 사라지는 규칙.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '망각의 지뢰에서 내가 묻은 지뢰를 밟아도 터지나요?', a: '네. 누구 지뢰든 밟으면 −5점이고 출발지 옆으로 돌아가요. 그래서 내 지뢰 위치를 기억하는 것이 이 게임의 핵심이에요.' },
      { q: '숫자는 무엇을 세나요?', a: '밟은 칸을 둘러싼 8칸에 남아 있는 지뢰 수예요. 내 지뢰와 상대 지뢰를 모두 세고, 두 사람이 같은 칸에 묻었다면 2로 세요. 이미 누가 점수를 받은 칸에서는 숫자가 나오지 않아요.' },
      { q: '숫자를 놓쳤는데 다시 볼 수 있나요?', a: '다음 수가 나올 때까지는 판 아래 안내 칸에 남아 있어요. 그 뒤로는 사라지지만, 점수판에서 그 사람 점수가 얼마나 올랐는지로 되살릴 수 있어요.' },
      { q: '게임은 언제 끝나나요?', a: '보물 세 개가 모두 발견되는 순간, 또는 양쪽 합쳐 70수가 되면 끝나요. 점수가 높은 쪽이 이기고, 같으면 무승부예요.' },
      { q: 'AI가 내 지뢰를 보고 두나요?', a: '아니요. AI는 자기 지뢰와 판에 보이는 것, 공지된 숫자만 써요. 보통 AI는 그것마저 조금씩 잊고, 어려움 AI는 모두 기억해서 숫자로 확률을 계산해요.' },
      { q: '친구 방에서 상대가 내 지뢰를 볼 수 있나요?', a: '아니요. 묻은 지뢰는 암호화해 방장 브라우저로만 보내고, 숫자와 폭발은 방장 브라우저가 계산해 두 사람에게 똑같이 알려요. 지뢰는 게임이 끝나야 공개돼요.' },
    ],
    cta: { title: '어디에 묻었는지 기억하나요?', body: 'AI와 한 판은 4~7분이에요. 첫 판에는 짧은 튜토리얼이 나와요.', button: '망각의 지뢰 하러 가기' },
    disclaimer: 'PUZZLTHINK는 데스게임 및 넷플릭스와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했어요. 실제 돈을 거는 도박과는 아무 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Mine of Oblivion strategy — Death Game match 6 rules, reading numbers, burying mines | PUZZLTHINK',
      description: "A guide to Mine of Oblivion from Netflix's Death Game (The Risk Takers): the 11×11 board and 15 mines each, scoring the mines around you, −5 for a mine and treasure 10, 15, 20, what you see and what you must remember, deducing mines from numbers, and where to bury yours.",
      keywords: ['Mine of Oblivion strategy', 'Mine of Oblivion rules', 'Death Game Mine of Oblivion', 'The Risk Takers', 'two player minesweeper'],
    },
    title: 'Mine of Oblivion strategy',
    lead: 'Minesweeper for two, played from memory: avoid your mines by remembering them, theirs by deduction.',
    intro: [
      'In Mine of Oblivion two players each bury 15 secret mines, then take turns walking the board, scoring and hunting three treasures. A clear cell scores the mines in the eight cells around it, so **the cells next to mines are where the points are**. But when the walk starts, even your own mines vanish from the board, and each number is announced once.',
      'This guide goes past the short rules under the game: the rulings people trip over, what stays on screen and what you must remember, narrowing the opponent’s mines from two or three numbers, burying to win, and how the two AI levels play.',
    ],
    gamePageTitle: 'Mine of Oblivion online — the Death Game 1:1 minefield duel on the web',
    summary: 'Scoring nearby mines, the oblivion rule, deducing mines from numbers, burying to win.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Mine of Oblivion?',
        blocks: [
          { type: 'p', text: "The one-on-one game of match 6 in Netflix's Death Game (The Risk Takers, 2026). Season 2 brought it back as Mine of Oblivion 2 with time bombs. PUZZLTHINK follows the season 1 rules and borrows season 2's 70-move limit." },
          { type: 'p', text: 'Play 1:1 against the AI (**Normal** or **Hard**), or against a person in a friend or open room. A game takes 4–7 minutes, about 55 moves in all.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'Rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board**: 11×11, with three **treasures** in the centre and the top-left and bottom-right corners; the other corners are the starts. Your screen is turned so your start is bottom-left.',
            '**Burying**: each player secretly buries **15 mines**, never in the 3×3 around a start (striped) or on treasure. Neither knows the other’s, so both may bury on one cell (a shared cell).',
            '**Oblivion**: when the walk starts your mines are shown for four seconds and then wiped from the board. After that no mine is ever drawn; only the **number** of mined cells is public.',
            '**Moving**: take turns moving to one of the eight cells around your piece, never onto the opponent, never staying put.',
            '**Scoring**: on a clear cell you score the mines in the eight cells around it — yours and theirs, a shared cell counting 2. A cell someone already scored (footprints) scores 0 again.',
            '**Mines**: anyone’s mine costs **5 points**, every mine on that cell is removed, and you pick one of the three cells by your start to go back to. Nobody is told whose mine it was.',
            '**Treasure**: **+10, +15, +20** in the order found; the first visitor also scores the cell’s number.',
            '**End**: the moment all three treasures are found, or after **70 moves** in all. Higher score wins; equal is a draw.',
          ] },
        ],
      },
      {
        id: 'memory',
        onGamePage: true,
        title: 'What you see and what you must remember',
        blocks: [
          { type: 'table', head: ['', 'Stays on the board', 'Shown for a moment → remember it'], rows: [
            ['Your mines', '—', 'While burying, and four seconds at the start'],
            ['Their mines', '—', 'Never, until the end'],
            ['Numbers', '—', 'Three seconds on the cell, and in the panel below until the next move'],
            ['Footprints (scored cells)', 'Always', '—'],
            ['Craters', 'Always (the cell is empty now)', '—'],
            ['Scores, treasure, mined-cell count', 'Always', '—'],
          ] },
          { type: 'callout', tone: 'tip', title: 'The scoreboard remembers for you', text: 'If the opponent’s score went up by 3, that cell’s number was 3. A missed number can be rebuilt from the score change (minus treasure points on a treasure move).' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Rulings people trip over',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: 'Shared cells', body: 'A cell both players mined counts 2 in numbers. Stepping on it costs 5 once and removes both. A starting count below 30 ("Mined cells 29") means there is a shared cell.' },
            { title: 'Craters are safe', body: 'A blown cell loses all its mines, so it is empty now. Nobody scored it, so stepping there later scores its number.' },
            { title: 'You choose where to go back', body: 'After a mine the three cells by your start glow blue; not the one the opponent stands on. That cell scores nothing and ends your turn.' },
            { title: 'Careful with the last treasure', body: 'The third treasure ends the game at once. If +20 still leaves you behind, do not take it. If you are ahead, ending it is the safest move.' },
            { title: 'When time runs out', body: 'Friend rooms give 120 s to bury and 30 s a move. Missing the burying clock fills your mines at random; missing a move lets the AI play it and keep playing until you tap "back". AI matches have no clock.' },
            { title: 'Resigning', body: 'The flag under the board resigns: an immediate loss.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner: walk beside your own mines',
        blocks: [
          { type: 'p', text: 'Thirty mines in a hundred cells means one new cell in three is a mine if you know nothing. A mine costs 5 and the walk back, so wandering blind loses.' },
          { type: 'list', items: [
            '**The cells next to your own mines** are safe points only you know. When burying, choose the route you will walk and line its sides with mines, keeping the route itself clear.',
            'A 0 means all eight cells around are clear. Walk freely there.',
            'Keep what you must remember small: fifteen mines scattered everywhere are hard to recall; a few clumps are easy.',
          ] },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate: narrowing their mines from numbers',
        blocks: [
          { type: 'p', text: 'Your own mines are in every number. **Subtract your mines around the cell** from the number announced and you have the opponent’s mines there. That is where deduction starts.' },
          { type: 'steps', items: [
            { title: 'Take out your share', body: 'The opponent stepped on a 4 and one of your mines touches that cell: three of theirs are around it.' },
            { title: 'Strike out safe cells', body: 'Footprints, craters and start zones hold no mines. If only three unknown cells remain, all three are theirs.' },
            { title: 'Overlap two numbers', body: 'Compare neighbouring numbers: the difference lives in the cells they do not share. Minesweeper’s 1-2 patterns work as usual.' },
            { title: 'Their footprints count too', body: 'Every cell the opponent walked is safe. A cell they walk around on purpose is likely their mine.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced: burying to win',
        blocks: [
          { type: 'cards', columns: 1, items: [
            { title: 'On their route', body: 'The shortest walks to treasure are fixed. Mine the diagonals from the opponent’s start to the centre and the corners, and they must detour or gamble.' },
            { title: 'Half-close the treasure', body: 'Ring a treasure with mines but leave a gap or two. Only you know the gap, and the high numbers around keep them away. Close it fully and you are locked out too.' },
            { title: 'Ahead: end it. Behind: stretch it', body: 'The third treasure ends the game, so the leader grabs treasure while the trailing player leaves the last one and works the scoring fields. Count the 70-move limit in.' },
            { title: 'What the simulation says', body: 'In 400 AI games, much of why Hard beats Normal is burying: keep its own lane clear, mine the opponent’s. Giving Normal the same burial closes most of the gap.' },
          ] },
        ],
      },
      {
        id: 'ai',
        title: 'The two AI levels',
        blocks: [
          { type: 'p', text: 'Both play **fair**: only their own mines, what the board shows and the announced numbers. They never know yours.' },
          { type: 'table', head: ['', 'Normal', 'Hard'], rows: [
            ['Memory', 'Forgets like a person: one of its mines in twenty at first, one in four by move 40; older numbers fade faster', 'Remembers everything it saw'],
            ['Deduction', 'Rough arithmetic on the numbers it still remembers', 'Treats every number as a constraint, samples thousands of consistent placements of your mines and gets each cell’s odds'],
            ['Look-ahead', 'Two moves, with some slips', 'Two moves, plus the treasure race and last-treasure judgement'],
            ['Burying', 'Loosely near treasure and your route', 'Keeps its lane clear; mines your routes and rings treasure (leaving a gap)'],
            ['Steps on its own mine', 'About 0.2 times a game', 'Almost never'],
          ] },
          { type: 'p', text: 'In 400 AI-vs-AI games (scripts/mine-oblivion/sim.ts) Hard beat Normal **73.8%** of the time; games averaged 56 moves and 78% ended with the third treasure (the rest at 70 moves).' },
        ],
      },
      {
        id: 'items',
        title: 'Items (AI matches)',
        blocks: [
          { type: 'p', text: 'In AI matches (Normal and Hard), signed-in members can spend the **pieces** and **black pieces** they earned in other games on items. Friend and open rooms have no items: paid help between players would not be fair.' },
          { type: 'table', head: ['Item', 'Price', 'Per game', 'What it does'], rows: [
            ['Detector', '1 piece', '2', 'Without moving, pick a cell next to you and see, for a moment, how many mines are around it. It does not say whether that cell itself is a mine.'],
            ['Recall', '1 piece', '2', 'Your own mines (the ones still live) show again for 2 seconds.'],
            ['Blast suit', '1 black piece', '1', 'While on, the next mine you step on goes off without the −5 and without sending you back. Spent even if you never step on a mine.'],
          ] },
          { type: 'callout', tone: 'tip', title: 'When to use them', text: 'Use the Detector on the cell you plan to step on next: you learn the number around it in advance, and a big number hints that the cell itself may be mined. Recall is worth most just before you walk into the middle, the Blast suit when the last stretch to a treasure looks risky. In AI simulations the Blast suit made the biggest difference.' },
          { type: 'callout', tone: 'note', title: 'What an item game counts for', text: 'Detector and Recall do not use your move. A game with items is marked on the result screen and in your records, and does not count for the Hard certificate, piece earnings or Hall of Fame wins. The win or loss is still recorded. Spending a black piece also lowers your black-piece count for the week.' },
        ],
      },
      {
        id: 'differences',
        title: 'How this differs from the show',
        blocks: [
          { type: 'table', head: ['', 'Broadcast (season 1)', 'PUZZLTHINK'], rows: [
            ['Numbers', 'Announced aloud', 'Three seconds on the cell + the panel until the next move'],
            ['What the board keeps', 'Not recorded', 'Footprints (scored cells) and craters'],
            ['Back after a mine', 'One of three cells by the start', 'Same; you pick'],
            ['Stepping on a shared cell', 'Not recorded', '−5 once, both removed'],
            ['A treasure cell’s number', 'Not recorded', 'Scored by the first visitor'],
            ['End', 'Three treasures', 'Three treasures or 70 moves (season 2). Equal scores draw'],
            ['Time', '10 minutes to bury', 'Friend rooms: 120 s to bury, 30 s a move. AI: no clock'],
            ['Time bombs', 'Season 2 only', 'None'],
            ['Practice game (9×9)', 'Yes', 'No (a short tutorial on your first game)'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Number', def: 'Live mines in the eight cells around the cell stepped on, both players’.' },
            { term: 'Shared cell', def: 'A cell both players mined; it counts 2.' },
            { term: 'Footprint', def: 'A cell someone already scored: 0 points again, and proof it holds no mine.' },
            { term: 'Crater', def: 'Where a mine went off; empty now.' },
            { term: 'Oblivion', def: 'The rule that wipes even your own mines from the board when the walk starts.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Do my own mines explode in Mine of Oblivion?', a: 'Yes. Any mine costs 5 points and sends you back by your start, which is why remembering your own is the heart of the game.' },
      { q: 'What does the number count?', a: 'The mines left in the eight cells around the cell stepped on — yours and theirs, a shared cell counting 2. A cell already scored announces nothing.' },
      { q: 'I missed a number. Can I see it again?', a: 'It stays in the panel under the board until the next move. After that it is gone, but the score change on the scoreboard gives it back.' },
      { q: 'When does the game end?', a: 'When all three treasures are found, or after 70 moves in all. Higher score wins; equal is a draw.' },
      { q: 'Does the AI see my mines?', a: 'No. It uses its own mines, what the board shows and the announced numbers. Normal even forgets some of that; Hard remembers all of it and computes the odds.' },
      { q: 'Can my friend see my mines in a room?', a: 'No. Your burial is sent encrypted to the host’s browser only, and the host’s browser works out every number and explosion for both of you. Mines are revealed when the game ends.' },
    ],
    cta: { title: 'Do you remember where you buried them?', body: 'A game against the AI takes 4–7 minutes. Your first game opens with a short tutorial.', button: 'Play Mine of Oblivion' },
    disclaimer: 'PUZZLTHINK is an unofficial fan project, not affiliated with Death Game or Netflix. The programme name is used only to describe the game. It has nothing to do with real-money gambling.',
  },
};

export default guide;
