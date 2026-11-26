import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'length-and-player-count',
  category: 'concept',
  updated: '2026-11-26',
  games: [
    { game: 'russianJanggi', ko: '턴당 10초, 몇 분이면 끝나는 2인 게임. 짧은 게임의 긴장감을 느끼기 좋아요.', en: 'Ten seconds a turn, done in minutes — a good taste of short-game tension.' },
    { game: 'blackWhite', ko: '한 판 3~5분, 최대 9라운드. 짧지만 라운드마다 결정이 무거워요.', en: '3–5 minutes, at most nine rounds: short, but every round weighs.' },
    { game: 'heavy13', ko: '4~7명이 14라운드를 함께해요. 인원에 따라 판의 성격이 크게 달라져요.', en: '4–7 players over 14 rounds; the game changes a lot with the head count.' },
    { game: 'russianRoulette', ko: '6명 게임이지만 빈자리는 AI가 채워서 혼자서도 시작할 수 있어요.', en: 'A six-player game whose empty seats AI fills, so you can start alone.' },
    { game: 'slitherlink', ko: '혼자 하는 퍼즐. 크기에 따라 5분에서 40분까지 길이를 고를 수 있어요.', en: 'A solo puzzle whose length you choose by size, from 5 to 40 minutes.' },
  ],
  related: ['what-to-play', 'party-games', 'cooperative-vs-competitive', 'zero-sum', 'luck-and-skill'],
  sources: [
    { title: 'Player elimination', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Player_elimination' },
    { title: 'Kingmaker scenario', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kingmaker_scenario' },
    { title: 'Simultaneous game', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Simultaneous_game' },
    { title: 'PUZZLTHINK 게임 소개 (각 게임의 인원·시간)', site: 'PUZZLTHINK', url: 'https://www.puzzlthink.com/ko/games' },
  ],
  ko: {
    meta: {
      title: '게임 길이와 인원 — 몇 명이, 얼마나 할 때 가장 재미있을까',
      description: '같은 게임도 2명과 6명, 5분과 1시간이 전혀 다른 경험이에요. 인원이 바꾸는 것(견제·대기 시간·혼란), 길이가 바꾸는 것(집중·역전·운의 비중), 탈락과 대기 시간 문제, PUZZLTHINK 게임별 인원과 시간까지 정리했어요.',
      keywords: ['보드게임 인원', '게임 시간', '2인 게임', '다인 게임', '짧은 보드게임', '혼자 하는 게임', '몇 명이 하는 게임'],
    },
    title: '게임 길이와 인원',
    lead: '같은 규칙이라도 몇 명이, 얼마나 오래 하느냐에 따라 전혀 다른 게임이 돼요.',
    intro: [
      '보드게임 상자에는 거의 늘 두 가지 숫자가 적혀 있어요. “2~4인”, “30분”. 별것 아닌 정보 같지만, 이 두 숫자는 게임의 성격을 크게 좌우해요. 둘이 하는 5분짜리 게임과 여섯이 하는 한 시간짜리 게임은 같은 규칙을 써도 완전히 다른 경험이에요.',
      '이 글에서는 인원과 길이가 게임의 무엇을 바꾸는지, 그리고 좋은 게임들이 이 두 숫자를 어떻게 다루는지 정리해요. 마지막에는 PUZZLTHINK 게임들의 인원과 시간을 한눈에 볼 수 있게 표로 모았어요.',
    ],
    summary: '같은 규칙도 몇 명이, 얼마나 오래 하느냐에 따라 전혀 다른 게임이 돼요. 인원과 길이가 바꾸는 것과 PUZZLTHINK 게임별 인원·시간을 정리했어요.',
    sections: [
      sec('players', '인원이 바꾸는 것', [
        h3('혼자: 나와의 싸움'),
        p('혼자 하는 게임은 대부분 퍼즐이에요. 상대가 없으니 속도와 리듬을 온전히 내가 정해요. 대신 동기를 스스로 만들어야 해서, 기록이나 랭킹 같은 장치가 중요해져요.'),
        h3('둘: 가장 순수한 대결'),
        p('두 사람 게임은 한쪽의 이득이 곧 다른 쪽의 손해인 경우가 많아서, 수 하나하나가 정면으로 부딪쳐요. 견제나 동맹 같은 정치가 없어서, 실력이 결과에 가장 직접적으로 드러나요.'),
        h3('셋 이상: 정치가 시작돼요'),
        p('셋부터는 “누구를 견제할까”가 생겨요. 앞서는 사람을 나머지가 막고, 일시적인 동맹이 생겼다 사라져요. 이길 가능성이 없어진 사람이 남은 사람 중 누가 이길지를 정해 버리는 **킹메이커** 문제도 이때 나타나요.'),
        h3('많을수록: 혼란과 웃음'),
        p('다섯, 여섯을 넘어가면 모든 걸 계산하기 어려워지고, 판이 예측할 수 없게 흘러가요. 진지한 수읽기보다 눈치와 분위기가 중요해지는 이유예요. 파티 게임이 많은 인원에서 빛나는 것도 이 때문이에요.'),
      ]),
      sec('length', '길이가 바꾸는 것', [
        table(
          ['', '짧은 게임 (5분 안팎)', '긴 게임 (30분 이상)'],
          [
            ['집중', '처음부터 끝까지 날카롭게', '흐름을 길게 운영'],
            ['한 수의 무게', '한 번의 실수가 곧 패배', '실수를 만회할 시간이 있음'],
            ['운의 비중', '한 판으로 보면 커요. 여러 판을 하면 줄어요.', '판 안에서 운이 서로 상쇄돼요.'],
            ['역전', '마지막 몇 수에 몰려 있어요.', '중반의 큰 흐름에서 나와요.'],
            ['다시 하기', '“한 판 더”가 쉬워요.', '한 판의 만족감이 커요.'],
          ],
        ),
        p('짧은 게임 여러 판과 긴 게임 한 판은 비슷한 시간이 걸려도 느낌이 달라요. 짧은 게임은 여러 판을 하며 실력을 평균으로 보여 주고, 긴 게임은 한 판 안에서 계획과 운영을 보여 줘요. 그래서 많은 짧은 게임이 “3판 2선승” 같은 다판 승부를 써요.'),
      ]),
      sec('problems', '여럿이 할 때의 두 가지 골칫거리', [
        h3('기다리는 시간'),
        p('차례가 한 명씩 돌아가는 게임에서 인원이 늘면 내 차례를 기다리는 시간도 늘어요. 그래서 다인 게임은 **동시에 고르기**, 짧은 제한 시간, 남의 차례에도 할 일이 있는 구조 같은 장치를 써요. 온라인 게임에서는 차례마다 제한 시간을 두고, 시간이 지나면 자동으로 진행하는 방식이 흔해요.'),
        h3('일찍 탈락하기'),
        p('누군가 일찍 탈락하면 그 사람은 끝날 때까지 구경만 해야 해요. 탈락이 있는 게임은 판을 짧게 하거나, 탈락이 끝 무렵에 몰리도록 설계해서 이 문제를 줄여요.'),
        note('인원이 모자랄 때', '온라인 게임은 빈자리를 AI가 채울 수 있다는 장점이 있어요. 원래 6명이 해야 하는 게임도 혼자 시작해서 규칙을 익힐 수 있어요.'),
      ]),
      sec('table', 'PUZZLTHINK 게임별 인원과 시간', [
        table(
          ['게임', '인원', '한 판 길이'],
          [
            ['스도쿠', '1명', '시간 제한 없음, 풀이 시간 기록'],
            ['노노그램, 슬리더링크, 마슈', '1명 (친구 대결 2~4명)', '크기에 따라 몇 분~수십 분'],
            ['스타배틀, 비나이로, 한붓길, 컬러 잇기, 마방진 스왑', '1명 (친구 대결 최대 4~6명)', '1~5분'],
            ['2048', '1명 (친구전 2~4명)', '막힐 때까지, 친구전 5분·10분'],
            ['흑과 백, 러시아장기', '2명', '몇 분 안팎'],
            ['흑과 백 II, 양면포커, 인디언 포커', '2명', '5~10분 안팎'],
            ['벽바둑, 벽바둑 II', '2~3명', '턴당 90초, 판에 따라 다름'],
            ['모노레일', '2명', '5~15분'],
            ['돼지 저금통', '4명 (나 + AI 3명)', '5~10분'],
            ['4인 3목', '4명', '4라운드'],
            ['Hit,Stay', '5명 (빈자리 AI)', '칩이 남은 사람이 1명이 될 때까지'],
            ['러시안 룰렛', '6명 (빈자리 AI)', '격발까지 한 판'],
            ['무거운 13', '4~7명', '14라운드'],
          ],
          '시간은 각 게임 페이지에 안내된 기준이에요. 친구전은 방에서 정한 제한 시간에 따라 달라져요.',
        ),
      ]),
      sec('choose', '나에게 맞는 숫자 고르기', [
        ul(
          '**쉬는 시간 5분**: 1~5분짜리 퍼즐이나 2인 미니 게임',
          '**둘이서 진지하게**: 벽바둑, 십이장기, 나인 멘스 모리스 같은 2인 전략 게임',
          '**셋 이상 모였을 때**: 동시에 고르는 게임이나 빈자리를 AI가 채우는 다인 게임',
          '**혼자 길게 몰입**: 큰 크기의 슬리더링크나 노노그램',
        ),
        tip('상황별 추천', '구체적인 추천은 「지금 뭐 하지? 상황별 게임 고르기」에서 “둘이서 5분”, “혼자 머리 쓰기”, “여럿이 심리전”으로 나눠 정리했어요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Game length and player count — how many, and for how long, is most fun?',
      description: 'The same game is a different experience with two players or six, in five minutes or an hour. What player count changes (politics, waiting, chaos), what length changes (focus, comebacks, luck), elimination and downtime, and PUZZLTHINK games by players and time.',
      keywords: ['board game player count', 'game length', 'two player games', 'multiplayer games', 'short board games', 'solo games'],
    },
    title: 'Game length and player count',
    lead: 'With the same rules, how many play and for how long can make a completely different game.',
    intro: [
      'Board game boxes almost always carry two numbers: “2–4 players”, “30 minutes”. They look like small print, but they shape a game’s character. A five-minute game for two and an hour-long game for six are different experiences even with the same rules.',
      'This article covers what player count and length change, and how good games handle both. At the end, PUZZLTHINK games are collected in one table by players and time.',
    ],
    summary: 'The same rules play differently by head count and length. What both numbers change, and PUZZLTHINK games by players and time.',
    sections: [
      sec('players', 'What player count changes', [
        h3('Solo: a contest with yourself'),
        p('Solo games are mostly puzzles. With no opponent you set the pace entirely, but you must supply your own motivation, so records and rankings matter.'),
        h3('Two: the purest contest'),
        p('In two-player games one side’s gain is usually the other’s loss, so every move collides head-on. With no politics, skill shows in the result most directly.'),
        h3('Three or more: politics begins'),
        p('From three players on, “whom do I hold back?” appears. The others block the leader; temporary alliances form and dissolve. The **kingmaker** problem — a player who cannot win deciding who does — appears here too.'),
        h3('Many: chaos and laughter'),
        p('Past five or six, calculating everything becomes hard and games turn unpredictable. Reading people and the mood starts to matter more than deep calculation, which is why party games shine with big groups.'),
      ]),
      sec('length', 'What length changes', [
        table(
          ['', 'Short (around 5 minutes)', 'Long (30+ minutes)'],
          [
            ['Focus', 'Sharp from start to finish', 'Managing a long arc'],
            ['Weight of a move', 'One mistake can lose', 'Time to recover'],
            ['Share of luck', 'Large in a single game, smaller over many', 'Evens out within the game'],
            ['Comebacks', 'Packed into the last few moves', 'Come from big midgame swings'],
            ['Replay', '“One more” is easy', 'One game is deeply satisfying'],
          ],
        ),
        p('Several short games and one long game may take similar time but feel different. Short games show skill as an average across games; long games show planning and management within one. That is why many short games use matches like best of three.'),
      ]),
      sec('problems', 'Two headaches of group play', [
        h3('Waiting'),
        p('When turns go one at a time, more players means more waiting. So multiplayer games use **simultaneous choices**, short time limits or something to do on others’ turns. Online, a time limit per turn with automatic play when it runs out is common.'),
        h3('Early elimination'),
        p('A player knocked out early watches until the end. Games with elimination reduce this by keeping games short or pushing eliminations toward the end.'),
        note('When you are short of players', 'Online games have the advantage that AI can fill empty seats, so you can learn a six-player game by starting alone.'),
      ]),
      sec('table', 'PUZZLTHINK games by players and time', [
        table(
          ['Game', 'Players', 'Length'],
          [
            ['Sudoku', '1', 'No time limit; solve time is recorded'],
            ['Nonogram, Slitherlink, Masyu', '1 (friend duels 2–4)', 'Minutes to tens of minutes, by size'],
            ['Star Battle, Binairo, One Stroke, Color Link, Magic Square Swap', '1 (friend duels up to 4–6)', '1–5 minutes'],
            ['2048', '1 (friend mode 2–4)', 'Until stuck; friend mode 5 or 10 minutes'],
            ['Black & White, Russian Janggi', '2', 'A few minutes'],
            ['Black & White II, Two-Sided Poker, Indian Poker', '2', 'About 5–10 minutes'],
            ['Wallgo, Wallgo II', '2–3', '90 seconds a turn; varies by game'],
            ['Monorail', '2', '5–15 minutes'],
            ['Piggy Bank', '4 (you + 3 AI)', '5–10 minutes'],
            ['4 Player 3 In a Row', '4', 'Four rounds'],
            ['Hit,Stay', '5 (AI fills seats)', 'Until one player has chips left'],
            ['Russian Roulette', '6 (AI fills seats)', 'One game to the shots'],
            ['Heavy 13', '4–7', '14 rounds'],
          ],
          'Times follow each game page; friend games depend on the room’s time limits.',
        ),
      ]),
      sec('choose', 'Picking your numbers', [
        ul(
          '**A five-minute break**: 1–5 minute puzzles or two-player mini games',
          '**Two, seriously**: two-player strategy like Wallgo, 12 Janggi or Nine Men’s Morris',
          '**Three or more together**: simultaneous-choice games or multiplayer games where AI fills seats',
          '**Long solo focus**: large Slitherlink or Nonogram grids',
        ),
        tip('Picks for the moment', 'Concrete picks are in “What should I play? Games for the moment”, split into five minutes for two, solo brain work and mind games for a group.'),
      ]),
    ],
  },
};

export default article;
