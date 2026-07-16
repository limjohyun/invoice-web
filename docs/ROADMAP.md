# 🗺️ 개발 로드맵

## 프로젝트 개요

- **프로젝트 명**: Notion Invoice Web (견적서 관리 시스템)
- **목적**: 별도 서버/DB 구축 없이 Notion 데이터베이스를 백엔드로 활용해 1인 사업가·프리랜서·소규모 비즈니스가 견적서를 손쉽게 작성·관리·공유할 수 있게 한다.
- **기술 스택**: Next.js 15.5.3(App Router + Turbopack), React 19.1.0, TypeScript 5, TailwindCSS v4 + shadcn/ui(new-york), React Hook Form + Zod + Server Actions, Notion API(@notionhq/client), Supabase Auth, @react-pdf/renderer, Vercel
- **문서 기준일**: 2026-07-02
- **최종 업데이트**: 2026-07-16 (Phase 1 진행: T1~T8 완료, Notion 토큰 설정 페이지 구현)
- **현재 상태**: **Phase 1 88.5% 진행** (T1~T8 완료) - Supabase Auth 통합, 회원가입/로그인/로그아웃, 라우트 보호(middleware.ts), Notion API 래퍼(client/queries/errors/logger), Server Action 구조 완구현, Notion 토큰 설정 페이지(/settings) 완성. Phase 1 마지막 (로그인 분기 로직)은 T9에서 구현 예정
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
- [ ] (MUST) 로그인 성공 후 분기 로직: Notion 미연동 → 연동 설정 페이지, 연동 완료 → 대시보드(PRD 사용자 여정 그대로) **[T9 진행 예정]**

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
- ⏳ **진행 중**: 로그인 성공 후 Notion 연동 상태 확인 분기 로직 (T9)

#### 위험 요소

- **위험**: Notion Integration Token을 평문으로 저장하면 보안 사고로 직결 → **완화**: Supabase 컬럼 레벨 암호화 또는 Vault 기능 사용, 최소한 서버 전용 접근(RLS로 클라이언트 직접 조회 차단)
- **위험**: Notion Relation은 저장 순서를 보장하지 않음 → **완화**: Sort Order (Number) 필드 추가로 Item 표시 순서 유지
- **위험**: 거래처 정보를 Invoice 내 텍스트 필드로 저장하면 향후 거래처별 다중 Invoice 조회가 어려움 → **완화**: 현재 소규모 사용 시나리오이므로 수용 가능, 필요 시 향후 Clients DB 분리
- **위험**: Supabase Auth와 React 19 Server Actions 조합의 세션 갱신(refresh token) 타이밍 이슈 → **완화**: `@supabase/ssr` 공식 Next.js App Router 가이드를 context7로 최신 문서 확인 후 구현

---

### Phase 2: 견적서 핵심 CRUD & 대시보드 (2026-07-16 ~ 2026-07-29, 약 2주)

**목표**: PRD의 핵심 가치인 "견적서 생성 → Notion 동기화 → 조회/수정/삭제" 흐름을 완성한다.

**우선순위**: MUST

**선행 조건**: Phase 1의 Notion DB 스키마 확정 및 인증/세션 패턴

**병렬 처리 가능**: 대시보드·견적서 작성 폼의 UI 마크업(목업 데이터 사용)은 Notion 동기화 Server Action 구현과 동시에 진행 가능 — 완성 후 목업 데이터를 실제 Notion 응답으로 교체하는 방식으로 리스크 분리

#### 핵심 기능

- [ ] (MUST) F001 대시보드 — Notion 견적서 DB 목록 조회, 상태(초안/발송 등) 표시, 마지막 동기화 시각 표시
- [ ] (MUST) F002 견적서 작성 — 거래처 선택, 품목/수량/단가 입력 및 금액 자동 계산(React Hook Form + Zod, `useFieldArray`로 품목 반복 입력)
- [ ] (MUST) F006 Notion 동기화 — 견적서 저장 시 Notion 페이지 생성/업데이트 Server Action
- [ ] (MUST) F003 견적서 상세 조회 페이지
- [ ] (MUST) F004 견적서 수정 — 작성 페이지를 수정 모드로 재사용
- [ ] (MUST) F005 견적서 삭제 — Notion 페이지 아카이브 처리 포함

#### 기술적 준비 작업

- [ ] Notion 품목(items) 데이터를 Notion 속성으로 표현하는 방식 확정(rich_text에 JSON 직렬화 vs 하위 블록 사용) — Phase 1 설계 스파이크 결과 반영
- [ ] 금액 자동 계산 로직 유닛 함수 분리(`src/lib/invoice/calculate.ts`) — 이후 PDF 생성에서도 재사용
- [ ] Notion API 응답 → 화면 표시용 타입 매핑 계층(`src/lib/notion/mappers.ts`)
- [ ] 저장 실패 시 에러 처리 및 재시도 UX(토스트 알림, sonner 활용)

#### 🧪 테스트 체크리스트 (Playwright MCP 필수)

**구현 완료 후 반드시 다음 3가지 시나리오를 테스트한 후에만 완료 처리**:

