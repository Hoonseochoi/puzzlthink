// 데블스 플랜: 데드 어게인 (The Devil's Plan season 3). Netflix, 2026-11-10 – 2026-11-24, 14 episodes, 16 players.
// Games are listed in broadcast order: each day's main match, then its prison match; the exile final; the three finals.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuExile, namuRules, netflixTeaser } from './shared';
import eitherOr from './either-or';
import countTheRectangles from './count-the-rectangles';
import heavy13 from './heavy-13';
import mysteryStockMarket from './mystery-stock-market';
import russianRoulette from './russian-roulette';
import gemBlackMarket from './gem-black-market';
import piggyBank from './piggy-bank';
import auctionBingo from './auction-bingo';
import wallgo2 from './wallgo-2';
import hiddenWord from './hidden-word';
import towerOfEquations from './tower-of-equations';
import hitStay from './hit-stay';
import gradation from './gradation';
import pointOmok from './point-omok';
import cardJanggi from './card-janggi';
import colorLink from './color-link';
import equationTrafficLight from './equation-traffic-light';

const show: Show = {
  slug: 'devils-plan-3',
  seo: 'dp3',
  series: 'devils-plan',
  aired: { start: '2026-11-10', end: '2026-11-24' },
  network: { ko: '넷플릭스', en: 'Netflix' },
  episodes: 14,
  color: '#e0283a',
  spoiler: true,
  updated: '2026-11-26',
  games: [eitherOr, countTheRectangles, heavy13, mysteryStockMarket, russianRoulette, gemBlackMarket, piggyBank, auctionBingo, wallgo2, hiddenWord, towerOfEquations, hitStay, gradation, pointOmok, cardJanggi, colorLink, equationTrafficLight],
  sources: [
    netflixTeaser,
    { label: { ko: '코리아넷 — 「데블스 플랜: 데드 어게인」 11월 10일 첫 공개, 14부작 3주 공개 보도', en: "Korea.net — The Devil's Plan: Dead Again premieres 10 November, 14 episodes over three weeks" }, url: 'https://www.korea.net/NewsFocus/Culture/view?articleId=302597' },
    namuRules,
    namuExile,
    broadcast,
  ],
  ko: {
    meta: {
      title: '데블스플랜3 게임 정리 — 데블스 플랜: 데드 어게인 메인매치·감옥매치·결승 전 게임 규칙',
      description: '데블스 플랜: 데드 어게인(데블스플랜3)에 나온 게임을 방송 순서대로 모두 정리했어요. 양자택일부터 HIT, STAY, 그라데이션, 결승전 카드 장기·컬러 링크·수식 신호등까지 규칙과 승부처, 비슷한 보드게임. 직접 플레이할 수 있는 게임도 연결했어요.',
      keywords: ['데블스플랜3', '데블스플랜3 게임', '데블스 플랜 3 게임 정리', '데블스 플랜 데드 어게인', '데블스 플랜 데드 어게인 게임', '데블스플랜3 메인매치', '데블스플랜3 감옥매치', '데블스플랜3 결승', '데블스플랜 시즌3 게임 규칙'],
    },
    title: '데블스플랜3 게임 정리 — 데블스 플랜: 데드 어게인',
    name: '데블스 플랜: 데드 어게인',
    lead: '16명, 7일, 매일 메인 매치와 감옥 매치. 시즌 3에 나온 게임을 방송 순서대로 모두 모았어요.',
    intro: [
      '「데블스 플랜: 데드 어게인」은 넷플릭스 두뇌 서바이벌 「데블스 플랜」의 세 번째 시즌이에요. 2026년 11월 10일부터 24일까지 매주 화요일 공개됐고 모두 14부작이에요. 참가자 16명이 6박 7일 동안 합숙하면서 매일 게임을 치러요.',
      '이 페이지는 시즌 3에 나온 게임을 **방송 순서대로** 정리한 목차예요. 게임마다 따로 페이지를 두고 규칙, 승부를 가르는 지점, 비슷한 보드게임을 담았어요. PUZZLTHINK에서 직접 만들어 둔 게임은 **지금 플레이** 버튼으로 바로 해 볼 수 있어요.',
    ],
    summary: '2026년 11월 공개된 시즌 3. 메인 매치 6개, 감옥 매치 6개, 유배지 최종전과 결승 3판까지 방송 순서대로 정리했어요.',
    format: [
      { type: 'p', text: '시즌 3은 하루에 두 번 게임을 치러요. 낮의 **메인 매치**에는 살아 있는 모든 참가자가 나오고, 밤의 **감옥 매치**에는 감옥동에 있는 사람들만 나와요.' },
      { type: 'table', head: ['구분', '누가', '결과'], rows: [
        ['메인 매치', '생존자 전원', '최하위 1명 이상 탈락. 나머지 중 상위권은 생활동, 하위권은 감옥동으로 가요.'],
        ['감옥 매치', '감옥동 참가자', '최하위 1명 이상 탈락. 감옥 매치는 감옥동 안의 별도 공간(데스룸)에서 열려요.'],
        ['결승', '마지막 2명', '세 게임 중 두 게임을 먼저 이기는 쪽이 우승해요.'],
      ] },
      { type: 'h3', text: '피스와 징표' },
      { type: 'list', items: [
        '**피스**: 시작할 때 한 개씩 받아요. 게임 안에서 유리한 아이템을 사거나 다른 참가자와 거래할 때 써요. 주고받는 건 거주동 안에서만 돼요. 지난 시즌들과 달리 **피스를 모두 잃어도 탈락하지 않고**, 피스 개수로 거주동이 정해지지도 않아요. 탈락은 오직 게임 결과로 정해져요.',
        '**연맹의 징표**: 대부분의 메인 매치에서 1위가 받아요. 그날 감옥동으로 갈 사람 한 명을 생활동으로 데려올 수 있어요.',
        '**상금의 징표**: 게임동과 생활동에서 주어지는 미션을 풀면 얻어요. 하나에 우승 상금 1억 원이 쌓이고, 최대 5개(5억 원)까지예요.',
        '배신과 거짓말은 허용되지만 폭력과 절도는 금지예요.',
      ] },
      { type: 'h3', text: '유배지 — 탈락자에게 주어지는 두 번째 기회' },
      { type: 'p', text: '시즌 3의 부제 "데드 어게인"은 탈락자를 위한 공간 **유배지**에서 왔어요. 탈락한 사람은 집으로 돌아갈지 유배지로 갈지 고를 수 있어요. 유배지에서는 낯선 문자로 적힌 규칙을 스스로 해독해야 하고, 게임으로 돌아오는 길은 두 가지예요. 하나는 1시간 안에 7×7 마방진(1–49)을 완성하는 "신의 시험"이고, 다른 하나는 유배지 인원이 넘칠 때마다 열리는 유배지 매치에서 끝까지 살아남아 여섯째 날 마지막 대결에서 이기는 거예요. 그 마지막 대결이 포인트 오목이에요.' },
    ],
    extra: [
      { id: 'mini', title: '메인 매치 안의 작은 게임들', blocks: [
        { type: 'p', text: '첫날 메인 매치 양자택일 안에는 미니게임 네 판(큐브 세기, 네모 세기, 잔디 깔기, 기억 포커)이 들어 있어요. 그중 네모 세기는 유배지 매치에서도 같은 규칙으로 다시 나와서 따로 페이지를 두었고, 나머지는 양자택일 페이지에 함께 정리했어요.' },
        { type: 'p', text: '유배지 매치에는 퍼즐과 기억력 문제(피스 퍼즐, 달라진 그림 찾기, 비밀 코드, 울타리 치기, 대칭 퍼즐, 만국기 등)도 나왔지만, 방송에서 규칙이 자세히 소개되지 않은 것이 많아 이 목록에는 넣지 않았어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: "The Devil's Plan 3 games — every main match, prison match and final of Dead Again",
      description: "Every game of The Devil's Plan: Dead Again (season 3) in broadcast order, from Either Or to Hit, Stay, Gradation and the final's Card Janggi, Color Link and Equation Traffic Light: rules, what decides each one, and similar board games. Playable versions are linked.",
      keywords: ["The Devil's Plan 3", "The Devil's Plan Dead Again", "The Devil's Plan 3 games", "Devil's Plan season 3 rules", "Devil's Plan main match", "Devil's Plan prison match", "Devil's Plan final"],
    },
    title: "The Devil's Plan 3 games — The Devil's Plan: Dead Again",
    name: "The Devil's Plan: Dead Again",
    lead: 'Sixteen players, seven days, a main match and a prison match every day. Every game of season 3, in broadcast order.',
    intro: [
      "The Devil's Plan: Dead Again is the third season of Netflix's Korean brain-survival show The Devil's Plan. Its 14 episodes were released on Tuesdays from 10 to 24 November 2026. Sixteen players live together for seven days and play games every day.",
      'This page lists the season’s games **in broadcast order**. Each game has its own page with the rules, what decides it, and similar board games. Games PUZZLTHINK has built can be played straight away with the **Play now** button.',
    ],
    summary: 'Season 3, released November 2026: six main matches, six prison matches, the exile final and the three games of the final, in broadcast order.',
    format: [
      { type: 'p', text: 'Season 3 plays two games a day. Every surviving player takes part in the daytime **main match**; only the players in prison play the evening **prison match**.' },
      { type: 'table', head: ['Match', 'Who', 'Result'], rows: [
        ['Main match', 'Everyone still in', 'At least the last-placed player is eliminated. Of the rest, the top go to the living quarters, the bottom to prison.'],
        ['Prison match', 'Players in prison', 'At least the last-placed player is eliminated. It is played in a separate room inside the prison (the Death Room).'],
        ['Final', 'The last two', 'Three games; the first to win two takes the season.'],
      ] },
      { type: 'h3', text: 'Pieces and tokens' },
      { type: 'list', items: [
        '**Pieces**: everyone starts with one. They buy in-game advantages and are traded between players, but change hands only inside the living areas. Unlike earlier seasons, **losing all your pieces does not eliminate you** and pieces no longer decide where you live; only games decide your fate.',
        '**Alliance token**: won by first place in most main matches. It brings one player bound for prison up to the living quarters.',
        '**Prize token**: earned by solving missions in the game hall and living quarters. Each adds ₩100 million to the winner’s prize, up to five (₩500 million).',
        'Betrayal and lies are allowed; violence and theft are not.',
      ] },
      { type: 'h3', text: 'The exile zone — a second chance' },
      { type: 'p', text: 'The subtitle "Dead Again" comes from the **exile zone**, a place for eliminated players. An eliminated player chooses between going home and going into exile, where the rules are written in an unknown script the players must decode. There are two ways back: the "God’s test", completing a 7×7 magic square (1–49) within an hour, or surviving the exile matches held whenever the zone is too full and winning the last duel on day six. That last duel is Point Omok.' },
    ],
    extra: [
      { id: 'mini', title: 'The small games inside a main match', blocks: [
        { type: 'p', text: 'Day 1’s main match Either Or contains four mini-games (Count the Cubes, Count the Rectangles, Lay the Grass, Memory Poker). Count the Rectangles came back with the same rules as an exile match, so it has its own page; the others are covered on the Either Or page.' },
        { type: 'p', text: 'The exile matches also included puzzles and memory tests (a piece puzzle, spot the difference, a secret code, fence building, a symmetry puzzle, world flags and more), but many of their rules were not shown in detail, so they are not listed here.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
