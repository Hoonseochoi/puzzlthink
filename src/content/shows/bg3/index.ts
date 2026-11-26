// 피의 게임3 (The Bloody Game 3). Wavve, 2024-11-15 – 2025-01-24, 14 episodes plus a behind-the-scenes episode.
// Games in broadcast order: each day's money challenge and death match, the two Final In Stage games and the final.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuRules } from './shared';
import { balanceMatch, firstCome, mysteryTime, switchPoker } from './days-1-2';
import { blindBetting, brickBuild, equationLink, predictWins } from './days-4-6';
import { criminalMemory, equationMaze, hiddenCode, sevenNote } from './days-7-8';
import { artAuction, blackVillage, cutLine, goodAndEvil, memory30, memoryCount, mixAndMatch, try13 } from './days-9-12';

const show: Show = {
  slug: 'bloody-game-3',
  series: 'bloody-game',
  short: { ko: '피의 게임3', en: 'Bloody Game 3' },
  aired: { start: '2024-11-15', end: '2025-01-24' },
  network: { ko: '웨이브', en: 'Wavve' },
  episodes: 15,
  color: '#9b1c2e',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    firstCome, switchPoker, mysteryTime, balanceMatch, predictWins, brickBuild, equationLink, blindBetting,
    sevenNote, hiddenCode, criminalMemory, equationMaze, try13, memory30, goodAndEvil, blackVillage,
    cutLine, memoryCount, artAuction, mixAndMatch,
  ],
  sources: [
    { label: { ko: '나무위키 「피의 게임3」 (공개일·회차·형식)', en: 'Namuwiki, "The Bloody Game 3" (release dates, episodes, format)' }, url: `https://namu.wiki/w/${encodeURIComponent('피의 게임3')}` },
    namuRules,
    broadcast,
  ],
  ko: {
    meta: {
      title: '피의 게임3 게임 정리 — 머니 챌린지·데스매치·결승 전 게임 규칙',
      description: '웨이브 「피의 게임3」(2024–2025)에 나온 게임 20개를 방송 순서대로 정리했어요. 스위치 포커, 미스터리 타임, 수식 링크, 크리미널 메모리, 트라이13, 선과 악부터 결승 아트경매·블랙 빌리지·믹스 앤 매치까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['피의 게임3', '피의게임3', '피의 게임 시즌3', '피의 게임3 게임', '피의게임3 게임 정리', '피의 게임3 머니 챌린지', '피의 게임3 데스매치', '피의 게임3 결승'],
    },
    title: '피의 게임3 게임 정리',
    name: '피의 게임3',
    lead: '낙원과 저택, 그리고 잔해. 서로 다른 공간에서 시작한 플레이어들이 매일 머니 챌린지와 데스매치를 치러요. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「피의 게임3」은 웨이브의 서바이벌 「피의 게임」 시리즈의 세 번째 시즌이에요. 2024년 11월 15일부터 2025년 1월 24일까지 공개됐고, 본편 14회와 비하인드 1회로 모두 15회예요.',
      '이 페이지는 방송에 나온 게임 20개를 **방송 순서대로** 정리한 목차예요. 게임마다 따로 페이지를 두고 규칙, 승부를 가르는 지점, 비슷한 보드게임을 담았어요.',
    ],
    summary: '2024년 11월–2025년 1월 공개. 낙원·저택·잔해로 나뉜 플레이어들이 머니 챌린지와 데스매치를 치르고, 파이널 인 스테이지를 거쳐 4인 결승으로 끝나요.',
    format: [
      { type: 'p', text: '피의 게임3는 **공간이 계급**인 서바이벌이에요. 플레이어들은 처음부터 서로 다른 곳에서 생활하고, 머니 챌린지 결과에 따라 자리를 옮기거나 탈락 후보가 돼요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['피의 낙원 · 피의 저택', '플레이어들이 생활하는 두 공간이에요. 첫날에는 두 곳에서 따로 게임을 했어요.'],
        ['피의 잔해', '밀려난 플레이어들이 지내는 열악한 공간이에요. 이와 별도로 코인으로 생필품을 얻는 유령 카지노도 열렸어요.'],
        ['개인 자금', '참가자의 실제 연봉(2023년 기준)을 바탕으로 정한 금액으로 시작해요. 게임 속 자금이에요.'],
        ['머니 챌린지', '우승자는 2,000만 원과 면제권 2장, 판도라의 금고 열쇠를 받아요. 최하위가 두 사람을 지목하면 투표로 한 명을 골라 데스매치에 보내요. 2,000만 원을 내고 투표권을 한 장 더 살 수 있었어요.'],
        ['데스매치', '탈락 후보끼리 겨뤄, 진 사람은 탈락해요. 1:1:1이나 2:2 팀전 형식이 나왔어요.'],
        ['결승', '파이널 인 스테이지 1·2차로 결승 진출자를 가리고, 4인 결승은 여러 라운드의 게임으로 우승자를 정해요.'],
      ] },
      { type: 'h3', text: '숨은 역할' },
      { type: 'p', text: '시즌 중간에는 정체를 숨긴 **스파이**와 **악귀** 같은 역할이 붙어, 머니 챌린지의 승패와 별개로 탈락 후보가 바뀌는 규칙이 있었어요. 지하 감옥처럼 일시적으로 플레이어를 격리하는 장치도 나왔어요. 이런 규칙은 게임마다 관련된 부분만 예외 규칙에 적었어요.' },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 게임', blocks: [
        { type: 'p', text: '첫날 저택의 "탈락자 선정"처럼 투표만으로 이뤄진 순서는 게임 규칙 페이지를 따로 두지 않았어요. 3일차의 "납치의 날"·"습격의 날", 금고·열쇠를 두고 몸으로 겨루는 약탈 이벤트, 유령 카지노의 작은 게임(해머 볼링, 페르미 추정, 감각 저울, 주사위 로드 등)도 빠졌어요.' },
        { type: 'p', text: '결승에서 동점을 가리는 마지막 라운드 "크라임 노트"는 규칙을 자세히 확인하지 못해 목록에서 뺐어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Bloody Game 3 games — every money challenge, death match and final game',
      description: "All twenty games of Wavve's The Bloody Game 3 (2024–2025) in broadcast order, from Switch Poker, Mystery Time, Equation Link, Criminal Memory, Try 13 and Good and Evil to the final's Art Auction, Black Village and Mix and Match: rules, what decides each one, and similar board games.",
      keywords: ['The Bloody Game 3', 'Bloody Game season 3 games', '피의 게임3', 'Korean survival show games'],
    },
    title: 'The Bloody Game 3 games',
    name: 'The Bloody Game 3',
    lead: 'A paradise, a mansion and the ruins: players start in different places and play a money challenge and a death match each day. Every game, in broadcast order.',
    intro: [
      "The Bloody Game 3 is the third season of Wavve's survival series The Bloody Game. It was released from 15 November 2024 to 24 January 2025: fourteen episodes plus a behind-the-scenes episode.",
      'This page lists its twenty games **in broadcast order**, each with its own page of rules, what decides it, and similar board games.',
    ],
    summary: 'Released November 2024 – January 2025: players split between a paradise, a mansion and the ruins play money challenges and death matches, then two Final In Stage games and a four-player final.',
    format: [
      { type: 'p', text: 'In The Bloody Game 3 **where you live is your rank**. Players live apart from the start and, depending on money challenges, move or become candidates for elimination.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Paradise and mansion', 'The two living spaces; on day 1 each held its own games.'],
        ['The ruins', 'A harsh space for those pushed out; a separate ghost casino traded coins for supplies.'],
        ['Personal funds', 'Starting money based on each player’s real 2023 salary; it is in-game money.'],
        ['Money challenge', 'The winner gets ₩20 million, two immunity passes and a Pandora’s box key. Last place names two players and a vote sends one to the death match; an extra vote could be bought for ₩20 million.'],
        ['Death match', 'Candidates play and the loser leaves; formats included three-way and two-against-two.'],
        ['Final', 'Two Final In Stage games pick the finalists, and the four-player final is decided over several rounds of games.'],
      ] },
      { type: 'h3', text: 'Hidden roles' },
      { type: 'p', text: 'Mid-season, hidden roles such as a **spy** and a **demon** could change who became a candidate regardless of the money challenge, and an underground prison temporarily isolated players. Each game page notes only the parts that touched that game.' },
    ],
    extra: [
      { id: 'not-listed', title: 'Games not listed', blocks: [
        { type: 'p', text: 'Pure votes such as the mansion’s day-1 "elimination pick" have no rules page. Nor do day 3’s "kidnapping" and "raid" days, the physical plunder events over vaults and keys, or the small ghost-casino games (hammer bowling, Fermi estimates, the sense scale, dice road and others).' },
        { type: 'p', text: 'The final tie-breaking round, "Crime Note", is left out because its rules could not be confirmed in detail.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
