# 🗺️ 개발 로드맵

## 프로젝트 개요

- **프로젝트 명**: Notion Invoice Web (견적서 관리 시스템)
- **목적**: 별도 서버/DB 구축 없이 Notion 데이터베이스를 백엔드로 활용해 1인 사업가·프리랜서·소규모 비즈니스가 견적서를 손쉽게 작성·관리·공유할 수 있게 한다.
- **기술 스택**: Next.js 15.5.3(App Router + Turbopack), React 19.1.0, TypeScript 5, TailwindCSS v4 + shadcn/ui(new-york), React Hook Form + Zod + Server Actions, Notion API(@notionhq/client), Supabase Auth, @react-pdf/renderer, Vercel
- **문서 기준일**: 2026-07-02
- **최종 업데이트**: 2026-07-20 (Phase 5 코드/문서 작업 완료, 실제 Vercel 배포만 남음 + **Phase 6(관리자 기능) 계획 신규 수립**)
- **현재 상태**: **Phase 1~5 전부 구현·문서화 완료**(T1~T9, F001~F013). Phase 4에서 폼 스모크 테스트/에러 바운더리/로딩 스켈레톤/상태 변경 UI를 추가하고 실제 Notion 워크스페이스로 전체 플로우 수동 검증까지 마쳤다. Phase 5에서는 루트 레벨 404(`not-found.tsx`)/500(`global-error.tsx`) 페이지, GitHub Actions CI(`ci.yml`, 시크릿 불필요 검사만), `docs/guides/notion-integration.md`·`user-guide.md`·`deployment-guide.md` 3종 문서, 캐싱/이미지 최적화 검토 결과 문서화를 완료했다. 스타터 템플릿 잔재였던 브랜딩("NextJS Starter")도 전부 "Notion Invoice Web"으로 교체했다. `npm run check-all`/`build`/`test`(56개) 전부 통과, Chrome으로 404 페이지/브랜딩/대시보드 회귀 확인 완료. **남은 것은 실제 Vercel 배포 실행뿐(로그인·시크릿 입력이 필요해 사용자가 `deployment-guide.md`를 보고 직접 진행)**. MVP 이후 확장으로 **Phase 6: 관리자 기능(견적서 목록 관리 뷰 + 클라이언트 공유 링크)**을 새로 계획했다 — 아직 구현 착수 전, 설계만 확정된 상태
- **예상 개발 기간**: MVP 약 5.5주(2026-07-02 ~ 2026-08-08) + 확장(안정화·배포) 약 3.5주(2026-08-10 ~ 2026-09-04) → 총 약 9주 + **Phase 6(관리자 기능) 약 3주(2026-09-07 ~ 2026-09-25, 버퍼 포함) 추가** → **전체 약 12주(2026-07-02 ~ 2026-09-25)**
- **팀 구성 권장안**: 풀스택 개발자 1명(전담 구현) — 리소스가 제한적이므로 각 페이즈 내 태스크는 "UI 마크업(목업 데이터) 선(先) 진행 → 백엔드/Notion 연동 후(後) 결합" 순서로 배치해 컨텍스트 전환 비용을 최소화. 코드 리뷰가 필요하면 파트타임 리뷰어 1명 권장(선택)

> 📌 **핵심 설계 확정(2026-07-07)**:
>
> - **Notion DB 구조**: **Invoices + Items 2개 DB, Relation 구조** (기존 3-DB + JSON 설계 변경)
>   - Invoices: 견적서 + 거래처 정보(텍스트 필드로 직접 저장, 별도 DB 없음)
>   - Items: 품목 항목 (Invoices와 Relation으로 1:N 연결, JSON 직렬화 불필요)
>   - Templates 제외: 현재 Phase 범위 외 (필요 시 추후 별도 기획)
> - **User 저장**: Supabase Auth (비밀번호+토큰+2개 DB ID 매핑)
> - **자동 계산**: Items의 Amount는 Formula, Invoices의 Total Amount는 Rollup으로 Notion이 직접 계산

---

## 페이즈별 개발 계획

### Phase 1: 인증 기반 & Notion 연동 설계 (2026-07-02 ~ 2026-07-15, 약 2주)

**목표**: 실제 로그인이 가능한 상태를 만들고, Notion을 데이터 백엔드로 쓰기 위한 계정-토큰-DB 구조를 확정한다. 이 페이즈가 끝나야 이후 모든 기능이 "진짜 데이터"로 동작할 수 있다.

**우선순위**: MUST (전체 서비스의 전제 조건)

**선행 조건**: 없음 (스타터 템플릿의 로그인/회원가입 폼 UI는 이미 존재 — 로직만 교체)

#### 핵심 기능

- [x] (MUST) Supabase 프로젝트 생성 및 `@supabase/supabase-js`, `@supabase/ssr` 설치·환경 변수(`src/lib/env.ts`) 확장 **✅ T2 완료**
- [x] (MUST) F010 회원가입/로그인/로그아웃 — 기존 `login-form.tsx`/`signup-form.tsx`를 Server Action + Supabase Auth로 연결 **✅ T3/T4/T5 완료**
- [x] (MUST) `middleware.ts` 기반 보호된 라우트(로그인 필요 페이지 접근 제어) **✅ T6 완료**
- [x] (MUST) F011 Notion 연동 설정 페이지 — Integration Token 입력/저장, 연동 가능 DB 목록 조회, 연결 테스트 UI **✅ T8 완료**
- [x] (MUST) 로그인 성공 후 분기 로직: Notion 미연동 → 연동 설정 페이지, 연동 완료 → 대시보드(PRD 사용자 여정 그대로) **✅ T9 완료**

#### 기술적 준비 작업

- [x] Notion 데이터베이스 구조 확정(설계 스파이크): Invoices + Items 2-DB Relation 구조, `docs/guides/notion-schema.md` 작성 완료 **✅ T1**
- [x] 기존 설계 문서(PRD, ROADMAP, env.ts, .env.example) 2-DB 구조로 업데이트 **✅ T1**
- [ ] 사용자 Notion 웹에서 DB 속성 설정 완료 (Invoices/Items 각 속성 추가, Relation/Formula/Rollup 설정) **[사용자 수동 작업]**
- [x] `@supabase/supabase-js`, `@supabase/ssr` 설치 및 클라이언트 분리(`createSupabaseBrowserClient`, `createSupabaseServerClient`, `createSupabaseAdminClient`) **✅ T2/T6**
- [x] Supabase RLS 정책 SQL 생성(`supabase/sql/profiles_rls.sql`): profiles 테이블 행 수준 보안 설정 **✅ T6**
- [x] Supabase 세션 타입과 Server Action 간 타입 공유 패턴 정리(`src/lib/schemas/auth.ts`) **✅ T3/T4**
- [x] `@notionhq/client` 설치 및 서버 전용 Notion API 래퍼 모듈 설계 **✅ T7 완료**
  - `src/lib/notion/client.ts`: Notion 클라이언트 (타임아웃 5초, 재시도 로직)
  - `src/lib/notion/errors.ts`: 에러 정규화 + 한국어 메시지
  - `src/lib/notion/logger.ts`: 구조화 로거 (토큰 마스킹)
  - `src/lib/notion/constants.ts`: 설정값
  - `src/lib/notion/queries.ts`: Invoices/Items CRUD 함수
  - `src/lib/notion/types.ts`: Invoice, Item 타입
  - `src/lib/notion/mappers.ts`: Notion 응답 매핑
- [x] Server Action 구조 설계 **✅ T7 완료**
  - `src/lib/actions/notion.ts`: 9개 함수 (getInvoices, createInvoice, updateInvoice 등)
  - `src/lib/schemas/invoice.ts`: Zod 검증 스키마
  - NotionResult 타입 + getNotionContext() 헬퍼

#### 예상 완료 결과물

