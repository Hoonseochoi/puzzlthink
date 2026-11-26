import type { WikiArticle } from './types';
import { p, h3, ul, table, tip, note, sec } from './blocks';

const article: WikiArticle = {
  slug: 'party-games',
  category: 'genre',
  updated: '2026-11-26',
  games: [
    { game: 'heavy13', ko: '4~7명이 동시에 카드를 내고, 받침대 합을 13 넘긴 사람이 벌점을 받아요. 눈치가 전부예요.', en: '4–7 players play cards at once; whoever pushes a stand past 13 takes the penalty.' },
    { game: 'hitStay', ko: '5명이 한 장 더 받을지 멈출지 정하며 칩을 걸어요. 빈자리는 AI가 채워요.', en: 'Five players draw or stay and bet chips; empty seats are filled by AI.' },
    { game: 'russianRoulette', ko: '6명이 크레딧으로 약실을 조사하고 조작하는 생존 게임이에요.', en: 'Six players spend credits checking and tampering with chambers to survive.' },
    { game: 'piggyBank', ko: '4명이 저금통을 돌리며 기억하고, 대답하고, 의심해요.', en: 'Four players pass banks around — remember, answer, doubt.' },
    { game: 'gyulhap', ko: '세 속성이 모두 같거나 모두 다른 카드 3장을 남보다 먼저 찾는 실시간 패턴 게임이에요.', en: 'A real-time pattern game: spot three cards whose attributes are all the same or all different, before anyone else.' },
    { game: 'nemoCount', ko: '최대 6명이 버저를 눌러 답을 다투는 숫자 세기 대결이에요.', en: 'Up to six players race to the buzzer in a counting duel.' },
  ],
  related: ['cooperative-vs-competitive', 'bluffing-deduction', 'length-and-player-count', 'what-to-play', 'memory-games'],
  sources: [
    { title: 'The history of the Spiel des Jahres, part three: big names and party games', site: 'Zatu Games', url: 'https://zatu.com/the-history-of-the-spiel-des-jahres-part-three-big-names-party-games-2011-2020/' },
    { title: 'Template: Spiel des Jahres', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Template:Spiel_des_Jahres' },
    { title: 'Set (card game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Set_(card_game)' },
    { title: 'How the SET game works', site: 'HowStuffWorks', url: 'https://entertainment.howstuffworks.com/leisure/brain-games/set-game.htm' },
    { title: 'Mafia (party game)', site: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mafia_(party_game)' },
  ],
  ko: {
    meta: {
      title: '파티 게임이란? 여럿이 웃고 떠드는 보드게임의 조건과 대표작',
      description: '여럿이 모였을 때 빛나는 파티 게임. 좋은 파티 게임의 조건(짧은 규칙, 동시 진행, 대화), 종류(눈치·말·속도·역할), 코드네임·딕싯·저스트 원·SET 같은 대표작과 PUZZLTHINK에서 여럿이 하는 게임을 정리했어요.',
      keywords: ['파티 게임', '파티 보드게임', '여럿이 하는 게임', '눈치 게임', '단체 게임', '코드네임', '친구랑 하는 웹게임'],
    },
    title: '파티 게임',
    lead: '이기는 것보다 함께 웃는 게 먼저인 게임. 하지만 잘 만든 파티 게임에는 분명한 설계가 있어요.',
    intro: [
      '사람이 여섯, 일곱 명쯤 모이면 바둑이나 장기는 두 명만 즐길 수 있어서 곤란해요. 이럴 때 꺼내는 게 파티 게임이에요. 설명은 몇 분이면 끝나고, 모두가 동시에 참여하고, 한 판이 끝나면 웃음과 이야기가 남아요.',
      '파티 게임은 가볍다는 이유로 깊이 이야기되지 않는 편이지만, 여럿이 지루하지 않게 놀 수 있게 만드는 데에는 꽤 정교한 장치가 필요해요. 이 글에서는 좋은 파티 게임의 조건과 종류, 대표작, 그리고 PUZZLTHINK에서 여럿이 즐길 수 있는 게임을 정리해요.',
    ],
    summary: '여럿이 모였을 때 빛나는 게임. 좋은 파티 게임의 조건과 종류(눈치·말·속도·역할), 대표작과 여럿이 하는 PUZZLTHINK 게임을 정리했어요.',
    sections: [
      sec('conditions', '좋은 파티 게임의 조건', [
        h3('설명이 짧아야 해요'),
        p('모인 사람 중 누군가는 처음 해 보는 사람이에요. 규칙 설명이 5분을 넘기면 분위기가 식어요. 좋은 파티 게임은 “한 판 해 보면서 배우자”가 통할 만큼 규칙이 단순해요.'),
        h3('기다리는 시간이 짧아야 해요'),
        p('일곱 명이 한 명씩 차례로 고민하면, 내 차례가 다시 올 때까지 한참을 기다려야 해요. 그래서 파티 게임은 **모두가 동시에** 고르거나, 차례가 아주 빨리 돌거나, 남의 차례에도 할 일이 있게 만들어요.'),
        h3('빠지는 사람이 없어야 해요'),
        p('초반에 탈락한 사람이 30분 동안 구경만 해야 한다면 파티가 아니에요. 탈락이 있더라도 판이 짧거나, 탈락한 사람이 다른 역할로 참여할 수 있어야 해요.'),
        h3('실력 차가 덜 드러나야 해요'),
        p('파티 게임에서는 처음 하는 사람이 고수를 이길 수 있어야 해요. 운, 동시 선택, 사람마다 다른 해석 같은 요소가 실력 차를 적당히 덮어 줘요.'),
      ]),
      sec('kinds', '파티 게임의 종류', [
        table(
          ['종류', '무엇으로 겨루나', '예'],
          [
            ['눈치 게임', '남이 무엇을 낼지 읽기. 동시에 비공개로 고르는 경우가 많아요.', '숫자 겹치지 않게 외치기, 무거운 13'],
            ['말 게임', '단어와 설명, 연상', '코드네임, 딕싯, 저스트 원'],
            ['속도 게임', '누가 먼저 찾나, 누가 먼저 누르나', 'SET, 결합, 버저 퀴즈'],
            ['역할 게임', '숨은 역할을 지키고 찾아내기', '마피아, 늑대인간'],
            ['베팅·생존 게임', '칩을 걸고 끝까지 살아남기', 'Hit,Stay, 러시안 룰렛'],
          ],
        ),
      ]),
      sec('classics', '대표작', [
        p('파티 게임은 특히 독일의 **올해의 게임상(슈필 데스 야레스)**을 통해 많이 알려졌어요. 이 상은 가족과 친구가 함께하기 좋은 게임에 주는 상이라서, 수상작 중에 파티 게임이 많아요.'),
        ul(
          '**딕싯** (2010년 수상): 장 루이 루비라의 게임. 꿈같은 그림 카드를 한 문장으로 설명하되, 너무 쉽지도 어렵지도 않게 설명해야 점수를 얻어요.',
          '**코드네임** (2016년 수상): 블라트 흐바틸의 게임. 두 팀의 대표가 한 단어 힌트로 같은 팀이 찾아야 할 여러 단어를 동시에 가리켜요.',
          '**저스트 원** (2019년 수상): 협력 단어 게임. 모두가 힌트를 하나씩 적는데, 겹치는 힌트는 지워져서 독특한 힌트를 내야 해요.',
          '**SET**: 모양·색·개수·무늬 같은 속성이 각각 모두 같거나 모두 다른 카드 세 장을 먼저 찾는 속도 게임. 유전학자 마샤 팔코가 1974년에 고안했어요.',
          '**마피아**: 숨은 마피아를 대화로 찾아내는 역할 게임. 필요한 건 사람뿐이라 가장 널리 퍼진 파티 게임 중 하나예요.',
        ),
        note('엇갈리는 날짜', 'SET이 상품으로 처음 나온 해는 1988년, 1990년, 1991년으로 자료마다 달라서 고안된 해만 적었어요.'),
      ]),
      sec('fun', '파티 게임의 진짜 재미', [
        p('파티 게임의 승패는 금방 잊혀요. 남는 건 **장면**이에요. 모두가 같은 숫자를 내서 함께 벌점을 받은 순간, 아무도 예상 못 한 힌트가 정답을 맞힌 순간 같은 것들이요. 그래서 좋은 파티 게임은 이런 장면이 자주 생기도록 설계돼 있어요.'),
        p('또 파티 게임은 **사람을 알게 해 주는 게임**이에요. 같은 그림을 어떻게 설명하는지, 위기에서 누가 과감하게 거는지를 보면 그 사람의 성격이 보여요. 처음 만난 사람들끼리 파티 게임이 잘 통하는 이유예요.'),
      ]),
      sec('tips', '여럿이 할 때 알아 두면 좋은 것', [
        ul(
          '**인원에 맞는 게임을 고르세요.** 같은 게임도 4명과 7명일 때 전혀 달라요. 눈치 게임은 인원이 많을수록 혼란이 커지고, 속도 게임은 너무 많으면 화면이나 판이 잘 안 보여요.',
          '**첫 판은 연습 판으로.** 처음 하는 사람이 있다면 점수 없이 한 판 돌려 보는 것만으로 분위기가 훨씬 좋아져요.',
          '**한 판을 짧게.** 길게 한 판보다 짧게 여러 판이 파티에는 더 잘 맞아요.',
        ),
        tip('온라인에서 여럿이 할 때', '같은 공간에 없다면 동시에 고르는 게임이 특히 좋아요. 기다리는 시간이 거의 없고, 결과가 동시에 공개되는 순간 채팅창이 가장 뜨거워져요.'),
      ]),
      sec('puzzlthink', 'PUZZLTHINK에서는', [
        p('PUZZLTHINK에서 여럿이 즐기기 좋은 게임은 대부분 **동시 선택**이나 **빠른 차례**를 써요. **무거운 13**은 4~7명이 카드와 칩을 동시에 비공개로 내고, 받침대 합을 13 이상으로 만든 사람이 벌점을 받는 눈치 게임이에요. **Hit,Stay**는 5명, **러시안 룰렛**은 6명이 하는 생존형 게임이고, 빈자리는 AI가 채워서 인원이 모자라도 바로 시작할 수 있어요.'),
        p('속도 게임으로는 **결합**이 있어요. 도형·도형색·배경색 세 속성이 각각 모두 같거나 모두 다른 카드 3장을 찾는 방식이 SET과 같은 계열이에요. 다 찾았다고 판단되면 “결”을 선언해 추가 점수를 노려요. **네모 세기**는 버저를 먼저 누른 사람이 답하는 퀴즈형 대결이에요.'),
      ]),
    ],
  },
  en: {
    meta: {
      title: 'Party games — what makes a group game work, and the classics',
      description: 'Games that shine when many people gather: what a good party game needs (short rules, simultaneous play, talk), the kinds (guessing, words, speed, roles), classics like Codenames, Dixit, Just One and SET, and PUZZLTHINK games for groups.',
      keywords: ['party games', 'party board games', 'group games', 'games for many players', 'Codenames', 'SET card game', 'online games with friends'],
    },
    title: 'Party games',
    lead: 'Games where laughing together comes before winning — yet a good party game is carefully designed.',
    intro: [
      'When six or seven people gather, go or chess leaves most of them watching. That is when party games come out: the explanation takes minutes, everyone plays at once, and every round leaves laughter and stories.',
      'Party games are rarely discussed in depth because they are light, but keeping a big group entertained takes careful design. This article covers what a good party game needs, the kinds there are, the classics, and the PUZZLTHINK games that work for groups.',
    ],
    summary: 'Games that shine with a crowd: what a good party game needs, the kinds (guessing, words, speed, roles), classics, and PUZZLTHINK games for groups.',
    sections: [
      sec('conditions', 'What a good party game needs', [
        h3('Short rules'),
        p('Someone at the table is always new. If explaining takes more than five minutes, the mood cools. A good party game is simple enough that “let’s learn by playing” works.'),
        h3('Little waiting'),
        p('If seven people take long turns one by one, you wait ages for yours. So party games have **everyone choose at once**, keep turns very fast, or give you something to do on others’ turns.'),
        h3('No one left out'),
        p('If someone knocked out early watches for half an hour, it is not a party. Elimination needs short rounds, or a role for those who are out.'),
        h3('Small skill gaps'),
        p('A first-timer must be able to beat a veteran. Luck, simultaneous choices and personal interpretation smooth over differences in skill.'),
      ]),
      sec('kinds', 'Kinds of party games', [
        table(
          ['Kind', 'What you compete at', 'Examples'],
          [
            ['Guessing games', 'Reading what others will choose, often secretly and simultaneously', 'Calling numbers without colliding, Heavy 13'],
            ['Word games', 'Words, descriptions, associations', 'Codenames, Dixit, Just One'],
            ['Speed games', 'Who spots it first, who buzzes first', 'SET, Gyul! Hap!, buzzer quizzes'],
            ['Role games', 'Keeping and uncovering hidden roles', 'Mafia, Werewolf'],
            ['Betting and survival', 'Bet chips and outlast everyone', 'Hit,Stay, Russian Roulette'],
          ],
        ),
      ]),
      sec('classics', 'Classics', [
        p('Party games became widely known through Germany’s **Spiel des Jahres** (Game of the Year), an award for games families and friends can enjoy together — so many winners are party games.'),
        ul(
          '**Dixit** (2010 winner): Jean-Louis Roubira’s game. Describe a dreamlike picture card in one phrase — neither too obvious nor too obscure — to score.',
          '**Codenames** (2016 winner): Vlaada Chvátil’s game. Each team’s spymaster gives a one-word clue that points to several of their words at once.',
          '**Just One** (2019 winner): a cooperative word game. Everyone writes one clue, and duplicate clues are struck out, so you need a distinctive one.',
          '**SET**: a speed game of finding three cards whose attributes — shape, colour, number, shading — are each all the same or all different. Devised in 1974 by the geneticist Marsha Falco.',
          '**Mafia**: find the hidden mafia through conversation. It needs nothing but people, which makes it one of the most widespread party games.',
        ),
        note('Conflicting dates', 'Sources give 1988, 1990 or 1991 for SET’s first commercial release, so only the year it was devised is given.'),
      ]),
      sec('fun', 'The real fun of party games', [
        p('Party game results are forgotten quickly. What stays are **moments**: everyone playing the same number and sharing a penalty, a bizarre clue that somehow found the answer. Good party games are built to make such moments frequent.'),
        p('Party games also **let you get to know people**. How someone describes a picture, who bets boldly under pressure — it shows personality. That is why they work so well among people who have just met.'),
      ]),
      sec('tips', 'Good to know for group play', [
        ul(
          '**Match the game to the head count.** The same game is very different with four and with seven. Guessing games get chaotic with more people; speed games get crowded.',
          '**Make the first round a practice round.** If anyone is new, one unscored round improves the mood a lot.',
          '**Keep rounds short.** Several short games suit a party better than one long one.',
        ),
        tip('Playing online as a group', 'When you are not in the same room, simultaneous-choice games are especially good: almost no waiting, and the chat lights up the moment results are revealed together.'),
      ]),
      sec('puzzlthink', 'On PUZZLTHINK', [
        p('PUZZLTHINK’s group games mostly use **simultaneous choices** or **fast turns**. In **Heavy 13**, 4–7 players play a card and a chip face down at once, and whoever pushes a stand to 13 or more takes penalties. **Hit,Stay** (five players) and **Russian Roulette** (six) are survival games, and AI fills empty seats so you can start even when short of people.'),
        p('For speed there is **Gyul! Hap!**: finding three cards whose shape, shape colour and background colour are each all the same or all different puts it in the same family as SET. When you think every combination has been found, call “Gyul!” for bonus points. **Nemo Count** is a quiz-style duel where the first to the buzzer answers.'),
      ]),
    ],
  },
};

export default article;
