import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'card-chess',
  kind: 'final',
  when: { ko: '9일차 파이널', en: 'Day 9, final' },
  related: ['cardJanggi', 'janggi', 'laserJanggi'],
  updated: '2026-11-26',
  sources: [namuDay('9'), broadcast],
  ko: {
    meta: {
      title: '카드 체스 규칙 — 피의 게임X 파이널, 이동 카드를 돌려 쓰는 5×5 체스',
      description: '피의 게임X 파이널 카드 체스의 규칙을 정리했어요. 5×5 판과 앞뒤가 있는 말 5개, 성, 카드 5장 중 2장씩 나누고 1장은 대기, 쓴 카드를 대기 카드와 바꾸는 순환, 룩·비숍·어태커·나이트·점퍼(퀸) 카드, 승리 조건과 3세트 2선승까지.',
      keywords: ['카드 체스', '피의 게임X 카드 체스', '피의게임X 파이널', '오니타마 비슷한 게임', '피의게임X'],
    },
    title: '카드 체스 — 피의 게임X 파이널',
    name: '카드 체스',
    lead: '내 앞의 이동 카드 두 장 중 하나로 말을 움직이면, 그 카드는 대기 자리로 가고 대기 카드가 내게 와요. 카드가 두 사람 사이를 돌아요.',
    summary: '다섯 장의 이동 카드를 두 사람이 돌려 쓰며 5×5 판에서 말을 움직이는 1:1 결승. 상대 말을 다 잡거나 성을 차지하면 이겨요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1(4인 토너먼트 결승의 마지막 경기).',
        '**판**: 5×5. 각자 앞뒤 방향이 있는 말 5개를 자기 쪽 첫 줄에 앞을 보게 놓아요.',
        '**성**: 처음에 가운데 말이 놓인 칸이 그 사람의 성이에요.',
        '**카드 5장**: 후공이 5장 중 2장을 자기 앞에, 남은 3장 중 2장을 선공 앞에 놓고, 마지막 1장은 대기 자리에 놓아요.',
      ] },
      { type: 'table', head: ['카드', '움직임'], rows: [
        ['룩', '상하좌우로 1칸.'],
        ['비숍', '대각선으로 1칸.'],
        ['어태커', '말이 바라보는 방향으로 곧게 최대 2칸, 또는 앞쪽 대각선으로 1칸. 길에 말이 있으면 넘지 못해요.'],
        ['나이트', '상하좌우로 2칸 간 뒤 옆으로 1칸. 길에 말이 있어도 뛰어넘어요.'],
        ['점퍼', '둘레 8칸에 다른 말이 있을 때만, 그 말을 뛰어넘어 이동해요. 판에 말이 두 개만 남으면 **퀸**(여덟 방향 1칸)으로 바뀌어요.'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '이동', body: '선공부터 번갈아, 내 앞의 카드 2장 중 한 장을 골라 그 규칙대로 내 말 하나를 움직여요.' },
        { title: '카드 순환', body: '쓴 카드는 대기 자리로 가고, 원래 대기 자리에 있던 카드를 가져와 내 앞에 놓아요.' },
        { title: '잡기', body: '움직인 칸에 상대 말이 있으면 그 말을 잡아요.' },
        { title: '방향 바꾸기', body: '말이 판의 맨 끝 줄에 닿으면 방향을 반대로 돌려요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**상대 말을 모두 잡거나**, **상대 성에 내 말을 올려 한 턴을 버티면** 그 세트를 이겨요.',
        '최대 3세트, **먼저 두 세트를 이긴 사람**이 우승해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '어태커만 말의 방향에 영향을 받아요. 맨 끝 줄에서 방향이 바뀌면 어태커가 갈 수 있는 쪽도 바뀌어요.',
        '점퍼는 주변에 말이 없으면 쓸 수 없는 카드라, 두 장 모두 쓸 수 없는 상황을 조심해야 해요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '카드 체스는 오니타마와 같은 **카드 순환** 구조예요. 내가 쓴 카드는 대기 자리를 거쳐 다음에 **상대에게** 가요. 그래서 이번 수를 고를 때, 그 카드를 상대가 받았을 때 무엇을 할 수 있는지까지 따져야 해요.' },
      { type: 'cards', items: [
        { title: '다섯 장이 모두 보여요', body: '내 카드 2장, 상대 카드 2장, 대기 1장이 모두 공개되어 있어서, 상대의 다음 수 후보를 정확히 알 수 있어요. 숨은 정보가 없는 게임이라 수읽기가 전부예요. 상대가 다음에 받을 카드(내가 지금 쓰는 카드)를 생각하며 위험한 카드는 일부러 쓰지 않는 선택도 있어요.' },
        { title: '처음 카드 배분이 큰 권리', body: '후공은 카드를 나눠 주는 대신 늦게 움직여요. 강한 카드(나이트, 어태커)를 자기 쪽에 두고, 상대에게는 짧게 움직이는 카드를 주면 초반 주도권을 가져올 수 있어요. 하지만 카드는 곧 돌기 시작하므로 그 효과는 몇 수 뒤에 사라져요.' },
        { title: '성을 지키는 말', body: '성에 상대 말이 올라와 한 턴을 버티면 지므로, 성 근처를 늘 한 수 안에 잡을 수 있게 지켜야 해요. 반대로 상대 성으로 가는 길이 열리면, 상대가 그 말을 잡을 카드가 없는 순간을 노려 들어가는 것이 결정타예요.' },
        { title: '점퍼와 퀸', body: '점퍼는 주변에 말이 있을 때만 쓰여서 난전에서 강하고 빈 판에서는 쓸모가 없어요. 말이 둘만 남으면 퀸으로 바뀌어 사방 한 칸을 가는데, 이때 그 카드를 쥔 쪽이 마지막 결투에서 유리해져요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '오니타마 (Onitama)', players: '2명', alike: '5×5 판, 말 5개, 이동 카드 5장(각자 2장 + 옆 1장), 쓴 카드가 상대에게 넘어가는 순환, 상대 대장을 잡거나 상대의 출발 칸을 차지하면 이기는 구조까지 거의 같아요.', differs: '오니타마의 카드는 16종이고 그림으로 움직임을 정해요. 말 방향 바꾸기나 점퍼 같은 카드는 없어요.' },
      { name: '체스', players: '2명', alike: '룩, 비숍, 나이트, 퀸처럼 체스 말의 움직임을 카드로 빌려 왔어요.', differs: '체스는 말마다 움직임이 고정되고, 왕을 체크메이트해야 이겨요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 성에서 "한 턴을 버틴다"의 정확한 판정 기준은 확인하지 못했어요.',
  },
  en: {
    meta: {
      title: 'Card Chess rules — The Bloody Game X final',
      description: 'The rules of Card Chess from the final of The Bloody Game X (피의 게임X): a 5×5 board and five facing pieces, the castle, five cards dealt two each with one waiting, the card rotation, the Rook, Bishop, Attacker, Knight and Jumper (Queen) cards, how to win and best of three.',
      keywords: ['Card Chess', 'Bloody Game X final', 'Onitama-like game', '피의 게임X'],
    },
    title: 'Card Chess — The Bloody Game X final',
    name: 'Card Chess',
    lead: 'Move with one of your two movement cards; it goes to the waiting space and the waiting card comes to you. Cards circulate between the players.',
    summary: 'A 1:1 final game on a 5×5 board where five movement cards rotate between the players; capture everything or hold the castle.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1 (the last match of the knockout final).',
        '**Board**: 5×5; each player has five pieces with a front and back, facing forward on their first row.',
        '**Castle**: the square where your centre piece starts.',
        '**Five cards**: the second player puts two in front of themselves, two of the remaining three in front of the first player, and the last in the waiting space.',
      ] },
      { type: 'table', head: ['Card', 'Move'], rows: [
        ['Rook', 'One square orthogonally.'],
        ['Bishop', 'One square diagonally.'],
        ['Attacker', 'Up to two squares straight ahead in the facing direction, or one square diagonally forward; cannot jump.'],
        ['Knight', 'Two squares orthogonally then one sideways; jumps over pieces.'],
        ['Jumper', 'Only when another piece is in the eight surrounding squares: jump over it. With only two pieces left on the board it becomes a **Queen** (one square in any direction).'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Move', body: 'From the first player, alternately use one of your two cards to move one of your pieces.' },
        { title: 'Rotate', body: 'The used card goes to the waiting space and the card that was there comes to you.' },
        { title: 'Capture', body: 'Ending on an opponent’s piece captures it.' },
        { title: 'Turn around', body: 'A piece reaching the far row turns to face the other way.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Capture every opposing piece**, or **put a piece on the opponent’s castle and hold it for a turn**, to win a set.',
        'Up to three sets; **first to two** is the champion.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Only the Attacker depends on facing, so turning around at the far row changes where it can go.',
        'The Jumper is useless with nothing nearby; beware holding two cards you cannot use.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Card Chess uses the same **card rotation** as Onitama: the card you play goes, via the waiting space, **to your opponent**. Choosing a move means asking what they can do with that card next.' },
      { type: 'cards', items: [
        { title: 'All five cards are visible', body: 'Your two, their two and the waiting one are public, so the opponent’s options are exactly known. With no hidden information it is pure calculation — sometimes you avoid playing a card precisely because they would get it.' },
        { title: 'The initial deal is a real privilege', body: 'The second player deals but moves later; keeping strong cards (Knight, Attacker) and handing out short-range ones seizes early initiative, though rotation soon erodes it.' },
        { title: 'Guarding the castle', body: 'A piece holding your castle for a turn wins, so keep its surroundings capturable within one move. Conversely, enter theirs when they hold no card able to capture there.' },
        { title: 'Jumper and Queen', body: 'The Jumper shines in crowded fights and dies on an empty board; once only two pieces remain it becomes a Queen, favouring whoever holds it for the final duel.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Onitama', players: '2', alike: 'A 5×5 board, five pieces, five movement cards (two each plus one aside), used cards passing to the opponent, and wins by capturing the master or taking their starting square — almost identical.', differs: 'Its sixteen cards show moves as pictures, and there is no facing or Jumper.' },
      { name: 'Chess', players: '2', alike: 'The cards borrow the rook, bishop, knight and queen moves.', differs: 'Each piece has a fixed move and you win by checkmate.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Exactly how "holding the castle for a turn" is judged could not be confirmed.',
  },
};

export default game;
