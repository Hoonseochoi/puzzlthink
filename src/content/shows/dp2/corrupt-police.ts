import type { ShowGame } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast, namuDay } from './shared';

const game: ShowGame = {
  slug: 'corrupt-police',
  kind: 'main',
  when: { ko: '1일차', en: 'Day 1' },
  related: ['russianRoulette', 'piggyBank', 'blindGomoku'],
  updated: '2026-11-26',
  sources: [namuDay(1), broadcast],
  ko: {
    meta: {
      title: '부패 경찰 규칙 — 데블스플랜2(데스룸) 1일차 메인매치, 도둑과 경찰과 배신자',
      description: '데블스 플랜: 데스룸(데블스플랜2) 첫 메인매치 부패 경찰의 규칙을 정리했어요. 경찰 12명과 숨은 부패 경찰 2명, 도둑 2명, 지하철 노선도 게임판, 조사와 체포, 종료 조건, 부패 경찰 투표와 피스 분배까지.',
      keywords: ['부패 경찰', '데블스플랜2 부패 경찰', '데블스 플랜 데스룸 부패 경찰', '데블스플랜2 메인매치', '데블스 플랜 시즌2 1일차'],
    },
    title: '부패 경찰 — 데블스플랜2 1일차 메인매치',
    name: '부패 경찰',
    lead: '경찰은 숨은 도둑을 쫓고, 도둑은 피스를 훔쳐요. 그런데 경찰 가운데 둘은 도둑 편이에요.',
    summary: '지하철 노선도 판에서 경찰 팀이 숨은 도둑을 쫓는 추적 게임. 경찰 안에는 도둑과 한편인 부패 경찰이 숨어 있어요.',
    setup: [
      { type: 'list', items: [
        '**인원**: 14명. 추첨으로 역할을 받아요. **경찰 12명**(4명씩 3팀, 그중 2명은 부패 경찰)과 **도둑 2명**이에요.',
        '**정체**: 도둑이 누구인지는 모두에게 공개돼요. 부패 경찰 두 사람은 서로를 알고, 도둑도 부패 경찰이 누구인지 알아요. 부패 경찰은 서로 다른 두 팀에 한 명씩 들어가 있어서, 한 팀은 깨끗한 경찰 4명이에요.',
        '**게임판**: 서울 지하철 노선도를 본뜬 판. 28개 역에 피스가 숨겨져 있고, 위치는 도둑만 알아요.',
        '**공간**: 도둑 팀과 경찰 세 팀은 라운드 동안 서로 다른 방에서 진행해요.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: '배치', body: '경찰이 먼저 말을 놓고(위치는 모두에게 공개), 마지막에 도둑이 놓아요. 한 칸에 여러 말이 있어도 되지만, 도둑은 피스가 있는 칸에는 처음에 놓을 수 없어요. 도둑의 위치는 잡히기 전까지 공개되지 않아요.' },
        { title: '도둑 이동 (3분)', body: '도둑은 최대 2칸까지 움직여요. 피스가 있는 역을 지나가거나 멈추면 그 피스를 가져가요. 이동이 끝나면 도둑의 위치가 부패 경찰 두 명에게 무전으로 전해져요.' },
        { title: '경찰 행동 (팀마다 5분)', body: '팀 순서대로, 팀원 4명이 한 명씩 **조사** 또는 **체포**를 해요. 둘 다 지금 칸이나 1칸 이동한 칸에서 할 수 있어요. 팀 순서는 라운드마다 돌아가요.' },
        { title: '조사', body: '그 칸을 도둑이 한 번이라도 지나갔는지("단서 있음/없음")를 조사한 사람만 알아요. 결과는 말로 팀에 전하는데, 거짓말해도 돼요. 원하면 다른 팀에도 공유할 수 있고, 공유하면 어느 칸에서 단서가 나왔는지 모두에게 공지돼요.' },
        { title: '체포', body: '그 칸에 도둑이 있으면 바로 체포돼요(결과는 전체 공개). 부패 경찰이 체포하면 도둑이 있어도 실패로 발표돼요. 잡힌 도둑은 훔친 피스를 잃고 따로 격리돼요.' },
      ] },
      { type: 'p', text: '5·10라운드가 끝나면 도둑이 훔친 피스 수가 공개되고, 14라운드 전까지는 다른 팀 방이 아닌 곳에서 자유롭게 대화할 수 있어요.' },
    ],
    win: [
      { type: 'list', items: [
        '**도둑이 피스 12개를 모으거나, 경찰이 도둑 둘을 모두 잡거나, 15라운드가 끝나면** 게임이 끝나요.',
        '끝나면 경찰 팀마다 팀 안의 부패 경찰로 의심되는 사람을 투표해요("없음"도 가능). 팀에서 가장 많이 표를 받은 사람이 부패 경찰로 지목돼요.',
        '**일반 경찰**: 도둑 체포 1명당 피스 1개, 부패 경찰을 맞게 지목하면 1개. 단, 부패 경찰로 잘못 지목당한 일반 경찰은 체포 보상을 받지 못해요.',
        '**도둑**: 훔친 피스의 절반을 부패 경찰에게 넘기고, 남은 피스를 살아남은 도둑끼리 나눠요. 부패 경찰이 둘 다 지목되면 넘기지 않아요.',
        '**부패 경찰**: 지목되지 않고 살아남은 부패 경찰이 도둑에게서 받은 피스를 나눠 가져요.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        '팀 안의 행동 순서는 자유롭고, 같은 행동을 연달아 해도 돼요.',
        '"없음"이 가장 많으면 그 팀은 아무도 지목하지 않아요. 실제로 그 팀에 부패 경찰이 없었어도 추가 보상은 없어요.',
        '상금 미션: 10라운드 전에 게임을 끝내면 상금이 쌓였어요(처음 1억 원에서 라운드마다 2천만 원씩 줄어드는 방식).',
      ] },
    ],
    analysis: [
      { type: 'p', text: '부패 경찰은 **추적 게임과 마피아 게임을 겹쳐 놓은** 구조예요. 경찰은 도둑의 위치를 추리하는 동시에, 팀 안의 거짓 보고를 가려내야 해요.' },
      { type: 'cards', items: [
        { title: '단서의 신뢰도', body: '조사 결과는 조사한 사람만 보고 말로 전하므로, 부패 경찰은 "단서 없음"이라는 거짓말 한 번으로 수사를 엉뚱한 곳으로 돌릴 수 있어요. 그래서 같은 칸을 두 사람이 따로 조사해 결과를 비교하는 것이 가장 확실한 검증이에요. 다만 그만큼 행동을 낭비해요.' },
        { title: '부패 경찰의 체포는 자백이 될 수 있어요', body: '부패 경찰이 체포를 시도하면 무조건 실패로 나오므로, 단서로 보아 도둑이 있을 법한 칸에서 체포가 실패하면 의심을 받아요. 부패 경찰은 체포 대신 조사를 하며 거짓 정보를 흘리는 편이 덜 드러나요.' },
        { title: '시간은 도둑 편', body: '도둑은 한 라운드에 2칸밖에 못 가지만 피스 12개만 모으면 끝나고, 경찰은 15라운드 안에 둘을 다 잡아야 해요. 경찰 세 팀이 정보를 공유하지 않으면 수색 범위가 겹치고 도둑에게 시간을 벌어 줘요.' },
      ], columns: 1 },
    ],
    similar: [
      { name: '스코틀랜드 야드 (Scotland Yard)', players: '2–6명', alike: '런던 지도 위에서 형사들이 숨어 움직이는 미스터 X를 쫓는 추적 게임이에요. 도둑의 위치가 잘 드러나지 않는 점이 같아요.', differs: '스코틀랜드 야드에는 형사 안의 배신자가 없고, 미스터 X는 정해진 라운드에만 위치를 드러내요.' },
      { name: '레지스탕스 (The Resistance)', players: '5–10명', alike: '팀 안에 정체를 숨긴 스파이가 있고, 투표와 발언으로 그를 찾아내요.', differs: '레지스탕스는 판 위의 추적이 없고, 임무 성공과 실패로만 진행돼요.' },
    ],
    sourceNote: ONE_SOURCE_KO,
  },
  en: {
    meta: {
      title: "Corrupt Police rules — The Devil's Plan 2 (Death Room), day 1 main match",
      description: "The rules of Corrupt Police, the first main match of The Devil's Plan: Death Room (season 2): twelve police with two hidden corrupt officers, two thieves, a subway-map board, investigating and arresting, the end conditions, the corrupt-officer vote and how pieces are shared.",
      keywords: ['Corrupt Police', "Devil's Plan 2 Corrupt Police", "Devil's Plan Death Room", "Devil's Plan season 2 main match"],
    },
    title: "Corrupt Police — The Devil's Plan 2, day 1 main match",
    name: 'Corrupt Police',
    lead: 'The police hunt hidden thieves, the thieves steal pieces — and two of the police are on the thieves’ side.',
    summary: 'Police teams chase hidden thieves across a subway-map board, with corrupt officers hiding among them.',
    setup: [
      { type: 'list', items: [
        '**Players**: 14, given roles by draw: **12 police** (three teams of four, two of them corrupt) and **2 thieves**.',
        '**Identities**: the thieves are announced to everyone. The two corrupt officers know each other, and the thieves know them too. They sit in two different teams, so one team is four honest officers.',
        '**Board**: modelled on the Seoul subway map, with pieces hidden at 28 stations; only the thieves know where.',
        '**Rooms**: the thieves and each police team play from separate rooms.',
      ] },
    ],
    flow: [
      { type: 'steps', items: [
        { title: 'Placing', body: 'The police place first (visible to all), then the thieves. Pieces may share a cell, but a thief may not start on a cell with a piece. A thief’s position stays hidden until caught.' },
        { title: 'Thieves move (3 minutes)', body: 'Each thief moves up to two cells, taking any piece on a station it passes or stops at. Afterwards the corrupt officers are told the thieves’ positions by radio.' },
        { title: 'Police act (5 minutes per team)', body: 'Team by team, each of the four officers **investigates** or **arrests**, at their cell or after moving one cell. Team order rotates each round.' },
        { title: 'Investigate', body: 'Only the investigator learns whether a thief ever passed that cell ("clue" or "no clue"), and reports it to the team aloud — possibly lying. They may also share it, announcing to all teams where a clue was found.' },
        { title: 'Arrest', body: 'A thief on that cell is caught at once, announced to all. A corrupt officer’s arrest always fails, even on the thief. A caught thief loses their stolen pieces and is isolated.' },
      ] },
      { type: 'p', text: 'After rounds 5 and 10 the thieves’ haul is announced, and until round 14 players may talk freely outside other teams’ rooms.' },
    ],
    win: [
      { type: 'list', items: [
        'It ends when **the thieves have 12 pieces, the police have caught both, or round 15 ends**.',
        'Each police team then votes on who in their team is corrupt ("nobody" is allowed); the most-voted is named.',
        '**Honest officers**: a piece per thief caught and a piece for naming a corrupt officer — but an honest officer wrongly named gets no arrest reward.',
        '**Thieves**: hand half of their haul to the corrupt officers, and surviving thieves split the rest — unless both corrupt officers were named.',
        '**Corrupt officers**: those not named split what the thieves handed over.',
      ] },
    ],
    exceptions: [
      { type: 'list', items: [
        'Officers in a team act in any order and may repeat the same action.',
        'If "nobody" wins a team’s vote, nobody is named, and there is no bonus even if the team truly had no corrupt officer.',
        'Prize mission: ending before round 10 added prize money (₩100m, minus ₩20m per later round).',
      ] },
    ],
    analysis: [
      { type: 'p', text: 'Corrupt Police lays **a hunting game over a mafia game**: officers must deduce where the thieves are while filtering false reports from inside their own team.' },
      { type: 'cards', items: [
        { title: 'How far to trust a clue', body: 'Only the investigator sees the result, so one lie of "no clue" sends a search the wrong way. Two officers checking the same cell is the surest test, at the cost of actions.' },
        { title: 'A corrupt arrest can be a confession', body: 'A corrupt officer’s arrest always fails, so a failed arrest exactly where the clues point draws suspicion. Investigating and spreading false information is less exposed.' },
        { title: 'Time is on the thieves’ side', body: 'Thieves move only two cells but need just 12 pieces; police must catch both within 15 rounds. Teams that do not share information search the same ground and buy the thieves time.' },
      ], columns: 1 },
    ],
    similar: [
      { name: 'Scotland Yard', players: '2–6', alike: 'Detectives chase a hidden Mr X across a map of London; the fugitive’s position is mostly unknown.', differs: 'There is no traitor among the detectives, and Mr X surfaces on fixed rounds.' },
      { name: 'The Resistance', players: '5–10', alike: 'Hidden spies sit in the group, found through votes and talk.', differs: 'There is no board chase; it runs on missions succeeding or failing.' },
    ],
    sourceNote: ONE_SOURCE_EN,
  },
};

export default game;
