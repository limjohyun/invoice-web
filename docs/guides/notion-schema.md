# Notion 데이터베이스 스키마

**작성일**: 2026-07-02  
**상태**: Phase 1 설계 스파이크 (검증 완료 대기)

---

## 개요

Notion Invoice Management System에서는 Notion 워크스페이스에 3개의 독립적인 데이터베이스를 생성하여 사용합니다:

1. **Clients** (거래처) - 고객 정보 관리
2. **Invoices** (견적서) - 견적서/청구서 관리
3. **Templates** (템플릿) - 재사용 가능한 견적서 템플릿

각 데이터베이스는 Notion API로 조회/생성/수정/삭제 가능하며, Relation 속성으로 데이터 간 연관관계를 유지합니다.

---

## 1. Clients (거래처) 데이터베이스

**목적**: 거래처(고객) 정보 저장

**Notion 속성 구조**:

| 속성명              | 타입             | 필수 | 설명               | 예시               |
| ------------------- | ---------------- | ---- | ------------------ | ------------------ |
| Name                | Title            | ✅   | 거래처 명칭 (고유) | "ABC 주식회사"     |
| Email               | Email            | ⭕   | 거래처 이메일      | "contact@abc.com"  |
| Phone               | Phone Number     | ⭕   | 연락처             | "02-1234-5678"     |
| Address             | Text             | ⭕   | 주소               | "서울시 강남구..." |
| Registration Number | Text             | ⭕   | 사업자 등록번호    | "123-45-67890"     |
| Notes               | Text             | ⭕   | 메모               | "VIP 고객"         |
| Created             | Created time     | 자동 | 생성 일시          |                    |
| Modified            | Last edited time | 자동 | 수정 일시          |                    |

**주의사항**:

- Name(Title)은 Notion의 기본 식별자 (유니크, 자동 생성)
- 모든 텍스트 필드는 Optional (선택사항)
- Created/Modified는 자동으로 관리됨

---

## 2. Invoices (견적서) 데이터베이스

**목적**: 견적서/청구서 데이터 저장 (실제 거래 기록)

**Notion 속성 구조**:

| 속성명       | 타입             | 필수 | 설명                    | 예시                                       |
| ------------ | ---------------- | ---- | ----------------------- | ------------------------------------------ |
| Title        | Title            | ✅   | 견적서 제목 (ID로 사용) | "2026-07-INV-001"                          |
| Client       | Relation         | ✅   | Clients DB 참조         | (ABC 주식회사 선택)                        |
| Items (JSON) | Rich text        | ✅   | 품목 정보 (JSON 직렬화) | `[{"name":"상품1","qty":2,"price":50000}]` |
| Total Amount | Number           | ✅   | 총액 (원)               | 100000                                     |
| Currency     | Select           | ✅   | 통화                    | "KRW" / "USD"                              |
| Status       | Select           | ✅   | 상태                    | "Draft" / "Sent" / "Paid" / "Rejected"     |
| Due Date     | Date             | ⭕   | 기한                    | 2026-07-31                                 |
| Notes        | Text             | ⭕   | 메모                    | "선금 30% 요청"                            |
| Created      | Created time     | 자동 | 생성 일시               |                                            |
| Modified     | Last edited time | 자동 | 수정 일시               |                                            |
| Last Synced  | Date             | ⭕   | 마지막 동기화 시간      | (서버에서 관리)                            |

**Items JSON 스키마**:

```json
[
  {
    "id": "uuid",
    "name": "상품 또는 서비스명",
    "description": "설명",
    "quantity": 1,
    "unitPrice": 50000,
    "total": 50000
  }
]
```

**Status 옵션**:

- `Draft` (초안): 작성 중
- `Sent` (발송): 고객에게 전달
- `Approved` (승인): 고객 승인
- `Paid` (완료): 결제 완료
- `Rejected` (거절): 거절됨
- `Cancelled` (취소): 취소됨

**주의사항**:

- Items는 JSON 직렬화로 저장 (Notion에는 배열 타입이 없으므로)
- Total Amount는 계산 필드로 관리 가능 (선택사항)
- Client Relation은 Clients DB의 Name으로 참조
- Status 선택지는 사용자 정의 가능

---

## 3. Templates (템플릿) 데이터베이스

**목적**: 재사용 가능한 견적서 템플릿 저장

**Notion 속성 구조**:

| 속성명           | 타입             | 필수 | 설명                  | 예시                                      |
| ---------------- | ---------------- | ---- | --------------------- | ----------------------------------------- |
| Name             | Title            | ✅   | 템플릿 명칭           | "표준 용역료 견적서"                      |
| Description      | Text             | ⭕   | 템플릿 설명           | "일반적인 용역료 계산 용도"               |
| Items (JSON)     | Rich text        | ✅   | 기본 품목 정보 (JSON) | `[{"name":"기본상품","qty":1,"price":0}]` |
| Default Currency | Select           | ⭕   | 기본 통화             | "KRW"                                     |
| Category         | Select           | ⭕   | 템플릿 분류           | "Service" / "Product" / "Custom"          |
| Is Public        | Checkbox         | ⭕   | 공개 여부             | true / false                              |
| Created          | Created time     | 자동 | 생성 일시             |                                           |
| Modified         | Last edited time | 자동 | 수정 일시             |                                           |

