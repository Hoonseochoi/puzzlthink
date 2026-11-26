# 06. 개인정보처리방침·회원탈퇴·라운지 규칙

## 콘솔에 넣을 URL

| 칸 | URL |
|---|---|
| 개인정보처리방침 | `https://www.puzzlthink.com/ko/privacy-policy` (영어 번역: `/en/privacy-policy`) |
| 계정 삭제(웹 링크) | `https://www.puzzlthink.com/ko/account-deletion` |
| 이용약관(참고, 콘솔 칸은 없음) | `https://www.puzzlthink.com/ko/terms` |

## 이번에 바꾼 것

**개인정보처리방침** (`src/messages/{ko,en}.json` → `Legal.privacySections`, 최종 수정일 2026-11-27)
- 1. 개요: Google Play의 Android 앱도 같은 방침이 적용되고 앱에는 광고가 없다는 문장.
- 2. Google 로그인: **라운지 메시지**가 닉네임과 함께 공개되고 신고 처리를 위해 저장된다는 문장(전에는 라운지 언급이 없었어요).
- 11. 이용자의 권리: 회원탈퇴 페이지와 앱 안 경로, 탈퇴 즉시 삭제.
- 그대로 둔 것: 12. 광고 및 쿠키(웹사이트에는 AdSense가 있으니 유지).

**이용약관** (`Legal.termsSections`)
- 새 **7. 라운지(채팅)와 닉네임**: 금지 내용, 자동 필터, 신고·차단, 자동 제한과 운영자 조치, 신고 메일. 기존 7. 문의 → 8.

**회원탈퇴** (웹사이트와 앱 모두)
- `/account-deletion` 페이지: 로그인 상태면 "탈퇴"를 입력하고 버튼 → 즉시 삭제 후 로그아웃. 로그인할 수 없으면 메일(`contact@puzzlthink.com`) 안내.
- 들어가는 길: 계정 메뉴(로그인 버튼 → 회원탈퇴), 푸터 "회원탈퇴".

**라운지(UGC)** — 숨기지 않고 유지하기로 했어요. 이유: 이미 금칙어·연락처·링크 **자동 필터**(`lounge_check`), 메시지마다 **신고**, 사용자별 **차단**(메시지 숨김), 3명 신고 시 **자동 채팅 제한**, 운영자 금칙어 목록·운영자 계정이 있어서, Play의 UGC 정책이 요구하는 것 중 빠진 건 "공개된 규칙과 동의"뿐이었어요. 그래서 이용약관 7조를 만들고, 라운지 입력칸 아래에 "보내면 라운지 규칙(이용약관 7조)에 동의한 것으로 봐요. 메시지마다 신고·차단할 수 있어요." 줄과 약관 링크를 넣었어요.
- 닉네임도 공개되므로 **라운지와 같은 필터를 닉네임에 적용**(마이그레이션 2). 걸리면 "쓸 수 없는 말이 들어 있는 닉네임이에요."

## 마이그레이션 적용

두 파일 모두 **라이브 DB에는 적용하지 않았어요.** 저장소의 모든 마이그레이션을 새 스크래치 DB(`supabase/postgres:17.6.1.136` 컨테이너)에 순서대로 적용한 뒤 테스트했고, 탈퇴 17/17 · 닉네임 필터 4/4 통과했어요. 다시 돌려 보려면:

```bash
./supabase/tests/play_store/run.sh
```

라이브 적용 (다른 마이그레이션과 같은 방식, 순서대로):

```bash
docker exec -i supabase-db psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/20271128000000_account_deletion.sql
```

```bash
docker exec -i supabase-db psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/20271128010000_nickname_filter.sql
```

적용 확인 (함수 두 개와 권한):

```bash
docker exec supabase-db psql -U postgres -tAc "select proname, has_function_privilege('authenticated', oid, 'execute') from pg_proc where proname in ('delete_my_account','delete_account_data')"
```

`delete_my_account | t`, `delete_account_data | f` 이면 돼요. PostgREST가 새 함수를 바로 못 찾으면 `notify pgrst, 'reload schema';`.

### 탈퇴하면 일어나는 일 (`20271128000000_account_deletion.sql`)
- `auth.users` 행 삭제 → 외래키로 연결된 표는 같이 삭제: 프로필(닉네임), 왕관, 클리어 인증, 헬 클리어, 이용 시간, 아이콘, 말 모양, 후원자 커버, 피스 사용, 경쟁전 최종 순위, 퍼즐 챌린지 기록, 라운지 메시지·신고(신고자로서)·제재, 투표, 왕관을 뺏긴 알림, 슬리더 탈환 기록.
- 함께 쓰는 것은 남기고 사람만 지움(외래키 SET NULL): 퍼즐 보드의 보유자·첫 완성자, 투표 만든 사람, 네모 세기 대결 기록.
- 외래키 없이 user_id만 가진 표는 함수가 직접 삭제: `game_results`(본인 기록만 — 상대의 기록은 상대의 행이라 그대로), 히든 워드 기록·진행 중 게임, 활동일, 순위 스냅샷, 명예의 전당 "봤음" 표시, 라운지 전송 기록.
- 이름만 지움: 오류 제보(계정·메일 삭제, 내용 유지), 라운지 신고의 "신고당한 사람"(기록 유지), 실시간 소식의 닉네임과 네모 세기 대결 링크의 만든 사람 → `탈퇴한 플레이어`.
- 랭킹 캐시(`rpc_cache`) 비움 → 다음 조회 때 남은 기록으로 다시 계산.
- 메일로 요청이 오면(로그인 못 하는 경우):
  ```bash
  docker exec supabase-db psql -U postgres -c "select public.delete_account_data((select id from auth.users where email = '요청자@메일'))"
  ```

### 확인하지 못한 것
- 라이브 `auth` 스키마에는 gotrue가 만든 표(identities, sessions 등)가 더 있어요. 이 표들은 gotrue가 `auth.users`에 ON DELETE CASCADE로 묶어 두므로 같이 지워질 것으로 보지만, 스크래치 DB(최소 auth 스키마)에서는 확인할 수 없었어요. 적용 후 테스트 계정 하나로 실제 탈퇴를 해 보세요.
- `postgres` 역할은 스크래치 이미지(라이브와 같은 버전)에서 슈퍼유저가 아니지만 `auth.users` DELETE 권한이 있었어요. 라이브도 같은 이미지라 같을 거예요.
