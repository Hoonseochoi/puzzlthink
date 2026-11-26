import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'either-or',
  kind: 'main',
  when: { ko: '1일차', en: 'Day 1' },
  related: ['nemoCount', 'indianPoker', 'hitStay'],
  updated: '2026-11-26',
  sources: [namuDay(1), broadcast],
  ko: {
    meta: {
      title: '양자택일 규칙 — 데블스플랜3 1일차 메인매치 (선택 10개·미니게임 4개) 정리',
      description: '데블스 플랜: 데드 어게인(데블스플랜3) 첫 메인매치 양자택일의 규칙을 정리했어요. 10번의 양자택일과 큐브 세기·네모 세기·잔디 깔기·기억 포커 네 미니게임, 승점과 순위, 탈락 방식, 그리고 승부를 가르는 지점까지.',
      keywords: ['양자택일', '데블스플랜3 양자택일', '데블스 플랜 3 1일차', '데블스플랜3 메인매치', '데블스 플랜 데드 어게인 양자택일', '큐브 세기', '잔디 깔기', '기억 포커'],
    },
    title: '양자택일 — 데블스플랜3 첫 메인매치',
    name: '양자택일',
    lead: '둘 중 하나를 고르는 일을 열 번, 그 사이에 미니게임 네 판. 승점을 쌓아 순위를 지키는 16인 메인매치예요.',
    summary: '선택 10번과 미니게임 4판으로 승점을 모으는 16인 게임. 내용은 진행하면서 하나씩 공개돼요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 첫날 참가자 16명 전원.',
        '**준비물**: 한 사람에 하나씩 주어지는 단말기(선택을 입력하는 용도), 누적 승점을 보여 주는 전광판, 미니게임마다 쓰는 도구(큐브 문제, 숫자 판, 잔디 타일과 공원 판, 트럼프 카드).',
        '**구성**: 선택 10번과 미니게임 4판이 정해진 순서대로 섞여 있어요. 어떤 선택지와 미니게임이 나올지는 미리 알려 주지 않고, 차례가 오면 하나씩 공개돼요.',
      ] },
      { type: 'table', head: ['순서', '내용'], rows: [
        ['선택 1', '양자택일'],
        ['미니게임 1', '큐브 세기'],
        ['미니게임 2 · 선택 2–3', '네모 세기 (팀/개인 선택, 팀 안 보상 배분)'],
        ['선택 4', '양자택일'],
        ['미니게임 3 · 선택 5–8', '잔디 깔기'],
        ['선택 9', '양자택일 (탈락 인원)'],
        ['미니게임 4 · 선택 10', '기억 포커 (대결 방식)'],
      ], caption: '방송에서 진행된 순서' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '선택지가 공개돼요', body: '두 개의 선택지가 화면에 뜨고, 각자 단말기로 하나를 골라요. 선택지는 승점, 피스, 정보, 다음 게임의 방식처럼 매번 걸려 있는 것이 달라요. 예를 들어 "생활동에 가면 피스 1개" 대 "감옥동에 가면 피스 2개"처럼 자기 결과를 미리 예측해야 하는 선택이 있고, "9명 이상이 고르면 모두를 위한 상금의 징표" 대 "고른 사람만 승점 5점"처럼 다른 사람의 선택에 따라 보상이 바뀌는 선택도 있어요.' },
        { title: '승점이 바뀔 때마다 전원 공개', body: '선택이나 미니게임으로 누군가의 승점이 바뀌면 16명 모두의 누적 승점이 곧바로 공개돼요. 그래서 지금 몇 등인지, 누가 탈락권인지를 모두가 보면서 다음 선택을 해요.' },
        { title: '미니게임 1 — 큐브 세기', body: '쌓인 큐브 그림을 보고 개수를 단말기에 입력해요. 틀리면 20초 동안 답을 낼 수 없어요. 15명이 맞히면 끝나고, 맞힌 순서가 **우선권 순위**가 돼요. 이 순위는 이후 게임에서 동점이 나왔을 때 누가 앞서는지를 정해요.' },
        { title: '미니게임 2 — 네모 세기', body: '숫자 판에서 합이 목표 숫자가 되는 직사각형 개수를 버저로 맞히는 게임이에요. 시작 전에 3인 팀으로 할지 개인으로 할지를 선택하고, 끝난 뒤에는 팀 안에서 보상을 어떻게 나눌지를 또 선택해요. 자세한 규칙은 네모 세기 페이지에 따로 정리했어요.' },
        { title: '미니게임 3 — 잔디 깔기', body: '114칸짜리 공원 판에 각자 잔디 타일 하나를 놓아요. 타일은 3·4·6·7·9·11·13번 일곱 종류이고 번호가 클수록 많은 칸을 차지해요. 승점이 낮은 사람부터 타일을 공개로 고르고(같은 타일을 여럿이 골라도 돼요), 놓는 순서는 번호가 작은 타일부터예요. 돌려 놓을 수는 있지만 뒤집을 수는 없고, 판 밖으로 나가면 안 돼요. 놓는 데 성공하면 타일 번호만큼 승점을 받아요.' },
        { title: '미니게임 4 — 기억 포커', body: '트럼프 52장 중 16장이 20초 동안 공개됐다가 가려지고, 이어서 공유 카드 3장이 공개돼요. 두 사람은 기억해 둔 16장 가운데 두 장을 골라 공유 카드와 함께 가장 센 홀덤 족보를 만들어요. 문양은 비교하지 않아요. 이 미니게임은 15·16위가 위 순위와 1:1로 붙는 연승전이에요.' },
      ] },
      { type: 'h3', text: '마지막 기억 포커는 이렇게 진행돼요' },
      { type: 'list', items: [
        '기억 포커부터는 승점이 아니라 **순위**만으로 탈락이 정해져요. 15위와 16위가 "탈락 후보"가 되어 차례로 도전해요.',
        '대결 방식은 선택 10에서 정해요. **지목 방식**(8명 이상 선택 시)은 후보가 자기보다 위의 아무나 지목해 붙고, 지목당해 이긴 사람은 피스 1개를 받아요. 같은 사람을 두 번 지목할 수는 없어요. **계단 방식**(9명 이상 선택 시)은 바로 위 순위와만 붙어요.',
        '후보가 이기면 한 계단 올라가고, 진 상대는 한 계단 내려가요. 후보가 지면 그 사람의 도전이 끝나요.',
        '대결 결과로 새로 15·16위가 된 사람이 생기면 그 사람이 다음 도전자가 돼요. 이미 후보였다가 올라갔다 다시 내려온 사람은 새 도전자로 치지 않아요. 새 도전자가 더 나오지 않으면 게임이 끝나요.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        '모든 선택과 미니게임이 끝났을 때의 순위로 결과가 정해져요.',
        '**1–6위는 생활동, 7–14위는 감옥동**으로 가고, **최하위 2명은 탈락**해요.',
        '**1위는 연맹의 징표**를 받아요. 감옥동으로 갈 예정인 사람 한 명을 생활동으로 데려올 수 있는 징표예요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '선택 9는 탈락 인원 자체를 걸어요. 참가자들이 **피스를 모두 합쳐 8개** 내면 이번 탈락자가 최하위 1명으로 줄고, 그렇지 않으면 2명 그대로예요.',
        '동점은 큐브 세기에서 정한 우선권 순위로 가려요(잔디 깔기의 선택 순서와 놓는 순서에서도 같은 기준을 써요).',
        '"공공의 이익"처럼 인원 기준이 있는 선택은 기준을 정확히 넘어야 해요. 16명 중 9명 이상이 필요한 선택은 8 대 8이면 실패예요.',
        '선택 결과는 단말기로 따로 입력하므로, 말로 무엇을 골랐다고 해도 실제 입력과 다를 수 있어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '양자택일은 개별 미니게임 실력보다 **"남들이 무엇을 고를지 읽는 능력"**을 시험해요. 열 번의 선택 가운데 상당수가 다른 사람의 선택에 따라 보상이 달라지는 구조라서, 같은 선택지라도 내가 지금 몇 등인지에 따라 정답이 바뀌어요.' },
      { type: 'cards', items: [
        { title: '공공재 선택에는 지배 전략이 없어요', body: '"9명 이상이 고르면 모두가 이득, 고르지 않은 사람만 따로 이득"인 선택은 전형적인 공공재 게임이에요. 결과가 나 한 사람에게 달려 있지 않다면 개인의 이익을 고르는 쪽이 늘 승점이 높아요. 그런데 모두가 그렇게 생각하면 공공의 이익은 실패해요. 결국 **내 한 표가 결정적일 확률**을 따져야 하고, 그 확률은 다른 사람의 말이 얼마나 믿을 만한지에 달려 있어요.' },
        { title: '상위권과 하위권의 정답이 달라요', body: '승점 5점은 탈락권에 있는 사람에게는 생존이 걸린 점수지만, 여유 있는 상위권에게는 1위 자리(연맹의 징표)가 걸린 점수예요. 같은 선택지라도 순위에 따라 기대 가치가 달라서, 남의 선택을 예측할 때는 그 사람의 현재 순위부터 봐야 해요.' },
        { title: '정보와 점수의 교환', body: '"승점 5점" 대 "다음 선택지 미리 보기"처럼 정보를 사는 선택은, 정보가 뒤의 미니게임이나 선택에서 5점 넘게 바꿀 수 있을 때만 가치가 있어요. 정보를 산 사람이 그 정보를 다른 사람과 나눌 수 있다는 점까지 생각하면, 정보는 혼자 쓰기보다 연합을 만드는 재료가 돼요.' },
        { title: '잔디 깔기는 순서 싸움', body: '큰 타일일수록 점수가 높지만 놓는 순서가 늦어요. 작은 타일을 고른 사람들이 먼저 판을 채우기 때문에, 큰 타일은 들어갈 자리가 남아 있을지가 관건이에요. 앞 사람이 어디에 놓을지에 따라 내 타일이 못 들어갈 수도 있어서, 승점이 낮아 먼저 고르는 사람도 무조건 큰 타일이 유리하지는 않아요.' },
        { title: '기억 포커는 순위가 낮을수록 기회가 많아요', body: '탈락 후보는 이기는 만큼 올라갈 수 있어서, 마지막 미니게임 한 판이 앞선 승점 차이를 뒤집을 수 있어요. 지목 방식은 후보가 약해 보이는 상대를 고를 수 있어 후보에게 유리하고, 계단 방식은 바로 위 순위만 위험해요. 선택 10에서 각자 어느 쪽을 고를지는 자기가 지목당할 가능성이 얼마나 되는지로 정해져요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '블로커스 (Blokus)', players: '2–4명', alike: '여러 모양의 폴리오미노 조각을 판 위에 돌려 가며 빈틈없이 놓아야 해서, 잔디 깔기의 "내 조각이 들어갈 자리가 남을까" 계산과 같아요.', differs: '블로커스는 같은 색 조각끼리 꼭짓점으로만 이어 가며 여러 번 놓고, 남은 칸 수로 승패를 가려요. 잔디 깔기는 한 사람이 한 조각만 놓아요.' },
      { name: '패치워크 (Patchwork)', players: '2명', alike: '조각 크기와 점수, 놓을 공간 사이의 교환을 따지는 폴리오미노 배치 게임이에요.', differs: '패치워크는 단추(돈)와 시간 트랙으로 조각을 사고, 각자 자기 판을 채워요. 남과 같은 판을 나눠 쓰지는 않아요.' },
      { name: '텍사스 홀덤 포커', players: '2–10명', alike: '공유 카드와 손에 든 카드를 합쳐 족보를 만드는 기억 포커의 바탕 규칙이에요.', differs: '홀덤은 카드를 외울 필요 없이 받은 카드를 보고 베팅으로 겨루고, 기억 포커는 베팅 없이 기억해 둔 카드 중에서 골라 족보만 비교해요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 선택지 문구와 각 선택의 결과는 일부만 예시로 적었어요.',
  },
  en: {
    meta: {
      title: "Either Or rules — The Devil's Plan 3, day 1 main match (10 choices, 4 mini-games)",
      description: "The rules of Either Or, the first main match of The Devil's Plan: Dead Again (season 3): ten two-way choices, four mini-games (Count the Cubes, Count the Rectangles, Lay the Grass, Memory Poker), scoring, elimination and what decides it.",
      keywords: ['Either Or', "The Devil's Plan 3 Either Or", "Devil's Plan Dead Again day 1", "Devil's Plan main match", 'Memory Poker', 'Lay the Grass'],
    },
    title: "Either Or — The Devil's Plan 3, first main match",
    name: 'Either Or',
    lead: 'Ten choices between two options, four mini-games in between: a 16-player main match about banking points and holding your rank.',
    summary: 'Sixteen players collect points through ten choices and four mini-games, each revealed only when its turn comes.',
    setup: [
      { type: 'list', items: [
        '**Players**: all 16 contestants of day 1.',
        '**Components**: a personal terminal each (to enter choices), a board showing everyone’s running score, and each mini-game’s own kit (cube puzzles, number boards, grass tiles and a park board, playing cards).',
        '**Structure**: ten choices and four mini-games in a fixed order. None of them is announced in advance; each is revealed when its turn comes.',
      ] },
      { type: 'table', head: ['Order', 'What happens'], rows: [
        ['Choice 1', 'Two-way choice'],
        ['Mini-game 1', 'Count the Cubes'],
        ['Mini-game 2 · choices 2–3', 'Count the Rectangles (team or solo, then sharing a team’s reward)'],
        ['Choice 4', 'Two-way choice'],
        ['Mini-game 3 · choices 5–8', 'Lay the Grass'],
        ['Choice 9', 'Two-way choice (how many are eliminated)'],
        ['Mini-game 4 · choice 10', 'Memory Poker (how the duels are paired)'],
      ], caption: 'The order on the show' },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'A choice is revealed', body: 'Two options appear and everyone picks one on their terminal. What is at stake changes every time: points, pieces, information, or how a later game is played. Some ask you to predict your own result ("1 piece if you end up in the living quarters" against "2 pieces if you end up in prison"); others pay out depending on what everyone else picks ("if 9 or more choose this, everyone gets a prize token" against "5 points for each player who chooses this").' },
        { title: 'Every score change is shown to all', body: 'Whenever a choice or mini-game changes anyone’s points, all sixteen running totals are shown at once, so everyone knows who is in danger before the next choice.' },
        { title: 'Mini-game 1 — Count the Cubes', body: 'Count the cubes in a stacked picture and type the number. A wrong answer locks you out for 20 seconds. It ends when 15 players have answered, and the order of correct answers becomes the **priority ranking** that breaks ties for the rest of the match.' },
        { title: 'Mini-game 2 — Count the Rectangles', body: 'Buzz in with how many rectangles on a number board add up to the target. Before it starts, players choose to play in teams of three or alone; afterwards, teams choose how to share the reward. It has its own page.' },
        { title: 'Mini-game 3 — Lay the Grass', body: 'Each player lays one grass tile on a 114-cell park board. There are seven tiles, numbered 3, 4, 6, 7, 9, 11 and 13; a bigger number covers more cells. Lowest score picks first, openly (several players may pick the same tile), and tiles are placed smallest number first. Tiles may be rotated but not flipped and must stay on the board. A tile that fits scores its number.' },
        { title: 'Mini-game 4 — Memory Poker', body: '16 of the 52 cards are shown for 20 seconds and hidden, then three shared cards are revealed. Each of the two players picks two of the memorised sixteen to make the best hold’em hand with the shared cards; suits are not compared. It is played as a winner-stays ladder from the bottom of the table.' },
      ] },
      { type: 'h3', text: 'How the Memory Poker ladder works' },
      { type: 'list', items: [
        'From here on only **rank** decides elimination, not points. Places 15 and 16 become the "candidates" and challenge in turn.',
        'Choice 10 decides the pairing. **Nomination** (if 8 or more pick it): a candidate challenges anyone ranked above them, never the same player twice, and a nominated player who wins gets a piece. **Ladder** (if 9 or more pick it): a candidate only plays the player directly above.',
        'A winning candidate moves up one place and the loser moves down one. A losing candidate’s run ends.',
        'Anyone newly pushed into 15th or 16th challenges next; a former candidate who climbed and fell back does not count as new. When no new candidate appears, the match ends.',
      ] },
    ],
    win: [
      { type: 'list', items: [
        'The final ranking after every choice and mini-game decides the result.',
        '**Places 1–6 go to the living quarters, 7–14 to prison**, and the **bottom two are eliminated**.',
        '**First place gets the Alliance token**, which brings one player bound for prison up to the living quarters.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Choice 9 puts the number of eliminations itself at stake: if the players hand in **8 pieces between them**, only the last-placed player is eliminated instead of two.',
        'Ties are broken by the priority ranking from Count the Cubes (also used for picking and placing order in Lay the Grass).',
        'A choice with a head-count threshold must actually reach it: needing 9 of 16 means an 8–8 split fails.',
        'Choices are entered privately on the terminal, so what a player says they picked may not be what they entered.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Either Or tests **reading what the others will choose** more than skill at any one mini-game. Many of the ten choices pay out according to everyone else’s choices, so the right answer to the same option depends on where you stand in the ranking.' },
      { type: 'cards', items: [
        { title: 'No dominant strategy in the public-good choice', body: 'An option that pays everyone if 9 choose it, against one that pays only those who choose it, is a classic public-goods game. If the outcome does not hinge on you, the selfish option always scores more; if everyone reasons that way, the public good fails. What matters is the chance that **your vote is the deciding one**, and that depends on how far you trust what others say.' },
        { title: 'Top and bottom want different things', body: 'Five points mean survival to someone near the cut and first place (the Alliance token) to someone near the top. The same option has a different value at different ranks, so predicting someone’s choice starts with their current place.' },
        { title: 'Trading points for information', body: 'Buying a preview instead of points is only worth it if the preview can swing more than five points later. Since information can be shared, it is better used to build an alliance than kept to yourself.' },
        { title: 'Lay the Grass is about order', body: 'Bigger tiles score more but are placed later, after the small tiles have filled the board. Whether a big tile still fits depends on where earlier players put theirs, so even the low scorer who picks first is not automatically better off taking the biggest tile.' },
        { title: 'Memory Poker favours the bottom', body: 'A candidate can climb with every win, so the last mini-game can undo a large points gap. Nomination lets candidates pick weak-looking opponents; the ladder only endangers the player directly above. Which pairing each player votes for comes down to how likely they are to be nominated.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Blokus', players: '2–4', alike: 'Rotating polyomino pieces to fit them on a shared board, like Lay the Grass asking whether your tile will still fit.', differs: 'In Blokus you place many pieces, touching your own colour only at the corners, and score by squares left over. In Lay the Grass each player places one tile.' },
      { name: 'Patchwork', players: '2', alike: 'A polyomino game about trading piece size and points against space.', differs: 'Pieces are bought with buttons and time, and each player fills their own board rather than a shared one.' },
      { name: "Texas hold'em poker", players: '2–10', alike: 'Memory Poker uses its hand rankings: two of your cards plus the shared cards.', differs: 'Hold’em is about betting on cards you can see; Memory Poker has no betting and you choose from cards you had to memorise.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Only some of the choices are given, as examples.',
  },
};

export default game;