**Category 옵션**:

- `Service` (용역)
- `Product` (물품)
- `Custom` (맞춤)

**주의사항**:

- 템플릿의 Items는 초기값으로 제공 (사용자가 견적서 작성 시 수정)
- Category는 사용자 정의 가능

---

## 4. Relation & 데이터 무결성

### Invoices → Clients (Many-to-One)

**설정 방법**:

1. Invoices DB의 "Client" 속성을 Relation 타입으로 생성
2. 대상: Clients DB의 "Name" 속성
3. Notion은 자동으로 역방향 Relation 생성 (Clients에 "Invoices" 속성 추가)

**제약사항**:

- Invoices 삭제 시 Clients는 유지 (참조 무결성 자동 처리)
- Notion에는 CASCADE DELETE가 없으므로 애플리케이션에서 관리 필요

### Templates ↔ Invoices (선택사항)

향후 확장 시:

- Invoices의 "Template" 속성으로 사용된 템플릿 추적 가능
- 현재 Phase 1에서는 미사용

---

## 5. 데이터 표현 방식 결정

### Items (품목 데이터) 저장 방식

**선택사항 1: JSON 직렬화** (최종 선택 ✅)

```json
// Notion 속성: Rich text
[
  {
    "id": "item-001",
    "name": "상품1",
    "quantity": 2,
    "unitPrice": 50000,
    "taxRate": 0.1
  }
]
```

**장점**:

- 확장 가능 (버전 필드 추가 가능)
- JSON 스키마 진화 여지 있음
- 타입 안전성 (TypeScript 타입 정의 가능)

**단점**:

- Notion에서 직접 조회/편집 불편
- 파싱 필요

**선택사항 2: 하위 블록 (미선택)**

- 장점: Notion UI에서 시각적 관리
- 단점: API 복잡도 높음, 동기화 어려움

---

## 6. 구현 체크리스트

### Notion 웹 설정

- [ ] Notion 워크스페이스 접근 확인
- [ ] **Clients** DB 생성
  - [ ] Name (Title), Email, Phone, Address, Registration Number, Notes 속성 생성
  - [ ] 1개 테스트 레코드 생성 (예: "테스트 회사")
- [ ] **Invoices** DB 생성
  - [ ] Title, Client (Relation), Items (Rich text), Total Amount, Currency, Status, Due Date, Notes, Last Synced 속성 생성
  - [ ] Status Select 옵션 설정: Draft, Sent, Approved, Paid, Rejected, Cancelled
  - [ ] Client Relation 설정 → Clients DB 연결
  - [ ] 1개 테스트 레코드 생성 (예: 위의 테스트 회사와 연결)
- [ ] **Templates** DB 생성
  - [ ] Name (Title), Description, Items, Default Currency, Category, Is Public 속성 생성
  - [ ] Category Select 옵션 설정: Service, Product, Custom
  - [ ] 1개 테스트 템플릿 생성

### API 검증

- [ ] Notion Integration Token 발급 (Workspace 관리자)
- [ ] Integration에 3개 DB에 대한 접근 권한 부여
- [ ] Token으로 searchDatabases() API 호출 → 3개 DB 조회 확인
- [ ] 각 DB에서 queryDatabase() 호출 → 테스트 레코드 조회 확인

---

## 7. 알려진 제약사항 (Phase 2에서 검토 필요)

1. **Relation 양방향 쿼리**
   - Notion API는 역방향 Relation을 별도로 쿼리 불가
   - 예: Client의 "Invoices" 역방향 관계 조회 안 됨 → Client별 Invoice 목록은 Client Relation 필터로 역으로 조회 필요

2. **Items 배열 확장**
   - 향후 품목별 세금율, 할인율 등 추가 시 JSON 스키마 진화 필요
   - 현재 design에는 버전 필드 미포함 → Phase 2에서 추가 검토

3. **Computed Properties 부재**
   - Notion에는 자동 계산 필드 제한적
   - Total Amount는 서버에서 계산 후 저장 (Notion의 Formula 속성은 읽기 전용이므로 부적절)

4. **Rate Limit**
   - Notion API: 초당 3개 요청
   - Phase 2 CRUD 구현 시 큐잉/재시도 로직 필수

---

## 8. 다음 단계

- **Phase 1 (지금)**: 이 스키마 대로 Notion 웹에서 DB 생성 및 검증
- **Phase 2**: src/lib/notion/mappers.ts에서 Notion 응답 ↔ TypeScript 타입 매핑 구현
- **Phase 3**: PDF 생성 시 Items JSON 파싱 및 렌더링

---

**최종 확인**: 2026-07-02 작성 완료, Notion 웹 생성 대기
