# Notion 데이터베이스 생성 가이드

**난이도**: 초급  
**소요 시간**: 약 15분  
**필요한 것**: Notion 계정 (무료 가능)

> 이 가이드는 Phase 1 T1 작업 완료를 위한 단계별 설명입니다.

---

## 📌 사전 준비

1. **Notion 계정 생성**: https://www.notion.so
2. **Notion 워크스페이스 생성** (또는 기존 워크스페이스 사용)
3. **웹 브라우저**: Chrome, Firefox, Safari 등

---

## 1️⃣ Notion 접속 및 워크스페이스 열기

### Step 1.1: Notion 로그인

```
1. https://www.notion.so 접속
2. "Log in" 클릭
3. 이메일/비밀번호 또는 Google/Apple 로그인
4. 워크스페이스 선택
```

**결과**: Notion 대시보드 화면

---

## 2️⃣ 첫 번째 DB 생성: Clients (거래처)

### Step 2.1: 새로운 데이터베이스 생성

```
1. Notion 왼쪽 사이드바 아래쪽 "+ Add a page" 클릭
2. "Database" 선택
3. "Table" 선택 (가장 기본 형태)
```

**화면 예시**:

```
┌─────────────────────────────┐
│ + Add a page                │
│                             │
│ ─ Database                  │
│    └─ Table (선택)          │
│    └─ Board                 │
│    └─ Calendar              │
│    └─ Gallery               │
│    └─ Timeline              │
└─────────────────────────────┘
```

### Step 2.2: 데이터베이스 이름 설정

```
1. "Untitled" 텍스트 클릭
2. 이름 입력: "Clients"
3. Enter 누르기
```

**결과**: 빈 테이블 생성

### Step 2.3: 속성(컬럼) 추가하기

기본으로 "Name"(Title) 속성이 있습니다. 추가 속성을 만들어야 합니다.

#### 📝 Email 속성 추가

```
1. 테이블 우측 끝에 "+" 버튼 클릭 → "Add a property"
2. 속성 이름 입력: "Email"
3. 속성 타입 선택: "Email" (드롭다운에서 찾기)
4. Enter 누르기
```

**속성 타입 찾기 팁**:

```
Text, Email, Number, Select, Multi-select, Date, Checkbox,
Phone Number, URL, Relation, Rollup...
```

#### 📞 Phone 속성 추가

```
1. "+" 버튼 → "Add a property"
2. 속성 이름: "Phone"
3. 속성 타입: "Phone Number"
4. Enter 누르기
```

#### 📍 Address 속성 추가

```
1. "+" 버튼 → "Add a property"
2. 속성 이름: "Address"
3. 속성 타입: "Text"
4. Enter 누르기
```

#### 🔢 Registration Number 속성 추가

```
1. "+" 버튼 → "Add a property"
2. 속성 이름: "Registration Number"
3. 속성 타입: "Text"
4. Enter 누르기
```

#### 📌 Notes 속성 추가

```
1. "+" 버튼 → "Add a property"
2. 속성 이름: "Notes"
3. 속성 타입: "Text"
4. Enter 누르기
```

**완료 상태**:

```
┌──────────┬────────┬───────┬─────────┬────────────────┬────────┐
│ Name     │ Email  │ Phone │ Address │ Registration # │ Notes  │
├──────────┼────────┼───────┼─────────┼────────────────┼────────┤
│          │        │       │         │                │        │
└──────────┴────────┴───────┴─────────┴────────────────┴────────┘
```

### Step 2.4: 테스트 레코드 추가

```
1. 첫 번째 빈 행의 "Name" 클릭
2. 회사명 입력: "테스트 주식회사"
3. Tab 키 또는 우측 화살표로 다음 칸으로 이동
4. 각 필드에 샘플 데이터 입력:
   - Email: test@example.com
   - Phone: 02-1234-5678
   - Address: 서울시 강남구 테스트로 123
   - Registration Number: 123-45-67890
   - Notes: 첫 번째 테스트 거래처
5. Enter로 저장
```