- ✅ **완료**: 실제 이메일/비밀번호로 가입·로그인·로그아웃이 동작하는 인증 시스템 (T3/T4/T5)
- ✅ **완료**: Supabase Auth + 쿠키 기반 세션 관리, middleware.ts로 보호된 라우트 구현 (T6)
- ✅ **완료**: 확정된 Notion DB 스키마 문서 (T1)
- ✅ **완료**: Notion API 래퍼 모듈 (클라이언트, 에러 처리, CRUD 함수) (T7)
- ✅ **완료**: Server Action 구조 (9개 함수, Zod 스키마) (T7)
- ✅ **완료**: Notion Integration Token 입력/저장, DB 목록 조회, 연동 테스트 설정 페이지 (/settings) (T8)
- ✅ **완료**: 로그인 성공 후 Notion 연동 상태 확인 분기 로직 + Playwright E2E 테스트 3종 (T9)

#### 위험 요소

- **위험**: Notion Integration Token을 평문으로 저장하면 보안 사고로 직결 → **완화**: Supabase 컬럼 레벨 암호화 또는 Vault 기능 사용, 최소한 서버 전용 접근(RLS로 클라이언트 직접 조회 차단)
- **위험**: Notion Relation은 저장 순서를 보장하지 않음 → **완화**: Sort Order (Number) 필드 추가로 Item 표시 순서 유지
- **위험**: 거래처 정보를 Invoice 내 텍스트 필드로 저장하면 향후 거래처별 다중 Invoice 조회가 어려움 → **완화**: 현재 소규모 사용 시나리오이므로 수용 가능, 필요 시 향후 Clients DB 분리
- **위험**: Supabase Auth와 React 19 Server Actions 조합의 세션 갱신(refresh token) 타이밍 이슈 → **완화**: `@supabase/ssr` 공식 Next.js App Router 가이드를 context7로 최신 문서 확인 후 구현

#### T9 E2E 테스트 중 발견 및 수정된 버그 (2026-07-16)

실제 로그인 흐름을 Playwright로 검증하는 과정에서 지금까지 눈에 띄지 않던 버그 3건을 발견하고 수정했다. 세 건 모두 T3~T8이 "완료"로 표시된 이후에도 실제로는 한 번도 끝까지 성공적으로 동작한 적이 없었던 경로였다는 공통점이 있다.

1. **profiles 테이블 스키마가 애플리케이션 코드와 불일치**: 실제 DB에는 `id` 컬럼이 없었고, `notion_access_token`이 Primary Key + NOT NULL로 설정되어 있어 "Notion 미연동 상태"를 표현할 수 없었으며, 컬럼명도 코드와 달랐다(`notion_invoices_db_id` vs `notion_invoice_db_id`). `supabase/sql/profiles_schema_fix.sql`로 수정하고, 회원가입 시 `profiles` 행을 자동 생성하는 트리거(`on_auth_user_created`)를 추가했다.
2. **로그인 폼 비밀번호 필드 접근성 버그**: `login-form.tsx`에서 `FormControl`의 직계 자식이 `<div>`였던 탓에 `id`가 실제 `Input`이 아닌 `div`에 붙어 label-input 연결이 깨져 있었다. 스크린 리더 사용자에게도 실제로 영향이 있는 버그였다.
3. **서버 전용 환경 변수가 클라이언트 번들에 노출**: `src/lib/supabase/client.ts`가 서버 전용 값까지 파싱하는 `src/lib/env.ts` 전체를 import하고 있어, 브라우저에서 `SUPABASE_SERVICE_ROLE_KEY` 등이 `undefined`가 되며 ZodError로 `/settings`, `/dashboard` 진입 시 클라이언트 크래시가 발생했다. `NEXT_PUBLIC_` 값만 검증하는 `src/lib/env.client.ts`를 분리해서 해결했다.

**교훈**: Server Action이 `success: true`를 반환해도 DB에 실제로 반영됐는지는 별개 문제다(예: `.update()`가 대상 행 없이 조용히 0행 성공하는 경우). 실제 로그인 → 리다이렉트 → 대상 페이지 렌더링까지 이어지는 E2E 테스트 없이는 이런 버그가 계속 가려져 있었을 것이다.

---

### Phase 2: 견적서 핵심 CRUD & 대시보드 (2026-07-16 ~ 2026-07-29, 약 2주)

**목표**: PRD의 핵심 가치인 "견적서 생성 → Notion 동기화 → 조회/수정/삭제" 흐름을 완성한다.

**우선순위**: MUST

**선행 조건**: Phase 1의 Notion DB 스키마 확정 및 인증/세션 패턴

**병렬 처리 가능**: 대시보드·견적서 작성 폼의 UI 마크업(목업 데이터 사용)은 Notion 동기화 Server Action 구현과 동시에 진행 가능 — 완성 후 목업 데이터를 실제 Notion 응답으로 교체하는 방식으로 리스크 분리

#### 핵심 기능

- [x] (MUST) F001 대시보드 — Notion 견적서 DB 목록 조회, 상태(초안/발송 등) 표시, 마지막 동기화 시각 표시 **✅ 구현 완료**
- [x] (MUST) F002 견적서 작성 — 거래처 정보 직접 입력, 품목/수량/단가 입력 및 금액 자동 계산(React Hook Form + Zod, `useFieldArray`로 품목 반복 입력) **✅ 구현 완료**
- [x] (MUST) F006 Notion 동기화 — 견적서 저장 시 Notion 페이지 생성/업데이트 Server Action(`createInvoiceWithItems`/`updateInvoiceWithItems`, 품목 diff 처리) **✅ 구현 완료**
- [x] (MUST) F003 견적서 상세 조회 페이지 **✅ 구현 완료**
- [x] (MUST) F004 견적서 수정 — 작성 페이지를 수정 모드로 재사용 **✅ 구현 완료**
- [x] (MUST) F005 견적서 삭제 — Notion 페이지 아카이브 처리 포함(AlertDialog 확인) **✅ 구현 완료**

#### 기술적 준비 작업

- [x] Notion 품목(items) 데이터 표현 방식: T7에서 이미 Items 2-DB Relation 구조로 확정 및 구현됨(JSON 직렬화 아님) **✅**
- [x] 금액 자동 계산 로직 유닛 함수 분리(`src/lib/invoice/calculate.ts`) — 저장 전 폼 미리보기용, 실제 값은 Notion Formula/Rollup이 계산 **✅**
- [x] Notion API 응답 → 화면 표시용 타입 매핑 계층(`src/lib/notion/mappers.ts`) — T7에서 이미 구현 **✅**
- [x] 저장 실패 시 에러 처리 및 재시도 UX(토스트 알림, sonner 활용) **✅**

#### 🧪 테스트 체크리스트 (Playwright MCP 필수)

**구현 완료 후 반드시 다음 3가지 시나리오를 테스트한 후에만 완료 처리**:

- [x] ✅ 정상 케이스(Happy Path): **전부 검증 완료** — 대시보드 목록 조회(F001), 신규 작성(F002/F006 — `/invoice/create`에서 제목/거래처/품목 입력 → 저장 → Notion에 `POST pages` 2건(견적서+품목) 생성 확인), 상세 조회(F003), 수정 시 품목 생성/수정/삭제 diff(F004 — 품목 삭제 시 `PATCH ... archived:true`, 남은 품목 `PATCH`로 업데이트 확인), 삭제(F005 — 삭제 확인 다이얼로그 → `PATCH ... archived:true` → 대시보드에서 사라짐 확인)까지 전부 실제 Notion 워크스페이스로 검증했다
- [ ] ❌ 실패/에러 케이스: Notion API 실패, 잘못된 입력, 네트워크 오류 시 에러 메시지 표시 및 롤백 — 미검증
- [ ] 🎯 엣지 케이스: 매우 긴 텍스트, 특수문자, 동시 요청 — 미검증. 품목 0개 상태는 실제로 마주쳤고(테스트 데이터 중 4건), zod `min(1)` 검증이 정상적으로 저장을 막는 것까지 확인함
- [ ] 테스트 실패 시 원인 파악 → 코드 수정 → 재테스트 → 통과 확인 후 완료 처리

