# 내일 할 일 — Google Play 제출 체크리스트 (순서대로)

**준비물**: Play Console에 쓸 Google 계정, 신분증, US$25 결제 수단, 이 폴더(`docs/play-store/`), 빌드된 `android/app-release-bundle.aab`.
각 단계 옆의 📄 파일에서 그대로 복사해 붙여 넣으면 돼요.

## 0. 시작 전에 (메인 세션 / 개발 쪽)

- [ ] 이 브랜치를 main에 합치고 **사이트 배포**. 배포 전에는 앱이 열려도 광고가 보이고 assetlinks가 없어 주소창이 떠요.
- [ ] **DB 마이그레이션 두 개 적용** (라이브 DB, 손으로): 📄 [06-privacy-and-account-deletion.md](06-privacy-and-account-deletion.md#마이그레이션-적용)
  1. `supabase/migrations/20271128000000_account_deletion.sql` — 회원탈퇴 (이게 없으면 탈퇴 버튼이 "처리하지 못했어요"를 보여요)
  2. `supabase/migrations/20271128010000_nickname_filter.sql` — 닉네임 금칙어 필터
- [ ] 배포 후 확인: https://www.puzzlthink.com/.well-known/assetlinks.json 이 JSON으로 열리고, https://www.puzzlthink.com/ko/account-deletion 에서 로그인 후 "회원탈퇴" 칸이 보이는지.
- [ ] **패키지 ID 최종 확인**: `com.puzzlthink.app` — 첫 업로드 후에는 영원히 못 바꿔요. 바꾸려면 지금 `android/twa-manifest.json`의 `packageId`와 `src/lib/playApp.ts`의 `PLAY_APP_PACKAGE`를 바꾸고 다시 빌드 ([07-app-mode.md](07-app-mode.md#다시-빌드하기)).
- [ ] **업로드 키 백업**: `~/.config/puzzlthink/play/` 폴더 전체(키스토어 + 비밀번호 파일)를 비밀번호 관리자나 암호화된 저장소에 복사.

## 1. 개발자 계정 — 📄 [01-upload-guide.md §1](01-upload-guide.md#1-개발자-계정)
- [ ] https://play.google.com/console 가입 → **개인** 또는 **조직** 선택 → US$25 → 본인 인증(며칠 걸릴 수 있음)
- [ ] 개발자 이름 `PUZZLTHINK`, 연락 이메일 `contact@puzzlthink.com`, 웹사이트 `https://www.puzzlthink.com`

## 2. 앱 만들기 — 📄 [02-store-listing.md](02-store-listing.md)
- [ ] 앱 이름 `퍼즐띵크 - 두뇌 게임 모음` · 기본 언어 한국어 · **게임** · **무료** · 정책 동의 체크

## 3. 앱 콘텐츠(정책) — 대시보드 "앱 설정" 항목을 위에서부터
- [ ] 개인정보처리방침 URL: `https://www.puzzlthink.com/ko/privacy-policy` — 📄 [06](06-privacy-and-account-deletion.md)
- [ ] 앱 액세스 권한: **모든 기능을 특별한 액세스 없이 이용 가능** (로그인은 누구나 Google로 가능)
- [ ] 광고: **아니요, 광고 없음** — 📄 [05](05-target-audience-ads.md#광고)
- [ ] 콘텐츠 등급(IARC): 📄 [03-content-rating.md](03-content-rating.md) **변형 A(베팅 게임 포함)** 답안대로. 결과가 청소년이용불가면 같은 문서의 [대응](03-content-rating.md#결과가-청소년이용불가19로-나오면)
- [ ] 타깃층: **13–15, 16–17, 18세 이상** (13세 미만 체크 안 함) — 📄 [05](05-target-audience-ads.md)
- [ ] 뉴스 앱: 아니요 · 정부 앱: 아니요 · 금융 기능: 없음 · 건강: 없음
- [ ] 데이터 보안: 📄 [04-data-safety.md](04-data-safety.md) 표대로
- [ ] 계정 삭제 URL: `https://www.puzzlthink.com/ko/account-deletion` — 📄 [06](06-privacy-and-account-deletion.md)
- [ ] 광고 ID: **아니요, 사용 안 함**

## 4. 스토어 등록정보 — 📄 [02-store-listing.md](02-store-listing.md), 그림은 📄 [assets/README.md](assets/README.md)
- [ ] 짧은 설명 / 자세한 설명 (한국어) → 번역 추가 → 영어(미국)
- [ ] 앱 아이콘 `assets/icon-512.png` · 피처 그래픽 `assets/feature-graphic-ko.png` (영어 번역에는 `-en`)
- [ ] 휴대전화 스크린샷 8장 `assets/screenshots/phone/ko/` · 7인치 6장 `tablet7/ko/` · 10인치 6장 `tablet10/ko/` (영어 번역에는 `/en/`)
- [ ] 카테고리 **퍼즐**, 태그 퍼즐·보드·전략·논리·단어, 연락처 이메일·웹사이트

## 5. Play 앱 서명 + 첫 업로드(내부 테스트) — 📄 [01 §5](01-upload-guide.md#5-play-앱-서명과-첫-업로드-내부-테스트)
- [ ] 테스트 및 출시 → 내부 테스트 → 새 버전 → "Google에서 생성한 앱 서명 키" 그대로 → `android/app-release-bundle.aab` 업로드 → 출시 노트(📄 02) → 테스터에 본인 추가 → 출시
- [ ] **앱 무결성 → 앱 서명**에서 *앱 서명 키 인증서*의 **SHA-256 지문** 복사
- [ ] 개발 쪽에 전달: **`src/lib/playApp.ts`의 `PLAY_APP_FINGERPRINTS.playAppSigning: ''` 따옴표 안에 붙여 넣고 → 사이트 재배포**. (이 값이 `/.well-known/assetlinks.json`에 들어가요. 재배포 전에는 스토어에서 받은 앱 위에 주소창이 보여요.)
- [ ] 내부 테스트 링크로 휴대전화에 설치 → 주소창 없이 열리는지, 광고가 없는지, 로그인·회원탈퇴 화면이 되는지 확인

## 6. 비공개 테스트 — 개인 계정이면 필수 (2023-11-13 이후 만든 개인 계정)
- [ ] 비공개 테스트 트랙 만들기 → 같은 번들 승격 → 국가 대한민국
- [ ] 테스터 **15명 이상** 초대(최소 12명이 **14일 연속** 참여해야 함, 중간에 나가면 안 셈) → 각자 참여 링크 수락 후 Play에서 설치
- [ ] 14일 뒤 **프로덕션 액세스 신청** (테스트 방법·받은 피드백을 적는 질문이 나옴; 보통 7일 안에 결과)
- 조직 계정이면 이 단계 없이 바로 프로덕션 가능

## 7. 프로덕션 출시
- [ ] 프로덕션 → 새 버전 → 번들 승격 → 국가 선택 → 검토 제출

## 막히면
- 주소창이 보인다 → 5단계 SHA-256이 사이트에 배포됐는지 `curl -s https://www.puzzlthink.com/.well-known/assetlinks.json`
- 등급이 청소년이용불가 → 📄 [03 대응](03-content-rating.md#결과가-청소년이용불가19로-나오면)
- 정책 거절 메일 → 메일에 적힌 정책 이름으로 📄 [README의 위험 목록](README.md#심사-위험-목록) 확인
