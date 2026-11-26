import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'equation-pyramid',
  kind: 'prison',
  when: { ko: '6일차 (준결승)', en: 'Day 6 (semifinal)' },
  related: ['equationTower', 'equationSignal', 'hexagon'],
  updated: '2026-11-26',
  sources: [namuDay(6), broadcast],
  ko: {
    meta: {
      title: '수식 피라미드 규칙 — 데블스플랜2(데스룸) 6일차 감옥매치, 세 칸으로 타깃 넘버 만들기',
      description: '데블스 플랜: 데스룸(데블스플랜2) 마지막 감옥매치 수식 피라미드의 규칙을 정리했어요. 피라미드 10칸과 타깃 넘버, 세 칸 고르기와 첫 칸 부호 무시, 사칙연산 순서, 버저와 ±1점, 라운드 종료 조건, 빠르게 찾는 방법까지.',
      keywords: ['수식 피라미드', '데블스플랜2 수식 피라미드', '데블스 플랜 데스룸 수식 피라미드', '데블스플랜2 감옥매치', '수식 피라미드 규칙'],
    },
    title: '수식 피라미드 — 데블스플랜2 6일차 감옥매치',
    name: '수식 피라미드',
    lead: '부호와 숫자가 적힌 피라미드 10칸 중 세 칸을 골라 타깃 넘버를 만드는, 버저 계산 대결이에요.',
    summary: '피라미드 10칸 중 세 칸을 이어 타깃 넘버가 되는 수식을 남보다 먼저 외치는 1:1 계산 대결.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출을 다투는 2명(6일차 메인 매치에서 직행하지 못한 두 사람).',
        '**피라미드**: 10칸. 칸마다 부호(+, −, ×, ÷)와 숫자가 함께 적혀 있고, 칸은 알파벳으로 불러요.',
        '**라운드**: 10라운드. 라운드마다 새 피라미드와 타깃 넘버가 공개돼요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '세 칸 고르기', body: '피라미드 칸 3개를 골라 이어 붙인 수식이 타깃 넘버가 되도록 찾아요. 같은 칸을 두 번 쓸 수 없고, **맨 처음 칸의 부호는 무시**해요.' },
        { title: '계산 순서', body: '수식은 사칙연산의 순서대로(곱셈·나눗셈 먼저) 계산해요.' },
        { title: '버저', body: '찾으면 버저를 누르고 10초 안에 칸의 알파벳을 순서대로 말해요.' },
        { title: '점수', body: '맞으면 +1점. 틀리거나, 10초 안에 못 말하거나, 이미 나온 답을 또 말하면 −1점이에요.' },
      ] },
      { type: 'p', text: '라운드는 시작 후 3분이 지나거나 가능한 정답이 모두 나오면 끝나요.' },
    ],
    win: [
      { type: 'list', items: [
        '10라운드 뒤 **승점이 높은 사람이 이겨** 결승에 진출해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 라운드에 정답이 여러 개일 수 있어요. 이미 나온 조합을 다시 말하면 감점이에요.',
        '첫 칸의 부호가 무시되므로, 어떤 칸이든 맨 앞에 오면 그냥 숫자로 쓰여요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '수식 피라미드는 **경우의 수를 빨리 훑는 체계**를 가진 사람이 이겨요. 10칸에서 순서 있게 3칸을 고르는 방법은 720가지라, 모두 계산할 수는 없어요.' },
      { type: 'cards', items: [
        { title: '곱셈 칸이 기준점', body: '곱셈과 나눗셈이 먼저 계산되므로, 타깃이 큰 수라면 ×칸 두 개를 이어 붙이는 조합부터, 작은 수라면 ÷나 −칸을 포함한 조합부터 보는 식으로 범위를 좁혀요.' },
        { title: '첫 칸은 숫자로만', body: '맨 앞 칸의 부호가 무시되므로, 큰 숫자가 적힌 칸을 맨 앞에 두면 그 숫자에서 출발할 수 있어요. 부호 때문에 버려 둔 칸도 첫 칸으로는 쓸 수 있다는 점을 놓치지 마세요.' },
        { title: '감점의 무게', body: '틀리면 −1이라, 확신 없이 누르면 앞선 점수를 날려요. 남은 정답이 몇 개일지, 상대가 이미 몇 개 찾았을지를 생각하며 누를지 정해야 해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '크립토 (Krypto)', players: '1명 이상', alike: '숫자 카드를 사칙연산으로 묶어 목표 숫자를 만드는 계산 게임이에요.', differs: '크립토는 다섯 장을 모두 쓰고, 칸에 붙은 부호 같은 제약이 없어요.' },
      { name: '24 게임', players: '1–4명', alike: '숫자로 목표 값을 만드는 방법을 남보다 빨리 찾는 속도 경쟁이에요.', differs: '24 게임은 목표가 늘 24이고, 감점이 없어요.' },
      { name: '셋 (SET)', players: '1명 이상', alike: '판 위에서 조건에 맞는 세 개의 조합을 먼저 찾아 외치는 게임이에요.', differs: '셋은 계산이 아니라 모양·색·개수 같은 속성을 맞춰요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Equation Pyramid rules — The Devil's Plan 2 (Death Room), day 6 prison match",
      description: "The rules of Equation Pyramid, the last prison match of The Devil's Plan: Death Room (season 2): a ten-cell pyramid and a target number, choosing three cells with the first sign ignored, operator precedence, the buzzer and ±1 scoring, and how to search fast.",
      keywords: ['Equation Pyramid', "Devil's Plan 2 Equation Pyramid", "Devil's Plan Death Room prison match"],
    },
    title: "Equation Pyramid — The Devil's Plan 2, day 6 prison match",
    name: 'Equation Pyramid',
    lead: 'Pick three of ten pyramid cells, each a sign and a number, to make the target — first to the buzzer.',
    summary: 'A 1:1 buzzer duel: chain three of ten pyramid cells into an equation worth the target.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two competing for the second place in the final.',
        '**Pyramid**: ten cells, each a sign (+ − × ÷) with a number, named by letters.',
        '**Rounds**: ten, each with a new pyramid and target.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Pick three cells', body: 'Find three cells that chain into an equation worth the target. No cell twice, and **the first cell’s sign is ignored**.' },
        { title: 'Precedence', body: 'The equation follows normal order of operations (× and ÷ first).' },
        { title: 'Buzz', body: 'Buzz and say the cells’ letters in order within 10 seconds.' },
        { title: 'Score', body: 'Right is +1. Wrong, too slow, or repeating an answer already given is −1.' },
      ] },
      { type: 'p', text: 'A round ends after three minutes or when every answer has been found.' },
    ],
    win: [
      { type: 'list', items: [
        'After ten rounds **the higher score wins** and goes to the final.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A round can have several answers; repeating one already called costs a point.',
        'Since the first sign is ignored, any cell placed first acts as a plain number.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Whoever has **a system for scanning combinations** wins: there are 720 ordered ways to pick three of ten cells, far too many to compute one by one.' },
      { type: 'cards', items: [
        { title: 'Anchor on multiplication', body: 'With × and ÷ first, look at chains of two × cells for big targets and at ÷ or − cells for small ones.' },
        { title: 'The first cell is just a number', body: 'Its sign is ignored, so a big number cell up front starts you high, and cells with awkward signs are still usable first.' },
        { title: 'The cost of a miss', body: 'A wrong buzz loses a point, so pressing without certainty throws away a lead. Weigh how many answers are probably left and how many your opponent has found.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Krypto', players: '1+', alike: 'Combine number cards with arithmetic to reach a target.', differs: 'All five cards are used, without signs fixed to cells.' },
      { name: '24 Game', players: '1–4', alike: 'Race to find a way to a target from numbers.', differs: 'The target is always 24, with no penalties.' },
      { name: 'SET', players: '1+', alike: 'Spot a valid group of three on a shared layout first.', differs: 'It is about matching shapes, colours and counts, not arithmetic.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
