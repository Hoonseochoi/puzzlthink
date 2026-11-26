import type { ShowGame } from '../types';
import { SITE_CHECKED_EN, SITE_CHECKED_KO, broadcast, namuDay, siteEngine } from './shared';

const game: ShowGame = {
  slug: 'piggy-bank',
  kind: 'prison',
  when: { ko: '3일차', en: 'Day 3' },
  site: 'piggyBank',
  related: ['piggyBank', 'russianRoulette', 'heavy13'],
  updated: '2026-11-26',
  sources: [namuDay(3), siteEngine({ ko: '돼지 저금통', en: 'Piggy Bank' }, 'src/lib/piggyBank.ts'), broadcast],
  ko: {
    meta: {
      title: '돼지 저금통 규칙 — 데블스플랜3 3일차 감옥매치, 동전 기억과 의심',
      description: '데블스플랜3(데블스 플랜: 데드 어게인) 3일차 감옥매치 돼지 저금통의 규칙을 정리했어요. 흑백 동전 넣기, 저금통 넘기기, 개수 대답과 의심 버저, 점수, 리셋과 도전, 5점 도달 종료, 승부를 가르는 지점까지.',
      keywords: ['돼지 저금통', '돼지저금통', '데블스플랜3 돼지 저금통', '데블스플랜3 감옥매치', '데블스 플랜 3 3일차', '돼지 저금통 규칙'],
    },
    title: '돼지 저금통 — 데블스플랜3 3일차 감옥매치',
    name: '돼지 저금통',
    lead: '동전을 넣고 넘기고, 받은 저금통 안의 동전 수를 맞혀야 해요. 틀린 대답을 잡아내면 점수, 헛짚으면 감점이에요.',
    summary: '흑백 동전을 넣은 저금통을 돌리며 안의 개수를 기억해 대답하고, 남의 대답을 의심해 점수를 얻는 4인 기억력 게임.',
    setup: [
      { type: 'list', items: [
        '**인원**: 4명(셋째 날 감옥동).',
        '**저금통**: 1–4번 저금통을 한 사람에 하나씩, 각각 흑 동전 1개와 백 동전 1개를 넣은 채로 받아요. 선 플레이어는 5번 저금통을 테이블 위 칸에 올려 둬요.',
        '**자리**: 각자 테이블 아래 칸(자기 저금통)과 위 칸이 있어요.',
        '**기타**: 흑·백 동전, 의심 버저, 리셋 버튼.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '동전 넣기', body: '차례인 사람은 아래 칸의 저금통에 흑백 합쳐 1–5개의 동전을 넣고, 무엇을 몇 개 넣었는지 **사실대로** 말해요.' },
        { title: '넘기기', body: '그 저금통을 원하는 사람에게 넘기고, 자기 위 칸에 있던 저금통을 아래 칸으로 내려요. 받은 사람은 받은 저금통을 위 칸에 올려요.' },
        { title: '대답', body: '받은 사람은 20초 안에 그 저금통에 든 **특정 색 동전의 개수**를 말해요. 묻는 색은 흑과 백이 번갈아 가요.' },
        { title: '의심', body: '대답 뒤 10초 동안 다른 사람들은 버저를 눌러 의심할 수 있어요. 가장 먼저 누른 사람만 의심해요. 아무도 의심하지 않으면 받은 사람이 다음 차례가 되어 동전을 넣고 넘겨요.' },
        { title: '개봉', body: '의심하면 저금통을 열어 개수를 확인하고, 열린 저금통은 게임에서 빠져요. 대답이 틀렸으면 의심 성공(의심한 사람 +1, 대답한 사람 −1), 맞았으면 의심 실패(의심한 사람 −1)예요.' },
        { title: '새 저금통', body: '점수를 잃은 사람은 새 번호의 저금통을 받아 선 플레이어가 되고, 다시 동전을 넣고 넘기는 데서 이어가요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '누군가 **5점에 도달하면** 그 시점의 점수로 순위를 매기고, 최하위 한 명이 정해지면 게임이 끝나요.',
        '**최하위 1명이 탈락**하고, 1위는 피스 3개를 받아요(동점이면 나눠 가져요).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**리셋**: 누구든 언제든 리셋 버튼을 누를 수 있고, 누른 사람이 3명이 되는 순간 리셋돼요. 쓰던 저금통을 모두 치우고, 흑백 동전이 하나씩 든 저금통 1–5번을 다시 나눠요.',
        '**도전**: 리셋 직전, 리셋 버튼을 누르지 않은 사람은 버저로 도전할 수 있어요. 지금 쓰는 모든 저금통의 흑백 동전 수를 전부 맞히면 +3점, 하나라도 틀리면 −2점이에요.',
        '진행 중 동전을 이용해 수를 세는 행동은 금지예요.',
        '동전을 넣은 사람은 반드시 사실을 말해야 해요. 거짓말이 허용되는 건 받은 사람의 대답뿐이에요.',
      ] },
    ],
    analysis: [
      { type: 'p', text: '돼지 저금통은 **기억력 게임에 블러핑을 얹은** 구조예요. 넣는 사람은 사실을 말해야 하지만, 받은 사람은 정확히 기억하지 못해도 그럴듯한 숫자를 말할 수 있어요. 다른 사람이 그 숫자를 믿을지 말지가 승부예요.' },
      { type: 'cards', items: [
        { title: '누가 무엇을 기억할까', body: '저금통마다 처음 동전(흑 1·백 1)과 그동안 넣은 동전의 합이 정답이에요. 저금통이 여러 개 돌고 있어서 모두를 정확히 기억하는 건 어렵지만, 내가 넣은 저금통이나 방금 본 저금통은 기억하기 쉬워요. 상대가 어느 저금통을 가장 잘 알고 있을지 생각하며 넘길 상대를 골라요.' },
        { title: '넘기기는 공격이에요', body: '많은 동전을 넣어 복잡해진 저금통을, 그 저금통의 내역을 잘 모를 것 같은 사람에게 넘기면 틀린 대답을 유도할 수 있어요. 반대로 너무 쉬운 저금통을 넘기면 의심할 거리가 없어요.' },
        { title: '의심의 기대값', body: '의심은 성공하면 +1이지만 실패하면 −1이에요. 내가 정답을 확실히 알 때만 의심하는 게 기본인데, 누군가 이미 4점이라 게임이 곧 끝날 상황이라면 하위권은 불확실해도 의심해야 할 이유가 생겨요.' },
        { title: '리셋과 도전', body: '리셋은 기억이 엉킨 사람에게는 구원이고, 잘 기억한 사람에게는 도전(+3)의 기회예요. 리셋 버튼을 누르면 도전할 수 없으므로, 모든 저금통을 확실히 안다면 누르지 말고 남이 리셋을 모아 주기를 기다리는 편이 이득이에요.' },
        { title: '지배 전략은 없어요', body: '정확한 기억은 강하지만, 기억이 정확하다는 사실이 알려지면 아무도 그 사람의 대답을 의심하지 않아요. 기억력과 함께 "내가 무엇을 아는지"를 얼마나 숨기는지도 중요해요.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK 돼지 저금통은 방송 규칙(4명, 1–5개 넣기, 흑백 번갈아 묻기, 의심 ±1, 리셋 3표와 도전 +3/−2, 5점 도달 종료)을 그대로 따라요.',
        '혼자 할 때는 AI 3명과 4인전을 하고, 친구와는 최대 4명까지 방을 만들 수 있어요.',
        '개봉된 저금통 결과나 리셋 결과가 화면에 떠 있는 동안에는 진행이 잠시 멈춰요.',
      ] },
    ],
    similar: [
      { name: '바퀴벌레 포커 (Cockroach Poker)', players: '2–6명', alike: '카드를 넘기며 "이건 ○○야"라고 말하고, 받은 사람이 그 말을 믿을지 판단해요. 넘기기와 의심 구조가 돼지 저금통과 아주 닮았어요.', differs: '바퀴벌레 포커는 넘기는 사람이 거짓말을 할 수 있고, 같은 벌레를 네 장 모은 사람이 져요. 기억할 동전 같은 누적 정보는 없어요.' },
      { name: '라이어스 다이스 (Liar’s Dice)', players: '2–6명', alike: '숨겨진 개수에 대한 주장을 의심해 확인하고, 틀린 쪽이 손해를 보는 구조예요.', differs: '라이어스 다이스는 모두의 주사위를 합친 개수를 놓고 점점 높게 부르며, 기억이 아니라 확률 싸움이에요.' },
      { name: '스컬 (Skull)', players: '3–6명', alike: '보이지 않는 것에 대한 허세와 도전이 핵심이고, 도전에 실패하면 손해를 봐요.', differs: '스컬은 원반을 몇 개 뒤집을 수 있는지 경매하듯 부르고, 해골을 피해야 해요.' },
    ],
    sourceNote: SITE_CHECKED_KO,
  },
  en: {
    meta: {
      title: "Piggy Bank rules — The Devil's Plan 3, day 3 prison match (remember the coins, call the doubt)",
      description: "The rules of Piggy Bank, the day-3 prison match of The Devil's Plan: Dead Again (season 3): adding black and white coins, passing the pig, answering and doubting, scoring, resets and challenges, the end at 5 points, and what decides it.",
      keywords: ['Piggy Bank', "Devil's Plan 3 Piggy Bank", "Devil's Plan prison match", 'Piggy Bank game rules'],
    },
    title: "Piggy Bank — The Devil's Plan 3, day 3 prison match",
    name: 'Piggy Bank',
    lead: 'Add coins, pass the pig, and say how many coins are inside the pig you receive. Catch a wrong answer and score; doubt a right one and lose a point.',
    summary: 'Four players pass piggy banks of black and white coins, answer how many are inside, and doubt each other’s answers.',
    setup: [
      { type: 'list', items: [
        '**Players**: 4 (the day-3 prison).',
        '**Pigs**: each player gets one of pigs 1–4, holding one black and one white coin. The first player puts pig 5 in their upper slot on the table.',
        '**Places**: everyone has a lower slot (their own pig) and an upper slot on the table.',
        '**Also**: black and white coins, doubt buzzers, a reset button.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Add coins', body: 'The active player puts 1–5 coins, black and white combined, into the pig in their lower slot and says **truthfully** what they put in.' },
        { title: 'Pass', body: 'They hand that pig to anyone they like and move their own upper pig down to the lower slot. The receiver puts the received pig in their upper slot.' },
        { title: 'Answer', body: 'Within 20 seconds the receiver says how many coins of **one colour** the pig holds. The colour asked alternates between black and white.' },
        { title: 'Doubt', body: 'For 10 seconds others may buzz to doubt; only the fastest buzzer doubts. If nobody does, the receiver takes the next turn.' },
        { title: 'Open', body: 'A doubted pig is opened and leaves the game. A wrong answer means the doubter gains 1 and the answerer loses 1; a right answer means the doubter loses 1.' },
        { title: 'New pig', body: 'Whoever lost a point receives a new numbered pig, becomes the first player and carries on adding and passing.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        'When someone **reaches 5 points**, players are ranked on the scores at that moment; once a single last place is clear, the game ends.',
        '**The last place is eliminated**; first place gets 3 pieces (shared if tied).',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '**Reset**: anyone may press the reset button at any time; at three presses, every pig in play is removed and pigs 1–5 (one black, one white coin each) are handed out again.',
        '**Challenge**: just before a reset, a player who did not press reset may buzz to challenge: name the black and white count of every pig in play for +3, or lose 2 on any mistake.',
        'Using coins to keep count during play is forbidden.',
        'The player adding coins must tell the truth; only the receiver’s answer may be a bluff.',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Piggy Bank is **a memory game with bluffing on top**. The adder must tell the truth, but a receiver who does not remember exactly can still say a plausible number. Whether the table believes it is the game.' },
      { type: 'cards', items: [
        { title: 'Who remembers what', body: 'Each pig holds its starting coins plus everything added since. With several pigs in circulation nobody remembers them all, but pigs you added to or just watched are easy. Pass to whoever is least likely to know that pig.' },
        { title: 'Passing is an attack', body: 'A pig full of coins, given to someone who probably lost track of it, invites a wrong answer. An easy pig gives nobody a reason to doubt.' },
        { title: 'The value of doubting', body: 'A doubt is +1 if right and −1 if wrong, so the default is to doubt only when sure. When someone sits on 4 and the game is about to end, players at the bottom have a reason to doubt on less.' },
        { title: 'Reset and challenge', body: 'A reset rescues players whose memory is tangled and offers a +3 challenge to those who kept track. Pressing reset forfeits the challenge, so if you know every pig, let others collect the presses.' },
        { title: 'No dominant strategy', body: 'Good memory is strong, but once the table knows yours is good, nobody doubts your answers. Hiding what you know matters as much as knowing it.' },
      ], columns: 1 },
    ],
    siteDiff: [
      { type: 'list', items: [
        'PUZZLTHINK follows the broadcast rules: 4 players, 1–5 coins, alternating colours, ±1 doubts, a three-vote reset with a +3/−2 challenge, and the end at 5 points.',
        'Solo play is a four-player game against three AIs; friends can open a room for up to four.',
        'Play pauses briefly while an opened pig or a reset result is on screen.',
      ] },
    ],
    similar: [
      { name: 'Cockroach Poker', players: '2–6', alike: 'You pass a card with a claim and the receiver decides whether to believe it — very close to passing and doubting a pig.', differs: 'The passer may lie, and collecting four of a kind loses; there is no accumulating count to remember.' },
      { name: "Liar's Dice", players: '2–6', alike: 'Claims about a hidden count are challenged and checked, and the wrong side pays.', differs: 'Bids rise over the total of everyone’s dice; it is about probability, not memory.' },
      { name: 'Skull', players: '3–6', alike: 'Bluffing about what nobody can see and challenging, with a cost for failing.', differs: 'You bid how many discs you can flip without hitting a skull.' },
    ],
    sourceNote: SITE_CHECKED_EN,
  },
};

export default game;
