import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'pyramid-number',
  kind: 'final',
  when: { ko: '9일차 파이널', en: 'Day 9, final' },
  related: ['equationTower', 'equationSignal', 'hexagon'],
  updated: '2026-11-26',
  sources: [namuDay('9'), broadcast],
  ko: {
    meta: {
      title: '피라미드 넘버 규칙 — 피의 게임X 파이널, 세 숫자로 더 높은 층 만들기',
      description: '피의 게임X 파이널 피라미드 넘버의 규칙을 정리했어요. 숫자·기호 타일 26개, 세 숫자를 모두 쓰는 수식, 피라미드의 목표 숫자 14개, 정답 선언과 상대의 30초 반격, 불가능 선언의 +5/−3, 10라운드 승점까지.',
      keywords: ['피라미드 넘버', '피의 게임X 피라미드 넘버', '피의게임X 파이널', '수식 게임', '피의게임X'],
    },
    title: '피라미드 넘버 — 피의 게임X 파이널',
    name: '피라미드 넘버',
    lead: '숫자 세 개를 모두 써서 피라미드 속 목표 숫자를 만들어요. 상대가 더 높은 층을 만들면 내 점수를 빼앗겨요.',
    summary: '주어진 세 숫자를 모두 써서 피라미드의 목표 숫자를 만들고, 서로 더 높은 층을 만들며 점수를 다투는 1:1 결승.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1(4인 토너먼트 결승의 한 경기).',
        '**타일 26개 (각자)**: 숫자 2–15(14개)와 기호 +, +, −, −, ×, ×, ÷, ÷, ^, √, (, )(12개).',
        '**라운드**: 10라운드. 라운드마다 연산용 숫자 3개와, 피라미드 모양으로 놓인 목표 숫자 14개가 공개돼요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '수식 만들기', body: '연산용 숫자 3개를 **모두** 써서 목표 숫자 중 하나가 되는 수식을 만들어요. 만들 수 있는 목표가 여러 개일 수도, 하나도 없을 수도 있어요.' },
        { title: '정답 선언', body: '선언하면 5초 안에 수식을 보여 줘야 해요. 틀리거나 늦으면 −1점이에요.' },
        { title: '반격', body: '정답이면 상대에게 30초 동안 **더 높은 층**의 목표 숫자를 만들 기회가 가요. 이 기회에서는 틀려도 감점이 없어요. 상대가 성공하면 다시 나에게 더 높은 층의 기회가 와요.' },
        { title: '점수', body: '라운드에서 가장 높은 층을 마지막으로 만든 사람이 그 층에 따른 승점을 받아요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '10라운드 뒤 승점이 높은 사람이 이 경기를 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**불가능 선언**: 아무도 정답을 선언하지 않았을 때 할 수 있어요. 그러면 상대는 1분 안에 아무 목표 숫자나 만들어야 해요. 못 만들면 선언한 사람이 +5점(상대가 틀린 답을 냈다면 상대 −1점), 만들면 선언한 사람이 −3점이고 상대는 그 목표 숫자의 승점을 받아요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '피라미드 넘버는 **첫 정답을 언제 외칠지**의 게임이에요. 낮은 층을 먼저 외치면 상대에게 30초 동안 감점 없는 반격 기회를 주고, 상대가 더 높은 층을 만들면 점수는 상대 몫이 돼요.' },
      { type: 'cards', items: [
        { title: '처음부터 높게', body: '먼저 외치는 쪽은 상대에게 시간을 주는 셈이라, 가능한 한 높은 층을 찾은 뒤에 외치는 것이 좋아요. 다만 너무 오래 찾으면 상대가 먼저 외치고, 그때는 내가 반격하는 쪽이 돼요. 반격 쪽은 틀려도 감점이 없어서 오히려 유리할 수 있어요.' },
        { title: '기호가 넉넉하지 않아요', body: '+, −, ×, ÷는 두 개씩, ^와 √와 괄호는 하나씩이라 같은 연산을 세 번 쓸 수 없어요. 그런데 숫자는 세 개뿐이라 연산은 두 번이면 충분하고, √와 괄호가 경우의 수를 크게 늘려요. 거듭제곱(^)은 큰 목표 숫자를 만드는 핵심이에요.' },
        { title: '불가능 선언은 계산된 도박', body: '세 숫자로 만들 수 있는 값의 범위를 빠르게 훑어 하나도 맞지 않는다고 확신하면 +5점이에요. 하지만 상대가 1분 안에 하나라도 찾으면 −3점에 상대 득점까지 생겨요. 목표 숫자가 14개나 되므로, 정말 불가능한 판은 드물다고 보는 편이 안전해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '24 게임', players: '1–4명', alike: '주어진 숫자를 모두 사칙연산으로 묶어 목표 값을 만드는 속도 경쟁이에요.', differs: '24 게임은 목표가 24 하나뿐이고, 층이나 반격이 없어요.' },
      { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자 카드를 모두 써서 목표 숫자를 만드는 카드 게임이에요.', differs: '크립토는 숫자 다섯 장으로 목표 하나를 만들어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 층별 승점 값은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Pyramid Number rules — The Bloody Game X final',
      description: 'The rules of Pyramid Number from the final of The Bloody Game X (피의 게임X): 26 number and operator tiles, equations using all three given numbers, fourteen targets in a pyramid, declaring and the opponent’s 30-second counter, the impossible call (+5/−3), and ten rounds of scoring.',
      keywords: ['Pyramid Number', 'Bloody Game X final', 'maths game', '피의 게임X'],
    },
    title: 'Pyramid Number — The Bloody Game X final',
    name: 'Pyramid Number',
    lead: 'Use all three numbers to make a target in the pyramid. If your opponent reaches a higher level, they take the points.',
    summary: 'A 1:1 final game: use all three given numbers to hit pyramid targets, trading higher and higher levels.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1 (one match of the four-player knockout final).',
        '**26 tiles each**: numbers 2–15 (14) and the symbols +, +, −, −, ×, ×, ÷, ÷, ^, √, (, ) (12).',
        '**Rounds**: ten; each shows three working numbers and fourteen targets arranged as a pyramid.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Build', body: 'Make an equation using **all three** working numbers that equals one of the targets. Several targets may be possible, or none.' },
        { title: 'Declare', body: 'Show your equation within five seconds; a wrong or late one costs a point.' },
        { title: 'Counter', body: 'A correct declaration gives the opponent 30 seconds to make a **higher level**, with no penalty for mistakes; if they succeed, you get the same chance back.' },
        { title: 'Points', body: 'Whoever last made the highest level scores by that level.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After ten rounds the higher score wins the match.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Impossible**: with no declaration yet, call it impossible; the opponent has one minute to make any target. If they fail, the caller gets +5 (and an opponent who gave a wrong answer loses 1); if they succeed, the caller loses 3 and the opponent scores that target.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Pyramid Number is about **when to make the first call**. A low first call hands the opponent 30 penalty-free seconds, and a higher level takes the points.' },
      { type: 'cards', items: [
        { title: 'Start high', body: 'Calling first gives your opponent time, so find the highest level you can before calling — but wait too long and they call first, making you the counter-attacker, who cannot be penalised.' },
        { title: 'Symbols are scarce', body: 'Two each of + − × ÷ and one each of ^, √ and parentheses. With only three numbers two operations suffice, but √ and brackets multiply the possibilities, and ^ is how big targets are reached.' },
        { title: 'Impossible is a calculated gamble', body: 'Sure no target fits? +5. But if the opponent finds one in a minute, −3 plus their points. With fourteen targets, truly impossible rounds are probably rare.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '24 Game', players: '1–4', alike: 'Race to combine all the given numbers into a target.', differs: 'The target is always 24, with no levels or counters.' },
      { name: 'Krypto', players: '1+', alike: 'Use every number card to make a target.', differs: 'Five numbers, one target.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Points per level are not reproduced.',
  },
};

export default game;
