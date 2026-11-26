# 07. 앱 모드 — 동작 방식, 바꾸는 법, 다시 빌드하기

## 한 파일에서 모두 정해요: `src/lib/playApp.ts`

| 스위치 | 지금 값 | 하는 일 |
|---|---|---|
| `PLAY_APP_HIDDEN_GAMES` | `[]` (모든 게임 공개) | 넣은 게임 id는 앱 어디서도 안 보이고, 주소로 열면 "웹에서 이용할 수 있어요" 화면. 예비 목록: `'indianPoker'`, `'twoSidedPoker'`, `'hitStay'`, `'sniperHoldem'` (+ 총 그림 `'russianRoulette'`) |
| `PLAY_APP_HIDE.ads` | `true` | AdSense 스크립트·광고 칸·자리 없음 |
| `PLAY_APP_HIDE.hiddenlog` | `true` | 히든로그 배너·결과 카드 없음, 노출·클릭 집계 안 함 |
| `PLAY_APP_HIDE.support` | `true` | 후원(CTEE) 링크·배너·카드, "후원자 커버 받기" 카드 없음 |
| `PLAY_APP_HIDE.install` | `true` | "앱 설치" 띠·카드 없음 |
| `PLAY_APP_HIDE.articles` | `true` | 게임 공략(`/guides`, 모든 `/<게임>/guide`), 개발 노트, 보드게임 백과, 서바이벌 게임 정리, 게임 이론 — 링크·허브·"공략 보기" 버튼 없음, 주소로 열면 중립 화면. 게임 페이지 아래 짧은 규칙·FAQ는 남음 |
| `PLAY_APP_FINGERPRINTS.playAppSigning` | `''` | **첫 업로드 후 Play 앱 서명 키 SHA-256을 넣고 배포** (`/.well-known/assetlinks.json`) |
| `PLAY_APP_PACKAGE` | `com.puzzlthink.app` | `android/twa-manifest.json`의 `packageId`와 같아야 함 |

스위치를 바꾸면 **사이트만 배포**하면 돼요. 앱(.aab)을 다시 올릴 필요 없어요.

## 앱인지 어떻게 아나
1. 앱의 시작 주소는 `https://www.puzzlthink.com/?app=play`. 또 Chrome은 앱으로 열 때마다(공유 링크로 열어도) 첫 페이지의 referrer를 `android-app://com.puzzlthink.app`으로 줘요.
2. `<head>` 맨 앞의 작은 스크립트가 그림을 그리기 전에 이걸 보고 `<html data-app="play">`를 붙이고, 그 탭의 sessionStorage에 기억해요(앱은 Chrome과 쿠키를 같이 써서, 쿠키만 쓰면 일반 Chrome 탭까지 앱 모드가 될 수 있어요). AdSense 스크립트도 이 스크립트가 웹에서만 넣어요.
3. 서버(프록시 `src/proxy.ts`)는 같은 신호와 세션 쿠키 `ptk_app=play`로 앱 요청을 알아보고, 막힌 페이지(글 섹션, 숨긴 게임)를 `/web-only` 화면으로 바꿔 보내요. 이 응답은 캐시하지 않아서(no-store) 웹 방문자에게 섞이지 않아요(로컬 Workers 빌드에서 확인).
4. CSS가 `data-app="play"`일 때만 표시된 요소와 막힌 페이지로 가는 링크를 숨겨요. 페이지는 여전히 정적 생성 그대로예요.
5. 앱에서 받은 `?app=play`는 주소창에서 지워서 공유 링크에 붙지 않아요. 브라우저에 설치한 PWA나 일반 웹 방문은 앱 모드가 아니에요.

## 적용 범위 (확인한 화면)
홈(카드·카테고리 수·오늘의 추천·실시간 소식), 게임 목록, 헤더·푸터·하단 탭, 기록실(AI·오픈·명예의 전당·경쟁전 표), 아이콘, 헬모드, 오픈 대전 카드·방 목록, 게임 페이지(관련 게임·공략 버튼), 랭킹 페이지, 히든 워드 확장판, 스나이퍼 홀덤, 시간 경매, 라운지, 회원탈퇴·약관·방침 — 2026-11-27 로컬 Workers 빌드에서 412px 폭으로 27개 주소를 앱/웹 두 모드로 열어 비교했어요([README](README.md#확인한-것)).

숨긴 게임이 생기면 추가로 숨겨지는 곳: 홈 카드와 수, 게임 메뉴, 기록실 카드·명예의 전당·오픈 랭킹·경쟁전 게임 목록, 아이콘의 게임별 항목, 오픈 대전 그림·진행 중 게임·방 목록·방 만들기, 실시간 소식, 그 게임의 플레이·방·공략·랭킹 주소(중립 화면).

## 다시 빌드하기 (.aab)

앱 자체(이름, 아이콘, 색, 시작 주소, 패키지 ID, 타깃 API)를 바꿀 때만 필요해요.

설치된 도구(소유자 홈 폴더, sudo 없이): JDK 17 `~/.local/jdk/jdk-17.0.21.1+2`, Android SDK `~/Library/Android/sdk`(build-tools 36.0.0, platform 36), Bubblewrap 1.28.0(`npm i -g @bubblewrap/cli`), 설정 `~/.bubblewrap/config.json`.

1. `android/twa-manifest.json` 수정. 새로 올릴 때는 `appVersionCode`를 1 올리고 `appVersionName`도 바꾸기.
2. 프로젝트 다시 만들기:
   ```bash
   cd android && bubblewrap update --skipVersionUpgrade --manifest ./twa-manifest.json
   ```
3. 빌드 (비밀번호는 파일에서 읽어 환경 변수로만 넘김, 화면에 찍지 않음):
   ```bash
   cd android && F=~/.config/puzzlthink/play/upload-keystore.passwords.txt && BUBBLEWRAP_KEYSTORE_PASSWORD=$(grep '^KEYSTORE_PASSWORD=' $F | cut -d= -f2) BUBBLEWRAP_KEY_PASSWORD=$(grep '^KEY_PASSWORD=' $F | cut -d= -f2) bubblewrap build --skipPwaValidation
   ```
4. 결과: `android/app-release-bundle.aab`(업로드용), `android/app-release-signed.apk`(직접 설치 테스트용). 둘 다 git에 들어가지 않아요.

아이콘을 다른 안(B 바둑알, C 그리드)으로 바꾸려면: 그 폴더의 PNG를 사이트 `public/icons/`에 올려 배포한 뒤 `iconUrl`/`maskableIconUrl`(필요하면 `monochromeIconUrl`)을 그 주소로 바꾸고 2–3단계. 스토어 아이콘(`assets/icon-512.png`)도 같은 안으로 맞추세요.

## 키
- 업로드 키스토어: `~/.config/puzzlthink/play/upload-keystore.jks` (별칭 `upload`, RSA 2048, 10000일)
- 비밀번호 파일: `~/.config/puzzlthink/play/upload-keystore.passwords.txt` (소유자만 읽기, 600)
- 업로드 키 SHA-256: `FC:DA:A4:31:09:BD:76:2C:FC:38:81:9F:1A:13:F3:B0:57:1C:F7:FD:78:A3:32:60:1B:FF:97:F3:8A:6C:6E:09`
- `.gitignore`가 `*.jks`, `*.keystore`, `*.p12`, `*passwords*.txt`, `android/*.aab|*.apk`, 빌드 폴더를 막아요.
