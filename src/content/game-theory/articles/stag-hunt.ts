import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'stag-hunt',
  category: 'cooperation',
  updated: '2026-11-26',
  games: [],
  related: ['prisoners-dilemma', 'nash-equilibrium', 'public-goods', 'signaling-cheap-talk'],
  ko: {
    meta: {
      title: '사슴 사냥 게임 — 협력의 문제는 유혹이 아니라 신뢰일 때 | PUZZLTHINK 게임 이론',
      description: '함께하면 사슴, 혼자면 토끼. 루소가 그린 사슴 사냥은 죄수의 딜레마와 달리 협력이 균형이지만, 신뢰가 부족하면 모두 토끼를 쫓아요. 보수 우월과 위험 우월, 75%의 믿음, 최소 노력 실험까지 정리했어요.',
      keywords: ['사슴 사냥 게임', '사슴사냥 게임 이론', '조정 게임', '위험 우월', '신뢰 게임', '협력과 신뢰'],
    },
    title: '사슴 사냥과 신뢰',
    lead: '배신하고 싶어서가 아니라, 상대가 올지 몰라서 협력이 깨지는 게임.',
    intro: [
      '사냥꾼 둘이 숲에 들어가요. 둘이 힘을 합쳐 자리를 지키면 큰 사슴을 잡을 수 있어요. 그런데 사냥하는 중에 토끼가 지나가요. 토끼는 혼자서도 잡을 수 있지만, 한 사람이라도 자리를 떠나 토끼를 쫓으면 사슴은 놓쳐요.',
      '철학자 장자크 루소가 1755년 『인간 불평등 기원론』에서 쓴 이 장면은 오늘날 **사슴 사냥 게임**이라고 불려요. 겉보기엔 [죄수의 딜레마](/game-theory/prisoners-dilemma)와 비슷하지만, 협력이 깨지는 이유가 완전히 달라요.',
    ],
    summary: '함께면 사슴, 혼자면 토끼. 협력이 균형인데도 깨지는 이유는 유혹이 아니라 불신이에요.',
    sections: [
      {
        id: 'model',
        title: '보수표: 균형이 두 개',
        blocks: [
          {
            type: 'matrix', rowPlayer: '사냥꾼 1', colPlayer: '사냥꾼 2', rows: ['사슴', '토끼'], cols: ['사슴', '토끼'],
            cells: [[[4, 4], [0, 3]], [[3, 0], [3, 3]]],
            mark: [[0, 0], [1, 1]],
            caption: '(사슴, 사슴)과 (토끼, 토끼) 모두 내시 균형이에요. 토끼는 상대와 상관없이 늘 3이에요.',
          },
          { type: 'p', text: '상대가 사슴을 노린다면 나도 사슴이 나아요(4 > 3). 상대가 토끼를 쫓는다면 나도 토끼가 나아요(3 > 0). 그래서 **둘 다 사슴**과 **둘 다 토끼**가 모두 균형이에요.' },
          { type: 'p', text: '죄수의 딜레마와 비교해 보세요. 죄수의 딜레마에서는 상대가 협력해도 배신이 더 이득(5 > 3)이었어요. 협력을 깨는 건 **유혹**이었죠. 사슴 사냥에서는 상대가 협력한다면 나도 협력하는 게 이득이에요. 배신할 이유가 없어요. 협력을 깨는 건 "상대가 정말 올까?"라는 **불신**이에요.' },
        ],
      },
      {
        id: 'risk',
        title: '좋은 균형과 안전한 균형',
        blocks: [
          { type: 'p', text: '두 균형은 성격이 달라요. (사슴, 사슴)은 둘 다에게 더 좋은 **보수 우월(payoff dominant)** 균형이에요. (토끼, 토끼)는 상대가 무엇을 하든 3을 보장하는 안전한 균형이에요. 존 하사니와 라인하르트 젤텐은 이런 성질을 **위험 우월(risk dominant)**이라는 개념으로 정리했어요.' },
          { type: 'h3', text: '얼마나 믿어야 사슴을 노릴까' },
          { type: 'p', text: '상대가 사슴을 노릴 확률을 p라고 해요. 사슴을 노리면 기대값이 4p, 토끼는 늘 3이에요. 그러니 **4p > 3, 즉 p > 3/4**일 때만 사슴이 나아요. 상대가 올 거라고 75% 넘게 확신해야 협력하는 거예요. 반대로 상대를 조금만 의심해도 토끼가 합리적이에요.' },
          { type: 'callout', tone: 'note', title: '위험 우월을 계산하는 법', text: '각 균형에서 혼자 벗어났을 때의 손실을 곱해 비교해요. (사슴, 사슴)에서 혼자 토끼로 바꾸면 4에서 3으로 1을 잃어요(곱하면 1 × 1 = 1). (토끼, 토끼)에서 혼자 사슴으로 바꾸면 3에서 0으로 3을 잃어요(3 × 3 = 9). 벗어날 때 더 크게 잃는 (토끼, 토끼)가 더 "단단한" 균형, 즉 위험 우월 균형이에요.' },
        ],
      },
      {
        id: 'many',
        title: '사람이 많아지면: 가장 약한 고리',
        blocks: [
          { type: 'p', text: '여럿이 함께하는 사슴 사냥에서는 문제가 더 어려워져요. 사슴을 잡으려면 **모두가** 자리를 지켜야 하니, 한 명만 불안해도 전체가 무너져요. 경제학자 존 반 휘크, 레이먼드 바탈리오, 리처드 베일은 1990년 실험에서 이런 구조를 시험했어요. 참가자들이 노력 수준을 고르고, 모두의 보수가 집단에서 가장 낮은 노력에 따라 정해지는 "최소 노력 게임"이에요.' },
          { type: 'p', text: '결과는 많은 걸 말해 줘요. 큰 집단에서는 라운드가 거듭될수록 노력이 가장 낮은 쪽으로 떨어지는 경향이 뚜렷했어요. 모두가 높은 노력을 고르는 것이 균형이고 모두에게 가장 좋은데도요. 누군가 한 명이 낮게 고를지도 모른다는 걱정이 집단 전체를 끌어내린 거예요.' },
          { type: 'callout', tone: 'warn', title: '흔한 오해', text: '사슴 사냥에서 협력이 실패한다고 사람들이 이기적이라는 뜻은 아니에요. 오히려 모두가 협력을 원할 수도 있어요. 문제는 그걸 서로 확신하지 못한다는 거예요. 그래서 처방도 처벌이 아니라 **확신을 만드는 것**이에요.' },
        ],
      },
      {
        id: 'fix',
        title: '불신을 줄이는 장치',
        blocks: [
          { type: 'list', items: [
            '**말이 통한다.** 죄수의 딜레마에서는 "협력할게"라는 말이 공허할 수 있어요. 배신이 늘 이득이니까요. 그런데 사슴 사냥에서는 "나 사슴 노릴게"라는 말을 믿을 이유가 있어요. 상대가 정말 사슴을 노린다면 그 사람에게도 사슴이 최선이니까요. 이런 말의 힘은 「[신호와 값싼 말](/game-theory/signaling-cheap-talk)」에서 더 다뤄요.',
            '**먼저 보여 준다.** 순서대로 움직일 수 있다면 한 사람이 먼저 사슴 자리에 서는 것만으로 상대의 최선 응답이 사슴이 돼요.',
            '**작게 시작한다.** 실패해도 손실이 작은 협력부터 반복하면 서로에 대한 믿음(p)이 올라가요.',
            '**집단을 작게 나눈다.** 가장 약한 고리가 전체를 정하는 구조라면, 서로 잘 아는 작은 단위로 나누는 것만으로도 협력이 쉬워져요.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임 속 사슴 사냥',
        blocks: [
          { type: 'p', text: '팀 미션이 있는 서바이벌 게임에는 사슴 사냥 구조가 자주 들어 있어요(특정 회차가 아니라 구조 이야기예요).' },
          { type: 'list', items: [
            '**모두가 같은 답을 내야 통과하는 미션.** 모두가 맞추면 큰 보상, 한 명이라도 다르면 실패하는 구조에서, 각자 "안전한" 개인 선택지가 있다면 사슴 사냥이에요. 모이기 전에 기준을 정해 두는 팀이 유리해요.',
            '**연합의 첫날.** 연합을 맺으면 다 같이 유리하지만, 다른 사람이 정말 연합대로 움직일지 확신이 없으면 각자 개인 플레이로 돌아가요. 이 경우 배신의 유혹이 없는데도 연합이 깨질 수 있어요.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**구조부터 구분하세요.** 상대가 협력할 때 나도 협력하는 게 낫다면 사슴 사냥, 상대가 협력해도 배신이 낫다면 죄수의 딜레마예요. 사슴 사냥이라면 설득과 약속이 잘 통해요.',
            '**75%의 문턱을 기억하세요.** 위 표 같은 보수라면 상대가 "거의 확실히" 온다고 믿어야 협력이 합리적이에요. 상대가 그 문턱을 넘도록 먼저 보여 주고, 분명하게 말하세요.',
            '**한 명의 불안이 전체를 무너뜨려요.** 여럿이 함께하는 미션이라면 가장 망설이는 사람을 먼저 안심시키는 게 가장 효과적이에요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Jean-Jacques Rousseau, Discours sur l’origine et les fondements de l’inégalité parmi les hommes, 1755' },
      { title: 'Brian Skyrms, The Stag Hunt and the Evolution of Social Structure, Cambridge University Press, 2004', url: 'https://www.cambridge.org/9780521533928' },
      { title: 'John C. Harsanyi, Reinhard Selten, A General Theory of Equilibrium Selection in Games, MIT Press, 1988' },
      { title: 'John B. Van Huyck, Raymond C. Battalio, Richard O. Beil, "Tacit Coordination Games, Strategic Uncertainty, and Coordination Failure", American Economic Review 80(1), 1990' },
    ],
  },
  en: {
    meta: {
      title: 'The stag hunt — when the cooperation problem is trust, not temptation | PUZZLTHINK',
      description: 'Together you get a stag, alone a hare. Rousseau’s stag hunt, unlike the prisoner’s dilemma, has cooperation as an equilibrium, yet without trust everyone chases hares. Payoff and risk dominance, the 75% belief threshold and the minimum-effort experiments.',
      keywords: ['stag hunt', 'stag hunt game theory', 'coordination game', 'risk dominance', 'trust game theory', 'cooperation and trust'],
    },
    title: 'The stag hunt and trust',
    lead: 'A game where cooperation breaks not because anyone wants to betray, but because nobody is sure the other will come.',
    intro: [
      'Two hunters enter a forest. If both hold their positions, they can bring down a stag. During the hunt a hare runs past. Anyone can catch a hare alone, but if even one hunter leaves to chase it, the stag gets away.',
      'Jean-Jacques Rousseau described this scene in his 1755 Discourse on Inequality, and today it is called the **stag hunt**. It looks like [the prisoner’s dilemma](/game-theory/prisoners-dilemma), but cooperation fails for an entirely different reason.',
    ],
    summary: 'Together a stag, alone a hare. Cooperation is an equilibrium, and what breaks it is distrust, not temptation.',
    sections: [
      {
        id: 'model',
        title: 'The payoff table: two equilibria',
        blocks: [
          {
            type: 'matrix', rowPlayer: 'Hunter 1', colPlayer: 'Hunter 2', rows: ['Stag', 'Hare'], cols: ['Stag', 'Hare'],
            cells: [[[4, 4], [0, 3]], [[3, 0], [3, 3]]],
            mark: [[0, 0], [1, 1]],
            caption: '(Stag, Stag) and (Hare, Hare) are both Nash equilibria. A hare is always worth 3 whatever the other does.',
          },
          { type: 'p', text: 'If the other goes for the stag, so should I (4 > 3). If the other chases a hare, so should I (3 > 0). So **both stag** and **both hare** are equilibria.' },
          { type: 'p', text: 'Compare the prisoner’s dilemma, where defecting paid more even against a cooperator (5 > 3): what broke cooperation was **temptation**. In the stag hunt, if the other cooperates I want to cooperate too; there is no reason to betray. What breaks cooperation is **distrust**: "will they really come?"' },
        ],
      },
      {
        id: 'risk',
        title: 'The good equilibrium and the safe one',
        blocks: [
          { type: 'p', text: 'The two equilibria differ in character. (Stag, Stag) is better for both: it is **payoff dominant**. (Hare, Hare) guarantees 3 whatever the other does. John Harsanyi and Reinhard Selten formalised this kind of safety as **risk dominance**.' },
          { type: 'h3', text: 'How much trust does the stag take?' },
          { type: 'p', text: 'Let p be the probability that the other goes for the stag. Going for the stag is worth 4p; the hare is always 3. So the stag is better only when **4p > 3, that is p > 3/4**. You must be more than 75% sure the other will come. A little doubt makes the hare the rational choice.' },
          { type: 'callout', tone: 'note', title: 'How to compute risk dominance', text: 'Multiply, at each equilibrium, the losses from deviating alone. Leaving (Stag, Stag) for a hare costs 1 (4 to 3), giving 1 × 1 = 1. Leaving (Hare, Hare) for the stag costs 3 (3 to 0), giving 3 × 3 = 9. (Hare, Hare), where deviating costs more, is the "sturdier" equilibrium: it is risk dominant.' },
        ],
      },
      {
        id: 'many',
        title: 'With more people: the weakest link',
        blocks: [
          { type: 'p', text: 'A stag hunt with many hunters is harder still. The stag needs **everyone** to hold position, so one nervous hunter brings the whole thing down. In a 1990 experiment the economists John Van Huyck, Raymond Battalio and Richard Beil tested this structure with a "minimum effort game": players choose an effort level, and everyone’s payoff depends on the lowest effort in the group.' },
          { type: 'p', text: 'The results are telling. In large groups effort clearly drifted down towards the lowest level over the rounds, even though everyone choosing high effort was an equilibrium and best for all. The worry that someone, somewhere, would choose low dragged the whole group down.' },
          { type: 'callout', tone: 'warn', title: 'A common misreading', text: 'Failure in a stag hunt does not show that people are selfish. Everyone may want to cooperate; the problem is that they cannot be sure of each other. So the remedy is not punishment but **building confidence**.' },
        ],
      },
      {
        id: 'fix',
        title: 'Ways to reduce distrust',
        blocks: [
          { type: 'list', items: [
            '**Talk works.** In the prisoner’s dilemma "I’ll cooperate" can be empty, because defecting always pays. In the stag hunt there is reason to believe "I’m going for the stag": if they really are, the stag is best for them too. More on the power of words in [Signals and cheap talk](/game-theory/signaling-cheap-talk).',
            '**Go first, visibly.** If moves can be sequential, one hunter taking up the stag position is enough to make the stag the other’s best response.',
            '**Start small.** Repeating cooperation where failure costs little raises each side’s belief (p) in the other.',
            '**Split the group.** Where the weakest link decides, dividing into small units of people who know each other makes cooperation easier.',
          ] },
        ],
      },
      {
        id: 'shows',
        title: 'The stag hunt in survival games',
        blocks: [
          { type: 'p', text: 'Survival games with team missions often contain a stag hunt (this is about structure, not particular episodes).' },
          { type: 'list', items: [
            '**Missions passed only if everyone gives the same answer.** If everyone matching brings a big reward and one mismatch means failure, and each player also has a "safe" individual option, it is a stag hunt. Teams that agree on a rule beforehand do better.',
            '**The first day of an alliance.** An alliance helps everyone, but if players are unsure the others will really act on it, each drifts back to playing alone. The alliance can fail even with no temptation to betray.',
          ] },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Identify the structure first.** If cooperating is best when the other cooperates, it is a stag hunt; if defecting is better even then, it is a prisoner’s dilemma. In a stag hunt, persuasion and promises work well.',
            '**Remember the 75% threshold.** With payoffs like those above, cooperating is rational only if you are almost sure the other will come. Help the other side past that threshold by going first and speaking clearly.',
            '**One nervous player can sink everyone.** In group missions, reassuring the most hesitant player first is the most effective move.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Jean-Jacques Rousseau, Discours sur l’origine et les fondements de l’inégalité parmi les hommes, 1755' },
      { title: 'Brian Skyrms, The Stag Hunt and the Evolution of Social Structure, Cambridge University Press, 2004', url: 'https://www.cambridge.org/9780521533928' },
      { title: 'John C. Harsanyi, Reinhard Selten, A General Theory of Equilibrium Selection in Games, MIT Press, 1988' },
      { title: 'John B. Van Huyck, Raymond C. Battalio, Richard O. Beil, "Tacit Coordination Games, Strategic Uncertainty, and Coordination Failure", American Economic Review 80(1), 1990' },
    ],
  },
};

export default article;