> **2026-07-18 진행 메모**: Chrome 브라우저 확장을 연결해 실제 Notion 워크스페이스로 F001~F006 전 기능을 수동 e2e로 검증했다. 대시보드/상세/생성/수정/삭제 모두 실제 Notion API 호출(`POST pages`, `PATCH pages`, `data_sources/query`)이 성공하는 것을 서버 로그로 직접 확인했고, 품목 diff(생성/수정/삭제) 3가지 분기 모두 실제로 동작을 마주쳤다. 남은 것은 실패/에러 케이스와 특수문자·긴 텍스트 같은 엣지 케이스뿐이다. Playwright 자동화 E2E는 사용자 결정에 따라 Phase 2에서는 보류하고 Phase 4(안정화)에서 구축한다.

#### Phase 2 실데이터 검증 중 발견한 이슈 (2026-07-18)

실제 Notion 워크스페이스로 대시보드/상세/수정 화면을 확인하는 과정에서 실제 버그 1건을 발견하고 수정했다.

**Notion Invoices DB의 Title 속성이 코드와 불일치**: `docs/guides/notion-schema.md` 설계는 "Title"(견적서 식별자, Title 타입)과 "Client Name"(거래처명, 텍스트 타입)을 별도 속성으로 가정하지만, 실제 워크스페이스에는 "Title" 속성이 아예 없고 **"Client Name"이라는 이름의 속성이 Title 타입(페이지 제목)으로 되어 있었다.** 증상: (1) 대시보드에 모든 견적서의 제목/거래처명이 항상 빈 값으로 표시됨(`mapPageToInvoice`가 존재하지 않는 `Title` 속성을 읽으려 함), (2) 견적서 수정 저장 시 Notion API가 `"Title is not a property that exists. Client Name is expected to be title."` 검증 에러를 반환하며 저장 자체가 실패함. Notion 데이터베이스는 Title 타입 속성을 하나만 가질 수 있어(제약상 별도로 추가 불가), 사용자가 Notion에서 기존 "Client Name"(Title 타입) 속성명을 "Title"로 바꾸고, 새로 "Client Name"(텍스트 타입) 속성을 추가한 뒤 기존 5개 테스트 견적서의 제목/거래처명 값을 다시 채워 넣는 방식으로 해결했다. **코드 변경은 없었음** — 순수하게 실제 Notion 데이터베이스 스키마를 문서/코드 설계에 맞춘 것.

**교훈**: T9의 profiles 스키마 불일치와 같은 패턴 — Notion/DB 스키마는 코드가 배포된 후에도 실제 워크스페이스에서 계속 드리프트할 수 있으므로, 실제 데이터로 화면을 띄워보기 전까지는 매핑 코드가 맞는지 확신할 수 없다.

#### 예상 완료 결과물

- 목업 없이 실제 Notion 데이터로 동작하는 대시보드 **✅ 구현 + 수동 검증 완료**
- 견적서 생성 → Notion 페이지 생성 → 상세 조회 → 수정(품목 diff) → 삭제(archive)까지 전체 흐름 **✅ 구현 + 수동 검증 완료**
- 남은 것: 실패/에러 케이스, 특수문자·긴 텍스트 등 엣지 케이스 검증 **⏳ 대기**

#### 위험 요소

- **위험**: Notion API Rate Limit(초당 3요청)으로 대시보드 목록 조회나 대량 저장 시 지연/실패 가능 → **완화**: 요청 큐잉/재시도(exponential backoff) 유틸 도입, 목록 조회는 페이지네이션으로 분할
- **위험**: 품목(items)처럼 구조화된 데이터를 Notion 속성에 억지로 맞추면 향후 확장(품목별 세금 등)이 어려워짐 → **완화**: 초기부터 JSON 직렬화 + 버전 필드를 둬서 스키마 진화 여지 확보
- **위험**: Notion 동기화 중 네트워크 실패로 로컬 상태와 Notion 상태 불일치 → **완화**: 저장 성공 후에만 UI 상태 갱신(낙관적 업데이트 지양), 동기화 상태 배지로 사용자에게 명시

---

### Phase 3: PDF 다운로드 & 거래처/템플릿 관리 (MVP 마무리) (2026-07-30 ~ 2026-08-08, 약 1.5주)

**목표**: MVP 범위의 나머지 기능(F007, F012, F013)을 완성해 "견적서 작성 → 전달"까지 끝나는 완전한 MVP를 출시한다.

**우선순위**: MUST

**선행 조건**: Phase 2의 견적서 데이터 모델 및 금액 계산 로직

**병렬 처리 가능**: F007(PDF)과 F012/F013(거래처·템플릿 관리)은 서로 독립적인 기능이므로 동시 진행 가능(같은 개발자라면 오전/오후 등으로 블록 분리 추천)

#### 핵심 기능

- [x] (MUST) F007 견적서 PDF 다운로드 — `@react-pdf/renderer` 설치, Route Handler(`/api/invoice/[id]/pdf`)로 견적서 상세 데이터를 PDF로 렌더링 **✅ 구현 + 수동 검증 완료**
- [x] (MUST) F012 거래처 관리 — 거래처 등록/조회/수정/삭제(신규 Clients Notion DB), 견적서 작성 페이지의 "거래처 불러오기" 콤보박스 연동 **✅ 구현 + 수동 검증 완료**
- [x] (MUST) F013 템플릿 관리 — 템플릿 생성/조회/수정/삭제(신규 Templates Notion DB, 품목은 JSON 직렬화), 견적서 작성 페이지의 "템플릿 불러오기" 기능 **✅ 구현 + 수동 검증 완료**

#### 기술적 준비 작업

- [x] PDF 한글 폰트 임베딩 검증 — Google Fonts의 Noto Sans KR 가변 폰트(`public/fonts/NotoSansKR-Variable.ttf`)를 `Font.register`로 등록, 실제 PDF를 이미지로 렌더링해 시각적으로 한글이 깨지지 않음을 확인 **✅**. 다만 `pdftotext` 등 텍스트 추출 도구로는 한글이 빠짐(ToUnicode 매핑 누락으로 추정) — 화면 표시/인쇄에는 문제없으나 PDF 내 텍스트 복사·검색은 제한됨. 필요시 정적 웨이트 폰트로 교체 검토
- [x] 거래처/템플릿 선택 UI 컴포넌트 — `shadcn Command`+`Popover` 조합으로 `client-picker.tsx`/`template-picker.tsx` 작성, `invoice-form.tsx`에 통합 **✅**
- [x] PDF 다운로드 아키텍처 결정 — Server Action 대신 **Route Handler** 채택(`new Response(pdfBuffer, {headers})`로 `Content-Disposition: attachment` 직접 제어) **✅**

#### 🧪 테스트 체크리스트 (Playwright MCP 필수)

**F007(PDF), F012, F013 각각 구현 완료 후 다음 3가지 시나리오를 테스트한 후에만 완료 처리**:

**F007 PDF 다운로드**:

- [x] ✅ 정상 케이스: 견적서 상세에서 PDF 다운로드 클릭 → 한글 정상 렌더링(시각적으로 확인) → 파일 다운로드 성공 **완료**
- [ ] ❌ 실패/에러 케이스: 빈 견적서, 매우 큰 파일, PDF 생성 타임아웃 시 에러 메시지 표시 — 미검증
- [ ] 🎯 엣지 케이스: 특수문자 포함, 레이아웃 줄바꿈, 동시 다운로드 요청 — 미검증

**F012/F013 거래처/템플릿 관리**:

- [x] ✅ 정상 케이스: 거래처/템플릿 등록 → Notion에 정확히 저장 → 목록에 표시 → 견적서 작성 폼에서 불러오기 시 필드/품목 자동 채움까지 확인 **완료**
- [ ] ❌ 실패/에러 케이스: Notion DB 오류, 중복 이름, 삭제 후 참조 오류 처리 — 미검증
- [ ] 🎯 엣지 케이스: 대량 데이터, 빈 필드, 매우 긴 텍스트 — 미검증

