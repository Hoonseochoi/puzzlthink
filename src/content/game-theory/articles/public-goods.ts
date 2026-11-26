import type { GTArticle } from '../types';

const article: GTArticle = {
  slug: 'public-goods',
  category: 'cooperation',
  updated: '2026-11-26',
  games: ['russianRoulette'],
  related: ['prisoners-dilemma', 'tit-for-tat', 'stag-hunt', 'ultimatum-game'],
  ko: {
    meta: {
      title: '공유지의 비극과 공공재 게임 — 무임승차는 왜 생기고 어떻게 막을까 | PUZZLTHINK 게임 이론',
      description: '모두가 조금씩 내면 모두가 이득인데 왜 아무도 안 낼까요? 공공재 게임을 숫자로 풀고, 실험에서 기여가 줄어드는 패턴, 처벌의 효과, 하딘의 공유지의 비극과 오스트롬의 반론, 러시안 룰렛의 숨은 조작 기금까지.',
      keywords: ['공유지의 비극', '공공재 게임', '무임승차', '엘리너 오스트롬', '게임 이론 협력', '러시안 룰렛 조작'],
    },
    title: '공유지의 비극과 공공재 게임',
    lead: '사람이 많아진 죄수의 딜레마. 누가 비용을 내고 누가 무임승차할까.',
    intro: [
      '단체 채팅방에서 회비를 걷는다고 생각해 보세요. 모두가 내면 다 같이 좋은 걸 할 수 있지만, 나 한 명이 안 낸다고 행사가 취소되지는 않아요. 그렇다면 "나 하나쯤이야"라는 생각이 드는 건 자연스러워요. 문제는 모두가 같은 생각을 한다는 거예요.',
      '이것이 **공공재 게임**이고, 공용 자원을 다 같이 써 버리는 쪽에서 보면 **공유지의 비극**이에요. 둘 다 [죄수의 딜레마](/game-theory/prisoners-dilemma)를 여러 사람으로 넓힌 구조예요.',
    ],
    summary: '모두가 내면 모두가 이득인데 아무도 안 내는 구조. 실험 결과와 처벌, 오스트롬의 해법까지.',
    sections: [
      {
        id: 'model',
        title: '공공재 게임의 숫자',
        blocks: [
          { type: 'p', text: '네 명이 각자 10칩을 받아요. 각자 원하는 만큼 공동 기금에 넣고, 기금은 1.6배가 되어 네 명에게 똑같이 나눠져요. 넣지 않은 칩은 자기 것으로 남아요.' },
          { type: 'table', head: ['상황', '나의 최종 칩', '다른 사람 각자'], rows: [
            ['아무도 안 냄', '10', '10'],
            ['모두 10칩씩 냄', '16 (기금 40 × 1.6 ÷ 4)', '16'],
            ['나만 안 내고 셋은 냄', '**22** (내 10 + 기금 30 × 1.6 ÷ 4)', '12'],
            ['나만 내고 셋은 안 냄', '4 (기금 10 × 1.6 ÷ 4)', '14'],
          ], caption: '칩 1개를 넣으면 기금에서 나에게 돌아오는 건 1.6 ÷ 4 = 0.4칩뿐이에요.' },
          { type: 'p', text: '내가 칩 하나를 넣으면 전체로는 1.6칩이 생기지만 나에게 돌아오는 건 0.4칩이에요. 다른 사람이 얼마를 넣든 이 계산은 같아요. 그러니 점수만 따지면 **아무것도 안 내는 것이 우월 전략**이고, 균형은 모두 0칩을 내는 거예요. 그런데 모두 10칩씩 내면 각자 16칩으로, 균형(10칩)보다 훨씬 나아요. 개인의 합리성과 집단의 이익이 어긋나는 딜레마예요.' },
          { type: 'callout', tone: 'note', title: '공유지의 비극은 거울상이에요', text: '공공재 게임이 "좋은 것에 기여하기"라면 공유지의 비극은 "공용 자원을 덜 쓰기"예요. 생물학자 개릿 하딘은 1968년 사이언스에 실은 글에서, 누구나 소를 풀어 놓을 수 있는 공용 목초지에서는 소 한 마리를 더 풀 때의 이익은 내가 다 갖고 풀이 줄어드는 피해는 모두가 나눠 지기 때문에 결국 목초지가 망가진다고 주장했어요.' },
        ],
      },
      {
        id: 'experiments',
        title: '실험실의 사람들',
        blocks: [
          { type: 'p', text: '공공재 게임은 실험경제학에서 가장 많이 연구된 게임 중 하나예요. 결과에는 꽤 일관된 패턴이 있어요.' },
          { type: 'list', items: [
            '**처음에는 꽤 많이 내요.** 균형 예측(0)과 달리 첫 라운드에서 사람들은 가진 것의 상당한 몫을 넣어요.',
            '**반복할수록 줄어들어요.** 같은 게임을 여러 번 하면 기여가 점점 줄어 0에 가까워지는 경향이 있어요. 많이 낸 사람이 무임승차자를 보고 실망해 기여를 줄이는 "조건부 협력"이 그 이유 중 하나로 꼽혀요.',
            '**처벌할 수 있으면 달라져요.** 에른스트 페르와 지몬 개히터는 2000년 연구에서, 기여 뒤에 자기 비용을 들여 다른 사람의 점수를 깎을 수 있게 하자 기여가 높게 유지되는 것을 보였어요. 처벌은 처벌하는 사람에게도 손해인데도 많은 사람이 기꺼이 무임승차자를 벌했어요.',
          ] },
          { type: 'callout', tone: 'warn', title: '처벌이 만능은 아니에요', text: '처벌은 비용이 들고, 처벌받은 사람이 보복하거나 오히려 많이 낸 사람을 벌하는 경우도 연구에서 보고돼요. 처벌이 협력을 지키는 효과는 규칙의 세부와 집단의 문화에 따라 크게 달라요.' },
        ],
      },
      {
        id: 'ostrom',
        title: '비극은 피할 수 없을까: 오스트롬의 답',
        blocks: [
          { type: 'p', text: '하딘은 해법으로 정부 규제나 사유화를 제시했어요. 정치경제학자 엘리너 오스트롬은 1990년 책 『공유의 비극을 넘어(Governing the Commons)』에서 세 번째 길을 보여 줬어요. 세계 곳곳의 어장, 목초지, 관개 시설을 조사해 보니, 많은 공동체가 외부의 강제 없이 스스로 규칙을 만들어 공용 자원을 오랫동안 지켜 왔던 거예요. 오스트롬은 이 연구로 2009년 노벨 경제학상을 받았어요.' },
          { type: 'p', text: '오스트롬이 발견한, 잘 유지되는 공유지의 공통점을 몇 가지만 간추리면 이래요.' },
          { type: 'list', items: [
            '누가 자원을 쓸 수 있는지 **경계가 분명해요.**',
            '규칙을 쓰는 사람들이 **규칙을 정하는 데 참여해요.**',
            '서로의 사용을 **지켜볼 수 있고**, 어기면 처음엔 가볍게, 반복되면 무겁게 **단계적으로 제재해요.**',
            '분쟁이 생기면 **값싸게 해결할 수 있는** 자리가 있어요.',
          ] },
          { type: 'p', text: '하딘도 훗날 자신이 말한 건 "관리되지 않는 공유지의 비극"이었다는 취지로 설명을 보탰어요. 공유지 자체가 아니라, 규칙과 감시가 없는 공유지가 문제라는 거예요.' },
        ],
      },
      {
        id: 'russian-roulette',
        title: '러시안 룰렛의 숨은 조작 기금',
        blocks: [
          { type: 'p', text: 'PUZZLTHINK의 [러시안 룰렛](/russian-roulette)에는 공공재 게임과 닮았지만 결정적으로 비틀린 장치가 있어요. 여섯 명이 크레딧을 써서 약실을 조사하거나 총구를 돌리는데, "조작"을 고르면 1~3크레딧을 **아무도 모르는 공동 기금**에 넣어요. 기금을 **6에 도달시킨 사람**이 원하는 약실 한 쌍을 맞바꾸고, 기금은 비워지며, 6을 넘친 크레딧은 사라져요. 그리고 이 사실은 사격이 끝날 때까지 아무에게도 공개되지 않아요.' },
          { type: 'list', items: [
            '**먼저 낸 사람이 손해예요.** 앞사람들이 쌓아 둔 기금은 마지막에 6을 채운 사람의 선택으로 쓰여요. 보통 공공재 게임은 "내 기여가 모두에게" 가지만, 여기서는 "남의 기여가 마지막 사람에게" 가요.',
            '**기금 규모를 모르니 계산이 어려워요.** 기금이 지금 얼마인지 아무도 몰라서, 내가 낸 크레딧이 문턱을 넘길지, 헛되이 사라질지 알 수 없어요. 넘친 크레딧은 버려지니 크게 낼수록 낭비 위험도 커요.',
            '**정보가 몰래 낡아요.** 누군가 약실을 바꾸면, 앞서 조사한 사람들의 정보가 아무도 모르게 틀려져요. 남의 조사 결과에 무임승차하는 전략에도 위험이 생기는 거예요.',
          ] },
          { type: 'callout', tone: 'tip', title: '러시안 룰렛에서 써먹기', text: '다른 사람의 비공개 행동은 기록에 "비공개 행동"으로만 남아서, 그게 비공개 조사인지 조작인지는 알 수 없어요. 그래도 비공개 행동이 여러 번 쌓였다면 기금이 문턱 근처일 가능성을 따져 보고, 그때 내가 마무리하는 편이 효율적이에요. 반대로 혼자 일찍 많이 넣는 건 남 좋은 일을 해 줄 위험이 커요.' },
        ],
      },
      {
        id: 'in-games',
        title: '게임에서 써먹기',
        blocks: [
          { type: 'list', items: [
            '**기여가 보이게 만드세요.** 서바이벌 게임에서 공동 목표가 있다면, 누가 얼마나 냈는지 공개하자고 제안하세요. 보이는 것만으로 무임승차가 줄어요.',
            '**작은 단위로 약속하세요.** 다섯 명이 한꺼번에 약속하는 것보다 두세 명씩 짝을 지어 서로를 확인하는 편이 지키기 쉬워요.',
            '**반복을 활용하세요.** 다음 라운드가 있다면 이번에 무임승차한 사람을 다음 공동 작업에서 빼는 것도 일종의 단계적 제재예요.',
            '**문턱이 있다면 마지막 한 칸의 가치가 커요.** 일정 금액을 넘어야 효과가 생기는 구조에서는 문턱을 넘기는 마지막 기여가 가장 결정적이에요. 그 순간을 누가 차지하는지 지켜보세요.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Garrett Hardin, "The Tragedy of the Commons", Science 162, 1968' },
      { title: 'Elinor Ostrom, Governing the Commons: The Evolution of Institutions for Collective Action, Cambridge University Press, 1990' },
      { title: 'Ernst Fehr, Simon Gächter, "Cooperation and Punishment in Public Goods Experiments", American Economic Review 90(4), 2000' },
      { title: 'John O. Ledyard, "Public Goods: A Survey of Experimental Research", The Handbook of Experimental Economics, Princeton University Press, 1995' },
      { title: 'The Nobel Prize in Economic Sciences 2009 (Ostrom, Williamson)', url: 'https://www.nobelprize.org/prizes/economic-sciences/2009/summary/' },
      { title: 'PUZZLTHINK 러시안 룰렛 규칙 (게임 화면의 규칙 설명)' },
    ],
  },
  en: {
    meta: {
      title: 'The tragedy of the commons and the public goods game — why free riding happens and how to stop it | PUZZLTHINK',
      description: 'If everyone chipped in a little, everyone would gain, so why does nobody? The public goods game in numbers, the declining-contribution pattern in experiments, the effect of punishment, Hardin’s tragedy of the commons and Ostrom’s answer, and Russian Roulette’s hidden manipulation fund.',
      keywords: ['tragedy of the commons', 'public goods game', 'free rider problem', 'Elinor Ostrom', 'cooperation game theory', 'Russian roulette game'],
    },
    title: 'The tragedy of the commons and the public goods game',
    lead: 'The prisoner’s dilemma with many players. Who pays, and who rides free?',
    intro: [
      'Picture a group chat collecting money for an event. If everyone pays, everyone gets something nice, but the event will not be cancelled because one person skipped. "Surely nobody will miss my share" is a natural thought. The trouble is that everyone thinks it.',
      'That is the **public goods game**; seen from the side of a shared resource being used up, it is the **tragedy of the commons**. Both extend [the prisoner’s dilemma](/game-theory/prisoners-dilemma) to many people.',
    ],
    summary: 'Everyone gains if everyone pays, yet nobody pays. Experiments, punishment and Ostrom’s solutions.',
    sections: [
      {
        id: 'model',
        title: 'The numbers of a public goods game',
        blocks: [
          { type: 'p', text: 'Four players get 10 chips each. Each puts as many as they like into a common fund, which is multiplied by 1.6 and shared equally among the four. Chips not contributed are kept.' },
          { type: 'table', head: ['Situation', 'My final chips', 'Each other player'], rows: [
            ['Nobody contributes', '10', '10'],
            ['Everyone contributes 10', '16 (fund 40 × 1.6 ÷ 4)', '16'],
            ['Everyone but me contributes', '**22** (my 10 + fund 30 × 1.6 ÷ 4)', '12'],
            ['Only I contribute', '4 (fund 10 × 1.6 ÷ 4)', '14'],
          ], caption: 'Each chip I contribute returns only 1.6 ÷ 4 = 0.4 chips to me.' },
          { type: 'p', text: 'A chip I contribute creates 1.6 chips in total but returns only 0.4 to me, whatever the others do. Counting points only, **contributing nothing is a dominant strategy**, and the equilibrium is that nobody contributes. Yet if everyone gave 10, each would end with 16, far better than the equilibrium’s 10. Individual rationality and the group’s interest pull apart.' },
          { type: 'callout', tone: 'note', title: 'The commons is the mirror image', text: 'The public goods game is about contributing to something good; the tragedy of the commons is about holding back from a shared resource. In a 1968 essay in Science the biologist Garrett Hardin argued that on a pasture open to all, each herder keeps the whole gain from one more cow while the damage to the grass is shared by everyone, so the pasture ends up ruined.' },
        ],
      },
      {
        id: 'experiments',
        title: 'People in the laboratory',
        blocks: [
          { type: 'p', text: 'The public goods game is one of the most studied games in experimental economics, and the results show a fairly consistent pattern.' },
          { type: 'list', items: [
            '**People start by giving quite a lot.** Unlike the equilibrium prediction (zero), first-round contributions are a substantial share of what people have.',
            '**Giving falls with repetition.** Played over many rounds, contributions tend to decline towards zero. One reason often given is "conditional cooperation": generous contributors see free riders and cut back.',
            '**Punishment changes things.** In a 2000 study Ernst Fehr and Simon Gächter let players pay to reduce others’ earnings after contributing, and contributions stayed high. Punishing cost the punisher too, yet many people were willing to punish free riders.',
          ] },
          { type: 'callout', tone: 'warn', title: 'Punishment is no cure-all', text: 'Punishment is costly, and studies also report punished players retaliating or even punishing high contributors. How well punishment protects cooperation depends heavily on the details of the rules and on the group’s culture.' },
        ],
      },
      {
        id: 'ostrom',
        title: 'Is the tragedy inevitable? Ostrom’s answer',
        blocks: [
          { type: 'p', text: 'Hardin proposed government regulation or private property as remedies. The political economist Elinor Ostrom showed a third way in her 1990 book Governing the Commons. Studying fisheries, pastures and irrigation systems around the world, she found many communities that had set their own rules, without outside coercion, and kept shared resources going for a long time. She received the 2009 Nobel Memorial Prize in Economic Sciences for this work.' },
          { type: 'p', text: 'A few of the features she found in long-lived commons:' },
          { type: 'list', items: [
            '**Clear boundaries** on who may use the resource.',
            'The people bound by the rules **take part in making them**.',
            'Use **can be monitored**, and violations meet **graduated sanctions**: light at first, heavier when repeated.',
            'There are **cheap ways to resolve disputes**.',
          ] },
          { type: 'p', text: 'Hardin himself later clarified that what he had described was the tragedy of the *unmanaged* commons: the problem is not shared resources as such but shared resources without rules or monitoring.' },
        ],
      },
      {
        id: 'russian-roulette',
        title: 'Russian Roulette’s hidden manipulation fund',
        blocks: [
          { type: 'p', text: 'PUZZLTHINK’s [Russian Roulette](/russian-roulette) has a device that resembles a public goods game with a decisive twist. Six players spend credits to inspect chambers or turn the muzzle; choosing "manipulate" puts 1–3 credits into a **shared fund nobody can see**. The player **whose payment brings the fund to 6** swaps a pair of chambers of their choice, the fund empties, and credits beyond 6 are lost. Nobody is told any of this until the shots are fired.' },
          { type: 'list', items: [
            '**Paying early is a loss.** The fund built up by earlier payers is spent on the choice of whoever completes it. In an ordinary public goods game "my contribution goes to everyone"; here "others’ contributions go to the last payer".',
            '**Nobody knows the fund’s size.** You cannot tell whether your credits will cross the threshold or vanish, and since overflow is discarded, paying more risks more waste.',
            '**Information goes stale in secret.** When someone swaps chambers, earlier inspections become wrong without anyone knowing. Free riding on other players’ inspections carries a risk too.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Using it in Russian Roulette', text: 'Other players’ private moves appear in the log only as "private actions", so you cannot tell a private inspection from a manipulation. Still, when private actions pile up, consider that the fund may be near the threshold, and finish it yourself then. Paying in a lot, early and alone, risks doing someone else a favour.' },
        ],
      },
      {
        id: 'in-games',
        title: 'Using it in games',
        blocks: [
          { type: 'list', items: [
            '**Make contributions visible.** If a survival game has a shared target, propose that everyone’s contribution be public. Visibility alone reduces free riding.',
            '**Make promises in small units.** Pairs or threes checking on each other keep promises more easily than five people promising at once.',
            '**Use repetition.** If there is a next round, leaving this round’s free rider out of the next joint effort is a graduated sanction of sorts.',
            '**With a threshold, the last step is worth the most.** Where an effect kicks in only above a set amount, the contribution that crosses the threshold is decisive. Watch who takes that moment.',
          ] },
        ],
      },
    ],
    refs: [
      { title: 'Garrett Hardin, "The Tragedy of the Commons", Science 162, 1968' },
      { title: 'Elinor Ostrom, Governing the Commons: The Evolution of Institutions for Collective Action, Cambridge University Press, 1990' },
      { title: 'Ernst Fehr, Simon Gächter, "Cooperation and Punishment in Public Goods Experiments", American Economic Review 90(4), 2000' },
      { title: 'John O. Ledyard, "Public Goods: A Survey of Experimental Research", The Handbook of Experimental Economics, Princeton University Press, 1995' },
      { title: 'The Nobel Prize in Economic Sciences 2009 (Ostrom, Williamson)', url: 'https://www.nobelprize.org/prizes/economic-sciences/2009/summary/' },
      { title: 'PUZZLTHINK Russian Roulette rules (shown in the game)' },
    ],
  },
};

export default article;
