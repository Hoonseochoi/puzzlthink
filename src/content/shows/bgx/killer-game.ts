import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'killer-game',
  kind: 'money',
  when: { ko: '6일차', en: 'Day 6' },
  related: ['piggyBank', 'russianRoulette', 'heavy13'],
  updated: '2026-11-26',
  sources: [namuDay('6'), broadcast],
  ko: {
    meta: {
      title: '살인마 게임 규칙 — 피의 게임X 6일차 머니 챌린지, 방 카드로 하는 마피아',
      description: '피의 게임X 6일차 머니 챌린지 살인마 게임의 규칙을 정리했어요. 12인 개인전, 살인마·시민·중립 세 진영과 직업 12개, 낮 토론과 밤의 방 선택, 단 둘이 남은 방의 살해, 최종 투표, 직업별 승리 조건과 아이템까지.',
      keywords: ['살인마 게임', '피의 게임X 살인마 게임', '피의게임X 머니 챌린지', '마피아 게임', '피의게임X'],
    },
    title: '살인마 게임 — 피의 게임X 6일차 머니 챌린지',
    name: '살인마 게임',
    lead: '밤마다 여섯 개의 방 중 하나로 숨어요. 살인마와 단둘이 같은 방에 들어간 사람이 희생돼요.',
    summary: '방 카드로 밤에 숨을 곳을 고르는 마피아 게임. 살인마·시민·중립 진영이 저마다의 승리 조건을 노리는 12인 개인전.',
    setup: [
      { type: 'list', items: [
        '**인원**: 12명의 개인전(이 시점에 팀이 해체됐어요).',
        '**직업**: 비공개 추첨으로 정해요.',
        '**방 카드**: A–F 여섯 장.',
        '**라운드**: 10라운드, 낮과 밤으로 이루어져요.',
      ] },
      { type: 'table', head: ['진영', '직업', '목표'], rows: [
        ['살인마 (3)', '살인마, 추종자, 부패경찰', '시민을 제거하고 살인마가 살아남기'],
        ['시민 (6)', '경찰, 교도관, 법의학자, 초감각자, 목격자, 시민', '살인마 저지'],
        ['중립 (3)', '사이코패스, 소매치기, 도박꾼', '각자의 독자적인 조건'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '낮', body: '전날 밤의 사망자를 확인하고 30분 동안 토론해요. 이때 아이템을 사고 쓰거나 능력을 발동할 수 있어요.' },
        { title: '밤', body: '방 카드 6장 중 2장을 뽑아, 그중 원하는 방 한 곳으로 가요. 같은 방에 누가 있는지는 알 수 없어요.' },
        { title: '살해', body: '살인마와 **단둘이** 같은 방에 있게 된 한 사람이 살해돼요.' },
        { title: '최종 투표', body: '살인마가 3명을 살해하면 살아남은 사람들이 투표해요. 살인마가 지목되면 시민 진영, 아니면 살인마 진영이 이겨요.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**살인마**: 3명을 살해하고 최종 투표에서 지목되지 않기. **추종자**: 살인마의 승리.',
        '**부패경찰**: 살인마의 패배 또는 본인 사망 — 이름과 달리 살인마 편의 승리가 조건이 아니에요.',
        '**경찰 등 시민**: 살인마의 패배(경찰은 본인이 죽으면 패배).',
        '**사이코패스**: 누구든 3명이 살해되기. **소매치기**: 절도 3번 성공. **도박꾼**: 5라운드 안에 이길 진영을 맞히는 베팅에 성공.',
        '승리 조건을 채운 사람은 각자 개인 자금 2,000만 원과 탈락 면제권을 받아요.',
      ] },
    ],
    exceptions: [
      { type: 'table', head: ['직업', '능력'], rows: [
        ['살인마', '단둘이 같은 방이면 살해. 조건에 따라 방을 자유롭게 고를 수 있어요. 추종자·부패경찰의 정체를 알아요.'],
        ['추종자 · 부패경찰', '살인마의 정체를 알고, 살해당하지 않아요(감옥 예외). 부패경찰은 한 명을 지목해 함께 게임에서 빠지는 체포 능력이 있어요.'],
        ['경찰', '한 명을 지목해 체포할 수 있고, 살해당하지 않아요(감옥 예외).'],
        ['교도관', '라운드마다 한 명을 감옥에 가둬요. 같은 사람을 두 라운드 연속 가둘 수 없어요. 갇힌 사람은 그 라운드에 방을 고르거나 아이템·능력을 쓸 수 없어요.'],
        ['법의학자', '살해가 일어나면 한 명이 살인마인지 조사할 수 있어요.'],
        ['초감각자 · 목격자', '초감각자는 자기 방의 인원 수를, 목격자는 옆방에서 살해가 일어나면 그 위치를 알아요.'],
        ['소매치기', '단둘이 같은 방이면 절도. 조건에 따라 방을 자유롭게 골라요.'],
      ] },
      { type: 'list', items: [
        '아이템(1,000만 원): **방 지정권**(밤에 원하는 방을 직접 고르기), **탈옥권**(구속 즉시 해제).',
      ] },
    ],
    analysis: [
      { type: 'p', text: '살인마 게임은 마피아 게임에 **"단둘이 같은 방"이라는 우연**을 더했어요. 살인마도 누구를 죽일지 고를 수 없고, 방에 세 명 이상이 모이면 아무도 죽지 않아요.' },
      { type: 'cards', items: [
        { title: '여럿이 모이면 안전해요', body: '살해는 살인마와 단둘일 때만 일어나므로, 믿는 사람끼리 같은 방에 모이면 안전해요. 그런데 방 카드 2장 중에서만 고를 수 있어 약속한 방을 못 고를 수도 있고, 방 지정권이 그 문제를 풀어 줘요. 아이템의 가치가 "약속을 지킬 수 있게 해 주는 것"에 있어요.' },
        { title: '3명의 살해가 시계예요', body: '살인마가 3명을 죽이는 순간 최종 투표가 열려요. 10라운드 안에 3명이 죽지 않으면 살인마는 져요. 시민은 시간을 끌수록 유리하고, 사이코패스는 반대로 3명이 죽기를 바라요. 진영마다 원하는 속도가 다르다는 점이 토론의 핵심 정보예요.' },
        { title: '부패경찰의 이상한 목표', body: '부패경찰은 살인마의 정체를 알면서도 살인마가 지거나 자기가 죽으면 이겨요. 그래서 체포 능력으로 살인마를 데리고 함께 빠지는 것이 가장 직접적인 승리 수단이 될 수 있어요. 겉보기 진영과 실제 목표가 다른 직업이 섞여 있어, 같은 진영이라는 말만으로는 믿을 수 없어요.' },
        { title: '정보 직업의 조합', body: '초감각자는 인원 수를, 목격자는 옆방의 살해를, 법의학자는 조사를 해요. 하나씩은 약하지만 합치면 "그 방에 둘이 있었고 한 명이 죽었다 → 남은 한 명"처럼 살인마를 좁힐 수 있어요. 문제는 누가 진짜 정보 직업인지를 서로 믿어야 한다는 거예요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '마피아 / 늑대인간 (Werewolf)', players: '7명 이상', alike: '밤에 숨은 살인자가 행동하고, 낮에 토론과 투표로 범인을 찾는 정체 숨김 게임이에요. 직업마다 특수 능력이 있는 것도 같아요.', differs: '마피아는 살인자가 피해자를 직접 골라요. 살인마 게임은 방 선택의 우연으로 희생자가 정해져요.' },
      { name: '시크릿 히틀러 (Secret Hitler)', players: '5–10명', alike: '숨은 진영과 정체를 아는 동료, 그리고 특정 인물을 지목하는 투표가 승부를 정해요.', differs: '시크릿 히틀러는 정책 카드를 통과시키는 게임이고, 죽음은 처형 능력으로만 일어나요.' },
    ],
    sourceNote: ONE_SOURCE_KO + ' 직업별 능력의 세부 조건(방 선택 자유의 조건 등)과 히든 아이템은 확인되지 않아 적지 않았어요.',
  },
  en: {
    meta: {
      title: 'Killer Game rules — The Bloody Game X, day 6 money challenge (mafia with room cards)',
      description: 'The rules of Killer Game from The Bloody Game X (피의 게임X): a twelve-player game with killer, citizen and neutral sides and twelve roles, daytime debate and night-time room choices, deaths when alone with the killer, the final vote, role win conditions and items.',
      keywords: ['Killer Game', 'Bloody Game X Killer Game', 'mafia game', '피의 게임X'],
    },
    title: 'Killer Game — The Bloody Game X, day 6 money challenge',
    name: 'Killer Game',
    lead: 'Each night you hide in one of six rooms. Whoever ends up alone in a room with the killer dies.',
    summary: 'A mafia game where room cards decide where you hide at night; killer, citizen and neutral roles chase their own wins.',
    setup: [
      { type: 'list', items: [
        '**Players**: 12, each for themselves (teams had been dissolved).',
        '**Roles**: dealt secretly.',
        '**Room cards**: A–F.',
        '**Rounds**: ten, each a day and a night.',
      ] },
      { type: 'table', head: ['Side', 'Roles', 'Aim'], rows: [
        ['Killer (3)', 'Killer, Follower, Corrupt Cop', 'Remove citizens with the killer surviving'],
        ['Citizens (6)', 'Police, Warden, Coroner, Psychic, Witness, Citizen', 'Stop the killer'],
        ['Neutral (3)', 'Psychopath, Pickpocket, Gambler', 'Their own conditions'],
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Day', body: 'See who died overnight and debate for 30 minutes; items and abilities may be used.' },
        { title: 'Night', body: 'Draw two of the six room cards and go to one of those rooms. You do not know who else is there.' },
        { title: 'Killing', body: 'A player **alone** in a room with the killer is killed.' },
        { title: 'Final vote', body: 'Once the killer has killed three, the survivors vote; naming the killer wins for the citizens, otherwise the killer’s side wins.' },
      ] },
    ],
    win: [
      { type: 'list', items: [
        '**Killer**: three kills and not named in the final vote. **Follower**: the killer wins.',
        '**Corrupt Cop**: the killer loses, or the Corrupt Cop dies — despite the side, not a killer win.',
        '**Police and citizens**: the killer loses (police lose if they die).',
        '**Psychopath**: three people killed. **Pickpocket**: three successful thefts. **Gambler**: correctly bet within five rounds on the winning side.',
        'Everyone who meets their condition wins ₩20 million and immunity.',
      ] },
    ],
    exceptions: [
      { type: 'table', head: ['Role', 'Ability'], rows: [
        ['Killer', 'Kills when alone with one player; may choose rooms freely under some conditions; knows the Follower and Corrupt Cop.'],
        ['Follower · Corrupt Cop', 'Know the killer and cannot be killed (except in jail). The Corrupt Cop can arrest one player, leaving the game with them.'],
        ['Police', 'Can arrest one player; cannot be killed (except in jail).'],
        ['Warden', 'Jails one player per round, never the same player twice running; a jailed player cannot pick a room or use items or abilities that round.'],
        ['Coroner', 'After a killing, may check whether one player is the killer.'],
        ['Psychic · Witness', 'The Psychic learns how many share their room; the Witness learns where a killing happened in an adjacent room.'],
        ['Pickpocket', 'Steals when alone with one player; may choose rooms freely under some conditions.'],
      ] },
      { type: 'list', items: [
        'Items (₩10 million): **room choice** (pick your room at night) and **jailbreak** (end your detention at once).',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Killer Game adds **chance meetings** to mafia: the killer cannot choose a victim, and a room with three or more people is safe.' },
      { type: 'cards', items: [
        { title: 'Safety in numbers', body: 'Kills need the killer alone with one player, so trusted players gathering in one room are safe — but you can only choose between two drawn rooms, and may miss the agreed one. The room-choice item’s value is that it lets you keep a promise.' },
        { title: 'Three deaths are the clock', body: 'The third kill opens the final vote; without three kills in ten rounds the killer loses. Citizens want time to pass, the Psychopath wants bodies. Who wants which pace is the debate’s key information.' },
        { title: 'The Corrupt Cop’s odd goal', body: 'Knowing the killer, the Corrupt Cop wins if the killer loses or they die, so arresting the killer and leaving together may be their most direct win. Roles whose apparent side differs from their goal mean "I’m on your side" proves little.' },
        { title: 'Combining information roles', body: 'Head count, nearby kills and an investigation are weak alone but together can pin the killer ("two were in that room, one died — the other"). The hard part is trusting who really holds those roles.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Mafia / Werewolf', players: '7+', alike: 'Hidden killers act at night and the town debates and votes by day; roles have special powers.', differs: 'The killers choose their victims; in Killer Game room choices decide by chance.' },
      { name: 'Secret Hitler', players: '5–10', alike: 'Hidden sides, teammates who know each other, and a vote naming one person decide it.', differs: 'It is about passing policy cards; deaths only come from execution powers.' },
    ],
    sourceNote: ONE_SOURCE_EN + ' Detailed conditions of some abilities (such as free room choice) and the hidden item could not be confirmed and are left out.',
  },
};

export default game;
