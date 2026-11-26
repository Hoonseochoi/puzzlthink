import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'betting-auction',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'blackWhite2', ko: '99포인트를 9라운드에 나눠 거는 비공개 입찰. 진 라운드에 쓴 포인트도 사라져요.', en: 'A sealed bid of 99 points over nine rounds; points spent on a lost round are gone too.' },
    { game: 'pointOmok', ko: '돌을 두는 대신 세 점에 포인트를 몰래 나눠 걸어요. 남긴 포인트는 절반만 이월돼요.', en: 'Instead of placing stones you secretly split points over three spots; only half the leftover carries over.' },
    { game: 'hitStay', ko: '한 장 더 받을지 멈출지, 칩을 얼마나 걸지 정하는 5인 베팅 게임이에요.', en: 'A five-player betting game: draw another card or stop, and decide how many chips to risk.' },
    { game: 'indianPoker', ko: '상대 카드를 보고 걸고, 상대는 내 카드를 보고 받아요. 베팅이 곧 대화예요.', en: 'You bet on what you see of their card; they answer on what they see of yours.' },
    { game: 'twoSidedPoker', ko: '앞면과 뒷면 중 한 면을 골라 걸고, 승부처에서는 두 배를 거는 양면베팅을 노려요.', en: 'Pick a face to bet on, and look for the right moment to double up with a two-sided bet.' },
  ],
  related: ['bluffing-deduction', 'hidden-information', 'luck-and-skill', 'zero-sum', 'party-games'],
  sources: [
    { title: 'Modern Art (game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Modern_Art_(game)' },
    { title: 'Modern Art', site: 'The Dice Tower', url: 'https://dicetower.com/board-game/118' },
    { title: 'High Society (card game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/High_Society_(card_game)' },
    { title: 'High Society (1995)', site: 'Meeple Like Us', url: 'https://www.meeplelikeus.co.uk/high-society-1995/' },
    { title: 'The Knizian Society', site: 'Space-Biff!', url: 'https://spacebiff.com/2018/06/18/high-society/' },
  ],
  ko: {
    meta: {
      title: '베팅 게임과 경매 게임 — 얼마를 걸고 언제 멈출지의 기술',
      description: '포커의 베팅, 공개 경매와 비공개 입찰, 쓴 만큼 사라지는 입찰, 한 장 더 받을지 고르는 운 밀어붙이기까지. 베팅·경매 게임의 원리와 필요한 실력, 대표작과 PUZZLTHINK 게임을 정리했어요.',
      keywords: ['베팅 게임', '경매 보드게임', '입찰 게임', '블라인드 입찰', '포인트 배분 게임', '모던 아트 보드게임', '하이 소사이어티'],
    },
    title: '베팅과 경매 게임',
    lead: '같은 자원을 놓고 “얼마나 원하는지”를 숫자로 겨루는 게임이에요.',
    intro: [
      '베팅 게임과 경매 게임에는 공통점이 하나 있어요. 플레이어가 **한정된 자원**(칩, 포인트, 돈)을 들고 있고, 그걸 어디에 얼마나 쓰느냐가 승부를 가른다는 점이에요. 판 위의 위치보다 “이걸 위해 얼마까지 낼 수 있나”가 더 중요한 게임이죠.',
      '이 글에서는 베팅과 경매가 어떤 형태로 게임에 들어가는지, 어떤 판단력이 필요한지, 그리고 이 장르의 대표작과 PUZZLTHINK에서 해 볼 수 있는 게임을 살펴봐요.',
    ],
    summary: '칩과 포인트를 얼마나, 어디에 걸지 겨루는 장르. 공개 경매와 비공개 입찰, 쓴 만큼 사라지는 입찰, 운 밀어붙이기의 원리를 정리했어요.',
    sections: [
      sec('forms', '베팅과 경매의 여러 형태', [
        p('같은 “건다”라도 게임마다 구조가 꽤 달라요. 대표적인 형태를 알아 두면 처음 보는 게임도 빨리 이해할 수 있어요.'),
        table(
          ['형태', '어떻게 진행되나', '핵심 판단'],
          [
            ['베팅 라운드', '포커처럼 돌아가며 걸고, 받거나(콜), 올리거나(레이즈), 포기해요(폴드).', '내 패가 얼마나 강한지, 상대가 얼마나 강해 보이는지'],
            ['공개 경매', '값이 점점 올라가고, 마지막까지 남은 사람이 가져가요.', '이 물건이 나에게 실제로 얼마의 가치인지'],
            ['비공개 입찰', '모두가 몰래 금액을 정하고 동시에 공개해요.', '상대가 얼마를 쓸지 예측하기'],
            ['쓴 만큼 사라지는 입찰', '이기든 지든 낸 포인트가 사라져요.', '이길 라운드와 버릴 라운드를 나누기'],
            ['운 밀어붙이기', '한 번 더 시도할지, 지금 멈출지 정해요. 욕심내면 다 잃을 수 있어요.', '지금까지의 이득과 다음 시도의 위험 비교'],
          ],
        ),
      ]),
      sec('fun', '무엇이 재미를 만드나', [
        p('베팅과 경매의 재미는 **가치가 사람마다 다르다**는 데서 와요. 같은 물건이라도 나에게는 꼭 필요하고 상대에게는 덤일 수 있어요. 그래서 “나는 이걸 얼마로 보는가”와 “상대는 이걸 얼마로 볼까”를 동시에 따져야 해요.'),
        p('또 하나는 **숫자 하나에 담기는 심리**예요. 비공개 입찰에서 상대가 9를 낼지 10을 낼지는 계산만으로 정해지지 않아요. 지난 라운드에 상대가 크게 썼다면 이번엔 아낄까, 아니면 흐름을 잡으려고 또 쓸까. 숫자를 내는 순간이 곧 상대의 마음을 읽는 순간이에요.'),
        p('마지막으로 자원이 한정돼 있으니 **모든 걸 다 이길 수는 없어요.** 어디서 지고 어디서 이길지를 고르는 일 자체가 전략이 되고, 이 선택이 판마다 다른 이야기를 만들어요.'),
      ]),
      sec('skills', '필요한 실력', [
        h3('가치 매기기'),
        p('지금 걸린 것이 내 승리에 얼마나 보탬이 되는지를 숫자로 가늠하는 힘이에요. 5점 먼저 내는 게임에서 4점을 가진 상태라면, 다음 한 점은 처음의 한 점보다 훨씬 비싸요.'),
        h3('예산 관리'),
        p('남은 라운드와 남은 자원을 함께 봐야 해요. 쓴 포인트가 사라지는 게임이라면 “앞으로 몇 라운드를 더 이겨야 하나, 그러려면 라운드당 얼마를 쓸 수 있나”를 늘 계산해 두는 것이 기본이에요.'),
        h3('승자의 저주 피하기'),
        p('경매 이론에는 **승자의 저주**라는 말이 있어요. 물건의 진짜 가치를 다들 어림짐작할 때, 가장 높게 부른 사람은 가장 크게 과대평가한 사람일 가능성이 높다는 뜻이에요. 이겼는데 손해 보는 상황이죠. 게임에서도 경쟁에 휩쓸려 필요 이상으로 쓰지 않는 절제가 중요해요.'),
        h3('멈출 줄 알기'),
        p('운 밀어붙이기 게임에서는 “한 번만 더”가 가장 위험한 말이에요. 남은 카드 구성을 보고 한 장 더 받을 때 넘칠 확률을 대략이라도 따져 보는 습관이 승률을 바꿔요.'),
      ]),
      sec('classics', '대표 게임', [
        table(
          ['게임', '형태', '한 줄 설명'],
          [
            ['포커', '베팅 라운드', '패의 강약과 베팅으로 겨루는 카드 게임. 베팅 게임의 대명사예요.'],
            ['모던 아트', '여러 방식의 경매', '라이너 크니치아가 만든 그림 경매 게임. 1992년 독일에서 처음 나왔고, 한 게임 안에서 공개 경매와 비공개 입찰 등 여러 방식을 번갈아 써요.'],
            ['하이 소사이어티', '공개 경매', '역시 크니치아의 게임으로, 사치품을 사 모으되 가장 돈이 적게 남은 사람은 무조건 탈락해요. 쓰는 것과 아끼는 것 사이의 긴장이 핵심이에요.'],
          ],
        ),
        note('연도가 엇갈리는 부분', '하이 소사이어티는 1995년 라벤스부르거에서 나왔다는 자료가 많지만 1994년으로 적은 자료도 있어요.'),
        p('경매 게임은 특히 독일식 보드게임에서 크게 발달했어요. 주사위 대신 플레이어끼리의 가치 판단이 운의 역할을 대신하기 때문에, 운 요소를 줄이면서도 매 판이 달라지는 구조를 만들기 좋거든요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**숫자 감각이 있고 계산을 즐기는 사람.** 남은 자원과 기대 이득을 따지는 일이 게임의 대부분이에요.',
          '**대담한 결정을 좋아하는 사람.** 전부를 거는 한 번의 선택이 판을 뒤집기도 해요.',
          '**사람의 성향을 읽는 걸 좋아하는 사람.** 누가 아끼는 편이고 누가 지르는 편인지 알면 입찰이 훨씬 쉬워져요.',
        ),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('**흑과 백 II**는 99포인트를 최대 9라운드에 나눠 쓰는 비공개 입찰이에요. 이기든 지든 낸 포인트가 사라지기 때문에, 질 라운드에 적게 쓰고 이길 라운드에 몰아 쓰는 예산 관리가 핵심이에요. 정확한 숫자는 숨겨지고 흑(0~9)·백(10 이상)과 남은 포인트 표시등만 보여서 추리도 함께 필요해요.'),
        p('**포인트 오목**은 오목에 입찰을 결합한 게임이에요. 매 라운드 받은 10포인트를 세 점에 나눠 걸고, 쓰지 않은 포인트는 절반만 다음 라운드로 넘어가요. 아끼면 손해를 보지만 다음 라운드에 크게 걸 수 있어서, “지금 쓸까, 모아 둘까”가 매번 고민거리예요.'),
        p('**Hit,Stay**는 카드 합을 한계 숫자에 가깝게 맞추는 운 밀어붙이기에 포커식 베팅을 얹은 5인 게임이고, **인디언 포커**와 **양면포커**는 베팅 라운드가 중심인 1:1 게임이에요.'),
        tip('실전 팁', '쓴 포인트가 사라지는 입찰에서는 “전부 이기려는” 순간 무너져요. 시작할 때 이길 라운드 수를 정하고, 버릴 라운드에는 0에 가깝게 내는 계획을 세워 보세요. 상대가 같은 계획을 세운다면 언제 버릴지 읽는 싸움이 시작돼요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Betting and auction games — how much to risk, and when to stop',
      description: 'Poker-style betting, open auctions and sealed bids, bids you lose whether you win or not, and push-your-luck: how betting and auction games work, the skills they ask for, classics like Modern Art and High Society, and PUZZLTHINK games.',
      keywords: ['betting games', 'auction board games', 'bidding games', 'blind bidding', 'Modern Art board game', 'High Society Knizia', 'push your luck'],
    },
    title: 'Betting and auction games',
    lead: 'Games where players compete, in numbers, over how much they want something.',
    intro: [
      'Betting and auction games share one thing: every player holds a **limited resource** — chips, points, money — and where and how much you spend decides the game. What matters is less where you stand than how much you are willing to pay.',
      'This article covers the shapes betting and bidding take in games, the judgement they need, the classics of the genre and the games you can try on PUZZLTHINK.',
    ],
    summary: 'Games about how much to bet and where: open auctions and sealed bids, bids that vanish whether you win or lose, and the logic of push-your-luck.',
    sections: [
      sec('forms', 'The shapes of betting and bidding', [
        p('“Betting” covers quite different structures. Knowing the main ones helps you understand a new game fast.'),
        table(
          ['Form', 'How it runs', 'The key judgement'],
          [
            ['Betting round', 'Like poker: in turn, bet, call, raise or fold.', 'How strong my hand is, and how strong theirs looks'],
            ['Open auction', 'The price rises; the last bidder standing takes it.', 'What the item is really worth to me'],
            ['Sealed bid', 'Everyone picks an amount in secret; all are revealed at once.', 'Predicting what the others will spend'],
            ['Bids you always pay', 'Your bid is spent whether you win or lose.', 'Choosing which rounds to win and which to give up'],
            ['Push your luck', 'Try once more, or stop now — greed can lose everything.', 'Weighing what you have against the risk of the next try'],
          ],
        ),
      ]),
      sec('fun', 'Where the fun comes from', [
        p('The fun starts with the fact that **value differs from person to person**. The same lot can be essential to me and a bonus to you, so you weigh “what is it worth to me?” and “what is it worth to them?” at the same time.'),
        p('Then there is the **psychology packed into one number**. Whether your opponent bids 9 or 10 is not settled by arithmetic. They spent big last round — will they save now, or spend again to keep momentum? Naming a number is reading a mind.'),
        p('And because resources are limited, **you cannot win everything**. Choosing where to lose and where to win is the strategy, and it makes every game tell a different story.'),
      ]),
      sec('skills', 'The skills it builds', [
        h3('Valuation'),
        p('Putting a number on how much the current prize helps you win. In a race to five points, when you already have four, the next point is worth far more than the first.'),
        h3('Budgeting'),
        p('Watch remaining rounds and remaining resources together. When spent points vanish, always know how many more rounds you must win and how much you can afford per round.'),
        h3('Avoiding the winner’s curse'),
        p('Auction theory talks about the **winner’s curse**: when everyone is estimating the true value, the highest bidder is likely the one who overestimated most — winning and still losing out. In games too, restraint against getting swept up in a bidding war matters.'),
        h3('Knowing when to stop'),
        p('In push-your-luck games, “just one more” is the most dangerous phrase. Roughly estimating the chance of going over, from the cards left, changes your results.'),
      ]),
      sec('classics', 'Classic examples', [
        table(
          ['Game', 'Form', 'In one line'],
          [
            ['Poker', 'Betting rounds', 'Hand strength and betting — the byword for betting games.'],
            ['Modern Art', 'Several auction types', 'Reiner Knizia’s art-auction game, first published in Germany in 1992; one game alternates open auctions, sealed bids and more.'],
            ['High Society', 'Open auction', 'Also by Knizia: buy luxuries, but whoever has the least money left at the end is eliminated. The tension between spending and saving is the game.'],
          ],
        ),
        note('Where dates disagree', 'Most sources date High Society to 1995 (Ravensburger), but some give 1994.'),
        p('Auction games flourished especially in German-style board games. Players’ differing valuations take over the role dice would play, which makes it easy to design games with little luck that still play differently every time.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**People with a feel for numbers.** Weighing remaining resources against expected gains is most of the game.',
          '**People who like bold calls.** One all-in decision can turn a game around.',
          '**People who read personalities.** Knowing who saves and who splurges makes bidding much easier.',
        ),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('**Black & White II** is a sealed bid: 99 points split over up to nine rounds, and the points you bid are gone whether you win or lose. Budgeting — spending little on rounds you will lose and a lot on rounds you mean to win — is the core. The exact number is hidden; only black (0–9) or white (10+) and a gauge of remaining points show, so deduction joins in.'),
        p('**Point Omok** combines gomoku with bidding. Each round you split 10 fresh points over three spots, and only half of what you do not spend carries over. Saving costs you, but lets you bid big next round, so “spend now or save?” comes up every time.'),
        p('**Hit,Stay** is a five-player push-your-luck game — get your card total close to a limit — with poker-style betting on top; **Indian Poker** and **Two-Sided Poker** are one-on-one games built around betting rounds.'),
        tip('In practice', 'In a bid where spent points vanish, trying to win every round is how you collapse. Decide at the start how many rounds you will win, and plan to bid close to zero on the rest. If your opponent has the same plan, the real fight is reading when they will give up a round.'),
      ]),
    ],
  },
};

export default article;
