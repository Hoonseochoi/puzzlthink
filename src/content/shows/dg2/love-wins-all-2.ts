import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast2, namuResults } from './shared';

const game: ShowGame = {
  slug: 'love-wins-all-2',
  kind: 'tournament',
  when: { ko: '6강 1차', en: 'Last six, match 1' },
  episode: { ko: '5화', en: 'Episode 5' },
  related: ['indianPoker', 'twoSidedPoker', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuResults, broadcast2],
  ko: {
    meta: {
      title: '러브 윈즈 올 2 규칙 — 데스게임2 6강, 가위바위보 포커',
      description: '넷플릭스 데스게임2 6강 1차 러브 윈즈 올 2의 규칙을 정리했어요. 가위·바위·보·러브·라이어 49장, 공유 카드 1장과 개인 카드 3장, 족보 9단계와 가위바위보 상성 비교, 한 장 공개 후 족보 선언, 두 번의 베팅, 라이어 카드의 벌칙까지.',
      keywords: ['러브 윈즈 올', '러브윈즈올', '러브 윈즈 올 2', '데스게임2 러브 윈즈 올', '가위바위보 포커', '넷플릭스 데스게임'],
    },
    title: '러브 윈즈 올 2 — 데스게임2 6강',
    name: '러브 윈즈 올 2',
    lead: '가위바위보로 만든 포커예요. "러브"는 모두를 이기는 카드이고, 한 장뿐인 "라이어"로는 원하는 족보를 우길 수 있어요.',
    summary: '가위·바위·보·러브 카드로 족보를 만들고, 족보를 먼저 선언한 뒤 베팅하는 1:1 포커. 라이어 카드 한 장이 판을 흔들어요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1.',
        '**카드 49장**: 가위 18, 바위 12, 보 12, 러브 6, 라이어 1.',
        '**칩**: 각자 35개.',
        '**패**: 공유 카드 1장 + 개인 카드 3장, 모두 4장의 조합으로 겨뤄요.',
      ] },
      { type: 'table', head: ['족보 (높은 순)', '조건'], rows: [
        ['러브 윈즈 올', '러브 4장'],
        ['쓰리 러브', '러브 3장'],
        ['포카드', '러브가 아닌 같은 카드 4장'],
        ['믹스', '러브·가위·바위·보 1장씩'],
        ['투 러브', '러브 2장'],
        ['투페어', '러브 없이 같은 카드 두 쌍'],
        ['트리플', '러브 없이 같은 카드 3장'],
        ['원페어', '러브 없이 같은 카드 2장'],
        ['원 러브', '러브 1장'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '기본 베팅과 카드', body: '칩 1개씩 걸고 개인 카드 2장을 받아요. 딜러가 공유 카드 1장을 공개해요. 1라운드 선은 추첨, 그 뒤로는 직전 라운드 승자가 선이에요.' },
        { title: '1차 베팅', body: '일반 포커처럼 베팅해요.' },
        { title: '카드 한 장 공개', body: '개인 카드 1장을 더 받은 뒤, 내 카드 3장 중 1장을 골라 동시에 공개해요.' },
        { title: '족보 선언', body: '선부터 자기 족보를 선언해요. 공유 카드와 공개한 카드로 보아 가능한 족보여야 해요.' },
        { title: '2차 베팅과 승부', body: '베팅한 뒤 나머지 2장을 공개해, 족보가 높은 쪽이 이겨요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**한 사람이 칩을 모두 가져가면** 그 사람이 이겨요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '같은 족보끼리는 가위바위보 상성으로, 그것도 같으면 나머지 카드의 상성으로 비교해요. 믹스와 원 러브끼리는 무승부예요.',
        '무승부면 판돈이 다음 라운드로 넘어가요. 포기로 끝나면 카드는 공개하지 않아요.',
        '**라이어 카드**: 선언 규칙 안에서 원하는 카드로 우길 수 있어요(공유 카드로 나오면 둘 다 쓸 수 있어요). 라이어를 써서 지면 칩 5개를 더 내야 하고, 같은 등급 비교에서 라이어를 쓴 쪽이 져요.',
        '7라운드마다 새 덱으로 바꿔요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '러브 윈즈 올 2는 **족보를 먼저 말하고 베팅하는** 포커예요. 보통의 포커는 패를 숨긴 채 베팅으로만 말하지만, 여기서는 선언이 공개 정보가 되고, 그 선언이 진짜인지가 2차 베팅의 쟁점이 돼요.' },
      { type: 'cards', items: [
        { title: '덱 구성이 확률을 정해요', body: '가위가 18장으로 가장 많고 러브는 6장뿐이에요. 같은 카드 묶음(페어·트리플)은 가위로 만들기 쉽고, 러브 여러 장은 드물어요. 공유 카드와 공개된 카드, 이미 버려진 카드를 빼면 상대가 가질 수 있는 족보의 확률을 꽤 정확히 셀 수 있어요.' },
        { title: '선언은 "가능해야" 해요', body: '선언은 공유 카드와 공개 카드로 보아 가능한 족보여야 해서, 아무 말이나 할 수는 없어요. 공개할 카드를 고르는 단계가 사실상 "어떤 족보까지 우길 수 있을지"를 정하는 단계예요.' },
        { title: '라이어는 한 장뿐인 허세', body: '라이어를 쥐면 원하는 족보를 만들 수 있지만, 지면 칩 5개를 더 잃고 같은 등급에서는 무조건 져요. 상대가 너무 강한 족보를 선언했다면 라이어일 가능성을 의심해 볼 만해요. 49장 중 1장이라 확률은 낮지만, 덱이 7라운드마다 바뀌므로 덱마다 한 번은 나올 수 있어요.' },
        { title: '가위바위보 상성', body: '같은 족보끼리는 상성으로 갈려요. 내 족보가 가위로 이뤄졌다면 상대가 바위 족보일 때 지므로, 같은 등급이라도 어느 손으로 만들었는지가 승부를 정해요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '라이어스 포커 (Liar’s Poker)', players: '2명 이상', alike: '자기 패에 대한 선언을 점점 올리고, 상대의 선언이 거짓인지 판단하는 허세 게임이에요.', differs: '라이어스 포커는 지폐의 일련번호를 패로 쓰고, 베팅 칩이 없어요.' },
      { name: '텍사스 홀덤 포커', players: '2–10명', alike: '공유 카드와 개인 카드를 합친 족보, 두 번의 베팅 라운드가 같아요.', differs: '홀덤은 족보를 선언하지 않고, 상성 대신 숫자 크기로 비교해요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 시즌 1의 「러브 윈즈 올」을 바꾼 버전이에요. 투 러브끼리의 세부 비교는 원 정리 자료를 따랐어요.',
  },
  en: {
    meta: {
      title: 'Love Wins All 2 rules — Death Game 2 (The Risk Takers season 2), last six',
      description: 'The rules of Love Wins All 2 from Netflix’s Death Game season 2: 49 cards of scissors, rock, paper, love and one liar, one shared and three private cards, nine hand ranks and rock-paper-scissors tie-breaks, revealing one card and declaring a hand, two betting rounds and the liar penalty.',
      keywords: ['Love Wins All', 'Love Wins All 2', 'Death Game 2', 'rock paper scissors poker'],
    },
    title: 'Love Wins All 2 — Death Game 2, last six',
    name: 'Love Wins All 2',
    lead: 'Poker built from rock-paper-scissors. "Love" beats everything, and the single "liar" card lets you claim any hand you like.',
    summary: 'A 1:1 poker of scissors, rock, paper and love cards where hands are declared before betting; one liar card shakes it up.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1.',
        '**49 cards**: 18 scissors, 12 rock, 12 paper, 6 love, 1 liar.',
        '**Chips**: 35 each.',
        '**Hands**: one shared and three private cards, four in all.',
      ] },
      { type: 'table', head: ['Hand (high to low)', 'Needs'], rows: [
        ['Love wins all', 'Four loves'],
        ['Three love', 'Three loves'],
        ['Four of a kind', 'Four of the same non-love card'],
        ['Mix', 'One each of love, scissors, rock, paper'],
        ['Two love', 'Two loves'],
        ['Two pair', 'Two pairs, no love'],
        ['Three of a kind', 'Three alike, no love'],
        ['One pair', 'A pair, no love'],
        ['One love', 'One love'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Ante and cards', body: 'Ante one chip, take two private cards; a shared card is revealed. Round 1’s leader is drawn, then the previous winner leads.' },
        { title: 'First bet', body: 'Ordinary poker betting.' },
        { title: 'Reveal one', body: 'Take a third private card, then both reveal one of their three cards at once.' },
        { title: 'Declare', body: 'From the leader, declare your hand; it must be possible given the shared and revealed cards.' },
        { title: 'Second bet and showdown', body: 'Bet again, reveal the remaining two cards; the higher hand wins.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Take every chip** to win.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Equal hands compare by rock-paper-scissors, then by the remaining cards; mixes and one-loves always tie.',
        'A tie carries the pot over; a fold shows no cards.',
        '**The liar** can be declared as any card within the declaration rules (both may use it if it is the shared card). Losing with it costs five extra chips, and it loses any same-rank comparison.',
        'The deck is replaced every seven rounds.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Love Wins All 2 is poker where **you announce your hand before betting**. The announcement is public information, and whether it is true becomes the issue of the second bet.' },
      { type: 'cards', items: [
        { title: 'The deck sets the odds', body: 'Scissors are commonest (18) and love rare (6), so sets come easily in scissors and several loves rarely. Subtract shared, revealed and discarded cards and the opponent’s possible hands become quite calculable.' },
        { title: 'Declarations must be possible', body: 'You cannot claim anything; the hand must fit the visible cards. Choosing which card to reveal is really choosing how far you can bluff.' },
        { title: 'The one-card bluff', body: 'The liar makes any hand but costs five chips if you lose and always loses a same-rank comparison. An implausibly strong declaration may be the liar; one in 49, but the deck changes every seven rounds.' },
        { title: 'Rock-paper-scissors matters', body: 'Same ranks split on the cycle: a scissors hand loses to a rock hand, so which hand you built it from decides close contests.' },
      ], columns: 1 },
    ],
    similar: [
      { name: "Liar's Poker", players: '2+', alike: 'Raise claims about your hand and judge whether the opponent is lying.', differs: 'It uses serial numbers on banknotes and has no chips.' },
      { name: "Texas hold'em poker", players: '2–10', alike: 'Shared plus private cards, two betting rounds.', differs: 'Hands are not declared, and numbers, not a cycle, break ties.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' A revised version of season 1’s Love Wins All. The detailed two-love comparison follows the source.',
  },
};

export default game;
