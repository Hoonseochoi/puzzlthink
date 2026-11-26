import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'project-galaxy',
  kind: 'money',
  when: { ko: '7일차', en: 'Day 7' },
  related: ['starbattle', 'russianRoulette', 'gradation'],
  updated: '2026-11-26',
  sources: [namuDay('7'), broadcast],
  ko: {
    meta: {
      title: '프로젝트 갤럭시 규칙 — 피의 게임X 7일차 머니 챌린지, 숨은 천체 추리와 블랙홀',
      description: '피의 게임X 7일차 머니 챌린지 프로젝트 갤럭시의 규칙을 정리했어요. 16칸 원형 섹터와 일곱 가지 천체, 천체별 위치 단서와 점수, 이웃 섹터로만 이동, 코인으로 하는 관측·추가 이동·블랙홀 베팅·점수 확인, 익명 결과 발표와 데스매치 진출까지.',
      keywords: ['프로젝트 갤럭시', '피의 게임X 프로젝트 갤럭시', '피의게임X 머니 챌린지', '추리 보드게임', '피의게임X'],
    },
    title: '프로젝트 갤럭시 — 피의 게임X 7일차 머니 챌린지',
    name: '프로젝트 갤럭시',
    lead: '원형으로 놓인 16개 섹터 어딘가에 천체가 숨어 있어요. 관측으로 위치를 좁히고, 점수가 나는 섹터에 머물러야 해요.',
    summary: '16개 섹터에 숨은 일곱 종류의 천체를 관측으로 추리해 점수 나는 곳에 머무르고, 블랙홀로 점수를 뒤집는 10인 개인전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 10명 개인전.',
        '**게임판**: 1–16번 섹터가 원형으로 이어져 있어요(16번 옆은 1번).',
        '**천체**: 혜성 3, 행성 1, 위성 2, 쌍둥이구름 4, 왜소행성 2, 별 1, 우주먼지 3 — 모두 16개가 섹터마다 하나씩 비공개로 숨어 있어요.',
        '**코인**: 각자 30개. 주고받거나 버릴 수 없어요.',
        '**라운드**: 10라운드, 라운드마다 30분.',
      ] },
      { type: 'table', head: ['천체', '위치 단서', '그 섹터를 고른 사람의 점수'], rows: [
        ['별 (1)', '왜소행성과 이웃하지 않고, 관측하면 우주먼지로 보여요.', '+5. 누가 점수를 얻을 때마다 에너지가 1 쌓이고, 4가 되면 초신성(−5)으로 변해요.'],
        ['행성 (1) · 위성 (2)', '셋 모두 연속된 8섹터 안에 모여 있어요.', '행성과 위성 중 사람이 더 많은 쪽 +3. 인원이 같으면 모두 −3.'],
        ['혜성 (3)', '짝수 섹터에만 있어요.', '혜성 섹터에 **혼자** 있어야 점수. 5점을 혜성 위의 사람 수로 나눠요(1명 +5, 2명 +2, 3명 +1).'],
        ['쌍둥이구름 (4)', '적어도 두 개씩 서로 이웃해 있어요.', '사람이 있는 구름 섹터 수만큼 +1–3. 네 곳 모두에 사람이 있으면 −3.'],
        ['왜소행성 (2)', '별과 이웃하지 않아요.', '−2.'],
        ['우주먼지 (3)', '—', '0.'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '힌트', body: '홀수 라운드가 시작되면 1분 동안 천체 위치에 대한 힌트가 전체 공지돼요(1라운드는 시작 전).' },
        { title: '섹터 고르기', body: '라운드마다 투표룸에서 머물 섹터를 골라요. 1라운드는 자유, 2라운드부터는 **직전 섹터의 이웃 한 곳**으로만 옮길 수 있어요. 시간 안에 못 고르면 −5점이에요.' },
        { title: '관측 (코인)', body: '연속된 8섹터를 정해 그 안에 특정 천체가 몇 개 있는지 물어요. 섹터 하나당 코인 1개로 범위를 좁힐 수 있어요. 1–8라운드는 관측 범위가 정해져 있고, 9–10라운드는 자유예요.' },
        { title: '추가 이동 (코인)', body: '이웃보다 멀리 가려면 한 칸 더 갈 때마다 코인 1개를 내요. 섹터를 고를 때 함께 처리해요.' },
        { title: '블랙홀 베팅 (코인)', body: '블랙홀은 1번 섹터에서 시작해 라운드마다 시계 방향으로 한 칸씩 가요. 블랙홀이 있는 섹터와 양옆, 모두 세 섹터의 **점수 변동이 반대로** 뒤집혀요. 코인을 걸어 블랙홀을 더 옮길 수 있고, 가장 많이 건 사람의 선택을 따라요.' },
        { title: '점수 확인 (코인)', body: '코인을 내면 내 누적 점수를 볼 수 있어요. 1라운드는 10개, 라운드마다 1개씩 싸져요.' },
      ] },
      { type: 'p', text: '라운드가 끝나면 블랙홀까지 반영한 점수 결과가 발표되지만, 이름은 알파벳으로 가려져 자기 것 말고는 누구인지 알 수 없어요.' },
    ],
    win: [
      { type: 'list', items: [
        '승점 1위가 우승해 탈락 면제권 2장(한 장은 최하위 두 명이 아닌 다른 사람에게 줄 수 있어요)과 개인 자금 2,000만 원을 받아요.',
        '**최하위 2명은 데스매치 확정**이고, 각자 면제권이 없는 사람 한 명씩을 지목해요. 투표로 정해진 한 명까지 모두 3명이 데스매치에 나가요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '동점이면 남은 코인이 많은 쪽, 그것도 같으면 개인 자금이 많은 쪽이 위예요.',
        '시간이 끝날 때 투표룸 앞에 줄을 서 있었다면 제때 들어간 것으로 쳐요.',
        '블랙홀 베팅이 동률이면 그다음으로 많이 건 사람의 선택을 따라요.',
        '아이템(1,000만 원): **위치 확인권**(한 명이 지난 라운드에 머문 섹터 확인), **추가 코인 5개**.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '프로젝트 갤럭시는 **추리 퍼즐 위에 다른 사람의 위치라는 변수**를 얹은 게임이에요. 천체의 위치는 고정된 정답이지만, 점수는 누가 어디에 함께 있느냐에 따라 달라져요.' },
      { type: 'cards', items: [
        { title: '단서끼리 겹쳐 좁히기', body: '혜성은 짝수 섹터에만, 행성·위성은 8섹터 안에, 쌍둥이구름은 둘씩 붙어 있고, 별과 왜소행성은 서로 떨어져 있어요. 이 조건들을 겹치면 관측 몇 번으로도 후보가 크게 줄어요. 별은 관측에서 우주먼지로 보이므로, "우주먼지가 4개로 보이는 범위"에 별이 있다는 식의 추리가 가능해요.' },
        { title: '좋은 섹터는 붐벼요', body: '혜성은 혼자여야 하고, 행성과 위성은 인원이 같으면 모두 잃어요. 별은 여럿이 같이 먹을 수 있지만 그만큼 빨리 초신성이 돼요. 정답을 아는 것만으로는 부족하고, 남들이 같은 정답을 알고 몰려올지까지 읽어야 해요.' },
        { title: '블랙홀은 공격 수단', body: '블랙홀은 세 섹터의 점수를 뒤집어요. 사람이 몰린 +5 섹터에 블랙홀을 옮기면 모두 −5가 돼요. 결과가 익명이라 누가 피해를 봤는지는 모르지만, 1위를 막거나 최하위를 피하는 데 직접 쓰일 수 있어요. 코인은 관측과 블랙홀에 함께 쓰여서, 정보를 살지 판을 흔들지 선택해야 해요.' },
        { title: '이동 제한이 미래를 묶어요', body: '이웃으로만 옮길 수 있어서 지금 서 있는 곳이 다음 라운드의 선택지를 정해요. 멀리 있는 좋은 섹터로 가려면 코인이 들어요. 몇 라운드 앞을 내다보고 "좋은 섹터 근처"에 미리 자리를 잡는 것이 코인을 아끼는 길이에요.' },
        { title: '익명 결과의 의미', body: '점수표가 익명이라 누가 앞서는지 모르고, 내 점수도 코인을 내야 볼 수 있어요. 데스매치는 최하위 2명이 지목으로 사람을 끌어들이는 구조라, 점수만큼이나 다른 사람과의 관계가 결과를 바꿔요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '행성 X를 찾아서 (The Search for Planet X)', players: '1–4명', alike: '원형으로 나뉜 하늘 구역에 숨은 천체들을 "이 범위에 ○○가 몇 개?" 관측과 위치 규칙으로 추리해 찾는 게임이에요. 프로젝트 갤럭시와 가장 닮았어요.', differs: '행성 X를 찾아서는 앱이 정답을 관리하고, 먼저 행성 X를 정확히 찾는 사람이 이겨요. 다른 사람의 위치가 점수에 영향을 주지 않아요.' },
      { name: '크립티드 (Cryptid)', players: '3–5명', alike: '서로 다른 단서를 겹쳐 지도 위의 숨은 위치를 하나로 좁히는 추리 게임이에요.', differs: '크립티드는 각자 단서 하나씩만 갖고, 질문으로 다른 사람의 단서를 알아내요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 라운드별 관측 범위와 공지된 힌트, 히든 아이템은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Project Galaxy rules — The Bloody Game X, day 7 money challenge (hidden celestial bodies and a black hole)',
      description: 'The rules of Project Galaxy from The Bloody Game X (피의 게임X): sixteen sectors in a ring and seven kinds of hidden bodies, their placement clues and scores, moving only to neighbours, spending coins on observation, extra moves, black-hole bets and score checks, anonymous results and the death match.',
      keywords: ['Project Galaxy', 'Bloody Game X Project Galaxy', 'deduction board game', '피의 게임X'],
    },
    title: 'Project Galaxy — The Bloody Game X, day 7 money challenge',
    name: 'Project Galaxy',
    lead: 'Celestial bodies hide somewhere in sixteen sectors arranged in a ring. Observe to narrow them down and stay where the points are.',
    summary: 'Ten players deduce seven kinds of hidden bodies in sixteen sectors, stay where they score, and use a black hole to flip scores.',
    setup: [
      { type: 'list', items: [
        '**Players**: ten, each for themselves.',
        '**Board**: sectors 1–16 in a ring (16 neighbours 1).',
        '**Bodies**: 3 comets, 1 planet, 2 moons, 4 twin clouds, 2 dwarf planets, 1 star, 3 dust — sixteen, one hidden in each sector.',
        '**Coins**: 30 each, not transferable.',
        '**Rounds**: ten of 30 minutes.',
      ] },
      { type: 'table', head: ['Body', 'Placement clue', 'Score for those in its sector'], rows: [
        ['Star (1)', 'Not next to a dwarf planet; observed as dust.', '+5; each round it scores, its energy rises by one, and at 4 it becomes a supernova (−5).'],
        ['Planet (1) · moons (2)', 'All three within eight consecutive sectors.', '+3 to whichever of planet or moons has more people; a tie costs everyone 3.'],
        ['Comet (3)', 'Only in even sectors.', 'Score only alone on a comet; 5 points shared by everyone on comets (1: +5, 2: +2, 3: +1).'],
        ['Twin cloud (4)', 'In adjacent pairs at least.', '+1 to +3 by how many cloud sectors are occupied; all four occupied costs 3.'],
        ['Dwarf planet (2)', 'Not next to the star.', '−2.'],
        ['Dust (3)', '—', '0.'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Hints', body: 'At the start of odd rounds a one-minute hint about the bodies is announced (before round 1 for the first).' },
        { title: 'Choose a sector', body: 'In the voting room, choose where to stay: freely in round 1, afterwards **only a neighbour** of your last sector. No choice in time costs 5 points.' },
        { title: 'Observe (coins)', body: 'Ask how many of a body lie in eight consecutive sectors, narrowing the range for a coin per sector. Rounds 1–8 have set ranges; 9–10 are free.' },
        { title: 'Extra move (coins)', body: 'Each step beyond a neighbour costs a coin, handled with the sector choice.' },
        { title: 'Black-hole bet (coins)', body: 'A black hole starts at sector 1 and moves one sector clockwise each round, **reversing score changes** in its sector and both neighbours. Coins can move it further; the biggest bettor decides.' },
        { title: 'Score check (coins)', body: 'Pay to see your running score: 10 coins in round 1, one fewer each round.' },
      ] },
      { type: 'p', text: 'Results, black hole included, are announced each round under letter aliases; you only know which letter is you.' },
    ],
    win: [
      { type: 'list', items: [
        'The top scorer wins two immunity passes (one may go to anyone other than the bottom two) and ₩20 million.',
        '**The bottom two go to the death match**; each names a player without immunity, and a vote adds one more — three in all.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Ties go to more coins left, then more personal funds.',
        'Anyone queuing at the voting room when time runs out counts as on time.',
        'Tied black-hole bets follow the next-biggest bettor.',
        'Items (₩10 million): **location check** (where one player stayed last round) and **five extra coins**.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Project Galaxy puts **other people’s positions** on top of a deduction puzzle: the bodies are a fixed answer, but scores depend on who stands where with you.' },
      { type: 'cards', items: [
        { title: 'Overlap the clues', body: 'Comets on even sectors, planet and moons within eight, clouds in pairs, star and dwarfs apart — combined, a few observations cut the candidates hard. The star reads as dust, so a range showing four "dust" hides the star.' },
        { title: 'Good sectors get crowded', body: 'Comets must be held alone; planet and moons punish ties; the star feeds many but turns supernova faster. Knowing the answer is not enough — you must guess whether others know it too.' },
        { title: 'The black hole is a weapon', body: 'It reverses three sectors’ scores: move it onto a crowded +5 and everyone there takes −5. Results are anonymous, but it can stop a leader or save you from the bottom. Coins fund both observation and the black hole — information or disruption.' },
        { title: 'Movement limits bind the future', body: 'Only neighbours are free, so where you stand shapes next round’s options; distant good sectors cost coins. Settling near future good sectors in advance saves coins.' },
        { title: 'Anonymous results', body: 'You do not know who leads, and your own score costs coins to see. With the bottom two pulling others into the death match by nomination, relationships matter as much as points.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'The Search for Planet X', players: '1–4', alike: 'Deduce hidden bodies in sectors of a circular sky with "how many X in this range?" surveys and placement rules — Project Galaxy’s closest relative.', differs: 'An app manages the answer, the first to locate Planet X wins, and others’ positions never affect your score.' },
      { name: 'Cryptid', players: '3–5', alike: 'Overlap different clues to narrow a hidden location on a map to one spot.', differs: 'Each player holds one clue, discovered by others through questions.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The set observation ranges, announced hints and hidden item are not described.',
  },
};

export default game;
