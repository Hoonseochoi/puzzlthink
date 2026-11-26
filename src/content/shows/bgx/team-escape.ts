import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'team-escape',
  kind: 'opening',
  when: { ko: '1일차', en: 'Day 1' },
  related: ['equationTower', 'nemoCount', 'hexagon'],
  updated: '2026-11-26',
  sources: [namuDay('1-2'), broadcast],
  ko: {
    meta: {
      title: '팀 선착순 규칙 — 피의 게임X 오프닝 게임, 세 문제의 곱으로 자물쇠 풀기',
      description: '피의 게임X 오프닝 게임 팀 선착순의 규칙을 정리했어요. 수갑·밧줄·쇠사슬로 묶인 4인 팀, 30초마다 반복되는 세 문제, 정답의 곱이 비밀번호인 자물쇠, 탈출 판정, 꼴찌 팀이 외부 생존지로 가는 이유까지.',
      keywords: ['팀 선착순', '피의 게임X 팀 선착순', '피의게임X 오프닝', '피의 게임X 게임', '피의게임X'],
    },
    title: '팀 선착순 — 피의 게임X 오프닝 게임',
    name: '팀 선착순',
    lead: '팀원끼리 쇠사슬로 묶인 채 시작해요. 세 문제의 답을 곱한 수가 다리를 묶은 자물쇠의 비밀번호예요.',
    summary: '세 문제의 답을 곱해 자물쇠를 풀고 팀 전원이 탈출하는 선착순 레이스. 꼴찌 팀은 저택 밖에서 생활해요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 20명, 4명씩 다섯 팀.',
        '**구속**: 손은 수갑, 다리는 자물쇠 달린 밧줄로 묶이고, 팀원끼리는 쇠사슬로 이어져 있어요.',
        '**문제**: 화면에 세 문제가 30초 간격으로 돌아가며 반복해서 나와요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '수갑 해제', body: '게임이 시작되면 손의 수갑만 풀려요.' },
        { title: '세 문제 풀기', body: '화면의 세 문제를 풀어요. 세 정답을 **모두 곱한 값**이 다리 밧줄 자물쇠의 비밀번호예요.' },
        { title: '탈출', body: '자물쇠를 풀고, 팀원 모두의 몸이 의자에서 완전히 떨어지면 탈출로 인정돼요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '팀 전원이 빨리 탈출할수록 좋은 순위예요.',
        '**마지막까지 전원이 탈출하지 못한 팀**은 모두 탈락 후보가 되고, 피의 저택에 들어가지 못한 채 외부 생존지에서 지내요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '한 명이라도 의자에 몸이 닿아 있으면 팀은 탈출하지 못한 거예요.',
        '문제는 한 번에 하나씩, 30초마다 바뀌며 반복돼요. 놓친 문제는 다음 차례를 기다려야 해요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '팀 선착순은 문제 풀이 실력만큼 **역할 분담**을 시험해요. 세 문제가 번갈아 나오므로, 팀원마다 맡을 문제를 미리 정하면 30초 주기를 기다리는 시간을 줄일 수 있어요.' },
      { type: 'cards', items: [
        { title: '곱셈은 실수를 키워요', body: '정답을 곱한 값이 비밀번호라, 한 문제만 틀려도 비밀번호 전체가 틀려요. 그런데 자물쇠는 틀렸다고 알려 주지 않아요. 세 답 중 어느 것이 틀렸는지 모르는 채로 다시 풀어야 하므로, 처음부터 두 명이 같은 문제를 따로 풀어 맞춰 보는 검산이 오히려 빠를 수 있어요.' },
        { title: '첫 판이 판을 정해요', body: '이 게임의 꼴찌 팀은 외부 생존지에서 시작하고, 그날의 머니 챌린지에도 나오지 못해요. 순위 차이가 바로 생활 조건과 다음 게임의 기회로 이어지는 구조라, 첫 게임의 무게가 다른 날보다 커요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '언락! (Unlock!)', players: '1–6명', alike: '퍼즐을 풀어 나온 숫자로 자물쇠를 여는 방탈출 카드 게임이에요.', differs: '언락은 팀끼리 경쟁하지 않고 제한 시간 안에 함께 탈출하는 협력 게임이에요.' },
      { name: '엑시트 (EXIT: The Game)', players: '1–4명', alike: '여러 단서의 답을 조합해 암호를 만들고 다음 단계를 여는 방탈출 게임이에요.', differs: '엑시트는 한 번 하고 나면 재료를 훼손해 다시 할 수 없고, 몸을 쓰는 요소가 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 세 문제의 내용은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Team Escape rules — The Bloody Game X opening game',
      description: 'The rules of the opening game of The Bloody Game X (피의 게임X): teams of four cuffed and chained together, three repeating puzzles, a lock whose code is the product of the answers, what counts as escaping, and why the last team lives outside.',
      keywords: ['Bloody Game X opening game', 'The Bloody Game X games', '피의 게임X'],
    },
    title: 'Team Escape — The Bloody Game X opening game',
    name: 'Team Escape (팀 선착순)',
    lead: 'Teams start chained together. Multiply the answers to three puzzles and you have the code to the lock on your legs.',
    summary: 'Multiply three answers to open a lock and get the whole team out first; the last team lives outside the mansion.',
    setup: [
      { type: 'list', items: [
        '**Players**: 20, in five teams of four.',
        '**Restraints**: hands cuffed, legs tied with a locked rope, teammates chained to each other.',
        '**Puzzles**: three questions shown in rotation, 30 seconds each, repeating.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Cuffs off', body: 'Only the handcuffs come off when the game starts.' },
        { title: 'Solve three', body: 'The **product of the three answers** is the code for the leg lock.' },
        { title: 'Escape', body: 'A team escapes when every member’s body is fully off their chair.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'Faster full-team escapes rank higher.',
        '**The team that does not get everyone out** is put up for elimination and starts outside the mansion, in the outdoor camp.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'One member still touching a chair means the team has not escaped.',
        'Questions rotate every 30 seconds; a missed one means waiting for it to come round again.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Team Escape tests **division of labour** as much as puzzle-solving. With the questions rotating, assigning one to each member cuts the waiting.' },
      { type: 'cards', items: [
        { title: 'Multiplication amplifies mistakes', body: 'One wrong answer makes the whole code wrong, and the lock never says which. Having two people solve the same question independently and compare can be faster than guessing which answer failed.' },
        { title: 'The first game sets the stage', body: 'The last team starts outside and misses that day’s money challenge, so this result carries straight into living conditions and the next chance to play.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Unlock!', players: '1–6', alike: 'Solve puzzles for numbers that open locks — an escape-room card game.', differs: 'It is cooperative, against the clock rather than other teams.' },
      { name: 'EXIT: The Game', players: '1–4', alike: 'Combine several answers into a code to open the next stage.', differs: 'It is played once (the materials are destroyed) and has no physical element.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The puzzles themselves are not reproduced.',
  },
};

export default game;
