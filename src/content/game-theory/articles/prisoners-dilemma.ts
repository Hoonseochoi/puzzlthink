import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'prisoners-dilemma',
  category: 'cooperation',
  updated: '2026-11-26',
  games: [],
  related: ['tit-for-tat', 'public-goods', 'nash-equilibrium', 'dominant-strategy'],
  ko: {
    meta: {
      title: '죄수의 딜레마 — 각자 최선을 택했는데 왜 둘 다 손해일까 | PUZZLTHINK 게임 이론',
      description: '죄수의 딜레마를 보수표로 정확히 풀고, 배신이 왜 우월 전략인지, 언제 딜레마가 풀리는지, 실험에서 사람들은 어떻게 행동했는지 정리했어요. 서바이벌 게임의 "나눔과 독식" 구조도 함께 봐요.',
      keywords: ['죄수의 딜레마', '죄수의 딜레마 예시', '죄수의 딜레마 뜻', '게임 이론 협력', '우월 전략', '서바이벌 게임 배신'],
    },
    title: '죄수의 딜레마',
    lead: '모두가 똑똑하게 고른 결과가, 모두에게 나쁜 결과가 되는 구조.',
    intro: [
      '서바이벌 예능을 보다 보면 이런 장면이 꼭 나와요. 둘이 손잡으면 둘 다 살 수 있는데, 각자 머릿속에서는 "혹시 저쪽이 배신하면?"이라는 생각이 떠나지 않아요. 결국 둘 다 조금씩 의심하다가 둘 다 손해를 보고 끝나요.',
      '이 장면의 뼈대가 게임 이론에서 가장 유명한 모형인 **죄수의 딜레마**예요. 이 글에서는 딜레마를 숫자로 정확히 적고, 왜 이게 "딜레마"인지, 그리고 어떤 조건에서 빠져나올 수 있는지 살펴봐요.',
    ],
    summary: '각자 최선을 택했는데 둘 다 손해. 게임 이론에서 가장 유명한 모형을 숫자로 정확히.',
    sections: [
      {
        id: 'story',
        title: '이야기: 따로 갇힌 두 공범',
        blocks: [
          { type: 'p', text: '두 공범이 붙잡혀 따로따로 조사를 받아요. 검사는 결정적인 증거가 없어서 둘에게 같은 제안을 해요. "네가 자백하고 상대가 침묵하면 너는 풀어 주고 상대는 10년형이다. 둘 다 자백하면 둘 다 5년, 둘 다 침묵하면 가벼운 죄로 1년씩이다." 두 사람은 서로 의논할 수 없어요.' },
          {
            type: 'matrix', rowPlayer: '갑', colPlayer: '을', rows: ['침묵', '자백'], cols: ['침묵', '자백'],
            cells: [[['−1', '−1'], ['−10', '0']], [['0', '−10'], ['−5', '−5']]],
            mark: [[1, 1]],
            caption: '숫자는 징역 연수(마이너스일수록 나빠요). 유일한 내시 균형은 (자백, 자백)이에요.',
          },
          { type: 'p', text: '갑의 입장에서 생각해 봐요. 을이 침묵한다면 나는 침묵하면 1년, 자백하면 0년이니 자백이 나아요. 을이 자백한다면 나는 침묵하면 10년, 자백하면 5년이니 역시 자백이 나아요. **을이 무엇을 하든 자백이 더 나아요.** 이런 선택을 **우월 전략**이라고 불러요. 을도 똑같이 생각하니 둘 다 자백하고 5년씩 받아요. 둘 다 침묵했다면 1년씩이었을 텐데 말이에요.' },
        ],
      },
      {
        id: 'structure',
        title: '숫자만 남긴 뼈대',
        blocks: [
          { type: 'p', text: '감옥 이야기는 사실 포장이에요. 이 구조는 1950년 미국 랜드 연구소의 메릴 플러드와 멜빈 드레셔가 처음 실험한 게임에서 나왔고, 감옥 이야기는 수학자 앨버트 터커가 강연에서 쉽게 설명하려고 붙였다고 알려져 있어요. 이름을 처음 붙인 사람이 누구인지는 자료마다 조금 달라요.' },
          { type: 'p', text: '이제 점수로 바꿔 보면 구조가 더 선명해져요. 협력(C)과 배신(D) 중 하나를 동시에 고르고, 점수가 높을수록 좋아요.' },
          {
            type: 'matrix', rowPlayer: '나', colPlayer: '상대', rows: ['협력', '배신'], cols: ['협력', '배신'],
            cells: [[[3, 3], [0, 5]], [[5, 0], [1, 1]]],
            mark: [[1, 1]],
            caption: '로버트 액설로드의 대회에서 쓴 점수예요. (배신, 배신)이 유일한 균형이지만, (협력, 협력)이 둘 모두에게 더 좋아요.',
          },
          { type: 'p', text: '보통 네 점수에 이름을 붙여요. 상대를 배신하고 얻는 **유혹(T=5)**, 함께 협력한 **보상(R=3)**, 함께 배신한 **처벌(P=1)**, 혼자 협력했다가 당하는 **바보의 몫(S=0)**이에요. 어떤 게임이든 **T > R > P > S**이면 죄수의 딜레마예요. 이 순서만 맞으면 배신이 항상 우월 전략이고, 균형은 늘 둘 다 배신이에요.' },
          { type: 'callout', tone: 'note', title: '왜 "딜레마"인가', text: '개인에게 합리적인 선택(배신)을 모두가 하면, 집단 전체로는 더 나쁜 결과(1, 1)가 나와요. 둘 다 더 나아지는 다른 결과(3, 3)가 분명히 있는데도요. 경제학 용어로 균형이 **파레토 비효율적**이라고 해요. 개인의 합리성과 집단의 합리성이 어긋나는 것, 이것이 딜레마의 핵심이에요.' },
        ],
      },
      {
        id: 'escape',
        title: '딜레마가 풀리는 조건',
        blocks: [
          { type: 'p', text: '모형이 "배신하라"고 말하는 건 아주 좁은 조건에서예요. 다음 중 하나만 바뀌어도 이야기가 달라져요.' },
          { type: 'list', items: [
            '**같은 상대와 계속 만난다.** 오늘의 배신이 내일의 보복으로 돌아온다면 계산이 바뀌어요. 이것이 「[반복 게임과 팃포탯](/game-theory/tit-for-tat)」의 주제예요.',
            '**점수표 자체가 바뀐다.** 배신자에게 벌칙을 주는 규칙, 평판, 계약이 있으면 T가 줄어들어 더 이상 딜레마가 아닐 수 있어요. 예를 들어 배신이 들키면 3점을 잃는 규칙이 있다면 유혹은 5가 아니라 2가 되고, 상대가 협력할 때 협력(3)이 배신(2)보다 나아져요.',
            '**사람이 점수만 보지 않는다.** 공정함이나 죄책감, 상대에 대한 호감도 실제 만족에 들어가요. 그러면 표에 적힌 숫자와 실제 선호가 달라져요.',
            '**상대가 무엇을 할지 먼저 보인다.** 동시에 고르지 않고 차례로 고르면, 뒤에 고르는 사람의 선택이 앞사람에게 영향을 줄 수 있어요. 다만 한 번으로 끝나는 게임이라면 뒷사람에게는 여전히 배신이 유리해요.',
          ] },
        ],
      },
      {
        id: 'people',
        title: '실제 사람들은 어떻게 할까',
        blocks: [
          { type: 'p', text: '흥미롭게도 플러드와 드레셔가 1950년에 동료 두 명에게 이 게임을 100번 연속으로 시켜 보았을 때, 두 사람은 균형 예측과 달리 꽤 자주 협력했어요. 마지막 몇 판에서는 배신이 나타났는데, "마지막 판에는 보복당할 일이 없다"는 계산이 작동한 것으로 해석돼요.' },
          { type: 'p', text: '이후 수많은 실험에서도 비슷한 경향이 반복돼요. 한 번만 하는 익명 게임에서도 협력하는 사람이 적지 않고, 반복 게임에서는 협력이 더 많아지며, 끝이 다가오면 줄어들어요. 사람들은 순수한 점수 계산기라기보다, 상대의 협력에 협력으로 답하려는 성향(호혜성)을 가진 경우가 많아요.' },
          { type: 'callout', tone: 'warn', title: '흔한 오해', text: '"죄수의 딜레마는 인간이 이기적이라는 증거다"는 잘못된 해석이에요. 모형은 "이런 점수 구조에서 점수만 따지면 이렇게 된다"는 조건부 결론이에요. 실제 행동이 다르다는 건, 현실의 사람들이 점수 외의 것도 따지거나 반복 관계를 염두에 둔다는 뜻이에요.' },
        ],
      },
      {
        id: 'shows',
        title: '서바이벌 게임 속 딜레마',
        blocks: [
          { type: 'p', text: '두뇌 서바이벌 프로그램의 게임은 이 구조를 일부러 만들어 넣는 경우가 많아요. 아래는 특정 회차가 아니라, 여러 게임에서 볼 수 있는 **구조**를 정리한 거예요.' },
          { type: 'list', items: [
            '**동시 비밀 투표형.** 두 사람(또는 두 팀)이 동시에 "나눔"과 "독식" 중 하나를 고르는 구조예요. 영국 게임쇼 「골든 볼스(Golden Balls)」의 결승 「스플릿 오어 스틸」이 대표적이고, 경제학자들이 실제 출연자 데이터를 연구한 적도 있어요. 둘 다 나누면 반씩, 한쪽만 훔치면 훔친 쪽이 전부, 둘 다 훔치면 둘 다 0이에요.',
            '**공동 목표 + 개인 보상형.** 팀이 함께 일정 점수를 넘기면 모두 살아남지만, 내 몫을 아낀 사람이 개인 보상을 더 받는 구조예요. 사람이 많아지면 「[공유지의 비극과 공공재 게임](/game-theory/public-goods)」이 돼요.',
            '**정보 공유형.** 정보를 나누면 둘 다 유리해지지만, 거짓 정보를 주거나 숨긴 쪽이 더 유리해지는 구조도 딜레마와 닮았어요.',
          ] },
          { type: 'callout', tone: 'note', title: '스플릿 오어 스틸은 정확히는 딜레마가 아니에요', text: '상대가 훔칠 때 나는 나누든 훔치든 0이에요. 이때는 훔치는 쪽이 "확실히 더 나은" 게 아니라 "더 나쁘지 않은" 정도라서, 엄밀히는 T > R > P > S 중 P > S가 성립하지 않아요(P = S = 0). 이런 차이 때문에 "상대가 훔칠 게 뻔하면 나눠서 잃을 건 없다" 같은 설득이 통할 여지가 생겨요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**먼저 점수표를 적어 보세요.** 협력 제안을 받으면, 상대 입장에서 T, R, P, S가 각각 무엇인지 따져 보세요. 상대에게 배신이 우월 전략이라면, 약속만 믿는 건 위험해요.',
            '**판을 반복으로 바꾸세요.** "이번 판만"이 아니라 "다음 라운드에도 함께"라는 구조를 만들면 협력의 가치가 커져요. 마지막 라운드가 언제인지 모두가 아는 상황은 반대로 위험해요.',
            '**배신의 비용을 눈에 보이게 하세요.** 공개된 약속, 증인, 다른 참가자들의 시선은 모두 T를 낮추는 장치예요. 규칙이 허락한다면 배신자에게 불리한 조건을 협상에 넣는 것도 방법이에요.',
            '**협력할 거라면 일찍, 분명하게.** 반복 관계에서는 처음 신호가 이후 흐름을 정하는 경우가 많아요. 이 부분은 「[팃포탯](/game-theory/tit-for-tat)」에서 자세히 봐요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Stanford Encyclopedia of Philosophy, "Prisoner’s Dilemma"', url: 'https://plato.stanford.edu/entries/prisoner-dilemma/', note: '플러드·드레셔의 발견과 터커의 이야기, 이름의 기원 논쟁' },
      { title: 'Merrill M. Flood, "Some Experimental Games", RAND Research Memorandum RM-789, 1952' },
      { title: 'R. Duncan Luce, Howard Raiffa, Games and Decisions, Wiley, 1957' },
      { title: 'Robert Axelrod, The Evolution of Cooperation, Basic Books, 1984', note: 'T=5, R=3, P=1, S=0 점수' },
      { title: 'Martijn J. van den Assem, Dennie van Dolder, Richard H. Thaler, "Split or Steal? Cooperative Behavior When the Stakes Are Large", Management Science 58(1), 2012', url: 'https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1413' },
    ],
  },
  en: {
    meta: {
      title: 'The prisoner’s dilemma — why two smart choices make both worse off | PUZZLTHINK',
      description: 'The prisoner’s dilemma worked out with payoff tables: why defecting is a dominant strategy, when the dilemma dissolves, how real people behave in experiments, and the split-or-steal structure in survival games.',
      keywords: ["prisoner's dilemma", "prisoner's dilemma example", 'dominant strategy', 'cooperation game theory', 'split or steal', 'survival game betrayal'],
    },
    title: 'The prisoner’s dilemma',
    lead: 'A structure where everyone choosing sensibly makes everyone worse off.',
    intro: [
      'Every survival show has this scene. Two players could both survive by sticking together, yet each keeps thinking, "what if they betray me?" Both hedge a little, and both end up worse off.',
      'The skeleton of that scene is the most famous model in game theory, the **prisoner’s dilemma**. This article writes the dilemma down exactly, explains why it is a dilemma, and looks at the conditions under which players escape it.',
    ],
    summary: 'Each player picks their best option and both lose. The most famous model in game theory, in exact numbers.',
    sections: [
      {
        id: 'story',
        title: 'The story: two accomplices in separate cells',
        blocks: [
          { type: 'p', text: 'Two accomplices are arrested and questioned separately. The prosecutor lacks decisive evidence and makes each the same offer: "If you confess and your partner stays silent, you walk free and they get ten years. If you both confess, five years each. If you both stay silent, one year each on a minor charge." They cannot talk to each other.' },
          {
            type: 'matrix', rowPlayer: 'A', colPlayer: 'B', rows: ['Silent', 'Confess'], cols: ['Silent', 'Confess'],
            cells: [[['−1', '−1'], ['−10', '0']], [['0', '−10'], ['−5', '−5']]],
            mark: [[1, 1]],
            caption: 'Numbers are years in prison (more negative is worse). The only Nash equilibrium is (Confess, Confess).',
          },
          { type: 'p', text: 'Think as A. If B stays silent, I get one year for silence and zero for confessing: confessing is better. If B confesses, I get ten years for silence and five for confessing: confessing is better again. **Whatever B does, confessing is better.** Such a choice is a **dominant strategy**. B reasons the same way, so both confess and serve five years, when both staying silent would have meant one year each.' },
        ],
      },
      {
        id: 'structure',
        title: 'The bare structure',
        blocks: [
          { type: 'p', text: 'The prison story is packaging. The structure comes from a game first tested in 1950 by Merrill Flood and Melvin Dresher at the RAND Corporation; the prison story is credited to the mathematician Albert Tucker, who used it to explain the game in a talk. Sources differ on who first used the name in print.' },
          { type: 'p', text: 'In points the structure is clearer. Each player picks cooperate (C) or defect (D) at the same time; more points are better.' },
          {
            type: 'matrix', rowPlayer: 'Me', colPlayer: 'Opponent', rows: ['Cooperate', 'Defect'], cols: ['Cooperate', 'Defect'],
            cells: [[[3, 3], [0, 5]], [[5, 0], [1, 1]]],
            mark: [[1, 1]],
            caption: 'The points used in Robert Axelrod’s tournaments. (Defect, Defect) is the only equilibrium, yet (Cooperate, Cooperate) is better for both.',
          },
          { type: 'p', text: 'The four payoffs have names: the **temptation** to defect on a cooperator (T = 5), the **reward** for mutual cooperation (R = 3), the **punishment** for mutual defection (P = 1) and the **sucker’s payoff** for cooperating alone (S = 0). Any game with **T > R > P > S** is a prisoner’s dilemma. With that ordering, defecting is always dominant and the equilibrium is always mutual defection.' },
          { type: 'callout', tone: 'note', title: 'Why it is a dilemma', text: 'When everyone makes the individually rational choice (defect), the group ends up with (1, 1), although another outcome (3, 3) is better for both. In economic terms the equilibrium is **Pareto inefficient**. Individual rationality and collective rationality pull apart; that is the heart of the dilemma.' },
        ],
      },
      {
        id: 'escape',
        title: 'When the dilemma dissolves',
        blocks: [
          { type: 'p', text: 'The model says "defect" only under narrow conditions. Change any one of these and the story changes.' },
          { type: 'list', items: [
            '**You meet the same opponent again.** If today’s betrayal is answered tomorrow, the arithmetic shifts. That is the subject of [Repeated games and tit-for-tat](/game-theory/tit-for-tat).',
            '**The payoffs themselves change.** Rules that punish defectors, reputation and contracts lower T, possibly to the point where it is no longer a dilemma. If a detected betrayal costs 3 points, the temptation is 2 rather than 5, and against a cooperator, cooperating (3) now beats defecting (2).',
            '**People care about more than points.** Fairness, guilt and liking the other person all feed into how satisfied they are, so the numbers in the table stop matching their real preferences.',
            '**One player sees the other’s move first.** If moves are sequential rather than simultaneous, the second mover’s choice can influence the first. In a one-shot game, though, defecting still pays for the second mover.',
          ] },
        ],
      },
      {
        id: 'people',
        title: 'What real people do',
        blocks: [
          { type: 'p', text: 'Strikingly, when Flood and Dresher had two colleagues play the game 100 times in a row in 1950, the pair cooperated quite often, against the equilibrium prediction. Defection appeared in the last few rounds, read as the logic that nobody can retaliate in the final round.' },
          { type: 'p', text: 'Many later experiments repeat the pattern. Even in anonymous one-shot games, a fair number of people cooperate; in repeated games cooperation is more common, and it falls as the end approaches. People behave less like pure point calculators than like reciprocators who answer cooperation with cooperation.' },
          { type: 'callout', tone: 'warn', title: 'A common misreading', text: '"The prisoner’s dilemma proves people are selfish" is a misreading. The model is conditional: with this payoff structure, counting only points, this is what happens. That real behaviour differs means real people count more than points or keep the repeated relationship in mind.' },
        ],
      },
      {
        id: 'shows',
        title: 'The dilemma in survival games',
        blocks: [
          { type: 'p', text: 'Brain-survival shows often build this structure in on purpose. What follows describes **structures** found in many games, not particular episodes.' },
          { type: 'list', items: [
            '**Simultaneous secret vote.** Two players (or teams) choose "split" or "steal" at the same time. The best-known case is "Split or Steal", the final of the British game show Golden Balls, whose contestants’ choices economists have studied. Both split: half each. One steals: the stealer takes everything. Both steal: nobody gets anything.',
            '**Shared target, private reward.** The team survives if together it passes a threshold, but whoever holds back their share earns more personally. With many players it becomes [the tragedy of the commons and the public goods game](/game-theory/public-goods).',
            '**Information sharing.** Sharing information helps both, but whoever hides it or passes on false information gains more. That structure resembles the dilemma too.',
          ] },
          { type: 'callout', tone: 'note', title: 'Split or Steal is not quite a dilemma', text: 'If the other player steals, I get 0 whether I split or steal. Stealing is then not strictly better, only no worse, so strictly P > S fails (P = S = 0). That gap is what gives arguments like "if you are going to steal anyway, I lose nothing by splitting" room to work.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Write the payoffs down first.** When someone proposes cooperation, work out T, R, P and S from their side. If defecting is dominant for them, trusting a promise alone is risky.',
            '**Turn it into a repeated game.** Make it "together next round too", not "just this round", and cooperation becomes worth more. Conversely, a final round that everyone knows about is dangerous.',
            '**Make betrayal visibly costly.** Public promises, witnesses and the eyes of other players all lower T. If the rules allow it, building a penalty for defectors into the deal works too.',
            '**If you cooperate, do it early and clearly.** In repeated relationships the first signal often sets the course. More on that in [tit-for-tat](/game-theory/tit-for-tat).',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Stanford Encyclopedia of Philosophy, "Prisoner’s Dilemma"', url: 'https://plato.stanford.edu/entries/prisoner-dilemma/', note: 'Flood and Dresher, Tucker’s story, the debate over the name' },
      { title: 'Merrill M. Flood, "Some Experimental Games", RAND Research Memorandum RM-789, 1952' },
      { title: 'R. Duncan Luce, Howard Raiffa, Games and Decisions, Wiley, 1957' },
      { title: 'Robert Axelrod, The Evolution of Cooperation, Basic Books, 1984', note: 'the T=5, R=3, P=1, S=0 payoffs' },
      { title: 'Martijn J. van den Assem, Dennie van Dolder, Richard H. Thaler, "Split or Steal? Cooperative Behavior When the Stakes Are Large", Management Science 58(1), 2012', url: 'https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1413' },
    ],
  },
};

export default article;
