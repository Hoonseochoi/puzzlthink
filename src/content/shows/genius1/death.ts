// 더 지니어스: 게임의 법칙, death matches: 연승 게임, 전략 윷놀이, 인디언 포커 (also final game 1), 이미지 게임,
// 같은 그림 찾기 (also prepared as final game 3). 인디언 포커 is playable on PUZZLTHINK.
import { g1Game, namuPage, round } from './shared';

export const winningStreak = g1Game('winning-streak', 'death', round([1, 2, 5]), [1, 2, 5], ['blackWhite', 'twoSidedPoker', 'russianRoulette'], {
  meta: {
    title: '연승 게임 규칙 — 더 지니어스 시즌1 1·2·5회전 데스 매치, 관전자와의 가위바위보 연승',
    description: '더 지니어스: 게임의 법칙 1·2·5회전 데스 매치 연승 게임의 규칙을 정리했어요. 탈락 후보 두 사람이 관전 플레이어 전원과 차례로 가위바위보, 비기면 다시, 연승이 끊겨도 끝까지, 가장 긴 연승이 기록, 30분 자유 시간과 회차마다 달라진 순서 정하기까지.',
    keywords: ['연승 게임', '연승게임', '더 지니어스 연승 게임', '더 지니어스 데스매치', '더 지니어스 시즌1', '지니어스 게임의 법칙'],
  },
  title: '연승 게임 — 더 지니어스 시즌1 1·2·5회전 데스 매치',
  name: '연승 게임',
  lead: '데스 매치의 두 사람이 관전 플레이어 모두와 한 명씩 가위바위보를 해요. 중간에 져도 끝까지 하고, 가장 길게 이어진 연승이 내 기록이에요.',
  summary: '관전자와의 가위바위보로 연승을 쌓는 데스 매치. 실력보다 내 편이 몇 명, 어떤 순서로 서 있는지가 결과를 정해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스 매치에 나온 두 사람과, 나머지 관전 플레이어 전원.',
      '**순서**: 관전 플레이어의 순번을 정해요. 1회전은 추첨이었고, 영문 위키백과 정리에 따르면 2회전은 관전자들이 한 가지 순서를 정해 두 사람에게 똑같이 썼어요. 5회전에는 그때까지의 탈락자도 관전 플레이어로 돌아왔어요.',
      '**자유 시간**: 게임 설명 뒤 30분.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '가위바위보', body: '데스 매치의 두 사람이 각자 관전 플레이어 전원과 순번대로 가위바위보를 해요.' },
      { title: '무승부', body: '비기면 승패가 날 때까지 다시 해요.' },
      { title: '끝까지', body: '중간에 져서 연승이 끊겨도, 마지막 순번까지 계속해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '게임이 끝났을 때 **가장 길게 이어진 연승 횟수**가 자기 기록이에요.',
      '기록이 더 높은 사람이 이기고, 진 사람이 그 회전의 탈락자가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '영문 위키백과 정리에 따르면 데스 매치의 두 사람은 관전 플레이어에게 무엇을 낼지 미리 말해 줄 수 있었어요.',
      '두 사람의 기록이 같을 때의 처리는 확인하지 못했어요.',
      '이 데스 매치는 1·2·5회전에 쓰였고, 이후 시즌에는 나오지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '가위바위보 자체는 운이지만, 이 게임에서 가위바위보는 **사실상 투표**예요. 무엇을 낼지 미리 알려 주면, 도와주고 싶은 관전자는 일부러 지고, 떨어뜨리고 싶은 관전자는 이기는 손을 내면 돼요. 결과는 관전자들의 마음으로 정해져요.' },
    { type: 'cards', items: [
      { title: '머릿수보다 순서', body: '기록은 총 승수가 아니라 **가장 긴 연속 승리**예요. 내 편이 일곱 명이어도 중간에 적이 끼어 있으면 연승이 끊겨요. 그래서 우호적인 관전자가 순번에서 **이어져 있는지**가 결정적이고, 순서를 추첨으로 정하느냐 의논으로 정하느냐가 큰 차이를 만들어요.' },
      { title: '중립인 관전자', body: '어느 편도 들지 않는 관전자는 그냥 가위바위보를 해요. 그때는 이길 확률이 반반이라, 중립이 많을수록 기록이 운에 가까워져요. 데스 매치의 두 사람에게는 30분의 자유 시간 동안 중립을 내 편으로 돌리는 것이 전부예요.' },
      { title: '관전자의 계산', body: '관전자는 두 사람 중 누가 남는 것이 자기에게 유리한지를 따져요. 다음 회전의 경쟁자, 연합 관계, 받은 약속이 손 하나에 담겨요. 그래서 이 게임은 그때까지의 인간관계를 그대로 보여 주는 거울이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '데스 매치의 두 사람이 게임 안에서 할 수 있는 선택은 거의 없어요. **우월 전략은 "내 편을 더 많이, 연속해서 확보하는 것"뿐**이라, 순수한 정치 게임에 가까워요.' },
  ],
  similar: [
    { name: '바퀴벌레 포커 (Kakerlakenpoker)', players: '2–6명', alike: '상대가 하는 말을 믿을지 말지가 모든 것을 정해요. 무엇을 낼지 미리 말하는 구조와 비슷하게 선언과 신뢰가 핵심이에요.', differs: '선언이 거짓일 수 있고, 카드를 떠넘기는 블러핑 게임이에요.' },
    { name: '디플로머시 (Diplomacy)', players: '7명', alike: '규칙보다 누가 내 편이 되어 주느냐가 결과를 정하는 협상 게임이에요.', differs: '모두가 직접 겨루는 전략 게임이고, 관전자가 승패를 정하는 구조는 아니에요.' },
  ],
}, {
  meta: {
    title: 'The Winning Streak rules — The Genius season 1 death match, rounds 1, 2 and 5',
    description: 'The rules of the Winning Streak (연승 게임) death match from The Genius: Rules of the Game: both players play rock-paper-scissors against every spectator in turn, replays on ties, play on after a loss, the longest streak counts, thirty minutes to lobby, and how the order was set each time.',
    keywords: ['The Genius Winning Streak', 'The Genius death match', 'The Genius Rules of the Game', '더 지니어스 연승 게임'],
  },
  title: 'The Winning Streak — The Genius season 1 death match, rounds 1, 2 and 5',
  name: 'The Winning Streak (연승 게임)',
  lead: 'Both death-match players play rock-paper-scissors against every spectator in turn. A loss does not end it; your longest unbroken run is your score.',
  summary: 'A rock-paper-scissors streak against the spectators, decided less by luck than by how many are on your side — and where they stand in line.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two in the death match, and every other player as a spectator.',
      '**Order**: the spectators are put in order — by lot in round 1; in round 2, per English Wikipedia, the spectators chose one order used for both; in round 5 the players already eliminated returned as spectators.',
      '**Free time**: 30 minutes after the briefing.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Play', body: 'Each death-match player plays rock-paper-scissors against every spectator in order.' },
      { title: 'Ties', body: 'A tie is replayed until someone wins.' },
      { title: 'To the end', body: 'Even after a loss breaks the streak, play continues to the last spectator.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Your **longest unbroken streak** is your record.',
      'The higher record wins; the other player is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Per English Wikipedia, the two could tell spectators in advance what they would throw.',
      'What happens on equal records could not be confirmed.',
      'Used in rounds 1, 2 and 5; it did not return in later seasons.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Rock-paper-scissors is luck, but here it is **effectively a vote**. Announce your throw and a friendly spectator loses on purpose, a hostile one wins; the spectators decide.' },
    { type: 'cards', items: [
      { title: 'Order beats numbers', body: 'The score is the **longest run**, not total wins: seven friends are no use if an enemy stands among them. Whether friendly spectators are **consecutive** decides it, so a drawn order and an agreed order are very different games.' },
      { title: 'Neutral spectators', body: 'A neutral spectator just plays, a coin flip for you. The more neutrals, the closer it is to luck, so the thirty minutes are for turning neutrals into friends.' },
      { title: 'The spectators’ sums', body: 'Each spectator asks which survivor suits them — rivals, alliances, promises — and puts it into one hand. The game mirrors the relationships so far.' },
    ], columns: 1 },
    { type: 'p', text: 'The two players have almost no choices in the game itself. **The only dominant plan is more friends, in a row** — close to pure politics.' },
  ],
  similar: [
    { name: 'Cockroach Poker', players: '2–6', alike: 'Whether to believe a declaration decides everything, as when a player announces their throw.', differs: 'Claims may be lies, and you pass cards around as a bluffing game.' },
    { name: 'Diplomacy', players: '7', alike: 'Who sides with you decides more than the rules.', differs: 'Everyone plays directly; no spectators decide the result.' },
  ],
});

export const strategicYut = g1Game('strategic-yut', 'death', round([3, 4, 10]), [3, 4, 10], ['blackWhite', 'blackWhite2', 'monorail'], {
  meta: {
    title: '전략 윷놀이 규칙 — 더 지니어스 시즌1 3·4·10회전 데스 매치, 네 명이 하나씩 고르는 윷',
    description: '더 지니어스: 게임의 법칙 3·4·10회전 데스 매치 전략 윷놀이의 규칙을 정리했어요. 2:2 팀, 앞면만 있는 윷과 뒷면만 있는 윷 중 하나를 고르는 네 사람, 모든 도는 뒷도, 탈락 후보의 말 두 개가 먼저 들어오면 승리, 번갈아 가는 차례와 관전자 베팅까지.',
    keywords: ['전략 윷놀이', '더 지니어스 전략 윷놀이', '더 지니어스 데스매치', '더 지니어스 시즌1', '지니어스 게임의 법칙'],
  },
  title: '전략 윷놀이 — 더 지니어스 시즌1 3·4·10회전 데스 매치',
  name: '전략 윷놀이',
  lead: '윷을 던지는 대신 네 사람이 각자 앞면 윷과 뒷면 윷 중 하나를 골라 내요. 네 개를 합친 결과가 그 차례의 이동이라, 상대의 선택을 읽는 심리전이 돼요.',
  summary: '운으로 던지는 윷을 2:2의 동시 선택으로 바꾼 윷놀이. 상대가 무엇을 막으려 할지 읽는 게임이에요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스 매치의 두 사람이 각자 파트너 한 명을 골라 2:2로 해요. 10회전에서는 게스트가 파트너였어요.',
      '**윷**: 네 사람 모두 양쪽이 앞면인 윷 하나와 양쪽이 뒷면인 윷 하나를 받아요.',
      '**말**: 네 사람이 각자 말 2개씩.',
      '**판과 기본 규칙**: 보통의 윷놀이와 같아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '윷 고르기', body: '차례마다 네 사람이 각자 가진 두 윷 중 하나를 골라 던져요. 네 개의 결과를 합쳐 도·개·걸·윷·모를 정해요.' },
      { title: '이동', body: '나온 결과만큼 차례인 사람의 말을 움직여요. 보통의 윷놀이처럼 상대 말을 잡거나, 내 말끼리 업을 수 있어요.' },
      { title: '뒷도', body: '이 게임에서는 **모든 도가 뒷도**예요. 뒷도로 출발점에 들어가도 한 바퀴를 돈 것으로 쳐요.' },
      { title: '차례', body: 'A 탈락 후보 → B 파트너 → B 탈락 후보 → A 파트너 순서로 번갈아 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**탈락 후보 본인의 말 2개**가 먼저 모두 들어오면 이겨요. 파트너의 말은 결과와 상관없어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '3·4회전에만 있던 규칙: 이긴 쪽 파트너가 진 쪽 파트너에게서 가넷 1개를 받고, 관전 플레이어는 승패에 가넷을 걸 수 있었어요.',
      '파트너는 같은 팀이지만 말은 따로라서, 서로의 말을 잡을 수도 있어요.',
      '이 데스 매치는 더 지니어스 시즌4(그랜드 파이널)에도 다시 나왔어요. 그 시즌의 규칙은 해당 시즌 페이지에서 다뤄요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '보통 윷은 네 개를 던져 평평한 면이 몇 개 나오느냐로 결과가 정해져요(1개 도, 2개 개, 3개 걸, 4개 윷, 0개 모). 이 게임에서는 한 팀이 윷 두 개를 고르니, 결과는 **우리 팀이 낸 앞면 수(0–2)와 상대 팀이 낸 앞면 수(0–2)의 합**이에요.' },
    { type: 'table', caption: '두 팀이 낸 앞면 수와 결과', head: ['우리 \\ 상대', '앞면 0', '앞면 1', '앞면 2'], rows: [
      ['앞면 0', '모', '뒷도', '개'],
      ['앞면 1', '뒷도', '개', '걸'],
      ['앞면 2', '개', '걸', '윷'],
    ] },
    { type: 'cards', items: [
      { title: '모와 윷은 상대가 허락해야 나온다', body: '표에서 보듯 모와 윷은 **두 팀이 같은 극단을 골라야** 나와요. 상대 팀은 앞면 하나·뒷면 하나만 내도 모와 윷을 확실히 막을 수 있어요. 대신 그러면 결과가 뒷도·개·걸 중 하나가 되고, 무엇이 나올지는 우리 팀이 정해요.' },
      { title: '뒷도를 무기로', body: '모든 도가 뒷도이고, 뒷도로 출발점에 들어가면 한 바퀴로 쳐요. 출발점 바로 뒤에 말을 두면 뒷도 한 번으로 말이 들어오니, 상대가 모·윷을 막으려 앞면 하나를 내는 순간을 노릴 수 있어요. 막기와 노리기가 서로를 견제하는 구조예요.' },
      { title: '파트너의 말은 징검다리', body: '파트너 말은 승패와 무관하지만 판 위에 있어서, 잡고 잡히며 한 번 더 던질 기회를 만들 수 있어요. 파트너 말이 딱 좋은 자리에 있으면 그 말을 잡아 크게 나아가는 식의 협력도 가능해요.' },
    ], columns: 1 },
    { type: 'p', text: '한 번의 선택은 가위바위보 같은 **동시 수 읽기**라 확실한 우월 전략은 없어요. 다만 판의 상황(어디에 말이 있고, 무엇이 나오면 잡히는지)에 따라 각 결과의 가치가 계속 바뀌어서, 같은 심리전이라도 매 차례 계산이 달라지는 깊은 게임이에요. 교착이 길어지기 쉬운 것도 이 구조 때문이에요.' },
  ],
  similar: [
    { name: '윷놀이', players: '2명 이상 (편 나누기)', alike: '판, 말의 이동, 잡기와 업기가 그대로예요.', differs: '보통 윷놀이는 윷을 던지는 운에 맡겨요. 전략 윷놀이는 그 운을 네 사람의 선택으로 바꿨어요.' },
    { name: '파치시 / 루도 (Pachisi, Ludo)', players: '2–4명', alike: '말을 판 둘레로 돌려 모두 집에 들이는 경주 게임이고, 상대 말을 잡아 되돌려 보낼 수 있어요.', differs: '이동은 주사위로 정해지고, 상대의 선택이 내 이동 칸 수에 영향을 주지 않아요.' },
  ],
}, {
  meta: {
    title: 'Strategic Yut rules — The Genius season 1 death match, rounds 3, 4 and 10',
    description: 'The rules of Strategic Yut (전략 윷놀이) from The Genius: Rules of the Game: two-on-two teams, four players each choosing a front-only or back-only stick, every do counting as back-do, the candidate’s two pieces home first, alternating turns and spectator bets.',
    keywords: ['The Genius Strategic Yut', 'Tactical Yutnori', 'The Genius death match', '더 지니어스 전략 윷놀이'],
  },
  title: 'Strategic Yut — The Genius season 1 death match, rounds 3, 4 and 10',
  name: 'Strategic Yut (전략 윷놀이)',
  lead: 'Instead of throwing yut sticks, four players each choose to play a front-only or a back-only stick. The four combined set the move — a game of reading what the others will choose.',
  summary: 'Yutnori with the luck replaced by simultaneous two-on-two choices: read what the other side wants to block.',
  setup: [
    { type: 'list', items: [
      '**Players**: each death-match player picks a partner, two against two; in round 10 the partners were guests.',
      '**Sticks**: each of the four has one stick flat on both sides and one round on both sides.',
      '**Pieces**: two each.',
      '**Board and base rules**: as in ordinary yutnori.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose', body: 'Each turn all four throw one of their two sticks; the four together give do, gae, geol, yut or mo.' },
      { title: 'Move', body: 'The player whose turn it is moves; as in yutnori, pieces capture and stack.' },
      { title: 'Back-do', body: '**Every do is a back-do**, and entering the start with a back-do counts as a full lap.' },
      { title: 'Turn order', body: 'Candidate A → partner B → candidate B → partner A, repeating.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The candidate whose **own two pieces** both get home first wins; partners’ pieces do not count.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'In rounds 3 and 4 only, the winning partner took a garnet from the losing partner, and spectators could bet garnets on the result.',
      'Partners are teammates but their pieces are separate and can capture each other.',
      'The game returned in The Genius season 4 (Grand Final); that season’s page covers it there.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Ordinary yut counts flat faces among four sticks (1 do, 2 gae, 3 geol, 4 yut, 0 mo). Here each team picks two sticks, so the result is **our flat faces (0–2) plus theirs (0–2)**.' },
    { type: 'table', caption: 'Flat faces played by each team and the result', head: ['Us \\ them', '0 flat', '1 flat', '2 flat'], rows: [
      ['0 flat', 'mo', 'back-do', 'gae'],
      ['1 flat', 'back-do', 'gae', 'geol'],
      ['2 flat', 'gae', 'geol', 'yut'],
    ] },
    { type: 'cards', items: [
      { title: 'Mo and yut need the other side’s consent', body: 'Mo and yut appear only when **both teams pick the same extreme**, so one flat and one round from the opponents blocks both for certain — leaving back-do, gae or geol, which your side then picks.' },
      { title: 'Back-do as a weapon', body: 'Every do is a back-do and entering the start that way completes a lap, so a piece just behind the start comes home in one move — exactly when opponents play one-and-one to block mo and yut.' },
      { title: 'Partners as stepping stones', body: 'Partners’ pieces do not decide the result but sit on the board, creating captures and extra throws; a partner piece in the right spot can be captured to leap forward.' },
    ], columns: 1 },
    { type: 'p', text: 'Each choice is a **simultaneous guess** like rock-paper-scissors, so nothing dominates, but the value of each result shifts with the board every turn. That depth is also why games bog down into long deadlocks.' },
  ],
  similar: [
    { name: 'Yutnori', players: '2+ in teams', alike: 'The same board, movement, captures and stacking.', differs: 'The sticks are thrown; Strategic Yut replaces that luck with four choices.' },
    { name: 'Pachisi / Ludo', players: '2–4', alike: 'Race pieces around the board home, capturing to send rivals back.', differs: 'Dice set the move; opponents cannot influence it.' },
  ],
});

export const indianPoker = g1Game('indian-poker', 'death', {
  when: { ko: '6·7·9회전·결승 1회전', en: 'Rounds 6, 7, 9 and final game 1' },
  episode: { ko: '6·7·9·12화', en: 'Episodes 6, 7, 9, 12' },
}, [6, 7, 9, 12], ['twoSidedPoker', 'hitStay', 'russianRoulette'], {
  meta: {
    title: '인디언 포커 규칙 — 더 지니어스 시즌1 데스 매치·결승 1회전, 이마에 붙인 카드 한 장의 승부',
    description: '더 지니어스: 게임의 법칙 6·7·9회전 데스 매치와 결승 1회전 인디언 포커의 규칙을 정리했어요. 1–10 두 장씩 20장, 내 카드는 못 보고 상대 카드만 보기, 기본 1칩과 콜·레이즈·폴드, 10을 접으면 칩 10개 페널티, 비기면 다음 판으로 넘어가는 판돈, 가넷 1개 = 칩 5개, 9회전 배심원 규칙과 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['인디언 포커', '인디언포커', '더 지니어스 인디언 포커', '더 지니어스 데스매치', '더 지니어스 시즌1', '인디언 포커 규칙'],
  },
  title: '인디언 포커 — 더 지니어스 시즌1 데스 매치·결승 1회전',
  name: '인디언 포커',
  lead: '카드 한 장을 보지 않고 이마에 붙여요. 상대 카드는 보이지만 내 카드는 모른 채, 걸지 접을지를 정해요. 접을 때 내 카드가 10이었다면 큰 벌칙이 기다려요.',
  summary: '내 숫자는 모르고 상대 숫자만 보며 베팅하는 1:1 포커. 시즌 데스 매치에 세 번, 결승에 한 번 나왔어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 2명.',
      '**카드**: 1–10이 두 장씩, 모두 20장.',
      '**칩**: 6·7회전 데스 매치에서는 자기 가넷을 가넷 1개 = 칩 5개로 바꿔 칩을 마련하고, 끝나면 다시 칩 5개 = 가넷 1개로 돌려받아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '카드 받기', body: '한 판마다 두 사람이 카드를 한 장씩 받아, 앞면을 보지 않고 이마에 붙여요. 상대의 카드만 보여요.' },
      { title: '기본 베팅', body: '영문 위키백과 정리에 따르면 매 판 두 사람이 칩 1개씩을 먼저 걸어요.' },
      { title: '베팅', body: '상대와 같은 수의 칩을 맞추면(콜) 베팅이 끝나고 카드를 공개해요. 더 많이 걸면(레이즈) 베팅이 이어져요. 걸지 않고 포기하면(폴드) 상대가 판돈을 가져가요.' },
      { title: '공개', body: '숫자가 더 큰 사람이 판돈을 가져가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '한 사람이 **칩을 모두 잃으면** 게임이 끝나고 그 사람이 져요.',
      '데스 매치에서는 진 사람이 그 회전의 탈락자가 돼요. 결승에서는 세 경기 중 첫 경기였어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**10 카드를 들고 폴드**하면 페널티로 상대에게 칩 10개를 더 줘야 해요.',
      '같은 숫자로 비기면, 그 판의 칩은 **다음 판의 승자**가 가져가요.',
      '나무위키 정리에 따르면 20장은 10판마다 새로 섞어 써요. 한 판에 두 장씩 쓰니 한 덱이 정확히 10판이에요.',
      '**9회전 변형**: 칩 대신 가넷으로 직접 걸고, 10을 접은 페널티는 가넷 5개였어요. 데스 매치에 나오지 않은 플레이어는 A·B·C라는 이름의 배심원이 되어, 선 플레이어가 베팅한 뒤 "베팅"과 "포기" 중 하나의 의견을 내고, 두 사람은 그 의견을 듣고 베팅해요.',
      '**결승**: 두 사람 모두 칩 20개로 시작했고, 탈락자들이 지원한 아이템(칩 5개 추가, 카드 숫자 +2, 상대 아이템 무효화, 아이템 복사 등)을 쓸 수 있었어요.',
      '인디언 포커는 더 지니어스 시즌4(그랜드 파이널)에도 데스 매치로 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '인디언 포커의 정보는 비대칭이에요. **상대는 내 카드를 알고, 나는 상대 카드를 알아요.** 그래서 내 카드의 세기는 상대의 행동에서 거꾸로 읽어야 하고, 상대도 내 행동에서 자기 카드를 읽어요.' },
    { type: 'cards', items: [
      { title: '상대 숫자가 곧 내 승률', body: '새 덱에서 상대가 2를 보여 주면 내 카드가 더 클 확률이 매우 높고, 9를 보여 주면 매우 낮아요. 남은 19장 중 상대 숫자보다 큰 카드의 수가 곧 내 승률이에요. 상대 숫자가 낮으면 크게 걸고, 높으면 일찍 접는 것이 기본이에요.' },
      { title: '덱을 세는 사람이 유리하다', body: '20장을 10판 동안 나눠 쓰니, 이미 나온 카드를 기억하면 남은 카드의 분포를 알 수 있어요. 10 두 장이 다 나왔다면 그 덱이 끝날 때까지 폴드의 페널티 걱정이 사라지고, 덱의 마지막 판에서는 남은 두 장 중 상대 카드를 빼면 내 카드가 정해져요.' },
      { title: '10 페널티와 블러핑', body: '상대 이마에 10이 보이면 크게 걸어 상대를 접게 만드는 것이 가장 큰 이득이에요. 상대는 자기 카드가 10인 줄 모르고, 접으면 판돈에 칩 10개가 더해지니까요. 그래서 큰 베팅을 받은 쪽은 그것이 "네 카드는 낮다"는 뜻인지, "네 카드가 10이라 접게 하려는" 수인지, 그냥 허세인지 고민하게 돼요. 접을 때마다 혹시 10일지 모른다는 위험이 따라붙어요.' },
    ], columns: 1 },
    { type: 'p', text: '카드 운이 크게 작용하지만 **확률 계산, 덱 카운팅, 상대 행동 읽기**가 장기적으로 칩 차이를 만들어요. 판돈을 작게 유지하다가 상대 숫자가 낮을 때 크게 거는 것이 기본 전략이고, 한 판에 모든 칩을 거는 승부는 덱 상황이 확실할 때로 아껴야 해요. 9회전의 배심원 규칙처럼 외부의 의견이 끼어들면, 그 의견이 누구 편인지까지 계산해야 해요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 인디언 포커는 20장 덱(1–10 두 장씩), 이마 카드, 매 판 기본 1칩, 콜·레이즈·폴드, 10 폴드 페널티 10칩, 비긴 판돈의 이월, 칩을 다 잃으면 패배가 방송과 같아요. 덱도 방송처럼 10판을 다 쓴 뒤에 새로 섞어요.',
      '두 사람 모두 **칩 20개**로 시작해요(방송 결승과 같은 수). 가넷 교환, 9회전의 배심원, 결승의 아이템은 없어요.',
      '사이트에서는 선 플레이어가 첫 베팅에서 반드시 1칩 이상 더 걸어야 해요. 10을 접었는데 칩이 모자라면 남은 칩만큼만 페널티를 내요.',
      '혼자 하면 세 단계 AI와 1:1로 둬요(실제 승률 약 25·40·55%). AI는 상대 카드와 지나간 카드, 베팅만 보고 판단하고 자기 카드는 보지 않아요. 친구와는 링크로 실시간 대결을 할 수 있어요.',
      '차례 시간이 있어요(AI전 30초, 친구 방 20·30·45초 중 선택). 시간이 지나면 자동으로 폴드하고, 베팅 없이 시간 초과가 세 번 쌓이면 시간패예요.',
    ] },
  ],
  similar: [
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '내 카드는 나만 못 보고 다른 사람의 카드는 다 보여요. 상대의 말과 행동으로 내 카드를 추리해요.', differs: '모두가 함께 불꽃놀이를 완성하는 협력 게임이고, 베팅이 없어요.' },
    { name: '텍사스 홀덤 (Texas Hold\'em)', players: '2–10명', alike: '콜·레이즈·폴드로 판돈을 키우고, 블러핑과 확률 계산이 승부를 가르는 포커예요.', differs: '내 카드는 보고 상대 카드는 못 보며, 공용 카드로 족보를 만들어요.' },
  ],
}, {
  meta: {
    title: 'Indian Poker rules — The Genius season 1 death match and final game 1',
    description: 'The rules of Indian Poker (인디언 포커) from The Genius: Rules of the Game, the death match of rounds 6, 7 and 9 and the final’s first game: twenty cards 1–10 twice, seeing only your opponent’s card, a one-chip ante with call, raise or fold, the ten-chip penalty for folding a 10, carried-over ties, five chips to a garnet, the round-9 jury, and how the PUZZLTHINK version differs.',
    keywords: ['Indian Poker', 'The Genius Indian Poker', 'Blind man’s bluff poker', 'The Genius death match', '더 지니어스 인디언 포커'],
  },
  title: 'Indian Poker — The Genius season 1 death match and final game 1',
  name: 'Indian Poker (인디언 포커)',
  lead: 'Stick a card to your forehead without looking. You see your opponent’s number but never your own, and decide whether to bet or fold — and folding a 10 costs dearly.',
  summary: 'One-on-one poker where you see only your opponent’s card: three death matches and the final’s first game.',
  setup: [
    { type: 'list', items: [
      '**Players**: 2.',
      '**Cards**: twenty, 1–10 twice.',
      '**Chips**: in rounds 6 and 7 players bought chips with their own garnets at five chips per garnet and cashed them back the same way afterwards.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Deal', body: 'Each hand both take a card and put it on their forehead unseen; only the opponent’s is visible.' },
      { title: 'Ante', body: 'Per English Wikipedia, both put in one chip each hand.' },
      { title: 'Bet', body: 'Matching the opponent (call) ends the betting and the cards are shown; betting more (raise) continues it; giving up (fold) hands the pot to the opponent.' },
      { title: 'Showdown', body: 'The higher number takes the pot.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Whoever **runs out of chips** loses.',
      'In a death match the loser is eliminated; in the final it was the first of three games.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Folding a 10** costs a further 10 chips to the opponent.',
      'On equal numbers the pot goes to **the next hand’s winner**.',
      'Per the fan wiki, the twenty cards are reshuffled every ten hands — exactly one deck, at two cards a hand.',
      '**Round 9 variant**: garnets were bet directly, the 10-fold penalty was 5 garnets, and the other players sat as jurors A, B and C, each saying "bet" or "fold" after the first player’s bet before the two decided.',
      '**Final**: both started with 20 chips and could use items given by the eliminated players (five extra chips, +2 to a card, cancelling an opponent’s item, copying an item and so on).',
      'Indian Poker returned as a death match in The Genius season 4 (Grand Final).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Information is mirrored: **your opponent knows your card, you know theirs.** You read your card’s strength from their behaviour, and they read theirs from yours.' },
    { type: 'cards', items: [
      { title: 'Their number is your odds', body: 'In a fresh deck, a 2 opposite you means you are very likely higher; a 9 means very likely lower. The share of the remaining 19 cards above their number is your chance. Bet big against low cards, fold early against high ones.' },
      { title: 'Counting pays', body: 'One deck lasts ten hands, so remembering what has gone tells you what is left. Once both 10s are out, folding is free until the reshuffle; in the deck’s last hand, your card is the one remaining after theirs.' },
      { title: 'The 10 penalty and bluffing', body: 'Seeing a 10 on your opponent’s forehead is the best moment to bet big: they do not know it, and if they fold, the pot grows by ten more chips. So a big bet against you might mean "your card is low", "your card is a 10 and I want you to fold", or plain bluster — and every fold carries the what-if-it’s-a-10 risk.' },
    ], columns: 1 },
    { type: 'p', text: 'Luck is large, but **odds, counting and reading** decide in the long run. Keep pots small, push when their number is low, and save all-ins for when the deck is clear. With outside opinions in the mix, as with the round-9 jury, you must also work out whose side each juror is on.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Indian Poker matches the twenty-card deck, forehead cards, one-chip ante, call/raise/fold, ten-chip penalty for a folded 10, carried-over ties and losing at zero chips; like the show, the deck is reshuffled only after ten hands.',
      'Both start with **20 chips** (as in the broadcast final). There are no garnet conversions, round-9 jurors or final items.',
      'On the site the first player must raise by at least one chip on the first bet; a folded 10 with too few chips pays only what is left.',
      'Solo you play a three-level AI (actual win rates about 25, 40 and 55%), which judges only from your card, past cards and bets, never its own card; friends can play live by link.',
      'There is a turn timer (30 seconds against the AI; 20, 30 or 45 in rooms). Running out folds automatically, and a third timeout without betting loses the match.',
    ] },
  ],
  similar: [
    { name: 'Hanabi', players: '2–5', alike: 'Everyone sees every hand but their own and deduces it from what others say and do.', differs: 'A cooperative fireworks game with no betting.' },
    { name: "Texas Hold'em", players: '2–10', alike: 'Call, raise and fold, with bluffing and odds deciding.', differs: 'You see your own cards, not theirs, and build hands with community cards.' },
  ],
}, { extra: [namuPage('포커', 'Indian poker section')], site: { id: 'indianPoker', name: { ko: '인디언 포커', en: 'Indian Poker' }, file: 'src/lib/indianPoker.ts' } });

