# Notion 연동 구조 (현재 상태 기준)

**작성일**: 2026-07-20 (Phase 5)
**상태**: Phase 3까지 반영된 4-DB 구조, 실제 운영 중인 스키마 기준

> `docs/guides/notion-schema.md`와 `docs/guides/notion-setup-guide.md`는 Phase 1 T1 시점(2-DB 설계)의 역사적 설계/셋업 기록이다. Clients/Templates DB가 Phase 3에서 추가되면서 실제 구조가 바뀌었으므로, **현재 구조를 파악하려면 이 문서를 기준으로 본다.**

## 1. 사용자별 연동 모델

이 서비스는 사용자마다 자신의 Notion 워크스페이스를 연결하는 멀티테넌트 구조다. 서버가 하나의 Notion 워크스페이스만 바라보는 것이 아니라, **각 사용자가 `/settings` 페이지에서 자신의 Notion Integration Token과 4개 데이터베이스 ID를 입력**하면 그 값이 Supabase `profiles` 테이블에 저장되고, 이후 모든 Notion API 호출은 요청한 사용자의 토큰/DB ID로 이루어진다.

- `profiles.notion_access_token` — 사용자의 Notion Integration Token
- `profiles.notion_invoice_db_id`, `notion_items_db_id`, `notion_clients_db_id`, `notion_templates_db_id` — 4개 DB ID
- `getNotionContext()`(`src/lib/actions/notion.ts`)가 매 Server Action 호출 시 이 5개 값을 조회해 요청 컨텍스트를 만든다. 4개 DB ID 중 하나라도 비어 있으면 `config_error`를 반환하고 `/settings`로 유도한다.

환경변수 `NOTION_API_KEY`(`src/lib/env.ts`)는 이 사용자별 토큰과 별개로, **단일 워크스페이스/로컬 개발 시 사용자 토큰이 없을 때의 폴백**일 뿐이다(`src/lib/notion/client.ts:46`, `accessToken ?? env.NOTION_API_KEY`). 배포 시 이 값이 없어도 사용자별 연동은 정상 동작한다.

## 2. 4개 데이터베이스 스키마

Notion 페이지 속성명은 한글/영문이 섞여 있다(초기 설계는 영문, Phase 3 추가분은 한글로 작성됨 — 일관성 이슈이지만 이미 운영 중인 값이라 유지).

### Invoices (견적서)

| 속성명               | 타입         | 비고                                                   |
| -------------------- | ------------ | ------------------------------------------------------ |
| Title                | Title        | 견적서 식별자. **주의**: 아래 "known issue" 참고       |
| Client Name          | Text         | 거래처명(텍스트로 직접 저장, Clients DB relation 아님) |
| Client Email         | Email        | 선택                                                   |
| Client Phone         | Phone Number | 선택                                                   |
| Client Address       | Text         | 선택                                                   |
| Client Registration# | Text         | 선택, 사업자등록번호                                   |
| Items                | Relation     | Items DB 참조(1:N)                                     |
| Total Amount         | Rollup(Sum)  | Items.Amount 합산, Notion이 자동 계산                  |
| Currency             | Select       | KRW/USD/JPY/EUR                                        |
| Status               | Select       | Draft/Sent/Approved/Paid/Rejected/Cancelled            |
| Due Date             | Date         | 선택                                                   |
| Notes                | Text         | 선택                                                   |

### Items (품목)

| 속성명     | 타입     | 비고                                                           |
| ---------- | -------- | -------------------------------------------------------------- |
| Name       | Title    | 품목명                                                         |
| Invoice    | Relation | 소속 견적서(Invoices) 1건                                      |
| Quantity   | Number   |                                                                |
| Unit Price | Number   |                                                                |
| Tax Rate   | Number   | 선택, % 단위                                                   |
| Sort Order | Number   | 견적서 내 표시 순서(Relation은 순서 미보장이라 별도 필드 필요) |
| Amount     | Formula  | `Quantity × Unit Price`, Notion이 자동 계산                    |

### Clients (거래처, Phase 3 신규)

| 속성명(Notion) | 타입  | 도메인 필드(`Client`) |
| -------------- | ----- | --------------------- |
| 거래처명       | Title | `name`                |
| 담당자         | Text  | `contactPerson`       |
| 이메일         | Email | `email`               |
| 전화번호       | Phone | `phone`               |
| 주소           | Text  | `address`             |
| 사업자등록번호 | Text  | `registrationNumber`  |
| 메모           | Text  | `notes`               |