- [ ] 테스트 실패 시 원인 파악 → 코드 수정 → 재테스트 → 통과 확인 후 완료 처리 (실패/엣지 케이스는 다음 세션 과제로 남김)

> **2026-07-19 진행 메모**: Phase 3 핵심 기능(F007/F012/F013) 구현과 정상 케이스 수동 검증을 모두 마쳤다. Supabase profiles에 `notion_clients_db_id`/`notion_templates_db_id` 컬럼을 추가하고, `getNotionContext()`가 4개 DB 전부를 요구하도록 확장했다(이로 인해 사용자가 Notion에 Clients/Templates DB를 새로 만들고 Integration에 연결 + `/settings`에서 4개 DB 재저장하는 수동 작업이 필요했다). 검증 과정에서 프로덕션 빌드(`npm run build`)를 개발 서버 실행 중에 돌려서 `.next` 폴더가 손상되는 이슈를 겪었다 — **개발 서버가 떠 있는 동안에는 `npm run build`를 같은 저장소에서 실행하지 말 것** (별도 확인 필요 시 개발 서버를 먼저 내리거나 별도 워크트리 사용). 실패/에러/엣지 케이스 테스트는 아직 남아있다.

#### 예상 완료 결과물

- **MVP 완성**: PRD의 F001~F013 전 기능이 실제 Notion 데이터 기반으로 동작 **✅ 구현 완료, 실패/엣지 케이스 검증만 남음**
- 견적서 상세 페이지에서 클릭 한 번으로 한글 PDF 다운로드 가능 **✅ 확인 완료**
- 거래처/템플릿을 견적서 작성 시 실제로 재사용 가능 **✅ 확인 완료**

#### 위험 요소

- **위험**: `@react-pdf/renderer`의 한글 폰트 렌더링 이슈(글자 깨짐, 줄바꿈 오류)는 실제 배포 직전에 발견되면 치명적 → **완화**: Phase 3 시작 즉시 PDF PoC를 최우선으로 진행(1일 이내 스파이크)
- **위험**: 거래처/템플릿을 각각 별도 Notion DB로 관리하면 견적서 작성 시 3개 DB를 동시에 조회해야 해 응답 지연 가능 → **완화**: 거래처/템플릿 목록은 클라이언트 캐싱(SWR 유사 패턴) 또는 서버 캐시 적용 검토

---

### Phase 4: 안정화 & 품질 안전망 구축 (2026-08-10 ~ 2026-08-22, 약 2주)

**목표**: MVP 출시 후 실사용에서 드러날 오류(동기화 실패, 잘못된 입력, 네트워크 이슈)에 대비해 최소한의 회귀 안전망과 사용성 개선을 적용한다.

**우선순위**: SHOULD (테스트 스모크는 MUST로 격상)

**선행 조건**: Phase 1~3의 MVP 기능 전체 완료(테스트 대상이 존재해야 함)

**병렬 처리 가능**: 테스트 셋업(Vitest 인프라)과 에러 처리/UX 개선은 독립적으로 동시 진행 가능

#### 핵심 기능

- [x] (MUST) **Playwright MCP E2E 회귀 테스트**: 자동화 스위트(`npm run test:e2e`, 기존 로그인 분기 3종) 회귀 없음 확인 + Chrome 브라우저로 실제 Notion 워크스페이스에 대해 대시보드 → 견적서 생성(F002/F006) → 상세 조회(F003) → 상태 변경(신규 UI) → PDF 다운로드(F007) → 거래처/템플릿 목록(F012/F013) → 삭제(F005)까지 전체 플로우 수동 검증 **✅ 완료**
- [x] (MUST) Vitest + React Testing Library 셋업 및 핵심 폼(로그인/회원가입/견적서 작성) 스모크 테스트 **10개** 추가 **✅ 완료**
- [x] (SHOULD) 금액 계산 로직(`src/lib/invoice/calculate.ts`) 유닛 테스트 **✅ Phase 2에서 이미 완료(13개 테스트) — 확인만 함**
- [x] (SHOULD) Notion API 응답 실패/타임아웃에 대한 에러 바운더리 및 사용자 안내 메시지 정비 **✅ 완료** — `dashboard`/`invoice`/`clients`/`templates` 4개 세그먼트에 `error.tsx` 추가(공용 `src/components/error-fallback.tsx`), "다시 시도" + "Notion 연동 설정에서 재연결" 동선 제공
- [x] (SHOULD) 로딩/스켈레톤 UI 적용(대시보드, 견적서 상세, 거래처/템플릿 목록) **✅ 완료** — `Skeleton` 컴포넌트 기반 `loading.tsx` 4개(대시보드/견적서 상세/거래처/템플릿) 추가
- [x] (NICE-TO-HAVE) 견적서 상태(초안/발송/승인/거절) 수동 변경 UI(자동 알림 없이 상태값만 변경) **✅ 완료** — `invoice-status-select.tsx`, 상세 페이지 배지 자리에 Select로 교체, `updateInvoice(id, {status})` 재사용

#### 기술적 준비 작업

- [x] `package.json`에 `test`, `test:watch` 스크립트 추가(기존 `check-all`과는 분리해 선택 실행 가능하게 구성) **✅ Phase 2 델리게이트 작업에서 이미 완료 확인**
- [x] Notion API 요청 재시도/백오프 유틸을 실제 실패 시나리오(토큰 만료, DB 삭제됨 등)에 맞춰 보강 — **검토 결과 기존 `withRetry`(`src/lib/notion/errors.ts`, timeout/network_error 재시도 + exponential backoff)로 충분하다고 판단, 추가 구현 없음**
- [ ] 접근성 점검(폼 라벨, 키보드 포커스, 대비) 1회 수동 점검 — 다음 세션 과제로 이관(이번 회귀 검증에서는 핵심 플로우 동작 확인에 집중)

#### 🧪 테스트 체크리스트 (Playwright MCP + Vitest 필수)

**E2E 회귀 테스트 (Playwright MCP)**:

- [x] ✅ 정상 시나리오: 로그인 → 대시보드 → 견적서 생성 → 상세 조회 → 상태 변경 → PDF 다운로드 → 삭제까지 실제 Notion 워크스페이스로 전체 플로우 확인 **완료** (신규 회원가입 단계는 Phase 1 T9에서 이미 자동화 검증됨)
- [ ] ❌ 실패 시나리오: 각 단계에서 오류 발생 시 적절한 에러 메시지 표시 및 복구 가능성 — 신규 `error.tsx` 4종은 코드 작성 완료, 실제 예외(Notion API 실패 등) 강제 트리거 확인은 미검증(다음 세션 과제)
- [x] 🎯 회귀 시나리오: 기존 자동화 E2E(`tests/e2e/login-flow.spec.ts`) 3종 + 신규 수동 확인 모두 통과, Phase 2·3 기능(F001~F013) 회귀 없음

**유닛 테스트 (Vitest)**:

- [x] ✅ 로그인/회원가입/견적서 작성 폼 유닛 테스트 — `login-form.test.tsx`(3개), `signup-form.test.tsx`(4개), `invoice-form.test.tsx`(3개) 총 10개, 전부 통과
- [x] ✅ 금액 계산 로직 유닛 테스트 (정상/실패/엣지 케이스) — Phase 2에서 이미 완료(13개)
- [x] 전체 스위트(`npm run test`) 56개 전부 통과, `npm run check-all`/`npm run build`/`npm run test:e2e` 전부 통과 확인. Phase 5 배포 준비 진행 가능

#### 2026-07-20 진행 메모

