import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'gradation',
  kind: 'prison',
  when: { ko: '6일차 (준결승)', en: 'Day 6 (semifinal)' },
  site: 'gradation',
  related: ['gradation', 'blackWhite', 'blackWhite2'],
  updated: '2026-11-26',
  sources: [namuDay(6), siteEngine({ ko: '그라데이션', en: 'Gradation' }, 'src/lib/gradation.ts'), broadcast],
  ko: {
    meta: {
      title: '그라데이션 규칙 — 데블스플랜3 6일차 마지막 감옥매치, 큐브 통 7개 숫자 대결',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 마지막 감옥매치 그라데이션의 규칙을 정리했어요. 그라데이션 큐브 통 7개와 0–9 숫자 큐브 20개, 오름차순·합 30 이하 배치, 색깔만 보이는 7라운드 대결, 2연승 방식, 승부를 가르는 지점까지.',
      keywords: ['그라데이션', '데블스플랜3 그라데이션', '데블스플랜3 감옥매치', '데블스 플랜 3 6일차', '그라데이션 게임 규칙', '그라데이션 규칙'],
    },
    title: '그라데이션 — 데블스플랜3 마지막 감옥매치',
    name: '그라데이션',
    lead: '양 끝은 어둡고 가운데는 밝은 큐브 통 7개. 상대에게 보이는 건 통의 색깔뿐이에요. 숫자를 미리 나눠 담고, 한 통씩 맞붙어요.',
    summary: '오름차순으로 나눠 담은 숫자 큐브를 색깔만 보이게 내며 1:1로 겨루는 일곱 판 대결. 2연승하면 결승.',
    setup: [
      { type: 'list', items: [
        '**인원**: 여섯째 날 감옥동 3명. 대결은 늘 1:1이고, 첫 대결의 두 사람과 선 플레이어는 추첨으로 정해요.',
        '**큐브 통 7개**: 왼쪽부터 오른쪽으로 놓이고, 양 끝이 가장 어둡고 가운데로 갈수록 밝아져요. 그래서 1번과 7번, 2번과 6번, 3번과 5번 통은 색이 같고, 4번 통만 가장 밝아요.',
        '**숫자 큐브 20개**: 0부터 9까지 두 개씩.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '비밀 배치 (5분)', body: '큐브 통 7개에 숫자 큐브를 하나씩 몰래 넣어요. 왼쪽에서 오른쪽으로 갈수록 숫자가 **작아지면 안 되고**, 일곱 개의 합은 **30 이하**여야 해요.' },
        { title: '선이 통을 내요', body: '선 플레이어가 큐브 통 하나를 내고, 상대도 자기 통 하나를 내요. 상대에게는 그 통이 원래 몇 번째였는지는 보이지 않고 **색깔만** 보여요.' },
        { title: '공개', body: '두 통의 숫자를 공개해 더 큰 쪽이 그 라운드를 이기고 승점 1점을 얻어요.' },
        { title: '다음 라운드', body: '이긴 사람이 다음 라운드의 선이 돼요. 비기면 승점도 선도 그대로예요.' },
      ] },
      { type: 'p', text: '이렇게 7라운드를 해서 승점이 높은 쪽이 그 대결의 1승을 가져가요.' },
    ],
    win: [
      { type: 'list', items: [
        '대결에서 이긴 사람은 기다리던 남은 한 명과 다시 1:1로 붙어요. 직전 대결의 승자가 새 대결 1라운드의 선이에요.',
        '이렇게 이어 가다가 **2연승을 거둔 사람이 결승에 진출**하고, 남은 두 사람은 탈락해요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '7라운드 뒤 승점이 같으면 승부가 날 때까지 재대결해요.',
        '같은 숫자 큐브가 두 개씩이라, 이웃한 통에 같은 숫자를 넣을 수 있어요(작아지지만 않으면 돼요).',
        '합이 30을 넘거나 순서가 어긋나게 넣을 수는 없어요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '그라데이션의 정보는 **색깔 하나**예요. 그런데 이 색깔이 생각보다 많은 걸 알려 줘요. 숫자는 왼쪽에서 오른쪽으로 커지기만 하니, 가장 어두운 통은 그 사람의 **가장 작은 수이거나 가장 큰 수**이고, 가장 밝은 통은 정확히 가운데 값이에요.' },
      { type: 'cards', items: [
        { title: '합 30이라는 예산', body: '일곱 칸의 합이 30 이하라서 평균은 4가 조금 넘어요. 큰 수를 몇 개 쓰면 나머지는 0이나 1로 채워야 해요. 그래서 "몇 판을 확실히 이기고 몇 판을 버릴지"를 배치 단계에서 미리 정하게 돼요. 7판 중 4판만 이기면 되니, 큰 수 4개와 0 세 개 같은 극단적인 배치도 가능해요.' },
        { title: '어두운 통의 두 얼굴', body: '어두운 통은 1번(가장 작은 수)일 수도, 7번(가장 큰 수)일 수도 있어요. 상대가 어두운 통을 내면 그게 0인지 9인지 모르는 거예요. 반대로 내가 어두운 통을 낼 때는 이 모호함을 이용할 수 있어요. 큰 수로 이기러 온 것처럼 보이게 하거나, 버리는 판에 작은 수를 내면서 상대의 큰 수를 끌어낼 수 있어요.' },
        { title: '선이 불리할 수도 있어요', body: '선은 먼저 통을 내야 해서 정보를 먼저 주는 쪽이에요. 뒤에 내는 사람은 선이 낸 색깔을 보고 고를 수 있어요. 라운드를 이기면 선을 맡게 되니, 이긴 사람이 다음 라운드에서 정보를 먼저 내놓는 구조예요.' },
        { title: '쓴 통을 추적하세요', body: '한 번 낸 통은 다시 못 써요. 공개된 숫자와 색깔을 맞춰 보면, 상대의 남은 통들이 어느 범위에 있을지 점점 좁혀져요. 예를 들어 상대가 어두운 통에서 0을 냈다면, 남은 어두운 통은 그 사람의 가장 큰 수예요.' },
        { title: '지배 전략은 없어요', body: '배치도, 내는 순서도 상대의 선택에 따라 최선이 달라지는 동시 결정 게임이라 늘 이기는 배치는 없어요. 게임 이론에서 자원을 여러 전장에 나눠 싸우는 "블로토 게임"과 닮아서, 너무 고르게 나누는 것도, 너무 한쪽에 몰아넣는 것도 읽히면 약해져요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 그라데이션은 방송 규칙(통 7개와 색 배치, 0–9 큐브 두 개씩, 작아지지 않는 순서, 합 30 이하, 색깔만 보이는 7라운드, 승자가 선)을 그대로 따라요. 통의 색은 어두움·회색·밝음·흰색 네 단계로 보여 줘요.',
        '방송의 3인 2연승 방식 대신 **AI와의 1:1 한 경기**예요. 7라운드 뒤 비기면 새로 다시 하고, 재대결이 정해진 횟수를 넘으면 무승부로 끝나요.',
        'AI는 상대의 숫자를 보지 않고, 지금까지 본 색깔과 공개된 숫자에 맞는 배치를 모두 따져 수를 골라요.',
      ] },
    ],
    similar: [
      { name: '배틀 라인 (Battle Line)', players: '2명', alike: '한정된 카드를 여러 개의 따로 떨어진 승부처에 나눠 쓰고, 승부처의 과반을 가져가야 이기는 구조가 그라데이션의 일곱 판과 같아요.', differs: '배틀 라인은 깃발 9개 앞에 카드 세 장씩 포커처럼 조합을 만들고, 카드를 공개로 내요.' },
      { name: '스트라테고 (Stratego)', players: '2명', alike: '숨겨진 계급의 말을 미리 배치하고, 맞붙을 때 공개해 높은 쪽이 이겨요.', differs: '스트라테고는 판 위에서 말을 움직이는 전쟁 게임이고, 깃발을 잡으면 이겨요.' },
      { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '모두 1–15 카드를 한 번씩만 쓰며 동시에 내고, 큰 수를 낸 사람이 이기는 한정 자원 대결이에요.', differs: '하이에나는 미리 배치하는 순서 제한이 없고, 걸려 있는 점수 카드가 매번 달라요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Gradation rules — The Devil's Plan 3, day 6 final prison match",
      description: "The rules of Gradation, the last prison match of The Devil's Plan: Dead Again (season 3): seven shaded cups and twenty 0–9 cubes, a non-decreasing row worth at most 30, seven rounds where only the shade shows, the two-wins-in-a-row format, and what decides it.",
      keywords: ['Gradation', "Devil's Plan 3 Gradation", "Devil's Plan prison match", 'Gradation game rules'],
    },
    title: "Gradation — The Devil's Plan 3, final prison match",
    name: 'Gradation',
    lead: 'Seven cups, dark at both ends and light in the middle. Your opponent sees only the shade. Fill them in advance, then play them one by one.',
    summary: 'Play number cubes hidden in shaded cups, one at a time, in seven-round 1:1 duels; two wins in a row reaches the final.',
    setup: [
      { type: 'list', items: [
        '**Players**: the 3 in prison on day 6. Every duel is 1:1; the first pair and first player are drawn.',
        '**Seven cups**: set left to right, darkest at both ends and lighter toward the middle — cups 1 and 7, 2 and 6, 3 and 5 share a shade; only cup 4 is the lightest.',
        '**Twenty number cubes**: two of each number from 0 to 9.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Secret setup (5 minutes)', body: 'Put one cube in each cup, secretly. From left to right the numbers must **never go down**, and the seven must add up to **at most 30**.' },
        { title: 'The lead plays a cup', body: 'The first player hands in a cup, then the opponent hands in one. The other side sees **only its shade**, never where it stood.' },
        { title: 'Reveal', body: 'Both cubes are shown; the higher number wins the round and a point.' },
        { title: 'Next round', body: 'The winner leads the next round. On a tie, points and lead stay as they were.' },
      ] },
      { type: 'p', text: 'After seven rounds the higher score takes the duel.' },
    ],
    win: [
      { type: 'list', items: [
        'The duel’s winner then plays the waiting third player; the previous winner leads round 1 of the new duel.',
        '**The first to win two duels in a row reaches the final**, and the other two are eliminated.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'A duel tied after seven rounds is replayed until someone wins.',
        'With two cubes of each number, neighbouring cups may hold the same number (as long as it never goes down).',
        'A row over 30 or out of order is not allowed.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'All you see is **a shade**, yet it says a lot. Since numbers only rise from left to right, a darkest cup is the player’s **smallest or largest number**, and the lightest cup is exactly their middle value.' },
      { type: 'cards', items: [
        { title: 'A budget of 30', body: 'Seven numbers totalling 30 or less average just over four. A few big numbers force the rest down to 0 or 1, so the setup is really a decision about which rounds to win and which to give away. Four wins out of seven is enough, so even four big numbers and three zeros is possible.' },
        { title: 'The two faces of a dark cup', body: 'A dark cup could be cup 1 (the smallest) or cup 7 (the largest), so a dark cup from your opponent might be 0 or 9. Played by you, that ambiguity is a tool: look like you are going for a win, or throw away a round with a small number to draw out their big one.' },
        { title: 'Leading can be a handicap', body: 'The lead plays first and gives information first; the reply can choose after seeing the shade. Winning a round makes you lead the next, so the winner is the one who must reveal first.' },
        { title: 'Track the used cups', body: 'A cup is used once. Matching revealed numbers to shades narrows down the opponent’s remaining cups: a dark cup that showed 0 means the other dark cup is their largest.' },
        { title: 'No dominant strategy', body: 'Both setup and play order are simultaneous decisions whose best answer depends on the opponent, so no setup always wins. It resembles the Colonel Blotto game of splitting resources across battlefields: an even split and an all-in split both lose once read.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK’s Gradation follows the broadcast rules: seven shaded cups, two cubes per number, a non-decreasing row of at most 30, seven rounds showing only shades, the winner leading. Shades are shown as dark, grey, light and white.',
        'Instead of the show’s three-player two-in-a-row format, it is **a single 1:1 match against the AI**. A tie after seven rounds is replayed, and after a set number of replays it ends as a draw.',
        'The AI never sees your numbers; it weighs every row consistent with the shades and numbers it has seen.',
      ] },
    ],
    similar: [
      { name: 'Battle Line', players: '2', alike: 'Spread limited cards across many separate contests and win a majority of them, like Gradation’s seven rounds.', differs: 'You build poker-like three-card formations at nine flags, and cards are played face up.' },
      { name: 'Stratego', players: '2', alike: 'Pieces of hidden rank are set up in advance and revealed when they meet; the higher wins.', differs: 'It is a war game of moving pieces across a board, won by capturing the flag.' },
      { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'Everyone plays cards 1–15 once each, simultaneously, and the highest wins — a duel of limited resources.', differs: 'There is no ordered setup, and the prize changes every round.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
