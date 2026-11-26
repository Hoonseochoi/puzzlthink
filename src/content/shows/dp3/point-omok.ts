import type { ShowGame } from '../types';
import { broadcast, namuExile, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'point-omok',
  kind: 'exile',
  when: { ko: '6일차 (유배지 최종전)', en: 'Day 6 (exile final)' },
  site: 'pointOmok',
  related: ['pointOmok', 'blackWhite2', 'blindGomoku'],
  updated: '2026-11-26',
  sources: [namuExile, siteEngine({ ko: '포인트 오목', en: 'Point Omok' }, 'src/lib/pointOmok.ts'), broadcast],
  ko: {
    meta: {
      title: '포인트 오목 규칙 — 데블스플랜3 유배지 최종전, 포인트를 걸어 두는 오목',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 유배지 마지막 대결로 나온 포인트 오목의 규칙을 정리했어요. 세 점 고르기, 10포인트 비밀 분배, 이월, 동점 처리, 오목 판정과 승부를 가르는 지점, PUZZLTHINK에서 바로 두기까지.',
      keywords: ['포인트 오목', '포인트오목', '데블스플랜3 포인트 오목', '데블스플랜3 유배지', '데블스 플랜 3 유배지 최종전', '포인트 오목 규칙', '베팅 오목'],
    },
    title: '포인트 오목 — 데블스플랜3 유배지 최종전',
    name: '포인트 오목',
    lead: '돌을 그냥 놓지 않아요. 고른 세 점에 포인트를 몰래 나눠 걸고, 더 많이 건 사람의 돌이 그 자리에 놓여요.',
    summary: '세 점을 고르고 포인트를 몰래 나눠 걸어, 더 많이 건 쪽의 돌로 오목을 만드는 1:1 대결. 유배지의 마지막 승부.',
    setup: [
      { type: 'list', items: [
        '**인원**: 1:1. 시즌 3에서는 유배지에 끝까지 남은 두 사람이 게임으로 돌아갈 표 한 장을 두고 겨뤘어요.',
        '**판**: 오목판(PUZZLTHINK는 15×15).',
        '**포인트**: 라운드마다 각자 새로 받는 포인트(PUZZLTHINK는 10포인트)와 지난 라운드에서 넘어온 포인트.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '세 점 고르기', body: '그 라운드의 선택자가 판 위에서 한 줄로 붙어 있는 빈 점 세 개를 골라요. 가로·세로·대각선 어느 방향이든 돼요.' },
        { title: '비밀 분배', body: '두 사람이 각자 가진 포인트를 세 점에 몰래 나눠 걸어요. 세 점 모두에 적어도 1포인트씩 걸어야 해요.' },
        { title: '공개와 착수', body: '동시에 공개해서, 점마다 더 많이 건 사람의 돌이 놓여요. 세 돌은 한꺼번에 놓이므로 놓는 순서는 의미가 없어요.' },
        { title: '이월', body: '쓰고 남은 포인트의 절반(내림)이 다음 라운드로 넘어가요.' },
        { title: '선택자 교대', body: '선택자는 라운드마다 번갈아 맡아요. 첫 선택자는 무작위로 정해요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '라운드가 끝났을 때 판에 오목(같은 색 돌 정확히 다섯 개가 한 줄)이 생기면 게임이 끝나고, **오목이 더 많은 쪽이 이겨요**.',
        '시즌 3에서는 이 대결의 승자가 유배지를 떠나 메인 매치로 돌아갔어요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '같은 점에 똑같이 걸면, 그 라운드에 **점을 고르지 않은 사람**이 그 점을 가져가요.',
        '여섯 개 이상 이어진 줄(장목)은 오목으로 치지 않아요. 오목 하나는 한 번만 세요.',
        '오목 수가 같으면(둘 다 하나 이상) 무승부예요. 한 줄로 붙은 빈 점 세 개가 판에 더는 없을 때도 무승부예요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '포인트 오목은 **오목의 수읽기와 비공개 입찰을 합친** 게임이에요. 어디에 두고 싶은지는 상대도 알고 있어요. 문제는 그 자리를 얼마에 사느냐예요.' },
      { type: 'cards', items: [
        { title: '세 점을 고르는 쪽의 힘', body: '선택자는 판의 어느 줄을 싸움터로 만들지 정해요. 내 돌이 이어질 곳과 상대의 줄을 끊을 곳을 한 번에 묶어 고르면, 상대는 둘 중 하나를 포기해야 해요. 대신 동점이면 고르지 않은 사람이 가져가므로, 선택자는 확실히 이기려면 한 포인트 더 걸어야 해요.' },
        { title: '모든 점에 최소 1', body: '세 점 모두에 1 이상을 걸어야 해서, 한 점에 전부 몰 수는 없어요. 10포인트면 한 점에 최대 8까지예요. 상대가 꼭 필요한 한 점에 8을 걸 거라고 읽으면, 나머지 두 점을 1씩으로 이기기 위해 2씩만 걸어도 돼요.' },
        { title: '남기는 포인트의 가치', body: '남긴 포인트는 절반만 넘어가요. 그래서 아끼면 손해지만, 다음 라운드에 상대보다 많은 포인트를 들고 시작할 수 있어요. 오목 직전의 결정적인 라운드를 위해 미리 모아 두는 계산이 필요해요.' },
        { title: '오목판의 기본도 그대로예요', body: '3·3이나 4·3처럼 두 갈래로 동시에 위협하는 모양은 여전히 강해요. 상대가 한 라운드에 막을 수 있는 점은 많아야 세 개라서, 위협이 여러 곳에 걸쳐 있으면 포인트로 다 막을 수 없어요.' },
        { title: '지배 전략은 없어요', body: '같은 세 점이라도 상대가 어디에 많이 걸지에 따라 최선의 분배가 달라지는 동시 결정이라, 정해진 정답은 없어요. 상대의 남은 포인트를 정확히 세고, 상대에게 가장 중요한 점이 어디인지를 먼저 읽는 쪽이 유리해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        '방송에서는 유배지 마지막 대결로 짧게 소개되어, 세부 규칙을 화면만으로 모두 확인할 수 없었어요. 그래서 **PUZZLTHINK 포인트 오목의 세부 규칙(15×15 판, 라운드마다 10포인트, 남은 포인트 절반 이월, 동점은 고르지 않은 쪽, 장목 불인정, 무승부 조건)은 사이트가 운영자와 정한 규칙**이에요.',
        'AI(보통·어려움)와 하거나, 친구·공개방에서 1:1로 할 수 있어요.',
      ] },
    ],
    similar: [
      { name: '오목 (고모쿠)', players: '2명', alike: '다섯 개를 한 줄로 먼저 만드는 바탕 규칙이 같아요.', differs: '오목은 번갈아 한 수씩 원하는 곳에 두고, 포인트 입찰이 없어요.' },
      { name: '틱택토 (Tic-tac-toe)', players: '2명', alike: '한 줄 만들기와 상대 줄 막기를 동시에 생각하는 연결 게임이에요.', differs: '3×3 판에 세 개를 잇는 짧은 게임이라 수읽기 깊이가 훨씬 얕아요.' },
      { name: '하이에나 (Hol’s der Geier)', players: '2–5명', alike: '같은 목표에 각자 몰래 값을 걸고 더 높은 쪽이 가져가는 동시 입찰 구조예요.', differs: '하이에나는 판이 없고 매 라운드 걸린 점수 카드를 가져가요.' },
    ],
    sourceNote: '이 게임은 방송에서 규칙 화면이 짧게 지나갔고, 규칙을 자세히 옮긴 글도 찾지 못했어요. 이 페이지에서 출처로 확인한 것은 유배지의 마지막 1:1 대결이었고 승자가 메인 매치로 돌아갔다는 점까지예요. 인원·준비물부터 예외 규칙까지는 PUZZLTHINK 구현(운영자와 정한 규칙)을 기준으로 적었어요.',
  },
  en: {
    meta: {
      title: "Point Omok rules — The Devil's Plan 3, exile final (gomoku with bids)",
      description: "The rules of Point Omok, the last exile-zone duel of The Devil's Plan: Dead Again (season 3): choosing three points, splitting 10 points in secret, carry-over, ties, what counts as a five, and what decides it — playable on PUZZLTHINK.",
      keywords: ['Point Omok', 'Point Gomoku', "Devil's Plan 3 Point Omok", "Devil's Plan exile zone", 'gomoku bidding game'],
    },
    title: "Point Omok — The Devil's Plan 3, exile final",
    name: 'Point Omok',
    lead: 'You do not just place a stone. Split points in secret over three chosen points; whoever bid more on a point gets their stone there.',
    summary: 'Choose three points, split your points over them in secret, and build fives with the stones you win: the exile zone’s last duel.',
    setup: [
      { type: 'list', items: [
        '**Players**: 1:1. In season 3 the last two players in the exile zone played it for a single ticket back into the game.',
        '**Board**: a gomoku board (15×15 on PUZZLTHINK).',
        '**Points**: a fresh grant each round (10 on PUZZLTHINK) plus whatever carried over.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Choose three points', body: 'The round’s chooser marks three empty points next to each other in one line — across, down or diagonal.' },
        { title: 'Secret split', body: 'Both players split their points over the three, in secret, at least 1 on each.' },
        { title: 'Reveal and place', body: 'Bids are shown together and each point gets the stone of whoever bid more. The three stones go down at once, so their order means nothing.' },
        { title: 'Carry-over', body: 'Half of the points left unspent (rounded down) carry to the next round.' },
        { title: 'Alternate', body: 'The chooser alternates each round; the first is drawn at random.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'When a round ends with a five on the board (exactly five stones of one colour in a line), the game ends and **more fives wins**.',
        'In season 3 the winner left the exile zone and returned to the main match.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'On an equal bid, **the player who did not choose the points** takes it.',
        'Six or more in a row (an overline) is not a five, and each five counts once.',
        'Equal numbers of fives (one or more each) is a draw, and so is a board with no three empty points in a row left.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Point Omok fuses **gomoku reading with sealed bidding**. Your opponent knows where you want to play; the question is what you will pay for it.' },
      { type: 'cards', items: [
        { title: 'The chooser’s power', body: 'The chooser decides which line becomes the battlefield. Tying a point that extends your line to one that cuts theirs forces the opponent to give one up. But ties go to the other player, so the chooser must bid one more to be sure.' },
        { title: 'At least one on every point', body: 'You cannot put everything on one point; with 10 points, eight is the most on any single one. If you expect the opponent to put eight on the point they need, two each on the other two takes them.' },
        { title: 'Saving has a cost', body: 'Only half of what you save carries over, so saving loses points — but lets you start a round with more than your opponent. Banking for the decisive round before a five takes planning.' },
        { title: 'Gomoku basics still apply', body: 'Double threats (three-three, four-three) remain strong. At most three points are contested per round, so threats spread over several places cannot all be bought off.' },
        { title: 'No dominant strategy', body: 'The best split over the same three points depends on where the opponent bids big — a simultaneous decision with no fixed answer. Counting the opponent’s remaining points exactly and seeing which point matters most to them wins.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'On the show it appeared briefly as the exile zone’s last duel, and the full rules could not be confirmed from the screen. **The details of PUZZLTHINK’s Point Omok (15×15 board, 10 points a round, half of the rest carried over, ties to the non-chooser, no overlines, the draw conditions) were set by the site with its operator.**',
        'Play the AI (normal or hard) or a 1:1 with friends or in an open room.',
      ] },
    ],
    similar: [
      { name: 'Gomoku (omok)', players: '2', alike: 'The same goal of five in a row.', differs: 'Players simply alternate placing stones anywhere; there is no bidding.' },
      { name: 'Tic-tac-toe', players: '2', alike: 'Making your line and blocking theirs at the same time.', differs: 'Three in a row on a 3×3 board, so far shallower.' },
      { name: "Hol's der Geier (Raj)", players: '2–5', alike: 'Everyone bids secretly on the same prize and the higher bid takes it.', differs: 'There is no board; each round you win a prize card.' },
    ],
    sourceNote: 'The rules screen went by quickly on the show and no detailed write-up of the rules could be found. What the references confirm is only that this was the exile zone’s last 1:1 duel and that its winner returned to the main match. Everything from players and components to edge cases follows PUZZLTHINK’s implementation (rules agreed with the site’s operator).',
  },
};

export default game;
