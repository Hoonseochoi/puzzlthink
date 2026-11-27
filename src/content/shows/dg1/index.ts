// 데스게임: 천만원을 걸어라 (The Risk Takers season 1). Netflix, 2026-01-28 – 2026-04-01, 11 episodes: one
// one-on-one match a week, the winner staying on. Games in broadcast order.
import type { Show } from '../types';
import { DISCLAIMER, broadcast1, namuMain, namuResults } from '../dg2/shared';
import { loveWinsAll, memoryFeast, piecesOfLanguage, positionCombo } from './games-a';
import { mineOfOblivion, passOfTruth, runHorse, showMeTheCoin } from './games-b';
import { doublesPlan, heavensSecret, suspects } from './games-c';

const show: Show = {
  slug: 'death-game',
  seo: 'dg1',
  series: 'death-game',
  short: { ko: '데스게임', en: 'Death Game' },
  aired: { start: '2026-01-28', end: '2026-04-01' },
  network: { ko: '넷플릭스', en: 'Netflix' },
  episodes: 11,
  color: '#6c5cff',
  spoiler: true,
  updated: '2026-11-26',
  games: [memoryFeast, positionCombo, loveWinsAll, piecesOfLanguage, showMeTheCoin, mineOfOblivion, runHorse, passOfTruth, heavensSecret, doublesPlan, suspects],
  sources: [
    namuMain,
    namuResults,
    { label: { ko: '네이트 뉴스 — 「데스게임」 1월 28일 첫 공개, 1:1 끝장 매치 형식 보도 (2026년 1월 14일)', en: 'Nate News — Death Game to premiere 28 January as one-on-one matches (14 January 2026)' }, url: 'https://m.news.nate.com/view/20260114n28365' },
    broadcast1,
  ],
  ko: {
    meta: {
      title: '데스게임 게임 정리 — 넷플릭스 데스게임(천만원을 걸어라) 1:1 매치 전 게임 규칙',
      description: '넷플릭스 「데스게임: 천만원을 걸어라」(2026)에 나온 1:1 게임 11개를 방송 순서대로 정리했어요. 기억의 만찬, 위치 콤보, 러브 윈즈 올, 언어의 조각부터 천기누설, 더블스 플랜, 용의자들까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['데스게임', '넷플릭스 데스게임', '데스게임 천만원을 걸어라', '데스게임 게임', '데스게임 게임 정리', '데스게임 시즌1'],
    },
    title: '데스게임 게임 정리 — 데스게임: 천만원을 걸어라',
    name: '데스게임: 천만원을 걸어라',
    lead: '매주 단 한 판, 정치도 연합도 없는 1:1 승부. 열한 번의 대결에 쓰인 게임을 방송 순서대로 모았어요.',
    intro: [
      '「데스게임: 천만원을 걸어라」는 넷플릭스의 두뇌 서바이벌 「데스게임」의 첫 시즌이에요. 2026년 1월 28일부터 4월 1일까지 매주 수요일 공개됐고 모두 11부작이에요. 매회 두 사람이 한 판의 게임으로 맞붙어, 진 사람은 떠나고 이긴 사람은 다음 도전자를 맞아요.',
      '이 페이지는 시즌 1의 게임 11개를 **방송 순서대로** 정리한 목차예요. 이 가운데 러브 윈즈 올, 망각의 지뢰, 더블스 플랜은 시즌 2에서 규칙을 바꿔 다시 나왔어요.',
    ],
    summary: '2026년 1–4월 공개된 시즌 1. 매주 한 판의 1:1 대결로, 기억·추리·베팅 게임 11개.',
    format: [
      { type: 'list', items: [
        '모든 대결은 **1:1 한 판**이에요. 규칙 설명 뒤 두 사람은 같은 장소에서 30분 동안 작전을 준비해요. 선후는 보통 추첨으로 정해요.',
        '진 사람은 바로 탈락하고, 이긴 사람은 승리 횟수에 따라 상금이 쌓이며 시드를 얻어요. 1승이면 1,000만 원이에요.',
        '이긴 사람은 다음 상대를 확인한 뒤 **도전할지 그만둘지** 고를 수 있어요. 그만두면 쌓인 상금을 받고, 도전했다가 지면 일부만 받아요.',
        '**5연승**을 하면 "데스게임 마스터"가 되어 상금 5,000만 원을 받아요.',
        '시즌 1에서 얻은 시드는 시즌 2 토너먼트의 대진에 반영됐어요.',
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: "Death Game games — every one-on-one match of Netflix's The Risk Takers season 1",
      description: "All eleven one-on-one games of Netflix's Death Game (The Risk Takers) season 1 (2026) in broadcast order, from Memory Feast, Position Combo, Love Wins All and Pieces of Language to Heaven's Secret, Doubles Plan and Suspects: rules, what decides each one, and similar board games.",
      keywords: ['Death Game', 'The Risk Takers', 'Netflix Death Game games', 'Korean one-on-one brain games'],
    },
    title: 'Death Game games — season 1',
    name: 'Death Game (season 1)',
    lead: 'One match a week, one on one, no politics or alliances. The games of all eleven duels, in broadcast order.',
    intro: [
      'Death Game (The Risk Takers) is a Netflix brain-survival show. Its first season, released on Wednesdays from 28 January to 1 April 2026 in eleven episodes, pits two players against each other in a single game each episode: the loser leaves, the winner faces the next challenger.',
      'This page lists the season’s eleven games **in broadcast order**. Love Wins All, Mine of Oblivion and Doubles Plan returned in season 2 with revised rules.',
    ],
    summary: 'Season 1, released January–April 2026: eleven weekly one-on-one games of memory, deduction and betting.',
    format: [
      { type: 'list', items: [
        'Every match is **one game, one on one**, with 30 minutes of preparation in the same room after the rules; order is usually drawn.',
        'The loser is eliminated; the winner banks prize money by number of wins and earns a seed (₩10 million for one win).',
        'The winner sees the next opponent and chooses **to continue or stop**: stopping keeps the money, losing after continuing keeps only part.',
        '**Five straight wins** make a "Death Game master" with ₩50 million.',
        'Seeds earned in season 1 placed players in season 2’s bracket.',
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
