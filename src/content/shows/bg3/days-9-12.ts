// 피의 게임3, days 9–12: 트라이13, 메모리30, 선과 악, 블랙 빌리지, 커트라인, 메모리 카운트, 아트경매, 믹스 앤 매치.
import { makeGame } from '../make';
import { bg3Game, broadcast, namuDay } from './shared';

export const try13 = bg3Game('try-13', 'money', '9', ['heavy13', 'hitStay', 'pointOmok'], {
  meta: {
    title: '트라이13 규칙 — 피의 게임3 9일차 머니 챌린지, 이웃과 합이 13을 넘지 않게',
    description: '피의 게임3 9일차 머니 챌린지 트라이13의 규칙을 정리했어요. 삼각형 12칸 게임판, 1–9 비밀 제출, 변이 맞닿은 이웃과의 합 13 이하면 득점·초과면 감점, 이웃 수를 곱하는 점수, 최하위가 정하는 다음 배치, 악귀 규칙까지.',
    keywords: ['트라이13', '트라이 13', '피의 게임3 트라이13', '피의게임3 머니 챌린지', '피의게임3'],
  },
  title: '트라이13 — 피의 게임3 9일차 머니 챌린지',
  name: '트라이13',
  lead: '삼각형 칸에 한 명씩 앉아 1–9 중 숫자를 몰래 내요. 이웃과의 합이 13 이하면 득점, 넘으면 감점이에요.',
  summary: '삼각형 판에서 이웃한 사람들과 합이 13을 넘지 않도록 숫자를 내고, 이웃 수를 곱해 점수를 얻는 12인 협상 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 12명 개인전.',
      '**판**: 삼각형 12개를 이어 붙인 판. 칸마다 변이 맞닿은 이웃의 수가 달라요.',
      '**라운드**: 5라운드. 1라운드 자리는 추첨이고, 배치는 공개되지 않아요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '제출 (30분)', body: '투표룸에서 1–9 중 숫자 하나를 몰래 내요.' },
      { title: '계산', body: '내 숫자와, **변이 맞닿은 이웃**들이 낸 숫자의 합을 구해요.' },
      { title: '점수', body: '합이 13 이하면 **내 숫자 × 내 이웃 수**만큼 점수를 얻고, 13을 넘으면 그만큼 잃어요.' },
      { title: '공개와 재배치', body: '라운드마다 점수를 얻은 사람 명단과 최하위 명단만 공개돼요(점수는 비공개). 2라운드부터는 **직전 라운드 최하위자가 모두의 자리를 정하고**, 배치는 공개돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**총점 1위가 우승**(면제권 2장, 2,000만 원), **하위 2명이 탈락 후보**예요. 탈락 후보는 한 명씩 지목하고, 투표로 한 명을 더해 1:1:1 데스매치를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '이 시점에는 숨은 역할 **"악귀"**가 있었어요. 악귀가 지목한 사람이 우승하면 악귀가, 우승하지 못하면 지목당한 사람이 차하위자 대신 탈락 후보가 되는 규칙이 따로 붙었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '트라이13은 **이웃 사이의 공유 예산** 게임이에요. 이웃이 많은 칸은 점수 배율이 크지만, 합을 13 안에 맞춰야 할 사람도 많아 감점 위험이 커요.' },
    { type: 'cards', items: [
      { title: '13을 나누는 협상', body: '이웃 셋이 있는 칸이라면 나와 세 이웃, 네 명이 합 13을 나눠 써야 해요. 모두가 3씩 내면 12로 안전하지만, 한 명이 크게 내면 모두가 감점이에요. 그런데 각 사람은 다른 이웃들과도 얽혀 있어서, 모두를 만족시키는 배분을 찾기 어려워요.' },
      { title: '배치를 정하는 꼴찌의 힘', body: '최하위자가 다음 배치를 정하므로, 꼴찌는 자기에게 유리한 이웃(믿을 만한 사람, 작은 수를 낼 사람)으로 주변을 채울 수 있어요. 꼴찌가 다음 라운드의 판을 짜는 구조라 역전이 쉬워요.' },
      { title: '결과만 보이는 정보', body: '누가 점수를 얻었는지만 공개되므로, 이웃이 약속을 지켰는지 알기 어려워요. "점수를 얻지 못했다"는 사실로 누가 크게 냈는지 추리해야 해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '동시에 낸 숫자가 정해진 한계를 넘기면 벌을 받는 눈치 게임이에요.', differs: '젝스 님트는 줄에 카드를 이어 붙이며, 이웃 관계가 없어요.' },
    { name: '디플로머시 (Diplomacy)', players: '2–7명', alike: '이웃과 약속을 맺은 뒤 명령을 동시에 비밀로 내고, 약속이 지켜졌는지는 결과로만 알 수 있어요.', differs: '디플로머시는 지도 위 영토 싸움이고, 숫자 합 제한이 없어요.' },
  ],
}, {
  meta: {
    title: 'Try 13 rules — The Bloody Game 3, day 9 money challenge',
    description: 'The rules of Try 13 from The Bloody Game 3: a board of twelve triangles, a secret number from 1 to 9, scoring if your sum with edge-adjacent neighbours stays at 13 or under and losing if over, points multiplied by neighbours, the last place arranging the next seating, and the demon rule.',
    keywords: ['Try 13', 'Bloody Game 3 money challenge'],
  },
  title: 'Try 13 — The Bloody Game 3, day 9 money challenge',
  name: 'Try 13',
  lead: 'Each player sits on a triangle and secretly picks 1–9. Keep the sum with your neighbours at 13 or under to score; go over and you lose.',
  summary: 'Twelve players pick numbers so that each neighbourhood stays at 13 or less, scoring their number times their neighbours.',
  setup: [
    { type: 'list', items: [
      '**Players**: twelve, individually.',
      '**Board**: twelve joined triangles; cells have different numbers of edge-adjacent neighbours.',
      '**Rounds**: five; round 1 seats are drawn and kept secret.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Submit (30 minutes)', body: 'Secretly hand in a number from 1 to 9.' },
      { title: 'Sum', body: 'Add your number to those of your **edge-adjacent neighbours**.' },
      { title: 'Score', body: '13 or less: gain **your number × your neighbour count**; over 13: lose it.' },
      { title: 'Reveal and reseat', body: 'Only who scored and who came last are announced (not the points). From round 2 **the last-placed player seats everyone**, publicly.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The top total wins** (two passes, ₩20 million); **the bottom two are candidates**, each names a player, and a vote adds one for a three-way death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'A hidden "demon" role was in play: if a demon’s target won, the demon became a candidate instead of 11th place; otherwise the target did.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Try 13 is **a shared neighbourhood budget**: more neighbours mean a bigger multiplier but more people who must stay within 13.' },
    { type: 'cards', items: [
      { title: 'Splitting thirteen', body: 'With three neighbours, four people share 13; all playing 3 is safe at 12, but one greedy number sinks everyone — and each is also tied to other neighbourhoods, so a split satisfying all is hard.' },
      { title: 'Last place seats the table', body: 'The bottom player picks everyone’s seats, surrounding themselves with trustworthy, low-number neighbours — an easy comeback.' },
      { title: 'Results only', body: 'Only scorers are named, so you must infer who broke a promise from who failed to score.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '6 nimmt!', players: '2–10', alike: 'Simultaneous numbers punished for crossing a limit.', differs: 'Cards extend rows; there are no neighbours.' },
    { name: 'Diplomacy', players: '2–7', alike: 'Make deals with neighbours, then submit secret simultaneous orders; whether promises held shows only in the result.', differs: 'It is territorial conquest on a map, with no sum limit.' },
  ],
});

export const memory30 = bg3Game('memory-30', 'death', '9', ['hiddenWord', 'blindGomoku', 'nemoCount'], {
  meta: {
    title: '메모리30 규칙 — 피의 게임3 9일차 데스매치, 명제 30개를 외우고 문제 풀기',
    description: '피의 게임3 9일차 데스매치 메모리30의 규칙을 정리했어요. 차례로 공개되는 명제 30개, 관련 문제 15개와 1–4 보기 카드 동시 제출, 정답 +1·오답 감점 없음, 2라운드와 동점 시 추가 10문제까지.',
    keywords: ['메모리30', '메모리 30', '피의 게임3 메모리30', '피의게임3 데스매치', '피의게임3'],
  },
  title: '메모리30 — 피의 게임3 9일차 데스매치',
  name: '메모리30',
  lead: '명제 30개가 차례로 지나가요. 그다음엔 그 명제들을 바탕으로 한 문제 15개에 보기 번호로 답해요.',
  summary: '명제 30개를 외운 뒤 그것을 이용한 문제 15개를 푸는 1:1:1 기억·추론 데스매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1:1.',
      '**카드**: 각자 답을 낼 1–4 숫자 카드.',
      '**라운드**: 2라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '명제', body: '명제 30개가 하나씩 공개돼요.' },
      { title: '문제', body: '명제와 관련된 문제 15개가 하나씩 나와요.' },
      { title: '답', body: '보기 번호의 카드를 몰래 내고 동시에 공개해요. 맞으면 1점, 틀려도 감점은 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '2라운드 뒤 **누적 1위**가 이겨요. 동률이면 추가 라운드 10문제를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '문제는 명제를 그대로 묻기보다, 명제들을 조합해 추론해야 풀리는 경우가 있어요(정리 자료 기준).',
    ] },
  ],
  analysis: [
    { type: 'p', text: '메모리30은 **암기 뒤에 추론**이 붙은 게임이에요. 명제를 낱낱이 외우는 것보다, 명제들 사이의 관계(누가 누구보다 크다, A면 B다)를 하나의 그림으로 정리해 두는 쪽이 문제에 강해요.' },
    { type: 'cards', items: [
      { title: '관계로 묶어 외우기', body: '30개의 문장을 따로 외우면 금방 섞여요. 같은 대상을 다루는 명제끼리 묶어 표나 순서도처럼 머릿속에 정리하면, 기억할 덩어리가 줄고 추론 문제도 풀 수 있어요.' },
      { title: '틀려도 감점이 없어요', body: '오답에 벌이 없으니 모르는 문제도 반드시 답을 내야 해요. 네 보기 중 하나라 찍어도 25%예요. 소거할 수 있는 보기를 지우면 확률이 더 올라가요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '타임라인 (Timeline)', players: '2–8명', alike: '여러 사실의 관계(순서)를 기억과 추론으로 맞히는 게임이에요.', differs: '타임라인은 사건 카드를 연대순으로 놓는 게임이고, 문장을 외우지 않아요.' },
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '여러 조건을 조합해 답을 추론해요.', differs: '피드백을 받으며 추리하고, 외워 둘 명제가 없어요.' },
  ],
  note: '명제와 문제의 내용은 적지 않았어요.',
}, {
  meta: {
    title: 'Memory 30 rules — The Bloody Game 3, day 9 death match',
    description: 'The rules of Memory 30 from The Bloody Game 3: thirty propositions shown in turn, fifteen related questions answered with 1–4 cards at once, +1 for right with no penalty for wrong, two rounds and ten extra questions on a tie.',
    keywords: ['Memory 30', 'Bloody Game 3 death match'],
  },
  title: 'Memory 30 — The Bloody Game 3, day 9 death match',
  name: 'Memory 30',
  lead: 'Thirty propositions go by one at a time. Then answer fifteen questions about them by option number.',
  summary: 'A three-way memory-and-reasoning death match: memorise thirty propositions, then answer fifteen questions.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1:1.',
      '**Cards**: numbers 1–4 each, for answering.',
      '**Rounds**: two.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Propositions', body: 'Thirty propositions are shown one by one.' },
      { title: 'Questions', body: 'Fifteen related questions follow.' },
      { title: 'Answers', body: 'Play the card for your option secretly; all reveal together. Right is +1, wrong costs nothing.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**The top total after two rounds** wins; a tie adds ten questions.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Some questions require combining propositions rather than recalling one (per the source).',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Memory 30 is **memory followed by inference**: organising the relations among propositions (who is bigger, if A then B) into one picture beats memorising sentences.' },
    { type: 'cards', items: [
      { title: 'Memorise relations', body: 'Thirty separate sentences blur; grouping those about the same subject into a mental table or chart cuts the load and enables inference.' },
      { title: 'No penalty means always answer', body: 'A blind guess is 25%; eliminating options raises it.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Timeline', players: '2–8', alike: 'Recall and reason about relations among facts (their order).', differs: 'You place event cards chronologically; nothing is memorised verbatim.' },
    { name: 'Mastermind', players: '2', alike: 'Combine conditions to infer an answer.', differs: 'You reason from feedback, not memorised statements.' },
  ],
  note: 'The propositions and questions are not reproduced.',
});

export const goodAndEvil = bg3Game('good-and-evil', 'money', '10', ['russianRoulette', 'piggyBank', 'heavy13'], {
  meta: {
    title: '선과 악 규칙 — 피의 게임3 10일차 머니 챌린지, 천사와 악마의 정체 숨기기',
    description: '피의 게임3 10일차 머니 챌린지 선과 악의 규칙을 정리했어요. 천사 6명(신·대천사)과 악마 4명(루시퍼), 대표자와 집행자 지명과 찬반 투표, 악행 20·선행 10 카드에서 한 장씩 버리기, 악행 적립 효과, 승리 조건과 신 지목까지.',
    keywords: ['선과 악', '피의 게임3 선과 악', '피의게임3 머니 챌린지', '시크릿 히틀러', '피의게임3'],
  },
  title: '선과 악 — 피의 게임3 10일차 머니 챌린지',
  name: '선과 악',
  lead: '천사와 악마가 숨어 있는 10명. 대표자와 집행자가 카드 세 장 중 하나씩 버려, 남은 한 장이 재판장에 쌓여요.',
  summary: '천사 6명과 악마 4명이 정체를 숨긴 채 선행·악행 카드를 쌓는 정체 숨김 게임. 시크릿 히틀러와 같은 구조예요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 10명. 추첨으로 순번과 역할을 정해요.',
      '**천사팀 (6)**: 신 1, 대천사 1, 천사 4. 대천사는 신이 누구인지 알아요.',
      '**악마팀 (4)**: 루시퍼 1, 악마 3. 서로의 정체를 알아요.',
      '**카드**: 악행 카드 20장과 선행 카드 10장을 섞은 더미.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '지명 (30분)', body: '순번에 따른 대표자 후보가 집행자 후보 한 명을 지목해요.' },
      { title: '찬반 투표', body: '모두가 찬성·반대를 내요. 과반이 찬성하면 두 사람이 당선되고, 과반이 반대하면 부결되어 다음 라운드로 넘어가요(네 번 연속 부결은 안 돼요).' },
      { title: '카드 고르기', body: '더미에서 세 장을 뽑아, 대표자가 혼자 투표룸에서 한 장을 버리고, 집행자가 혼자 남은 두 장 중 한 장을 버려요. 남은 한 장이 재판장에 쌓여요.' },
      { title: '악행의 효과', body: '악행 카드가 한 장 쌓일 때마다 신에게 악마 한 명의 정체가 공개돼요(루시퍼 제외). 네 번째 악행이 쌓이면 그 라운드 대표자가 한 명을 지목해 죽일 수 있고, 죽은 사람은 정체가 공개되고 격리돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**악행 5장**이 쌓이면 악마팀이 바로 이겨요.',
      '**선행 5장**이 쌓이면 천사팀이 이기지만, 그때 **악마팀이 신을 지목하면** 악마팀이 이겨요.',
      '이긴 팀은 모두 면제권 1장과 2,000만 원을 받고, 진 팀에서 탈락 후보 세 명이 나와 1:1:1 데스매치를 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '탈락 후보를 고르는 방식은 그날의 "악귀 심판" 결과와 악귀가 속한 팀의 승패에 따라 달라졌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '선과 악은 보드게임 **시크릿 히틀러**와 같은 뼈대예요. 카드가 악행 20장, 선행 10장이라, 천사가 대표자와 집행자가 돼도 악행이 쌓일 수 있어요. 그래서 "악행이 나왔다"가 곧 "악마가 있었다"는 증거가 아니에요.' },
    { type: 'cards', items: [
      { title: '세 장에 선행이 없을 확률', body: '30장 중 선행은 10장이라, 세 장을 뽑았을 때 선행이 하나도 없을 확률이 꽤 높아요(처음에는 약 28%). 천사 두 사람이 당선돼도 악행만 나와 어쩔 수 없이 악행을 쌓는 일이 생기고, 악마는 그 틈에 "나도 어쩔 수 없었다"고 숨을 수 있어요.' },
      { title: '신은 정보를 쥐지만 숨어야 해요', body: '악행이 쌓일수록 신은 악마를 알게 되지만, 그것을 너무 드러내면 악마가 신을 찾아내 마지막에 지목해요. 대천사는 신을 아니까 신을 보호하는 미끼가 될 수 있어요.' },
      { title: '네 번째 악행의 처형', body: '네 번째 악행 뒤 대표자는 한 명을 죽일 수 있어요. 천사팀 대표자라면 악마로 확신하는 사람을, 악마팀 대표자라면 신으로 보이는 사람을 노릴 거예요. 그래서 네 번째 악행 직전의 대표자 투표가 가장 중요해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '시크릿 히틀러 (Secret Hitler)', players: '5–10명', alike: '대표(대통령)가 수상을 지명하고 투표로 승인하면, 세 장 중 둘이 한 장씩 버려 정책을 쌓아요. 나쁜 정책이 더 많은 덱, 처형 능력, 숨은 지도자까지 같은 구조예요.', differs: '시크릿 히틀러는 숨은 히틀러가 수상이 되면 파시스트가 이겨요. 선과 악은 신을 맞혀야 해요.' },
    { name: '레지스탕스: 아발론 (Avalon)', players: '5–10명', alike: '착한 편의 핵심 인물(멀린)을 악한 편이 마지막에 맞히면 뒤집히는 규칙이 "신 지목"과 같아요.', differs: '아발론은 임무 팀을 꾸려 성공·실패 카드를 내요.' },
  ],
}, {
  meta: {
    title: 'Good and Evil rules — The Bloody Game 3, day 10 money challenge',
    description: 'The rules of Good and Evil from The Bloody Game 3: six angels (God, Archangel) and four devils (Lucifer), nominating a representative and executor and voting, discarding from three of 20 evil and 10 good cards, what evil cards unlock, and the win conditions including naming God.',
    keywords: ['Good and Evil', 'Bloody Game 3 money challenge', 'Secret Hitler-like'],
  },
  title: 'Good and Evil — The Bloody Game 3, day 10 money challenge',
  name: 'Good and Evil',
  lead: 'Angels and devils hide among ten players. A representative and an executor each discard one of three cards; the last goes to the court.',
  summary: 'A hidden-role game of six angels and four devils enacting good and evil cards — the same structure as Secret Hitler.',
  setup: [
    { type: 'list', items: [
      '**Players**: ten, order and roles drawn.',
      '**Angels (6)**: God, the Archangel (who knows God) and four angels.',
      '**Devils (4)**: Lucifer and three devils, who know each other.',
      '**Cards**: 20 evil and 10 good, shuffled.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Nominate (30 minutes)', body: 'The representative candidate in turn names an executor candidate.' },
      { title: 'Vote', body: 'Everyone votes for or against; a majority for elects them, a majority against passes to the next round (never four rejections in a row).' },
      { title: 'Cards', body: 'Three are drawn; the representative alone discards one, then the executor alone discards one of the other two; the last is placed in the court.' },
      { title: 'Evil effects', body: 'Each evil card reveals one devil (not Lucifer) to God. On the fourth, that round’s representative may kill a player, whose role is revealed and who is isolated.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '**Five evil cards**: the devils win at once.',
      '**Five good cards**: the angels win — unless **the devils then name God**, which wins for them.',
      'Winners each get a pass and ₩20 million; three of the losers go to a three-way death match.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How the candidates were chosen depended on that day’s "demon trial" and the demon’s team result.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Good and Evil shares the skeleton of **Secret Hitler**. With 20 evil to 10 good cards, two angels in office can still be forced to enact evil, so an evil card is not proof of a devil.' },
    { type: 'cards', items: [
      { title: 'Three cards with no good one', body: 'Ten of thirty are good, so a draw of three often holds none (about 28% at the start). Angels then must enact evil, and devils can hide behind "I had no choice".' },
      { title: 'God knows but must hide', body: 'Evil cards teach God the devils, but showing it lets the devils find and name God at the end. The Archangel, knowing God, can act as a decoy.' },
      { title: 'The fourth evil’s execution', body: 'The representative then kills someone: angels target a sure devil, devils a likely God. The vote just before the fourth evil card matters most.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Secret Hitler', players: '5–10', alike: 'A president nominates a chancellor, a vote approves, and from three policies each discards one; the deck favours bad policies, with executions and a hidden leader — the same structure.', differs: 'Fascists win if Hitler becomes chancellor; here devils must identify God.' },
    { name: 'The Resistance: Avalon', players: '5–10', alike: 'Evil wins at the end by naming good’s key figure (Merlin), like naming God.', differs: 'Teams go on missions and play success or fail cards.' },
  ],
});

export const blackVillage = makeGame({
  slug: 'black-village', kind: 'death', when: { ko: '10일차 · 결승 2라운드', en: 'Day 10 · final round 2' }, related: ['colorlink', 'wallgo', 'monorail'],
  sources: [namuDay('10'), namuDay('11-12'), broadcast],
  oneSource: { ko: '이 게임의 규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.', en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked were left out.' },
}, {
  meta: {
    title: '블랙 빌리지 규칙 — 피의 게임3 데스매치·결승, 땅과 길을 잇는 타일 게임',
    description: '피의 게임3 10일차 데스매치이자 결승 2라운드 블랙 빌리지의 규칙을 정리했어요. 타일 73장과 10분 암기, 선택 타일 6장과 미리보기 6장, 땅·길이 이어지게 배치, 숫자 말(1·1·1·2·2·3)로 영역 차지, 길 1점·땅 2점, 말 숫자 합으로 정하는 소유까지.',
    keywords: ['블랙 빌리지', '피의 게임3 블랙 빌리지', '피의게임3 결승', '카르카손 비슷한 게임', '피의게임3'],
  },
  title: '블랙 빌리지 — 피의 게임3 데스매치·결승',
  name: '블랙 빌리지',
  lead: '타일을 이어 땅과 길을 만들고, 내 말을 올려 영역을 차지해요. 영역이 완성되면 크기만큼 점수예요.',
  summary: '땅과 길이 그려진 타일을 이어 놓고 숫자 말로 영역을 차지하는 1:1:1 타일 배치 게임. 결승 2라운드에도 쓰였어요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 1:1:1(10일차 데스매치). 결승 2라운드에서도 같은 게임이 쓰였어요.',
      '**타일 73장**: 길(네 갈래, 세 갈래, 꺾인, 일자, 막힌)과 땅(1–4면, 분리·연결·터널·평행 등)이 섞인 18종. 시작 전 10분 동안 구성을 외울 시간이 있어요.',
      '**말**: 각자 1번 말 3개, 2번 말 2개, 3번 말 1개(숫자는 바닥에 적혀 있어요).',
      '**라운드**: 12라운드. 놓는 순서는 라운드마다 돌아가요(ABC → BCA → CAB).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타일 고르기', body: '라운드마다 고를 타일 6장과 다음 라운드 미리보기 6장이 공개돼요. 차례대로 남은 타일 중 하나를 골라요.' },
      { title: '배치', body: '이미 놓인 타일과 변이 맞닿게, 땅과 길의 모양이 이어지게 놓아요.' },
      { title: '말 놓기', body: '놓은 타일이 속한 땅이나 길 영역에 아직 주인이 없으면, 그 위에 내 말을 놓아 내 영역으로 만들 수 있어요.' },
      { title: '완성', body: '땅이 경계선으로 완전히 둘러싸이거나, 길의 양 끝이 시작점이나 땅으로 막히면 그 영역이 완성되고, 말은 주인에게 돌아가요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '완성된 **길은 타일 1장당 1점, 땅은 2점**이에요.',
      '12라운드 뒤 점수가 가장 높은 사람이 이겨요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '한 영역에 여러 사람의 말이 있으면 **말 바닥 숫자의 합**이 큰 사람이 점수를 받아요. 합이 같으면 모두 받아요.',
      '마지막 12라운드에는 미리보기가 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '블랙 빌리지는 보드게임 **카르카손**의 땅·길·일꾼 구조에, **숫자가 적힌 말**과 **공개된 타일 선택**을 더했어요. 운으로 타일을 뽑지 않으니, 남은 타일 구성을 외운 사람이 다음 수를 계획할 수 있어요.' },
    { type: 'cards', items: [
      { title: '숨은 숫자의 말', body: '말 숫자는 바닥에 있어서, 영역이 합쳐질 때 누가 이길지 끝까지 모를 수 있어요. 3번 말은 하나뿐이라 큰 땅의 소유를 다툴 때 결정적이에요. 반대로 1번 말을 미끼로 써서 상대의 3번 말을 끌어낼 수도 있어요.' },
      { title: '남의 영역에 끼어들기', body: '직접 말을 놓을 수 없는 남의 영역도, 내 영역을 그 옆에 만든 뒤 타일로 이어 붙이면 합쳐져요. 그러면 말 숫자 싸움이 되고, 이기면 남이 키운 땅을 가져와요.' },
      { title: '미리보기 6장', body: '다음 라운드의 6장이 보이므로, 이번에 어떤 타일을 가져가야 다음에 원하는 타일이 남을지 계산할 수 있어요. 3인이 돌아가며 고르니, 순서가 늦을 때를 대비해 가장 중요한 타일을 먼저 확보해야 해요.' },
      { title: '말이 묶이면 끝', body: '말은 영역이 완성돼야 돌아와요. 완성되기 어려운 큰 땅에 말을 다 묶으면 뒤에 쓸 말이 없어요. 작은 영역을 빨리 완성해 말을 회수하는 리듬도 필요해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '카르카손 (Carcassonne)', players: '2–5명', alike: '변이 맞게 타일을 이어 땅·길을 만들고, 일꾼을 올려 완성된 영역의 점수를 얻어요. 영역이 합쳐지면 일꾼이 많은 쪽이 가져가는 것도 같아요.', differs: '카르카손은 타일을 무작위로 한 장씩 뽑고, 일꾼에 숫자가 없어요.' },
      { name: '킹도미노 (Kingdomino)', players: '2–4명', alike: '공개된 타일 중에서 차례대로 골라, 다음 차례까지 계산하는 드래프트가 있어요.', differs: '킹도미노는 각자 자기 왕국을 만들고, 남의 영역과 겨루지 않아요.' },
  ],
  note: '타일 18종의 세부 개수는 옮기지 않았어요.',
}, {
  meta: {
    title: 'Black Village rules — The Bloody Game 3 death match and final',
    description: 'The rules of Black Village, a day-10 death match and the final’s second round of The Bloody Game 3: 73 tiles memorised in ten minutes, six choices and six previews, matching land and roads, numbered pieces (1,1,1,2,2,3) to claim areas, 1 point per road tile and 2 per land tile, and ownership by summed numbers.',
    keywords: ['Black Village', 'Bloody Game 3 final', 'Carcassonne-like game'],
  },
  title: 'Black Village — The Bloody Game 3 death match and final',
  name: 'Black Village',
  lead: 'Join tiles into land and roads, put your pieces on them, and score each area by its size when it is complete.',
  summary: 'A three-way tile game of joining land and roads and claiming areas with numbered pieces; also the final’s second round.',
  setup: [
    { type: 'list', items: [
      '**Players**: 1:1:1 (day-10 death match); the same game was the final’s second round.',
      '**73 tiles** of 18 kinds mixing roads (four-way, three-way, bends, straights, dead ends) and land (one to four sides, split, linked, tunnel, parallel…); ten minutes to memorise the mix.',
      '**Pieces**: three 1s, two 2s and one 3 each (numbers underneath).',
      '**Rounds**: twelve; placing order rotates (ABC, BCA, CAB…).',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Choose', body: 'Each round shows six tiles to choose from and six previews of the next round; take one in turn.' },
      { title: 'Place', body: 'It must touch an existing tile edge to edge with land and roads continuing.' },
      { title: 'Claim', body: 'If the land or road area it belongs to has no owner, you may put a piece there.' },
      { title: 'Complete', body: 'Land fully enclosed, or a road ending at the start or in land at both ends, is complete and its pieces return.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Completed **roads score 1 per tile, land 2**.',
      'After twelve rounds the highest score wins.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'With several players’ pieces in an area, **the higher sum of piece numbers** scores; equal sums all score.',
      'Round 12 has no preview.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Black Village takes **Carcassonne’s land, roads and followers** and adds **numbered pieces** and **open tile choice**. Nothing is drawn blind, so remembering the remaining tiles lets you plan.' },
    { type: 'cards', items: [
      { title: 'Hidden numbers', body: 'Numbers sit underneath, so a merged area’s winner can stay unknown to the end. The single 3 decides big land battles; a 1 can bait out an opponent’s 3.' },
      { title: 'Muscling in', body: 'You cannot claim someone’s area directly, but build your own beside it and connect them; then piece numbers decide, and you may take land they grew.' },
      { title: 'Six previews', body: 'Seeing next round’s tiles lets you choose now so what you need remains; with three choosing in rotation, secure the key tile when you pick late.' },
      { title: 'Tied-up pieces', body: 'Pieces return only on completion; locking all of them into huge unfinished land leaves nothing later, so finishing small areas to recycle pieces matters.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Carcassonne', players: '2–5', alike: 'Join tiles into land and roads, place followers, score completed areas; merged areas go to the majority.', differs: 'Tiles are drawn at random one at a time and followers have no numbers.' },
    { name: 'Kingdomino', players: '2–4', alike: 'Pick in turn from revealed tiles, thinking about the next pick.', differs: 'Each builds a separate kingdom.' },
  ],
  note: 'The count of each of the 18 tile kinds is not reproduced.',
});

export const cutLine = bg3Game('cut-line', 'semi', '11-12', ['heavy13', 'hitStay', 'gradation'], {
  meta: {
    title: '커트라인 규칙 — 피의 게임3 파이널 인 스테이지 1차, 한계를 넘지 않게 카드 놓기',
    description: '피의 게임3 파이널 인 스테이지 1차 커트라인의 규칙을 정리했어요. 1–6 카드 두 벌과 코인 20개, 순서 결정권 입찰, 라운드마다 카드 3장(1장, 역순 2장), 등록 칸과 LIMIT이 정해진 슬롯 4개, 높은 숫자부터 등록, 규칙 카드 경쟁, 숫자와 다른 점수표까지.',
    keywords: ['커트라인', '피의 게임3 커트라인', '피의게임3 파이널', '피의게임3'],
  },
  title: '커트라인 — 피의 게임3 파이널 인 스테이지 1차',
  name: '커트라인',
  lead: '슬롯마다 한계 숫자(LIMIT)가 있어요. 큰 숫자부터 등록되는데, 한계를 넘기면 버려져요. 그리고 큰 숫자가 꼭 높은 점수는 아니에요.',
  summary: 'LIMIT이 정해진 슬롯 네 개에 카드를 몰래 놓고, 등록된 카드만큼 점수를 얻는 8인 개인전. 상위 2명이 결승에 먼저 가요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 8명 개인전. 상위 2명이 파이널 매치에 먼저 진출해요.',
      '**카드**: 각자 색으로 구분되는 1–6 카드 두 벌.',
      '**코인**: 각자 20개(보유 현황은 비공개).',
      '**라운드**: 3라운드. 라운드마다 슬롯 4개의 구성(등록 칸 수, LIMIT)이 달라요.',
    ] },
    { type: 'table', head: ['카드 숫자', '1', '2', '3', '4', '5', '6'], rows: [
      ['점수', '1', '4', '5', '6', '3', '2'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '순서 입찰', body: '라운드 전 투표룸에서 코인으로 순서 결정권을 비공개 입찰해요. 최고액이 그 라운드의 카드 제출 순서를 정해요(같으면 먼저 온 사람, 아무도 안 내면 추첨).' },
      { title: '규칙 카드', body: '입찰 뒤 규칙 카드를 한 장씩 무작위로 받아요. 카드를 놓을 때 원하는 슬롯에 코인과 함께 낼 수 있어요.' },
      { title: '카드 제출', body: '1차에는 순서대로 한 장, 2차에는 거꾸로 두 장을 뒷면으로 놓아요(차례마다 30분).' },
      { title: '등록', body: '모두 놓으면 공개해, 슬롯마다 **높은 숫자부터** 등록하고(같으면 먼저 놓인 카드), 합이 LIMIT을 넘게 하는 카드는 버리고 다음 카드로 넘어가요. 등록 칸 수를 채우면 끝이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '등록된 카드마다 위의 점수를 받아요. 3라운드 뒤 **1·2위가 결승**에 가요.',
      '공동 순위가 생기면 남은 코인 1개당 1점을 더해 가려요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '한 슬롯에 규칙 카드가 여러 장이면 **코인을 가장 많이 낸 규칙**만 적용되고, 나머지는 코인과 함께 사라져요. 적용된 규칙의 주인은 공개되지만 코인 수는 공개되지 않아요.',
      '규칙 카드 예: LIMIT ±3, 등록 칸 1 감소, 낮은 숫자부터 등록, 첫 6을 1로 바꾸기, 첫 카드 파기, 첫 6 파기, 제출자의 첫 카드 우선 등록.',
      '숫자 카드, 규칙 카드, 코인은 주고받을 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '커트라인의 함정은 **점수표**예요. 높은 숫자가 먼저 등록되지만, 점수는 4가 6점으로 가장 높고 6은 2점뿐이에요. 6은 자리만 차지하는 짐이 될 수 있어요.' },
    { type: 'cards', items: [
      { title: '6과 5는 남을 밀어내는 도구', body: '6은 점수는 낮지만 가장 먼저 등록되고 LIMIT을 크게 깎아요. 내 4를 넣고 싶은 슬롯에 남이 6을 넣으면 내 4가 밀려날 수 있어요. 반대로 내 6으로 남의 카드를 밀어내는 공격이 가능해요.' },
      { title: 'LIMIT 계산', body: '등록 칸 수와 LIMIT을 보면 "평균 몇까지 들어갈 수 있는지"가 나와요. 예를 들어 칸 5개에 LIMIT 12면 평균 2.4라, 큰 숫자는 대부분 버려지고 2·3이 살아남아요. 슬롯마다 어느 숫자가 살아남을지 계산하는 것이 첫 단계예요.' },
      { title: '역순 제출과 순서권', body: '1차는 순서대로, 2차는 거꾸로 두 장이라, 순서 결정권은 "나중에 보고 놓는" 이점을 사는 거예요. 규칙 카드는 슬롯 전체를 뒤집을 수 있어서, 남은 코인을 순서권과 규칙 중 어디에 쓸지가 승부예요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '젝스 님트 (6 nimmt!)', players: '2–10명', alike: '몰래 낸 카드가 숫자 순서로 처리되고, 줄의 한계를 넘기면 손해를 보는 구조예요.', differs: '젝스 님트는 한계를 넘긴 사람이 벌점 카드를 가져가요.' },
    { name: '로스트 시티 (Lost Cities)', players: '2명', alike: '카드를 낼 줄(색)을 고르고, 숫자의 크기와 점수 사이의 계산이 핵심이에요.', differs: '로스트 시티는 오름차순으로 쌓고, 한계 숫자가 없어요.' },
  ],
}, {
  meta: {
    title: 'Cut Line rules — The Bloody Game 3, Final In Stage 1',
    description: 'The rules of Cut Line, the first Final In Stage game of The Bloody Game 3: two sets of 1–6 and 20 coins, bidding for turn order, three cards a round (one, then two in reverse), four slots with places and a LIMIT, highest cards registered first, competing rule cards, and a score table unlike the numbers.',
    keywords: ['Cut Line', 'Bloody Game 3 final stage'],
  },
  title: 'Cut Line — The Bloody Game 3, Final In Stage 1',
  name: 'Cut Line',
  lead: 'Every slot has a LIMIT. The highest cards register first, and any card pushing past the limit is thrown out — and high numbers are not high scores.',
  summary: 'Eight players secretly place cards into four slots with limits, scoring the cards that register; the top two reach the final.',
  setup: [
    { type: 'list', items: [
      '**Players**: eight; the top two advance to the final.',
      '**Cards**: two sets of 1–6 each, marked by colour.',
      '**Coins**: 20 each (holdings secret).',
      '**Rounds**: three, each with four slots of different places and LIMITs.',
    ] },
    { type: 'table', head: ['Card', '1', '2', '3', '4', '5', '6'], rows: [
      ['Points', '1', '4', '5', '6', '3', '2'],
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Order bid', body: 'Before each round bid coins secretly in the voting room; the top bid sets the submission order (ties to the earlier visitor; no bids, a draw).' },
      { title: 'Rule cards', body: 'Each player then gets a random rule card, which may be played on any slot with coins when placing.' },
      { title: 'Placing', body: 'First one card each in order, then two each in reverse order, face down (30 minutes per turn).' },
      { title: 'Registering', body: 'Cards are revealed; each slot registers **highest first** (ties to the earlier card), skipping any card that would exceed the LIMIT, until its places are full.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Registered cards score as in the table; after three rounds **the top two reach the final**.',
      'Ties add one point per coin left.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Several rule cards on one slot: only **the one backed by most coins** applies; the rest are lost with their coins. The applied rule’s owner is announced, not the coins.',
      'Examples: LIMIT ±3, one fewer place, lowest first, the first 6 becomes 1, destroy the first card, destroy the first 6, register the rule owner’s first card first.',
      'Cards and coins cannot be transferred.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The trap is **the score table**: higher cards register first, but 4 scores most (6) and 6 only 2 — a 6 can be dead weight.' },
    { type: 'cards', items: [
      { title: '6s and 5s push others out', body: 'A 6 scores little but registers first and eats the LIMIT, bumping cards like your 4 — or theirs, if you play it.' },
      { title: 'Compute the LIMIT', body: 'Places and LIMIT give an average: five places at 12 is 2.4 each, so big cards are mostly discarded and 2s and 3s survive. Work out which numbers will survive in each slot first.' },
      { title: 'Order and rules', body: 'One card in order then two in reverse makes order rights a purchase of "seeing before placing"; rule cards can overturn a slot, so spending coins on order or rules is the choice.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '6 nimmt!', players: '2–10', alike: 'Secret cards resolved in number order, punished for overflowing a row.', differs: 'The overflowing player takes penalty cards.' },
    { name: 'Lost Cities', players: '2', alike: 'Choosing which line to play into and weighing number against points.', differs: 'Cards ascend and there is no limit.' },
  ],
});

export const memoryCount = bg3Game('memory-count', 'semi', '11-12', ['blindGomoku', 'nemoCount', 'equationTower'], {
  meta: {
    title: '메모리 카운트 규칙 — 피의 게임3 파이널 인 스테이지 2차, 100칸 암기 지목 대결',
    description: '피의 게임3 파이널 인 스테이지 2차 메모리 카운트의 규칙을 정리했어요. 자연수와 사칙연산이 적힌 10×10 판 10분 암기, 다른 사람과 좌표를 지목해 묻기, 30초 답과 오답 −1, 지목한 사람의 대답 책임, 6라운드부터 더블 아이템, 종료 조건까지.',
    keywords: ['메모리 카운트', '피의 게임3 메모리 카운트', '피의게임3 파이널', '기억력 게임', '피의게임3'],
  },
  title: '메모리 카운트 — 피의 게임3 파이널 인 스테이지 2차',
  name: '메모리 카운트',
  lead: '100칸에 적힌 숫자와 식을 10분 동안 외워요. 그다음엔 서로를 지목해 "B7 칸은?" 하고 물어요.',
  summary: '10×10 판의 숫자·식을 외운 뒤 서로 좌표를 지목해 묻고 답하는 6인 기억력 대결. 상위 2명이 결승에 가요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 6명 개인전. 상위 2명이 파이널 매치에 가요.',
      '**판**: 10×10, 100칸. 칸마다 자연수나 사칙연산 식이 적혀 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '암기 (10분)', body: '판을 10분 동안 외워요. 끝나면 모든 칸이 빈칸으로 바뀌어요.' },
      { title: '지목', body: '차례가 되면 원하는 사람을 지목하고, 그 사람이 맞힐 칸의 좌표를 정해요. 이번 라운드에 나를 지목한 사람은 다시 지목할 수 없어요.' },
      { title: '대답 (30초)', body: '지목받은 사람이 그 칸의 값(식이면 계산한 값)을 말해요. 맞으면 칸이 공개되고, 틀리면 −1점이에요.' },
      { title: '책임', body: '지목받은 사람이 틀리면, **지목한 사람이 맞혀야** 해요. 맞으면 칸이 공개되고, 틀리면 −1점이에요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '100칸이 다 공개되거나, 더 지목받을 칸이 없는 사람이 생기면 끝나요.',
      '**누적 점수 상위 2명**이 결승에 가요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '각 라운드의 첫 순서는 자금이 가장 많은 사람이 정해요.',
      '6라운드부터 각자 한 번 **더블 아이템**을 써요. 맞으면 +1점(칸 공개), 틀리면 −2점이에요.',
      '한 칸에 대해 한 사람이 질문받을 수 있는 횟수는 최대 2번이고, 모두가 한 번씩 지목받으면 한 라운드가 끝나요.',
      '정리 자료만으로는 정답이 점수를 주는지(지목받은 사람 기준)가 분명하지 않아, 감점 규칙만 확실히 적었어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '메모리 카운트는 **남이 모르는 칸을 골라 묻는 공격**과 **내가 외운 칸을 지키는 수비**의 게임이에요. 감점이 핵심이라, 상대가 틀릴 칸을 고르는 것이 내 점수만큼 중요해요.' },
    { type: 'cards', items: [
      { title: '지목은 양날의 검', body: '지목받은 사람이 틀리면 지목한 사람이 대신 맞혀야 하고, 틀리면 나도 감점이에요. 그래서 "상대는 모르고 나는 아는 칸"을 골라야 해요. 내가 모르는 어려운 칸을 묻는 건 자해가 될 수 있어요.' },
      { title: '공개된 칸이 쌓일수록 쉬워져요', body: '맞힌 칸은 공개되므로, 시간이 갈수록 판의 빈칸이 줄고 남은 칸의 기억도 흐려져요. 초반에 외우기 쉬운 칸이 많이 공개되면, 후반에는 어려운 칸만 남아 오답이 늘어나요.' },
      { title: '10분 동안 무엇을 외울까', body: '100칸을 다 외우긴 어려우니, 특정 영역을 확실히 외우는 전략이 현실적이에요. 다른 사람이 어디를 외웠을지 추측해, 그 반대 영역의 칸으로 지목하는 것이 공격이에요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '판의 내용을 기억해 정확히 맞혀야 하는 기억력 게임이에요.', differs: '메모리는 짝 맞추기이고, 남을 지목하지 않아요.' },
    { name: '하나비 (Hanabi)', players: '2–5명', alike: '기억에 의존해 정확한 정보를 말해야 하고, 실수가 큰 손해로 이어져요.', differs: '하나비는 협력 게임이에요.' },
  ],
}, {
  meta: {
    title: 'Memory Count rules — The Bloody Game 3, Final In Stage 2',
    description: 'The rules of Memory Count, the second Final In Stage game of The Bloody Game 3: memorising a 10×10 board of numbers and operations for ten minutes, nominating a player and a coordinate, 30 seconds to answer and −1 for a miss, the nominator’s duty to answer, the double item from round 6, and the end conditions.',
    keywords: ['Memory Count', 'Bloody Game 3 final stage', 'memory game'],
  },
  title: 'Memory Count — The Bloody Game 3, Final In Stage 2',
  name: 'Memory Count',
  lead: 'Memorise the numbers and expressions on 100 cells in ten minutes. Then challenge each other: "what is in B7?"',
  summary: 'Six players memorise a 10×10 board and quiz each other by coordinate; the top two reach the final.',
  setup: [
    { type: 'list', items: [
      '**Players**: six; the top two advance.',
      '**Board**: 10×10, each cell a number or an arithmetic expression.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Memorise (ten minutes)', body: 'Then every cell is blanked.' },
      { title: 'Nominate', body: 'On your turn, choose a player and a coordinate for them — not someone who already nominated you this round.' },
      { title: 'Answer (30 seconds)', body: 'They give the cell’s value (computed, if an expression). Right reveals the cell; wrong costs a point.' },
      { title: 'Responsibility', body: 'If they miss, **the nominator must answer**; right reveals the cell, wrong costs a point.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'It ends when all 100 cells are revealed or someone has no cell left to be asked.',
      '**The top two totals** reach the final.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The richest player chooses each round’s first player.',
      'From round 6 each may use a **double** once: right +1 (cell revealed), wrong −2.',
      'A player may be asked about one cell at most twice, and a round ends once everyone has been nominated.',
      'Whether a correct answer itself scores is unclear from the source; only the penalties are stated with certainty.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Memory Count balances **attacking with cells others do not know** against **defending what you memorised**; with penalties central, choosing cells others will miss matters as much as your own recall.' },
    { type: 'cards', items: [
      { title: 'Nominating cuts both ways', body: 'If they miss, you must answer — and can lose a point yourself. Choose cells they do not know but you do; asking a cell you cannot answer is self-harm.' },
      { title: 'It gets harder', body: 'Revealed cells pile up, so easy cells go early and the hard ones remain, raising the error rate late.' },
      { title: 'What to memorise', body: 'Nobody holds 100 cells; securing one region is realistic. Guess others’ regions and attack from the opposite side.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '1+', alike: 'Recall a board exactly.', differs: 'It is pair matching, with no nominating.' },
    { name: 'Hanabi', players: '2–5', alike: 'Memory-dependent accuracy where mistakes are costly.', differs: 'It is cooperative.' },
  ],
});

export const artAuction = bg3Game('art-auction', 'final', '11-12', ['hiddenWord', 'blackWhite2', 'pointOmok'], {
  meta: {
    title: '아트경매 규칙 — 피의 게임3 결승 1라운드, 명화를 외우고 퀴즈로 낙찰받기',
    description: '피의 게임3 결승 1라운드 아트경매의 규칙을 정리했어요. 명화 30점 15분 암기, 자본금 3,000만 원, 가치와 키워드가 공개되는 10번의 경매, 최고 입찰자의 문제 풀이와 실패 시 다음 입찰자의 도전, 소유 작품 담보 입찰, 미참여 제한, 자산으로 정하는 우승까지.',
    keywords: ['아트경매', '아트 경매', '피의 게임3 아트경매', '피의게임3 결승', '피의게임3'],
  },
  title: '아트경매 — 피의 게임3 결승 1라운드',
  name: '아트경매',
  lead: '명화 30점을 외운 뒤 경매를 해요. 가장 높게 부른 사람이 그림에 대한 문제를 맞혀야 낙찰받고, 틀려도 돈은 나가요.',
  summary: '명화 정보를 외우고, 경매로 문제를 풀 권리를 사서 작품을 낙찰받는 4인 결승 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 4명.',
      '**암기 (15분)**: 전시실의 명화 30점에 대해 내용, 작품명, 작가, 연도를 외워요.',
      '**자본금**: 각자 3,000만 원.',
      '**경매**: 10라운드, 경매품 10점. 가치 총합은 2억 원이고, 가장 싼 작품은 500만 원이에요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '공개', body: '경매마다 경매품의 가치와 키워드가 공개돼요.' },
      { title: '입찰', body: '시작가는 가치의 10%이고, 앞사람보다 최소 10만 원 이상 올려 불러야 해요. 한 번 부른 값은 무를 수 없어요.' },
      { title: '문제', body: '가장 높게 부른 사람이 문제를 먼저 풀어요. 맞히면 부른 값을 내고 작품을 받아, 그 가치가 자산에 더해져요.' },
      { title: '실패', body: '틀려도 부른 값은 나가요. 그다음 높게 부른 사람 순서로 기회가 가고, 그 사람은 처음 틀린 사람의 금액으로 "도전"하거나 "취소"할 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '모든 경매가 끝나면 **남은 자본금 + 낙찰 작품 가치**가 가장 큰 사람이 이겨요.',
      '단, 낙찰받은 작품이 하나도 없으면 우승할 수 없어요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '자본금이 모자라면 가진 작품을 **담보**로 걸 수 있어요(작품 전체 가치로 입찰, 담보와 현금은 같이 못 써요). 여러 명이 담보로 걸면 가치가 높은 담보부터 기회가 가요.',
      '담보로 맞히면 담보 작품은 회수되고, 담보 가치가 낙찰 작품보다 크면 차액을 자본금으로 받아요. 틀려도 담보는 회수돼요. 처음 틀린 사람이 담보로 걸었다면 다음 사람은 반드시 도전해야 해요.',
      '경매에 참여하지 않는 건 누적 3라운드까지만 돼요. 그 뒤 돈과 담보가 없으면 남은 경매에 참여할 수 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '아트경매는 **지식(기억)의 확신도를 돈으로 거는** 게임이에요. 문제를 맞힐 자신이 있는 만큼만 불러야 하고, 상대가 그 작품을 얼마나 잘 아는지도 읽어야 해요.' },
    { type: 'cards', items: [
      { title: '가치보다 싸게, 확실할 때만', body: '작품 가치보다 싸게 낙찰받아야 자산이 늘어요. 시작가가 가치의 10%라 싸게 살 여지가 크지만, 틀리면 부른 값을 잃으므로 기대값은 "가치 × 정답 확률 − 입찰가"예요. 키워드를 보고 문제가 무엇일지 예상되는 작품에서 크게 부르는 게 맞아요.' },
      { title: '남의 실패에 올라타기', body: '최고 입찰자가 틀리면, 다음 사람은 그 사람이 부른 금액으로 도전할 수 있어요. 낮게 불러 두었다가 남이 틀린 문제를 받아 가는 길이 있어요.' },
      { title: '작품이 하나는 있어야', body: '자산이 많아도 작품이 없으면 우승할 수 없어요. 현금을 아끼는 전략만으로는 안 되고, 싼 작품이라도 하나는 꼭 낙찰받아야 해요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '그림을 경매로 사서 가치를 겨루는 미술 경매 게임이에요.', differs: '모던 아트는 플레이어가 그림을 팔고, 퀴즈가 없어요.' },
    { name: '트리비얼 퍼슈트 (Trivial Pursuit)', players: '2–6명', alike: '지식 문제를 맞혀야 보상을 얻는 퀴즈 보드게임이에요.', differs: '트리비얼 퍼슈트에는 경매가 없고, 분야별 조각을 모아요.' },
  ],
}, {
  meta: {
    title: 'Art Auction rules — The Bloody Game 3 final, round 1',
    description: 'The rules of Art Auction, the first round of The Bloody Game 3 final: memorising thirty paintings in fifteen minutes, ₩30 million each, ten auctions showing value and keywords, the top bidder’s question and the next bidder’s challenge, collateral bids with owned paintings, limits on sitting out, and winning on total assets.',
    keywords: ['Art Auction', 'Bloody Game 3 final'],
  },
  title: 'Art Auction — The Bloody Game 3 final, round 1',
  name: 'Art Auction',
  lead: 'Memorise thirty paintings, then auction. The top bidder must answer a question about the work to win it — and pays even when wrong.',
  summary: 'A four-player final game: memorise paintings, buy the right to answer at auction, and win works.',
  setup: [
    { type: 'list', items: [
      '**Players**: the four finalists.',
      '**Memorise (15 minutes)**: subject, title, artist and year of thirty paintings in the gallery.',
      '**Capital**: ₩30 million each.',
      '**Auctions**: ten lots worth ₩200 million in total; the cheapest is ₩5 million.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Reveal', body: 'Each lot’s value and keyword are shown.' },
      { title: 'Bid', body: 'Opening at 10% of value, each bid at least ₩100,000 above the last; bids cannot be withdrawn.' },
      { title: 'Question', body: 'The top bidder answers first; right pays the bid and adds the work’s value to their assets.' },
      { title: 'Failure', body: 'A wrong answer still pays. The next highest bidder may then "challenge" at the first bidder’s price or "cancel".' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'After all lots, **capital plus the value of works won** decides; highest wins.',
      'A player who won no work cannot win.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Short of cash, bid with an owned work as **collateral** at its full value (not mixed with cash); higher collateral goes first among collateral bidders.',
      'Winning with collateral returns the difference if it was worth more than the lot; collateral is forfeited either way, and if the first wrong bidder used collateral the next must challenge.',
      'Sitting out is allowed for three auctions in total; afterwards, with no money or collateral, you are out of the remaining auctions.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Art Auction prices **your confidence in what you remember**: bid only as far as you are sure, and read how well others know the work.' },
    { type: 'cards', items: [
      { title: 'Below value, and only when sure', body: 'Assets grow only by buying below value. Opening at 10% leaves room, but a miss loses the bid, so the expectation is value × chance − price. Bid big where the keyword tells you the question.' },
      { title: 'Ride on others’ failures', body: 'If the top bidder misses, the next may challenge at that price — a reason to sit second.' },
      { title: 'Own at least one', body: 'Without a work you cannot win, so cash-hoarding fails; secure even a cheap one.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'Modern Art', players: '3–5', alike: 'An art auction game of buying paintings for value.', differs: 'Players sell the paintings; there is no quiz.' },
    { name: 'Trivial Pursuit', players: '2–6', alike: 'Answer knowledge questions to earn rewards.', differs: 'No auctions; you collect wedges by category.' },
  ],
});

export const mixAndMatch = bg3Game('mix-and-match', 'final', '11-12', ['nonogram', 'blindGomoku', 'hiddenWord'], {
  meta: {
    title: '믹스 앤 매치 규칙 — 피의 게임3 결승 3라운드, 노란 선을 겹쳐 숫자 읽기',
    description: '피의 게임3 결승 3라운드 믹스 앤 매치의 규칙을 정리했어요. 3초 간격으로 나오는 노란 선 6장, 홀수 번째와 짝수 번째 세 장씩 겹치면 나타나는 디지털 숫자 두 개, 두 수의 합 답하기, 오답 10초 금지, 5라운드까지.',
    keywords: ['믹스 앤 매치', '피의 게임3 믹스 앤 매치', '피의게임3 결승', '피의게임3'],
  },
  title: '믹스 앤 매치 — 피의 게임3 결승 3라운드',
  name: '믹스 앤 매치',
  lead: '3초마다 노란 선이 한 장씩 지나가요. 홀수 번째 세 장과 짝수 번째 세 장을 각각 겹치면 디지털 숫자가 나와요. 두 수의 합을 외쳐요.',
  summary: '지나가는 노란 선 여섯 장을 머릿속에서 두 묶음으로 겹쳐 디지털 숫자 두 개를 읽고 합을 맞히는 4인 결승 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 결승 4명 개인전.',
      '**라운드**: 5라운드. 라운드마다 다른 위치의 노란 선이 3초 간격으로 6장 나와요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선 보기', body: '노란 선 6장이 차례로 지나가요.' },
      { title: '겹치기', body: '1·3·5번째 선이 한 숫자를, 2·4·6번째 선이 다른 숫자를 이뤄요. 숫자는 최대 두 자리예요.' },
      { title: '정답', body: '두 숫자를 모두 읽었으면 외치고 **두 수의 합**을 말해요. 맞으면 1점, 틀리면 10초 동안 답할 수 없어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['5라운드 뒤 점수가 높은 사람이 이겨요.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      '피의 게임X 데스매치 「믹스 앤 매치 Ⅱ」는 이 게임을 글자(단어)로 바꾼 버전이에요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '믹스 앤 매치는 **번갈아 지나가는 두 그림을 동시에 쌓아 가는** 기억 게임이에요. 한 장씩 보면 의미 없는 선이지만, 두 묶음을 따로 기억해 합쳐야 해요.' },
    { type: 'cards', items: [
      { title: '디지털 숫자의 구조', body: '디지털 숫자는 일곱 개의 막대로 이뤄져요. 어떤 막대가 켜졌는지만 기억하면 되고, 예를 들어 가운데 막대가 없으면 0·1·7 중 하나, 오른쪽 위가 없으면 5·6 중 하나처럼 후보가 빨리 좁혀져요.' },
      { title: '홀짝을 나눠 담기', body: '홀수 번째와 짝수 번째가 다른 숫자라, 두 개의 "머릿속 칠판"을 번갈아 쓰는 셈이에요. 하나만 확실히 읽고 나머지는 후보로 남겨 둔 뒤, 합의 후보가 하나로 좁혀지면 바로 외치는 것이 속도의 비결이에요.' },
      { title: '오답은 10초', body: '틀려도 점수를 잃지 않고 10초만 쉬어요. 경쟁자가 셋이라, 두 숫자 중 하나가 애매할 때 확률이 높은 답을 먼저 외쳐 보는 것도 계산된 선택이에요.' },
    ], columns: 1 },
  ],
  similar: [
    { name: '셋 (SET)', players: '1명 이상', alike: '빠르게 지나가는 시각 정보에서 패턴을 먼저 읽어 외치는 관찰 속도 게임이에요.', differs: '셋은 판이 계속 보이고, 기억할 필요가 없어요.' },
    { name: '메모리 (Concentration)', players: '1명 이상', alike: '잠깐 본 것을 기억해 맞히는 게임이에요.', differs: '메모리는 위치를 외우는 짝 맞추기예요.' },
  ],
}, {
  meta: {
    title: 'Mix and Match rules — The Bloody Game 3 final, round 3',
    description: 'The rules of Mix and Match, the third round of The Bloody Game 3 final: six yellow lines shown three seconds apart, odd and even frames overlaid into two digital numbers, answering their sum, a ten-second lockout for wrong answers, and five rounds.',
    keywords: ['Mix and Match', 'Bloody Game 3 final'],
  },
  title: 'Mix and Match — The Bloody Game 3 final, round 3',
  name: 'Mix and Match',
  lead: 'Yellow lines flash past every three seconds. Overlay the odd frames and the even frames to see two digital numbers, then call their sum.',
  summary: 'A four-player final game: mentally overlay six flashing frames into two digital numbers and call their sum.',
  setup: [
    { type: 'list', items: [
      '**Players**: the four finalists.',
      '**Rounds**: five; six frames of yellow lines, three seconds apart.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Watch', body: 'Six frames go by.' },
      { title: 'Overlay', body: 'Frames 1, 3 and 5 make one number; 2, 4 and 6 another (up to two digits each).' },
      { title: 'Answer', body: 'Call and give **the sum**: right is a point; wrong locks you out for ten seconds.' },
    ] },
  ],
  win: [
    { type: 'list', items: ['After five rounds the higher score wins.'] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The Bloody Game X death match Mix and Match II turned this into letters and words.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Mix and Match is **building two pictures at once from alternating frames**: each frame is meaningless lines until you combine its set.' },
    { type: 'cards', items: [
      { title: 'Seven segments', body: 'A digital digit is seven bars; remember which are lit. No middle bar narrows it to 0, 1 or 7; no top-right bar to 5 or 6.' },
      { title: 'Two mental boards', body: 'Odd and even frames build different numbers, so alternate two mental boards; read one surely, keep candidates for the other, and call as soon as the sum is unique.' },
      { title: 'A miss costs ten seconds', body: 'No points lost, so with three rivals, calling the likelier answer when one digit is uncertain can be worth it.' },
    ], columns: 1 },
  ],
  similar: [
    { name: 'SET', players: '1+', alike: 'Read visual patterns faster than others and call out.', differs: 'The layout stays visible; nothing must be remembered.' },
    { name: 'Memory (Concentration)', players: '1+', alike: 'Recall what you glimpsed.', differs: 'It is about positions and pairs.' },
  ],
});
