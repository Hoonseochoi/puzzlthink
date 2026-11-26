import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'tower-of-equations',
  kind: 'prison',
  when: { ko: '5일차', en: 'Day 5' },
  site: 'equationTower',
  related: ['equationTower', 'equationSignal', 'nemoCount'],
  updated: '2026-11-26',
  sources: [namuDay(5), siteEngine({ ko: '수식의 탑', en: 'Tower of Equations' }, 'src/lib/equationTower.ts'), broadcast],
  ko: {
    meta: {
      title: '수식의 탑 규칙 — 데블스플랜3 5일차 감옥매치, 블록을 옮겨 타깃 넘버 만들기',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 5일차 감옥매치 수식의 탑의 규칙을 정리했어요. 타깃 넘버와 목표 층수, 블록 이동과 뒤집기, 버저로 이동 횟수 제시와 더 적게 부르기, ±1·±2 점수, 7점 종료와 연장, 승부를 가르는 지점까지.',
      keywords: ['수식의 탑', '수식의탑', '데블스플랜3 수식의 탑', '데블스플랜3 감옥매치', '데블스 플랜 3 5일차', '수식의 탑 규칙'],
    },
    title: '수식의 탑 — 데블스플랜3 5일차 감옥매치',
    name: '수식의 탑',
    lead: '숫자 블록을 몇 번 만에 옮겨 목표 값의 탑을 쌓을 수 있는지, 남보다 적게 부르고 실제로 해내야 해요.',
    summary: '숫자·기호 블록을 옮기고 뒤집어 목표 층수의 탑으로 타깃 넘버를 만드는, 최소 이동 횟수 버저 경쟁.',
    setup: [
      { type: 'list', items: [
        '**인원**: 다섯째 날 감옥동 3명.',
        '**블록**: 여러 자리에 쌓여 있는 수식 블록. 일부는 기호 없는 숫자 블록이고, 나머지는 기호가 붙은 블록(+3, ×2처럼)이에요. 블록 탑은 라운드가 바뀌어도 그대로 이어져요.',
        '**문제**: 라운드마다 모니터에 **타깃 넘버**(만들 값)와 **목표 층수**(쌓을 높이)가 떠요. 예를 들어 "25, 4층"이면 블록 4개짜리 탑으로 25를 만들라는 뜻이에요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '이동 횟수 제시', body: '문제가 공개되고 5분 안에 버저를 눌러, 몇 번 이동하면 만들 수 있는지를 말해요. 아무도 누르지 않으면 그 문제는 무효가 되고 다음 라운드로 넘어가요.' },
        { title: '더 적게 부르기', body: '누군가 처음 제시하면 5분은 끝나고, 다른 사람들에게 2분이 주어져요. 이때 한 사람에 한 번, 더 적은 횟수를 부를 수 있어요.' },
        { title: '도전', body: '가장 적은 횟수를 부른 사람만 실제로 도전해요. 2분 안에 정확히 그 횟수만큼만 블록을 옮겨 문제를 풀어야 해요.' },
        { title: '이동이란', body: '한 자리에 쌓인 블록을 위에서부터 원하는 만큼 들어 올려 원하는 자리에 내려놓는 것이 1회 이동이에요. 내려놓을 때 들어 올린 묶음을 위아래로 뒤집을 수 있어요.' },
      ] },
      { type: 'h3', text: '탑이 수식이 되는 법' },
      { type: 'list', items: [
        '탑의 **맨 위층은 기호가 없는 숫자 블록**이어야 해요.',
        '수식은 맨 위에서 아래 방향으로 읽어요. 맨 위 숫자에 아래 블록의 연산을 차례로 붙여 나가요.',
        '높이가 목표 층수와 정확히 같아야 해요. 값이 맞아도 층수가 다르면 실패예요.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        '처음 5분 안에 제시한 사람은 성공 +1점, 실패 −1점이에요.',
        '2분 동안 더 적게 불러 도전권을 가져간 사람은 성공 +2점, 실패 −2점이에요.',
        '누군가 **7점에 도달하면** 끝나고, 그때의 **최하위가 탈락**해요. 1위는 피스 3개를 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '끝났을 때 최하위가 동점이면, 누군가 다시 7점을 얻을 때까지 연장전을 해요.',
        '다음 라운드는 지금의 탑 상태를 그대로 둔 채 새 문제로 시작해요. 이번에 쌓은 탑이 다음 문제의 출발점이 돼요.',
        '"더 적게 부르기"는 한 문제에 한 사람당 한 번뿐이에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '수식의 탑은 **계산 문제와 경매가 합쳐진** 게임이에요. 답을 찾는 것만으로는 부족하고, 내가 찾은 이동 횟수가 남보다 적은지, 그리고 그 횟수 안에 실제로 손을 움직여 해낼 수 있는지를 함께 판단해야 해요.' },
      { type: 'cards', items: [
        { title: '꼭대기 숫자부터 정하세요', body: '맨 위는 반드시 기호 없는 숫자여야 하므로, 숫자 블록 중 무엇을 꼭대기로 쓸지가 첫 갈림길이에요. 꼭대기를 정하면 그 아래에 필요한 연산의 순서가 거의 정해지고, 그 블록들이 지금 어디에 묻혀 있는지가 이동 횟수를 정해요.' },
        { title: '뒤집기가 이동을 아껴요', body: '묶음을 통째로 들어 뒤집으면 순서가 거꾸로 되면서 맨 아래 블록이 맨 위로 올라와요. 원하는 숫자 블록이 묶음의 바닥에 있을 때, 한 번의 이동으로 꼭대기에 올릴 수 있어요.' },
        { title: '먼저 부를까, 기다릴까', body: '처음 제시하면 성공해도 +1점이지만, 남이 더 적게 부르면 도전권이 넘어가요. 더 적게 불러 가져가면 +2점이지만 실패하면 −2점이에요. 확실한 최소 횟수를 찾았다면 처음에 불러 도전권을 지키는 게 낫고, 남이 부른 횟수가 최소가 아니라는 확신이 있을 때만 더 적게 불러야 해요.' },
        { title: '탑이 이어지는 효과', body: '탑 상태가 다음 라운드로 이어지므로, 이번 문제를 푼 사람은 다음 문제의 판도 바꿔 놓아요. 도전에 실패한 블록 배치도 그대로 남아, 다음 라운드의 최소 횟수가 달라져요.' },
        { title: '지배 전략이 있을까요?', body: '최소 이동 횟수 자체는 계산으로 정해지는 값이라, 이론상 가장 빨리 정확하게 계산하는 사람이 이겨요. 하지만 시간 압박과 버저 경쟁 때문에, 실전에서는 "충분히 좋은 횟수"를 빨리 부르는 것과 최적 횟수를 찾는 것 사이에서 저울질해야 해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        '방송은 블록 구성과 기호가 어떻게 이어지는지를 모두 공개하지 않았어요. 그래서 PUZZLTHINK 수식의 탑의 **블록 세트와 계산 방식은 사이트가 정한 것**이에요. 사이트에서는 위에서 아래로 읽은 식을 일반 수식처럼 계산해서, ×와 ÷를 +와 −보다 먼저 해요(5, +3, ×2 → 5+3×2 = 11).',
        '블록은 네 자리에 쌓여 있고, 옮기지 않고 제자리에서 뒤집는 것도 1회 이동으로 쳐요.',
        '혼자 연습, 10분 챌린지(랭킹), 친구·공개방 2–4명 버저 대결이 있어요. 버저 대결의 점수(처음 제시 ±1, 더 적게 불러 가져감 ±2)는 방송과 같아요.',
      ] },
    ],
    similar: [
      { name: '하노이의 탑', players: '1명', alike: '쌓인 원판을 정해진 규칙으로 옮겨 목표 모양을 최소 이동 횟수로 만드는 고전 퍼즐이에요.', differs: '하노이의 탑은 한 번에 맨 위 원판 하나만 옮기고, 수식이나 경쟁은 없어요.' },
      { name: '크립토 (Krypto)', players: '1명 이상', alike: '주어진 숫자 카드를 사칙연산으로 묶어 목표 숫자를 만드는 카드 게임이에요.', differs: '크립토는 숫자를 자유롭게 조합하고, 블록을 옮기는 비용이나 층수 제한이 없어요.' },
      { name: '24 게임', players: '1–4명', alike: '숫자 네 개로 24를 만드는 방법을 남보다 빨리 찾는 계산 속도 경쟁이에요.', differs: '24 게임은 답만 찾으면 되고, 최소 횟수를 불러 직접 해내는 단계가 없어요.' },
    ],
    sourceNote: SITE_CHECKED_KO + ' 방송의 블록 구성과 기호 연결 방식은 확인할 수 없어 적지 않았어요.',
  },
  en: {
    meta: {
      title: "Tower of Equations rules — The Devil's Plan 3, day 5 prison match",
      description: "The rules of Tower of Equations from The Devil's Plan: Dead Again (season 3): target number and tower height, moving and flipping blocks, buzzing in a move count and undercutting it, ±1 and ±2 scoring, the end at 7 points, and what decides it.",
      keywords: ['Tower of Equations', "Devil's Plan 3 Tower of Equations", "Devil's Plan prison match", 'Tower of Equations rules'],
    },
    title: "Tower of Equations — The Devil's Plan 3, day 5 prison match",
    name: 'Tower of Equations',
    lead: 'In how few moves can you stack the blocks into a tower worth the target? Call a lower number than everyone else, then do it.',
    summary: 'Move and flip number blocks into a tower of the right height worth the target, bidding the fewest moves on a buzzer.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 3 in prison on day 5.',
        '**Blocks**: stacks of equation blocks; some are plain numbers, the rest carry a sign (+3, ×2 …). The stacks carry over from round to round.',
        '**The problem**: each round a screen shows a **target number** and a **tower height**; "25, 4 floors" means build a four-block tower worth 25.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Call a move count', body: 'Within five minutes, buzz and say in how many moves you can do it. If nobody buzzes, the problem is void and the next round starts.' },
        { title: 'Undercut', body: 'After the first call the five minutes end and the others get two minutes, in which each may once call a lower count.' },
        { title: 'Attempt', body: 'Only the lowest caller attempts it, and must solve it within two minutes using exactly that many moves.' },
        { title: 'What a move is', body: 'Lift any number of blocks off the top of one stack and set them down on any stack — one move. You may turn the lifted bundle upside down as you set it down.' },
      ] },
      { type: 'h3', text: 'How a tower reads' },
      { type: 'list', items: [
        'The **top block must be a plain number**.',
        'The equation reads from the top down: each block below applies its operation in turn.',
        'The height must equal the target height exactly; the right value at the wrong height fails.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        'A first caller in the five minutes scores +1 for success and −1 for failure.',
        'A player who undercut in the two minutes scores +2 or −2.',
        'When someone **reaches 7 points**, the game ends and **the last place is eliminated**. First place gets 3 pieces.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'If last place is tied at the end, play continues until someone reaches 7 again.',
        'Each new round starts from the current stacks, so today’s tower is the next problem’s starting point.',
        'Each player may undercut only once per problem.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Tower of Equations is **a calculation puzzle fused with an auction**. Finding a solution is not enough: you must judge whether your move count beats everyone else’s and whether your hands can deliver it in time.' },
      { type: 'cards', items: [
        { title: 'Choose the top number first', body: 'The top must be a plain number, so which one to use is the first fork. Once chosen, the operations needed below it are almost fixed, and where those blocks are buried sets the move count.' },
        { title: 'Flipping saves moves', body: 'Lifting a bundle and turning it over reverses it, bringing the bottom block to the top — one move to lift a buried number to the summit.' },
        { title: 'Call first or wait?', body: 'A first call is worth only +1 and can be undercut; undercutting is worth +2 but costs 2 on failure. With a sure minimum, call it first and keep the attempt; undercut only when you are confident the call on the table is not the minimum.' },
        { title: 'The carry-over', body: 'Since the stacks carry over, solving one problem reshapes the next, and a failed attempt’s layout stays too, changing the next minimum.' },
        { title: 'Is there a dominant strategy?', body: 'The minimum number of moves is a calculable fact, so in theory the fastest accurate calculator wins. Under time pressure and buzzer racing, though, you weigh calling a good-enough count quickly against finding the optimum.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'The show did not publish its full block set or how signs chain, so **PUZZLTHINK’s block set and evaluation are the site’s own choice**. The site reads the tower top-down as an ordinary formula, × and ÷ before + and − (5, +3, ×2 → 5+3×2 = 11).',
        'Blocks stand in four stacks, and turning a bundle over in place also counts as a move.',
        'There is solo practice, a 10-minute challenge with a ranking, and buzzer matches for 2–4 friends or open rooms with the show’s scoring (first call ±1, undercut ±2).',
      ] },
    ],
    similar: [
      { name: 'Tower of Hanoi', players: '1', alike: 'Move stacked discs by fixed rules to reach a target in the fewest moves.', differs: 'Only the top disc moves at a time, and there is no arithmetic or competition.' },
      { name: 'Krypto', players: '1+', alike: 'Combine number cards with arithmetic to hit a target number.', differs: 'Numbers combine freely, with no moving cost or height limit.' },
      { name: '24 Game', players: '1–4', alike: 'Race to make 24 from four numbers.', differs: 'You only need an answer; there is no calling a move count and carrying it out.' },
    ],
    sourceNote: SITE_CHECKED_EN + ' The show’s block set and how its signs chain could not be verified and are not described.',
  },
};

export default game;
