import type { WikiArticle } from './types';
import { p, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'perfect-information',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'wallgo', ko: '완전 정보·운 없음. 같은 판이면 언제나 같은 결과가 나오는 게임이에요.', en: 'Perfect information, no chance: the same position always leads to the same result.' },
    { game: 'janggi', ko: '잡은 말까지 모두 공개되는 완전 정보 게임이에요.', en: 'Perfect information — even captured pieces in hand are visible.' },
    { game: 'merge2048', ko: '판은 다 보이지만 새 블록 위치가 무작위예요. 완전 정보에 운이 더해진 경우예요.', en: 'Everything is visible, but new tiles appear at random: perfect information plus chance.' },
    { game: 'cardJanggi', ko: '판은 다 보이지만 상대의 카드 순서가 숨겨진 불완전 정보 게임이에요.', en: 'The board is visible but the opponent’s card order is hidden: imperfect information.' },
    { game: 'indianPoker', ko: '내 카드만 안 보이는, 불완전 정보에 운까지 섞인 게임이에요.', en: 'Only your own card is hidden — imperfect information with chance.' },
  ],
  related: ['hidden-information', 'solved-games', 'zero-sum', 'luck-and-skill', 'abstract-strategy'],
  sources: [
    { title: 'Perfect information', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Perfect_information' },
    { title: 'Complete information', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Complete_information' },
    { title: 'Zermelo’s theorem (game theory)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Zermelo%27s_theorem_(game_theory)' },
    { title: 'Game theory', site: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/game-theory/' },
    { title: 'Playing games with algorithms: algorithmic combinatorial game theory', site: 'arXiv', url: 'https://arxiv.org/pdf/cs/0106019' },
  ],
  ko: {
    meta: {
      title: '완전 정보 게임과 불완전 정보 게임 — 차이, 예시, 운과의 관계',
      description: '바둑과 장기는 완전 정보, 포커는 불완전 정보. 그럼 주사위를 쓰는 게임은? 완전 정보와 불완전 정보의 정확한 뜻, 운(우연)과의 차이, 네 칸으로 나누는 게임 분류, 체르멜로 정리, PUZZLTHINK 게임 분류까지 정리했어요.',
      keywords: ['완전 정보 게임', '불완전 정보 게임', '완전 정보 뜻', '게임 이론 정보', '체르멜로 정리', '포커 불완전 정보', '바둑 완전 정보'],
    },
    title: '완전 정보와 불완전 정보',
    lead: '판 위에서 모든 것이 보이나요? 이 질문 하나로 게임의 성격이 크게 갈려요.',
    intro: [
      '게임을 분류할 때 가장 먼저 꺼내는 질문 중 하나가 “모든 정보가 공개되어 있나?”예요. 바둑과 장기처럼 두 사람이 똑같은 것을 보는 게임을 **완전 정보 게임**, 포커처럼 누군가에게만 보이는 정보가 있는 게임을 **불완전 정보 게임**이라고 불러요.',
      '간단해 보이지만 헷갈리기 쉬운 지점이 있어요. 주사위를 굴리는 게임은 어느 쪽일까요? 이 글에서는 두 개념을 정확히 정리하고, 운과의 관계, 그리고 이 구분이 게임을 이해하는 데 왜 쓸모 있는지 살펴봐요.',
    ],
    summary: '모든 것이 보이는 게임과 일부가 숨겨진 게임. 정확한 뜻, 운(우연)과의 차이, 네 칸 분류와 체르멜로 정리까지 정리했어요.',
    sections: [
      sec('define', '정확한 뜻', [
        p('게임 이론에서 **완전 정보**란, 자기 차례가 왔을 때 **지금까지 일어난 모든 일을 알고 있는 상태**를 말해요. 바둑에서는 판 위의 돌과 지금까지의 수순이 모두 보이니까 완전 정보예요.'),
        p('반대로 **불완전 정보**는 어떤 결정을 내릴 때 모르는 사실이 있는 상태예요. 상대의 패, 동시에 고른 상대의 선택, 뒤집힌 말의 정체 같은 것들이요.'),
        note('비슷한 말: 완비 정보', '게임 이론에는 “완비 정보(complete information)”라는 비슷한 말도 있어요. 이건 게임의 규칙과 각자의 보상(무엇을 얻으면 이기는지)을 모두가 아는지를 뜻해요. 보드게임에서는 대부분 규칙이 공개돼 있어서, 주로 문제가 되는 건 “완전 정보”쪽이에요.'),
      ]),
      sec('chance', '주사위는 정보를 숨길까', [
        p('헷갈리기 쉬운 부분이에요. 주사위를 굴리는 게임은 결과를 미리 알 수 없지만, **주사위가 굴려진 뒤에는 모두가 결과를 똑같이 봐요.** 아무도 숨기고 있지 않죠. 그래서 게임 이론에서는 주사위가 있어도 모든 결과가 공개된다면 완전 정보 게임으로 분류할 수 있어요. 백개먼이 대표적인 예예요.'),
        p('즉 “운(우연)”과 “숨은 정보”는 서로 다른 축이에요. 이 두 축을 합치면 게임을 네 칸으로 나눌 수 있어요.'),
        table(
          ['', '운 없음', '운 있음'],
          [
            ['완전 정보', '바둑, 체스, 장기, 오목', '백개먼, 2048'],
            ['불완전 정보', '스트라테고, 동시 선택 게임', '포커, 대부분의 카드 게임'],
          ],
          '스트라테고는 처음 배치 이후 운 요소가 없지만, 말의 정체가 숨겨져 있어요.',
        ),
      ]),
      sec('zermelo', '완전 정보 게임에는 “정답”이 있다', [
        p('완전 정보이고 운이 없는 두 사람 게임에는 아주 강력한 성질이 있어요. 1913년 수학자 에른스트 체르멜로가 체스를 두고 보인 결과를 일반화하면 이렇게 말할 수 있어요. **유한한 수 안에 끝나는 이런 게임은, 양쪽이 완벽하게 둘 때 결과가 셋 중 하나로 정해져 있다.** 선공이 반드시 이기거나, 후공이 반드시 이기거나, 반드시 비기거나요.'),
        p('그런데 이 정리는 “셋 중 무엇인지”는 알려 주지 않아요. 체스는 이 정리에 해당하지만, 경우의 수가 너무 많아서 셋 중 어느 쪽인지 아직 아무도 몰라요. 반대로 틱택토나 나인 멘스 모리스처럼 실제로 계산이 끝난 게임도 있어요. 이런 게임들을 「풀린 게임」에서 자세히 다뤄요.'),
        p('불완전 정보 게임에는 이런 단순한 정답이 없어요. 가위바위보에서 “늘 이기는 손”이 없는 것처럼, 최선의 전략이 여러 선택을 **확률적으로 섞는 것**이 되는 경우가 많아요.'),
      ]),
      sec('feel', '플레이할 때 무엇이 달라지나', [
        table(
          ['', '완전 정보 게임', '불완전 정보 게임'],
          [
            ['주로 하는 생각', '“이렇게 두면 어떻게 될까” (수읽기)', '“상대가 무엇을 가졌을까” (추측)'],
            ['실력과 결과', '실력 차가 결과에 거의 그대로 드러나요.', '한 판은 추측이 빗나가 질 수 있어요.'],
            ['복기', '어디가 실수였는지 정확히 짚을 수 있어요.', '“그때는 좋은 선택이었는데 결과가 나빴다”가 가능해요.'],
            ['심리전', '수 자체로 하는 심리전', '행동과 신호로 하는 심리전'],
          ],
        ),
        tip('불완전 정보 게임의 복기법', '불완전 정보 게임에서는 결과로 판단하지 말고, 그 순간 알고 있던 정보로 판단하세요. “그때 알던 것으로 다시 고른다면?”이 좋은 복기 질문이에요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK 게임 나눠 보기', [
        table(
          ['', '운 없음', '운 있음'],
          [
            ['완전 정보', '벽바둑, 벽바둑 II, 십이장기, 러시아장기, 레이저 장기, 나인 멘스 모리스, 뒤집기 오목, 모노레일, 논리 퍼즐 전부', '2048'],
            ['불완전 정보', '카드 장기, 블라인드 오목, 흑과 백, 흑과 백 II, 그라데이션, 포인트 오목, 무거운 13', '인디언 포커, 양면포커, Hit,Stay, 러시안 룰렛'],
          ],
          '혼자 하는 논리 퍼즐은 상대가 없지만, 모든 단서가 공개돼 있고 운이 없어서 완전 정보 쪽에 넣었어요.',
        ),
        p('표를 보면 PUZZLTHINK 게임이 네 칸에 고르게 퍼져 있다는 걸 알 수 있어요. 수읽기를 연습하고 싶다면 왼쪽 위 칸에서, 상대를 읽는 연습을 하고 싶다면 아래 칸에서 골라 보세요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Perfect and imperfect information games — meaning, examples and chance',
      description: 'Go and chess have perfect information; poker does not. What about dice games? The exact meaning of perfect and imperfect information, how it differs from chance, a four-way classification, Zermelo’s theorem, and PUZZLTHINK games sorted.',
      keywords: ['perfect information game', 'imperfect information game', 'perfect information meaning', 'game theory information', 'Zermelo theorem', 'poker imperfect information'],
    },
    title: 'Perfect and imperfect information',
    lead: 'Can you see everything on the table? That one question divides games sharply.',
    intro: [
      'One of the first questions when classifying games is whether all information is public. Games like go and janggi, where both players see the same thing, are **perfect information games**; games like poker, where some information is visible only to someone, are **imperfect information games**.',
      'It sounds simple, but there is a common trap: which side do dice games fall on? This article pins down both ideas, their relation to chance, and why the distinction is useful for understanding games.',
    ],
    summary: 'Games where everything is visible versus games where something is hidden: the exact meaning, the difference from chance, a four-way classification and Zermelo’s theorem.',
    sections: [
      sec('define', 'The exact meaning', [
        p('In game theory, **perfect information** means that when it is your turn, **you know everything that has happened so far**. In go, every stone and every move made so far is visible, so it has perfect information.'),
        p('**Imperfect information** means there is something you do not know when deciding: an opponent’s hand, a choice they made at the same time, the identity of a face-down piece.'),
        note('A similar term: complete information', 'Game theory also uses “complete information”, which means everyone knows the rules and each player’s payoffs. In board games the rules are almost always public, so “perfect information” is usually the issue.'),
      ]),
      sec('chance', 'Do dice hide information?', [
        p('This is the confusing part. You cannot know a die roll in advance, but **once it is rolled, everyone sees the same result**. Nobody is hiding anything. So in game theory a game with dice can still be classed as perfect information if every outcome is public — backgammon is the classic example.'),
        p('In other words, chance and hidden information are separate axes. Combine them and games fall into four boxes.'),
        table(
          ['', 'No chance', 'Chance'],
          [
            ['Perfect information', 'Go, chess, janggi, gomoku', 'Backgammon, 2048'],
            ['Imperfect information', 'Stratego, simultaneous-choice games', 'Poker, most card games'],
          ],
          'Stratego has no chance after the initial setup, but the identity of pieces is hidden.',
        ),
      ]),
      sec('zermelo', 'Perfect information games have an “answer”', [
        p('Two-player games with perfect information and no chance have a powerful property. Generalising what the mathematician Ernst Zermelo showed about chess in 1913: **if such a game always ends in finitely many moves, then with perfect play its result is fixed as one of three** — the first player wins, the second player wins, or it is a draw.'),
        p('But the theorem does not say which of the three. Chess satisfies it, yet there are so many possibilities that nobody knows which outcome is right. Other games, like tic-tac-toe or nine men’s morris, have actually been calculated; see “Solved games”.'),
        p('Imperfect information games have no such simple answer. Just as rock-paper-scissors has no always-winning throw, the best strategy often means **mixing choices with certain probabilities**.'),
      ]),
      sec('feel', 'What changes when you play', [
        table(
          ['', 'Perfect information', 'Imperfect information'],
          [
            ['Main thought', '“What happens if I play this?” (reading)', '“What do they have?” (guessing)'],
            ['Skill and results', 'Skill differences show almost directly.', 'You can lose a game to a wrong guess.'],
            ['Review', 'You can point to the exact mistake.', '“Good decision, bad outcome” is possible.'],
            ['Mind games', 'Played through the moves themselves', 'Played through actions and signals'],
          ],
        ),
        tip('Reviewing imperfect information games', 'Judge decisions by what you knew at the time, not by how they turned out. “Knowing only what I knew then, would I choose the same?” is a good review question.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK games, sorted', [
        table(
          ['', 'No chance', 'Chance'],
          [
            ['Perfect information', 'Wallgo, Wallgo II, 12 Janggi, Russian Janggi, Laser Janggi, Nine Men’s Morris, Flip Omok, Monorail, all logic puzzles', '2048'],
            ['Imperfect information', 'Card Janggi, Blind Gomoku, Black & White, Black & White II, Gradation, Point Omok, Heavy 13', 'Indian Poker, Two-Sided Poker, Hit,Stay, Russian Roulette'],
          ],
          'Solo logic puzzles have no opponent, but all clues are public and there is no chance, so they sit in the perfect information box.',
        ),
        p('PUZZLTHINK’s games spread across all four boxes. To practise reading ahead, pick from the top left; to practise reading opponents, pick from the bottom row.'),
      ]),
    ],
  },
};

export default article;
