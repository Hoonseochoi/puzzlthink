import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'great-legacy',
  kind: 'tournament',
  when: { ko: '본선 2차', en: 'Main round 2' },
  episode: { ko: '4화', en: 'Episode 4' },
  related: ['blackWhite2', 'pointOmok', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '위대한 유산 규칙 — 데스게임2 본선 2차, 유물 경매와 컬렉션',
      description: '넷플릭스 데스게임2 본선 2차 위대한 유산의 규칙을 정리했어요. 140코인(1·5·10·20 코인), 유물 카드 18장과 특수 카드 7장, 누적 공개 입찰, 국가·작품 컬렉션 보너스, 재평가·평가절하·가품 판정과 "먼저 포기한 사람이 떠안는" 역경매까지.',
      keywords: ['위대한 유산', '데스게임2 위대한 유산', '데스게임 시즌2 본선', '경매 게임', '넷플릭스 데스게임'],
    },
    title: '위대한 유산 — 데스게임2 본선 2차',
    name: '위대한 유산',
    lead: '세계의 유물을 경매로 모아요. 같은 나라 세 점이나 같은 형식 세 점을 모으면 보너스지만, 가품 판정이 붙으면 방금 산 유물이 사라져요.',
    summary: '코인으로 유물을 경매해 점수와 컬렉션을 모으고, 손해 카드는 "먼저 포기한 사람이 떠안는" 방식으로 피하는 4인 경매.',
    setup: [
      { type: 'list', items: [
        '**인원**: 본선 2차 4명.',
        '**코인 140**: 1코인 10개, 5코인 8개, 10코인 5개, 20코인 2개. 가진 코인은 숨길 수 있어요.',
        '**매물**: 유물 카드 18장과 특수 카드 7장을 섞어 무작위로 3장을 빼고, 남은 22장을 경매해요.',
        '**유물**: 한국·이집트·프랑스 세 나라 × 그림·조각 공예·건축물 세 형식, 칸마다 2장씩. 카드마다 1–5점이 있고, 나라마다 형식별 점수 배분이 달라요.',
        '**특수 카드**: 재평가 2장, 평가절하 2장, 가품 판정 3장.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '공개 입찰', body: '추첨한 자리 순서로, 선이 원하는 만큼 코인을 내고 다음 사람은 그보다 많이 내요. 여러 번 입찰하면 앞서 낸 코인에 더해서 계산하고, 이미 낸 코인의 구성은 바꿀 수 없어요.' },
        { title: '포기와 낙찰', body: '포기하면 낸 코인을 모두 돌려받고 그 경매에서 빠져요. 나를 뺀 모두가 포기하면 낙찰이에요. 직전 낙찰자가 다음 경매의 선이에요.' },
        { title: '점수', body: '유물은 낙찰되는 즉시 점수가 쌓여요. 컬렉션을 완성하면 +3점이에요.' },
      ] },
      { type: 'table', head: ['컬렉션', '조건'], rows: [
        ['국가 컬렉션', '한 나라의 그림·조각 공예·건축물을 1장씩'],
        ['작품 컬렉션', '같은 형식의 유물을 세 나라에서 1장씩'],
      ], caption: '한 유물은 같은 종류의 컬렉션에 한 번만 쓸 수 있어요' },
      { type: 'table', head: ['특수 카드', '효과'], rows: [
        ['재평가', '내가 직전에 얻은 유물을 5점으로'],
        ['평가절하', '내가 직전에 얻은 유물을 1점으로'],
        ['가품 판정', '내가 직전에 얻은 유물을 폐기'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '매물이 다 떨어지면 끝나고, **최종 점수 1위가 다음 게임**으로 가요. 나머지 세 명은 탈락해요.',
        '동점이면 남은 코인이 많은 쪽이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**평가절하와 가품 판정은 반대로 경매해요.** 가장 먼저 포기한 사람이 그 카드를 가져가고, 다른 사람들이 입찰한 코인은 모두 사라져요. 낙찰을 피하려고 돈을 내는 방식이에요.',
        '유물이 없는 상태에서 특수 카드를 받으면, 다음에 낙찰받는 유물에 바로 적용돼요.',
        '입찰을 이어 갈 수 없으면 자동으로 포기 처리돼요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '위대한 유산은 **경매 두 종류**를 섞었어요. 유물은 많이 낸 사람이 가져가고, 나쁜 카드는 먼저 포기한 사람이 떠안아요. 같은 코인으로 "사기"와 "피하기"를 모두 해야 해서 예산 관리가 핵심이에요.' },
      { type: 'cards', items: [
        { title: '나쁜 카드는 "직전 유물"을 겨냥해요', body: '가품 판정과 평가절하는 받은 사람의 직전 유물에 적용돼요. 그래서 방금 비싼 유물을 산 사람은 이어서 나쁜 카드가 나오면 꼭 피해야 하고, 그만큼 코인을 써야 해요. 반대로 1점짜리 유물을 산 직후라면 평가절하는 거의 손해가 없어 일찍 포기해도 돼요.' },
        { title: '역경매의 계산', body: '나쁜 카드 경매에서는 먼저 포기한 한 명만 카드를 받고, 버틴 사람들은 낸 코인을 잃어요. 모두가 버티면 모두 돈을 잃고, 한 명이 일찍 포기하면 나머지는 적게 잃어요. 내가 떠안아도 덜 아픈 상황이라면 바로 포기하는 것이 남의 코인을 태우는 공격이 돼요.' },
        { title: '컬렉션은 경쟁자를 드러내요', body: '컬렉션 보너스가 3점이라, 누가 어떤 나라나 형식을 모으는지가 보이면 그 사람이 다음에 노릴 카드가 예측돼요. 그 카드에서 값을 올려 비싸게 사게 만들거나, 일부러 사서 컬렉션을 막을 수 있어요.' },
        { title: '코인 구성의 제약', body: '이미 낸 코인을 바꿀 수 없어서, 20코인을 먼저 내면 세세한 입찰이 어려워요. 작은 코인을 아껴 두면 마지막에 1코인 차이로 이기는 입찰이 가능해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '하이 소사이어티 (High Society)', players: '3–5명', alike: '좋은 물건은 많이 낸 사람이 사고, 나쁜 카드는 **먼저 포기한 사람이 떠안고 나머지는 낸 돈을 잃는** 역경매가 똑같아요.', differs: '하이 소사이어티는 돈 카드가 정해져 있고, 남은 돈이 가장 적은 사람은 아예 탈락해요.' },
      { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '같은 화가(종류)를 모으는 정도에 따라 가치가 달라지는 미술품 경매 게임이에요.', differs: '모던 아트는 플레이어가 경매를 열어 그림을 팔고, 경매 방식이 여러 가지예요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 유물별 점수표는 옮기지 않았어요.',
  },
  en: {
    meta: {
      title: 'Great Legacy rules — Death Game 2 (The Risk Takers season 2), main round 2',
      description: 'The rules of Great Legacy (위대한 유산) from Netflix’s Death Game season 2: 140 coins in 1, 5, 10 and 20s, 18 relic cards and 7 special cards, cumulative open bidding, country and type collections, revaluation, devaluation and forgery, and the reverse auction where the first to drop out takes the bad card.',
      keywords: ['Great Legacy', 'Death Game 2', 'The Risk Takers season 2', 'auction game'],
    },
    title: 'Great Legacy — Death Game 2, main round 2',
    name: 'Great Legacy',
    lead: 'Collect the world’s relics at auction. Three of a country or three of a kind earn a bonus — but a forgery ruling destroys what you just bought.',
    summary: 'A four-player auction for relics and collections, where bad cards go to whoever drops out first.',
    setup: [
      { type: 'list', items: [
        '**Players**: four in main round 2.',
        '**140 coins**: ten 1s, eight 5s, five 10s, two 20s; holdings may be kept hidden.',
        '**Lots**: 18 relic and 7 special cards shuffled, three removed at random, 22 auctioned.',
        '**Relics**: three countries (Korea, Egypt, France) × three types (painting, sculpture or craft, architecture), two cards each, worth 1–5 points with different splits by country.',
        '**Special cards**: two revaluations, two devaluations, three forgery rulings.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Open bidding', body: 'In seat order, the first player bids any amount and each next player bids more. Repeated bids add to coins already put in, and committed coins cannot be swapped.' },
        { title: 'Dropping and winning', body: 'Dropping out returns your coins and removes you from the lot; the last bidder wins. The last winner leads the next auction.' },
        { title: 'Points', body: 'Relics score on purchase; completing a collection adds 3.' },
      ] },
      { type: 'table', head: ['Collection', 'Needs'], rows: [
        ['Country', 'A painting, a sculpture or craft and a building from one country'],
        ['Type', 'One relic of the same type from each country'],
      ], caption: 'A relic counts once per kind of collection' },
      { type: 'table', head: ['Special card', 'Effect'], rows: [
        ['Revaluation', 'Your last relic becomes 5 points'],
        ['Devaluation', 'Your last relic becomes 1 point'],
        ['Forgery', 'Your last relic is discarded'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'When the lots run out, **the top score advances**; the other three are eliminated.',
        'Ties go to more coins left.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Devaluations and forgeries are auctioned in reverse**: the first to drop out takes the card and everyone else’s bids are lost — you pay to avoid it.',
        'A special card taken with no relic applies to the next relic you win.',
        'A player who cannot continue bidding drops out automatically.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Great Legacy mixes **two auctions**: relics go to the highest bidder, bad cards to the first to quit. The same coins buy and dodge, so budgeting is everything.' },
      { type: 'cards', items: [
        { title: 'Bad cards target your last relic', body: 'Forgery and devaluation hit the recipient’s most recent relic, so someone who just bought an expensive piece must dodge the next bad card at a cost; someone who just bought a 1-pointer can quit early at almost no loss.' },
        { title: 'The reverse auction', body: 'Only the first quitter takes the card; everyone who held on loses their coins. If quitting costs you little, quitting at once burns everyone else’s money.' },
        { title: 'Collections reveal targets', body: 'A 3-point bonus makes collectors predictable: drive up the price of the card they need, or buy it to block them.' },
        { title: 'Denomination limits', body: 'Committed coins cannot be swapped, so leading with a 20 makes fine bidding hard; small coins kept back win last-coin duels.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'High Society', players: '3–5', alike: 'Good lots go to the highest bidder while bad cards go to **the first to drop out, everyone else losing their bids** — the same reverse auction.', differs: 'Money cards are fixed and the poorest player at the end is knocked out.' },
      { name: 'Modern Art', players: '3–5', alike: 'An art auction where value depends on how much of a kind is collected.', differs: 'Players run the auctions to sell paintings, in several formats.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The relic score table is not reproduced.',
  },
};

export default game;
