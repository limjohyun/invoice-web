# Vercel 배포 가이드

> **이 문서는 안내용이다 — 실제 배포 실행(로그인, 시크릿 입력, 배포 클릭)은 사용자가 직접 진행해야 한다.** Claude Code는 계정 로그인이나 실제 API 키/토큰 입력을 대신 수행하지 않는다.

## 사전 체크 (이미 로컬에서 통과 확인됨)

배포 전에 아래가 로컬에서 전부 통과하는지 확인한다(Phase 4/5에서 이미 확인했지만, 배포 직전에 한 번 더 돌려보는 것을 권장):

```bash
npm run check-all   # typecheck + lint + format:check
npm run build
npm run test         # Vitest 유닛/컴포넌트 테스트
```

## 1. Vercel 프로젝트 생성

1. https://vercel.com 에 GitHub 계정으로 로그인한다.
2. "Add New... → Project"에서 이 저장소(GitHub repo)를 Import한다.
3. Framework Preset은 Next.js가 자동 감지된다. Build Command/Output Directory는 기본값(`next build`)을 그대로 둔다.

## 2. 환경변수 등록

Vercel 프로젝트의 **Settings → Environment Variables**에서 `.env.example`(저장소 루트)에 나열된 값을 실제 값으로 등록한다. 어디서 값을 가져오는지는 다음과 같다:

| 변수                            | 어디서 가져오는가                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                  | Supabase 프로젝트 → Settings → API → Project URL                                                                                                                                                                    |
| `SUPABASE_ANON_KEY`             | 위와 동일 위치 → anon public key                                                                                                                                                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | 위와 동일 위치 → service_role key (⚠️ 절대 클라이언트에 노출 금지)                                                                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | `SUPABASE_URL`과 동일한 값                                                                                                                                                                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY`와 동일한 값                                                                                                                                                                                     |
| `NOTION_API_KEY`                | 선택사항(단일 워크스페이스 폴백용). 사용자별 연동은 앱 내 `/settings`에서 이루어지므로 실사용에는 필요 없음 — 값이 없으면 아무 문자열이라도 넣거나(`ntn_unused`), `src/lib/env.ts`의 검증을 통과할 더미 값을 넣는다 |
| `NEXT_PUBLIC_APP_URL`           | 배포된 프로덕션 URL(예: `https://your-domain.vercel.app`), 선택                                                                                                                                                     |

Production/Preview/Development 환경 각각에 등록할지 선택할 수 있다 — 최소한 **Production**에는 반드시 등록해야 한다.

## 3. Supabase 쪽 설정 확인

- `supabase/sql/` 아래의 마이그레이션(SQL)이 실제 Supabase 프로젝트에 전부 적용되어 있는지 확인한다(`profiles_rls.sql`, `profiles_schema_fix.sql`, `profiles_clients_templates_db.sql` 등).
- Supabase 프로젝트 Settings → Authentication → URL Configuration에서 **Site URL**과 **Redirect URLs**에 배포된 Vercel 도메인을 추가한다(이메일 인증/리다이렉트가 로컬 `localhost` 대신 프로덕션 도메인으로 가야 하기 때문).

## 4. 첫 배포

Vercel에서 "Deploy" 버튼을 누르면 자동으로 빌드/배포된다. 이후 `main` 브랜치에 푸시할 때마다 자동 재배포된다(Vercel의 기본 Git 연동 동작).

## 5. 배포 후 확인 체크리스트

실제 프로덕션 URL에서 아래를 한 번씩 확인한다(`docs/guides/user-guide.md`의 흐름과 동일):

- [ ] 회원가입 → 로그인 → `/settings`로 정상 리다이렉트
- [ ] Notion Integration Token 입력 → DB 목록 조회 → 4개 DB 저장 → `/dashboard`로 이동
- [ ] 견적서 생성 → Notion에 실제로 저장되는지 확인
- [ ] 견적서 상세에서 상태 변경 → 반영 확인
- [ ] PDF 다운로드 → 한글이 깨지지 않는지 확인
- [ ] 잘못된 URL 접속 → 커스텀 404 페이지가 뜨는지 확인

## 참고: GitHub Actions CI

`.github/workflows/ci.yml`이 `push`/`pull_request`(main 대상)마다 typecheck/lint/format/build/vitest를 자동 실행한다. 이 워크플로우는 실제 Supabase/Notion 시크릿 없이 더미 값으로 빌드만 검증하며, Vercel 배포 자체를 트리거하지 않는다(Vercel의 자체 Git 연동이 배포를 담당). Playwright e2e(`tests/e2e/`)는 실제 Supabase service-role 키가 있어야 테스트 계정을 만들 수 있어 CI에는 포함하지 않았다 — 필요하면 GitHub repo의 **Settings → Secrets and variables → Actions**에 값을 등록하고 워크플로우에 별도 잡을 추가한다.
