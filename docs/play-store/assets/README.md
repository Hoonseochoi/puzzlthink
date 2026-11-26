# 스토어 그림 — 파일 ↔ Play Console 칸

모두 2026-11-27 로컬 Workers 빌드의 **앱 모드**에서 찍었어요. 랭킹·소식의 닉네임은 실제 사용자 대신 데모 이름(퍼즐러, 벽돌장인…)으로 바꿔 찍었고, 아바타 사진은 빼고, 지나가는 알림 팝업은 가렸어요. PNG, 알파 없음(아이콘 제외).

| Play Console 칸 | 규격 | 파일 |
|---|---|---|
| 앱 아이콘 | 512×512 PNG (Play가 모서리를 둥글게 깎음) | `icon-512.png` (= `icons/a-stone/store-icon-512.png`) |
| 피처 그래픽 | 1024×500 | 한국어 `feature-graphic-ko.png` · 영어 번역 `feature-graphic-en.png` |
| 휴대전화 스크린샷 (2–8장) | 1080×1920 (9:16) | `screenshots/phone/ko/01…08.png` · 영어 `screenshots/phone/en/` |
| 7인치 태블릿 스크린샷 | 1200×1920 | `screenshots/tablet7/ko/01…06.png` · `…/en/` |
| 10인치 태블릿 스크린샷 | 1600×2560 | `screenshots/tablet10/ko/01…06.png` · `…/en/` |

스크린샷 순서와 캡션 (위쪽 띠):
1. 홈 — 게임 40여 가지, 한 앱에서 바로
2. 벽바둑 — 방송에서 본 두뇌 게임을 AI·친구와 직접
3. 슬리더링크 — 매일 새로 열리는 논리 퍼즐
4. 히든 워드 — 숨은 단어를 찾는 추리 게임
5. AI 헬모드 — 더 강한 상대를 원하면
6. 기록실 — 기록과 랭킹, 명예의 전당
7. 시간 경매 — 새 게임이 계속 늘어나요 (휴대전화만)
8. 아이콘 — 플레이할수록 모이는 아이콘 (휴대전화만)

캡션에는 방송 이름을 넣지 않았어요. 2번 화면 안의 게임 소개 문구("데블스플랜3 그 게임!")는 사이트 그대로예요; 중립 버전이 필요하면 2번을 빼고 올리세요.

## 아이콘 3안 — `icons/`

`icons/icon-variants-preview.png`: 스토어 아이콘, 원형·둥근 사각 런처 마스크, Android 13+ 테마 아이콘(단색)을 한눈에.

| 안 | 폴더 | 설명 |
|---|---|---|
| **A 돌멩이 캐릭터 (기본)** | `icons/a-stone/` | 사이트 아이콘과 같은 빨간 말 캐릭터. **지금 .aab의 런처 아이콘과 같아요.** |
| B 바둑알 | `icons/b-baduk/` | 흑·백 바둑알이 겹치고 흑돌에 캐릭터 눈, 빨간 점 |
| C 그리드 | `icons/c-grid/` | 사이트 헤더의 2×2 로고 |

각 폴더: `store-icon-512.png`(스토어), `adaptive-foreground-432.png`·`adaptive-background-432.png`·`adaptive-monochrome-432.png`(적응형 런처 아이콘 레이어, 108dp@xxxhdpi, 가운데 66dp 안전 영역). 원본 SVG는 `icons/src/`. B·C로 바꾸는 법은 [07-app-mode.md](../07-app-mode.md#다시-빌드하기).
