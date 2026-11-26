// 더 지니어스: 그랜드 파이널, death matches of rounds 1–6: 흑과 백, 전략 윷놀이, 베팅 가위바위보, 같은 숫자 찾기,
// 인디언 포커, 모노레일. Every death match of this season was a game from an earlier season, announced in advance.
import { g4Game, namuGame, wikiSeason } from './shared';

const POOL_KO = '이 시즌의 데스매치 11종은 모두 이전 시즌에 나온 게임이고, 시즌 시작 전에 목록이 공개됐어요. 회전마다 두 탈락후보가 정해진 수만큼 종목을 지운 뒤 남은 종목 중에서 추첨해요.';
const POOL_EN = 'All eleven death matches this season came from earlier seasons and were announced in advance; each round the two candidates struck out a set number of games before one was drawn from the rest.';

export const blackWhite = g4Game({
  slug: 'black-and-white', kind: 'death', ep: 1, related: ['blackWhite2', 'indianPoker', 'twoSidedPoker'], check: 'site',
  extra: [namuGame('흑과 백(더 지니어스)', 'Black and White (The Genius)'), wikiSeason('The_Genius:_Rule_Breaker')],
  site: { id: 'blackWhite', name: { ko: '흑과 백', en: 'Black and White' }, file: 'src/lib/blackWhite.ts' },
}, {
  meta: {
    title: '흑과 백 규칙 — 더 지니어스 그랜드 파이널 1회전 데스매치, 색만 보고 숫자를 읽는다',
    description: '더 지니어스: 그랜드 파이널 1회전 데스매치 흑과 백의 규칙을 정리했어요. 0–8 숫자 타일 9장, 짝수는 흑·홀수는 백, 상대가 낸 색만 보고 응수, 높은 숫자가 승점, 숫자는 끝까지 비공개, 동전 던지기로 정하는 첫 선, PUZZLTHINK에서 바로 플레이와 방송 규칙과의 차이까지.',
    keywords: ['흑과 백', '흑과백', '더 지니어스 흑과 백', '그랜드 파이널 데스매치', '더 지니어스 4', '흑과백 게임'],
  },
  title: '흑과 백 — 더 지니어스: 그랜드 파이널 1회전 데스매치',
  name: '흑과 백',
  lead: '0부터 8까지 타일 아홉 장을 한 장씩 내 높은 숫자가 이겨요. 상대 타일은 색(짝수 흑, 홀수 백)만 보이고 숫자는 끝까지 알려 주지 않아요.',
  summary: '0–8 타일을 한 장씩 내 높은 숫자가 이기되, 상대 숫자는 색으로만 짐작하는 1:1 추리 게임. 룰 브레이커에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**타일**: 각자 0–8 숫자 타일 9장. 짝수(0·2·4·6·8)는 흑색, 홀수(1·3·5·7)는 백색이에요. 흑이 5장, 백이 4장이에요.',
      '**첫 선**: 그랜드 파이널에서는 동전 던지기로 정했어요. 룰 브레이커 때는 가넷이 많은 사람이 정했어요.',
      '**재등장**: 「더 지니어스: 룰 브레이커」의 데스매치로 처음 나왔고, 이 시즌에 다시 쓰였어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선이 먼저 낸다', body: '선 플레이어가 타일 한 장을 뒷면이 보이게 내요. 상대는 그 타일의 색만 볼 수 있어요.' },
      { title: '응수', body: '후 플레이어가 자기 타일 한 장을 내요.' },
      { title: '판정', body: '딜러만 두 숫자를 확인하고, 더 높은 숫자를 낸 사람이 승점 1점을 얻어요. 무엇을 냈는지는 승패가 정해진 뒤에도 공개되지 않아요.' },
      { title: '다음 선', body: '이긴 사람이 다음 라운드의 선이 돼요. 비기면 직전 선이 다시 선이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '아홉 번 대결한 뒤 승점이 높은 사람이 데스매치에서 이겨요. 진 사람은 탈락이에요.',
      '동점이면 타일 9장을 새로 받아 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '플레이어가 알 수 있는 것은 자기가 낸 숫자, 상대 타일의 색, 그리고 라운드 승패뿐이에요. 이것으로 상대의 남은 타일을 추리해야 해요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '흑과 백은 숫자 게임이 아니라 **정보 게임**이에요. 상대가 흑을 냈다면 0·2·4·6·8 중 하나, 백이면 1·3·5·7 중 하나예요. 그리고 결과(승·패·무)가 나올 때마다 상대가 낸 타일의 범위가 좁혀져요. 비겼다면 둘이 같은 숫자를 낸 것이니, 상대의 그 타일이 정확히 무엇이었는지 알게 돼요.' },
    { type: 'cards', items: [
      { title: '흑 5장, 백 4장의 비대칭', body: '흑에는 가장 약한 0과 가장 강한 8이 함께 있어요. 그래서 흑은 "버리는 패"일 수도 "결정타"일 수도 있어 읽기 어렵고, 백은 범위가 1–7로 좁아요. 상대가 흑을 낼 때마다 0인지 8인지의 질문이 생겨요.' },
      { title: '이기는 데 필요한 만큼만', body: '이길 때 상대 숫자보다 크게 이길 필요가 없어요. 한 끗 차이로 이기는 것이 가장 효율적이고, 질 판이라면 가장 작은 타일(0이나 1)을 버리는 것이 좋아요. 결국 9장을 나눠 쓰는 배분 문제예요.' },
      { title: '선의 의미', body: '이긴 사람이 계속 선이라, 앞서는 쪽은 계속 먼저 내며 정보를 주게 돼요. 뒤에 내는 쪽은 색을 보고 응수할 수 있어 유리한 면이 있어요. 선을 잡는 것이 곧 이득은 아니에요.' },
    ], columns: 1 },
    { type: 'p', text: '양쪽이 상대 전략을 모르는 한 정해진 필승법은 없어요. 남은 타일을 매 라운드 정확히 지워 가는 기록 능력과, 상대가 내 기록을 어떻게 읽을지까지 생각하는 한 단계 더 깊은 추리가 승부를 가려요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 흑과 백은 0–8 타일, 흑·백 구분, 높은 숫자 승리, 숫자 비공개, 이긴 사람 선(비기면 같은 선)까지 방송과 같아요.',
      '혼자 하면 세 단계 AI와 두고, 친구와는 링크로 1:1 대전해요. 친구전의 첫 선은 무작위로 정해, 그랜드 파이널의 동전 던지기와 비슷해요.',
      '사이트에서는 남은 라운드를 다 이겨도 따라잡을 수 없으면 그 자리에서 끝나요. 아홉 라운드 뒤 동점이면 연장전 없이 무승부예요.',
      '친구전에는 턴마다 15·30·60초 중 방장이 고른 시간이 있고, 시간이 지나면 남은 타일 중 하나가 무작위로 나가요. 방송에는 이런 시간 규칙이 정리되어 있지 않아요.',
    ] },
  ],
  similar: [
    { name: '고프스피엘 (Goofspiel, GOPS)', players: '2–4명', alike: '각자 같은 숫자 카드 묶음을 들고 동시에 한 장씩 내 높은 쪽이 이겨요. 카드를 나눠 쓰는 배분 문제가 같아요.', differs: '고프스피엘은 낸 카드가 공개되고, 라운드마다 걸린 점수 카드의 값이 달라요.' },
    { name: '하겐 (Raj / Hol’s der Geier)', players: '2–5명', alike: '모두 1–15 카드를 들고 동시에 내 가장 높은 카드가 점수 카드를 가져가요.', differs: '카드가 공개되고, 같은 숫자를 낸 사람끼리는 서로 상쇄돼요.' },
  ],
}, {
  meta: {
    title: 'Black and White rules — The Genius: Grand Final round 1 death match',
    description: 'The rules of Black and White (흑과 백), round 1 death match of The Genius: Grand Final: nine tiles 0–8, even black and odd white, answering after seeing only the colour, the higher number scoring, numbers never revealed, a coin toss for the first lead, and how the playable PUZZLTHINK version differs.',
    keywords: ['Black and White', 'The Genius Grand Final', 'death match', '흑과 백'],
  },
  title: 'Black and White — The Genius: Grand Final round 1 death match',
  name: 'Black and White (흑과 백)',
  lead: 'Play nine tiles from 0 to 8 one at a time; the higher number wins. You see only the colour of your opponent’s tile (even black, odd white), never its number.',
  summary: 'A one-on-one deduction game: higher tile wins, but you only ever see the colour. First played in Rule Breaker.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death match players.',
      '**Tiles**: nine each, 0–8; even (0, 2, 4, 6, 8) black, odd (1, 3, 5, 7) white, so five black and four white.',
      '**First lead**: a coin toss in the Grand Final (in Rule Breaker the player with more garnets chose).',
      '**Returning game**: first used as a death match in The Genius: Rule Breaker.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lead', body: 'The leader plays a tile face down; the opponent sees only its colour.' },
      { title: 'Answer', body: 'The other player plays a tile.' },
      { title: 'Judge', body: 'Only the dealer sees both numbers; the higher scores a point. Numbers are never revealed, even afterwards.' },
      { title: 'Next lead', body: 'The winner leads next; after a draw the same player leads.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After nine duels the higher score wins; the loser is eliminated.',
      'A tie means a fresh set of nine tiles and another game.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'All you learn is your own tile, the opponent’s colour and each result; from that you deduce their remaining tiles.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is an **information game**, not a numbers game. Black means 0, 2, 4, 6 or 8; white means 1, 3, 5 or 7; each result narrows it further, and a draw tells you exactly which tile they played.' },
    { type: 'cards', items: [
      { title: 'Five black, four white', body: 'Black holds both the weakest 0 and the strongest 8, so a black tile might be a throwaway or the killer; white is confined to 1–7.' },
      { title: 'Win by just enough', body: 'Winning by one is as good as winning by eight; when you expect to lose, dump your smallest tile. It is a budgeting problem over nine tiles.' },
      { title: 'What leading means', body: 'The winner keeps leading and keeps giving information first, while the follower answers after seeing a colour. Leading is not simply an advantage.' },
    ], columns: 1 },
    { type: 'p', text: 'With neither side knowing the other’s plan there is no forced win; careful elimination of tiles every round, and thinking about how your opponent reads you, decide it.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Black and White matches the tiles, colours, higher-wins rule, hidden numbers and winner-leads rule (same leader after a draw).',
      'Solo you play a three-level AI; with a friend you play one-on-one by link, and the first leader is random, much like the Grand Final’s coin toss.',
      'The site ends a game as soon as the lead can no longer be caught, and a tie after nine rounds is a draw with no replay.',
      'Friend games have a 15, 30 or 60-second turn chosen by the host; on timeout a random remaining tile is played. No such timer is recorded for the broadcast.',
    ] },
  ],
  similar: [
    { name: 'Goofspiel (GOPS)', players: '2–4', alike: 'Identical number hands played one card at a time, higher wins; the same budgeting problem.', differs: 'Played cards are public and each round’s prize card has a different value.' },
    { name: 'Raj (Hol’s der Geier)', players: '2–5', alike: 'Everyone plays from cards 1–15 at once and the highest takes the prize.', differs: 'Cards are public and equal plays cancel out.' },
  ],
});

