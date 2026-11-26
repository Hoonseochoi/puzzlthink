// 더 지니어스: 룰 브레이커 (The Genius season 2). tvN, 2013-12-07 – 2014-02-22, 12 episodes, one round (회전) per episode:
// a main match and a death match each, then a three-game final. Games are listed by their first appearance on air; a game
// played more than once this season has one page that names every round it was used in.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, enwiki, namuMain, tenasia, tenasiaFinal } from './shared';
import { foodChain, gyulHap, kingGame, quattro, seatExchange, sunMoonStar } from './rounds-1-3';
import { blackout, godsJudgment, indianHoldem, laserJanggi, monopolyGame, sevenCommandments } from './rounds-4-7';
import { bigDeal, blackAndWhite, elevator, layoff, minusAuction, samePictureHunt, truthDetector } from './rounds-8-12';

const show: Show = {
  slug: 'the-genius-2',
  seo: 'genius2',
  series: 'the-genius',
  short: { ko: '더지니어스2', en: 'The Genius 2' },
  aired: { start: '2013-12-07', end: '2014-02-22' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#c9a03a',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    foodChain, quattro, seatExchange, sunMoonStar, kingGame, gyulHap, blackout, sevenCommandments, laserJanggi,
    monopolyGame, godsJudgment, indianHoldem, minusAuction, samePictureHunt, layoff, blackAndWhite, bigDeal, elevator, truthDetector,
  ],
  sources: [namuMain, enwiki, tenasia, tenasiaFinal, broadcast],
  ko: {
    meta: {
      title: '더 지니어스 시즌2 룰 브레이커 게임 정리 — 메인 매치·데스매치·결승 전 게임 규칙',
      description: 'tvN 「더 지니어스: 룰 브레이커」(시즌2, 2013–2014)에 나온 게임 19개를 방송 순서대로 정리했어요. 먹이사슬, 자리 바꾸기, 7계명, 독점 게임, 신의 판결, 마이너스 경매, 빅딜부터 데스매치 콰트로·해 달 별·레이저 장기·인디언 홀덤·흑과 백, 결승 진실탐지기까지 규칙과 승부처, PUZZLTHINK에서 바로 플레이.',
      keywords: ['더 지니어스 시즌2', '더 지니어스 룰 브레이커', '더지니어스2', '룰 브레이커 게임', '더 지니어스 게임 정리', '더 지니어스 데스매치', '더 지니어스 메인매치'],
    },
    title: '더 지니어스 시즌2: 룰 브레이커 게임 정리',
    name: '더 지니어스: 룰 브레이커 (시즌 2)',
    lead: '13명이 12회전 동안 메인 매치와 데스매치를 치러 최후의 1인을 가려요. 숨은 "불멸의 징표"가 처음 등장한 시즌. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「더 지니어스: 룰 브레이커」는 tvN 두뇌 서바이벌 「더 지니어스」의 두 번째 시즌이에요. 2013년 12월 7일부터 2014년 2월 22일까지 매주 한 회씩, 모두 12부작으로 방송됐어요.',
      '이 페이지는 메인 매치 11개, 데스매치, 결승까지 **게임 19개를 처음 나온 순서대로** 정리한 목차예요. 이 시즌에 두 번 이상 쓰인 게임(해 달 별, 암전 게임, 인디언 홀덤, 흑과 백, 콰트로)은 한 페이지에 모든 회전을 함께 적었어요. 결! 합!, 레이저 장기, 흑과 백은 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2013년 12월 – 2014년 2월 방송. 회전마다 메인 매치와 1:1 데스매치, 숨겨진 불멸의 징표, 탈락자들의 아이템이 오가는 3전 2선승 결승으로 끝나요.',
    format: [
      { type: 'p', text: '이 시즌의 화폐는 **가넷**이에요. 가넷 1개는 우승 상금 100만 원의 가치가 있고, 최종 우승자가 가진 가넷만큼 상금을 받아요. 가넷은 자유롭게 주고받을 수 있어요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['메인 매치', '살아남은 모든 사람이 참가해요. 우승자는 **생명의 징표**를 받아 그 회전의 데스매치를 피해요. 단독 우승자는 여분의 생명의 징표 하나를 최하위 탈락 후보가 아닌 다른 사람에게 줄 수 있어요.'],
        ['데스매치', '메인 매치 최하위 탈락 후보가 생명의 징표가 없는 사람 중 한 명을 지목해 1:1로 겨뤄요. 진 사람이 탈락하고, 이긴 사람은 진 사람의 가넷을 모두 가져가요.'],
        ['불멸의 징표', '게임 장소 어딘가에 하나 숨겨져 있어요. 매 회전 메인 매치 우승자가 단서를 받고, 누군가 찾으면 단서는 더 주어지지 않아요. 가진 사람이 데스매치 진출자로 정해지면, 생명의 징표가 없는 다른 사람을 대신 내보낼 수 있어요.'],
        ['결승', '12회전은 결승 진출자 2명의 세 경기예요. 두 경기를 먼저 이긴 사람이 우승해요. 탈락자들이 고른 아이템이 결승 진출자에게 나뉘어 주어져요.'],
      ] },
      { type: 'p', text: '결승 세 경기는 인디언 홀덤, 진실탐지기, 콰트로였어요. 인디언 홀덤과 콰트로는 이 시즌 데스매치로 나온 게임이라 각 페이지에 결승 규칙을 함께 적었어요.' },
    ],
    extra: [
      { id: 'other-seasons', title: '다른 시즌에도 나온 게임', blocks: [
        { type: 'p', text: '결! 합!은 더 지니어스 네 시즌에 모두 나왔고, 같은 그림 찾기는 시즌1에서, 흑과 백은 그랜드 파이널(시즌4)에서도 쓰였어요. 이 페이지들은 룰 브레이커 때의 규칙을 기준으로 썼고, 다른 시즌의 규칙은 해당 시즌 페이지에서 따로 다뤄요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Genius: Rule Breaker (season 2) games — every main match, Death Match and final game',
      description: "All nineteen games of tvN's The Genius: Rule Breaker (season 2, 2013–2014) in broadcast order, from Food Chain, Seat Exchange, the Seven Commandments, the Monopoly Game, God's Judgment, the Minus Auction and Big Deal to the Death Matches Quattro, Sun Moon Star, Laser Janggi, Indian Hold'em and Black and White, and the final's Truth Detector — three playable on PUZZLTHINK.",
      keywords: ['The Genius Rule Breaker', 'The Genius season 2 games', '더 지니어스 시즌2', 'Korean survival show games', 'The Genius death match'],
    },
    title: 'The Genius: Rule Breaker (season 2) games',
    name: 'The Genius: Rule Breaker (season 2)',
    lead: 'Thirteen players, twelve rounds of a main match and a Death Match each, until one is left — the season that introduced the hidden Token of Immortality. Every game, in broadcast order.',
    intro: [
      "The Genius: Rule Breaker is the second season of tvN's brain-survival show The Genius, broadcast weekly from 7 December 2013 to 22 February 2014, twelve episodes in all.",
      'This page lists its **nineteen games in order of first appearance**: eleven main matches, the Death Matches and the final. Games used more than once this season (Sun Moon Star, the Blackout Game, Indian Hold’em, Black and White, Quattro) have one page naming every round. Gyul! Hap!, Laser Janggi and Black and White can be played on PUZZLTHINK.',
    ],
    summary: 'Broadcast December 2013 – February 2014: a main match and a one-on-one Death Match each round, a hidden Token of Immortality, and a best-of-three final shaped by eliminated players’ advantages.',
    format: [
      { type: 'p', text: 'The currency is **garnets**, each worth ₩1,000,000 of prize money; the winner is paid for every garnet they hold. Garnets may be traded freely.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Main match', 'Every survivor plays. Winners receive a **Token of Life** and are safe from that round’s Death Match; a sole winner gets a spare Token to give to anyone but the Death Match candidate.'],
        ['Death Match', 'The main match’s candidate names an opponent without a Token of Life for a one-on-one game; the loser is eliminated and the winner takes all of the loser’s garnets.'],
        ['Token of Immortality', 'One is hidden somewhere on the set; each main match winner gets a clue until it is found. Its holder, if chosen for the Death Match, may send someone without a Token of Life instead.'],
        ['Final', 'Round 12 is three games between the two finalists; the first to win two takes the title, with advantages chosen by eliminated players.'],
      ] },
      { type: 'p', text: "The final's games were Indian Hold'em, the Truth Detector and Quattro; the first and last had been Death Matches this season, so their pages include the final's rules." },
    ],
    extra: [
      { id: 'other-seasons', title: 'Games from other seasons too', blocks: [
        { type: 'p', text: 'Gyul! Hap! appeared in all four seasons of The Genius, Same Picture Hunt in season 1, and Black and White again in the Grand Final (season 4). These pages follow the Rule Breaker rules; other seasons are covered on their own pages.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
