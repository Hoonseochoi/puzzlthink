import type { EscapeStory } from '@/types/escape';

/** 블루문 저택 살인사건 — 평면도(거실/회장실/게스트룸 등) + 챕터 1·2 */
export const blueMoonStory: EscapeStory = {
  id: 'blue-moon',
  title: '블루문 저택 살인사건',
  summary:
    '2026년 2월 22일, 폭풍우가 몰아치던 밤. 블루문 저택의 주인 최병철 회장이 반신욕 중 숨을 거둔다. 용의자는 다섯. 저택 평면도를 돌아다니며 단서를 모으고, 거실에서 용의자들의 말을 들어 진범을 찾아라.',

  roomBackground: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
  floorPlanImage: '/story/layout.png',
  startScreenImage: '/escape/blue-moon/home.png',
  startScreenBgm: '/escape/blue-moon/title-track.mp3',

  // 평면도: 버튼 위치 (거실·김비서·가정부·회장침실·회장화장실 +5 아래 / 회장서재 +10 우측 / 아들·게스트·김비서 = 김변호사 열과 동일)
  rooms: [
    { id: 'living', name: '거실', isGathering: true, image: '/escape/blue-moon/room-living.png', background: 'linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%)', floorPlanPosition: { left: 51, top: 69 } },
    { id: 'secretary', name: '김비서방', image: '/story/kimsecroom.png', background: 'linear-gradient(180deg, #1a2520 0%, #0d1512 100%)', floorPlanPosition: { left: 54, top: 30 } },
    { id: 'maid', name: '주방/다용도실', image: '/story/steproom.png', background: 'linear-gradient(180deg, #1e1a25 0%, #100d15 100%)', floorPlanPosition: { left: 88, top: 50 } },
    { id: 'chairman_bedroom', name: '회장 침실', image: '/story/chairmanroom.png', background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', floorPlanPosition: { left: 37, top: 30 } },
    { id: 'chairman_bath', name: '회장실 욕실', image: '/escape/blue-moon/room-chairman-bath.png', background: 'linear-gradient(180deg, #1a2525 0%, #0d1515 100%)', floorPlanPosition: { left: 68, top: 30 } },
    { id: 'son', name: '아들방', image: '/story/sonroom.png', background: 'linear-gradient(180deg, #2a1e1a 0%, #150f0d 100%)', floorPlanPosition: { left: 75, top: 64 } },
    { id: 'guest', name: '게스트룸 (기자방)', image: '/story/leepoterroom.png', background: 'linear-gradient(180deg, #25201a 0%, #15100d 100%)', floorPlanPosition: { left: 15, top: 69 } },
    { id: 'lawyer_office', name: '김변호사 집무실', image: '/story/kimlawerroom.png', background: 'linear-gradient(180deg, #1a1e2e 0%, #0d101a 100%)', floorPlanPosition: { left: 15, top: 47 } },
    { id: 'corridor', name: '복도', image: '/story/lobby2f.png', background: 'linear-gradient(180deg, #1e1e28 0%, #12121a 100%)', floorPlanPosition: { left: 50, top: 47 }, floorPlanButtonSize: { minW: '120px', maxW: '140px', minH: '22px' }, floorPlanIcon: 'route' },
  ],

  characters: [
    { id: 'junho', name: '최준호', description: '회장의 장남(35). 100억대 도박 빚. 상속 배제 직전이었고, 저택 시계를 30분 앞당긴 뒤 이미 죽은 아버지를 종이칼로 찔렀다.', livingRoomTitle: '그날 밤 알리바이', image: '/escape/blue-moon/characters/junho.png' },
    { id: 'kim_lawyer', name: '김 변호사', description: '회장의 법률 자문(45). 5년 전 블루문 호텔 1205호 사건으로 신임을 얻었으나, 유언장으로 재단을 넘겨받기 위해 가정부의 손을 빌린 완전범죄를 설계했다.', livingRoomTitle: '그날 밤의 행적', image: '/escape/blue-moon/characters/kim_lawyer.png' },
    { id: 'maid', name: '안 가정부', description: '30년간 저택에서 일한 가정부(60). 딸(이 기자)의 상속을 약속받았으나 배제되자 청산가리를 시도했으나 실패. 12시 주사를 놓았고 자신이 회장을 죽였다고 믿는다.', livingRoomTitle: '일정표대로 한 일', image: '/escape/blue-moon/characters/maid.png' },
    { id: 'journalist', name: '이 기자', description: '회장의 숨겨진 딸(28). 자서전 작가로 잠입해 친자 확인 후 아버지를 찾으려 했으나, 카메라에 담긴 것은 어머니가 아버지를 죽이는 듯한 장면이었다.', livingRoomTitle: '그날 밤 목격한 것', image: '/escape/blue-moon/characters/journalist.png' },
    { id: 'kim_secretary', name: '김 비서', description: '회장의 심복(42). 김 변호사의 야욕을 눈치채고 도청기를 설치. 금고 뒤에서 진짜 유언장을 확보한 채 기회를 노린다.', livingRoomTitle: '저택에서 알고 있는 것', image: '/escape/blue-moon/characters/kim_secretary.png' },
  ],

  livingRoomStatements: [
    {
      characterId: 'kim_lawyer',
      text: '밤 11시에 나가서 밤새 시내 사무실에서 서류를 검토했습니다. 저택에는 방금 새벽 6시에 차를 타고 도착했어요.',
    },
    {
      characterId: 'kim_secretary',
      text: '밤 11시부터 제 방에서 회장님의 비자금 장부를 정리했습니다. 피곤해서 잠시 졸긴 했지만, 방 밖으로 나간 적이 없습니다.',
    },
    {
      characterId: 'journalist',
      text: '저도 그 시간에는 자서전 초안 작업을 마치고 잠들었을 시간이고, 빗소리 때문에 아무것도 듣지 못했어요.',
    },
    {
      characterId: 'maid',
      text: '밤 11시 30분에는 늘 회장님 반신욕 준비를 합니다. 11시 50분부터 10분간 늘 반신욕을 하시고 주무시거든요. 평소와 같이 욕조에 반신욕 준비를 해드리고 주방 정리를 하러 내려갔다가, 12시 30분에 욕조 정리하러 들어갔다가 회장님이 칼에 찔려 돌아가신 모습을 보고 말았습니다. 흑흑.',
    },
    {
      characterId: 'junho',
      text: '방에서 술 마시고 게임하다가 취해서 뻗어서 잤습니다. 안 가정부의 비명소리를 듣고 잠깐 깨긴 했는데 …',
    },
  ],

  /** 거실에서 용의자 알리바이 선택 시 탐정의 질문 → 알리바이 하단에 답 표시 */
  livingRoomFollowUps: [
    {
      characterId: 'junho',
      questions: [
        { question: '게임이라는 게 어떤 게임이죠?', answer: '그게 중요한가요? 소소하게 바카라 좀 했습니다.' },
        { question: '아버지가 돌아가셨는데 슬퍼하지 않네요?', answer: '슬퍼한다고 뭐 달라지나요. 평소에 잘하셨으면 그럴 일도 없었을 거잖아요.' },
        { question: '아버지와의 관계는 어떠셨나요?', answer: '뭐,, 그렇게 좋은 부자 관계는 아니었습니다. 아버지가 저를 이렇게 만드신 거에요!' },
      ],
    },
  ],

  // 상세 단서: 위치·용도·발동 조건에 맞춰 있을법한 위치에 배치
  clues: [
    { id: 'law_book', name: '낡은 법전', description: '1200~1206p가 반복해서 펼쳐져 있다. 1205가 강조되어 있다. 노트북 암호 힌트.', roomId: 'lawyer_office', chapter: 2, hotspotPosition: { left: 12, top: 28, width: 20, height: 24 }, dialogue: [{ characterId: 'kim_secretary', text: '5년 전 블루문 호텔 1205호. 그 사건으로 김 변호사는 회장님의 신임을 얻었죠.' }, { characterId: 'kim_lawyer', text: '1205는 단순한 숫자가 아니오. 승리의 열쇠지.' }] },
    { id: 'laptop', name: '잠긴 노트북', description: '암호 1205 입력 시 열린다. 검색 기록에 진오펜·급성 심정지 검색이 있다.', roomId: 'lawyer_office', chapter: 2, hotspotPosition: { left: 52, top: 48, width: 30, height: 22 }, dialogue: [{ characterId: 'kim_lawyer', text: '고혈압 환자가 반신욕 중 진오펜을 주사받으면 급성 심정지. 법과 의학, 둘 다 제 전문이오.' }, { characterId: 'kim_secretary', text: '인슐린으로 위장한 진오펜. 가정부 손을 빌려 회장을 죽인 거군요.' }] },
    { id: 'paper_knife', name: '종이칼', description: '날이 제거된 흔적. 사체 훼손·라벨 제거에 사용된 도구. 영양제 병에 사용 가능.', roomId: 'son', chapter: 1, hotspotPosition: { left: 41, top: 54, width: 14, height: 12 }, dialogue: [{ characterId: 'junho', text: '그건… 제 방에 있던 거예요. 하지만 저는 그걸 쓰지 않았어요!' }, { characterId: 'kim_lawyer', text: '준호 씨, 당신이 그날 밤 서재에 들어갔다는 건 이미 편의점 CCTV로 확인됐소.' }, { characterId: 'junho', text: '…아버지가 이미 죽어 계셨어요. 저는 그냥… 시계만…' }] },
    { id: 'blue_crystal', name: '푸른 결정 병', description: '실패한 독살 시도 증거. 하단 파란 결정을 조사할 수 있다.', roomId: 'maid', chapter: 2, hotspotPosition: { left: 17, top: 88, width: 4.5, height: 14 }, dialogue: [{ characterId: 'maid', text: '저는… 9시에 음료에 타서 드렸어요. 하지만 회장님이 마시지 않고 버리셨죠. 저는 실패했어요.' }, { characterId: 'journalist', text: '엄마… 그럼 회장님이 죽은 건 엄마 때문이 아니라고?' }] },
    // 가정부 방
    { id: 'maid_frame', name: '액자', description: '딸로 보이는 여자아이를 안고있는 젊은 안가정의 모습이 보인다. 사진의 날짜를 보니 1998년 6월 8일이다. 안 가정부의 아이는 지금 어디에 있는걸까?', roomId: 'maid', chapter: 1, hotspotPosition: { left: 15, top: 55, width: 9, height: 11 }, dialogue: [{ characterId: 'junho', text: '제가 알기론 가정부아주머니는 미혼으로 알고있는데요?' }, { characterId: 'kim_secretary', text: '음,, 저 아이는 누구의 아이 인걸까요 저는 한번도 본적이 없는 아이입니다.' }] },
    { id: 'maid_calendar', name: '캘린더', description: '2월 22일에 동그라미가 쳐져있다. 이날은 무슨 중요한날인거지...', roomId: 'maid', chapter: 1, hotspotPosition: { left: 84, top: 15, width: 15, height: 20 }, dialogue: [{ characterId: 'journalist', text: '혹시,, 오늘만을 기다린 복수극일까요? 30년을 기다려온 복수!? 완전 특종감이잖아!' }, { characterId: 'kim_secretary', text: '의심스러운게 한두가지가 아니긴합니다.' }] },
    { id: 'locked_drawer', name: '잠긴서랍', description: '잠겨있는 서랍이다. 풀려면 열쇠가 필요한듯 하다.', roomId: 'maid', chapter: 1, hotspotPosition: { left: 18, top: 70, width: 10, height: 9 }, dialogue: [] },
    { id: 'hidden_diary', name: '숨겨진 일기', description: '2020년 5월 12일, 내 딸의 소식을 22년만에 우연히 알게되었다. 최회장과의 "계약"을 어길순 없지만,, 계약만 파기된다면,, 함께 살 수 있을거야,,', roomId: 'maid', chapter: 1, hotspotPosition: { left: 29, top: 84, width: 11, height: 6 }, dialogue: [{ characterId: 'junho', text: '우리 아버지와 어떤계약을 하신거죠? 혹시 저 아이가 아버지 딸인건가요?' }, { characterId: 'kim_secretary', text: '혼외자가 있다는 소문이 돌기는 했었습니다만.... 그게 안가정부의 딸일 줄은,,' }] },
    { id: 'wristwatch', name: '손목시계', description: '욕조 바닥에서 건진 회장의 시계. 12:05에서 멈춰 있어 조작된 사망 시각을 보여준다.', roomId: 'chairman_bath', chapter: 1, hotspotPosition: { left: 60, top: 72, width: 18, height: 14 }, dialogue: [{ characterId: 'kim_lawyer', text: '회장님은 저택 시계로 12시 05분에 숨을 거두셨습니다. 제가 증인이오. 자정이 지났으니 유언장이 효력 발생했소.' }, { characterId: 'journalist', text: '그 시계… 저택 시계가 30분 빠르다면, 실제로는 11시 35분이에요.' }] },
    { id: 'letter_knife', name: '편지칼', description: '살해도구로 쓰인 것 같은 편지칼이다. 누구의 것인지 찾아봐야겠다.', roomId: 'chairman_bath', chapter: 1, hotspotPosition: { left: 62, top: 11, width: 14, height: 18 }, dialogue: [] },
    { id: 'memory_card', name: '메모리카드', description: '이밤에 김비서는 어딜가는거지,,?', roomId: 'guest', chapter: 2, hotspotPosition: { left: 6, top: 73, width: 12, height: 10 }, dialogue: [{ characterId: 'journalist', text: '이 사진… 제가 그날 밤 찍은 거예요. 메타데이터에 23:35라고 나와 있어요. 저택 시계는 12시 5분이었지만.' }, { characterId: 'kim_lawyer', text: '…그렇다면 회장님 사망 시각은 자정 25분 전. 유언장 효력 발생 전이군.' }], imageOnClick: '/story/leephoto.png' },
    { id: 'hall_clock', name: '거실 시계', description: '거실 메인 벽시계. 전체 시계 조작 확인. 손목시계와 대조 시 발동.', roomId: 'living', chapter: 1, hotspotPosition: { left: 72, top: 12, width: 24, height: 22 }, dialogue: [{ characterId: 'maid', text: '일정표에는 00:00 반신욕 시작이라고 적혀 있었어요. 저는 그대로 12시에 주사를 놓았어요.' }, { characterId: 'kim_secretary', text: '저택 시계가 30분 빠른 상태였다면, 가정부님이 주사를 놓은 실제 시각은 23:25입니다.' }] },
    { id: 'driver', name: '드라이버', description: '준호 방 서랍. 시계 뒷판 나사와 대조하면 시계 조작의 도구로 확인된다.', roomId: 'son', chapter: 1, hotspotPosition: { left: 48, top: 83, width: 14, height: 16 }, dialogue: [{ characterId: 'kim_secretary', text: '저택의 시계들이 그날 모두 30분 앞당겨져 있었습니다. 수리 기사는 오지 않았어요.' }, { characterId: 'junho', text: '자정이 지나면 상속에서 빠진다고… 그래서 시계를… 그냥 30분만 당기면 된다고 생각했어요.' }] },
    { id: 'son_sleeping_pills', name: '수면제', description: '과다 복용시 사망가능, 의사가 필히 처방해야 하는 수면제이다.', roomId: 'son', chapter: 1, hotspotPosition: { left: 6, top: 52, width: 5, height: 12 }, dialogue: [] },
    { id: 'son_loan_docs', name: '사채 서류', description: '채무액 18억 이자율 연 40%, 제3금융권 "사나머니"에서 대출받은 서류이다. 채무불이행시 최준호의 모든 신체는 "사나머니"의 소유가 된다.', roomId: 'son', chapter: 1, hotspotPosition: { left: 21, top: 48, width: 18, height: 18 }, dialogue: [] },
    { id: 'son_diary', name: '일기장', description: '2월 10일, 아버지가 도박 빚을 알게 된 거 같다. 갑자기 유언장을 수정하시겠다고 김변호사랑 대화하는 내용을 들었다. 유언이 바뀌어 내가 재산을 물려받지 못하면 나는 죽은 목숨이다. 유언이 바뀌기 전에 끝내야만 한다.', roomId: 'son', chapter: 1, hotspotPosition: { left: 60, top: 47, width: 24, height: 22 }, dialogue: [] },
    { id: 'son_laptop', name: '노트북', description: '인터넷 바카라 사이트가 열려 있다.', roomId: 'son', chapter: 1, hotspotPosition: { left: 8, top: 16, width: 18, height: 18 }, dialogue: [] },
    // 김비서방
    { id: 'slush_ledger', name: '비자금 장부', description: '비자금 장부가 담겨있다. 안가정부에게 매달 1천만원씩 이체가 되어있다. 이들은 무슨 관계인거지?', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 17, top: 50, width: 6, height: 10 }, dialogue: [] },
    { id: 'ansistop', name: '안시스탑', description: '치질: 항문 주변의 혈관 울혈을 개선하여 통증 및 부기 완화. 고혈압 환자는 복용시 혈관확장으로 인해 각별한 주의가 필요하다.', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 34, top: 66, width: 9, height: 4.5 }, dialogue: [] },
    { id: 'memo_books', name: '책 사이 메모', description: '[<strong>나무</strong>가 <strong>바람</strong>을 막아주고 <strong>초승달</strong>이 <strong>산</strong>을 밝히네] ,,, 이게 무슨내용인거지 ?', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 83, top: 38, width: 5, height: 14 }, dialogue: [] },
    { id: 'bug_device', name: '도청기', description: '버튼을 눌러보니, 준호의 목소리가 들려온다. "유언장이 분명히 여기 보관되있을텐데,, 비밀번호가 뭐지.. 띡띡띡띡 띠딕,, 철컥! 뭐야! 안열잖아! 유언장에 분명히 내 상속분이 얼마인지 적혀있을텐데,,"', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 83, top: 88, width: 5.5, height: 12 }, dialogue: [] },
    { id: 'locked_safe', name: '유언장B', description: '유언장 : 유사시, 최회장의 모든재산을 블루문재단에 전부 위탁하며, 모든 자산의 처분결정권 또한 블루문재단에게 귀속한다. 2026년 2월 17일 최회장', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 48, top: 51, width: 14, height: 19 }, dialogue: [], passwordLock: { correctPassword: '1205' } },
    { id: 'famous_painting', name: '명화', description: '유명한 작가가 그린것같은 고급스러운 그림이다. 그런데 내가 아는 그림과 뭔가좀 다른거같은데,,, 자세히보면 좋을거같다.', roomId: 'secretary', chapter: 1, hotspotPosition: { left: 44, top: 20, width: 21, height: 24 }, dialogue: [], magnifierImage: '/story/pic_1205.png' },
    // 복도
    { id: 'magnifier', name: '돋보기', description: '무언가 자세히 볼 때 사용한다. 돋보기를 누르고 대상을 클릭하면 확대해서 볼 수 있다.', roomId: 'corridor', chapter: 1, hotspotPosition: { left: 23, top: 67, width: 6, height: 7.5 }, dialogue: [] },
  ],

  questions: [
    { id: 'q1', clueId: 'paper_knife', type: 'multiple', text: '목에 박힌 종이칼과 부검 결과(사후 손상)가 말해주는 것은?', options: [{ id: 'o1', text: '준호가 살인 직후 찌른 것이다.', correct: false }, { id: 'o2', text: '준호가 이미 죽은 뒤 찌른 것이므로, 진범이 아니다.', correct: true }], revealCharacterId: 'junho' },
    { id: 'q2', clueId: 'driver', type: 'multiple', text: '드라이버와 시계 조작의 관계는?', options: [{ id: 'o3', text: '준호가 시계를 30분 앞당겨 알리바이를 만들려 했다.', correct: true }, { id: 'o4', text: '가정부가 일정을 조작하기 위해 썼다.', correct: false }], revealCharacterId: 'junho' },
    { id: 'q3', clueId: 'wristwatch', type: 'multiple', text: '손목시계 12:05와 저택 시계 30분 조작이 만나면?', options: [{ id: 'o5', text: '실제 사망 시각은 11시 35분쯤이다.', correct: true }, { id: 'o6', text: '실제 사망 시각은 12시 35분이다.', correct: false }], revealCharacterId: 'journalist' },
    { id: 'q4', clueId: 'hall_clock', type: 'multiple', text: '가정부가 12시(저택 시계)에 놓은 주사의 실제 시각은?', options: [{ id: 'o7', text: '실제 23:30. 유언장 효력 전이다.', correct: true }, { id: 'o8', text: '실제 00:00. 자정이 지났다.', correct: false }], revealCharacterId: 'maid' },
    { id: 'q5', clueId: 'vitamin_bottle', type: 'multiple', text: '영양제 라벨 아래 숨겨진 진오펜이 의미하는 것은?', options: [{ id: 'o9', text: '가정부가 고의로 바꿔 놓았다.', correct: false }, { id: 'o10', text: '누군가 인슐린을 진오펜으로 바꿔 가정부로 하여금 주사하게 했다.', correct: true }], revealCharacterId: 'kim_lawyer' },
    { id: 'q6', clueId: 'blue_crystal', type: 'multiple', text: '청산가리 시도와 실제 사인과의 관계는?', options: [{ id: 'o11', text: '가정부의 청산가리가 회장을 죽였다.', correct: false }, { id: 'o12', text: '회장은 음료를 마시지 않았고, 진짜 사인은 다른 것이다.', correct: true }], revealCharacterId: 'maid' },
    { id: 'q8', clueId: 'law_book', type: 'short', text: '김 변호사가 1205를 중요시하는 이유는? (숫자 네 자리로)', correctAnswer: '1205', revealCharacterId: 'kim_secretary' },
    { id: 'q9', clueId: 'laptop', type: 'multiple', text: '노트북 검색 기록(진오펜, 급성 심정지)이 증명하는 것은?', options: [{ id: 'o15', text: '김 변호사가 고혈압+진오펜으로 회장을 죽이도록 설계했다.', correct: true }, { id: 'o16', text: '김 변호사는 단순히 법적 조사를 한 것이다.', correct: false }], revealCharacterId: 'kim_lawyer' },
    { id: 'q10', clueId: 'memory_card', type: 'multiple', text: '메타데이터 23:35와 유언장 효력의 관계는?', options: [{ id: 'o17', text: '사망이 자정 전이므로 김 변호사 유언장은 법적 무효다.', correct: true }, { id: 'o18', text: '사망이 12시 이후이므로 유언장이 유효하다.', correct: false }], revealCharacterId: 'journalist' },
  ],

  hints: [
    '목의 자상에 출혈이 없다면 사후에 찌른 것이다. 준호의 범행은?',
    '저택의 모든 시계가 30분 빠르다. 가정부가 12시에 놓은 주사의 실제 시각은?',
    '진짜 사인은 청산가리가 아니다. 고혈압과 반신욕, 그리고 특정 약물을 생각해 보라.',
    '1205는 호텔 방 번호이자 노트북 암호. 그 주인은 누구인가.',
    '실제 사망 시각이 자정 전이라면, 유언장은 무효다.',
  ],

  correctCriminalId: 'kim_lawyer',
  hotspots: [],
};
