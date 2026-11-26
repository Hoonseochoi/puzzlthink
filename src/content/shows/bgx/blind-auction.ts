import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'blind-auction',
  kind: 'money',
  when: { ko: '4일차', en: 'Day 4' },
  related: ['blackWhite2', 'pointOmok', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay('4'), broadcast],
  ko: {
    meta: {
      title: '블라인드 경매 규칙 — 피의 게임X 4일차 머니 챌린지, 가격 모르는 물건 경매',
      description: '피의 게임X 4일차 머니 챌린지 블라인드 경매의 규칙을 정리했어요. 물품 카드 22장과 이익·손해 카드, 숫자 큐브 11개 자금, 공개 입찰과 비공개 입찰, 세 번째 특수 카드로 끝나는 게임, 큐브 페널티와 데스매치까지.',
      keywords: ['블라인드 경매', '피의 게임X 블라인드 경매', '피의게임X 머니 챌린지', '경매 게임', '피의게임X'],
    },
    title: '블라인드 경매 — 피의 게임X 4일차 머니 챌린지',
    name: '블라인드 경매',
    lead: '물건의 값은 낙찰받은 팀만 알아요. 전체 총액 하나만 보고, 쪼갤 수 없는 숫자 큐브로 입찰해요.',
    summary: '가격이 숨겨진 물품을 숫자 큐브로 공개 입찰하고, 이익·손해 카드는 비공개로 겨루는 다섯 팀 경매.',
    setup: [
      { type: 'list', items: [
        '**인원**: 다섯 팀. 라운드마다 팀에서 한 명씩 정해진 순서로 나와요.',
        '**매물 카드 30장**: 물품 카드 22장(실제 물건 값을 바탕으로 가치가 매겨짐), 이익 카드 4장, 손해 카드 4장.',
        '**공개 정보**: 시작할 때 물품 카드 22장의 **가치 총액**만 공개돼요.',
        '**자금**: 팀마다 숫자 큐브 11개 — 1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 25.',
        '**순서**: 1라운드는 추첨 1번, 그 뒤로는 직전 낙찰자가 선이에요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '매물 공개', body: '매물 카드를 한 장 뽑아요. 종류에 따라 경매 방식이 달라요.' },
        { title: '물품 카드 — 공개 입찰', body: '선부터 돌아가며 앞사람보다 높게 부르거나 포기해요. 큐브 여러 개를 합쳐 낼 수 있고, 낸 큐브는 포기하기 전까지 돌려받지 못해요. 마지막까지 남은 팀이 낙찰받고, **그 팀만 물품의 가치를 확인**해요.' },
        { title: '특수 카드 — 비공개 입찰', body: '효과를 먼저 공개한 뒤, 선부터 투표룸에서 큐브를 1개 이상 몰래 내요. **이익 카드는 가장 많이 낸 팀**이, **손해 카드는 가장 적게 낸 팀**이 가져가요. 낸 큐브는 결과와 관계없이 돌려받지 못하고, 입찰가는 공개되지 않아요.' },
        { title: '진행 신호', body: '첫 번째 특수 카드 경매 뒤 히든 아이템이 공개되고, 두 번째 뒤에는 팀별 물품 총액의 순위가 공개돼요. **세 번째 특수 카드가 나오면** 경매 없이 게임이 끝나요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '팀이 가진 물품 카드 가치의 합으로 순위를 정해요.',
        '남은 큐브 액면가 합이 **가장 적은 팀**은 물품 총액의 50%를 잃어요.',
        '1위 팀은 팀 자금 5,000만 원을 받아요. **4·5위 팀은 팀원 전원이 데스매치**에 나가, 진 팀은 탈락하고 이긴 팀은 외부 생존지로 가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '진행 중 큐브를 모두 쓴 팀은 자동으로 5위예요.',
        '특수 카드 입찰이 동률이면 그 팀끼리 다시 입찰하고, 또 동률이면 이익 카드는 사라지고 손해 카드는 모든 팀에 적용돼요.',
        '아이템(팀 자금 2,000만 원): **숫자 큐브 5** 추가, **중간 가치 확인권**(가치가 11번째로 높은 물품의 이름과 가격 확인).',
      ] },
    ],
    analysis: [
      { type: 'p', text: '블라인드 경매는 **가치를 모르는 물건을 사는 경매**예요. 아는 건 22장의 총액뿐이라, 평균값(총액 ÷ 22)이 모든 판단의 출발점이 돼요.' },
      { type: 'cards', items: [
        { title: '평균과 중간값', body: '물건 값은 대개 몇 개의 비싼 물건이 총액을 끌어올리는 모양이라, 평균보다 중간값이 훨씬 낮을 가능성이 커요. "중간 가치 확인권"은 바로 이 차이를 알려 주는 아이템이에요. 중간값이 평균보다 크게 낮다면, 대부분의 물건은 싸고 비싼 몇 개를 맞히는 게임이 돼요.' },
        { title: '낙찰자만 아는 정보', body: '낙찰받은 팀만 가치를 보므로, 그 팀의 다음 행동이 정보가 돼요. 큰 물건을 낙찰받은 팀이 이후 소극적으로 변하면 좋은 물건을 얻었다는 신호일 수 있어요. 두 번째 특수 카드 뒤 공개되는 순위가 이 추리를 확인해 줘요.' },
        { title: '큐브는 쪼갤 수 없는 돈', body: '큐브 액면은 정해져 있어서, 원하는 금액을 정확히 만들지 못하면 더 많이 내야 해요. 또 남은 큐브 합이 가장 적으면 물품 가치의 절반을 잃으므로, 다 쓰는 것도 위험해요. 마지막까지 큐브를 남기는 것이 곧 방어예요.' },
        { title: '손해 카드는 "적게 내기" 경쟁', body: '손해 카드는 가장 적게 낸 팀이 가져가므로, 피하려면 남보다 조금 더 내야 하는데 그 큐브는 사라져요. 모두가 1만 내면 동률 재입찰이 되고, 또 비기면 모두에게 적용돼요. 손해의 크기와 큐브 비용을 비교해, 일부러 받는 선택도 있어요.' },
        { title: '끝나는 시점을 세세요', body: '특수 카드 8장 중 세 번째가 나오면 끝나므로, 경매가 몇 번 남았는지 아무도 몰라요. 남은 물품이 많을 거라 믿고 아끼다가 갑자기 끝날 수 있어서, 좋은 물건은 일찍 확보하는 편이 안전해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '쪼갤 수 없는 돈 카드로 입찰하고, 손해 카드는 "가장 적게 낸 쪽이 가져가는" 반대 경매로 진행해요. 끝에 남은 돈이 가장 적은 사람이 큰 벌을 받는 것도 같아요.', differs: '하이 소사이어티는 물건의 가치가 공개되고, 남은 돈이 가장 적으면 아예 탈락해요. 특정 카드가 네 번째로 나오면 끝나요.' },
      { name: '포 세일 (For Sale)', players: '3–6명', alike: '한정된 자금으로 연속 경매를 하고, 일찍 포기하면 손해를 줄이는 구조예요.', differs: '포 세일의 건물 가치는 공개된 숫자예요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 물품 목록과 특수 카드의 효과, 히든 아이템은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Blind Auction rules — The Bloody Game X, day 4 money challenge',
      description: 'The rules of Blind Auction from The Bloody Game X (피의 게임X): 22 item cards of hidden value plus gain and loss cards, eleven number cubes as money, open bidding and sealed bids, the end on the third special card, the cube penalty and the death match.',
      keywords: ['Blind Auction', 'Bloody Game X Blind Auction', 'auction game', '피의 게임X'],
    },
    title: 'Blind Auction — The Bloody Game X, day 4 money challenge',
    name: 'Blind Auction',
    lead: 'Only the winning team learns what an item is worth. Bid from a single total, with number cubes that cannot be split.',
    summary: 'Five teams bid number cubes openly on items of hidden value, and sealed for gain and loss cards.',
    setup: [
      { type: 'list', items: [
        '**Players**: five teams, one representative per round in a set order.',
        '**30 cards**: 22 items (valued on real-world prices), 4 gain cards, 4 loss cards.',
        '**Public information**: only **the total value** of the 22 items.',
        '**Money**: eleven number cubes per team — 1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 25.',
        '**Order**: drawn for round 1; afterwards the last winner leads.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Draw a card', body: 'One card is drawn; its type decides the auction.' },
        { title: 'Items — open bidding', body: 'In turn, bid higher or drop out, combining cubes as needed; cubes stay committed until you drop. The last bidder wins and **only that team sees the item’s value**.' },
        { title: 'Special cards — sealed bids', body: 'The effect is shown, then each team secretly submits at least one cube. **The highest bid takes a gain card; the lowest takes a loss card.** Cubes are spent either way and bids stay secret.' },
        { title: 'Signals', body: 'After the first special auction a hidden item is revealed; after the second, teams’ item-value ranking is shown. **When the third special card appears**, the game ends without an auction.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Teams rank by the total value of their items.',
        'The team with **the lowest face value of cubes left** loses 50% of its item value.',
        'First place gets ₩50 million. **Every member of the 4th and 5th teams plays the death match**: the losing team is eliminated, the winner goes to the outdoor camp.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A team that runs out of cubes is automatically 5th.',
        'Tied special bids are rebid; tied again, a gain card is lost and a loss card hits every team.',
        'Items (₩20 million): an **extra 5 cube**, and a **median check** (name and price of the 11th most valuable item).',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Blind Auction is **buying without knowing the price**. All you know is the total, so the average (total ÷ 22) is where every judgement starts.' },
      { type: 'cards', items: [
        { title: 'Mean versus median', body: 'Prices usually have a few expensive items pulling the total up, so the median is probably far below the mean. The median check reveals exactly that gap; if it is large, most items are cheap and the game is about spotting the few expensive ones.' },
        { title: 'What only the winner knows', body: 'Only the winning team sees a value, so its behaviour afterwards is information: a team that turns cautious after a big purchase may have scored well. The ranking after the second special card confirms or refutes such reads.' },
        { title: 'Cubes cannot be split', body: 'Fixed denominations mean overpaying when you cannot make an exact amount, and ending with the lowest cube total halves your items. Keeping cubes to the end is defence.' },
        { title: 'Loss cards are a lowball race', body: 'The lowest bid takes a loss card, so dodging it means paying a little more, and those cubes vanish. If everyone bids one, there is a rebid and then everyone suffers. Weigh the loss against the cubes; sometimes taking it is cheaper.' },
        { title: 'Nobody knows when it ends', body: 'The game ends on the third of eight special cards, so the number of remaining auctions is unknown. Saving for later can backfire; securing good items early is safer.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'High Society', players: '3–5', alike: 'Bid with money cards that cannot be split; bad cards go to the lowest bidder; whoever ends with the least money is punished.', differs: 'Values are visible, the poorest player is knocked out entirely, and the game ends on the fourth of certain cards.' },
      { name: 'For Sale', players: '3–6', alike: 'Successive auctions on a limited budget, where dropping out early limits losses.', differs: 'Property values are printed and public.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The item list, special-card effects and hidden item are not described.',
  },
};

export default game;
