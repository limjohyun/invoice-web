---
name: notion-schema-2db-relation
description: invoice-web의 Notion 스키마 — Invoices/Items 2-DB Relation 구조와 자동 계산(Rollup/Formula) 필드 처리 원칙
metadata:
  type: project
---

invoice-web의 Notion 데이터 모델은 2개 DB의 Relation 구조다(원본: `docs/guides/notion-schema.md`).

- **Invoices**(견적서): Title(title), Client Name/Address/Registration#(rich_text), Client Email(email), Client Phone(phone_number), Currency/Status(select), Due Date(date), Notes(rich_text), Items(relation), **Total Amount(Rollup Sum)**, Created/Modified(자동).
- **Items**(품목): Name(title), Invoice(relation→Invoices, N:1), Description(rich_text), Quantity/Unit Price/Tax Rate/Sort Order(number), **Amount(Formula = Quantity×Unit Price)**, Created/Modified(자동).

**Why:** 금액 계산을 서버가 아니라 Notion이 담당한다. 데이터 불일치를 막기 위한 설계 결정이다.

**How to apply:**

- `Total Amount`(Rollup)와 `Amount`(Formula)는 **읽기 전용**. 생성/수정 요청 properties에 절대 포함하지 말 것(입력 타입 `CreateInvoiceInput`/`CreateItemInput`에 없음). 매핑 시 `rollup.number` / `formula.number`로 안전 추출.
- Notion Relation은 **역방향 API 쿼리 불가**. "이 견적서의 품목들"은 Items DB에서 `Invoice` relation에 `{ relation: { contains: invoiceId } }` 필터로 조회한다(`queryItemsByInvoice`).
- Relation은 순서를 보장하지 않으므로 품목 표시 순서는 `Sort Order`(number)로 정렬.
- 속성 이름 문자열은 스키마와 정확히 일치해야 함(예: `'Client Registration#'`에 `#` 포함). 매퍼/빌더는 `src/lib/notion/{mappers,queries}.ts`에 하드코딩되어 있음.

관련: [[notion-sdk-v5-patterns]]