export const tacticalYut = g4Game({
  slug: 'tactical-yutnori', kind: 'death', ep: 2, related: ['hitStay', 'janggi', 'blackWhite'], check: 'wiki',
  extra: [namuGame('전략 윷놀이', 'Tactical Yutnori'), wikiSeason('The_Genius:_Rules_of_the_Game')],
}, {
  note: '이 시즌의 전략 윷놀이 규칙은 원작 시즌(게임의 법칙)의 정리와 같고, 따로 바뀐 점은 확인되지 않았어요.',
  meta: {
    title: '전략 윷놀이 규칙 — 더 지니어스 그랜드 파이널 2회전 데스매치, 윷을 골라 던지는 2:2 윷놀이',
    description: '더 지니어스: 그랜드 파이널 2회전 데스매치 전략 윷놀이의 규칙을 정리했어요. 탈락후보가 파트너를 골라 2:2, 앞면만·뒷면만 있는 윷으로 결과를 직접 고르기, 모든 도는 뒷도, 탈락후보의 말 두 개가 먼저 들어오면 승리, 파트너끼리의 가넷 1개와 승부처까지.',
    keywords: ['전략 윷놀이', '더 지니어스 윷놀이', '그랜드 파이널 데스매치', '더 지니어스 4', '게임의 법칙 데스매치'],
  },
  title: '전략 윷놀이 — 더 지니어스: 그랜드 파이널 2회전 데스매치',
  name: '전략 윷놀이',
  lead: '네 사람이 윷을 하나씩 던지는데, 각자 앞면만 있는 윷과 뒷면만 있는 윷 중 하나를 골라 내요. 운이 아니라 넷의 선택이 모여 도·개·걸·윷·모가 정해져요.',
  summary: '네 명이 앞면·뒷면 윷을 골라 내 결과를 만드는 2:2 윷놀이. 게임의 법칙에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명과 각자 고른 파트너 1명씩, 2:2.',
      '**윷**: 네 사람이 각자 앞면만 있는 윷과 뒷면만 있는 윷을 한 세트씩 받아요.',
      '**말**: 네 사람이 각자 말 2개.',
      '**재등장**: 「더 지니어스: 게임의 법칙」의 데스매치로 처음 나왔어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '윷 고르기', body: '네 사람이 각자 앞면 윷과 뒷면 윷 중 하나를 골라 내요. 네 개의 결과가 모여 그 차례의 윷 결과가 돼요.' },
      { title: '이동', body: '기본은 보통 윷놀이와 같아요. 단, **도는 모두 뒷도**로 쳐요. 뒷도로 출발점에 들어가도 한 바퀴를 돈 것으로 인정해요.' },
      { title: '순서', body: 'A 탈락후보 → B 파트너 → B 탈락후보 → A 파트너 순으로 번갈아 진행해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '파트너의 말과 상관없이 **탈락후보 자신의 말 2개가 먼저 모두 들어오면** 이겨요. 진 탈락후보는 탈락이에요.',
      '이긴 쪽 파트너는 진 쪽 파트너에게서 가넷 1개를 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '그랜드 파이널에서는 팀이 윷 조합을 상의하기 쉽도록 경우의 수가 보이는 판을 각 팀에 줬어요.',
      '원작 시즌에는 관전 플레이어가 승패에 가넷을 걸 수 있었는데, 이 시즌에도 적용됐는지는 확인하지 못했어요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '보통 윷놀이에서 도·개·걸·윷·모는 확률이에요. 전략 윷놀이에서는 **네 사람의 선택**이에요. 내 팀 두 사람이 고른 두 개는 내가 통제하지만, 나머지 두 개는 상대 팀이 고르니, 결과는 "내가 원하는 것"과 "상대가 막고 싶은 것"의 합이에요. 결국 동시에 고르는 심리전이 네 번 겹친 게임이에요.' },
    { type: 'cards', items: [
      { title: '도가 뒷도라는 의미', body: '앞면(배)이 하나만 나오면 앞으로 가는 대신 한 칸 뒤로 가요. 상대 팀은 내 차례에 뒷도를 만들어 발을 묶을 수 있고, 출발점 바로 앞에서는 뒷도가 오히려 한 바퀴 완주가 되기도 해요. 어디에서 뒷도가 이득이고 손해인지가 판마다 달라요.' },
      { title: '잡기와 업기', body: '보통 윷놀이처럼 말을 잡으면 다시 던질 수 있고, 같은 편 말끼리 업을 수 있어요. 승패는 탈락후보의 말로만 정해지지만, 파트너의 말은 상대를 잡거나 길을 막는 데 쓸 수 있어요.' },
      { title: '파트너 고르기', body: '파트너는 승리 조건에 직접 들지 않지만 매 차례 윷 하나를 쥐어요. 내 의도를 잘 읽고 상대의 수를 예측하는 사람을 고르는 것이 첫 번째 전략이에요.' },
    ], columns: 1 },
    { type: 'p', text: '네 명이 동시에 고르는 구조라 순수한 필승 전략은 없어요. 상대가 무엇을 막으려 할지 예측하고, 막혀도 손해가 적은 결과를 노리는 위험 관리가 중요해요.' },
  ],
  similar: [
    { name: '윷놀이', players: '2명 이상(편 나누기)', alike: '판, 말, 도·개·걸·윷·모, 잡기와 업기가 모두 같아요.', differs: '보통 윷놀이는 던진 윷의 결과가 운이고, 도는 앞으로 한 칸이에요(뒷도 표시가 있는 경우만 뒤로).' },
    { name: '루도 (Ludo)', players: '2–4명', alike: '말을 판 한 바퀴 돌려 먼저 모두 들어오면 이기고, 남의 말을 잡아 출발점으로 보낼 수 있어요.', differs: '루도는 주사위로 움직이고 팀을 짜지 않아요.' },
  ],
}, {
  note: 'This season’s Tactical Yutnori followed the original season’s (Rules of the Game) rules; no changes were confirmed.',
  meta: {
    title: 'Tactical Yutnori rules — The Genius: Grand Final round 2 death match',
    description: 'The rules of Tactical Yutnori (전략 윷놀이), round 2 death match of The Genius: Grand Final: candidates pick partners for a 2-v-2 game, all-flat and all-round sticks let each player choose their throw, every do counts as back-do, and the first candidate to bring both pieces home survives.',
    keywords: ['Tactical Yutnori', 'The Genius Grand Final', 'death match', '전략 윷놀이'],
  },
  title: 'Tactical Yutnori — The Genius: Grand Final round 2 death match',
  name: 'Tactical Yutnori (전략 윷놀이)',
  lead: 'Four players each throw one yut stick, choosing between a stick that always lands flat and one that always lands round. The throw is the sum of four choices, not luck.',
  summary: 'A 2-v-2 yutnori where each of four players chooses their stick’s face. First played in Rules of the Game.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates, each with a partner of their choice.',
      '**Sticks**: each player has one stick that is flat on both sides and one that is round on both sides.',
      '**Pieces**: two per player.',
      '**Returning game**: first a death match in The Genius: Rules of the Game.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose', body: 'All four play one of their two sticks; together they make the throw.' },
      { title: 'Move', body: 'As in ordinary yutnori, except **every do counts as back-do**; entering the start by back-do still counts as a full lap.' },
      { title: 'Order', body: 'Candidate A, partner B, candidate B, partner A, and so on.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first **candidate to bring both of their own pieces home** wins, whatever the partners’ pieces do; the other is eliminated.',
      'The winning partner takes one garnet from the losing partner.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'In the Grand Final each team was given a chart of the possible combinations to make discussion easier.',
      'In the original season spectators could bet garnets on the result; whether that applied here was not confirmed.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'In ordinary yutnori the throw is probability; here it is **four choices**. Your team controls two sticks and the other team two, so each throw is what you want plus what they want to stop: four overlapping simultaneous guesses.' },
    { type: 'cards', items: [
      { title: 'Do is back-do', body: 'A single flat side sends a piece back one step. Opponents can force it to stall you, yet just before the start a back-do completes a lap. Where it helps or hurts changes every game.' },
      { title: 'Capturing and stacking', body: 'Captures earn another throw and friendly pieces can stack. Only candidates’ pieces count for the win, but partners’ pieces can capture and block.' },
      { title: 'Choosing a partner', body: 'Partners never win themselves but hold a stick every throw; pick someone who reads you and the opponents well.' },
    ], columns: 1 },
    { type: 'p', text: 'With four simultaneous choices there is no pure winning strategy; aim for results that cost little if blocked.' },
  ],
  similar: [
    { name: 'Yutnori', players: '2+ (teams)', alike: 'The same board, pieces, throws, captures and stacking.', differs: 'Throws are luck, and do moves forward (only a marked stick gives back-do).' },
    { name: 'Ludo', players: '2–4', alike: 'Race pieces round the board, sending rivals home by capture.', differs: 'Dice, no teams.' },
  ],
});

