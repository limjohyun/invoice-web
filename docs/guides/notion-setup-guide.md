# Notion 데이터베이스 설정 가이드

**난이도**: 초급 ~ 중급  
**소요 시간**: 약 20분  
**필요한 것**: Notion 계정 (무료 가능)

> 이 가이드는 Phase 1 T1 작업 완료를 위한 단계별 설명입니다.
>
> **현재 상황**: 사용자가 이미 Notion에 "invoice", "items" 2개의 DB를 만들었으므로, 이 가이드는 각 DB에 **필요한 속성 추가**에 집중합니다.

---

## 📌 사전 준비

1. **Notion 계정**: https://www.notion.so (기존 계정 사용)
2. **Notion 워크스페이스**: 이미 생성됨
3. **웹 브라우저**: Chrome, Firefox, Safari 등
4. **기존 DB**: "invoice", "items" 2개 DB 생성 완료 상태

---

## 1️⃣ Invoices (invoice) DB 속성 추가

Invoices DB에 거래처 정보 및 선택/계산 필드를 추가합니다.

### Step 1.1: Invoices DB 열기

```
Notion 워크스페이스에서 "invoice" DB 클릭하여 열기
```

**현재 상태**: Title 속성만 있을 것으로 예상

### Step 1.2: 거래처(Client) 관련 속성 추가

#### 1. Client Name (Text, 필수)

```
1. 테이블 우측 끝의 "+" 버튼 클릭 → "Add a property"
2. 속성 이름 입력: "Client Name"
3. 속성 타입: "Text"
4. Enter
```

#### 2. Client Email (Email, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Client Email"
3. 속성 타입: "Email"
4. Enter
```

#### 3. Client Phone (Phone Number, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Client Phone"
3. 속성 타입: "Phone Number"
4. Enter
```

#### 4. Client Address (Text, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Client Address"
3. 속성 타입: "Text"
4. Enter
```

#### 5. Client Registration# (Text, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Client Registration#"
3. 속성 타입: "Text"
4. Enter
```

### Step 1.3: 거래처별 선택 속성 추가

#### 6. Currency (Select, 필수)

```
1. "+" → "Add a property"
2. 속성 이름: "Currency"
3. 속성 타입: "Select"
4. 옵션 추가 (각각 + 버튼으로):
   - KRW
   - USD
   - JPY
   - EUR
5. Enter
```

#### 7. Status (Select, 필수)

```
1. "+" → "Add a property"
2. 속성 이름: "Status"
3. 속성 타입: "Select"
4. 옵션 추가:
   - Draft (회색)
   - Sent (파란색)
   - Approved (초록색)
   - Paid (초록색 진함)
   - Rejected (빨간색)
   - Cancelled (회색)
5. Enter
```

#### 8. Due Date (Date, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Due Date"
3. 속성 타입: "Date"
4. "Include time" 체크 안 함 (날짜만 필요)
5. Enter
```

#### 9. Notes (Text, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Notes"
3. 속성 타입: "Text"
4. Enter
```

**Step 1.3 완료 상태**:

```
┌────────┬─────────────┬───────────┬─────────────┬────────────────┬──────────┬─────────┬──────┐
│ Title  │ Client Name │ Email     │ Phone       │ Address        │ Reg. #   │ Currency│Status│
├────────┼─────────────┼───────────┼─────────────┼────────────────┼──────────┼─────────┼──────┤
│        │             │           │             │                │          │         │      │
└────────┴─────────────┴───────────┴─────────────┴────────────────┴──────────┴─────────┴──────┘
```

---

## 2️⃣ Items DB 속성 추가

이제 Items DB에 Invoice 참조 및 계산 필드를 추가합니다.

### Step 2.1: Items DB 열기

```
Notion 워크스페이스에서 "items" DB 클릭하여 열기
```

**현재 상태**: Title 속성만 있을 것으로 예상

### Step 2.2: Invoice Relation 추가 (중요!)

```
1. "+" → "Add a property"
2. 속성 이름: "Invoice"
3. 속성 타입: "Relation"
4. "Relation to" 드롭다운:
   - Database 선택: "invoice" (Invoices DB)
   - Property 선택: "Title" (기본값)
5. "Create relation" 클릭
```

