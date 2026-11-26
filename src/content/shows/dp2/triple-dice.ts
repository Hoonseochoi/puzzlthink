import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'triple-dice',
  kind: 'prison',
  when: { ko: '4일차', en: 'Day 4' },
  related: ['hitStay', 'heavy13', 'indianPoker'],
  updated: '2026-11-26',
  sources: [namuDay(4), broadcast],
  ko: {
    meta: {
      title: '트리플 다이스 규칙 — 데블스플랜2(데스룸) 4일차 감옥매치, 주사위 세 개 조합과 점수 예측',
      description: '데블스 플랜: 데스룸(데블스플랜2) 4일차 감옥매치 트리플 다이스의 규칙을 정리했어요. 흰 주사위 9개와 숨긴 색 주사위 2개, ZERO·MIN·MORE·MAX 점수 예측, 세 번의 주사위 제출과 조합 순위, 예측 성공 보너스까지.',
      keywords: ['트리플 다이스', '데블스플랜2 트리플 다이스', '데블스 플랜 데스룸 트리플 다이스', '데블스플랜2 감옥매치', '트리플 다이스 규칙'],
    },
    title: '트리플 다이스 — 데블스플랜2 4일차 감옥매치',
    name: '트리플 다이스',
    lead: '주사위 열한 개 중 세 개씩 세 번 내서 조합을 겨뤄요. 그 전에 이번 라운드 점수를 미리 맞히면 점수가 두 배예요.',
    summary: '공개 주사위 9개와 숨긴 주사위 2개로 세 번의 조합 대결을 하고, 내 라운드 점수를 미리 예측하는 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 넷째 날 감옥동 인원 전원.',
        '**주사위**: 각자 흰 주사위 9개, 파란 주사위 1개, 빨간 주사위 1개.',
        '**예측 카드**: ZERO(0점), MIN(0점 초과 7점 미만), MORE(7점 이상 10점 이하), MAX(10점 초과).',
        '**라운드**: 4라운드.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '굴리기', body: '흰 주사위 9개를 굴려요. 결과는 모두에게 공개돼요. 이어서 파란·빨간 주사위를 같은 색 다이스 타워에서 굴리는데, 이 두 개는 나만 볼 수 있어요.' },
        { title: '점수 예측', body: '선부터 차례로, 이번 라운드에 받을 점수를 예측 카드로 몰래 내요.' },
        { title: '주사위 세 개 제출', body: '선부터 원하는 주사위 3개를 내요. 숨긴 주사위를 내고 싶으면 그 색의 마커를 내고, 숨긴 주사위는 모두 낸 뒤에 공개돼요.' },
        { title: '순위와 점수', body: '조합을 비교해 1위 6점, 2위 3점, 3위 1점, 4위 0점을 받아요. 같은 순위면 그 순위 점수의 평균을 나눠요.' },
        { title: '세 번 반복', body: '두 번째 제출부터는 직전 제출에서 가장 높았던 사람이 선이 되어, 남은 주사위 중 세 개를 내요. 세 번 내고 남은 두 개는 버려요.' },
      ] },
      { type: 'table', head: ['조합 (높은 순)', '조건'], rows: [
        ['트리플', '같은 숫자 3개'],
        ['스트레이트', '이어지는 숫자 3개 (6과 1은 이어지지 않음)'],
        ['더블', '같은 숫자 2개'],
        ['싱글', '위 어느 것도 아님'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '라운드가 끝날 때 **예측이 맞으면 그 라운드 점수가 2배**예요. ZERO 예측이 맞으면 대신 40점을 더 받아요.',
        '4라운드 뒤 단독 1위는 피스 1개를 받고, **최종 점수가 가장 낮은 사람이 탈락**해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '같은 조합이면 조합에 쓴 숫자가 높은 쪽, 그것도 같으면 남은 숫자가 높은 쪽이 위예요. 완전히 같으면 동률이에요.',
        '직전 제출에서 공동 1위였다면, 지금까지 누적 점수가 높은 사람이 선이에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '트리플 다이스의 가장 큰 숫자는 조합 점수가 아니라 **ZERO 예측 성공의 40점**이에요. 한 라운드 최대 18점(6점 세 번)을 두 배로 해도 36점이라, 0점을 정확히 맞히는 쪽이 더 커요.' },
      { type: 'cards', items: [
        { title: 'ZERO는 지기 위한 계산', body: 'ZERO를 맞히려면 세 번 모두 꼴찌여야 해요. 그런데 꼴찌도 다른 사람의 주사위에 달려 있어서, 내 주사위를 약하게 내도 다른 사람이 더 약하게 내면 1점이 생겨 실패해요. 여럿이 ZERO를 노리면 "누가 더 못하나" 싸움이 돼요.' },
        { title: '숨긴 주사위 두 개', body: '공개 주사위 9개는 모두에게 보이므로, 남이 만들 수 있는 조합은 대부분 계산돼요. 차이를 만드는 건 숨긴 두 개예요. 숨긴 주사위로 조합이 완성되는지, 혹은 일부러 망가지는지를 상대는 마지막까지 몰라요.' },
        { title: '세 번에 나눠 쓰기', body: '주사위 11개 중 9개를 세 번에 나눠 써야 해요. 첫 제출에 트리플을 쓰면 남은 두 번이 약해지므로, 예측한 점수 구간에 맞게 언제 강하게, 언제 약하게 낼지 배분해야 해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '야추 (Yahtzee)', players: '1명 이상', alike: '주사위 눈으로 트리플·스트레이트 같은 조합을 만드는 게임이에요.', differs: '야추는 다시 굴리며 조합을 완성하고, 상대와 직접 순위를 겨루지 않아요.' },
      { name: '위저드 (Wizard)', players: '3–6명', alike: '라운드 시작 전에 내가 얼마나 이길지 예측하고, 정확히 맞히면 큰 보너스를 받는 구조예요.', differs: '위저드는 트릭테이킹 카드 게임이라, 주사위가 아니라 카드로 판을 이겨요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Triple Dice rules — The Devil's Plan 2 (Death Room), day 4 prison match",
      description: "The rules of Triple Dice from The Devil's Plan: Death Room (season 2): nine open dice and two hidden ones, ZERO/MIN/MORE/MAX score predictions, three submissions of three dice ranked by combination, and the prediction bonus.",
      keywords: ['Triple Dice', "Devil's Plan 2 Triple Dice", "Devil's Plan Death Room prison match"],
    },
    title: "Triple Dice — The Devil's Plan 2, day 4 prison match",
    name: 'Triple Dice',
    lead: 'Play three of your eleven dice three times to compare combinations — and predict your round score first to double it.',
    summary: 'Three dice-combination showdowns per round from nine open and two hidden dice, with a prediction of your own round score.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone in prison on day 4.',
        '**Dice**: nine white, one blue and one red each.',
        '**Prediction cards**: ZERO (0), MIN (more than 0, under 7), MORE (7 to 10), MAX (over 10).',
        '**Rounds**: four.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Rolling', body: 'Roll the nine white dice in the open, then the blue and red dice in their own dice towers, seen only by you.' },
        { title: 'Predict', body: 'From the first player, everyone secretly plays a prediction card for this round’s score.' },
        { title: 'Submit three dice', body: 'From the first player, submit three dice; for a hidden die, submit its colour marker. Hidden dice are revealed after everyone has submitted.' },
        { title: 'Ranking', body: 'Combinations score 6, 3, 1 and 0 for 1st to 4th; ties share the average.' },
        { title: 'Three times', body: 'From the second submission, the previous best leads, using the remaining dice. After three submissions, the last two dice are discarded.' },
      ] },
      { type: 'table', head: ['Combination (high to low)', 'Needs'], rows: [
        ['Triple', 'Three of a number'],
        ['Straight', 'Three consecutive (6 and 1 are not consecutive)'],
        ['Double', 'Two of a number'],
        ['Single', 'None of the above'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'A **correct prediction doubles the round’s score**; a correct ZERO adds 40 points instead.',
        'After four rounds the sole leader gets a piece, and **the lowest total is eliminated**.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Equal combinations compare their numbers, then the remaining die; identical ones tie.',
        'If the previous submission tied for first, the higher running total leads.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The biggest number in Triple Dice is not a combination but **the 40 points for a correct ZERO**. The best round, 18 points doubled, is 36.' },
      { type: 'cards', items: [
        { title: 'ZERO is calculated losing', body: 'A ZERO needs last place three times, which also depends on others: play weak and someone weaker hands you a point. Several players chasing ZERO becomes a race to the bottom.' },
        { title: 'The two hidden dice', body: 'Nine open dice make most combinations calculable; the two hidden dice make the difference, completing or deliberately breaking a combination unseen until the end.' },
        { title: 'Spreading over three', body: 'Nine of eleven dice go out over three submissions. A triple first weakens the rest, so strength must be spread to land in the predicted band.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Yahtzee', players: '1+', alike: 'Build triples and straights from dice.', differs: 'You reroll to complete combinations and do not rank directly against others.' },
      { name: 'Wizard', players: '3–6', alike: 'Predict how well you will do before the round and earn a big bonus for being exact.', differs: 'It is a trick-taking card game.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
