import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, namuExile, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'count-the-rectangles',
  kind: 'mini',
  when: { ko: '1일차 (양자택일 미니게임 2)', en: 'Day 1 (Either Or, mini-game 2)' },
  site: 'nemoCount',
  related: ['nemoCount', 'hexagon', 'magicswap'],
  updated: '2026-11-26',
  sources: [namuDay(1), namuExile, siteEngine({ ko: '네모 세기', en: 'Count the Rectangles' }, 'src/lib/nemoCount.ts'), broadcast],
  ko: {
    meta: {
      title: '네모 세기 규칙 — 데블스플랜3 1일차 미니게임, 합이 맞는 네모 개수 세기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 양자택일 미니게임이자 유배지 매치로 나온 네모 세기 규칙을 정리했어요. 팀 구성, 버저와 10초 답변, 승리 팀 조건, 점수 배분, 빠르게 세는 방법과 PUZZLTHINK 무한 연습까지.',
      keywords: ['네모 세기', '네모세기', '데블스플랜3 네모세기', '데블스 플랜 3 네모 세기', '데블스플랜3 미니게임', '네모 세기 규칙', '직사각형 개수 세기'],
    },
    title: '네모 세기 — 데블스플랜3 양자택일 미니게임',
    name: '네모 세기',
    lead: '숫자 판에서 합이 목표 숫자가 되는 직사각형을 모두 찾아, 개수를 가장 먼저 외치는 게임이에요.',
    summary: '숫자 판 위의 직사각형 중 합이 목표 숫자인 것이 몇 개인지 버저로 맞히는 계산 속도전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 첫날 메인 매치에서는 16명 전원이 3인 팀 또는 개인으로 참가했어요. 유배지 매치에서는 남은 3명이 같은 규칙으로 다시 풀었어요.',
        '**준비물**: 정사각형 칸으로 이루어진 문제 판(일부 칸에만 숫자가 있어요), 목표 숫자, 팀마다 버저.',
        '**팀 구성**: 시작 전에 원하는 사람 3명이 팀을 맺을 수 있어요. 한 번 맺은 팀은 끝날 때까지 바꾸거나 풀 수 없어요. 팀을 맺지 않으면 개인 자격으로 해요.',
      ] },
      { type: 'callout', tone: 'note', title: '"네모"란?', text: '판 안에 완전히 들어가는, 칸으로 이루어진 직사각형이에요. 정사각형도 네모이고, 칸 하나짜리(1×1)도 네모예요. 네모 안에 든 숫자를 모두 더한 값이 목표 숫자와 같으면 하나로 세요. 숫자가 없는 칸은 0으로 쳐요.' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '문제 공개', body: '문제 판과 목표 숫자가 동시에 공개돼요. 한 문제의 제한 시간은 5분이에요.' },
        { title: '버저', body: '개수를 다 셌다고 생각하면 버저를 누르고 10초 안에 답을 말해요.' },
        { title: '정답·오답', body: '맞히면 그 팀(또는 개인)이 1승을 올려요. 틀리면 그 팀은 같은 문제에 다시 답할 수 없어요.' },
        { title: '다음 문제', body: '5분이 다 지나거나 모든 팀이 틀리면 정답 없이 다음 문제로 넘어가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**두 문제를 맞힌 팀은 승리 팀**이 되어 이후 문제에서 빠져요.',
        '전체 팀(개인 포함) 중 **절반이 승리 팀이 되면** 미니게임이 끝나요.',
        '3인 승리 팀은 승점 7점을 팀 안에서 나눠 갖고, 3인 패배 팀은 최대 4점을 나눠서 잃어요. 개인 참가자는 이기면 7점을 혼자 받고, 지면 3점을 잃어요. 팀 안에서 어떻게 나눌지는 이어지는 양자택일(선택 3)로 정해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '오답 제한은 팀 단위예요. 팀원 한 명이 틀리면 그 문제는 팀 전체가 더 답할 수 없어요.',
        '조건을 만족하는 네모가 하나도 없을 수도 있어요. 그럴 때의 정답은 "0개"예요.',
        '같은 칸을 공유하는 네모끼리도 모양이 다르면 각각 따로 세요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '네모 세기는 순수한 계산 속도전처럼 보이지만, 실제로는 **빠뜨리지 않고 세는 방법**을 가진 사람이 이겨요. 판이 커지면 네모의 수는 칸 수의 제곱 가까이 늘어나서(가로 n칸, 세로 m칸 판의 네모는 n(n+1)/2 × m(m+1)/2개), 눈으로 훑어서는 반드시 빠뜨려요.' },
      { type: 'cards', items: [
        { title: '숫자 하나짜리 네모부터', body: '목표 숫자와 같은 숫자가 적힌 칸은 그 자체로 하나의 네모예요. 그 칸에서 빈칸(0)만 덧붙여 넓힐 수 있는 네모도 모두 답이에요. 빈칸이 많은 판일수록 이런 "숫자 하나 + 빈칸" 네모가 답의 대부분을 차지해요.' },
        { title: '숫자 조합으로 범위를 좁히기', body: '숫자가 적힌 칸이 적다면 네모를 세지 말고 **숫자의 조합**을 먼저 세세요. 합이 목표가 되는 숫자 묶음을 고르고, 그 숫자들만 감싸면서 다른 숫자는 피하는 직사각형이 몇 개인지를 세면 돼요. 이때 네모의 네 변이 움직일 수 있는 칸 수를 곱하면 한 번에 셀 수 있어요.' },
        { title: '팀을 맺을지의 판단', body: '팀은 버저 기회가 늘어나지만 오답 한 번에 팀 전체가 그 문제에서 빠지고, 승점도 나눠야 해요. 혼자 빠르게 셀 자신이 있다면 개인이 기대 승점이 높고, 자신이 없다면 팀이 손실을 줄여 줘요.' },
        { title: '지배 전략은 없어요', body: '먼저 누를수록 유리하지만 틀리면 그 문제를 잃어요. 다른 팀이 누를 것 같다면 확신이 조금 부족해도 누르는 게 맞고, 아무도 못 풀 문제라면 끝까지 세는 게 맞아요. 상대의 속도를 보며 정하는 눈치가 필요해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 네모 세기는 방송과 같은 방식(직사각형, 1×1 포함, 빈칸은 0)으로 세요. 문제 판은 난이도별로 무작위로 만들고, 정답과 정답 네모 목록은 직접 계산해요.',
        '혼자 하는 **무한 연습**과 **30분 챌린지(랭킹)**가 있고, 친구 2–6명이 같은 판으로 버저 대결을 할 수 있어요.',
        '친구 대결에서는 틀려도 문제에서 빠지지 않아요. 잠깐 기다린 뒤 다시 버저를 누를 수 있고, 모두가 동의하면 문제를 넘길 수 있어요. 방송의 3인 팀과 승점 배분은 없어요.',
      ] },
    ],
    similar: [
      { name: '리코셰 로봇 (Ricochet Robots)', players: '1명 이상 (보통 2–8명)', alike: '모두가 같은 문제를 동시에 보고, 답을 먼저 찾았다고 생각한 사람이 외치는 실시간 퍼즐 경쟁이에요.', differs: '리코셰 로봇은 로봇이 목표에 도착하는 최소 이동 횟수를 외치고 실제로 보여 줘야 해요. 네모 세기는 개수를 세는 문제예요.' },
      { name: '우봉고 (Ubongo)', players: '1–4명', alike: '모두 같은 시간에 각자의 판을 풀고, 가장 먼저 끝낸 사람이 보상을 받는 속도 퍼즐이에요.', differs: '우봉고는 폴리오미노 조각으로 빈칸을 채우는 공간 퍼즐이고, 계산은 없어요.' },
      { name: '셋 (SET)', players: '1명 이상', alike: '판 위에서 조건을 만족하는 묶음을 남보다 빨리 찾아 외치는 관찰 속도 게임이에요.', differs: '셋은 카드 세 장의 속성이 모두 같거나 모두 다른 묶음을 찾고, 찾을 때마다 바로 가져가요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Count the Rectangles rules — The Devil's Plan 3, day 1 mini-game",
      description: "The rules of Count the Rectangles from The Devil's Plan: Dead Again (season 3), a mini-game of Either Or and later an exile match: teams, buzzer and 10-second answer, how a team wins, scoring, how to count fast, and endless practice on PUZZLTHINK.",
      keywords: ['Count the Rectangles', "Devil's Plan 3 Count the Rectangles", 'nemo count', "Devil's Plan mini-game", 'rectangle counting puzzle'],
    },
    title: "Count the Rectangles — The Devil's Plan 3 mini-game",
    name: 'Count the Rectangles',
    lead: 'Find every rectangle on a number board whose numbers add up to the target, and be first to call how many there are.',
    summary: 'Buzz in with how many rectangles on a number board add up to the target: a race of careful counting.',
    setup: [
      { type: 'list', items: [
        '**Players**: on day 1, all sixteen, in teams of three or alone. It came back in the exile zone with the same rules for three players.',
        '**Components**: a board of square cells (only some carry a number), a target number, and a buzzer per team.',
        '**Teams**: before it starts, any three players may form a team, which cannot be changed or broken up. Anyone not in a team plays alone.',
      ] },
      { type: 'callout', tone: 'note', title: 'What counts as a rectangle?', text: 'Any rectangle of whole cells lying inside the board. Squares count, and so does a single cell. If the numbers inside add up to the target, it counts once. Empty cells count as 0.' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'A problem is shown', body: 'The board and target appear together. Each problem has five minutes.' },
        { title: 'Buzz', body: 'Whoever thinks they have the count buzzes and answers within 10 seconds.' },
        { title: 'Right or wrong', body: 'A right answer is a win for that team (or player). A wrong one shuts that team out of the problem.' },
        { title: 'Next problem', body: 'If the five minutes run out or every team has answered wrongly, the next problem starts.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**A team with two right answers wins** and drops out of later problems.',
        'The mini-game ends when **half of all teams (solo players included) have won**.',
        'A winning team of three shares 7 points; a losing team of three shares a loss of up to 4. A solo player gains 7 for a win and loses 3 otherwise. How a team splits its share is the next Either Or choice.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'The lock-out is per team: one wrong answer from any member shuts out the whole team for that problem.',
        'A board may have no rectangle that works; then the answer is zero.',
        'Rectangles that overlap still count separately if their shapes differ.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'It looks like raw arithmetic speed, but the winner is whoever has **a way to count without missing any**. The number of rectangles grows roughly with the square of the board’s area (an n×m board has n(n+1)/2 × m(m+1)/2 of them), so scanning by eye always misses some.' },
      { type: 'cards', items: [
        { title: 'Start with single numbers', body: 'A cell holding the target is a rectangle by itself, and so is every rectangle that extends it over empty (0) cells only. On a sparse board, these "one number plus blanks" rectangles are most of the answer.' },
        { title: 'Count combinations, not rectangles', body: 'With few numbered cells, count **groups of numbers** first: pick a group adding up to the target, then count the rectangles that enclose exactly those numbers and avoid all others. Multiplying how far each of the four sides can move counts them in one go.' },
        { title: 'Team or solo', body: 'A team has more buzzers but one wrong answer costs all three the problem, and points are shared. A fast, confident counter expects more alone; a slower one loses less in a team.' },
        { title: 'No dominant strategy', body: 'Buzzing early wins problems but a miss forfeits them. If another team looks close, buzz with slightly less certainty; if nobody seems near, keep counting. You have to read the others’ pace.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK counts the same way (rectangles, single cells included, blanks are 0). Boards are generated at random per difficulty and every answer, with the list of rectangles behind it, is computed.',
        'There is **endless practice**, a **30-minute challenge with a ranking**, and buzzer duels for 2–6 friends on the same boards.',
        'In a friends’ duel a wrong answer does not shut you out: you wait a moment and may buzz again, and a problem can be skipped if everyone agrees. There are no three-player teams or point sharing.',
      ] },
    ],
    similar: [
      { name: 'Ricochet Robots', players: '1+ (usually 2–8)', alike: 'Everyone looks at the same puzzle at once, and whoever thinks they have it calls out.', differs: 'You call the fewest moves to get a robot to its target and must then demonstrate it; nothing is counted.' },
      { name: 'Ubongo', players: '1–4', alike: 'A speed puzzle where everyone solves at the same time and the fastest is rewarded.', differs: 'It is a spatial puzzle with polyomino pieces; there is no arithmetic.' },
      { name: 'SET', players: '1+', alike: 'Spot groups that meet a rule on a shared layout faster than everyone else.', differs: 'You look for three cards whose features are all the same or all different, and take each set as you find it.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
