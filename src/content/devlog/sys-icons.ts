import type { DevlogArticle } from './types';

const article: DevlogArticle = {
  slug: 'sys-icons',
  category: 'systems',
  games: [],
  published: '2026-11-26',
  updated: '2026-11-26',
  ko: {
    meta: {
      title: '프로필 아이콘·배지 시스템 개발기 — 색깔 돌에서 HIDDEN MISSION까지 | 개발 노트',
      description: 'PUZZLTHINK의 프로필 아이콘이 랭킹 옆 색깔 돌에서 시작해 게임별 1위 왕관, 경쟁전 우승 아이콘, 2048 블록, 어려움 클리어·플레이 타임 배지, HIDDEN MISSION까지 자라 온 과정. 아이콘 순위와 자동 장착 규칙, 지금까지 몇 명이 무엇을 받았는지도 정리했어요.',
      keywords: ['PUZZLTHINK 아이콘', '프로필 아이콘', '게임 배지', '히든 미션', '아이콘 컬렉션', '게임 업적 시스템', '개발 노트'],
    },
    title: '프로필 아이콘·배지 시스템 개발기',
    lead: '랭킹 옆 작은 돌 하나가, 엿새 만에 수집품이 되기까지.',
    intro: [
      'PUZZLTHINK의 프로필 아이콘은 모두 같은 틀에서 나와요. 벽바둑의 말처럼 둥근 돌에 알약 모양 눈 두 개. 모든 아이콘이 100×100 상자 안에 같은 크기로 그려지기 때문에, 랭킹이든 라운지든 게임 상단이든 돌이 보이는 곳이면 어디든 바꿔 끼울 수 있어요.',
      '이 글은 그 돌이 단순한 색깔 표시에서 시작해 왕관, 경쟁전 보상, 업적 배지, 히든 미션까지 자라 온 과정을 커밋 기록으로 정리한 개발 노트예요.',
    ],
    summary: '랭킹 옆 색깔 돌에서 게임별 1위 왕관, 경쟁전 보상, 업적 배지, HIDDEN MISSION까지. 아이콘의 순위와 자동 장착 규칙, 그리고 지금까지의 획득 현황.',
    sections: [
      {
        id: 'stones',
        title: '시작: 닉네임마다 색 하나',
        blocks: [
          { type: 'p', text: '11월 20일, 랭킹의 아바타를 PUZZLTHINK 돌로 바꿨어요. 닉네임마다 색이 하나씩 정해지고, 피스 경쟁전 1~3위는 금·은·동 왕관을, 4~10위는 금색을 썼어요. 이때까지 아이콘은 "받는 것"이 아니라 "순위를 보여 주는 표시"였어요.' },
        ],
      },
      {
        id: 'earned',
        title: '11월 25일: 받는 아이콘',
        blocks: [
          { type: 'p', text: '닷새 뒤, 아이콘을 직접 얻을 수 있게 됐어요. 처음 들어간 건 네 종류예요.' },
          { type: 'cards', items: [
            { tag: 'w', title: '피스 경쟁전 우승', body: '주간 경쟁전(2주 차는 11/25~12/1)이 끝나면 1~3위가 보석 아이콘을 받아요. 시상대에는 순위별로 받게 될 아이콘이 미리 보여요.' },
            { tag: 'h', title: '블랙피스 경쟁전', body: '매우 어려움 AI를 이긴 수로 겨루는 주간 경쟁전의 1~3위 아이콘이에요. 흑요석 돌에 뿔과 지옥불 후광을 그렸어요.' },
            { tag: 'm', title: '2048 블록', body: '2048에서 2048 블록을 만들면 그 자리에서 받아요. 같은 날 밤 131072까지 블록마다 아이콘이 생겼고, 큰 블록을 만들면 그보다 작은 블록 아이콘도 모두 받아요.' },
            { tag: 'c', title: '게임별 1위', body: '각 게임 랭킹 1위가 그 게임의 아이콘(게임 색 돌 + 금관 + 게임 문양)을 가져요. 1위가 바뀌면 아이콘도 옮겨 가요.' },
          ] },
          { type: 'p', text: '새로 얻은 아이콘은 서버가 **바로 장착**해 줘요. 그리고 "새 아이콘" 팝업이 아이콘 고르는 곳으로 안내해요. 1주 차 우승자와 이미 2048을 만든 사람에게는 소급해서 줬어요. 같은 날 밤 모든 아이콘을 주제별로 모은 "아이콘 컬렉션" 페이지가 생겼고, 아이콘마다 얻는 조건이 한 줄씩 적혀 있어요.' },
        ],
      },
      {
        id: 'crown',
        title: '1위 왕관은 옮겨 다녀요',
        blocks: [
          { type: 'p', text: '게임별 1위 아이콘은 사이트에서 유일하게 **잃을 수 있는** 아이콘이에요. 랭킹은 실시간으로 바뀌고, 왕관은 몇 분마다 지금의 1위에게 옮겨져요. 잃은 기록은 따로 남아요. 11월 26일 아침에는 왕관을 빼앗긴 사람에게 "누가 가져갔는지"를 알려 주는 안내를 붙였어요. 버튼은 두 개예요. **복수하러 가기**, 그리고 **아이콘 설정으로 가기**.' },
          { type: 'p', text: '결합과 헥사곤처럼 혼자 푸는 게임은 1위를 무엇으로 정할지가 문제였어요. 이 둘은 혼자 하는 도전 모드(결합 10분, 헥사곤 도전) 기록으로 순위를 매기고, 왕관도 그 순위를 따라가게 했어요.' },
        ],
      },
      {
        id: 'badges',
        title: '11월 26일: 업적 배지',
        lead: '1위나 우승이 아니어도 얻을 수 있는 아이콘이 필요했어요.',
        blocks: [
          { type: 'p', text: '왕관과 경쟁전 아이콘은 소수만 가질 수 있어요. 그래서 11월 26일 새벽, 해낸 일에 따라 주는 **업적 배지**를 만들었어요. 순위는 왕관·경쟁전 아이콘 바로 아래예요.' },
          { type: 'table', head: ['배지', '조건', '모습'], rows: [
            ['어려움 클리어', '게임마다, 어려움 AI를 처음 이기면', '게임 색 돌에 작은 학사모, 게임 문양 스티커'],
            ['친구전 승리', '친구 대전에서 이기면', '파티 모자와 하트 풍선'],
            ['오픈 대전 승리', '오픈 대전에서 이기면', '헤어밴드와 금메달'],
            ['매우 어려움 클리어', '헬모드를 한 번 이기면', '흑요석 돌, 뿔, 붉은 눈, 작은 악마 꼬리'],
            ['플레이 타임', '10·20 … 100시간', '수면 모자 → 헤드폰 → 금색 선글라스 → 100시간엔 날개 달린 프리즘'],
          ] },
          { type: 'p', text: '배지는 서버가 줘요. 클리어 기록이나 경기 결과가 저장되는 순간 확인해서 붙여요. 플레이 타임은 퍼즐의 풀이 시간 기록을 바탕으로 삼고, 그 외에는 게임 화면이 열려 있고 플레이어가 실제로 움직이는 동안만 시간을 더해요. 이미 해낸 일은 소급해서 줬지만, 이때는 장착까지 바꾸지는 않고 팝업으로만 알렸어요.' },
          { type: 'h3', text: '장착 규칙' },
          { type: 'p', text: '새 아이콘이 생길 때마다 지금 쓰는 아이콘을 바꿔 버리면 곤란해요. 그래서 규칙을 하나 정했어요. **새 배지는 아무것도 고르지 않았거나, 기본 색이거나, 더 낮은 배지를 쓰고 있을 때만** 자동으로 장착돼요. 왕관이나 경쟁전 아이콘을 쓰는 사람의 선택은 건드리지 않아요. 아무것도 고른 적이 없으면 가진 것 중 가장 높은 아이콘이 보여요.' },
        ],
      },
      {
        id: 'missions',
        title: 'HIDDEN MISSION',
        blocks: [
          { type: 'p', text: '같은 날 가장 희귀한 아이콘 세 개를 만들었어요. 순위는 1위 왕관보다도 위예요.' },
          { type: 'cards', items: [
            { tag: 'ALL HARD', title: '모든 어려움', body: '어려움 AI가 있는 모든 게임을 어려움 이상으로 이기기. 백금빛 청록 돌, 은색 월계관, 에메랄드 티아라.' },
            { tag: 'ALL HELL', title: '모든 매우 어려움', body: '매우 어려움이 있는 모든 게임을 이기기. 용암이 갈라진 흑요석 돌, 큰 뿔, 루비 박힌 철관, 일렁이는 불꽃 고리.' },
            { tag: 'TOP 10', title: '모든 게임 상위권', body: '모든 게임 랭킹에 이름을 올리고 평균 순위 10위 이내. 홀로그램 돌, 금색 날개, 도는 프리즘 후광, 보석 왕관.' },
          ] },
          { type: 'p', text: 'TOP 10은 랭킹이 계속 바뀌니까 10분마다 확인해요. 한 번 얻은 미션 아이콘은 계속 가져요. 아이콘 컬렉션 맨 위에는 각자의 미션 진행도를 보여 주는 카드가 있어요. 새 아이콘을 얻으면 다음 방문 때 축하 팝업이 떠요. 가장 좋은 아이콘이 빛줄기가 도는 무대 위로 올라오고, 히든 미션은 우주 버전 연출이에요.' },
          { type: 'p', text: '같은 날 아침에는 컬렉션의 아이콘을 누르면 누가 그 아이콘을 얻었는지 볼 수 있게 했어요. 단 한 명만 가진 아이콘은 카드에 그 사람의 닉네임이 바로 보여요.' },
        ],
      },
      {
        id: 'numbers',
        title: '지금까지 몇 명이 받았나',
        lead: '2026-11-26 14시(KST) 기준, 지금 가지고 있는 아이콘을 종류별로 센 값이에요.',
        blocks: [
          { type: 'table', head: ['종류', '보유 중', '비고'], rows: [
            ['어려움 클리어 배지', '865개 (400명)', '게임마다 따로 세요'],
            ['친구전 승리', '361명', ''],
            ['오픈 대전 승리', '167명', ''],
            ['매우 어려움 클리어', '48명', ''],
            ['플레이 타임 10시간 / 20시간 / 30시간', '42명 / 10명 / 1명', ''],
            ['게임별 1위 왕관', '38개', '지금까지 23개가 다음 1위에게 넘어갔어요'],
            ['2048 블록', '13개 (11명)', ''],
            ['피스 경쟁전 우승 / 오픈 대전 상위', '3개 / 3개', ''],
            ['HIDDEN MISSION ALL HELL', '1명', 'ALL HARD와 TOP 10은 아직 없어요'],
          ] },
          { type: 'p', text: '아이콘을 하나라도 가진 사람은 806명이에요. 같은 시각 가입한 프로필은 2,075개였어요.' },
        ],
      },
    ],
    sources: [
      '`src/components/ProfileIcons.tsx`(parseIcon과 아이콘 종류), `src/components/BadgeIcons.tsx`, `src/components/MissionIcons.tsx`, `src/components/IconCollection.tsx`',
      '커밋 a8a79ac (11/20 돌 아바타), c741f27 (11/25 받는 아이콘), d9bdc7d (11/25 아이콘 컬렉션, 결합·헥사곤 1위), 99b2d34 (11/25 2048 블록 아이콘), 7f6af23 (11/26 업적 배지·HIDDEN MISSION·축하 팝업), fd06803 (11/26 누가 얻었나), fc4ebda (11/26 왕관을 빼앗겼을 때 안내), c39db8c (11/26 배지 디자인)',
      'DB 집계(2026-11-26 14:22 KST): profile_icons를 아이콘 종류별로 센 보유 수·회수 수·보유 인원, 아이콘 보유 인원 합계, profiles 수',
    ],
  },
  en: {
    meta: {
      title: 'Profile icons and badges dev notes — from coloured stones to HIDDEN MISSION | Dev notes',
      description: 'How PUZZLTHINK profile icons grew from a coloured stone beside a ranking into per-game #1 crowns, contest rewards, 2048 blocks, Hard-clear and play-time badges and HIDDEN MISSION icons — with the ranking and auto-equip rules and how many people hold each.',
      keywords: ['PUZZLTHINK icons', 'profile icons', 'game badges', 'hidden mission', 'icon collection', 'achievement system', 'dev notes'],
    },
    title: 'Profile icons and badges dev notes',
    lead: 'How a small stone beside a ranking became a collection in six days.',
    intro: [
      'Every PUZZLTHINK profile icon comes from one template: a round stone like the Wallgo pieces, with two pill-shaped eyes. Each is drawn in the same 100×100 box, so it can be swapped in anywhere a stone appears — rankings, the lounge, the top of a game.',
      'This note follows the commit history as that stone grew from a simple colour marker into crowns, contest rewards, achievement badges and hidden missions.',
    ],
    summary: 'From a coloured stone beside a ranking to per-game #1 crowns, contest rewards, achievement badges and HIDDEN MISSION — the icon order, the auto-equip rule, and who holds what so far.',
    sections: [
      {
        id: 'stones',
        title: 'The start: one colour per nickname',
        blocks: [
          { type: 'p', text: 'On 20 November ranking avatars became PUZZLTHINK stones: a colour for each nickname, gold, silver and bronze crowns for the piece race’s top three, gold for places 4–10. At this point an icon was not something you earned — it just showed a rank.' },
        ],
      },
      {
        id: 'earned',
        title: '25 November: icons you earn',
        blocks: [
          { type: 'p', text: 'Five days later icons could be earned. Four kinds came first:' },
          { type: 'cards', items: [
            { tag: 'w', title: 'Piece race champions', body: 'When a weekly race ends (week 2 ran 11/25–12/1) the top three get jewel icons. The podium previews the icon each place will receive.' },
            { tag: 'h', title: 'Black piece race', body: 'Weekly top three in the race counted in Very Hard AI wins: obsidian stones with horns and a hellfire halo.' },
            { tag: 'm', title: '2048 blocks', body: 'Make a 2048 block in 2048 and the icon is yours on the spot. That night every block up to 131072 got an icon, and making a big block also gives every smaller one.' },
            { tag: 'c', title: 'Per-game #1', body: 'Each game’s ranking #1 holds that game’s icon (a stone in the game’s colour, a gold crown, the game’s emblem). It moves when #1 changes.' },
          ] },
          { type: 'p', text: 'A newly earned icon is **switched on by the server at once**, and a "new icon" popup points to the picker. Week-1 champions and players who had already made 2048 were backfilled. The same night an "icon collection" page appeared, every icon grouped by theme with a one-line condition.' },
        ],
      },
      {
        id: 'crown',
        title: 'Crowns move around',
        blocks: [
          { type: 'p', text: 'The per-game #1 icon is the only one you can **lose**. Rankings change live and every few minutes the crown moves to the current #1; each loss is recorded. On the morning of 26 November players who lost a crown started getting a notice saying who took it, with two buttons: **go get revenge** and **go to icon settings**.' },
          { type: 'p', text: 'For solo games such as Gyulhap and Hexagon the question was what #1 means. They rank by their solo challenge (Gyulhap’s 10 minutes, Hexagon’s challenge), and the crown follows that board.' },
        ],
      },
      {
        id: 'badges',
        title: '26 November: achievement badges',
        lead: 'There had to be icons you could earn without being first.',
        blocks: [
          { type: 'p', text: 'Crowns and contest icons are for a few. So in the early hours of 26 November came **achievement badges**, given for things you have done, ranked just below crowns and contest icons.' },
          { type: 'table', head: ['Badge', 'Condition', 'Look'], rows: [
            ['Hard clear', 'Per game, the first win over its Hard AI', 'A stone in the game’s colour with a little graduation cap and the game’s emblem'],
            ['Friend win', 'Win a friend match', 'A party hat and a heart balloon'],
            ['Open win', 'Win an open match', 'A sweatband and a gold medal'],
            ['Very Hard clear', 'Beat a hell-mode AI once', 'Obsidian, horns, red eyes, a little devil tail'],
            ['Play time', '10, 20 … 100 hours', 'Nightcap → headphones → gold shades → at 100, a winged prism'],
          ] },
          { type: 'p', text: 'Badges are given by the server, checked the moment a clear or a result is saved. Play time starts from recorded puzzle times and otherwise counts only while a game is open and the player is active. Past achievements were backfilled — without changing anyone’s icon, just with a popup.' },
          { type: 'h3', text: 'The equip rule' },
          { type: 'p', text: 'Swapping the icon every time a new one arrives would be annoying, so: **a new badge switches on only if nothing is chosen, a basic colour is in use, or a lower badge is.** Someone using a crown or contest icon keeps their choice. With nothing ever chosen, the best owned icon shows.' },
        ],
      },
      {
        id: 'missions',
        title: 'HIDDEN MISSION',
        blocks: [
          { type: 'p', text: 'The same day brought the three rarest icons, ranked above even the #1 crowns.' },
          { type: 'cards', items: [
            { tag: 'ALL HARD', title: 'Every Hard', body: 'Beat every game that has a Hard AI on Hard or above. A platinum-teal stone, a silver laurel, an emerald tiara.' },
            { tag: 'ALL HELL', title: 'Every Very Hard', body: 'Beat every game that has a Very Hard AI. An obsidian stone cracked with lava, great horns, an iron crown with rubies, a ring of flames.' },
            { tag: 'TOP 10', title: 'High in every game', body: 'Be ranked in every game with an average rank of 10 or better. A holographic stone, gold wings, a turning prism halo, a jewelled crown.' },
          ] },
          { type: 'p', text: 'Because rankings keep moving, TOP 10 is checked every 10 minutes. Mission icons are kept for good once earned. The icon collection opens with a card showing your mission progress, and a new icon gets a celebration popup on your next visit: the best one rises onto a stage of turning light rays, and a hidden mission gets a cosmic version.' },
          { type: 'p', text: 'That morning the collection also learned to show who earned an icon when you tap it; an icon held by only one person shows that player’s nickname right on the card.' },
        ],
      },
      {
        id: 'numbers',
        title: 'Who holds what',
        lead: 'Icons currently held, counted by kind, on 2026-11-26 at 14:00 KST.',
        blocks: [
          { type: 'table', head: ['Kind', 'Held', 'Note'], rows: [
            ['Hard-clear badges', '865 (400 players)', 'counted per game'],
            ['Friend win', '361 players', ''],
            ['Open win', '167 players', ''],
            ['Very Hard clear', '48 players', ''],
            ['Play time 10 h / 20 h / 30 h', '42 / 10 / 1 players', ''],
            ['Per-game #1 crowns', '38', '23 have passed to a new #1 so far'],
            ['2048 blocks', '13 (11 players)', ''],
            ['Piece race champions / open top three', '3 / 3', ''],
            ['HIDDEN MISSION ALL HELL', '1 player', 'no ALL HARD or TOP 10 yet'],
          ] },
          { type: 'p', text: '806 players hold at least one icon, out of 2,075 profiles at the same moment.' },
        ],
      },
    ],
    sources: [
      '`src/components/ProfileIcons.tsx` (parseIcon and the icon kinds), `src/components/BadgeIcons.tsx`, `src/components/MissionIcons.tsx`, `src/components/IconCollection.tsx`',
      'Commits a8a79ac (11/20 stone avatars), c741f27 (11/25 earned icons), d9bdc7d (11/25 icon collection, Gyulhap/Hexagon #1), 99b2d34 (11/25 2048 block icons), 7f6af23 (11/26 badges, HIDDEN MISSION, celebration popup), fd06803 (11/26 who earned it), fc4ebda (11/26 crown-lost notice), c39db8c (11/26 badge designs)',
      'DB aggregates (2026-11-26 14:22 KST): profile_icons counted by icon kind (held, revoked, holders), total icon holders, number of profiles',
    ],
  },
};

export default article;
