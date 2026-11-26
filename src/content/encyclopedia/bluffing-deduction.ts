import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'bluffing-deduction',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'indianPoker', ko: '내 카드는 못 보고 상대 카드만 보는 포커. 상대의 베팅이 곧 내 카드에 대한 단서예요.', en: 'You see only your opponent’s card. Their betting is your only clue to your own.' },
    { game: 'twoSidedPoker', ko: '앞면은 공개, 뒷면은 나만 아는 카드 한 장. 어느 면에 걸지가 블러핑의 시작이에요.', en: 'One card: the front is public, the back only you know. Choosing a side is where the bluff begins.' },
    { game: 'blackWhite', ko: '숫자 대신 색만 보이는 타일 대결. 이미 나온 색을 세며 상대 숫자를 좁혀 가요.', en: 'Tiles show only their colour. Count which colours are gone and narrow down the number.' },
    { game: 'blackWhite2', ko: '99포인트를 몰래 나눠 쓰는 입찰. 흑·백 표시와 남은 포인트 표시등이 단서예요.', en: 'Secretly split 99 points across rounds; colour and a five-step gauge are your clues.' },
    { game: 'gradation', ko: '통의 밝기만 보고 숨은 숫자를 맞대결해요. 배치 자체가 블러핑이에요.', en: 'Duel with hidden numbers, judging only by the shade of each box. The setup itself is a bluff.' },
    { game: 'hiddenWord', ko: '유사도 숫자로 상대의 단어를 추리하고, 내 단어는 들키지 않게 힌트를 내요.', en: 'Deduce a hidden word from similarity scores while hinting at yours without giving it away.' },
    { game: 'equationSignal', ko: '초록·노랑·빨강 신호로 숨은 9칸 수식을 찾아내는 순수 추리 게임이에요.', en: 'Pure deduction: green, yellow and red signals lead you to a hidden nine-cell equation.' },
    { game: 'piggyBank', ko: '저금통 속 동전 수를 말하고, 남의 대답을 의심해요. 기억과 블러핑이 함께 가요.', en: 'Say how many coins are in the bank, and doubt other people’s answers. Memory meets bluff.' },
    { game: 'russianRoulette', ko: '조사 결과를 공개할지 숨길지, 누가 무엇을 알고 있을지까지 추리해야 해요.', en: 'Decide whether to reveal what you checked, and deduce who knows what.' },
  ],
  related: ['hidden-information', 'betting-auction', 'party-games', 'perfect-information', 'luck-and-skill'],
  sources: [
    { title: 'Mafia (party game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mafia_(party_game)' },
    { title: 'The Werewolf game', site: 'eblong.com (Andrew Plotkin)', url: 'https://www.eblong.com/zarf/werewolf.html' },
    { title: 'Mastermind (board game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mastermind_(board_game)' },
    { title: 'Mordecai Meirowitz', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mordecai_Meirowitz' },
    { title: 'Cluedo', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cluedo' },
    { title: 'The surprising origin of the Clue game', site: 'History.com', url: 'https://www.history.com/articles/clue-game-origin-wwii' },
    { title: 'The New York Times buys Wordle', site: 'NPR', url: 'https://www.npr.org/2022/01/31/1077089945/nyt-wordle' },
    { title: 'Wordle', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Wordle' },
  ],
  ko: {
    meta: {
      title: '블러핑 게임과 추리 게임 — 숨기는 쪽과 찾는 쪽의 심리전 총정리',
      description: '포커·마피아 같은 블러핑 게임과 마스터마인드·클루·워들 같은 추리 게임의 원리, 필요한 실력, 흔한 실수, 대표작, PUZZLTHINK에서 바로 할 수 있는 심리전 게임까지 정리했어요.',
      keywords: ['블러핑 게임', '추리 게임', '심리전 게임', '마피아 게임', '마스터마인드', '인디언 포커', '눈치 게임'],
    },
    title: '블러핑과 추리 게임',
    lead: '한쪽은 숨기고, 한쪽은 찾아내요. 판 위가 아니라 사람의 머릿속에서 벌어지는 게임이에요.',
    intro: [
      '추상 전략 게임에서는 모든 정보가 판 위에 있어요. 블러핑과 추리 게임은 정반대예요. 가장 중요한 정보가 **누군가의 손이나 머릿속에 숨어 있고**, 게임은 그걸 지키는 쪽과 알아내려는 쪽의 싸움이 돼요.',
      '두 장르는 보통 따로 이야기되지만 뿌리가 같아요. 블러핑은 “상대가 나에 대해 추리하는 과정을 흔드는 기술”이고, 추리는 “흩어진 단서에서 숨은 사실을 재구성하는 기술”이에요. 이 글에서는 두 장르를 함께 놓고, 각각 어떻게 작동하고 무엇을 연습해야 하는지 살펴봐요.',
    ],
    summary: '숨기는 쪽과 찾는 쪽의 게임. 포커와 마피아의 블러핑, 마스터마인드와 클루의 추리가 어떻게 작동하는지, 무엇을 연습해야 하는지 정리했어요.',
    sections: [
      sec('two-sides', '같은 뿌리, 두 갈래', [
        p('**블러핑 게임**은 내가 가진 정보를 실제와 다르게 믿게 만드는 게임이에요. 약한 패로 강하게 걸어 상대를 물러서게 하거나, 강한 패를 약한 척 숨겨 상대가 더 걸게 만들어요. 대표적인 게 포커예요.'),
        p('**추리 게임**은 단서를 모아 정답을 좁혀 가는 게임이에요. 단서는 게임이 기계적으로 주기도 하고(마스터마인드의 핀, 워들의 색깔 칸), 다른 플레이어의 말과 행동에서 나오기도 해요(마피아, 클루).'),
        p('두 갈래는 자주 섞여요. 마피아에서 시민은 추리를 하고, 마피아는 그 추리를 흐트러뜨리려고 블러핑을 해요. 인디언 포커에서는 상대의 베팅을 보고 내 카드를 추리하는 동시에, 내 베팅으로 상대의 추리를 속여야 해요.'),
      ]),
      sec('bluff', '블러핑은 어떻게 작동하나', [
        h3('블러핑은 가끔 진짜여야 힘이 있어요'),
        p('늘 세게 거는 사람의 베팅은 아무 정보도 주지 않아요. 상대는 그냥 무시하면 되니까요. 반대로 강할 때만 거는 사람은 금방 읽혀요. 블러핑이 통하려면 **같은 행동이 어떤 때는 진짜이고 어떤 때는 거짓이어야** 해요. 게임 이론에서는 이렇게 행동을 섞는 것을 혼합 전략이라고 불러요.'),
        h3('수준의 싸움'),
        p('“상대는 내가 약하다고 생각할 거야”를 넘어서 “상대는 내가 약한 척한다고 생각할 거야”까지 가면 한 단계가 더 올라가요. 재미있는 건, 상대보다 너무 높은 단계에서 생각하면 오히려 진다는 거예요. 초보에게 고급 블러핑을 걸면 상대가 그 의미를 읽지 못해 그냥 콜해 버리거든요. 결국 중요한 건 **상대가 실제로 어느 단계에서 생각하는지**를 읽는 일이에요.'),
        h3('패턴을 흘리지 않기'),
        p('블러핑 게임에서 가장 비싼 실수는 습관이에요. 강할 때 빨리 결정하고, 약할 때 오래 고민한다면 그 시간 차이가 곧 정보가 돼요. 결정 시간, 베팅 크기, 말투처럼 내가 매번 흘리는 신호를 일정하게 유지하는 것이 기본기예요.'),
      ]),
      sec('deduce', '추리는 어떻게 작동하나', [
        h3('가능성의 공간을 줄여 가기'),
        p('추리는 “정답일 수 있는 것들의 목록”을 단서마다 줄여 가는 과정이에요. 단서를 하나 얻을 때마다 목록에서 무엇이 지워지는지 정확히 따지는 것이 실력의 전부라고 해도 지나치지 않아요.'),
        h3('좋은 질문은 반으로 나누는 질문'),
        p('마스터마인드나 워들 같은 게임에서는 정답처럼 보이는 답을 내는 것보다, **결과가 어떻게 나와도 많은 가능성을 지우는 답**을 내는 것이 더 빨라요. 스무고개에서 “동물인가요?”가 “고양이인가요?”보다 좋은 질문인 것과 같은 원리예요.'),
        h3('확증 편향을 조심하기'),
        p('한번 “이 사람이 범인이야”라고 믿으면, 그 믿음에 맞는 단서만 눈에 들어와요. 마피아 게임이 어려운 이유 중 하나예요. 좋은 추리자는 자기 가설을 깨뜨릴 단서를 일부러 찾아봐요.'),
      ]),
      sec('classics', '대표 게임', [
        table(
          ['게임', '갈래', '한 줄 설명'],
          [
            ['포커', '블러핑', '패의 강약과 베팅으로 상대를 물러서게 하는 카드 게임. 블러핑이라는 말이 가장 널리 쓰이는 게임이에요.'],
            ['마피아 · 늑대인간', '블러핑 + 추리', '숨은 마피아를 대화로 찾아내는 게임. 1986년 무렵 모스크바에서 드미트리 다비도프가 만든 것으로 알려져 있고, 1997년 앤드루 플롯킨이 늑대인간 테마를 붙였어요.'],
            ['마스터마인드', '추리', '색깔 핀으로 숨은 암호를 맞히는 게임. 1970년 이스라엘의 모르데하이 메이로비츠가 고안했어요.'],
            ['클루(클루도)', '추리', '범인·흉기·장소를 소거법으로 맞히는 게임. 영국의 앤서니 프랫이 만들었고 1949년에 영국에서 처음 나왔어요.'],
            ['워들', '추리', '다섯 글자 단어를 색깔 칸 힌트로 맞히는 웹 게임. 2021년 10월 조시 워들이 공개했고, 2022년 1월 뉴욕타임스가 인수했어요.'],
          ],
        ),
        note('날짜가 엇갈리는 부분', '마피아의 첫 게임이 1986년인지 1987년인지는 자료마다 달라요. 마스터마인드의 첫 판매 연도도 1971년과 1972년으로 갈려서, 여기서는 고안된 해만 적었어요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**사람을 관찰하는 걸 좋아하는 사람.** 블러핑 게임의 진짜 판은 상대의 얼굴과 습관이에요.',
          '**퍼즐을 좋아하지만 상대가 있었으면 하는 사람.** 추리 게임은 퍼즐의 논리에 사람과의 대결을 얹은 형태예요.',
          '**한 판 한 판 이야기가 남는 게임을 원하는 사람.** “그때 네가 거기서 레이즈할 줄은 몰랐어” 같은 대화가 끝나고 나서도 이어져요.',
        ),
        p('운의 비중은 추상 전략보다 크지만, 판을 오래 할수록 실력 차이가 분명하게 드러나요. 한 판은 운으로 질 수 있어도, 열 판을 운으로 지기는 어려워요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK에는 이 장르의 게임이 특히 많아요. **인디언 포커**는 내 카드만 보지 못하는 구조 덕분에, 상대의 베팅이 내 카드에 대한 유일한 단서가 돼요. **흑과 백**은 타일의 색(짝수는 흑, 홀수는 백)만 공개되기 때문에, 이미 나온 색을 세는 추리와 내 타일 순서를 숨기는 블러핑이 동시에 필요해요.'),
        p('**히든 워드**와 **수식 신호등**은 추리 쪽에 가까워요. 히든 워드는 단어 사이의 유사도 숫자를, 수식 신호등은 칸마다 켜지는 신호를 단서로 정답을 좁혀 가요. 반대로 **그라데이션**과 **흑과 백 II**는 숨은 숫자를 어떻게 배치하고 쓰느냐 자체가 상대를 속이는 수단이 되는 블러핑 게임이에요.'),
        tip('실전 팁', '블러핑 게임을 할 땐 한 판이 끝날 때마다 “상대가 나에 대해 무엇을 알게 됐을까?”를 생각해 보세요. 추리 게임에서는 답을 내기 전에 “이 답으로 무엇을 지울 수 있지?”를 먼저 묻는 습관이 실력을 크게 올려 줘요.'),
        note('방송 게임 이야기', '이 장르의 게임 중 상당수는 두뇌 서바이벌 방송에서 처음 알려졌어요. 방송과 그 게임들의 이야기는 PUZZLTHINK의 별도 코너에서 다뤄요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Bluffing and deduction games — how hiding and finding out work',
      description: 'How bluffing games like poker and Mafia and deduction games like Mastermind, Clue and Wordle work: the principles, the skills, common mistakes, classic examples, and the mind games you can play on PUZZLTHINK.',
      keywords: ['bluffing games', 'deduction games', 'mind games', 'Mafia party game', 'Mastermind game', 'Indian poker', 'social deduction'],
    },
    title: 'Bluffing and deduction games',
    lead: 'One side hides, the other side finds out. The game happens in people’s heads, not on the board.',
    intro: [
      'In an abstract game everything is on the board. Bluffing and deduction games are the opposite: the most important information is **hidden in someone’s hand or head**, and the game becomes a fight between protecting it and uncovering it.',
      'The two genres are usually discussed separately, but they share a root. Bluffing is the art of disrupting someone’s reasoning about you; deduction is the art of rebuilding a hidden fact from scattered clues. This article looks at both together — how each works and what to practise.',
    ],
    summary: 'Games of hiding and finding out: how bluffing in poker and Mafia and deduction in Mastermind and Clue work, and what to practise.',
    sections: [
      sec('two-sides', 'One root, two branches', [
        p('A **bluffing game** is about making others believe something false about what you hold: betting big with a weak hand to make them fold, or playing a strong hand quietly so they bet more. Poker is the classic example.'),
        p('A **deduction game** is about narrowing down the answer from clues. Sometimes the game hands out clues mechanically — Mastermind’s pegs, Wordle’s coloured tiles — and sometimes they come from other players’ words and actions, as in Mafia or Clue.'),
        p('The two mix all the time. In Mafia the villagers deduce while the mafia bluff to throw them off. In Indian poker you deduce your card from your opponent’s betting while bluffing them about theirs.'),
      ]),
      sec('bluff', 'How bluffing works', [
        h3('A bluff needs to be true sometimes'),
        p('If someone always bets big, their bet carries no information — you just ignore it. If someone bets only when strong, they are easy to read. For a bluff to work, **the same action must sometimes be real and sometimes not**. Game theory calls this mixing of actions a mixed strategy.'),
        h3('Levels of thinking'),
        p('Going from “they think I am weak” to “they think I am pretending to be weak” is one level up. The catch is that thinking too many levels above your opponent loses: a sophisticated bluff against a beginner fails because they simply call. What matters is reading **which level your opponent is actually on**.'),
        h3('Do not leak patterns'),
        p('The most expensive mistake in bluffing games is a habit. If you decide fast when strong and slowly when weak, the timing itself is information. Keeping your signals — decision time, bet size, tone — consistent is the foundation.'),
      ]),
      sec('deduce', 'How deduction works', [
        h3('Shrinking the space of possibilities'),
        p('Deduction is trimming a list of “things that could be the answer” with each clue. Working out exactly what each clue eliminates is nearly the whole skill.'),
        h3('A good question splits the list in half'),
        p('In Mastermind or Wordle, it is often faster to make a guess that **eliminates many possibilities whatever the result** than to guess something that merely looks right. It is the same reason “is it an animal?” beats “is it a cat?” in twenty questions.'),
        h3('Beware confirmation bias'),
        p('Once you believe “that player is the mafia”, only clues that fit stand out. That is part of why Mafia is hard. Good deducers go looking for the clue that would break their own theory.'),
      ]),
      sec('classics', 'Classic examples', [
        table(
          ['Game', 'Branch', 'In one line'],
          [
            ['Poker', 'Bluffing', 'A card game of hand strength and betting — the game the word “bluff” is most tied to.'],
            ['Mafia / Werewolf', 'Bluffing + deduction', 'Find the hidden mafia through talk. Generally credited to Dimitry Davidoff in Moscow around 1986; Andrew Plotkin added the werewolf theme in 1997.'],
            ['Mastermind', 'Deduction', 'Crack a hidden code with coloured pegs. Devised in 1970 by Mordecai Meirowitz of Israel.'],
            ['Clue (Cluedo)', 'Deduction', 'Eliminate suspects, weapons and rooms. Created by Anthony Pratt in England and first released there in 1949.'],
            ['Wordle', 'Deduction', 'Guess a five-letter word from coloured hints. Released by Josh Wardle in October 2021 and bought by The New York Times in January 2022.'],
          ],
        ),
        note('Where dates disagree', 'Sources differ on whether the first Mafia game was in 1986 or 1987, and on whether Mastermind first went on sale in 1971 or 1972, so only the year it was devised is given here.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**People who enjoy watching people.** In bluffing games, the real board is your opponent’s face and habits.',
          '**Puzzle lovers who want an opponent.** Deduction games put a human contest on top of puzzle logic.',
          '**People who like games that leave a story.** “I never thought you would raise there” carries on long after the game.',
        ),
        p('Luck matters more than in abstract games, but the more rounds you play, the clearer skill becomes. You can lose one hand to luck; losing ten is much harder.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK has many games in this genre. In **Indian Poker** the one card you cannot see is your own, so your opponent’s betting is your one clue about it. In **Black & White** only a tile’s colour is revealed (even numbers black, odd white), so you need both deduction — counting which colours are gone — and bluffing — hiding the order of your tiles.'),
        p('**Hidden Word** and **Equation Signal** lean toward deduction: similarity scores in one, per-cell signals in the other, narrow down the answer. **Gradation** and **Black & White II** are bluffing games where how you place or spend your hidden numbers is itself the deception.'),
        tip('In practice', 'After each hand of a bluffing game, ask “what did my opponent just learn about me?”. In a deduction game, ask “what will this guess rule out?” before you submit it. Both habits pay off quickly.'),
        note('Games from TV', 'Many games in this genre first became known through Korean brain-survival shows. The shows and their games are covered in a separate PUZZLTHINK section.'),
      ]),
    ],
  },
};

export default article;