Vitest에 React Testing Library(`@testing-library/react`, `jest-dom`, `user-event`, `@testing-library/dom`)와 `jsdom` 환경을 추가했다(`vitest.config.ts`, `src/test/setup.ts`). 과정에서 겪은 이슈 2건: (1) `@testing-library/react`가 `@testing-library/dom`을 peer로 요구하는데 자동 설치되지 않아 별도 설치 필요, (2) RTL은 테스트 프레임워크의 전역 `afterEach`에 자동으로 `cleanup()`을 등록하는데 이 프로젝트는 `vitest.config.ts`에 `globals: true`를 쓰지 않고 명시적 import 방식이라 자동 cleanup이 걸리지 않아 같은 파일 내 여러 테스트의 DOM이 누적되는 문제가 있었다 — `src/test/setup.ts`에 `afterEach(() => cleanup())`을 직접 등록해 해결. 그 외 jsdom에 `ResizeObserver`가 없어 Radix Checkbox 마운트 시 에러가 나는 문제도 같은 setup 파일에서 스텁으로 해결했다.

에러 바운더리/로딩 스켈레톤은 4개 세그먼트(`dashboard`, `invoice`, `clients`, `templates`)에 동일한 패턴을 반복하므로 각각 공용 컴포넌트(`error-fallback.tsx`, `list-skeleton.tsx`)로 뽑아 중복을 줄였다.

`npm run check-all`이 저장소에 함께 커밋된 `mcp-shrimp-task-manager/`(별도 `package.json`을 가진 벤더 MCP 도구, 이 프로젝트의 src와 무관)의 기존 lint/format 이슈 때문에 실패하는 문제를 발견해, `eslint.config.mjs`와 `.prettierignore`에 `mcp-shrimp-task-manager/`(및 Claude Code 자체 설정/메모리 디렉토리 `.claude/`)를 제외 대상으로 추가했다. 이후 `npm run check-all`이 정상 통과한다(단, 세션 시작 시점부터 있던 무관한 미커밋 변경 `shrimp_data/WebGUI.md` 1개는 그대로 둠).

세션 중간에 Chrome 확장 연결이 끊겼다가 재연결되어, 실제 Notion 워크스페이스로 로그인 → 대시보드 → 견적서 생성(`POST pages` 확인) → 상세 조회 → **상태 변경(신규 UI, `PATCH pages` 확인)** → PDF 다운로드(실제 파일 8,247 bytes 다운로드 확인) → 거래처/템플릿 목록 조회 → 삭제(`archived:true` + 목록에서 사라짐)까지 전체 플로우를 서버 로그와 화면으로 직접 확인했다. 테스트로 생성한 견적서는 검증 후 삭제해 정리했다. 에러 바운더리(`error.tsx`)의 실제 예외 강제 트리거 확인과 접근성 수동 점검은 다음 세션 과제로 남겨둔다.

#### 예상 완료 결과물

- 핵심 폼 스모크 테스트 통과(회귀 방지 최소 안전망) **✅ 완료**
- Notion 연동 실패 시에도 사용자가 원인을 이해할 수 있는 에러 메시지 체계 **✅ 코드 완료**(실제 예외 강제 트리거 확인은 다음 세션 과제)
- 주요 페이지 로딩 상태 UX 개선 완료 **✅ 완료**

#### 위험 요소

- **위험**: 1인 개발 특성상 테스트 작성이 뒤로 밀리기 쉬움 → **완화**: 테스트 범위를 "핵심 폼 스모크 3~5개"로 엄격히 제한해 완주 가능한 규모로 유지
- **위험**: Notion 토큰 만료·권한 철회 등 실사용 중 발생 가능한 예외를 사전에 모두 예측하기 어려움 → **완화**: 에러 메시지에 "Notion 연동 설정 페이지에서 재연결" 안내를 기본 동선으로 포함해 사용자가 스스로 복구 가능하게 설계

---

### Phase 5: 배포 준비 & 성능 최적화 (2026-08-24 ~ 2026-09-04, 약 1.5주 · 버퍼 포함)

**목표**: Vercel 배포를 확정하고, 실사용 트래픽에서 문제되지 않을 수준의 성능/문서화를 마무리한다.

**우선순위**: SHOULD

**선행 조건**: Phase 4의 테스트 스위트(배포 전 회귀 확인 대상)

#### 핵심 기능

- [ ] (SHOULD) Vercel 배포 설정 및 환경 변수(Supabase/Notion 키) 프로덕션 값 등록 — **실행은 사용자 몫**(로그인/시크릿 입력이 필요해 Claude Code가 대신 할 수 없음). `docs/guides/deployment-guide.md`에 단계별 가이드 준비 완료, 실제 배포는 다음 세션(또는 사용자 직접) 과제로 이관
- [x] (SHOULD) 이미지 최적화(next/image), 폰트 로딩 최적화 점검 **✅ 점검 완료** — `src/` 전체에 이미지 사용처가 없어 `next/image` 적용 대상 자체가 없음(향후 이미지 추가 시 전환하면 됨), 웹페이지 폰트는 이미 `next/font/google`(Geist)로 최적화되어 있어 추가 작업 불필요. 근거는 `docs/guides/notion-integration.md` 5절에 기록
- [x] (SHOULD) 대시보드/견적서 목록 조회 성능 점검(Notion API 응답 캐싱 전략 확정) **✅ 완료** — 검토 결과 1인/소규모 사용 시나리오에서는 캐싱 이득보다 신선도 리스크가 커서 **추가 캐싱 레이어 도입하지 않기로 결정**(기존 `force-dynamic` + `revalidatePath` 유지). 근거는 `docs/guides/notion-integration.md` 5절에 기록
- [x] (NICE-TO-HAVE) 404/500 커스텀 에러 페이지 **✅ 완료** — `src/app/not-found.tsx`(404), `src/app/global-error.tsx`(라우트 세그먼트 error.tsx가 못 잡는 루트 레벨 예외용 최종 안전망) 추가, Chrome으로 404 화면 렌더링 확인
- [x] (NICE-TO-HAVE) GitHub Actions 기반 CI(lint/typecheck/build/test) 예제 워크플로우 **✅ 완료** — `.github/workflows/ci.yml`(push/PR on main → typecheck/lint/format/build/vitest). Playwright e2e는 실제 Supabase service-role 키가 필요해 의도적으로 제외(로컬 수동 실행 유지)

#### 기술적 준비 작업

- [x] `.env.example`에 Supabase/Notion 관련 변수 전체 정리 **✅ 점검 완료** — `src/lib/env.ts` 요구 변수를 이미 전부 커버하고 있어 수정 없음
- [x] 배포 전 `npm run check-all` + `npm run build` + 스모크 테스트 전수 통과 확인 **✅ 완료**(56개 테스트, `check-all`/`build` 전부 통과 — 단 `.next` 손상 방지 위해 build 전 dev 서버 정지 확인 후 실행)
- [x] 문서화: `docs/guides/notion-integration.md`(Notion 연동 구조/DB 스키마 설명), 사용자 가이드(회원가입부터 PDF 다운로드까지) 작성 **✅ 완료** — `notion-integration.md`(현재 4-DB 구조 기준, 기존 `notion-schema.md`/`notion-setup-guide.md`는 2-DB 시절 역사적 기록으로 남겨둠), `user-guide.md`, `deployment-guide.md` 3종 신규 작성

#### 2026-07-20 진행 메모

Phase 5 착수 중 스타터 템플릿에서 물려받은 브랜딩 잔재를 발견했다 — 헤더 로고(`src/components/layout/header.tsx`), 푸터(`footer.tsx`), 페이지 타이틀(`src/app/layout.tsx`의 `metadata`)이 전부 "NextJS Starter"로 남아 있었다(기능 구현에 집중하느라 한 번도 교체되지 않음). 사용자 확인 후 "Notion Invoice Web"으로 전부 교체했다. 이 발견 자체가 배포 전 QA 관점에서 유효한 체크리스트 항목이라, 다음에 유사한 스타터 기반 프로젝트를 배포할 때는 기능 작업 초반에 브랜딩 텍스트도 함께 확인하는 것을 권장한다.

#### 예상 완료 결과물

- 프로덕션 URL에서 실제 사용 가능한 서비스 — **배포 실행 자체는 사용자 몫**, 가이드 문서로 준비 완료
- 신규 개발자/사용자가 참고할 수 있는 Notion 연동 구조 문서 **✅ 완료**

