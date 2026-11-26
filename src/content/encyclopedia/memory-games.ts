import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'memory-games',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'hexagon', ko: '19칸의 숫자를 30초 동안 외운 뒤, 합이 타깃이 되는 세 칸을 알파벳으로 맞혀요.', en: 'Memorise 19 numbers in 30 seconds, then name three cells in a line that add up to the target.' },
    { game: 'piggyBank', ko: '저금통에 들어간 흑·백 동전 수를 기억해 대답하고, 남의 틀린 대답을 의심해요.', en: 'Remember how many black and white coins went into each bank, and doubt wrong answers.' },
    { game: 'blindGomoku', ko: '돌의 겉색만 보이는 오목. 어느 돌이 내 것인지 기억하는 게 곧 수읽기예요.', en: 'Gomoku showing only surface colours — remembering which stones are yours is the reading.' },
    { game: 'blackWhite', ko: '상대가 낸 타일의 색을 기억하면 남은 숫자가 보여요. 기억이 추리의 재료가 돼요.', en: 'Remember the colours your opponent has played and the remaining numbers come into view.' },
    { game: 'russianRoulette', ko: '누가 어느 약실을 조사했고 무엇을 공개했는지 따라가야 살아남아요.', en: 'Track who checked which chamber and what they revealed — that is how you survive.' },
  ],
  related: ['hidden-information', 'bluffing-deduction', 'party-games', 'luck-and-skill', 'number-puzzles'],
  sources: [
    { title: 'Ravensburger vintage memory® editions (history)', site: 'Memozor', url: 'https://memozor.com/memory-games/by-theme/vintage' },
    { title: 'memory® game (Milestones of the information age)', site: 'Google Arts & Culture', url: 'https://artsandculture.google.com/asset/card-game-memo-spiel-meilensteine-der-informationstachnik-memory-play-milestones-of-the-information-age/NwEo3OoHi9J-lQ' },
    { title: 'Memory', site: 'BoardGameFYI', url: 'https://boardgamefyi.com/games/memory' },
    { title: 'Concentration (card game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Concentration_(card_game)' },
    { title: 'The Magical Number Seven, Plus or Minus Two', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two' },
    { title: 'Chunking (psychology)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chunking_(psychology)' },
  ],
  ko: {
    meta: {
      title: '기억력 게임 — 짝 맞추기부터 숨은 정보 추적까지, 외워서 이기는 게임',
      description: '카드 짝 맞추기, 숫자 외우기, 이미 나온 카드 세기. 기억력 게임의 종류와 재미, 기억을 잘하는 실전 요령(묶기·위치·말로 되뇌기), 대표작과 PUZZLTHINK 헥사곤·돼지 저금통·블라인드 오목까지 정리했어요.',
      keywords: ['기억력 게임', '기억력 보드게임', '짝 맞추기 게임', '카드 뒤집기 게임', '숫자 외우기 게임', '기억력 높이는 게임', '두뇌 게임'],
    },
    title: '기억력 게임',
    lead: '한 번 본 것을 얼마나 오래, 얼마나 정확하게 들고 있을 수 있나요?',
    intro: [
      '어릴 때 카드를 엎어 놓고 두 장씩 뒤집어 짝을 맞추던 놀이를 기억하나요? 그게 가장 단순한 기억력 게임이에요. 정보는 잠깐 보였다가 사라지고, 그걸 머릿속에 붙잡아 둔 사람이 이겨요.',
      '기억력 게임은 아이들 놀이로 보이기 쉽지만, 사실 많은 전략 게임 안에 기억력이 숨어 있어요. 카드 게임에서 이미 나온 카드를 세는 일, 상대가 지난 라운드에 무엇을 냈는지 기억하는 일이 모두 기억력 싸움이에요. 이 글에서는 기억력이 게임에 들어가는 방식과, 기억을 잘하기 위한 실전 요령을 정리해요.',
    ],
    summary: '잠깐 보인 정보를 붙잡아 두는 사람이 이기는 게임. 짝 맞추기부터 나온 카드 세기까지, 기억력 게임의 종류와 실전 요령을 정리했어요.',
    sections: [
      sec('kinds', '기억력이 게임에 들어가는 세 가지 방식', [
        table(
          ['방식', '어떻게', '예'],
          [
            ['보고 외우기', '정보가 잠깐 공개됐다가 가려져요. 가려진 뒤에 답해야 해요.', '카드 짝 맞추기, 숫자 판 외우기'],
            ['흐름 따라가기', '게임이 진행되며 정보가 하나씩 쌓여요. 다 적어 둘 수는 없어요.', '나온 카드 세기, 누가 무엇을 했는지 기억하기'],
            ['숨은 상태 기억하기', '판 위에 있지만 겉으로는 구별되지 않는 정보를 기억해야 해요.', '뒤집힌 타일의 주인, 덮인 말의 정체'],
          ],
        ),
        p('첫 번째는 순수한 기억력 게임이고, 두 번째와 세 번째는 전략 게임 안에서 기억력이 무기가 되는 경우예요. 특히 두 번째는 카드 게임을 잘하는 사람들이 공통으로 가진 능력이기도 해요.'),
      ]),
      sec('history', '짝 맞추기 게임의 내력', [
        p('엎어 놓은 카드 두 장을 뒤집어 짝을 찾는 놀이는 영어권에서 흔히 “콘센트레이션”이나 “메모리”라고 불러요. 이 놀이를 상품으로 만든 것으로 가장 유명한 게 독일 라벤스부르거의 「memory®」예요. 1959년에 처음 나왔고, 지금도 같은 회사의 대표 상품으로 이어지고 있어요.'),
        p('그보다 훨씬 오래된 뿌리를 찾는 견해도 있어요. 일본에서 조개껍데기 안쪽에 그림을 그려 짝을 맞추던 놀이(가이아와세)를 짝 맞추기 게임의 조상으로 보는 거예요. 다만 둘 사이의 직접적인 연결은 확인하기 어려워서, 여기서는 비슷한 놀이가 여러 곳에 있었다는 정도로만 적어 둘게요.'),
        note('확인이 엇갈리는 부분', 'memory® 게임의 아이디어를 누가 처음 냈는지에 대해서는 자료마다 설명이 조금씩 달라서 이 글에서는 다루지 않았어요.'),
      ]),
      sec('fun', '무엇이 재미를 만드나', [
        p('기억력 게임의 재미는 **긴장과 해방**에 있어요. 머릿속에 잡아 둔 정보가 조금씩 흐려지는 걸 느끼면서 버티다가, 결정적인 순간에 정확히 꺼내 맞힐 때 쾌감이 커요.'),
        p('또 하나는 **실력 차가 공평하게 줄어든다**는 점이에요. 수읽기 게임에서는 경험이 많은 어른이 압도적이지만, 짝 맞추기에서는 아이가 어른을 이기는 일이 흔해요. 그래서 가족이나 실력이 다른 친구끼리 함께하기 좋아요.'),
        p('전략 게임 안의 기억력은 조금 다른 재미를 줘요. 상대가 기억하지 못하리라 믿고 같은 수법을 다시 쓰거나, 상대가 기억하고 있다는 걸 역이용하는 식으로 **기억이 심리전의 재료**가 되거든요.'),
      ]),
      sec('tips', '기억을 잘하는 실전 요령', [
        h3('묶어서 기억하기'),
        p('사람이 한 번에 들고 있을 수 있는 정보의 양은 생각보다 적어요. 심리학에서는 보통 몇 개 단위로 이야기해요. 그래서 낱개로 외우기보다 **묶어서** 외우는 게 훨씬 유리해요. 숫자 19개를 외워야 한다면 줄 단위로 “3-7-1”, “5-2-8-4”처럼 덩어리를 만들면 부담이 크게 줄어요.'),
        h3('위치에 붙이기'),
        p('정보를 장소에 붙이면 오래 남아요. “왼쪽 위 모서리는 큰 숫자, 가운데 줄은 작은 숫자”처럼 판의 지형으로 기억하면, 정확한 숫자가 흐려져도 대략의 위치는 남아서 추리로 메울 수 있어요.'),
        h3('말로 되뇌기'),
        p('흐름을 따라가는 게임에서는 속으로 짧게 중계하는 습관이 좋아요. “상대 흑, 흑, 백” 같은 식으로 되뇌면 그냥 보는 것보다 훨씬 잘 남아요.'),
        h3('다 외우려 하지 않기'),
        p('모든 걸 기억하려 하면 오히려 다 놓쳐요. 승부에 직접 영향을 주는 정보만 골라 기억하세요. 카드 게임이라면 모든 카드보다 가장 큰 카드 몇 장이 나왔는지가 훨씬 중요해요.'),
        tip('기억이 흐려졌을 때', '확실하지 않으면 확실한 것부터 지워 나가세요. “이 칸은 아니다”를 몇 개 확정하는 것만으로도 남은 후보가 크게 줄어요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**아이와 어른이 함께하는 자리.** 경험보다 집중력이 중요해서 공평하게 겨룰 수 있어요.',
          '**짧고 가볍게 머리를 깨우고 싶은 사람.** 한 판이 짧고 규칙 설명이 거의 필요 없어요.',
          '**카드 게임 실력을 올리고 싶은 사람.** 나온 정보를 따라가는 능력은 거의 모든 카드 게임의 기본기예요.',
        ),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('**헥사곤**은 순수한 “보고 외우기” 게임이에요. 정육각형 19칸의 숫자가 30초 동안 공개됐다가 알파벳으로 바뀌고, 그다음 합이 타깃 넘버가 되는 일렬 세 칸을 맞혀요. 이미 나온 답도 판에 표시되지 않아서 기억해야 해요. **돼지 저금통**은 “흐름 따라가기” 게임이에요. 저금통을 돌리며 넣은 동전의 색과 개수를 기억해 대답하고, 다른 사람의 대답이 틀렸다 싶으면 의심할 수 있어요.'),
        p('**블라인드 오목**은 “숨은 상태 기억하기”의 좋은 예예요. 판 위의 돌은 겉색만 보이고 진영은 숨겨져 있어서, 어느 돌이 누구 것인지 기억하지 못하면 내 5목도, 상대의 위협도 보이지 않아요. 한 게임에 두 번 판을 뒤집어 확인할 수 있는데, 이 기회를 언제 쓰느냐도 전략이에요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Memory games — from matching pairs to tracking hidden information',
      description: 'Matching pairs, memorising numbers, counting cards already played: the kinds of memory games, why they are fun, practical memory techniques (chunking, places, quiet rehearsal), classics, and PUZZLTHINK’s Hexagon, Piggy Bank and Blind Gomoku.',
      keywords: ['memory games', 'memory board games', 'matching pairs game', 'concentration card game', 'number memory game', 'brain games'],
    },
    title: 'Memory games',
    lead: 'How long, and how accurately, can you hold on to something you saw once?',
    intro: [
      'Remember laying cards face down and turning two at a time to find pairs? That is the simplest memory game. Information appears for a moment and disappears; whoever holds on to it wins.',
      'Memory games can look like children’s play, but memory hides inside many strategy games. Counting the cards already played, remembering what your opponent did last round — all of it is a memory contest. This article covers the ways memory enters games and practical techniques for remembering better.',
    ],
    summary: 'Games won by holding on to what you saw for a moment. From matching pairs to counting cards: the kinds of memory games and practical techniques.',
    sections: [
      sec('kinds', 'Three ways memory enters a game', [
        table(
          ['Way', 'How', 'Examples'],
          [
            ['See and recall', 'Information is shown briefly, then hidden; you answer afterwards.', 'Matching pairs, memorising a grid of numbers'],
            ['Follow the flow', 'Information piles up as play goes on, too much to write down.', 'Counting played cards, remembering who did what'],
            ['Hold a hidden state', 'Information is on the board but looks the same from outside.', 'Who owns a face-down tile, what is under a covering piece'],
          ],
        ),
        p('The first is a pure memory game; the second and third are cases where memory becomes a weapon inside a strategy game. The second in particular is a skill every strong card player shares.'),
      ]),
      sec('history', 'Where matching pairs comes from', [
        p('Turning two face-down cards to find a pair is commonly called Concentration or Memory in English. The best-known commercial version is Ravensburger’s memory®, first published in Germany in 1959 and still one of the company’s signature games.'),
        p('Some trace much older roots, pointing to the Japanese game of matching painted shells (kai-awase). A direct link is hard to establish, so here we only note that similar games existed in more than one place.'),
        note('Where accounts differ', 'Sources tell slightly different stories about who first came up with the memory® idea, so that is left out here.'),
      ]),
      sec('fun', 'Where the fun comes from', [
        p('The fun is **tension and release**: holding on as what you memorised slowly fades, then pulling it out exactly at the decisive moment.'),
        p('Memory games also **level the field**. Experienced adults dominate reading games, but children often beat adults at matching pairs, which makes these games great for families and mixed groups.'),
        p('Memory inside strategy games gives a different kind of fun. You reuse a trick hoping your opponent has forgotten, or exploit the fact that they remember — **memory becomes material for mind games**.'),
      ]),
      sec('tips', 'Practical techniques', [
        h3('Chunk it'),
        p('People can hold far less at once than they think — psychologists usually speak of a handful of items. So remembering in **chunks** beats remembering single items. Facing 19 numbers, group each row — “3-7-1”, “5-2-8-4” — and the load drops sharply.'),
        h3('Pin it to places'),
        p('Attach information to locations and it lasts. Remember the board’s landscape — “big numbers top left, small ones along the middle row” — and even when exact values fade, the rough positions remain for deduction to fill in.'),
        h3('Narrate quietly'),
        p('In flow games, a short silent commentary helps: “they played black, black, white”. Saying it to yourself sticks far better than just watching.'),
        h3('Do not try to remember everything'),
        p('Try to hold everything and you lose it all. Keep only what directly affects the result. In a card game, how many of the top few cards are out matters far more than every card.'),
        tip('When memory blurs', 'If you are unsure, eliminate what you are sure of first. Fixing a few “not this cell” facts shrinks the candidates a lot.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**Children and adults together.** Focus matters more than experience, so it is a fair contest.',
          '**Anyone wanting a short brain wake-up.** Rounds are short and need almost no rules explanation.',
          '**Players who want better card skills.** Tracking what has appeared is a foundation of nearly every card game.',
        ),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('**Hexagon** is pure see-and-recall: the numbers on 19 hexagonal cells are shown for 30 seconds, then turn into letters, and you name three cells in a line that sum to the target. Answers already given are not marked, so you must remember those too. **Piggy Bank** is a flow game: remember the colour and number of coins put into each bank as they pass around, and call out answers you think are wrong.'),
        p('**Blind Gomoku** is a fine example of holding a hidden state. Stones show only a surface colour; their side is hidden, so if you forget whose stone is whose you cannot see your own five or your opponent’s threats. You may flip the board to check twice per game — and when you use those checks is strategy too.'),
      ]),
    ],
  },
};

export default article;
