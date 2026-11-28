// 히든 워드: 라이어 guide. Rules from supabase/migrations/20271205100000_hidden_word_liar.sql (hwl_cfg: 🔥 at 85,
// turn 20 s, talk 45 s / 60 s for 7+, vote 20 s, runoff 15 s, last words 20 s, decide 15 s, guess 30 s, 3 rounds for ≤6 players and 2 for 7+;
// liar win 3 피스, citizen win 1, 7 a KST day; valid game = 4+ members, spoken clues from half the seats) and the
// similarity tables of 히든 워드 (hw_score). The worked example's numbers were read from hw_score for 냉면 / 김밥.
import type { GameGuide } from './types';

const guide: GameGuide = {
  game: 'hiddenWordLiar',
  origin: { kind: 'original' },
  updated: '2026-11-28',
  related: ['hiddenWord', 'hiddenWordPlus', 'hitStay', 'sniperHoldem'],
  ko: {
    meta: {
      title: '히든 워드: 라이어 — 라이어 게임 온라인 규칙·공략, 4~10명 친구·공개방 | PUZZLTHINK',
      description: '한 명만 다른 단어를 받은 라이어 게임을 히든 워드의 유사도로. 단서마다 정답과의 유사도가 떠요. 규칙, 🔥85+의 뜻, 시민과 라이어의 전략, 공개방 매칭과 피스 보상까지 정리했어요.',
      keywords: ['라이어 게임', '라이어게임 규칙', '라이어 게임 온라인', '히든 워드 라이어', '히든워드 라이어', '라이어 게임 제시어', '파티 게임', '단어 게임', '친구랑 할 게임', '카톡 게임'],
    },
    title: '히든 워드: 라이어 규칙과 공략',
    lead: '숫자는 정직해요. 거짓말은 사람이 하죠.',
    intro: [
      '히든 워드: 라이어는 모두 같은 제시어를 받고 한 마디씩 말하는 **라이어 게임**에, 히든 워드의 **유사도 숫자**를 더한 PUZZLTHINK 오리지널 파티 게임이에요. 4~10명이 하고, 친구방이나 공개방(자동 매칭)에서 해요.',
      '다른 점이 하나 있어요. 라이어는 **자기가 라이어인 줄 몰라요**. 같은 묶음의 닮은 단어(냉면 대신 김밥처럼)를 받고, 다른 사람과 똑같이 말해요. 단서 옆에 뜨는 숫자는 모두 **시민들의 제시어와의 유사도**라서, 라이어의 숫자는 어딘가 미묘하게 어긋나요.',
    ],
    gamePageTitle: '히든 워드: 라이어 — 유사도로 찾는 라이어 게임, 4~10명',
    summary: '라이어는 자기가 라이어인 줄 모른다. 유사도 숫자로 찾는 4~10인 라이어 게임.',
    sections: [
      {
        id: 'rules',
        onGamePage: true,
        title: '규칙 한눈에',
        blocks: [
          { type: 'glossary', items: [
            { term: '인원', def: '4~10명 (공개방은 매칭 5명 이상)' },
            { term: '제시어', def: '시민은 모두 같은 단어, 라이어 1명은 같은 묶음의 닮은 단어. 라이어도 자기가 라이어인 줄 몰라요' },
            { term: '단서', def: '차례대로 명사 하나, 20초. 내 차례엔 테이블 가운데 칸에 적어요. 막히면 ⏱ +30초 연장을 한 판에 한 번(모두에게 보여요). 시간이 지나면 ⏰ 시간 초과로 넘어가요' },
            { term: '🔥85+', def: '유사도 85 이상은 숫자 대신 🔥85+로만 보여요' },
            { term: '바퀴', def: '6명 이하 최대 3바퀴, 7명 이상 최대 2바퀴' },
            { term: '지목', def: '1바퀴부터 매 바퀴 끝에 "지목하자 / 한 바퀴 더" 다수결. 마지막 바퀴 뒤엔 무조건 투표' },
            { term: '최후의 발언', def: '지목된 사람이 20초 동안 채팅으로 변론해요. 그다음 나머지가 검거하기 / 다시 투표하기를 골라요' },
            { term: '라이어 승', def: '엉뚱한 사람을 검거하거나, 지목한 사람을 풀어 주거나, 동점이 두 번 나거나, 검거된 라이어가 정답을 맞히면' },
            { term: '시민 승', def: '라이어를 검거했고, 라이어가 30초 안에 시민 제시어를 못 맞히면' },
          ] },
        ],
      },
      {
        id: 'flow',
        onGamePage: true,
        title: '한 판의 흐름',
        blocks: [
          { type: 'steps', items: [
            { title: '제시어 확인', body: '카드를 꾹 눌러 내 제시어를 봐요. 옆사람이 훔쳐보지 못하게 손을 떼면 다시 가려져요. 카드에는 라이어 여부가 나오지 않아요.' },
            { title: '단서 한 바퀴', body: '서버가 정한 순서로 한 명씩 명사 하나. 사전에 있는 명사만, 내 제시어나 그 일부, 이미 나온 단어는 안 돼요. 시간이 지나면 "…"(침묵)으로 넘어가요.' },
            { title: '토론', body: '45초(7명 이상 60초). 채팅과 빠른 반응으로 몰아가고, 아이콘을 눌러 👁 의심 표시를 붙여요. "지목하자"와 "한 바퀴 더" 중 하나를 골라요.' },
            { title: '지목 투표', body: '의심 가는 사람 아이콘을 눌러요(다시 누르면 바꿀 수 있어요). 최다 득표가 동점이면 그 사람들끼리 결선을 한 번 해요.' },
            { title: '최후의 발언 → 검거 결정', body: '가장 많이 뽑힌 사람이 테이블 가운데로 불려 나와 20초 동안 채팅으로 변론해요(그 사람의 말이 강조돼요). 그다음 나머지가 15초 안에 「검거하기」나 「다시 투표하기」를 골라요. 검거가 더 많으면 검거, 동점이거나 아무도 안 고르면 다시 투표예요. 다시 투표는 한 판에 한 번, 방금 지목된 사람은 빼고 뽑아요. 두 번째 결정에선 「풀어 주기」가 되고, 풀어 주면 라이어 승리예요.' },
            { title: '라이어의 마지막 기회', body: '검거된 사람이 라이어면 그때 처음 "당신이 라이어였어요!"가 떠요. 지금까지의 단서와 숫자를 보고 시민 제시어를 30초 안에 한 번 맞혀요.' },
            { title: '공개', body: '두 제시어, 라이어, 가면으로 숨긴 숫자까지 모두 공개돼요. 단서판에는 단서마다 라이어 제시어 기준 숫자도 함께 보여요.' },
          ] },
        ],
      },
      {
        id: 'numbers',
        onGamePage: true,
        title: '숫자 읽는 법',
        blocks: [
          { type: 'p', text: '모든 숫자는 **시민 제시어**와의 유사도예요(히든 워드와 같은 0~100). 시민이 자기 단어로 말하면 보통 50~84가 나오고, 라이어가 자기 단어(닮은 단어)로 말하면 그보다 조금 낮거나 들쭉날쭉해요. 그래도 묶음이 같아서 크게 겹쳐요.' },
          { type: 'table', caption: '예: 시민 냉면, 라이어 김밥 (실제 유사도)', head: ['단서', '누가', '냉면 기준 (화면 숫자)', '김밥 기준 (공개 때)'], rows: [
            ['얼음물', '시민', '65', '—'],
            ['겨자', '시민', '🔥85+', '—'],
            ['갈빗집', '시민', '82', '—'],
            ['소풍', '라이어', '50', '높음'],
          ] },
          { type: 'callout', tone: 'tip', title: '🔥85+는 양날의 칼', text: '정답에 아주 가까운 단서는 숫자가 가려져요. 시민끼리는 "이 사람 정답 알아"라는 신호지만, 지목된 라이어가 마지막에 정답을 맞힐 때 가장 큰 힌트가 돼요. 시민이라면 60~80대의 애매한 단서가 제일 안전해요.' },
          { type: 'p', text: '색으로도 보여요: 파랑(낮음) → 노랑 → 주황(높음) → 빨강(🔥).' },
        ],
      },
      {
        id: 'tools',
        onGamePage: true,
        title: '쫄깃함을 더하는 도구',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: '🎭 가면', body: '한 판에 한 번, 내 단서의 숫자를 끝날 때까지 "??"로 숨겨요. 낮은 숫자를 숨기고 싶은 사람도, 뜨거운 단서를 보호하고 싶은 시민도 써요. 쓰는 순간 의심받는 건 덤.' },
            { title: '👁 의심 표시', body: '언제든 아이콘을 눌러 한 명에게 눈을 붙여요. 몇 명이 그 사람을 의심하는지 모두에게 보여요.' },
            { title: '🔄 한 바퀴 더', body: '확신이 없으면 한 바퀴 더. 라이어는 시간을 벌고 싶고, 시민은 단서가 늘수록 유리해요. 다수결이라 여기서도 수 싸움이 나요.' },
            { title: '⚖️ 결선', body: '최다 득표 동점이면 그 사람들끼리 한 번 더. 또 동점이면 라이어 승이에요.' },
          ] },
        ],
      },
      {
        id: 'citizen',
        level: 'beginner',
        title: '시민 공략',
        blocks: [
          { type: 'list', items: [
            '**처음엔 묶음 전체에 어울리는 말**(음식, 계절, 탈것)로 시작하세요. 라이어도 따라올 수 있어 숫자만으론 안 갈려요. 두 번째 바퀴에 정답만의 특징을 조금씩 넣어요.',
            '**숫자보다 단어를 보세요.** 라이어의 단어는 묶음은 맞는데 방향이 미묘하게 달라요(냉면 판의 "소풍"처럼). 숫자가 낮아도 시민이 일부러 흐리게 말했을 수 있어요.',
            '**🔥는 아껴요.** 내가 🔥를 내면 지목된 라이어에게 정답을 주는 셈이에요.',
            '**내 숫자가 이상하게 낮다면?** 시민인데 운이 나빴을 수도, 내가 라이어일 수도 있어요. 공개 전엔 아무도 몰라요.',
          ] },
        ],
      },
      {
        id: 'liar',
        level: 'intermediate',
        title: '라이어 공략 (자기가 라이어인 걸 눈치챘다면)',
        blocks: [
          { type: 'list', items: [
            '**내 단서 숫자가 계속 남들보다 낮다면** 라이어일 가능성이 커요. 이때부터는 남의 단서에서 정답을 역추적하세요. 높은 숫자(특히 🔥) 단서를 모으면 정답이 보여요.',
            '**🎭 가면은 지금.** 낮은 숫자를 숨기면 의심이 덜해요. 다만 가면 쓰는 것 자체가 눈에 띄어요.',
            '**"한 바퀴 더"에 표를 던지세요.** 단서가 늘수록 마지막 정답 맞히기가 쉬워져요.',
            '**지목돼도 끝이 아니에요.** 30초 안에 정답을 맞히면 역전승. 단서판의 높은 숫자 단서들을 보고 묶음 안에서 하나를 고르세요.',
          ] },
        ],
      },
      {
        id: 'rewards',
        onGamePage: true,
        title: '보상과 랭킹',
        blocks: [
          { type: 'table', head: ['보상', '공개방 (매칭)', '친구방'], rows: [
            ['피스: 라이어 승 3개 · 시민 승 1개', '○', '○'],
            ['하루 한도', '두 방 합쳐 7개 (한국 시간 하루)', ''],
            ['라이어 아이콘 (라이어로 첫 승)', '○', '○'],
            ['랭킹 "라이어로 N승 · 플레이어로 N승"과 1위 왕관', '○', '×'],
          ] },
          { type: 'p', text: '보상은 로그인 회원 4명 이상이 하고, 절반 이상이 단서를 말한 판에만 나가요. 랭킹은 승점(라이어 승 ×3 + 플레이어 승 ×1) 순서예요.' },
        ],
      },
      {
        id: 'modes',
        title: '공개방과 친구방',
        blocks: [
          { type: 'p', text: '**공개방**: 홈이나 이 페이지에서 "오픈방 참가 신청"을 눌러 두고 다른 게임을 해도 돼요. 10명이 모이면(또는 6명 이상이 3분 넘게 기다리면) 어느 페이지에 있든 팝업이 떠요. 20초 안에 5명 이상 승낙하면 방이 열리고 바로 시작해요. 방장이 없는 사이트 방이라 앱과 웹 어디서든 참가할 수 있어요.' },
          { type: 'p', text: '**친구방**: "친구랑 하기"를 누르면 방이 열리고 카카오톡 초대가 떠요. 링크나 5자리 방 코드로 4~10명이 모이면 방장이 시작해요.' },
        ],
      },
    ],
    faq: [
      { q: '라이어는 자기가 라이어인 걸 아나요?', a: '아니요. 라이어도 평범한 제시어 카드를 받아요. 숫자가 남들과 어긋나는 걸 보고 스스로 눈치채야 해요. 지목되면 그때 처음 알려 줘요.' },
      { q: '숫자는 누구 기준인가요?', a: '모든 단서가 시민 제시어와의 유사도예요. 라이어가 말한 단서도 시민 제시어 기준으로 떠요.' },
      { q: '🔥85+는 뭔가요?', a: '정답과 유사도 85 이상인 단서예요. 숫자를 가려서 라이어가 정답을 바로 알아채지 못하게 해요. 끝나면 실제 숫자가 공개돼요.' },
      { q: '피스는 몇 개까지 받나요?', a: '라이어로 이기면 3개, 시민으로 이기면 1개, 한국 시간 하루에 이 게임에서 7개까지예요. 로그인 회원 4명 이상, 절반 이상이 단서를 말한 판만 보상이 나가요.' },
      { q: '친구방 승리도 랭킹에 들어가나요?', a: '랭킹과 1위 왕관은 공개방 판만 세요. 친구방 승리도 피스와 라이어 아이콘은 받아요.' },
      { q: '채팅에 제시어를 쓰면요?', a: '서버가 막아요. 내 제시어가 들어간 말은 띄어쓰기·점·조사(사과를)·자모(ㅅㅏㄱㅘ)로 바꿔 써도 보내지지 않아요. 상대 쪽 단어가 들어간 말은 보낸 사람 화면에만 그대로 보이고 다른 사람에겐 가려져요. 보낸 사람이 모르는 단어를 알게 되는 일도 없어요.' },
      { q: '검거하기와 다시 투표하기는 어떻게 정해요?', a: '지목된 사람을 뺀 나머지의 다수결이에요. 동점이면 다시 투표예요. 다시 투표는 한 판에 한 번이고, 두 번째엔 풀어 주기(=라이어 승리)가 돼요.' },
      { q: '같은 단어를 다시 써도 되나요?', a: '안 돼요. 그 판에 한 번 나온 단어는 누가 냈든 다시 못 써요. 띄어쓰기나 조사(사과를)를 붙여도 같은 단어로 봐요.' },
      { q: '소리를 끄거나 켜려면요?', a: '방 위쪽 스피커 버튼에서 효과음·진동과 배경음을 따로 켜고 끌 수 있어요. 배경음은 처음엔 꺼져 있어요. 튜토리얼과 도움말 말풍선은 ? 버튼에서 다시 볼 수 있어요.' },
      { q: '몇 명이 있어야 하나요?', a: '4명부터 10명까지요. 공개방은 매칭에서 5명 이상 승낙해야 열려요.' },
    ],
    cta: { title: '오늘의 라이어는 누구?', body: '공개방 신청을 걸어 두거나, 카카오톡으로 친구를 불러 보세요.', button: '라이어 게임 하러 가기' },
  },
  en: {
    meta: {
      title: 'Hidden Word: Liar — online liar game rules and tips, 4–10 players | PUZZLTHINK',
      description: 'A liar game on Hidden Word\'s similarity scores: one player got a different word without knowing it, and every clue shows its similarity to the answer. Rules, what 🔥85+ means, tips for citizens and the liar, matchmaking and rewards.',
      keywords: ['liar game', 'online liar game', 'Hidden Word Liar', 'party word game', 'social deduction word game'],
    },
    title: 'Hidden Word: Liar — rules and tips',
    lead: 'The numbers are honest. People are not.',
    intro: [
      'Hidden Word: Liar is a PUZZLTHINK original party game: the classic liar game, where everyone says one word about a shared secret word, plus Hidden Word\'s **similarity numbers**. 4–10 players, in friend rooms or matchmaking.',
      'One twist: the liar **doesn\'t know they are the liar**. They get a look-alike word from the same group and play like everyone else. Every number is similarity to the **citizens\' word**, so the liar\'s numbers come out subtly off.',
    ],
    gamePageTitle: 'Hidden Word: Liar — a liar game read by similarity, 4–10 players',
    summary: 'The liar doesn\'t know it. A 4–10 player liar game read through similarity numbers.',
    sections: [
      {
        id: 'rules',
        onGamePage: true,
        title: 'Rules at a glance',
        blocks: [
          { type: 'glossary', items: [
            { term: 'Players', def: '4–10 (matchmaking needs 5 accepts)' },
            { term: 'Words', def: 'Citizens share one word; the liar gets a look-alike from the same group and doesn\'t know it' },
            { term: 'Clues', def: 'One noun each in turn, 20 s, typed in the box in the middle of the table. Its similarity to the citizens\' word appears next to it; Stuck? ⏱ +30 s once a game (everyone sees it); no clue in time shows ⏰ Time out' },
            { term: '🔥85+', def: 'Similarity 85 or more shows only as 🔥85+' },
            { term: 'Rounds', def: 'Up to 3 for ≤6 players, 2 for 7+' },
            { term: 'Accusing', def: 'After each round from the first: majority "accuse / one more round"; the last round always goes to the vote' },
            { term: 'Last words', def: 'The accused gets 20 s to make their case in chat; then the others arrest or vote again' },
            { term: 'Liar wins', def: 'If a citizen is arrested, the suspect is let go, a tie repeats, or the arrested liar guesses the word' },
            { term: 'Citizens win', def: 'If the liar is arrested and misses the word in 30 s' },
          ] },
        ],
      },
      {
        id: 'flow',
        onGamePage: true,
        title: 'How a game goes',
        blocks: [
          { type: 'steps', items: [
            { title: 'Check your word', body: 'Hold the card to see it; let go and it hides again. It never says whether you are the liar.' },
            { title: 'A round of clues', body: 'One noun each in the server\'s order. Dictionary nouns only; not your word, part of it, or a word already said. Time out = a silent "…".' },
            { title: 'Talk', body: '45 s (60 s for 7+). Chat, quick reactions and 👁 marks. Pick "accuse" or "one more round".' },
            { title: 'Vote', body: 'Tap a player (tap again to change). A tie for most votes goes to one runoff.' },
            { title: 'Last words, then the decision', body: 'The player with the most votes is pulled to the centre for 20 s of last words in chat (their lines are highlighted). Then everyone else has 15 s: Arrest or Vote again. More arrests = arrested; a tie or no choices = vote again. Vote again happens once a game and leaves the accused out; the second time the choice is Let go, which means the liar wins.' },
            { title: 'The liar\'s last chance', body: 'If the arrested player is the liar, they learn it now and get one 30 s guess at the citizens\' word.' },
            { title: 'Reveal', body: 'Both words, the liar and the masked numbers are shown, with each clue\'s similarity to the liar\'s word too.' },
          ] },
        ],
      },
      {
        id: 'numbers',
        onGamePage: true,
        title: 'Reading the numbers',
        blocks: [
          { type: 'p', text: 'Every number is similarity to the **citizens\' word** (0–100, as in Hidden Word). Citizens\' clues usually land 50–84; the liar\'s land a bit lower or uneven, but the groups overlap a lot.' },
          { type: 'callout', tone: 'tip', title: '🔥85+ cuts both ways', text: 'A very close clue hides its number. It tells citizens "this one knows", but it is also the best hint for an accused liar\'s final guess. As a citizen, vague clues in the 60s–80s are safest.' },
        ],
      },
      {
        id: 'tools',
        onGamePage: true,
        title: 'Tools',
        blocks: [
          { type: 'cards', columns: 2, items: [
            { title: '🎭 Mask', body: 'Once a game, hide your clue\'s number until the end. Using it is suspicious in itself.' },
            { title: '👁 Suspicion', body: 'Tap a player any time; everyone sees how many suspect them.' },
            { title: '🔄 One more round', body: 'The liar wants time; citizens want more clues. A majority decides.' },
            { title: '⚖️ Runoff', body: 'A tie for most votes gets one more vote; another tie means the liar wins.' },
          ] },
        ],
      },
      {
        id: 'rewards',
        onGamePage: true,
        title: 'Rewards and ranking',
        blocks: [
          { type: 'table', head: ['Reward', 'Matchmaking', 'Friend room'], rows: [
            ['Pieces: liar win 3, citizen win 1', 'yes', 'yes'],
            ['Daily limit', '7 across both (Korean day)', ''],
            ['Liar icon (first liar win)', 'yes', 'yes'],
            ['Ranking and #1 crown', 'yes', 'no'],
          ] },
          { type: 'p', text: 'Rewards need 4+ signed-in players and clues from at least half the table. The ranking orders by liar wins ×3 + player wins.' },
        ],
      },
    ],
    faq: [
      { q: 'Does the liar know?', a: 'No. They get an ordinary word card and have to notice from the numbers. They are told only when accused.' },
      { q: 'Whose word are the numbers against?', a: 'Always the citizens\' word, the liar\'s clues included.' },
      { q: 'How many pieces can I earn?', a: '3 for a liar win, 1 for a citizen win, up to 7 a day from this game.' },
      { q: 'What if someone writes a game word in chat?', a: 'The server stops it. A line with your own word is refused, even with spaces, dots, particles or loose jamo. A line with the other game word shows as written only on the sender\'s screen and is hidden for everyone else, so the sender learns nothing.' },
      { q: 'Can a word be used twice?', a: 'No. A word said once in a game can\'t be said again by anyone, even with spaces or a particle stuck on.' },
      { q: 'How do I turn sound on or off?', a: 'The speaker button at the top of the room switches effects (with vibration) and music separately. Music starts off. The ? button reopens the tutorial and the tips.' },
      { q: 'Do friend games count for the ranking?', a: 'No, only matchmaking games. Friend wins still earn pieces and the liar icon.' },
    ],
    cta: { title: 'Who is the liar today?', body: 'Join matchmaking or invite friends on KakaoTalk.', button: 'Play Hidden Word: Liar' },
  },
};

export default guide;
