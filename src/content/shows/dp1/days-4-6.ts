// 데블스 플랜 (season 1), days 4–6: 동물원, 양팔 저울, 땅따먹기, 히든 스테이지 블라인드 오목, 몽타주, 수식 하이 로우, 4인 3목.
import { day, dp1Game } from './shared';

export const zoo = dp1Game('zoo', 'main', day(4), [4], ['blackWhite', 'pointOmok', 'piggyBank'], {
  meta: {
    title: '동물원 규칙 — 데블스 플랜 시즌1 4일차 메인 매치, 덜 모인 쪽이 낙찰되는 타일 경매',
    description: '데블스 플랜 시즌1 4일차 메인 매치 동물원의 규칙을 정리했어요. 동물 카드 3장으로 정하는 조합과 개인 조건, 5×5판에 떨어뜨려 놓는 동물 타일, 크레딧이 적게 모인 그룹이 낙찰되는 경매, 승점과 피스까지.',
    keywords: ['동물원', '데블스 플랜 동물원', '데블스플랜 4일차', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '동물원 — 데블스 플랜 시즌1 4일차 메인 매치',
  name: '동물원',
  lead: '내가 정한 동물 세 마리의 순서를 5×5판 위에 한 줄로 만들어야 해요. 타일은 경매로 놓는데, 크레딧이 적게 모인 쪽 그룹이 낙찰되는 이상한 경매예요.',
  summary: '덜 인기 있는 그룹이 낙찰되는 경매로 동물 타일을 떨어뜨려 놓고, 숨긴 동물 조합을 판에 만드는 게임.',
  setup: [
    { type: 'list', items: [
      '**동물 카드**: 뱀·앵무새·코끼리·사자·원숭이 각 6장(30장). 각자 뒤집힌 카드 중 3장을 골라, 어떤 순서로 조합할지 정해 제출해요.',
      '**조건 카드**: 동물 카드의 숫자를 비교하는 내용으로 10장이 모두 달라요. 각자 1장.',
      '**공개**: 조합 카드 중 1장만 모두에게 공개하고, 나머지와 순서, 조건은 비공개예요.',
      '**크레딧**: 각자 30개. 딜러룸에 보관되어 남의 개수는 알 수 없고, 주고받을 수 없어요.',
      '**게임판**: 5×5. 타일은 위에서 떨어뜨려 아래 칸부터 쌓여요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타일 공개', body: '5라운드 동안 라운드마다 A·B 그룹(각각 다섯 동물 4개씩 20개)에서 4개씩, 모두 8개의 타일이 공개돼요.' },
      { title: '입찰', body: '한 명씩 딜러룸에서 A나 B 중 한 그룹에 1개 이상 입찰하고, 낙찰되면 타일을 어떻게 놓을지도 정해요. 입찰 순서는 정순과 역순을 번갈아요. 쓴 크레딧은 낙찰 여부와 상관없이 사라져요.' },
      { title: '낙찰', body: '**크레딧이 적게 모인 그룹**이 낙찰되고, 그 그룹에서 가장 많이 쓴 사람이 정한 배치대로 놓여요. 승자가 누구인지는 공개되지 않고, 사용된 크레딧 합계와 배치만 공개돼요.' },
      { title: '무효', body: '두 그룹의 합이 같거나, 낙찰 그룹의 최고 입찰이 동률이면 크레딧을 돌려주고 다시 경매해요. 낙찰되지 않은 타일은 빠져요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '게임판에 내 동물 조합이 가로·세로·대각선으로 순서대로(역방향 포함) 놓이면 조합 하나당 1점. 개인 조건을 이루면 점수가 2배예요.',
      '피스: 2점 이상 +1, 1점 0, 0점 −1. **단독 1위**는 3개를 더 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '동물 카드의 숫자와 조건 카드의 정확한 문구는 정리된 규칙에 모두 나와 있지 않아 적지 않았어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '동물원의 경매는 **많이 쓴 쪽이 이기지만, 많이 모인 그룹은 진다**는 이중 구조예요. 한 그룹에서 이기려면 그 그룹에 사람이 몰리지 않아야 해요.' },
    { type: 'cards', items: [
      { title: '소수 그룹의 다수', body: '이상적인 상황은 내가 고른 그룹에 크레딧이 적게 모이되, 그 안에서 내가 가장 많이 쓰는 것이에요. 남들이 반대 그룹에 많이 걸수록 내 그룹이 낙찰돼요. 그래서 원하는 타일이 다른 그룹에 있어도 일부러 반대쪽에 걸어 남의 경쟁을 키우는 수가 생겨요.' },
      { title: '떨어지는 타일', body: '타일은 위에서 떨어져 아래부터 쌓이니, 원하는 높이에 동물을 놓으려면 그 열이 어느 정도 찼는지 계산해야 해요. 남의 배치가 내 줄을 망칠 수도, 도울 수도 있어요.' },
      { title: '공개 카드 한 장', body: '조합 중 한 장이 공개되니, 남들은 그 동물이 들어간 줄을 노리는지 짐작할 수 있어요. 승자가 비공개라 누가 어떤 배치를 원했는지 추리하는 것도 다음 입찰의 단서예요.' },
    ], columns: 1 },
    { type: 'p', text: '경매 구조가 독특해 **우월 전략은 없어요.** 크레딧 30개를 다섯 라운드에 어떻게 나눌지, 그리고 반대 그룹의 인기를 얼마나 정확히 읽느냐가 핵심이에요.' },
  ],
  similar: [
    { name: '사목 (Connect Four)', players: '2명', alike: '칩을 위에서 떨어뜨려 아래부터 쌓고 한 줄을 만드는 방식이 같아요.', differs: '사목은 경매 없이 번갈아 칩을 넣어요.' },
    { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '비공개 입찰을 포함한 경매로 가치 있는 것을 사요.', differs: '모던 아트는 가장 많이 쓴 사람이 사고, 그룹 간 비교가 없어요.' },
  ],
}, {
  meta: {
    title: "Zoo rules — The Devil's Plan season 1, day 4 main match",
    description: "The rules of Zoo (동물원) from The Devil's Plan season 1: a secret three-animal combination and personal condition, tiles dropped into a 5×5 board, an auction where the group with fewer credits wins, and scoring and pieces.",
    keywords: ['Zoo', "The Devil's Plan season 1", '데블스 플랜 동물원'],
  },
  title: "Zoo — The Devil's Plan season 1, day 4 main match",
  name: 'Zoo (동물원)',
  lead: 'Line up your secret order of three animals on a 5×5 board. Tiles are placed by auction — and the group that attracted fewer credits is the one that wins.',
  summary: 'Drop animal tiles into a board through an auction won by the less popular group, building a hidden combination.',
  setup: [
    { type: 'list', items: [
      '**Animal cards**: snake, parrot, elephant, lion and monkey, six each (30). Each player picks three face down and decides their order.',
      '**Condition cards**: ten different comparisons of the animal cards’ numbers; one each.',
      '**Reveal**: one combination card is public; the rest, the order and the condition stay secret.',
      '**Credits**: 30 each, held by the dealer, unseen by others, not transferable.',
      '**Board**: 5×5; tiles drop from the top and stack from the bottom.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Tiles', body: 'Each of five rounds reveals four tiles from group A and four from group B (each group 20 tiles, four of each animal).' },
      { title: 'Bid', body: 'One at a time in the dealer room, bid at least one credit on A or B and say where its tiles would go if you win. The order alternates forwards and backwards; credits are spent either way.' },
      { title: 'Win', body: 'The group with **fewer credits in total** is sold, to its highest bidder, placed as they chose. The winner is not revealed; the credit totals and placement are.' },
      { title: 'Void', body: 'Equal group totals, or a tie for top bid in the winning group, refund the credits and rerun the auction. Unsold tiles are removed.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Each time your combination appears in order (either direction) across, down or diagonally scores 1; meeting your condition doubles the score.',
      'Pieces: 2+ points +1, 1 point none, 0 points −1; **sole first place** gets 3 more.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The animal cards’ numbers and the exact conditions are not fully recorded.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'The auction is double-edged: **the top bid wins, but the busier group loses**. To win a group, it must not be crowded.' },
    { type: 'cards', items: [
      { title: 'Top of the smaller group', body: 'The ideal is your group drawing few credits while you bid most within it, so others piling into the other group helps you; betting on the opposite group to inflate it is a real move.' },
      { title: 'Falling tiles', body: 'Tiles drop to the lowest free cell, so placing an animal at a height means counting how full the column is; others’ placements can break or build your lines.' },
      { title: 'One open card', body: 'Your public card hints at which lines you want, and with winners hidden, inferring who wanted which placement informs the next bid.' },
    ], columns: 1 },
    { type: 'p', text: 'The unusual auction leaves **no dominant strategy**; spreading 30 credits over five rounds and reading the other group’s popularity are the key skills.' },
  ],
  similar: [
    { name: 'Connect Four', players: '2', alike: 'Dropped pieces stack from the bottom to form lines.', differs: 'Players simply alternate, with no auction.' },
    { name: 'Modern Art', players: '3–5', alike: 'Auctions, including sealed bids, for valuable items.', differs: 'The highest bid always buys; no group comparison.' },
  ],
});

export const scaleGame = dp1Game('scale-game', 'prize', day(4), [4], ['equationTower', 'heavy13', 'magicswap'], {
  meta: {
    title: '양팔 저울 규칙 — 데블스 플랜 시즌1 4일차 상금 매치, 광물 무게를 알아내는 저울 퍼즐',
    description: '데블스 플랜 시즌1 4일차 상금 매치 양팔 저울의 규칙을 정리했어요. 세 방으로 나뉜 7명, 다섯 색 광물 2개씩(1–20g 자연수), 메인 저울과 보조 저울, 한 번에 2개 이상 올리기, 메인 저울 균형 뒤 피스를 걸고 무게 맞히기까지.',
    keywords: ['양팔 저울', '데블스 플랜 양팔 저울', '데블스플랜 상금 매치', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '양팔 저울 — 데블스 플랜 시즌1 4일차 상금 매치',
  name: '양팔 저울',
  lead: '다섯 가지 광물의 무게를 저울 결과만으로 알아내야 해요. 한 번 올린 광물은 내릴 수 없고, 다른 방 사람과는 말할 수 없어요.',
  summary: '누적되는 저울 결과로 다섯 광물의 무게를 풀고 메인 저울의 균형을 맞추는 협동 상금 매치.',
  setup: [
    { type: 'list', items: [
      '**인원**: 7명이 2·2·3명으로 세 공간(주방 1·4·6번, 정비실 2·5번, 딜러룸 3·7번)에 나뉘어요. 각 방에서 정한 순서는 전체에 공개돼요. 다른 방과는 끝날 때까지 소통할 수 없어요.',
      '**광물**: 빨강·노랑·초록·파랑·보라 각 2개씩 10개. 무게는 1–20g의 자연수예요. 시작할 때 한 색의 무게가 알려져요.',
      '**저울**: 균형을 맞춰야 하는 **메인 저울**과, 계산에만 쓰는 **보조 저울**.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '올리기', body: '내 차례에 5분 안에 광물을 2개 이상 저울에 올려요. 하나만 써도, 둘 다 써도 돼요. 결과는 모니터로 전체에 공개돼요.' },
      { title: '누적', body: '올린 광물은 회수할 수 없고 계속 쌓여요. 메인 저울 양쪽의 광물 구성이 똑같아지면 안 돼요.' },
      { title: '정답 선언', body: '내 차례에 메인 저울이 균형을 이루면, 피스 1개를 내고 모든 광물의 무게를 맞힐 수 있어요. 균형만 맞추고 선언하지 않아도 돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '균형을 맞추고 무게를 모두 맞히면 상금 1억 원이 쌓이고, 맞힌 사람은 피스 2개를 받아요.',
      '하나라도 틀리면 낸 피스는 돌려받지 못하고, 다른 방에는 오답이라는 사실만 알려진 채 계속해요.',
      '광물이 없거나 1개만 남은 사람은 더 올릴 수도, 선언할 수도 없어요. 모두 그렇게 되면 실패로 끝나요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '나무 큐브는 광물의 상징일 뿐, 실제 무게와는 관계가 없어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '양팔 저울은 **미지수 넷의 부등식 퍼즐**이에요(한 색의 무게는 처음에 알려져요). 저울 결과는 "왼쪽이 무겁다/가볍다/같다"뿐이라, 한 번의 측정으로 얻는 정보를 최대한 키워야 해요.' },
    { type: 'cards', items: [
      { title: '보조 저울로 측정, 메인 저울로 마무리', body: '보조 저울은 균형을 맞출 필요가 없으니 마음껏 비교에 쓰고, 메인 저울은 마지막에 균형을 만들 수 있도록 남겨 두는 것이 효율적이에요. 다만 광물이 누적되고 회수되지 않아, 측정에 쓴 광물은 나중의 균형 맞추기에 쓸 수 없어요.' },
      { title: '광물은 팀 전체의 예산', body: '각자 10개지만 한 번에 2개 이상 써야 하고, 1개가 남으면 끝이에요. 앞사람들의 측정 결과는 모두에게 보이지만 의도는 공유되지 않으니, 다른 방 사람이 무엇을 확인하려 했는지 결과로 짐작해야 해요.' },
      { title: '오답의 정보', body: '오답이 나왔다는 사실만 다른 방에 알려져요. 어떤 무게가 틀렸는지는 모르니, 오답 하나가 주는 정보는 작아요. 확실할 때만 피스를 걸어야 해요.' },
    ], columns: 1 },
    { type: 'p', text: '협동 퍼즐이라 **우월 전략은 없지만**, 이분 탐색처럼 후보 범위를 반씩 줄이는 비교를 설계하는 사람이 퍼즐을 빨리 끝내요.' },
  ],
  similar: [
    { name: '저울 퍼즐 (가짜 동전 찾기)', players: '1명', alike: '양팔 저울 비교만으로 무게 정보를 알아내는 고전 논리 퍼즐이에요.', differs: '가짜 동전 퍼즐은 무거운 것 하나를 찾는 문제이고, 협동이나 누적 제약이 없어요.' },
    { name: '마스터마인드 (Mastermind)', players: '2명', alike: '제한된 피드백으로 숨은 값을 좁혀 가는 추리예요.', differs: '마스터마인드는 색 배열을 맞혀요.' },
  ],
}, {
  meta: {
    title: "Scale Game rules — The Devil's Plan season 1, day 4 prize match",
    description: "The rules of the Scale Game (양팔 저울) from The Devil's Plan season 1: seven players in three rooms, two minerals of five colours (whole grams 1–20), a main and a spare balance, placing two or more at a time, and staking a piece to name every weight once the main scale balances.",
    keywords: ['Scale Game', "The Devil's Plan prize match", '데블스 플랜 양팔 저울'],
  },
  title: "Scale Game — The Devil's Plan season 1, day 4 prize match",
  name: 'Scale Game (양팔 저울)',
  lead: 'Work out the weights of five minerals from balance results alone. Nothing placed can be removed, and you cannot talk to the other rooms.',
  summary: 'A cooperative prize match: solve five weights from accumulating balance readings and level the main scale.',
  setup: [
    { type: 'list', items: [
      '**Players**: seven split 2, 2 and 3 into three rooms (kitchen 1, 4, 6; workshop 2, 5; dealer room 3, 7); each room’s order is public; no contact between rooms.',
      '**Minerals**: two each of red, yellow, green, blue and purple; whole grams from 1 to 20; one colour’s weight is given at the start.',
      '**Scales**: a **main** scale that must end level and a **spare** for measuring.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Place', body: 'On your turn, within 5 minutes, put at least two minerals on one or both scales; the result is shown to all.' },
      { title: 'Accumulate', body: 'Placed minerals stay; the main scale’s two sides may not hold identical sets.' },
      { title: 'Declare', body: 'If the main scale is level on your turn, you may stake a piece and name every weight, or just leave it level.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Level and every weight right adds ₩100 million and earns the declarer 2 pieces.',
      'Any wrong weight loses the staked piece; the other rooms learn only that it was wrong, and play continues.',
      'Players with one or no minerals can neither place nor declare; if all reach that point, it fails.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'The wooden cubes are tokens; their real weight is irrelevant.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is **an inequality puzzle in four unknowns** (one colour is given). A scale only says heavier, lighter or level, so each weighing must carry as much information as possible.' },
    { type: 'cards', items: [
      { title: 'Measure on the spare, finish on the main', body: 'The spare need not balance, so use it freely, and keep the main scale able to level at the end; but placed minerals are gone, so those used for measuring cannot help balance later.' },
      { title: 'Minerals are a team budget', body: 'Ten each, at least two per turn, and one left means you are done. Everyone sees readings but not intentions, so infer what the other rooms were testing from results.' },
      { title: 'A wrong answer says little', body: 'Others learn only that it was wrong, not which weight, so stake a piece only when certain.' },
    ], columns: 1 },
    { type: 'p', text: 'It is cooperative with **no dominant strategy**, but whoever designs comparisons that halve the candidate ranges, binary-search style, finishes it fastest.' },
  ],
  similar: [
    { name: 'Balance puzzles (counterfeit coin)', players: '1', alike: 'Classic logic puzzles of learning weights from comparisons.', differs: 'They seek one odd coin, with no cooperation or accumulation.' },
    { name: 'Mastermind', players: '2', alike: 'Narrowing hidden values from limited feedback.', differs: 'You guess a colour sequence.' },
  ],
});

export const layingGrass = dp1Game('laying-grass', 'main', day(5), [5], ['hexagon', 'wallgo', 'colorlink'], {
  meta: {
    title: '땅따먹기 규칙 — 데블스 플랜 시즌1 5일차 메인 매치, 잔디 타일로 가장 큰 정사각형 만들기',
    description: '데블스 플랜 시즌1 5일차 메인 매치 땅따먹기의 규칙을 정리했어요. 30×30판, 순서가 정해진 잔디 타일 96개, 타일 바꾸기 쿠폰, 회전·뒤집기, 상대 영역과 맞닿기 금지, 쿠폰·피스·돌멩이·강탈 특수 칸, 가장 큰 정사각형 크기별 피스까지.',
    keywords: ['땅따먹기', '데블스 플랜 땅따먹기', '데블스플랜 5일차', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '땅따먹기 — 데블스 플랜 시즌1 5일차 메인 매치',
  name: '땅따먹기',
  lead: '정해진 순서로 나오는 잔디 타일을 내 땅에 붙여 영역을 넓혀요. 점수는 내 영역 안의 가장 큰 정사각형 하나로만 정해져요.',
  summary: '폴리오미노 잔디 타일로 영역을 넓혀 가장 큰 정사각형을 만드는 9라운드 게임.',
  setup: [
    { type: 'list', items: [
      '**게임판**: 30×30(900칸). 특수 칸이 곳곳에 있어요.',
      '**타일**: 잔디 타일 96개. 나오는 순서가 미리 정해져 있고 모양은 모두 공개돼요.',
      '**시작**: 각자 베이스 타일(1×1) 1개와 타일 바꾸기 쿠폰 1장. 쿠폰은 피스 1개로 더 살 수 있고, 주고받을 수 있어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '타일 가져가기', body: '9라운드 동안 차례마다 순서대로 다음 타일을 가져가요. 쿠폰을 내면 다음 5개 중 하나를 골라 가져갈 수 있고, 그 뒤의 타일부터 다음 사람에게 가요. 건너뛴 타일은 다른 타일이 모두 소모된 뒤에 나와요.' },
      { title: '놓기', body: '2분 안에 격자에 맞춰 놓아요(쿠폰을 쓰면 2분이 다시 시작돼요). 90°·180°·270° 회전과 뒤집기가 모두 돼요. 1라운드는 베이스 타일과, 그 뒤로는 내 영역과 한 면 이상 맞닿아야 해요.' },
      { title: '금지', body: '다른 타일 위에 겹치기, 상대 영역과 한 면이라도 맞닿기, 판 밖으로 나가기, 놓은 타일 옮기기는 안 돼요. 규칙대로 놓을 수 없거나 시간을 넘기면 타일은 빠져요.' },
      { title: '특수 칸', body: '특수 칸의 상하좌우 네 칸을 내 영역으로 둘러싸면 그 칸을 얻고 효과가 발동해요: 쿠폰 1장, 피스 1개, 돌멩이(1칸짜리 돌을 원하는 빈칸에 놓기), 강탈(상대 영역의 잔디 타일 하나를 빼앗아 내 영역에 놓기).' },
      { title: '마무리', body: '9라운드 뒤 피스 1개로 1칸짜리 타일을 사서 원하는 빈칸에 놓을 수 있어요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '내 영역 안에서 가장 큰 정사각형 크기로 피스가 바뀌어요: 2×2 −3, 3×3 −2, 4×4 −1, 5×5 0, 6×6 +1, 7×7 +2, 8×8 +3.',
      '정사각형이 가장 큰 사람은 3개를 더 받아요. 동률이면 나누고, 나눌 수 없으면 아무도 받지 못해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '돌멩이 타일과 맞닿게 잔디를 놓을 수 없어요. 내 차례에 피스 1개로 돌멩이를 없앨 수 있어요. 돌멩이를 둘러싸도 내 영역이 되지는 않아요.',
      '특수 칸은 한 번 발동하면 다시 쓸 수 없어요. 특수 칸을 쓰지 않고 타일로 덮어도 돼요.',
      '이 경기를 끝으로 감옥 수감이 없어졌어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '땅따먹기는 영역의 넓이가 아니라 **가장 큰 정사각형**을 겨뤄요. 넓게 퍼진 땅보다 빈틈없이 꽉 찬 사각형이 중요해요.' },
    { type: 'cards', items: [
      { title: '빈칸 하나가 사각형을 깬다', body: '8×8을 만들려면 64칸이 빈틈없이 차야 해요. 타일 모양이 정해져 있으니 마지막에 남는 구멍을 메울 타일이 오지 않을 수 있어요. 그래서 마지막 1칸 타일을 사는 규칙과, 다음 다섯 개 중 고르는 쿠폰이 결정적인 보험이 돼요.' },
      { title: '타일 순서는 공개 정보', body: '모든 타일의 순서가 공개되어 있으니, 내 차례에 어떤 타일이 올지 미리 계산할 수 있어요. 쿠폰을 쓰면 다음 사람들의 타일도 한 칸씩 밀리니, 쿠폰은 내 이익과 함께 남의 계획을 흔드는 도구예요.' },
      { title: '상대와 붙지 않기', body: '상대 영역과 맞닿게 놓을 수 없으니, 서로 가까이 붙으면 둘 다 성장할 공간을 잃어요. 강탈 칸과 돌멩이는 상대의 사각형 한가운데를 깨는 데 가장 효과적이에요.' },
    ], columns: 1 },
    { type: 'p', text: '**우월 전략은 없지만**, 처음부터 목표 크기의 사각형 테두리를 정해 두고 그 안을 채워 가는 계획이 안정적이에요. 넓게 뻗을수록 남과 부딪혀 사각형이 작아지기 쉬워요.' },
  ],
  similar: [
    { name: '패치워크 (Patchwork)', players: '2명', alike: '정해진 순서로 놓인 폴리오미노 조각을 골라 내 판을 빈틈없이 채워요. 빈칸이 벌점이 되는 것도 비슷해요.', differs: '패치워크는 단추(돈)와 시간 트랙으로 조각을 사요.' },
    { name: '블로커스 (Blokus)', players: '2–4명', alike: '폴리오미노 조각으로 판 위의 영역을 넓혀 가요.', differs: '블로커스는 자기 조각끼리 모서리로만 이어야 하고, 상대를 막는 것이 핵심이에요.' },
  ],
}, {
  meta: {
    title: "Laying Grass rules — The Devil's Plan season 1, day 5 main match",
    description: "The rules of Laying Grass (땅따먹기) from The Devil's Plan season 1: a 30×30 board, 96 grass tiles in a fixed order, tile-swap coupons, rotating and flipping, no touching rival territory, coupon, piece, stone and steal spaces, and pieces by the size of your largest square.",
    keywords: ['Laying Grass', "The Devil's Plan season 1", '데블스 플랜 땅따먹기'],
  },
  title: "Laying Grass — The Devil's Plan season 1, day 5 main match",
  name: 'Laying Grass (땅따먹기)',
  lead: 'Attach grass tiles that arrive in a fixed order to grow your territory. Only the largest square inside it counts.',
  summary: 'Nine rounds of growing territory with polyomino tiles to build the largest square.',
  setup: [
    { type: 'list', items: [
      '**Board**: 30×30 (900 cells) with special spaces.',
      '**Tiles**: 96 grass tiles in a preset order, all shapes visible.',
      '**Start**: a 1×1 base tile and one tile-swap coupon each; coupons cost a piece and can be traded.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Take', body: 'Over nine rounds, take the next tile in order. A coupon lets you choose any of the next five; the following player continues after your pick, and skipped tiles come only after all others.' },
      { title: 'Place', body: 'Within 2 minutes (restarted after a coupon), rotate or flip freely. Round 1 touches your base; later tiles must touch your territory on at least one side.' },
      { title: 'Forbidden', body: 'No overlaps, no side touching a rival’s territory, nothing off the board, no moving placed tiles; tiles that cannot legally be placed, or are late, are removed.' },
      { title: 'Specials', body: 'Enclose a special space’s four neighbours with your territory to claim it: a coupon, a piece, a stone (place a one-cell stone on any empty cell) or a steal (take a rival’s grass tile into your territory).' },
      { title: 'Finish', body: 'After round 9 you may buy one-cell tiles for a piece each and place them anywhere free.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Your largest square decides pieces: 2×2 −3, 3×3 −2, 4×4 −1, 5×5 none, 6×6 +1, 7×7 +2, 8×8 +3.',
      'The largest square earns 3 more; ties split them, and if they cannot be split, nobody gets them.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Grass cannot touch a stone; a piece removes one on your turn; enclosing a stone does not make it yours.',
      'Specials work once and may simply be covered.',
      'This was the last day with a prison.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'What counts is not area but **the largest solid square**: a compact block beats sprawling land.' },
    { type: 'cards', items: [
      { title: 'One hole breaks it', body: 'An 8×8 needs 64 cells with no gap, and the right tile for the last hole may never come; the one-cell purchase and the choose-from-five coupon are the crucial insurance.' },
      { title: 'The order is public', body: 'Every tile’s position in the queue is known, so you can foresee your tiles, and a coupon shifts everyone after you: it helps you and disrupts others.' },
      { title: 'Keep apart', body: 'You cannot touch rivals, so crowding each other stunts both; steals and stones are most effective in the middle of a rival’s square.' },
    ], columns: 1 },
    { type: 'p', text: '**There is no dominant strategy**, but marking out a target square early and filling it in is steadier than sprawling into rivals.' },
  ],
  similar: [
    { name: 'Patchwork', players: '2', alike: 'Pick polyomino pieces from a fixed sequence to fill your board without gaps.', differs: 'Pieces are bought with buttons on a time track.' },
    { name: 'Blokus', players: '2–4', alike: 'Grow territory with polyominoes.', differs: 'Your pieces connect only at corners, and blocking is central.' },
  ],
});

export const blindGomoku = dp1Game('blind-gomoku', 'hidden', { ko: '5·6일차 (비밀의 방)', en: 'Days 5–6 (secret room)' }, [5, 6], ['pointOmok', 'flipOmok', 'fourThree'], {
  meta: {
    title: '블라인드 오목 규칙 — 데블스 플랜 시즌1 히든 스테이지, 색이 섞인 돌로 두는 오목',
    description: '데블스 플랜 시즌1 히든 스테이지 블라인드 오목의 규칙을 정리했어요. 감옥의 비밀 금고와 비밀의 방, 모든 피스를 건 단판, 밑면만 다른 여러 색 돌, 같은 색으로 따라 두는 NPC, 자유 고모쿠 규칙, 그리고 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['블라인드 오목', '데블스 플랜 블라인드 오목', '데블스플랜 비밀의 방', '데블스플랜 히든 스테이지', '데블스플랜1'],
  },
  title: '블라인드 오목 — 데블스 플랜 시즌1 히든 스테이지',
  name: '블라인드 오목',
  lead: '돌의 윗면이 여러 색으로 칠해져 있어 누구의 돌인지 보이지 않는 오목이에요. 어떤 돌이 내 것이었는지는 기억으로만 알 수 있어요.',
  summary: '감옥 속 비밀의 방에서 모든 피스를 걸고 두는 단판 오목. 돌의 주인은 기억해야만 알아요.',
  setup: [
    { type: 'list', items: [
      '**도전자**: 감옥 수감자 중 하루에 한 명. 감옥에 숨겨진 비밀 금고를 열고 통로를 지나 비밀의 방에 들어가요.',
      '**대가**: 가진 피스를 모두 내고 도전해요.',
      '**돌**: 밑면을 뺀 모든 면이 빨강·주황·노랑·초록·파랑·보라·분홍 같은 색으로 칠해져 있어 흑백을 구분할 수 없어요.',
      '**상대**: NPC. 도전자가 직전에 쓴 돌과 같은 색의 돌로 두고, 수는 오목 AI가 정해요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '선공', body: '도전자가 흑(선공), NPC가 백(후공)이에요.' },
      { title: '착수', body: '도전자는 원하는 색의 돌을 골라 두고, NPC는 같은 색 돌로 응수해요.' },
      { title: '단판', body: '자유 고모쿠 규칙이라 33·44 같은 금수가 없고, 6목 이상도 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '이기면 낸 피스를 돌려받고 **피스 10개를 더** 받아요.',
      '지면 피스를 모두 잃고 탈락해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '속임수나 반칙을 쓰면 즉시 져요. 돌에 표시하기 같은 마킹은 허용되지 않는 것으로 보여요.',
      '제작진은 오목 AI를 가장 쉬운 난이도로 설정했다고 밝힌 것으로 정리돼 있어요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '블라인드 오목은 **오목 실력보다 기억 관리**의 게임이에요. 판 위의 돌은 다 보이지만 주인이 안 보이니, 위협을 놓치거나 상대 돌을 내 돌로 착각하는 순간 끝나요.' },
    { type: 'cards', items: [
      { title: '색을 기억의 도구로', body: 'NPC가 내 색을 따라 두니, 한 색은 "내 돌 하나 + 상대 돌 하나"의 쌍이 돼요. 공격 줄과 수비 지점에 서로 다른 색을 쓰는 식으로 색을 의미 있게 배치하면 외울 양이 줄어요. 같은 색을 계속 쓰면 오히려 구분이 어려워져요.' },
      { title: '짧게 끝내기', body: '수가 늘수록 기억해야 할 돌이 늘어나요. 선공의 이점을 살려 빠르게 위협을 연달아 만드는 공격적인 운영이 기억 부담을 줄이는 가장 좋은 방법이에요. 자유 고모쿠는 금수가 없어 흑의 공격이 특히 강해요.' },
    ], columns: 1 },
    { type: 'p', text: '자유 고모쿠는 이론상 흑이 이기는 게임으로 알려져 있지만, 사람이 기억에 의존하는 한 **우월 전략은 실제로 쓸 수 없어요.** 승패는 기억이 무너지기 전에 끝낼 수 있느냐에 달려 있어요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 블라인드 오목은 **15×15판**에서 둬요. 자유 고모쿠(장목도 승리)라는 점은 방송과 같아요.',
      '쓸 색의 개수(2–7가지)를 고를 수 있고, **매번 다른 색을 쓰게 하는 옵션**이 있어요.',
      '혼자 할 때 상대 AI는 난이도마다 **최근 몇 수만 기억**해요(쉬움 3수, 보통 8수, 어려움 36수). 가장 높은 "매우 어려움"은 판 전체를 기억하고 탐색 엔진으로 둬요. 방송의 NPC는 가장 쉬운 오목 AI로 정리돼 있어요.',
      '친구와 1:1 방을 만들어 사람끼리 둘 수도 있어요. 피스나 탈락은 없어요.',
    ] },
  ],
  similar: [
    { name: '오목 (고모쿠)', players: '2명', alike: '다섯 개를 한 줄로 먼저 놓는 바로 그 게임이에요.', differs: '보통의 오목은 흑백이 보여서 기억할 필요가 없어요.' },
    { name: '스트라테고 (Stratego)', players: '2명', alike: '보이지 않는 정보를 기억하고 추리하며 둬요.', differs: '스트라테고는 상대 말의 계급이 숨겨진 전쟁 게임이에요.' },
  ],
}, {
  meta: {
    title: "Blind Gomoku rules — The Devil's Plan season 1 hidden stage",
    description: "The rules of Blind Gomoku (블라인드 오목) from The Devil's Plan season 1: the secret safe and secret room in the prison, a single game for all your pieces, stones of many colours that hide their owner, an NPC that answers in the same colour, free-style gomoku, and how the PUZZLTHINK version differs.",
    keywords: ['Blind Gomoku', "The Devil's Plan hidden stage", 'secret room', '데블스 플랜 블라인드 오목'],
  },
  title: "Blind Gomoku — The Devil's Plan season 1 hidden stage",
  name: 'Blind Gomoku (블라인드 오목)',
  lead: 'Gomoku with stones painted in many colours on top, so nobody can see whose stone is whose; only memory tells you which were yours.',
  summary: 'A single game of gomoku for all your pieces in the prison’s secret room, where stone owners must be remembered.',
  setup: [
    { type: 'list', items: [
      '**Challenger**: one prisoner per day, who opens a hidden safe in the prison and takes the passage to the secret room.',
      '**Stake**: all of your pieces.',
      '**Stones**: every face but the bottom is coloured (red, orange, yellow, green, blue, purple, pink…), hiding black and white.',
      '**Opponent**: an NPC that plays the same colour as your last stone, its moves chosen by a gomoku AI.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'First move', body: 'The challenger is black and moves first; the NPC is white.' },
      { title: 'Moves', body: 'Choose any colour; the NPC answers in that colour.' },
      { title: 'One game', body: 'Free-style gomoku: no forbidden 3-3 or 4-4, and six or more in a row wins.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'A win returns your pieces **plus 10 more**.',
      'A loss takes all your pieces and you are out.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Cheating or fouls lose at once; marking stones appears not to be allowed.',
      'The producers are reported to have set the AI to its easiest level.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Blind Gomoku is about **managing memory more than gomoku skill**: every stone is visible but not its owner, so missing a threat or mistaking a stone ends it.' },
    { type: 'cards', items: [
      { title: 'Colour as a memory aid', body: 'The NPC copies your colour, so each colour becomes a pair: one of yours, one of theirs. Giving colours meaning — one for attack lines, another for defensive points — cuts what you must remember; reusing one colour makes it harder.' },
      { title: 'Finish fast', body: 'Every move adds stones to remember, so pressing first-move advantage with consecutive threats is the best way to limit memory load; with no forbidden moves, black’s attack is strong.' },
    ], columns: 1 },
    { type: 'p', text: 'Free-style gomoku is known to be a first-player win in theory, but while you rely on memory **no dominant strategy is usable in practice**; it comes down to finishing before memory fails.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s Blind Gomoku uses a **15×15 board**; like the show it is free-style (overlines win).',
      'You can choose how many colours are in play (2–7) and **an option to force a new colour every move**.',
      'Solo, the AI **remembers only the last few moves** by level (easy 3, normal 8, hard 36); the top level, "very hard", remembers everything and uses a search engine. The broadcast NPC is reported to have used the easiest gomoku AI.',
      'You can also open a one-on-one room to play a friend; there are no pieces or eliminations.',
    ] },
  ],
  similar: [
    { name: 'Gomoku', players: '2', alike: 'Five in a row first: the same game.', differs: 'Stones show their colour, so nothing must be remembered.' },
    { name: 'Stratego', players: '2', alike: 'Play by remembering and deducing hidden information.', differs: 'Enemy ranks are hidden in a war game.' },
  ],
}, { id: 'blindGomoku', name: { ko: '블라인드 오목', en: 'Blind Gomoku' }, file: 'src/lib/blindGomoku.ts' });

export const montage = dp1Game('montage', 'prize', day(5), [5], ['nemoCount', 'gradation', 'hiddenWord'], {
  meta: {
    title: '몽타주 규칙 — 데블스 플랜 시즌1 5일차 상금 매치, 다시 나온 얼굴 찾기',
    description: '데블스 플랜 시즌1 5일차 상금 매치 몽타주의 규칙을 정리했어요. 3초마다 나오는 인물 사진, 이전에 나온 사진이 다시 나오면 버튼, 가장 빠른 사람의 피스, 오답 벌점, 벌점 10점이나 놓치면 실패, 5라운드까지.',
    keywords: ['몽타주', '데블스 플랜 몽타주', '데블스플랜 상금 매치', '데블스플랜 시즌1', '데블스플랜1'],
  },
  title: '몽타주 — 데블스 플랜 시즌1 5일차 상금 매치',
  name: '몽타주',
  lead: '3초마다 낯선 얼굴 사진이 한 장씩 나와요. 앞에서 나왔던 얼굴이 다시 나오면 버튼을 눌러야 해요.',
  summary: '연속으로 나오는 얼굴 사진 중 중복을 찾는 협동 기억 게임.',
  setup: [
    { type: 'list', items: [
      '**인원**: 감옥에 가지 않은 참가자. 각자 정답 버튼.',
      '**라운드**: 5라운드.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '사진', body: '3초 간격으로 각기 다른 인물 사진이 한 장씩 나와요.' },
      { title: '버튼', body: '이전에 나온 사진과 똑같은 사진이 나오면 정답 버튼을 눌러요. 한 명이라도 누르면 그 라운드는 성공이고, 가장 빨리 누른 사람이 피스 1개를 받아요.' },
      { title: '오답', body: '새로운 사진에 버튼을 누르면 벌점 1점이에요. 벌점을 받아도 그 라운드는 중복을 맞힐 때까지 계속돼요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '5라운드를 모두 성공하면 상금 1억 원이 쌓여요.',
      '누적 벌점이 10점이 되거나, 중복 사진에서 아무도 누르지 않으면 즉시 실패해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '라운드마다 사진이 몇 장 나오는지는 정리된 규칙에 나와 있지 않아요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '몽타주는 **놓치면 실패, 잘못 눌러도 벌점**이라는 두 가지 실수 사이의 균형이에요. 벌점은 10점까지 여유가 있지만, 놓침은 한 번이면 끝이에요.' },
    { type: 'cards', items: [
      { title: '벌점은 예산', body: '모두가 실패를 두려워하면 애매할 때 누르게 되고, 벌점이 쌓여요. 10점은 다섯 라운드에 걸친 공동 예산이라, 앞 라운드에서 다 써 버리면 뒤에서 확신이 없을 때 누를 수 없어요.' },
      { title: '피스가 만드는 경쟁', body: '가장 빨리 누른 사람만 피스를 받으니, 협동 게임인데도 서두르는 경쟁이 생겨요. 서두름은 벌점을 늘려요. 반대로 역할을 나눠(앞부분 담당, 뒷부분 담당) 기억하면 놓침을 줄일 수 있어요.' },
    ], columns: 1 },
    { type: 'p', text: '순수한 기억력 협동 게임이라 **우월 전략은 없어요.** 얼굴을 특징 하나(안경, 머리 모양)로 요약해 기억하는 방식이 빠른 판단에 도움이 돼요.' },
  ],
  similar: [
    { name: '메모리 (같은 그림 찾기)', players: '2명 이상', alike: '전에 본 그림을 기억해 같은 것을 찾아요.', differs: '메모리는 카드를 직접 뒤집고, 시간 압박이 없어요.' },
    { name: '도블 (Dobble / Spot It!)', players: '2–8명', alike: '같은 그림을 남보다 빨리 찾아 외치는 순발력 게임이에요.', differs: '도블은 두 카드에 동시에 있는 그림을 찾고, 기억이 필요 없어요.' },
  ],
}, {
  meta: {
    title: "Montage rules — The Devil's Plan season 1, day 5 prize match",
    description: "The rules of Montage (몽타주) from The Devil's Plan season 1: a new face photo every 3 seconds, pressing the button when one repeats, a piece for the fastest, penalties for false presses, failure at 10 penalties or a missed repeat, and five rounds.",
    keywords: ['Montage', "The Devil's Plan prize match", '데블스 플랜 몽타주'],
  },
  title: "Montage — The Devil's Plan season 1, day 5 prize match",
  name: 'Montage (몽타주)',
  lead: 'A stranger’s face appears every 3 seconds. When a face you have already seen comes back, hit the button.',
  summary: 'A cooperative memory game of spotting the repeated face.',
  setup: [
    { type: 'list', items: [
      '**Players**: everyone not in prison, each with a button.',
      '**Rounds**: five.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Photos', body: 'A different face photo appears every 3 seconds.' },
      { title: 'Button', body: 'When a photo identical to an earlier one appears, press. One press clears the round, and the fastest earns a piece.' },
      { title: 'False press', body: 'Pressing on a new face costs a penalty point; the round continues until the repeat is caught.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'Five rounds cleared adds ₩100 million.',
      'Ten penalty points, or a repeat nobody presses, fails it at once.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'How many photos each round shows is not in the written rules.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'Montage balances two errors: **a miss fails at once, a false press costs a point**. Ten points give slack; a miss gives none.' },
    { type: 'cards', items: [
      { title: 'Penalties are a budget', body: 'Fear of missing makes people press when unsure, and points pile up; ten points across five rounds is a shared budget, and spending it early leaves no room later.' },
      { title: 'Pieces create a race', body: 'Only the fastest earns a piece, so even this cooperative game rewards rushing, which costs penalties; splitting roles (early photos, late photos) reduces misses.' },
    ], columns: 1 },
    { type: 'p', text: 'It is pure cooperative memory with **no dominant strategy**; summarising each face by one feature (glasses, hair) helps quick judgements.' },
  ],
  similar: [
    { name: 'Memory (Concentration)', players: '2+', alike: 'Remember what you saw to find a match.', differs: 'You flip cards yourself, without time pressure.' },
    { name: 'Dobble / Spot It!', players: '2–8', alike: 'Race to spot a matching picture.', differs: 'The match is between two visible cards; no memory needed.' },
  ],
});

export const equationHighLow = dp1Game('equation-high-low', 'main', day(6), [6], ['twoSidedPoker', 'indianPoker', 'equationSignal'], {
  meta: {
    title: '수식 하이 로우 규칙 — 데블스 플랜 시즌1 6일차 메인 매치, 20과 1에 가까운 수식으로 하는 포커',
    description: '데블스 플랜 시즌1 6일차 메인 매치 수식 하이 로우의 규칙을 정리했어요. 피스를 칩으로 바꾸기, 기본 기호 +·−·÷, 금·은·동·흑 숫자 카드와 루트·곱하기, 히든 카드와 오픈 카드, 두 번의 베팅, 하이·로우·스윙, 동점 판정과 3인이 남을 때까지 탈락까지.',
    keywords: ['수식 하이 로우', '데블스 플랜 수식 하이 로우', '데블스플랜 6일차', '하이 로우 포커', '데블스플랜1'],
  },
  title: '수식 하이 로우 — 데블스 플랜 시즌1 6일차 메인 매치',
  name: '수식 하이 로우',
  lead: '받은 숫자와 기호 카드로 수식을 만들어, 20에 가까우면 하이, 1에 가까우면 로우에서 이겨요. 포커처럼 칩을 걸고, 칩을 모두 잃으면 탈락이에요.',
  summary: '수식의 결과로 하이(20)와 로우(1)를 겨루는 포커. 3명이 남을 때까지 탈락이 이어져요.',
  setup: [
    { type: 'list', items: [
      '**칩**: 가진 피스를 모두 1개당 칩 5개로 바꿔요.',
      '**기본 기호**: 각자 더하기·빼기·나누기 카드 1장씩.',
      '**덱 52장**: 금·은·동·흑 네 등급의 0–10 숫자 카드 44장(가치는 금 > 은 > 동 > 흑), 루트 4장, 곱하기 4장.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '히든 카드', body: '기본으로 칩 1개를 걸고 히든 카드 1장을 받아요. 기호가 나오면 공개적으로 반납하고 숫자가 나올 때까지 다시 받아요.' },
      { title: '오픈 카드 2장', body: '루트가 나오면 숫자를 1장 더 받아요. 곱하기가 나오면 더하기·곱하기·빼기 중 1장을 버리고 숫자를 1장 더 받아요. 추가로 뽑다 기호가 나오면 버리고 숫자가 나올 때까지 뽑아요.' },
      { title: '1차 베팅', body: '콜·레이즈·폴드, 선 플레이어는 체크도 돼요. 누군가 걸면 그 뒤로는 체크할 수 없어요. 최대 베팅은 칩이 가장 적은 사람의 보유량까지예요.' },
      { title: '마지막 카드', body: '오픈 카드를 1장 더 받고, 모든 카드를 써서 수식을 정한 뒤 최종 베팅을 해요. 루트는 숫자 하나에만 씌울 수 있어요. 수식은 90초 안에 내야 해요.' },
      { title: '선언', body: '하이(20에 가장 가까움), 로우(1에 가장 가까움), 스윙(둘 다) 중 하나를 마커로 정해요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '하이와 로우의 승자가 판돈을 절반씩 나누고, 나누고 남은 칩은 버려져요.',
      '**스윙**은 수식을 하나 공개한 뒤 다시 배열해 다른 수식을 공개해야 하고, 양쪽에서 모두 이겨야 해요. 한쪽이라도 지면 스윙을 이긴 사람이 판돈을 모두 가져가요.',
      '3명이 남을 때까지 계속하고, 칩을 모두 잃은 사람은 탈락해요. 남은 3명의 칩은 5개당 피스 1개로 바뀌고(남은 칩은 버려요), 4개 이하가 남아도 피스 1개는 받아요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '동점이면 하이에서는 가장 큰 숫자 카드가 높은 쪽, 로우에서는 가장 작은 숫자 카드가 낮은 쪽이 이기고, 숫자가 같으면 카드 등급으로 가려요.',
      '25라운드 이후에는 하이·로우 선택을 동시에 공개해요.',
      '90초 안에 수식을 못 내면 자동으로 져요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '수식 하이 로우는 하이로우 포커에 **계산의 자유**를 더했어요. 같은 카드로도 배열에 따라 20 근처와 1 근처를 모두 만들 수 있어서, 패의 강약이 카드보다 계산에 달려 있어요.' },
    { type: 'cards', items: [
      { title: '나누기와 빼기가 로우를 만든다', body: '기본 기호에 나누기가 있어서, 큰 수를 비슷한 수로 나누면 1에 가까운 값을 만들기 쉬워요. 반대로 20을 정확히 만드는 것은 카드 조합에 따라 어려울 수 있어요. 곱하기 카드는 하이를 크게 돕지만, 기본 기호 하나를 버려야 해요.' },
      { title: '스윙의 위험과 보상', body: '스윙은 같은 카드로 두 수식을 만들어야 해서 강한 패에서만 가능해요. 하지만 한쪽이라도 지면 상대가 판돈을 독차지하니, 스윙은 성공하면 판을 다 가져가고 실패하면 남에게 다 주는 극단적인 선택이에요.' },
      { title: '공개된 세 장', body: '오픈 카드는 모두에게 보이고 히든 카드 한 장만 숨겨져 있어요. 상대가 하이로 갈지 로우로 갈지를 오픈 카드로 짐작하고, 경쟁이 적은 쪽을 고르는 것이 기본이에요. 하이와 로우에 한 명씩만 가면 둘이 판돈을 나눠요.' },
    ], columns: 1 },
    { type: 'p', text: '포커와 마찬가지로 **우월 전략은 없어요.** 다만 최대 베팅이 가장 칩이 적은 사람의 보유량으로 묶여, 칩이 많은 사람이 적은 사람을 한 번에 몰아낼 수 없다는 점이 생존 싸움의 속도를 늦춰요.' },
  ],
  similar: [
    { name: '하이로우 포커 (세븐 카드 스터드 하이로우)', players: '2–8명', alike: '판돈을 가장 높은 패와 가장 낮은 패가 나눠 갖고, 양쪽을 모두 노리는 선언이 있어요.', differs: '포커는 족보로 겨루고, 수식을 만들지 않아요.' },
    { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자 카드로 목표 숫자에 맞는 식을 만들어요.', differs: '크립토는 베팅이 없는 계산 게임이에요.' },
  ],
}, {
  meta: {
    title: "Equation High-Low rules — The Devil's Plan season 1, day 6 main match",
    description: "The rules of Equation High-Low (수식 하이 로우) from The Devil's Plan season 1: pieces turned into chips, the basic +, − and ÷, gold to black number cards with roots and times, hidden and open cards, two betting rounds, high, low and swing, tie-breaks, and elimination until three remain.",
    keywords: ['Equation High-Low', "The Devil's Plan season 1", 'high-low poker', '데블스 플랜 수식 하이 로우'],
  },
  title: "Equation High-Low — The Devil's Plan season 1, day 6 main match",
  name: 'Equation High-Low (수식 하이 로우)',
  lead: 'Build an expression from your number and operator cards: closest to 20 wins high, closest to 1 wins low. Bet chips as in poker; lose them all and you are out.',
  summary: 'Poker where expressions compete for high (20) and low (1); eliminations continue until three remain.',
  setup: [
    { type: 'list', items: [
      '**Chips**: all your pieces become chips, five per piece.',
      '**Basic operators**: plus, minus and divide cards for everyone.',
      '**Deck of 52**: 44 number cards 0–10 in gold, silver, bronze and black (valued in that order), 4 roots and 4 times.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Hidden card', body: 'Ante one chip and receive a hidden card; an operator is returned face up and replaced until a number comes.' },
      { title: 'Two open cards', body: 'A root brings an extra number; times means discarding plus, times or minus and taking another number. Operators drawn as extras are discarded until a number comes.' },
      { title: 'First bets', body: 'Call, raise or fold; the first player may check until someone bets. The maximum bet is the smallest stack at the table.' },
      { title: 'Last card', body: 'One more open card, then arrange all cards into an expression (a root applies to one number) and bet again; the expression is due within 90 seconds.' },
      { title: 'Declare', body: 'Choose high (closest to 20), low (closest to 1) or swing (both) with a marker.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'The high and low winners split the pot; any odd chip is discarded.',
      'A **swing** must reveal one expression, then rearrange into another, and win both; failing either gives the whole pot to whoever beat it.',
      'Play continues until three remain; anyone out of chips is eliminated. The three convert chips at five per piece (remainder discarded), with at least one piece even on four chips or fewer.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Ties: in high, the larger top card wins; in low, the smaller lowest card; then card grade.',
      'From round 25, high/low choices are revealed simultaneously.',
      'No expression within 90 seconds is an automatic loss.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It is high-low poker with **freedom of calculation**: the same cards can be arranged near 20 or near 1, so hand strength depends on arithmetic as much as cards.' },
    { type: 'cards', items: [
      { title: 'Divide and subtract make lows', body: 'With divide always available, a large number over a similar one lands near 1, while hitting 20 exactly depends on the cards; times helps highs but costs a basic operator.' },
      { title: 'Swing: all or nothing', body: 'A swing needs two expressions from the same cards, so only strong hands try; losing either side hands the whole pot over.' },
      { title: 'Three open cards', body: 'Only one card is hidden, so read rivals’ open cards to guess high or low and choose the less contested side; one player on each side simply split.' },
    ], columns: 1 },
    { type: 'p', text: 'As in poker, **there is no dominant strategy**. Capping bets at the smallest stack stops big stacks knocking players out in one hand, slowing the survival fight.' },
  ],
  similar: [
    { name: 'High-low poker (seven-card stud hi-lo)', players: '2–8', alike: 'The pot splits between the best high and best low hands, with a declaration for both.', differs: 'Hands are poker rankings, not expressions.' },
    { name: 'Krypto', players: '1+', alike: 'Build expressions from number cards to hit a target.', differs: 'There is no betting.' },
  ],
});

export const fourThree = dp1Game('four-player-three-in-a-row', 'prize', day(6), [6], ['pointOmok', 'blindGomoku', 'flipOmok'], {
  meta: {
    title: '4인 3목 규칙 — 데블스 플랜 시즌1 6일차 상금 매치, 숨은 게스트를 막는 3층 삼목',
    description: '데블스 플랜 시즌1 6일차 상금 매치 4인 3목의 규칙을 정리했어요. 플레이어 3명과 정체를 숨긴 스페셜 게스트, 4×4판과 색별 말 5개, 새 말 놓기·말 옮기기, 3층까지 쌓기, 위에서 본 3목, 4라운드와 결승 진출, 그리고 PUZZLTHINK 버전과의 차이까지.',
    keywords: ['4인 3목', '4인3목', '데블스 플랜 4인 3목', '데블스플랜 상금 매치', '데블스플랜1'],
  },
  title: '4인 3목 — 데블스 플랜 시즌1 6일차 상금 매치',
  name: '4인 3목',
  lead: '네 사람이 4×4판에서 말을 놓거나 옮겨, 위에서 봤을 때 자기 색 세 개를 한 줄로 만들어요. 넷 중 한 명은 정체를 숨긴 게스트이고, 게스트가 이기면 상금 미션이 실패해요.',
  summary: '말을 3층까지 쌓을 수 있는 4인 삼목. 플레이어 셋은 게스트를 막으면서 서로 피스를 다퉈요.',
  setup: [
    { type: 'list', items: [
      '**인원**: 플레이어 3명과 정체를 모르는 **스페셜 게스트** 1명(규칙은 한 시간 전에 익혔어요). 모두 격리된 공간에서 소통 없이 해요.',
      '**게임판**: 4×4(16칸).',
      '**말**: 빨강·노랑·초록·파랑 중 한 색을 5개씩.',
      '**순서**: 빨강–노랑–초록–파랑. 라운드마다 정해진 기준으로 순서가 바뀌어요.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: '새 말 놓기', body: '90초 안에 새 말 하나를 아무 칸에나 놓아요. 다른 말 위에도 쌓을 수 있지만 한 칸은 3층까지예요.' },
      { title: '말 옮기기', body: '또는 맨 위층에 있는 내 말 하나를 이웃한 8칸 중 하나로 옮겨요. 한 번에 하나만 옮길 수 있어요.' },
      { title: '패스', body: '어떤 칸도 4층이 될 수 없어요. 놓을 수도 옮길 수도 없으면 패스해요.' },
      { title: '3목', body: '위에서 봤을 때 같은 색 말 3개가 가로·세로·대각선으로 이어지면 그 사람이 라운드를 이겨요.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      '4라운드 모두 플레이어가 이기면 상금 1억 원이 쌓여요. 게스트가 한 라운드라도 이기면(공동 승리 포함) 실패예요.',
      '라운드 승자는 피스 3개를 받아요. 두 명 이상이 동시에 3목을 만들면 아무도 받지 못해요.',
      '4라운드 뒤 피스가 가장 많은 두 명이 결승에 나가요. 동률이면 동점자끼리 연장전을 해요.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      '옮기기는 맨 위층의 내 말만 할 수 있어요. 내 말이 위에 두세 층 쌓여 있어도 맨 위 하나만 옮겨요.',
    ] },
  ],
  analysis: [
    { type: 'p', text: '4인 3목은 **협력과 경쟁이 동시에** 있어요. 플레이어 셋은 게스트를 막아야 하지만, 결승 진출을 두고 서로의 3목도 막고 싶어요.' },
    { type: 'cards', items: [
      { title: '덮기가 가장 강한 수비', body: '말을 쌓을 수 있으니, 상대의 줄을 막는 가장 확실한 방법은 그 말 위에 내 말을 얹는 거예요. 반대로 내 말이 덮이면 밑에서 사라진 것과 같아요. 3층 제한 때문에 이미 높이 쌓인 칸은 덮을 수 없는 안전지대가 돼요.' },
      { title: '소통 없는 협력', body: '모두 격리되어 있어, 누가 게스트인지 말로 맞춰 볼 수 없어요. 판 위의 수가 유일한 신호라, 남을 막지 않고 계속 자기 줄만 노리는 색이 게스트일 가능성이 높아요. 게스트를 막는 일은 결국 누군가 자기 차례를 희생해야 해요.' },
      { title: '동시 3목의 무효', body: '한 수로 두 색의 줄이 함께 생기면 아무도 피스를 받지 못해요. 그래서 남의 말을 옮겨 줄 수는 없어도, 남의 줄과 겹치게 내 줄을 만들어 상대의 승리를 무효로 만드는 수가 가능해요.' },
    ], columns: 1 },
    { type: 'p', text: '네 명이 두는 삼목이라 **우월 전략은 없어요.** 4×4판이 좁아 위협이 금방 생기니, 내 차례마다 "게스트의 위협 → 경쟁자의 위협 → 내 줄" 순서로 확인하는 습관이 기본이에요.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK 4인 3목은 판 크기, 말 5개, 3층 쌓기, 놓기·옮기기, 4라운드, 라운드 승리 피스 3개가 방송과 같아요.',
      '혼자 하면 나머지 세 자리를 AI가 맡고, 그중 한 자리가 스페셜 게스트예요. AI 플레이어들은 게스트를 막으면서도 서로 피스를 다투고, 게스트는 셋 모두를 상대로 둬요.',
      '라운드 순서는 빨강–노랑–초록–파랑에서 라운드마다 한 자리씩 늦게 시작해요(방송은 "정해진 기준"으로 바뀐다고만 알려져 있어요).',
      '한 수로 두 색 이상의 줄이 함께 보이면 그 라운드는 아무도 점수를 얻지 못해요. 또 사이트에서는 120수(패스 포함) 동안 줄이 안 나오면 라운드를 무승부로 끝내요.',
      '친구와 방을 만들어 사람끼리 할 수도 있어요.',
    ] },
  ],
  similar: [
    { name: '고블렛 고블러스 (Gobblet Gobblers)', players: '2명', alike: '말을 겹쳐 덮을 수 있는 삼목이에요. 덮인 말은 위의 말이 사라지기 전까지 힘이 없어요.', differs: '고블렛은 큰 말이 작은 말을 덮는 방식이고, 2인용이에요.' },
    { name: '오트리오 (Otrio)', players: '2–4명', alike: '4명까지 함께 하는 삼목 변형이에요.', differs: '오트리오는 크기가 다른 고리를 한 칸에 겹쳐 넣고, 말을 옮기지 않아요.' },
  ],
}, {
  meta: {
    title: "4 Player 3 in a Row rules — The Devil's Plan season 1, day 6 prize match",
    description: "The rules of 4 Player 3 in a Row (4인 3목) from The Devil's Plan season 1: three players and a hidden special guest, a 4×4 board and five pieces per colour, placing or moving, stacking up to three high, three in a row seen from above, four rounds and the final places, and how the PUZZLTHINK version differs.",
    keywords: ['4 Player 3 in a Row', "The Devil's Plan prize match", 'four-player tic-tac-toe', '데블스 플랜 4인 3목'],
  },
  title: "4 Player 3 in a Row — The Devil's Plan season 1, day 6 prize match",
  name: '4 Player 3 in a Row (4인 3목)',
  lead: 'Four players place or move pieces on a 4×4 board to show three of their colour in a row from above. One of the four is a hidden guest, and a guest win fails the prize mission.',
  summary: 'Four-player tic-tac-toe with stacking up to three high: three players block the guest while competing for pieces.',
  setup: [
    { type: 'list', items: [
      '**Players**: three contestants and an unknown **special guest** (who learned the rules an hour before), all isolated, no communication.',
      '**Board**: 4×4 (16 cells).',
      '**Pieces**: five each in red, yellow, green or blue.',
      '**Order**: red–yellow–green–blue, shifting each round by a set rule.',
    ] },
  ],
  flow: [
    { type: 'steps', items: [
      { title: 'Place', body: 'Within 90 seconds put a new piece on any cell, even on top of others, up to three high.' },
      { title: 'Move', body: 'Or move one of your pieces that is on top of its stack to one of the eight neighbouring cells, one piece at a time.' },
      { title: 'Pass', body: 'No cell may reach four; with no legal action you pass.' },
      { title: 'Three in a row', body: 'Three of one colour in a line, seen from above, wins the round.' },
    ] },
  ],
  win: [
    { type: 'list', items: [
      'If players win all four rounds, ₩100 million is added; a guest win in any round (shared wins included) fails it.',
      'A round winner gets 3 pieces; if two or more complete lines at once, nobody does.',
      'After four rounds the two with the most pieces reach the final; ties go to a play-off.',
    ] },
  ],
  exceptions: [
    { type: 'list', items: [
      'Only your top piece moves; a stack of your own pieces still moves one at a time.',
    ] },
  ],
  analysis: [
    { type: 'p', text: 'It mixes **cooperation and competition**: the three must stop the guest but also want to stop each other for the final places.' },
    { type: 'cards', items: [
      { title: 'Covering is the best defence', body: 'With stacking, the surest block is to put your piece on top of an enemy’s, which effectively removes it; the three-high limit makes tall stacks safe from covering.' },
      { title: 'Cooperation without words', body: 'Isolated players cannot agree who the guest is; the board is the only signal, and a colour that never blocks anyone is likely the guest. Someone must sacrifice turns to stop it.' },
      { title: 'Voiding by simultaneous lines', body: 'Two colours completing lines at once gives nobody pieces, so building your line to coincide with a rival’s can cancel their win.' },
    ], columns: 1 },
    { type: 'p', text: 'Four-way tic-tac-toe has **no dominant strategy**; on a cramped 4×4 board, checking "guest threats → rival threats → my line" every turn is the basic habit.' },
  ],
  siteDiff: [
    { type: 'list', items: [
      'PUZZLTHINK’s 4 Player 3 in a Row matches the board, five pieces, three-high stacking, place-or-move turns, four rounds and 3 pieces per round win.',
      'Solo, AI takes the other three seats, one of them the special guest; AI players block the guest while competing for pieces, and the guest plays against all three.',
      'Each round starts one seat later in the red–yellow–green–blue order (the show is known only to have changed order "by a set rule").',
      'If one move shows lines for two or more colours, nobody scores that round; the site also ends a round with no line after 120 actions (passes included) as a draw.',
      'You can open a room and play with friends.',
    ] },
  ],
  similar: [
    { name: 'Gobblet Gobblers', players: '2', alike: 'Tic-tac-toe where pieces can cover others, which are powerless until uncovered.', differs: 'Bigger pieces cover smaller ones, for two players.' },
    { name: 'Otrio', players: '2–4', alike: 'A tic-tac-toe variant for up to four.', differs: 'Rings of different sizes nest in a cell and never move.' },
  ],
}, { id: 'fourThree', name: { ko: '4인 3목', en: '4 Player 3 in a Row' }, file: 'src/lib/fourThree.ts' });
