// 더 지니어스: 블랙가넷, rounds 7–9: 별자리 게임, 십이장기, 투자와 기부, 기억의 미로, 중간 달리기 2.
import { ep, g3Game, round } from './shared';

export const constellationGame = g3Game({
  slug: 'constellation-game', kind: 'main', when: round(7), episode: ep(7), eps: [7], note: 'two',
  related: ['gradation', 'hitStay', 'colorlink'],
}, {
  meta: {
    title: '별자리 게임 규칙 — 더 지니어스 시즌3 블랙가넷 7회전 메인매치, 숫자 카드로 별을 나눠 갖는 게임',
    description: '더 지니어스: 블랙가넷 7회전 메인매치 별자리 게임의 규칙을 정리했어요. 양자리·화살자리·카시오페아·거문고자리, 1–5 숫자 카드 동시 공개, 같은 숫자는 제외, 폭탄 3개면 탈락후보, 같은 색 3개 교환, 별자리 수만큼 가넷까지.',
    keywords: ['별자리 게임', '더 지니어스 별자리 게임', '더 지니어스3 별자리', '블랙가넷 7회전', '지니어스 시즌3 메인매치', '별자리 게임 규칙'],
  },
  title: '별자리 게임 — 더 지니어스: 블랙가넷 7회전 메인매치',
  name: '별자리 게임',
  lead: '숫자 카드를 동시에 내고, 낸 숫자만큼 별을 가져가요. 작은 숫자는 먼저 고르고 큰 숫자는 많이 가져가요. 남과 같은 숫자를 내면 아무것도 못 가져가고, 폭탄 세 개를 받으면 끝이에요.',
  summary: '1–5 숫자 카드를 동시에 내 별을 나눠 갖고, 같은 숫자는 서로 지워지는 눈치 싸움으로 별자리를 완성하는 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명. 각자 별자리 판과 숫자 카드 1–5 다섯 장.',
      '**주머니**: 빨강·노랑·파랑·초록 별 25개씩, 아무 별자리에나 쓸 수 있는 흰 별 5개.',
      '**폭탄**: 라운드마다 별 7개와 함께 폭탄 1개가 나와요. 폭탄을 3개 받으면 자동으로 탈락후보예요.',
    ] },
    { type: 'table', head: ['별자리', '필요한 별', '승점'], rows: [
      ['양자리', '빨강 3개', '2점'],
      ['화살자리', '노랑 4개', '3점'],
      ['카시오페아', '파랑 5개', '5점'],
      ['거문고자리', '초록 6개', '7점'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공개', body: '딜러가 주머니에서 별 7개를 꺼내 공개하고 폭탄 1개를 더해요.' },
      { title: '카드 제출', body: '선 플레이어(가나다순으로 돌아가요)부터 숫자 카드를 뒷면으로 내고, 모두 내면 동시에 뒤집어요. 쓴 카드는 돌려받아요.' },
      { title: '가져가기', body: '1을 낸 사람이 먼저 한 개, 2를 낸 사람이 다음으로 두 개, 3을 낸 사람이 세 개를 고르는 식으로, 작은 숫자부터 그 숫자만큼 별과 폭탄 중에서 골라 가져가요.' },
      { title: '같은 숫자', body: '같은 숫자를 낸 사람들은 별 고르기에서 빠져요.' },
      { title: '남은 것', body: '남은 별과 폭탄은 그대로 두고, 빠진 만큼만 별을 채워 다음 라운드를 해요. 그래서 판에는 늘 별 7개와 폭탄 1개가 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**누군가 별자리 3개를 완성하면** 그 즉시 끝나고, 그때 승점이 가장 높은 사람이 우승, 가장 낮은 사람이 탈락후보예요.',
      '**누군가 폭탄 3개를 받으면** 그 즉시 끝나고, 그 사람이 탈락후보, 승점이 가장 높은 사람이 우승이에요.',
      '우승자는 생명의 징표를 받고, 단독 우승이면 생명의 징표 하나와 블랙가넷 하나를 더 받아요. 탈락후보를 뺀 모두가 완성한 별자리 수만큼 가넷을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '내 차례에 남은 별이 낸 숫자보다 적으면 남은 별과 폭탄을 함께 가져가야 해요. 아무것도 남지 않았으면 받지 못해요.',
      '같은 별자리는 두 번 완성할 수 없어요. 같은 색 별 3개를 내면 원하는 색 별 1개로 바꿀 수 있어요(언제든 가능, 플레이어끼리 주고받기는 안 돼요).',
      '별은 언제든 판에 올리고 옮길 수 있어요. 폭탄은 주고받을 수 없어요.',
      '주머니의 별이 바닥날 때까지 끝나지 않으면 그때 승점으로 우승과 탈락후보를 정해요.',
      '영어 위키백과는 탈락 기준을 "별이 가장 적은 사람"으로 요약하지만, 이 페이지는 승점 기준이라는 나무위키의 규칙 설명을 따랐어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '별자리 게임의 핵심은 **같은 숫자가 지워지는 동시 선택**이에요. 7명이 1–5 다섯 개 숫자를 내니, 적어도 두 사람은 반드시 누군가와 숫자가 겹쳐요.' },
    { type: 'cards', items: [
      { title: '작은 숫자는 안전, 큰 숫자는 위험', body: '먼저 고르는 사람은 폭탄을 피해 별만 가져갈 수 있어요. 늦게 고르는 사람은 앞사람들이 별을 가져간 뒤라, 남은 것이 숫자보다 적으면 폭탄까지 떠안아요. 살아남은 숫자의 합이 8을 넘는 판이라면 가장 큰 숫자를 낸 사람이 폭탄을 받을 가능성이 커요.' },
      { title: '큰 별자리가 효율이 좋다', body: '별 하나당 승점은 양자리 0.67, 화살자리 0.75, 카시오페아 1.0, 거문고자리 약 1.17이에요. 큰 별자리일수록 효율이 좋지만 완성까지 오래 걸려, 누군가 작은 별자리 세 개로 게임을 빨리 끝내 버리면 미완성 별은 0점이에요.' },
      { title: '끝내는 사람이 정한다', body: '별자리 3개 완성은 게임을 끝내는 조건일 뿐, 우승은 승점으로 정해요. 그래서 승점이 앞선 사람은 빨리 끝내고 싶고, 뒤진 사람은 끝을 늦추고 싶어요. 폭탄 2개를 가진 사람은 큰 숫자를 낼 수 없어 행동이 읽혀요.' },
    ], columns: 1 },
    { type: 'p', text: '서로 숫자를 피하는 눈치 싸움이라 **우월 전략은 없어요.** 다만 다른 사람이 무엇을 낼지 약속하고 그 약속이 지켜진다면 겹침을 피할 수 있어서, 연합의 크기가 그대로 별의 양으로 바뀌어요.' },
  ],
  similar: [
    { name: '훌스 데어 가이어 (Hol’s der Geier, 영어판 Raj)', players: '2–6명', alike: '숫자 카드를 동시에 내고, 같은 숫자는 서로 지워져 다음 사람에게 기회가 가요.', differs: '가장 큰 숫자가 점수 카드를 가져가고, 낸 카드는 다시 쓰지 못해요.' },
    { name: '콜로레토 (Coloretto)', players: '2–5명', alike: '색깔 카드를 모으고, 많이 모은 색일수록 점수가 커져요.', differs: '줄에 카드를 쌓고 가져갈 줄을 고르는 방식이고, 너무 많은 색은 감점이에요.' },
  ],
}, {
  meta: {
    title: 'Constellation Game rules — The Genius: Black Garnet round 7 main match, splitting stars with number cards',
    description: 'The rules of the Constellation Game (별자리 게임), round 7 main match of The Genius: Black Garnet: Aries, Sagitta, Cassiopeia and Lyra, simultaneous 1–5 number cards, matching numbers knocked out, three bombs making you the candidate, three-for-one star swaps and a garnet per constellation.',
    keywords: ['Constellation Game', 'The Genius Constellation Game', 'The Genius Black Garnet', 'The Genius season 3', '별자리 게임'],
  },
  title: 'Constellation Game — The Genius: Black Garnet, round 7 main match',
  name: 'Constellation Game (별자리 게임)',
  lead: 'Reveal number cards together and take that many stars: low numbers pick first, high numbers take more. Match someone’s number and you get nothing; take three bombs and you are done.',
  summary: 'Simultaneous 1–5 cards split the stars, matching numbers cancel, and players race to complete constellations.',
  setup: [
    { type: 'list', items: [
      '**Players**: seven, each with a constellation board and number cards 1–5.',
      '**The bag**: 25 each of red, yellow, blue and green stars, plus 5 white stars usable in any constellation.',
      '**Bombs**: each round seven stars come out with one bomb. Three bombs make you the elimination candidate.',
    ] },
    { type: 'table', head: ['Constellation', 'Stars needed', 'Points'], rows: [
      ['Aries', '3 red', '2'],
      ['Sagitta', '4 yellow', '3'],
      ['Cassiopeia', '5 blue', '5'],
      ['Lyra', '6 green', '7'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Reveal', body: 'The dealer draws seven stars and adds a bomb.' },
      { title: 'Cards', body: 'Starting with the round’s first player (rotating in Korean alphabetical order), everyone lays a number card face down; all are flipped together and returned afterwards.' },
      { title: 'Taking', body: 'The player who played 1 takes one item first, then 2 takes two, 3 takes three, and so on, choosing among the stars and the bomb.' },
      { title: 'Matches', body: 'Players who played the same number are left out of the picking.' },
      { title: 'Leftovers', body: 'Unclaimed stars and bomb stay, and only the missing stars are replaced, so every round shows seven stars and one bomb.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**When someone completes three constellations**, the game ends at once: highest score wins, lowest is the candidate.',
      '**When someone takes a third bomb**, the game ends at once: that player is the candidate and the highest score wins.',
      'The winner gets a token of life; a sole winner also gets another token and a black garnet. Everyone except the candidate earns a garnet per completed constellation.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If fewer items remain than your number, you must take what is left, bomb included; if nothing remains, you get nothing.',
      'A constellation cannot be completed twice. Three stars of one colour can be swapped for one of any colour at any time; players cannot trade with each other.',
      'Stars can be placed and moved on your board at any time; bombs cannot be passed on.',
      'If the bag runs out first, the scores at that point decide the winner and candidate.',
      'English Wikipedia summarises the loser as the player with the fewest stars; this page follows the fan wiki’s transcription, which ranks by points.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The heart of the Constellation Game is **a simultaneous choice in which matches cancel**. Seven players choosing among five numbers guarantees that at least two collide.' },
    { type: 'cards', items: [
      { title: 'Low is safe, high is risky', body: 'Early pickers can take stars and leave the bomb. Late pickers come after the stars are gone, and if fewer items are left than their number, they must take the bomb. When the surviving numbers add up to more than eight, the highest number is the likely bomb-taker.' },
      { title: 'Big constellations pay better', body: 'Points per star: Aries 0.67, Sagitta 0.75, Cassiopeia 1.0, Lyra about 1.17. Bigger is more efficient but slower, and if someone ends the game fast with three small ones, unfinished stars score nothing.' },
      { title: 'The finisher decides', body: 'Three constellations only end the game; points decide the winner. Leaders want to finish fast, trailers want to stall, and a player on two bombs cannot risk a high number, which makes them predictable.' },
    ], columns: 1 },
    { type: 'p', text: 'It is a game of avoiding each other’s numbers, so **there is no dominant strategy**. But if players agree on who plays what and keep their word, collisions disappear, so the size of an alliance turns directly into stars.' },
  ],
  similar: [
    { name: 'Hol’s der Geier (Raj)', players: '2–6', alike: 'Number cards are revealed at once, and equal numbers cancel and pass the chance on.', differs: 'The highest card takes the point card, and played cards are gone for good.' },
    { name: 'Coloretto', players: '2–5', alike: 'Collect coloured cards; the more of a colour, the more it scores.', differs: 'Cards are laid in rows and you choose a row to take; too many colours cost points.' },
  ],
});

export const twelveJanggi = g3Game({
  slug: 'twelve-janggi', kind: 'death', when: { ko: '7회전 데스매치, 결승 1국', en: 'Death match of round 7; final, game 1' },
  episode: { ko: '7·12화', en: 'Episodes 7 and 12' }, eps: [7, 12], note: 'two',
  related: ['janggi', 'cardJanggi', 'russianJanggi'],
  site: { id: 'janggi', name: { ko: '십이장기', en: 'Twelve Janggi' }, file: 'src/lib/janggi.ts' },
}, {
  meta: {
    title: '십이장기 규칙 — 더 지니어스 시즌3 블랙가넷 7회전 데스매치·결승 1국, 12칸 장기',
    description: '더 지니어스: 블랙가넷 7회전 데스매치이자 결승 첫 게임인 십이장기의 규칙을 정리했어요. 3×4 판, 왕·장·상·자, 후(侯) 승격, 잡은 말 다시 놓기, 왕 잡기와 적진 입성 승리, 결승 90초 제한과 멀리건 아이템, 그리고 PUZZLTHINK에서 바로 플레이.',
    keywords: ['십이장기', '12장기', '십이 장기', '더 지니어스 십이장기', '더 지니어스3 결승', '블랙가넷 데스매치', '십이장기 규칙'],
  },
  title: '십이장기 — 더 지니어스: 블랙가넷 7회전 데스매치, 결승 1국',
  name: '십이장기',
  lead: '열두 칸 판에 말 네 개씩. 잡은 상대 말을 내 말로 다시 놓을 수 있고, 왕을 잡거나 내 왕이 적진에 들어가 한 턴을 버티면 이겨요.',
  summary: '3×4 판에서 왕·장·상·자 네 말로 두는 작은 장기. 잡은 말을 다시 쓰고, 적진 입성으로도 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 2명.',
      '**판**: 가로 4칸 × 세로 3칸, 모두 12칸. 각자 자기 바로 앞쪽 3칸이 자기 진영이에요.',
      '**말(각자 1개씩)**: 정해진 자리에서 시작하고, 말에 표시된 방향으로만 한 칸 움직여요.',
    ] },
    { type: 'table', head: ['말', '시작 자리', '움직임'], rows: [
      ['왕(王)', '진영 가운데', '여덟 방향 모두'],
      ['장(將)', '진영 오른쪽', '앞·뒤·좌·우'],
      ['상(相)', '진영 왼쪽', '대각선 네 방향'],
      ['자(子)', '왕 앞', '앞으로만. 상대 진영에 들어가면 뒤집어 후(侯)가 돼요.'],
      ['후(侯)', '자가 승격', '대각선 뒤쪽 두 방향만 빼고 여섯 방향'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '한 수', body: '선부터 번갈아 말 하나를 한 칸 움직여요. 말의 방향은 돌릴 수 없어요.' },
      { title: '잡기', body: '상대 말이 있는 칸으로 가면 그 말을 포로로 잡아요. 잡은 말은 다음 턴부터 내 말로 쓸 수 있어요.' },
      { title: '놓기', body: '포로를 판에 내려놓는 것도 한 수예요. 빈칸에만 놓을 수 있고, **상대 진영에는 놓을 수 없어요.** 원하지 않으면 끝까지 쓰지 않아도 돼요.' },
      { title: '후를 잡으면', body: '상대의 후를 잡아 쓸 때는 자로 뒤집어서 써요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '상대의 **왕을 잡으면** 이겨요.',
      '내 **왕이 상대 진영에 들어가** 내 차례가 다시 올 때까지 한 턴을 버티면 이겨요.',
      '데스매치에서는 진 사람이 탈락하고, 결승에서는 세 게임 중 하나를 내줘요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**결승 규칙**: 한 턴은 90초예요. 90초 안에 말을 두지 못하면 그 사람이 져요.',
      '**결승 아이템**: 멀리건(2개, 상대가 두기 전에 직전 내 수를 무르고 다시 두기, 시간은 다시 90초), 90초(내 턴 제한 시간을 90초 늘림).',
      '이 시즌의 7회전 데스매치와 결승 1국, 이후 「그랜드 파이널」에서도 다시 나왔어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '십이장기는 일본의 「동물 장기(どうぶつしょうぎ)」를 바탕으로 한 게임이에요. 판이 작아 수가 적어 보이지만, **잡은 말을 다시 놓는 규칙** 때문에 말이 판에서 사라지지 않고, 수읽기가 생각보다 훨씬 깊어요.' },
    { type: 'cards', items: [
      { title: '두 가지 승리 조건이 서로를 막는다', body: '왕을 지키려면 뒤로 물러나야 하고, 적진에 입성하려면 앞으로 나가야 해요. 상대 왕이 내 진영 앞까지 오면 잡을 수 있는 말이 있는지, 놓을 포로가 있는지가 곧바로 승패를 갈라요. 포로는 상대 진영에 놓을 수 없으니, 입성을 막는 데는 쓸 수 있어도 입성을 돕는 데는 못 써요.' },
      { title: '말의 가치', body: '왕을 빼면 가장 활동적인 말은 후이지만, 잡히면 자로 돌아가서 상대에게는 약한 말 하나만 넘어가요. 장과 상은 서로 못 가는 칸을 가는 짝이라, 하나를 잃으면 그 방향이 비어요. 교환은 수를 하나 쓰는 대신 포로 하나를 얻는 거래라, 누가 먼저 놓을 수 있느냐(템포)가 중요해요.' },
      { title: '작은 판의 함정', body: '칸이 12개뿐이라 한 수의 실수가 바로 왕 잡힘으로 이어져요. 결승처럼 시간이 제한되면 모든 수를 끝까지 읽기 어려워, 미리 외운 초반 수순과 위험한 배치를 알아보는 감각이 크게 작용해요.' },
    ], columns: 1 },
    { type: 'p', text: '운이 전혀 없는 완전 정보 게임이에요. 원작 동물 장기는 컴퓨터로 끝까지 분석되어 최선의 수가 알려져 있지만, 십이장기는 포로를 상대 진영에 놓지 못하는 등 규칙이 달라 그 결과를 그대로 쓸 수는 없어요. 사람끼리의 대국에서 **우월 전략은 없고**, 결국 더 깊이 읽는 쪽이 이겨요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      '판, 말의 움직임, 후 승격, 포로 놓기(상대 진영 금지), 왕 잡기와 입성 승리는 방송과 같아요. 판은 세로로 세워 아래쪽이 내 진영이에요.',
      'AI(헬 모드까지)나 친구와 온라인으로 해요. 친구 대전에는 차례 제한 시간이 있고, 시간이 지나면 자동으로 한 수가 두어지며 세 번 연속이면 기권패예요. 방송 결승은 90초를 넘기면 바로 패배였어요.',
      '모든 게임이 끝나도록 200수가 지나면 무승부로 쳐요. 멀리건 같은 결승 아이템은 없어요.',
    ] },
  ],
  similar: [
    { name: '동물 장기 (どうぶつしょうぎ, Dōbutsu shōgi)', players: '2명', alike: '3×4 판, 사자·기린·코끼리·병아리 네 말, 잡은 말 다시 놓기, 사자 입성 승리까지 거의 같아요.', differs: '잡은 말을 상대 진영에도 놓을 수 있어요.' },
    { name: '쇼기 (将棋)', players: '2명', alike: '잡은 말을 내 말로 다시 놓는 규칙과 적진 승격의 원조예요.', differs: '9×9 판에 말이 20개씩이라 훨씬 길고 복잡해요.' },
  ],
}, {
  meta: {
    title: 'Twelve Janggi rules — The Genius: Black Garnet death match of round 7 and final game 1',
    description: 'The rules of Twelve Janggi (십이장기), death match of round 7 and first game of the final of The Genius: Black Garnet: a 3×4 board, King, General, Minister and Man, promotion to Lord, dropping captured pieces, winning by capture or by the king entering the enemy camp, the final’s 90-second turns and mulligans, and a playable version on PUZZLTHINK.',
    keywords: ['Twelve Janggi', '12 Janggi', 'Sibi Janggi', 'The Genius Twelve Janggi', 'The Genius final', '십이장기'],
  },
  title: 'Twelve Janggi — The Genius: Black Garnet, death match of round 7, final game 1',
  name: 'Twelve Janggi (십이장기)',
  lead: 'Twelve squares, four pieces each. Captured pieces come back on your side, and you win by taking the king or by your king entering the enemy camp and surviving a turn.',
  summary: 'A miniature janggi on a 3×4 board with King, General, Minister and Man; captures return as drops, and entering the enemy camp also wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: two.',
      '**Board**: 4 × 3, twelve squares; the three squares nearest each player are their camp.',
      '**Pieces (one of each)**: start on fixed squares and move one step only in the directions marked on them.',
    ] },
    { type: 'table', head: ['Piece', 'Starts', 'Moves'], rows: [
      ['King (王)', 'Centre of the camp', 'All eight directions'],
      ['General (將)', 'Right of the camp', 'Forward, back, left, right'],
      ['Minister (相)', 'Left of the camp', 'The four diagonals'],
      ['Man (子)', 'In front of the king', 'Forward only; flips to Lord (侯) on entering the enemy camp'],
      ['Lord (侯)', 'Promoted Man', 'Six directions: all but the two diagonals backwards'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'A move', body: 'Players alternate moving one piece one step; pieces cannot be turned.' },
      { title: 'Capturing', body: 'Moving onto an enemy piece captures it; from the next turn it is yours to use.' },
      { title: 'Dropping', body: 'Placing a captured piece is a whole move, only onto an empty square and **never into the enemy camp**; you may also keep it in hand forever.' },
      { title: 'Captured Lords', body: 'A captured Lord returns as a Man.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Capturing the enemy king** wins.',
      '**Your king entering the enemy camp** and surviving until your next turn also wins.',
      'The loser of the death match is eliminated; in the final it costs one game of three.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Final rules**: 90 seconds a turn; failing to move in time loses.',
      '**Final items**: Mulligan (two of them: before the opponent moves, take back and replay your last move with a fresh 90 seconds) and 90 Seconds (adds 90 seconds to one turn).',
      'It was played in this season’s round 7 death match and final game 1, and again later in The Genius: Grand Final.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Twelve Janggi is based on Japan’s Dōbutsu shōgi (“animal shogi”). The small board looks shallow, but because **captured pieces return as drops**, nothing ever leaves the game and the reading runs much deeper than it seems.' },
    { type: 'cards', items: [
      { title: 'Two win conditions pull against each other', body: 'Guarding the king means staying back; entering the enemy camp means pushing forward. When a king reaches your camp’s edge, whether you have a piece to take it or a drop to block decides the game. Drops cannot go into the enemy camp, so they help stop an entry but never help make one.' },
      { title: 'What pieces are worth', body: 'After the king the Lord is the strongest, but captured it reverts to a Man, so the opponent gains only a weak piece. General and Minister cover each other’s missing squares, so losing one opens that direction. A trade spends a move to gain a drop, which makes tempo—who can drop first—crucial.' },
      { title: 'The trap of a small board', body: 'With only twelve squares, one mistake leads straight to a lost king. Under a time limit like the final’s, full reading is hard, so prepared openings and an eye for dangerous shapes matter a great deal.' },
    ], columns: 1 },
    { type: 'p', text: 'It is a perfect-information game with no luck. The original Dōbutsu shōgi has been analysed to the end by computer, but Twelve Janggi’s rules differ (no drops into the enemy camp, for one), so that result cannot simply be borrowed. Between humans **there is no dominant strategy**; the deeper reader wins.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'The board, moves, promotion, drops (none into the enemy camp), capture and entry wins are as broadcast. The board stands upright, with your camp at the bottom.',
      'You play the AI (up to hell mode) or a friend online. Friend games have a turn timer: on time-out a move is made for you, and three in a row forfeits. In the broadcast final, going past 90 seconds lost at once.',
      'A game still going after 200 moves is a draw. Final items such as mulligans are not included.',
    ] },
  ],
  similar: [
    { name: 'Dōbutsu shōgi (どうぶつしょうぎ)', players: '2', alike: 'A 3×4 board, lion, giraffe, elephant and chick, drops and the lion-entry win are almost identical.', differs: 'Captured pieces may be dropped into the enemy camp too.' },
    { name: 'Shogi (将棋)', players: '2', alike: 'The original of dropping captured pieces and promotion in the enemy zone.', differs: 'A 9×9 board with twenty pieces each makes it far longer and deeper.' },
  ],
});

export const investmentAndDonation = g3Game({
  slug: 'investment-and-donation', kind: 'main', when: round(8), episode: ep(8), eps: [8], note: 'two',
  related: ['piggyBank', 'blackWhite2', 'gradation'],
}, {
  meta: {
    title: '투자와 기부 규칙 — 더 지니어스 시즌3 블랙가넷 8회전 메인매치, 대주주 표식과 수전노 표식',
    description: '더 지니어스: 블랙가넷 8회전 메인매치 투자와 기부의 규칙을 정리했어요. 15만 원의 지폐 구성, 9라운드 비공개 투자·기부, 최고 투자자 동점은 무효, 최저 기부자 수전노, 대주주의 수전노 면제, 대주주 수만큼 가넷까지.',
    keywords: ['투자와 기부', '더 지니어스 투자와 기부', '더 지니어스3 투자와기부', '블랙가넷 8회전', '대주주 수전노', '지니어스 시즌3 메인매치'],
  },
  title: '투자와 기부 — 더 지니어스: 블랙가넷 8회전 메인매치',
  name: '투자와 기부',
  lead: '아홉 라운드 동안 15만 원을 투자와 기부에 나눠 써요. 투자를 가장 많이 하면 대주주, 기부를 가장 적게 하면 수전노. 수전노가 가장 많은 사람이 꼴찌예요.',
  summary: '한정된 돈을 투자와 기부에 몰래 나눠 내며, 대주주 표식은 모으고 수전노 표식은 피하는 9라운드 입찰전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6명.',
      '**돈**: 각자 1천 원권 10장, 5천 원권 10장, 1만 원권 4장, 5만 원권 1장, 모두 15만 원. 딜러 룸에 보관하고, 주고받거나 버릴 수 없어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '투자·기부', body: '라운드마다 한 명씩 딜러 룸의 투자처와 기부처에 들어가, 가진 돈 안에서 원하는 만큼 내요. 안 내도 돼요. **거스름돈은 없어서** 가진 지폐로 금액을 맞춰야 해요.' },
      { title: '발표', body: '라운드가 끝나면 투자 총액과 기부 총액, 그리고 가장 많이 투자한 사람과 가장 적게 기부한 사람이 공개돼요. 각자 낸 금액은 공개되지 않아요.' },
      { title: '대주주 표식', body: '가장 많이 투자한 사람이 받아요. 최고액이 여럿이면 그들은 받지 못하고, 그다음으로 많이 낸 사람이 받아요.' },
      { title: '수전노 표식', body: '가장 적게 기부한 사람이 받아요. 최저액이 여럿이면 모두 받아요. 단 그 라운드 대주주는 받지 않고, 그다음으로 적게 낸 사람이 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '9라운드 뒤 **수전노 표식이 가장 많은 사람이 탈락후보**예요. 대주주 표식이 아무리 많아도 탈락후보는 우승할 수 없어요.',
      '나머지 중 **대주주 표식이 가장 많은 사람이 우승**해 생명의 징표를 받아요. 단독 우승이면 생명의 징표 하나와 블랙가넷 하나를 더 받아요.',
      '탈락후보를 뺀 모두가 대주주 표식 수만큼 가넷을 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '표식은 주고받거나 버릴 수 없어요.',
      '영어 위키백과의 요약도 같은 구조(최고 투자 동점 시 다음 사람, 대주주의 수전노 면제)를 전해요. 지폐 구성은 나무위키에만 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '투자와 기부는 두 개의 입찰이 한 지갑을 나눠 쓰는 게임이에요. 돈 자체는 점수가 아니고 **라운드마다의 순위**만 중요해서, 얼마를 쓰느냐보다 남보다 조금 더(또는 조금 덜) 쓰는 것이 핵심이에요.' },
    { type: 'cards', items: [
      { title: '동점은 무효, 협력하면 지운다', body: '최고 투자액이 같으면 둘 다 대주주를 못 받아요. 그래서 두 사람이 같은 금액을 맞추기로 하면 서로를 지우고, 대주주는 셋째로 많이 낸 사람에게 가요. 반대로 수전노는 동점이면 모두 받으니, 다 같이 0원을 내면 모두가 수전노라 아무도 앞서지 않아요.' },
      { title: '대주주는 수전노를 피한다', body: '그 라운드 대주주는 기부를 적게 해도 수전노가 되지 않아요. 한 번의 큰 투자가 두 표식을 동시에 해결하는 셈이라, 5만 원권 한 장의 쓰임새가 특히 커요.' },
      { title: '지폐가 만드는 정보', body: '거스름돈이 없어서 낼 수 있는 금액이 지폐 구성에 묶여요. 1천 원권이 열 장뿐이라 작은 단위 조절에도 한계가 있고, 투자·기부 총액이 공개되므로 아홉 라운드 동안 누가 얼마쯤 남았는지 추측할 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '모두가 같은 자원으로 시작하는 순위 입찰이라 **우월 전략은 없어요.** 꼴찌가 데스매치 상대를 고른다는 규칙 때문에, 데스매치에 자신 있는 사람이 일부러 꼴찌를 택하는 선택도 열려 있어요. 그래서 남은 사람들은 수전노 표식이 누구에게 쌓이는지까지 계산해야 해요.' },
  ],
  similar: [
    { name: '합 운트 굿 (Hab & Gut)', players: '3–5명', alike: '주식으로 돈을 불리면서 기부도 해야 하고, 기부금이 가장 적은 사람은 부자여도 탈락해요.', differs: '돈은 주식 거래로 늘고, 기부는 한 번에 모아 비교해요.' },
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '한정된 지폐로 입찰하고, 끝에 가장 가난한 사람은 점수와 상관없이 탈락해요.', differs: '공개 경매로 사치품을 사고, 지폐를 내면 거스름돈 없이 그대로 써 버려요.' },
  ],
}, {
  meta: {
    title: 'Investment and Donation rules — The Genius: Black Garnet round 8 main match, top-investor and miser badges',
    description: 'The rules of Investment and Donation (투자와 기부), round 8 main match of The Genius: Black Garnet: ₩150,000 in fixed banknotes, nine rounds of secret investing and donating, tied top investments cancelled, misers for the smallest donation, top investors exempt, and a garnet per top-investor badge.',
    keywords: ['Investment and Donation', 'The Genius Investment and Donation', 'The Genius Black Garnet', 'The Genius season 3', '투자와 기부'],
  },
  title: 'Investment and Donation — The Genius: Black Garnet, round 8 main match',
  name: 'Investment and Donation (투자와 기부)',
  lead: 'Over nine rounds, split ₩150,000 between investing and donating. The biggest investor gets a Top Investor badge, the smallest donor a Miser badge; most Misers loses.',
  summary: 'Secretly split a fixed purse between investment and donation for nine rounds: collect Top Investor badges, dodge Miser badges.',
  setup: [
    { type: 'list', items: [
      '**Players**: six.',
      '**Money**: ten ₩1,000 notes, ten ₩5,000, four ₩10,000 and one ₩50,000 each—₩150,000. It is kept in the dealer’s room and cannot be traded or destroyed.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Invest and donate', body: 'Each round players enter the dealer’s room one by one and pay what they like into investment and donation, or nothing. **There is no change**, so amounts must be made from the notes you hold.' },
      { title: 'Announcement', body: 'After the round the investment and donation totals are announced, with who invested most and who donated least, but not how much anyone paid.' },
      { title: 'Top Investor', body: 'Goes to the biggest investor. If several tie for the top, none gets it and the next highest does.' },
      { title: 'Miser', body: 'Goes to the smallest donor; ties all receive it. That round’s Top Investor is exempt and the next smallest donor gets it instead.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After nine rounds **most Miser badges makes you the candidate**, however many Top Investor badges you have.',
      'Of the rest, **most Top Investor badges wins** a token of life; a sole winner also gets another token and a black garnet.',
      'Everyone but the candidate earns a garnet per Top Investor badge.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Badges cannot be traded or discarded.',
      'English Wikipedia’s summary gives the same structure (a tied top passes to the next investor; the top investor is exempt from Miser). The banknote set appears only in the fan wiki.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Investment and Donation is two auctions sharing one wallet. Money is not points; only **each round’s ranking** matters, so the skill is spending a little more (or less) than others, not spending a lot.' },
    { type: 'cards', items: [
      { title: 'Ties cancel, and allies can cancel each other', body: 'Equal top investments both miss out, so two players agreeing on the same figure erase each other and hand the badge to the third. Misers work the other way: ties all receive it, so if everyone donates nothing, everyone is a miser and nobody gains.' },
      { title: 'Top Investors dodge Miser', body: 'The round’s Top Investor cannot be a Miser however little they donate. One big investment settles both badges at once, which makes the single ₩50,000 note especially valuable.' },
      { title: 'Banknotes leak information', body: 'With no change, payable amounts are tied to your notes; only ten ₩1,000 notes limit fine adjustments. Because totals are announced, nine rounds let players estimate who has how much left.' },
    ], columns: 1 },
    { type: 'p', text: 'Everyone starts with the same resources in a ranking auction, so **there is no dominant strategy**. Since the candidate chooses the death-match opponent, a player confident in death matches can even aim for last place on purpose, so the others must track where the Miser badges are piling up.' },
  ],
  similar: [
    { name: 'Hab & Gut', players: '3–5', alike: 'Grow money through shares while also donating; the smallest donor is knocked out however rich.', differs: 'Money grows by share trading, and donations are compared once at the end.' },
    { name: 'High Society', players: '3–5', alike: 'Bid with a fixed set of money cards; the poorest at the end is out whatever their score.', differs: 'Open auctions for luxuries, with no change given for cards paid.' },
  ],
});

export const memoryMaze = g3Game({
  slug: 'memory-maze', kind: 'death', when: { ko: '8·9회전', en: 'Rounds 8 and 9' }, episode: { ko: '8·9화', en: 'Episodes 8 and 9' },
  eps: [8, 9], note: 'two',
  related: ['nemoCount', 'onestroke', 'wallgo'],
}, {
  meta: {
    title: '기억의 미로 규칙 — 더 지니어스 시즌3 블랙가넷 8·9회전 데스매치, 보이지 않는 벽의 미로',
    description: '더 지니어스: 블랙가넷 8·9회전 데스매치 기억의 미로의 규칙을 정리했어요. 7×7 판, 보이지 않는 벽 32개, 번갈아 정확히 3칸 이동, 벽에 닿으면 출발점으로, 6칸 더블찬스, 상대의 실패에서 벽을 배우는 법까지.',
    keywords: ['기억의 미로', '더 지니어스 기억의 미로', '더 지니어스3 데스매치', '블랙가넷 데스매치', '보이지 않는 벽 미로', '기억의 미로 규칙'],
  },
  title: '기억의 미로 — 더 지니어스: 블랙가넷 8·9회전 데스매치',
  name: '기억의 미로',
  lead: '7×7 판 어딘가에 보이지 않는 벽 32개가 있어요. 번갈아 3칸씩 움직이다 벽에 닿으면 출발점으로 돌아가요. 벽의 위치를 기억해 먼저 도착점에 닿으면 이겨요.',
  summary: '보이지 않는 벽 32개가 있는 7×7 미로를 3칸씩 번갈아 움직이며, 부딪혀 알아낸 벽을 기억해 먼저 도착하는 1:1 기억력 승부.',
  setup: [
    { type: 'list', items: [
      '**인원**: 데스매치 진출자 2명.',
      '**판**: 가로·세로 7칸 정사각형 미로판. 칸 사이에 보이지 않는 벽 32개가 있어요. 벽 배치는 끝날 때까지 공개되지 않아요.',
      '**출발과 도착**: 두 사람은 판의 서로 다른 모서리에서 출발하고, 각자 대각선 반대편 모서리가 도착점이에요. 최단 거리는 두 사람이 같아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '이동', body: '선부터 번갈아 **정확히 3칸**씩 가로나 세로로 움직여요. 3칸보다 적게 움직일 수 없고, 대각선은 안 돼요.' },
      { title: '벽', body: '움직이다 보이지 않는 벽을 지나려 하면 그 즉시 실패해 출발점으로 돌아가고, 다음 턴은 출발점에서 다시 시작해요.' },
      { title: '더블찬스', body: '각자 두 번, 그 턴의 이동을 6칸으로 늘릴 수 있어요. 쓰면 반드시 6칸을 다 움직여야 해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '먼저 도착점에 닿은 사람이 이기고, 진 사람이 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '출발점(어느 모서리)과 선은 데스매치에 지목당한 사람이 정해요.',
      '바닥에 무언가를 떨어뜨리거나 표시할 수 없어요. 상대와 같은 칸에 있어도 돼요.',
      '영어 위키백과는 더블찬스를 게임당 한 번으로 요약하지만, 이 페이지는 각자 두 번이라는 나무위키의 규칙 설명을 따랐어요.',
      '이 시즌 8·9회전에 연속으로 나왔고, 다른 시즌에는 쓰이지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '기억의 미로는 혼자 푸는 미로가 아니에요. 상대가 벽에 부딪히는 순간 **그 벽의 위치는 두 사람 모두에게** 드러나요. 그래서 이 게임은 기억력 대결이면서, 남의 탐색을 얼마나 잘 훔쳐 쓰느냐의 싸움이에요.' },
    { type: 'cards', items: [
      { title: '정확히 3칸의 제약', body: '한 번에 꼭 3칸을 가야 해서, 아는 벽 바로 앞에서 멈출 수 없어요. 길을 3칸 단위로 끊어 계획해야 하고, 막다른 곳 근처에서는 일부러 돌아가는 수를 써야 할 때도 있어요. 실패하면 출발점부터 다시라, 위험한 칸을 탐색하는 일은 도착점에서 먼 초반에 하는 편이 손해가 적어요.' },
      { title: '먼저 가는 사람이 길을 연다', body: '내가 벽에 부딪혀 알아낸 정보는 상대도 공짜로 얻어요. 두 사람의 최단 거리가 같으니, 탐색을 상대에게 떠넘기고 따라가는 전략이 통할 수 있어요. 대신 너무 기다리면 상대가 길을 찾아 먼저 도착해요.' },
      { title: '더블찬스는 아는 길에', body: '더블찬스는 6칸을 반드시 다 가야 해서, 모르는 길에서 쓰면 실패해 돌아갈 위험이 두 배로 커요. 벽 위치를 확실히 아는 구간에서 한 번에 거리를 줄이는 데 써야 효과가 커요.' },
    ], columns: 1 },
    { type: 'p', text: '벽 배치를 모르는 상태에서 출발하니 **우월 전략은 없어요.** 다만 기억은 둘 다에게 같은 정보로 쌓이므로, 결국은 32개 벽 중 확인된 것을 끝까지 정확히 기억하는 사람이 이겨요.' },
  ],
  similar: [
    { name: '마법의 미로 (Das magische Labyrinth)', players: '2–4명', alike: '판 아래 숨은 벽을 움직이다 부딪히며 알아내고, 부딪히면 출발점으로 돌아가요.', differs: '주사위로 이동 칸수를 정하고, 아이들도 할 수 있는 수집 게임이에요.' },
    { name: '라비린스 (Labyrinth)', players: '2–4명', alike: '미로 속 길을 읽어 목표 지점까지 가는 길찾기 게임이에요.', differs: '벽이 다 보이고, 타일을 밀어 넣어 미로를 바꿔요.' },
  ],
}, {
  meta: {
    title: 'Memory Maze rules — The Genius: Black Garnet death match of rounds 8 and 9, a maze of invisible walls',
    description: 'The rules of Memory Maze (기억의 미로), death match of rounds 8 and 9 of The Genius: Black Garnet: a 7×7 board with 32 invisible walls, exactly three steps a turn, back to the start on hitting a wall, six-step Double Chances, and learning walls from the opponent’s failures.',
    keywords: ['Memory Maze', 'The Genius Memory Maze', 'The Genius death match', 'The Genius Black Garnet', '기억의 미로'],
  },
  title: 'Memory Maze — The Genius: Black Garnet, death match of rounds 8 and 9',
  name: 'Memory Maze (기억의 미로)',
  lead: 'Thirty-two invisible walls hide on a 7×7 board. Players take turns moving three squares; touch a wall and you go back to the start. Remember the walls and reach the goal first.',
  summary: 'Take turns moving three squares through a 7×7 maze of 32 invisible walls, remembering every wall found, and reach the goal first.',
  setup: [
    { type: 'list', items: [
      '**Players**: the two death-match players.',
      '**Board**: a 7 × 7 grid with 32 invisible walls between squares, kept secret until the end.',
      '**Start and goal**: the players start from different corners, each heading for the diagonally opposite corner; both shortest routes are the same length.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Moving', body: 'Players alternate moving **exactly three squares** horizontally or vertically—no fewer, no diagonals.' },
      { title: 'Walls', body: 'Trying to pass through an invisible wall fails at once: back to the start, and the next turn begins from there.' },
      { title: 'Double Chance', body: 'Twice each, a player may make that turn’s move six squares, and must then move all six.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to reach the goal wins; the loser is eliminated.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The player named for the death match chooses the starting corners and who moves first.',
      'Nothing may be dropped or marked on the floor; players may share a square.',
      'English Wikipedia summarises Double Chance as once per game; this page follows the fan wiki’s transcription of twice each.',
      'It was played in rounds 8 and 9 back to back and not in any other season.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Memory Maze is not a solo maze: the moment one player hits a wall, **its position is revealed to both**. It is a memory contest and also a contest in exploiting the other player’s exploration.' },
    { type: 'cards', items: [
      { title: 'Exactly three', body: 'You must move three squares, so you cannot stop just short of a known wall; routes must be planned in three-step chunks, sometimes with deliberate detours near dead ends. A failure costs the whole route, so probing risky squares early, while still near the start, costs least.' },
      { title: 'The leader opens the way', body: 'Whatever you learn by hitting a wall, the opponent learns free. With equal shortest routes, letting the opponent explore and following can work, but wait too long and they find the way and arrive first.' },
      { title: 'Double Chance on known ground', body: 'A Double Chance must use all six steps, so on an unknown route it doubles the risk of failing. It pays most on a stretch whose walls you are sure of.' },
    ], columns: 1 },
    { type: 'p', text: 'Both start knowing nothing of the walls, so **there is no dominant strategy**. Memory builds up from the same shared information, so the player who keeps every confirmed wall of the 32 straight to the end wins.' },
  ],
  similar: [
    { name: 'Das magische Labyrinth (The Magic Labyrinth)', players: '2–4', alike: 'Walls hidden under the board are discovered by bumping into them, which sends you back to the start.', differs: 'Moves are rolled on a die, and it is a children’s collecting game.' },
    { name: 'Labyrinth', players: '2–4', alike: 'Reading paths through a maze to reach targets.', differs: 'All walls are visible, and tiles are pushed in to change the maze.' },
  ],
});

export const middleRace2 = g3Game({
  slug: 'middle-race-2', kind: 'main', when: round(9), episode: ep(9), eps: [9], note: 'two',
  related: ['hitStay', 'pointOmok', 'wallgo2'],
}, {
  meta: {
    title: '중간 달리기 2 규칙 — 더 지니어스 시즌3 블랙가넷 9회전 메인매치, 게스트와 짝을 이룬 레이스',
    description: '더 지니어스: 블랙가넷 9회전 메인매치로 다시 나온 중간 달리기의 규칙을 정리했어요. 플레이어 5명과 게스트 5명, 1·10 같은 짝 번호로 정하는 선택 순서, 오퍼·카피가 더해진 10개 캐릭터, 5등과 6등이 우승하는 규칙까지.',
    keywords: ['중간 달리기', '중간 달리기 2', '더 지니어스 중간 달리기', '블랙가넷 9회전', '중간달리기 카피', '지니어스 시즌3 메인매치'],
  },
  title: '중간 달리기 2 — 더 지니어스: 블랙가넷 9회전 메인매치',
  name: '중간 달리기 (9회전)',
  lead: '3회전의 중간 달리기가 규칙을 바꿔 돌아왔어요. 남은 플레이어 5명이 각자 게스트와 짝을 이뤄 10명이 달리고, 정확히 5등과 6등으로 들어온 두 사람이 우승해요.',
  summary: '플레이어와 게스트가 짝을 이뤄 10개 캐릭터로 달리고, 5등과 6등이 우승하는 두 번째 중간 달리기.',
  setup: [
    { type: 'list', items: [
      '**인원**: 남은 플레이어 5명과 각자 짝이 되는 게스트 5명, 모두 10명. 30칸 트랙.',
      '**선택 순서**: 플레이어마다 두 숫자가 적힌 추첨볼(1·10, 2·9, 3·8, 4·7, 5·6)을 뽑고, 게스트와 상의해 두 순서를 나눠요. 그 순서대로 캐릭터를 골라요.',
      '**이동카드**: 1–4 네 장, 다 쓰면 리셋. 3회전과 같아요.',
    ] },
    { type: 'table', head: ['순서', '캐릭터', '능력 (요약)'], rows: [
      ['1', '그래비티', '이동을 포기하고 카드 한 장을 공개해 버리면, 한 명을 내 바로 앞이나 바로 뒤로 끌어와요.'],
      ['2', '푸시', '다른 말과 같은 칸이 되면 그 말을 한 칸 앞이나 뒤로 밀어내요.'],
      ['3', '딜리트', '남의 능력으로 내가 움직이면, 한 명의 카드를 혼자 보고 한 장만 남겨요.'],
      ['4', '오퍼 (새로)', '내 카드가 리셋될 때마다 네 장 중 한 장을 골라 다른 사람에게 줘요.'],
      ['5', '위드', '카드가 한 장 남았을 때 한 명을 지목해 그 숫자만큼 같이 움직여요.'],
      ['6', '유니온', '내 바로 앞 칸의 말을 모두 내 칸으로 끌어올 수 있어요. 3회전과 달리 쓸지 말지 고를 수 있어요.'],
      ['7', '미러', '남의 능력으로 내가 움직이면, 한 명을 같은 칸수만큼 반대로 보내요.'],
      ['8', '카피 (새로)', '내 카드가 리셋될 때마다 한 명의 능력을 복사해 다음 리셋까지 써요.'],
      ['9', '리셋', '내 말이 뒤로 밀릴 때마다 다른 한 명의 카드를 리셋시켜요.'],
      ['10', '사일런스', '내 차례에 한 명을 지목해 다음 내 차례까지 그 능력을 꺼요.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '진행', body: '1번부터 번호 순서대로 카드를 내고 움직이며, 능력 처리 순서는 3회전과 같아요(번호가 빠른 말부터, 연쇄된 능력은 처리한 뒤 다음으로).' },
      { title: '종료', body: '5등과 6등이 결승선을 지나는 순간 게임이 끝나요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**5등과 6등이 우승자**로 생명의 징표를 하나씩 받고, 가넷 5개씩을 받아요. 게스트가 우승하면 생명의 징표를 플레이어에게 넘길 수 있고, 가넷은 그 게스트가 돕는 플레이어에게 가요.',
      '우승하지 못한 플레이어는 모두 최하위가 되고, 우승자들이 그중 탈락후보를 정해요. 탈락후보는 생명의 징표가 없는 사람 중에서 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '카피가 복사한 능력은 사일런스에 막히면 사라져, 풀려도 빈 카피로 돌아가요. 복사해도 원래 캐릭터의 번호(순서)는 따라오지 않아요.',
      '카피가 복사해 둔 원래 캐릭터가 사일런스에 막히거나 골인해도, 이미 복사한 능력은 그대로예요. 사일런스에 막힌 캐릭터의 능력은 복사할 수 없어요.',
      '그 밖의 공통 규칙(같은 사람 연속 지목 금지, 출발선에서 푸시·유니온 불발, 위드 동시 골인 판정)은 3회전과 같아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '3회전이 "양 끝을 피하는" 게임이었다면, 9회전은 "정확히 가운데 두 자리를 잡는" 게임이에요. 목표가 좁아지면서 레이스는 훨씬 날카로워졌어요.' },
    { type: 'cards', items: [
      { title: '짝이 둘이면 기회도 둘', body: '플레이어와 게스트 중 누구든 5·6등이면 그 팀이 사는 구조라, 한 팀이 두 말을 갖고 달리는 셈이에요. 한 말은 앞에서 기다리고 한 말은 뒤에서 조절하는 식의 역할 분담이 가능하고, 선택 순서도 1·10처럼 가장 앞과 가장 뒤가 짝지어져 균형을 맞췄어요.' },
      { title: '카피의 유연성', body: '카피는 리셋할 때마다 그때 가장 필요한 능력을 가져와요. 상황에 따라 그래비티나 사일런스처럼 지목하는 능력을 골라 쓸 수 있어 다른 캐릭터보다 선택지가 훨씬 넓어요. 그래서 카피를 누가 가져가느냐가 선택 순서 단계에서 이미 큰 변수가 돼요.' },
      { title: '끝내는 타이밍', body: '5등과 6등이 들어오는 순간 끝나므로, 앞의 네 명은 이미 진 것이 확정돼요. 1–4등이 될 위기에 놓인 사람은 일부러 뒤로 빠지려 하고, 7등 이하는 앞으로 끼어들려 해서, 가운데 자리를 놓고 양쪽에서 압박이 몰려요.' },
    ], columns: 1 },
    { type: 'p', text: '능력 상성과 팀 구성이 얽혀 **우월 전략은 없어요.** 다만 카피처럼 매 리셋마다 능력을 바꿀 수 있는 캐릭터는 다른 캐릭터보다 분명히 유연해서, 이 판에서 가장 먼저 고를 만한 카드로 평가될 수밖에 없는 구조예요.' },
  ],
  similar: [
    { name: '매지컬 애슬릿 (Magical Athlete)', players: '2–6명', alike: '능력이 다른 캐릭터를 골라 달리며 능력끼리 연쇄를 일으켜요.', differs: '주사위로 움직이고, 먼저 들어오는 것이 목표예요.' },
    { name: '카멜 업 (Camel Up)', players: '3–8명', alike: '말이 서로를 업고 움직여 순위가 계속 뒤집히는 레이스예요.', differs: '말은 아무의 것도 아니고, 플레이어는 순위에 내기만 걸어요.' },
  ],
}, {
  meta: {
    title: 'Middle Race II rules — The Genius: Black Garnet round 9 main match, a race with guest partners',
    description: 'The rules of the second Middle Race (중간 달리기), round 9 main match of The Genius: Black Garnet: five players and five guests, a pick order from paired balls such as 1 and 10, ten characters including the new Offer and Copy, and why 5th and 6th place win.',
    keywords: ['Middle Race II', 'The Genius Middle Race', 'The Genius Black Garnet', 'The Genius season 3', '중간 달리기'],
  },
  title: 'Middle Race II — The Genius: Black Garnet, round 9 main match',
  name: 'Middle Race II (중간 달리기)',
  lead: 'Round 3’s Middle Race returns with new rules. The five remaining players each run with a guest partner, ten in all, and the two who finish exactly 5th and 6th win.',
  summary: 'Players and guest partners race ten characters, and 5th and 6th place win: the second Middle Race.',
  setup: [
    { type: 'list', items: [
      '**Players**: the five remaining players plus a guest partner each, ten in all, on a 30-space track.',
      '**Pick order**: each player draws a ball with two numbers (1 and 10, 2 and 9, 3 and 8, 4 and 7, 5 and 6) and splits the two slots with their guest; characters are chosen in that order.',
      '**Move cards**: 1–4, reset when used up, as in round 3.',
    ] },
    { type: 'table', head: ['Order', 'Character', 'Power (summary)'], rows: [
      ['1', 'Gravity', 'Gives up a move and discards a card face up to pull one player to just ahead of or just behind itself.'],
      ['2', 'Push', 'Pushes a piece sharing its space one space forward or back.'],
      ['3', 'Delete', 'When moved by someone’s power, privately looks at a player’s cards and leaves them one.'],
      ['4', 'Offer (new)', 'Each time its cards reset, gives one of the four to another player.'],
      ['5', 'With', 'With one card left, takes a named player along the same distance.'],
      ['6', 'Union', 'May pull every piece on the space just ahead onto its own; unlike round 3, using it is optional.'],
      ['7', 'Mirror', 'When moved by someone’s power, sends a named player the same distance the other way.'],
      ['8', 'Copy (new)', 'Each time its cards reset, copies one player’s power until the next reset.'],
      ['9', 'Reset', 'Whenever moved backwards, resets another player’s cards.'],
      ['10', 'Silence', 'Names a player whose power is off until Silence’s next turn.'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Play', body: 'From number 1 upwards, each plays a card and moves; powers resolve as in round 3 (lowest number first, chained powers before moving on).' },
      { title: 'End', body: 'The game ends the moment 5th and 6th place cross the line.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**5th and 6th win** a token of life and 5 garnets each. A winning guest may hand the token to a player, and the garnets go to the player that guest supports.',
      'Every player who did not win counts as last, and the winners choose the candidate, who names an opponent without a token.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A copied power is lost if Copy is silenced; when Silence lifts, Copy is blank. Copying does not take on the original character’s number.',
      'If the copied character is later silenced or finishes, Copy keeps the power; a silenced character’s power cannot be copied.',
      'Other common rules (no targeting the same player twice in a row, no Push or Union on the start line, the With tie-break) are as in round 3.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Round 3 was about avoiding the ends; round 9 is about taking exactly the two middle places. The narrower target makes the race far sharper.' },
    { type: 'cards', items: [
      { title: 'Two pieces, two chances', body: 'A team survives if either the player or the guest takes 5th or 6th, so each team effectively runs two pieces: one can wait ahead while the other adjusts from behind. Pairing the pick order (1 with 10, and so on) balances first and last choice.' },
      { title: 'Copy’s flexibility', body: 'Copy takes whatever power is most useful at each reset, including targeting powers like Gravity or Silence, giving it far more options than any other character. Who gets Copy is a big factor before the race starts.' },
      { title: 'When it ends', body: 'It ends the moment 5th and 6th arrive, so the first four have already lost. Players in danger of finishing 1st–4th try to drop back while those 7th or lower try to cut in, and the middle places come under pressure from both sides.' },
    ], columns: 1 },
    { type: 'p', text: 'Power interactions and team pairings tangle together, so **there is no dominant strategy**. Still, a character that can change its power at every reset is plainly more flexible than the rest, which makes Copy the natural first pick in this version.' },
  ],
  similar: [
    { name: 'Magical Athlete', players: '2–6', alike: 'Pick characters with different powers and race while powers chain.', differs: 'Moves are by die, and finishing first is the aim.' },
    { name: 'Camel Up', players: '3–8', alike: 'Pieces carry each other along, so the order keeps flipping.', differs: 'The camels belong to nobody; players only bet on the order.' },
  ],
});
