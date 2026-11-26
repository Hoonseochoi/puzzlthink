# 01. Google Play 업로드 가이드 (처음 올리는 사람용)

2026-11-27 기준으로 Google 공식 도움말을 확인해 정리했어요. 콘솔 화면 이름은 바뀔 수 있으니 괄호 안 영어 이름도 함께 적었어요.

확인한 요구사항
- **타깃 API**: 새 앱과 업데이트는 2026-08-31부터 **Android 16(API 36) 이상**을 타깃해야 해요. 이 앱은 `targetSdkVersion 36`(Bubblewrap 1.28.0, androidbrowserhelper 2.8.0, minSdk 24)이라 충족해요.
- **형식**: 새 앱은 **Android App Bundle(.aab)** 로 올리고 **Play 앱 서명(Play App Signing)** 을 써야 해요. 우리가 가진 키는 "업로드 키"이고, 사용자에게 배포되는 앱은 Google이 보관하는 "앱 서명 키"로 다시 서명돼요.
- **테스트 요건**: **2023-11-13 이후에 만든 개인(personal) 개발자 계정**은 프로덕션에 내기 전에 **비공개 테스트(closed testing)에 테스터 12명 이상이 14일 연속 참여**해야 해요. 중간에 빠진 테스터는 세지 않으니 15명 이상으로 시작하세요. 조직(organization) 계정은 이 요건이 없어요.
- **콘텐츠 등급**: 모든 앱은 IARC 설문으로 등급을 받아야 하고, 등급이 없는 앱은 삭제될 수 있어요.
- **계정 삭제**: 앱에서 계정을 만들 수 있으면 앱 안의 삭제 경로와 웹 삭제 요청 URL이 필요해요.

## 1. 개발자 계정

1. https://play.google.com/console 에 접속해 PUZZLTHINK를 운영하는 Google 계정으로 로그인.
2. 계정 유형 선택: **개인(Personal)** 또는 **조직(Organization)**.
   - 조직 계정은 D-U-N-S 번호가 필요하지만 12명×14일 테스트 요건이 없어요. 사업자로 운영한다면 조직 계정을 검토하세요.
   - 개인 계정이면 스토어에 개발자 이름과 (요청 시) 연락처가 공개돼요. 개발자 이름은 `PUZZLTHINK`로.
3. 등록비 **US$25**(1회) 결제, 신분증 본인 인증, 연락처 이메일·전화 인증. 인증에 며칠 걸릴 수 있어요.
4. 개발자 연락처 이메일: `contact@puzzlthink.com` (스토어에 공개됨).

## 2. 앱 만들기

Play Console → **앱 만들기(Create app)**
- 앱 이름: `퍼즐띵크 - 두뇌 게임 모음` (30자 이내, [02-store-listing.md](02-store-listing.md))
- 기본 언어: 한국어(ko-KR)
- 앱 또는 게임: **게임(Game)**
- 무료 또는 유료: **무료**
- 선언: 개발자 프로그램 정책, 미국 수출 법규 동의 체크

## 3. 앱 설정 (대시보드 → "앱 설정")

`정책 및 프로그램 → 앱 콘텐츠(App content)`에서 아래를 모두 채워야 출시할 수 있어요.

