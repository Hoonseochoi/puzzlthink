import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'hidden-information',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'cardJanggi', ko: '행마 카드 5장의 순서를 둘이 동시에 몰래 정해요. 상대의 다음 카드를 읽는 장기예요.', en: 'Both players secretly order five move cards at once — a chess game about reading the next card.' },
    { game: 'heavy13', ko: '모두가 카드와 칩을 동시에 비공개로 내요. 남이 무엇을 낼지 읽는 4~7인 눈치 게임이에요.', en: 'Everyone plays a card and a chip face down at once: a 4–7 player game of guessing what others will do.' },
    { game: 'gradation', ko: '숫자 큐브는 숨기고 통의 밝기만 보여 줘요. 밝기가 주는 단서와 그 단서를 이용한 속임수의 게임이에요.', en: 'Numbers stay hidden; only each box’s shade shows — a game of clues and of exploiting them.' },
    { game: 'blackWhite', ko: '타일의 색만 공개되고 숫자는 끝까지 숨겨져요.', en: 'Only a tile’s colour is revealed; the number stays hidden to the end.' },
    { game: 'pointOmok', ko: '건 포인트도 남은 포인트도 상대에게 보이지 않는 오목이에요.', en: 'Gomoku where neither your bids nor your remaining points are visible to your opponent.' },
    { game: 'blindGomoku', ko: '판 위의 돌이 누구 것인지가 숨겨진, 숨은 상태형 게임이에요.', en: 'The hidden information is on the board itself: whose stone is whose.' },
    { game: 'russianRoulette', ko: '비공개 조사로 나만 아는 정보를 만들 수 있고, 남이 무엇을 아는지도 추리해야 해요.', en: 'Private checks give you information only you have — and you must guess what others know.' },
  ],
  related: ['perfect-information', 'bluffing-deduction', 'betting-auction', 'luck-and-skill', 'memory-games'],
  sources: [
    { title: 'L’Attaque', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/L%27Attaque' },
    { title: 'Hermance Edan', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hermance_Edan' },
    { title: 'Stratego history', site: 'UltraBoardGames', url: 'https://ultraboardgames.com/stratego/history.php' },
    { title: 'Perfect information', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Perfect_information' },
    { title: 'Simultaneous game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Simultaneous_game' },
  ],
  ko: {
    meta: {
      title: '숨은 정보 게임 — 보이지 않는 것을 다루는 보드게임의 원리',
      description: '상대 패, 동시에 내는 비공개 선택, 판 위의 뒤집힌 말. 숨은 정보가 게임에 들어가는 방식과 그 안에서 이기는 법(확률로 생각하기, 정보 흘리지 않기), 스트라테고 같은 대표작과 PUZZLTHINK 게임을 정리했어요.',
      keywords: ['숨은 정보 게임', '불완전 정보 게임', '동시 선택 게임', '비공개 게임', '스트라테고', '눈치 게임', '카드 장기'],
    },
    title: '숨은 정보 게임',
    lead: '모든 걸 볼 수 없을 때, 우리는 무엇을 근거로 수를 둘까요?',
    intro: [
      '바둑과 장기에서는 판 위의 모든 것이 두 사람에게 똑같이 보여요. 하지만 세상의 많은 게임은 그렇지 않아요. 상대의 패는 엎어져 있고, 상대가 이번에 무엇을 낼지는 동시에 공개될 때까지 모르고, 판 위의 말조차 뒤집혀 있기도 해요.',
      '이렇게 **누군가에게는 보이고 누군가에게는 보이지 않는 정보**가 있는 게임을 숨은 정보 게임, 또는 불완전 정보 게임이라고 해요. 이 글에서는 정보가 숨겨지는 여러 방식과, 그런 게임에서 생각하는 법을 정리해요.',
    ],
    summary: '모든 걸 볼 수 없는 게임들. 정보가 숨겨지는 여러 방식과, 그 안에서 확률로 생각하고 정보를 지키는 법을 정리했어요.',
    sections: [
      sec('kinds', '정보가 숨겨지는 네 가지 방식', [
        table(
          ['방식', '무엇이 숨겨지나', '예'],
          [
            ['손에 든 정보', '각자 가진 카드나 타일', '포커, 흑과 백'],
            ['동시 선택', '이번 차례에 고른 것. 모두 함께 공개돼요.', '가위바위보, 비공개 입찰, 무거운 13'],
            ['판 위의 숨은 상태', '놓여 있지만 정체가 가려진 말', '스트라테고, 블라인드 오목'],
            ['미리 정한 계획', '앞으로의 순서나 배치를 몰래 정해 둠', '카드 장기의 행마 카드 순서, 그라데이션의 큐브 배치'],
          ],
        ),
        p('여기에 주사위나 셔플 같은 **우연**이 더해지면 또 다른 층이 생겨요. 다만 우연과 숨은 정보는 달라요. 우연은 아무도 모르는 것이고, 숨은 정보는 누군가는 알고 있는 거예요. 누군가 알고 있다는 사실 때문에 그 사람의 행동이 단서가 되고, 그래서 심리전이 생겨요.'),
      ]),
      sec('classic', '숨은 정보의 고전, 스트라테고', [
        p('판 위의 숨은 상태를 대표하는 게임은 **스트라테고**예요. 각자 말의 계급을 자기 쪽으로만 보이게 세워 두고, 부딪힐 때만 서로 공개해서 높은 계급이 이겨요. 상대 깃발을 찾아 잡으면 승리예요.'),
        p('이 게임에는 앞선 형태가 있어요. 프랑스의 에르망스 에당이 고안한 「라타크(L’Attaque)」로, 1909년 프랑스에서 특허가 나왔어요. 스트라테고는 말 몇 종류를 더한 것을 빼면 이 게임과 거의 같은 구조이고, 1946년 네덜란드에서 처음 나왔어요. 모든 걸 보며 두는 체스와 같은 전쟁 테마인데도, 정보를 가리는 것만으로 완전히 다른 게임이 된다는 점이 흥미로워요.'),
      ]),
      sec('think', '숨은 정보 게임에서 생각하는 법', [
        h3('하나의 답 대신 가능성의 분포로'),
        p('완전 정보 게임에서는 “지금 판”이 하나뿐이지만, 숨은 정보 게임에서는 내가 아는 정보와 맞아떨어지는 판이 여러 개예요. 실력 있는 사람은 그중 하나를 찍지 않고, **각 경우가 얼마나 그럴듯한지**를 머릿속에 그려요. “상대가 큰 수를 가졌을 가능성이 60%쯤”처럼요.'),
        h3('행동은 정보다'),
        p('상대가 무엇을 숨겼는지는 몰라도, 상대가 무엇을 **했는지**는 보여요. 크게 걸었는지, 오래 망설였는지, 어떤 색을 먼저 냈는지가 모두 단서예요. 반대로 내 행동도 상대에게 단서가 된다는 걸 잊으면 안 돼요.'),
        h3('어떤 경우에도 나쁘지 않은 수'),
        p('상대의 정체를 모를 때는 한 가지 경우에만 최고인 수보다, **어느 경우든 크게 손해 보지 않는 수**가 더 좋을 때가 많아요. 확실한 정보가 들어오기 전까지 선택지를 넓게 남겨 두는 거예요.'),
        h3('동시 선택에는 정답이 없다'),
        p('가위바위보에는 “늘 이기는 손”이 없어요. 동시에 내는 게임에서는 한 가지 선택을 고집하면 읽히고, 고르게 섞어야 손해를 보지 않아요. 이 성질은 비공개 입찰이나 무거운 13 같은 게임에서도 그대로 나타나요.'),
      ]),
      sec('why', '왜 숨긴 게임이 재미있을까', [
        p('숨은 정보는 게임에 **이야기**를 만들어요. 결과가 공개되는 순간 “아, 그래서 그렇게 뒀구나” 하는 깨달음이 오고, 완전 정보 게임에서는 나오기 어려운 반전이 생겨요.'),
        p('또 실력 차를 적당히 줄여 줘요. 완전 정보 게임에서는 고수가 거의 늘 이기지만, 숨은 정보가 있으면 초보도 좋은 추측 하나로 고수를 이길 수 있어요. 그래도 판을 오래 하면 정보를 잘 다루는 사람이 결국 앞서요.'),
        note('숨은 정보와 컴퓨터', '체스와 바둑처럼 모든 정보가 공개된 게임은 컴퓨터가 오래전부터 사람을 넘어섰어요. 포커처럼 정보가 숨겨진 게임은 확률과 상대 모델링까지 필요해서, 다루는 방식이 꽤 달라요.'),
      ]),
      sec('who', '이런 사람에게 맞아요', [
        ul(
          '**확률적으로 생각하기를 좋아하는 사람.** “아마도”를 숫자로 다루는 감각이 무기가 돼요.',
          '**사람의 행동을 읽는 데 흥미가 있는 사람.** 단서의 대부분은 상대의 선택에서 나와요.',
          '**반전이 있는 판을 좋아하는 사람.** 공개되는 순간마다 판이 새로 보여요.',
        ),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK에는 네 가지 방식이 모두 있어요. **흑과 백**과 **인디언 포커**는 손에 든 정보형, **무거운 13**과 **포인트 오목**은 동시 선택형, **블라인드 오목**은 판 위의 숨은 상태형이에요. **카드 장기**와 **그라데이션**은 미리 정한 계획을 숨기는 게임이라, 처음 정한 순서나 배치가 끝까지 전략 전체를 좌우해요.'),
        tip('숨은 정보 게임 공통 요령', '내가 아는 것, 상대가 아는 것, 둘 다 모르는 것을 매번 나눠서 생각해 보세요. 이 세 칸을 구분하는 습관만 들여도 엉뚱한 블러핑이나 헛된 추리가 크게 줄어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Hidden information games — how games handle what you cannot see',
      description: 'Hidden hands, simultaneous secret choices, face-down pieces on the board: the ways information is hidden in games, how to think in them (in probabilities, without leaking information), classics like Stratego, and PUZZLTHINK games.',
      keywords: ['hidden information games', 'imperfect information games', 'simultaneous choice games', 'Stratego', 'Card Janggi', 'secret bidding'],
    },
    title: 'Hidden information games',
    lead: 'When you cannot see everything, what do you base your move on?',
    intro: [
      'In go and janggi both players see everything. Many games are not like that: hands are face down, you do not know what your opponent will choose until everything is revealed together, and sometimes even pieces on the board are turned over.',
      'Games where **some information is visible to some players and not others** are called hidden information, or imperfect information, games. This article covers the ways information gets hidden and how to think when it is.',
    ],
    summary: 'Games where you cannot see everything: the ways information gets hidden, and how to think in probabilities and protect what you know.',
    sections: [
      sec('kinds', 'Four ways information is hidden', [
        table(
          ['Way', 'What is hidden', 'Examples'],
          [
            ['In hand', 'Each player’s cards or tiles', 'Poker, Black & White'],
            ['Simultaneous choice', 'What you picked this turn; all revealed together', 'Rock-paper-scissors, sealed bids, Heavy 13'],
            ['Hidden state on the board', 'Pieces whose identity is covered', 'Stratego, Blind Gomoku'],
            ['A secret plan', 'An order or arrangement fixed in advance', 'Card Janggi’s card order, Gradation’s cube placement'],
          ],
        ),
        p('Add **chance** — dice, shuffles — and you get another layer. But chance and hidden information differ: chance is what nobody knows; hidden information is what someone knows. Because someone knows, their actions become clues, and that is where mind games come from.'),
      ]),
      sec('classic', 'A classic: Stratego', [
        p('The classic game of hidden pieces is **Stratego**. Each player stands their pieces so only they can see the ranks; ranks are revealed only when pieces clash, and the higher one wins. Capture the enemy flag to win.'),
        p('It has a predecessor: L’Attaque, devised by Hermance Edan of France and patented there in 1909. Stratego is almost the same game apart from a few extra pieces, and was first published in the Netherlands in 1946. It shares chess’s war theme, yet hiding information alone makes it a completely different game.'),
      ]),
      sec('think', 'How to think in a hidden information game', [
        h3('A spread of possibilities, not one answer'),
        p('In a perfect information game there is one position. With hidden information, many positions fit what you know. Strong players do not bet on one; they picture **how likely each is** — “about a 60% chance they hold a high number”.'),
        h3('Actions are information'),
        p('You cannot see what they hid, but you can see what they **did**: a big bet, a long pause, which colour came first. And remember your own actions are clues for them.'),
        h3('Moves that are fine in every case'),
        p('When you do not know what you face, a move that is never badly wrong often beats one that is best in only one case. Keep options open until solid information arrives.'),
        h3('Simultaneous choices have no single right answer'),
        p('Rock-paper-scissors has no always-winning throw. In simultaneous games, sticking to one choice gets you read; mixing evenly keeps you safe. The same holds in sealed bids and in Heavy 13.'),
      ]),
      sec('why', 'Why hiding things is fun', [
        p('Hidden information creates **stories**. When the reveal comes — “so that is why they played that” — you get twists that perfect information games rarely produce.'),
        p('It also narrows skill gaps a little. A strong player almost always wins a perfect information game, but with hidden information a beginner can win with one good guess. Over many games, though, whoever handles information best pulls ahead.'),
        note('Hidden information and computers', 'Computers overtook humans long ago in games where everything is visible, like chess and go. Games with hidden information, like poker, also require probability and modelling the opponent, and are approached quite differently.'),
      ]),
      sec('who', 'Who it suits', [
        ul(
          '**People who like thinking in probabilities.** Turning “probably” into numbers becomes a weapon.',
          '**People interested in reading behaviour.** Most clues come from other players’ choices.',
          '**People who love a twist.** Every reveal shows you the board anew.',
        ),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK has all four kinds. **Black & White** and **Indian Poker** hide information in hand; **Heavy 13** and **Point Omok** use simultaneous choices; **Blind Gomoku** hides state on the board. **Card Janggi** and **Gradation** hide a plan made in advance, so the order or arrangement you choose at the start shapes your whole strategy.'),
        tip('A habit for every hidden information game', 'Each turn, sort things into what you know, what they know and what neither of you knows. That alone cuts down pointless bluffs and wasted deductions.'),
      ]),
    ],
  },
};

export default article;
