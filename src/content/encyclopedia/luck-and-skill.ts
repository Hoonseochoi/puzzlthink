import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'luck-and-skill',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'wallgo2', ko: '운이 전혀 없는 쪽 끝. 결과는 온전히 두는 사람의 몫이에요.', en: 'The no-luck end of the spectrum: the result is entirely yours.' },
    { game: 'merge2048', ko: '새 블록 위치는 운이지만, 그걸 받아 내는 모양은 실력이에요. 입력 운의 좋은 예예요.', en: 'Where new tiles land is luck; the shape that absorbs them is skill — a good example of input luck.' },
    { game: 'hitStay', ko: '다음 카드는 운이지만, 받을지 멈출지와 얼마를 걸지는 실력이에요.', en: 'The next card is luck; whether to draw and how much to bet is skill.' },
    { game: 'indianPoker', ko: '한 핸드는 운으로 갈릴 수 있지만, 칩이 바닥날 때까지 이어지는 승부에서는 판단력이 드러나요.', en: 'One hand can turn on luck; over a match to the last chip, judgement shows.' },
    { game: 'russianRoulette', ko: '총알 위치는 운이지만, 조사와 조작으로 운의 크기를 줄일 수 있어요.', en: 'Bullet positions are luck, but checking and tampering shrink how much luck matters.' },
  ],
  related: ['perfect-information', 'hidden-information', 'betting-auction', 'length-and-player-count', 'party-games'],
  sources: [
    { title: 'Game of chance', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Game_of_chance' },
    { title: 'Game of skill', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Game_of_skill' },
    { title: 'The 2 types of randomness and how to apply them to your board game', site: 'Game Developer', url: 'https://www.gamedeveloper.com/blogs/the-2-types-of-randomness-and-how-to-apply-them-to-your-board-game' },
    { title: 'Randomness in video games is not all the same', site: 'Kotaku', url: 'https://kotaku.com/randomness-in-video-games-is-not-all-the-same-1841049263' },
    { title: 'Input-output randomness (part 1)', site: 'Skeleton Code Machine', url: 'https://www.skeletoncodemachine.com/p/input-output-randomness-part-1' },
    { title: 'Effect of input-output randomness on gameplay satisfaction in collectable card games', site: 'arXiv', url: 'https://arxiv.org/abs/2107.08437' },
  ],
  ko: {
    meta: {
      title: '운과 실력 — 보드게임에서 운은 나쁜 걸까? 운의 종류와 실력이 드러나는 방식',
      description: '운이 없는 바둑부터 주사위 게임까지, 운과 실력은 하나의 스펙트럼이에요. 입력 운과 출력 운의 차이, 판 수가 늘수록 실력이 드러나는 이유, 운이 게임에 주는 좋은 점, 운이 있는 게임에서 실력을 키우는 법을 정리했어요.',
      keywords: ['운과 실력', '보드게임 운', '운 게임 실력 게임', '입력 운 출력 운', '실력 차이', '운빨 게임', '확률 게임'],
    },
    title: '운과 실력',
    lead: '운은 게임의 적일까요? 잘 쓰인 운은 실력을 가리지 않고, 오히려 게임을 더 많은 사람에게 열어 줘요.',
    intro: [
      '“이건 운빨 게임이야”라는 말은 보통 칭찬이 아니에요. 하지만 운이 전혀 없는 게임만 좋은 게임인 건 아니에요. 운은 처음 하는 사람에게 이길 기회를 주고, 매 판을 다르게 만들고, 예상하지 못한 이야기를 만들어요.',
      '이 글에서는 운과 실력을 둘 중 하나가 아니라 **하나의 스펙트럼**으로 보고, 운에도 종류가 있다는 것, 판 수가 늘면 실력이 드러나는 원리, 그리고 운이 있는 게임에서 실력을 키우는 방법을 정리해요.',
    ],
    summary: '운과 실력은 둘 중 하나가 아니라 하나의 스펙트럼. 입력 운과 출력 운, 판 수가 늘수록 실력이 드러나는 원리, 운이 있는 게임에서 실력을 키우는 법을 정리했어요.',
    sections: [
      sec('spectrum', '하나의 스펙트럼', [
        p('게임을 “운 게임”과 “실력 게임”으로 딱 나누기는 어려워요. 대신 한 줄 위에 늘어놓을 수 있어요.'),
        table(
          ['위치', '어떤 게임', '예'],
          [
            ['운 100%', '선택이 결과에 아무 영향을 주지 않아요.', '주사위만 굴리는 말판 놀이'],
            ['운이 크고 선택도 있음', '운이 크게 흔들지만 선택이 평균을 바꿔요.', '블랙잭류, 가벼운 파티 게임'],
            ['실력이 크고 운도 있음', '한 판은 운으로 질 수 있지만, 여러 판이면 실력이 이겨요.', '포커, 백개먼, 2048'],
            ['운 0%', '결과가 온전히 두는 사람의 선택으로 정해져요.', '바둑, 체스, 벽바둑'],
          ],
        ),
        p('운이 없는 게임이라도 실력 차가 결과를 완전히 정하는 건 아니에요. 같은 사람도 컨디션에 따라 실수를 하니까요. 하지만 그 실수조차 자기 몫이라는 점에서 운과는 달라요.'),
      ]),
      sec('kinds', '운에도 종류가 있어요', [
        p('게임 디자인에서는 운이 **언제** 끼어드는지에 따라 두 가지로 나눠 이야기해요.'),
        h3('입력 운: 결정하기 전에 오는 운'),
        p('먼저 운이 상황을 만들고, 플레이어가 그 상황에서 결정해요. 받은 카드, 새로 생긴 2048 블록, 처음 섞인 배치 같은 것들이에요. 이런 운은 **대처하는 실력**을 요구해요. 나쁜 패를 받아도 그걸 어떻게 쓰느냐로 결과가 달라지니까요.'),
        h3('출력 운: 결정한 뒤에 오는 운'),
        p('플레이어가 먼저 결정하고, 운이 그 결과를 정해요. 공격을 선언한 뒤 주사위로 성공 여부를 정하는 식이에요. 이런 운은 **확률을 따지는 실력**을 요구하지만, 아무리 잘 골라도 결과가 뒤집힐 수 있어서 억울함이 더 커요.'),
        note('왜 이 구분이 중요할까', '같은 양의 운이라도 입력 운은 “내가 대처를 못 했다”로, 출력 운은 “운이 나빴다”로 느껴지기 쉬워요. 그래서 숙련된 플레이어는 입력 운을 더 쉽게 받아들인다는 이야기가 많아요. 다만 어느 쪽이 더 낫다고 단정하기는 어렵고, 실제 게임은 대부분 둘을 섞어 써요. 포커만 해도 받은 패는 입력 운, 마지막 카드는 출력 운이에요.'),
      ]),
      sec('repeat', '판 수가 늘면 실력이 드러난다', [
        p('운이 있는 게임에서 실력은 **평균**에서 드러나요. 동전을 열 번 던지면 앞면이 일곱 번 나올 수도 있지만, 만 번 던지면 거의 절반에 가까워지는 것처럼요. 게임도 판이 쌓일수록 운의 흔들림은 서로 상쇄되고, 좋은 결정의 작은 차이가 쌓여 분명한 차이가 돼요.'),
        p('그래서 운이 있는 게임일수록 **한 판의 결과보다 결정의 질**을 봐야 해요. “이 상황에서 이 선택이 평균적으로 이득인가?”를 묻는 습관이 실력이에요. 결과가 나빴다고 좋은 결정을 버리거나, 결과가 좋았다고 나쁜 결정을 반복하면 실력이 늘지 않아요.'),
        tip('결과와 결정을 따로 보세요', '좋은 결정·좋은 결과, 좋은 결정·나쁜 결과, 나쁜 결정·좋은 결과, 나쁜 결정·나쁜 결과의 네 칸으로 판을 돌아보세요. 고쳐야 하는 건 “나쁜 결정” 두 칸뿐이에요.'),
      ]),
      sec('good', '운이 게임에 주는 것', [
        ul(
          '**처음 하는 사람에게 기회를.** 운이 있으면 초보도 가끔 고수를 이겨요. 그래서 실력이 다른 사람들이 함께 즐길 수 있어요.',
          '**매 판을 다르게.** 같은 시작이 반복되지 않아서 외운 수순만으로 이길 수 없어요.',
          '**이야기를.** 마지막 카드 한 장으로 뒤집힌 판은 오래 기억에 남아요.',
          '**패배의 부담을 덜어 줌.** 졌을 때 “운이 없었지”라고 웃을 여지가 있으면, 다음 판을 시작하기가 쉬워요.',
        ),
        p('반대로 운이 너무 크면 선택이 의미를 잃고, 운이 전혀 없으면 실력 차가 큰 사람끼리 즐기기 어려워요. 좋은 게임은 자기 목적에 맞게 이 균형을 정해요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK 게임으로 보는 스펙트럼', [
        p('**벽바둑**, **십이장기**, 논리 퍼즐들은 운이 전혀 없는 쪽 끝이에요. **2048**은 새 블록 위치라는 입력 운이 있지만, 모서리 전략처럼 그 운을 받아 내는 실력의 차이가 커요. **Hit,Stay**와 **인디언 포커**는 다음 카드라는 운 위에 베팅 판단이 얹힌 게임이고, **러시안 룰렛**은 조사와 조작으로 운의 크기를 직접 줄여 가는 게임이에요.'),
        tip('운이 있는 게임에서 늘고 싶다면', '한 판씩 이기고 지는 데 일희일비하지 말고, 열 판 단위로 결과를 보세요. 그 사이에 바꾼 판단이 평균을 올렸는지가 진짜 성적표예요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Luck and skill — is luck bad in board games? Kinds of luck and how skill shows',
      description: 'From luck-free go to dice games, luck and skill form a spectrum. Input versus output randomness, why skill shows as games pile up, what luck gives a game, and how to improve in games with luck.',
      keywords: ['luck and skill', 'luck in board games', 'games of chance vs skill', 'input randomness', 'output randomness', 'skill gap'],
    },
    title: 'Luck and skill',
    lead: 'Is luck the enemy of a game? Well-used luck does not hide skill — it opens the game to more people.',
    intro: [
      '“It’s just a luck game” is rarely a compliment. Yet games without luck are not the only good games. Luck gives first-timers a chance, makes every game different and produces stories nobody expected.',
      'This article treats luck and skill not as either-or but as **one spectrum**, shows that luck comes in kinds, explains why skill emerges as games pile up, and covers how to improve at games with luck.',
    ],
    summary: 'Luck and skill as a spectrum: input and output randomness, why skill shows over many games, and how to improve in games with luck.',
    sections: [
      sec('spectrum', 'One spectrum', [
        p('It is hard to split games cleanly into luck games and skill games. Instead you can line them up.'),
        table(
          ['Position', 'What it is like', 'Examples'],
          [
            ['100% luck', 'Choices do not affect the result.', 'Roll-and-move race games'],
            ['Big luck, some choice', 'Luck swings hard, but choices shift the average.', 'Blackjack-style games, light party games'],
            ['Big skill, some luck', 'You can lose one game to luck, but over many, skill wins.', 'Poker, backgammon, 2048'],
            ['0% luck', 'The result comes entirely from the players’ choices.', 'Go, chess, Wallgo'],
          ],
        ),
        p('Even without luck, skill does not fully decide results — the same person makes mistakes on an off day. But those mistakes are still their own, which is different from luck.'),
      ]),
      sec('kinds', 'Luck comes in kinds', [
        p('Game designers distinguish two kinds of luck by **when** it enters.'),
        h3('Input randomness: luck before you decide'),
        p('Luck sets up a situation, then you decide within it: the cards you are dealt, a new 2048 tile, a scrambled start. This kind demands **skill at coping** — a bad hand still plays out differently depending on how you use it.'),
        h3('Output randomness: luck after you decide'),
        p('You decide first, then luck decides the result — declaring an attack, then rolling to see if it works. This demands **skill at weighing probabilities**, but however well you choose, the result can flip, which feels more unfair.'),
        note('Why the distinction matters', 'The same amount of luck feels like “I failed to cope” when it is input randomness and “I was unlucky” when it is output randomness, which is why experienced players are often said to accept input randomness more easily. Neither is simply better, though, and most games mix both — in poker, the dealt hand is input randomness and the last card is output randomness.'),
      ]),
      sec('repeat', 'Skill shows as games pile up', [
        p('In games with luck, skill shows **on average**. Ten coin flips can give seven heads, but ten thousand come out close to half. Likewise, as games accumulate, luck’s swings cancel out and small differences in decision quality add up to a clear gap.'),
        p('So the more luck a game has, the more you should judge **the quality of decisions, not single results**. Asking “is this choice profitable on average here?” is the skill. Drop a good decision because it turned out badly, or repeat a bad one because it worked once, and you stop improving.'),
        tip('Separate result from decision', 'Review games in four boxes: good decision/good result, good decision/bad result, bad decision/good result, bad decision/bad result. Only the two “bad decision” boxes need fixing.'),
      ]),
      sec('good', 'What luck gives a game', [
        ul(
          '**A chance for newcomers.** With luck, beginners sometimes beat experts, so mixed groups can play together.',
          '**Variety.** Starts never repeat, so memorised lines cannot win alone.',
          '**Stories.** A game turned by the last card is remembered for a long time.',
          '**Softer losses.** If you can laugh and say “bad luck”, starting the next game is easy.',
        ),
        p('Too much luck makes choices meaningless; none at all makes it hard for players of very different strength to enjoy a game together. Good games set the balance to fit their purpose.'),
      ]),
      sec('puzzlthink', 'The spectrum on PUZZLTHINK', [
        p('**Wallgo**, **12 Janggi** and the logic puzzles sit at the no-luck end. **2048** has input randomness in where new tiles appear, but skill — like the corner strategy — makes a big difference in absorbing it. **Hit,Stay** and **Indian Poker** put betting judgement on top of the luck of the next card, and **Russian Roulette** lets you shrink luck directly by checking and tampering.'),
        tip('To improve at games with luck', 'Do not ride the highs and lows of single games; look at results ten games at a time. Whether the judgements you changed raised the average is the real report card.'),
      ]),
    ],
  },
};

export default article;
