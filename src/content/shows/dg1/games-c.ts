// 데스게임 season 1, matches 9–11: 천기누설, 더블스 플랜, 용의자들.
import { dg1Game } from './make';

export const heavensSecret = dg1Game('heavens-secret', 9, ['hiddenWord', 'gyulhap', 'equationSignal'], {
  meta: {
    title: '천기누설 규칙 — 데스게임 9회차, 비밀 명제로 점수 내고 상대 명제 맞히기',
    description: '넷플릭스 데스게임 9회차 천기누설의 규칙을 정리했어요. 해·달·별·구름 카드 120장, 15자 이내 비밀 명제 작성 규칙과 금지 사항, 슬롯 세 개에 카드 놓기, 명제 충족 시 승점, 종을 쳐서 하는 천기누설 도전, 3판 2선승까지.',
    keywords: ['천기누설', '데스게임 천기누설', '넷플릭스 데스게임', '데스게임 9회차', '비밀 규칙 게임'],
  },
  title: '천기누설 — 데스게임 9회차',
  name: '천기누설',
  lead: '"○○일 때 점수를 얻는다"는 나만의 비밀 규칙을 적어요. 점수를 모으되, 상대가 내 규칙을 알아채면 라운드를 바로 내줘요.',
  summary: '각자 숨긴 비밀 명제로 점수를 쌓고, 상대의 명제를 먼저 알아맞히면 이기는 1:1 규칙 추리 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**카드 120장**: 해·달·별·구름 문양. 문양이 하나인 단일 카드 72장, 2–3개인 믹스 카드 48장.',
      '**슬롯**: 카드를 놓는 자리 3개.',
      '**라운드**: 3라운드, 2승 선승. 기록은 자유롭게 할 수 있어요.',
    ] },
    { type: 'callout', tone: 'note', title: '비밀 명제 쓰는 법', text: '"(15칸)때 점수를 획득한다" 형식으로, 띄어쓰기를 빼고 한글 15자 이내로 써요(숫자는 한 칸에 하나). 네 문양 중 하나 이상을 꼭 써야 하고, 수의 범위나 "~중 하나" 같은 선택 조건은 쓸 수 없어요(같은 뜻의 다른 표현도 금지). 단순한 개수 비교는 돼요. 짝수·홀수·배수 같은 조건에서 0은 해당하지 않아요. 게임과 관계없거나 점수를 얻을 수 없는 명제도 안 돼요.' },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '명제 쓰기', body: '라운드 전에 각자 비밀 명제를 적어요.' },
      { title: '카드 놓기', body: '선부터 차례로 카드 한 장을 뽑아 세 슬롯 중 원하는 곳에 놓아요. 이미 카드가 있는 슬롯 위에 덮어 놓을 수도 있어요.' },
      { title: '점수', body: '놓은 결과가 누군가의 명제를 만족하면 그 명제의 주인이 1점을 얻어요(둘 다 만족하면 둘 다 1점). 그다음 슬롯의 카드는 모두 치워요.' },
      { title: '천기누설 도전', body: '자기 차례에 카드를 놓기 직전, 종을 쳐서 상대의 명제를 말할 수 있어요. 문장이 똑같지 않아도 뜻이 같으면 성공이고 그 라운드를 바로 이겨요. 실패해도 점수 변동은 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**천기누설 도전에 성공하면** 그 라운드 승리예요.',
      '카드 120장을 다 쓸 때까지 성공이 없으면 **점수가 많은 사람**이 그 라운드를 이겨요.',
      '**두 라운드를 먼저 이긴 사람**이 승리해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '덮어 놓은 카드가 슬롯에서 어떻게 계산되는지(맨 위만 보는지 등)는 확인되지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '천기누설은 보드게임 **젠도(Zendo)**처럼 "숨은 규칙"을 맞히는 게임인데, 두 사람이 동시에 출제자이자 해결자예요. 점수를 내려면 내 규칙이 자주 만족돼야 하고, 그러면 상대에게 규칙이 드러나요.' },
    { type: 'cards', items: [
      { title: '점수와 비밀의 교환', body: '쉽게 만족되는 명제("해가 있을 때")는 점수가 잘 나지만, 점수가 나는 순간의 슬롯을 보면 금방 들켜요. 어려운 명제는 들키지 않지만 점수가 거의 안 나요. 120장 동안 몇 점이 필요한지와 상대의 추리 속도 사이에서 난이도를 정해야 해요.' },
      { title: '점수가 나는 순간이 단서', body: '누가 점수를 얻었는지가 공개되므로, 그때의 슬롯 카드를 모두 기록하면 공통점을 찾을 수 있어요. 점수가 나지 않은 배치도 "이건 아니다"라는 정보예요. 기록이 허용되니, 매 배치를 표로 남기는 사람이 유리해요.' },
      { title: '내가 놓는 카드로 실험하기', body: '내 차례에 놓는 카드는 내 점수를 위한 수이기도 하지만, 상대의 명제를 시험하는 실험이기도 해요. 상대가 점수를 얻을지 볼 수 있는 배치를 일부러 만들어 가설을 확인할 수 있어요. 반대로 내 명제를 만족시키는 배치는 상대에게 단서를 주니, 점수를 얻을 때를 골라야 해요.' },
      { title: '덮어 놓기의 쓸모', body: '슬롯 위에 덮을 수 있어서, 상대의 명제를 만족시킬 것 같은 배치를 덮어 깨뜨리거나, 내 명제를 만족시키는 모양을 완성할 수 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '젠도 (Zendo)', players: '2–6명', alike: '한 사람이 숨긴 규칙을, 배치를 만들어 보고 규칙에 맞는지 확인하며 맞히는 게임이에요. 천기누설의 바탕과 같아요.', differs: '젠도는 한 명이 출제자이고, 출제자는 점수를 얻지 않아요.' },
      { name: '엘레우시스 (Eleusis)', players: '4–8명', alike: '딜러만 아는 비밀 규칙에 맞는 카드를 내며 규칙을 추리하는 카드 게임이에요.', differs: '엘레우시스는 트럼프 카드로 하고, 딜러는 규칙을 너무 쉽거나 어렵지 않게 정해야 점수를 받아요.' },
  ],
  note: '방송에서 쓰인 명제의 예는 적지 않았어요.',
}, {
  meta: {
    title: "Heaven's Secret rules — Death Game (The Risk Takers) match 9",
    description: "The rules of Heaven's Secret (천기누설) from Netflix's Death Game season 1: 120 cards of sun, moon, star and cloud, the rules for writing a secret proposition of up to 15 syllables, placing cards in three slots, scoring when a proposition is met, ringing to guess the opponent's proposition, and best of three.",
    keywords: ["Heaven's Secret", 'Death Game match 9', 'The Risk Takers', 'hidden rule game'],
  },
  title: "Heaven's Secret — Death Game match 9",
  name: "Heaven's Secret",
  lead: 'Write your own secret rule — "I score when …". Collect points, but if your opponent guesses the rule, you lose the round at once.',
  summary: 'A 1:1 rule-guessing duel: score with your secret proposition, and win by naming the opponent’s first.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**120 cards**: sun, moon, star and cloud symbols — 72 with one symbol, 48 with two or three.',
      '**Slots**: three places for cards.',
      '**Rounds**: three, first to two. Notes are allowed.',
    ] },
    { type: 'callout', tone: 'note', title: 'Writing the secret proposition', text: 'In the form "I score when (15 spaces)", up to 15 Korean syllables excluding spaces (one digit per space). It must use at least one symbol; ranges and "one of" choices are banned (as are rewordings that mean the same), though simple comparisons of counts are allowed. For even, odd or multiples, zero does not count. Propositions unrelated to the game or impossible to satisfy are not allowed.' },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Write', body: 'Before each round both write a secret proposition.' },
      { title: 'Place', body: 'In turn, draw a card and put it in any of the three slots, possibly on top of another card.' },
      { title: 'Score', body: 'If the layout meets someone’s proposition, its author scores 1 (both if both are met), and the slots are cleared.' },
      { title: 'Heaven’s Secret challenge', body: 'Just before placing, ring the bell and state the opponent’s proposition; the same meaning in different words counts. Success wins the round; failure costs nothing.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**A successful challenge** wins the round.',
      'Otherwise, after all 120 cards, **the higher score** wins it.',
      '**First to two rounds** wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How stacked cards in a slot are counted (only the top one?) could not be confirmed and is left out.',
    ] },
  ],
  analysis: [
    { type: 'p', text: "Heaven's Secret is a hidden-rule game like **Zendo**, but both players set and solve at once: scoring requires your rule to be met often, which reveals it." },
    { type: 'cards', items: [
      { title: 'Points versus secrecy', body: 'An easy rule ("when there is a sun") scores often but is soon spotted; a hard one stays hidden but rarely scores. Choose difficulty against how many points you need over 120 cards and how fast the opponent reasons.' },
      { title: 'Scoring moments are clues', body: 'Who scored is public, so recording the slots at each score reveals what they share; non-scoring layouts rule things out. With notes allowed, the player who tabulates every layout has the edge.' },
      { title: 'Your cards are experiments', body: 'Your placements serve your score but also test hypotheses about the opponent’s rule. Meeting your own rule hands over a clue, so pick when to score.' },
      { title: 'Covering', body: 'Covering a slot can break a layout that would score for the opponent, or complete one for you.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Zendo', players: '2–6', alike: 'Guess a hidden rule by building arrangements and seeing whether they fit — the same basis.', differs: 'One player sets the rule and does not score.' },
    { name: 'Eleusis', players: '4–8', alike: 'Play cards that fit a dealer’s secret rule while deducing it.', differs: 'It uses a standard deck, and the dealer scores best with a rule neither too easy nor too hard.' },
  ],
  note: 'Example propositions from the episode are not reproduced.',
});

