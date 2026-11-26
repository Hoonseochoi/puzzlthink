// 더 지니어스: 그랜드 파이널, death matches of rounds 7–11: 같은 그림 찾기, 결! 합!, 콰트로, 양면포커, 십이장기.
import { g4Game, namuGame, wikiSeason } from './shared';

const POOL_KO = '이 시즌의 데스매치 11종은 모두 이전 시즌에 나온 게임이고, 시즌 시작 전에 목록이 공개됐어요. 한 번 쓴 종목은 다시 나오지 않아, 회전이 지날수록 남은 종목이 줄어요.';
const POOL_EN = 'All eleven death matches this season came from earlier seasons and were announced in advance; a game once played was not used again, so the pool shrank each round.';

export const samePictureHunt = g4Game({
  slug: 'same-picture-hunt', kind: 'death', ep: 7, related: ['hexagon', 'gyulhap', 'nemoCount'], check: 'wiki',
  extra: [namuGame('같은 그림 찾기', 'Same Picture Hunt'), wikiSeason('The_Genius:_Rules_of_the_Game')],
}, {
  note: '그랜드 파이널의 출발 위치(12번째 칸)와 동전 던지기는 나무위키에서만 확인했어요.',
  meta: {
    title: '같은 그림 찾기 규칙 — 더 지니어스 그랜드 파이널 7회전 데스매치, 컨베이어 벨트 위의 그림을 찾아라',
    description: '더 지니어스: 그랜드 파이널 7회전 데스매치 같은 그림 찾기의 규칙을 정리했어요. 알파벳 16칸 뒤의 그림 16장, 20칸 개인 컨베이어 벨트, 맞히면 전진하고 이어서 한 번 더, 틀리면 벨트가 한 칸 후진, 결승점 도착 또는 벨트 밖으로 떨어지면 승패, 이전 시즌과 달라진 출발 위치와 승부처까지.',
    keywords: ['같은 그림 찾기', '더 지니어스 같은 그림 찾기', '그랜드 파이널 데스매치', '더 지니어스 4', '기억력 게임'],
  },
  title: '같은 그림 찾기 — 더 지니어스: 그랜드 파이널 7회전 데스매치',
  name: '같은 그림 찾기',
  lead: '알파벳 16칸 뒤에 그림 16장이 숨어 있어요. 내 컨베이어 벨트 위의 다음 그림과 같은 그림을 판에서 찾아 뒤집으면 한 칸 전진, 틀리면 벨트가 한 칸 밀려나요.',
  summary: '함께 쓰는 그림판에서 벨트 위 그림의 위치를 기억해 맞히며 결승점까지 전진하는 1:1 기억력 레이스. 게임의 법칙에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**그림판**: 앞면에 알파벳 16개, 뒷면에 서로 다른 그림 16장. 두 사람이 같은 판을 써요.',
      '**컨베이어 벨트**: 각자 20칸짜리 벨트에 그림 카드가 채워져 있어요. 그림판의 그림 16장을 세 묶음 섞어 첫 빈칸부터 채워요.',
      '**출발과 선**: 그랜드 파이널에서는 두 사람 모두 벨트에 표시된 12번째 칸에서 출발하고, 선후공은 동전 던지기로 정했어요. 시즌 1·2에서는 가넷이 많은 사람이 10번째, 적은 사람이 8번째에서 출발했어요.',
      '**재등장**: 「더 지니어스: 게임의 법칙」에서 처음 나왔고, 룰 브레이커에서도 쓰였어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '찾기', body: '내 말의 다음 칸에 있는 그림과 같은 그림을 그림판에서 골라 알파벳을 뒤집어요.' },
      { title: '맞히면', body: '한 칸 전진하고, 이어서 그림판을 한 번 더 확인할 수 있어요. 맞히는 한 차례가 계속돼요.' },
      { title: '틀리면', body: '컨베이어 벨트가 한 칸 뒤로 밀리고 맨 앞에 새 그림 카드가 채워져요. 그리고 상대에게 차례가 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '먼저 **결승점에 도착**한 사람이 이겨요.',
      '틀려서 벨트가 밀리다가 **말이 벨트 밖으로 떨어지면** 그 사람이 져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '그림판의 알파벳 배치와 그림 카드 디자인은 시즌마다 같았다고 정리되어 있어요. 연습한 사람에게 유리했다는 평가가 나온 이유예요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '그림판이 하나라는 점이 이 게임의 핵심이에요. **내가 뒤집은 칸은 상대도 봐요.** 그래서 틀리면 벨트가 밀리는 손해에 더해, 상대에게 새 그림의 위치를 알려 주는 손해까지 생겨요. 반대로 상대가 틀릴 때마다 나는 공짜로 정보를 얻어요.' },
    { type: 'cards', items: [
      { title: '상대가 연 칸부터', body: '상대가 이미 연 칸만 골라 쓰면 내 시도가 상대에게 새 정보를 주지 않아요. 다음 그림이 아직 아무도 열지 않은 칸에 있다면, 그때가 위험을 감수해야 하는 순간이에요.' },
      { title: '연속 성공의 힘', body: '맞히면 차례가 이어지니, 위치를 많이 기억할수록 한 차례에 여러 칸을 갈 수 있어요. 벨트 위 그림은 16장이 세 번씩 섞여 있으니, 한 번 외운 위치는 같은 게임에서 여러 번 다시 써요.' },
      { title: '남은 여유 칸', body: '12번째 칸 출발이면 틀릴 수 있는 여유가 정해져 있어요. 처음 몇 번은 모르는 칸을 열 수밖에 없지만, 여유가 줄어들수록 확실한 칸만 여는 쪽으로 바꿔야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '운도 있지만, 그림판 배치가 시즌마다 같았다는 점 때문에 결국 **연습과 기억력**의 게임이에요. 같은 조건에서는 처음 몇 번의 시도를 상대가 이미 연 칸으로 아끼는 사람이 유리해요.' },
  ],
  similar: [
    { name: '메모리 (Memory, Concentration)', players: '1–8명', alike: '모두가 같은 뒤집힌 카드를 보고, 다른 사람이 연 카드의 위치까지 기억해 짝을 맞혀요. 맞히면 한 번 더 해요.', differs: '메모리는 같은 그림 두 장을 짝짓고, 벨트나 전진 같은 레이스 요소가 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '두 카드 사이의 같은 그림을 누가 먼저 찾느냐로 겨뤄요.', differs: '도블은 모든 그림이 공개된 순발력 게임이고, 기억할 필요가 없어요.' },
  ],
}, {
  note: 'The Grand Final’s starting space (the 12th) and coin toss were confirmed only in the fan wiki.',
  meta: {
    title: 'Same Picture Hunt rules — The Genius: Grand Final round 7 death match',
    description: 'The rules of Same Picture Hunt (같은 그림 찾기), round 7 death match of The Genius: Grand Final: 16 pictures behind 16 letters, a 20-space conveyor belt each, advance and go again on a match, the belt slides back on a miss, reaching the end or falling off, and the season’s new starting position.',
    keywords: ['Same Picture Hunt', 'The Genius Grand Final', 'death match', '같은 그림 찾기'],
  },
  title: 'Same Picture Hunt — The Genius: Grand Final round 7 death match',
  name: 'Same Picture Hunt (같은 그림 찾기)',
  lead: 'Sixteen pictures hide behind sixteen letters. Flip the one matching the next picture on your conveyor belt to step forward; miss and the belt slides back.',
  summary: 'A memory race on a shared board: match the pictures on your belt to reach the end. First played in Rules of the Game.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Board**: 16 letters in front, 16 different pictures behind, shared by both players.',
      '**Belts**: each has a 20-space belt of picture cards, filled from three shuffled sets of the 16 pictures.',
      '**Start and first player**: in the Grand Final both started from the marked 12th space and a coin toss decided who went first (in seasons 1 and 2 the garnet leader started at the 10th and the other at the 8th).',
      '**Returning game**: first in The Genius: Rules of the Game, also used in Rule Breaker.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find', body: 'Flip the letter you think hides the picture on the next space of your belt.' },
      { title: 'Match', body: 'Advance one space and look again: your turn continues while you keep matching.' },
      { title: 'Miss', body: 'Your belt slides back one space, a new card fills the front, and the turn passes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to **reach the end** wins.',
      'A player whose piece **falls off the belt** after misses loses.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The letter layout and picture designs were reportedly the same every season, which is why practice was said to pay off.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'One shared board is the key: **whatever you flip, your opponent sees**. A miss costs you a space and also tells them where a new picture is, while each of their misses informs you for free.' },
    { type: 'cards', items: [
      { title: 'Use their tiles first', body: 'Picking only tiles your opponent already opened gives them nothing new; when your next picture is behind an unopened tile, that is when you must take a risk.' },
      { title: 'Streaks', body: 'Matches keep your turn, so the more you remember the further you go per turn, and with each picture appearing three times, every location learned is reused.' },
      { title: 'Spare spaces', body: 'Starting on the 12th space sets how many misses you can afford; early misses are unavoidable, but as the margin shrinks, open only tiles you are sure of.' },
    ], columns: 1 },
    { type: 'p', text: 'There is luck, but with the same board every season it is mostly **practice and memory**. On equal terms, saving early guesses for tiles your opponent opened gives the edge.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1–8', alike: 'Everyone watches the same face-down cards and remembers others’ flips; a match earns another go.', differs: 'You pair identical cards; there is no belt or race.' },
    { name: 'Dobble (Spot It!)', players: '2–8', alike: 'Race to spot the matching picture first.', differs: 'All pictures are visible; it is about speed, not memory.' },
  ],
});

export const gyulHap = g4Game({
  slug: 'gyul-hap', kind: 'death', ep: 8, related: ['hexagon', 'colorlink', 'nemoCount'], check: 'site',
  extra: [namuGame('결! 합!', 'Gyul! Hap!'), wikiSeason('The_Genius:_Rules_of_the_Game')],
  site: { id: 'gyulhap', name: { ko: '결! 합!', en: 'Gyul! Hap!' }, file: 'src/lib/gyulhap.ts' },
}, {
  meta: {
    title: '결! 합! 규칙 — 더 지니어스 그랜드 파이널 8회전 데스매치, 합을 찾고 결을 외쳐라',
    description: '더 지니어스: 그랜드 파이널 8회전 데스매치 결! 합!의 규칙을 정리했어요. 모양·배경색·도형색 세 속성의 27장 중 9장, 속성마다 모두 같거나 모두 다른 3장이 합, 10초 차례와 5초 호명, 합 +1·오답 −1, 결 +3·−1, 합을 맞힌 뒤 5초 결 기회, 10라운드와 PUZZLTHINK에서 바로 플레이까지.',
    keywords: ['결합', '결! 합!', '결합 게임', '더 지니어스 결합', '그랜드 파이널 데스매치', '더 지니어스 4'],
  },
  title: '결! 합! — 더 지니어스: 그랜드 파이널 8회전 데스매치',
  name: '결! 합!',
  lead: '그림 9장 중 세 속성이 각각 모두 같거나 모두 다른 3장을 찾아 "합"을, 더 찾을 게 없으면 "결"을 외쳐요. 더 지니어스 네 시즌에 모두 나온 유일한 게임이에요.',
  summary: '9장의 그림에서 세 속성이 모두 같거나 모두 다른 3장(합)을 찾고, 남은 합이 없을 때 결을 외치는 1:1 패턴 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**그림 27장**: 모양(해·달·별), 배경색(검정·회색·흰색), 도형색(주황·초록·보라)이 모두 다르게 조합된 27장. 라운드마다 그중 9장이 공개돼요.',
      '**라운드**: 10라운드.',
      '**재등장**: 「더 지니어스: 게임의 법칙」 결승에서 처음 나왔고, 네 시즌 모두에 등장했어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '합 찾기', body: '두 사람이 번갈아 10초씩 차례를 가져요. 합을 찾았으면 "합"을 외치고 5초 안에 세 그림의 번호를 불러요.' },
      { title: '합의 조건', body: '모양, 배경색, 도형색 세 속성 각각이 세 장 모두 같거나 세 장 모두 달라야 해요. 하나라도 "둘만 같은" 속성이 있으면 합이 아니에요.' },
      { title: '점수', body: '맞으면 +1점, 틀리면 −1점이에요. "합"을 외치고 5초 안에 번호를 못 대거나, 이미 나온 합을 다시 말해도 −1점이에요. 10초 동안 아무것도 부르지 않으면 점수 변화 없이 차례가 넘어가요.' },
      { title: '결', body: '남은 합이 없다고 판단되면 "결"을 외쳐요. 맞으면 +3점이고 라운드가 끝나요. 합이 남아 있으면 −1점이에요.' },
      { title: '이번 시즌의 변경', body: '합을 맞힌 사람에게는 차례가 바로 넘어가지 않고, **5초 동안 결을 외칠 기회**가 주어져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '10라운드 뒤 승점이 더 많은 사람이 이겨요. 진 사람은 탈락이에요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '세 장의 순서는 상관없어요. 같은 세 장을 다른 순서로 불러도 이미 나온 합이에요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '합을 찾는 가장 빠른 방법은 **두 장을 고르면 세 번째가 하나로 정해진다**는 성질을 쓰는 거예요. 속성마다 두 장이 같으면 세 번째도 같은 값, 다르면 남은 하나의 값이에요. 그러니 쌍을 고른 뒤 "그 세 번째 그림이 판에 있는가"만 보면 돼요. 9장에서 만들 수 있는 쌍은 36개예요.' },
    { type: 'cards', items: [
      { title: '결의 3점이 크다', body: '합 하나는 1점, 결은 3점이에요. 판마다 합의 수가 다르고 결은 라운드를 끝내니, 모든 합을 빠짐없이 셌는지가 점수의 상당 부분을 정해요. 틀린 결은 −1점이라, 확신 없는 결은 손해예요.' },
      { title: '이번 시즌 변경이 바꾼 것', body: '원래 규칙에서는 마지막 합을 맞히면 차례가 상대에게 넘어가, 상대가 결로 3점을 가져갈 수 있었어요. 그래서 마지막 합을 일부러 남겨 두는 수싸움이 있었죠. 이 시즌에는 합을 맞힌 사람이 5초 안에 결도 외칠 수 있어, **마지막 합을 찾은 사람이 합 1점과 결 3점을 함께** 가져갈 수 있어요. 마지막 합을 찾는 것의 가치가 크게 올라갔어요.' },
      { title: '틀리면 손해, 넘기면 0', body: '모르면 넘기는 것이 0점이고 틀리면 −1점이에요. 상대가 빠르다면 내 차례에 하나라도 확실한 합을 잡는 것이 중요하고, 애매하면 넘겨 상대의 실수를 기다리는 것도 방법이에요.' },
    ], columns: 1 },
    { type: 'p', text: '지배 전략은 없어요. 패턴 인식 속도가 기본이고, 그 위에 "지금까지 나온 합 목록을 정확히 기억해 남은 합이 몇 개인지 세는 능력"이 결 타이밍을 정해요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 결! 합!은 27장 중 9장, 합의 조건, 합 +1·−1, 결 +3·−1, 10라운드까지 방송과 같아요.',
      '사이트는 이 시즌의 "합 뒤 5초 결 기회" 없이, 합을 맞히면 차례가 다음 사람에게 넘어가는 원래 규칙을 따라요.',
      '그림은 동그라미·세모·네모, 파랑·빨강·노랑 도형, 흰색·회색·검정 배경으로 이루어져 있어요.',
      '친구 방에서는 2–4명이 차례로 겨루고, 차례 시간은 10·15·20초 중 방장이 골라요. 시간이 지나면 넘기기가 돼요. 혼자서는 10분·5분 챌린지와 시간 제한 없는 연습을 할 수 있어요.',
    ] },
  ],
  similar: [
    { name: '셋 (SET)', players: '1명 이상', alike: '속성마다 모두 같거나 모두 다른 카드 세 장을 찾는 규칙이 같아요.', differs: '셋은 속성이 네 개(81장)이고 12장을 펼쳐 놓고 동시에 찾아요. 결 같은 선언은 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '그림 사이의 관계를 누가 먼저 찾느냐를 겨루는 패턴 인식 게임이에요.', differs: '도블은 두 카드에 공통으로 있는 그림 하나를 찾는 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Gyul! Hap! rules — The Genius: Grand Final round 8 death match',
    description: 'The rules of Gyul! Hap! (결! 합!), round 8 death match of The Genius: Grand Final: nine of 27 cards with shape, background and figure colour, sets that are all-same or all-different per feature, 10-second turns and 5 seconds to name, hap +1/−1, gyul +3/−1, the new five-second gyul chance after a hap, ten rounds, and the playable PUZZLTHINK version.',
    keywords: ['Gyul Hap', 'Gyul! Hap!', 'The Genius Grand Final', 'death match', '결합'],
  },
  title: 'Gyul! Hap! — The Genius: Grand Final round 8 death match',
  name: 'Gyul! Hap! (결! 합!)',
  lead: 'Among nine pictures, find three whose every feature is all the same or all different and call "Hap!"; when none remain, call "Gyul!". The only game to appear in all four seasons.',
  summary: 'A one-on-one pattern duel: find sets (hap) among nine cards and call gyul when none remain.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**27 cards**: every combination of shape (sun, moon, star), background (black, grey, white) and figure colour (orange, green, purple); nine are shown each round.',
      '**Rounds**: 10.',
      '**Returning game**: first in The Genius: Rules of the Game’s final, and in every season since.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find a hap', body: 'Players alternate ten-second turns; call "Hap!" and name three card numbers within five seconds.' },
      { title: 'What counts', body: 'For shape, background and figure colour, the three cards must be all the same or all different; any feature where exactly two match spoils it.' },
      { title: 'Scoring', body: 'Right +1, wrong −1; failing to name in five seconds after calling, or repeating a found hap, is also −1. Ten silent seconds pass the turn with no change.' },
      { title: 'Gyul', body: 'Call "Gyul!" if no haps remain: +3 and the round ends if right, −1 if a hap is left.' },
      { title: 'New this season', body: 'After a correct hap the turn does not pass at once: the finder gets **five seconds to call gyul**.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After ten rounds the higher score wins; the loser is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Order does not matter: the same three cards in another order are a repeat.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The fastest method: **any two cards fix the third**. Where the pair matches, the third matches; where it differs, the third has the remaining value. Pick a pair and check whether that card is on the table; nine cards give 36 pairs.' },
    { type: 'cards', items: [
      { title: 'Gyul is worth three', body: 'A hap is 1 point, a gyul 3. Hap counts vary by board, and gyul ends the round, so counting every hap matters; a wrong gyul is −1.' },
      { title: 'What the change did', body: 'Under the original rules, finding the last hap passed the turn and let the opponent take gyul’s 3 points, so players sometimes left the last hap alone. This season the finder can call gyul within five seconds, so **whoever finds the last hap can take 1 + 3**, greatly raising its value.' },
      { title: 'Wrong costs, passing is zero', body: 'Passing scores nothing and a miss costs one; against a fast opponent grab one sure hap per turn, and when unsure, pass and wait for their mistake.' },
    ], columns: 1 },
    { type: 'p', text: 'No strategy dominates; recognition speed is the base, and remembering exactly which haps have been called to know how many remain decides when to call gyul.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Gyul! Hap! matches the nine-of-27 deal, the set rule, hap +1/−1, gyul +3/−1 and ten rounds.',
      'The site follows the original rule: after a hap the turn passes, without this season’s five-second gyul chance.',
      'Its cards use circle, triangle and square, blue, red and yellow figures, and white, grey and black backgrounds.',
      'Friend rooms take two to four players with 10, 15 or 20-second turns chosen by the host (a timeout passes); solo there are 10- and 5-minute challenges and untimed practice.',
    ] },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'The same all-same-or-all-different rule for three cards.', differs: 'Four features (81 cards), twelve cards out, everyone searching at once, no gyul call.' },
    { name: 'Dobble (Spot It!)', players: '2–8', alike: 'A race to spot relationships between pictures.', differs: 'You find the one symbol two cards share.' },
  ],
});

