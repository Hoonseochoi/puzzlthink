// 피의 게임2, days 7–11: 블랙 & 화이트, 낮과 밤, 패턴 블록, 메인 컬러, 리얼 타임 경매, 배틀 오름차순, 세미파이널 숫자 경매, 파이널 히든 미션.
import { bg2Game, day } from './shared';

export const blackAndWhite = bg2Game('black-and-white', 'money', day('7'), ['7'], ['blackWhite', 'blackWhite2', 'gradation'], {
  meta: {
    title: '블랙 & 화이트 규칙 — 피의 게임2 7일차 머니 챌린지, 가장 적은 색이 되는 게임',
    description: '피의 게임2 7일차 머니 챌린지 블랙 & 화이트의 규칙을 정리했어요. 블랙 2·화이트 2·그레이 1장, 라운드마다 한 장 제출, 혼자 또는 짝, 색이 섞이는 규칙, 혼자 그레이 1점·짝 그레이 1.5점·최소 색 3점, 카드 색 변경까지.',
    keywords: ['블랙 앤 화이트', '블랙&화이트', '피의 게임2 블랙 앤 화이트', '피의게임2 7일차', '피의게임2'],
  },
  title: '블랙 & 화이트 — 피의 게임2 7일차 머니 챌린지',
  name: '블랙 & 화이트',
  lead: '라운드마다 색깔 카드 한 장을 내고, 혼자 갈지 누군가와 짝을 지을지 정해요. 가장 적은 사람이 고른 색이 되면 3점이에요.',
  summary: '다섯 장의 색 카드로 다섯 라운드 동안 "가장 소수인 색"을 노리는 눈치 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 개인전.',
      '**카드**: 각자 블랙 2장, 화이트 2장, 그레이 1장. 교환·양도 불가.',
      '**라운드**: 5라운드. 라운드마다 한 장을 내고, 낸 카드는 사라져요.',
      '**색 변경**: 라운드당 한 번, 1,000만 원을 내고 가진 카드의 색을 바꿀 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '제출', body: '투표룸에서 카드 한 장을 내고, 이번 라운드를 **혼자** 할지 **짝**으로 할지 골라요.' },
      { title: '색 합치기', body: '짝이 되면 두 사람의 카드가 합쳐져요. 같은 색끼리는 그 색, 블랙+화이트나 블랙·화이트+그레이는 그레이가 돼요.' },
      { title: '점수', body: '혼자 그레이면 1점, 짝으로 그레이면 각자 1.5점. 그리고 **최종 색 중 가장 적은 색**인 사람은 3점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 누적 1위는 권력자가 되어 2,000만 원을 받고, 데스매치 뒤 생존자 한 명을 저택에서 내보내요. 최하위는 탈락후보가 되어 두 사람을 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '그레이 점수와 소수 색 3점이 겹칠 때의 처리는 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '블랙 & 화이트는 **소수파 게임**이에요. 남들이 많이 고를 색을 피해야 3점을 받는데, 모두가 같은 생각을 하니 결국 서로의 생각을 한 단계 더 읽는 싸움이 돼요.' },
    { type: 'cards', items: [
      { title: '카드가 줄어드는 정보', body: '모두 블랙 2·화이트 2·그레이 1로 시작해 한 장씩 쓰니, 라운드가 지날수록 남은 색이 드러나요. 누가 그레이를 이미 썼는지 알면 다음 라운드의 그레이가 얼마나 적을지 계산할 수 있어요. 마지막 라운드에는 남은 카드가 사실상 정해져 있어 예측이 쉬워져요.' },
      { title: '짝은 색을 바꾸는 도구', body: '짝을 지으면 블랙과 화이트가 그레이가 되므로, 소수 색을 노리기보다 확실한 1.5점을 챙기는 안전한 수가 돼요. 또 짝짓기 약속으로 전체 색 분포를 조작해, 다른 사람이 소수 색이 되지 못하게 만들 수도 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '소수파 게임에는 모두에게 통하는 **우월 전략이 없어요.** 어떤 색이 소수가 될지 확실해지면 모두가 그 색으로 몰려 오히려 다수가 되기 때문이에요. 돈으로 색을 바꾸는 규칙은 마지막 순간의 배신을 가능하게 해요.' },
  ],
  similar: [
    { name: '저스트 원 (Just One)', players: '3–7명', alike: '남과 겹친 선택은 지워지고, 혼자만의 선택만 살아남아요.', differs: '저스트 원은 단어 힌트를 내는 협력 게임이에요.' },
    { name: '하겐 (Hol’s der Geier)', players: '2–5명', alike: '같은 숫자를 낸 사람끼리는 서로 상쇄되어, 남과 겹치지 않는 선택이 중요해요.', differs: '하겐은 숫자 카드로 점수 카드를 가져가는 경매예요.' },
  ],
}, {
  meta: {
    title: 'Black & White rules — The Bloody Game 2, day 7 money challenge',
    description: 'The rules of Black & White (블랙 & 화이트) from The Bloody Game 2: two black, two white and one grey card each, one card per round, going alone or in a pair, how colours mix, 1 point for grey alone, 1.5 each for a grey pair and 3 for the rarest colour, and paid colour changes.',
    keywords: ['Black and White', 'Bloody Game 2 day 7', 'minority game', '피의 게임2 블랙 앤 화이트'],
  },
  title: 'Black & White — The Bloody Game 2, day 7 money challenge',
  name: 'Black & White (블랙 & 화이트)',
  lead: 'Each round, play one colour card and choose to go alone or pair up. End up in the rarest colour and you score 3.',
  summary: 'Five colour cards over five rounds, aiming to be the rarest colour.',
  setup: [
    { type: 'list', items: [
      '**Players**: individual.',
      '**Cards**: two black, two white, one grey each; no trading.',
      '**Rounds**: five, one card per round, used cards are gone.',
      '**Colour change**: once per round, pay ₩10 million to change one card’s colour.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Play', body: 'In the voting room, hand in a card and choose **alone** or **pair**.' },
      { title: 'Mix', body: 'A pair’s cards combine: same colours stay, black+white or black/white+grey become grey.' },
      { title: 'Score', body: 'Grey alone scores 1; a grey pair 1.5 each; whoever ends in **the rarest final colour** scores 3.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The five-round leader becomes ruler, receives ₩20 million and expels one survivor from the mansion; last place becomes the candidate and names two players.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How grey points and the rarest-colour 3 combine could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Black & White is a **minority game**: avoid the popular colour to score 3, but everyone thinks the same, so it becomes reading one level deeper.' },
    { type: 'cards', items: [
      { title: 'Shrinking hands reveal', body: 'Everyone starts with the same five cards and spends one a round, so remaining colours become visible. Knowing who has used their grey lets you estimate how rare grey will be; by the last round hands are nearly known.' },
      { title: 'Pairs change colours', body: 'Pairing turns black and white into grey, a safe 1.5 instead of a gamble on rarity, and pairing agreements can shape the whole distribution to deny someone the rare colour.' },
    ], columns: 1 },
    { type: 'p', text: 'Minority games have **no dominant strategy**: once a colour is sure to be rare, everyone piles in and it stops being rare. Paid colour changes make last-second betrayal possible.' },
  ],
  similar: [
    { name: 'Just One', players: '3–7', alike: 'Choices that match someone else’s are cancelled; only unique ones survive.', differs: 'It is a cooperative word-clue game.' },
    { name: 'Raj (Hol’s der Geier)', players: '2–5', alike: 'Equal cards cancel, so avoiding others’ choices matters.', differs: 'It is an auction for point cards with number cards.' },
  ],
});

export const dayAndNight = bg2Game('day-and-night', 'money', day('8'), ['8'], ['russianRoulette', 'piggyBank', 'hitStay'], {
  meta: {
    title: '낮과 밤 규칙 — 피의 게임2 8일차 머니 챌린지, 시침이 멈출 구간에 거는 게임',
    description: '피의 게임2 8일차 머니 챌린지 낮과 밤의 규칙을 정리했어요. 1–12시 시계와 낮·밤 구역, 몰래 뽑는 낮 구간과 밤 구간, 가장 많이 낸 코인만큼 움직이는 시침, 낮 1점·밤 2점, 익명 점수 공개, 10점 선승까지.',
    keywords: ['낮과 밤', '피의 게임2 낮과 밤', '피의게임2 8일차', '피의게임2 머니 챌린지', '피의게임2'],
  },
  title: '낮과 밤 — 피의 게임2 8일차 머니 챌린지',
  name: '낮과 밤',
  lead: '시계의 시침이 내 구간에 멈추면 점수를 얻어요. 시침은 그 라운드에 가장 많이 낸 코인 수만큼 움직이고, 밤에는 어디 있는지 보이지 않아요.',
  summary: '몰래 뽑은 시간 구간에 시침을 멈추게 하려고 코인을 거는 8인 개인전. 10점을 먼저 얻으면 이겨요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명 개인전.',
      '**시계**: 1–12시 칸. 1–6시는 **낮**, 7–12시는 **밤**. 낮에는 시침 위치가 보이고, 밤에는 가려져요.',
      '**구간**: 시작 전 각자 낮과 밤에서 한 칸씩 무작위로 뽑아요. 본인만 알아요. 시침이 두 바퀴 돌 때마다 다시 뽑아요.',
      '**코인**: 각자 20개(교환·양도·파기 불가). 1,000만 원에 1개씩 최대 5개 더 살 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '전략 회의', body: '라운드마다 30분의 회의 시간이 있어요.' },
      { title: '코인 제출', body: '각자 원하는 만큼 코인을 딜러룸에 내요.' },
      { title: '시침 이동', body: '시침은 기본으로 한 칸 움직이고, 코인을 냈다면 **가장 많이 낸 사람의 코인 수만큼** 움직여요. 다른 사람이 낸 코인은 모두 사라져요.' },
      { title: '점수', body: '내 낮 구간에 멈추면 1점, 밤 구간에 멈추면 2점. 라운드마다 점수가 익명(알파벳)으로 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**10점 이상**을 먼저 얻은 사람이 이겨 2,000만 원과 면제권을 받아요. 그 시점에 점수가 가장 낮은 사람이 탈락후보가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '코인을 가장 많이 낸 사람이 여럿일 때의 처리는 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '낮과 밤은 **하나의 공용 말(시침)을 경매로 움직이는** 게임이에요. 이긴 입찰만 효과가 있고 진 입찰은 버려지니, 코인을 쓰는 모든 판단이 큰 위험을 안고 있어요.' },
    { type: 'cards', items: [
      { title: '경매의 승자만 움직인다', body: '가장 많이 낸 사람의 숫자만큼 시침이 움직여요. 시침을 내 구간까지 정확히 보내려면 남보다 많이 내되 정확히 필요한 칸 수만큼 내야 해요. 다섯 칸을 움직이고 싶은데 누가 여섯을 내면 내 코인 다섯 개는 그냥 사라져요.' },
      { title: '밤의 정보 싸움', body: '밤 구간은 2점이지만 시침이 안 보여요. 시침 위치를 계속 계산하는 사람만 밤 구간을 노릴 수 있어요. 익명 점수 공개는 누가 어떤 구간을 가졌는지 추리할 단서가 돼요.' },
      { title: '구간 공유의 정치', body: '구간을 동맹에게 털어놓으면 코인을 모아 시침을 함께 움직일 수 있어요. 하지만 상대에게 알려지면 그 칸을 지나가도록 큰 입찰을 맞받아 낼 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '구간이 무작위로 주어지고 두 바퀴마다 바뀌어 **우월 전략은 없어요.** 코인을 아꼈다가 결정적인 한 번에 크게 쓰는 사람이 유리해요.' },
  ],
  similar: [
    { name: '하이믈리히 앤 코 (Heimlich & Co.)', players: '2–7명', alike: '각자 몰래 배정받은 색의 말을 모두가 함께 움직이고, 말이 멈춘 자리에 따라 점수를 얻어요. 남의 정체를 추리하는 것도 같아요.', differs: '하이믈리히는 주사위로 움직일 칸 수를 정하고, 경매가 없어요.' },
    { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '공용 말의 움직임에 걸고, 위치에 따라 점수를 얻어요.', differs: '카멜 업은 주사위로 낙타가 움직이는 경주 내기예요.' },
  ],
}, {
  meta: {
    title: 'Day and Night rules — The Bloody Game 2, day 8 money challenge',
    description: 'The rules of Day and Night (낮과 밤) from The Bloody Game 2: a 1–12 clock split into day and night, secretly drawn day and night slots, a hand that moves by the highest coin bid, 1 point by day and 2 by night, anonymous scores, and first to 10.',
    keywords: ['Day and Night', 'Bloody Game 2 day 8', '피의 게임2 낮과 밤'],
  },
  title: 'Day and Night — The Bloody Game 2, day 8 money challenge',
  name: 'Day and Night (낮과 밤)',
  lead: 'Score when the clock hand stops on your slot. It moves by the highest number of coins bid that round, and at night nobody can see it.',
  summary: 'Eight players bid coins to stop a shared clock hand on their secret slots; first to 10 points wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: eight, individual.',
      '**Clock**: hours 1–12; 1–6 are **day**, 7–12 **night**. By day the hand is visible, by night hidden.',
      '**Slots**: each secretly draws one day hour and one night hour, redrawn every two laps.',
      '**Coins**: 20 each (no trading); up to 5 more at ₩10 million each.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Meeting', body: '30 minutes of strategy time each round.' },
      { title: 'Bid', body: 'Hand in as many coins as you like.' },
      { title: 'Move', body: 'The hand moves one hour by default, or **as many hours as the highest bid**; every other bid is lost.' },
      { title: 'Score', body: 'Stopping on your day hour scores 1, your night hour 2; scores are shown anonymously by letter.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The first to **10 points** wins ₩20 million and an exemption; the lowest scorer then becomes the candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Ties for the highest bid could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Day and Night **auctions the movement of one shared piece**. Only the winning bid acts and losing bids vanish, so every coin spent is a real risk.' },
    { type: 'cards', items: [
      { title: 'Only the winner moves it', body: 'To send the hand exactly to your hour you must outbid everyone with exactly the right number; if you bid five and someone bids six, your five are simply gone.' },
      { title: 'Information at night', body: 'Night hours pay 2 but the hand is hidden, so only those who keep tracking it can aim there. Anonymous scores hint at who holds which hours.' },
      { title: 'Politics of sharing', body: 'Telling allies your hours lets you pool coins, but a rival who learns them can overbid to sweep past.' },
    ], columns: 1 },
    { type: 'p', text: 'Random, changing slots mean **no dominant strategy**; saving coins for one decisive big bid tends to pay.' },
  ],
  similar: [
    { name: 'Heimlich & Co. (Top Secret Spies)', players: '2–7', alike: 'Everyone moves shared pieces whose colours are secretly assigned and scores by where they stop, guessing others’ identities.', differs: 'Movement comes from a die, not an auction.' },
    { name: 'Camel Up', players: '2–8', alike: 'Betting on the movement of shared pieces.', differs: 'Dice move the camels in a race.' },
  ],
});

export const patternBlock = bg2Game('pattern-block', 'death', day('8'), ['8'], ['nemoCount', 'gradation', 'colorlink'], {
  meta: {
    title: '패턴 블록 규칙 — 피의 게임2 8일차 데스매치, 외운 패턴으로 블록 쌓기',
    description: '피의 게임2 8일차 데스매치 패턴 블록의 규칙을 정리했어요. 25개의 패턴판 1분 암기, 숫자판으로 바뀐 판, 문제 그림대로 블록 쌓기, 먼저 정답을 외친 사람의 1점, 오답 시 상대에게 30초, 문제 사이 10초 재공개, 6문제까지.',
    keywords: ['패턴 블록', '피의 게임2 패턴 블록', '피의게임2 데스매치', '암기 게임', '피의게임2'],
  },
  title: '패턴 블록 — 피의 게임2 8일차 데스매치',
  name: '패턴 블록',
  lead: '25칸에 그려진 패턴을 1분 동안 외우면, 판이 숫자로 바뀌어요. 문제 그림을 보고 어느 칸의 패턴인지 떠올려 블록을 쌓아요.',
  summary: '패턴판을 외운 뒤 숫자만 남은 판을 보고 블록을 쌓는 암기·조립 속도전.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**패턴판**: 서로 다른 패턴 25개. 1분 동안 공개된 뒤 숫자가 적힌 판으로 바뀌어요.',
      '**블록**: 각자 앞에 놓인 쌓기 블록.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '패턴판을 1분 동안 봐요.' },
      { title: '문제', body: '정답 그림이 제시되면, 외운 패턴대로 블록을 쌓아요.' },
      { title: '정답', body: '먼저 다 쌓은 사람이 정답을 외쳐요. 빠르고 정확한 사람이 1점, 틀리면 상대에게 30초 동안 기회가 가요.' },
      { title: '재공개', body: '패턴판 하나에 문제 세 개이고, 문제 사이에는 패턴판이 10초 동안 다시 보여요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '6문제가 끝난 뒤 점수가 높은 사람이 살아남아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '블록을 어떻게 쌓아야 정답인지(문제 그림과 블록의 대응)는 방송 화면 없이 자세히 확인하기 어려워 생략했어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '패턴 블록은 **위치 기억**과 **손의 속도**가 함께 필요해요. 기억이 정확해도 쌓는 게 늦으면 지고, 빨라도 틀리면 30초를 내줘요.' },
    { type: 'cards', items: [
      { title: '10초 재공개를 쓰는 법', body: '문제 사이 10초는 모든 칸을 다시 보기엔 짧아요. 이전 문제에서 헷갈렸던 칸, 다음 문제에 나올 것 같은 칸을 집중해서 확인하는 편이 나아요. 25개를 묶음으로 기억하는 방법(줄 단위, 비슷한 모양끼리)도 도움이 돼요.' },
      { title: '오답 30초', body: '틀리면 상대가 30초나 독점해요. 쌓는 시간이 충분한 길이라, 확신 없이 외치면 거의 확실히 점수를 내줘요. 상대가 먼저 외쳤다고 서두를 필요는 없어요. 틀리면 내 차례가 와요.' },
    ], columns: 1 },
    { type: 'p', text: '운의 요소가 거의 없는 실력 게임이라 **우월 전략은 없어요.**' },
  ],
  similar: [
    { name: '메이크 앤 브레이크 (Make ’n’ Break)', players: '2–5명', alike: '카드에 그려진 모양대로 블록을 빠르게 쌓는 속도 게임이에요.', differs: '메이크 앤 브레이크는 그림을 보면서 쌓고, 외울 필요가 없어요.' },
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '그림의 위치를 기억해 불러오는 기억력 게임이에요.', differs: '메모리는 짝을 맞추는 것으로 끝나고 조립이 없어요.' },
  ],
}, {
  meta: {
    title: 'Pattern Block rules — The Bloody Game 2, day 8 death match',
    description: 'The rules of Pattern Block (패턴 블록) from The Bloody Game 2: one minute to memorise 25 patterns, the board turning into numbers, building blocks to match a picture, a point for the first correct call, 30 seconds for the rival after a miss, a 10-second reshow between questions, and six questions.',
    keywords: ['Pattern Block', 'Bloody Game 2 death match', 'memory game', '피의 게임2 패턴 블록'],
  },
  title: 'Pattern Block — The Bloody Game 2, day 8 death match',
  name: 'Pattern Block (패턴 블록)',
  lead: 'Memorise 25 patterns in one minute; the board then shows only numbers. From each question picture, recall the patterns and build them in blocks.',
  summary: 'A memory-and-building race: learn a pattern board, then build from a board of numbers.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Pattern board**: 25 different patterns, shown for 1 minute before turning into a numbered board.',
      '**Blocks**: a set in front of each player.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Study the pattern board for 1 minute.' },
      { title: 'Question', body: 'A target picture appears; build it with blocks from memory.' },
      { title: 'Call', body: 'Finish first and call; the faster correct player scores 1, and a miss gives the rival 30 seconds.' },
      { title: 'Reshow', body: 'Three questions per board, with the board reshown for 10 seconds between questions.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After six questions the higher score survives.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Exactly how blocks correspond to the question picture is hard to confirm without the broadcast, so it is left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Pattern Block needs **positional memory** and **fast hands** together: accurate but slow loses, and fast but wrong hands over 30 seconds.' },
    { type: 'cards', items: [
      { title: 'Using the 10-second reshow', body: 'Ten seconds is too short to review everything; check the cells you confused and those likely next. Chunking the 25 (by row, by similar shapes) helps.' },
      { title: 'The 30-second penalty', body: 'Thirty seconds is plenty to build, so a hasty call nearly always gives away the point; if the rival calls first, no need to rush — a miss brings your turn.' },
    ], columns: 1 },
    { type: 'p', text: 'There is almost no luck, so **no dominant strategy** beyond skill.' },
  ],
  similar: [
    { name: 'Make ’n’ Break', players: '2–5', alike: 'Build block shapes from cards as fast as possible.', differs: 'You build while looking at the card, no memorising.' },
    { name: 'Memory (Concentration)', players: '2+', alike: 'Recall where pictures are.', differs: 'It ends at matching pairs, with no building.' },
  ],
});