**✅ Clients DB 완료!**

---

## 3️⃣ 두 번째 DB 생성: Invoices (견적서)

### Step 3.1: 데이터베이스 생성

```
1. "+ Add a page" → "Database" → "Table"
2. 이름: "Invoices"
```

### Step 3.2: 속성 추가 (기본 Title 속성 유지)

테이블에 다음 속성들을 추가합니다:

#### 🤝 Client (Relation 속성)

```
1. "+" 버튼 → "Add a property"
2. 속성 이름: "Client"
3. 속성 타입: "Relation" (스크롤 내려서 찾기)
4. "Relation to" 선택:
   - 오른쪽 드롭다운에서 "Clients" 선택
   - "Name" 선택 (기본값 유지)
5. "Create relation" 클릭
```

**결과**:

- Invoices DB의 "Client" 속성 생성
- Clients DB에 자동으로 역방향 "Invoices" 속성 추가됨

#### 📦 Items (JSON 저장용)

```
1. "+" → "Add a property"
2. 속성 이름: "Items"
3. 속성 타입: "Rich text"
4. 클릭하여 저장
```

#### 💰 Total Amount

```
1. "+" → "Add a property"
2. 속성 이름: "Total Amount"
3. 속성 타입: "Number"
4. (옵션) 아래의 "Number format"에서 통화 선택: "KRW (₩)"
```

#### 🌍 Currency

```
1. "+" → "Add a property"
2. 속성 이름: "Currency"
3. 속성 타입: "Select"
4. 옵션 추가 (버튼으로 추가):
   - KRW
   - USD
   - JPY
   - EUR
   (색상은 자동 할당됨)
```

#### 📊 Status

```
1. "+" → "Add a property"
2. 속성 이름: "Status"
3. 속성 타입: "Select"
4. 옵션 추가:
   - Draft (회색)
   - Sent (파란색)
   - Approved (초록색)
   - Paid (초록색 짙게)
   - Rejected (빨간색)
   - Cancelled (회색)
```

#### 📅 Due Date

```
1. "+" → "Add a property"
2. 속성 이름: "Due Date"
3. 속성 타입: "Date"
4. (선택) "Include time" 체크 안 함 (날짜만 필요)
```

#### 📝 Notes

```
1. "+" → "Add a property"
2. 속성 이름: "Notes"
3. 속성 타입: "Text"
```

#### 🕐 Last Synced (선택사항)

```
1. "+" → "Add a property"
2. 속성 이름: "Last Synced"
3. 속성 타입: "Date"
4. "Include time" 체크 (시간까지 표시)
```

**완료 상태**:

```
┌──────────┬────────┬────────┬──────────┬──────────┬────────┬──────────┬────────┐
│ Title    │ Client │ Items  │ Total    │ Currency │ Status │ Due Date │ Notes  │
├──────────┼────────┼────────┼──────────┼──────────┼────────┼──────────┼────────┤
│          │        │        │          │          │        │          │        │
└──────────┴────────┴────────┴──────────┴──────────┴────────┴──────────┴────────┘
```

### Step 3.3: 테스트 레코드 추가

```
1. Title 입력: "2026-07-INV-001"
2. Client 클릭:
   → 팝업에서 "Clients" DB에서 생성한 거래처 선택
   → "테스트 주식회사" 선택
3. Items: 아래 샘플 JSON 입력:
   [{"name":"상품1","qty":2,"price":50000}]
4. Total Amount: 100000
5. Currency: KRW
6. Status: Draft
7. Due Date: 2026-07-31 (또는 원하는 날짜)
8. Notes: 테스트 견적서
9. Enter로 저장
```

**✅ Invoices DB 완료!**

---

## 4️⃣ 세 번째 DB 생성: Templates (템플릿)

### Step 4.1: 데이터베이스 생성

```
1. "+ Add a page" → "Database" → "Table"
2. 이름: "Templates"
```

### Step 4.2: 속성 추가