export const bettingRps = g4Game({
  slug: 'betting-rock-paper-scissors', kind: 'death', ep: 3, related: ['blackWhite', 'indianPoker', 'hitStay'], check: 'wiki',
  extra: [wikiSeason('The_Genius:_Black_Garnet')],
}, {
  note: '무승부 베팅과 라운드별 칩 수 같은 이 시즌의 변경점은 나무위키에서만 확인했어요.',
  meta: {
    title: '베팅 가위바위보 규칙 — 더 지니어스 그랜드 파이널 3회전 데스매치, 승부하거나 베팅하거나',
    description: '더 지니어스: 그랜드 파이널 3회전 데스매치 베팅 가위바위보의 규칙을 정리했어요. 관전 플레이어 9명과 가상 플레이어 2명이 미리 낸 표식, 11라운드 번갈아 선, 승부 쪽은 1·2·3·4개 칩 획득, 베팅 쪽은 승·패 2배·무승부 3배, 블랙가넷과 달라진 점과 승부처까지.',
    keywords: ['베팅 가위바위보', '베팅 가위 바위 보', '더 지니어스 가위바위보', '그랜드 파이널 데스매치', '더 지니어스 4', '블랙가넷 데스매치'],
  },
  title: '베팅 가위바위보 — 더 지니어스: 그랜드 파이널 3회전 데스매치',
  name: '베팅 가위바위보',
  lead: '한 사람은 관전 플레이어가 미리 내 둔 가위바위보와 승부하고, 다른 한 사람은 그 결과에 칩을 걸어요. 라운드마다 역할을 바꾸며 칩을 모아요.',
  summary: '관전자가 미리 낸 표식과 승부하는 쪽과 그 결과에 거는 쪽으로 나뉘어, 11라운드 동안 칩을 다투는 1:1 게임. 블랙가넷에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명. 탈락후보를 뺀 관전 플레이어 9명이 제비뽑기로 라운드를 맡아요.',
      '**표식**: 관전 플레이어는 각자 가위·바위·보 중 하나를 골라 딜러에게 미리 내요. 11라운드 중 추첨되지 않은 2개 라운드는 가상 플레이어가 맡고, 가상 플레이어의 표식은 라운드 시작 때 공개돼요.',
      '**칩**: 탈락후보는 1개씩 들고 시작해요.',
      '**재등장**: 「더 지니어스: 블랙가넷」의 데스매치로 처음 나왔어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '역할 정하기', body: '1라운드 선은 동전 던지기로, 이후는 번갈아 선이 돼요. 선이 "승부"를 고르면 상대는 자동으로 "베팅"을 해요. 즉 선이 고르지 않은 쪽을 상대가 맡아요.' },
      { title: '승부', body: '그 라운드 관전 플레이어가 이미 낸 표식과 가위바위보를 해요. 내 카드는 뒷면으로 내고, 상대의 베팅이 끝날 때까지 공개하지 않아요.' },
      { title: '베팅', body: '승부 결과가 열리기 전에 승리·패배·무승부 중 한 곳에 칩을 1개 이상 걸어요. 칩이 없으면 걸지 않아도 돼요.' },
      { title: '정산', body: '승부에서 이기면 1–3라운드 1개, 4–6라운드 2개, 7–9라운드 3개, 10–11라운드 4개의 칩을 얻어요. 베팅은 승리·패배를 맞히면 2배, 무승부를 맞히면 3배로 돌려받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '11라운드 뒤 **칩이 적은 사람이 탈락**이에요.',
      '칩 수가 같으면 관전 플레이어들의 표식을 공개한 상태로 1라운드부터 11라운드까지 다시 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '승리·패배에 걸었는데 반대 결과가 나오면 건 칩은 주최 측이 가져가요.',
      '승부가 무승부인데 승리·패배에 걸었다면 칩을 돌려받아요. 반대로 무승부에 걸었는데 승패가 나면 칩을 잃어요.',
      '블랙가넷 때와 비교해 관전 플레이어 수, 1라운드 선 정하는 방법, 라운드별 칩 수가 바뀌었고, 무승부 베팅이 새로 생겼어요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '승부하는 사람은 결과를 거의 정할 수 있어요. 관전자의 표식은 이미 정해져 있으니, 그 표식만 안다면 이기든 지든 비기든 골라 낼 수 있거든요. 그러면 베팅하는 쪽은 **"상대가 이번에 이기려 할까, 지려 할까"**를 맞혀야 해요. 승부 쪽은 이겨서 칩을 얻는 길과, 일부러 져서 상대의 베팅을 날리는 길 사이에서 고르는 게임이에요.' },
    { type: 'cards', items: [
      { title: '관전자의 표식이 열쇠', body: '관전 플레이어 9명은 탈락후보와 이해관계가 있어서, 데스매치 전에 누가 무엇을 냈는지 알려 주거나 숨길 수 있어요. 승부 쪽이 표식을 모른다면 결과는 다시 운이 돼요. 공개되는 가상 플레이어 라운드는 승부 쪽이 결과를 완전히 정할 수 있는 라운드예요.' },
      { title: '칩 0개의 함정', body: '칩이 없으면 베팅을 할 수 없어요. 그러면 상대가 승부할 때 아무것도 할 수 없고, 내가 승부할 때만 칩을 벌 수 있어요. 1라운드부터 1:0을 만들면 상대를 이 상태로 몰아넣기 쉬워요.' },
      { title: '무승부 3배', body: '무승부 베팅은 맞히면 3배라 뒤진 쪽의 역전 수단이에요. 승부 쪽 입장에서 무승부는 칩 수입이 없지만, 상대가 무승부에 크게 걸었을 것 같으면 일부러 승패를 내 칩을 날릴 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '후반 라운드일수록 승부로 얻는 칩이 커져(최대 4개), 초반의 작은 차이는 뒤집히기 쉬워요. 하지만 베팅은 가진 칩을 걸어야 하니, 칩이 많은 쪽이 베팅으로 더 크게 벌 수 있어요. 앞서는 쪽은 큰 베팅으로 격차를 벌리고, 뒤진 쪽은 후반 승부와 무승부 베팅으로 따라가는 그림이 자연스러워요.' },
  ],
  similar: [
    { name: '스컬 (Skull)', players: '3–6명', alike: '상대가 숨긴 선택을 읽고 거기에 걸어요. 숨긴 쪽은 상대가 무엇을 예상할지 역으로 이용해요.', differs: '스컬은 꽃과 해골 카드를 뒤집는 블러핑 게임이고, 제3자의 선택이 끼지 않아요.' },
    { name: '위츠 앤 웨이저스 (Wits & Wagers)', players: '3–7명', alike: '다른 사람의 답이 맞을지에 칩을 걸고, 배당이 다른 칸이 있어요.', differs: '위츠 앤 웨이저스는 퀴즈 정답에 거는 게임이고, 거는 대상이 상대의 의도가 아니에요.' },
  ],
}, {
  note: 'This season’s changes, such as betting on a draw and the chips per round, were confirmed only in the fan wiki.',
  meta: {
    title: 'Betting Rock Paper Scissors rules — The Genius: Grand Final round 3 death match',
    description: 'The rules of Betting Rock Paper Scissors (베팅 가위바위보), round 3 death match of The Genius: Grand Final: nine spectators and two virtual players submit throws in advance, eleven rounds of alternating roles, 1–4 chips for winning a duel, 2× for a right win/loss bet and 3× for a draw, and what changed since Black Garnet.',
    keywords: ['Betting Rock Paper Scissors', 'The Genius Grand Final', 'death match', '베팅 가위바위보'],
  },
  title: 'Betting Rock Paper Scissors — The Genius: Grand Final round 3 death match',
  name: 'Betting Rock Paper Scissors (베팅 가위바위보)',
  lead: 'One player plays rock-paper-scissors against a spectator’s pre-submitted throw while the other bets chips on the result; roles alternate as chips build up.',
  summary: 'One duels a spectator’s hidden throw, the other bets on the outcome, over eleven rounds. First played in Black Garnet.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates; the nine other players are assigned rounds by lot.',
      '**Throws**: each spectator hands the dealer rock, paper or scissors in advance. The two unassigned rounds go to virtual players whose throws are shown at the start of the round.',
      '**Chips**: each candidate starts with one.',
      '**Returning game**: first a death match in The Genius: Black Garnet.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Roles', body: 'A coin toss decides who leads round 1, then the lead alternates. If the leader chooses to duel, the other must bet, and vice versa.' },
      { title: 'Duel', body: 'Play against that round’s spectator’s throw, face down, unrevealed until the bet is in.' },
      { title: 'Bet', body: 'Before the duel is revealed, bet at least one chip on win, loss or draw (no bet if you have no chips).' },
      { title: 'Payout', body: 'Winning a duel earns 1 chip in rounds 1–3, 2 in 4–6, 3 in 7–9 and 4 in 10–11. A right win/loss bet pays double; a right draw bet pays triple.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After eleven rounds **the player with fewer chips is eliminated**.',
      'On a tie, all eleven rounds are replayed with the spectators’ throws revealed.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong win/loss bet is lost to the house.',
      'A win/loss bet on a drawn duel is returned; a draw bet on a decided duel is lost.',
      'Compared with Black Garnet, the number of spectators, how round 1’s leader is chosen and the chips per round changed, and draw bets were added.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The duellist nearly controls the result: the spectator’s throw is fixed, so knowing it lets you choose to win, lose or draw. The bettor must guess **whether the duellist wants to win this time**, and the duellist chooses between earning chips and losing on purpose to burn the bet.' },
    { type: 'cards', items: [
      { title: 'Spectators hold the key', body: 'The nine spectators have their own interests and may reveal or hide their throws before the match. Without that knowledge the duel is luck again; virtual-player rounds, with public throws, are fully controllable.' },
      { title: 'The zero-chip trap', body: 'With no chips you cannot bet, so you can only earn when you duel. Going 1–0 up in round 1 makes it easier to push the opponent into that state.' },
      { title: 'Triple for a draw', body: 'A draw bet pays three times, a comeback tool for the trailing player; a duellist who expects a big draw bet can force a decision to burn it.' },
    ], columns: 1 },
    { type: 'p', text: 'Duel payouts rise to four chips late, so early gaps can close, but bets need chips, so the leader can bet bigger. The leader widens the gap with bets; the trailer catches up with late duels and draw bets.' },
  ],
  similar: [
    { name: 'Skull', players: '3–6', alike: 'Read a hidden choice and bet on it while the hider exploits your expectations.', differs: 'A flower-and-skull bluffing game with no third party.' },
    { name: 'Wits & Wagers', players: '3–7', alike: 'Bet chips on whether someone else’s answer is right, with different payouts.', differs: 'You bet on trivia answers, not an opponent’s intent.' },
  ],
});

export const sameNumberHunt = g4Game({
  slug: 'same-number-hunt', kind: 'death', ep: 4, related: ['hexagon', 'equationTower', 'nemoCount'], check: 'wiki',
  extra: [wikiSeason('The_Genius:_Black_Garnet')],
}, {
  note: '이 시즌에 바뀐 연산 기호(√x+√y)와 정답 뒤 한 칸씩 다시 보여 주는 규칙은 나무위키에서만 확인했어요.',
  meta: {
    title: '같은 숫자 찾기 규칙 — 더 지니어스 그랜드 파이널 4회전 데스매치, 5초 암기로 수식 만들기',
    description: '더 지니어스: 그랜드 파이널 4회전 데스매치 같은 숫자 찾기의 규칙을 정리했어요. 16칸 판 뒷면의 1–12 숫자와 +·×·÷·√x+√y, 시작 전 5초 공개, 타깃 넘버와 버저, 알파벳 3개로 수식 부르기, √ 수식 2점, 정답마다 한 칸씩 3초 재공개, 10점 선승과 승부처까지.',
    keywords: ['같은 숫자 찾기', '더 지니어스 같은 숫자 찾기', '그랜드 파이널 데스매치', '더 지니어스 4', '블랙가넷 결승'],
  },
  title: '같은 숫자 찾기 — 더 지니어스: 그랜드 파이널 4회전 데스매치',
  name: '같은 숫자 찾기',
  lead: '알파벳 16칸 뒤에 숨은 숫자와 연산 기호를 5초 동안 외운 뒤, 타깃 넘버가 나오면 그 수가 되는 수식을 알파벳 세 개로 불러요.',
  summary: '5초 동안 본 16칸의 숫자와 기호를 기억해 타깃 넘버를 만드는 암기·연산 1:1 대결. 블랙가넷 결승에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**게임판**: 알파벳 16칸. 뒷면에는 1–12의 숫자와 연산 기호 ＋, ×, ÷, √x+√y가 있어요.',
      '**재등장**: 「더 지니어스: 블랙가넷」 결승에서 처음 나왔어요. 그때 있던 빼기(−) 대신 이번에는 √x+√y가 들어갔어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '시작 전에 판의 뒷면이 단 한 번, 5초 동안 공개돼요.' },
      { title: '타깃 넘버', body: '딜러가 라운드마다 타깃 넘버를 하나씩 무작위로 뽑아요. 판의 숫자와 기호로 만들 수 있는 자연수 가운데서 나오고, 같은 수는 다시 나오지 않아요.' },
      { title: '버저', body: '먼저 버저를 누른 사람이 5초 안에 "숫자–기호–숫자" 순서로 알파벳 세 개를 불러요. 다 부른 뒤 부른 순서대로 뒤집어 확인해요.' },
      { title: '기회 넘기기', body: '5초가 지나거나 틀리면 상대에게 기회가 넘어가고, 넘어온 기회는 5초를 세지 않아요. 정답이 나올 때까지 번갈아 기회를 얻어요.' },
      { title: '재공개', body: '정답이 나와 다음 라운드로 넘어갈 때마다, 판의 왼쪽 위부터 지그재그 순서로 한 칸씩 3초 동안 다시 보여 줘요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '수식을 먼저 완성하면 승점 1점, **√x+√y로 맞히면 2점**이에요.',
      '먼저 **10점**을 얻는 사람이 이겨요. 진 사람은 탈락이에요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '수식은 숫자 2개와 기호 1개로 만들어야 하고, 한 수식에 같은 숫자 칸을 두 번 쓸 수 없어요.',
      '부른 알파벳 세 개가 다 뒤집히기 전에 틀린 것이 드러나도 세 칸의 뒷면은 모두 공개돼요. 5초 안에 세 개를 다 부르지 못하면 공개되지 않아요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '가장 먼저 셈해 볼 것은 **기호의 쓸모**예요. 1–12 두 수로 만들 수 있는 값은 더하기로 3–23, 나누기로 1–12 사이의 몇 개뿐이지만, 곱하기로는 훨씬 많은 수를 만들 수 있어요. 타깃 넘버가 "판으로 만들 수 있는 모든 자연수" 중에서 고르게 나온다면 대부분의 문제가 곱하기 문제예요. 그러니 5초 동안 가장 먼저 외울 것은 **× 기호의 위치**와 숫자들이에요.' },
    { type: 'cards', items: [
      { title: '√x+√y는 보너스', body: '1–12에서 제곱근이 자연수인 수는 1, 4, 9뿐이라, √x+√y로 만들 수 있는 값은 3, 4, 5, 6 정도예요. 이 값들이 타깃으로 나올 확률은 낮아서 2점 규칙은 가끔 오는 보너스에 가까워요. 대신 작은 타깃이 나오면 √부터 떠올릴 가치가 있어요.' },
      { title: '오답도 정보를 연다', body: '세 칸을 다 부르면 틀려도 뒷면이 공개돼요. 그래서 못 외운 칸을 일부러 불러 확인하는 방법이 있지만, 그 정보는 상대에게도 똑같이 열려요. 연산이 빠른 상대 앞에서는 손해일 수 있어요.' },
      { title: '재공개의 순서', body: '정답마다 왼쪽 위부터 한 칸씩 다시 보여 주니, 판의 윗부분은 게임이 길어질수록 자연스럽게 다시 보게 돼요. 처음 5초에 부분만 외운다면 **아래쪽 줄**을 먼저 외우는 편이 합리적이에요.' },
    ], columns: 1 },
    { type: 'p', text: '상대가 연 칸만 골라 수식을 만들면, 내가 새 칸을 열어 상대에게 정보를 주는 일을 줄일 수 있어요. 기억력과 연산 속도가 기본이지만, 무엇을 언제 공개되게 할지까지 관리하는 사람이 유리해요.' },
  ],
  similar: [
    { name: '메모리 (Memory, Concentration)', players: '1–8명', alike: '뒤집힌 카드의 위치를 외워, 원하는 카드를 정확히 골라내요.', differs: '메모리는 같은 그림 두 장을 짝짓는 게임이고 연산이 없어요.' },
    { name: '24 게임 (24 Game)', players: '1명 이상', alike: '주어진 숫자와 사칙연산으로 목표 수를 빨리 만들어요.', differs: '24 게임은 숫자가 공개되어 있고, 목표가 늘 24예요.' },
  ],
}, {
  note: 'This season’s new operator (√x+√y) and the one-tile re-reveal after each answer were confirmed only in the fan wiki.',
  meta: {
    title: 'Same Number Hunt rules — The Genius: Grand Final round 4 death match',
    description: 'The rules of Same Number Hunt (같은 숫자 찾기), round 4 death match of The Genius: Grand Final: a 16-tile board hiding 1–12 and +, ×, ÷ and √x+√y, a single five-second look, target numbers and a buzzer, three letters for an equation, 2 points for √, a three-second re-reveal after each answer, and first to 10.',
    keywords: ['Same Number Hunt', 'The Genius Grand Final', 'death match', '같은 숫자 찾기'],
  },
  title: 'Same Number Hunt — The Genius: Grand Final round 4 death match',
  name: 'Same Number Hunt (같은 숫자 찾기)',
  lead: 'Memorise the numbers and operators hidden behind 16 letters in five seconds, then call three letters that make each target number.',
  summary: 'A memory-and-arithmetic duel on a board seen for five seconds. First played in the Black Garnet final.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Board**: 16 lettered tiles hiding the numbers 1–12 and the operators +, ×, ÷ and √x+√y.',
      '**Returning game**: from The Genius: Black Garnet’s final; this time √x+√y replaced minus.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Before play, the back of the board is shown once, for five seconds.' },
      { title: 'Target', body: 'Each round the dealer draws a target: any natural number the board can make, never repeated.' },
      { title: 'Buzz', body: 'The first to buzz has five seconds to call three letters in number–operator–number order; they are flipped in that order.' },
      { title: 'Passing', body: 'A timeout or wrong answer passes the chance, with no five-second limit for the receiver; chances alternate until someone is right.' },
      { title: 'Re-reveal', body: 'After each correct answer, one tile is shown for three seconds, working in a zigzag from the top left.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A correct equation scores 1, or **2 with √x+√y**.',
      'First to **10 points** wins; the loser is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'An equation is two numbers and one operator, without using the same number tile twice.',
      'If all three letters were called, all three tiles are shown even when the answer is already wrong; if not all called in time, nothing is shown.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'First, **what each operator can make**. Two numbers from 1–12 add to 3–23 and divide to only a few values, but multiply to far more. If targets are drawn evenly from everything the board can make, most are multiplication problems, so the first thing to memorise is **where × is**, with the numbers.' },
    { type: 'cards', items: [
      { title: '√x+√y is a bonus', body: 'Only 1, 4 and 9 have whole square roots in 1–12, so √x+√y makes just a handful of small values. Such targets are rare, so the 2-point rule is an occasional bonus; when a small target appears, think √ first.' },
      { title: 'Wrong answers open tiles', body: 'Calling all three letters reveals them even if wrong, a way to check forgotten tiles, but your opponent sees them too, which costs against a faster calculator.' },
      { title: 'Order of re-reveals', body: 'Tiles reappear from the top left, so the top rows come back as the game goes on; if you can memorise only part, start with the **bottom rows**.' },
    ], columns: 1 },
    { type: 'p', text: 'Building answers from tiles your opponent already opened avoids feeding them new information. Memory and speed are the base; managing what gets revealed and when is the edge.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1–8', alike: 'Remember where face-down cards are and pick exactly the one you need.', differs: 'You pair identical pictures; no arithmetic.' },
    { name: '24 Game', players: '1+', alike: 'Make a target from given numbers with the four operations, fast.', differs: 'Numbers are visible and the target is always 24.' },
  ],
});

