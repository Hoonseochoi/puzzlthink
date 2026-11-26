// 수식의 탑 guide. Rules and numbers follow src/lib/equationTower.ts (STACKS 4; createBlocks per level — 보통: three
// plain primes, +,+,−,− covering all four primes, one × of 2/3/5, one ÷ of 2/3; 어려움: three plain primes, +,+,− on three
// different primes, × of 2/3/5/7, a second × of 2/3/5, ÷ of 2/3; dealStacks 3-2-2-2; legalMove/applyMove incl. the in-place
// flip of 2+ blocks; towerValue: plain top, signed blocks below, read top down as an ordinary formula with × and ÷ before
// + and −, kept as a fraction; solvedStack: the whole stack, exactly the asked height; LEVEL_SPEC 보통 depth 3, pars
// 2,2,3,3,3, targets 1–99 / 어려움 depth 5, pars 4,4,5,5,6, targets 1–300 and mostly 12+; generateRound falls back to
// other pars when none fits; roundPoints 3/2/1), src/lib/equationTowerRoom.ts (2–4 players, host picks goal 3/5/7 and
// level, THINK 180 s, OUTBID 30 s, ACT 60 s, bids 1–9, a bid of 1 plays at once, ±1 first buzzer / ±2 undercutter, stacks
// carry over, 40 rounds at most), src/components/equationTower/EquationTowerGame.tsx (practice picks 보통/어려움, the
// 10-minute challenge is always 어려움, reset to the round's start, skip), EquationTowerRoomView.tsx (default offer 3,
// or 5 on 어려움), ChallengeRecords.tsx and the 11/26 migrations (the ranking counts 어려움 runs and older runs),
// src/hooks/useBoardExits.tsx and the EquationTowerGuide messages.
// Both worked examples were checked with the game's own generateRound() and solve(): seed 8 on 보통 (target 36, height 4,
// par 3: 7 ×5 +2 ÷2) and seed 1 on 어려움 (target 30, height 4, par 4: 3 ×5 +3 ×5), with towerValue() for every value quoted.
import type { GameGuide, GuideBlock } from './types';

type Lang = 'ko' | 'en';
/** Four stacks as a table, top floor first. '' = no block. */
const stacks = (lang: Lang, cols: string[][], caption: string): GuideBlock => {
  const h = Math.max(...cols.map((c) => c.length));
  const pad = cols.map((c) => [...Array(h - c.length).fill(''), ...c]);
  return {
    type: 'table',
    caption,
    head: cols.map((_, i) => (lang === 'ko' ? `자리 ${i + 1}` : `Stack ${i + 1}`)),
    rows: Array.from({ length: h }, (_, r) => pad.map((c) => c[r] || '·')),
  };
};
// 보통 example, top floor first.
const START = [['+2', '3', '÷2'], ['×5', '7'], ['+7', '−5'], ['5', '−3']];
const STEP2 = [['÷2'], ['+2', '×5', '7'], ['3', '+7', '−5'], ['5', '−3']];
const STEP3 = [['7', '×5', '+2', '÷2'], [], ['3', '+7', '−5'], ['5', '−3']];
// 어려움 example, top floor first.
const HARD = [['÷2', '2', '3'], ['7', '+2'], ['×5', '×5'], ['+3', '−5']];