견적서 작성 폼의 "거래처 불러오기"(`client-picker.tsx`)로 조회되며, 선택 시 위 5개 필드를 견적서 폼에 그대로 채워 넣는다(Invoices ↔ Clients는 Notion Relation으로 연결되지 않음 — 견적서에는 값이 텍스트로 복사되어 저장된다).

### Templates (템플릿, Phase 3 신규)

| 속성명(Notion) | 타입  | 비고                                                                          |
| -------------- | ----- | ----------------------------------------------------------------------------- |
| 템플릿명       | Title | `name`                                                                        |
| 설명           | Text  | 선택, `description`                                                           |
| 품목           | Text  | **JSON 문자열**로 직렬화된 품목 배열(`TemplateItem[]`), 별도 Relation DB 없음 |

품목을 별도 DB로 분리하지 않은 이유: 템플릿 품목은 Notion에서 독립적으로 조회/Rollup 계산될 필요가 없고, "불러오기" 시 폼에 스냅샷으로 주입되는 용도일 뿐이라 5번째 DB를 만드는 비용이 더 크다고 판단했다(Phase 3 계획 결정). `mapPageToTemplate`(`src/lib/notion/mappers.ts`)이 `JSON.parse`를 try/catch로 감싸 파싱 실패 시 빈 배열로 폴백한다.

## 3. 알려진 스키마 드리프트 이력

- **Title ↔ Client Name 속성 스왑(Phase 2)**: Notion DB는 Title 타입 속성을 하나만 가질 수 있는데, 실제 워크스페이스에 "Client Name"이라는 이름의 속성이 Title 타입으로 만들어져 있었다(설계 문서와 불일치). 증상은 대시보드 제목/거래처명이 항상 빈 값으로 보이거나, 수정 저장 시 `"Title is not a property that exists..."` API 에러였다. 코드가 아니라 실제 Notion 워크스페이스 속성명을 설계에 맞게 수정(이름 변경 + 새 텍스트 속성 추가)해서 해결했다. **교훈**: Notion 워크스페이스 스키마는 배포 후에도 드리프트할 수 있으므로, 실데이터로 화면을 띄우기 전까지는 매핑 코드가 맞는다고 확신할 수 없다.
- 이 문제 때문에 신규 사용자가 DB를 직접 만들 때는 `docs/guides/notion-setup-guide.md`의 단계를 그대로 따르는 대신, 위 표의 정확한 속성명/타입을 기준으로 만드는 것을 권장한다.

## 4. Notion Integration 연결 시 주의사항 (내부 Integration 한계)

Notion 내부 Integration(비공개, OAuth 아님)은 Integration 설정 화면에 "Access" 탭이 없다 — 이는 공개/OAuth Integration에만 있는 기능이다. 대신 **각 데이터베이스 페이지의 "..." 메뉴 → "연결(Connections)"**에서 Integration을 개별적으로 연결해야 한다. 4개 DB(Invoices/Items/Clients/Templates) 전부 이 방식으로 따로 연결해야 하며, 하나라도 빠지면 `getNotionContext()`가 해당 DB 조회에 실패한다.

## 5. 성능/캐싱 전략 (Phase 5 검토 결과)

대시보드·거래처·템플릿 목록 페이지는 모두 `export const dynamic = 'force-dynamic'`으로 캐시 없이 매 요청마다 Notion API를 호출하고, mutation 후에는 `revalidatePath()`로 관련 경로를 갱신한다. 이 프로젝트가 겨냥하는 1인 사업가/프리랜서 규모(PRD 전제)에서는 동시 요청량이 낮아 캐싱으로 얻는 성능 이득보다 "저장 직후 화면에 최신 데이터가 안 보이는" 신선도 문제의 리스크가 더 크다고 판단해, **별도의 응답 캐싱 레이어(SWR, React Query, Next.js `revalidate` 초 단위 캐시 등)는 도입하지 않기로 결정했다.** 사용자 규모가 커지면 이 부분을 재검토 대상으로 남겨둔다.

이미지 최적화(`next/image`)는 현재 `src/` 전체에 이미지 사용처가 없어 적용 대상이 없다. `next.config.ts`의 `images.formats`(webp/avif)만 미리 설정해 두었고, 실제 이미지가 추가되면 그때 `next/image`로 전환하면 된다.