export const indianPoker = g4Game({
  slug: 'indian-poker', kind: 'death', ep: 5, related: ['twoSidedPoker', 'blackWhite', 'hitStay'], check: 'site',
  extra: [wikiSeason('The_Genius:_Rules_of_the_Game')],
  site: { id: 'indianPoker', name: { ko: '인디언 포커', en: 'Indian Poker' }, file: 'src/lib/indianPoker.ts' },
}, {
  note: '이 시즌에 두 사람이 들고 시작한 칩 수는 확인하지 못해 적지 않았어요.',
  meta: {
    title: '인디언 포커 규칙 — 더 지니어스 그랜드 파이널 5회전 데스매치, 내 카드만 모르는 포커',
    description: '더 지니어스: 그랜드 파이널 5회전 데스매치 인디언 포커의 규칙을 정리했어요. 1–10 카드 두 장씩 20장, 이마에 붙여 상대 카드만 보기, 콜·레이즈·포기, 10을 들고 포기하면 칩 10개 패널티, 무승부 칩 이월, 새로 생긴 "자기 카드를 보면 무효" 규칙, PUZZLTHINK에서 바로 플레이까지.',
    keywords: ['인디언 포커', '인디언포커', '더 지니어스 인디언 포커', '그랜드 파이널 데스매치', '더 지니어스 4', '게임의 법칙 데스매치'],
  },
  title: '인디언 포커 — 더 지니어스: 그랜드 파이널 5회전 데스매치',
  name: '인디언 포커',
  lead: '카드를 이마에 붙여, 나는 상대 카드만 보고 상대는 내 카드만 봐요. 내 숫자를 모르는 채로 베팅하는 포커예요.',
  summary: '자기 카드만 모른 채 상대 카드를 보고 베팅하는 1:1 포커. 게임의 법칙에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**카드**: 1–10 카드 두 장씩, 모두 20장. 쓴 카드는 버리고, 20장을 다 쓰면 새 20장으로 진행해요.',
      '**칩**: 두 사람이 같은 수의 칩으로 시작해요.',
      '**재등장**: 「더 지니어스: 게임의 법칙」의 데스매치로 처음 나왔어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드 받기', body: '각자 카드 한 장을 앞면을 보지 않고 이마에 붙여요. 상대의 카드만 보여요.' },
      { title: '베팅', body: '기본 베팅 뒤 번갈아 세 가지 중 하나를 해요. 상대와 같은 칩을 맞추면(콜) 베팅이 끝나고 카드를 공개해요. 더 많이 걸면(레이즈) 베팅이 이어져요. 포기하면 상대가 이겨 칩을 가져가요.' },
      { title: '공개', body: '더 높은 카드를 가진 사람이 베팅된 칩을 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**칩을 모두 잃은 사람이 패배**해 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**10을 들고 포기하면** 패널티로 칩 10개를 상대에게 줘요.',
      '같은 숫자로 비기면 베팅된 칩은 다음 판의 승자가 가져가요.',
      '그랜드 파이널에서 새로 생긴 규칙: 카드가 공개되기 전에 실수로 자기 카드 앞면을 보면 그 판은 즉시 무효가 되고, 이미 걸린 칩은 상대에게 넘어가요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '인디언 포커의 정보 구조는 보통 포커의 반대예요. 내 패는 모르고 상대 패는 알아요. 그래서 판단의 기준은 **"상대 카드가 얼마나 높은가"**와 **"상대가 내 카드를 보고 어떻게 베팅하는가"** 두 가지예요. 상대 카드가 2면 나는 대부분 이기니 크게 걸고, 상대 카드가 9면 대부분 지니 접는 것이 기본이에요.' },
    { type: 'cards', items: [
      { title: '상대의 베팅이 곧 내 카드', body: '상대는 내 카드를 보고 베팅해요. 상대 카드가 높은데도 상대가 조심스럽다면 내 카드가 높다는 뜻일 수 있어요. 반대로 내가 크게 걸면 상대는 "내 카드가 낮은가"를 의심하게 돼요. 블러핑이 통하는 이유예요.' },
      { title: '10 패널티의 무게', body: '10을 들고 접으면 칩 10개를 내야 해요. 상대가 크게 걸어도 내 카드가 10일 가능성이 남아 있다면 접기가 비싸요. 덱에서 10이 몇 장 나왔는지 세는 것이 이 판단의 재료예요.' },
      { title: '카운팅', body: '20장 덱을 다 쓸 때까지 같은 덱을 써서, 지나간 카드를 세면 남은 카드의 분포를 알 수 있어요. 덱 후반으로 갈수록 내 카드가 무엇일지 확률이 좁혀져요.' },
    ], columns: 1 },
    { type: 'p', text: '새로 생긴 "자기 카드를 보면 무효" 규칙은 사실상 패널티 없는 포기와 같은 효과를 낼 수 있어요. 내 카드가 10일지도 모르는데 상대가 크게 걸었을 때, 이미 건 칩만 내주고 10 패널티를 피할 수 있으니까요. 규칙의 빈틈까지 계산에 넣어야 하는 판이에요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 인디언 포커는 1–10 두 장씩 20장, 기본 베팅 1개, 콜·레이즈·포기, 10 포기 패널티 10개, 무승부 칩 이월까지 방송과 같아요.',
      '사이트에서는 두 사람 모두 칩 20개로 시작해요.',
      '화면에 내 카드가 보이지 않게 만들어져 있어, "자기 카드를 보면 무효" 규칙은 없어요.',
      '혼자 하면 세 단계 AI(쉬움·보통·어려움)와 두고, 친구와는 링크로 1:1 대결해요. 턴 시간은 AI전 30초, 친구 방은 20·30·45초 중에서 골라요. 시간이 지나면 자동으로 포기해요.',
    ] },
  ],
  similar: [
    { name: '블라인드 맨스 블러프 (Blind Man’s Bluff)', players: '2명 이상', alike: '카드를 이마에 대고 남의 카드만 보며 베팅하는 포커 변형으로, 인디언 포커와 같은 게임이에요.', differs: '보통 52장 덱으로 하고, 10 패널티 같은 규칙은 집마다 달라요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '내 카드는 못 보고 남의 카드만 보여, 남의 행동으로 내 패를 추리해요.', differs: '하나비는 협력 게임이고 베팅이 없어요.' },
  ],
}, {
  note: 'How many chips each player started with this season could not be confirmed, so it is left out.',
  meta: {
    title: 'Indian Poker rules — The Genius: Grand Final round 5 death match',
    description: 'The rules of Indian Poker (인디언 포커), round 5 death match of The Genius: Grand Final: two of each card 1–10, cards on foreheads so you see only your opponent’s, call, raise or fold, a ten-chip penalty for folding a 10, ties carrying over, the new rule that seeing your own card voids the hand, and the playable PUZZLTHINK version.',
    keywords: ['Indian Poker', 'The Genius Grand Final', 'death match', '인디언 포커'],
  },
  title: 'Indian Poker — The Genius: Grand Final round 5 death match',
  name: 'Indian Poker (인디언 포커)',
  lead: 'Cards go on foreheads: you see only your opponent’s card and they see only yours. Poker without knowing your own number.',
  summary: 'One-on-one poker where you bet on your opponent’s visible card without seeing your own. First played in Rules of the Game.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Cards**: two each of 1–10, twenty in all; used cards are discarded and a fresh twenty come in when the deck runs out.',
      '**Chips**: equal stacks.',
      '**Returning game**: first a death match in The Genius: Rules of the Game.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Deal', body: 'Each player puts a card on their forehead without looking; only the opponent’s card is visible.' },
      { title: 'Bet', body: 'After the ante, players alternate: match (call) and the cards are shown; bet more (raise) and betting continues; fold and the opponent takes the pot.' },
      { title: 'Show', body: 'The higher card takes the pot.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Losing all your chips** means elimination.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Folding a 10** costs a ten-chip penalty.',
      'On a tie the pot goes to the winner of the next hand.',
      'New in the Grand Final: seeing your own card before the reveal voids the hand, and the chips already bet go to the opponent.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Indian poker inverts normal poker: you know their card, not yours. Judge by **how high their card is** and **how they bet after seeing yours**. Against a 2 you usually win, so bet big; against a 9 you usually lose, so fold.' },
    { type: 'cards', items: [
      { title: 'Their bet is your card', body: 'They bet having seen your card; caution behind a high card of theirs may mean yours is high. Big bets from you make them wonder if theirs is low, which is why bluffs work.' },
      { title: 'The weight of the 10 penalty', body: 'Folding a 10 costs ten chips, so while a 10 might be on your forehead, folding is expensive. Counting the 10s already seen feeds that decision.' },
      { title: 'Counting', body: 'The same twenty-card deck runs to the end, so tracking what has gone tells you what remains, and late in the deck your own card narrows down.' },
    ], columns: 1 },
    { type: 'p', text: 'The new "seeing your card voids the hand" rule can work as a penalty-free fold: facing a big bet when you might hold a 10, you give up only the chips already bet. Even the loopholes belong in the calculation.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Indian Poker matches the twenty-card deck, one-chip ante, call/raise/fold, ten-chip penalty for folding a 10 and ties carrying over.',
      'On the site both players start with 20 chips.',
      'Your own card is never shown on screen, so there is no void-on-peeking rule.',
      'Solo you play a three-level AI; with a friend you play one-on-one by link. Turns are 30 seconds against the AI and 20, 30 or 45 in friend rooms; a timeout folds.',
    ] },
  ],
  similar: [
    { name: 'Blind Man’s Bluff', players: '2+', alike: 'The same forehead-card poker variant.', differs: 'Usually played with a 52-card deck; penalties vary by house.' },
    { name: 'Hanabi', players: '2–5', alike: 'You see everyone’s cards but your own and deduce yours from their actions.', differs: 'It is cooperative, with no betting.' },
  ],
});

