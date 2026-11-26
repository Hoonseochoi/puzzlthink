// 피의 게임3, days 7–8: 세븐노트, 히든코드, 크리미널 메모리, 수식미로.
import { bg3Game } from './shared';

export const sevenNote = bg3Game('seven-note', 'money', '7', ['heavy13', 'pointOmok', 'hitStay'], {
  meta: {
    title: '세븐노트 규칙 — 피의 게임3 7일차 머니 챌린지, 조옮김으로 내 음을 울리기',
    description: '피의 게임3 7일차 머니 챌린지 세븐노트의 규칙을 정리했어요. 12음 카드 두 장과 코인 20개, 라운드마다 공개되는 노래, 코인으로 조를 옮기는 베팅(1칸에 1코인 또는 13코인), 흰 건반·검은 건반 점수, 뮤트권, 우승자의 팀 재배정 권한까지.',
    keywords: ['세븐노트', '피의 게임3 세븐노트', '피의게임3 머니 챌린지', '음악 게임', '피의게임3'],
  },
  title: '세븐노트 — 피의 게임3 7일차 머니 챌린지',
  name: '세븐노트',
  lead: '내가 맡은 음이 노래에 나오면 점수예요. 코인을 걸어 노래의 조를 바꾸면, 울리는 음이 통째로 달라져요.',
  summary: '각자 맡은 두 음이 연주되면 점수를 얻고, 코인으로 노래의 조를 옮겨 판을 뒤집는 15인 개인전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 15명 개인전.',
      '**음 카드**: 12음(도, 도♯, 레, 레♯, 미, 파, 파♯, 솔, 솔♯, 라, 라♯, 시) 중 2장을 무작위로 받아요. 누가 어떤 음인지는 공개되지 않고, 두 라운드마다 새로 받아요.',
      '**코인**: 각자 20개. 딜러룸에 보관하고 주고받을 수 없어요.',
      '**라운드**: 8라운드. 라운드마다 연주될 노래의 계이름이 공개돼요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '조옮김 베팅 (30분 안에 투표룸)', body: '노래의 조를 바꾸고 싶으면 코인을 걸어요. 조는 C부터 B까지 12개이고, **한 칸 올리려면 1코인 또는 13코인**이 들어요(12칸이면 한 바퀴). 가장 많이 건 사람의 코인 수만큼 조가 올라가요. 베팅하지 않아도 투표룸에는 꼭 가야 해요.' },
      { title: '연주', body: '최종 조로 노래가 연주되고, 그 음을 맡은 사람이 점수를 받아요. 점수 현황은 전체 공지돼요.' },
    ] },
    { type: 'table', head: ['건반', '1–6라운드', '7–8라운드'], rows: [
      ['흰 건반 (도·레·미·파·솔·라·시)', '1점', '2점'],
      ['검은 건반 (도♯·레♯·파♯·솔♯·라♯)', '2점', '3점'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**총점 1위가 우승**: 2,000만 원, 면제권 2장(한 장은 남에게), 남은 코인 1개당 1,000만 원. 그리고 **모든 플레이어의 팀을 마음대로 다시 짤 권한**을 얻어요.',
      '**하위 2명은 탈락 후보**가 되고, 각자 한 명씩 지목한 두 사람 중 투표로 한 명이 더해져 셋이 데스매치를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드 안에 투표룸에 가지 않으면, 내 음이 연주돼도 점수가 없어요.',
      '**뮤트권**: 코인으로 사서 게임 중 한 번, 원하는 음을 막아 그 음을 맡은 사람이 점수를 못 받게 해요. 여럿이 쓰면 가장 많이 건 음에만 적용되고, 진 사람도 뮤트권은 산 것으로 쳐요. 조옮김 베팅과 함께 써야 해요.',
      '동점이면 남은 코인이 많은 쪽, 그것도 같으면 시작 개인 자금이 많았던 쪽이 위예요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '세븐노트의 핵심은 **조옮김이 모든 음을 한꺼번에 민다는 것**이에요. 노래의 음 구성은 그대로인 채 전체가 몇 반음 이동하므로, 내 음이 울리게 하려면 "몇 칸 옮기면 내 두 음이 노래에 들어가는가"를 계산해야 해요.' },
    { type: 'cards', items: [
      { title: '1코인과 13코인', body: '한 칸 옮기기가 1코인 또는 13코인이라는 건, 12칸이 한 바퀴라 13코인이 1코인과 같은 결과라는 뜻이에요. 그런데 "가장 많이 건 사람"이 정하므로, 같은 한 칸을 원해도 13코인을 걸면 남보다 많이 건 사람이 될 수 있어요. 실제 이동은 같고 영향력만 커지는 셈이에요.' },
      { title: '검은 건반은 위험한 고득점', body: '검은 건반이 점수가 높지만, 보통 노래(특히 C조)에는 검은 건반이 적어요. 조를 옮기면 검은 건반이 많이 들어가는 조도 생기므로, 검은 건반을 가진 사람들은 손을 잡고 그 조로 옮길 이유가 있어요.' },
      { title: '음은 비공개, 연합은 말로', body: '누가 어떤 음을 가졌는지 공개되지 않아서, "나는 레·솔이야"라는 말은 거짓일 수 있어요. 많은 사람이 원하는 조로 함께 걸면 코인을 아낄 수 있지만, 한 명이 마지막에 더 많이 걸면 조가 뒤집혀요.' },
      { title: '우승의 가치가 커요', body: '우승자는 돈뿐 아니라 팀 재배정 권한을 가져, 다음 날의 판을 통째로 짜요. 그래서 이 게임은 돈보다 권력을 두고 싸우는 판이에요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '숨겨진 정보(내 음, 내 카드)를 말로만 주고받으며 순서와 타이밍을 맞추는 게임이에요.', differs: '하나비는 협력 게임이고 베팅이 없어요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '가장 많이 낸 사람이 결과를 가져가고, 진 사람이 낸 것도 사라지는 입찰 구조가 뮤트권 경쟁과 닮았어요.', differs: '하이 소사이어티는 물건을 사는 경매예요.' },
  ],
}, {
  meta: {
    title: 'Seven Note rules — The Bloody Game 3, day 7 money challenge',
    description: 'The rules of Seven Note from The Bloody Game 3: two of twelve note cards and 20 coins, a song revealed each round, betting coins to transpose the key (1 or 13 coins per step), points for white and black keys, the mute item, and the winner’s power to redraw the teams.',
    keywords: ['Seven Note', 'Bloody Game 3 money challenge', 'music game'],
  },
  title: 'Seven Note — The Bloody Game 3, day 7 money challenge',
  name: 'Seven Note',
  lead: 'Score when your notes appear in the song. Bet coins to change the key, and every note in it shifts at once.',
  summary: 'Fifteen players score when their two notes are played, betting coins to transpose the song.',
  setup: [
    { type: 'list', items: [
      '**Players**: fifteen, individually.',
      '**Note cards**: two random of the twelve notes (C to B with sharps), secret and redealt every two rounds.',
      '**Coins**: 20 each, kept in the dealer room, not transferable.',
      '**Rounds**: eight; each reveals the song’s notes.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Transposition bet (visit within 30 minutes)', body: 'Bet coins to raise the key; there are twelve keys and **one step costs 1 or 13 coins** (twelve steps loop round). The key rises by the top bettor’s coin count. Everyone must visit the voting room, betting or not.' },
      { title: 'Performance', body: 'The song is played in the final key and players holding its notes score; scores are announced.' },
    ] },
    { type: 'table', head: ['Key', 'Rounds 1–6', 'Rounds 7–8'], rows: [
      ['White (C D E F G A B)', '1', '2'],
      ['Black (C♯ D♯ F♯ G♯ A♯)', '2', '3'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The top scorer wins** ₩20 million, two immunity passes (one to give), ₩10 million per coin left — and **the power to reassign everyone’s team**.',
      '**The bottom two are candidates**; each names a player and a vote adds one, so three play the death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Skipping the voting room means no points even if your note is played.',
      '**Mute**: bought with coins, once per game, blocks one note so its holders score nothing; if several are used, only the most heavily backed applies, and losers still pay. It is placed with the transposition bet.',
      'Ties go to more coins left, then to larger starting funds.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The key insight is that **transposition moves every note at once**: the song keeps its shape but shifts by semitones, so you must work out how many steps put your two notes into it.' },
    { type: 'cards', items: [
      { title: '1 coin or 13', body: 'Twelve steps loop, so 13 coins moves the same as 1 — but since the top bettor decides, betting 13 for the same step can outbid others. Same movement, more control.' },
      { title: 'Black keys pay but are rare', body: 'They score more, yet a song in C has few. Some keys bring in many black keys, so black-key holders have a reason to team up and push there.' },
      { title: 'Secret notes, spoken alliances', body: 'Holdings are secret, so "I have D and G" may be false. Betting together on a shared key saves coins, but one late bigger bet flips it.' },
      { title: 'Winning is power', body: 'The winner redraws the teams for the next day, so this game is fought over power more than money.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Hanabi', players: '2–5', alike: 'Hidden holdings shared only by talk, with timing to coordinate.', differs: 'It is cooperative, with no betting.' },
    { name: 'High Society', players: '3–5', alike: 'The top bidder decides and losers’ bids are also lost, like the mute contest.', differs: 'It is an auction for goods.' },
  ],
});

export const hiddenCode = bg3Game('hidden-code', 'death', '7', ['equationSignal', 'equationTower', 'hiddenWord'], {
  meta: {
    title: '히든코드 규칙 — 피의 게임3 7일차 데스매치, 별 도형의 숨은 규칙 찾기',
    description: '피의 게임3 7일차 데스매치 히든코드의 규칙을 정리했어요. 1:1:1 개인전, 별 모양 도형의 숨은 계산 규칙, 집사의 주사위 2개와 각자 고르는 주사위 1개로 만드는 다섯 숫자 실험, 정답 선언과 30초 넘김, 3점 선승까지.',
    keywords: ['히든코드', '피의 게임3 히든코드', '피의게임3 데스매치', '규칙 추리 게임', '피의게임3'],
  },
  title: '히든코드 — 피의 게임3 7일차 데스매치',
  name: '히든코드',
  lead: '별 모양 도형의 다섯 꼭짓점에 숫자를 넣으면 가운데 값이 나와요. 숫자를 넣어 보며 그 계산 규칙을 먼저 알아내야 해요.',
  summary: '주사위 숫자를 별 도형에 넣어 결과를 보며 숨은 규칙을 추리하고, 문제 도형의 답을 먼저 맞히는 1:1:1 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1:1.',
      '**주사위**: 1–6 주사위 5개. 집사가 2개, 플레이어가 1개씩 가져요.',
      '**도형**: 라운드마다 별 모양의 문제 도형이 공개돼요. 별 도형에는 숨은 규칙이 있어요.',
      '**라운드**: 5라운드. 필기는 자유, 플레이어끼리 대화는 금지예요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '숫자 모으기', body: '집사가 주사위 2개를 굴려 공개하고, 플레이어 셋이 각자 자기 주사위의 숫자 하나를 골라 동시에 내요. 이렇게 모인 숫자 5개를 쓸 수 있어요.' },
      { title: '실험', body: '다섯 숫자를 원하는 조합으로 빈 별 도형에 넣어 결괏값을 확인해요. 숫자 둘 이상을 붙여 두 자리 수로 넣을 수도 있지만, 다섯 숫자를 모두 써야 해요.' },
      { title: '정답', body: '규칙을 알아낸 사람은 정답을 외치고, 문제 도형에 규칙을 적용한 값을 말해요. 맞으면 1점을 얻고 라운드가 끝나요. 틀리면 감점은 없고, 다른 사람에게 30초간 기회가 넘어가요.' },
      { title: '반복', body: '시간 안에 아무도 못 맞히면 숫자 모으기부터 다시 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**먼저 3점을 얻으면** 바로 이기고, 아니면 5라운드 뒤 최고점 한 명이 이겨요. 진 두 사람은 탈락해요.',
      '최고점이 같으면 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '실험 결과가 다른 사람에게도 보이는지는 정리 자료에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '히든코드는 **실험 설계의 게임**이에요. 숫자를 넣고 결과를 보는 일을 몇 번 반복해, 규칙을 하나로 좁혀야 해요. 좋은 실험은 한 번에 가설 여러 개를 지워요.' },
    { type: 'cards', items: [
      { title: '내 주사위 하나가 실험을 바꿔요', body: '다섯 숫자 중 두 개는 집사가, 세 개는 플레이어가 정해요. 내가 고르는 숫자는 실험의 변수를 조절하는 손잡이예요. 예를 들어 1이나 같은 숫자를 넣으면 "곱하는 규칙인지, 더하는 규칙인지"처럼 가설을 가르기 쉬워요.' },
      { title: '두 자리 수로 넣기', body: '숫자를 붙여 두 자리로 넣을 수 있으므로, 같은 다섯 숫자로도 여러 실험이 가능해요. 한 꼭짓점의 값만 바꾸고 나머지를 그대로 두는 비교 실험이 규칙을 가장 빨리 드러내요.' },
      { title: '틀려도 감점이 없어요', body: '오답에 감점이 없고 30초만 넘어가므로, 가설이 두셋으로 좁혀졌을 때 하나를 시험 삼아 말해 보는 것도 방법이에요. 다만 틀린 답이 남에게 힌트가 될 수 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '젠도 (Zendo)', players: '2–6명', alike: '배치를 만들어 결과를 확인하며 숨은 규칙을 추리해요.', differs: '젠도는 블록 배치가 규칙에 맞는지(예/아니오)만 알려 주고, 숫자 결괏값이 없어요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자 다섯 개를 모두 써서 계산하는 숫자 게임이에요.', differs: '크립토는 규칙이 공개된 사칙연산이고, 추리할 숨은 규칙이 없어요.' },
  ],
  note: '라운드별 숨은 규칙은 적지 않았어요.',
}, {
  meta: {
    title: 'Hidden Code rules — The Bloody Game 3, day 7 death match',
    description: 'The rules of Hidden Code from The Bloody Game 3: a three-way match, the hidden rule of a star-shaped figure, experiments with five numbers from the dealer’s two dice and each player’s one, declaring an answer and the 30-second pass, and first to three.',
    keywords: ['Hidden Code', 'Bloody Game 3 death match', 'rule deduction game'],
  },
  title: 'Hidden Code — The Bloody Game 3, day 7 death match',
  name: 'Hidden Code',
  lead: 'Put numbers on the five points of a star and a value comes out in the middle. Experiment to find the rule before anyone else.',
  summary: 'A three-way death match: feed dice numbers into a star figure, deduce its hidden rule and solve the problem star first.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1:1.',
      '**Dice**: five 1–6 dice — two for the butler, one per player.',
      '**Figures**: each round reveals a problem star; star figures follow a hidden rule.',
      '**Rounds**: five. Notes allowed; no talking between players.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Collect numbers', body: 'The butler rolls two dice; each player picks a number on their own die and all three reveal at once — five numbers in all.' },
      { title: 'Experiment', body: 'Put the five numbers into an empty star in any arrangement and see the result. Digits may be joined into two-digit numbers, but all five must be used.' },
      { title: 'Answer', body: 'Call out and give the problem star’s value: right scores a point and ends the round; wrong costs nothing and passes a 30-second chance on.' },
      { title: 'Repeat', body: 'If nobody solves it in time, collect new numbers.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First to three points** wins at once; otherwise the top scorer after five rounds. The other two are eliminated.',
      'A tie for top goes to extra time.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Whether experiments are visible to the other players could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Hidden Code is **about designing experiments**: each result should rule out several hypotheses at once.' },
    { type: 'cards', items: [
      { title: 'Your die is a dial', body: 'Two numbers come from the butler and three from players, so your choice tunes the experiment. A 1 or a repeated number quickly separates "multiplies" from "adds".' },
      { title: 'Two-digit inputs', body: 'Joining digits makes many experiments from the same five numbers; changing one point while keeping the rest fixed exposes the rule fastest.' },
      { title: 'Wrong answers are cheap', body: 'No penalty, only a 30-second pass, so testing one of two or three remaining hypotheses aloud is reasonable — though a wrong answer may hint others.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Zendo', players: '2–6', alike: 'Build arrangements, observe results, deduce a hidden rule.', differs: 'It answers only fits/doesn’t, with no numeric output.' },
    { name: 'Krypto', players: '1+', alike: 'Use all five given numbers in a calculation.', differs: 'The arithmetic is open; nothing hidden to deduce.' },
  ],
  note: 'The rules of each round are not reproduced.',
});

export const criminalMemory = bg3Game('criminal-memory', 'money', '8', ['hiddenWord', 'piggyBank', 'blindGomoku'], {
  meta: {
    title: '크리미널 메모리 규칙 — 피의 게임3 8일차 머니 챌린지, 흩어진 단서를 외워 모으는 팀 추리',
    description: '피의 게임3 8일차 머니 챌린지 크리미널 메모리의 규칙을 정리했어요. 7인 대 6인 팀전, 단서룸 7개와 필기 금지, 10분 확인과 본부 공유, 40분 뒤 바뀌는 두 번째 단서, 공유권, 순서대로 열리는 사건 질문 5개와 오답 시 10분 넘김까지.',
    keywords: ['크리미널 메모리', '피의 게임3 크리미널 메모리', '피의게임3 머니 챌린지', '추리 게임', '피의게임3'],
  },
  title: '크리미널 메모리 — 피의 게임3 8일차 머니 챌린지',
  name: '크리미널 메모리',
  lead: '단서는 방마다 하나씩, 필기는 금지. 팀원들이 각자 외워 온 조각을 맞춰 사건의 전말을 먼저 밝혀야 해요.',
  summary: '팀원마다 다른 단서룸에서 단서를 외워 와 합치고, 다섯 개의 사건 질문을 먼저 맞히는 7 대 6 팀 추리.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7인 팀과 6인 팀.',
      '**단서룸**: 첫 단서 7개가 방마다 하나씩 놓여요. 6인 팀은 한 명이 단서 두 개가 있는 8번 방에 들어가요.',
      '**필기**: 시작 전에 필기도구를 모두 거둬요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '사건 개요', body: '사건 개요가 공개돼요.' },
      { title: '단서 확인 (10분)', body: '각자 정해진 단서룸에서 단서를 봐요. 방 안에서는 말할 수 없어요.' },
      { title: '공유', body: '팀 본부에 모여 본 것을 말로 나누고 추리해요. 다시 보고 싶으면 단서룸에 다시 가서 10분 동안 볼 수 있어요.' },
      { title: '두 번째 단서', body: '40분이 지나면 첫 단서는 사라지고 두 번째 단서 7개가 놓여요.' },
      { title: '사건 질문', body: '추리를 마친 팀은 메인 홀에서 질문 5개를 1번부터 차례로 맞혀요. 앞의 질문을 맞혀야 다음 질문이 열려요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**먼저 다섯 질문을 모두 맞힌 팀**이 이겨, 팀원마다 2,000만 원과 면제권 1장을 받아요. 이긴 팀은 낙원, 진 팀은 잔해로 거처가 바뀌어요.',
      '진 팀은 투표로 두 명을 뽑아 1:1 데스매치를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '오답이면 지금까지 열린 질문이 모두에게 공개되고, 상대 팀이 10분 동안 정답 기회를 가져요.',
      '마지막 5번 질문은 메인 홀에서만 열리고, 답을 낸 팀은 상대 팀도 답할 때까지 격리돼요. 둘 다 맞으면 먼저 낸 팀이, 둘 다 틀리면 다시 추리해요.',
      '팀마다 한 번 **공유권**을 써서 단서 하나를 팀원 모두에게 보여 줄 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '크리미널 메모리는 **기억의 분업과 전달**이 핵심이에요. 한 사람이 한 단서만 보고, 말로만 옮겨야 하므로, 단서를 어떻게 요약해 전하느냐가 추리의 질을 정해요.' },
    { type: 'cards', items: [
      { title: '40분의 마감', body: '첫 단서는 40분 뒤 사라져요. 그 전에 다시 확인할 단서를 정해 두지 않으면 영영 못 봐요. 공유권은 가장 많은 정보를 담은 단서, 혹은 말로 옮기기 어려운 그림 단서에 쓰는 게 효율적이에요.' },
      { title: '오답은 상대에게 질문을 보여 줘요', body: '틀리면 열린 질문이 모두에게 공개되고 상대가 10분을 얻어요. 질문 자체가 추리 방향을 알려 주는 정보라, 섣부른 도전은 상대 팀을 도와요.' },
      { title: '인원 차이의 보정', body: '6인 팀은 한 명이 두 단서를 맡아 기억 부담이 커요. 그 자리에 기억력이 가장 좋은 사람을 넣는 것이 6인 팀의 첫 번째 결정이에요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '셜록 홈즈: 컨설팅 디텍티브', players: '1–8명', alike: '단서를 모아 팀이 함께 사건의 전말을 추리해요.', differs: '단서를 언제든 다시 읽을 수 있고, 상대 팀과의 경주가 아니에요.' },
    { name: '미스터리움 (Mysterium)', players: '2–7명', alike: '나뉜 정보를 말과 그림으로 전해 사건을 풀어요.', differs: '미스터리움은 유령 한 명이 그림 카드로만 힌트를 주는 협력 게임이에요.' },
  ],
  note: '사건과 단서의 내용은 적지 않았어요.',
}, {
  meta: {
    title: 'Criminal Memory rules — The Bloody Game 3, day 8 money challenge',
    description: 'The rules of Criminal Memory from The Bloody Game 3: seven against six, seven clue rooms and no notes, ten minutes to view and sharing at base, the second set of clues after 40 minutes, the share item, five case questions opened in order, and the ten-minute pass after a wrong answer.',
    keywords: ['Criminal Memory', 'Bloody Game 3 money challenge', 'team deduction game'],
  },
  title: 'Criminal Memory — The Bloody Game 3, day 8 money challenge',
  name: 'Criminal Memory',
  lead: 'One clue per room and no notes. Teammates pool the fragments they memorised to crack the case first.',
  summary: 'A seven-against-six team deduction: memorise clues in separate rooms, pool them and answer five case questions first.',
  setup: [
    { type: 'list', items: [
      '**Players**: a team of seven and a team of six.',
      '**Clue rooms**: seven first clues, one per room; in the six-player team one player takes room 8, holding two clues.',
      '**Notes**: all writing materials are confiscated.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Case', body: 'The case summary is revealed.' },
      { title: 'View (10 minutes)', body: 'Each player studies their room’s clue, in silence.' },
      { title: 'Share', body: 'Teams pool what they saw at base; rooms may be revisited for another ten minutes.' },
      { title: 'Second clues', body: 'After 40 minutes the first clues vanish and seven new ones appear.' },
      { title: 'Questions', body: 'A team ready to answer goes to the main hall for five questions opened in order; each must be right to see the next.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The first team through all five questions** wins ₩20 million and an immunity pass each, and moves to the Paradise; the losers move to the Wreckage.',
      'The losing team votes two members into a 1:1 death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A wrong answer reveals the opened questions to everyone and gives the other team ten minutes to answer.',
      'Question 5 opens only in the main hall; a team that answers waits in isolation until the other answers. Both right: the earlier wins; both wrong: deduction continues.',
      'Each team may once use a **share** to show one clue to all its members.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Criminal Memory turns on **dividing and transmitting memory**: each player sees one clue and can pass it on only by speech, so how it is summarised sets the quality of the deduction.' },
    { type: 'cards', items: [
      { title: 'The 40-minute deadline', body: 'First clues vanish after 40 minutes; decide early which to revisit. Use the share on the richest clue or one hard to describe, such as a picture.' },
      { title: 'Wrong answers show the questions', body: 'A miss reveals the questions and hands the rivals ten minutes; the questions themselves point the way, so rash attempts help the other team.' },
      { title: 'Balancing numbers', body: 'The six-player team’s double room carries a heavier memory load; putting its best memoriser there is its first decision.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Sherlock Holmes Consulting Detective', players: '1–8', alike: 'Gather clues and reconstruct a case as a group.', differs: 'Clues can be reread at any time and there is no rival team.' },
    { name: 'Mysterium', players: '2–7', alike: 'Split information is conveyed to solve a case.', differs: 'A single ghost gives hints only through picture cards, cooperatively.' },
  ],
  note: 'The case and clues are not described.',
});

export const equationMaze = bg3Game('equation-maze', 'death', '8', ['nemoCount', 'blindGomoku', 'hexagon'], {
  meta: {
    title: '수식미로 규칙 — 피의 게임3 8일차 데스매치, 외운 숫자로 합이 맞는 길 찾기',
    description: '피의 게임3 8일차 데스매치 수식미로의 규칙을 정리했어요. 16칸 숫자판 1분 암기 뒤 알파벳 면으로 교체, 출발점·도착점과 정답 값, 상하좌우로 이어진 길의 합, 정답 선언과 30초 넘김, 5문제 3점 선승까지.',
    keywords: ['수식미로', '피의 게임3 수식미로', '피의게임3 데스매치', '기억력 게임', '피의게임3'],
  },
  title: '수식미로 — 피의 게임3 8일차 데스매치',
  name: '수식미로',
  lead: '16칸의 숫자를 1분 동안 외운 뒤, 숫자가 가려진 판에서 출발점부터 도착점까지 합이 정답 값이 되는 길을 찾아요.',
  summary: '1분간 외운 4×4 숫자판에서 합이 목표 값이 되는 길을 먼저 찾는 1:1 기억·계산 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 숫자 16칸(4×4). 뒷면에는 알파벳이 적혀 있어요.',
      '**문제**: 3라운드 동안 모두 5문제(1·2라운드 2문제씩, 3라운드 1문제).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기 (1분)', body: '라운드가 시작되면 숫자 면이 1분 동안 공개됐다가 알파벳 면으로 바뀌어요.' },
      { title: '문제', body: '모니터에 출발점과 도착점의 알파벳, 정답 값이 나와요.' },
      { title: '길 찾기', body: '출발점부터 도착점까지 상하좌우로 맞닿은 칸만 이어, 지나간 숫자의 합이 정답 값이 되는 길을 찾아요.' },
      { title: '정답', body: '정답을 외치고 길의 알파벳을 말해요. 맞으면 1점, 틀리면 감점 없이 상대에게 30초 기회가 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**먼저 3점**을 얻거나, 3라운드 뒤 점수가 높은 사람이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드가 바뀔 때마다 숫자가 새로 바뀌고, 다시 1분 동안 외워요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식미로는 **16개의 숫자를 1분 안에 외우는 것**이 거의 전부예요. 길 찾기 자체는 4×4라 경우의 수가 크지 않지만, 숫자가 가려진 상태에서 계산해야 해요.' },
    { type: 'cards', items: [
      { title: '외우는 방식을 정하세요', body: '16개를 한 줄씩 네 자리 수 네 개로 외우거나(예: 3517, 2846…), 위치와 숫자를 이야기로 엮는 식이 도움이 돼요. 합을 구하는 게임이라 큰 숫자와 작은 숫자의 위치만이라도 정확히 기억하면 후보 길을 빠르게 지울 수 있어요.' },
      { title: '최단 길부터 확인', body: '출발점과 도착점이 정해지면 가장 짧은 길의 합부터 계산하고, 목표보다 작으면 돌아가는 길을, 크면 작은 숫자로 돌아가는 길을 찾아요. 칸을 다시 밟을 수 있는지 등은 정리 자료에 없어, 한 번씩만 지나는 길이 안전한 해석이에요.' },
      { title: '오답의 비용은 30초', body: '틀려도 감점은 없지만 상대가 30초를 받아요. 상대도 같은 기억을 가지고 있으니, 내 오답이 상대에게 "그 길은 아니다"는 정보를 줄 수도 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '잠깐 본 배치를 기억해 써야 하는 기억력 게임이에요.', differs: '메모리는 짝 맞추기이고 계산이 없어요.' },
    { name: '넘버링크·한붓그리기 퍼즐', players: '1명', alike: '격자에서 출발점과 도착점을 잇는 길을 조건에 맞게 찾는 퍼즐이에요.', differs: '퍼즐은 판을 보면서 풀고, 합 조건이 없는 경우가 많아요.' },
  ],
}, {
  meta: {
    title: 'Equation Maze rules — The Bloody Game 3, day 8 death match',
    description: 'The rules of Equation Maze from The Bloody Game 3: memorising a 16-cell number board for a minute before it flips to letters, start, end and target values, summing an orthogonal path, answering and the 30-second pass, and five problems, first to three.',
    keywords: ['Equation Maze', 'Bloody Game 3 death match', 'memory maths game'],
  },
  title: 'Equation Maze — The Bloody Game 3, day 8 death match',
  name: 'Equation Maze',
  lead: 'Memorise sixteen numbers in a minute, then on the hidden board find a path from start to end whose numbers add up to the target.',
  summary: 'A 1:1 memory-and-sums death match: find a path on a memorised 4×4 board that adds to the target first.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Board**: sixteen number cells (4×4) with letters on the back.',
      '**Problems**: five over three rounds (two, two, one).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise (one minute)', body: 'Each round the numbers are shown for a minute, then flipped to letters.' },
      { title: 'Problem', body: 'A screen gives the start and end letters and the target.' },
      { title: 'Path', body: 'Link edge-adjacent cells from start to end so the numbers passed add up to the target.' },
      { title: 'Answer', body: 'Call and give the path’s letters: right is a point; wrong passes a 30-second chance on, without penalty.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**First to three points**, or the higher score after three rounds, wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The numbers change each round, with another minute to memorise.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Equation Maze is almost entirely about **memorising sixteen numbers in a minute**; paths on 4×4 are few, but you compute them blind.' },
    { type: 'cards', items: [
      { title: 'Pick a memory method', body: 'Rows as four four-digit numbers (3517, 2846…) or a story linking positions helps. Since it is about sums, knowing where the big and small numbers sit rules out paths fast.' },
      { title: 'Start with the shortest path', body: 'Sum the shortest route first; if short of the target, detour; if over, route through small numbers. Whether cells may be reused is not stated, so single-visit paths are the safe reading.' },
      { title: 'A miss costs thirty seconds', body: 'No penalty, but the opponent gets 30 seconds — and your wrong path tells them what is not the answer.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Use a layout you saw only briefly.', differs: 'It is pair-matching with no arithmetic.' },
    { name: 'Numberlink-style path puzzles', players: '1', alike: 'Join start and end cells on a grid by a path meeting conditions.', differs: 'You solve with the grid in view, usually without sums.' },
  ],
});
