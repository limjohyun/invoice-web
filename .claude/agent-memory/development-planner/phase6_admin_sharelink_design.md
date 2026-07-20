---
name: phase6-admin-sharelink-design
description: Phase 6(관리자 기능+공유 링크) 설계 결정 — role 미도입, 토큰 기반 공유 링크 채택. 근거와 위치는 ROADMAP_V1.md Phase 6 섹션 참고
metadata:
  type: project
---

2026-07-20 세션에서 `docs/roadmaps/ROADMAP_V1.md`에 **Phase 6: 관리자 기능 추가**를 신설하며 두 가지 설계 쟁점을 확정했다. 전체 근거(설계 결정 전문)는 로드맵 파일 Phase 6 섹션의 "📌 설계 결정" 블록에 있으므로, 아래는 향후 세션이 같은 질문을 다시 검토하지 않도록 결론만 요약한다.

1. **"관리자"는 role 기반 다중 사용자 권한이 아니라 기존 로그인 사용자(사업자 본인) 관리 UI다.** `profiles.role` 컬럼, `/admin` 신규 라우트, role 기반 미들웨어 가드를 도입하지 않기로 함 — 이 서비스는 싱글 테넌트 구조([[project-starter-scope-phasing]] 참고, 각 사용자가 자기 Notion 워크스페이스만 다룸)이고, "다른 사용자를 감독하는 관리자"라는 시나리오가 PRD/요구사항 어디에도 없기 때문. 기존 `/invoice` 목록(`src/app/invoice/page.tsx`)을 그대로 확장해 공유 링크 복사 기능만 추가하는 방향으로 결정.
2. **클라이언트에게 보낼 공개 링크는 Notion 페이지 ID를 그대로 노출하지 않고, Supabase에 별도 랜덤 공유 토큰(`invoice_share_links` 테이블)을 발급해 관리한다.** 인증 우회는 기존에 이미 존재하던 Service Role 클라이언트(`src/lib/supabase/admin.ts`의 `createSupabaseAdminClient()`)를 재사용해 RLS를 우회하고, 토큰→소유자→Notion 컨텍스트 조회는 `getInvoiceByShareToken()` 단일 함수로 격리하는 것을 MUST 요구사항으로 못박음(공격 표면 최소화). 공개 라우트(`/share/[token]`, `/api/share/[token]/pdf`)는 `middleware.ts`의 `PROTECTED_PATHS`에 절대 포함하면 안 됨.

**Why:** 요구사항 문구("관리자 레이아웃", "클라이언트에게 보낼 링크")만으로는 role 기반 권한 체계 신설 또는 Notion ID 직접 노출처럼 훨씬 무거운/위험한 해석도 가능했다. 싱글 테넌트 구조라는 기존 아키텍처 사실과, 이미 코드베이스에 존재하던 `createSupabaseAdminClient()`(webhook/배치용으로 마련돼 있던 것)를 근거로 가장 낮은 리스크·낮은 복잡도의 해석을 택했다.

**How to apply:**
- 다음에 "관리자"/"admin" 관련 요구사항이 다시 나오면, 먼저 이 결정이 여전히 유효한지 확인할 것(즉 profiles에 role 컬럼이 실제로 생겼는지 `Grep`으로 재확인 — 이 메모는 결정 시점의 스냅샷일 뿐).
- Phase 6 구현이 실제로 진행되면 `invoice_share_links` 테이블/`src/lib/actions/share.ts`가 로드맵 설계대로 만들어졌는지 코드로 검증 후 참고할 것.
- 향후 실제로 "여러 사업자 계정을 한 명이 감독"하는 요구가 명시적으로 들어오면, 그때는 이 결정을 뒤엎고 role 체계를 별도 페이즈로 설계해야 함 — `invoice_share_links.owner_user_id`를 명시적으로 분리해 둔 이유가 바로 이 미래 확장을 스키마 변경 없이 수용하기 위함.

관련 파일: `docs/roadmaps/ROADMAP_V1.md`(Phase 6 섹션), `src/lib/supabase/admin.ts`, `src/lib/supabase/middleware.ts`, `src/lib/actions/notion.ts`
