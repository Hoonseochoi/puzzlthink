import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'prediction-race',
  kind: 'semi',
  when: { ko: '8일차', en: 'Day 8' },
  related: ['heavy13', 'hitStay', 'pointOmok'],
  updated: '2026-11-26',
  sources: [namuDay('8'), broadcast],
  ko: {
    meta: {
      title: '예측 레이스 규칙 — 피의 게임X 세미파이널, 남의 차에 카드를 꽂는 레이스',
      description: '피의 게임X 세미파이널 예측 레이스의 규칙을 정리했어요. 순위 비공개 예측, 1–5 베팅 카드로 이동 카드 묶음 낙찰, 남의 기어판에도 꽂는 이동 카드, 두 장 조합에 따른 전진·대각선·후진, 슬립스트림과 전복·충돌, 예측 성공자가 위로 가는 최종 순위까지.',
      keywords: ['예측 레이스', '피의 게임X 예측 레이스', '피의게임X 세미파이널', '레이스 보드게임', '피의게임X'],
    },
    title: '예측 레이스 — 피의 게임X 세미파이널',
    name: '예측 레이스',
    lead: '경기 전에 내 최종 순위를 몰래 적어 둬요. 그리고 이동 카드를 경매로 사서, 내 차든 남의 차든 원하는 기어판에 꽂아요.',
    summary: '이동 카드를 경매로 사서 아무 차의 기어판에나 꽂는 레이스. 미리 적은 자기 순위를 맞힌 사람이 위로 올라가요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 세미파이널 진출자 전원(최종 순위 상위 4명이 4인 토너먼트 결승으로 가요).',
        '**개인 지급품**: 자기 색의 레이스 카, 왼쪽·오른쪽 슬롯이 있는 기어판, 베팅 카드 1–5 다섯 장(다 쓰면 다시 받아요).',
        '**이동 카드 12장**: 1·2·3 각 3장, 4·0·후진 각 1장.',
        '**순서**: 개인 자금이 가장 많은 사람이 1라운드 순서를 정하고, 이후 라운드마다 선이 맨 뒤로 가며 한 칸씩 당겨져요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '순위 예측', body: '시작 전에 각자 자기의 최종 레이스 순위를 몰래 적어요.' },
        { title: '베팅', body: '라운드마다 이동 카드 12장이 A–D 네 구역에 3장씩 공개돼요. 투표룸에서 원하는 구역에 베팅 카드 한 장을 몰래 내요. 구역마다 **혼자** 가장 높은 숫자를 낸 사람이 그 구역 3장을 가져가요(가장 높은 숫자가 겹치면 그다음 단독 숫자, 없으면 폐기).' },
        { title: '이동 카드 배치 (3분)', body: '낙찰자가 선부터, 가져온 카드를 **아무 플레이어의** 기어판 빈 슬롯에 꽂아요. 안 꽂으면 버려요.' },
        { title: '차 이동', body: '선부터, 양쪽 슬롯이 다 찬 차가 움직이고 카드는 버려요. 출발 위치는 차 주인이 정해요. 한쪽만 찬 카드는 다음 라운드까지 남아요.' },
      ] },
      { type: 'table', head: ['슬롯 두 장', '이동'], rows: [
        ['같은 숫자 2장', '그 숫자만큼 전진'],
        ['다른 숫자 2장', '작은 숫자만큼 전진한 뒤, 두 수의 차이만큼 큰 숫자 쪽으로 대각선 이동'],
        ['후진 + 숫자(0 제외)', '그 숫자만큼 후진(출발선 뒤로는 못 가요)'],
        ['후진 + 0, 또는 후진 + 후진', '움직이지 않아요'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        '누군가 골인 지점을 지나면 그 라운드가 끝난 뒤 게임이 끝나요(최대 20라운드).',
        '**자기 순위 예측에 성공한 사람들이 먼저**, 레이스 순위대로 위쪽 순위를 차지해요. 예측에 실패한 사람들은 그 아래에서 레이스 순위대로 놓여요.',
        '같은 줄이면 안쪽 트랙이, 같은 칸이면 위에 올라탄 차가 앞이에요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**슬립스트림**: 출발 칸 바로 앞에 다른 차가 있으면 2칸 앞에서 이동을 시작해요.',
        '**벽 충돌**: 차가 뒤집혀 다음 라운드에 움직이지 못하고 기어판에도 카드를 받을 수 없어요.',
        '**차끼리 충돌**: 부딪힌 차가 상대 차 위로 올라타고, 남은 이동은 사라져요. 아래 깔린 차는 움직일 수 없어요. 뒤집힌 차나 이미 올라탄 차 위로도 올라탈 수 있어요.',
        '6라운드 전에 히든 룰이 공개됐지만 여기에는 적지 않았어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '예측 레이스의 핵심은 **"1등"이 아니라 "예측한 순위"**예요. 3등을 예측하고 3등을 하면, 1등을 예측했다가 2등을 한 사람보다 위예요. 그래서 레이스 중 모두의 목표가 달라요.' },
      { type: 'cards', items: [
        { title: '남의 차를 움직이는 게임', body: '이동 카드는 아무 차에나 꽂을 수 있어요. 후진 카드를 앞선 차에 꽂거나, 다른 숫자 두 장으로 상대 차를 벽 쪽 대각선으로 보내 전복시킬 수 있어요. 내 차를 직접 빨리 모는 것보다, 남의 차를 원하는 순위에 묶어 두는 쪽이 더 큰 힘일 수 있어요.' },
        { title: '예측은 협상 카드가 돼요', body: '예측은 비공개라, "나는 4등을 적었다"는 말은 사실일 수도 거짓일 수도 있어요. 서로 다른 순위를 적었다고 믿는 사람끼리는 협력할 이유가 생기고, 같은 순위를 노린다면 적이 돼요. 순위가 겹치지 않게 나눠 갖는 연합이 가장 강력해요.' },
        { title: '베팅은 하이에나식', body: '구역마다 "혼자 가장 높은 숫자"가 이기므로 5는 겹치기 쉬워요. 베팅 카드는 다섯 장을 다 써야 다시 받으니, 큰 숫자를 언제 쓸지 남의 남은 카드를 세며 정해야 해요.' },
        { title: '한쪽 슬롯은 예약이에요', body: '한쪽 슬롯에만 꽂힌 카드는 다음 라운드까지 남아서, 다음에 어떤 카드가 붙느냐에 따라 이동이 정해져요. 상대 차 슬롯에 0을 하나 꽂아 두면, 짝이 맞지 않는 한 다음 이동을 약하게 만들 수 있어요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '카멜 업 (Camel Up)', players: '2–8명', alike: '말(낙타)이 서로 위로 올라타며 달리고, 플레이어는 어느 말이 몇 등을 할지에 걸어요. 레이스를 직접 모는 것보다 결과 예측이 점수가 되는 점이 같아요.', differs: '카멜 업의 낙타는 누구의 것도 아니고, 이동은 주사위가 정해요.' },
      { name: '플람 루즈 (Flamme Rouge)', players: '2–4명', alike: '앞 선수 바로 뒤에 붙으면 끌려가는 슬립스트림 규칙과, 이동 카드로 거리를 정하는 자전거 레이스예요.', differs: '플람 루즈는 자기 선수만 움직이고, 순위 예측이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 결승 진출 인원(4명)은 결승이 4인 토너먼트였다는 점에서 확인했어요. 게임판 구성과 히든 룰은 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Prediction Race rules — The Bloody Game X semifinal',
      description: 'The rules of Prediction Race, the semifinal of The Bloody Game X (피의 게임X): a secret prediction of your own place, winning bundles of movement cards with 1–5 bets, slotting them into anyone’s gearbox, how two cards move a car, slipstreams, crashes and pile-ups, and the ranking that rewards correct predictions.',
      keywords: ['Prediction Race', 'Bloody Game X semifinal', 'racing board game', '피의 게임X'],
    },
    title: 'Prediction Race — The Bloody Game X semifinal',
    name: 'Prediction Race',
    lead: 'Secretly write down where you will finish. Then buy movement cards at auction and slot them into any car’s gearbox — yours or someone else’s.',
    summary: 'Win movement cards at auction and slot them into any car; players who predicted their own place correctly rank first.',
    setup: [
      { type: 'list', items: [
        '**Players**: all semifinalists (the top four go on to a four-player knockout final).',
        '**Each player**: a car in their colour, a gearbox with left and right slots, and betting cards 1–5 (refreshed when used up).',
        '**12 movement cards**: three each of 1, 2 and 3; one each of 4, 0 and Reverse.',
        '**Order**: the richest player sets round 1’s order; then the first player moves to last and everyone shifts up.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Predict', body: 'Before the race, everyone secretly writes their own final position.' },
        { title: 'Bet', body: 'Each round the twelve movement cards are dealt three each to zones A–D. In the voting room, place a betting card on one zone. In each zone the **unique** highest card wins its three cards (if the highest is shared, the next unique one; if none, they are discarded).' },
        { title: 'Slotting (3 minutes)', body: 'From the first player, winners put their cards into empty slots of **any** player’s gearbox, or discard them.' },
        { title: 'Driving', body: 'From the first player, every car with both slots filled moves and the cards are discarded; the owner chooses the starting square. A single card stays for next round.' },
      ] },
      { type: 'table', head: ['Two cards', 'Movement'], rows: [
        ['Same number', 'Forward that many'],
        ['Different numbers', 'Forward the smaller, then diagonally by the difference toward the larger card’s side'],
        ['Reverse + a number (not 0)', 'Back that many (never behind the start)'],
        ['Reverse + 0, or two Reverses', 'No movement'],
      ] },
    ],
    win: [
      { type: 'list', items: [
        'When a car crosses the finish, the game ends after that round (at most 20 rounds).',
        '**Players who predicted their position correctly rank first**, in race order; the rest follow in race order.',
        'On the same row the inside track leads; in the same square the car on top leads.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Slipstream**: a car directly ahead of your start square boosts you two squares forward before you move.',
        '**Wall crash**: the car flips and can neither move nor receive cards next round.',
        '**Car crash**: the moving car climbs on top of the other and stops; a car underneath cannot move. Cars may climb onto flipped or stacked cars.',
        'A hidden rule revealed before round 6 is not described.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'The key is **your predicted place, not first place**: predicting third and finishing third beats predicting first and finishing second, so everyone’s aim differs.' },
      { type: 'cards', items: [
        { title: 'A game of moving other cars', body: 'Cards go into any gearbox: a Reverse for the leader, or two different numbers to send a rival diagonally into a wall. Holding others at the right places can matter more than driving fast.' },
        { title: 'Predictions are bargaining chips', body: 'Predictions are secret, so "I wrote fourth" may be true or not. Players who believe they aimed at different places can cooperate; the same place makes them enemies. An alliance that splits places without overlap is strongest.' },
        { title: 'Bidding like Hol’s der Geier', body: 'The unique highest card wins each zone, so fives collide. Cards return only after all five are used, so time your high cards by counting others’ remaining ones.' },
        { title: 'A single slot is a reservation', body: 'A lone card waits for its partner, so the next card decides the move. Planting a 0 in a rival’s slot can weaken their next move.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Camel Up', players: '2–8', alike: 'Racers stack on top of each other, and players score by predicting placings rather than driving.', differs: 'The camels belong to nobody and dice move them.' },
      { name: 'Flamme Rouge', players: '2–4', alike: 'A slipstream rule pulls riders tucked behind others; cards set distances.', differs: 'You only move your own riders, and nothing is predicted.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' That four advance follows from the final being a four-player knockout. The board layout and hidden rule are not described.',
  },
};

export default game;