#### 위험 요소

- **위험**: Vercel 서버리스 함수의 실행 시간 제한(기본 10초)이 Notion API 다건 조회/PDF 생성과 충돌할 가능성 → **완화**: 무거운 작업(PDF 생성, 대량 동기화)은 함수 실행 시간을 사전 측정하고 필요 시 Vercel 함수 타임아웃 설정 상향 또는 Edge/Node 런타임 선택 재검토
- **위험**: 일정 압박으로 NICE-TO-HAVE 항목(CI 워크플로우, 커스텀 에러 페이지)이 누락될 수 있음 → **완화**: 이 페이즈의 버퍼(약 1주)를 활용해 SHOULD 항목을 우선 완료하고, 남는 시간에만 NICE-TO-HAVE 착수

---

### Phase 6: 관리자 기능 추가 (2026-09-07 ~ 2026-09-25, 약 3주 · 버퍼 포함)

**목표**: 사업자(로그인 사용자) 본인이 자신의 견적서를 한 화면에서 관리하고, 로그인 계정이 없는 클라이언트(거래처 담당자)에게 견적서를 열람할 수 있는 링크를 전달할 수 있게 한다. MVP(F001~F013)에는 없던 "외부 공유" 개념을 처음 도입하는 페이즈다.

**우선순위**: SHOULD (MVP 이후 확장 기능 — 서비스 운영에 필요하지만 출시 자체를 막는 항목은 아님)

**선행 조건**: Phase 2의 견적서 데이터 모델(Notion Invoices/Items 구조, `src/lib/notion/queries.ts`)과 Phase 3의 PDF 다운로드 라우트 패턴(`/api/invoice/[id]/pdf`, Route Handler 아키텍처). Phase 4~5(테스트/배포)와는 기술적으로 독립적이나, MVP 안정화를 먼저 마친 뒤 착수하는 순서를 권장

**병렬 처리 가능**: 없음(T6-1 설계 확정 → T6-2 스키마 → T6-3 발급 UI → T6-4 공개 페이지 순으로 강한 순차 의존). 단 T6-5(공개 PDF 라우트)는 T6-4 완료 후 별도 시간 블록으로 분리 가능

#### 📌 설계 결정 (2026-07-20 확정)

이번 요구사항("관리자 레이아웃으로 견적서 목록 조회" + "클라이언트에게 보낼 링크 복사")은 표현만으로는 두 가지로 해석될 수 있어, 착수 전 명확히 결정해두지 않으면 스키마/미들웨어 설계가 완전히 달라진다.

**쟁점 1 — "관리자"는 role 기반 다중 사용자 권한 체계인가, 기존 로그인 사용자(사업자 본인)의 관리 UI인가?**

→ **결정: role 기반 권한 체계를 도입하지 않는다. 기존 로그인 사용자가 쓰는 관리 화면을 "관리자 뷰"로 부르는 것으로 해석하고, 기존 `/invoice` 목록 페이지(사이드바에 이미 존재, `src/app/invoice/page.tsx` + `getInvoices()`)를 그대로 확장한다.** 별도의 `/admin` 라우트나 `profiles.role` 컬럼, role 기반 미들웨어 분기는 만들지 않는다.

- **근거**: 이 서비스는 설계 확정 단계(2026-07-07)부터 싱글 테넌트 구조다 — `profiles` 테이블에는 사용자별 Notion 토큰/DB ID만 있고, "다른 사용자의 데이터를 볼 수 있는 관리자"라는 개념 자체가 현재 데이터 모델에 없다. 각 사용자는 자기 자신의 Notion 워크스페이스만 다루는 독립된 테넌트이므로 "관리자 vs 일반 사용자"를 나눌 대상이 없다.
- 이번 두 요구사항(목록 조회, 링크 복사)은 "다른 사용자를 관리"하는 기능이 아니라 "본인 견적서를 목록에서 보고 공유 링크를 만드는" 기능이다. PRD의 MVP 이후 제외 항목(팀 초대 등, `[[project-starter-scope-phasing]]` 참고)에도 다중 사용자/팀 개념이 명시적으로 빠져 있어, 이번 확장에서 role 체계를 새로 들이는 것은 범위를 벗어난다.
- role 컬럼과 미들웨어 분기를 새로 만들면 "누가 admin인지 어떻게 지정하는가"(수동 SQL? 가입 시 자동?)라는 미해결 질문이 새로 생기고, 이번 요구사항 두 가지를 만족시키는 데는 전혀 필요하지 않다 — 불필요한 복잡도다.
- 지난 세션(2026-07-20)에서 사용자가 "관리자 모드"를 언급했을 때 제안했던 role 기반 방향은 이번 구체적 요구사항과 맞지 않는다고 판단해 재검토했다. **향후 실제로 "여러 사업자 계정을 한 명이 감독"하는 요구가 명시적으로 들어오면 그때 `profiles.role` + 미들웨어 가드를 별도 페이즈로 설계한다.**

**쟁점 2 — 클라이언트(비로그인 제3자)에게 보낼 공개 링크를 어떻게 구현할 것인가?**

→ **결정: Notion 페이지 ID를 URL에 직접 노출하지 않고, 견적서마다 별도의 랜덤 공유 토큰을 Supabase에 발급·관리한다.** 공개 라우트는 `/share/[token]`(신규, `middleware.ts`의 `PROTECTED_PATHS`에 포함하지 않음), 조회 시 이미 존재하는 **Service Role 클라이언트(`createSupabaseAdminClient()`, `src/lib/supabase/admin.ts`)**로 RLS를 우회해 토큰 소유자의 Notion 토큰/DB ID를 조회한 뒤, 소유자 세션 없이 Notion API를 직접 호출한다.

- **근거 — 토큰 발급 vs Notion 페이지 ID 직접 노출**: Notion 페이지 ID는 UUID라 무작위 추측 자체는 어렵지만, (1) 링크를 회수(비활성화)하거나 만료시킬 방법이 Notion 페이지를 직접 삭제하는 것 말고는 없고, (2) 어떤 견적서가 "공개된 적 있는지"를 우리 시스템이 전혀 추적할 수 없으며, (3) Notion 페이지 ID가 유출되면 영구히 재발급이 불가능하다. 반면 우리 DB에 별도 토큰을 두면 회수·만료·재발급·감사(누가 언제 발급했는지)를 전부 서비스 레벨에서 통제할 수 있다 — Google Docs "링크가 있는 모든 사용자" 방식과 동일한 표준 패턴이다.
- **근거 — 인증 우회 방식**: 기존 모든 Notion 조회 Server Action은 `getNotionContext()`를 통해 **로그인 세션(`supabase.auth.getUser()`)을 전제**로 프로필의 토큰을 가져온다(`src/lib/actions/notion.ts`). 공개 페이지는 이 전제 자체가 성립하지 않으므로 재사용할 수 없다. 이미 코드베이스에 존재하는 `createSupabaseAdminClient()`(Service Role, RLS 완전 우회, webhook/배치 작업용으로 이미 마련돼 있던 클라이언트)를 활용하면 "신뢰할 수 있는 서버 로직이 세션과 무관하게 데이터를 조회"하는 정확히 그 용도에 맞는다. 단, 이 클라이언트는 RLS를 완전히 우회하므로 **반드시 토큰 조회 헬퍼 함수 하나로 접근을 격리**하고, 이 함수는 오직 유효한 공유 토큰이 주어졌을 때만 결과를 반환하도록 만들어야 한다(무작위 user id 등으로는 절대 조회되지 않게).
- **PDF 재사용**: 기존 `/api/invoice/[id]/pdf`도 내부적으로 `getInvoice()` → `getNotionContext()`를 호출하므로 현재는 로그인 세션이 있어야만 동작한다(즉 지금은 비로그인 제3자가 PDF를 받을 수 없다). 이 패턴을 그대로 참고해 별도의 공개 라우트 `/api/share/[token]/pdf`를 신설하고, 동일한 Route Handler 아키텍처(`Content-Disposition: attachment`)를 재사용하되 인증 소스만 세션 대신 공유 토큰으로 바꾼다. 기존 인증 라우트는 그대로 둔다(내부 사용자용으로 유지).
- **권장 만료 정책**: 기본값은 "만료 없음 + 소유자가 언제든 비활성화 가능"으로 시작한다(1인 사업가가 일회성 견적서 링크를 자주 재사용하는 시나리오 고려). 만료일(예: 30/90일) 옵션은 NICE-TO-HAVE로 남긴다.