export const mainColor = bg2Game('main-color', 'money', day('9'), ['9'], ['blackWhite2', 'gradation', 'hitStay'], {
  meta: {
    title: '메인 컬러 규칙 — 피의 게임2 9일차 머니 챌린지, 투표로 정한 색의 카드 내기',
    description: '피의 게임2 9일차 머니 챌린지 메인 컬러의 규칙을 정리했어요. 블랙·화이트·그레이 카드 8장 무작위, 비공개 메인 컬러 투표, 메인 컬러 카드를 낸 만큼 점수, 남은 카드가 가장 적은 사람 0점, 그레이일 때 블랙+화이트 대체, 추가 투표권과 색 변경권까지.',
    keywords: ['메인 컬러', '피의 게임2 메인 컬러', '피의게임2 9일차', '피의게임2 머니 챌린지', '피의게임2'],
  },
  title: '메인 컬러 — 피의 게임2 9일차 머니 챌린지',
  name: '메인 컬러',
  lead: '투표로 이번 라운드의 메인 컬러를 정하고, 그 색 카드를 낸 만큼 점수를 얻어요. 그런데 카드를 가장 많이 써서 가장 적게 남은 사람은 0점이에요.',
  summary: '내가 많이 가진 색을 메인 컬러로 만들되, 너무 많이 내면 0점이 되는 5라운드 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 개인전. 5라운드.',
      '**카드**: 라운드마다 블랙·화이트·그레이 중 무작위 8장을 비공개로 받아요(섞어 달라고 요청할 수 있어요). 교환·양도 불가.',
      '**아이템**: 추가 투표권(1,000만 원) — 메인 컬러 투표에서 1표 더. 카드 색깔 변경권(1,000만 원) — 카드 한 장을 원하는 색으로 바꿔요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '투표', body: '모두 비공개로 한 색에 투표해요. 가장 많은 표를 받은 색이 메인 컬러예요. 동률이면 모두 메인 컬러예요.' },
      { title: '제출', body: '메인 컬러 카드를 원하는 만큼 내고, 낸 장수만큼 점수를 얻어요.' },
      { title: '0점 판정', body: '제출 뒤 **남은 카드가 가장 적은 사람**은 그 라운드 0점이에요.' },
      { title: '회수', body: '라운드가 끝나면 쓴 카드와 남은 카드를 모두 회수하고 새로 받아요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드 누적 1위가 이기고, 최하위는 탈락후보가 되어 데스매치 상대를 지목해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '메인 컬러가 그레이면 블랙과 화이트 한 장씩을 그레이 한 장으로 낼 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '메인 컬러는 **많이 낼수록 점수지만, 가장 많이 낸 사람은 0점**인 구조예요. 정확히는 "남은 카드가 가장 적은 사람"이 0점이라, 남보다 딱 한 장 덜 내는 것이 이상적이에요.' },
    { type: 'cards', items: [
      { title: '투표는 내 손패의 광고', body: '내가 많이 가진 색에 투표하는 게 자연스럽지만, 그러면 다른 사람도 그 색을 많이 가졌을 수 있어요. 남들이 무슨 색에 표를 던질지가 곧 그들의 손패 정보예요. 추가 투표권은 메인 컬러를 내 손패에 맞추는 직접적인 수단이에요.' },
      { title: '한 장 덜 내기', body: '모두가 8장으로 시작하니, 남은 장수는 곧 낸 장수의 반대예요. 메인 컬러를 6장 가졌어도 다 내면 꼴찌의 0점 위험이 있어요. 남의 메인 컬러 장수를 짐작해 그보다 한 장 적게 내는 눈치 싸움이에요.' },
      { title: '그레이의 특수성', body: '그레이가 메인이면 블랙+화이트 두 장이 그레이 한 장이 돼요. 손에서 두 장이 빠지는데 점수는 1점이라, 남은 카드 수 계산이 달라져요.' },
    ], columns: 1 },
    { type: 'p', text: '카드가 무작위로 주어지고 남의 손패를 모르니 **우월 전략은 없어요.** 다만 점수 차이가 크지 않은 게임이라, 0점 라운드를 피하는 안정적인 운영이 꾸준히 유리해요.' },
  ],
  similar: [
    { name: '우노 (UNO)', players: '2–10명', alike: '정해진 색에 맞는 카드를 내는 것이 기본 행동이에요.', differs: '우노는 손패를 먼저 다 털면 이기고, 투표가 없어요.' },
    { name: '콜로레토 (Coloretto)', players: '2–5명', alike: '색깔을 모으되 너무 많이 모으면 손해가 되는 균형이 있어요.', differs: '콜로레토는 줄에서 카드를 가져오는 방식이고 투표가 없어요.' },
  ],
}, {
  meta: {
    title: 'Main Color rules — The Bloody Game 2, day 9 money challenge',
    description: 'The rules of Main Color (메인 컬러) from The Bloody Game 2: eight random black, white or grey cards, a secret vote for the main colour, points per main-colour card played, zero for whoever has fewest cards left, black+white as grey, and extra votes and colour changes for sale.',
    keywords: ['Main Color', 'Bloody Game 2 day 9', '피의 게임2 메인 컬러'],
  },
  title: 'Main Color — The Bloody Game 2, day 9 money challenge',
  name: 'Main Color (메인 컬러)',
  lead: 'Vote on the round’s main colour, then score one point per card of it you play. But whoever plays so many that they have the fewest left scores zero.',
  summary: 'Make your colour the main colour, but do not play the most; five rounds.',
  setup: [
    { type: 'list', items: [
      '**Players**: individual, five rounds.',
      '**Cards**: each round, eight random black, white or grey cards, secret (you may ask for a reshuffle); no trading.',
      '**Items**: extra vote (₩10 million) and colour change (₩10 million, one card to any colour).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Vote', body: 'Everyone votes secretly for a colour; the most votes wins, and ties make all tied colours main.' },
      { title: 'Play', body: 'Play as many main-colour cards as you like, scoring one each.' },
      { title: 'Zero', body: 'Whoever has **the fewest cards left** scores 0 that round.' },
      { title: 'Collect', body: 'All cards are collected and new ones dealt.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The five-round leader wins; last place becomes the candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'If grey is main, one black plus one white may count as one grey.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'More cards played means more points, but **fewest left scores zero**, so the ideal is exactly one card fewer than the biggest player.' },
    { type: 'cards', items: [
      { title: 'Votes advertise hands', body: 'You vote for what you hold, but others may hold it too, and how people vote leaks their hands; the extra vote bends the main colour to your cards.' },
      { title: 'One card fewer', body: 'Everyone starts with eight, so cards left mirrors cards played. Even with six of the main colour, playing all risks zero; guess others’ counts and play one fewer.' },
      { title: 'Grey is special', body: 'If grey is main, black+white leaves your hand two at a time for one point, which changes the count.' },
    ], columns: 1 },
    { type: 'p', text: 'Random hands and hidden information mean **no dominant strategy**; with small margins, steadily avoiding zero rounds wins.' },
  ],
  similar: [
    { name: 'UNO', players: '2–10', alike: 'Playing cards that match a set colour is the basic action.', differs: 'You win by emptying your hand; no voting.' },
    { name: 'Coloretto', players: '2–5', alike: 'Collect colours, but too many hurts.', differs: 'You take rows of cards; no voting.' },
  ],
});

