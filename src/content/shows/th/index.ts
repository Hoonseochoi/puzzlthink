// 더 타임 호텔 (The Time Hotel). TVING, 2023-04-12 – 2023-05-17, 10 episodes; eight days in the hotel.
// Games in the order played: each day's Kairos game and checkout game, the day-4 revival, then the four-round final.
// A game that came back later (금·은·동 게임, 타임 이즈 골드, 무제한 보석 경매, 사칙 연산 로또) has one page, placed at its first appearance.
import type { Show } from '../types';
import { DISCLAIMER, broadcast, namuMain, osen } from './shared';
import { allWinRps, coinRigging, goldSilverBronze, rps22, silentOtrio, timeIsGold } from './games-a';
import { arithmeticLotto, blindEquation, drugLord, jewelAuction, karmaNine, onAndOff } from './games-b';

const show: Show = {
  slug: 'the-time-hotel',
  series: 'time-hotel',
  short: { ko: '더 타임 호텔', en: 'The Time Hotel' },
  aired: { start: '2023-04-12', end: '2023-05-17' },
  network: { ko: '티빙', en: 'TVING' },
  episodes: 10,
  color: '#7a5a2b',
  spoiler: false,
  updated: '2026-11-26',
  games: [rps22, coinRigging, goldSilverBronze, timeIsGold, silentOtrio, allWinRps, jewelAuction, drugLord, arithmeticLotto, onAndOff, karmaNine, blindEquation],
  sources: [
    namuMain,
    osen,
    { label: { ko: 'iMBC 연예 「더 타임 호텔」 관련 기사 (2023년 4월, 공개일 확인)', en: 'iMBC Entertainment, report on The Time Hotel (April 2023; release date)' }, url: 'https://enews.imbc.com/News/RetrieveNewsInfo/382525' },
    broadcast,
  ],
  ko: {
    meta: {
      title: '더 타임 호텔 게임 정리 — 카이로스 게임·체크아웃 게임·파이널 전 게임 규칙',
      description: '티빙 「더 타임 호텔」(2023)에 나온 게임 12개를 방송 순서대로 정리했어요. 2:2 가위바위보, 코인 시세 조작, 타임 이즈 골드, 침묵의 오트리오, 무제한 보석 경매, 마약왕 게임부터 파이널 카르마 나인·블라인드 수식까지 규칙과 승부처, 비슷한 보드게임.',
      keywords: ['더 타임 호텔', '더타임호텔', '더 타임 호텔 게임', '더타임호텔 게임 정리', '더 타임 호텔 카이로스 게임', '더 타임 호텔 체크아웃 게임', '더 타임 호텔 파이널'],
    },
    title: '더 타임 호텔 게임 정리',
    name: '더 타임 호텔',
    lead: '돈 대신 시간으로 모든 것을 사는 호텔. 타임워치의 시간이 0이 되면 그 자리에서 체크아웃돼요. 매일 열린 게임들을 방송 순서대로 모았어요.',
    intro: [
      '「더 타임 호텔」은 티빙 오리지널 두뇌 서바이벌이에요. 2023년 4월 12일부터 5월 17일까지 10회가 공개됐어요. 1–4화가 첫날 한꺼번에, 5–6화가 그다음 주에 함께 나오고, 이후로는 한 주에 한 편씩 공개됐어요.',
      '이 페이지는 방송에 나온 게임 12개를 **처음 나온 순서대로** 정리한 목차예요. 같은 게임이 다시 나온 경우(금·은·동 게임, 타임 이즈 골드, 무제한 보석 경매, 사칙 연산 로또)는 한 페이지에 함께 담았어요.',
    ],
    summary: '2023년 4–5월 공개. 시간이 돈이자 목숨인 호텔에서 매일 카이로스 게임과 체크아웃 게임을 치르고, 3인 파이널로 끝나요.',
    format: [
      { type: 'p', text: '더 타임 호텔에서는 **시간이 화폐이자 생명**이에요. 투숙객은 손목의 타임워치로 식사부터 아이템까지 모든 값을 시간으로 치르고, 서로 시간을 주고받을 수도 있어요. 남은 시간은 본인만 볼 수 있어요.' },
      { type: 'table', head: ['구분', '내용'], rows: [
        ['웰컴 시간', '처음에 24시간을 받아요. 카이로스 게임에서 살아남으면 다음 날까지 24시간이 더 주어져요.'],
        ['카이로스 게임', '매일 오후 2시에 열리는 메인 게임이에요. 순위에 따라 시간을 받거나 잃고, 우승자는 체크아웃 패스권을 받아 자신이나 다른 사람에게 써요.'],
        ['체크아웃 게임', '2일차부터 카이로스 게임 최하위자가 지목한 사람과 1:1로 겨뤄요. 이긴 사람이 진 사람의 시간을 모두 가져가고, 진 사람은 체크아웃돼요. 몇몇 날에는 체크아웃 게임 없이 최하위가 바로 체크아웃됐어요.'],
        ['타임워치 0', '시간이 다 떨어지면 그 즉시 체크아웃돼요.'],
        ['파이널', '상위 3명이 진출해 네 개의 게임으로 겨뤄요. 두 게임을 먼저 이긴 사람이 우승하고, 남은 시간을 시간당 500만 원으로 바꿔 상금을 받아요(최대 3억 원).'],
      ] },
      { type: 'h3', text: '호텔의 장치' },
      { type: 'list', items: [
        '**VIP·스위트룸**: 날마다 VIP로 뽑힌 사람은 스위트룸에서 지내며 다음 날 카이로스 게임의 규칙 일부를 미리 들어요. 룸서비스에 두 사람까지 초대할 수 있어요(첫 사람은 무료, 두 번째는 1시간).',
        '**타임뱅크**: 2일차부터 정해진 시간에 열려, 맡긴 시간에 24시간마다 복리 이자(처음 20%, 4일차부터 30%)가 붙어요. 은행에 시간이 있어도 타임워치가 0이 되면 체크아웃되고, 은행의 시간은 사라져요. 8일차부터는 문을 닫아요.',
        '**TATA**: 다음 탈락자를 예측해 시간을 거는 베팅이에요(30분–2시간, 맞히면 2배).',
        '**물가 상승**: 4일차부터 날이 갈수록 호텔의 값이 올라요.',
        '**패자부활전**: 4일차가 끝난 뒤 그때까지 체크아웃된 사람들이 겨뤄 한 명이 다시 체크인했어요.',
      ] },
      { type: 'p', text: '게임 자문을 보드게임 회사가 맡아, 만칼라·QE·아발론·오트리오·SET처럼 기존 보드게임에서 모티브를 따온 게임이 많아요. 게임 페이지마다 그 원작을 "비슷한 보드게임"에서 소개했어요.' },
    ],
    extra: [
      { id: 'not-listed', title: '목록에 넣지 않은 것', blocks: [
        { type: 'p', text: '타임뱅크, TATA 베팅, 스위트룸 초대처럼 매일 이어진 호텔의 장치는 게임 페이지를 따로 두지 않고 위의 형식에 적었어요.' },
      ] },
    ],
    disclaimer: DISCLAIMER.ko,
  },
  en: {
    meta: {
      title: 'The Time Hotel games — every Kairos game, checkout game and final game',
      description: "All twelve games of TVING's The Time Hotel (2023) in the order played, from 2:2 Rock Paper Scissors, Coin Rigging, Time Is Gold, Silent Otrio, the Unlimited Jewel Auction and Drug Lord to the final's Karma Nine and Blind Equation: rules, what decides each one, and similar board games.",
      keywords: ['The Time Hotel', 'Time Hotel games', '더 타임 호텔', 'Korean survival show games'],
    },
    title: 'The Time Hotel games',
    name: 'The Time Hotel',
    lead: 'A hotel where time replaces money and you check out the moment your watch hits zero. Every game, in the order it was played.',
    intro: [
      'The Time Hotel is a TVING original brain-survival show, released in ten episodes from 12 April to 17 May 2023: episodes 1–4 together on day one, 5–6 the next week, then one a week.',
      'This page lists its twelve games **in order of first appearance**. Games that returned (Gold, Silver, Bronze; Time Is Gold; the Unlimited Jewel Auction; Arithmetic Lotto) share one page.',
    ],
    summary: 'Released April–May 2023: in a hotel where time is money and life, guests play a Kairos game and a checkout game each day, ending in a three-player final.',
    format: [
      { type: 'p', text: 'In The Time Hotel **time is both currency and life**. Guests pay for everything, meals to items, from the time watch on their wrist and can transfer time to each other; only you can see your own balance.' },
      { type: 'table', head: ['Part', 'What it is'], rows: [
        ['Welcome time', '24 hours at check-in; surviving a Kairos game adds another 24 for the next day.'],
        ['Kairos game', 'The main game, every day at 2 p.m. Placings win or cost time, and the winner gets a checkout pass for themselves or someone else.'],
        ['Checkout game', 'From day 2, the Kairos game’s last place plays one-on-one against a player they name; the winner takes all the loser’s time and the loser checks out. Some days skipped it and last place checked out directly.'],
        ['Watch at zero', 'Run out of time and you check out on the spot.'],
        ['Final', 'The top three play up to four games; the first to win two is champion, paid ₩5 million per hour left (up to ₩300 million).'],
      ] },
      { type: 'h3', text: 'Hotel features' },
      { type: 'list', items: [
        '**VIP suite**: each day’s VIP sleeps in the suite and hears part of the next Kairos game’s rules, and may invite up to two guests to room service (the first free, the second for 1 hour).',
        '**Time bank**: open at set hours from day 2, paying compound interest every 24 hours (20%, then 30% from day 4). A watch at zero still checks you out and banked time is lost; it closes from day 8.',
        '**TATA**: a bet on who leaves next (30 minutes to 2 hours, paying double).',
        '**Inflation**: from day 4 prices rise day by day.',
        '**Revival**: after day 4, those checked out so far competed for one return ticket.',
      ] },
      { type: 'p', text: 'A board-game company advised on the games, so many draw on existing ones such as mancala, QE, Avalon, Otrio and SET; each game page names its model under similar board games.' },
    ],
    extra: [
      { id: 'not-listed', title: 'Not listed', blocks: [
        { type: 'p', text: 'Running features such as the time bank, TATA bets and suite invitations have no game page; they are described in the format above.' },
      ] },
    ],
    disclaimer: DISCLAIMER.en,
  },
};

export default show;