#### 핵심 기능

> 아래 기능 ID(F014, F015)는 원본 PRD(F001~F013)에는 없던 신규 확장 항목이며, 이번 세션 요구사항을 바탕으로 이 로드맵에서 새로 부여한 임시 ID다.

- [ ] (MUST) F014 관리자 뷰 — 기존 `/invoice` 목록 페이지를 확장해 각 견적서 행에 "공유 링크 복사" 액션 추가(신규 `/admin` 라우트 신설 없음, 쟁점 1 결정 근거 참고)
- [ ] (MUST) F015 클라이언트 공유 링크 — 견적서별 랜덤 공유 토큰 발급/조회, 공개 열람 페이지(`/share/[token]`)에서 비로그인 상태로 견적서 상세(거래처 정보, 품목, 합계) 열람 가능
- [ ] (SHOULD) 공개 페이지에서 PDF 다운로드(`/api/share/[token]/pdf`) — 로그인 없이 클라이언트가 직접 PDF 저장 가능
- [ ] (SHOULD) 공유 링크 비활성화(회수) — 소유자가 관리자 뷰에서 링크를 무효화하면 이후 접근 시 "만료된 링크" 안내
- [ ] (NICE-TO-HAVE) 링크 만료일 설정(발급 시 30/90일/무제한 선택) 및 재발급(기존 토큰 폐기 후 신규 발급)
- [ ] (NICE-TO-HAVE) 견적서 삭제/상태 변경 시 연결된 공유 링크 자동 무효화

#### 기술적 준비 작업

- [ ] Supabase 마이그레이션: `invoice_share_links` 테이블 신설(`id`, `invoice_id`, `owner_user_id`, `token`(unique, 32자 이상 랜덤), `is_active`, `expires_at`(nullable), `created_at`) + RLS 정책(소유자 본인만 자신의 링크 CRUD 가능, Service Role은 정책과 무관하게 우회) — `supabase/sql/invoice_share_links.sql`
- [ ] 공유 토큰 생성 유틸(`crypto.randomUUID()` 또는 `nanoid` 32자 이상) 및 충돌 시 재시도 로직
- [ ] `src/lib/actions/share.ts` 신설: `createOrGetShareLink(invoiceId)`(기존 활성 토큰 있으면 재사용, 없으면 발급), `revokeShareLink(invoiceId)`, `getInvoiceByShareToken(token)`(Service Role로 토큰→소유자→Notion 컨텍스트 조회 후 `queryItemsByInvoice`/`retrieveInvoice` 재사용, `getNotionContext()`는 사용하지 않음)
- [ ] `middleware.ts`의 `PROTECTED_PATHS`에 `/share`를 절대 추가하지 않도록 명시적 회귀 테스트 항목으로 남김(공개 라우트가 실수로 보호되면 기능 자체가 무의미해짐)
- [ ] 공개 페이지(`/share/[token]/page.tsx`)에 `<meta name="robots" content="noindex">` 적용 — 검색엔진에 견적서 링크가 노출되지 않도록
- [ ] 공개 라우트(`/share/[token]`, `/api/share/[token]/pdf`)에 대한 간단한 요청 빈도 제한 검토(토큰 무차별 대입 방어) — Vercel 환경 제약상 정교한 rate limiting 인프라 신설은 과설계이므로, 최소한 토큰 엔트로피 확보(32자 이상)로 1차 방어하고 정교한 rate limit은 실사용 트래픽을 보고 후속 검토

#### 🧪 테스트 체크리스트 (Playwright MCP 필수)

**구현 완료 후 반드시 다음 3가지 시나리오를 테스트한 후에만 완료 처리**:

- [ ] ✅ 정상 케이스: 관리자 뷰(`/invoice`)에서 링크 복사 클릭 → 클립보드에 유효한 `/share/[token]` URL 복사 확인 → 시크릿 창(비로그인 상태)에서 해당 URL 접속 시 견적서 상세가 정상 표시 → PDF 다운로드까지 성공
- [ ] ❌ 실패/에러 케이스: 존재하지 않는 토큰, 회수(비활성화)된 토큰, 만료된 토큰으로 접근 시 "만료된 링크" 안내 페이지 표시(500 에러로 새지 않는지 확인), Notion API 실패 시 에러 메시지
- [ ] 🎯 엣지 케이스: 견적서 삭제 후 기존 공유 링크 접근, 같은 견적서에 대해 링크를 여러 번 복사했을 때 토큰이 중복 발급되지 않는지, `/share` 및 `/api/share/*` 경로가 `middleware.ts`의 `PROTECTED_PATHS`에 걸려 로그인 리다이렉트되지 않는지 회귀 확인
- [ ] 테스트 실패 시 원인 파악 → 코드 수정 → 재테스트 → 통과 확인 후 완료 처리

#### 예상 완료 결과물

- 관리자(로그인 사용자)가 견적서 목록에서 클릭 한 번으로 클라이언트에게 보낼 공유 링크를 복사할 수 있음
- 클라이언트가 로그인 없이 공유 링크로 견적서를 열람하고 PDF를 다운로드할 수 있음
- 소유자가 언제든 공유 링크를 비활성화할 수 있음
- `invoice_share_links` 테이블 및 RLS 정책 문서화(`supabase/sql/invoice_share_links.sql`)

#### 위험 요소

- **위험**: 공유 토큰이 유출되면 회수 전까지 누구나 견적서를 열람 가능 → **완화**: 소유자가 관리자 뷰에서 즉시 비활성화할 수 있는 UI를 MUST로 우선 구현, 토큰은 32자 이상 랜덤값으로 발급해 무차별 대입 사실상 불가능하게
- **위험**: 견적서가 삭제(archive)되거나 상태가 바뀌어도 공유 링크는 그대로 살아있어 클라이언트가 오래된/삭제된 정보를 계속 볼 수 있음 → **완화**: `deleteInvoice` 호출 시 연결된 `invoice_share_links`를 함께 비활성화하는 로직을 F014/F015 구현과 동시에 추가(NICE-TO-HAVE로 뒤로 미루지 말고 MUST 범위에 포함 검토)
- **위험**: Service Role 클라이언트를 공개(비로그인) 라우트에서 사용하는 것 자체가 공격 표면을 넓힘(RLS 우회이므로 헬퍼 함수 버그가 곧 전체 데이터 노출로 직결) → **완화**: Service Role 접근을 `getInvoiceByShareToken()` 단일 함수로 격리하고, 이 함수 외에는 어떤 코드도 공개 라우트에서 Service Role 클라이언트를 직접 호출하지 않도록 코드 리뷰 체크포인트로 명시
- **위험**: role 기반 권한 체계 없이 "관리자 뷰 = 로그인 사용자 본인 뷰"로 해석했는데, 추후 실제로 여러 사업자를 한 명이 감독해야 하는 요구가 들어오면 이번 설계를 뒤엎어야 함 → **완화**: 현재 PRD·요구사항 어디에도 다중 사업자 감독 시나리오가 없으므로 낮은 확률로 판단, 필요 시점에 별도 페이즈(`profiles.role` + 미들웨어 가드)로 분리해 이번 공유 링크 설계와 독립적으로 추가 가능하도록 `owner_user_id` 컬럼을 명시적으로 분리해둠(추후 role 도입 시에도 스키마 변경 최소화)

---

## 주요 마일스톤

