// 더 지니어스: 그랜드 파이널 (The Genius season 4). tvN, 2015-06-27 – 2015-09-12, 12 episodes, Saturdays.
// Games in broadcast order: each round's main match then its death match, then the two final games that were played.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, wiki4 } from './shared';
import { fishShop, garnetThief, horrorRace, idExchange, loyalistsRebels, todaysMenu } from './main-a';
import { coopHoldem, horrorRace2, howMuch, minusAuction2, seedPoker } from './main-b';
import { bettingRps, blackWhite, indianPoker, monorail, sameNumberHunt, tacticalYut } from './death-a';
import { gyulHap, quattro, samePictureHunt, twelveJanggi, twoSidedPoker } from './death-b';
import { mysterySign, numberJanggi } from './final';

const show: Show = {
  slug: 'the-genius-4',
  seo: 'genius34',
  series: 'the-genius',
  short: { ko: '더지니어스4', en: 'The Genius 4' },
  aired: { start: '2015-06-27', end: '2015-09-12' },
  network: { ko: 'tvN', en: 'tvN' },
  episodes: 12,
  color: '#7a1f2b',
  spoiler: false,
  updated: '2026-11-26',
  games: [
    idExchange, blackWhite, horrorRace, tacticalYut, todaysMenu, bettingRps, fishShop, sameNumberHunt,
    loyalistsRebels, indianPoker, garnetThief, monorail, seedPoker, samePictureHunt, minusAuction2, gyulHap,
    horrorRace2, quattro, coopHoldem, twoSidedPoker, howMuch, twelveJanggi, numberJanggi, mysterySign,
  ],
  sources: [
    namuMain,
    wiki4,
    { label: { ko: '텐아시아 「더 지니어스: 그랜드 파이널」 1화 방송 정보 (2015년 6월, 첫 방송일 확인)', en: 'Tenasia, The Genius: Grand Final episode 1 listing (June 2015; premiere date)' }, url: 'https://www.tenasia.co.kr/article/2015062620534' },
    { label: { ko: '텐아시아 「더 지니어스: 그랜드 파이널」 최종화 방송 정보 (2015년 9월 12일, 마지막 방송일 확인)', en: 'Tenasia, The Genius: Grand Final final-episode listing (12 September 2015; last air date)' }, url: 'https://www.tenasia.co.kr/article/2015091368884' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '더 지니어스 시즌4 그랜드 파이널 게임 정리 — 메인매치·데스매치·결승 전 게임 규칙',
      description: 'tvN 「더 지니어스: 그랜드 파이널」(시즌4, 2015)에 나온 게임 24개를 방송 순서대로 정리했어요. 신분 교환, 호러 레이스, 오늘의 메뉴, 생선 가게, 충신과 역적, 가넷도둑, 시드 포커, 마이너스 경매 II, 협동홀덤, 하우머치부터 데스매치 11종과 결승 숫자장기·미스터리 사인까지 규칙과 승부처, PUZZLTHINK에서 바로 플레이.',
      keywords: ['더 지니어스', '더지니어스4', '더 지니어스 시즌4', '더 지니어스 그랜드 파이널', '그랜드 파이널 게임', '더 지니어스 메인매치', '더 지니어스 데스매치', '더 지니어스 게임 정리'],
    },
    title: '더 지니어스: 그랜드 파이널 (시즌4) 게임 정리',
    name: '더 지니어스: 그랜드 파이널',
    lead: '이전 세 시즌에서 활약한 13명이 다시 모인 왕중왕전이에요. 회전마다 메인매치로 데스매치 진출자를 가리고, 데스매치에서 한 명씩 떠나요. 그 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「더 지니어스: 그랜드 파이널」은 tvN 두뇌 서바이벌 「더 지니어스」의 네 번째이자 마지막 시즌이에요. 2015년 6월 27일부터 9월 12일까지 매주 토요일에 방송됐고, 모두 12부작이에요. 게임의 법칙, 룰 브레이커, 블랙가넷의 상위권 플레이어와 제작진이 고른 플레이어, 모두 13명이 참가했어요.',
      '이 페이지는 메인매치 11개, 데스매치 11개, 결승 게임 2개를 **방송 순서대로** 정리한 목차예요. 데스매치는 모두 이전 시즌에 나온 게임이고, 그중 흑과 백, 인디언 포커, 모노레일, 결! 합!, 양면포커, 십이장기는 PUZZLTHINK에서 바로 플레이할 수 있어요.',
    ],
    summary: '2015년 6–9월 방송. 역대 시즌 출연자 13명의 왕중왕전으로, 가넷매치가 새로 생기고 데스매치 11종이 미리 공개됐어요.',
    format: [
      { type: 'p', text: '모두 12회전이고, 한 회전은 **메인매치**와 **데스매치**로 이루어져요. 화폐는 **가넷**으로, 가넷 1개는 우승 상금 100만 원의 가치가 있어요. 최종 우승자가 가진 가넷만큼 상금을 받아요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['메인매치', '생존자 전원이 참가해요. 우승자는 생명의 징표를 받아 다음 회전에 자동으로 진출하고, 단독 우승이면 징표 하나를 더 받아 최하위 탈락후보를 뺀 다른 사람에게 줄 수 있어요.'],
        ['가넷매치', '이 시즌에 새로 생긴 메인매치 형식이에요. 공지부터 결과 발표까지 가넷을 주고받을 수 없고, 끝났을 때 가넷이 가장 많은 사람이 우승, 가장 적은 사람이 탈락후보예요. 2·6·10회전이 가넷매치였어요.'],
        ['데스매치', '메인매치 최하위 탈락후보가 생명의 징표가 없는 사람 하나를 지목해 1:1로 겨뤄요. 진 사람이 그 회전의 탈락자예요.'],
        ['데스매치 종목', '1–11회전에 쓸 데스매치 11종을 미리 공개했어요. 회전마다 두 사람이 정해진 수만큼 종목을 지운 뒤, 남은 종목 중에서 추첨해요. 한 번 쓴 종목은 다시 나오지 않고, 일부 종목은 규칙이 조금씩 바뀌었어요(바뀐 점은 종목이 정해지기 전까지 알려 주지 않았어요).'],
        ['결승', '12회전은 세 게임 3전 2선승이에요. 탈락한 플레이어들이 결승 진출자에게 아이템을 하나씩 건네요.'],
      ] },
      { type: 'p', text: '영문 위키백과 정리에 따르면 지울 수 있는 데스매치 수는 1·2회전 3개, 3–5회전 2개, 6–8회전 1개였고, 9회전부터는 지울 수 없었어요. 탈락자의 가넷은 결승 상금에 더해졌는데, 이 규칙은 결승 전까지 공개되지 않았어요.' },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 것', blocks: [
        { type: 'p', text: '결승 세 번째 게임으로 예고된 "베팅 흑과 백"(블랙가넷 11회전 데스매치)은 이 시즌 방송에서 경기가 진행되지 않아 페이지를 두지 않았어요. 5화 비하인드 영상으로 공개된 특별 메인매치 "바보게임"도 정식 회전의 게임이 아니어서 뺐어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Genius: Grand Final (season 4) games — every main match, death match and final game',
      description: 'All 24 games of tvN’s The Genius: Grand Final (season 4, 2015) in broadcast order, from ID Exchange, Horror Race, Today’s Menu, Fish Shop, Loyalists and Rebels, Garnet Thief, Seed Poker, Minus Auction II, Cooperative Hold’em and How Much to all eleven death matches and the final’s Number Janggi and Mystery Sign, six of them playable on PUZZLTHINK.',
      keywords: ['The Genius', 'The Genius Grand Final', 'The Genius season 4', 'Korean survival show games', '더 지니어스 그랜드 파이널'],
    },
    title: 'The Genius: Grand Final (season 4) games',
    name: 'The Genius: Grand Final',
    lead: 'An all-star season bringing back thirteen standouts from the first three. Each round a main match picks who faces the death match, and one player leaves. Every game, in broadcast order.',
    intro: [
      'The Genius: Grand Final is the fourth and last season of tvN’s brain-survival show The Genius. It aired on Saturdays from 27 June to 12 September 2015, twelve episodes in all, with thirteen players drawn from the top finishers of Rules of the Game, Rule Breaker and Black Garnet plus the producers’ picks.',
      'This page lists its eleven main matches, eleven death matches and two final games **in broadcast order**. Every death match came from an earlier season; Black and White, Indian Poker, Monorail, Gyul! Hap!, Double-Sided Poker and Twelve Janggi can be played on PUZZLTHINK.',
    ],
    summary: 'Aired June–September 2015: an all-star season of thirteen returning players, with new garnet matches and eleven death matches announced in advance.',
    format: [
      { type: 'p', text: 'Twelve rounds, each a **main match** and a **death match**. The currency is the **garnet**, worth ₩1 million of prize money each; the winner takes home their garnets.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Main match', 'All survivors play. The winner gets a token of life and is safe; a sole winner gets a second token to give anyone but the elimination candidate.'],
        ['Garnet match', 'New this season: no garnet transfers from the announcement to the result, and at the end the most garnets wins and the fewest becomes the candidate. Rounds 2, 6 and 10 were garnet matches.'],
        ['Death match', 'The main match’s candidate picks an opponent without a token for a one-on-one game; the loser is eliminated.'],
        ['Death match pool', 'The eleven death matches for rounds 1–11 were announced in advance. Each round the two players strike out a set number, then one is drawn from the rest; a game once used does not return, and some had small rule changes revealed only when chosen.'],
        ['Final', 'Round 12 is three games, best of three; eliminated players each give a finalist an item.'],
      ] },
      { type: 'p', text: 'According to English Wikipedia, players could strike three death matches in rounds 1–2, two in rounds 3–5 and one in rounds 6–8, and none from round 9. Eliminated players’ garnets were added to the final prize, a rule kept secret until the final.' },
    ],
    extra: [
      { id: 'not-listed', title: 'Not listed', blocks: [
        { type: 'p', text: '"Betting Black and White" (Black Garnet’s round 11 death match), announced as the final’s third game, was not played this season and has no page. The special main match "Fool’s Game", released as a behind-the-scenes clip for episode 5, was not part of a regular round and is left out.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