- [ ] ✅ 정상 케이스(Happy Path): 올바른 데이터로 견적서 생성 → Notion 동기화 → 조회 성공
- [ ] ❌ 실패/에러 케이스: Notion API 실패, 잘못된 입력, 네트워크 오류 시 에러 메시지 표시 및 롤백
- [ ] 🎯 엣지 케이스: 매우 긴 텍스트, 특수문자, 동시 요청, 품목 0개 상태
- [ ] 테스트 실패 시 원인 파악 → 코드 수정 → 재테스트 → 통과 확인 후 완료 처리

#### 예상 완료 결과물

- 목업 없이 실제 Notion 데이터로 동작하는 대시보드
- 견적서 생성 → Notion 페이지 생성 → 상세 조회 → 수정 → 삭제까지 전체 흐름 e2e 수동 검증 완료

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

- [ ] (MUST) F007 견적서 PDF 다운로드 — `@react-pdf/renderer` 설치, 견적서 상세 데이터를 PDF 템플릿으로 렌더링
- [ ] (MUST) F012 거래처 관리 — 거래처 등록/조회/수정/삭제(Notion DB CRUD), 견적서 작성 페이지의 거래처 선택 드롭다운과 연동
- [ ] (MUST) F013 템플릿 관리 — 템플릿 생성/조회/수정/삭제, 견적서 작성 페이지에서 "템플릿 불러오기" 기능

#### 기술적 준비 작업

- [ ] PDF 한글 폰트 임베딩 검증(Noto Sans KR 등) — 초기 PoC로 레이아웃 깨짐 여부 확인
- [ ] 거래처/템플릿 선택 UI 컴포넌트(shadcn `Select`/`Command`) 재사용 설계 — 두 곳(거래처 관리 페이지, 견적서 작성 페이지)에서 공유
- [ ] PDF 다운로드 시 서버(Server Action)에서 생성 후 스트리밍 vs 클라이언트 생성 여부 결정(파일 크기·서버 부하 고려)

#### 🧪 테스트 체크리스트 (Playwright MCP 필수)

**F007(PDF), F012, F013 각각 구현 완료 후 다음 3가지 시나리오를 테스트한 후에만 완료 처리**:

**F007 PDF 다운로드**:

- [ ] ✅ 정상 케이스: 견적서 상세에서 PDF 다운로드 클릭 → 한글 폰트 정상 렌더링 → 파일 다운로드 성공
- [ ] ❌ 실패/에러 케이스: 빈 견적서, 매우 큰 파일, PDF 생성 타임아웃 시 에러 메시지 표시
- [ ] 🎯 엣지 케이스: 특수문자 포함, 레이아웃 줄바꿈, 동시 다운로드 요청

**F012/F013 거래처/템플릿 관리**:

- [ ] ✅ 정상 케이스: CRUD 작업(생성/조회/수정/삭제) → Notion 동기화 성공
- [ ] ❌ 실패/에러 케이스: Notion DB 오류, 중복 이름, 삭제 후 참조 오류 처리
- [ ] 🎯 엣지 케이스: 대량 데이터, 빈 필드, 매우 긴 텍스트

- [ ] 테스트 실패 시 원인 파악 → 코드 수정 → 재테스트 → 통과 확인 후 완료 처리

#### 예상 완료 결과물

- **MVP 완성**: PRD의 F001~F013 전 기능이 실제 Notion 데이터 기반으로 동작
- 견적서 상세 페이지에서 클릭 한 번으로 한글 PDF 다운로드 가능
- 거래처/템플릿을 견적서 작성 시 실제로 재사용 가능

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

| 마일스톤                       | 예상 완료일       | 상태     | 핵심 산출물                                                                                                    |
| ------------------------------ | ----------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| M1-A: 인증 기반 구축 (T1~T6)   | **✅ 2026-07-12** | **완료** | ✅ Supabase Auth (가입/로그인/로그아웃), ✅ 보호된 라우트 (middleware.ts + RLS 정책), ✅ Notion DB 스키마 확정 |
| M1-B: Notion API 래퍼 (T7)     | **✅ 2026-07-12** | **완료** | ✅ Notion 클라이언트 (재시도/타임아웃), ✅ CRUD 함수, ✅ Server Action 구조, ✅ 타입 정의 & Zod 스키마         |
| M1-C: Notion 토큰 설정 (T8~T9) | 2026-07-15        | 진행 중  | Notion 토큰 설정 페이지, 로그인 분기 로직, E2E 테스트                                                          |
| M2: 견적서 핵심 CRUD           | 2026-07-29        | 예정     | 대시보드, 견적서 생성/조회/수정/삭제(Notion 실데이터)                                                          |
| M3: **MVP 출시**               | 2026-08-08        | 예정     | F001~F013 전 기능 완성, PDF 다운로드, 거래처/템플릿 관리                                                       |
| M4: 안정화                     | 2026-08-22        | 예정     | 스모크 테스트, 에러 처리, 로딩 UX 개선                                                                         |
| M5: 배포 & 문서화 완료         | 2026-09-04        | 예정     | 프로덕션 배포, Notion 연동 문서, 성능 점검 완료                                                                |

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