export const quattro = g4Game({
  slug: 'quattro', kind: 'death', ep: 9, related: ['twoSidedPoker', 'indianPoker', 'hitStay'], check: 'wiki',
  extra: [wikiSeason('The_Genius:_Rule_Breaker')],
}, {
  note: '이 시즌의 카드 구성(1–6과 0 두 장)과 가상 플레이어 규칙은 나무위키에서만 확인했어요. 룰 브레이커의 원래 콰트로는 관전 플레이어와 교환했어요.',
  meta: {
    title: '콰트로 규칙 — 더 지니어스 그랜드 파이널 9회전 데스매치, 숫자와 색이 모두 다른 4장',
    description: '더 지니어스: 그랜드 파이널 9회전 데스매치 콰트로의 규칙을 정리했어요. 1–6 네 색과 검정 0 두 장의 26장, 4장씩 받고 멀리건 2번, 가상 플레이어 6명과 한 번씩 교환, 가상 플레이어의 교환 규칙, 카드 공개 순서, 콰트로 합계 비교와 승부처까지.',
    keywords: ['콰트로', '더 지니어스 콰트로', '그랜드 파이널 데스매치', '더 지니어스 4', '룰 브레이커 데스매치'],
  },
  title: '콰트로 — 더 지니어스: 그랜드 파이널 9회전 데스매치',
  name: '콰트로',
  lead: '숫자와 색이 모두 다른 카드 4장을 "콰트로"라고 해요. 가상 플레이어 여섯과 카드를 바꿔 가며 합이 더 큰 콰트로를 만드는 사람이 이겨요.',
  summary: '가상 플레이어 6명과 한 번씩 카드를 바꿔, 숫자와 색이 모두 다른 4장의 합을 겨루는 1:1 카드 게임. 룰 브레이커에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명과 가상 플레이어 6명.',
      '**카드 26장**: 빨강·파랑·노랑·초록의 1–6, 그리고 검정 0 두 장.',
      '**배분**: 딜러가 탈락후보에게 4장씩 줘요. 마음에 들지 않으면 최대 두 번까지 멀리건을 요청해 새 4장으로 바꿀 수 있어요. 남은 18장은 가상 플레이어 6명에게 3장씩 나눠요.',
      '**재등장**: 「더 지니어스: 룰 브레이커」의 데스매치로 처음 나왔어요. 그때는 관전 플레이어와 교환했고, 카드도 1–10 네 색이었어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '첫 공개', body: '두 사람이 자기 카드 4장 중 한 장을 공개해요.' },
      { title: '교환', body: '정해진 순서(A–B–B–A–A–B…처럼 두 번씩 번갈아)로 가상 플레이어와 카드를 바꿀지 정해요. 내가 내준 카드는 공개되고, 가상 플레이어의 카드는 공개되지 않아요.' },
      { title: '가상 플레이어의 규칙', body: '가상 플레이어는 정해진 규칙으로 줄 카드를 골라요. 0이 있으면 무조건 0을 줘요. 그렇지 않으면 ① 상대가 공개한 카드를 보고 콰트로를 완성시킬 수 있는 가장 좋은 카드, ② 그런 카드가 없으면 숫자가 가장 높은 카드, ③ 가장 높은 숫자가 여럿이면 빨강·파랑·노랑·초록 순으로 줘요.' },
      { title: '다음 카드 공개', body: '두 사람 모두 더 바꾸고 싶지 않으면 다음 카드를 공개해요. 공개된 카드는 교환할 수 없어요.' },
      { title: '교환 의무', body: '교환 순서는 자유지만, 4장을 모두 공개하기 전까지 가상 플레이어 6명과 한 번씩 반드시 교환해야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '마지막 카드를 공개했을 때 둘 다 콰트로면 **숫자 합이 큰 사람**이 이겨요. 합이 같으면 더 높은 숫자 카드를 가진 사람이 이겨요.',
      '한 명만 콰트로를 완성했다면, 완성하지 못한 사람이 져요.',
      '둘 다 못 만들었다면 4장의 합이 큰 사람이, 같으면 가장 큰 숫자 카드를 가진 사람이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '0 카드도 다른 색·다른 숫자로 인정해, 공개된 4장 안에 있어도 콰트로를 완성할 수 있어요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '가장 큰 콰트로는 6·5·4·3을 네 색으로 맞춘 18이에요. 하지만 여섯 명과 반드시 한 번씩 바꿔야 해서, 좋은 카드를 들었어도 여섯 번 카드를 내줘야 해요. 그래서 이 게임은 **무엇을 언제 공개해 지킬지**가 핵심이에요. 공개한 카드는 교환할 수 없지만, 그만큼 안전하게 손에 남아요.' },
    { type: 'cards', items: [
      { title: '가상 플레이어는 예측할 수 있다', body: '가상 플레이어는 공개된 규칙대로만 움직여요. 그리고 규칙 ①은 "내가 공개한 카드"를 기준으로 콰트로를 완성시킬 카드를 줘요. 즉 공개한 카드가 곧 가상 플레이어에게 보내는 주문서예요. 무엇을 먼저 공개하느냐로 받을 카드를 유도할 수 있어요.' },
      { title: '0 카드 떠안기', body: '0이 있는 가상 플레이어는 무조건 0을 줘요. 0도 콰트로의 한 장이 될 수 있지만 합에는 0이라, 합 경쟁에서는 손해예요. 두 사람 모두 그 가상 플레이어와 언젠가는 교환해야 하니, 0을 누가 떠안느냐가 교환 순서 싸움이 돼요.' },
      { title: '상대의 교환을 본다', body: '내준 카드는 공개되니, 상대가 무엇을 버리는지 보면 상대가 어떤 콰트로를 노리는지 짐작할 수 있어요. 같은 가상 플레이어에게 남은 카드가 무엇인지도 서로의 교환으로 조금씩 드러나요.' },
    ], columns: 1 },
    { type: 'p', text: '멀리건 두 번은 시작 패의 품질을 높이지만, 결국 여섯 번의 교환이 판을 크게 바꿔요. 콰트로를 완성하지 못하면 합과 상관없이 지니, 합을 키우기 전에 먼저 **완성 가능성을 지키는 것**이 우선이에요.' },
  ],
  similar: [
    { name: '루미큐브 (Rummikub)', players: '2–4명', alike: '같은 숫자의 서로 다른 색 타일을 모으는 "그룹"이 콰트로와 닮았어요. 바꾸고 모으며 조합을 완성해요.', differs: '루미큐브는 연속 숫자의 같은 색 묶음도 쓰고, 패를 모두 내려놓는 것이 목표예요.' },
    { name: '진 러미 (Gin Rummy)', players: '2명', alike: '카드를 하나씩 바꿔 가며 정해진 조합을 완성하고, 상대가 버린 카드로 상대의 의도를 읽어요.', differs: '진 러미는 더미에서 가져오고, 남은 카드의 점수가 낮은 쪽이 유리해요.' },
  ],
}, {
  note: 'This season’s deck (1–6 plus two zeros) and virtual-player rules were confirmed only in the fan wiki; Rule Breaker’s original traded with spectators.',
  meta: {
    title: 'Quattro rules — The Genius: Grand Final round 9 death match',
    description: 'The rules of Quattro (콰트로), round 9 death match of The Genius: Grand Final: 26 cards (1–6 in four colours plus two black zeros), four cards each with up to two mulligans, one exchange with each of six virtual players, their fixed giving rules, revealing cards one by one, and comparing quattro totals.',
    keywords: ['Quattro', 'The Genius Grand Final', 'death match', '콰트로'],
  },
  title: 'Quattro — The Genius: Grand Final round 9 death match',
  name: 'Quattro (콰트로)',
  lead: 'A quattro is four cards that differ in both number and colour. Trade with six virtual players and build the higher-scoring quattro.',
  summary: 'Trade once with each of six virtual players to build four cards all different in number and colour. First played in Rule Breaker.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates and six virtual players.',
      '**26 cards**: 1–6 in red, blue, yellow and green, plus two black zeros.',
      '**Deal**: four cards to each candidate, who may ask for a fresh four up to twice; the other 18 go three each to the virtual players.',
      '**Returning game**: first a death match in The Genius: Rule Breaker, where candidates traded with spectators and cards ran 1–10.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First reveal', body: 'Each candidate turns one of their four cards face up.' },
      { title: 'Trades', body: 'In a fixed order (A–B–B–A–A–B…, two at a time), decide whether to trade with a virtual player; the card you give is shown, the card you get is not.' },
      { title: 'Virtual players’ rules', body: 'A virtual player with a zero always gives it. Otherwise: (1) the best card to complete a quattro given your revealed cards; (2) failing that, its highest number; (3) ties broken red, blue, yellow, green.' },
      { title: 'Next reveal', body: 'When neither wants to trade, reveal another card; revealed cards cannot be traded.' },
      { title: 'Trade obligation', body: 'Any order, but each candidate must trade once with all six virtual players before revealing all four cards.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'With both holding quattros, **the higher total** wins; on equal totals, the higher top card.',
      'If only one completed a quattro, the other loses.',
      'If neither did, the higher four-card total wins, then the highest card.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A zero counts as a distinct colour and number and can complete a quattro.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The best quattro is 6-5-4-3 in four colours, 18. But you must trade six times, so even a good hand gives cards away; the heart of the game is **what to reveal, and when, to protect it**. Revealed cards can’t be traded, and that keeps them safe.' },
    { type: 'cards', items: [
      { title: 'Virtual players are predictable', body: 'They follow public rules, and rule (1) is based on your revealed cards, so what you reveal is effectively your order form. Reveal first what steers them toward what you need.' },
      { title: 'Who eats the zero', body: 'A virtual player holding a zero must give it. A zero can complete a quattro but adds nothing, so it hurts in a total race; since both must trade with that player eventually, the order of trades decides who takes it.' },
      { title: 'Watch their discards', body: 'Given cards are public, so discards show what quattro your opponent is chasing, and each trade gradually reveals what a virtual player still holds.' },
    ], columns: 1 },
    { type: 'p', text: 'Two mulligans improve the start, but six trades reshape it. Failing to complete a quattro loses outright, so **keep completion possible** before chasing a higher total.' },
  ],
  similar: [
    { name: 'Rummikub', players: '2–4', alike: 'Groups of one number in different colours resemble a quattro, built by exchanging and collecting.', differs: 'Runs of one colour also count, and the aim is to empty your rack.' },
    { name: 'Gin Rummy', players: '2', alike: 'Swap cards one at a time toward set combinations and read the opponent from their discards.', differs: 'You draw from a pile, and low leftover points matter.' },
  ],
});

