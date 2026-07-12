# Notion 데이터베이스 스키마

**작성일**: 2026-07-02  
**업데이트**: 2026-07-07 (2-DB Relation 구조로 확정)  
**상태**: Phase 1 설계 (Notion 웹 DB 생성 완료 대기)

---

## 개요

Notion Invoice Management System에서는 Notion 워크스페이스에 2개의 독립적인 데이터베이스를 생성하여 사용합니다:

1. **Invoices** (견적서/청구서) - 견적서 및 거래처 정보 관리
2. **Items** (품목) - 견적서 내 품목 항목 관리 (Invoices와 Relation으로 연결)

각 데이터베이스는 Notion API로 조회/생성/수정/삭제 가능하며, Relation 속성으로 Invoices ↔ Items 간 관계를 유지합니다.

---

## 1. Invoices (견적서) 데이터베이스

**목적**: 견적서/청구서 데이터 및 거래처 정보 저장

**Notion 속성 구조**:

| 속성명               | 타입             | 필수 | 설명                     | 예시                   |
| -------------------- | ---------------- | ---- | ------------------------ | ---------------------- |
| Title                | Title            | ✅   | 견적서 제목 (유니크)     | "2026-07-INV-001"      |
| Client Name          | Text             | ✅   | 거래처 명칭              | "ABC 주식회사"         |
| Client Email         | Email            | ⭕   | 거래처 이메일            | "contact@abc.com"      |
| Client Phone         | Phone Number     | ⭕   | 거래처 연락처            | "02-1234-5678"         |
| Client Address       | Text             | ⭕   | 거래처 주소              | "서울시 강남구..."     |
| Client Registration# | Text             | ⭕   | 거래처 사업자등록번호    | "123-45-67890"         |
| Items                | Relation         | 자동 | Items DB 참조 (1:N)      | [Item 1, Item 2, ...]  |
| Total Amount         | Rollup (Sum)     | ✅   | 합계 (Items.Amount 합산) | 150000                 |
| Currency             | Select           | ✅   | 통화                     | "KRW" / "USD" / ...    |
| Status               | Select           | ✅   | 상태                     | "Draft" / "Sent" / ... |
| Due Date             | Date             | ⭕   | 기한                     | 2026-07-31             |
| Notes                | Text             | ⭕   | 메모                     | "선금 30% 요청"        |
| Created              | Created time     | 자동 | 생성 일시                |                        |
| Modified             | Last edited time | 자동 | 수정 일시                |                        |

**주의사항**:

- Title은 Notion의 기본 식별자 (유니크, 자동 생성)
- Client 관련 필드는 Invoice 내 직접 저장 (별도 DB 없음)
- Items는 Items DB와의 Relation으로 자동 역방향 참조
- Total Amount는 Notion의 Rollup(Sum) 속성으로 자동 계산 (서버 계산 불필요)

**Status 옵션**:

- `Draft` (초안): 작성 중
- `Sent` (발송): 고객에게 전달
- `Approved` (승인): 고객 승인
- `Paid` (완료): 결제 완료
- `Rejected` (거절): 거절됨
- `Cancelled` (취소): 취소됨

**Currency 옵션**:

- KRW (한국원)
- USD (미국달러)
- JPY (일본엔)
- EUR (유로)

---

## 2. Items (품목) 데이터베이스

**목적**: 각 견적서의 품목/서비스 항목 관리

**Notion 속성 구조**:

| 속성명      | 타입             | 필수 | 설명                         | 예시              |
| ----------- | ---------------- | ---- | ---------------------------- | ----------------- |
| Name        | Title            | ✅   | 품목/서비스명                | "상품 A"          |
| Invoice     | Relation         | ✅   | Invoices DB 참조 (N:1)       | INV-001           |
| Description | Text             | ⭕   | 상세 설명                    | "프리미엄 패키지" |
| Quantity    | Number           | ✅   | 수량                         | 2                 |
| Unit Price  | Number           | ✅   | 단가                         | 50000             |
| Tax Rate    | Number (%)       | ⭕   | 세율 (%)                     | 10                |
| Sort Order  | Number           | ⭕   | 견적서 내 순서               | 1                 |
| Amount      | Formula          | 자동 | 합계 (Quantity × Unit Price) | 100000            |
| Created     | Created time     | 자동 | 생성 일시                    |                   |
| Modified    | Last edited time | 자동 | 수정 일시                    |                   |

**주의사항**:

- Name은 Title (Notion 기본 식별자)
- Invoice Relation을 만들면 Invoices 쪽에 자동으로 역방향 "Items" Relation이 생성됨
- Amount는 Formula 속성 (`prop("Quantity") * prop("Unit Price")`)로 자동 계산
- Sort Order는 Notion Relation이 순서를 보장하지 않기 때문에, 품목 표시 순서 유지용으로 필요
- Tax Rate는 향후 세금 계산용으로 예약된 필드 (현재 사용 선택)

---

## 3. Relation 설정

### Items → Invoices (Many-to-One)

**설정 방법**:

1. Items DB의 "Invoice" 속성을 Relation 타입으로 생성
2. 대상: Invoices DB의 "Title" 속성
3. Notion은 자동으로 역방향 Relation 생성 (Invoices에 "Items" 속성 추가)

**동작**:

- Invoices DB의 Items 속성 → Items DB의 모든 레코드 조회 (Relation 필터)
- Items DB의 Invoice 속성 → 해당 Items이 속한 Invoice 조회
- 한 Invoice는 여러 Items를 가질 수 있음 (1:N)

**제약사항**:

- Items 삭제 시 Invoices는 유지 (참조 무결성 자동 처리)
- Notion Relation은 양방향이므로 역방향 쿼리도 가능하지만, API에서는 Relation 역방향을 별도로 조회할 수 없음 → 클라이언트 필터로 보완 필요

---

## 4. Computed Properties (자동 계산)

### Invoices의 Total Amount (Rollup)

Invoice의 Total Amount는 Notion **Rollup** 속성으로 정의:

- **Relation**: Items
- **Property to Rollup**: Amount (Items의 Formula 필드)
- **Function**: Sum
- **결과**: 모든 Items의 Amount 합계를 자동으로 계산

예시:

- Item 1: Amount = 50000
- Item 2: Amount = 100000
- **Invoice Total Amount** = 150000 (자동 계산)

**장점**:

- 서버에서 Total Amount를 별도로 계산/저장할 필요 없음
- Notion이 실시간으로 업데이트
- 데이터 불일치 방지

### Items의 Amount (Formula)

Item의 Amount는 Notion **Formula** 속성으로 정의:

```
prop("Quantity") * prop("Unit Price")
```

**장점**:

- 수량이나 단가 변경 시 자동으로 금액 재계산
- 서버 계산 불필요

---

## 5. 데이터 무결성

### Relation 무결성

- Notion API로 Item의 Invoice Relation을 변경하면, 해당 Invoice의 Items 속성이 자동으로 반영됨
- Item 삭제 시 Invoice의 Items 목록에서 자동으로 제거됨

### 계산 필드 의존성

- Items의 Amount 변경 → Invoices의 Total Amount 자동 반영
- Item 추가/삭제 → Invoices의 Total Amount 자동 업데이트

---

## 6. 구현 체크리스트

### Notion 웹 설정

- [x] Invoices DB 생성 (기본 Name/Title 속성)
- [ ] Invoices DB에 다음 속성 추가:
  - [ ] Client Name (Text)
  - [ ] Client Email (Email)
  - [ ] Client Phone (Phone Number)
  - [ ] Client Address (Text)
  - [ ] Client Registration# (Text)
  - [ ] Currency (Select: KRW, USD, JPY, EUR)
  - [ ] Status (Select: Draft, Sent, Approved, Paid, Rejected, Cancelled)
  - [ ] Due Date (Date)
  - [ ] Notes (Text)
- [x] Items DB 생성 (기본 Name/Title 속성)
- [ ] Items DB에 다음 속성 추가:
  - [ ] Invoice (Relation → Invoices)
  - [ ] Description (Text)
  - [ ] Quantity (Number)
  - [ ] Unit Price (Number)
  - [ ] Tax Rate (Number, %)
  - [ ] Sort Order (Number)
  - [ ] Amount (Formula: `prop("Quantity") * prop("Unit Price")`)
- [ ] Invoices DB에 Relation 역방향 확인:
  - [ ] Items 속성이 자동 생성됨 (역방향 Relation)
  - [ ] Relation 테스트 (Invoice ↔ Item 연결 확인)
- [ ] Invoices DB에 Total Amount (Rollup) 추가:
  - [ ] Relation: Items
  - [ ] Property: Amount
  - [ ] Function: Sum
  - [ ] 테스트 데이터로 자동 계산 확인

### API 검증

- [ ] Notion Integration Token 발급 (Workspace 관리자)
- [ ] Integration에 2개 DB에 대한 접근 권한 부여 (Share → Full access)
- [ ] Token으로 searchDatabases() API 호출 → 2개 DB 조회 확인
- [ ] 각 DB에서 queryDatabase() 호출 → 페이지 조회 확인

---

## 7. 알려진 제약사항 (Phase 2에서 검토 필요)

1. **Notion Relation 역방향 API 쿼리 불가**
   - Notion API는 역방향 Relation을 별도로 쿼리할 수 없음
   - 예: Items의 Invoice 필터로 "이 Invoice에 속한 Items 조회" 불가능
   - **해결책**: Invoices의 Items Relation 속성을 직접 조회 (역방향 필터 사용)

2. **Sort Order 필드 필요**
   - Notion Relation은 저장 순서를 보장하지 않음
   - 견적서 내 품목 표시 순서를 유지하려면 Sort Order (Number) 필드 필수
   - API 조회 시 Sort Order로 정렬 후 표시

3. **Tax Rate 활용 (향후)**
   - 현재는 저장만 하고 있음
   - 향후 세금 계산 기능 추가 시 활용 (예: 금액 = Quantity × Unit Price × (1 + Tax Rate))

---

## 8. 다음 단계

- **Phase 1 (지금)**: 이 스키마 대로 Notion 웹에서 DB 속성 설정 및 테스트
- **Phase 2**:
  - Notion API 클라이언트 초기화 (`src/lib/notion/client.ts`)
  - Invoice/Item 타입 정의 (`src/lib/notion/types.ts`)
  - 데이터 조회 함수 구현 (`src/lib/notion/queries.ts`)
- **Phase 3**: UI에서 Invoice/Item 조회 및 렌더링

---

**최종 확인**: 2026-07-07 업데이트 완료, Notion 웹 속성 설정 진행 중