**결과 확인**:

- Items DB의 "Invoice" 속성 생성됨
- Invoices DB에 자동으로 "Items" 역방향 Relation 속성 생성됨 ✅

### Step 2.3: 품목 정보 속성 추가

#### 1. Description (Text, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Description"
3. 속성 타입: "Text"
4. Enter
```

#### 2. Quantity (Number, 필수)

```
1. "+" → "Add a property"
2. 속성 이름: "Quantity"
3. 속성 타입: "Number"
4. (선택) 숫자 형식: 정수로 설정
5. Enter
```

#### 3. Unit Price (Number, 필수)

```
1. "+" → "Add a property"
2. 속성 이름: "Unit Price"
3. 속성 타입: "Number"
4. (선택) 숫자 형식: 통화(KRW) 설정 가능
5. Enter
```

#### 4. Tax Rate (Number, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Tax Rate"
3. 속성 타입: "Number"
4. (선택) 숫자 형식: 백분율(%) 설정
5. Enter
```

#### 5. Sort Order (Number, 선택)

```
1. "+" → "Add a property"
2. 속성 이름: "Sort Order"
3. 속성 타입: "Number"
4. Enter
```

### Step 2.4: 자동 계산 필드 추가

#### 6. Amount (Formula, 자동)

```
1. "+" → "Add a property"
2. 속성 이름: "Amount"
3. 속성 타입: "Formula"
4. 수식 입력:
   prop("Quantity") * prop("Unit Price")
5. Enter
```

**결과**: Item의 수량 × 단가가 자동으로 계산됨 ✅

**Step 2.4 완료 상태**:

```
┌────────┬──────────┬─────────────┬───────────────┬──────────┬──────────┬─────────────┬────────┐
│ Title  │ Invoice  │ Description │ Quantity      │ UnitPrc  │ TaxRate  │ SortOrder   │Amount  │
├────────┼──────────┼─────────────┼───────────────┼──────────┼──────────┼─────────────┼────────┤
│        │          │             │               │          │          │             │        │
└────────┴──────────┴─────────────┴───────────────┴──────────┴──────────┴─────────────┴────────┘
```

---

## 3️⃣ Invoices DB에 Rollup 추가 (합계 자동 계산)

이제 Invoices DB에 Total Amount를 Rollup으로 추가하면, Items의 Amount 합계가 자동으로 계산됩니다.

### Step 3.1: Invoices DB로 돌아가기

```
Notion 워크스페이스에서 "invoice" DB 클릭
```

### Step 3.2: Total Amount (Rollup) 추가

```
1. "+" → "Add a property"
2. 속성 이름: "Total Amount"
3. 속성 타입: "Rollup" (또는 "Relation" 다음 드롭다운에서 찾기)
4. 다음 설정:
   - "Relation to rollup": Items
   - "Property to rollup": Amount (Items의 Formula 필드)
   - "Function": Sum
5. Enter
```

**결과 확인**:

```
새로운 Invoice를 만들고 Items 몇 개를 연결하면,
Total Amount가 자동으로 Items의 Amount 합계를 표시합니다 ✅
```

**예시**:

- Item 1: Amount = 50,000
- Item 2: Amount = 100,000
- **Invoice Total Amount** = 150,000 (자동 계산)

---

## 4️⃣ 테스트 데이터 추가

이제 실제로 작동하는지 테스트해봅니다.

### Step 4.1: Invoices DB에 테스트 견적서 추가

```
1. Invoices DB에서 첫 번째 빈 행 클릭
2. Title 입력: "2026-07-INV-001"
3. Tab 또는 우측 화살표로 다음 필드로 이동
4. 각 필드 입력:
   - Client Name: "테스트 회사"
   - Client Email: "test@company.com"
   - Client Phone: "02-1234-5678"
   - Client Address: "서울시 강남구 테스트로 123"
   - Client Registration#: "123-45-67890"
   - Currency: "KRW"
   - Status: "Draft"
   - Due Date: "2026-07-31"
   - Notes: "테스트 견적서"
5. Enter로 저장
```

