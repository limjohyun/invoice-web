# 🗺️ 개발 로드맵

## 프로젝트 개요

- **프로젝트 명**: Notion Invoice Web (견적서 관리 시스템)
- **목적**: 별도 서버/DB 구축 없이 Notion 데이터베이스를 백엔드로 활용해 1인 사업가·프리랜서·소규모 비즈니스가 견적서를 손쉽게 작성·관리·공유할 수 있게 한다.
- **기술 스택**: Next.js 15.5.3(App Router + Turbopack), React 19.1.0, TypeScript 5, TailwindCSS v4 + shadcn/ui(new-york), React Hook Form + Zod + Server Actions, Notion API(@notionhq/client), Supabase Auth, @react-pdf/renderer, Vercel
- **문서 기준일**: 2026-07-02
- **최종 업데이트**: 2026-07-19 (Phase 3 F007/F012/F013 구현 + 정상 케이스 수동 검증 완료)
- **현재 상태**: **Phase 1·2 100% 완료** (T1~T9, F001~F006). **Phase 3(F007 PDF 다운로드, F012 거래처 관리, F013 템플릿 관리)도 구현 완료 + 실데이터로 정상 케이스 수동 검증 완료** — 거래처/템플릿 CRUD(신규 Clients/Templates Notion DB), 견적서 작성 폼의 "거래처/템플릿 불러오기" 연동, 한글 PDF 다운로드까지 실제 Notion 워크스페이스로 확인했다. PRD의 F001~F013 전 기능이 이제 실제 데이터로 동작한다. 남은 것은 Phase 2·3의 실패/에러/엣지 케이스 테스트뿐(Phase 4로 이관 가능)
- **예상 개발 기간**: MVP 약 5.5주(2026-07-02 ~ 2026-08-08) + 확장(안정화·배포) 약 3.5주 → **총 약 9주(2026-07-02 ~ 2026-09-04, 버퍼 약 15% 포함)**
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

- [ ] (MUST) **Playwright MCP E2E 회귀 테스트**: Phase 2~3의 핵심 플로우(로그인 → Notion 연동 → 견적서 작성 → PDF 다운로드) 재검증
- [ ] (MUST) Vitest + React Testing Library 셋업 및 핵심 폼(로그인/회원가입/견적서 작성) 스모크 테스트 3~5개
- [ ] (SHOULD) 금액 계산 로직(`src/lib/invoice/calculate.ts`) 유닛 테스트
- [ ] (SHOULD) Notion API 응답 실패/타임아웃에 대한 에러 바운더리 및 사용자 안내 메시지 정비
- [ ] (SHOULD) 로딩/스켈레톤 UI 적용(대시보드, 견적서 상세, 거래처/템플릿 목록)
- [ ] (NICE-TO-HAVE) 견적서 상태(초안/발송/승인/거절) 수동 변경 UI(자동 알림 없이 상태값만 변경 — PRD의 "이메일 자동 알림"은 명시적으로 MVP 이후 제외 범위이므로 상태 변경 UI만 최소 제공)

#### 기술적 준비 작업

- [ ] `package.json`에 `test`, `test:watch` 스크립트 추가(기존 `check-all`과는 분리해 선택 실행 가능하게 구성)
- [ ] Notion API 요청 재시도/백오프 유틸을 실제 실패 시나리오(토큰 만료, DB 삭제됨 등)에 맞춰 보강
- [ ] 접근성 점검(폼 라벨, 키보드 포커스, 대비) 1회 수동 점검

#### 🧪 테스트 체크리스트 (Playwright MCP + Vitest 필수)

**E2E 회귀 테스트 (Playwright MCP)**:

- [ ] ✅ 정상 시나리오: 신규 사용자 → 가입 → Notion 연동 → 견적서 작성 → PDF 다운로드 (전체 플로우)
- [ ] ❌ 실패 시나리오: 각 단계에서 오류 발생 시 적절한 에러 메시지 표시 및 복구 가능성
- [ ] 🎯 회귀 시나리오: Phase 2~3에서 추가된 기능이 여전히 정상 동작하는지 재검증

**유닛 테스트 (Vitest)**:

- [ ] ✅ 로그인/회원가입/견적서 작성 폼 유닛 테스트 3~5개
- [ ] ✅ 금액 계산 로직 유닛 테스트 (정상/실패/엣지 케이스)
- [ ] 모든 테스트 통과 후 Phase 5 배포 준비로 진행

#### 예상 완료 결과물

- 핵심 폼 스모크 테스트 통과(회귀 방지 최소 안전망)
- Notion 연동 실패 시에도 사용자가 원인을 이해할 수 있는 에러 메시지 체계
- 주요 페이지 로딩 상태 UX 개선 완료

#### 위험 요소

- **위험**: 1인 개발 특성상 테스트 작성이 뒤로 밀리기 쉬움 → **완화**: 테스트 범위를 "핵심 폼 스모크 3~5개"로 엄격히 제한해 완주 가능한 규모로 유지
- **위험**: Notion 토큰 만료·권한 철회 등 실사용 중 발생 가능한 예외를 사전에 모두 예측하기 어려움 → **완화**: 에러 메시지에 "Notion 연동 설정 페이지에서 재연결" 안내를 기본 동선으로 포함해 사용자가 스스로 복구 가능하게 설계

---

### Phase 5: 배포 준비 & 성능 최적화 (2026-08-24 ~ 2026-09-04, 약 1.5주 · 버퍼 포함)

