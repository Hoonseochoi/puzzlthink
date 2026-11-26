import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'cooperative-vs-competitive',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'fourThree', ko: '세 명이 힘을 합쳐 스페셜 게스트의 3목을 막으면서, 동시에 서로 피스를 더 따려고 경쟁하는 반협력 게임이에요.', en: 'Semi-cooperative: three players team up to stop the special guest’s three in a row while racing each other for pieces.' },
    { game: 'heavy13', ko: '모두가 모두와 겨루는 4~7인 게임. 벌점을 남에게 떠넘기는 눈치 싸움이에요.', en: 'Everyone against everyone, 4–7 players, pushing penalties onto someone else.' },
    { game: 'russianRoulette', ko: '6명이 크레딧을 몰래 쓰며 살아남는 게임. 누구와 같은 편처럼 움직일지가 생존을 가르기도 해요.', en: 'Six players secretly spend credits to survive; who you act in step with can decide it.' },
    { game: 'equationSignal', ko: '혼자서는 퍼즐, 친구와 하면 같은 수식을 누가 먼저 찾나 겨루는 경쟁이 돼요.', en: 'A puzzle alone; with friends, a race to find the same equation first.' },
    { game: 'slitherlink', ko: '혼자 푸는 논리 퍼즐이지만 기록 랭킹과 맵 뺏기로 다른 사람과 간접적으로 겨뤄요.', en: 'A solo logic puzzle, with rankings and map-stealing for indirect competition.' },
  ],
  related: ['party-games', 'zero-sum', 'length-and-player-count', 'bluffing-deduction', 'what-to-play'],
  sources: [
    { title: 'Pandemic (board game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pandemic_(board_game)' },
    { title: 'Pandemic', site: 'Z-Man Games', url: 'https://zmangames.com/en/products/pandemic' },
    { title: 'Pandemic: the game gone viral', site: 'Think Global Health', url: 'https://www.thinkglobalhealth.org/article/pandemic-game-gone-viral' },
    { title: 'The history of the Spiel des Jahres, part three', site: 'Zatu Games', url: 'https://zatu.com/the-history-of-the-spiel-des-jahres-part-three-big-names-party-games-2011-2020/' },
    { title: 'Template: Spiel des Jahres', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Template:Spiel_des_Jahres' },
  ],
  ko: {
    meta: {
      title: '협력 게임과 경쟁 게임 — 함께 이기는 게임, 서로 이기는 게임의 차이',
      description: '모두가 한 팀인 협력 게임, 팀 대 팀, 반협력, 한 명 대 여러 명까지. 협력과 경쟁이 게임 안에서 섞이는 방식과 각각의 재미, 협력 게임의 고질적인 문제, 팬데믹·하나비 같은 대표작과 PUZZLTHINK 게임을 정리했어요.',
      keywords: ['협력 게임', '협력 보드게임', '경쟁 게임', '반협력 게임', '팀 게임', '팬데믹 보드게임', '하나비'],
    },
    title: '협력 게임과 경쟁 게임',
    lead: '마주 앉은 사람은 적일까요, 동료일까요? 그 답이 게임의 분위기를 통째로 바꿔요.',
    intro: [
      '대부분의 보드게임은 “누가 이기나”를 겨뤄요. 그런데 어떤 게임에서는 모두가 같은 편이 되어 게임 자체와 싸워요. 또 어떤 게임은 같은 편인 척하다가 마지막에 한 명만 웃기도 해요.',
      '플레이어 사이의 관계는 장르를 가르는 아주 중요한 축이에요. 같은 규칙이라도 협력이냐 경쟁이냐에 따라 대화의 내용, 승리의 기분, 지고 나서의 분위기가 전혀 달라져요. 이 글에서는 그 관계가 어떤 모양들로 나타나는지 정리해요.',
    ],
    summary: '모두가 한 팀인 게임부터 같은 편인 척하는 게임까지. 협력과 경쟁이 섞이는 여러 모양과 각각의 재미, 협력 게임의 고질적인 문제를 정리했어요.',
    sections: [
      sec('shapes', '플레이어 관계의 다섯 가지 모양', [
        table(
          ['모양', '어떻게', '분위기'],
          [
            ['모두 대 모두', '각자 자기 승리를 노려요.', '가장 흔한 형태. 견제와 눈치가 많아요.'],
            ['일대일', '두 사람이 정면으로 겨뤄요.', '한쪽의 이득이 곧 다른 쪽의 손해예요.'],
            ['팀 대 팀', '편을 나눠 팀끼리 겨뤄요.', '같은 팀 안에서는 협력, 팀 사이에서는 경쟁이에요.'],
            ['완전 협력', '모든 플레이어가 한 팀으로 게임과 싸워요.', '함께 이기고 함께 져요.'],
            ['반협력', '함께 막아야 할 위협이 있지만, 승자는 한 명이에요.', '도와야 하지만 너무 돕고 싶지는 않은 묘한 긴장이 있어요.'],
          ],
        ),
        p('여기에 **한 명 대 여러 명**(한 사람이 나머지 모두와 겨룸)이나, **숨은 배신자**(협력하는 척하는 적이 섞여 있음) 같은 변형이 더해져요. 마피아 게임은 숨은 배신자 구조의 대표예요.'),
      ]),
      sec('coop', '협력 게임은 어떻게 작동하나', [
        p('협력 게임에서는 상대가 사람이 아니라 **게임 자체**예요. 게임이 정해진 규칙에 따라 위기를 만들고, 플레이어들은 상의해서 그 위기를 넘어야 해요. 대표작인 **팬데믹**은 2008년 미국에서 나온 매트 리콕의 게임으로, 2~4명이 함께 전 세계에 퍼지는 네 가지 질병의 치료제를 찾아요. 질병이 너무 퍼지는 등 지는 조건 중 하나라도 먼저 닥치면 모두가 져요.'),
        p('협력 게임은 게임이 사람을 이기기에 충분히 강해야 재미가 있어요. 그래서 위기가 점점 빨라지거나, 정보가 부족하거나, 시간이 모자라게 만드는 장치가 꼭 들어가요.'),
        h3('협력 게임의 고질병: 한 명이 다 정하기'),
        p('모든 정보가 공개된 협력 게임에서는 가장 잘하는 한 사람이 모두의 수를 대신 정해 버리는 일이 생겨요. 나머지는 지시를 따르기만 하니 재미가 없죠. 그래서 많은 협력 게임이 **정보를 일부러 나눠 가리는** 방식을 써요.'),
        p('2013년 독일 올해의 게임상(슈필 데스 야레스)을 받은 **하나비**가 좋은 예예요. 앙투안 보자가 만든 이 카드 게임에서는 내 카드를 나만 못 보고 다른 사람들만 볼 수 있어요. 힌트를 주는 횟수도 제한돼 있어서, 한 명이 모든 걸 지시할 수가 없어요. 2019년 같은 상을 받은 단어 게임 **저스트 원**도 서로의 단서를 맞혀야 하는 협력 게임이에요.'),
      ]),
      sec('semi', '반협력: 함께 막되, 혼자 이기기', [
        p('반협력 게임은 협력과 경쟁의 장점을 섞으려는 시도예요. 모두가 함께 막지 않으면 다 같이 지는 위협이 있고, 그 위협을 막은 뒤에는 한 명만 이겨요. 그래서 “내가 막으면 남 좋은 일 아닐까?”라는 고민이 생겨요.'),
        p('이 구조의 재미는 **누가 희생할지를 두고 벌이는 눈치 싸움**이에요. 모두가 남이 막아 주길 기다리다가 함께 무너지기도 하고, 손해를 감수하고 먼저 막은 사람이 나중에 신뢰를 얻기도 해요. 현실의 공공재 문제와 닮아서, 게임이 끝나고 나눌 이야기가 많아요.'),
      ]),
      sec('which', '어느 쪽이 나에게 맞을까', [
        h3('협력 게임이 맞는 경우'),
        ul(
          '이기고 지는 데서 오는 스트레스가 싫을 때',
          '실력 차가 큰 사람들끼리 함께할 때. 잘하는 사람이 자연스럽게 설명하며 끌어 줄 수 있어요.',
          '대화를 많이 하며 함께 머리를 맞대고 싶을 때',
        ),
        h3('경쟁 게임이 맞는 경우'),
        ul(
          '내 실력을 정면으로 확인하고 싶을 때',
          '상대를 읽고 속이는 심리전이 즐거울 때',
          '한 판이 끝나고 “한 판 더!”를 외치게 되는 긴장감을 원할 때',
        ),
        note('같은 게임도 바뀔 수 있어요', '퍼즐은 혼자 하면 나와의 싸움이지만, 같은 문제를 친구와 동시에 풀면 경쟁이 되고, 한 문제를 같이 들여다보면 협력이 돼요. 관계는 규칙만큼이나 “어떻게 함께 하느냐”로도 정해져요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('**4인 3목**은 반협력 구조를 잘 보여 주는 게임이에요. 나와 아군 두 명은 힘을 합쳐 AI 스페셜 게스트가 3목을 만들지 못하게 막아야 해요. 게스트가 한 번이라도 3목을 만들면 미션 실패예요. 하지만 결승에 올라가는 건 피스를 많이 딴 상위 두 명뿐이라서, 막으면서도 내가 먼저 3목을 만들 기회를 엿봐야 해요.'),
        p('**무거운 13**과 **러시안 룰렛**은 여러 명이 모두와 겨루는 게임이에요. 공식적인 팀은 없지만, 판이 진행되면서 서로 비슷하게 움직이는 일시적인 동맹이 생기기도 해요. 논리 퍼즐과 수식 게임들은 혼자 할 때는 나와의 싸움이고, 친구전에서는 같은 문제를 두고 속도를 겨루는 경쟁이 돼요.'),
        tip('여럿이 할 때 한 가지 팁', '모두 대 모두 게임에서는 1등을 다 같이 견제하는 흐름이 자연스럽게 생겨요. 앞서고 있다면 티 나지 않게 앞서고, 뒤처지고 있다면 견제의 흐름에 올라타는 것이 기본 전략이에요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Cooperative versus competitive games — winning together, winning alone',
      description: 'Fully cooperative games, team against team, semi-cooperative and one-against-many: how cooperation and competition mix in games, what each feels like, the classic problem of co-op games, examples like Pandemic and Hanabi, and PUZZLTHINK games.',
      keywords: ['cooperative games', 'cooperative board games', 'competitive games', 'semi cooperative games', 'team games', 'Pandemic board game', 'Hanabi'],
    },
    title: 'Cooperative and competitive games',
    lead: 'Is the person across the table an enemy or a partner? The answer changes the whole mood of a game.',
    intro: [
      'Most board games ask who wins. In some, though, everyone is on the same side, fighting the game itself. In others, players act like allies until only one of them smiles at the end.',
      'The relationship between players is one of the most important axes separating genres. With the same rules, whether you cooperate or compete changes what you talk about, how a win feels and the mood after a loss. This article sorts out the shapes that relationship takes.',
    ],
    summary: 'From games where everyone is one team to games where allies are only pretending: the shapes cooperation and competition take, and the classic problem of co-op games.',
    sections: [
      sec('shapes', 'Five shapes of player relationship', [
        table(
          ['Shape', 'How', 'Mood'],
          [
            ['Free-for-all', 'Everyone plays for their own win.', 'The most common. Lots of checking and watching.'],
            ['One-on-one', 'Two players head to head.', 'One side’s gain is the other’s loss.'],
            ['Team versus team', 'Split into sides that compete.', 'Cooperation inside a team, competition between teams.'],
            ['Fully cooperative', 'All players are one team against the game.', 'Win together, lose together.'],
            ['Semi-cooperative', 'A shared threat to stop, but a single winner.', 'You must help, but not too much.'],
          ],
        ),
        p('Add **one versus many** (one player against all the rest) and the **hidden traitor** (an enemy pretending to cooperate). Mafia is the classic hidden-traitor game.'),
      ]),
      sec('coop', 'How cooperative games work', [
        p('In a cooperative game your opponent is **the game itself**. It generates crises by its rules, and players must talk their way through them. The best-known example, **Pandemic**, is Matt Leacock’s game published in the US in 2008: two to four players search together for cures to four diseases spreading across the world, and if any losing condition — such as the diseases spreading too far — arrives first, everyone loses.'),
        p('A co-op game is only fun if it is strong enough to beat people. So there are always devices that speed up the crises, withhold information or squeeze time.'),
        h3('The classic co-op problem: one player decides everything'),
        p('In a co-op game where everything is visible, the strongest player can end up deciding everyone’s moves. The rest just follow orders, which is no fun. So many co-op games **deliberately split and hide information**.'),
        p('**Hanabi**, which won Germany’s Spiel des Jahres in 2013, is a good example. In Antoine Bauza’s card game you cannot see your own cards — only everyone else’s — and hints are limited, so no one can direct it all. **Just One**, the 2019 winner of the same award, is a cooperative word game in which players must guess from each other’s clues.'),
      ]),
      sec('semi', 'Semi-cooperative: stop it together, win alone', [
        p('Semi-cooperative games try to combine the best of both. There is a threat that sinks everyone unless it is stopped together, and after it is stopped, only one player wins. That raises the question: if I block it, am I just helping the others?'),
        p('The fun is the **standoff over who sacrifices**. Everyone waits for someone else to block and all collapse together — or the player who takes the hit first earns trust later. It resembles real public-goods problems, so there is plenty to talk about afterwards.'),
      ]),
      sec('which', 'Which suits you', [
        h3('Cooperative games suit you when'),
        ul(
          'you dislike the stress of winning and losing',
          'skill levels in the group differ a lot — strong players can explain and guide naturally',
          'you want lots of talk and shared thinking',
        ),
        h3('Competitive games suit you when'),
        ul(
          'you want to test your skill head on',
          'you enjoy reading and fooling opponents',
          'you want the tension that makes everyone shout “one more game!”',
        ),
        note('The same game can change', 'A puzzle solved alone is a contest with yourself; solve the same one at the same time as a friend and it is a race; look at one together and it is cooperation. The relationship is set as much by how you play together as by the rules.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('**4 Player 3 In a Row** shows the semi-cooperative structure well. You and two allies must work together to stop the AI special guest from making three in a row; if the guest manages it even once, the mission fails. But only the top two by pieces won reach the final, so while blocking you also watch for your own chance to finish a line first.'),
        p('**Heavy 13** and **Russian Roulette** are free-for-alls. There are no official teams, but temporary alliances form as players start acting in step. The logic puzzles and equation games are a contest with yourself when played alone, and a race on the same problem in friend mode.'),
        tip('One tip for group games', 'In a free-for-all, everyone naturally gangs up on the leader. If you are ahead, stay ahead quietly; if you are behind, ride the wave of checking the leader.'),
      ]),
    ],
  },
};

export default article;