### Step 4.2: Items DB에 테스트 품목 추가

```
1. Items DB에서 첫 번째 빈 행 클릭
2. Name 입력: "상품 A"
3. 다음 필드로 이동:
   - Invoice: "2026-07-INV-001" 선택 (Relation)
   - Description: "프리미엄 패키지"
   - Quantity: "2"
   - Unit Price: "50000"
   - Tax Rate: "10" (%)
   - Sort Order: "1"
4. Amount는 자동으로 계산됨 (2 × 50000 = 100000) ✅
5. Enter로 저장
```

### Step 4.3: 더 많은 품목 추가 (선택)

```
1. Items DB에서 두 번째 품목 추가
   - Name: "상품 B"
   - Invoice: "2026-07-INV-001" (동일 Invoice)
   - Quantity: "1"
   - Unit Price: "100000"
   - Sort Order: "2"
2. Amount 자동 계산: 1 × 100000 = 100000 ✅
```

### Step 4.4: Invoices DB에서 합계 확인

```
1. Invoices DB에서 "2026-07-INV-001" 행 확인
2. Total Amount 필드 보기:
   → "200000" 표시됨 (100000 + 100000) ✅
```

---

## 5️⃣ Notion API Integration 설정

이제 API로 이 DB들을 제어하기 위해 Integration을 설정합니다.

### Step 5.1: Notion Integrations 페이지 열기

```
1. https://www.notion.so/my-integrations 접속
2. 또는 Notion 로그인 후 우상단 프로필 → "Connections" → "Develop or manage integrations"
```

### Step 5.2: 새로운 Integration 생성 (또는 기존 확인)

```
1. "+ Create new integration" 클릭 (없으면 스킵)
2. Name: "Invoice Web"
3. Associated workspace: 현재 워크스페이스 선택
4. "Submit" 클릭
```

### Step 5.3: Integration Token 확인

```
1. "Secrets" 섹션 찾기
2. "Internal Integration Token" 옆의 "Show" 클릭
3. 표시된 토큰 복사 (noti_로 시작)
4. 안전한 곳에 저장
```

**토큰 예시**:

```
noti_1234567890abcdef1234567890abcdef1234567
```

### Step 5.4: 각 DB에 접근 권한 부여

#### Invoices DB에 권한 부여

```
1. Invoices DB 페이지에서 우상단 "Share" 클릭
2. "Invite" 섹션에서 "Invoice Web" Integration 검색
3. "Full access" 권한 선택
4. "Invite" 클릭
```

#### Items DB에 권한 부여

```
1. Items DB 페이지에서 우상단 "Share" 클릭
2. "Invoice Web" Integration 추가 → "Full access"
```

---

## 6️⃣ 데이터베이스 ID 확인 및 저장

### Step 6.1: Invoices DB ID 복사

```
1. Invoices DB 페이지 열기
2. 브라우저 주소창 확인:
   https://notion.so/workspace/{DATABASE_ID}?v=...
3. DATABASE_ID 부분 복사 (/ 뒤의 32자리, 하이픈 제외)

예: abc123def456abc123def456abc123d1
```

### Step 6.2: Items DB ID 복사

```
Items DB 주소에서 동일하게 ID 추출
```

### Step 6.3: `.env.local`에 저장

```env
# Notion API Token (Step 5.3에서 복사한 값)
NOTION_API_KEY=noti_1234567890abcdef1234567890abcdef1234567

# 데이터베이스 ID (Step 6에서 확인한 값)
NOTION_INVOICES_DB_ID=abc123def456abc123def456abc123d1
NOTION_ITEMS_DB_ID=abc123def456abc123def456abc123d2
```

**저장**: Ctrl+S (또는 Cmd+S)

---

## ✅ 검증 체크리스트

모두 완료되었는지 확인해주세요:

### DB 속성 추가

