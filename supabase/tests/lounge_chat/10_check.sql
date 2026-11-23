create temp table cases (txt text, want text);
insert into cases values
 ('안녕하세요 같이 해요', null), ('벽바둑 어렵네요 ㅋㅋㅋ', null), ('gg wp nice game', null), ('this exam is hard', null),
 ('보지 마세요 스포', null), ('오늘 잠을 자지 못했어', null), ('시발점이 어디죠', null), ('불 꺼져서 깜깜', null),
 ('1등 1000점 달성!', null), ('레벨 10 클리어 20250101', null), ('사과 오늘 이거 일단', null), ('puzzlthink.com/wallgo 해보세요', null),
 ('classic hit', null), ('Sussex', null), ('개 새로 나온 게임', 'profanity'),
 ('시발', 'profanity'), ('시 발', 'profanity'), ('시.발', 'profanity'), ('시1발', 'profanity'), ('ㅅㅂ', 'profanity'), ('ㅅ ㅂ', 'profanity'),
 ('ㅅㅣ발 뭐야', 'profanity'), ('ㅂㅅ아', 'profanity'), ('개 새끼', 'profanity'), ('존나 어렵네', 'profanity'), ('병~신', 'profanity'),
 ('fuck', 'profanity'), ('f u c k', 'profanity'), ('f*ck', 'profanity'), ('FUUUCK', 'profanity'), ('ｆｕｃｋ', 'profanity'), ('sh1t', 'profanity'),
 ('씨8', null), ('18놈아', 'profanity'),
 ('섹스', 'sexual'), ('섹 스', 'sexual'), ('s e x', 'sexual'), ('$ex', 'sexual'), ('porn', 'sexual'), ('야동 볼사람', 'sexual'),
 ('010-1234-5678', 'phone'), ('01012345678', 'phone'), ('010 1234 5678', 'phone'), ('010.1234.5678', 'phone'), ('공일공 일이삼사 오육칠팔', 'phone'),
 ('공일공-일이삼사-오육칠팔', 'phone'), ('+82 10-1234-5678', 'phone'), ('o1o-1234-5678', 'phone'), ('011-123-4567', 'phone'), ('제 번호 010 1234 5678 연락주세요', 'phone'),
 ('abc@gmail.com', 'email'), ('abc @ naver . com', 'email'), ('abc 골뱅이 naver 닷 com', 'email'), ('my mail abc(at)daum(dot)net', 'email'), ('abc＠gmail．com', 'email'),
 ('카톡 아이디 abc123', 'contact'), ('카톡아이디는 abc', 'contact'), ('kakao id: abc', 'contact'), ('카톡 친추해요', 'contact'), ('https://open.kakao.com/o/abc', 'contact'), ('오픈채팅 들어와', 'contact'),
 ('900101-1234567', 'rrn'), ('9001011234567', 'rrn'), ('900101 1234567', 'rrn'),
 ('https://example.com', 'link'), ('www.badsite.xyz 가봐', 'link'),
 ('시a발', 'profanity'), ('시ㅋ발', 'profanity'), ('시★발', 'profanity'), ('시​발', 'profanity'), ('ㅅ ㅣ 발', 'profanity'), ('f가uck', 'profanity'), ('sㅋex', 'sexual'),
 ('s-e-x', 'sexual'), ('ㅆ.ㅂ', 'profanity'), ('병1신아', 'profanity'), ('개.새.끼', 'profanity'), ('씨~~~~발', 'profanity'), ('ｓｅｘ', 'sexual'), ('ㅅ.ㅅ 할래', 'sexual'),
 ('010 그리고 1234 5678', 'phone'), ('공1공 12삼4 5678', 'phone'), ('카톡 ㄱ', 'contact'), ('open.kakao.com/o/x', 'contact'),
 ('https://puzzlthink.com/ko/wallgo?open=1234#play 오픈방 들어오세요', null), ('완성기념 사진', null), ('개발기간이 길다', null), ('뒤져봐도 없네', null),
 ('오픈방 같이 하실 분 구해요', null), ('벽바둑2 오픈방 1234 들어오세요', null), ('호로록 라면', null), ('애자일하게', null), ('대박 ㅋㅋㅋㅋ', null), ('ㅎㅎ 고마워요', null);
select case when coalesce(public.lounge_check(txt), '-') = coalesce(want, '-') then 'PASS' else 'FAIL' end as r, txt, want, public.lounge_check(txt) as got from cases order by 1, 2;
select count(*) filter (where coalesce(public.lounge_check(txt), '-') = coalesce(want, '-')) as pass, count(*) as total from cases;
