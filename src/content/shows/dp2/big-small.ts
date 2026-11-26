import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'big-small',
  kind: 'final',
  when: { ko: '7일차 결승 1회전', en: 'Day 7, final game 1' },
  related: ['blackWhite', 'indianPoker', 'gradation'],
  updated: '2026-11-26',
  sources: [namuDay(7), broadcast],
  ko: {
    meta: {
      title: '빅 스몰 규칙 — 데블스플랜2(데스룸) 결승 1회전, 딜러와 카드 대결 + 결과 베팅',
      description: '데블스 플랜: 데스룸(데블스플랜2) 결승 1회전 빅 스몰의 규칙을 정리했어요. 0–10 카드와 칩 10개, 딜러의 1–9 카드, 대결 플레이어와 베팅 플레이어, 숫자 차이만큼의 칩, 빅·스몰 베팅, 18라운드와 승리 조건까지.',
      keywords: ['빅 스몰', '빅스몰', '데블스플랜2 빅 스몰', '데블스 플랜 데스룸 결승', '데블스플랜2 결승전'],
    },
    title: '빅 스몰 — 데블스플랜2 결승 1회전',
    name: '빅 스몰',
    lead: '한 사람은 딜러의 카드와 숫자 대결을 하고, 다른 한 사람은 그 결과가 클지 작을지에 칩을 걸어요.',
    summary: '한 명은 딜러의 카드보다 큰 카드를 내고, 다른 한 명은 그 결과에 빅·스몰로 베팅하는 결승 1회전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 결승 진출자 2명.',
        '**플레이어**: 각자 0부터 10까지 카드 한 벌과 칩 10개.',
        '**딜러**: 플레이어마다 1부터 9까지 카드 한 벌씩.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '역할', body: '라운드마다 한 사람은 **대결 플레이어**, 다른 사람은 **베팅 플레이어**가 돼요.' },
        { title: '딜러 카드 공개', body: '딜러가 대결 플레이어 몫의 카드 세트를 섞어 한 장을 공개해요.' },
        { title: '대결', body: '대결 플레이어는 공개된 카드를 보고 자기 카드 한 장을 뒷면으로 내요. 이기면 두 숫자의 차이만큼 칩을 받아요.' },
        { title: '베팅', body: '베팅 플레이어는 대결 플레이어의 카드가 딜러보다 클 것 같으면 빅, 작을 것 같으면 스몰에 걸어요. 맞히면 건 칩의 2배를 돌려받고, 틀리면 잃고, 같으면 돌려받아요.' },
        { title: '카드 정리', body: '대결에 쓴 카드는 모두 버리고, 다음 라운드는 남은 카드로만 해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '18라운드가 끝났을 때 **칩이 더 많은 사람**, 또는 먼저 **상대의 칩을 0개로 만든 사람**이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '피스를 써서 1라운드의 대결·베팅 역할을 정할 수 있었어요(피스 베네핏).',
        '딜러 카드는 1–9뿐이라, 플레이어의 0은 반드시 지고 10은 반드시 이겨요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '빅 스몰은 **카드 카운팅과 상대 읽기가 동시에** 필요한 게임이에요. 대결 플레이어는 딜러의 남은 카드와 내 남은 카드를 세어야 하고, 베팅 플레이어는 상대가 어떤 카드를 낼지 읽어야 해요.' },
      { type: 'cards', items: [
        { title: '이기는 크기를 조절해요', body: '대결에서 받는 칩은 숫자 차이라서, 딜러의 3에 10을 내면 7개, 4를 내면 1개예요. 큰 카드는 크게 이기는 데 쓰고, 작은 차이로 이길 수 있을 때는 작은 카드로 아껴야 해요. 지는 판에는 0이나 1을 버리는 것이 좋아요.' },
        { title: '베팅은 상대의 선택을 맞히는 것', body: '딜러의 카드는 공개되므로, 베팅 플레이어가 맞혀야 하는 건 사실상 "상대가 이번 판을 이기려 할까, 버리려 할까"예요. 상대의 남은 카드와 지금까지의 버리는 패턴이 근거가 돼요.' },
        { title: '역할이 바뀌는 구조', body: '두 사람이 번갈아 대결과 베팅을 맡는다면, 내가 대결할 때 상대가 내 선택을 읽고 거는 셈이에요. 일부러 읽기 쉬운 패턴을 보여 줬다가 중요한 판에 깨는 심리전이 가능해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '인비트윈 (In-Between, Acey Deucey)', players: '2명 이상', alike: '공개된 카드를 보고, 다음 카드가 어느 범위에 들어올지에 칩을 거는 카드 베팅 게임이에요.', differs: '인비트윈은 다음 카드가 무작위로 나오고, 상대가 카드를 고르는 대결이 없어요.' },
      { name: '로스트 시티 (Lost Cities)', players: '2명', alike: '숫자 카드를 언제 쓰고 언제 버릴지, 상대가 무엇을 들고 있을지를 세며 겨루는 2인 카드 게임이에요.', differs: '로스트 시티는 탐험로에 카드를 오름차순으로 쌓아 점수를 내고, 베팅이 없어요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 정리 자료에는 라운드마다 역할이 어떻게 바뀌는지가 적혀 있지 않아, 그 부분은 단정하지 않았어요.',
  },
  en: {
    meta: {
      title: "Big Small rules — The Devil's Plan 2 (Death Room), final game 1",
      description: "The rules of Big Small, the first game of The Devil's Plan: Death Room (season 2) final: cards 0–10 and ten chips, the dealer’s 1–9, the duelling and betting players, chips equal to the difference, big or small bets, and 18 rounds.",
      keywords: ['Big Small', "Devil's Plan 2 Big Small", "Devil's Plan Death Room final"],
    },
    title: "Big Small — The Devil's Plan 2, final game 1",
    name: 'Big Small',
    lead: 'One player duels the dealer’s card; the other bets on whether that card will be bigger or smaller.',
    summary: 'One finalist plays a card against the dealer’s; the other bets big or small on the result.',
    setup: [
      { type: 'list', items: [
        '**Players**: the two finalists.',
        '**Players’ kit**: cards 0 to 10 and ten chips each.',
        '**Dealer**: a set of 1 to 9 for each player.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Roles', body: 'Each round one player is the **duellist** and the other the **bettor**.' },
        { title: 'Dealer card', body: 'The dealer shuffles the duellist’s dealer set and turns up one card.' },
        { title: 'Duel', body: 'The duellist plays one card face down; a win earns chips equal to the difference.' },
        { title: 'Bet', body: 'The bettor bets **big** (duellist’s card higher) or **small**. Right doubles the bet, wrong loses it, a tie returns it.' },
        { title: 'Discard', body: 'Cards used are discarded; later rounds use what is left.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'After 18 rounds, **more chips** wins — or whoever **first takes the opponent to zero**.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A piece benefit let a player decide round 1’s roles.',
        'The dealer has only 1–9, so a player’s 0 always loses and 10 always wins.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Big Small needs **card counting and reading the opponent at once**: the duellist counts both remaining sets; the bettor reads which card the duellist will play.' },
      { type: 'cards', items: [
        { title: 'Choose how much to win by', body: 'Chips equal the difference: a 10 on the dealer’s 3 earns 7, a 4 earns 1. Spend big cards on big wins, small ones on narrow wins, and dump 0 or 1 on rounds you will lose.' },
        { title: 'The bet reads a decision', body: 'The dealer’s card is public, so the bettor is really guessing whether the duellist will try to win or throw the round — from remaining cards and past patterns.' },
        { title: 'Swapping roles', body: 'If the roles alternate, your duels are read by the opponent’s bets; showing an easy pattern and breaking it on a key round is a weapon.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'In-Between (Acey Deucey)', players: '2+', alike: 'Bet chips on where the next card will fall relative to the visible ones.', differs: 'The next card is random; nobody chooses it.' },
      { name: 'Lost Cities', players: '2', alike: 'A two-player card game of counting what is left and deciding when to play or discard.', differs: 'You build ascending expeditions for points; there is no betting.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' The source does not say how roles change between rounds, so that is not asserted here.',
  },
};

export default game;