export const monorail = g4Game({
  slug: 'monorail', kind: 'death', ep: 6, related: ['wallgo', 'janggi', 'laserJanggi'], check: 'site',
  extra: [namuGame('모노레일(게임)', 'Monorail (game)'), wikiSeason('The_Genius:_Black_Garnet')],
  site: { id: 'monorail', name: { ko: '모노레일', en: 'Monorail' }, file: 'src/lib/monorail.ts' },
}, {
  meta: {
    title: '모노레일 규칙 — 더 지니어스 그랜드 파이널 6회전 데스매치, 순환선을 완성하는 마지막 타일',
    description: '더 지니어스: 그랜드 파이널 6회전 데스매치 모노레일의 규칙을 정리했어요. 기차역 타일 2장과 양면 철로 타일 16장, 한 번에 1–3장을 일렬로, 놓을 때는 연결되지 않아도 됨, 순환선을 완성하는 사람이 승리, "불가능" 선언, PUZZLTHINK에서 바로 플레이와 방송 규칙과의 차이까지.',
    keywords: ['모노레일', '모노레일 게임', '더 지니어스 모노레일', '그랜드 파이널 데스매치', '더 지니어스 4', '베니스 커넥션'],
  },
  title: '모노레일 — 더 지니어스: 그랜드 파이널 6회전 데스매치',
  name: '모노레일',
  lead: '두 사람이 철로 타일을 번갈아 1–3장씩 놓아, 기차역에서 출발해 기차역으로 돌아오는 하나의 순환선을 마지막으로 완성하는 사람이 이겨요.',
  summary: '양면 철로 타일 16장을 번갈아 놓아 순환선을 완성하는 마지막 수를 노리는 1:1 추상 전략 게임. 블랙가넷에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**타일**: 양쪽 끝이 열린 기차역 타일 2장과, 철로 타일 16장. 철로 타일은 양면으로, 앞면은 직선, 뒷면은 ㄱ자 곡선이에요.',
      '**재등장**: 「더 지니어스: 블랙가넷」의 데스매치로 처음 나왔어요. 이 시즌의 데스매치 중 유일하게 규칙이 하나도 바뀌지 않았고, 타일 디자인만 달라졌어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타일 놓기', body: '선부터 번갈아 차례마다 타일을 1–3장 놓아요. 시간 제한은 없어요. 앞뒷면은 원하는 대로 골라요.' },
      { title: '놓는 위치', body: '이미 놓인 타일의 상하좌우 한 면에 닿게 놓아야 해요. 철로가 바로 이어지게 놓을 필요는 없어요. 2장 이상 놓을 때는 나란히 일렬로 놓아요.' },
      { title: '완성', body: '16장을 다 쓸 필요는 없지만, 완성된 철로는 이미 놓인 타일이 모두 하나로 이어진 순환선이어야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '기차역에서 기차역으로 이어지는 순환선을 완성하는 **마지막 타일을 놓은 사람**이 이겨요.',
      '자기 차례 시작에 남은 타일로는 순환선을 만들 수 없다고 보면 **"불가능"**을 선언할 수 있어요. 그러면 상대가 남은 타일로 완성해야 하고, 해내면 상대가, 못 하면 선언한 사람이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '두 순환선을 따로 만든 채 타일이 다 떨어지는 경우처럼, 아무도 완성하지 못하고 아무도 불가능을 선언하지 않는 상황에 대한 규칙은 정리되어 있지 않아요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '모노레일은 운이 없는 완전 정보 게임이라, 이론적으로는 매 국면 이기는 쪽이 정해져 있어요. 사람이 실전에서 쓸 수 있는 핵심은 두 가지예요. **순환선은 늘 짝수 칸**이고, **한 차례에 최대 3장**까지 놓을 수 있다는 것이에요.' },
    { type: 'cards', items: [
      { title: '남은 칸 수 세기', body: '완성까지 1–3칸이 남은 상태로 차례를 넘겨받으면 바로 끝낼 수 있어요. 그래서 내 차례가 끝날 때 완성까지 남은 칸이 4칸(또는 4의 배수)이 되게 넘기는 것이 기본 원리예요. 상대가 무엇을 놓든 다음에 내가 끝낼 수 있게 되거든요.' },
      { title: '우회로 차례를 바꾼다', body: '불리한 칸 수를 넘겨받았다면, 철로를 돌아가게 만들어 필요한 칸 수를 늘리는 것이 방어예요. 순환선은 짝수라 우회하면 2칸씩 늘어나요. 하지만 타일은 16장뿐이라 우회할수록 한도에 가까워지고, 그때 "불가능" 선언이 무기가 돼요.' },
      { title: '연결 안 된 타일의 위험', body: '놓을 때는 이어지지 않아도 되지만, 완성할 때는 모든 타일이 한 순환선에 들어가야 해요. 엉뚱한 곳에 놓인 타일은 나중에 반드시 끌어안아야 할 짐이라, 상대에게 그런 타일을 놓게 하거나 그런 타일로 상대의 완성을 막는 수도 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '곡선 타일은 철로의 방향을 두 곳에 고정해요. 상대가 우회할 길목에 곡선을 먼저 놓으면 선택지가 크게 줄어요. 결국 "몇 번 더 우회할 수 있는가"를 16장 안에서 세는 사람이 이겨요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 모노레일은 기차역 2장, 양면 철로 16장, 한 번에 1–3장 일렬, 놓을 때 연결 불필요, 마지막 타일 승리, 불가능 선언(상대가 완성해 보여야 함)까지 방송과 같아요.',
      'AI(중간·어려움)와 둘 때는 내가 선공이고 시간 제한이 없어요. AI는 완성이 불가능해지는 수를 두지 않아요.',
      '친구 방과 오픈 대전에서는 선공을 무작위로 정하고, 턴 시간(90·60·30초)이 지나면 시간패예요. 방송에는 시간 제한이 없었어요.',
      '사이트의 판은 16장으로 만들 수 있는 모든 순환선이 들어가도록 크게 잡혀 있어, 판 가장자리가 결과를 바꾸지 않아요.',
    ] },
  ],
  similar: [
    { name: '베니스 커넥션 (Venice Connection)', players: '2명', alike: '알렉스 랜돌프가 만든 원작 게임으로, 직선·곡선 양면 타일을 1–3장씩 놓아 고리를 닫는 사람이 이겨요. 모노레일과 거의 같아요.', differs: '판이 운하 그림이고, 세부 규칙 표기가 조금 달라요.' },
    { name: '트랙스 (Trax)', players: '2명', alike: '양면 타일을 놓아 선으로 고리를 만드는 추상 전략 게임이에요.', differs: '트랙스는 각자 자기 색의 고리나 긴 선을 만들면 이기고, 놓을 때 선이 반드시 이어져야 해요.' },
  ],
}, {
  meta: {
    title: 'Monorail rules — The Genius: Grand Final round 6 death match',
    description: 'The rules of Monorail (모노레일), round 6 death match of The Genius: Grand Final: two station tiles and sixteen double-sided rail tiles, one to three tiles in a row per turn, no need to connect while placing, the player who completes the loop wins, the Impossible call, and how the playable PUZZLTHINK version differs.',
    keywords: ['Monorail', 'The Genius Grand Final', 'death match', 'Venice Connection', '모노레일'],
  },
  title: 'Monorail — The Genius: Grand Final round 6 death match',
  name: 'Monorail (모노레일)',
  lead: 'Two players take turns placing one to three rail tiles; whoever completes the single loop from the station back to the station wins.',
  summary: 'An abstract duel with sixteen double-sided rail tiles: aim to place the tile that closes the loop. First played in Black Garnet.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Tiles**: two station tiles open at both ends and sixteen rail tiles, straight on one side and curved on the other.',
      '**Returning game**: first a death match in The Genius: Black Garnet; the only death match this season whose rules did not change at all (only the tile design did).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Place', body: 'From the first player, take turns placing one to three tiles, either face up, with no time limit.' },
      { title: 'Where', body: 'Tiles must touch an existing tile on a side; track ends need not connect yet. Two or more tiles go in one straight row.' },
      { title: 'Complete', body: 'Not all sixteen tiles must be used, but the finished track must include every placed tile in one loop.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The player who places the last tile** of a loop from station to station wins.',
      'At the start of your turn you may call **"Impossible"** if the remaining tiles cannot complete a loop; the opponent must then complete it with what remains, winning if they do and losing if they can’t.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'No rule covers a position where nobody can complete and nobody calls Impossible, such as two separate loops using up every tile.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Monorail has no luck, so in theory every position is a win for one side. Two facts matter in practice: **a loop always has an even number of tiles**, and **you may place at most three per turn**.' },
    { type: 'cards', items: [
      { title: 'Count what’s left', body: 'Receiving a position one to three tiles from completion lets you finish; so leave four (or a multiple of four) after your turn and you can finish whatever they do.' },
      { title: 'Detours change the count', body: 'Given a bad count, bend the track to need more tiles; loops are even, so a detour adds two. With only sixteen tiles, detours run out, and that is where Impossible becomes a weapon.' },
      { title: 'Stray tiles', body: 'Placed tiles need not connect, but every one must join the final loop, so a stray tile is a burden someone must absorb, and can be used to block a completion.' },
    ], columns: 1 },
    { type: 'p', text: 'Curves fix the track’s direction in two places; laying one where the opponent would detour cuts their options. The player who counts how many detours remain within sixteen tiles wins.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Monorail matches the two stations, sixteen double-sided tiles, one to three in a row, no need to connect while placing, last-tile win and the Impossible call (the opponent must prove a completion).',
      'Against the AI (normal or hard) you move first with no time limit, and the AI never makes a loop impossible.',
      'Friend rooms and open matches choose the first player at random and lose on timeout (90, 60 or 30 seconds); the broadcast had no time limit.',
      'The site’s board is large enough for every loop sixteen tiles can make, so the edge never decides a game.',
    ] },
  ],
  similar: [
    { name: 'Venice Connection', players: '2', alike: 'Alex Randolph’s original: place one to three double-sided straight/curve tiles; close the loop to win. Almost identical.', differs: 'A canal theme and slightly different rule wording.' },
    { name: 'Trax', players: '2', alike: 'An abstract tile game about forming loops from double-sided tiles.', differs: 'Each player builds a loop or long line in their own colour, and lines must always connect.' },
  ],
});
