-- 견적서 클라이언트 공유 링크(Phase 6, F015) 테이블 및 RLS 설정
-- 적용 방법: Supabase 대시보드 → SQL Editor에 아래 스크립트를 붙여넣고 실행하세요.
-- 목적: Notion 페이지 ID를 URL에 직접 노출하지 않고, 견적서별로 회수·비활성화가
-- 가능한 별도의 랜덤 공유 토큰을 발급·관리한다.
-- 설계 근거: docs/roadmaps/ROADMAP_V1.md Phase 6 "📌 설계 결정" 쟁점 2 참고.

-- 1) 테이블 생성
create table if not exists public.invoice_share_links (
  id uuid primary key default gen_random_uuid(),
  -- Notion Invoices DB 페이지 ID (Postgres FK가 아닌 외부 시스템 참조이므로 text로 저장)
  invoice_id text not null,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 토큰으로 공개 라우트에서 조회할 때 사용하는 인덱스
create index if not exists invoice_share_links_token_idx
  on public.invoice_share_links (token);

-- 소유자가 특정 견적서의 활성 링크를 조회/재사용할 때 사용하는 인덱스
create index if not exists invoice_share_links_owner_invoice_idx
  on public.invoice_share_links (owner_user_id, invoice_id);

-- 2) RLS 활성화
alter table public.invoice_share_links enable row level security;

-- 3) 조회(SELECT) 정책: 로그인한 사용자는 자신이 발급한 링크만 조회 가능
create policy "invoice_share_links_select_own"
  on public.invoice_share_links
  for select
  to authenticated
  using (auth.uid() = owner_user_id);

-- 4) 삽입(INSERT) 정책: 로그인한 사용자는 본인 소유로만 링크 발급 가능
create policy "invoice_share_links_insert_own"
  on public.invoice_share_links
  for insert
  to authenticated
  with check (auth.uid() = owner_user_id);

-- 5) 수정(UPDATE) 정책: 로그인한 사용자는 자신이 발급한 링크만 비활성화 등 수정 가능
create policy "invoice_share_links_update_own"
  on public.invoice_share_links
  for update
  to authenticated
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- 참고:
-- - 공개 라우트(/share/[token], /api/share/[token]/pdf)는 로그인 세션이 없는
--   제3자(클라이언트)가 접근하므로, 토큰으로 링크를 조회할 때는 위 RLS 정책을
--   적용받지 않는 Service Role 클라이언트(src/lib/supabase/admin.ts)를 사용한다.
--   접근은 반드시 getInvoiceByShareToken() 단일 함수로만 이뤄지도록 유지할 것
--   (RLS를 우회하는 클라이언트이므로 이 함수 밖에서 재사용하지 않는다).