const guide: GameGuide = {
  game: 'equationTower',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['equationSignal', 'gradation', 'hiddenWord', 'merge2048'],
  inlineNamespace: 'EquationTowerGuide',
  ko: {
    meta: {
      title: '수식의 탑 공략 — 데블스플랜3 감옥매치, 보통·어려움 최소 이동 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥 매치 수식의 탑 공략. ×·÷를 먼저 계산하는 규칙, 블록이 묶이는 "항" 읽기, 보통과 어려움의 블록 구성, ÷ 블록 처리법, 실제 판으로 따라 하는 3수·4수 풀이, 10분 챌린지와 버저 대결 요령까지 정리했어요.',
      keywords: ['수식의 탑 공략', '수식의 탑 규칙', '수식의탑', '데블스플랜3 감옥 매치', '데블스 플랜 3 5일차', '숫자 블록 퍼즐', '타깃 넘버', '수식의 탑 어려움'],
    },
    title: '수식의 탑 공략',
    lead: '블록은 아홉 개, 숫자는 넷. ×와 ÷는 바로 위의 숫자에 붙어요.',
    intro: [
      '수식의 탑은 네 자리에 쌓인 숫자 블록을 옮기고 뒤집어서, **목표 층수**의 탑이 **타깃 넘버**가 되게 만드는 퍼즐이에요. 탑은 위에서 아래로 읽은 보통 수식이라 **×·÷를 +·−보다 먼저** 계산해요. 5, +3, ×2는 5+3×2 = 11이에요. 같은 탑을 더 적은 이동으로 만들수록 점수가 커요.',
      '이 공략은 규칙을 안다고 보고 그다음을 다뤄요. 탑을 "항"으로 끊어 읽는 법, 보통과 어려움의 블록 구성 차이, ÷ 블록을 깔끔하게 쓰는 조건, 그리고 실제 배치에서 보통 3번·어려움 4번 만에 탑을 만드는 과정을 표로 따라가요. 친구 대결에서 몇 번을 불러야 하는지도 정리했어요.',
    ],
    gamePageTitle: '수식의 탑 온라인 — 데블스 플랜 3 감옥 매치, 규칙과 공략',
    summary: '×·÷ 먼저, 항으로 읽기, 보통·어려움 블록 구성, 3수·4수 풀이 따라 하기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '수식의 탑은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 5일차 감옥 매치에 나온 게임이에요. 방송에서는 참가자들이 "몇 번 만에 만들 수 있는지"를 버저로 먼저 부르고, 더 적게 부른 사람이 도전권을 가져갔어요. 방송은 블록 구성을 공개하지 않아서, PUZZLTHINK가 블록 구성을 직접 정했어요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 보통·어려움 중 골라 시간 제한 없이 하는 혼자 연습, 어려움으로 10분 동안 점수를 모으는 챌린지, 2~4명이 버저로 겨루는 친구·공개방 대결을 즐길 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**블록 9개**: 기호 없는 숫자 블록 3개와 기호 블록 6개예요. 블록의 숫자는 모두 소수 **2·3·5·7** 중 하나예요. 기호 블록의 구성은 난이도마다 달라요(아래 표).',
            '**네 자리**: 처음에는 블록이 3·2·2·2개씩 무작위로 쌓여 있어요.',
            '**라운드**: 타깃 넘버와 목표 층수(3~5층)가 공개돼요. 타깃은 보통이 1~99, 어려움이 최대 300이에요.',
            '**이동 1회**: 한 자리의 위에서부터 원하는 개수만큼 블록을 들어 원하는 자리에 내려놓아요. 내려놓을 때 묶음을 위아래로 뒤집을 수 있어요. 제자리에 뒤집어 놓는 것(2개 이상)도 이동 1회예요.',
            '**탑의 조건**: 한 자리 **전체**가 목표 층수와 정확히 같은 높이이고, 맨 위가 숫자 블록, 그 아래는 모두 기호 블록이어야 해요.',
            '**계산**: 위에서 아래로 블록을 이어 읽은 수식을 계산해요. 보통 수식처럼 ×·÷를 먼저 해요. 5, +3, ×2는 5+3×2 = 11이고, 5, ×2, +3은 5×2+3 = 13이에요.',
            '**다음 라운드**: 블록은 옮긴 그대로 다음 라운드로 이어져요.',
          ] },
          { type: 'h3', text: '난이도별 블록 구성' },
          { type: 'table', head: ['', '보통', '어려움'], rows: [
            ['숫자 블록', '서로 다른 소수 3개', '서로 다른 소수 3개'],
            ['+ / −', '+ 2개, − 2개 (2·3·5·7을 하나씩)', '+ 2개, − 1개 (서로 다른 소수 3개)'],
            ['×', '1개: ×2·×3·×5 중 하나', '2개: ×2·×3·×5·×7 중 하나와 ×2·×3·×5 중 하나'],
            ['÷', '1개: ÷2 또는 ÷3', '1개: ÷2 또는 ÷3'],
            ['최소 이동', '대개 2~3번', '대개 4~6번'],
          ] },
          { type: 'p', text: '어려움은 −가 하나 줄고 ×가 하나 늘어서 값이 크게 뛰어요. ×7은 어려움에만 있고, ÷5와 ÷7은 어느 난이도에도 없어요.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙',
        blocks: [
          { type: 'cards', items: [
            { title: '맨 위는 반드시 숫자', body: '+3이나 ×2처럼 기호가 붙은 블록이 맨 위에 있으면 탑이 아니에요. 숫자 블록이 탑 중간에 끼어 있어도 탑이 아니에요.' },
            { title: '×·÷가 먼저', body: '계산기처럼 한 단계씩이 아니라 보통 수식이에요. 7, +7, +2, ÷2, −5는 7+7+2÷2−5 = 10이에요. 한 단계씩 하면 나오는 3이 아니에요.' },
            { title: '높이가 딱 맞아야', body: '값이 타깃과 같아도 그 자리의 블록 수가 목표 층수와 다르면 완성이 아니에요. 아래에 남는 블록이 있으면 치워야 해요.' },
            { title: '뒤집으면 순서가 반대', body: '세 블록을 들어 뒤집으면 맨 위 블록이 맨 아래로 가요. 묶음 맨 아래에 깔린 숫자 블록을 한 번에 꼭대기로 올릴 때 써요.' },
            { title: '÷는 짝이 있어야', body: '÷ 블록은 하나뿐이라, ÷2가 든 항에는 2(숫자 2나 +2·−2, 또는 ×2)가 함께 있어야 값이 자연수가 돼요. 7, ×5, ÷2, +2는 39/2라 어떤 타깃도 될 수 없어요.' },
            { title: '한 블록짜리는 탑이 아니에요', body: '탑은 2층 이상이에요. 목표 층수는 언제나 3~5층이라, 숫자 블록 하나만으로 끝나는 라운드는 없어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 탑을 "항"으로 끊어 읽기',
        blocks: [
          { type: 'p', text: '×·÷를 먼저 하는 수식은 + 와 − 에서 끊어 읽으면 쉬워져요. 맨 위 숫자, 그리고 +n·−n 블록이 각각 새 **항**을 시작하고, 그 아래로 이어지는 ×·÷ 블록은 바로 위의 항에 붙어요. 탑의 값은 항들의 합이에요.' },
          { type: 'list', ordered: true, items: [
            '**꼭대기 후보는 셋뿐**: 첫 항은 숫자 블록 3개 중 하나로 시작해요. 먼저 어느 숫자로 시작할지 정해요.',
            '**×는 누구 밑에 두느냐가 전부**: ×5를 7 아래에 두면 7×5 = 35, +2 아래에 두면 2×5 = 10이 더해져요. 같은 블록이라도 붙는 항에 따라 값이 크게 달라요.',
            '**항의 순서는 자유**: 첫 항만 맨 위에 있으면, 나머지 항끼리는 순서를 바꿔도 값이 같아요. 5, +3, −2와 5, −2, +3은 둘 다 6이에요. 그래서 항 하나(±블록과 그 밑의 ×·÷)를 묶음째 옮기면 계산이 깨지지 않아요.',
            '**층수로 블록 수 세기**: 3층 탑이면 숫자 1개 + 기호 2개, 5층이면 숫자 1개 + 기호 4개예요.',
            '**자리 아래의 값 보기**: 각 자리 아래에 지금 그 자리를 탑으로 읽은 값이 표시돼요. 옮기기 전에 머릿속 계산과 맞는지 확인하세요.',
          ] },
          { type: 'callout', tone: 'tip', title: '헤맸다면 처음으로', text: '혼자 하기에서는 "라운드 처음으로"를 누르면 그 라운드가 시작할 때의 배치로 돌아가고 이동 수도 0으로 돌아가요. 길을 찾은 뒤 다시 최소 이동을 노리세요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 하기 — 보통, 세 번 만에 36 만들기',
        lead: '보통 난이도. 블록은 숫자 5·7·3, 기호 +7·+2·−3·−5·×5·÷2예요. 타깃 36, 목표 4층. 표는 위층부터 적었어요.',
        blocks: [
          stacks('ko', START, '처음 배치. 탑으로 읽히는 건 자리 4(5−3 = 2)뿐이에요.'),
          { type: 'steps', items: [
            { title: '항으로 쪼개기', body: '4층이면 숫자 하나에 기호 셋이에요. 판에서 가장 큰 항은 7×5 = 35이고, 36까지 1이 모자라요. 1은 +2÷2로 만들 수 있어요(2÷2 = 1). 그래서 탑은 위에서부터 7, ×5, +2, ÷2 — 7×5 + 2÷2 = 35 + 1 = 36이에요. ÷2가 짝인 2와 같은 항에 있어서 값이 자연수로 떨어져요.' },
            { title: '1번째 이동: 자리 1의 +2를 자리 2 위로', body: '자리 2는 위에서부터 +2, ×5, 7이 돼요. 필요한 세 블록이 한 자리에 모였어요. 순서는 정반대지만 괜찮아요.' },
            { title: '2번째 이동: 자리 1의 3을 자리 3 위로', body: '÷2를 덮고 있던 숫자 3을 치워요. 자리 1에는 ÷2만 남아 새 탑의 바닥이 돼요. 자리 3은 3+7−5 = 5인 탑이 되지만 이번 라운드와는 상관없어요.' },
            { title: '3번째 이동: 자리 2의 3개를 들어 뒤집어 자리 1 위로', body: '+2, ×5, 7을 뒤집어 놓으면 자리 1은 위에서부터 7, ×5, +2, ÷2예요. 4층, 값 36으로 완성이에요. 이 라운드의 최소 이동은 3번이라 혼자 하기에서는 3점이에요.' },
          ] },
          stacks('ko', STEP2, '2번째 이동 뒤: 자리 2에 재료가 모이고, 자리 1에는 ÷2만 남았어요.'),
          stacks('ko', STEP3, '3번째 이동 뒤: 자리 1이 7 ×5 +2 ÷2, 값 36이에요.'),
          { type: 'callout', tone: 'note', title: '같은 네 블록, 다른 순서', text: '7, ×5, ÷2, +2는 35÷2 + 2 = 39/2, 7, +2, ×5, ÷2는 7 + 5 = 12예요. 블록이 같아도 ×와 ÷가 어느 항에 붙느냐로 값이 달라져요. 예전처럼 위에서부터 한 단계씩 계산하면 7 ×5 +2 ÷2는 18.5가 되니, 지금 규칙으로 읽는 습관을 들이세요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 이동 한 번의 힘',
        blocks: [
          { type: 'p', text: '이동 한 번은 "위에서 몇 개 들기 + 뒤집을지 + 어디에 놓을지"의 조합이라 생각보다 많은 일을 해요. 아래 네 가지 쓰임을 외워 두면 최소 이동이 잘 보여요.' },
          { type: 'cards', items: [
            { tag: '올리기', title: '항째 옮기기', body: '+3, ×2처럼 이미 한 항으로 붙어 있는 블록은 묶음째 다른 탑 아래쪽에 가져다 붙여도 값이 그 항만큼만 바뀌어요. 하나씩 옮기는 것보다 이동이 크게 줄어요.' },
            { tag: '뒤집기', title: '깔린 숫자 끌어올리기', body: '숫자 블록이 묶음 맨 아래에 있으면, 그 위까지 함께 들어 뒤집으면 숫자가 맨 위로 와요. 따라 하기의 3번째 이동이 이거예요.' },
            { tag: '치우기', title: '덮고 있는 블록 덜어 내기', body: '쓸 블록 위에 다른 블록이 있으면 치우는 이동이 들어요. 덜어 낸 블록을 다른 자리의 재료가 되게 놓으면 한 번에 두 가지를 해요.' },
            { tag: '작업대', title: '빈 자리와 바닥 블록', body: '빈 자리나, 바닥에 기호 블록 하나만 남은 자리는 새 탑을 쌓기 좋은 작업대예요. 따라 하기의 ÷2처럼 바닥 블록이 마지막 항의 꼬리가 되게 하세요.' },
          ] },
          { type: 'h3', text: '타깃을 항으로 나누기' },
          { type: 'p', text: '타깃을 보면 먼저 "가장 큰 항"을 찾아요. 숫자 블록과 × 블록의 곱(7×5, 3×3…)이 타깃에 가까우면 그게 첫 항이고, 남은 차이를 +n·−n 항으로 메워요. 차이가 1이면 +2÷2·+3÷3 같은 나눗셈 항을, 차이가 크면 +7·+5 같은 큰 항을 찾아요. 반대로 첫 항이 작은 숫자 하나뿐이라면 × 블록을 아래쪽 ± 블록에 붙여 키우는 길도 있어요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 어려움과 최소 이동 세기',
        blocks: [
          { type: 'p', text: '라운드는 지금 배치에서 블록을 몇 번 움직여 만들 수 있는 탑 가운데, ×나 ÷가 들어가는 탑을 주로 골라 내요. 보통은 최소 이동이 대개 **2~3번**, 어려움은 **4~6번**이에요. 맞는 탑이 없을 때만 드물게 그보다 짧은 라운드가 나와요. 어려움 타깃은 대개 12 이상이고 300까지 커져요.' },
          stacks('ko', HARD, '어려움 예시. 숫자 3·7·2, 기호 +3·+2·−5·×5·×5·÷2. 타깃 30, 목표 4층, 최소 이동 4번.'),
          { type: 'steps', items: [
            { title: '항 고르기', body: '30 = 15 + 15 = 3×5 + 3×5. 숫자 3과 +3이 각각 ×5를 하나씩 가져가면 돼요. 두 × 블록을 한 항에 몰면 3×5×5 = 75로 너무 커요.' },
            { title: '1~2번째 이동', body: '자리 1의 위 2개(÷2, 2)를 자리 2 위로 치우고, 남은 숫자 3을 자리 3(×5 ×5) 위에 올려요. 자리 3은 3×5×5 = 75예요.' },
            { title: '3번째 이동', body: '자리 3의 위 2개(3, ×5)를 자리 4(+3 −5) 위로 옮겨요. 자리 4는 3 ×5 +3 −5 = 13이고, 자리 3에는 ×5 하나가 바닥으로 남아요.' },
            { title: '4번째 이동', body: '자리 4의 위 3개(3, ×5, +3)를 자리 3의 ×5 위로 옮기면 3 ×5 +3 ×5 = 15 + 15 = 30, 4층으로 완성이에요. 바닥의 ×5가 +3의 항에 붙은 거예요.' },
          ] },
          { type: 'list', items: [
            '**× 두 개는 나눠 쓰거나 몰아 쓰거나**: 어려움의 큰 타깃은 대개 × 블록 둘을 어디에 붙이느냐로 결정돼요. 한 항에 몰면 곱이 크게 뛰고, 두 항에 나누면 비슷한 크기의 두 항이 생겨요.',
            '**바닥에 남길 블록 정하기**: 마지막 이동은 대개 "완성된 윗부분을 바닥 블록 위로 내려놓기"예요. 어떤 블록을 바닥에 남길지를 먼저 정하면 이동 순서가 거꾸로 보여요.',
            '**다음 라운드까지 생각하기**: 블록은 그대로 이어지니, 탑을 만들고 나서 남는 모양이 다음 라운드에 쓰기 좋은지도 보세요. 10분 챌린지에서는 이게 점수 차이가 돼요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**계산기처럼 한 단계씩 계산하기**: 5, +3, ×2는 (5+3)×2 = 16이 아니라 5+3×2 = 11이에요. ×는 바로 위의 3에만 붙어요.',
            '**÷를 짝 없이 쓰기**: ÷2가 든 항에 2가 없으면 값이 분수로 남아요. 자리 아래 값이 분수로 보이면 ÷의 위치를 바꿔야 해요.',
            '**뒤집기를 잊기**: 블록을 하나씩 옮겨 순서를 바꾸면 이동이 금방 늘어나요. 묶음째 뒤집으면 한 번이에요.',
            '**아래 블록을 못 보기**: 탑은 그 자리 전체예요. 값이 맞아도 바닥에 블록이 하나 남아 있으면 완성이 아니에요.',
            '**대결에서 무리하게 낮춰 부르기**: 더 적게 불러 도전권을 가져가면 성공 +2지만 실패 −2예요. 길이 끝까지 보일 때만 낮추세요.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: '모드별 메모 — 연습, 10분 챌린지, 버저 대결',
        blocks: [
          { type: 'table', head: ['모드', '알아 둘 점'], rows: [
            ['혼자 연습', '보통·어려움 중 골라요. 시간 제한이 없고, 라운드가 끝나면 최소 이동 횟수를 알려 줘요.'],
            ['10분 챌린지', '언제나 어려움이에요. 최소 이동으로 풀면 3점, 한 번 더 쓰면 2점, 그 외 완성은 1점, 넘기면 0점이에요. 로그인하면 랭킹에 오르고 1위에게 수식의 탑 아이콘이 주어져요. 다른 탭이나 앱으로 3번 이상 넘어가면 그 기록은 순위에 들어가지 않아요.'],
            ['버저 대결', '2~4명, 방장이 난이도와 목표 점수(3·5·7점)를 정해요. 3분 안에 누군가 "몇 번에 만들 수 있다"를 부르면(1~9번), 다른 사람은 30초 안에 한 번씩 더 적은 수를 부르거나 넘겨요. 가장 적게 부른 사람이 그 횟수 안에, 60초 안에 도전해요. 1번을 부르면 더 낮출 수 없어 바로 도전해요.'],
            ['대결 점수', '처음 부른 사람은 성공 +1, 실패 −1. 더 적게 불러 가져간 사람은 성공 +2, 실패 −2. 아무도 부르지 않으면 점수 없이 넘어가요. 목표 점수에 먼저 닿으면 끝나요(방송은 7점).'],
          ] },
          { type: 'p', text: '대결에서 부를 횟수는 처음에 3번(어려움은 5번)으로 놓여 있어요. 혼자 연습에서 최소 이동이 보통 2~3번, 어려움 4~6번이라는 감을 익혀 두면 부를 수를 정하기 쉬워요. 도전한 사람이 옮긴 블록은 실패해도 그대로 남아 다음 라운드가 그 배치에서 시작되니, 내가 도전하지 않을 때도 상대의 이동을 지켜보세요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '타깃 넘버', def: '완성한 탑이 계산되어야 하는 값. 보통은 1~99, 어려움은 최대 300의 자연수예요.' },
            { term: '목표 층수', def: '탑의 높이. 그 자리의 블록 수가 정확히 이만큼이어야 해요(3~5층).' },
            { term: '숫자 블록', def: '기호 없는 블록. 탑의 맨 위에만 올 수 있어요. 세 개뿐이에요.' },
            { term: '기호 블록', def: '+n, −n, ×n, ÷n 블록. 탑에서 숫자 블록 아래에 쌓여 수식을 이어요.' },
            { term: '항', def: '+·−로 끊은 수식의 한 덩어리. 맨 위 숫자나 ±블록에서 시작해 그 아래 ×·÷ 블록까지예요.' },
            { term: '뒤집기', def: '든 묶음의 위아래를 바꿔 내려놓기. 제자리에서 뒤집는 것도 이동 1회예요.' },
            { term: '최소 이동', def: '그 라운드의 탑을 만드는 가장 적은 이동 수. 혼자 하기에서는 이 수로 풀면 3점이에요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '수식의 탑은 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3) 5일차 감옥 매치에 나온 게임이에요. 숫자 블록을 옮기고 뒤집어 타깃 넘버가 되는 탑을 만들며, 방송에서는 더 적은 이동 횟수를 부른 사람이 도전했어요.' },
      { q: '계산 순서는 어떻게 되나요?', a: '탑을 위에서 아래로 읽은 보통 수식으로 계산해요. ×·÷를 +·−보다 먼저 해서, 5, +3, ×2는 5+3×2 = 11이에요.' },
      { q: '보통과 어려움은 무엇이 다른가요?', a: '보통은 + 2개, − 2개, × 1개, ÷ 1개이고 최소 이동이 대개 2~3번이에요. 어려움은 + 2개, − 1개, × 2개, ÷ 1개에 타깃이 300까지 커지고, 최소 이동이 대개 4~6번이에요. 숫자는 두 난이도 모두 2·3·5·7뿐이에요.' },
      { q: '10분 챌린지는 어느 난이도인가요?', a: '언제나 어려움이에요. 랭킹도 어려움 기록으로 매기고, 난이도가 생기기 전의 기록은 그대로 남아 있어요. 보통은 연습과 친구·공개방에서 할 수 있어요.' },
      { q: '무료인가요? 가입해야 하나요?', a: '무료이고 가입 없이 바로 할 수 있어요. 로그인하면 10분 챌린지 기록이 랭킹에 올라가고, 1위에게는 수식의 탑 아이콘이 주어져요.' },
    ],
    cta: { title: '첫 탑을 쌓아 볼까요?', body: '보통 연습에서 항 읽기를 익힌 뒤 어려움 10분 챌린지로 최소 이동에 도전해 보세요.', button: '수식의 탑 하러 가기' },
    disclaimer: '수식의 탑은 넷플릭스 「데블스 플랜: 데드 어게인」에 등장한 게임의 규칙을 참고한 비공식 팬 게임이며, 넷플릭스 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Tower of Equations strategy — the Devil's Plan 3 prison match, Normal and Hard | PUZZLTHINK",
      description: "How to build Tower of Equations towers from The Devil's Plan 3 prison match in fewer moves: × and ÷ first, reading a tower in terms, the Normal and Hard block sets, using the ÷ block, real three- and four-move solutions, and tips for the challenge and buzzer game.",
      keywords: ['Tower of Equations strategy', 'Tower of Equations rules', "Devil's Plan 3 prison match", 'number block puzzle', 'target number puzzle', 'Tower of Equations hard'],
    },
    title: 'Tower of Equations strategy guide',
    lead: 'Nine blocks, four numbers — and every × or ÷ sticks to the number just above it.',
    intro: [
      'Tower of Equations is a puzzle about four stacks of number blocks: move and flip them until one stack is a tower of the **asked height** worth the **target number**. A tower is read from the top down as an ordinary formula, **× and ÷ before + and −**: 5, +3, ×2 is 5+3×2 = 11. The fewer moves you use, the more you score.',
      'This guide assumes you know the rules and goes further: reading a tower as a sum of terms, how the Normal and Hard block sets differ, when the ÷ block comes out even, and real positions solved in three moves on Normal and four on Hard, shown as tables. It also covers how many moves to call in the buzzer game.',
    ],
    gamePageTitle: "Tower of Equations online — the Devil's Plan 3 prison match, rules and tips",
    summary: '× and ÷ first, reading in terms, Normal and Hard block sets, three- and four-move solutions.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Tower of Equations was the day-5 prison match of Netflix's The Devil's Plan: Dead Again (season 3). On the show players buzzed in with how many moves they needed, and whoever called fewer took the attempt. The show never published its block set, so PUZZLTHINK chose one itself." },
          { type: 'p', text: 'On PUZZLTHINK you can practise on Normal or Hard with no time limit, collect points in a 10-minute challenge played on Hard, or play the buzzer game with 2–4 players in friend or open rooms.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Nine blocks**: three plain number blocks and six signed blocks. Every block’s number is one of the primes **2, 3, 5, 7**. Which signed blocks you get depends on the level (table below).',
            '**Four stacks**: the blocks start shuffled into stacks of 3, 2, 2 and 2.',
            '**A round**: a target number and a height (3 to 5 floors) are shown. Targets run 1–99 on Normal and up to 300 on Hard.',
            '**One move**: lift any number of blocks off the top of one stack and set them down on any stack, optionally turning the bundle upside down. Flipping 2 or more blocks in place counts as a move too.',
            '**A tower**: a **whole stack** exactly the asked height, with a plain number on top and only signed blocks below.',
            '**Working it out**: read the blocks from the top down as one formula and work it out the usual way, × and ÷ first. 5, +3, ×2 is 5+3×2 = 11; 5, ×2, +3 is 5×2+3 = 13.',
            '**Next round**: the blocks stay where they are for the next round.',
          ] },
          { type: 'h3', text: 'Block sets by level' },
          { type: 'table', head: ['', 'Normal', 'Hard'], rows: [
            ['Number blocks', 'three different primes', 'three different primes'],
            ['+ / −', 'two +, two − (2, 3, 5, 7 once each)', 'two +, one − (three different primes)'],
            ['×', 'one: ×2, ×3 or ×5', 'two: one of ×2, ×3, ×5, ×7 and one of ×2, ×3, ×5'],
            ['÷', 'one: ÷2 or ÷3', 'one: ÷2 or ÷3'],
            ['Fewest moves', 'usually 2–3', 'usually 4–6'],
          ] },
          { type: 'p', text: 'Hard swaps a − for a second ×, so values climb fast. ×7 exists only on Hard; there is no ÷5 or ÷7 on either level.' },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules',
        blocks: [
          { type: 'cards', items: [
            { title: 'A number on top', body: 'A signed block like +3 or ×2 on top means it is not a tower. Neither is a stack with a plain number further down.' },
            { title: '× and ÷ come first', body: 'It is an ordinary formula, not a calculator going step by step. 7, +7, +2, ÷2, −5 is 7+7+2÷2−5 = 10, not the 3 you get one step at a time.' },
            { title: 'Exact height', body: 'If the value matches but the stack has more or fewer blocks than the asked height, it does not count. Blocks left underneath must be cleared away.' },
            { title: 'Flipping reverses order', body: 'Lift three blocks and flip them, and the top one ends up at the bottom. Use it to bring a buried number block to the top in one move.' },
            { title: '÷ needs a partner', body: 'There is only one ÷ block, so a term holding ÷2 also needs a 2 (the number 2, +2 or −2, or ×2) to come out whole. 7, ×5, ÷2, +2 is 39/2 and can never match a target.' },
            { title: 'One block is not a tower', body: 'Towers are at least two floors, and asked heights are always 3–5, so no round is solved by a lone number.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — read a tower in terms',
        blocks: [
          { type: 'p', text: 'A formula with × and ÷ first is easiest to read by cutting it at each + and −. The top number and every +n or −n block start a new **term**; the × and ÷ blocks below stick to the term just above them. The tower is worth the sum of its terms.' },
          { type: 'list', ordered: true, items: [
            '**Only three possible tops**: the first term starts with one of the three number blocks. Decide which one first.',
            '**Where a × sits is everything**: ×5 under the 7 makes 7×5 = 35; under +2 it adds 2×5 = 10. The same block is worth very different amounts in different terms.',
            '**Terms can go in any order**: as long as the first term stays on top, the rest can be swapped without changing the value — 5, +3, −2 and 5, −2, +3 are both 6. So moving a whole term (a ± block with its × and ÷) never breaks the sum.',
            '**Count blocks from the height**: a 3-floor tower is one number and two signed blocks; 5 floors is one number and four.',
            '**Watch the values under the stacks**: each stack shows what it is worth read as a tower. Check it against your mental sum before moving.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Lost? Go back to the start', text: 'In solo play, "back to round start" restores the round’s starting position and sets your move count back to 0. Find the path, then go for the fewest moves again.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — 36 in three moves on Normal',
        lead: 'Normal level. Blocks: numbers 5, 7, 3 and signed +7, +2, −3, −5, ×5, ÷2. Target 36, height 4. Tables list the top floor first.',
        blocks: [
          stacks('en', START, 'Starting position. Only stack 4 reads as a tower (5−3 = 2).'),
          { type: 'steps', items: [
            { title: 'Split it into terms', body: 'Four floors is one number and three signed blocks. The biggest term on the table is 7×5 = 35, one short of 36, and +2÷2 makes exactly 1. So the tower is 7, ×5, +2, ÷2 from the top: 7×5 + 2÷2 = 35 + 1 = 36. The ÷2 shares a term with its partner 2, so it comes out whole.' },
            { title: 'Move 1: stack 1’s +2 onto stack 2', body: 'Stack 2 now reads +2, ×5, 7 from the top. All three blocks you need are together — in exactly the wrong order, which is fine.' },
            { title: 'Move 2: stack 1’s 3 onto stack 3', body: 'Clear the 3 that was covering the ÷2. Stack 1 is left with the ÷2 alone, ready to be the new tower’s bottom. Stack 3 becomes 3+7−5 = 5, which does not matter this round.' },
            { title: 'Move 3: lift all three of stack 2, flip, set on stack 1', body: 'Flipping +2, ×5, 7 makes stack 1 read 7, ×5, +2, ÷2: four floors worth 36. Done. The fewest moves for this round is 3, so solo play gives 3 points.' },
          ] },
          stacks('en', STEP2, 'After move 2: the ingredients sit in stack 2, and stack 1 holds only the ÷2.'),
          stacks('en', STEP3, 'After move 3: stack 1 reads 7 ×5 +2 ÷2, worth 36.'),
          { type: 'callout', tone: 'note', title: 'Same four blocks, different order', text: '7, ×5, ÷2, +2 is 35÷2 + 2 = 39/2, and 7, +2, ×5, ÷2 is 7 + 5 = 12. The blocks are the same; what changes is which term each × and ÷ belongs to. Worked out one step at a time from the top, 7 ×5 +2 ÷2 would be 18.5 — get used to reading it the current way.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — what one move can do',
        blocks: [
          { type: 'p', text: 'One move combines "how many to lift", "flip or not" and "where to put them", so it does more than it seems. Learn these four uses and the short solutions start to stand out.' },
          { type: 'cards', items: [
            { tag: 'Carry', title: 'Move a whole term', body: 'Blocks that already form one term, like +3 over ×2, can be carried onto the lower part of another tower and change it by just that term. Far cheaper than one block at a time.' },
            { tag: 'Flip', title: 'Raise a buried number', body: 'If a number block sits at the bottom of a bundle, lift the bundle and flip it: the number comes out on top. That is move 3 of the worked example.' },
            { tag: 'Clear', title: 'Uncover what you need', body: 'A block sitting on one you need costs a move to clear. Drop it where it helps another stack and one move does two jobs.' },
            { tag: 'Workbench', title: 'Empty stacks and bottom blocks', body: 'An empty stack, or one with a single signed block left at the bottom, is a good workbench. Make that bottom block the tail of your last term, like the ÷2 in the worked example.' },
          ] },
          { type: 'h3', text: 'Split the target into terms' },
          { type: 'p', text: 'Look for the biggest term first. If a number block times a × block (7×5, 3×3…) lands near the target, make it the first term and fill the gap with +n or −n terms. A gap of 1 suggests a division term such as +2÷2 or +3÷3; a big gap needs a big term such as +7 or +5. And when the first term is just a small number, a × block hung under a lower ± block can do the growing instead.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — Hard, and counting the fewest moves',
        blocks: [
          { type: 'p', text: 'Each round picks, mostly among towers that need × or ÷, one that can be built from the current position in a set number of moves: usually **2–3** on Normal and **4–6** on Hard. Only when nothing fits does a shorter round turn up now and then. Hard targets are mostly 12 or more and can reach 300.' },
          stacks('en', HARD, 'A Hard round. Numbers 3, 7, 2; signed +3, +2, −5, ×5, ×5, ÷2. Target 30, height 4, fewest moves 4.'),
          { type: 'steps', items: [
            { title: 'Choose the terms', body: '30 = 15 + 15 = 3×5 + 3×5: the number 3 and the +3 each take one ×5. Putting both × blocks in one term gives 3×5×5 = 75, far too much.' },
            { title: 'Moves 1–2', body: 'Clear stack 1’s top two (÷2, 2) onto stack 2, then put the remaining 3 on stack 3 (×5 ×5). Stack 3 is now 3×5×5 = 75.' },
            { title: 'Move 3', body: 'Carry stack 3’s top two (3, ×5) onto stack 4 (+3 −5). Stack 4 reads 3 ×5 +3 −5 = 13, and stack 3 keeps one ×5 at the bottom.' },
            { title: 'Move 4', body: 'Carry stack 4’s top three (3, ×5, +3) onto that ×5: 3 ×5 +3 ×5 = 15 + 15 = 30, four floors. The bottom ×5 has joined the +3’s term.' },
          ] },
          { type: 'list', items: [
            '**Two × blocks: split or stack them**: Hard’s big targets are mostly decided by where the two × blocks go. In one term they multiply up fast; in two terms they make two similar-sized terms.',
            '**Pick the bottom block first**: the last move is usually "set the finished upper part down on a bottom block". Decide which block stays at the bottom and the move order shows itself backwards.',
            '**Think about the next round**: blocks carry over, so notice whether the shape you leave suits the next round. In the 10-minute challenge that is where points are won.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Working step by step like a calculator**: 5, +3, ×2 is 5+3×2 = 11, not (5+3)×2 = 16. The × sticks to the 3 just above it.',
            '**A ÷ without its partner**: if the term holding ÷2 has no 2, the value stays a fraction. When a stack’s value shows a fraction, the ÷ is in the wrong term.',
            '**Forgetting to flip**: reordering blocks one at a time burns moves fast. Flipping a bundle is one move.',
            '**Missing the bottom block**: the tower is the whole stack. A right value with one block left underneath does not count.',
            '**Undercutting recklessly**: taking the attempt with a lower call scores +2 on success but −2 on failure. Undercut only when you can see the whole path.',
          ] },
        ],
      },
      {
        id: 'modes',
        title: 'Mode notes — practice, 10-minute challenge, buzzer game',
        blocks: [
          { type: 'table', head: ['Mode', 'Good to know'], rows: [
            ['Practice', 'Choose Normal or Hard. No time limit; after each round you are told its fewest moves.'],
            ['10-minute challenge', 'Always Hard. 3 points for the fewest moves, 2 for one more, 1 for any other finish, 0 for a skip. Signed in, you are ranked and first place gets the Tower of Equations icon. Switching to another tab or app 3 times or more voids the run for the ranking.'],
            ['Buzzer game', '2–4 players; the host sets the level and the goal (3, 5 or 7 points). Within 3 minutes someone calls how many moves they need (1–9); everyone else then has 30 seconds to call fewer once, or pass. The lowest call plays it out within that many moves and 60 seconds. A call of 1 cannot be beaten and plays at once.'],
            ['Buzzer scoring', 'The first caller scores +1 for a tower and −1 for a miss; someone who undercut scores +2 or −2. If nobody calls, the round passes without points. First to the goal wins (7 on the show).'],
          ] },
          { type: 'p', text: 'The call starts at 3 moves (5 on Hard). Practice gives you the feel — usually 2–3 moves on Normal, 4–6 on Hard — that makes choosing a number easier. The blocks stay where the player left them even after a failed attempt, and the next round starts from there, so watch your opponents’ moves even when you are not playing.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Target number', def: 'What the finished tower must be worth: a whole number from 1 to 99 on Normal, up to 300 on Hard.' },
            { term: 'Height', def: 'How many floors the tower has; the stack must have exactly that many blocks (3–5).' },
            { term: 'Number block', def: 'A block with no sign. Only it can top a tower; there are three.' },
            { term: 'Signed block', def: 'A +n, −n, ×n or ÷n block, stacked under the number to continue the formula.' },
            { term: 'Term', def: 'One piece of the formula between + and − signs: the top number or a ± block, plus the × and ÷ blocks under it.' },
            { term: 'Flip', def: 'Setting a lifted bundle down upside down. Flipping in place is one move too.' },
            { term: 'Fewest moves', def: 'The smallest number of moves that builds the round’s tower; matching it scores 3 in solo play.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Tower of Equations?', a: "The day-5 prison match of Netflix's The Devil's Plan: Dead Again (season 3). You move and flip number blocks into a tower worth the target; on the show, whoever called fewer moves took the attempt." },
      { q: 'In what order is a tower worked out?', a: 'As an ordinary formula read from the top down, × and ÷ before + and −. 5, +3, ×2 is 5+3×2 = 11.' },
      { q: 'How do Normal and Hard differ?', a: 'Normal has two +, two −, one × and one ÷, and rounds usually take 2–3 moves. Hard has two +, one −, two × and one ÷, targets up to 300, and rounds usually take 4–6 moves. Numbers are the primes 2, 3, 5 and 7 on both.' },
      { q: 'Which level is the 10-minute challenge?', a: 'Always Hard, and the ranking is for Hard runs; results from before the levels existed stay on it. Normal is there in practice and in friend or open rooms.' },
      { q: 'Is it free? Do I need an account?', a: 'It is free and needs no account. Sign in and your 10-minute challenge results go on the ranking, where first place earns the Tower of Equations icon.' },
    ],
    cta: { title: 'Ready to build the first tower?', body: 'Learn to read terms in Normal practice, then chase the fewest moves in the Hard 10-minute challenge.', button: 'Play Tower of Equations' },
    disclaimer: "Tower of Equations is an unofficial fan game based on a game from Netflix's The Devil's Plan: Dead Again and is not affiliated with Netflix or the producers.",
  },
};
export default guide;
