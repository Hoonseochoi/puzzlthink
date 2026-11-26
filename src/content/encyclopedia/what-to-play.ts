import type { WikiArticle } from './types';
import { p, cards, tip, sec } from './blocks';

const article: WikiArticle = {
  slug: 'what-to-play',
  category: 'pick',
  updated: '2026-11-26',
  games: [
    { game: 'russianJanggi', ko: '둘이서 5분: 3×3 판, 턴당 10초. 가장 빨리 끝나는 진검승부예요.', en: 'Five minutes for two: a 3×3 board and ten seconds a turn.' },
    { game: 'janggi', ko: '둘이서 5분: 3×4칸 말 4개. 작아도 잡은 말을 다시 쓰는 수싸움이 깊어요.', en: 'Five minutes for two: four pieces on 3×4, with drops that run deep.' },
    { game: 'blackWhite', ko: '둘이서 5분: 숫자 타일 9장, 보이는 건 색뿐. 3~5분짜리 심리전이에요.', en: 'Five minutes for two: nine tiles, only colours showing — a 3–5 minute mind game.' },
    { game: 'starbattle', ko: '혼자 머리 쓰기: 규칙 한 줄, 한 판 1~5분. 틈날 때 하나씩 풀기 좋아요.', en: 'Solo: one line of rules, 1–5 minutes a grid.' },
    { game: 'slitherlink', ko: '혼자 머리 쓰기: 길게 몰입하고 싶을 때. 큰 판은 40분까지도 걸려요.', en: 'Solo: for long focus — big grids can take 40 minutes.' },
    { game: 'heavy13', ko: '여럿이 심리전: 4~7명이 동시에 내는 눈치 게임이에요.', en: 'Group mind games: 4–7 players choosing at the same time.' },
    { game: 'hitStay', ko: '여럿이 심리전: 5명이 칩을 걸고 버티는 베팅 서바이벌이에요.', en: 'Group mind games: five players betting chips to survive.' },
    { game: 'piggyBank', ko: '여럿이 심리전: 기억하고, 대답하고, 의심하는 4인 게임이에요.', en: 'Group mind games: remember, answer, doubt — for four.' },
  ],
  related: ['length-and-player-count', 'party-games', 'logic-puzzles', 'abstract-strategy', 'bluffing-deduction'],
  sources: [
    { title: 'PUZZLTHINK 게임 소개 (각 게임의 인원·시간·규칙)', site: 'PUZZLTHINK', url: 'https://www.puzzlthink.com/ko/games' },
    { title: 'PUZZLTHINK 논리 퍼즐', site: 'PUZZLTHINK', url: 'https://www.puzzlthink.com/ko/logic-puzzles' },
  ],
  ko: {
    meta: {
      title: '지금 뭐 하지? 상황별 게임 고르기 — 둘이서 5분, 혼자 머리 쓰기, 여럿이 심리전',
      description: '둘이서 짧게, 혼자 조용히, 여럿이 시끌벅적하게. 지금 상황에 맞는 PUZZLTHINK 게임을 인원과 시간, 원하는 재미에 따라 골라 드려요. 처음 온 사람과 실력을 겨루고 싶은 사람을 위한 추천도 함께 정리했어요.',
      keywords: ['2인 게임 추천', '혼자 하는 두뇌 게임', '여럿이 하는 웹게임', '짧은 게임 추천', '친구랑 할 게임', '두뇌 게임 추천', '심리전 게임 추천'],
    },
    title: '지금 뭐 하지? 상황별 게임 고르기',
    lead: '같은 5분이라도, 둘이서인지 혼자서인지 여럿이서인지에 따라 딱 맞는 게임이 달라요.',
    intro: [
      'PUZZLTHINK에는 서른 개가 넘는 게임이 있어서, 처음 오면 무엇부터 해야 할지 고민될 수 있어요. 이 글은 장르가 아니라 **지금의 상황**에서 출발해요. 몇 명이 있는지, 시간이 얼마나 있는지, 어떤 재미를 원하는지에 따라 골라 보세요.',
      '각 추천에는 왜 그 상황에 맞는지를 한 줄씩 붙였어요. 게임마다 규칙과 공략은 게임 페이지와 공략 페이지에서 자세히 볼 수 있어요.',
    ],
    summary: '둘이서 5분, 혼자 머리 쓰기, 여럿이 심리전. 인원과 시간, 원하는 재미에 맞춰 PUZZLTHINK 게임을 골라 드려요.',
    sections: [
      sec('two-quick', '둘이서 5분', [
        p('친구와 잠깐, 또는 AI와 한 판. 규칙이 짧고 판이 작아서 몇 분 안에 승부가 나는 게임들이에요. 짧지만 한 수 한 수가 무거워서, “한 판 더”가 절로 나와요.'),
        cards(
          { title: '러시아장기', tag: '가장 빠름', body: '3×3 판에서 큰 말이 작은 말을 덮으며 한 줄을 만들어요. 턴당 10초라 생각할 틈 없이 몰아치는 맛이 있어요.' },
          { title: '십이장기', tag: '미니 장기', body: '3×4칸에 말 4개씩. 잡은 말을 내 말로 다시 내려놓을 수 있어서, 작은 판에서도 수가 깊어요.' },
          { title: '흑과 백', tag: '심리전', body: '0~8 타일 9장을 하나씩 내며, 보이는 색만으로 상대 숫자를 읽어요. 한 판 3~5분이에요.' },
          { title: '나인 멘스 모리스', tag: '고전', body: '셋을 세우면 하나를 잡아요. 3판 2선승이라 짧게 여러 판 즐기기 좋아요.' },
        ),
        tip('누가 먼저 할지 고민된다면', '짧은 게임일수록 선후공을 번갈아 두 판씩 하는 게 공평해요. 「선공은 왜 유리할까」에서 이유를 볼 수 있어요.'),
      ]),
      sec('two-deep', '둘이서 진지하게', [
        p('시간이 넉넉하고, 제대로 실력을 겨뤄 보고 싶을 때. 운이 거의 없어서 이기면 온전히 내 실력인 게임들이에요.'),
        cards(
          { title: '벽바둑', tag: '영역', body: '말을 옮기고 벽 하나. 판이 나뉘었을 때 내 공간이 가장 넓으면 이겨요. 1:1과 3인전이 있어요.' },
          { title: '벽바둑 II', tag: '영역', body: '사각 말은 곧게, 원형 말은 꺾어서. 같은 벽 싸움에 움직임의 차이가 더해져요.' },
          { title: '카드 장기', tag: '읽기', body: '행마 카드 5장의 순서를 몰래 정하고 그 순서대로만 움직여요. 상대의 다음 카드를 읽는 장기예요.' },
          { title: '레이저 장기', tag: '설계', body: '거울을 돌리고 옮겨 빛의 길을 설계해, 상대 왕을 먼저 맞혀요.' },
        ),
      ]),
      sec('solo', '혼자 머리 쓰기', [
        p('조용히 집중하고 싶을 때. 상대 없이 나만의 속도로 즐기는 퍼즐들이에요. 모든 논리 퍼즐은 매번 새로 만든 맵이고 정답이 하나뿐이에요.'),
        cards(
          { title: '1~5분: 스타배틀 · 비나이로 · 한붓길 · 컬러 잇기', tag: '짧게', body: '규칙이 한두 줄이고 판이 작아서, 쉬는 시간에 하나씩 풀기 좋아요.' },
          { title: '10분 안팎: 스도쿠 · 마방진 스왑', tag: '숫자', body: '숫자를 기호처럼 쓰는 스도쿠, 합을 맞추는 마방진 스왑. 계산이 좋으면 마방진, 논리가 좋으면 스도쿠부터.' },
          { title: '길게 몰입: 슬리더링크 · 노노그램 · 마슈', tag: '깊게', body: '큰 판은 20~40분도 걸려요. 하나를 끝까지 풀었을 때의 만족감이 가장 큰 퍼즐들이에요.' },
          { title: '가볍게 손이 갈 때: 2048', tag: '힐링', body: '정답을 찾는 대신, 숫자를 합치며 오래 버티는 게임이에요. 머리를 쉬게 하면서도 손은 바쁘게.' },
        ),
        tip('혼자서도 겨루고 싶다면', '논리 퍼즐에는 새 맵을 차지하고 남의 맵 기록을 뺏는 챌린지가 있어요. 혼자 푸는 퍼즐을 다른 사람과의 기록 경쟁으로 바꿀 수 있어요.'),
      ]),
      sec('solo-brain', '혼자서 계산과 기억력 훈련', [
        cards(
          { title: '헥사곤', tag: '기억', body: '30초 동안 19칸의 숫자를 외우고, 합이 타깃이 되는 세 칸을 찾아요.' },
          { title: '네모 세기', tag: '세기', body: '숫자 합이 타깃이 되는 직사각형을 빠짐없이 세요. 체계적으로 세는 습관이 곧 점수예요.' },
          { title: '수식 신호등', tag: '추리', body: '초록·노랑·빨강 신호로 숨은 9칸 수식을 찾아요.' },
          { title: '수식의 탑', tag: '계산', body: '숫자·기호 블록을 옮기고 뒤집어 타깃 넘버가 되는 탑을 쌓아요.' },
        ),
      ]),
      sec('group', '여럿이 심리전', [
        p('셋 이상 모였을 때, 또는 시끌벅적한 분위기가 필요할 때. 대부분 빈자리를 AI가 채워서 인원이 모자라도 시작할 수 있어요.'),
        cards(
          { title: '무거운 13', tag: '4~7명', body: '모두가 카드와 칩을 동시에 몰래 내요. 받침대 합을 13 넘긴 사람이 벌점을 받는 눈치 게임이에요.' },
          { title: 'Hit,Stay', tag: '5명', body: '한 장 더 받을지 멈출지, 칩을 얼마나 걸지. 마지막까지 칩이 남는 사람이 이겨요.' },
          { title: '러시안 룰렛', tag: '6명', body: '크레딧으로 약실을 조사하고 조작해요. 무엇을 공개하고 무엇을 숨길지가 생존을 갈라요.' },
          { title: '돼지 저금통', tag: '4명', body: '저금통 속 동전을 기억해 대답하고, 남의 대답을 의심해요.' },
          { title: '결합', tag: '2~4명', body: '세 속성이 모두 같거나 모두 다른 카드 3장을 남보다 먼저 찾는 속도 게임이에요.' },
          { title: '4인 3목', tag: '4명', body: '셋이 힘을 합쳐 스페셜 게스트를 막으면서, 서로 피스를 다퉈요.' },
        ),
      ]),
      sec('newcomer', '처음 온 사람과 함께라면', [
        p('규칙 설명이 짧고, 처음 하는 사람도 이길 기회가 있는 게임이 좋아요. **흑과 백**, **결합**, **돼지 저금통**은 규칙을 1분 안에 설명할 수 있어요. 반대로 **벽바둑**이나 **십이장기**처럼 운이 없는 게임은 경험 차이가 그대로 드러나서, 처음엔 AI와 몇 판 연습한 뒤 겨루는 게 서로 즐거워요.'),
        tip('고르기 어렵다면', '둘이면 흑과 백, 혼자면 스타배틀, 여럿이면 무거운 13부터 시작해 보세요. 각자의 상황에서 규칙이 가장 짧고 바로 재미가 오는 게임이에요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'What should I play? Games for the moment — five minutes for two, solo brain work, group mind games',
      description: 'Quick games for two, quiet ones alone, loud ones for a crowd: PUZZLTHINK games picked by head count, time and the kind of fun you want — plus picks for playing with newcomers and for serious matches.',
      keywords: ['two player game picks', 'solo brain games', 'online games for groups', 'short games', 'games to play with friends', 'brain game recommendations'],
    },
    title: 'What should I play? Games for the moment',
    lead: 'Even for the same five minutes, the right game depends on whether it is two of you, just you, or a crowd.',
    intro: [
      'PUZZLTHINK has more than thirty games, so it can be hard to know where to start. This article starts not from genre but from **your situation right now**: how many people, how much time, what kind of fun.',
      'Each pick comes with one line on why it fits. Rules and strategy for every game are on its game page and guide.',
    ],
    summary: 'Five minutes for two, solo brain work, group mind games — PUZZLTHINK games matched to head count, time and the fun you want.',
    sections: [
      sec('two-quick', 'Five minutes for two', [
        p('A quick round with a friend or the AI. Short rules and small boards settle these in minutes, yet every move weighs enough that “one more” comes naturally.'),
        cards(
          { title: 'Russian Janggi', tag: 'Fastest', body: 'On 3×3, big pieces cover small ones on the way to a line. Ten seconds a turn — no time to hesitate.' },
          { title: '12 Janggi', tag: 'Mini chess', body: 'Four pieces each on 3×4. Captured pieces come back as yours, so the small board runs deep.' },
          { title: 'Black & White', tag: 'Mind game', body: 'Play nine tiles from 0 to 8 one by one, reading numbers from colours alone. 3–5 minutes.' },
          { title: 'Nine Men’s Morris', tag: 'Classic', body: 'Line up three to take one. Best of three, ideal for several short games.' },
        ),
        tip('Deciding who goes first', 'The shorter the game, the fairer it is to play two and swap colours. See “Why does moving first help?” for why.'),
      ]),
      sec('two-deep', 'Two, seriously', [
        p('When you have time and want a real test of skill. Almost no luck, so a win is entirely yours.'),
        cards(
          { title: 'Wallgo', tag: 'Territory', body: 'Move, then build a wall. Have the most space when the board splits. One-on-one and three-player modes.' },
          { title: 'Wallgo II', tag: 'Territory', body: 'Square pieces go straight, round ones turn — the same wall fight with different movement.' },
          { title: 'Card Janggi', tag: 'Reading', body: 'Secretly order five move cards and move only in that order. Chess about reading the next card.' },
          { title: 'Laser Janggi', tag: 'Design', body: 'Turn and move mirrors to route your beam into the enemy king first.' },
        ),
      ]),
      sec('solo', 'Solo brain work', [
        p('When you want quiet focus at your own pace. Every logic puzzle is a freshly generated grid with exactly one answer.'),
        cards(
          { title: '1–5 minutes: Star Battle · Binairo · One Stroke · Color Link', tag: 'Short', body: 'One or two lines of rules and small grids — one per break.' },
          { title: 'Around 10 minutes: Sudoku · Magic Square Swap', tag: 'Numbers', body: 'Sudoku uses digits as symbols; Magic Square Swap is about sums. Like arithmetic? Start with the magic square. Like logic? Sudoku.' },
          { title: 'Long focus: Slitherlink · Nonogram · Masyu', tag: 'Deep', body: 'Big grids take 20–40 minutes; finishing one is the most satisfying feeling of all.' },
          { title: 'Something casual: 2048', tag: 'Relaxing', body: 'No answer to find — just merge and hold on. Rests the mind while keeping the hands busy.' },
        ),
        tip('Competing even when alone', 'Logic puzzles have challenges to claim new maps and steal others’ map records, turning solo solving into a records race.'),
      ]),
      sec('solo-brain', 'Solo arithmetic and memory training', [
        cards(
          { title: 'Hexagon', tag: 'Memory', body: 'Memorise 19 numbers in 30 seconds, then find three cells that sum to the target.' },
          { title: 'Nemo Count', tag: 'Counting', body: 'Count every rectangle whose numbers sum to the target; a systematic habit is your score.' },
          { title: 'Equation Signal', tag: 'Deduction', body: 'Find a hidden nine-cell equation from green, yellow and red signals.' },
          { title: 'Tower of Equations', tag: 'Calculation', body: 'Move and flip number and operator blocks to build a tower equal to the target.' },
        ),
      ]),
      sec('group', 'Group mind games', [
        p('For three or more, or when you want noise. Most fill empty seats with AI, so you can start even when short of people.'),
        cards(
          { title: 'Heavy 13', tag: '4–7 players', body: 'Everyone secretly plays a card and a chip at once; whoever pushes a stand past 13 takes penalties.' },
          { title: 'Hit,Stay', tag: '5 players', body: 'Draw or stop, and how many chips to bet. Last player with chips wins.' },
          { title: 'Russian Roulette', tag: '6 players', body: 'Spend credits to check and tamper with chambers; what you reveal and hide decides survival.' },
          { title: 'Piggy Bank', tag: '4 players', body: 'Remember the coins in each bank, answer, and doubt others’ answers.' },
          { title: 'Gyul! Hap!', tag: '2–4 players', body: 'A speed game: find three cards whose attributes are all the same or all different before anyone else.' },
          { title: '4 Player 3 In a Row', tag: '4 players', body: 'Three players team up against the special guest while competing for pieces.' },
        ),
      ]),
      sec('newcomer', 'Playing with newcomers', [
        p('Pick games with short explanations where a first-timer can still win. **Black & White**, **Gyul! Hap!** and **Piggy Bank** can be explained in a minute. Luck-free games like **Wallgo** or **12 Janggi** show experience directly, so it is more fun for everyone if a newcomer plays a few games against the AI first.'),
        tip('If you cannot decide', 'Two of you: Black & White. Alone: Star Battle. A group: Heavy 13. Each has the shortest rules and fastest fun for its situation.'),
      ]),
    ],
  },
};

export default article;
