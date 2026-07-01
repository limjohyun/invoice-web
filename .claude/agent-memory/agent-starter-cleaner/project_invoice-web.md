---
name: project-invoice-web
description: invoice-web 프로젝트의 정체와 PRD 범위 — 실제 인보이스 기능이 아직 없는 순수 Next.js 스타터킷 단계
metadata:
  type: project
---

invoice-web(claude-nextjs-starters)은 이름과 달리 아직 인보이스 도메인 기능이 전혀 없다. 2026-07-01
기준으로는 `docs/PRD.md`가 정의한 "모던 웹 애플리케이션 스타터 템플릿" Phase 1(Foundation)만 완료된
상태다: 홈/로그인/회원가입 페이지, 18개 shadcn/ui 컴포넌트, React Hook Form + Zod 폼 표준, ESLint/
Prettier/Husky 개발 도구, 5종 가이드 문서.

**Why:** PRD의 비범위(Out of Scope)에 실제 인증 백엔드, DB 연동, 테스트 인프라, CI/CD, 상태관리가 명시적으로
제외되어 있고, "사유"까지 문서화되어 있다 — 프로젝트마다 요구사항이 다르므로 스타터 단계에서는 의도적으로
비워둔 것이다. 즉, 이 항목들의 부재는 결함이 아니라 설계다.

**How to apply:**
- 이 저장소에서 "인증이 안 된다", "DB가 없다", "테스트가 없다" 같은 지적을 받아도 스타터킷의 의도된 범위이므로
  임의로 채워 넣지 말고 ROADMAP.md의 "Phase 2+ (Extensions)"에 이미 계획되어 있는지부터 확인한다.
- `docs/ROADMAP.md`의 마일스톤 날짜(예: "Milestone 2: Auth & API 예상 6월 말")는 작성 시점 기준이라 현재
  날짜와 비교해 이미 지났을 수 있다 — 일정표를 신뢰하기 전에 사용자에게 최신 일정인지 확인한다.
- `.git` 저장소가 아직 초기화되지 않은 상태였다(2026-07-01 확인) — Husky pre-commit 훅은 `git init` 이전에는
  활성화되지 않는다는 점을 감안한다.

관련: [[feedback-windows-crlf-prettier]], [[feedback-docs-vs-code-mismatch]]