export const twoSidedPoker = g4Game({
  slug: 'double-sided-poker', kind: 'death', ep: 10, related: ['indianPoker', 'blackWhite2', 'hitStay'], check: 'site',
  extra: [namuGame('양면포커', 'Double-Sided Poker'), wikiSeason('The_Genius:_Black_Garnet')],
  site: { id: 'twoSidedPoker', name: { ko: '양면포커', en: 'Two-Sided Poker' }, file: 'src/lib/twoSidedPoker.ts' },
}, {
  meta: {
    title: '양면포커 규칙 — 더 지니어스 그랜드 파이널 10회전 데스매치, 앞면과 뒷면 중 어디에 걸까',
    description: '더 지니어스: 그랜드 파이널 10회전 데스매치 양면포커의 규칙을 정리했어요. 앞뒷면 홀짝이 다른 50종 ×4세트 200장, 칩 40개, 앞면은 공개·뒷면은 나만, 면 고르고 베팅, 양면베팅과 칩 10개 보너스, 무승부 이월, 블랙가넷에서 달라진 점, PUZZLTHINK에서 바로 플레이까지.',
    keywords: ['양면포커', '양면 포커', '더 지니어스 양면포커', '그랜드 파이널 데스매치', '더 지니어스 4', '블랙가넷 데스매치'],
  },
  title: '양면포커 — 더 지니어스: 그랜드 파이널 10회전 데스매치',
  name: '양면포커',
  lead: '앞뒤에 서로 다른 숫자가 적힌 카드를 한 장씩 받아요. 앞면은 모두에게, 뒷면은 나에게만 보여요. 어느 면으로 승부할지 골라 베팅해요.',
  summary: '앞면은 공개되고 뒷면은 나만 아는 양면 카드로, 면을 골라 베팅하는 1:1 포커. 블랙가넷에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**카드**: 앞뒷면 숫자가 다른 양면 카드 50종 4세트, 모두 200장. 숫자는 1–10이고, 앞면이 짝수면 뒷면은 홀수, 앞면이 홀수면 뒷면은 짝수예요.',
      '**칩**: 1인 40개.',
      '**재등장**: 「더 지니어스: 블랙가넷」의 데스매치로 처음 나왔어요. 그때는 90장, 칩 30개였어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드 받기', body: '딜러가 카드를 앞면이 보이게 한 장씩 놓아 줘요. 두 사람의 앞면은 공개되고, 뒷면은 본인만 확인할 수 있어요.' },
      { title: '면 고르고 베팅', body: '기본으로 칩 1개씩 낸 뒤, 선부터 앞면과 뒷면 중 어느 면으로 승부할지 정해 베팅해요. 한 번 정한 면은 바꿀 수 없어요.' },
      { title: '콜·레이즈·포기', body: '상대와 같은 수를 걸면 베팅이 끝나고 고른 면의 숫자를 공개해 높은 쪽이 이겨요. 더 걸면 공개하지 않고 이어가요. 포기하면 상대가 이겨요.' },
      { title: '양면베팅', body: '내 앞면과 뒷면이 모두 상대가 고른 면보다 높다고 보면 양면베팅을 할 수 있어요. 이때는 상대가 건 만큼을 앞면·뒷면 두 곳에 각각, 즉 두 배로 걸어야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**칩을 모두 잃은 사람이 패배**해 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '양면베팅은 두 숫자가 모두 상대의 숫자보다 높아야 이기고, 한 면이라도 같거나 낮으면 져요. 양면베팅으로 이기면 상대 칩 10개를 더 가져와요.',
      '상대가 양면베팅을 했을 때 포기해도 칩 10개를 줘야 해요. 양면베팅을 한 사람은 져도 10개를 주지 않아요.',
      '두 숫자가 같으면 무승부로, 걸린 칩은 다음 판의 승자가 가져가요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '양면포커의 정보는 네 가지예요. 내 앞면, 내 뒷면, 상대 앞면, 상대 뒷면. 그중 **세 가지를 내가 알아요.** 모르는 것은 상대 뒷면 하나뿐이라, 다른 포커보다 훨씬 "솔직한" 게임이에요. 상대도 마찬가지로 세 가지를 알아요. 그래서 승부는 상대 뒷면을 얼마나 잘 추리하느냐에 달려요.' },
    { type: 'cards', items: [
      { title: '홀짝 규칙이 준 단서', body: '이 시즌에는 앞뒷면의 홀짝이 늘 달라요. 상대 앞면이 짝수면 뒷면은 홀수라, 가능한 뒷면이 다섯 개로 줄어요. 대신 같은 숫자가 나올 확률이 커져 무승부가 잦아졌다는 평가도 있어요.' },
      { title: '양면베팅의 비대칭', body: '양면베팅을 먼저 하는 쪽은 져도 건 칩만 잃지만, 받는 쪽은 포기해도 10개를 내요. 그래서 좋은 카드일 때 먼저 양면베팅을 거는 것이 정석이에요. 받는 쪽은 뒷면에 크게 걸어 상대의 두 배 부담을 키우는 식으로 맞설 수 있어요.' },
      { title: '200장은 셀 수 없다', body: '블랙가넷의 90장과 달리 200장이라 모든 카드를 세는 것은 현실적으로 어려워요. 높은 뒷면(9·10)이 몇 장 나왔는지 정도를 세는 것이 실전적인 방법이에요.' },
    ], columns: 1 },
    { type: 'p', text: '한 번의 베팅으로 끝나는 구조라 평소의 블러핑은 효율이 낮아요. 블러핑이 힘을 쓰는 곳은 양면베팅을 막을 때예요. 좋은 카드를 기다리다가 확신이 서는 판에 크게 가는 인내심이 기본 전략이에요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 양면포커는 이 시즌의 규칙(홀짝이 다른 50종 ×4세트 200장, 칩 40개, 기본 베팅 1개)을 따라요. 면 고르기, 양면베팅의 두 배 베팅과 10개 보너스, 무승부 이월도 방송과 같아요.',
      '두 사람이 모두 양면베팅을 할 수는 없어요.',
      '혼자 하면 세 단계 AI와 두고 시간 제한이 없어요. 친구 방은 턴 시간을 20·30·45초 중에서 고르고, 시간이 지나면 포기로 처리되며 세 번 연속 놓치면 져요.',
    ] },
  ],
  similar: [
    { name: '블라인드 맨스 블러프 (인디언 포커)', players: '2명 이상', alike: '일부 정보는 나만, 일부는 상대만 아는 상태로 숫자 하나의 크기를 겨루며 베팅해요.', differs: '인디언 포커는 내 카드를 전혀 모르고, 양면포커는 내 카드의 두 면을 다 알아요.' },
    { name: '라이어스 다이스 (Liar’s Dice)', players: '2–6명', alike: '내 정보와 상대의 공개 행동으로 상대의 숨은 정보를 추리해 베팅해요.', differs: '라이어스 다이스는 주사위 개수를 부르는 입찰 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Double-Sided Poker rules — The Genius: Grand Final round 10 death match',
    description: 'The rules of Double-Sided Poker (양면포커), round 10 death match of The Genius: Grand Final: 200 cards (50 kinds with odd/even faces, four sets), 40 chips, fronts public and backs private, choosing a face to bet, the double-side bet and its ten-chip bonus, ties carrying over, what changed since Black Garnet, and the playable PUZZLTHINK version.',
    keywords: ['Double-Sided Poker', 'Two-Sided Poker', 'The Genius Grand Final', 'death match', '양면포커'],
  },
  title: 'Double-Sided Poker — The Genius: Grand Final round 10 death match',
  name: 'Double-Sided Poker (양면포커)',
  lead: 'Each card has a different number on each side; fronts are public, backs only you can see. Choose which side to play and bet.',
  summary: 'One-on-one poker with two-sided cards: front public, back private, pick a side and bet. First played in Black Garnet.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Cards**: 50 kinds of two-sided cards in four sets, 200 in all; numbers 1–10, and an even front always has an odd back and vice versa.',
      '**Chips**: 40 each.',
      '**Returning game**: first a death match in The Genius: Black Garnet, with 90 cards and 30 chips.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Deal', body: 'Each player gets a card front up; fronts are public, each back is seen only by its owner.' },
      { title: 'Choose a side and bet', body: 'After a one-chip ante, from the first player each chooses front or back and bets; the choice cannot change.' },
      { title: 'Call, raise, fold', body: 'Matching ends the betting and the chosen faces are compared, higher wins; raising continues unseen; folding concedes.' },
      { title: 'Double-side bet', body: 'If you think both your faces beat the face your opponent chose, bet on both: you must match their bet on each face, twice in total.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Losing all your chips** means elimination.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A double-side bet wins only if both faces are higher; if either is equal or lower it loses. Winning one takes ten extra chips.',
      'Folding against a double-side bet also costs ten chips; the double-side bettor pays no ten if they lose.',
      'Equal numbers are a draw and the pot goes to the next hand’s winner.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'There are four pieces of information, your front and back and theirs, and **you know three**. Only their back is hidden, making it far more "honest" than most poker; they know three as well, so it comes down to reading their back.' },
    { type: 'cards', items: [
      { title: 'The parity clue', body: 'This season fronts and backs always differ in parity, so an even front means one of five odd backs. It also made equal numbers, and so draws, more common.' },
      { title: 'The double-side asymmetry', body: 'The first to bet double risks only their chips, while the receiver pays ten even to fold, so the standard play is to go double first with a strong card. The receiver can answer by betting big on their back to raise the double cost.' },
      { title: '200 cards are uncountable', body: 'Unlike Black Garnet’s 90, counting every card is unrealistic; tracking how many high backs (9, 10) have appeared is the practical method.' },
    ], columns: 1 },
    { type: 'p', text: 'With a single betting round, ordinary bluffing is inefficient; it earns its keep in defending against double-side bets. Patience, waiting for a hand you are sure of and then going big, is the core strategy.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Two-Sided Poker follows this season’s rules: 200 cards of 50 opposite-parity kinds, 40 chips, a one-chip ante, side choice, the doubled double-side bet with its ten-chip bonus, and ties carrying over.',
      'Both players cannot bet double-side in the same hand.',
      'Solo you play a three-level AI with no clock; friend rooms choose a 20, 30 or 45-second turn, a timeout folds, and three missed turns in a row lose.',
    ] },
  ],
  similar: [
    { name: 'Blind Man’s Bluff (Indian poker)', players: '2+', alike: 'Each side knows part of the information and bets on comparing one number.', differs: 'You know nothing of your own card; here you know both of its faces.' },
    { name: 'Liar’s Dice', players: '2–6', alike: 'Infer hidden information from your own and the opponent’s public actions, and bet.', differs: 'It is a bidding game about counts of dice.' },
  ],
});

