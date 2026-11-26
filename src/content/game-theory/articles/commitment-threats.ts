import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'commitment-threats',
  category: 'sequence',
  updated: '2026-11-26',
  games: [],
  related: ['backward-induction', 'chicken-game', 'signaling-cheap-talk', 'ultimatum-game'],
  ko: {
    meta: {
      title: '약속과 위협의 신빙성 — 믿을 수 있는 말과 빈말의 차이 | PUZZLTHINK 게임 이론',
      description: '"들어오면 가만 안 둔다"는 위협은 언제 먹힐까요? 진입 저지 게임으로 믿을 수 없는 위협을 확인하고, 스스로 선택지를 줄여 이기는 공약의 원리, 약속을 믿게 만드는 장치, 서바이벌 게임의 "다음에 살려 줄게"를 분석해요.',
      keywords: ['신빙성 있는 위협', '공약 게임 이론', '셸링 갈등의 전략', '진입 저지 게임', '약속 게임 이론', '서바이벌 연합 약속'],
    },
    title: '약속과 위협의 신빙성',
    lead: '말은 공짜예요. 믿게 만드는 건 그 말을 지킬 수밖에 없는 구조예요.',
    intro: [
      '"나를 지목하면 다음 라운드에 너도 끌고 간다." "이번에 나를 도와주면 다음엔 내가 너를 살릴게." 서바이벌 게임은 위협과 약속으로 가득해요. 그런데 어떤 말은 판을 움직이고, 어떤 말은 아무도 신경 쓰지 않아요.',
      '게임 이론은 이 차이를 꽤 분명하게 설명해요. 핵심 질문은 하나예요. **"그 순간이 실제로 오면, 말한 사람에게 그 말을 지키는 게 이득인가?"** 이 글에서는 이 질문을 게임 트리로 확인하고, 말을 믿게 만드는 방법들을 살펴봐요.',
    ],
    summary: '그 순간이 오면 지키는 게 이득인 말만 믿을 수 있어요. 위협과 약속을 믿게 만드는 구조.',
    sections: [
      {
        id: 'entry',
        title: '진입 저지 게임: 믿을 수 없는 위협',
        blocks: [
          { type: 'p', text: '한 동네에 가게가 하나 있어요(기존 가게). 새 가게가 들어올지 고민하자, 기존 가게 주인이 말해요. "들어오면 가격 전쟁을 벌여서 둘 다 망하게 만들 거야." 새 가게는 이 말을 믿어야 할까요?' },
          { type: 'table', head: ['새 가게의 선택', '기존 가게의 대응', '결과 (새 가게, 기존 가게)'], rows: [
            ['들어오지 않는다', '—', '(0, 10)'],
            ['들어온다', '가격 전쟁', '(−2, 2)'],
            ['들어온다', '받아들인다(나눠 먹기)', '(3, 5)'],
          ], caption: '새 가게가 먼저 결정하고, 그다음 기존 가게가 대응해요.' },
          { type: 'p', text: '[역진 귀납](/game-theory/backward-induction)으로 뒤에서부터 봐요. 새 가게가 이미 들어온 뒤라면, 기존 가게는 가격 전쟁(2)보다 받아들이기(5)가 나아요. 그러니 "가격 전쟁을 하겠다"는 말은 **막상 그때가 오면 지키지 않을 위협**이에요. 새 가게가 이걸 안다면 들어와서 3을 얻어요. 결과는 (3, 5)예요.' },
          { type: 'callout', tone: 'note', title: '왜 위협만으로는 안 될까', text: '"들어오지 마, 아니면 전쟁"이라는 위협이 먹혔다면 기존 가게는 10을 지켰을 거예요. 위협은 기존 가게에게 엄청난 가치가 있어요. 하지만 그 가치는 상대가 믿을 때만 생기고, 상대는 기존 가게의 나중 이익을 계산할 수 있어요. 말로 하는 위협은 나중의 계산을 바꾸지 못해요.' },
        ],
      },
      {
        id: 'commitment',
        title: '공약: 스스로 손을 묶어 이기기',
        blocks: [
          { type: 'p', text: '기존 가게가 위협을 믿게 만들려면, **나중의 이익 계산 자체를 바꿔야** 해요. 예를 들어 새 가게가 결정하기 전에 2를 들여 대량 재고와 큰 설비를 미리 마련했다고 해 봐요. 설비가 놀면 손해이니, 이제 새 가게가 들어왔을 때 가격 전쟁이 오히려 나은 선택이 돼요.' },
          { type: 'table', head: ['새 가게의 선택', '기존 가게의 대응', '설비 투자 후 결과'], rows: [
            ['들어오지 않는다', '—', '(0, 8)'],
            ['들어온다', '가격 전쟁', '(−2, 4)'],
            ['들어온다', '받아들인다', '(3, 3)'],
          ], caption: '설비 투자(비용 2) 뒤에는 들어온 상대에게 가격 전쟁(4)이 받아들이기(3)보다 나아요.' },
          { type: 'p', text: '이제 위협은 진짜예요. 새 가게가 들어오면 기존 가게는 실제로 가격 전쟁을 할 거고, 그러면 새 가게는 −2를 받아요. 그러니 새 가게는 들어오지 않고, 기존 가게는 8을 얻어요. **2를 들여 선택지를 스스로 나쁘게 만들었는데, 결과는 5에서 8로 좋아졌어요.**' },
          { type: 'p', text: '토머스 셸링은 1960년 『갈등의 전략』에서 이런 역설을 협상 이론의 중심에 두었어요. 협상에서는 유연한 쪽이 오히려 약하고, **물러설 수 없는 쪽이 강할 수 있다**는 거예요. 「[치킨 게임](/game-theory/chicken-game)」에서 핸들을 뽑아 던지는 운전자가 이기는 것과 같은 원리예요. 셸링은 이 연구 등으로 2005년 로버트 오먼과 함께 노벨 경제학상을 받았어요.' },
          { type: 'callout', tone: 'warn', title: '공약의 조건', text: '공약이 통하려면 세 가지가 필요해요. 상대가 결정하기 **전에** 해야 하고, 상대가 **볼 수 있어야** 하고, **되돌릴 수 없어야** 해요. 몰래 한 공약이나 언제든 취소할 수 있는 공약은 상대의 계산을 바꾸지 못해요.' },
        ],
      },
      {
        id: 'promises',
        title: '약속을 믿게 만드는 장치',
        blocks: [
          { type: 'p', text: '위협과 마찬가지로 약속도 "그때가 오면 지키는 게 이득인가"로 평가돼요. 서바이벌 게임에서 "이번에 도와주면 다음에 살려 줄게"라는 약속은, 다음 라운드에 그 사람을 살리는 게 약속한 사람에게도 이득일 때만 믿을 수 있어요. 그렇지 않은 약속을 믿게 만드는 방법은 이래요.' },
          { type: 'list', items: [
            '**반복과 평판.** 앞으로도 계속 만날 사이라면, 약속을 어긴 대가는 다음 협력의 기회를 잃는 거예요. 「[팃포탯](/game-theory/tit-for-tat)」에서 본 것처럼 미래가 충분히 중요하면 약속이 지켜져요.',
            '**공개 선언.** 여러 사람 앞에서 한 약속을 어기면 그 사람들 모두에게 신뢰를 잃어요. 어기는 비용이 커지니 약속이 단단해져요.',
            '**먼저 주기(인질).** 아이템이나 정보를 먼저 넘겨주면, 약속을 지키지 않을 때 내가 잃을 것이 생겨요. 상대 입장에서 내 약속을 믿을 근거가 돼요.',
            '**나눠서 이행하기.** 큰 약속을 한꺼번에 하지 않고 단계별로 주고받으면, 어느 단계에서든 배신으로 얻는 이익이 작아져요.',
          ] },
        ],
      },
      {
        id: 'chance',
        title: '운에 맡기는 위협',
        blocks: [
          { type: 'p', text: '셸링이 강조한 또 하나의 아이디어는 **"무언가를 운에 맡기는 위협"**이에요. 확실히 실행하겠다는 위협은 실행 비용이 너무 커서 믿기 어려워요. 그런데 "이 상황이 계속되면 일이 통제 불가능해질 수 있다"는 위협은 다르죠. 말하는 사람이 굳이 실행을 결심할 필요가 없고, 상황 자체가 위험을 키우니까요.' },
          { type: 'p', text: '벼랑 끝 전술(brinkmanship)이 이런 원리예요. 서로 조금씩 위험을 키우면서 상대가 먼저 물러서기를 기다리는 거예요. 물론 이 전술은 이름 그대로 진짜로 떨어질 수 있다는 위험을 안고 있어요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**상대의 위협을 들으면 "그때 가서도 할까?"를 계산하세요.** 실행하면 말한 사람도 손해 보는 위협이라면, 대부분 허세예요. 다만 상대가 평판을 쌓으려는 중이라면 손해를 감수하고 실행할 수도 있어요.',
            '**내 위협은 미리 구조로 만드세요.** "지목하면 같이 간다"는 말보다, 실제로 그렇게 할 수밖에 없는 상황(예: 이미 공개적으로 약속했다, 내 표가 그쪽으로 묶여 있다)을 먼저 보여 주는 게 강해요.',
            '**약속은 작게, 자주, 공개적으로.** 한 번의 큰 약속보다 여러 번의 작은 약속을 지켜 보인 사람이 결정적인 순간에 신뢰를 얻어요.',
            '**말이 아니라 비용을 보세요.** 비용이 드는 행동(먼저 내준 아이템, 공개된 선언)은 말보다 많은 걸 알려 줘요. 이 이야기는 「[신호와 값싼 말](/game-theory/signaling-cheap-talk)」에서 이어져요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960' },
      { title: 'Reinhard Selten, "The Chain Store Paradox", Theory and Decision 9, 1978' },
      { title: 'Avinash Dixit, "The Role of Investment in Entry-Deterrence", Economic Journal 90(357), 1980' },
      { title: 'Roger B. Myerson, "Learning from Schelling’s Strategy of Conflict", Journal of Economic Literature 47(4), 2009', url: 'https://home.uchicago.edu/~rmyerson/stratofc2010.pdf' },
      { title: 'The Nobel Prize in Economic Sciences 2005 (Aumann, Schelling)', url: 'https://www.nobelprize.org/prizes/economic-sciences/2005/summary/' },
    ],
  },
  en: {
    meta: {
      title: 'Credible promises and threats — the difference between words that count and empty talk | PUZZLTHINK',
      description: 'When does "enter and you will regret it" work? An entry-deterrence game shows an incredible threat, then how limiting your own options can win (commitment), the devices that make promises believable, and the survival-game promise "I will save you next time".',
      keywords: ['credible threat', 'commitment game theory', 'Schelling Strategy of Conflict', 'entry deterrence game', 'credible promise', 'survival game alliance'],
    },
    title: 'Promises, threats and credibility',
    lead: 'Words are free. What makes them believable is a structure that forces you to keep them.',
    intro: [
      '"Name me and I’ll drag you down with me next round." "Help me now and I’ll save you next time." Survival games are full of threats and promises. Some move the game; others nobody pays attention to.',
      'Game theory explains the difference quite sharply, with one question: **"When the moment actually comes, will keeping the word be in the speaker’s interest?"** This article checks that question with a game tree and then looks at ways to make words believable.',
    ],
    summary: 'Only words that pay to keep when the moment comes are believable. The structures that make threats and promises credible.',
    sections: [
      {
        id: 'entry',
        title: 'The entry-deterrence game: an incredible threat',
        blocks: [
          { type: 'p', text: 'A neighbourhood has one shop (the incumbent). When a new shop considers opening, the incumbent’s owner says: "Open, and I will start a price war that ruins us both." Should the newcomer believe it?' },
          { type: 'table', head: ['Newcomer’s choice', 'Incumbent’s response', 'Result (newcomer, incumbent)'], rows: [
            ['Stay out', '—', '(0, 10)'],
            ['Enter', 'Price war', '(−2, 2)'],
            ['Enter', 'Accommodate (share the market)', '(3, 5)'],
          ], caption: 'The newcomer decides first; then the incumbent responds.' },
          { type: 'p', text: 'Reason [backwards](/game-theory/backward-induction). Once the newcomer is in, the incumbent prefers accommodating (5) to a price war (2). So "I will start a price war" is **a threat it would not carry out when the time comes**. A newcomer who knows this enters and gets 3. The result is (3, 5).' },
          { type: 'callout', tone: 'note', title: 'Why the threat alone fails', text: 'Had the threat worked, the incumbent would have kept 10, so the threat is worth a lot to it. But that value exists only if the newcomer believes it, and the newcomer can work out the incumbent’s later interests. A spoken threat does not change that later calculation.' },
        ],
      },
      {
        id: 'commitment',
        title: 'Commitment: winning by tying your own hands',
        blocks: [
          { type: 'p', text: 'To make the threat believable, the incumbent must **change its own later calculation**. Suppose that before the newcomer decides, it spends 2 on large stocks and big equipment. Idle equipment is a loss, so now, if the newcomer enters, a price war is actually the better choice.' },
          { type: 'table', head: ['Newcomer’s choice', 'Incumbent’s response', 'Result after the investment'], rows: [
            ['Stay out', '—', '(0, 8)'],
            ['Enter', 'Price war', '(−2, 4)'],
            ['Enter', 'Accommodate', '(3, 3)'],
          ], caption: 'After the investment (cost 2), a price war (4) beats accommodating (3) against an entrant.' },
          { type: 'p', text: 'Now the threat is real: if the newcomer enters, the incumbent really will fight, leaving the newcomer with −2. So the newcomer stays out and the incumbent gets 8. **It spent 2 to make its own options worse, and its result improved from 5 to 8.**' },
          { type: 'p', text: 'In The Strategy of Conflict (1960) Thomas Schelling put this paradox at the centre of bargaining theory: in negotiation, flexibility can be weakness, and **the side that cannot back down can be the stronger one**. It is the same logic as the driver who throws away the steering wheel in [chicken](/game-theory/chicken-game). Schelling shared the 2005 Nobel Memorial Prize in Economic Sciences with Robert Aumann, in part for this work.' },
          { type: 'callout', tone: 'warn', title: 'What commitment requires', text: 'A commitment works only if it is made **before** the other side decides, is **visible** to them, and is **irreversible**. A secret commitment, or one you can cancel at any time, does not change the other side’s calculation.' },
        ],
      },
      {
        id: 'promises',
        title: 'Devices that make promises believable',
        blocks: [
          { type: 'p', text: 'Like threats, promises are judged by whether keeping them pays when the time comes. In a survival game, "help me now and I’ll save you next time" is believable only if saving that player next round will also suit the promiser. Ways to make other promises believable:' },
          { type: 'list', items: [
            '**Repetition and reputation.** If you will keep meeting, breaking a promise costs you future cooperation. As in [tit-for-tat](/game-theory/tit-for-tat), promises hold when the future matters enough.',
            '**Public declarations.** Break a promise made in front of many people and you lose all of their trust. A higher cost of breaking it makes the promise firmer.',
            '**Giving first (hostages).** Hand over an item or information first, and you have something to lose if you do not follow through. That gives the other side a reason to believe you.',
            '**Delivering in instalments.** Exchange a big promise step by step instead of all at once, and the gain from betrayal at any step is small.',
          ] },
        ],
      },
      {
        id: 'chance',
        title: 'Threats that leave something to chance',
        blocks: [
          { type: 'p', text: 'Another of Schelling’s ideas is **the threat that leaves something to chance**. A threat to act for certain is hard to believe when acting would be very costly. A threat that "if this goes on, things may get out of control" is different: the speaker need not resolve to act, because the situation itself raises the risk.' },
          { type: 'p', text: 'Brinkmanship works this way: both sides raise the risk a little at a time and wait for the other to back down first. As the name says, the risk of actually going over the edge is real.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**When you hear a threat, ask "would they still do it then?"** If carrying it out would hurt the speaker too, it is usually bluster. But a player building a reputation may carry it out at a loss.',
            '**Build your threats into the structure in advance.** Rather than saying "name me and we both go", first show a situation where you will have no choice (you already promised publicly, your vote is already tied that way).',
            '**Make promises small, frequent and public.** Someone seen keeping many small promises earns trust at the decisive moment more than someone who made one big promise.',
            '**Look at costs, not words.** Costly actions (an item handed over first, a public declaration) tell you more than talk. That story continues in [Signals and cheap talk](/game-theory/signaling-cheap-talk).',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Thomas C. Schelling, The Strategy of Conflict, Harvard University Press, 1960' },
      { title: 'Reinhard Selten, "The Chain Store Paradox", Theory and Decision 9, 1978' },
      { title: 'Avinash Dixit, "The Role of Investment in Entry-Deterrence", Economic Journal 90(357), 1980' },
      { title: 'Roger B. Myerson, "Learning from Schelling’s Strategy of Conflict", Journal of Economic Literature 47(4), 2009', url: 'https://home.uchicago.edu/~rmyerson/stratofc2010.pdf' },
      { title: 'The Nobel Prize in Economic Sciences 2005 (Aumann, Schelling)', url: 'https://www.nobelprize.org/prizes/economic-sciences/2005/summary/' },
    ],
  },
};

export default article;
