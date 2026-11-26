import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'time-auction',
  kind: 'prison',
  when: { ko: '2일차', en: 'Day 2' },
  related: ['blackWhite2', 'pointOmok', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay(2), broadcast],
  ko: {
    meta: {
      title: '시간 경매 규칙 — 데블스플랜2(데스룸) 2일차 감옥매치, 10분으로 하는 경매',
      description: '데블스 플랜: 데스룸(데블스플랜2) 2일차 감옥매치 시간 경매의 규칙을 정리했어요. 10분의 시간 자금, 버튼을 누르고 버티는 19번의 경매, 포기와 유찰, 남은 시간을 기억해야 하는 이유, 피스와 탈락 기준까지.',
      keywords: ['시간 경매', '데블스플랜2 시간 경매', '데블스 플랜 데스룸 시간 경매', '데블스플랜2 감옥매치', '시간 경매 규칙'],
    },
    title: '시간 경매 — 데블스플랜2 2일차 감옥매치',
    name: '시간 경매',
    lead: '돈 대신 시간으로 입찰해요. 버튼을 가장 오래 누르고 버틴 사람이 표식을 가져가지만, 쓴 시간은 돌아오지 않아요.',
    summary: '10분의 시간을 자금 삼아, 버튼을 가장 오래 누른 사람이 낙찰받는 19번의 경매. 가장 적게 낙찰받은 사람이 탈락해요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 둘째 날 감옥동 인원 전원.',
        '**자금**: 각자 10분. 0.1초 단위까지 기록해요.',
        '**버튼**: 각자 앞에 남에게 보이지 않게 가려진 버튼 하나.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '준비', body: '경매마다 모두 버튼을 누른 채로 기다려요.' },
        { title: '카운트다운', body: '5초 카운트다운이 끝나면 버튼을 누르고 있는 사람의 시간이 줄기 시작해요. 이번 경매에 참여하지 않으려면 카운트다운 안에 손을 떼면 돼요(시간이 들지 않아요).' },
        { title: '입찰', body: '참여한 사람은 원하는 만큼 시간이 흐르면 손을 떼요. 전광판에는 이번 경매에서 흐른 시간만 보이고, 각자의 남은 시간은 본인에게도 보이지 않아요.' },
        { title: '낙찰', body: '마지막까지 누르고 있던 사람이 손을 떼면 시간이 멈추고, 그 사람이 승리 표식을 받아요. 누가 참여했는지는 공개되지 않고 낙찰자만 발표돼요.' },
      ] },
      { type: 'p', text: '이렇게 19번 경매를 해요.' },
    ],
    win: [
      { type: 'list', items: [
        '승리 표식을 **가장 많이** 받은 사람은 피스 1개를 받아요. 같으면 남은 시간이 많은 사람, 그것도 같으면 아무도 받지 않아요.',
        '승리 표식을 **가장 적게** 받은 사람이 탈락해요. 같으면 남은 시간이 적은 사람이 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '남은 시간을 다 쓰면 버튼이 저절로 밀려나요. 가진 시간보다 많이 입찰할 수는 없어요.',
        '두 명 이상이 0.1초까지 똑같은 시간에 손을 떼면 그 경매는 유찰되어 표식이 사라져요.',
        '참여했다가 진 사람도 그동안 흐른 시간만큼은 잃어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '시간 경매는 **모두가 내는 올페이 경매**예요. 낙찰받지 못해도 버틴 시간만큼은 사라지므로, 경쟁이 붙은 경매에 끝까지 남는 것은 위험해요.' },
      { type: 'cards', items: [
        { title: '이길 필요는 몇 번뿐이에요', body: '탈락을 피하려면 가장 적게 받은 사람만 아니면 돼요. 19번 중 몇 번만 따면 되는지는 인원에 따라 정해지므로, 매번 이기려 하기보다 남들이 포기하는 경매를 싸게 줍는 쪽이 효율적이에요.' },
        { title: '기억이 곧 잔고', body: '내 남은 시간을 보여 주지 않으므로, 매 경매에서 쓴 시간을 머릿속으로 더해야 해요. 남이 얼마를 썼는지는 낙찰가 외에는 알 수 없지만, 누가 언제 낙찰받았는지와 그때의 시간을 기록하면 각자의 남은 시간을 대략 추정할 수 있어요.' },
        { title: '카운트다운 포기의 가치', body: '카운트다운 안에 손을 떼면 시간이 전혀 들지 않아요. 다른 사람이 큰 시간을 쓰기 직전이라고 판단되면 과감히 빠졌다가, 남들의 시간이 바닥났을 때 싸게 연속으로 따는 전략이 가능해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '포 세일 (For Sale)', players: '3–6명', alike: '한정된 자금으로 여러 번의 경매를 치르고, 경매에서 일찍 빠지면 자금의 일부만 잃어요.', differs: '포 세일은 돈으로 공개 입찰하고 순서대로 빠지며, 시간 압박이나 기억 요소가 없어요.' },
      { name: '모던 아트 (Modern Art)', players: '3–5명', alike: '경매 방식 중 하나로, 남이 얼마를 낼지 모른 채 몰래 쥔 금액으로 겨루는 "주먹 경매"가 있어요.', differs: '모던 아트는 이긴 사람만 돈을 내고, 그림의 가치가 시장에서 정해져요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Time Auction rules — The Devil's Plan 2 (Death Room), day 2 prison match",
      description: "The rules of Time Auction from The Devil's Plan: Death Room (season 2): ten minutes of time as money, nineteen auctions won by holding a button longest, dropping out and void auctions, why you must remember your time, and who gets a piece or is eliminated.",
      keywords: ['Time Auction', "Devil's Plan 2 Time Auction", "Devil's Plan Death Room prison match"],
    },
    title: "Time Auction — The Devil's Plan 2, day 2 prison match",
    name: 'Time Auction',
    lead: 'Bid with time instead of money. Whoever holds the button longest wins the token — and time spent never comes back.',
    summary: 'Nineteen auctions paid in time: hold your button longest to win, and the player with the fewest wins is eliminated.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone in prison on day 2.',
        '**Money**: ten minutes each, tracked to a tenth of a second.',
        '**Buttons**: one each, screened from the others.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ready', body: 'Before each auction everyone holds their button down.' },
        { title: 'Countdown', body: 'After a five-second countdown, the time of everyone still pressing starts to run. Let go during the countdown to skip the auction at no cost.' },
        { title: 'Bidding', body: 'Let go when you have spent as much as you want. The display shows only the time elapsed in this auction; nobody, not even you, sees remaining totals.' },
        { title: 'Winner', body: 'When the last player lets go, the clock stops and they win a victory token. Only the winner is announced, not who took part.' },
      ] },
      { type: 'p', text: 'There are nineteen auctions.' },
    ],
    win: [
      { type: 'list', items: [
        '**Most** tokens earns a piece (ties to more time left; still tied, nobody gets it).',
        '**Fewest** tokens is eliminated (ties: less time left is eliminated).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Running out of time releases your button automatically; you cannot bid more than you have.',
        'If two or more let go at exactly the same tenth of a second, the auction is void and its token is lost.',
        'Losing bidders still lose the time they held for.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Time Auction is **an all-pay auction**: losing bidders pay too, so staying to the end of a contested auction is dangerous.' },
      { type: 'cards', items: [
        { title: 'You only need a few wins', body: 'To survive you just must not have the fewest tokens. Picking up the auctions others abandon cheaply beats trying to win every one.' },
        { title: 'Memory is your balance', body: 'Your remaining time is hidden, so you must add up what you spend. Recording who won when, and at what time, lets you estimate everyone else’s remaining time.' },
        { title: 'Dropping in the countdown', body: 'Leaving during the countdown costs nothing. Skip auctions where others are about to burn big amounts, then win several cheaply once they are running dry.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'For Sale', players: '3–6', alike: 'Several auctions on a fixed budget; dropping out early costs only part of your bid.', differs: 'Bids are open money in turn order, with no time pressure or memory.' },
      { name: 'Modern Art', players: '3–5', alike: 'One of its formats is a hidden "fist" auction where you bid without knowing others’ amounts.', differs: 'Only the winner pays, and paintings’ values are set by the market.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