| 마일스톤                       | 예상 완료일       | 상태                      | 핵심 산출물                                                                                                                                                   |
| ------------------------------ | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1-A: 인증 기반 구축 (T1~T6)   | **✅ 2026-07-12** | **완료**                  | ✅ Supabase Auth (가입/로그인/로그아웃), ✅ 보호된 라우트 (middleware.ts + RLS 정책), ✅ Notion DB 스키마 확정                                                |
| M1-B: Notion API 래퍼 (T7)     | **✅ 2026-07-12** | **완료**                  | ✅ Notion 클라이언트 (재시도/타임아웃), ✅ CRUD 함수, ✅ Server Action 구조, ✅ 타입 정의 & Zod 스키마                                                        |
| M1-C: Notion 토큰 설정 (T8~T9) | **✅ 2026-07-16** | **완료**                  | ✅ Notion 토큰 설정 페이지, ✅ 로그인 분기 로직, ✅ E2E 테스트                                                                                                |
| M2: 견적서 핵심 CRUD           | 2026-07-29        | 핵심 기능 검증 완료       | ✅ 대시보드/생성/상세/수정(품목 diff)/삭제 실데이터 검증 완료, ⏳ 실패·엣지 케이스 검증 대기                                                                  |
| M3: **MVP 출시**               | 2026-08-08        | 핵심 기능 검증 완료       | ✅ F001~F013 전 기능 구현+정상 케이스 검증 완료, ⏳ 실패·엣지 케이스 검증 대기                                                                                |
| M4: 안정화                     | 2026-08-22        | 완료                      | ✅ 폼 스모크 테스트 10개, ✅ 에러 바운더리 4종, ✅ 로딩 스켈레톤 4종, ✅ 상태 변경 UI, ✅ Chrome 수동 회귀 검증                                               |
| M5: 배포 & 문서화 완료         | 2026-09-04        | 코드/문서 완료, 배포 대기 | ✅ 404/500 페이지, ✅ CI 워크플로우, ✅ Notion 연동/사용자/배포 가이드 문서, ✅ 성능·이미지 점검, ⏳ 실제 Vercel 배포(사용자 실행)                            |
| M6: 관리자 기능 & 공유 링크    | 2026-09-25        | 설계 확정, 구현 대기      | 📐 설계 결정 완료(role 미도입, 토큰 기반 공유 링크), ⏳ 관리자 뷰 링크 복사 UI, ⏳ 공개 열람 페이지(`/share/[token]`), ⏳ 공개 PDF 다운로드, ⏳ 링크 비활성화 |

---

## 크로스컷팅 관심사(Cross-cutting Concerns)

### 테스팅 전략

**원칙: 구현 후 테스트는 선택이 아닌 필수 게이트. 테스트 없이는 완료 처리 불가.**

**Phase 1~3(MVP) — Playwright MCP E2E 테스트 필수**:

- 각 기능 구현 직후 **Playwright MCP로 정상/실패/엣지 케이스 3가지 시나리오 테스트**
- 테스트 실패 시: 원인 파악 → 코드 수정 → 재테스트 → 통과 후 완료 처리
- 실제 Notion 워크스페이스로 e2e 수동 테스트 병행

**Phase 4(안정화) — Vitest + Playwright MCP 회귀 테스트**:

- Vitest + RTL 스모크 테스트 도입(로그인/회원가입/견적서 작성 폼, 금액 계산 로직)
- Playwright MCP로 Phase 2~3 전체 플로우 회귀 테스트(정상/실패/엣지 케이스)
- 회귀 방지 최소 안전망 확보

**Phase 5(배포) — 최종 검증**:

- 배포 전 전체 테스트 스위트(`npm run test`) 통과
- `npm run check-all` + `npm run build` 통과 필수
- CI 자동화 워크플로우 예제 제공(기본 비활성)

### 배포 계획

- Vercel 단일 환경(우선 Production만) → 필요 시 Preview 배포로 PR 단위 검증 추가 검토
- Notion Integration Token 등 민감 정보는 Vercel 환경 변수로 관리, 코드에 하드코딩 금지

### 문서화 계획

- 신규 문서: `docs/guides/notion-integration.md`(Notion DB 스키마·연동 구조), 사용자 온보딩 가이드(선택)
- 기존 5종 가이드(project-structure, nextjs-15, component-patterns, styling-guide, forms-react-hook-form)는 견적서 작성 폼 패턴 반영해 최신화

---

## 의존성 맵

```
Phase 1 (인증 + Notion 연동 설계, MUST)
   │  ※ Notion DB 스키마 확정이 이후 전 단계의 전제 조건
   ▼
Phase 2 (견적서 핵심 CRUD & 대시보드, MUST)
   │  ※ 금액 계산 로직·Notion 매핑 계층이 Phase 3에서 재사용됨
   ▼
Phase 3 (PDF + 거래처/템플릿, MUST) ──▶ MVP 출시(M3)
   │
   ▼
Phase 4 (안정화 & 테스트, SHOULD/MUST 혼합)
   │  ※ 테스트 대상이 되는 기능이 모두 존재해야 함
   ▼
Phase 5 (배포 & 성능, SHOULD)
   │
   ▼
Phase 6 (관리자 기능 & 공유 링크, SHOULD)
   ※ 기술적으로는 Phase 2(견적서 데이터 모델)·Phase 3(PDF 라우트 패턴)에만 의존하며 Phase 4/5와 병행 착수도 가능하지만,
     우선순위상 MVP 안정화·배포 이후로 배치. 신규 공개 라우트(/share)이므로 middleware.ts PROTECTED_PATHS 회귀에 주의
```

- **병렬 가능**: Phase 2~3 내에서 UI 마크업(목업 데이터) ↔ Notion Server Action 구현, Phase 3의 PDF ↔ 거래처/템플릿 관리, Phase 4의 테스트 셋업 ↔ 에러 처리 개선. Phase 6은 내부적으로 순차 의존이 강하나(T6-1→T6-4), T6-5(공개 PDF)는 T6-4 완료 후 별도 블록으로 분리 가능
- **순차 필수**: Notion DB 스키마 확정(Phase 1) → 모든 Notion 연동 기능(Phase 2~3), MVP 전체 완성(Phase 3) → 테스트 대상 확보(Phase 4) → 배포 게이트(Phase 5) → 공유 링크 설계 결정(Phase 6 쟁점 1·2) → 스키마(T6-2) → 발급 UI(T6-3) → 공개 페이지(T6-4)

---

## 성공 기준

1. **MVP 완성도**: PRD F001~F013 전 기능이 목업이 아닌 실제 Notion 데이터로 동작(2026-08-08까지)
2. **핵심 플로우 무결성**: 회원가입 → Notion 연동 → 견적서 작성 → PDF 다운로드까지 중단 없이 1회 수동 e2e 통과
3. **데이터 안전성**: Notion Integration Token이 평문으로 저장/노출되지 않음(암호화 저장 확인)
4. **회귀 안전망**: 핵심 폼 스모크 테스트 3~5개 이상 통과, `npm run test` 정상 동작(2026-08-22까지)
5. **코드 품질**: 각 페이즈 종료 시점마다 `npm run check-all`, `npm run build` 통과 유지
6. **일정 준수**: 버퍼(약 1.5주, 전체 일정의 ~15%)를 포함해 2026-09-04 내 MVP+안정화+배포 로드맵 완료 또는 우선순위 재조정 결정
7. **관리자 기능 완성도(Phase 6)**: role 기반 권한 체계 없이도 관리자 뷰(기존 `/invoice` 확장)에서 공유 링크를 발급할 수 있고, 비로그인 클라이언트가 해당 링크로 견적서 열람 및 PDF 다운로드까지 중단 없이 성공하며, 소유자가 링크를 즉시 비활성화할 수 있음을 실제 시나리오로 확인(2026-09-25까지)
8. **공개 라우트 안전성**: `/share/[token]`, `/api/share/[token]/pdf`가 `middleware.ts`의 `PROTECTED_PATHS`에 걸리지 않으면서도, 유효하지 않은/비활성화된 토큰으로는 어떤 견적서 데이터도 노출되지 않음을 회귀 테스트로 확인
