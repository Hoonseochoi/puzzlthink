// 수식의 탑 guide. Rules and numbers follow src/lib/equationTower.ts (STACKS 4; createBlocks: three plain primes and six
// signed blocks +,+,−,− covering all four primes, × of 2/3/5, ÷ of 2/3; dealStacks 3-2-2-2; legalMove/applyMove incl.
// the in-place flip of 2+ blocks; towerValue: plain top, signed blocks below, worked out in order from the top as a
// fraction; solvedStack: the whole stack, exactly the asked height; generateRound: target 1–99, height 3–5, par 1–4 and
// usually 2+; roundPoints 3/2/1), src/lib/equationTowerRoom.ts (2–4 players, goal 3/5/7, THINK 180 s, OUTBID 30 s, ACT 60 s,
// bids 1–9, a bid of 1 plays at once, ±1 first buzzer / ±2 undercutter, stacks carry over, 40 rounds at most),
// src/components/equationTower/EquationTowerGame.tsx (reset to the round's start, skip, challenge 10 min),
// src/hooks/useBoardExits.tsx and the EquationTowerGuide messages.
// The worked example (blocks 5 2 7 +3 +7 −2 −5 ×2 ÷3) was checked with the game's own solve(): par 2 for 20 at height 3
// and 18 at height 3.
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
// Top floor first.
const START = [['×2', '7', '+3'], ['5', '−5'], ['2', '+7'], ['−2', '÷3']];
const STEP1 = [['+3', '7', '×2'], ['5', '−5'], ['2', '+7'], ['−2', '÷3']];
const STEP2 = [['7', '+3', '×2'], ['5', '−5'], ['2', '+7'], ['−2', '÷3']];

