---
name: notion-sdk-v5-patterns
description: invoice-web가 쓰는 @notionhq/client v5(API 2025-09-03)의 비자명한 제약과 필수 패턴 — databases.query 제거, data source 해석, 페이지네이션, 내장 retry/timeout
metadata:
  type: project
---

invoice-web는 `@notionhq/client` v5.x(API 버전 2025-09-03)를 사용한다. 이 버전은 데이터베이스가 "data source" 단위로 동작하도록 바뀌어 v4 이하와 호출 방식이 다르다. Notion 관련 작업 시 아래 제약을 먼저 확인할 것.

**Why:** v4→v5는 breaking change다. 구버전 코드/튜토리얼(`databases.query`, `parent: { database_id }` 전용)을 그대로 쓰면 런타임/타입 에러가 난다. 이 프로젝트에서 실제로 마주쳐 해결한 사항들이다.

**How to apply:**

- `client.databases.query`는 **v5에서 제거됨**. 목록 조회는 `client.dataSources.query({ data_source_id, filter, sorts })`를 쓴다.
- `database_id → data_source_id` 변환: `client.databases.retrieve({ database_id })` 후 `isFullDatabase(db)` 확인하고 `db.data_sources[0].id` 사용(단일 소스 DB 기준). 매핑은 불변이므로 프로세스 메모리에 캐싱 권장(`src/lib/notion/queries.ts`의 `resolveDataSourceId`).
- 페이지 생성 parent는 `{ data_source_id }` 또는 `{ database_id }`(하위호환, 기본 소스로 라우팅) 둘 다 타입 통과. 이 프로젝트는 `{ data_source_id }`로 통일.
- **`collectPaginatedAPI` 헬퍼는 `dataSources.query`와 타입 비호환**: `QueryDataSourceParameters.start_cursor`가 `string | null | undefined`인데 헬퍼의 `PaginatedArgs`는 `string | undefined`라 assignable 하지 않음. 100건 초과 수집은 `while(has_more)` 수동 루프로 직접 구현할 것(`collectAllDataSourcePages`).
- v5 `Client`는 인프라 옵션을 기본 제공: `timeoutMs`(요청 타임아웃), `retry: { maxRetries, initialRetryDelayMs }`(429/5xx에 지수 백오프 + Retry-After 자동), `logger`(SDK 로그 어댑터), `notionVersion`. 재시도를 직접 구현하기 전에 이 내장 옵션을 먼저 활용.
- 타임아웃/네트워크(RequestTimeoutError, fetch 실패)는 내장 retry가 다루지 않으므로 `src/lib/notion/errors.ts`의 `withRetry`(timeout/network_error 코드만 재시도)로 보완. 429/5xx는 SDK가 처리하니 withRetry에서 중복 재시도하지 않도록 코드로 구분.
- 루트 `@notionhq/client`에서 대부분의 타입(`PageObjectResponse`, `QueryDataSourceParameters`, `CreatePageParameters` 등)과 값(`isFullPage`, `isFullDatabase`, `APIResponseError`, `APIErrorCode`, `ClientErrorCode` 등)이 모두 export됨. 하위 경로 import 불필요.

**아키텍처 메모(멀티테넌트):** 각 사용자는 자신의 Notion Integration Token과 DB ID를 Supabase `profiles`(notion_access_token / notion_invoice_db_id / notion_items_db_id)에 저장한다(F011). 그래서 데이터 격리는 Notion 필터가 아니라 **사용자별 토큰+DB**로 이뤄진다. Invoices 스키마에는 owner/userId 속성이 없다. Server Action은 `getNotionContext()`로 토큰/DB를 얻어 `createNotionClient(token)`에 주입한다.

관련: [[notion-schema-2db-relation]]
