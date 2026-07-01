---
name: project-starter-scope-phasing
description: invoice-web 프로젝트는 2026-07-02부로 "범용 스타터 템플릿"에서 "Notion Invoice Web(견적서 관리 시스템)" 실제 제품 구현으로 전환됨 — 과거의 provider-agnostic 가이드 전략은 더 이상 적용되지 않음
metadata:
  type: project
---

**과거 상태(2026-07-01 이전, 이제 무효)**: 이 프로젝트는 claude-nextjs-starters라는 범용 스타터 템플릿이었고, docs/PRD.md는 "In Scope는 스타터 골격, 인증/DB/테스트/CI-CD는 Out of Scope, 향후 확장 가이드로만 제공"이라는 내용이었다.

**현재 상태(2026-07-02 확인)**: docs/PRD.md가 "Notion Invoice Web MVP PRD"로 전면 교체됨. 이제 이 프로젝트는 실제로 출시할 제품이며, 특정 벤더(Notion API, Supabase Auth, @react-pdf/renderer)에 명시적으로 종속되는 것이 PRD의 요구사항 그 자체다. 즉 이전 메모리의 "provider-agnostic 가이드 위주로 작성" 원칙은 더 이상 적용되지 않는다 — 이제는 실제 기능(F001~F013)을 구현하는 로드맵이어야 한다.

**Why:** PRD 자체가 바뀌었기 때문에 과거 페이즈 전략(Phase 2~5를 "인증 가이드 문서", "DB 가이드 문서" 식으로 작성)을 그대로 재사용하면 완전히 틀린 로드맵이 나온다. 2026-07-02에 docs/ROADMAP.md를 PRD 기준으로 전면 재작성함(MVP: 인증+Notion연동 → 견적서 CRUD → PDF/거래처/템플릿, 확장: 안정화 → 배포, 총 5페이즈 약 9주).

**How to apply:**
1. 향후 이 프로젝트의 로드맵을 갱신할 때는 반드시 먼저 `docs/PRD.md`를 다시 읽어 "지금 이 PRD가 스타터용인지 실제 제품용인지"부터 확인할 것 — PRD가 또 바뀌었을 수 있음
2. 실제 제품 PRD인 경우, 우선순위는 F-ID(PRD의 기능 명세 번호)를 기준으로 MUST/SHOULD/NICE 매핑하고, "MVP 이후 기능(제외)" 섹션에 명시된 항목(전자서명, 다중통화, 팀 초대, 결제 연동 등)은 확장 페이즈에도 포함하지 말 것 — PRD가 명시적으로 범위 밖이라고 선언한 항목이기 때문
3. Notion을 백엔드로 쓰는 프로젝트 특성상 "Notion 데이터베이스 스키마 설계(어떤 데이터를 몇 개의 DB로 나눌지)"는 항상 Phase 1의 최우선 설계 스파이크로 배치할 것 — 이 결정이 늦어지면 이후 모든 CRUD 기능이 재설계 위험에 노출됨
4. 1인 개발자 기준 로드맵에서는 "병렬 처리"를 실제 동시 인력 배치가 아니라 "UI 마크업(목업 데이터) 선행 → 백엔드 연동 후행"으로 리스크를 분리하는 방식으로 설명할 것

관련 파일: docs/PRD.md, docs/ROADMAP.md, CLAUDE.md