export const twelveJanggi = g4Game({
  slug: 'twelve-janggi', kind: 'death', ep: 11, related: ['cardJanggi', 'laserJanggi', 'russianJanggi'], check: 'site',
  extra: [namuGame('십이장기', 'Twelve Janggi'), wikiSeason('The_Genius:_Black_Garnet')],
  site: { id: 'janggi', name: { ko: '십이장기', en: 'Twelve Janggi' }, file: 'src/lib/janggi.ts' },
}, {
  meta: {
    title: '십이장기 규칙 — 더 지니어스 그랜드 파이널 11회전 데스매치, 12칸 판의 장기',
    description: '더 지니어스: 그랜드 파이널 11회전 데스매치 십이장기의 규칙을 정리했어요. 가로 4·세로 3의 12칸, 將·相·王·子 네 말과 승급한 侯, 잡은 말 내려놓기, 王 잡기와 입성 승리, 이 시즌에 추가된 30초 제한과 3판 2선승, PUZZLTHINK에서 바로 플레이와 방송 규칙과의 차이까지.',
    keywords: ['십이장기', '12장기', '더 지니어스 십이장기', '그랜드 파이널 데스매치', '더 지니어스 4', '동물장기'],
  },
  title: '십이장기 — 더 지니어스: 그랜드 파이널 11회전 데스매치',
  name: '십이장기',
  lead: '열두 칸 판에서 말 네 개로 두는 작은 장기예요. 잡은 상대 말을 내 말로 다시 내려놓을 수 있어, 판은 작아도 수읽기는 깊어요.',
  summary: '12칸 판에서 將·相·王·子로 상대 王을 잡거나 상대 진영에 王을 들여보내는 1:1 추상 전략 게임. 블랙가넷에서 처음 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 탈락후보 2명.',
      '**게임판**: 가로 4칸, 세로 3칸의 12칸. 각자 바로 앞쪽 3칸이 자기 진영이에요.',
      '**말**: 각자 4개. 將(장)은 진영 오른쪽, 相(상)은 왼쪽, 王(왕)은 가운데, 子(자)는 王의 앞에 놓고 시작해요.',
      '**재등장**: 「더 지니어스: 블랙가넷」의 데스매치로 처음 나왔고, 블랙가넷 결승에도 쓰였어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '말의 움직임', body: '차례마다 말 하나를 표시된 방향으로 한 칸 옮겨요. 將은 앞·뒤·좌·우, 相은 대각선 네 방향, 王은 여덟 방향 모두, 子는 앞으로만 가요.' },
      { title: '승급', body: '子가 상대 진영에 들어가면 뒤집어 侯(후)가 돼요. 侯는 뒤쪽 대각선을 뺀 여섯 방향으로 움직여요.' },
      { title: '잡기와 포로', body: '상대 말이 있는 칸으로 옮기면 그 말을 포로로 잡아요. 다음 차례부터 내 말로 쓸 수 있어요. 侯를 잡으면 子로 뒤집어 써요.' },
      { title: '내려놓기', body: '포로를 판에 내려놓는 것도 한 차례를 써요. 이미 말이 있는 칸이나 상대 진영에는 내려놓을 수 없어요. 원하는 차례에 쓰면 되고, 쓰지 않아도 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '상대의 **王을 잡으면** 이겨요.',
      '내 王이 **상대 진영에 들어가 한 차례를 버티면**, 즉 내 차례가 다시 올 때까지 잡히지 않으면 이겨요.',
      '이 시즌에는 **3판 2선승**으로 했어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '이 시즌에 추가된 규칙: 차례마다 **30초 제한**이 있고, 넘기면 그 판을 져요.',
      '말의 방향은 돌릴 수 없어요.',
      POOL_KO,
    ] },
  ],
  analysis: [
    { type: 'p', text: '판이 작아 첫 수부터 말이 맞닿아 있어요. 두 子가 마주 보고 시작하니, 선공은 첫 수에 상대 子를 잡을 수 있어요. 이 게임은 사실상 **잡은 말을 어디에 언제 내려놓느냐**의 게임이에요. 포로는 판 어디든(상대 진영 제외) 떨어뜨릴 수 있어서, 王 바로 앞에 子를 떨어뜨리는 것 같은 수가 늘 위협이 돼요.' },
    { type: 'cards', items: [
      { title: '지켜진 칸', body: '내 말이 지키는 칸에 상대가 들어오면 잡을 수 있어요. 王이 상대 말을 잡으려 할 때 그 칸이 상대에게 지켜지고 있다면, 잡는 순간 王이 잡혀 져요. 어느 칸이 누구에게 지켜지는지 세는 것이 수읽기의 기본이에요.' },
      { title: '입성은 한 차례 버티기', body: '王이 상대 진영에 들어가도 바로 이기지 않아요. 상대에게 한 차례가 있고, 그 사이에 잡히면 끝이에요. 그래서 입성은 상대가 그 칸을 공격할 수 없을 때만 의미가 있어요. 반대로 상대 王의 입성 경로를 막는 것이 수비의 핵심이에요.' },
      { title: '30초의 압박', body: '판이 작아도 내려놓기까지 생각하면 경우의 수가 많아요. 30초 안에 두지 못하면 그 판을 지니, 자주 나오는 첫 몇 수의 수순을 미리 알고 있는 사람이 크게 유리해요.' },
    ], columns: 1 },
    { type: 'p', text: '비슷한 일본의 동물장기는 컴퓨터로 끝까지 계산되어, 양쪽이 최선을 두면 후공이 이긴다고 알려져 있어요. 십이장기도 판이 작아 이론상 결론이 정해진 게임이지만, 30초 안에 두는 사람에게는 여전히 수읽기 싸움이에요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 십이장기는 12칸 판, 네 말의 배치와 움직임, 子의 侯 승급, 포로 내려놓기(상대 진영·빈칸이 아닌 곳 금지), 王 잡기와 입성 승리까지 방송과 같아요.',
      '사이트에서는 같은 국면을 세 번째로 만드는 수를 둘 수 없고, 200수가 지나면 무승부예요. 방송에서는 무승부 없이 승부를 봤어요.',
      '한 번에 한 판으로 승부해요. 이 시즌처럼 3판 2선승으로 하려면 판을 이어서 두면 돼요.',
      'AI와 두거나, 친구와 링크로 둘 수 있어요. 친구 방의 차례 시간은 90·60·30초 중에서 골라, 30초를 고르면 이 시즌과 같은 조건이에요.',
    ] },
  ],
  similar: [
    { name: '동물장기 (どうぶつしょうぎ)', players: '2명', alike: '3×4 판, 네 말(사자·기린·코끼리·병아리), 잡은 말 다시 쓰기, 병아리 승급, 사자의 상대 진영 입성 승리까지 거의 같아요.', differs: '동물장기는 같은 국면이 반복되면 무승부로 처리하는 등 세부 규칙이 조금 달라요.' },
    { name: '쇼기 (将棋)', players: '2명', alike: '잡은 말을 내 말로 다시 내려놓는 규칙의 원조인 일본 장기예요.', differs: '쇼기는 9×9 판에 말이 20개씩이고, 승급과 내려놓기의 제한이 훨씬 많아요.' },
  ],
}, {
  meta: {
    title: 'Twelve Janggi rules — The Genius: Grand Final round 11 death match',
    description: 'The rules of Twelve Janggi (십이장기), round 11 death match of The Genius: Grand Final: a 4×3 board, four pieces and the promoted lord, dropping captured pieces, winning by capturing the king or entering with it, this season’s 30-second limit and best of three, and how the playable PUZZLTHINK version differs.',
    keywords: ['Twelve Janggi', '12 Janggi', 'The Genius Grand Final', 'death match', '십이장기'],
  },
  title: 'Twelve Janggi — The Genius: Grand Final round 11 death match',
  name: 'Twelve Janggi (십이장기)',
  lead: 'A tiny janggi with four pieces on twelve squares. Captured pieces can be dropped back in as your own, so the small board reads deep.',
  summary: 'A 12-square abstract game: capture the enemy king or bring yours into their camp. First played in Black Garnet.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two candidates.',
      '**Board**: four squares by three, twelve in all; the row nearest each player is their camp.',
      '**Pieces**: four each: general (將) on the right, minister (相) on the left, king (王) in the centre, man (子) in front of the king.',
      '**Returning game**: first a death match in The Genius: Black Garnet, and part of its final.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Moves', body: 'Each turn move one piece one square in a marked direction: general orthogonally, minister diagonally, king in all eight directions, man straight forward.' },
      { title: 'Promotion', body: 'A man entering the enemy camp flips into a lord (侯), which moves in every direction but diagonally backward.' },
      { title: 'Captures', body: 'Moving onto an enemy piece captures it; from your next turn it is yours. A captured lord returns as a man.' },
      { title: 'Drops', body: 'Placing a captured piece takes a turn; not onto an occupied square or the enemy camp. Drop whenever you like, or never.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Capture the enemy king**.',
      'Or bring **your king into the enemy camp and survive one turn** there.',
      'This season matches were **best of three**.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'New this season: a **30-second limit** per turn; running out loses that game.',
      'Pieces cannot be rotated.',
      POOL_EN,
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The board is so small the pieces touch from move one; the two men face each other, so the first player can capture on move one. Really it is a game of **where and when to drop captured pieces**; a man dropped right in front of the king is a constant threat.' },
    { type: 'cards', items: [
      { title: 'Protected squares', body: 'A piece entering a square you guard can be taken; a king capturing on a square the enemy guards is captured in turn and loses. Counting who guards what is the basis of reading.' },
      { title: 'Entry means surviving a turn', body: 'A king in the enemy camp wins only if it isn’t captured on the reply, so entry matters only when that square can’t be attacked, and blocking the enemy king’s path is central to defence.' },
      { title: 'Thirty seconds', body: 'Drops multiply the options even on twelve squares; with 30 seconds per move, knowing the common opening lines in advance is a big edge.' },
    ], columns: 1 },
    { type: 'p', text: 'The similar Japanese Dōbutsu shōgi has been solved by computer, a win for the second player with perfect play. Twelve Janggi is likewise small enough to have a theoretical result, but at 30 seconds a move it is still a reading battle.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Twelve Janggi matches the board, piece set-up and moves, promotion, drops (not onto occupied squares or the enemy camp), and both ways to win.',
      'The site forbids a move that creates the same position a third time and draws after 200 moves; the broadcast had no draws.',
      'A match is one game; play again for a best of three like this season.',
      'Play the AI or a friend by link; friend rooms offer 90, 60 or 30-second turns, and 30 matches this season.',
    ] },
  ],
  similar: [
    { name: 'Dōbutsu shōgi', players: '2', alike: '3×4 board, four animal pieces, drops, chick promotion and the lion’s entry win: almost the same game.', differs: 'Details differ, such as repeated positions counting as a draw.' },
    { name: 'Shogi', players: '2', alike: 'The original of the drop rule: captured pieces return as your own.', differs: 'A 9×9 board with twenty pieces each and many more promotion and drop restrictions.' },
  ],
});