export const realTimeAuction = bg2Game('real-time-auction', 'money', day('10'), ['10'], ['russianRoulette', 'piggyBank', 'blackWhite'], {
  meta: {
    title: '리얼 타임 경매 규칙 — 피의 게임2 10일차 머니 챌린지, 시계 없이 시간 구간 입찰하기',
    description: '피의 게임2 10일차 머니 챌린지 리얼 타임 경매의 규칙을 정리했어요. 실제 60분 라운드 3번, 10분 알림, 코인 20개와 추가 구매, 구간마다 입찰해 최고액이 낙찰, 같은 액수면 점수 나누기, 시간 확인·4분 이동, 유령 플레이어 2명까지.',
    keywords: ['리얼 타임 경매', '피의 게임2 리얼 타임 경매', '피의게임2 10일차', '피의게임2 머니 챌린지', '피의게임2'],
  },
  title: '리얼 타임 경매 — 피의 게임2 10일차 머니 챌린지',
  name: '리얼 타임 경매',
  lead: '6일차 리얼 타임의 경매판이에요. 시계 없이 원하는 시간 구간에 들어가 코인으로 입찰하고, 가장 많이 건 사람이 그 구간의 점수를 가져가요.',
  summary: '시간 감각으로 구간을 찾아 코인을 입찰하는 3라운드 경매. 유령 플레이어 2명이 함께 했어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 저택 플레이어와 유령 플레이어 2명, 모두 8명 개인전.',
      '**라운드**: 3라운드, 각 실제 60분. 시계는 볼 수 없고 10분마다 알림이 울려요.',
      '**코인**: 각자 20개. 1,000만 원에 1개씩 최대 5개 더 살 수 있어요(유령 플레이어는 불가). 양도 불가.',
      '**구간 점수**: 리얼 타임과 같아요(0–10분 3점, 10–20분 5, 20–28분 7, 28–32분 10, 32–40분 8, 40–50분 6, 50–60분 3).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '투표룸', body: '최대 1분 머물며 하나 이상의 행동을 해야 해요. 넘기거나 아무것도 안 하면 1분마다 코인 1개가 빠져요.' },
      { title: '입찰', body: '지금 시간대 구간에 원하는 만큼 코인을 내요. 횟수 제한이 없어요.' },
      { title: '시간 확인·이동', body: '코인 1개로 지금 시간을 확인하고, 코인 2개로 4분 미래나 과거로 옮겨 가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '구간마다 **가장 많이 낸 사람**이 낙찰받아요. 최고액이 여럿이면 점수를 나누고 소수점은 버려요. 진 입찰의 코인은 사라져요.',
      '3라운드 누적 1위가 이겨요. 저택 플레이어가 이기면 2,000만 원과 면제권 2장(한 장은 최하위가 아닌 사람에게 양도 가능), 유령 플레이어가 이기면 200만 원과 면제권 1장. 최하위(유령 제외)는 탈락후보가 돼요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드 중에는 개인자금을 주고받을 수 없고, 유령 플레이어는 자금 양도도 할 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '6일차 리얼 타임에서 붐비는 구간은 "나눠 가지기"로 손해였지만, 여기서는 **이긴 한 사람이 다 가져가요.** 그래서 좋은 구간일수록 코인이 많이 몰리고, 진 사람의 코인은 사라져요.' },
    { type: 'cards', items: [
      { title: '코인 20개의 배분', body: '구간이 일곱 개, 라운드가 셋이니 모든 구간을 노릴 수 없어요. 10점 구간 하나에 크게 걸지, 경쟁이 적은 3점·5점 구간을 싸게 여러 개 챙길지 선택해야 해요. 시간 확인과 이동에도 코인이 드니, 입찰에 쓸 코인은 더 적어요.' },
      { title: '유령 플레이어', body: '유령 플레이어는 꼴찌가 돼도 탈락하지 않고, 이기면 상금은 적지만 면제권이 있어요. 잃을 것이 적은 참가자가 구간 경쟁에 끼어 계산을 흐트러뜨리는 구조예요.' },
    ], columns: 1 },
    { type: 'p', text: '경쟁자의 입찰액을 모르는 비공개 경매라 **우월 전략은 없어요.** 라운드마다 점수가 공개되니, 누가 어느 구간을 얼마에 가져갔는지 추정해 다음 라운드의 경쟁 구간을 피하는 것이 기본이에요.' },
  ],
  similar: [
    { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '비공개 입찰을 포함한 여러 경매 방식으로 가치가 다른 물건을 사요.', differs: '모던 아트는 그림의 가치가 시장에서 결정되고, 시간 감각은 없어요.' },
    { name: '더 마인드 (The Mind)', players: '2–4명', alike: '시계 없이 흐르는 시간 감각에 의존해요.', differs: '더 마인드는 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Real Time Auction rules — The Bloody Game 2, day 10 money challenge',
    description: 'The rules of Real Time Auction (리얼 타임 경매) from The Bloody Game 2: three real 60-minute rounds with 10-minute chimes, 20 coins plus purchases, bidding on time slots with the highest bid winning, split points on ties, time checks and 4-minute shifts, and two ghost players.',
    keywords: ['Real Time Auction', 'Bloody Game 2 day 10', '피의 게임2 리얼 타임 경매'],
  },
  title: 'Real Time Auction — The Bloody Game 2, day 10 money challenge',
  name: 'Real Time Auction (리얼 타임 경매)',
  lead: 'Day 6’s Real Time turned into an auction: find a time slot without a clock and bid coins; the highest bidder takes its points.',
  summary: 'A three-round auction of time slots found by feel; two ghost players joined in.',
  setup: [
    { type: 'list', items: [
      '**Players**: the mansion players plus two ghost players, eight in all.',
      '**Rounds**: three of a real 60 minutes; no clocks, a chime every 10 minutes.',
      '**Coins**: 20 each; up to 5 more at ₩10 million each (not ghosts); no transfers.',
      '**Slot points**: as in Real Time (3, 5, 7, 10, 8, 6, 3).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Voting room', body: 'Stay at most 1 minute and do at least one thing, or lose a coin per minute.' },
      { title: 'Bid', body: 'Bid any number of coins on the current slot, as often as you like.' },
      { title: 'Check or shift', body: 'One coin shows the time; two coins move you 4 minutes forward or back.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Each slot goes to **the highest bidder**; tied top bids split the points, rounding down; losing bids are lost.',
      'The three-round leader wins: a mansion player gets ₩20 million and two exemptions (one giftable to anyone but last place); a ghost gets ₩2 million and one. Last place (not ghosts) becomes the candidate.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'No fund transfers during rounds, and ghosts cannot transfer at all.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'In Real Time, crowding meant splitting; here **the single top bidder takes all**, so good slots attract coins and losers’ coins vanish.' },
    { type: 'cards', items: [
      { title: 'Spreading 20 coins', body: 'Seven slots over three rounds cannot all be contested: bet big on one 10-point slot, or pick up several quieter 3- and 5-point slots cheaply. Time checks and shifts eat coins too.' },
      { title: 'Ghost players', body: 'Ghosts cannot be eliminated and win little money, so participants with little to lose disrupt everyone’s calculations.' },
    ], columns: 1 },
    { type: 'p', text: 'Sealed bids mean **no dominant strategy**; from the announced scores, infer who won which slot at what price and avoid contested slots next round.' },
  ],
  similar: [
    { name: 'Modern Art', players: '3–5', alike: 'Several auction types, including sealed bids, for items of differing value.', differs: 'Values are set by the market, with no time sense involved.' },
    { name: 'The Mind', players: '2–4', alike: 'Relying on a sense of time without a clock.', differs: 'It is cooperative.' },
  ],
});

export const battleAscending = bg2Game('battle-ascending', 'death', day('10'), ['10'], ['magicswap', 'equationTower', 'hitStay'], {
  meta: {
    title: '배틀 오름차순 규칙 — 피의 게임2 10일차 데스매치, 두 장 중 하나를 고르면 남은 하나는 상대에게',
    description: '피의 게임2 10일차 데스매치 배틀 오름차순의 규칙을 정리했어요. 번갈아 1–10 카드 두 장 뽑기, 상대에게도 보이는 두 장, 하나는 내 시트에 남은 하나는 상대 시트에, 같은 숫자도 인정되는 가장 긴 오름차순까지.',
    keywords: ['배틀 오름차순', '피의 게임2 배틀 오름차순', '피의게임2 데스매치', '오름차순 게임', '피의게임2'],
  },
  title: '배틀 오름차순 — 피의 게임2 10일차 데스매치',
  name: '배틀 오름차순',
  lead: '2일차 오름차순의 1:1판이에요. 카드 두 장을 뽑아 하나를 내 시트에 적으면, 남은 하나는 상대 시트에 들어가요.',
  summary: '두 장 중 내 것을 고르면 나머지가 상대에게 가는 1:1 오름차순 대결.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**카드**: 1–10.',
      '**시트**: 각자 칸이 정해진 시트(칸 수는 정리된 규칙에 나와 있지 않아요).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '뽑기', body: '번갈아 한 사람씩 투표룸에 들어가 1–10 카드 중 두 장을 무작위로 뽑아요. 두 장은 모니터로 상대에게도 보여요.' },
      { title: '선택', body: '뽑은 사람은 그중 한 장을 골라 자기 시트의 원하는 칸에 적어요.' },
      { title: '넘기기', body: '남은 카드는 자동으로 상대에게 가고, 상대는 자기 시트의 원하는 칸에 적어요.' },
      { title: '반복', body: '두 사람의 시트가 모두 찰 때까지 계속해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**가장 길게 이어진 오름차순 칸 수**가 점수예요. 같은 숫자가 이어지는 것도 오름차순으로 인정해요. 점수가 높은 사람이 살아남아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '동점일 때의 처리는 정리된 규칙에서 확인되지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '배틀 오름차순은 **고르는 것이 곧 주는 것**인 게임이에요. 내게 좋은 카드를 고르면 남은 카드가 상대에게 가므로, 두 장의 쓸모를 두 시트 모두에서 따져야 해요.' },
    { type: 'cards', items: [
      { title: '상대 시트도 공개 정보', body: '두 사람이 뽑은 카드와 고른 카드가 모두 보이니, 상대 시트에 무엇이 어디 적혔는지 추적할 수 있어요. 상대에게 쓸모없는 숫자를 남겨 주는 것이 내 시트를 채우는 것만큼 중요해요.' },
      { title: '두 장이 모두 좋을 때', body: '두 장이 모두 상대에게도 좋다면, 덜 좋은 쪽을 상대에게 넘기는 것보다 상대에게 덜 필요한 쪽을 넘기는 게 낫기도 해요. 반대로 둘 다 쓸모없으면 상대의 오름차순을 끊을 수 있는 쪽을 넘기는 방어적 선택이 돼요.' },
    ], columns: 1 },
    { type: 'p', text: '카드가 무작위라 운이 있지만, 매 선택마다 상대 시트까지 계산하는 쪽이 앞서요. **우월 전략은 없어요.**' },
  ],
  similar: [
    { name: '로스트 시티 (Lost Cities)', players: '2명', alike: '색깔마다 숫자를 오름차순으로만 이어 놓는 1:1 게임이에요. 내가 버린 카드를 상대가 가져갈 수 있다는 점도 비슷해요.', differs: '로스트 시티는 다섯 원정대에 카드를 나눠 놓고, 원정 비용이 있어요.' },
    { name: '더 게임 (The Game)', players: '1–5명', alike: '숫자를 오름차순·내림차순 줄에 최대한 길게 잇는 게임이에요.', differs: '더 게임은 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Battle Ascending rules — The Bloody Game 2, day 10 death match',
    description: 'The rules of Battle Ascending (배틀 오름차순) from The Bloody Game 2: drawing two cards from 1–10 in turn, both visible to the rival, one for your sheet and the other for theirs, and the longest ascending run counting equal numbers.',
    keywords: ['Battle Ascending', 'Bloody Game 2 death match', '피의 게임2 배틀 오름차순'],
  },
  title: 'Battle Ascending — The Bloody Game 2, day 10 death match',
  name: 'Battle Ascending (배틀 오름차순)',
  lead: 'A one-on-one Ascending Order: draw two cards, write one on your sheet, and the other goes on your rival’s.',
  summary: 'A one-on-one ascending-run duel where the card you do not take goes to your rival.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Cards**: 1–10.',
      '**Sheets**: one each (the number of cells is not in the written rules).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Draw', body: 'Players take turns entering the voting room to draw two random cards from 1–10, shown to the rival on a monitor.' },
      { title: 'Choose', body: 'The drawer writes one in any cell of their sheet.' },
      { title: 'Pass', body: 'The other goes to the rival, who writes it in any cell.' },
      { title: 'Repeat', body: 'Until both sheets are full.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Your score is **your longest ascending run**, equal numbers included; the higher score survives.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Tie handling could not be confirmed.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'In Battle Ascending **choosing is giving**: the card you pass helps or hurts your rival, so weigh both cards on both sheets.' },
    { type: 'cards', items: [
      { title: 'The rival’s sheet is public', body: 'Draws and choices are visible, so you can track what the rival wrote where; leaving them useless numbers matters as much as filling your own sheet.' },
      { title: 'When both are good', body: 'If both cards help the rival, pass the one they need less; if both are useless to you, pass the one that breaks their run.' },
    ], columns: 1 },
    { type: 'p', text: 'Draws add luck, but calculating the rival’s sheet every time wins out. **There is no dominant strategy.**' },
  ],
  similar: [
    { name: 'Lost Cities', players: '2', alike: 'Two players build ascending runs per colour, and discards can feed the opponent.', differs: 'Cards go to five expeditions with a cost to start each.' },
    { name: 'The Game', players: '1–5', alike: 'Extend ascending and descending piles as long as possible.', differs: 'It is cooperative.' },
  ],
});

export const numberAuction = bg2Game('number-auction', 'semi', { ko: '11일차 세미파이널', en: 'Day 11, semifinal' }, ['11'], ['piggyBank', 'blackWhite', 'twoSidedPoker'], {
  meta: {
    title: '숫자 경매 규칙 — 피의 게임2 세미파이널, 숫자 블록으로 사는 매물·GOOD·BAD 카드',
    description: '피의 게임2 세미파이널 숫자 경매의 규칙을 정리했어요. 1·2·3·4·6·8·10·12·15·20·25 숫자 블록, 1–10 매물 카드와 GOOD 3장·BAD 3장, 패스하면 블록 회수, BAD 카드는 먼저 패스한 사람이 낙찰, 남은 자금이 가장 적으면 우승 불가, 최하위 즉시 탈락까지.',
    keywords: ['숫자 경매', '피의 게임2 숫자 경매', '피의게임2 세미파이널', '하이 소사이어티 보드게임', '피의게임2'],
  },
  title: '숫자 경매 — 피의 게임2 세미파이널',
  name: '숫자 경매',
  lead: '숫자 블록을 돈처럼 내서 점수 카드를 사요. 점수를 두 배로 만드는 카드도, 점수를 깎는 카드도 경매에 나와요. 끝날 때 돈이 가장 적게 남은 사람은 우승할 수 없어요.',
  summary: '보드게임 하이 소사이어티와 같은 구조의 5인 경매. 최하위는 데스매치 없이 바로 탈락해요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 5명. 추첨으로 처음 순서를 정해요.',
      '**자금 블록**: 각자 1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 25 하나씩(11개). 교환·양도·파기 불가. 게임 중 한 번 1,000만 원으로 11 블록을 살 수 있어요.',
      '**카드 16장**: 매물 카드 1–10(10장), GOOD 카드 3장(점수 2배), BAD 카드 3장(−5점, 점수 절반, 매물 반납).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '출품', body: '라운드마다 카드 한 장이 경매에 나와요.' },
      { title: '입찰', body: '순서대로 앞사람의 합계 이상이 되도록 블록을 내요. 여러 개를 함께 낼 수 있고, 낸 블록은 경매 중 되찾을 수 없어요. 앞사람보다 큰 합계를 낼 수 없으면 반드시 패스해요.' },
      { title: '패스', body: '패스하면 낸 블록을 모두 돌려받고 그 라운드에서 빠져요. 한 명만 남으면 그 사람이 낙찰받아요.' },
      { title: 'BAD 카드', body: 'BAD 카드는 반대로, **가장 먼저 패스한 사람**이 떠안아요. 나머지 사람의 블록은 모두 돌려줘요.' },
      { title: '다음 순서', body: '직전 라운드 낙찰자가 다음 라운드의 첫 순서가 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**GOOD 카드 3장과 점수 절반 카드가 모두 낙찰되는 즉시** 게임이 끝나요.',
      '점수 1위가 우승하지만, **남은 자금 블록의 합이 가장 적으면** 우승할 수 없고 다음 순위가 우승해요. 세미파이널 우승자는 파이널 1라운드 규칙을 미리 보고 대진과 종목을 정해요.',
      '점수 최하위는 데스매치 없이 **즉시 탈락**해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '매물 반납 카드: 받은 즉시 가진 매물 카드나 GOOD 카드 하나를 돌려줘요.',
      '−5점과 점수 절반을 모두 가졌다면 −5점을 먼저 적용해요.',
      '세미파이널부터는 개인자금 양도가 불가능해요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '숫자 경매는 보드게임 **하이 소사이어티**와 자금 블록 구성(1–25의 11장)까지 똑같아요. 그래서 그 게임에서 알려진 원리가 그대로 통해요.' },
    { type: 'cards', items: [
      { title: '돈을 쓰지 않으면 이길 수 없고, 너무 쓰면 실격', body: '점수를 얻으려면 블록을 써야 하지만, 남은 자금이 꼴찌면 실격이에요. 그래서 "남보다 조금이라도 많이 남기는 것"이 점수보다 먼저인 제약이에요. 남들이 쓴 블록은 모두 공개되므로, 각자의 남은 자금을 계속 세는 것이 필수예요.' },
      { title: '거스름돈이 없다', body: '블록은 정해진 액면이라 13을 내고 싶어도 12+1이나 10+3처럼 조합해야 해요. 한 번 낸 블록은 경매 중 회수할 수 없고, 패스하면 돌려받아요. 큰 블록을 일찍 깨면 나중에 정확한 금액을 맞추기 어려워요.' },
      { title: '끝나는 시점이 무작위', body: 'GOOD 3장과 점수 절반 카드가 모두 나와야 끝나니, 언제 끝날지 정확히 모르고 돈을 써야 해요. 마지막 결정적 카드가 남았을 때 돈을 아낀 사람이 가장 강해요. BAD 카드는 먼저 패스한 사람이 떠안으니, BAD 경매는 "누가 먼저 겁을 내느냐"의 치킨 게임이에요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없어요.** 점수 2배 카드의 가치는 이미 가진 점수에 비례하므로, 매물 카드를 어느 정도 모은 뒤 GOOD 카드에 크게 쓰는 흐름이 일반적이에요.' },
  ],
  similar: [
    { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '돈 카드 1–25 열한 장, 사치품 1–10, 점수 2배 카드 3장과 −5·절반·반납 같은 불명예 카드, 불명예 카드는 먼저 포기한 사람이 가져가는 규칙, 돈이 가장 적게 남은 사람의 탈락까지 거의 같아요.', differs: '하이 소사이어티는 정해진 카드가 나오면 끝나는 조건이 조금 다르고, 패배자가 탈락하는 서바이벌 요소는 없어요.' },
    { name: '포 세일 (For Sale)', players: '3–6명', alike: '패스하면 일부를 돌려받는 경매로 가치가 다른 카드를 사요.', differs: '포 세일은 사들인 건물을 다시 팔아 돈을 버는 두 단계 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Number Auction rules — The Bloody Game 2 semifinal',
    description: 'The rules of Number Auction (숫자 경매) from The Bloody Game 2: money blocks 1, 2, 3, 4, 6, 8, 10, 12, 15, 20 and 25, lots numbered 1–10 plus three GOOD and three BAD cards, taking blocks back on a pass, the first to pass taking a BAD card, no win for the poorest player, and instant elimination for last place.',
    keywords: ['Number Auction', 'Bloody Game 2 semifinal', 'High Society board game', '피의 게임2 숫자 경매'],
  },
  title: 'Number Auction — The Bloody Game 2 semifinal',
  name: 'Number Auction (숫자 경매)',
  lead: 'Spend number blocks like money on scoring cards, including cards that double your score and cards that wreck it. Whoever ends with the least money cannot win.',
  summary: 'A five-player auction built exactly like High Society; last place is eliminated without a death match.',
  setup: [
    { type: 'list', items: [
      '**Players**: five; first order by draw.',
      '**Money blocks**: 1, 2, 3, 4, 6, 8, 10, 12, 15, 20 and 25 each (eleven), no trading; once per game an 11 block can be bought for ₩10 million.',
      '**Sixteen cards**: lots 1–10, three GOOD (double your score) and three BAD (−5, halve your score, return a lot).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Lot', body: 'Each round one card goes up.' },
      { title: 'Bid', body: 'In order, put down blocks totalling at least the previous bid; several at once are fine, and blocks bid cannot be withdrawn during the auction. If you cannot top it, you must pass.' },
      { title: 'Pass', body: 'Passing returns your blocks and takes you out of the round; the last one left wins.' },
      { title: 'BAD cards', body: 'Reversed: **the first to pass** takes the BAD card and everyone else gets their blocks back.' },
      { title: 'Next', body: 'The last winner opens the next round.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The game ends **as soon as all three GOOD cards and the halving card have been taken**.',
      'Top score wins, unless that player has **the smallest money total left**, in which case the next score wins. The semifinal winner previews the final’s first round and sets the bracket and game.',
      'Lowest score is **eliminated at once**, without a death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Return-a-lot: on taking it, give back a lot or GOOD card you hold.',
      'With both −5 and halving, −5 applies first.',
      'From the semifinal on, personal funds cannot be transferred.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Number Auction is **High Society**, down to the eleven money values from 1 to 25, so that game’s known principles carry over.' },
    { type: 'cards', items: [
      { title: 'Spend to score, but not most', body: 'Points need spending, yet the poorest is disqualified, so "keep more than someone" comes before points. Every block spent is public, so count everyone’s remaining money.' },
      { title: 'No change given', body: 'Blocks have fixed values, so 13 must be 12+1 or 10+3. Blocks bid stay down until you pass; breaking big blocks early makes exact bids hard later.' },
      { title: 'An uncertain end', body: 'The game ends only when the three GOODs and the halving card are out, so you spend without knowing when it ends; whoever saved money is strongest at the decisive last card. BAD auctions are games of chicken over who flinches first.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy.** A doubling card is worth more the more you already have, so collecting lots first and spending big on GOOD cards is the usual shape.' },
  ],
  similar: [
    { name: 'High Society', players: '3–5', alike: 'Eleven money cards from 1 to 25, luxury cards 1–10, three doubling cards and −5, halving and discard disgraces taken by the first to pass, and the poorest player excluded: almost identical.', differs: 'The ending trigger differs slightly, and nobody is eliminated from a show.' },
    { name: 'For Sale', players: '3–6', alike: 'An auction where passing returns part of your bid.', differs: 'It has a second phase selling the properties you bought.' },
  ],
});

export const hiddenMission = bg2Game('hidden-mission', 'final', { ko: '파이널 1라운드', en: 'Final, round 1' }, ['11'], ['hiddenWord', 'nemoCount', 'gradation'], {
  meta: {
    title: '히든 미션 규칙 — 피의 게임2 파이널 1라운드, 같은 그림 찾기와 숨은 문제',
    description: '피의 게임2 파이널 1라운드 히든 미션의 규칙을 정리했어요. 6×6판 18쌍의 그림, 라운드별 10·20·30초 암기, 같은 그림 두 칸을 부르면 1점, 뒤에 숨은 글자로 문제를 풀면 3점, 더블·오픈 아이템, 3라운드까지.',
    keywords: ['히든 미션', '피의 게임2 히든 미션', '피의게임2 파이널', '같은 그림 찾기', '피의게임2'],
  },
  title: '히든 미션 — 피의 게임2 파이널 1라운드',
  name: '히든 미션',
  lead: '같은 그림 두 칸을 찾아 뒤집으면 뒤에 숨은 글자가 드러나요. 글자를 모아 숨은 문제를 읽고 답을 맞히면 큰 점수를 얻어요.',
  summary: '그림 짝 맞추기로 숨은 글자를 열고, 그 글자가 만드는 문제의 답을 맞히는 1:1 파이널.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**판**: 6×6, 같은 그림 2개씩 18쌍. 칸 뒤에는 문제의 글자 하나나 빈칸이 숨어 있어요.',
      '**암기 시간**: 1라운드 10초, 2라운드 20초, 3라운드 30초.',
      '**아이템**(각 1,000만 원, 게임 전체에서 하나씩 한 번, 함께 쓸 수 있어요): **더블** — 연속으로 두 번 선언, 첫 번째 정답 1점·두 번째 정답 2점, 오답이면 1점 감점. **오픈** — 선언 전에 한 칸을 미리 열어 봐요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기', body: '라운드 시작 전 판을 외워요.' },
      { title: '짝 선언', body: '세미파이널 순위가 높은 사람부터, 번갈아 같은 그림이라고 생각하는 두 칸의 번호를 불러요. 맞히면 1점이고 차례가 넘어가요.' },
      { title: '글자 공개', body: '맞힌 칸은 뒤집혀 숨은 글자가 드러나요.' },
      { title: '히든 미션', body: '드러난 글자로 문제를 짐작해 답을 맞히면 3점을 얻고 그 라운드가 끝나요. 틀리면 차례가 넘어가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '3라운드 누적 점수가 높은 사람이 이겨요. 파이널은 1:1 토너먼트라, 이긴 사람이 다음 라운드로 가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '더블을 쓸 때를 빼면 틀려도 감점이 없어요.',
      '짝을 모두 맞힌 뒤에는 히든 미션 선언만 할 수 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '히든 미션은 **기억력 게임 위에 단어 추리**를 얹었어요. 짝 하나는 1점이지만 문제는 3점이라, 글자를 얼마나 빨리 읽어 내느냐가 라운드를 끝내는 열쇠예요.' },
    { type: 'cards', items: [
      { title: '틀려도 손해가 없다', body: '오답에 감점이 없으니, 확신이 없어도 부르는 편이 이득이에요. 상대가 앞서 부른 오답 조합을 그대로 다시 부르면 상대에게 정보를 주지 않고 차례만 넘길 수도 있어요. 반대로 히든 미션 선언도 감점이 없으니 조금만 짐작이 서도 시도할 가치가 있어요.' },
      { title: '문제는 문장이다', body: '숨은 글자는 문제 문장의 글자들이 흩어진 것이에요. 몇 글자만 보여도 "어디인가", "이름은" 같은 문장 끝이 짐작되고, 핵심 명사 한두 글자로 답이 좁혀져요. 그래서 짝을 고를 때 이미 기억하는 쌍이 여럿이라면, 글자가 많이 드러날 쪽보다 핵심 단어 쪽을 여는 것도 방법이에요.' },
      { title: '라운드를 끝낼 권리', body: '히든 미션을 맞히면 그 라운드가 바로 끝나요. 짝 점수에서 뒤처져도 문제를 먼저 맞히면 3점을 얻고 상대의 추가 득점을 막아요. 앞서 있을 때는 오히려 라운드를 빨리 끝내는 것이 리드를 지키는 길이에요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없지만**, 감점이 없는 구조 때문에 적극적으로 선언하는 쪽이 일관되게 유리해요. 더블은 감점 위험이 있으니 확실히 기억하는 쌍이 둘 이상일 때만 쓸 만해요.' },
  ],
  similar: [
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '엎어진 그림의 위치를 기억해 같은 그림 두 장을 찾는 바로 그 규칙이에요.', differs: '메모리는 맞히면 계속 뒤집을 수 있고, 숨은 문제가 없어요.' },
    { name: '컨셉 (Concept)', players: '4–12명', alike: '조각난 단서를 모아 숨은 단어를 추리해요.', differs: '컨셉은 아이콘 위에 말을 놓아 단서를 주는 협력형 추리 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Hidden Mission rules — The Bloody Game 2 final, round 1',
    description: 'The rules of Hidden Mission (히든 미션) from The Bloody Game 2: eighteen picture pairs on a 6×6 board, 10, 20 and 30 seconds to memorise, a point per pair, letters hidden behind the tiles that spell a question worth 3 points, the double and open items, and three rounds.',
    keywords: ['Hidden Mission', 'Bloody Game 2 final', 'memory matching game', '피의 게임2 히든 미션'],
  },
  title: 'Hidden Mission — The Bloody Game 2 final, round 1',
  name: 'Hidden Mission (히든 미션)',
  lead: 'Find matching pictures to flip them and reveal the letters behind. The letters spell a hidden question; answer it for a big score.',
  summary: 'A one-on-one final round: match pictures to uncover letters, then answer the question they spell.',
  setup: [
    { type: 'list', items: [
      '**Players**: one against one.',
      '**Board**: 6×6, eighteen pairs of pictures; behind each tile is one letter of a question, or a blank.',
      '**Memorising**: 10 seconds in round 1, 20 in round 2, 30 in round 3.',
      '**Items** (₩10 million each, once each per game, usable together): **double** — two calls in a row, 1 point for the first correct and 2 for the second, −1 for a miss; **open** — peek at one tile before calling.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise', body: 'Study the board before the round.' },
      { title: 'Call a pair', body: 'Starting with the higher semifinal finisher, players alternate naming two tile numbers; a match scores 1 and passes the turn.' },
      { title: 'Letters', body: 'Matched tiles flip to show their hidden letters.' },
      { title: 'Hidden mission', body: 'Guess the question from the letters and answer it for 3 points, ending the round; a wrong answer passes the turn.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The higher total after three rounds wins; the final is a one-on-one bracket, so the winner advances.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Apart from the double item, misses cost nothing.',
      'Once all pairs are matched, only the hidden mission can be called.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Hidden Mission puts **a word puzzle on top of a memory game**: a pair is 1 point but the question is 3, so reading the letters quickly is what ends rounds.' },
    { type: 'cards', items: [
      { title: 'Misses are free', body: 'With no penalty, calling when unsure is right; repeating a pair the rival already missed passes the turn without giving information. Answer attempts are free too, so even a partial guess is worth trying.' },
      { title: 'The question is a sentence', body: 'The letters are a scattered question sentence; a few reveal endings like "where is" or "what is the name", and one or two key nouns narrow the answer. With several remembered pairs, open the ones likely to expose key words.' },
      { title: 'The right to end the round', body: 'A correct answer ends the round at once, scoring 3 and cutting off the rival’s pair points; when ahead, ending rounds quickly protects the lead.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy**, but the no-penalty structure consistently rewards calling aggressively. The double risks a point, so it suits only when two pairs are certain.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember face-down pictures and find matching pairs: the same rule.', differs: 'A match lets you continue, and there is no hidden question.' },
    { name: 'Concept', players: '4–12', alike: 'Piece together fragments to deduce a hidden word.', differs: 'Clues are given by placing markers on icons, cooperatively.' },
  ],
});
