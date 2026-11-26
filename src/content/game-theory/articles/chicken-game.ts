import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'chicken-game',
  category: 'cooperation',
  updated: '2026-11-26',
  games: ['heavy13'],
  related: ['commitment-threats', 'stag-hunt', 'prisoners-dilemma', 'nash-equilibrium'],
  ko: {
    meta: {
      title: '치킨 게임 — 먼저 피하는 쪽이 지는 게임, 매-비둘기 모형까지 | PUZZLTHINK 게임 이론',
      description: '둘 다 버티면 둘 다 망하고, 먼저 피하면 체면을 잃는 치킨 게임. 균형이 두 개인 이유, 혼합 전략에서 충돌 확률, 생물학의 매-비둘기 게임, 그리고 "물러설 수 없게 만드는" 전략의 힘과 위험을 정리했어요.',
      keywords: ['치킨 게임', '치킨게임 뜻', '매 비둘기 게임', '벼랑 끝 전술', '게임 이론 치킨', '눈치 게임'],
    },
    title: '치킨 게임',
    lead: '둘 다 버티면 둘 다 망하고, 먼저 피하면 진다.',
    intro: [
      '두 자동차가 마주 보고 달려와요. 먼저 핸들을 꺾는 쪽은 "겁쟁이(chicken)"가 되고, 둘 다 꺾지 않으면 충돌해요. 뉴스에서 "치킨 게임"이라는 말은 가격 경쟁으로 버티는 회사들, 양보 없는 협상 같은 상황에 자주 쓰여요.',
      '치킨 게임은 [죄수의 딜레마](/game-theory/prisoners-dilemma)와 비슷해 보이지만 구조가 전혀 달라요. 이 글에서는 그 차이를 보수표로 확인하고, 이런 게임에서 왜 "고집"과 "광기"가 무기가 되는지 살펴봐요.',
    ],
    summary: '둘 다 버티면 공멸, 먼저 피하면 패배. 균형이 둘인 게임과 "물러설 수 없게 만들기"의 힘.',
    sections: [
      {
        id: 'model',
        title: '보수표로 보는 치킨 게임',
        blocks: [
          {
            type: 'matrix', rowPlayer: '갑', colPlayer: '을', rows: ['피한다', '돌진한다'], cols: ['피한다', '돌진한다'],
            cells: [[[0, 0], ['−1', 1]], [[1, '−1'], ['−10', '−10']]],
            mark: [[0, 1], [1, 0]],
            caption: '둘이 엇갈린 칸 (피한다, 돌진한다)와 (돌진한다, 피한다)가 순수 전략 내시 균형이에요.',
          },
          { type: 'p', text: '상대가 돌진한다면 나는 피하는 게 나아요(−1 > −10). 상대가 피한다면 나는 돌진하는 게 나아요(1 > 0). 즉 **상대와 반대로 하는 것**이 최선이에요. 그래서 한 사람은 돌진하고 한 사람은 피하는 두 칸이 균형이에요. 누가 돌진하는 쪽이 될지가 싸움의 전부예요.' },
          { type: 'h3', text: '죄수의 딜레마와 무엇이 다를까' },
          { type: 'p', text: '죄수의 딜레마에서는 상대가 무엇을 하든 배신이 나았어요. 그래서 균형이 하나(둘 다 배신)였죠. 치킨 게임에서는 최악의 결과가 "둘 다 공격적일 때"예요(−10). 그래서 상대가 강하게 나온다고 확신하면 내가 물러서는 게 합리적이에요. 정리하면, 죄수의 딜레마는 "둘 다 배신하는" 쪽으로 미끄러지고, 치킨 게임은 "누가 물러서느냐"를 두고 신경전을 벌여요.' },
          { type: 'h3', text: '서로 모를 때의 균형: 충돌 확률' },
          { type: 'p', text: '누가 물러설지 정해 줄 단서가 없다면, 대칭적인 균형은 혼합 전략이에요. 상대가 돌진할 확률을 q라고 하면, 피할 때 기대값은 −q, 돌진할 때는 (1 − q) × 1 + q × (−10) = 1 − 11q예요. 두 값이 같아지는 q = 1/10이에요. 즉 각자 10% 확률로 돌진하고, **둘이 충돌할 확률은 1/100**이에요. 충돌 비용이 클수록(−10이 −100이 되면) 돌진 확률은 낮아지지만 0이 되지는 않아요.' },
        ],
      },
      {
        id: 'hawk-dove',
        title: '생물학의 치킨 게임: 매와 비둘기',
        blocks: [
          { type: 'p', text: '같은 구조가 동물 행동 연구에도 나와요. 1973년 존 메이너드 스미스와 조지 프라이스는 동물들이 싸울 때 왜 대부분 끝까지 다치게 싸우지 않고 과시 행동으로 끝내는지를 게임 이론으로 설명했어요. 이 연구를 바탕으로 널리 쓰이게 된 단순화 모형이 **매-비둘기 게임**이에요.' },
          { type: 'p', text: '먹이 가치를 V, 싸워서 다칠 때의 비용을 C라고 해요. 매는 끝까지 싸우고, 비둘기는 위협만 하다가 상대가 싸우려 들면 물러나요. 매끼리 만나면 절반 확률로 이기고 절반 확률로 다쳐 평균 (V − C)/2, 매가 비둘기를 만나면 V, 비둘기끼리는 나눠서 V/2를 얻어요.' },
          {
            type: 'matrix', rowPlayer: '나', colPlayer: '상대', rows: ['매', '비둘기'], cols: ['매', '비둘기'],
            cells: [[['−3', '−3'], [4, 0]], [[0, 4], [2, 2]]],
            mark: [[0, 1], [1, 0]],
            caption: 'V = 4, C = 10인 경우. 구조가 치킨 게임과 같아요.',
          },
          { type: 'p', text: '다칠 비용이 먹이 가치보다 크면(C > V), 집단 안에서 매의 비율이 **V/C**일 때 매와 비둘기의 평균 이득이 같아져 그 비율이 유지돼요. 위 예에서는 4/10 = 40%예요. 확인해 보면 매의 비율이 40%일 때 매의 평균 이득은 0.4 × (−3) + 0.6 × 4 = 1.2, 비둘기는 0.4 × 0 + 0.6 × 2 = 1.2로 같아요. 이런 상태를 **진화적으로 안정한 전략(ESS)**이라고 불러요.' },
          { type: 'callout', tone: 'note', title: '왜 모두 매가 되지 않을까', text: '모두가 매인 집단에서는 다 같이 다쳐요. 그럴 때는 싸움을 피하는 비둘기가 오히려 이득이라 비둘기가 늘어나요. 반대로 비둘기만 있으면 매가 먹이를 독차지하니 매가 늘어나요. 두 힘이 맞서는 곳에서 비율이 멈춰요.' },
        ],
      },
      {
        id: 'commitment',
        title: '물러설 수 없게 만드는 전략',
        blocks: [
          { type: 'p', text: '치킨 게임에서 이기는 가장 확실한 방법은, 상대에게 **"나는 절대 피하지 않는다"는 걸 믿게 하는 것**이에요. 운전석에서 핸들을 뽑아 창밖으로 던져 버리는 장면을 상상해 보세요. 상대가 그걸 보면 피하는 게 상대의 최선 응답이 돼요. 선택지를 스스로 없앴는데 오히려 이긴 거예요.' },
          { type: 'p', text: '토머스 셸링은 1960년 『갈등의 전략』에서 이렇게 자기 손을 묶는 행동, 즉 **공약(commitment)**이 협상력을 만든다는 점을 강조했어요. 이 이야기는 「[약속과 위협의 신빙성](/game-theory/commitment-threats)」에서 더 자세히 다뤄요.' },
          { type: 'callout', tone: 'warn', title: '양쪽 다 핸들을 던지면', text: '공약 전략에는 큰 위험이 있어요. 둘 다 동시에 "절대 안 피한다"고 묶어 버리면 충돌이 확정돼요. 또 상대가 내 공약을 보지 못하거나 믿지 않으면 소용이 없어요. 공약은 **먼저, 분명하게, 상대가 볼 수 있게** 해야 효과가 있어요.' },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임 속 치킨 게임',
        blocks: [
          { type: 'p', text: '두뇌 서바이벌에서 치킨 게임 구조는 "누군가는 손해를 떠안아야 하는데, 아무도 먼저 떠안고 싶지 않은" 상황으로 자주 나타나요. 아래는 특정 회차가 아니라 구조에 대한 이야기예요.' },
          { type: 'list', items: [
            '**누가 희생할 것인가.** 팀에서 한 명이 벌칙을 받아야 다 같이 진행되는데, 모두가 버티면 팀 전체가 탈락하는 구조예요. 가장 먼저 "내가 할게"라고 하는 사람이 손해를 보지만, 아무도 안 하면 최악이에요.',
            '**버티기 경매.** 시간이 갈수록 둘 다 비용을 내면서 먼저 포기하는 쪽이 지는 구조는 치킨 게임을 여러 번 이어 붙인 **소모전**이에요. 「[경매 이론](/game-theory/auctions)」의 달러 경매도 같은 계열이에요.',
            '**[무거운 13](/heavy13)의 받침대.** 받침대 위 숫자 합이 13 이상이 되게 놓는 사람은 이미 놓여 있던 큐브 수만큼 벌점을 받고, 받침대는 새 큐브 하나만 남은 상태로 다시 시작해요. 그래서 위험한 받침대를 두고는 "누군가 먼저 무너뜨려 주기를" 바라는 신경전이 생겨요. 라운드마다 한 번 쓸 수 있는 패스는 그 순간을 남에게 미루는 수단이지만, 패스한 사람들은 나중에 거꾸로 된 순서로 놓아야 해요. 미루기가 늘 이득이 되는 건 아니라는 점에서 치킨 게임과 닮았어요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**최악의 결과가 무엇인지 먼저 확인하세요.** 둘 다 강하게 나갈 때가 최악이라면 치킨 게임이에요. 이때는 상대가 정말로 물러서지 않을 사람인지가 가장 중요한 정보예요.',
            '**공약은 먼저, 공개적으로.** 상대가 결정하기 전에 내가 물러설 수 없다는 걸 보여 주면 유리해요. 단, 상대도 같은 걸 시도하는지 꼭 살피세요.',
            '**상대에게 체면 살릴 출구를 주세요.** 상대가 물러서는 게 "패배"로 보이면 끝까지 버틸 수 있어요. "이번엔 네가 양보하고 다음엔 내가"처럼 교대로 양보하는 약속은 반복되는 치킨 게임에서 둘 다 충돌을 피하는 좋은 방법이에요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'J. Maynard Smith, G. R. Price, "The Logic of Animal Conflict", Nature 246, 1973' },
      { title: 'John Maynard Smith, Evolution and the Theory of Games, Cambridge University Press, 1982' },
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960' },
      { title: 'Stanford Encyclopedia of Philosophy, "Evolutionary Game Theory"', url: 'https://plato.stanford.edu/entries/game-evolutionary/' },
      { title: 'PUZZLTHINK 무거운 13 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'The game of chicken — whoever swerves first loses, and the hawk–dove model | PUZZLTHINK',
      description: 'Both hold on and both crash; swerve first and lose face. Why chicken has two equilibria, the crash probability in the mixed equilibrium, biology’s hawk–dove game, and the power and danger of making yourself unable to back down.',
      keywords: ['game of chicken', 'chicken game theory', 'hawk dove game', 'brinkmanship', 'war of attrition', 'commitment strategy'],
    },
    title: 'The game of chicken',
    lead: 'Both hold on and both crash; swerve first and you lose.',
    intro: [
      'Two cars race head-on. Whoever swerves first is the "chicken"; if neither swerves, they crash. In the news "a game of chicken" describes firms holding on through a price war or negotiators who will not yield.',
      'Chicken looks similar to [the prisoner’s dilemma](/game-theory/prisoners-dilemma) but its structure is quite different. This article checks the difference with payoff tables and shows why stubbornness, even apparent madness, can be a weapon in such games.',
    ],
    summary: 'Both hold on and both crash; swerve first and lose. A game with two equilibria, and the power of tying your own hands.',
    sections: [
      {
        id: 'model',
        title: 'Chicken as a payoff table',
        blocks: [
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['Swerve', 'Straight'], cols: ['Swerve', 'Straight'],
            cells: [[[0, 0], ['−1', 1]], [[1, '−1'], ['−10', '−10']]],
            mark: [[0, 1], [1, 0]],
            caption: 'The mismatched cells (Swerve, Straight) and (Straight, Swerve) are the pure-strategy Nash equilibria.',
          },
          { type: 'p', text: 'If the other drives straight, I should swerve (−1 > −10). If the other swerves, I should drive straight (1 > 0). The best move is **the opposite of the other player’s**, so the two cells where one goes straight and the other swerves are the equilibria. The whole fight is over who gets to be the one driving straight.' },
          { type: 'h3', text: 'How it differs from the prisoner’s dilemma' },
          { type: 'p', text: 'In the prisoner’s dilemma defecting was better whatever the other did, so there was one equilibrium (both defect). In chicken the worst outcome is mutual aggression (−10), so if you are sure the other will hold firm, backing down is rational. The prisoner’s dilemma slides towards mutual defection; chicken is a war of nerves over who yields.' },
          { type: 'h3', text: 'The equilibrium without cues: the crash probability' },
          { type: 'p', text: 'With no cue to settle who yields, the symmetric equilibrium is mixed. If the other goes straight with probability q, swerving is worth −q and going straight (1 − q) × 1 + q × (−10) = 1 − 11q. They are equal at q = 1/10: each drives straight 10% of the time and **they crash with probability 1/100**. The bigger the crash cost (−10 becoming −100), the less often anyone drives straight, but it never reaches zero.' },
        ],
      },
      {
        id: 'hawk-dove',
        title: 'Chicken in biology: hawks and doves',
        blocks: [
          { type: 'p', text: 'The same structure shows up in the study of animal behaviour. In 1973 John Maynard Smith and George Price used game theory to explain why animal contests mostly end in displays rather than injurious fights to the finish. The simplified model that became widely used on the back of this work is the **hawk–dove game**.' },
          { type: 'p', text: 'Let V be the value of the food and C the cost of getting injured. Hawks fight to the end; doves threaten but retreat if the other escalates. Two hawks each win half the time and get hurt half the time, averaging (V − C)/2; a hawk meeting a dove gets V; two doves share, V/2 each.' },
          {
            type: 'matrix', rowPlayer: 'Me', colPlayer: 'Other', rows: ['Hawk', 'Dove'], cols: ['Hawk', 'Dove'],
            cells: [[['−3', '−3'], [4, 0]], [[0, 4], [2, 2]]],
            mark: [[0, 1], [1, 0]],
            caption: 'With V = 4 and C = 10. The structure is the same as chicken.',
          },
          { type: 'p', text: 'When injury costs more than the food is worth (C > V), hawks and doves do equally well when the share of hawks in the population is **V/C**, and that share is maintained. Here 4/10 = 40%. Check: with 40% hawks a hawk averages 0.4 × (−3) + 0.6 × 4 = 1.2 and a dove 0.4 × 0 + 0.6 × 2 = 1.2. Such a state is called an **evolutionarily stable strategy (ESS)**.' },
          { type: 'callout', tone: 'note', title: 'Why everyone does not become a hawk', text: 'In a population of hawks everyone gets hurt, so doves, who avoid fights, do better and spread. In a population of doves, hawks take all the food and spread. The share settles where the two pressures balance.' },
        ],
      },
      {
        id: 'commitment',
        title: 'Making yourself unable to back down',
        blocks: [
          { type: 'p', text: 'The surest way to win chicken is to make the other believe **"I will never swerve"**. Picture a driver ripping out the steering wheel and throwing it out of the window. Once the other driver sees it, swerving becomes their best response. You removed your own options and won because of it.' },
          { type: 'p', text: 'In The Strategy of Conflict (1960), Thomas Schelling stressed that tying your own hands in this way, **commitment**, creates bargaining power. More in [Promises, threats and credibility](/game-theory/commitment-threats).' },
          { type: 'callout', tone: 'warn', title: 'If both throw out the wheel', text: 'Commitment carries a big risk. If both tie their hands at once, the crash is certain. And a commitment the other side does not see, or does not believe, is useless. Commit **first, clearly and visibly**.' },
        ],
      },
      {
        id: 'shows',
        title: 'Chicken in survival games',
        blocks: [
          { type: 'p', text: 'In brain-survival games chicken shows up as "someone has to take the loss, and nobody wants to be first". What follows is about structure, not particular episodes.' },
          { type: 'list', items: [
            '**Who takes the hit?** The team can only move on if one member accepts a penalty, and if everyone holds out the whole team is eliminated. The first to say "I’ll do it" loses out, but nobody doing it is worst.',
            '**Holding-out auctions.** When both sides pay a cost as time passes and the first to give up loses, it is a chain of chicken games: a **war of attrition**. The dollar auction in [Auction theory](/game-theory/auctions) belongs to the same family.',
            '**The stands in [Heavy 13](/heavy13).** The player whose cube brings a stand’s total to 13 or more takes a penalty equal to the cubes already on it, and the stand restarts with just the new cube. So a dangerous stand breeds a war of nerves: everyone hopes someone else will topple it first. The pass, usable once a round, pushes that moment onto others, but those who pass must place later in reverse order. Waiting is not always a gain, which is what makes it resemble chicken.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**First check what the worst outcome is.** If it is both sides going hard, you are playing chicken, and the most valuable information is whether the other side really will not back down.',
            '**Commit early and in public.** Showing that you cannot back down before the other side decides is an advantage — but watch whether they are trying the same.',
            '**Leave the other side a face-saving exit.** If yielding looks like defeat, they may hold out to the end. In repeated chicken, a promise to take turns ("you yield this time, I yield next time") is a good way for both to avoid the crash.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'J. Maynard Smith, G. R. Price, "The Logic of Animal Conflict", Nature 246, 1973' },
      { title: 'John Maynard Smith, Evolution and the Theory of Games, Cambridge University Press, 1982' },
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960' },
      { title: 'Stanford Encyclopedia of Philosophy, "Evolutionary Game Theory"', url: 'https://plato.stanford.edu/entries/game-evolutionary/' },
      { title: 'PUZZLTHINK Heavy 13 rules (shown in the game)' },
    ],
  },
};

export default article;