export const doublesPlan = dg1Game('doubles-plan', 10, ['blackWhite', 'blackWhite2', 'gradation'], {
  meta: {
    title: '더블스 플랜 규칙 — 데스게임 10회차, 두 배를 넘으면 작은 수가 이기는 블록 대결',
    description: '넷플릭스 데스게임 10회차 더블스 플랜의 규칙을 정리했어요. 1–12 숫자 블록과 빨강·검정 뒷면, 뒷면만 보고 번갈아 고르는 빨강 3·검정 2, 기본승·역전승·더블승, 세트별 점수, 4세트와 연장전까지.',
    keywords: ['더블스 플랜', '데스게임 더블스 플랜', '넷플릭스 데스게임', '데스게임 10회차', '숫자 블록 게임'],
  },
  title: '더블스 플랜 — 데스게임 10회차',
  name: '더블스 플랜',
  lead: '큰 수가 이기지만 두 배보다 크면 작은 수가 이기고, 정확히 두 배면 큰 수가 "더블승"을 거둬요.',
  summary: '뒷면 색만 보고 고른 숫자 블록 다섯 개로 겨루는 1:1 대결. 두 배 관계가 승패를 뒤집어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**블록**: 1–12 숫자 블록. 뒷면은 3–9가 빨강(7종), 나머지 5종이 검정이에요.',
      '**세트**: 4세트. 한 세트는 블록 고르기와 숫자 대결 5번이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '블록 고르기', body: '선부터 번갈아, **뒷면만 보고** 블록을 하나씩 가져가 각자 빨강 3개, 검정 2개를 모아요. 고른 블록은 나만 확인하고, 남은 두 개는 공개되지 않고 빠져요.' },
      { title: '숫자 대결', body: '선이 블록 하나를 내면, 후는 그 뒷면 색을 보고 하나를 내요. 두 블록을 차례로 공개해 판정해요. 다섯 번 해요.' },
    ] },
    { type: 'table', head: ['결과', '조건'], rows: [
      ['기본승', '큰 수가 이겨요.'],
      ['역전승', '큰 수가 작은 수의 두 배보다 크면 작은 수가 이겨요.'],
      ['더블승', '큰 수가 작은 수의 정확히 두 배면 큰 수가 이겨요.'],
    ] },
    { type: 'table', head: ['세트', '점수'], rows: [
      ['1세트', '모든 승리 1점'],
      ['2세트', '기본승·역전승 1점, 더블승 2점'],
      ['3–4세트', '기본승·역전승 2점, 더블승 4점'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      '4세트 뒤 점수가 높은 사람이 이겨요. 같으면 3–4세트 규칙으로 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '블록을 뒷면만 보고 고르므로, 내 블록의 숫자는 고른 뒤에야 알아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '더블스 플랜은 **두 배를 기준으로 순환하는 숫자**와 **운으로 고르는 패**가 합쳐진 게임이에요. 시즌 2 버전과 달리 블록을 뒷면만 보고 골라서, 매 세트 손에 든 숫자가 달라요.' },
    { type: 'cards', items: [
      { title: '고르는 순서가 정보예요', body: '빨강은 3–9(7개 중 3개), 검정은 1·2·10·11·12(5개 중 2개)를 가져가요. 남는 블록은 빨강 하나, 검정 하나예요. 내 블록을 보고 나면, 상대가 가진 블록이 "나머지 중 하나 빼고"라는 걸 알 수 있어 후보가 크게 줄어요.' },
      { title: '검정은 양극단', body: '검정은 아주 작거나(1·2) 아주 큰(10–12) 숫자예요. 상대가 검정을 내면, 작은 수라면 큰 수에게 역전승을, 큰 수라면 기본승을 노리는 거예요. 후는 이 둘 사이에서 맞는 대응을 골라야 하고, 중간 빨강(5–7)이 가장 안전한 대응일 때가 많아요.' },
      { title: '두 배 쌍을 찾으세요', body: '3–4세트의 더블승은 4점이에요. 내 패에 6과 12, 4와 8 같은 두 배 쌍이 있다면, 상대가 그 절반을 낼 것 같은 순간에 맞춰 쓰는 것이 큰 점수로 가는 길이에요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '스트라테고 (Stratego)', players: '2명', alike: '숨겨진 숫자끼리 맞붙어 큰 쪽이 이기지만, 가장 약한 말이 가장 강한 말을 잡는 예외가 있어요.', differs: '스트라테고는 판 위에서 말을 움직이고, 깃발을 잡아야 이겨요.' },
    { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '숫자 카드를 한 장씩 내 겨루고, 쓴 카드는 다시 못 쓰는 예산 게임이에요.', differs: '하이에나는 동시에 내고, 큰 수가 늘 유리해요.' },
  ],
}, {
  meta: {
    title: 'Doubles Plan rules — Death Game (The Risk Takers) match 10',
    description: 'The rules of Doubles Plan (더블스 플랜) from Netflix’s Death Game season 1: number blocks 1–12 with red and black backs, drafting three red and two black by their backs, normal, upset and double wins, points per set, four sets and an extra set.',
    keywords: ['Doubles Plan', 'Death Game match 10', 'The Risk Takers', 'number block game'],
  },
  title: 'Doubles Plan — Death Game match 10',
  name: 'Doubles Plan',
  lead: 'The higher number wins — unless it is more than double, when the lower wins; exactly double is a "double win" for the higher.',
  summary: 'A 1:1 duel with five number blocks drafted by their back colour; doubling decides who wins.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**Blocks**: numbers 1–12; 3–9 have red backs (seven), the other five black.',
      '**Sets**: four, each a draft followed by five duels.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Draft', body: 'Alternately, take blocks **seeing only their backs** until each has three red and two black. You look at your own; the two left over are removed unseen.' },
      { title: 'Duels', body: 'The leader plays a block; the other sees its colour and replies; both are revealed and judged. Five duels.' },
    ] },
    { type: 'table', head: ['Result', 'When'], rows: [
      ['Normal win', 'Higher wins.'],
      ['Upset', 'Higher is more than double: lower wins.'],
      ['Double win', 'Higher is exactly double: higher wins.'],
    ] },
    { type: 'table', head: ['Set', 'Points'], rows: [
      ['1', 'Every win 1'],
      ['2', 'Normal and upset 1, double 2'],
      ['3–4', 'Normal and upset 2, double 4'],
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After four sets the higher score wins; a tie is settled by an extra set under set 3–4 scoring.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Blocks are drafted face down, so you only learn your numbers after choosing.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Doubles Plan combines **numbers that cycle around doubling** with **a blind draft**. Unlike season 2 you take blocks by their backs, so your hand changes every set.' },
    { type: 'cards', items: [
      { title: 'The draft gives information', body: 'Each player takes three of the seven reds and two of the five blacks, leaving one of each. Once you see your own blocks, the opponent’s are "the rest minus one", which narrows them sharply.' },
      { title: 'Black means extremes', body: 'Black is 1, 2 or 10–12: a small one hunts big numbers, a big one wins normally. The reply must choose between those readings, and a middling red (5–7) is often safest.' },
      { title: 'Find doubling pairs', body: 'A late double win is worth 4. Pairs like 6 and 12 or 4 and 8 pay most when timed for the moment the opponent plays the half.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Stratego', players: '2', alike: 'Hidden ranks clash and the higher wins, except the weakest piece beating the strongest.', differs: 'Pieces move on a board and you must capture the flag.' },
    { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'A budget game of number cards each played once.', differs: 'Cards are played simultaneously and high always wins.' },
  ],
});

export const suspects = dg1Game('suspects', 11, ['gyulhap', 'nemoCount', 'hexagon'], {
  meta: {
    title: '용의자들 규칙 — 데스게임 11회차, 81장 몽타주에서 "모두 같거나 모두 다른" 셋 찾기',
    description: '넷플릭스 데스게임 11회차 용의자들의 규칙을 정리했어요. 시간대·머리·변장·무기 네 요소의 용의자 카드 81장, 공개 장수와 사라지는 카드, 모두 같거나 모두 다른 세 장 검거, 버저와 5초, 검거 불가 선언, 세트별 점수와 연장전까지.',
    keywords: ['용의자들', '데스게임 용의자들', '넷플릭스 데스게임', '데스게임 11회차', '결합 게임', 'SET 게임'],
  },
  title: '용의자들 — 데스게임 11회차',
  name: '용의자들',
  lead: '81명의 몽타주 가운데, 네 가지 특징이 각각 모두 같거나 모두 다른 세 명을 찾아 "검거"해요. 더 이상 없다고 생각되면 "검거 불가"를 외쳐요.',
  summary: '네 가지 특징이 모두 같거나 모두 다른 세 장을 찾는 SET식 속도 대결. 마지막 세트는 카드가 나타났다 사라져요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1.',
      '**용의자 카드 81장**: 네 요소가 저마다 세 가지 — 시간대(아침·저녁·밤), 헤어(양갈래·모히칸·아프로), 변장(마스크·선글라스·없음), 무기(총·칼·수류탄). 3×3×3×3 = 81가지 조합이 한 장씩이에요.',
      '**세트**: 3세트, 세트마다 3라운드(모두 9라운드).',
    ] },
    { type: 'table', head: ['세트', '공개 카드'], rows: [
      ['1세트 (1–3R)', '9장'],
      ['2세트 (4–6R)', '12장'],
      ['3세트 (7–9R)', '12장이 차례로 나타났다 사라져요'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '검거', body: '네 요소 하나하나가 **모두 같거나 모두 다른** 세 장을 찾으면, 가운데 종을 누르고 5초 안에 그 세 장의 번호를 말해요.' },
      { title: '판정', body: '맞으면 +1점, 틀리거나 5초를 넘기면 −1점이에요. 이미 나온 답을 다시 말하면 점수 변동이 없어요.' },
      { title: '검거 불가', body: '가능한 조합이 모두 나왔다고 생각하면 종을 누르고 검거 불가를 선언해요. 맞으면 +2점, 틀리면 −2점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '9라운드 뒤 **점수가 높은 사람**이 이겨요. 같으면 3세트 규칙으로 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**3세트는 점수가 1점씩 커져요**: 검거 정답 +2, 오답 −2, 검거 불가 정답 +3, 오답 −3.',
      '1·2세트는 검거 불가가 맞거나, 마지막 선언 뒤 3분이 지나면 라운드가 끝나요. 3세트는 검거 불가 정답이 나와야만 끝나요.',
      '공개된 카드로 조합이 여러 개 나올 수도, 하나도 없을 수도 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '용의자들은 카드 게임 **셋(SET)**과 같은 수학적 구조예요. 81장은 네 속성이 세 값씩인 모든 조합이고, "모두 같거나 모두 다름"이 그 유명한 규칙이에요.' },
    { type: 'cards', items: [
      { title: '두 장이 세 번째를 정해요', body: '어떤 두 장을 고르든, 둘을 "모두 같거나 모두 다르게" 완성하는 세 번째 카드는 81장 중 정확히 한 장으로 정해져요. 요소마다 둘이 같으면 같은 값, 다르면 남은 한 값이 필요해요. 그래서 두 장을 정하고 "필요한 세 번째"를 떠올린 뒤 판에서 찾는 것이 가장 빠른 방법이에요.' },
      { title: '12장에는 대개 조합이 있어요', body: '셋(SET) 게임에서 알려진 것처럼, 12장 가운데 조합이 하나도 없을 확률은 낮아요(그리고 서로 조합을 이루지 않는 카드는 최대 20장까지 모을 수 있어요). 9장일 때는 없을 확률이 훨씬 커서, 1세트에서는 검거 불가 선언이 중요한 점수원이에요.' },
      { title: '검거 불가는 모든 쌍을 확인한 뒤', body: '9장이면 쌍이 36개, 12장이면 66개예요. 모든 쌍의 "세 번째 카드"가 판에 없음을 확인해야 검거 불가가 확실해요. 이미 나온 답을 빼고 남은 쌍만 확인하면 되므로, 앞서 나온 조합을 기억하는 것이 계산을 줄여요.' },
      { title: '사라지는 카드', body: '3세트는 카드가 나타났다 사라지므로, 지나간 카드를 기억해야 해요. 점수가 커져 있어서, 기억력이 좋은 쪽이 마지막에 판을 뒤집을 수 있어요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '셋 (SET)', players: '1명 이상', alike: '네 속성이 세 값씩인 81장 카드에서, 속성마다 모두 같거나 모두 다른 세 장을 남보다 빨리 찾아요. 용의자들과 수학적으로 똑같은 게임이에요.', differs: '셋은 모양·색·개수·무늬를 쓰고, 보통 조합이 없을 때 카드를 더 깔아요. 검거 불가 같은 점수 선언은 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '여러 장의 그림 카드 사이에서 조건에 맞는 공통점을 남보다 빨리 찾아 외치는 관찰 속도 게임이에요.', differs: '도블은 두 장 사이의 같은 그림 하나를 찾고, 세 장 조합이나 검거 불가 선언이 없어요.' },
  ],
}, {
  meta: {
    title: 'Suspects rules — Death Game (The Risk Takers) match 11',
    description: 'The rules of Suspects (용의자들) from Netflix’s Death Game season 1: 81 suspect cards with four features, how many cards show and the vanishing cards, arresting three that are all the same or all different in each feature, the buzzer and five seconds, calling "no arrest possible", points per set and the tie-break.',
    keywords: ['Suspects', 'Death Game match 11', 'The Risk Takers', 'SET-like game'],
  },
  title: 'Suspects — Death Game match 11',
  name: 'Suspects',
  lead: 'Among 81 suspect sketches, find three whose four features are each all the same or all different — and call "no arrest" when none are left.',
  summary: 'A SET-style speed duel: find three suspects whose features are all the same or all different; in the last set cards appear and vanish.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1.',
      '**81 suspect cards**: four features with three values each — time (morning, evening, night), hair (pigtails, mohawk, afro), disguise (mask, sunglasses, none), weapon (gun, knife, grenade). 3×3×3×3 = 81, one card per combination.',
      '**Sets**: three of three rounds (nine rounds).',
    ] },
    { type: 'table', head: ['Set', 'Cards shown'], rows: [
      ['Set 1 (rounds 1–3)', 'Nine'],
      ['Set 2 (rounds 4–6)', 'Twelve'],
      ['Set 3 (rounds 7–9)', 'Twelve, appearing and disappearing one after another'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Arrest', body: 'Find three cards where every feature is **all the same or all different**, hit the bell and name their numbers within five seconds.' },
      { title: 'Judging', body: 'Right +1, wrong or late −1; repeating an answer already given changes nothing.' },
      { title: 'No arrest', body: 'If you think every arrest has been found, ring and call "no arrest possible": +2 if right, −2 if wrong.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After nine rounds **the higher score** wins; a tie goes to an extra round under set-3 scoring.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '**Set 3 raises every value by one**: arrest +2/−2, no-arrest +3/−3.',
      'Sets 1 and 2 end a round on a correct no-arrest call or three minutes after the last declaration; set 3 only on a correct no-arrest call.',
      'The cards shown may hold several arrests or none.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Suspects has the mathematical structure of the card game **SET**: 81 cards covering every combination of four features with three values, and the famous "all the same or all different" rule.' },
    { type: 'cards', items: [
      { title: 'Two cards fix the third', body: 'For any two cards there is exactly one card among the 81 completing them: where they match, the same value; where they differ, the remaining value. Pick two, picture the needed third, and look for it.' },
      { title: 'Twelve cards usually hold one', body: 'As SET players know, twelve cards rarely contain no set (the largest set-free collection is 20 cards). With nine cards it is much likelier, so in set 1 the no-arrest call is a real source of points.' },
      { title: 'No arrest after checking every pair', body: 'Nine cards make 36 pairs, twelve make 66; you need every pair’s third card to be absent. Remembering arrests already made cuts the work.' },
      { title: 'Vanishing cards', body: 'In set 3 cards disappear, so memory decides — and with bigger values, the better memory can turn the game.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Among 81 cards with four three-valued features, race to find three that are all the same or all different per feature — mathematically identical.', differs: 'It uses shape, colour, number and shading, and adds cards when no set is found; there is no "no set" scoring call.' },
    { name: 'Dobble (Spot It!)', players: '2–8', alike: 'A speed game of spotting what cards have in common faster than everyone else.', differs: 'You find the one shared symbol between two cards; there are no triples or no-set calls.' },
  ],
});
