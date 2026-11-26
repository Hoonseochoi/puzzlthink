import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'gem-black-market',
  kind: 'main',
  when: { ko: '3일차', en: 'Day 3' },
  related: ['blackWhite', 'piggyBank', 'indianPoker'],
  updated: '2026-11-26',
  sources: [namuDay(3), broadcast],
  ko: {
    meta: {
      title: '보석 암시장 규칙 — 데블스플랜3 3일차 메인매치, 카드 교환과 마니또',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 3일차 메인매치 보석 암시장의 규칙을 정리했어요. 보석 카드 11장과 폭탄 2장, 구매자 칸과 휴지통, 두 번의 카드 교환, 승점 계산, 내 점수에 곱해지는 마니또, 순위와 동점 처리까지.',
      keywords: ['보석 암시장', '데블스플랜3 보석 암시장', '데블스 플랜 3 3일차', '데블스플랜3 메인매치', '보석 암시장 규칙', '마니또 게임'],
    },
    title: '보석 암시장 — 데블스플랜3 3일차 메인매치',
    name: '보석 암시장',
    lead: '카드 한 장을 몰래 쥐고, 서로의 카드를 바꿔 가며 구매자가 원하는 보석을 맞히는 게임이에요. 최종 점수는 모르는 누군가의 점수와 곱해져요.',
    summary: '카드 한 장씩을 돌려 바꾸며 구매자 칸의 보석을 맞히고 폭탄을 떠넘기는 9인 게임. 내 점수에는 마니또의 점수가 곱해져요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 셋째 날 생존자 9명.',
        '**카드 13장**: 보석 카드 11장(다이아몬드 5·6, 금 4·5, 은 2·3·4, 동 1·1·2·2)과 폭탄 카드 2장(−6, −4).',
        '**게임판**: 플레이어마다 카드 한 장 자리, 가운데의 **구매자 칸** 3장, **휴지통** 1장.',
        '**순서**: 추첨으로 기본 순서를 정하고, 1라운드 선 플레이어는 피스 비공개 경매로 정해요. 가장 많이 낸 사람이 선이 되고, 진 사람의 피스는 돌려줘요. 최고액이 같으면 그 사람들끼리만 다시 경매해요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '카드 나누기', body: '라운드마다 카드를 섞어 선 플레이어부터 한 장씩 뒷면으로 나눠요. 남은 4장 중 3장은 구매자 칸에, 1장은 휴지통에 놓아요. 선 플레이어부터 차례로 자기 카드를 확인하고, 그 뒤로는 자기 차례에만 볼 수 있어요.' },
        { title: '두 번의 교환', body: '라운드마다 교환을 두 바퀴 해요. 첫 바퀴는 순서대로, 둘째 바퀴는 거꾸로예요. 자기 차례에는 3분 안에 **다른 사람의 카드, 구매자 칸 카드, 휴지통 카드 중 한 장**과 내 카드를 바꿔야 해요. 교환은 반드시 해야 해요.' },
        { title: '점수 계산', body: '교환이 끝나면 판 위의 카드를 모두 공개해요. 내 보석과 같은 종류가 구매자 칸에 있으면 내 카드 숫자만큼 승점을 받고, 같은 종류가 구매자 칸에 여러 장이면 그 장수만큼 곱해요. 다이아몬드로 점수를 내면 피스도 1개 받아요. 폭탄을 들고 있으면 적힌 만큼 승점을 잃어요.' },
        { title: '다음 선 플레이어', body: '−6 폭탄을 가진 사람이 다음 라운드 선이 돼요. 없으면 −4를 가진 사람, 폭탄이 아무에게도 없으면 선은 그대로예요.' },
      ] },
      { type: 'p', text: '이렇게 3라운드를 하고, 라운드가 끝날 때마다 승점 현황을 공개해요.' },
      { type: 'h3', text: '마니또' },
      { type: 'p', text: '시작 전에 카드를 뽑아 모든 사람의 **마니또**를 정해요. 관계는 한 방향으로 미리 정해져 있어서, 나는 딜러룸에서 **내가 누구의 마니또인지**(내 점수가 누구에게 곱해지는지)만 알고, **내 마니또가 누구인지**는 모르는 채로 시작해요. 최종 승점은 **내 승점 × 내 마니또의 승점**이에요.' },
    ],
    win: [
      { type: 'list', items: [
        '최종 승점(마니또 곱셈 뒤) 순서로 순위를 정해요.',
        '**1–3위는 생활동, 4–8위는 감옥동, 최하위 1명은 탈락**이에요. 1위는 연맹의 징표를 받아요.',
        '최종 승점이 1점 이상이면 피스 1개, 10점 이상이면 피스 2개를 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**폭탄을 들고 있으면 반드시 다른 사람의 카드와** 바꿔야 해요(구매자 칸이나 휴지통과는 못 바꿔요).',
        '내 폭탄을 다른 사람이 자기 차례에 가져가면, 나는 그 즉시 승점 3점을 받아요.',
        '게임 중 한 번, 피스 1개로 구매자 칸이나 휴지통 카드 한 장을 몰래 볼 수 있어요.',
        '최종 승점이 같으면 마니또 곱셈 전 개인 승점이 높은 쪽이 위, 그것도 같으면 3라운드 둘째 교환 순서가 앞선 쪽이 위예요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '보석 암시장에는 정보가 세 겹으로 숨어 있어요. **구매자 칸의 카드**(점수가 될 보석), **다른 사람의 카드**(바꿔 올 수 있는 것), 그리고 **마니또 관계**(내 점수를 누가 살려 주는가)예요.' },
      { type: 'cards', items: [
        { title: '교환이 곧 정보예요', body: '구매자 칸이나 휴지통과 바꾸면 그 카드를 직접 보게 돼요. 다른 사람과 바꾸면 그 사람이 쥐고 있던 카드를 알게 되고, 동시에 그 사람도 내 카드를 알게 돼요. 두 바퀴 동안 누가 어디와 바꿨는지를 기억하면 판 위 카드의 상당수를 추적할 수 있어요.' },
        { title: '폭탄은 돌고 돌아요', body: '폭탄을 쥔 사람은 반드시 다른 사람에게 넘겨야 하므로 폭탄은 판 위를 돌아다녀요. 둘째 바퀴가 역순이라, 마지막에 폭탄을 받는 사람은 넘길 기회가 없어요. 교환 순서상 언제 폭탄이 나에게 올 수 있는지를 계산해야 해요.' },
        { title: '곱셈이 만드는 연합', body: '최종 점수가 곱셈이라 마니또의 점수가 0이거나 음수면 내 점수도 망가져요. 그래서 누가 내 마니또인지 모르는 상태에서는 **모두의 점수가 양수로 유지되는 것**이 모두에게 이득이고, 반대로 내가 마니또인 상대가 누구인지는 알기 때문에 그 사람을 도울 이유가 생겨요. 이 비대칭이 협상의 재료가 돼요.' },
        { title: '음수 곱셈의 함정', body: '내 승점과 마니또의 승점이 둘 다 음수면 곱은 양수가 돼요. 규칙상 막혀 있지 않은 이 경우를 노리면 꼴찌권에서 역전할 수도 있지만, 마니또가 누구인지 확신할 수 없으면 도박에 가까워요.' },
        { title: '지배 전략은 없어요', body: '최선의 교환 상대는 남들이 무엇을 쥐었는지, 누가 내 마니또인지에 따라 달라져요. 확실한 것은, 정보를 많이 모으고 그 정보를 언제 말하고 언제 숨길지 정하는 사람이 유리하다는 점이에요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '러브 레터 (Love Letter)', players: '2–6명', alike: '손에 카드 한 장만 쥐고, 다른 사람과 카드를 맞바꾸거나 엿보며 정보를 모으는 게임이에요.', differs: '러브 레터는 카드마다 능력이 있고 상대를 탈락시키는 게 목표라, 점수 곱셈이나 공용 구매자 칸이 없어요.' },
      { name: '도둑잡기 (Old Maid)', players: '2명 이상', alike: '아무도 갖고 싶지 않은 카드(조커)를 남에게 떠넘기는 구조가 폭탄 카드와 같아요.', differs: '도둑잡기는 운에 맡기고 상대 패에서 카드를 뽑지만, 보석 암시장은 누구와 바꿀지 직접 골라요.' },
      { name: '쿠 (Coup)', players: '2–6명', alike: '숨겨진 카드와 교환 행동, 다른 사람이 무엇을 쥐었는지에 대한 추리가 핵심이에요.', differs: '쿠는 카드의 역할을 사칭하는 블러핑 게임이고, 상대의 영향력을 모두 없애면 이겨요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Gem Black Market rules — The Devil's Plan 3, day 3 main match (card swaps and the Manitto)",
      description: "The rules of Gem Black Market from The Devil's Plan: Dead Again (season 3): eleven gem cards and two bombs, the buyer slots and the bin, two swap rounds, scoring, the secret Manitto whose score multiplies yours, ranking and tie-breaks.",
      keywords: ['Gem Black Market', "Devil's Plan 3 Gem Black Market", "Devil's Plan main match", 'Manitto game'],
    },
    title: "Gem Black Market — The Devil's Plan 3, day 3 main match",
    name: 'Gem Black Market',
    lead: 'Hold one hidden card and swap your way to the gems the buyers want. Your final score is multiplied by someone you do not know.',
    summary: 'Nine players swap single cards to match the buyers’ gems and pass on bombs; your score is multiplied by your secret Manitto’s.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 9 still in on day 3.',
        '**13 cards**: 11 gems (diamond 5, 6; gold 4, 5; silver 2, 3, 4; bronze 1, 1, 2, 2) and two bombs (−6, −4).',
        '**Board**: one card space per player, three **buyer** slots in the middle and a **bin**.',
        '**Order**: a draw sets the base order; the round-1 first player is decided by a secret auction of pieces (losers get theirs back; tied top bids rebid).',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Dealing', body: 'Each round the cards are shuffled and dealt face down, one each from the first player. Of the four left, three go to the buyer slots and one to the bin. Players look at their card in turn, and afterwards only on their own turn.' },
        { title: 'Two swap rounds', body: 'Each round has two laps of swaps, the first in order and the second reversed. On your turn you must, within three minutes, swap your card with **another player’s card, a buyer card or the bin card**. Swapping is compulsory.' },
        { title: 'Scoring', body: 'Every card is revealed. A gem of a kind present among the buyers scores its number, multiplied by how many buyer cards are of that kind. Scoring with a diamond also earns a piece. A bomb costs its value.' },
        { title: 'Next first player', body: 'Whoever holds the −6 bomb goes first next round; otherwise whoever holds the −4; with no bomb held, the first player stays.' },
      ] },
      { type: 'p', text: 'Three rounds are played, with scores shown after each.' },
      { type: 'h3', text: 'The Manitto' },
      { type: 'p', text: 'Before the game, a draw gives everyone a **Manitto** along a fixed one-way chain. In the dealer room you learn **whose Manitto you are** (whose score you multiply), but not **who your own Manitto is**. Your final score is **your points × your Manitto’s points**.' },
    ],
    win: [
      { type: 'list', items: [
        'Players rank by final score (after multiplying).',
        '**Places 1–3 go to the living quarters, 4–8 to prison, and the last place is eliminated.** First place gets the Alliance token.',
        'A final score of 1 or more earns a piece; 10 or more earns two.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**A player holding a bomb must swap with another player** (not with a buyer card or the bin).',
        'If someone takes your bomb on their turn, you gain 3 points at once.',
        'Once per game, a piece lets you secretly look at one buyer card or the bin card.',
        'Ties go to the higher score before multiplying, then to whoever swapped earlier in round 3’s second lap.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Information hides in three layers: **the buyer cards** (which gems score), **other players’ cards** (what you could take), and **the Manitto chain** (who keeps your score alive).' },
      { type: 'cards', items: [
        { title: 'Every swap is information', body: 'Swapping with a buyer slot or the bin shows you that card. Swapping with a player shows you their card and shows them yours. Remembering who swapped with what over two laps tracks much of the table.' },
        { title: 'Bombs travel', body: 'A bomb holder must pass it on, so bombs circulate. The second lap runs backwards, so whoever receives a bomb last cannot pass it; work out from the order when one could reach you.' },
        { title: 'Multiplication makes alliances', body: 'If your Manitto ends at zero or below, your score is ruined too. Not knowing who it is, you want **everyone’s score to stay positive**; knowing whose Manitto you are gives you a reason to help that player. The asymmetry is the material for negotiation.' },
        { title: 'The negative trap', body: 'Two negative scores multiply into a positive. Nothing in the rules forbids aiming for that from the bottom, but without being sure who your Manitto is, it is a gamble.' },
        { title: 'No dominant strategy', body: 'The best swap depends on what others hold and who your Manitto is. What reliably helps is gathering information and choosing when to share it and when to keep it.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Love Letter', players: '2–6', alike: 'You hold a single card and trade or peek at others to gather information.', differs: 'Cards have powers and the goal is knocking others out; there is no multiplied score or shared buyer row.' },
      { name: 'Old Maid', players: '2+', alike: 'Passing on the card nobody wants works like the bombs.', differs: 'You draw blindly from another hand; in Gem Black Market you choose whom to swap with.' },
      { name: 'Coup', players: '2–6', alike: 'Hidden cards, exchange actions and reading what others hold are central.', differs: 'It is a bluffing game about claiming roles; you win by removing everyone else’s influence.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
