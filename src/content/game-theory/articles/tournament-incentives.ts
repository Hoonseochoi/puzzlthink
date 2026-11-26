import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'tournament-incentives',
  category: 'coalitions',
  updated: '2026-11-26',
  games: ['hitStay', 'heavy13', 'russianRoulette'],
  related: ['voting-coalitions', 'zero-sum', 'bluffing', 'chicken-game'],
  ko: {
    meta: {
      title: '꼴찌 피하기 vs 1등 노리기 — 순위가 상금을 정할 때 전략이 바뀌는 이유 | PUZZLTHINK 게임 이론',
      description: '점수가 아니라 순위로 보상받는 게임에서는 같은 기대값이라도 위험한 선택과 안전한 선택의 가치가 달라져요. 토너먼트 이론, 뒤처지면 모험하고 앞서면 지키는 이유, Hit,Stay·무거운 13·러시안 룰렛에서 써먹는 법.',
      keywords: ['토너먼트 이론', '꼴찌 탈락 전략', '서바이벌 게임 전략', '위험 감수', 'Hit Stay 전략', '무거운 13 전략'],
    },
    title: '꼴찌 피하기 vs 1등 노리기',
    lead: '점수가 아니라 순위가 걸리면, 같은 기대값의 두 선택이 전혀 다른 수가 돼요.',
    intro: [
      '서바이벌 게임의 규칙은 크게 두 종류예요. **꼴찌 한 명만 탈락**하는 게임과, **1등 한 명만 살아남는** 게임이에요. 두 규칙에서 점수를 똑같이 계산하더라도, 잘하는 플레이는 완전히 달라요.',
      '이 글에서는 순위로 보상하는 구조를 다루는 **토너먼트 이론**의 핵심 생각과, "뒤처지면 모험하고 앞서면 지킨다"는 직관이 왜 맞는지를 숫자로 확인해요.',
    ],
    summary: '점수 대신 순위가 걸리면 위험의 가치가 바뀌어요. 뒤처지면 모험하고, 앞서면 지켜야 하는 이유.',
    sections: [
      {
        id: 'tournament',
        title: '토너먼트 이론: 순위로 주는 보상',
        blocks: [
          { type: 'p', text: '경제학자 에드워드 래지어와 셔윈 로즌은 1981년 논문에서, 회사 승진처럼 **절대 성과가 아니라 순위로 보상하는 구조**를 "토너먼트"로 분석했어요. 부사장 여럿 중 한 명만 사장이 된다면, 사장 연봉은 그 사람의 성과에 대한 보상이라기보다 부사장 모두를 열심히 일하게 만드는 상금이라는 거예요.' },
          { type: 'p', text: '이 모형의 중요한 결론 몇 가지는 이래요.' },
          { type: 'list', items: [
            '**노력은 상금의 "차이"가 끌어내요.** 1등과 2등의 보상 차이가 클수록 모두가 더 열심히 해요. 1등 상금의 절대 크기보다 등수 사이 격차가 중요해요.',
            '**운이 클수록 노력의 효과가 줄어요.** 결과가 운에 크게 좌우되면, 노력해도 순위가 잘 안 바뀌니 노력할 동기가 약해져요.',
            '**경쟁자를 끌어내리는 동기도 생겨요.** 래지어는 이후 연구에서, 순위 경쟁이 너무 치열하면 내 성과를 높이는 대신 남을 방해하는 행동이 늘어날 수 있다고 지적했어요.',
          ] },
        ],
      },
      {
        id: 'risk',
        title: '같은 기대값, 다른 가치: 위험의 계산',
        blocks: [
          { type: 'p', text: '마지막 라운드에 두 가지 선택이 있다고 해 봐요. **안전한 선택**은 확실히 2점, **모험**은 절반 확률로 4점, 절반 확률로 0점이에요. 기대값은 둘 다 2점이에요. 점수 합계로 보상받는다면 차이가 없어요. 그런데 순위로 보상받으면 달라져요.' },
          { type: 'table', head: ['내 상황', '안전한 선택(+2)', '모험(+4 또는 0)', '더 나은 선택'], rows: [
            ['바로 위 사람보다 3점 뒤 (꼴찌 탈락)', '여전히 1점 뒤 → **탈락 확정**', '절반 확률로 1점 앞 → 탈락 확률 50%', '**모험**'],
            ['바로 아래 사람보다 3점 앞 (아래 사람은 모험)', '상대가 4점을 얻어도 1점 앞 → **역전 확률 0%**', '내가 0점, 상대가 4점이면 역전 → 역전 확률 25%', '**안전**'],
            ['1등만 살아남는데 2점 뒤', '동점까지만 감 → 동점 규칙에 달림', '절반 확률로 2점 앞', '**모험**'],
          ], caption: '마지막 차례이고 다른 사람의 점수는 그대로라고 가정했어요(둘째 줄만 아래 사람도 모험). 같은 기대값이라도 순위 경쟁에서는 위험의 가치가 내 위치에 따라 달라져요.' },
          { type: 'p', text: '원리는 간단해요. 뒤처진 사람에게는 **평균적인 결과로는 어차피 진다**는 게 문제예요. 그러니 결과의 퍼짐(분산)을 키워 운 좋은 쪽 꼬리를 노리는 게 합리적이에요. 앞선 사람은 반대로 지금 순위를 지키면 되니 분산을 줄이는 게 나아요.' },
          { type: 'callout', tone: 'note', title: '실제로도 그럴까', text: '키스 브라운, 밴 할로, 로라 스타크스는 1996년 연구에서 미국 성장형 펀드 수백 개를 분석해, 상반기 성과가 뒤처진 펀드 매니저들이 하반기에 포트폴리오의 위험을 상대적으로 더 키우는 경향을 보고했어요. 펀드 매니저의 보상이 연간 순위에 크게 좌우되기 때문이라는 해석이에요. 다만 이후 연구들 사이에는 이 효과의 크기와 방향에 대해 다른 결과도 있어요.' },
        ],
      },
      {
        id: 'two-rules',
        title: '"꼴찌만 탈락"과 "1등만 생존"',
        blocks: [
          { type: 'table', head: ['', '꼴찌만 탈락', '1등만 생존'], rows: [
            ['누가 모험하나', '꼴찌 근처의 소수', '1등이 아닌 거의 모두'],
            ['중간 순위의 전략', '안전하게, 꼴찌와 거리 유지', '모험해서 1등을 노림'],
            ['선두의 전략', '크게 신경 쓸 것 없음', '분산을 줄이고 추격자를 견제'],
            ['연합', '꼴찌 후보 한 명을 두고 나머지가 뭉치기 쉬움', '1등을 끌어내리려 나머지가 뭉치기 쉬움'],
          ] },
          { type: 'p', text: '꼴찌만 탈락하는 구조에서는 대부분의 참가자가 "꼴찌만 아니면 된다"는 목표를 공유하니, 위험을 피하고 남을 크게 건드리지 않는 조용한 플레이가 많아져요. 반대로 1등만 살아남는 구조에서는 모두가 1등을 끌어내려야 하니 [투표와 연합](/game-theory/voting-coalitions)에서 본 "1위 견제"가 강하게 나타나요.' },
        ],
      },
      {
        id: 'site-games',
        title: 'PUZZLTHINK 게임으로 보기',
        blocks: [
          { type: 'h3', text: 'Hit,Stay: 칩이 0이 되면 끝' },
          { type: 'p', text: '[Hit,Stay](/hit-stay)는 다섯 명이 칩을 걸고 카드 합을 한계 숫자에 가깝게 맞추는 게임이에요. 칩이 0이 되면 탈락하고, 마지막까지 남은 한 명이 이겨요. 그리고 기본 베팅(앤티)이 라운드가 지날수록 커져요. 이 구조에서 칩의 가치는 선형이 아니에요. 칩이 적을 때 잃는 1칩은 탈락에 가까워지는 1칩이라, 많을 때의 1칩보다 훨씬 무거워요. 칩이 넉넉하면 애매한 판에서 일찍 접는 것이 생존에 유리하고, 칩이 적어 앤티를 몇 번 못 버틸 상황이라면 기다리기보다 괜찮은 패에서 크게 승부를 거는 편이 나아요.' },
          { type: 'h3', text: '무거운 13: 벌점이 적은 순서로' },
          { type: 'p', text: '[무거운 13](/heavy13)은 일곱 명이 바위 카드를 받침대에 올리며 합이 13 이상이 되게 만든 사람이 벌점을 받는 게임이에요. 최종 순위는 벌점이 적은 순서이고, 벌점이 같으면 더 최근에 벌점을 받은 사람이 아래 순위예요. 벌점이 이미 적어 앞서 있다면 받침대가 무너질 위험이 낮은 선택(작은 카드, 덜 찬 받침대)으로 분산을 줄이는 게 좋아요. 벌점이 많아 뒤처졌다면, 다른 사람이 위험한 받침대를 만지게 만드는 수를 노리는 등 판을 흔드는 선택이 상대적으로 가치가 커져요.' },
          { type: 'h3', text: '러시안 룰렛: 두 명만 맞는다' },
          { type: 'p', text: '[러시안 룰렛](/russian-roulette)은 여섯 명 중 총알 두 발에 맞는 사람이 지는 구조예요. 즉 여섯 명 중 네 명은 "맞지만 않으면" 되는, 꼴찌 피하기형 게임에 가까워요. 내가 맞지 않는 게 목표라면, 남을 이기는 수보다 **내 약실이 위험한지**를 확인하고 피하는 데 크레딧을 쓰는 것이 기본이에요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**규칙의 보상 구조부터 확인하세요.** 점수 합계인지, 순위인지, 꼴찌만 벌하는지, 1등만 살리는지에 따라 같은 수의 가치가 달라져요.',
            '**뒤처졌다면 분산을 키우세요.** 평균적으로 좋은 수보다, 잘되면 크게 역전하는 수가 나아요. 물론 나빠졌을 때의 손해가 탈락보다 더 나쁘지 않을 때 이야기예요.',
            '**앞섰다면 분산을 줄이세요.** 확실한 작은 이득이 불확실한 큰 이득보다 나아요. 추격자가 모험할 걸 예상하고, 그 모험이 성공해도 역전되지 않을 거리를 유지하세요.',
            '**마지막 라운드 직전에 순위를 다시 계산하세요.** 끝이 가까울수록 "지금 순위를 기준으로 어떤 결과가 필요한지"가 분명해지고, 그에 따라 최선의 위험 수준이 바뀌어요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Edward P. Lazear, Sherwin Rosen, "Rank-Order Tournaments as Optimum Labor Contracts", Journal of Political Economy 89(5), 1981', url: 'https://www.nber.org/papers/w0401' },
      { title: 'Edward P. Lazear, "Pay Equality and Industrial Politics", Journal of Political Economy 97(3), 1989' },
      { title: 'Keith C. Brown, W. V. Harlow, Laura T. Starks, "Of Tournaments and Temptations: An Analysis of Managerial Incentives in the Mutual Fund Industry", Journal of Finance 51(1), 1996', url: 'https://ideas.repec.org/a/bla/jfinan/v51y1996i1p85-110.html' },
      { title: 'PUZZLTHINK Hit,Stay·무거운 13·러시안 룰렛 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'Avoiding last place vs going for first — why rank-based rewards change strategy | PUZZLTHINK',
      description: 'When rank, not points, is rewarded, a risky and a safe option with the same expected value are worth different things. Tournament theory, why you gamble when behind and protect when ahead, and how to use it in Hit,Stay, Heavy 13 and Russian Roulette.',
      keywords: ['tournament theory', 'last place elimination strategy', 'survival game strategy', 'risk taking', 'Hit Stay strategy', 'Heavy 13 strategy'],
    },
    title: 'Avoiding last place vs going for first',
    lead: 'When rank is at stake, two choices with the same expected value become completely different moves.',
    intro: [
      'Survival-game rules come in two broad kinds: games where **only the last-placed player is eliminated**, and games where **only the winner survives**. Even if points are counted the same way in both, good play is entirely different.',
      'This article covers the core idea of **tournament theory**, which studies rewards based on rank, and checks with numbers why the intuition "gamble when behind, protect when ahead" is right.',
    ],
    summary: 'When rank replaces points, the value of risk changes: why to gamble when behind and protect when ahead.',
    sections: [
      {
        id: 'tournament',
        title: 'Tournament theory: rewards by rank',
        blocks: [
          { type: 'p', text: 'In a 1981 paper the economists Edward Lazear and Sherwin Rosen analysed structures that **reward rank rather than absolute output**, such as promotions, as "tournaments". If only one of several vice-presidents becomes CEO, the CEO’s salary is less a reward for that person’s output than a prize that makes all the vice-presidents work hard.' },
          { type: 'p', text: 'Some key conclusions:' },
          { type: 'list', items: [
            '**Effort is driven by the gap between prizes.** The bigger the difference between first and second, the harder everyone works. The spread matters more than the absolute size of the top prize.',
            '**The more luck matters, the less effort pays.** If results depend heavily on luck, effort barely changes rank, so the incentive to try weakens.',
            '**There is also an incentive to drag rivals down.** Lazear later pointed out that fierce rank competition can encourage sabotaging others instead of improving one’s own output.',
          ] },
        ],
      },
      {
        id: 'risk',
        title: 'Same expected value, different worth: the arithmetic of risk',
        blocks: [
          { type: 'p', text: 'In the last round you have two options. The **safe option** gives 2 points for sure; the **gamble** gives 4 points or 0, half and half. Both are worth 2 on average, and if total points were rewarded there would be no difference. When rank is rewarded, there is.' },
          { type: 'table', head: ['Your position', 'Safe (+2)', 'Gamble (+4 or 0)', 'Better choice'], rows: [
            ['3 behind the player above you (last place eliminated)', 'Still 1 behind → **eliminated for sure**', 'Half the time 1 ahead → 50% elimination', '**Gamble**'],
            ['3 ahead of the player below (who gambles)', 'Still 1 ahead even if they get 4 → **0% overtaken**', 'Overtaken if you get 0 and they get 4 → 25%', '**Safe**'],
            ['2 behind, only first survives', 'Only draws level → depends on the tie rule', 'Half the time 2 ahead', '**Gamble**'],
          ], caption: 'Assume it is your last turn and the others’ scores stay as they are (except on the second row, where the player below also gambles). With the same expected value, the worth of risk in a rank contest depends on where you stand.' },
          { type: 'p', text: 'The principle is simple. A player who is behind **loses with an average result anyway**, so widening the spread of outcomes (the variance) to reach the lucky tail is rational. A player ahead only needs to hold their place, so narrowing the variance is better.' },
          { type: 'callout', tone: 'note', title: 'Does it happen in reality?', text: 'In a 1996 study of hundreds of US growth funds, Keith Brown, Van Harlow and Laura Starks reported that managers whose funds trailed at mid-year tended to raise their portfolios’ risk more in the second half, read as a response to pay that depends heavily on annual rankings. Later studies, though, disagree about the size and even the direction of the effect.' },
        ],
      },
      {
        id: 'two-rules',
        title: '"Last place out" vs "only first survives"',
        blocks: [
          { type: 'table', head: ['', 'Last place eliminated', 'Only first survives'], rows: [
            ['Who gambles', 'The few near the bottom', 'Almost everyone except the leader'],
            ['Mid-table strategy', 'Play safe, keep distance from last', 'Gamble to reach first'],
            ['Leader’s strategy', 'Little to worry about', 'Cut variance, keep chasers in check'],
            ['Alliances', 'Others tend to unite around one candidate for last', 'Others tend to unite to pull down the leader'],
          ] },
          { type: 'p', text: 'When only last place is eliminated, most players share the goal "just don’t be last", so quiet play that avoids risk and leaves others alone becomes common. When only the winner survives, everyone needs to pull the leader down, and the "gang up on the leader" effect from [Voting and coalitions](/game-theory/voting-coalitions) is strong.' },
        ],
      },
      {
        id: 'site-games',
        title: 'Seen through PUZZLTHINK games',
        blocks: [
          { type: 'h3', text: 'Hit,Stay: out at zero chips' },
          { type: 'p', text: 'In [Hit,Stay](/hit-stay) five players bet chips and try to bring their card total close to a limit. A player at zero chips is out, and the last player standing wins. The base bet (ante) grows as rounds pass. In this structure chips are not worth the same throughout: with a short stack, one lost chip is a step towards elimination and weighs far more than a chip from a big stack. With chips to spare, folding marginal hands early helps survival; with too few chips to last many more antes, it is better to make a big stand with a decent hand than to wait.' },
          { type: 'h3', text: 'Heavy 13: ranked by fewest penalties' },
          { type: 'p', text: 'In [Heavy 13](/heavy13) seven players place stone cards on stands, and whoever brings a stand to 13 or more takes penalties. Final rank is by fewest penalties; on a tie, the player penalised more recently ranks lower. If you are ahead with few penalties, cut variance with choices that are unlikely to topple a stand (small cards, emptier stands). If you are behind, choices that shake things up — such as moves that leave others to touch the dangerous stand — become relatively more valuable.' },
          { type: 'h3', text: 'Russian Roulette: only two get hit' },
          { type: 'p', text: 'In [Russian Roulette](/russian-roulette) the two players hit by the two bullets lose. Four of the six only need not to be hit, so it is close to an avoid-last-place game. If your goal is not getting hit, spending credits to check **whether your own chamber is dangerous** and get away from it is the baseline, rather than moves aimed at beating others.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Check the reward structure first.** Total points, rank, punishing last place or saving only first: the same move is worth different amounts.',
            '**When behind, widen the variance.** A move that wins big if it works beats a move that is good on average — provided that failing is not worse than being eliminated anyway.',
            '**When ahead, narrow the variance.** A sure small gain beats an uncertain big one. Expect the chasers to gamble, and keep a margin their gamble cannot close.',
            '**Recalculate the standings just before the last round.** Near the end it becomes clear what result you need from where you stand, and the best level of risk changes with it.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Edward P. Lazear, Sherwin Rosen, "Rank-Order Tournaments as Optimum Labor Contracts", Journal of Political Economy 89(5), 1981', url: 'https://www.nber.org/papers/w0401' },
      { title: 'Edward P. Lazear, "Pay Equality and Industrial Politics", Journal of Political Economy 97(3), 1989' },
      { title: 'Keith C. Brown, W. V. Harlow, Laura T. Starks, "Of Tournaments and Temptations: An Analysis of Managerial Incentives in the Mutual Fund Industry", Journal of Finance 51(1), 1996', url: 'https://ideas.repec.org/a/bla/jfinan/v51y1996i1p85-110.html' },
      { title: 'PUZZLTHINK Hit,Stay, Heavy 13 and Russian Roulette rules (shown in each game)' },
    ],
  },
};

export default article;
