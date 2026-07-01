---
name: feedback-windows-crlf-prettier
description: Windows 환경에서 .prettierrc의 endOfLine:"lf"와 git core.autocrlf=true가 충돌해 check-all이 전체 파일에서 실패하는 패턴과 예방법
metadata:
  type: feedback
---

Next.js 스타터킷에서 `.prettierrc`에 `"endOfLine": "lf"`가 설정되어 있고, 개발 환경이 Windows이며 git의
`core.autocrlf=true`(전역 설정)인 경우, 체크아웃/저장 시 파일이 CRLF로 변환되어 `prettier --check` (즉
`npm run check-all`)이 **거의 모든 파일**에서 실패한다. invoice-web 프로젝트에서 실제로 72개 파일 전부가
이 문제로 실패했다.

**Why:** PRD/CLAUDE.md의 성공 기준 1번이 "`npm run check-all` 항상 통과"인데, 이 결함은 코드 로직과
무관하게 플랫폼 설정 차이만으로 100% 재현되고, 원인이 즉시 드러나지 않아 (개별 파일 diff가 아니라 줄바꿈
차이라) 디버깅 시간을 많이 잡아먹는다.

**How to apply:**
1. Next.js/스타터킷 프로젝트를 새로 열었을 때 `npm run check-all`이 대량의 파일에서 동시에 실패하면,
   먼저 `file <경로>` 또는 줄바꿈 문자를 확인해 CRLF/LF 불일치부터 의심한다.
2. 즉시 수정: `npm run format` (prettier --write .)으로 작업 트리를 LF로 정규화한다.
3. 재발 방지: 프로젝트 루트에 `.gitattributes`를 추가해 `* text=auto eol=lf`로 강제한다 (바이너리 확장자는
   `binary` 처리 필요). 이렇게 하면 `core.autocrlf` 설정과 무관하게 체크아웃 시 항상 LF를 유지한다.
4. `.git`이 아직 초기화되지 않은 프로젝트라도 `.gitattributes`는 미리 추가해두는 것이 안전하다 — 이후
   `git init` + 커밋 시점에 같은 문제가 재발하는 것을 막는다.

관련: [[project_invoice-web]]
