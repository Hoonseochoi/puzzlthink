import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'mystery-time-2',
  kind: 'money',
  when: { ko: '3일차', en: 'Day 3' },
  related: ['hiddenWord', 'equationSignal', 'piggyBank'],
  updated: '2026-11-26',
  sources: [namuDay('3'), broadcast],
  ko: {
    meta: {
      title: '미스터리 타임 2 규칙 — 피의 게임X 3일차 머니 챌린지, 바다거북 수프식 추리',
      description: '피의 게임X 3일차 머니 챌린지 미스터리 타임 Ⅱ의 규칙을 정리했어요. 사건 문제와 정답 키워드, 질문 1개당 1분, 네·아니오·그럴 수도·중요하지 않음 답변, 정답 발의와 5분 벌칙, 2배로 시간이 흐르는 시간의 방, 순위와 데스매치 진출자 결정까지.',
      keywords: ['미스터리 타임', '미스터리 타임 2', '피의 게임X 미스터리 타임', '피의게임X 머니 챌린지', '바다거북 수프', '피의게임X'],
    },
    title: '미스터리 타임 Ⅱ — 피의 게임X 3일차 머니 챌린지',
    name: '미스터리 타임 Ⅱ',
    lead: '수수께끼 같은 사건 하나. 딜러에게 질문해 원인과 결과를 맞히되, 질문할 때마다 내 시간이 쌓여요.',
    summary: '질문으로 사건의 인과관계를 추리하는 팀 대결. 질문과 오답이 개인의 누적 시간을 늘리고, 그 시간이 데스매치를 정해요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 다섯 팀 전원. 2라운드는 1라운드 정답 팀을 뺀 네 팀.',
        '**문제**: 사건을 설명하는 문제와 그림, 정답에 들어가야 할 키워드의 개수가 공개돼요.',
        '**시간**: 라운드가 시작되면 모든 플레이어의 개인 시간이 흐르기 시작해요. 이 누적 시간이 이 게임의 "점수"예요(적을수록 좋아요).',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '질문하기', body: '투표 룸에 한 번 들어가면 질문을 3개까지 할 수 있고, 질문 하나마다 내 시간에 1분이 더해져요. 딜러는 네 가지로만 답해요. 사실만 담기면 "네", 거짓만 담기면 "아니오", 사실과 거짓이 섞이면 "그럴 수도 있습니다", 풀이에 필요 없으면 "중요하지 않습니다".' },
        { title: '정답 발의', body: '답을 말하면 세 가지로 판정돼요. 인과관계가 맞고 키워드가 모두 있으면 **정답**, 틀린 내용이 있으면 **오답**, 인과관계는 맞는데 키워드가 빠지면 **키워드 부족**이에요. 정답이면 그 팀 전원의 시간이 멈추고, 아니면 내 시간에 5분이 더해져요.' },
        { title: '시간의 방', body: '시작 30분 뒤에 열려요. 그림 힌트가 있고 30분마다 새 그림이 추가돼요. 들어가는 순간부터 내 시간이 **2배 속도**로 흘러요. 팀당 한 명씩만, 필기 없이 들어갈 수 있어요.' },
        { title: '1라운드 → 2라운드', body: '1라운드는 첫 정답 팀이 나오면 끝나고, 그 팀이 최종 1위예요. 나머지 네 팀은 누적 시간을 그대로 이어 2라운드를 해요. 2라운드에는 시간의 방이 닫힌 뒤 30분마다 문장 힌트가 더 나와요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '2라운드에서 정답을 맞힌 순서대로 2–4위, 끝까지 못 맞힌 팀이 5위예요.',
        '1위 팀은 팀 자금 5,000만 원과 추가 투표권 1장을 받고, **상위 두 팀은 전원 탈락 면제**예요. 5위 팀은 외부 생존지로 나가요.',
        '**데스매치 진출자**: 5위 팀에서 누적 시간이 가장 많은 사람이 첫 번째 진출자예요. 3·4위 팀에서는 각각 누적 시간이 가장 적은 사람이 후보가 되고, 투표로 두 번째 진출자가 정해져요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '아이템(팀 자금 1,000만 원): **그림 힌트 다시보기권**(시간의 방 힌트 하나를 다시 보기), **키워드 확인권**(키워드 하나가 맞는지 확인).',
        '3·4위 팀에서는 시간이 **가장 적은** 사람이 후보라는 점이 5위 팀과 반대예요. 가장 덜 기여한 사람을 후보로 삼는 규칙이에요.',
        '사건은 지어낸 이야기예요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '미스터리 타임은 흔히 "바다거북 수프"라고 부르는 수평적 사고 퍼즐을 경쟁으로 바꾼 게임이에요. 질문은 공짜가 아니고, 그 비용이 개인에게 쌓인다는 점이 핵심이에요.' },
      { type: 'cards', items: [
        { title: '좋은 질문은 반을 가르는 질문', body: '"네/아니오"로만 답이 오므로, 가능성을 절반씩 지우는 질문이 가장 효율적이에요. 그런데 사실과 거짓을 섞으면 "그럴 수도"가 돌아와 정보가 흐려져요. 한 질문에 한 가지 사실만 담는 것이 1분을 아끼는 방법이에요. "중요하지 않습니다"도 그 방향을 지워 주는 정보예요.' },
        { title: '팀 안의 무임승차 문제', body: '질문한 사람만 시간이 쌓이고, 답은 팀 전체가 공유해요. 그래서 모두가 남이 질문해 주길 바라면 진행이 멈춰요. 그런데 3·4위 팀에서는 시간이 가장 적은 사람이 데스매치 후보가 되므로, 질문하지 않고 버티는 것도 안전하지 않아요. 규칙이 무임승차와 과도한 질문을 동시에 벌주는 구조예요.' },
        { title: '시간의 방은 마지막 카드', body: '그림 힌트는 강력하지만 시간이 2배로 흐르고 필기도 못 해요. 30분마다 그림이 추가되므로, 늦게 들어갈수록 한 번에 더 많은 그림을 볼 수 있어요. 팀에서 기억력이 좋은 한 명을 늦게 보내는 것이 효율적이에요.' },
        { title: '키워드 부족이 주는 정보', body: '"키워드 부족"은 오답처럼 5분이 붙지만, 인과관계가 맞았다는 확인이기도 해요. 그 뒤로는 질문을 키워드 찾기에만 쓰면 돼요. 키워드 확인권은 이 단계에서 가장 값어치가 커요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '블랙 스토리 (Black Stories)', players: '2명 이상', alike: '기이한 사건의 결말만 듣고, 예·아니오 질문으로 사건의 전말을 맞히는 수평적 사고 카드 게임이에요. 미스터리 타임과 같은 바탕이에요.', differs: '블랙 스토리는 질문에 비용이 없고, 경쟁보다 함께 푸는 놀이에 가까워요.' },
      { name: '스무고개', players: '2명 이상', alike: '예·아니오 질문으로 숨은 답을 좁혀 가는 전통 놀이예요.', differs: '스무고개는 답이 물건 하나이고, 인과관계나 키워드를 맞힐 필요가 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 사건 문제와 히든 아이템의 내용은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Mystery Time II rules — The Bloody Game X, day 3 money challenge (lateral-thinking deduction)',
      description: 'The rules of Mystery Time II from The Bloody Game X (피의 게임X): a mystery and its keywords, one minute per question, the four possible answers, proposing a solution and the five-minute penalty, the Room of Time where your clock runs double, ranking and who goes to the death match.',
      keywords: ['Mystery Time II', 'Bloody Game X Mystery Time', 'lateral thinking puzzle', '피의 게임X'],
    },
    title: 'Mystery Time II — The Bloody Game X, day 3 money challenge',
    name: 'Mystery Time II',
    lead: 'One baffling incident. Question the dealer to reconstruct cause and effect — but every question adds to your own clock.',
    summary: 'Teams deduce an incident’s cause and effect by questioning; questions and wrong answers add to personal time, which decides the death match.',
    setup: [
      { type: 'list', items: [
        '**Players**: all five teams; round 2 is the four teams that did not solve round 1.',
        '**Problem**: an incident, a picture, and how many keywords the answer must contain.',
        '**Time**: every player’s personal clock starts with the round; this accumulated time is the score (less is better).',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Questions', body: 'Each visit to the voting room allows up to three questions, each adding a minute to your clock. The dealer only answers: "yes" (all true), "no" (all false), "maybe" (true and false mixed) or "not important".' },
        { title: 'Proposing', body: 'A proposed solution is **correct** (right causality, every keyword), **wrong** (anything false) or **missing keywords** (right causality, keywords missing). Correct stops the whole team’s clocks; anything else adds five minutes to yours.' },
        { title: 'Room of Time', body: 'Opens 30 minutes in, holding a picture hint, with a new one every 30 minutes. Inside, your clock runs **twice as fast**; one player per team at a time, no writing.' },
        { title: 'Round 1 → round 2', body: 'Round 1 ends with the first correct team, which finishes first. The other four continue with their times in round 2, where sentence hints appear every 30 minutes after the Room closes.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Round-2 solving order gives places 2–4; a team that never solves is 5th.',
        'First place wins ₩50 million and an extra vote; **the top two teams are immune**. The 5th team goes to the outdoor camp.',
        '**Death match**: the 5th team’s player with the most time goes; the 3rd and 4th teams each put up their player with the least time, and a vote picks the second.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Items (₩10 million each): **picture replay** (see a Room hint again) and **keyword check** (confirm one keyword).',
        'In the 3rd and 4th teams the player with the **least** time is put up — the opposite of the 5th team — punishing whoever contributed least.',
        'The incidents are fiction.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Mystery Time turns the lateral-thinking puzzle known as "situation puzzles" into a race, with one twist: questions cost time, and the cost lands on the individual.' },
      { type: 'cards', items: [
        { title: 'Good questions halve the space', body: 'With yes/no answers, questions that rule out half the possibilities are best. Mixing true and false gets "maybe" and blurs the answer, so keep one fact per question; even "not important" rules a direction out.' },
        { title: 'Free riders', body: 'Only the asker pays, yet the whole team hears the answer, so everyone would rather someone else asked. But in 3rd and 4th place the player with the least time is put up, so hiding is not safe either: the rules punish both free-riding and over-asking.' },
        { title: 'The Room is a late card', body: 'Picture hints are strong, but your clock doubles and you cannot write. Pictures accumulate, so going later shows more at once; sending a teammate with a good memory late is efficient.' },
        { title: 'What "missing keywords" tells you', body: 'It costs five minutes like a wrong answer, but confirms the causality. From then on, questions only need to hunt keywords — exactly when a keyword check is worth most.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Black Stories', players: '2+', alike: 'Hear only a strange outcome and reconstruct the story with yes/no questions — the same basis as Mystery Time.', differs: 'Questions cost nothing; it is closer to a shared pastime than a race.' },
      { name: 'Twenty Questions', players: '2+', alike: 'Narrow down a hidden answer with yes/no questions.', differs: 'The answer is a single thing; there is no causality or keyword list.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The incidents and the hidden item are not described.',
  },
};

export default game;