#### 📝 Name (기본 Title)

기본으로 있음 (그대로 유지)

#### 📄 Description

```
1. "+" → "Add a property"
2. 속성 이름: "Description"
3. 속성 타입: "Text"
```

#### 📦 Items (JSON)

```
1. "+" → "Add a property"
2. 속성 이름: "Items"
3. 속성 타입: "Rich text"
```

#### 🌍 Default Currency

```
1. "+" → "Add a property"
2. 속성 이름: "Default Currency"
3. 속성 타입: "Select"
4. 옵션: KRW, USD, JPY, EUR
```

#### 🏷️ Category

```
1. "+" → "Add a property"
2. 속성 이름: "Category"
3. 속성 타입: "Select"
4. 옵션:
   - Service (파란색)
   - Product (초록색)
   - Custom (주황색)
```

#### ✅ Is Public

```
1. "+" → "Add a property"
2. 속성 이름: "Is Public"
3. 속성 타입: "Checkbox"
```

**완료 상태**:

```
┌──────────┬────────────┬────────┬────────────┬──────────┬──────────┐
│ Name     │ Description│ Items  │ Def. Curr. │ Category │ Is Public│
├──────────┼────────────┼────────┼────────────┼──────────┼──────────┤
│          │            │        │            │          │          │
└──────────┴────────────┴────────┴────────────┴──────────┴──────────┘
```

### Step 4.3: 테스트 템플릿 추가

```
1. Name: "표준 서비스 템플릿"
2. Description: "일반적인 서비스 제공용"
3. Items: [{"name":"기본 서비스","qty":1,"price":0}]
4. Default Currency: KRW
5. Category: Service
6. Is Public: 체크 (선택)
7. Enter로 저장
```

**✅ Templates DB 완료!**

---

## 5️⃣ Notion API Integration 설정

이제 API로 이 DB들을 제어하기 위해 Integration을 등록해야 합니다.

### Step 5.1: Notion Integrations 페이지 열기

```
1. https://www.notion.so/my-integrations 접속
2. 또는 Notion 로그인 후 우상단 프로필 → "Connections" → "Develop or manage integrations"
```

### Step 5.2: 새로운 Integration 생성

```
1. "+ Create new integration" 클릭
2. Name: "Invoice Web"
3. Associated workspace: 현재 워크스페이스 선택
4. Logo (선택사항): 건너뛰기
5. "Submit" 클릭
```

**결과**: Integration 생성됨

### Step 5.3: Integration Token 복사

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

### Step 5.4: Integration에 권한 부여

```
1. "Capabilities" 섹션 확인
2. "Database content" 체크 (읽기/쓰기)
3. (선택) "User information" 체크
4. "Save" 클릭
```

### Step 5.5: 각 DB에 접근 권한 부여

Integration이 만든 DB에 접근하려면 각 DB를 "공유"해야 합니다.

#### Clients DB에 권한 부여

```
1. Clients DB 페이지에서 우상단 "Share" 클릭
2. "Invite" 섹션에서 "Invoice Web" Integration 검색 및 선택
3. "Full access" 권한 선택
4. "Invite" 클릭
```

**결과**: Invoice Web integration이 Clients DB에 접근 가능

#### Invoices DB에 권한 부여

```
1. Invoices DB의 "Share" → Integration "Invoice Web" 추가 → "Full access"
```

#### Templates DB에 권한 부여

```
1. Templates DB의 "Share" → Integration "Invoice Web" 추가 → "Full access"
```

---

## 6️⃣ 데이터베이스 ID 확인

이제 각 DB의 ID를 확인해야 합니다.

### Step 6.1: Clients DB ID 복사

```
1. Clients DB 페이지 열기
2. 브라우저 주소창 확인:
   https://notion.so/workspace/{DATABASE_ID}?v=...
3. DATABASE_ID 부분 복사 (/ 뒤의 32자리, 하이픈 제거)

예: abc123def456abc123def456abc123d1
```

