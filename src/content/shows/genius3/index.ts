// 더 지니어스: 블랙가넷 (The Genius season 3). tvN, 2014-10-01 – 2014-12-17, 12 episodes, Wednesdays 23:00, 13 players.
// Games in broadcast order: each round's main match, then its death match; the final's three games. A game played in
// several rounds (흑과 백 II, 베팅 가위바위보, 양면포커, 십이장기, 기억의 미로) has one page, listed where it first appeared.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, enWiki, namuAll, namuMain, tenasiaFinal, tenasiaStart } from './shared';
import { bettingRps, blackAndWhite2, fruitStand, juryGame, middleRace } from './rounds-1-3';
import { doubleSidedPoker, minerGame, stormyStockMarket, swordsAndShields } from './rounds-4-6';
import { constellationGame, investmentAndDonation, memoryMaze, middleRace2, twelveJanggi } from './rounds-7-9';
import { bettingBlackAndWhite, chainAuction, doubtingYutnori, monorail, sameNumberHunt } from './rounds-10-12';

const show: Show = {
  slug: 'the-genius-3',
  seo: 'genius3',
  series: 'the-genius',
  short: { ko: '더 지니어스3', en: 'The Genius 3' },
  aired: { start: '2014-10-01', end: '2014-12-17' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#7a1f2b',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    fruitStand, blackAndWhite2, juryGame, bettingRps, middleRace, swordsAndShields, doubleSidedPoker, minerGame, stormyStockMarket,
    constellationGame, twelveJanggi, investmentAndDonation, memoryMaze, middleRace2, chainAuction, monorail, doubtingYutnori,
    bettingBlackAndWhite, sameNumberHunt,
  ],
  sources: [tenasiaStart, tenasiaFinal, namuMain, namuAll, enWiki, broadcast],
  ko: {
    meta: {
      title: '더 지니어스3 블랙가넷 게임 정리 — 메인매치·데스매치·결승 전 게임 규칙',
      description: 'tvN 「더 지니어스: 블랙가넷」(더 지니어스 시즌3, 2014)에 나온 게임 19개를 방송 순서대로 정리했어요. 과일가게, 배심원, 중간 달리기, 폭풍의 증권시장, 체인 옥션, 의심 윷놀이부터 흑과 백 II·양면포커·십이장기·모노레일, 결승 같은 숫자 찾기까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['더 지니어스3', '더 지니어스 시즌3', '더 지니어스 블랙가넷', '블랙가넷 게임', '더 지니어스3 게임 정리', '더 지니어스 메인매치', '더 지니어스 데스매치', '블랙가넷 결승'],
    },
    title: '더 지니어스3 게임 정리 — 더 지니어스: 블랙가넷',
    name: '더 지니어스: 블랙가넷',
    lead: '13명, 12회전, 매 회전 메인매치와 데스매치. 시즌 3에 나온 게임을 방송 순서대로 모두 모았어요.',
    intro: [
      '「더 지니어스: 블랙가넷」은 tvN 두뇌 서바이벌 「더 지니어스」의 세 번째 시즌이에요. 2014년 10월 1일부터 12월 17일까지 매주 수요일 밤 11시에 방송됐고, 모두 12부작이에요. 플레이어 13명이 한 회전에 한 명씩 탈락하며 최후의 1인을 가려요.',
      '이 페이지는 메인매치 11개, 데스매치, 결승 게임을 **방송 순서대로** 정리한 목차예요. 여러 회전에 나온 게임은 처음 나온 자리에 한 번만 두었어요. 흑과 백 II, 양면포커, 십이장기, 모노레일은 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2014년 10–12월 tvN 방송. 블랙가넷과 블랙미션이 처음 도입된 시즌으로, 메인매치 11개와 데스매치, 결승 3판을 방송 순서대로 정리했어요.',
    format: [
      { type: 'p', text: '한 회전은 **메인매치**와 **데스매치**로 이뤄지고, 회전마다 한 명이 탈락해요. 게임의 화폐는 **가넷**으로, 하나가 우승 상금 100만 원의 가치예요. 모두 가넷 1개로 시작하고, 최종 우승자는 가진 가넷만큼 상금을 받아요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['메인매치', '생존자 전원이 참가해요. 우승자는 **생명의 징표**를 받아 그 회전 데스매치를 피하고, 단독 우승이면 징표 하나를 더 받아 다른 사람(최하위 제외)에게 줄 수 있어요. 최하위가 탈락후보가 돼요.'],
        ['데스매치', '탈락후보가 생명의 징표가 없는 사람 중 한 명을 지목해 1:1로 겨뤄요. 진 사람이 탈락해요.'],
        ['결승', '마지막 2명이 세 게임으로 겨뤄, 두 게임을 먼저 이기는 쪽이 우승해요. 탈락자 11명은 응원하는 결승 진출자에게 아이템을 하나씩 줘요.'],
      ] },
      { type: 'h3', text: '시즌 3에서 바뀐 규칙' },
      { type: 'list', items: [
        '**봉인된 데스매치**: 그 회전의 데스매치 종목은 오프닝에 봉투에 봉인되고, 데스매치 진출자가 정해진 뒤에야 공개돼요.',
        '**가넷 소멸**: 데스매치 진출자 두 사람의 가넷은 주최 측이 맡아 두고, 진 사람의 가넷은 사라져요. 이긴 사람은 돌려받아요. 가넷은 데스매치 진출자가 확정되기 전까지만 주고받을 수 있어요.',
        '**블랙가넷**: 데스매치에서 이기면 블랙가넷 1개를 받아요. 메인매치 보상으로도 얻을 수 있고, 주고받는 데 제한이 없어요. 10회전 시작 때 블랙가넷 1개가 가넷 2개로 바뀌었어요.',
        '**블랙미션**: 데스매치 진출자는 블랙가넷 3개를 내고 블랙미션에 도전할 수 있어요. 성공하면 자기 대신 데스매치에 나갈 사람을 지목해요. 관찰·기억·수리 세 종류가 하나씩, 도전하면 성공 여부와 상관없이 사라져요.',
        '**폭력과 절도 금지**: 어기면 즉시 메인매치 최하위 탈락후보가 돼요.',
      ] },
    ],
    extra: [
      { id: 'black-missions', title: '블랙미션', blocks: [
        { type: 'p', text: '블랙미션은 데스매치를 피할 수 있는 1인 도전이라 게임 목록에는 넣지 않고 여기에 정리했어요.' },
        { type: 'list', items: [
          '**관찰 — 결! 합!** (4회전): 도형·도형 색·배경색이 다른 그림 9장에서, 세 속성이 각각 모두 같거나 모두 다른 세 장(합)을 100초 안에 모두 찾고 "결"을 외쳐야 해요. 한 번이라도 틀리면 실패예요. 결합은 PUZZLTHINK에서 바로 해 볼 수 있어요.',
          '**기억 — 12개의 정류장 기억하기** (7회전): 번호가 붙은 정류장 카드 12장을 짧게 본 뒤, 카드를 섞어 번호만 보여 주면 정류장 이름을 맞혀야 해요. 기억할 시간은 나무위키가 30초, 영어 위키백과가 1분으로 달리 적고 있어요.',
          '**수리**: 방송에서 도전자가 없어 공개되지 않았어요.',
        ] },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Genius 3: Black Garnet games — every main match, death match and final game',
      description: 'All nineteen games of tvN’s The Genius: Black Garnet (season 3, 2014) in broadcast order, from Fruit Stand, the Jury Game, Middle Race, the Stormy Stock Market, the Chain Auction and Doubting Yutnori to Black and White II, Double-sided Poker, Twelve Janggi, Monorail and the final’s Same Number Hunt: rules, what decides each, and similar board games.',
      keywords: ['The Genius season 3', 'The Genius Black Garnet', 'The Genius 3 games', 'The Genius main match', 'The Genius death match', '더 지니어스3'],
    },
    title: 'The Genius 3 games — The Genius: Black Garnet',
    name: 'The Genius: Black Garnet',
    lead: 'Thirteen players, twelve rounds, a main match and a death match each round. Every game of season 3, in broadcast order.',
    intro: [
      'The Genius: Black Garnet is the third season of tvN’s Korean brain-survival show The Genius. Its twelve episodes aired on Wednesdays at 11 p.m. from 1 October to 17 December 2014. Thirteen players are eliminated one per round until one remains.',
      'This page lists the eleven main matches, the death matches and the final’s games **in broadcast order**; a game played in several rounds appears once, where it was first played. Black and White II, Double-sided Poker, Twelve Janggi and Monorail can be played on PUZZLTHINK.',
    ],
    summary: 'Aired on tvN, October–December 2014. The season that introduced black garnets and black missions: eleven main matches, the death matches and a three-game final.',
    format: [
      { type: 'p', text: 'Each round is a **main match** and a **death match**, and one player leaves per round. The currency is the **garnet**, worth ₩1 million of prize money each; everyone starts with one, and the champion wins their garnets in cash.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Main match', 'Everyone still in plays. The winner gets a **token of life**, which keeps them out of that round’s death match; a sole winner gets a second token to give to anyone but the last-placed player, who becomes the elimination candidate.'],
        ['Death match', 'The candidate names an opponent without a token for a one-on-one game; the loser is eliminated.'],
        ['Final', 'The last two play three games; the first to win two takes the season. Each of the eleven eliminated players gives an item to the finalist they support.'],
      ] },
      { type: 'h3', text: 'What changed in season 3' },
      { type: 'list', items: [
        '**Sealed death matches**: each round’s death-match game is sealed in an envelope at the start and revealed only once the two players are set.',
        '**Garnets destroyed**: both death-match players’ garnets are held by the hosts; the loser’s are destroyed and the winner’s returned. Garnets can change hands only until the two players are fixed.',
        '**Black garnets**: winning a death match earns one; some main matches award them too, and they can be traded freely. At the start of round 10 each black garnet was exchanged for two garnets.',
        '**Black missions**: a death-match player may hand in three black garnets to attempt a black mission; success lets them name someone to play the death match instead. There was one each of observation, memory and mathematics, used up whether passed or failed.',
        '**No violence or theft**: breaking the rule makes you the main match’s elimination candidate at once.',
      ] },
    ],
    extra: [
      { id: 'black-missions', title: 'Black missions', blocks: [
        { type: 'p', text: 'Black missions were solo attempts to escape a death match, so they are covered here rather than in the game list.' },
        { type: 'list', items: [
          '**Observation — Gyul! Hap!** (round 4): from nine pictures differing in shape, shape colour and background, find within 100 seconds every set of three (a hap) in which each attribute is all the same or all different, then call “gyul”. A single mistake fails. Gyul Hap can be played on PUZZLTHINK.',
          '**Memory — twelve bus stops** (round 7): after a short look at twelve numbered stop cards, the cards are shuffled and only the numbers shown; the challenger must name each stop. The fan wiki gives 30 seconds to memorise, English Wikipedia one minute.',
          '**Mathematics**: nobody attempted it, so it was never shown.',
        ] },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