| 항목 | 답 | 문서 |
|---|---|---|
| 개인정보처리방침 | `https://www.puzzlthink.com/ko/privacy-policy` | [06](06-privacy-and-account-deletion.md) |
| 앱 액세스 권한(App access) | "모든 기능을 특별한 액세스 없이 이용 가능" — 로그인 없이 거의 모든 게임을 할 수 있고, 로그인(누구나 Google로 가능)은 기록·랭킹·라운지·히든 워드 확장판용. 심사자용 계정은 필요 없어요. | |
| 광고(Ads) | **아니요, 광고 없음** (앱 모드에서 AdSense·히든로그·후원 배너 모두 꺼짐) | [05](05-target-audience-ads.md) |
| 콘텐츠 등급 | IARC 설문 (변형 A) | [03](03-content-rating.md) |
| 타깃층 및 콘텐츠 | 만 13세 이상(13–15, 16–17, 18+), 아동 대상 아님 | [05](05-target-audience-ads.md) |
| 뉴스 앱 | 아니요 | |
| 데이터 보안 | 양식 답안 | [04](04-data-safety.md) |
| 계정 삭제 | `https://www.puzzlthink.com/ko/account-deletion` | [06](06-privacy-and-account-deletion.md) |
| 정부 앱 / 금융 기능 / 건강 | 아니요 / 없음 / 없음 | |
| 게임 카테고리 | 퍼즐 · 태그: 퍼즐, 보드, 전략, 논리, 단어 | [02](02-store-listing.md) |
| 광고 ID | 사용 안 함 | [05](05-target-audience-ads.md#광고-id) |

## 4. 스토어 등록정보

`성장 → 스토어 등록정보 → 기본 스토어 등록정보`
- 짧은 설명·자세한 설명: [02-store-listing.md](02-store-listing.md) 복사
- 앱 아이콘 512×512: `assets/icon-512.png`
- 피처 그래픽 1024×500: `assets/feature-graphic-ko.png` (영어 `-en`)
- 휴대전화 스크린샷 8장 (1080×1920): `assets/screenshots/phone/ko/`
- 7인치·10인치 태블릿 스크린샷 각 6장: `assets/screenshots/tablet7/ko/`, `tablet10/ko/`
- 영어 번역: `번역 추가 → 영어(미국)`에 영어 문구와 `/en/` 그림

## 5. Play 앱 서명과 첫 업로드 (내부 테스트)

1. `테스트 및 출시 → 테스트 → 내부 테스트(Internal testing) → 새 버전 만들기`.
2. "앱 서명" 안내가 나오면 **Google에서 생성한 앱 서명 키 사용(권장)** 을 그대로 두세요. (업로드 키는 우리가 가진 `upload-keystore.jks`.)
3. `android/app-release-bundle.aab` 업로드. 버전 이름 1.0.0 (versionCode 1). 출시 노트 예: `PUZZLTHINK 앱 첫 버전이에요.`
4. 테스터 목록 만들기(본인 Gmail 포함) → 저장 → 검토 및 출시.
5. **앱 서명 키 지문 복사**: `테스트 및 출시 → 앱 무결성(App integrity) → Play 앱 서명 → 설정 보기`의 **앱 서명 키 인증서 SHA-256 인증서 지문**을 복사.
6. 그 값을 `src/lib/playApp.ts`의 `PLAY_APP_FINGERPRINTS.playAppSigning`에 붙여 넣고 사이트를 배포. 확인:
   ```bash
   curl -s https://www.puzzlthink.com/.well-known/assetlinks.json
   ```
   지문이 두 개(업로드 키, 앱 서명 키) 나오면 돼요. Google의 확인 도구로도 볼 수 있어요:
   ```bash
   curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.puzzlthink.com&relation=delegate_permission/common.handle_all_urls"
   ```
7. 내부 테스트 링크로 휴대전화에 설치해서 **주소창 없이 전체 화면**으로 열리는지, 광고·후원 띠가 없는지, 공략·개발 노트 링크가 없는지, Google 로그인과 회원탈퇴 화면이 되는지 확인.

> 업로드 키 지문(이미 사이트 설정에 들어 있음): `FC:DA:A4:31:09:BD:76:2C:FC:38:81:9F:1A:13:F3:B0:57:1C:F7:FD:78:A3:32:60:1B:FF:97:F3:8A:6C:6E:09`
> 이 지문은 로컬 테스트 APK(`android/app-release-signed.apk`, 업로드 키로 서명)용이에요. 스토어에서 받은 앱은 앱 서명 키 지문이 있어야 전체 화면이 돼요.

## 6. 비공개 테스트 12명 × 14일 (개인 계정)

1. `테스트 → 비공개 테스트(Closed testing) → 트랙 만들기(예: alpha)` → 내부 테스트와 같은 번들을 승격하거나 다시 업로드.
2. 국가: 대한민국(+원하는 국가).
3. 테스터: Google 그룹 또는 이메일 목록. **15명 이상** 초대하고, 각자 **참여 링크(opt-in URL)로 수락 → Play 스토어에서 설치**해야 1명으로 세요.
4. 14일 동안 테스터가 앱을 실제로 열어 보게 하세요(피드백이 있으면 좋아요).
5. 14일이 지나면 대시보드에 **프로덕션 액세스 신청(Apply for production)** 이 열려요. 테스트 방법·피드백·출시 준비 질문에 답하면 보통 7일 안에 결과가 와요. 테스터가 부족했다고 판단되면 테스트를 더 하라고 할 수 있어요.

## 7. 프로덕션 출시

1. `프로덕션 → 새 버전 만들기` → 같은 번들 승격.
2. 국가/지역 선택(대한민국 우선, 영어 문구가 있으니 다른 국가도 가능).
3. 검토 제출 → 심사(보통 며칠). 결과는 이메일과 콘솔 "출시 개요"에.

## 8. 업데이트할 때

- **사이트만 바뀌면 앱을 다시 올릴 필요가 없어요** (앱은 사이트를 여는 껍데기). 게임 추가·숨김 목록·스위치 변경도 사이트 배포만 하면 돼요 ([07](07-app-mode.md)).
- 단, 앱에 새로 보이는 내용이 콘텐츠 등급 답을 바꾸면(예: 도박형 게임이 앱에 보이게 됨, 새로운 폭력 표현) **콘텐츠 등급 설문을 다시 제출**해야 해요.
- 앱 자체(아이콘, 이름, 색, 시작 URL, 타깃 API)를 바꿀 때만 `android/twa-manifest.json`의 `appVersionCode`를 올려 다시 빌드·업로드해요. 해마다 타깃 API 요건이 올라가니(보통 8월 31일) 1년에 한 번은 Bubblewrap을 업데이트해 다시 빌드하세요.

## 참고한 공식 문서
- 타깃 API 요건: https://support.google.com/googleplay/android-developer/answer/11926878
- 신규 개인 계정 테스트 요건: https://support.google.com/googleplay/android-developer/answer/14151465
- 콘텐츠 등급: https://support.google.com/googleplay/android-developer/answer/9898843 , https://support.google.com/googleplay/android-developer/answer/9859655
- 가족 정책: https://support.google.com/googleplay/android-developer/answer/9893335
- 결제 정책: https://support.google.com/googleplay/android-developer/answer/9858738
- 데이터 보안: https://support.google.com/googleplay/android-developer/answer/10787469
- 계정 삭제: https://support.google.com/googleplay/android-developer/answer/13327111
