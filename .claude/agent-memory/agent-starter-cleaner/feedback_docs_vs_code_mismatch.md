---
name: feedback-docs-vs-code-mismatch
description: 문서(PRD/ROADMAP)가 나열하지 않은 파일이라도 삭제 전에 실제 사용 여부(import/grep)부터 확인해야 한다는 원칙
metadata:
  type: feedback
---

invoice-web의 ROADMAP.md/PRD.md는 "16개 shadcn 컴포넌트"를 명시적으로 나열했지만, 실제
`src/components/ui/`에는 18개 파일이 있었다 (`form.tsx`, `dropdown-menu.tsx`가 목록에 없음). 두 파일 모두
grep으로 확인한 결과 각각 로그인/회원가입 폼(React Hook Form 연동)과 테마 토글에서 실제로 사용 중이었다.

**Why:** "스타터킷 정리 = 문서에 없는 건 지운다"는 직관은 위험하다. 문서가 실제 코드를 따라가지 못해
누락된 것일 뿐, 코드 쪽이 최신 진실(source of truth)인 경우가 흔하다. 여기서 삭제했다면 로그인/회원가입
폼과 다크모드 토글이 즉시 깨졌을 것이다.

**How to apply:**
1. "불필요해 보이는" 파일/컴포넌트를 삭제하기 전에 반드시 `Grep`으로 프로젝트 전체에서 import/참조 여부를
   확인한다.
2. 실제로 사용 중인데 문서에 없다면, 삭제 대상이 아니라 **문서를 코드에 맞춰 갱신**하는 것이 맞는 방향이다.
3. 반대로 정말 미사용인 파일(예: `public/`의 create-next-app 기본 svg 5종 — file.svg, globe.svg, next.svg,
   vercel.svg, window.svg)은 grep으로 무참조를 확인한 뒤 삭제하고 `public/.gitkeep`으로 빈 디렉토리를
   유지한다.

관련: [[project_invoice-web]]
