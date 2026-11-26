import type { WikiArticle } from './types';
import { terms, tip, sec } from './blocks';

const article: WikiArticle = {
  slug: 'glossary',
  category: 'concept',
  updated: '2026-11-26',
  games: [],
  related: ['perfect-information', 'zero-sum', 'first-move-advantage', 'solved-games', 'luck-and-skill'],
  sources: [
    { title: 'Glossary of game theory', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Glossary_of_game_theory' },
    { title: 'Glossary of board games', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Glossary_of_board_games' },
    { title: 'Glossary of Go terms', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Glossary_of_Go_terms' },
    { title: 'Glossary of chess', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Glossary_of_chess' },
    { title: 'Renju for beginners', site: 'Renju International Federation', url: 'https://www.renju.se/rif/nosovsky/renjuforbeginners.pdf' },
  ],
  ko: {
    meta: {
      title: '보드게임 용어 사전 — 완전 정보, 제로섬, 선수, 복기, 금수, 추크추방까지',
      description: '보드게임과 퍼즐에서 자주 쓰는 용어를 한곳에 모았어요. 게임의 성격을 나타내는 말, 전략 용어, 게임 이론 용어, 바둑·장기·오목 용어, 논리 퍼즐 용어를 쉬운 설명과 함께 정리했어요.',
      keywords: ['보드게임 용어', '게임 용어 정리', '바둑 용어', '오목 용어', '장기 용어', '게임 이론 용어', '퍼즐 용어'],
    },
    title: '보드게임 용어 사전',
    lead: '자주 듣지만 정확한 뜻은 헷갈리는 말들. 보드게임과 퍼즐의 용어를 한곳에 모았어요.',
    intro: [
      '게임 이야기를 하다 보면 “이건 완전 정보 게임이라서”, “여기서 선수를 잡아야”, “쌍삼 금지야?” 같은 말이 자연스럽게 나와요. 이 페이지는 그런 말들을 주제별로 묶어 짧고 정확하게 풀어 둔 용어 사전이에요.',
      '각 용어는 보드게임을 처음 접하는 사람도 이해할 수 있게 설명했고, 더 깊이 다룬 글이 있으면 함께 적어 두었어요.',
    ],
    summary: '완전 정보, 제로섬, 선수, 복기, 금수, 추크추방까지. 보드게임과 퍼즐에서 자주 쓰는 용어를 주제별로 쉽게 풀었어요.',
    sections: [
      sec('nature', '게임의 성격을 나타내는 말', [
        terms(
          ['완전 정보', '자기 차례에 지금까지 일어난 모든 일을 아는 상태. 바둑·장기가 대표적이에요. 「완전 정보와 불완전 정보」 참고.'],
          ['불완전 정보', '결정할 때 모르는 정보가 있는 상태. 상대의 패, 동시에 고른 선택, 뒤집힌 말 같은 것이요.'],
          ['결정적 게임', '운(우연) 요소가 없어서 같은 선택이면 언제나 같은 결과가 나오는 게임.'],
          ['추상 전략 게임', '운도 숨은 정보도 거의 없고, 테마가 규칙에 거의 영향을 주지 않는 전략 게임. 「추상 전략 게임」 참고.'],
          ['제로섬', '한쪽의 이득이 곧 다른 쪽의 손해라서, 결과의 합이 늘 같은 게임. 「제로섬 게임」 참고.'],
          ['협력 게임', '모든 플레이어가 한 팀이 되어 게임 자체와 싸우는 게임. 함께 이기고 함께 져요.'],
          ['반협력 게임', '함께 막아야 할 위협이 있지만, 승자는 한 명인 게임.'],
          ['동시 선택', '모두가 몰래 고른 뒤 한꺼번에 공개하는 방식. 가위바위보가 가장 단순한 예예요.'],
        ),
      ]),
      sec('play', '플레이와 전략 용어', [
        terms(
          ['선공 · 후공', '먼저 두는 쪽과 나중에 두는 쪽. 「선공은 왜 유리할까」 참고.'],
          ['주도권', '상대가 내 수에 답하느라 자기 계획을 미루게 만드는 힘. 체스에서는 템포라고도 해요.'],
          ['선수', '바둑에서, 상대가 반드시 받아야 하는 수. 선수를 쥔 쪽이 다음 수를 고를 자유를 가져요.'],
          ['수읽기', '“내가 여기 두면 상대는?”을 몇 단계까지 따라가 보는 것.'],
          ['형세 판단', '끝까지 읽을 수 없을 때, 지금 누가 유리한지 가늠하는 것.'],
          ['복기', '끝난 판을 처음부터 다시 놓아 보며 잘잘못을 따지는 것. 실력을 올리는 가장 좋은 방법 중 하나예요.'],
          ['양수겸장', '한 수로 두 곳을 동시에 노리는 것. 체스에서는 포크라고 해요.'],
          ['블러핑', '약할 때 강한 척하거나 강할 때 약한 척해서 상대의 판단을 흔드는 것.'],
          ['운 밀어붙이기', '한 번 더 시도할지 지금 멈출지를 고르는 구조. 욕심을 내면 다 잃을 수 있어요.'],
          ['킹메이커', '이길 가능성이 없어진 사람이 남은 사람 중 누가 이길지를 정하게 되는 상황.'],
        ),
      ]),
      sec('theory', '게임 이론 용어', [
        terms(
          ['미니맥스', '상대가 가장 잘 대응했을 때의 결과(최악)를 가장 좋게 만드는 선택 원리.'],
          ['혼합 전략', '여러 선택을 정해진 확률로 섞는 전략. 가위바위보에서 셋을 3분의 1씩 내는 것이 예예요.'],
          ['풀린 게임', '양쪽이 완벽하게 둘 때의 결과가 계산으로 밝혀진 게임. 「풀린 게임」 참고.'],
          ['약한 풀이 · 강한 풀이', '처음 국면에서의 필승(또는 무승부) 전략을 아는 것과, 모든 국면에서의 최선을 아는 것의 차이.'],
          ['전략 훔치기', '후공 필승법이 있다고 가정하면 선공이 그걸 훔쳐 쓸 수 있다는 논증. 헥스의 선공 필승 증명에 쓰여요.'],
          ['파이 규칙', '한 사람이 첫 수를 두면, 다른 사람이 그 수를 가져갈지 정하게 하는 규칙. 첫 수의 이점을 없애요.'],
          ['입력 운 · 출력 운', '결정하기 전에 오는 운(받은 패)과 결정한 뒤에 오는 운(공격 뒤의 주사위).'],
        ),
      ]),
      sec('classic', '바둑·장기·오목 용어', [
        terms(
          ['활로', '바둑에서 돌이나 돌 덩어리와 맞닿은 빈 점. 모두 막히면 따내져요.'],
          ['패', '바둑에서 서로 한 점씩 번갈아 따낼 수 있는 모양. 무한 반복을 막는 규칙이 있어요.'],
          ['덤', '바둑에서 먼저 두는 흑의 이점을 메우려고 백에게 주는 점수. 한국·일본 6.5집, 중국 7.5점이에요.'],
          ['궁', '장기·샹치에서 장수가 벗어날 수 없는 구역. 대각선이 그어져 있어요.'],
          ['빅장', '장기에서 두 장수가 가로막는 말 없이 마주 보는 상황. 처리 방식은 규칙마다 달라요.'],
          ['외통', '왕이 공격받고 있는데 피할 수도, 막을 수도 없는 상태. 체스의 체크메이트와 같아요.'],
          ['추크추방', '두지 않을 수 있으면 좋겠는데 반드시 둬야 해서 불리해지는 상황. 독일어에서 온 체스 용어예요.'],
          ['사 · 열린 삼', '오목에서 한 수면 5목이 되는 모양(사)과, 양쪽이 비어 있어 막을 수 없는 사가 될 수 있는 삼(열린 삼).'],
          ['쌍삼 · 쌍사', '한 수로 열린 삼 두 개, 또는 사 두 개를 동시에 만드는 수. 렌주에서는 흑에게 금지예요.'],
          ['금수', '규칙상 둘 수 없는 수. 렌주에서는 흑의 쌍삼·쌍사·장목이 금수예요.'],
          ['장목', '여섯 개 이상이 한 줄로 이어진 것. 정확히 5목만 인정하는 규칙에서는 이기지 못해요.'],
          ['밀', '나인 멘스 모리스에서 내 말 세 개가 한 줄로 선 것. 밀을 만들면 상대 말 하나를 잡아요.'],
        ),
      ]),
      sec('puzzle', '논리 퍼즐 용어', [
        terms(
          ['펜슬 퍼즐', '종이와 연필만으로 풀 수 있는 논리 퍼즐을 묶어 부르는 말. 스도쿠·노노그램·슬리더링크 등.'],
          ['유일해', '정답이 딱 하나뿐이라는 성질. 좋은 논리 퍼즐의 기본 조건이에요.'],
          ['소거법', '“여기는 절대 아니다”를 먼저 지워 남은 곳을 확정하는 방법.'],
          ['후보 숫자', '스도쿠에서 한 칸에 들어갈 수 있는 숫자들을 작게 적어 둔 것.'],
          ['가정법', '“여기가 칠해졌다고 치면?”을 따라가 모순이 나오면 반대를 확정하는 방법. 찍기와는 달라요.'],
          ['라틴 방진', '가로·세로에 같은 기호가 겹치지 않게 채운 정사각형 배열. 완성된 스도쿠는 라틴 방진의 한 종류예요.'],
          ['마방진', '가로·세로·대각선의 합이 모두 같은 숫자 배열. 「숫자 퍼즐」 참고.'],
        ),
        tip('더 깊이 읽고 싶다면', '용어 옆에 적힌 글에서 각 개념을 예시와 함께 자세히 다뤄요. 보드게임 백과 첫 화면에서 장르·계보·개념별로 모든 글을 볼 수 있어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Board game glossary — perfect information, zero-sum, sente, renju, zugzwang and more',
      description: 'Common board game and puzzle terms in one place: words for kinds of games, strategy terms, game theory terms, go, janggi and gomoku terms, and logic puzzle terms, each explained simply.',
      keywords: ['board game glossary', 'game terms', 'go terms', 'gomoku terms', 'chess terms', 'game theory terms', 'puzzle terms'],
    },
    title: 'Board game glossary',
    lead: 'Words you hear often but whose exact meaning is easy to mix up — board game and puzzle terms in one place.',
    intro: [
      'Talk about games long enough and phrases like “it’s a perfect information game”, “take sente here” or “are double threes banned?” come up. This page groups such terms by topic and explains them briefly and precisely.',
      'Each entry is written so newcomers can follow it, with a pointer to the article that goes deeper where there is one.',
    ],
    summary: 'Perfect information, zero-sum, sente, review, forbidden moves, zugzwang — common board game and puzzle terms, explained simply by topic.',
    sections: [
      sec('nature', 'Words for kinds of games', [
        terms(
          ['Perfect information', 'On your turn you know everything that has happened so far. Go and janggi are classic examples. See “Perfect and imperfect information”.'],
          ['Imperfect information', 'Something is unknown when you decide: an opponent’s hand, a simultaneous choice, a face-down piece.'],
          ['Deterministic game', 'A game without chance, where the same choices always produce the same result.'],
          ['Abstract strategy game', 'A strategy game with little or no luck or hidden information, whose theme barely affects the rules. See “Abstract strategy games”.'],
          ['Zero-sum', 'One side’s gain is the other’s loss, so results always add up to the same total. See “Zero-sum games”.'],
          ['Cooperative game', 'All players form one team against the game itself; you win and lose together.'],
          ['Semi-cooperative game', 'There is a threat to stop together, but only one player wins.'],
          ['Simultaneous choice', 'Everyone chooses in secret and all choices are revealed together. Rock-paper-scissors is the simplest case.'],
        ),
      ]),
      sec('play', 'Play and strategy terms', [
        terms(
          ['First player / second player', 'Who moves first and who moves second. See “Why does moving first help?”.'],
          ['Initiative', 'Forcing your opponent to answer your moves and postpone their plans. Chess players also call it tempo.'],
          ['Sente', 'In go, a move your opponent must answer. Whoever holds sente chooses where to play next.'],
          ['Reading', 'Following “if I play here, then what?” several steps ahead.'],
          ['Positional judgement', 'Estimating who is better when you cannot read to the end.'],
          ['Review', 'Replaying a finished game from the start to find good and bad moves — one of the best ways to improve.'],
          ['Fork', 'One move that attacks two targets at once (called 양수겸장 in janggi).'],
          ['Bluff', 'Acting strong when weak, or weak when strong, to shake your opponent’s judgement.'],
          ['Push your luck', 'Choosing whether to try once more or stop now; greed can lose everything.'],
          ['Kingmaker', 'A player who can no longer win ends up deciding which of the others does.'],
        ),
      ]),
      sec('theory', 'Game theory terms', [
        terms(
          ['Minimax', 'Choosing to make the worst case — your opponent’s best reply — as good as possible.'],
          ['Mixed strategy', 'Mixing choices with set probabilities, like throwing each option a third of the time in rock-paper-scissors.'],
          ['Solved game', 'A game whose result under perfect play has been determined by calculation. See “Solved games”.'],
          ['Weak / strong solution', 'Knowing a winning (or drawing) strategy from the start, versus knowing the best move from every position.'],
          ['Strategy stealing', 'The argument that if the second player had a winning strategy, the first could steal it; used to prove Hex is a first-player win.'],
          ['Pie rule', 'One player makes the first move and the other chooses whether to take it — removing the first-move edge.'],
          ['Input / output randomness', 'Luck that comes before you decide (your dealt hand) versus after (the die roll after an attack).'],
        ),
      ]),
      sec('classic', 'Go, janggi and gomoku terms', [
        terms(
          ['Liberty', 'In go, an empty point adjacent to a stone or group. When all are filled, it is captured.'],
          ['Ko', 'In go, a shape where both sides could recapture one stone back and forth; a rule prevents endless repetition.'],
          ['Komi', 'Points given to White in go to offset Black’s first move: 6.5 in Korea and Japan, 7.5 in China.'],
          ['Palace', 'In janggi and xiangqi, the area the general cannot leave, marked with diagonals.'],
          ['Bikjang', 'In janggi, the two generals facing each other with nothing between them; how it is resolved varies by rules.'],
          ['Checkmate', 'The king is attacked and can neither escape nor be shielded (외통 in janggi).'],
          ['Zugzwang', 'You would rather pass, but must move, and moving makes it worse. A chess term from German.'],
          ['Four / open three', 'In gomoku, a shape one move from five, and a three with both ends open that can become an unstoppable four.'],
          ['Double three / double four', 'One move making two open threes, or two fours, at once. Forbidden for Black in renju.'],
          ['Forbidden move', 'A move the rules do not allow. In renju, Black’s double threes, double fours and overlines.'],
          ['Overline', 'Six or more in a row. Under exactly-five rules it does not win.'],
          ['Mill', 'In nine men’s morris, three of your pieces in a line; forming one captures an enemy piece.'],
        ),
      ]),
      sec('puzzle', 'Logic puzzle terms', [
        terms(
          ['Pencil puzzle', 'Logic puzzles you can solve with only paper and pencil: sudoku, nonograms, slitherlink and more.'],
          ['Unique solution', 'Having exactly one answer — the basic requirement of a good logic puzzle.'],
          ['Elimination', 'Crossing out what cannot be first, so what remains is settled.'],
          ['Candidates', 'In sudoku, the digits that could still go in a cell, pencilled in small.'],
          ['Assumption (trial)', 'Following “suppose this cell is filled” until a contradiction proves the opposite. Not the same as guessing.'],
          ['Latin square', 'A square where no symbol repeats in any row or column. A completed sudoku is a kind of Latin square.'],
          ['Magic square', 'An arrangement of numbers whose rows, columns and diagonals share one sum. See “Number puzzles”.'],
        ),
        tip('To read further', 'The articles named beside the terms cover each idea with examples. The encyclopedia’s front page lists every article by genre, lineage and concept.'),
      ]),
    ],
  },
};

export default article;