- [ ] **Invoices DB**
  - [ ] Client Name (Text)
  - [ ] Client Email (Email)
  - [ ] Client Phone (Phone Number)
  - [ ] Client Address (Text)
  - [ ] Client Registration# (Text)
  - [ ] Currency (Select: KRW/USD/JPY/EUR)
  - [ ] Status (Select: Draft/Sent/Approved/Paid/Rejected/Cancelled)
  - [ ] Due Date (Date)
  - [ ] Notes (Text)
  - [ ] Total Amount (Rollup)

- [ ] **Items DB**
  - [ ] Invoice (Relation → Invoices)
  - [ ] Description (Text)
  - [ ] Quantity (Number)
  - [ ] Unit Price (Number)
  - [ ] Tax Rate (Number, %)
  - [ ] Sort Order (Number)
  - [ ] Amount (Formula: `prop("Quantity") * prop("Unit Price")`)

### Relation 설정

- [ ] Items의 "Invoice" Relation이 Invoices DB를 참조
- [ ] Invoices에 자동으로 "Items" 역방향 Relation 생성됨
- [ ] Relation 테스트: Invoice ↔ Item 연결 확인

### 자동 계산

- [ ] Items의 Amount가 Formula로 자동 계산됨
- [ ] Invoices의 Total Amount가 Rollup으로 자동 계산됨
- [ ] 테스트: Item 수량/가격 변경 → Amount 업데이트 → Total Amount 업데이트

### Integration 설정

- [ ] "Invoice Web" Integration 생성 (또는 확인)
- [ ] Integration Token 복사 (noti\_로 시작)
- [ ] 2개 DB 모두에 "Full access" 권한 부여됨

### 환경 변수

- [ ] `.env.local`에 NOTION_API_KEY 입력
- [ ] `.env.local`에 NOTION_INVOICES_DB_ID 입력
- [ ] `.env.local`에 NOTION_ITEMS_DB_ID 입력
- [ ] 파일 저장됨

---

## 🆘 문제 해결

### Q: Relation을 만들었는데 Invoices에 역방향이 안 보여요

**A**:

```
1. Invoices DB 새로고침 (F5)
2. 테이블 우측 스크롤해서 속성 목록 확인
3. Items 속성이 있어야 함 (자동 생성)
```

### Q: Formula가 계산되지 않습니다

**A**:

```
1. Amount Formula 문법 다시 확인:
   prop("Quantity") * prop("Unit Price")
2. Quantity, Unit Price 필드명 정확한지 확인
3. 필드 타입이 Number인지 확인
4. Notion 새로고침 (F5)
```

### Q: Rollup 합계가 0이거나 나오지 않습니다

**A**:

```
1. Rollup 설정 확인:
   - Relation: Items (정확한지 확인)
   - Property: Amount (Items의 Formula 필드)
   - Function: Sum
2. Items DB에 테스트 데이터가 있는지 확인
3. Item에서 Invoice Relation이 제대로 연결되었는지 확인
4. Notion 새로고침 (F5)
```

### Q: Integration Token이 보이지 않습니다

**A**:

```
1. Notion 로그인 확인
2. https://www.notion.so/my-integrations 다시 접속
3. "Invoice Web" Integration 클릭
4. "Secrets" 섹션에서 "Show" 버튼 클릭
```

### Q: Integration이 DB에 접근 불가입니다

**A**:

```
1. 각 DB의 "Share" 클릭
2. "Invoice Web" Integration 초대 확인
3. 권한이 "Full access"인지 확인
4. Notion 새로고침 (F5)
```

---

## 🎉 완료!

축하합니다! 이제:

- ✅ Invoices & Items DB 속성 설정 완료
- ✅ Relation & 자동 계산 설정 완료
- ✅ Integration 설정 완료
- ✅ API 접근 가능 상태

**다음 단계**: `.env.local`에 API 키를 입력했으면, 서버 API 구현을 시작할 수 있습니다! 🚀

---

**최종 확인**:

- Invoices & Items DB 속성 모두 추가했나요?
- Relation과 자동 계산이 정상 작동하나요?
- API 토큰과 DB ID를 `.env.local`에 입력했나요?
- `.env.local` 파일이 저장되었나요?

완료하셨으면 알려주세요! 👍
