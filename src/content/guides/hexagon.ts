// Hexagon guide. Rules and numbers follow src/lib/hexagon.ts (19 tiles in rows 3-4-5-4-3 lettered A–S, LINES: the
// 27 straight lines of three — 9 across and 9 along each diagonal, MEMORIZE_MS 30 s, IDLE_MS 90 s, ROUNDS 10,
// CHALLENGE_MS 10 min, the ten BROADCAST boards, generateRound: numbers 1–9 and a target that 2–5 lines reach) and
// src/lib/hexagonRoom.ts (2–4 players, 5 or 10 rounds, 20/30/45 s to memorise, BUZZ_MS 10 s, +1/−1 with a repeat,
// a non-line or no answer in time counted wrong, the idle clock restarting after each declaration, up to
// MAX_OVERTIME 3 rounds on a tie for first). HexagonGame.tsx: solo score = found − wrong, a repeat counts wrong,
// the challenge lets you flip early. Inline guide: HexagonGuide in ko/en.json.
// Lines per tile (J 9; E F I K N O 6; the rest 3) and the broadcast answer counts were computed from LINES and
// broadcastRounds(); the walkthrough is broadcast board 1.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'hexagon',
  origin: { kind: 'show', show: 'dp1' },
  updated: '2026-11-26',
  related: ['piggyBank', 'nemoCount', 'equationSignal', 'heavy13'],
  inlineNamespace: 'HexagonGuide',
  ko: {
    meta: {
      title: '헥사곤 공략 — 19칸 외우는 법, 27개 줄, 방송 판 풀이 | PUZZLTHINK',
      description: '데블스 플랜 결승 헥사곤 공략. A~S 19칸과 27개 줄의 구조, 가운데 J가 9개 줄에 들어가는 이유, 30초 안에 외우는 덩어리 기억법, 가로줄 합 미리 계산하기, 방송 1라운드 판 풀이, 오답 −1의 기댓값과 친구전 버저 요령까지 정리했어요.',
      keywords: ['헥사곤 공략', '헥사곤 게임', '데블스 플랜 헥사곤', '데블스플랜 결승 헥사곤', '헥사곤 규칙', '헥사곤 기억법', '데블스 플랜 결승전 게임'],
    },
    title: '헥사곤 공략',
    lead: '30초 동안 숫자 19개를 외우고, 뒤집힌 판에서 합이 맞는 세 칸을 찾아요.',
    intro: [
      '헥사곤은 정육각형 19칸에 적힌 숫자를 30초 동안 외운 뒤, 판이 알파벳 면으로 뒤집히면 **숫자 합이 타깃 넘버가 되는 일렬 세 칸**을 찾아 알파벳으로 선언하는 기억·계산 게임이에요. 정답은 +1, 오답은 −1이라 많이 찾는 것만큼 틀리지 않는 것이 중요해요.',
      '이 공략에서는 판의 구조(27개 줄과 칸마다 들어가는 줄 수)부터, 30초 안에 외우는 요령, 타깃이 나오기 전에 해 둘 계산, 방송 1라운드 판을 실제로 풀어 보는 과정, 단계별 전략과 친구전 메모를 정리했어요.',
    ],
    gamePageTitle: '헥사곤 — 데블스 플랜 결승, 19칸을 외우는 법',
    summary: '27개 줄의 구조, 가운데 J의 무게, 덩어리 기억법, 방송 판 풀이, 오답 −1 계산.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '헥사곤은 어떤 게임인가요',
        blocks: [
          { type: 'p', text: '헥사곤은 넷플릭스 「데블스 플랜」 시즌 1 결승전의 두 번째 게임이에요. PUZZLTHINK에서는 무작위 판으로 10라운드를 하거나, 방송에 나온 10개 판과 타깃을 그대로 풀어 볼 수 있어요. 10분 동안 새 판을 계속 푸는 챌린지와, 친구 2~4명이 버저로 겨루는 방도 있어요.' },
          { type: 'p', text: '숫자 계산 자체는 한 자리 덧셈 세 번이라 어렵지 않아요. 어려운 건 숫자가 사라진 판에서 계산해야 한다는 점이에요. 그래서 헥사곤은 계산 게임이라기보다 **무엇을 어떤 모양으로 기억하느냐**의 게임이에요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**판**: 정육각형 19칸이 위에서부터 3·4·5·4·3칸씩 놓여 있어요. 앞면은 숫자, 뒷면은 A부터 S까지 알파벳이에요.',
            '**외우기**: 라운드가 시작되면 30초 동안 숫자가 보여요(친구전은 방장이 20·30·45초 중에서 골라요).',
            '**찾기**: 시간이 지나면 판이 알파벳으로 뒤집히고 타깃 넘버가 나와요. 가로, 또는 두 대각선 방향으로 곧게 이어진 세 칸의 숫자 합이 타깃과 같으면 정답이에요.',
            '**점수**: 정답 +1, 오답 −1. 이미 나온 답을 다시 말해도 오답이에요.',
            '**표시 없음**: 선언된 답은 판에 표시되지 않고, 라운드마다 정답이 몇 개인지도 알려 주지 않아요.',
            '**라운드 끝**: 모든 정답이 나오거나 90초 동안 아무도 선언하지 않으면 끝나고 정답이 공개돼요. 선언이 나올 때마다 90초는 다시 시작돼요.',
          ] },
          { type: 'table', caption: '판의 알파벳 배치 (위에서부터)', head: ['줄', '칸'], rows: [
            ['1줄 (3칸)', 'A · B · C'],
            ['2줄 (4칸)', 'D · E · F · G'],
            ['3줄 (5칸)', 'H · I · J · K · L'],
            ['4줄 (4칸)', 'M · N · O · P'],
            ['5줄 (3칸)', 'Q · R · S'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 점 — 이럴 땐 어떻게 되나요',
        blocks: [
          { type: 'cards', items: [
            { title: '줄은 모두 몇 개인가요?', body: '27개예요. 가로 9개(ABC, DEF, EFG, HIJ, IJK, JKL, MNO, NOP, QRS), 오른쪽 아래 대각선 9개(AEJ, BFK, CGL, DIN, EJO, FKP, HMQ, INR, JOS), 왼쪽 아래 대각선 9개(ADH, BEI, CFJ, EIM, FJN, GKO, JNQ, KOR, LPS).' },
            { title: '꺾인 세 칸도 되나요?', body: '안 돼요. 세 칸은 한 방향으로 곧게 이어져야 해요. 붙어 있어도 가운데에서 꺾이면 줄이 아니에요. 친구전에서 줄이 아닌 세 칸을 선언하면 오답이에요.' },
            { title: '누르는 순서가 상관있나요?', body: '없어요. Q·R·S든 S·R·Q든 같은 답이에요.' },
            { title: '정답은 몇 개쯤 있나요?', body: '무작위 판은 정답이 2~5개가 되도록 타깃을 골라요. 방송 10개 판은 1~6개였고, 10판을 합치면 35개예요.' },
            { title: '앞에서 나온 답을 또 말하면?', body: '오답 −1이에요. 판에 표시가 남지 않으니, 숫자뿐 아니라 이미 선언된 답도 기억해야 해요.' },
            { title: '방송 판에는 10도 있나요?', body: '네. 무작위 판은 1~9만 쓰지만, 방송 8라운드 판에는 10이 네 칸 있고 타깃도 18이에요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 외우는 모양 정하기',
        blocks: [
          { type: 'p', text: '숫자 19개를 하나씩 외우면 30초가 모자라요. 대신 **가로줄을 하나의 덩어리**로 외우세요. 3·4·5·4·3칸 줄을 "163 / 2456 / 25213 / 4535 / 113"처럼 전화번호 외우듯 읽으면 다섯 덩어리만 기억하면 돼요.' },
          { type: 'table', caption: '칸마다 들어가는 줄 수 — 가운데일수록 많아요', head: ['칸', '들어가는 줄', '메모'], rows: [
            ['J (한가운데)', '9개', '세 방향 모두 가운데·양끝으로 3개씩'],
            ['E · F · I · K · N · O', '6개', 'J를 둘러싼 여섯 칸'],
            ['나머지 12칸 (가장자리)', '3개', '방향마다 한 줄씩'],
          ] },
          { type: 'list', items: [
            '**J부터 확실히**: 27개 줄 중 9개에 J가 들어가요. J의 숫자 하나를 틀리면 답 후보 3분의 1이 흔들려요.',
            '**그다음 J를 둘러싼 여섯 칸**: 이 여섯 칸과 J만 정확해도 27개 줄 중 상당수를 계산할 수 있어요.',
            '**확실한 것만 선언**: 정답 +1, 오답 −1이라, 맞을 확률이 50%를 넘지 않으면 선언하지 않는 게 나아요.',
            '**방송 판으로 연습**: 혼자 하기에서 방송 판 10개를 고르면 결승전과 같은 판과 타깃으로 연습할 수 있어요.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라가기 — 방송 1라운드 판, 타깃 5',
        lead: '혼자 하기에서 "방송 판 10개"를 고르면 나오는 첫 판이에요. 숫자는 위에서부터 1 6 3 / 2 4 5 6 / 2 5 2 1 3 / 4 5 3 5 / 1 1 3.',
        blocks: [
          { type: 'steps', items: [
            { title: '외우는 30초: 덩어리 다섯 개', body: '"163 / 2456 / 25213 / 4535 / 113". 그리고 가운데 J는 2, 둘레 여섯 칸 E·F·I·K·N·O는 4·5·5·1·5·3이라고 따로 한 번 더 확인해요.' },
            { title: '외우는 동안 가로줄 합 계산', body: '가로줄 9개의 합: ABC 10, DEF 11, EFG 15, HIJ 9, IJK 8, JKL 6, MNO 12, NOP 13, QRS 5. 덩어리를 외우면서 합까지 같이 적어 두면 타깃이 나오자마자 가로 답을 바로 말할 수 있어요.' },
            { title: '타깃 5: 가로 답', body: '가로줄 합 중 5는 QRS(1+1+3) 하나예요. 바로 선언해서 +1.' },
            { title: '대각선 찾기: 작은 숫자 따라가기', body: '타깃 5는 작은 숫자 세 개의 합이에요. 1과 2가 모인 곳을 찾으면, 왼쪽 위 A(1)–D(2)–H(2)로 내려가는 대각선이 5예요. 그리고 K(1)–O(3)–R(1)도 5예요. 두 줄을 선언해서 +2.' },
            { title: '정답 공개', body: '이 판의 정답은 QRS, ADH, KOR 세 개뿐이에요. 세 개를 다 찾았으니 라운드가 바로 끝나요. 이 판의 점수는 +3.' },
          ] },
          { type: 'callout', tone: 'tip', title: '이 판에서 배울 점', text: '타깃이 작으면 작은 숫자들이 모인 곳만 보면 돼요. 반대로 타깃이 크면 큰 숫자 주변만 보면 되고요. 가로줄 합은 외우는 동안 미리 계산해 두고, 대각선은 타깃이 나온 뒤 "작은 숫자(또는 큰 숫자)가 모인 곳"부터 찾는 순서가 효율적이에요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 타깃이 나오기 전에 할 일',
        blocks: [
          { type: 'cards', items: [
            { tag: '합', title: '가로줄 9개의 합 미리 외우기', body: '27개를 다 계산할 시간은 없지만, 덩어리로 외우는 가로줄은 합도 같이 계산하기 쉬워요. 타깃이 공개되자마자 가로 답부터 내면 시간을 벌어요.' },
            { tag: '범위', title: '타깃 크기로 찾을 곳 줄이기', body: '무작위 판은 1~9라 줄 합은 3~27이에요. 타깃이 6 이하라면 1·2·3이 모인 곳만, 20 이상이라면 7·8·9가 모인 곳만 보면 돼요. 중간 타깃(12~15)이 가장 많은 줄이 후보가 되어 어려워요.' },
            { tag: '대각선', title: '대각선은 J를 기준으로', body: '대각선 18개 중 J를 지나는 것만 6개(AEJ, EJO, JOS, CFJ, FJN, JNQ)예요. J 숫자를 확실히 외웠다면, 타깃에서 J를 뺀 값이 되는 양옆 짝을 찾는 식으로 빠르게 훑을 수 있어요.' },
            { tag: '기록', title: '이미 낸 답 외우기', body: '판에 표시가 없으니 내가 낸 답도 잊기 쉬워요. 답을 낼 때마다 알파벳 세 글자를 한 번 소리 내어 되뇌어 두세요.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 오답 관리와 버저 싸움',
        blocks: [
          { type: 'h3', text: '오답 −1의 기댓값' },
          { type: 'p', text: '맞을 확률이 p인 선언의 기댓값은 p × (+1) + (1 − p) × (−1) = 2p − 1이에요. 60%면 +0.2, 50%면 0이에요. 혼자 할 때는 정답이 공개되기 전에 마지막으로 고민 중인 줄을 낼지 말지 이 계산으로 정하세요. 확신이 없는 한 줄은 내지 않는 게 기대 점수를 높여요.' },
          { type: 'h3', text: '친구전: 버저를 누르는 순간' },
          { type: 'p', text: '친구전에서는 버저를 먼저 누른 사람만 선언할 수 있고, 누른 뒤 10초 안에 세 칸을 골라야 해요. 시간 안에 못 고르거나 줄이 아닌 세 칸을 고르면 오답이에요. 그래서 버저는 "찾은 다음"에 눌러요. 확실한 줄 하나를 찾았다면 바로 누르세요. 남이 먼저 그 줄을 가져가면 내 기억은 쓸모가 없어지고, 같은 답을 또 말하면 오답이에요.' },
          { type: 'h3', text: '남이 낸 답도 정보예요' },
          { type: 'p', text: '친구전에서는 다른 사람이 선언한 답이 잠깐 공개돼요. 그 줄의 세 칸 합이 타깃이라는 확실한 정보라, 내 기억과 다르면 내가 외운 숫자 중 하나가 틀렸다는 뜻이에요. 그 칸이 들어간 다른 줄은 다시 계산하세요.' },
          { type: 'h3', text: '동점과 연장' },
          { type: 'p', text: '마지막 라운드가 끝났을 때 1위가 동점이면 연장 라운드를 최대 세 번까지 해요. 그래도 같으면 1위를 함께 나눠요. 연장에서는 오답 하나가 곧 패배이니 더 보수적으로 두세요.' },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**칸을 하나씩 외우기**: 19개를 따로 외우면 30초가 모자라요. 가로줄 덩어리로 외우세요.',
            '**J를 흐릿하게 외우기**: J는 9개 줄에 들어가요. J 하나가 틀리면 그만큼 계산이 다 틀려요.',
            '**꺾인 세 칸 선언하기**: 붙어 있어도 곧은 줄이 아니면 정답이 아니에요.',
            '**같은 답 두 번 말하기**: 표시가 남지 않아 자주 생겨요. 낸 답을 꼭 기억하세요.',
            '**반반인데 선언하기**: 50% 선언의 기댓값은 0이에요. 그보다 낮으면 손해예요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — 혼자 하기, 챌린지, 친구전',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['혼자 하기', '10라운드. 무작위 판이나 방송 판 10개 중에서 골라요. 외우는 시간 30초, 선언 없이 90초가 지나면 라운드가 끝나요. 점수는 정답 수 − 오답 수예요.'],
            ['10분 챌린지', '10분 동안 무작위 판이 계속 나와요. 다 외웠으면 바로 뒤집어서 시간을 아낄 수 있어요. 끝나면 점수(정답 − 오답)가 기록되고, 이 브라우저의 최고 기록과 비교돼요.'],
            ['친구전', '링크나 4자리 코드로 2~4명이 모여요. 방장이 5·10라운드와 외우는 시간(20·30·45초)을 골라요. 버저를 누르면 10초 안에 세 칸을 골라야 해요. 1위 동점이면 연장을 최대 세 라운드 해요.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '타깃 넘버', def: '판이 뒤집힌 뒤 공개되는 목표 합.' },
            { term: '줄', def: '가로 또는 두 대각선 방향으로 곧게 이어진 세 칸. 판 전체에 27개.' },
            { term: '덩어리 기억', def: '가로줄 숫자를 전화번호처럼 묶어 외우는 방법.' },
            { term: '버저', def: '친구전에서 선언권을 얻는 버튼. 누른 뒤 10초 안에 세 칸을 골라요.' },
            { term: '중복 선언', def: '이미 나온 답을 다시 말하는 것. 오답으로 −1이에요.' },
            { term: '연장', def: '친구전 마지막에 1위가 동점일 때 하는 추가 라운드(최대 3).' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '헥사곤은 어디서 할 수 있나요?', a: 'PUZZLTHINK 헥사곤 페이지에서 가입이나 설치 없이 PC와 모바일 브라우저로 바로 할 수 있어요.' },
      { q: '방송에 나온 판도 있나요?', a: '네. 혼자 하기에서 "방송 판 10개"를 고르면 결승전 1~10라운드 판과 타깃이 그대로 나와요.' },
      { q: '어떤 칸 조합이 줄로 인정되나요?', a: '가로 한 줄이나 두 대각선 방향 중 하나로 곧게 이어진 세 칸만 인정돼요. 판 전체에서 27개 조합이 있어요.' },
      { q: '가장 중요한 칸은 어디인가요?', a: '한가운데 J예요. 27개 줄 중 9개에 들어가요. 그 둘레 여섯 칸은 6개씩, 가장자리 칸은 3개씩이에요.' },
      { q: '오답이 나면 어떻게 되나요?', a: '1점을 잃어요. 이미 나온 답을 다시 말해도 오답이에요. 친구전에서는 버저 후 10초 안에 고르지 못하거나 줄이 아닌 세 칸을 고르면 오답이에요.' },
      { q: '친구와 어떻게 하나요?', a: '친구 방을 만들고 링크나 4자리 초대코드를 보내면 2~4명이 함께 버저 대결을 할 수 있어요.' },
    ],
    cta: { title: '30초, 준비됐나요?', body: '가로줄 덩어리와 가운데 J부터 외우면서 방송 1라운드 판을 풀어 보세요.', button: '헥사곤 하러 가기' },
    disclaimer: '헥사곤은 방송에 소개된 게임 방식을 바탕으로 PUZZLTHINK가 웹용으로 다시 만든 것으로, 방송사·제작사와 관련이 없어요.',
  },
  en: {
    meta: {
      title: 'Hexagon strategy guide — memorising 19 tiles, the 27 lines, a broadcast board solved | PUZZLTHINK',
      description: "Hexagon from The Devil's Plan final, in depth: the A–S board and its 27 lines, why the centre tile J sits on 9 of them, chunking 19 numbers in 30 seconds, pre-computing the row sums, broadcast board 1 solved, the cost of a wrong call and buzzer tactics with friends.",
      keywords: ['Hexagon game strategy', "Devil's Plan Hexagon", "Devil's Plan final game", 'Hexagon memory game', 'Hexagon rules'],
    },
    title: 'Hexagon strategy guide',
    lead: 'Memorise 19 numbers in 30 seconds, then find the lines of three that hit the target.',
    intro: [
      'Hexagon is a memory-and-arithmetic game: memorise the numbers on 19 hexagonal tiles for 30 seconds, then, once the board flips to its letters, find **straight lines of three tiles whose numbers add up to the target** and declare them by letter. Right is +1 and wrong −1, so avoiding mistakes matters as much as finding answers.',
      'This guide covers the structure of the board (its 27 lines and how many each tile belongs to), how to memorise in 30 seconds, what to calculate before the target appears, broadcast board 1 solved step by step, strategy by level and notes on friend matches.',
    ],
    gamePageTitle: "Hexagon — The Devil's Plan final, and how to hold 19 numbers",
    summary: 'The 27 lines, the weight of centre tile J, chunked memory, a broadcast board solved, the cost of −1.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What is Hexagon?',
        blocks: [
          { type: 'p', text: "Hexagon was the second game of the final of Netflix's The Devil's Plan, season 1. On PUZZLTHINK you can play ten rounds on random boards, or replay the ten boards and targets from the broadcast. There is also a 10-minute challenge of continuous boards and a buzzer room for 2–4 friends." },
          { type: 'p', text: 'The arithmetic is only three one-digit additions. The hard part is doing it on a board whose numbers have disappeared, which makes Hexagon less a maths game than a game of **what you remember and in what shape**.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Board**: 19 hexagons in rows of 3, 4, 5, 4 and 3 from the top. The front shows a number, the back a letter from A to S.',
            '**Memorise**: each round starts with the numbers on view for 30 seconds (in friend rooms the host picks 20, 30 or 45).',
            '**Find**: then the board flips to its letters and the target appears. Three tiles in a straight line — across or along either diagonal — whose numbers add up to the target are an answer.',
            '**Scoring**: +1 for an answer, −1 for a miss. Repeating an answer already given is a miss.',
            '**No marks**: declared answers are not marked on the board, and the number of answers per round is never shown.',
            '**Round end**: when every answer is out, or after 90 seconds with no declaration; then the answers are shown. Each declaration restarts the 90 seconds.',
          ] },
          { type: 'table', caption: 'Letter layout (from the top)', head: ['Row', 'Tiles'], rows: [
            ['Row 1 (3)', 'A · B · C'],
            ['Row 2 (4)', 'D · E · F · G'],
            ['Row 3 (5)', 'H · I · J · K · L'],
            ['Row 4 (4)', 'M · N · O · P'],
            ['Row 5 (3)', 'Q · R · S'],
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky points',
        blocks: [
          { type: 'cards', items: [
            { title: 'How many lines are there?', body: '27: nine across (ABC, DEF, EFG, HIJ, IJK, JKL, MNO, NOP, QRS), nine down-right (AEJ, BFK, CGL, DIN, EJO, FKP, HMQ, INR, JOS) and nine down-left (ADH, BEI, CFJ, EIM, FJN, GKO, JNQ, KOR, LPS).' },
            { title: 'Do bent triples count?', body: 'No. The three tiles must run straight in one direction; touching tiles that bend at the middle are not a line. In friend matches, declaring a non-line is a miss.' },
            { title: 'Does the order matter?', body: 'No. Q·R·S and S·R·Q are the same answer.' },
            { title: 'How many answers are there?', body: 'Random boards pick a target that 2–5 lines reach. The ten broadcast boards had 1 to 6 each, 35 in total.' },
            { title: 'Repeating an earlier answer?', body: 'A miss, −1. Nothing stays marked, so remember the declared answers as well as the numbers.' },
            { title: 'Are there 10s?', body: 'Random boards use 1–9 only, but broadcast board 8 has four 10s and a target of 18.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — choose the shape of your memory',
        blocks: [
          { type: 'p', text: 'Nineteen separate numbers will not fit into 30 seconds. Memorise **each row as one chunk** instead: read the 3-4-5-4-3 rows like phone numbers — "163 / 2456 / 25213 / 4535 / 113" — and you only hold five chunks.' },
          { type: 'table', caption: 'Lines through each tile — the centre carries the most', head: ['Tile', 'Lines', 'Note'], rows: [
            ['J (centre)', '9', 'three in each direction: as middle and as either end'],
            ['E · F · I · K · N · O', '6', 'the ring around J'],
            ['The other 12 (edge)', '3', 'one per direction'],
          ] },
          { type: 'list', items: [
            '**Lock in J first**: it sits on 9 of the 27 lines. Get J wrong and a third of the candidate lines go with it.',
            '**Then the ring around J**: with J and those six tiles exact, you can already work out a large share of the lines.',
            '**Declare only what you are sure of**: +1 or −1 means a call that is not over 50% likely costs you on average.',
            '**Practise on broadcast boards**: choose the ten broadcast boards in solo play to train on the final\'s own boards and targets.',
          ] },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Walkthrough — broadcast board 1, target 5',
        lead: 'The first board when you choose the ten broadcast boards. From the top: 1 6 3 / 2 4 5 6 / 2 5 2 1 3 / 4 5 3 5 / 1 1 3.',
        blocks: [
          { type: 'steps', items: [
            { title: 'The 30 seconds: five chunks', body: '"163 / 2456 / 25213 / 4535 / 113". Then check separately that J is 2 and the ring E, F, I, K, N, O is 4, 5, 5, 1, 5, 3.' },
            { title: 'Row sums while memorising', body: 'The nine across-lines: ABC 10, DEF 11, EFG 15, HIJ 9, IJK 8, JKL 6, MNO 12, NOP 13, QRS 5. Computing the sums as you chunk lets you call the across answers the moment the target appears.' },
            { title: 'Target 5: the across answer', body: 'Only QRS (1 + 1 + 3) sums to 5 across. Declare it: +1.' },
            { title: 'Diagonals: follow the small numbers', body: 'A target of 5 means three small numbers. Look where 1s and 2s cluster: the diagonal down from the top-left, A(1)–D(2)–H(2), is 5, and so is K(1)–O(3)–R(1). Two more calls: +2.' },
            { title: 'The reveal', body: 'This board\'s answers are exactly QRS, ADH and KOR. With all three found the round ends at once, scoring +3.' },
          ] },
          { type: 'callout', tone: 'tip', title: 'What this board shows', text: 'A small target means looking only where small numbers cluster; a big one, only around big numbers. Pre-compute the row sums while memorising, then after the target appears search the diagonals starting from where the small (or big) numbers sit.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — work before the target appears',
        blocks: [
          { type: 'cards', items: [
            { tag: 'Sums', title: 'Memorise the nine row sums', body: 'There is no time for all 27, but rows you chunk are easy to sum as you go. Calling the across answers as soon as the target shows buys time for the rest.' },
            { tag: 'Range', title: 'Let the target narrow the search', body: 'Random boards use 1–9, so lines sum to 3–27. With a target of 6 or less, look only where 1s, 2s and 3s cluster; at 20 or more, only around 7s, 8s and 9s. Middle targets (12–15) have the most candidate lines and are the hardest.' },
            { tag: 'Diagonals', title: 'Anchor diagonals on J', body: 'Six of the eighteen diagonals pass through J (AEJ, EJO, JOS, CFJ, FJN, JNQ). With J certain, subtract it from the target and look for the pair that makes up the rest.' },
            { tag: 'Record', title: 'Remember your own answers', body: 'Nothing is marked, so even your own calls slip. Repeat the three letters to yourself each time you declare.' },
          ] },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — managing misses and the buzzer fight',
        blocks: [
          { type: 'h3', text: 'The value of a call' },
          { type: 'p', text: 'A call that is right with probability p is worth p × (+1) + (1 − p) × (−1) = 2p − 1: +0.2 at 60%, nothing at 50%. Playing solo, use this to decide whether the last line you are unsure of is worth declaring before the reveal. Leaving out uncertain lines raises your expected score.' },
          { type: 'h3', text: 'Friend matches: when to buzz' },
          { type: 'p', text: 'Only the first to buzz may declare, and they then have 10 seconds to pick three tiles; running out of time or picking a non-line is a miss. So buzz after you have found the line, but once you have one, buzz at once — if someone else takes it first, your find is worthless and repeating it is a miss.' },
          { type: 'h3', text: 'Other people\'s answers are information' },
          { type: 'p', text: 'In friend matches each declaration is shown briefly. It proves those three tiles sum to the target; if that disagrees with your memory, one of your numbers is wrong. Recalculate the other lines through that tile.' },
          { type: 'h3', text: 'Ties and overtime' },
          { type: 'p', text: 'If first place is tied after the last round, up to three overtime rounds are played; still tied, first place is shared. In overtime a single miss can decide it, so play more conservatively.' },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Memorising tile by tile**: nineteen separate numbers do not fit into 30 seconds. Chunk by row.',
            '**A hazy J**: J is on nine lines; one wrong J spoils all of them.',
            '**Declaring bent triples**: touching is not enough — the line must be straight.',
            '**Repeating an answer**: with no marks, it happens a lot. Remember what has been declared.',
            '**Calling at even odds**: a 50% call is worth nothing, and less than that costs you.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — solo, challenge, friend matches',
        blocks: [
          { type: 'table', head: ['Mode', 'What to know'], rows: [
            ['Solo', 'Ten rounds on random boards or the ten broadcast boards. 30 seconds to memorise; a round ends after 90 seconds without a declaration. Score = answers found − misses.'],
            ['10-minute challenge', 'New random boards for ten minutes; flip early once you have memorised to save time. Your score (answers − misses) is recorded and compared with your best in this browser.'],
            ['Friend matches', '2–4 players by link or 4-digit code. The host picks 5 or 10 rounds and 20, 30 or 45 seconds to memorise. After buzzing you have 10 seconds to pick three tiles. A tie for first plays up to three overtime rounds.'],
          ] },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Target', def: 'The sum revealed once the board flips.' },
            { term: 'Line', def: 'Three tiles in a straight line across or along either diagonal; 27 on the board.' },
            { term: 'Chunking', def: 'Memorising each row\'s numbers as one unit, like a phone number.' },
            { term: 'Buzzer', def: 'In friend matches, the button that wins the right to declare; 10 seconds to pick afterwards.' },
            { term: 'Repeat', def: 'Declaring an answer already given; a miss, −1.' },
            { term: 'Overtime', def: 'Extra rounds (up to three) when first place is tied at the end of a friend match.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Where can I play Hexagon?', a: 'On the PUZZLTHINK Hexagon page, in any PC or mobile browser, with no sign-up or install.' },
      { q: 'Are the broadcast boards included?', a: 'Yes. Choose "ten broadcast boards" in solo play for the final\'s rounds 1–10 with their original targets.' },
      { q: 'Which triples count as lines?', a: 'Only three tiles in a straight line across or along one of the two diagonals — 27 in all.' },
      { q: 'Which tile matters most?', a: 'The centre, J: it is on 9 of the 27 lines. The six around it are on 6 each and the edge tiles on 3.' },
      { q: 'What happens on a miss?', a: 'You lose a point. Repeating an earlier answer is a miss too, and in friend matches so are a non-line and running out of the 10 seconds after buzzing.' },
      { q: 'How do I play with friends?', a: 'Create a friend room and send the link or 4-digit code; 2–4 players can compete on the buzzer.' },
    ],
    cta: { title: 'Thirty seconds — ready?', body: 'Chunk the rows, lock in J, and solve broadcast board 1.', button: 'Play Hexagon' },
    disclaimer: 'Hexagon is PUZZLTHINK\'s web version of a game format seen on TV and is not affiliated with the broadcaster or producers.',
  },
};

export default guide;