const guide: GameGuide = {
  game: 'equationTower',
  origin: { kind: 'show', show: 'dp3' },
  updated: '2026-11-26',
  related: ['equationSignal', 'gradation', 'hiddenWord', 'merge2048'],
  inlineNamespace: 'EquationTowerGuide',
  ko: {
    meta: {
      title: '수식의 탑 공략 — 데블스플랜3 감옥매치, 최소 이동으로 탑 쌓기 | PUZZLTHINK',
      description: '데블스 플랜 3 감옥 매치 수식의 탑, 몇 번 만에 쌓을 수 있을까요? 블록 9개의 구성, 위에서부터 계산하는 규칙, 뒤집기 요령, 타깃에서 거꾸로 푸는 법, 실제 판으로 따라 하는 2수 풀이, 버저 대결에서 부를 횟수까지 정리했어요.',
      keywords: ['수식의 탑 공략', '수식의 탑 규칙', '수식의탑', '데블스플랜3 감옥 매치', '데블스 플랜 3 5일차', '숫자 블록 퍼즐', '타깃 넘버', '수식의 탑 버저'],
    },
    title: '수식의 탑 공략',
    lead: '블록은 아홉 개, 숫자는 넷. 한 번 뒤집기가 두 번의 이동을 아껴요.',
    intro: [
      '수식의 탑은 네 자리에 쌓인 숫자 블록을 옮기고 뒤집어서, **목표 층수**의 탑이 **타깃 넘버**가 되게 만드는 퍼즐이에요. 탑은 맨 위의 숫자 블록에서 시작해, 그 아래 기호 블록(+3, ×2…)을 위에서부터 차례로 적용해 계산해요. 같은 탑을 더 적은 이동으로 만들수록 점수가 커요.',
      '이 공략은 규칙을 안다고 보고 그다음을 다뤄요. 아홉 블록이 어떻게 구성되는지, 이동 한 번으로 할 수 있는 일, 타깃에서 거꾸로 계산하는 법, 그리고 실제 배치에서 2번 만에 탑을 만드는 과정을 표로 따라가요. 친구 대결에서 몇 번을 불러야 하는지도 정리했어요.',
    ],
    gamePageTitle: '수식의 탑 온라인 — 데블스 플랜 3 감옥 매치, 규칙과 공략',
    summary: '블록 구성, 위에서부터 계산, 뒤집기 요령, 역산, 2수 풀이 따라 하기.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: '어떤 게임인가요',
        blocks: [
          { type: 'p', text: '수식의 탑은 넷플릭스 「데블스 플랜: 데드 어게인」(시즌 3) 5일차 감옥 매치에 나온 게임이에요. 방송에서는 참가자들이 "몇 번 만에 만들 수 있는지"를 버저로 먼저 부르고, 더 적게 부른 사람이 도전권을 가져갔어요. 방송은 블록 구성과 기호를 이어 계산하는 방식을 공개하지 않아서, PUZZLTHINK는 이 두 가지를 직접 정했어요.' },
          { type: 'p', text: 'PUZZLTHINK에서는 시간 제한 없는 혼자 연습, 10분 동안 점수를 모으는 챌린지, 2~4명이 버저로 겨루는 친구·공개방 대결을 즐길 수 있어요.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 정리',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**블록 9개**: 기호 없는 숫자 블록 3개와 기호 블록 6개(+ 2개, − 2개, × 1개, ÷ 1개)예요. 블록의 숫자는 모두 소수 **2·3·5·7** 중 하나예요.',
            '**네 자리**: 처음에는 블록이 3·2·2·2개씩 무작위로 쌓여 있어요.',
            '**라운드**: 타깃 넘버(1~99의 자연수)와 목표 층수(3~5층)가 공개돼요.',
            '**이동 1회**: 한 자리의 위에서부터 원하는 개수만큼 블록을 들어 원하는 자리에 내려놓아요. 내려놓을 때 묶음을 위아래로 뒤집을 수 있어요. 제자리에 뒤집어 놓는 것(2개 이상)도 이동 1회예요.',
            '**탑의 조건**: 한 자리 **전체**가 목표 층수와 정확히 같은 높이이고, 맨 위가 숫자 블록, 그 아래는 모두 기호 블록이어야 해요.',
            '**계산**: 맨 위 숫자에서 시작해 아래로 한 칸씩 차례로 계산해요. 5, ×2, +3은 5×2 = 10, 10+3 = 13이에요. 곱셈을 먼저 하는 사칙연산 순서가 아니라 계산기처럼 한 단계씩이에요.',
            '**다음 라운드**: 블록은 옮긴 그대로 다음 라운드로 이어져요.',
          ] },
          { type: 'h3', text: '블록 구성에서 알 수 있는 것' },
          { type: 'list', items: [
            '숫자 블록 3개는 서로 다른 소수예요. 2·3·5·7 중 하나는 숫자 블록으로 없어요.',
            '+ 두 개와 − 두 개는 네 소수를 하나씩 나눠 가져요. 그래서 +와 − 블록에는 2·3·5·7이 모두 한 번씩 나와요.',
            '×는 ×2·×3·×5 중 하나, ÷는 ÷2·÷3 중 하나예요. ×7과 ÷5, ÷7은 없어요.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: '헷갈리는 규칙',
        blocks: [
          { type: 'cards', items: [
            { title: '맨 위는 반드시 숫자', body: '+3이나 ×2처럼 기호가 붙은 블록이 맨 위에 있으면 탑이 아니에요. 숫자 블록이 탑 중간에 끼어 있어도 탑이 아니에요.' },
            { title: '높이가 딱 맞아야', body: '값이 타깃과 같아도 그 자리의 블록 수가 목표 층수와 다르면 완성이 아니에요. 아래에 남는 블록이 있으면 치워야 해요.' },
            { title: '뒤집으면 순서가 반대', body: '세 블록을 들어 뒤집으면 맨 위 블록이 맨 아래로 가요. 묶음 맨 아래에 깔린 숫자 블록을 한 번에 꼭대기로 올릴 때 써요.' },
            { title: '중간에 분수가 돼도 괜찮아요', body: '÷ 때문에 중간 값이 나누어떨어지지 않아도 돼요. 7, ÷2, ×2는 중간에 3.5가 되지만 마지막 값은 7이에요. 마지막 값만 타깃과 같으면 돼요.' },
            { title: '중간에 음수가 돼도 괜찮아요', body: '2, −5는 −3이에요. 그다음에 ×나 +로 다시 양수로 돌아오면 돼요.' },
            { title: '한 블록짜리는 탑이 아니에요', body: '탑은 2층 이상이에요. 목표 층수는 언제나 3~5층이라, 숫자 블록 하나만으로 끝나는 라운드는 없어요.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: '입문 전략 — 꼭대기부터 고르고, 아래는 거꾸로',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**꼭대기 후보는 셋뿐**: 탑의 맨 위에 올 수 있는 건 숫자 블록 3개뿐이에요. 먼저 이 세 숫자 중 어느 것으로 시작할지 정해요.',
            '**맨 아래가 마지막 계산**: 탑의 맨 아래 블록이 마지막으로 적용돼요. 타깃이 20이고 ×2가 있다면 "그 위까지 10"을 만들면 되고, +3이 마지막이면 "그 위까지 17"을 만들면 돼요.',
            '**층수로 블록 수 세기**: 3층 탑이면 숫자 1개 + 기호 2개, 5층이면 숫자 1개 + 기호 4개예요. 기호 블록을 몇 개 고를지가 정해져 있어요.',
            '**자리 아래의 값 보기**: 각 자리 아래에 지금 그 자리를 탑으로 읽은 값이 표시돼요. 옮기기 전에 머릿속 계산과 맞는지 확인하세요.',
          ] },
          { type: 'callout', tone: 'tip', title: '헤맸다면 처음으로', text: '혼자 하기에서는 "라운드 처음으로"를 누르면 그 라운드가 시작할 때의 배치로 돌아가고 이동 수도 0으로 돌아가요. 길을 찾은 뒤 다시 최소 이동을 노리세요.' },
        ],
      },
      {
        id: 'walkthrough',
        title: '따라 하기 — 뒤집기 두 번으로 20 만들기',
        lead: '블록은 숫자 5·2·7, 기호 +3·+7·−2·−5·×2·÷3이에요. 타깃 20, 목표 3층. 표는 위층부터 적었어요.',
        blocks: [
          stacks('ko', START, '처음 배치. 자리 1은 맨 위가 ×2라 아직 탑이 아니에요.'),
          { type: 'steps', items: [
            { title: '재료 찾기', body: '20 = 10 × 2예요. ×2가 마지막(맨 아래)이면 그 위까지 10을 만들면 되고, 7 + 3 = 10이 보여요. 필요한 블록 7, +3, ×2가 모두 자리 1에 이미 있어요. 순서만 틀렸어요: 위에서부터 ×2, 7, +3이 아니라 7, +3, ×2가 되어야 해요.' },
            { title: '1번째 이동: 자리 1의 3개를 들어 뒤집어 제자리에', body: '세 개를 통째로 뒤집으면 위에서부터 +3, 7, ×2가 돼요. ×2가 맨 아래로 내려갔어요. 아직 맨 위가 기호 블록이라 탑은 아니에요.' },
            { title: '2번째 이동: 위의 2개를 들어 뒤집어 제자리에', body: '+3과 7만 들어 뒤집으면 위에서부터 7, +3, ×2예요. 7 + 3 = 10, 10 × 2 = 20. 높이도 3층으로 딱 맞아 완성이에요. 이 라운드의 최소 이동은 2번이라 혼자 하기에서는 3점이에요.' },
          ] },
          stacks('ko', STEP1, '1번째 이동 뒤: 자리 1을 통째로 뒤집었어요.'),
          stacks('ko', STEP2, '2번째 이동 뒤: 자리 1이 7 +3 ×2, 값 20이에요.'),
          { type: 'callout', tone: 'note', title: '같은 배치에서 타깃 18, 3층이라면', text: '18 = 9 × 2 = (2 + 7) × 2예요. 자리 3의 2개(2, +7)를 그대로 자리 1 위에 올리고, 다시 자리 1의 위 3개(2, +7, ×2)를 빈 자리 3으로 옮기면 위에서부터 2, +7, ×2가 돼요. 이것도 2번이 최소예요. 빈 자리는 블록을 원하는 순서로 다시 쌓는 작업대가 돼요.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: '중급 전략 — 이동 한 번의 힘',
        blocks: [
          { type: 'p', text: '이동 한 번은 "위에서 몇 개 들기 + 뒤집을지 + 어디에 놓을지"의 조합이라 생각보다 많은 일을 해요. 아래 네 가지 쓰임을 외워 두면 최소 이동이 잘 보여요.' },
          { type: 'cards', items: [
            { tag: '올리기', title: '묶음째 옮기기', body: '이미 맞는 순서로 붙어 있는 2~3개를 한 번에 다른 자리 위로 옮겨요. 블록 하나씩 옮기는 것보다 이동이 크게 줄어요.' },
            { tag: '뒤집기', title: '깔린 숫자 끌어올리기', body: '숫자 블록이 묶음 맨 아래에 있으면, 그 위까지 함께 들어 뒤집으면 숫자가 맨 위로 와요. 제자리에서도 할 수 있어요.' },
            { tag: '치우기', title: '남는 블록 덜어 내기', body: '목표보다 높은 자리는 위쪽이나, 들고 옮겨 아래쪽을 덜어 내야 해요. 덜어 낸 블록이 다른 자리의 탑 재료가 되게 놓으면 한 번에 두 가지를 해요.' },
            { tag: '작업대', title: '빈 자리 쓰기', body: '빈 자리에 묶음을 옮기면 순서를 그대로 두거나 뒤집은 채로 새 탑의 바닥을 만들 수 있어요. 빈 자리는 가장 자유로운 칸이에요.' },
          ] },
          { type: 'h3', text: '거꾸로 계산하기' },
          { type: 'p', text: '타깃에서 맨 아래 블록을 거꾸로 적용해 보세요. 마지막이 +n이면 타깃 − n, −n이면 타깃 + n, ×n이면 타깃 ÷ n(나누어떨어져야 해요), ÷n이면 타깃 × n이 그 위까지의 값이에요. 이걸 한 칸씩 올라가다 숫자 블록(2·3·5·7 중 판에 있는 것)에 닿으면 탑 하나가 나온 거예요. 예를 들어 타깃 13에 −2가 마지막이면 15, 그 위가 ×3이면 5 — 숫자 5에서 시작하는 5, ×3, −2가 돼요.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: '고급 전략 — 최소 이동 세기',
        blocks: [
          { type: 'p', text: '라운드는 지금 배치에서 블록을 몇 번 움직여 우연히 생긴 탑을 골라 만들어요. 그래서 최소 이동은 대개 **2~3번**이고, 드물게 1번이나 4번이에요. 혼자 하기에서 1번으로 보이는 길이 안 보이면 2번, 그래도 안 되면 3번짜리 길을 찾는 순서로 생각하면 돼요.' },
          { type: 'list', items: [
            '**필요한 블록이 이미 한 자리에 있으면**: 순서만 바꾸면 돼요. 뒤집기 1~2번이면 대부분 해결돼요(위의 20 만들기).',
            '**두 자리에 나뉘어 있으면**: 한 묶음을 다른 묶음 위에 올리는 1번 + 정리 1번, 보통 2~3번이에요.',
            '**아래에 남는 블록이 있으면**: 치우는 이동이 하나 더 들어요. 남는 블록이 바닥에 있으면 탑 쪽을 통째로 들어 다른 자리로 옮기는 게 빠를 때가 많아요.',
            '**다음 라운드까지 생각하기**: 블록은 그대로 이어지니, 연습할 때는 탑을 만들고 나면 다음 라운드에 쓰기 좋은 모양이 남는지도 보세요.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: '자주 하는 실수',
        blocks: [
          { type: 'list', items: [
            '**사칙연산 순서로 계산하기**: 5, +3, ×2는 5+6 = 11이 아니라 (5+3)×2 = 16이에요. 위에서부터 한 단계씩이에요.',
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
            ['혼자 연습', '시간 제한이 없어요. 라운드가 끝나면 최소 이동 횟수를 알려 줘요.'],
            ['10분 챌린지', '최소 이동으로 풀면 3점, 한 번 더 쓰면 2점, 그 외 완성은 1점, 넘기면 0점이에요. 로그인하면 랭킹에 오르고 1위에게 수식의 탑 아이콘이 주어져요. 다른 탭이나 앱으로 3번 이상 넘어가면 그 기록은 순위에 들어가지 않아요.'],
            ['버저 대결', '2~4명. 3분 안에 누군가 "몇 번에 만들 수 있다"를 부르면(1~9번), 다른 사람은 30초 안에 한 번씩 더 적은 수를 부르거나 넘겨요. 가장 적게 부른 사람이 그 횟수 안에, 60초 안에 도전해요. 1번을 부르면 더 낮출 수 없어 바로 도전해요.'],
            ['대결 점수', '처음 부른 사람은 성공 +1, 실패 −1. 더 적게 불러 가져간 사람은 성공 +2, 실패 −2. 아무도 부르지 않으면 점수 없이 넘어가요. 목표 점수(3·5·7점)에 먼저 닿으면 끝나요(방송은 7점).'],
          ] },
          { type: 'p', text: '대결에서는 도전한 사람이 옮긴 블록이 실패해도 그대로 남아 다음 라운드가 그 배치에서 시작돼요. 내가 도전하지 않을 때도 상대의 이동을 지켜보면 다음 라운드를 미리 읽을 수 있어요.' },
        ],
      },
      {
        id: 'glossary',
        title: '용어 정리',
        blocks: [
          { type: 'glossary', items: [
            { term: '타깃 넘버', def: '완성한 탑이 계산되어야 하는 값. 1~99의 자연수예요.' },
            { term: '목표 층수', def: '탑의 높이. 그 자리의 블록 수가 정확히 이만큼이어야 해요(3~5층).' },
            { term: '숫자 블록', def: '기호 없는 블록. 탑의 맨 위에만 올 수 있어요. 세 개뿐이에요.' },
            { term: '기호 블록', def: '+n, −n, ×n, ÷n 블록. 탑에서 숫자 블록 아래에 쌓여 위에서부터 차례로 적용돼요.' },
            { term: '뒤집기', def: '든 묶음의 위아래를 바꿔 내려놓기. 제자리에서 뒤집는 것도 이동 1회예요.' },
            { term: '최소 이동', def: '그 라운드의 탑을 만드는 가장 적은 이동 수. 혼자 하기에서는 이 수로 풀면 3점이에요.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: '수식의 탑은 어떤 게임인가요?', a: '넷플릭스 「데블스 플랜: 데드 어게인」(데블스 플랜 3) 5일차 감옥 매치에 나온 게임이에요. 숫자 블록을 옮기고 뒤집어 타깃 넘버가 되는 탑을 만들며, 방송에서는 더 적은 이동 횟수를 부른 사람이 도전했어요.' },
      { q: '블록은 어떻게 구성되어 있나요?', a: '숫자 블록 3개와 기호 블록 6개(+ 2개, − 2개, × 1개, ÷ 1개), 모두 9개예요. 숫자는 소수 2·3·5·7뿐이고, 목표 층수는 3~5층이에요. 방송의 정확한 블록 구성은 공개되지 않아 이 사이트가 정했어요.' },
      { q: '계산 순서는 어떻게 되나요?', a: '맨 위 숫자에서 시작해 아래로 내려가며 차례대로 계산해요. 곱셈을 먼저 하는 사칙연산 순서가 아니라, 계산기처럼 위에서부터 한 단계씩 적용해요.' },
      { q: '최소 이동은 보통 몇 번인가요?', a: '대개 2~3번이고 드물게 1번이나 4번이에요. 라운드가 끝나면 그 라운드의 최소 이동을 알려 줘요.' },
      { q: '무료인가요? 가입해야 하나요?', a: '무료이고 가입 없이 바로 할 수 있어요. 로그인하면 10분 챌린지 기록이 랭킹에 올라가고, 1위에게는 수식의 탑 아이콘이 주어져요.' },
    ],
    cta: { title: '첫 탑을 쌓아 볼까요?', body: '연습에서 뒤집기 요령을 익힌 뒤 10분 챌린지로 최소 이동에 도전해 보세요.', button: '수식의 탑 하러 가기' },
    disclaimer: '수식의 탑은 넷플릭스 「데블스 플랜: 데드 어게인」에 등장한 게임의 규칙을 참고한 비공식 팬 게임이며, 넷플릭스 및 제작사와 관련이 없습니다.',
  },
  en: {
    meta: {
      title: "Tower of Equations strategy — the Devil's Plan 3 prison match, towers in fewest moves | PUZZLTHINK",
      description: "How to build Tower of Equations towers from The Devil's Plan 3 prison match in fewer moves: the nine blocks, top-down working, flipping, working back from the target, a real two-move solution, and how many moves to call in the buzzer game.",
      keywords: ['Tower of Equations strategy', 'Tower of Equations rules', "Devil's Plan 3 prison match", 'number block puzzle', 'target number puzzle', 'mental maths game'],
    },
    title: 'Tower of Equations strategy guide',
    lead: 'Nine blocks, four numbers — and one flip saves two moves.',
    intro: [
      'Tower of Equations is a puzzle about four stacks of number blocks: move and flip them until one stack is a tower of the **asked height** worth the **target number**. A tower starts from the plain number on top and applies the signed blocks below it (+3, ×2…) one by one from the top. The fewer moves you use, the more you score.',
      'This guide assumes you know the rules and goes further: how the nine blocks are made up, what one move can do, working backwards from the target, and a real position solved in two moves, shown as tables. It also covers how many moves to call in the buzzer game with friends.',
    ],
    gamePageTitle: "Tower of Equations online — the Devil's Plan 3 prison match, rules and tips",
    summary: 'The block set, top-down working, flips, working back and a two-move solution.',
    sections: [
      {
        id: 'background',
        onGamePage: true,
        title: 'What kind of game is it?',
        blocks: [
          { type: 'p', text: "Tower of Equations was the day-5 prison match of Netflix's The Devil's Plan: Dead Again (season 3). On the show players buzzed in with how many moves they needed, and whoever called fewer took the attempt. The show never published its block set or how signs chain together, so PUZZLTHINK made those two choices itself." },
          { type: 'p', text: 'On PUZZLTHINK you can practise with no time limit, collect points in a 10-minute challenge, or play the buzzer game with 2–4 players in friend or open rooms.' },
        ],
      },
      {
        id: 'rules',
        onGamePage: true,
        title: 'The rules',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Nine blocks**: three plain number blocks and six signed blocks (two +, two −, one ×, one ÷). Every block’s number is one of the primes **2, 3, 5, 7**.',
            '**Four stacks**: the blocks start shuffled into stacks of 3, 2, 2 and 2.',
            '**A round**: a target number (a whole number from 1 to 99) and a height (3 to 5 floors) are shown.',
            '**One move**: lift any number of blocks off the top of one stack and set them down on any stack, optionally turning the bundle upside down. Flipping 2 or more blocks in place counts as a move too.',
            '**A tower**: a **whole stack** exactly the asked height, with a plain number on top and only signed blocks below.',
            '**Working it out**: start from the top number and apply each block below in turn. 5, ×2, +3 is 5×2 = 10, then 10+3 = 13 — step by step like a calculator, not multiplication first.',
            '**Next round**: the blocks stay where they are for the next round.',
          ] },
          { type: 'h3', text: 'What the block set tells you' },
          { type: 'list', items: [
            'The three plain blocks are different primes, so one of 2, 3, 5, 7 is missing as a plain number.',
            'The two + and two − blocks share the four primes, one each: 2, 3, 5 and 7 each appear exactly once among them.',
            '× is ×2, ×3 or ×5; ÷ is ÷2 or ÷3. There is no ×7, ÷5 or ÷7.',
          ] },
        ],
      },
      {
        id: 'edge-cases',
        onGamePage: true,
        title: 'Tricky rules',
        blocks: [
          { type: 'cards', items: [
            { title: 'A number on top', body: 'A signed block like +3 or ×2 on top means it is not a tower. Neither is a stack with a plain number further down.' },
            { title: 'Exact height', body: 'If the value matches but the stack has more or fewer blocks than the asked height, it does not count. Blocks left underneath must be cleared away.' },
            { title: 'Flipping reverses order', body: 'Lift three blocks and flip them, and the top one ends up at the bottom. Use it to bring a buried number block to the top in one move.' },
            { title: 'Fractions on the way are fine', body: 'A ÷ need not divide evenly mid-tower. 7, ÷2, ×2 passes through 3.5 but ends at 7. Only the final value has to equal the target.' },
            { title: 'So are negatives', body: '2, −5 is −3 for a moment; a later × or + can bring it back up.' },
            { title: 'One block is not a tower', body: 'Towers are at least two floors, and asked heights are always 3–5, so no round is solved by a lone number.' },
          ] },
        ],
      },
      {
        id: 'beginner',
        level: 'beginner',
        onGamePage: true,
        title: 'Beginner strategy — choose the top, work the rest backwards',
        blocks: [
          { type: 'list', ordered: true, items: [
            '**Only three possible tops**: only the three plain blocks can crown a tower. Decide which one you start from.',
            '**The bottom is the last step**: the lowest block is applied last. For a target of 20 with a ×2 available, build 10 above it; with +3 last, build 17 above it.',
            '**Count blocks from the height**: a 3-floor tower is one number and two signed blocks; 5 floors is one number and four. You know how many signed blocks to pick.',
            '**Watch the values under the stacks**: each stack shows what it is worth read as a tower. Check it against your mental sum before moving.',
          ] },
          { type: 'callout', tone: 'tip', title: 'Lost? Go back to the start', text: 'In solo play, "back to round start" restores the round’s starting position and sets your move count back to 0. Find the path, then go for the fewest moves again.' },
        ],
      },
      {
        id: 'walkthrough',
        title: 'Worked example — 20 with two flips',
        lead: 'Blocks: numbers 5, 2, 7 and signed +3, +7, −2, −5, ×2, ÷3. Target 20, height 3. Tables list the top floor first.',
        blocks: [
          stacks('en', START, 'Starting position. Stack 1 has ×2 on top, so it is not a tower yet.'),
          { type: 'steps', items: [
            { title: 'Find the ingredients', body: '20 = 10 × 2. With ×2 last (at the bottom) you need 10 above it, and 7 + 3 = 10. The blocks 7, +3 and ×2 are all in stack 1 already — just in the wrong order: top-down they read ×2, 7, +3 instead of 7, +3, ×2.' },
            { title: 'Move 1: lift all three of stack 1, flip, put back', body: 'Flipping the whole stack gives +3, 7, ×2 from the top. ×2 is now at the bottom, but a signed block is still on top, so it is not a tower.' },
            { title: 'Move 2: lift the top two, flip, put back', body: 'Flip just +3 and 7 and the stack reads 7, +3, ×2: 7 + 3 = 10, 10 × 2 = 20, exactly 3 floors. Done. The fewest moves for this round is 2, so solo play gives 3 points.' },
          ] },
          stacks('en', STEP1, 'After move 1: stack 1 flipped whole.'),
          stacks('en', STEP2, 'After move 2: stack 1 reads 7 +3 ×2, worth 20.'),
          { type: 'callout', tone: 'note', title: 'Same position, target 18 at height 3', text: '18 = 9 × 2 = (2 + 7) × 2. Put stack 3’s two blocks (2, +7) on top of stack 1 as they are, then move stack 1’s top three (2, +7, ×2) to the now-empty stack 3: it reads 2, +7, ×2. Two moves, the minimum again. An empty stack is a workbench for restacking blocks in the order you want.' },
        ],
      },
      {
        id: 'intermediate',
        level: 'intermediate',
        title: 'Intermediate strategy — what one move can do',
        blocks: [
          { type: 'p', text: 'One move combines "how many to lift", "flip or not" and "where to put them", so it does more than it seems. Learn these four uses and the short solutions start to stand out.' },
          { type: 'cards', items: [
            { tag: 'Carry', title: 'Move a bundle', body: 'Two or three blocks already in the right order can travel together onto another stack in one move — far cheaper than one at a time.' },
            { tag: 'Flip', title: 'Raise a buried number', body: 'If a number block sits at the bottom of a bundle, lift the bundle and flip it: the number comes out on top. You can do it in place.' },
            { tag: 'Clear', title: 'Strip extra blocks', body: 'A stack taller than the target height must lose blocks from the top — or have its top part carried away from the bottom ones. Drop the cleared blocks where they help another tower and one move does two jobs.' },
            { tag: 'Workbench', title: 'Use the empty stack', body: 'Moving a bundle onto an empty stack starts a fresh tower from its bottom, in order or flipped. An empty stack is the freest place on the table.' },
          ] },
          { type: 'h3', text: 'Working backwards' },
          { type: 'p', text: 'Undo the bottom block from the target. If the last block is +n, the value above it is target − n; for −n, target + n; for ×n, target ÷ n (it must divide); for ÷n, target × n. Keep climbing until you reach a number block that is on the table (from 2, 3, 5, 7) and you have a tower. For a target of 13 with −2 last: 15; with ×3 above that: 5 — so 5, ×3, −2.' },
        ],
      },
      {
        id: 'advanced',
        level: 'advanced',
        title: 'Advanced strategy — counting the fewest moves',
        blocks: [
          { type: 'p', text: 'Each round is made by moving blocks a few times from the current position and asking for a tower that happened to appear. So the fewest moves is usually **2 or 3**, now and then 1 or 4. In solo play, if no one-move path shows itself, look for two, then three.' },
          { type: 'list', items: [
            '**All the blocks in one stack**: only the order is wrong; one or two flips usually do it (the 20 above).',
            '**Split over two stacks**: one move to put one bundle on the other plus one to tidy — usually 2–3.',
            '**Extra blocks underneath**: clearing costs a move. If the extra blocks are at the bottom, carrying the tower part away whole is often quicker.',
            '**Think about the next round**: blocks carry over, so when practising notice whether the shape you leave suits the next round.',
          ] },
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          { type: 'list', items: [
            '**Using normal operator order**: 5, +3, ×2 is (5+3)×2 = 16, not 5+6 = 11. One step at a time from the top.',
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
            ['Practice', 'No time limit. After each round you are told its fewest moves.'],
            ['10-minute challenge', '3 points for the fewest moves, 2 for one more, 1 for any other finish, 0 for a skip. Signed in, you are ranked and first place gets the Tower of Equations icon. Switching to another tab or app 3 times or more voids the run for the ranking.'],
            ['Buzzer game', '2–4 players. Within 3 minutes someone calls how many moves they need (1–9); everyone else then has 30 seconds to call fewer once, or pass. The lowest call plays it out within that many moves and 60 seconds. A call of 1 cannot be beaten and plays at once.'],
            ['Buzzer scoring', 'The first caller scores +1 for a tower and −1 for a miss; someone who undercut scores +2 or −2. If nobody calls, the round passes without points. First to the goal (3, 5 or 7; 7 on the show) wins.'],
          ] },
          { type: 'p', text: 'In the buzzer game the blocks stay where the player left them even after a failed attempt, and the next round starts from there. Watch your opponents’ moves even when you are not playing — you are reading the next round in advance.' },
        ],
      },
      {
        id: 'glossary',
        title: 'Glossary',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Target number', def: 'What the finished tower must be worth: a whole number from 1 to 99.' },
            { term: 'Height', def: 'How many floors the tower has; the stack must have exactly that many blocks (3–5).' },
            { term: 'Number block', def: 'A block with no sign. Only it can top a tower; there are three.' },
            { term: 'Signed block', def: 'A +n, −n, ×n or ÷n block, stacked under the number and applied in order from the top.' },
            { term: 'Flip', def: 'Setting a lifted bundle down upside down. Flipping in place is one move too.' },
            { term: 'Fewest moves', def: 'The smallest number of moves that builds the round’s tower; matching it scores 3 in solo play.' },
          ] },
        ],
      },
    ],
    faq: [
      { q: 'What is Tower of Equations?', a: "The day-5 prison match of Netflix's The Devil's Plan: Dead Again (season 3). You move and flip number blocks into a tower worth the target; on the show, whoever called fewer moves took the attempt." },
      { q: 'What blocks are there?', a: 'Nine: three plain number blocks and six signed ones (two +, two −, one ×, one ÷). Numbers are the primes 2, 3, 5 and 7 only, and towers are 3–5 floors. The show never published its block set, so this site chose one.' },
      { q: 'In what order is a tower worked out?', a: 'From the top number down, one block at a time — like a calculator, not multiplication before addition.' },
      { q: 'How many moves does a round usually take?', a: 'Usually 2 or 3, now and then 1 or 4. The fewest moves is shown when the round ends.' },
      { q: 'Is it free? Do I need an account?', a: 'It is free and needs no account. Sign in and your 10-minute challenge results go on the ranking, where first place earns the Tower of Equations icon.' },
    ],
    cta: { title: 'Ready to build the first tower?', body: 'Learn to flip in practice, then chase the fewest moves in the 10-minute challenge.', button: 'Play Tower of Equations' },
    disclaimer: "Tower of Equations is an unofficial fan game based on a game from Netflix's The Devil's Plan: Dead Again and is not affiliated with Netflix or the producers.",
  },
};
export default guide;
