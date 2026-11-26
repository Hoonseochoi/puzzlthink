// 데스게임2: 최후의 승자 (The Risk Takers season 2). Netflix, 2026-04-22 – 2026-06-17, 9 episodes, 11 players, a
// seeded tournament. Games in broadcast order: two qualifiers, two main-round games, three last-six duels, the
// semifinal and the final.
import type { Show } from '../types';
import { DISCLAIMER, broadcast2, namuMain, namuResults } from './shared';
import fateWar39 from './fate-war-39';
import cubeHell from './cube-hell';
import signal from './signal';
import greatLegacy from './great-legacy';
import loveWinsAll2 from './love-wins-all-2';
import mineOfOblivion2 from './mine-of-oblivion-2';
import doublesPlan2 from './doubles-plan-2';
import tectonicShift from './tectonic-shift';
import myeongdang from './myeongdang';

const show: Show = {
  slug: 'death-game-2',
  series: 'death-game',
  short: { ko: '데스게임2', en: 'Death Game 2' },
  aired: { start: '2026-04-22', end: '2026-06-17' },
  network: { ko: '넷플릭스', en: 'Netflix' },
  episodes: 9,
  color: '#9b5cff',
  spoiler: true,
  updated: '2026-11-26',
  games: [fateWar39, cubeHell, signal, greatLegacy, loveWinsAll2, mineOfOblivion2, doublesPlan2, tectonicShift, myeongdang],
  sources: [
    namuMain,
    namuResults,
    { label: { ko: '스포츠경향 등 — 「데스게임」 1월 28일 첫 공개, 매주 1:1 매치 형식 보도 (2026년 1월)', en: 'Korean press — Death Game premieres 28 January 2026 as weekly one-on-one matches' }, url: 'https://m.news.nate.com/view/20260114n28365' },
    broadcast2,
  ],
  ko: {
    meta: {
      title: '데스게임2 게임 정리 — 데스게임: 최후의 승자 토너먼트 전 게임 규칙',
      description: '넷플릭스 「데스게임2: 최후의 승자」(2026)에 나온 게임 9개를 방송 순서대로 정리했어요. 운명전쟁39, 큐브 지옥, 시그널, 위대한 유산, 러브 윈즈 올 2, 망각의 지뢰 2, 더블스 플랜 2, 지각 변동, 결승 명당까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['데스게임2', '데스게임 시즌2', '데스게임 최후의 승자', '넷플릭스 데스게임 게임', '데스게임2 게임 정리', '데스게임 결승 명당'],
    },
    title: '데스게임2 게임 정리 — 데스게임: 최후의 승자',
    name: '데스게임2: 최후의 승자',
    lead: '시드를 모아 올라가는 11인 토너먼트. 예선부터 결승까지 아홉 판의 게임을 방송 순서대로 모았어요.',
    intro: [
      '「데스게임」은 넷플릭스의 두뇌 서바이벌로, 시즌 1은 매주 한 판의 1:1 대결, 시즌 2 「최후의 승자」는 토너먼트로 진행됐어요. 시즌 2는 2026년 4월 22일부터 6월 17일까지 매주 수요일 공개됐고 모두 9부작이에요.',
      '이 페이지는 시즌 2의 게임 9개를 **방송 순서대로** 정리한 목차예요. 시즌 1에 나왔던 게임을 고친 버전(러브 윈즈 올 2, 망각의 지뢰 2, 더블스 플랜 2)도 있어요.',
    ],
    summary: '2026년 4–6월 공개된 시즌 2. 시드를 쌓아 올라가는 11인 토너먼트로, 예선·본선·6강·준결승·결승의 9개 게임.',
    format: [
      { type: 'p', text: '시즌 2는 **시드**를 모아 대진표를 올라가는 토너먼트예요. 시즌 1에서 시드를 얻은 사람은 위쪽 대진에 배치돼요.' },
      { type: 'table', head: ['단계', '방식'], rows: [
        ['예선', '시드 0개인 사람들이 두 번의 게임을 치르고, 단계마다 한 명씩 탈락해요. 살아남은 3명이 시드 1개를 받아요.'],
        ['본선', '시드 1개인 6명이 겨뤄 3명이 탈락하고, 살아남은 3명이 시드를 하나 더 받아요.'],
        ['6강', '1:1 대결만 해요. 본선 생존자가 추첨으로 시드 2개인 사람과 붙어요.'],
        ['준결승·결승', '준결승을 거친 두 명이 결승을 치러요. 시드 5개를 모은 단 한 명이 우승해요.'],
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'Death Game 2 games — every game of The Risk Takers: Last Winner tournament',
      description: "All nine games of Netflix's Death Game 2: The Last Winner (2026) in broadcast order — Fate War 39, Cube Hell, Signal, Great Legacy, Love Wins All 2, Mine of Oblivion 2, Doubles Plan 2, Tectonic Shift and the final, Myeongdang: rules, what decides each one, and similar board games.",
      keywords: ['Death Game 2', 'The Risk Takers season 2', 'Netflix Death Game games', 'Korean brain survival tournament'],
    },
    title: 'Death Game 2 games — The Last Winner',
    name: 'Death Game 2: The Last Winner',
    lead: 'An eleven-player tournament climbed by collecting seeds. Nine games from qualifiers to final, in broadcast order.',
    intro: [
      "Death Game (The Risk Takers) is a Netflix brain-survival show: season 1 was one one-on-one match a week, season 2, The Last Winner, a tournament. Season 2's nine episodes were released on Wednesdays from 22 April to 17 June 2026.",
      'This page lists its nine games **in broadcast order**, including revised versions of season-1 games (Love Wins All 2, Mine of Oblivion 2, Doubles Plan 2).',
    ],
    summary: 'Season 2, released April–June 2026: an eleven-player seeded tournament of nine games, qualifiers to final.',
    format: [
      { type: 'p', text: 'Season 2 is a tournament climbed by **seeds**; players who earned seeds in season 1 start higher in the bracket.' },
      { type: 'table', head: ['Stage', 'How it works'], rows: [
        ['Qualifiers', 'Players with no seed play two games, one eliminated at each; the three survivors earn a seed.'],
        ['Main round', 'Six one-seed players; three are eliminated and the survivors earn another seed.'],
        ['Last six', 'One-on-one only; main-round survivors are drawn against two-seed players.'],
        ['Semifinal and final', 'Two players reach the final; the one who collects five seeds wins.'],
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
