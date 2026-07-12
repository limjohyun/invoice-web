-- profiles 테이블 Row Level Security(RLS) 설정
-- 적용 방법: Supabase 대시보드 → SQL Editor에 아래 스크립트를 붙여넣고 실행하세요.
-- 목적: 인증된 사용자가 자기 자신의 프로필 행만 조회/수정할 수 있도록 제한합니다.

-- 1) RLS 활성화
alter table public.profiles enable row level security;

-- 2) 조회(SELECT) 정책: 로그인한 사용자는 자신의 프로필만 조회 가능
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- 3) 수정(UPDATE) 정책: 로그인한 사용자는 자신의 프로필만 수정 가능
--    (Notion Integration Token 저장 등 /settings 페이지에서 사용)
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4) 삽입(INSERT) 정책: 회원가입 시 본인 id로만 프로필 행 생성 가능
--    (Supabase Auth 트리거 등으로 프로필을 자동 생성하는 경우 이 정책은 불필요할 수 있습니다)
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- 참고:
-- - service_role 키를 사용하는 관리자 클라이언트(src/lib/supabase/admin.ts)는
--   RLS를 완전히 우회하므로 위 정책과 무관하게 항상 전체 데이터에 접근할 수 있습니다.
--   신뢰된 서버 로직(배치, 관리자 작업 등)에서만 사용하세요.
-- - 일반 로그인 사용자 요청은 src/lib/supabase/server.ts(쿠키 기반 세션 클라이언트)를
--   통해 처리되며, 이 클라이언트는 위 RLS 정책의 적용을 받습니다.