export const imageGame = g1Game('image-game', 'death', round(8), [8], ['hiddenWord', 'gradation', 'colorlink'], {
  meta: {
    title: '이미지 게임 규칙 — 더 지니어스 시즌1 8회전 데스 매치, 한 문장으로 사진 맞히기',
    description: '더 지니어스: 게임의 법칙 8회전 데스 매치 이미지 게임의 규칙을 정리했어요. 사진 6장과 주사위, 번갈아 맡는 출제자, 사진을 표현하는 단어나 문장, 다섯 명이 고른 비슷한 사진, 주사위로 고르는 정답, 상대가 맞히면 출제자 감점, 전원 정답·전원 오답이면 2개 감점까지.',
    keywords: ['이미지 게임', '더 지니어스 이미지 게임', '더 지니어스 데스매치', '더 지니어스 시즌1', '지니어스 게임의 법칙', '딕싯'],
  },
  title: '이미지 게임 — 더 지니어스 시즌1 8회전 데스 매치',
  name: '이미지 게임',
  lead: '출제자가 사진 한 장을 골라 단어나 문장으로 표현하면, 나머지는 비슷한 사진을 내고 출제자의 사진을 맞혀요. 너무 쉬워도, 너무 어려워도 출제자가 손해를 봐요.',
  summary: '사진 한 장을 한마디로 표현해, 상대는 틀리고 모두가 다 맞히거나 다 틀리지는 않게 만드는 연상 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스 매치의 두 사람과 관전 플레이어 4명, 모두 6명.',
      '**준비물**: 각자 사진 6장과 상자에 담긴 주사위 하나.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '출제', body: '데스 매치의 두 사람이 번갈아 출제자가 돼요. 출제자는 사진 한 장을 골라 뒷면이 보이게 내려놓고, 그 사진의 이미지를 단어나 문장으로 표현해요.' },
      { title: '비슷한 사진 내기', body: '나머지 다섯 명은 자기 사진 중 그 표현에 어울리는 사진을 골라 뒷면이 보이게 내요.' },
      { title: '맞히기', body: '여섯 장을 공개하면, 출제자를 뺀 다섯 명이 출제자의 사진이라고 생각하는 번호를 주사위 윗면으로 맞춰 딜러에게 내요.' },
      { title: '정답 공개', body: '딜러가 각자의 선택을 발표하고, 출제자가 자기 사진을 공개해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '데스 매치 **상대가 맞히면** 출제자가 가넷 1개를 잃고, **틀리면** 상대가 가넷 1개를 잃어요.',
      '다섯 명이 **모두 맞히거나 모두 틀리면** 출제자가 가넷 2개를 잃어요.',
      '두 사람 중 한 명이 **가넷을 모두 잃으면** 게임이 끝나고, 그 사람이 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '규칙 설명에는 "가넷을 잃는다"고 되어 있었지만, 게임 중 잃은 가넷은 모두 데스 매치에서 이긴 사람에게 가요.',
      '관전자의 선택은 "전원 정답·전원 오답" 판정에만 영향을 줘요.',
      '이 데스 매치는 시즌1에만 쓰였어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '이미지 게임의 출제자는 **절묘한 중간**을 노려야 해요. 상대는 틀려야 하지만, 다섯 명이 모두 틀리면 2개를 잃어요. 그러니 "상대는 못 맞히고, 관전자 중 누군가는 맞히는" 표현이 정답이에요.' },
    { type: 'cards', items: [
      { title: '관전자가 쥔 열쇠', body: '관전자는 상대 1명을 뺀 네 명이라, 그중 한 명만 맞혀도 "전원 오답"을 피할 수 있어요. 출제자에게 우호적인 관전자가 일부러 정답을 골라 주면 위험이 줄고, 적대적인 관전자는 일부러 틀려서 출제자를 전원 오답(-2) 쪽으로 몰 수 있어요. 겉으로는 감각 게임이지만 관전자 네 명의 마음이 결과를 크게 흔들어요.' },
      { title: '상대만 모르는 표현', body: '가장 이상적인 표현은 출제자와 특정 관전자만 아는 기억이나 농담이에요. 반대로 너무 개인적이면 아무도 못 맞혀 2개를 잃어요. 상대가 무엇을 모르는지 아는 것이 이 게임의 실력이에요.' },
      { title: '가넷이 체력', body: '가넷을 모두 잃으면 끝나니, 데스 매치에 오기 전 가넷이 많은 사람이 더 오래 버텨요. 한 번의 실수가 2개 감점으로 이어질 수 있어 가넷이 적은 사람은 안전한 표현을 골라야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '사진과 표현의 조합이 매번 달라 **우월 전략은 없어요.** 다만 관전자가 결과를 좌우할 수 있는 구조라, 실제로는 관전자를 얼마나 내 편으로 두었느냐가 감각만큼 중요해요.' },
  ],
  similar: [
    { name: '딕싯 (Dixit)', players: '3–8명', alike: '이야기꾼이 그림 카드 한 장을 한마디로 표현하고, 다른 사람들이 비슷한 카드를 섞어 낸 뒤 이야기꾼의 카드를 맞혀요. 모두 맞히거나 모두 틀리면 이야기꾼이 손해를 보는 점까지 같아요.', differs: '딕싯은 점수를 쌓아 결승점에 먼저 가는 게임이고, 1:1 대결이나 가넷 같은 체력 개념이 없어요.' },
    { name: '미스테리움 (Mysterium)', players: '2–7명', alike: '그림 카드만으로 뜻을 전하고, 받는 사람이 그 의미를 해석해 맞혀요.', differs: '말 없이 카드만으로 힌트를 주는 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'The Image Game rules — The Genius season 1, round 8 death match',
    description: 'The rules of the Image Game (이미지 게임) death match from The Genius: Rules of the Game: six photos and a die each, alternating setters, a word or sentence for a photo, five matching photos, guessing with the die, penalties when the opponent guesses right, and double penalties when all five are right or all wrong.',
    keywords: ['The Genius Image Game', 'The Genius death match', 'Dixit', '더 지니어스 이미지 게임'],
  },
  title: 'The Image Game — The Genius season 1, round 8 death match',
  name: 'The Image Game (이미지 게임)',
  lead: 'The setter picks a photo and describes it in a word or sentence; everyone else adds a similar photo and guesses which was the setter’s. Too easy or too hard, the setter pays.',
  summary: 'A word-association duel: describe a photo so your opponent misses but not everyone, or no one, gets it.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two in the death match plus four spectators, six in all.',
      '**Materials**: six photos each and a die in a box.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Set', body: 'The two take turns as setter, laying a photo face down and describing its image in a word or sentence.' },
      { title: 'Match', body: 'The other five each lay down one of their photos that fits the description.' },
      { title: 'Guess', body: 'With all six revealed, the five set their die to the number they think is the setter’s and hand it to the dealer.' },
      { title: 'Reveal', body: 'The dealer announces the guesses and the setter shows their photo.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If the **opponent guesses right**, the setter loses a garnet; if **wrong**, the opponent loses one.',
      'If **all five are right or all five wrong**, the setter loses two.',
      'The first to **lose every garnet** is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The briefing said garnets were "lost", but all garnets lost went to the death-match winner.',
      'Spectators’ guesses count only towards the all-right or all-wrong rule.',
      'This death match was used only in season 1.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The setter aims for **a precise middle**: the opponent must miss, but if all five miss, the setter loses two. The ideal clue is one the opponent cannot get but at least one spectator can.' },
    { type: 'cards', items: [
      { title: 'The spectators hold the key', body: 'Any one of the four spectators guessing right avoids "all wrong". Friendly spectators can pick the right photo to cover the setter; hostile ones can miss on purpose to push towards the double penalty. It looks like a game of intuition, but the four spectators swing it.' },
      { title: 'Clues only your rival misses', body: 'The best clue is a memory or joke shared with certain spectators; too private, and nobody gets it. Knowing what your opponent does not know is the skill.' },
      { title: 'Garnets are health', body: 'Running out ends it, so whoever arrives with more garnets lasts longer, and a player with few should favour safe clues.' },
    ], columns: 1 },
    { type: 'p', text: 'Every photo and clue differs, so **nothing dominates**, but because spectators can steer results, how many are on your side matters as much as intuition.' },
  ],
  similar: [
    { name: 'Dixit', players: '3–8', alike: 'A storyteller describes one picture card, others add similar cards and guess the storyteller’s; the storyteller loses out if all or none guess right.', differs: 'Dixit is a race on a score track, with no duel or garnet health.' },
    { name: 'Mysterium', players: '2–7', alike: 'Meaning is conveyed through picture cards and interpreted by others.', differs: 'A cooperative game with wordless clues.' },
  ],
});

export const samePicture = g1Game('same-picture-hunt', 'death', {
  when: { ko: '11회전·결승 3회전(미사용)', en: 'Round 11 and final game 3 (unplayed)' },
  episode: { ko: '11·12화', en: 'Episodes 11, 12' },
}, [11, 12], ['hexagon', 'nemoCount', 'hiddenWord'], {
  meta: {
    title: '같은 그림 찾기 규칙 — 더 지니어스 시즌1 11회전 데스 매치, 16장의 그림을 외워 컨베이어 벨트 앞으로',
    description: '더 지니어스: 게임의 법칙 11회전 데스 매치 같은 그림 찾기의 규칙을 정리했어요. 알파벳 16칸 뒤에 숨은 그림 16장, 그림 카드 20장이 놓인 개인 컨베이어 벨트, 가넷이 많은 쪽의 2칸 앞 출발과 선후공 결정권, 맞히면 전진·틀리면 벨트 후진, 결승점과 벨트에서 떨어지면 패배까지.',
    keywords: ['같은 그림 찾기', '더 지니어스 같은 그림 찾기', '더 지니어스 데스매치', '더 지니어스 시즌1', '지니어스 게임의 법칙', '치킨차차'],
  },
  title: '같은 그림 찾기 — 더 지니어스 시즌1 11회전 데스 매치',
  name: '같은 그림 찾기',
  lead: '알파벳이 적힌 판 16칸 뒤에 그림이 하나씩 숨어 있어요. 내 컨베이어 벨트 다음 칸의 그림과 같은 그림을 판에서 찾아 뒤집으면 한 칸 전진, 틀리면 벨트가 뒤로 밀려요.',
  summary: '판 뒤에 숨은 16장의 그림을 기억해 벨트 위 그림과 맞히는 암기 대결. 결승 3회전으로도 준비됐어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 2명.',
      '**그림판**: 앞면에 알파벳 16개, 뒷면에 서로 다른 그림 16장.',
      '**컨베이어 벨트**: 한 사람에 하나씩, 그림 카드 20장이 놓여요. 16장 그림 세 벌을 섞어 벨트의 첫 빈칸부터 채워요.',
      '**출발 위치**: 가넷이 더 많은 사람은 10번째 그림 카드에서, 적은 사람은 8번째 그림 카드에서 시작해요. 가넷이 많은 사람이 2칸 앞이에요.',
      '**선후공**: 가넷이 더 많은 사람이 정해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '찾기', body: '내 차례에, 내 말이 있는 칸 다음 그림 카드와 같은 그림을 그림판에서 찾아 알파벳 하나를 뒤집어요.' },
      { title: '맞으면', body: '같은 그림이면 한 칸 전진하고, 이어서 그림판을 한 번 더 확인할 수 있어요.' },
      { title: '틀리면', body: '다른 그림이면 컨베이어 벨트가 한 칸 뒤로 밀리고, 맨 앞에 새 그림 카드가 채워져요. 차례는 상대에게 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '내 말이 **결승점에 먼저 도착하면** 이겨요.',
      '같은 그림을 찾지 못해 말이 **컨베이어 벨트에서 떨어지면** 져요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '그림판은 두 사람이 함께 써요. 내가 뒤집어 확인한 그림은 상대도 봐요.',
      '결승에서는 세 번째 경기로 준비되었고, "그림 전체 보기", "1칸 전진", "3칸 이동" 같은 이 게임용 아이템이 배분됐어요. 결승이 두 경기로 끝나 실제로 하지는 않았어요.',
      '같은 그림 찾기는 시즌2(룰 브레이커)와 시즌4(그랜드 파이널)에도 데스 매치로 나왔고, 시즌4에서는 같은 출발점과 동전 던지기로 규칙이 바뀌었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '같은 그림 찾기는 **암기 게임이면서 정보 관리 게임**이에요. 그림판을 함께 쓰니, 내가 뒤집은 그림은 상대의 기억에도 들어가요. 무엇을 열고 무엇을 숨기느냐가 기억력만큼 중요해요.' },
    { type: 'cards', items: [
      { title: '2칸과 선공의 무게', body: '시즌1 규칙에서 가넷이 많은 사람은 2칸 앞에서 시작하고 선후공까지 정해요. 게임 초반에는 그림을 거의 모르니, 첫 그림을 찾는 확률은 16칸 중 하나를 고르는 수준이에요. 뒤에서 출발한 쪽은 처음부터 여러 번 연속으로 맞혀야 따라잡을 수 있어, 출발 차이가 생각보다 커요.' },
      { title: '정보를 주지 않는 수', body: '앞선 사람은 굳이 많은 칸을 열지 않고 버티면 상대가 새 정보를 얻지 못해요. 뒤진 사람은 틀릴 위험을 감수하고 새 칸을 열어야 하고, 그 칸은 다시 상대에게도 정보가 돼요. 앞선 쪽에 유리한 구조예요.' },
      { title: '같은 그림이 세 번 나온다', body: '벨트는 16장 세 벌로 채워지니, 같은 그림이 여러 번 돌아와요. 한 번 위치를 알아낸 그림은 다음에 나올 때 확실한 전진이 돼요. 알파벳마다 그림을 연결해 외우는 방법이 큰 도움이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '순수 암기 실력이 바탕이지만, 시즌1 규칙에서는 **가넷에 따른 출발 차이가 결과를 크게 기울이는** 게임이에요. 뒤진 쪽에게 확실한 반전 수는 없고, 열린 칸을 모두 정확히 기억하면서 상대보다 먼저 위험을 감수할 타이밍을 고르는 수밖에 없어요.' },
  ],
  similar: [
    { name: '치킨 차차 (Zicke Zacke Hühnerkacke)', players: '2–4명', alike: '엎어 둔 타일 중 다음 칸과 같은 그림을 뒤집어 맞히면 앞으로 나아가는 경주 게임이에요. 이 데스 매치의 바탕이 된 것으로 알려져 있어요.', differs: '여러 명이 원형 트랙을 돌며 앞사람의 꼬리 깃털을 빼앗는 방식으로 이겨요.' },
    { name: '메모리 (같은 그림 짝 맞추기)', players: '2명 이상', alike: '엎어 둔 카드의 위치를 기억해 같은 그림을 찾고, 내가 뒤집은 카드는 모두가 봐요.', differs: '짝을 많이 모으는 게임이고, 경주나 벨트가 없어요.' },
  ],
}, {
  meta: {
    title: 'Same Picture Hunt rules — The Genius season 1, round 11 death match',
    description: 'The rules of Same Picture Hunt (같은 그림 찾기) from The Genius: Rules of the Game: sixteen pictures hidden behind lettered panels, a personal conveyor belt of twenty picture cards, a two-space head start and choice of turn for the garnet leader, advancing on a match and the belt slipping back on a miss, winning at the finish and losing off the end.',
    keywords: ['The Genius Same Picture Hunt', 'The Genius death match', 'Chicken Cha Cha', '더 지니어스 같은 그림 찾기'],
  },
  title: 'Same Picture Hunt — The Genius season 1, round 11 death match',
  name: 'Same Picture Hunt (같은 그림 찾기)',
  lead: 'Sixteen lettered panels each hide a picture. Flip the one that matches the next card on your conveyor belt to step forward; miss, and the belt slides back.',
  summary: 'A memory duel matching hidden pictures to the belt in front of you — also prepared as the final’s third game.',
  setup: [
    { type: 'list', items: [
      '**Players**: 2.',
      '**Board**: 16 letters on the front, 16 different pictures behind.',
      '**Belts**: one each, holding 20 picture cards dealt from three shuffled sets of the 16.',
      '**Start**: the player with more garnets starts on the 10th card, the other on the 8th — two spaces ahead.',
      '**Order**: the player with more garnets decides who goes first.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Find', body: 'On your turn, flip the letter you think hides the picture on the card just ahead of your piece.' },
      { title: 'Match', body: 'A match moves you forward one space and lets you check the board again.' },
      { title: 'Miss', body: 'A miss slides the belt back one space, a new card fills the front, and the turn passes.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Reach the finish first** to win.',
      'If your piece **falls off the belt**, you lose.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The board is shared: whatever you flip, your opponent sees too.',
      'It was prepared as the final’s third game, with items such as "see the whole board", "advance one" and "move three"; the final ended after two games, so it was not played.',
      'It returned as a death match in seasons 2 (Rule Breaker) and 4 (Grand Final), where season 4 used equal starts and a coin toss.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'This is **memory and information control at once**: the board is shared, so every panel you open enters your opponent’s memory too.' },
    { type: 'cards', items: [
      { title: 'Two spaces and the first move', body: 'Under season-1 rules the garnet leader starts two ahead and chooses the order. Early on, finding a picture is close to a one-in-sixteen pick, so the trailing player must hit several in a row to catch up — the head start weighs more than it looks.' },
      { title: 'Giving nothing away', body: 'A leader who opens few panels gives the opponent nothing new, while the trailer must risk fresh panels — which then help the leader too.' },
      { title: 'Each picture comes three times', body: 'The belt draws from three sets of the 16, so pictures recur; a picture located once is a sure step next time. Linking each letter to its picture is the memory trick.' },
    ], columns: 1 },
    { type: 'p', text: 'Memory is the base, but under season-1 rules **the garnet-based head start tilts it heavily**. The trailer has no sure comeback: remember every open panel exactly and pick the moment to take risks first.' },
  ],
  similar: [
    { name: 'Chicken Cha Cha (Zicke Zacke Hühnerkacke)', players: '2–4', alike: 'Flip face-down tiles to match the next space and race forward; widely cited as this game’s inspiration.', differs: 'Several players race round a loop, stealing tail feathers.' },
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember where face-down pictures are; every flip is seen by all.', differs: 'You collect pairs; no race or belt.' },
  ],
}, { extra: [namuPage('같은 그림 찾기', 'rules and later seasons')] });
