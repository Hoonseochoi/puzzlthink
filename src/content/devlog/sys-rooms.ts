import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-rooms',
  category: 'systems',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '친구 대전·오픈 대전·랭킹 개발기 — 링크 하나에서 리벤지 배지까지 | 개발 노트',
      description: 'PUZZLTHINK 친구 대전과 오픈 대전이 만들어진 과정. 방장 브라우저가 진행하는 실시간 방, 4자리 초대 코드, 연결이 끊긴 자리를 AI가 대신 두는 방식, 기다리는 동안의 연습, 상대별 전적과 리벤지 배지, 오픈 대전 랭킹, 방 채팅의 도배 방지까지.',
      keywords: ['오픈 대전', '친구 대전', '온라인 보드게임', '초대 코드', '게임 랭킹', '실시간 멀티플레이', '개발 노트'],
    },
    title: '친구 대전·오픈 대전·랭킹 개발기',
    lead: '링크 하나로 시작해서, 모르는 사람과 겨루는 곳이 되기까지.',
    intro: [
      'PUZZLTHINK의 대부분의 게임은 AI와도, 사람과도 할 수 있어요. 사람과 하는 방법은 두 가지예요. 아는 사람에게 링크나 코드를 보내는 **친구 대전**, 그리고 열려 있는 방에 누구나 들어오는 **오픈 대전**이에요.',
      '이 글은 첫날 오후의 "링크로 벽바둑 하기"에서 시작해, 오픈 대전과 랭킹, 리벤지 배지, 방 채팅까지 이어진 과정을 커밋 기록으로 정리한 개발 노트예요.',
    ],
    summary: '방장 브라우저가 진행하는 실시간 방, 4자리 코드, 끊긴 자리를 대신 두는 AI, 기다리는 동안의 연습, 리벤지 배지와 오픈 대전 랭킹.',
    sections: [
      {
        id: 'first-room',
        title: '첫날 오후: 링크로 벽바둑 하기',
        blocks: [
          { type: 'p', text: '첫 친구 대전은 11월 16일 저녁 6시 28분, 벽바둑에 들어갔어요. 방을 만들면 초대 링크가 생기고(복사하거나 휴대폰 공유하기로 보내요), 대기실에서 닉네임과 자리를 고르고, 관전과 재대결도 할 수 있었어요.' },
          { type: 'p', text: '구조는 지금도 같아요. 방은 실시간 채널(Supabase Realtime) 하나이고, **방장의 브라우저가 게임 상태를 들고 있어요.** 다른 사람의 수는 방장에게 전달되고, 방장 쪽 규칙 엔진이 확인한 뒤 모두에게 새 상태를 보내요. 시간 제한(벽바둑은 90초)도 방장 쪽에서 재요. 서버에 게임 로직을 따로 두지 않아서, 새 게임을 만들 때 AI전과 같은 규칙 코드를 그대로 쓸 수 있어요. 같은 날 밤 십이장기와 무거운 13이 이 방식을 그대로 가져갔어요.' },
        ],
      },
      {
        id: 'codes',
        title: '4자리 코드와 끊긴 자리',
        blocks: [
          { type: 'p', text: '다음 날 아침, 모든 게임의 시작 화면에 "AI와 하기 / 친구와 하기"가 생기면서 초대 코드가 **4자리 숫자**(1000~9999)로 바뀌었어요. 말로 불러 줄 수 있는 길이예요. 새 코드를 쓰기 전에는 그 코드의 채널에 누가 있는지 먼저 조용히 들어 보고, 사람이 있으면 다른 코드를 골라요. 예전 6자리 링크도 계속 열려요.' },
          { type: 'p', text: '여러 명이 하는 게임에서는 한 사람이 나가면 판 전체가 멈춰요. 그래서 **20초 동안 연결이 끊기거나 두 차례 연속 시간을 넘기면** 그 자리를 "자리 비움"으로 바꾸고 AI가 대신 둬요. 이름은 그대로 남고, 돌아와서 "다시 참여"를 누르면 자리를 돌려받아요. 방장이 나가면 남은 사람 중 한 명이 방장을 넘겨받고, 원래 방장의 자리도 같은 방식으로 처리돼요. 무거운 13과 러시안 룰렛처럼 사람이 모자란 방은 처음부터 AI로 빈자리를 채울 수 있어요.' },
        ],
      },
      {
        id: 'open',
        title: '11월 17일 저녁: 오픈 대전',
        blocks: [
          { type: 'p', text: '오픈 대전은 11월 17일 저녁 7시부터 한 시간 남짓한 사이에 커밋 여섯 개로 만들어졌어요.' },
          { type: 'steps', items: [
            { title: '19:09 열린 방 목록', body: '모든 대전 게임의 시작 화면에 열린 방 목록(10초마다 갱신)과 방 만들기가 생겼어요. 방이 찰 때까지는 **혼자 연습**하면서 기다려요. 대기실은 PC에서는 왼쪽 칸, 휴대폰에서는 왼쪽 가장자리 탭에서 밀려 나오는 서랍이에요. 빠른 반응(ㅎㅇ ㄱㄷ ㅇㅋ ㅈㅈ ㅂㅂ)도 이때 생겼어요.' },
            { title: '19:14 로그인한 사람만', body: '오픈 대전은 로그인해야 만들고 들어갈 수 있어요. 대신 대기실에서 각자의 그 게임 전적과 **나와의 상대 전적**이 보여요.' },
            { title: '19:19 홈의 첫 카드', body: '홈 화면 첫 카드가 "오픈 대전"이 됐어요. 모든 열린 방을 한눈에 보고, 게임을 골라 만들거나 들어가요.' },
            { title: '19:24 리벤지 배지', body: '방 제목을 정할 수 있고, 전에 만난 상대 옆에는 상대 전적과 함께 배지가 붙어요. 마지막 판을 졌으면 빨간 **리벤지**, 아니면 회색 **재대결**.' },
            { title: '19:37 오픈 대전 랭킹', body: '오픈 대전 판만 따로 표시해서 게임별 랭킹을 만들었어요(승수 → 승률 → 그 승수에 먼저 도달한 사람). 대전이 끝나면 리벤지 성공 폭죽이나 실패 팝업, 순위 변화 팝업이 떠요.' },
            { title: '19:44 닉네임', body: '처음 로그인할 때 닉네임(2~16자)을 정하고, 그 닉네임이 모든 방과 랭킹에 쓰여요.' },
          ] },
          { type: 'p', text: '그날 밤 8시에는 연습이 버튼으로 시작되게 바꾸고(들어오자마자 게임이 시작되던 것을 대기 화면으로), 연습 판은 기록에서 빠지게 했어요.' },
        ],
      },
      {
        id: 'chat',
        title: '방 채팅과 도배 방지',
        blocks: [
          { type: 'p', text: '11월 20일 새벽, 친구 대전과 오픈 대전 방에 채팅이 들어갔어요. 메시지는 방의 실시간 채널로만 오가고 **어디에도 저장하지 않아요.** 도배를 막는 규칙은 단순해요. 1초에 한 줄, 10초에 다섯 줄까지, 같은 말을 세 번 연속으로는 못 보내요. 보낼 때와 받을 때 모두 확인해요. 특정 사람을 음소거하거나 채팅을 끌 수 있고, 그 설정은 내 브라우저에만 남아요. 새 메시지는 보낸 사람의 플레이어 칸 위에 말풍선으로 떠요.' },
        ],
      },
      {
        id: 'peak',
        title: '작은 서버의 첫 고비',
        blocks: [
          { type: 'p', text: '11월 21일 오후 4시 10분, 접속이 몰리면서 데이터베이스 API 호출 대부분이 504(시간 초과)로 실패했어요. 커밋 메시지에 따르면 무료 요금제의 연산 자원으로는 API 계층이 버티지 못했어요. 바로 몇 가지를 줄였어요. 홈의 랭킹과 명예의 전당은 60초 캐시에서 답하고, 접속 확인 신호는 45초 → 120초, 활동 기록은 60초 → 120초, 홈의 열린 방 목록 갱신은 20초 → 60초로 늦췄어요. 10분 뒤에는 친구·오픈 대전 방에 "1인이 운영하는 작은 서버라 사람이 몰리는 시간에는 느릴 수 있다"는 안내를 붙였어요.' },
        ],
      },
      {
        id: 'numbers',
        title: '숫자로 보면',
        lead: '2026-11-26 14시(KST) 기준.',
        blocks: [
          { type: 'p', text: '로그인한 플레이어의 사람 대 사람 기록은 4,608판이고, 그중 1,352판이 오픈 대전이에요. 오픈 대전 기록을 가진 사람은 270명이에요. 로그인 여부와 상관없이 센 친구·오픈 대전 판수가 가장 많은 게임은 슬리더링크(2,985판), 무거운 13(2,071판), 인디언 포커(1,794판), 벽바둑 II(1,618판), 한붓그리기(1,190판), 벽바둑(1,114판) 순이에요.' },
        ],
      },
    ],
    sources: [
      '`src/lib/room.ts`, `src/lib/openRooms.ts`, `src/lib/roomAway.ts`(AWAY_AFTER_MS, MISSES_FOR_AWAY), `src/lib/roomChat.ts`',
      '커밋 a81ce52 (11/16 벽바둑 친구 대전), 91ba80a (11/17 시작 화면·4자리 코드), 54a620f·446ab44·49cb638·73e3584·5948642·d6dc3cd (11/17 오픈 대전, 로그인, 홈 카드, 리벤지, 랭킹, 닉네임), 3f050bb·160740c (11/17 연습), aca18bf (11/18 랭킹 1승부터), 7d7eb26 (11/20 방 채팅), d2dd35e·e149478 (11/21 피크 시간 대응)',
      'DB 집계(2026-11-26 14:22 KST): game_results(mode=friend) 수와 detail.open 판수·인원, game_plays_daily(mode=friend) 게임별 합계',
    ],
  },
  en: {
    meta: {
      title: 'Friend rooms, open matches and rankings dev notes — from one link to a revenge badge | Dev notes',
      description: 'How PUZZLTHINK friend and open matches were built: realtime rooms run by the host’s browser, 4-digit invite codes, an AI that plays a dropped seat, practice while you wait, head-to-head records with revenge badges, open-match rankings and flood control for room chat.',
      keywords: ['open match', 'friend match', 'online board games', 'invite code', 'game ranking', 'realtime multiplayer', 'dev notes'],
    },
    title: 'Friend rooms, open matches and rankings dev notes',
    lead: 'From one shared link to a place to take on strangers.',
    intro: [
      'Most PUZZLTHINK games can be played against the AI or against people, and there are two ways to play people: **friend rooms**, where you send someone a link or a code, and **open matches**, rooms anyone can join.',
      'This note follows the commits from "play Wallgo over a link" on the first afternoon to open matches, rankings, revenge badges and room chat.',
    ],
    summary: 'Realtime rooms run by the host’s browser, 4-digit codes, an AI for dropped seats, practice while waiting, revenge badges and open-match rankings.',
    sections: [
      {
        id: 'first-room',
        title: 'Day one: Wallgo over a link',
        blocks: [
          { type: 'p', text: 'The first friend room arrived in Wallgo at 6:28 pm on 16 November: creating a room gives an invite link (copy it or use the phone’s share sheet), and the lobby has nicknames, seats, spectators and rematches.' },
          { type: 'p', text: 'The design is still the same. A room is one realtime channel (Supabase Realtime) and **the host’s browser holds the game state**. Other players’ moves go to the host, the host’s rule engine checks them, and everyone gets the new state. The turn clock (90 s in Wallgo) runs on the host too. With no game logic on a server, a new game’s rooms reuse exactly the rule code of its AI mode — 12 Janggi and Heavy 13 took the same approach that night.' },
        ],
      },
      {
        id: 'codes',
        title: 'Four-digit codes and dropped seats',
        blocks: [
          { type: 'p', text: 'The next morning every game’s entry screen got "play the AI / play friends", and invite codes became **four digits** (1000–9999) — short enough to read out. Before using a new code the creator quietly listens on that code’s channel and picks another if anyone is there. Old six-character links still open.' },
          { type: 'p', text: 'In multiplayer games one person leaving stalls the table. So a player **disconnected for 20 seconds, or timing out twice in a row**, is marked away and the AI plays the seat; the name stays, and pressing "rejoin" gives it back. If the host leaves, one of the others takes over as host and the old host’s seat is handled the same way. Rooms short of people, as in Heavy 13 and Russian Roulette, can fill empty seats with AI from the start.' },
        ],
      },
      {
        id: 'open',
        title: '17 November, evening: open matches',
        blocks: [
          { type: 'p', text: 'Open matches were built in six commits within a little over an hour from 7 pm on 17 November.' },
          { type: 'steps', items: [
            { title: '19:09 Open room lists', body: 'Every multiplayer game’s entry screen got a list of open rooms (refreshed every 10 s) and a create button. While a room fills you **practise solo**; the waiting room is a left column on desktop and a drawer from a left-edge tab on phones. Quick reactions (ㅎㅇ ㄱㄷ ㅇㅋ ㅈㅈ ㅂㅂ) came in too.' },
            { title: '19:14 Signed-in only', body: 'Open rooms need sign-in to create or join — in return the waiting room shows each player’s record in the game and **your record against them**.' },
            { title: '19:19 First card on the home page', body: 'The home page’s first card became "Open match": every open room at a glance, create (pick a game) or join.' },
            { title: '19:24 Revenge badges', body: 'Rooms got titles, and anyone you have met shows your record against them with a badge: red **revenge** if you lost the last game, grey **rematch** otherwise.' },
            { title: '19:37 Open-match rankings', body: 'Open games are tagged and ranked per game (wins → win rate → who reached that many wins first). After a match, a revenge success (fireworks) or failure popup, and a rank-change popup.' },
            { title: '19:44 Nicknames', body: 'The first sign-in asks for a nickname (2–16 characters), used in every room and ranking.' },
          ] },
          { type: 'p', text: 'At 8 pm practice changed to start on a button (instead of a game starting the moment you entered), and practice games were kept off the records.' },
        ],
      },
      {
        id: 'chat',
        title: 'Room chat and flood control',
        blocks: [
          { type: 'p', text: 'In the early hours of 20 November friend and open rooms got chat. Messages travel only over the room’s realtime channel and are **stored nowhere**. Flood control is simple: one line a second, five per ten seconds, never the same line three times in a row — checked when sending and when receiving. You can mute a player or turn chat off, kept in your browser only. New messages pop up as a bubble over the sender’s player box.' },
        ],
      },
      {
        id: 'peak',
        title: 'A small server’s first rush',
        blocks: [
          { type: 'p', text: 'At 4:10 pm on 21 November a rush made most database API calls fail with 504 (timeout). Per the commit, the free plan’s compute could not keep the API layer up. Several things were throttled at once: home rankings and the Hall of Fame answer from a 60-second cache, the online heartbeat went from 45 s to 120 s, activity tracking from 60 s to 120 s, the home open-room list from 20 s to 60 s. Ten minutes later friend and open rooms got a notice that this is a small one-person server and may be slow at peak times.' },
        ],
      },
      {
        id: 'numbers',
        title: 'In numbers',
        lead: 'As of 2026-11-26, 14:00 KST.',
        blocks: [
          { type: 'p', text: 'Signed-in players have 4,608 recorded games against people, 1,352 of them open matches, and 270 players have open-match records. Counting everyone, the games with the most friend and open plays are Slitherlink (2,985), Heavy 13 (2,071), Indian Poker (1,794), Wallgo II (1,618), One Stroke (1,190) and Wallgo (1,114).' },
        ],
      },
    ],
    sources: [
      '`src/lib/room.ts`, `src/lib/openRooms.ts`, `src/lib/roomAway.ts` (AWAY_AFTER_MS, MISSES_FOR_AWAY), `src/lib/roomChat.ts`',
      'Commits a81ce52 (11/16 Wallgo friend rooms), 91ba80a (11/17 entry screen, 4-digit codes), 54a620f, 446ab44, 49cb638, 73e3584, 5948642 and d6dc3cd (11/17 open matches, sign-in, home card, revenge, rankings, nicknames), 3f050bb and 160740c (11/17 practice), aca18bf (11/18 ranking from 1 win), 7d7eb26 (11/20 room chat), d2dd35e and e149478 (11/21 peak-time fixes)',
      'DB aggregates (2026-11-26 14:22 KST): game_results (mode = friend) count, games and players with detail.open, game_plays_daily (mode = friend) totals by game',
    ],
  },
};

export default article;