### Step 6.2: Invoices DB ID 복사

```
Invoices DB 주소에서 동일하게 ID 추출
```

### Step 6.3: Templates DB ID 복사

```
Templates DB 주소에서 동일하게 ID 추출
```

---

## 7️⃣ 환경 변수에 저장

이제 얻은 정보를 `.env.local`에 입력합니다.

### Step 7.1: `.env.local` 파일 열기

```
프로젝트 루트의 .env.local 파일을 텍스트 에디터로 열기
```

### Step 7.2: 값 입력

```env
# Notion API Token (Step 5.3에서 복사한 값)
NOTION_API_KEY=noti_1234567890abcdef1234567890abcdef1234567

# 데이터베이스 ID (Step 6에서 확인한 값)
NOTION_CLIENTS_DB_ID=abc123def456abc123def456abc123d1
NOTION_INVOICES_DB_ID=abc123def456abc123def456abc123d2
NOTION_TEMPLATES_DB_ID=abc123def456abc123def456abc123d3
```

### Step 7.3: 파일 저장

```
Ctrl+S (또는 Cmd+S) 저장
```

---

## ✅ 검증 체크리스트

모두 완료되었는지 확인해주세요:

### DB 생성

- [ ] **Clients** DB 생성 (Name, Email, Phone, Address, Registration Number, Notes)
- [ ] **Invoices** DB 생성 (Title, Client Relation, Items, Total Amount, Currency, Status, Due Date, Notes)
- [ ] **Templates** DB 생성 (Name, Description, Items, Default Currency, Category, Is Public)

### Relation 설정

- [ ] Invoices의 Client 속성이 Clients DB와 연결됨
- [ ] Clients DB에 자동 역관계 "Invoices" 속성이 생성됨

### Integration 설정

- [ ] "Invoice Web" Integration 생성
- [ ] Integration Token 복사 (noti\_로 시작)
- [ ] 3개 DB 모두에 "Full access" 권한 부여됨

### 환경 변수

- [ ] `.env.local`에 NOTION_API_KEY 입력
- [ ] `.env.local`에 3개 DATABASE_ID 입력
- [ ] 파일 저장됨

---

## 🆘 문제 해결

### Q: Integration Token이 보이지 않습니다

**A**:

```
1. Notion 로그인 확인
2. https://www.notion.so/my-integrations 다시 접속
3. "Invoice Web" Integration 클릭
4. "Internal Integration Token" 섹션에서 "Show" 버튼 클릭
```

### Q: Integration이 DB에 접근 불가입니다

**A**:

```
1. 각 DB를 열고 "Share" 클릭
2. Integration "Invoice Web" 초대 확인
3. 권한이 "Full access"인지 확인
4. Notion 새로고침 (F5)
```

### Q: DB ID를 어디서 찾죠?

**A**:

```
1. DB 페이지에서 우상단 "..." (더보기) 클릭
2. "Copy link" 클릭
3. 링크에서 / 뒤의 32자리 문자열 (하이픈 제외)
또는
4. 브라우저 주소창: https://notion.so/workspace/{ID_HERE}?v=...
```

### Q: API Token을 잘못 복사했습니다

**A**:

```
1. https://www.notion.so/my-integrations 접속
2. "Invoice Web" Integration → "Secrets"
3. "Rotate key" 클릭해서 새로운 토큰 생성
4. 새 토큰 복사
```

---

## 🎉 완료!

축하합니다! 이제:

- ✅ 3개 Notion DB 생성 완료
- ✅ Relation 설정 완료
- ✅ Integration 설정 완료
- ✅ API 접근 가능 상태

**다음 단계**: `.env.local`에 API 키를 입력했으면, Notion DB 연동 테스트를 시작할 수 있습니다! 🚀

---

**마지막 확인**:

- Notion DB 3개 모두 생성했나요?
- API 토큰과 DB ID를 `.env.local`에 입력했나요?
- `.env.local` 파일이 저장되었나요?

완료하셨으면 알려주세요! 👍