**목표**: Vercel 배포를 확정하고, 실사용 트래픽에서 문제되지 않을 수준의 성능/문서화를 마무리한다.

**우선순위**: SHOULD

**선행 조건**: Phase 4의 테스트 스위트(배포 전 회귀 확인 대상)

#### 핵심 기능

- [ ] (SHOULD) Vercel 배포 설정 및 환경 변수(Supabase/Notion 키) 프로덕션 값 등록
- [ ] (SHOULD) 이미지 최적화(next/image), 폰트 로딩 최적화 점검
- [ ] (SHOULD) 대시보드/견적서 목록 조회 성능 점검(Notion API 응답 캐싱 전략 확정)
- [ ] (NICE-TO-HAVE) 404/500 커스텀 에러 페이지
- [ ] (NICE-TO-HAVE) GitHub Actions 기반 CI(lint/typecheck/build/test) 예제 워크플로우

#### 기술적 준비 작업

- [ ] `.env.example`에 Supabase/Notion 관련 변수 전체 정리
- [ ] 배포 전 `npm run check-all` + `npm run build` + 스모크 테스트 전수 통과 확인
- [ ] 문서화: `docs/guides/notion-integration.md`(Notion 연동 구조/DB 스키마 설명), 사용자 가이드(회원가입부터 PDF 다운로드까지) 작성

#### 예상 완료 결과물

- 프로덕션 URL에서 실제 사용 가능한 서비스
- 신규 개발자/사용자가 참고할 수 있는 Notion 연동 구조 문서

#### 위험 요소

- **위험**: Vercel 서버리스 함수의 실행 시간 제한(기본 10초)이 Notion API 다건 조회/PDF 생성과 충돌할 가능성 → **완화**: 무거운 작업(PDF 생성, 대량 동기화)은 함수 실행 시간을 사전 측정하고 필요 시 Vercel 함수 타임아웃 설정 상향 또는 Edge/Node 런타임 선택 재검토
- **위험**: 일정 압박으로 NICE-TO-HAVE 항목(CI 워크플로우, 커스텀 에러 페이지)이 누락될 수 있음 → **완화**: 이 페이즈의 버퍼(약 1주)를 활용해 SHOULD 항목을 우선 완료하고, 남는 시간에만 NICE-TO-HAVE 착수

---

## 주요 마일스톤

| 마일스톤                       | 예상 완료일       | 상태                | 핵심 산출물                                                                                                    |
| ------------------------------ | ----------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| M1-A: 인증 기반 구축 (T1~T6)   | **✅ 2026-07-12** | **완료**            | ✅ Supabase Auth (가입/로그인/로그아웃), ✅ 보호된 라우트 (middleware.ts + RLS 정책), ✅ Notion DB 스키마 확정 |
| M1-B: Notion API 래퍼 (T7)     | **✅ 2026-07-12** | **완료**            | ✅ Notion 클라이언트 (재시도/타임아웃), ✅ CRUD 함수, ✅ Server Action 구조, ✅ 타입 정의 & Zod 스키마         |
| M1-C: Notion 토큰 설정 (T8~T9) | **✅ 2026-07-16** | **완료**            | ✅ Notion 토큰 설정 페이지, ✅ 로그인 분기 로직, ✅ E2E 테스트                                                 |
| M2: 견적서 핵심 CRUD           | 2026-07-29        | 핵심 기능 검증 완료 | ✅ 대시보드/생성/상세/수정(품목 diff)/삭제 실데이터 검증 완료, ⏳ 실패·엣지 케이스 검증 대기                   |
| M3: **MVP 출시**               | 2026-08-08        | 핵심 기능 검증 완료 | ✅ F001~F013 전 기능 구현+정상 케이스 검증 완료, ⏳ 실패·엣지 케이스 검증 대기                                 |
| M4: 안정화                     | 2026-08-22        | 예정                | 스모크 테스트, 에러 처리, 로딩 UX 개선                                                                         |
| M5: 배포 & 문서화 완료         | 2026-09-04        | 예정                | 프로덕션 배포, Notion 연동 문서, 성능 점검 완료                                                                |

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
```

- **병렬 가능**: Phase 2~3 내에서 UI 마크업(목업 데이터) ↔ Notion Server Action 구현, Phase 3의 PDF ↔ 거래처/템플릿 관리, Phase 4의 테스트 셋업 ↔ 에러 처리 개선
- **순차 필수**: Notion DB 스키마 확정(Phase 1) → 모든 Notion 연동 기능(Phase 2~3), MVP 전체 완성(Phase 3) → 테스트 대상 확보(Phase 4) → 배포 게이트(Phase 5)

---

## 성공 기준

1. **MVP 완성도**: PRD F001~F013 전 기능이 목업이 아닌 실제 Notion 데이터로 동작(2026-08-08까지)
2. **핵심 플로우 무결성**: 회원가입 → Notion 연동 → 견적서 작성 → PDF 다운로드까지 중단 없이 1회 수동 e2e 통과
3. **데이터 안전성**: Notion Integration Token이 평문으로 저장/노출되지 않음(암호화 저장 확인)
4. **회귀 안전망**: 핵심 폼 스모크 테스트 3~5개 이상 통과, `npm run test` 정상 동작(2026-08-22까지)
5. **코드 품질**: 각 페이즈 종료 시점마다 `npm run check-all`, `npm run build` 통과 유지
6. **일정 준수**: 버퍼(약 1.5주, 전체 일정의 ~15%)를 포함해 2026-09-04 내 전체 로드맵 완료 또는 우선순위 재조정 결정
