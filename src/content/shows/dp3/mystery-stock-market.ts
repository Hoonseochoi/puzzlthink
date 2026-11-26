import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'mystery-stock-market',
  kind: 'main',
  when: { ko: '2일차', en: 'Day 2' },
  related: ['hitStay', 'twoSidedPoker', 'piggyBank'],
  updated: '2026-11-26',
  sources: [namuDay(2), broadcast],
  ko: {
    meta: {
      title: '미스터리 거래소 규칙 — 데블스플랜3 2일차 메인매치, 숨겨진 주가 규칙 추리',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 2일차 메인매치 미스터리 거래소의 규칙을 정리했어요. 7개 종목과 24라운드, 단계별로 공개되는 주가 변동 규칙, 시크릿, 피스로 사는 정보, 순위와 보상, 그리고 승부를 가르는 지점까지.',
      keywords: ['미스터리 거래소', '데블스플랜3 미스터리 거래소', '데블스 플랜 3 2일차', '데블스플랜3 메인매치', '미스터리 거래소 규칙', '주식 게임'],
    },
    title: '미스터리 거래소 — 데블스플랜3 2일차 메인매치',
    name: '미스터리 거래소',
    lead: '주가가 어떤 규칙으로 움직이는지 아무도 모르는 거래소. 규칙의 빈칸을 남보다 먼저 채운 사람이 돈을 벌어요.',
    summary: '7개 종목의 숨겨진 주가 변동 규칙을 추리하며 24라운드 동안 사고파는 자산 경쟁.',
    setup: [
      { type: 'list', items: [
        '**인원**: 둘째 날 생존자 전원(12명).',
        '**종목**: 회사 7곳의 주식. 처음 가격은 모두 10,000원이고, 아무리 떨어져도 100원 아래로는 내려가지 않아요.',
        '**개인 지급품**: 단말기와 가상 현금 100,000원.',
        '**진행 시간**: 24라운드, 라운드마다 5분.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '사고팔기', body: '라운드마다 단말기로 원하는 종목을 사고팔아요. 내가 가진 수량과 지금 주가는 언제든 볼 수 있어요.' },
        { title: '라운드 전환', body: '라운드가 끝나면 바로 다음 라운드로 넘어가고, 그 순간 바뀐 주가·종목별 매매 현황·보유 총량, 그리고 모두의 자산과 순위가 공개돼요.' },
        { title: '주가 변동 규칙', body: '종목마다 정해진 변동 규칙이 있고 매 라운드 그 규칙대로 주가가 움직여요. 처음에는 규칙 문장의 일부만 보이고, **5·10·15라운드가 시작될 때 가려진 부분이 차례로 열리며 20라운드에는 전부 공개**돼요. 색이 다르게 표시된 가림 부분은 다음에 열릴 곳이에요.' },
        { title: '시크릿', body: '게임 중 한 번, 한 종목에 시크릿을 걸 수 있어요. 건 다음 라운드부터 두 라운드 동안 그 종목의 가격·매매 현황·보유 총량이 가려지고, 그동안은 순위만 공개되고 개인 자산은 숨겨져요.' },
        { title: '피스 쓰기', body: '20라운드가 끝나기 전까지 피스 1개로 한 종목의 다음 공개 정보를 미리 보거나, 피스 1개를 현금 10,000원으로 바꿀 수 있어요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '24라운드가 끝났을 때 **보유 자산 총액** 순서로 순위를 정해요.',
        '**1–4위는 생활동, 5–11위는 감옥동, 최하위 1명은 탈락**이에요. 1위는 연맹의 징표를 받아요.',
        '최종 자산이 150만 원 이상이면 피스 1개, 300만 원 이상이면 2개, 600만 원 이상이면 3개를 받아요. 1,000만 원을 넘긴 사람이 있으면 상금의 징표가 걸려 있었어요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '최하위가 여러 명이면, 게임 도중 자산 총액이 가장 낮았던 적이 있는 사람이 탈락해요.',
        '여러 사람이 같은 라운드에 같은 종목에 시크릿을 걸면 효과는 한 번만 적용되고, 건 시크릿은 모두 사라져요.',
        '주가는 최저 100원에서 멈춰요. 그 아래로는 떨어지지 않아요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '미스터리 거래소의 핵심 자원은 돈이 아니라 **규칙에 대한 정보**예요. 모든 사람이 같은 주가를 보지만, 그 움직임 뒤의 규칙을 먼저 알아낸 사람만 다음 움직임을 예측할 수 있어요.' },
      { type: 'cards', items: [
        { title: '가려진 문장도 정보예요', body: '규칙 문장은 가려져 있어도 띄어쓰기와 글자 수는 보여요. 문장의 뼈대를 보고 "어떤 종목이 오르면", "매수량이 많으면" 같은 빈칸을 추리할 수 있고, 몇 라운드의 실제 주가 변화를 대입해 후보를 지워 나갈 수 있어요.' },
        { title: '매매 현황은 다른 사람의 추리를 보여 줘요', body: '라운드마다 종목별 매매량과 보유 총량이 공개돼요. 누군가 특정 종목을 대량으로 사기 시작했다면, 그 사람이 규칙을 먼저 알아냈을 가능성이 높아요. 이 신호를 읽는 것 자체가 하나의 추리 수단이에요.' },
        { title: '시크릿은 정보 격차를 만드는 도구', body: '내가 먼저 알아낸 상승 신호가 있을 때 시크릿을 걸면 두 라운드 동안 남들이 그 종목을 따라오지 못해요. 하지만 내 추리가 틀렸다면 하락도 남보다 늦게 알아차리게 돼요. 확신이 있을 때만 쓸 수 있는 한 번뿐인 카드예요.' },
        { title: '비율로 생각하기', body: '가격이 낮은 종목은 같은 금액의 변동도 비율로는 훨씬 커요. 100원 바닥 근처의 종목을 대량으로 사면 작은 상승에도 자산이 크게 불지만, 반대로 움직이면 거의 전부를 잃어요. 순위만 지키면 되는 사람과 1위나 큰 보상을 노리는 사람의 정답이 달라요.' },
        { title: '지배 전략이 있을까요?', body: '규칙이 완전히 공개되는 20라운드 이후에는 모두가 같은 정보를 가지므로, 그전까지 얼마나 벌어 두었느냐가 결과를 정해요. 그래서 "정보가 다 열릴 때까지 기다린다"는 전략은 안전해 보여도 하위권을 벗어나기 어려워요. 반대로 서둘러 베팅하면 틀린 추리에 자산을 잃을 수 있어, 정답은 추리의 확신도에 따라 달라져요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '스톡파일 (Stockpile)', players: '2–5명', alike: '각자 일부 종목의 다음 주가 변동을 남몰래 미리 알고 사고파는 주식 게임이라, 피스로 사는 "다음 공개 정보 미리 보기"와 가장 닮았어요.', differs: '스톡파일은 경매로 주식 묶음을 사고, 주가 변동은 카드로 정해져요. 숨겨진 변동 규칙을 추리하는 요소는 없어요.' },
      { name: '어콰이어 (Acquire)', players: '2–6명', alike: '여러 회사의 주식을 사 두었다가 가치가 오를 때 이익을 보는 주식 투자 게임이에요.', differs: '어콰이어는 타일을 놓아 회사를 키우고 합병시키므로, 주가를 플레이어가 직접 만들어요.' },
      { name: '핏 (Pit)', players: '3–8명', alike: '모두가 동시에 소리치며 거래하는 시끌벅적한 시장 게임이에요.', differs: '핏은 같은 상품 카드를 모으는 교환 게임이라 가격이나 자산 개념이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 종목별 실제 주가 변동 규칙은 문장을 옮기지 않았어요.',
  },
  en: {
    meta: {
      title: "Mystery Stock Market rules — The Devil's Plan 3, day 2 main match",
      description: "The rules of Mystery Stock Market from The Devil's Plan: Dead Again (season 3): seven stocks over 24 rounds, price rules revealed in stages, the Secret, buying information with pieces, ranking and rewards, and what decides it.",
      keywords: ['Mystery Stock Market', "Devil's Plan 3 Mystery Stock Market", "Devil's Plan main match", 'stock market game rules'],
    },
    title: "Mystery Stock Market — The Devil's Plan 3, day 2 main match",
    name: 'Mystery Stock Market',
    lead: 'A stock exchange where nobody knows the rules that move prices. Whoever fills in the blanks first makes the money.',
    summary: 'Trade seven stocks for 24 rounds while working out the hidden rules that move their prices.',
    setup: [
      { type: 'list', items: [
        '**Players**: everyone still in on day 2 (12).',
        '**Stocks**: seven companies, all starting at ₩10,000; no price ever drops below ₩100.',
        '**Each player**: a terminal and ₩100,000 of virtual cash.',
        '**Length**: 24 rounds of five minutes.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Trading', body: 'Each round you buy and sell on your terminal; your holdings and live prices are always visible.' },
        { title: 'Round change', body: 'A new round starts immediately, revealing new prices, each stock’s trading volume and total holdings, and everyone’s assets and rank.' },
        { title: 'Price rules', body: 'Each stock moves by its own rule every round. Only part of each rule’s text is visible at first; **hidden parts open at the start of rounds 5, 10 and 15, and everything is shown in round 20**. Parts shaded differently open next.' },
        { title: 'The Secret', body: 'Once per game you may put a Secret on one stock: for the next two rounds its price, volume and holdings are hidden, and only ranks (not assets) are shown.' },
        { title: 'Pieces', body: 'Until round 20 ends, a piece buys a preview of one stock’s next reveal, or converts to ₩10,000 in cash.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After round 24, players rank by **total assets**.',
        '**Places 1–4 go to the living quarters, 5–11 to prison, and the last place is eliminated.** First place gets the Alliance token.',
        'Final assets of ₩1.5m, ₩3m or ₩6m earn 1, 2 or 3 pieces; reaching ₩10m would have earned a prize token.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If several tie for last, the one whose assets were lowest at any point during the game is eliminated.',
        'If several players put a Secret on the same stock at once, it applies once and all of those Secrets are used up.',
        'Prices stop at ₩100.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The key resource is not money but **information about the rules**. Everyone sees the same prices; only whoever works out the rule behind them can predict the next move.' },
      { type: 'cards', items: [
        { title: 'Hidden text is still information', body: 'Even hidden, a rule shows its spacing and letter count. The sentence’s shape suggests what fits the blanks ("when another stock rises", "when many shares are bought"), and a few rounds of real price changes rule candidates out.' },
        { title: 'Volume shows other people’s deductions', body: 'Trading volume and holdings are public each round. A sudden heavy buyer has probably cracked a rule first; reading that signal is a deduction tool in itself.' },
        { title: 'The Secret creates an information gap', body: 'With a rise only you have spotted, a Secret keeps others from following for two rounds. If your reading is wrong, you also see the fall later than everyone else. It is a one-shot card for when you are sure.' },
        { title: 'Think in ratios', body: 'A cheap stock moves much more in percentage terms. Buying heavily near the ₩100 floor multiplies small rises and loses nearly everything on a fall. Someone protecting a rank and someone chasing first place should not make the same bet.' },
        { title: 'Is there a dominant strategy?', body: 'After round 20 everyone has the same information, so the result is mostly what you earned before then. Waiting for full information looks safe but rarely lifts you off the bottom; betting early risks a wrong deduction. The right move depends on how sure you are.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Stockpile', players: '2–5', alike: 'Each player secretly knows some upcoming price movements before trading, very like buying a preview with a piece.', differs: 'Shares are bought in auctioned piles and prices move by cards; there are no hidden rules to deduce.' },
      { name: 'Acquire', players: '2–6', alike: 'Buy shares in several companies and profit as their value rises.', differs: 'Players build and merge the companies with tiles, so they make the prices themselves.' },
      { name: 'Pit', players: '3–8', alike: 'A noisy market where everyone trades at once.', differs: 'It is a trading game about collecting one commodity; there are no prices or assets.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The actual price rules of each stock are not reproduced.',
  },
};

export default game;
