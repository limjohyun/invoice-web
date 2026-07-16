-- profiles 테이블 스키마 수정 마이그레이션 (통합본, 여러 번 실행해도 안전함)
-- 배경: T9 E2E 테스트 작성 중 발견된 실제 DB 스키마와 애플리케이션 코드 간 불일치 수정
--
-- 문제:
--   1) profiles 테이블에 `id` 컬럼이 없었음 (코드는 모든 곳에서 .eq('id', userId) 사용)
--   2) notion_access_token이 Primary Key + NOT NULL로 설정되어 있어
--      "Notion 미연동 상태"(토큰 없음)를 표현할 수 없었음
--   3) 컬럼명이 notion_invoices_db_id(복수형)인데 코드는 notion_invoice_db_id(단수형) 사용
--   4) notion_invoice_db_id / notion_items_db_id가 NOT NULL이라
--      회원가입 트리거가 id만 넣는 insert를 하면 실패함
--
-- 적용 방법: Supabase 대시보드 → SQL Editor에 이 파일 전체를 붙여넣고 한 번에 실행하세요.
-- 이 스크립트는 멱등성(idempotent)이 있어 이미 적용된 부분은 자동으로 건너뜁니다.
-- 이전에 profiles_schema_fix.sql 또는 profiles_schema_fix_2.sql을 부분적으로 실행했어도
-- 안전하게 다시 실행할 수 있습니다.

begin;

-- 1) 컬럼명 수정: notion_invoices_db_id(복수형)가 남아있다면 notion_invoice_db_id(단수형)로 변경
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'notion_invoices_db_id'
  ) then
    alter table public.profiles
      rename column notion_invoices_db_id to notion_invoice_db_id;
  end if;
end $$;

-- 2) 기존 Primary Key 제약 제거 (id가 아닌 다른 컬럼에 PK가 걸려 있는 경우에만)
--    PK가 걸린 실제 컬럼명을 확인해서, 이미 id에 PK가 있다면 절대 건드리지 않습니다.
--    (이전 버전은 제약 이름 문자열을 직접 비교했는데, Postgres의 실제 자동 생성 이름과
--     맞지 않아 재실행 시 이미 만들어둔 id의 PK까지 삭제되는 버그가 있었습니다)
do $$
declare
  pk_col text;
  pk_name text;
begin
  select a.attname, c.conname into pk_col, pk_name
  from pg_constraint c
  join pg_attribute a
    on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
  where c.conrelid = 'public.profiles'::regclass
    and c.contype = 'p';

  if pk_name is not null and pk_col <> 'id' then
    execute format('alter table public.profiles drop constraint %I', pk_name);
  end if;
end $$;

-- 3) notion_access_token / notion_invoice_db_id / notion_items_db_id를 모두 nullable로 변경
--    (Notion 미연동 상태를 표현하려면 전부 nullable이어야 함)
alter table public.profiles
  alter column notion_access_token drop not null;

alter table public.profiles
  alter column notion_invoice_db_id drop not null;

alter table public.profiles
  alter column notion_items_db_id drop not null;

-- 4) id 컬럼 추가: auth.users(id)를 참조 (컬럼이 없는 경우에만 추가)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'id'
  ) then
    alter table public.profiles
      add column id uuid references auth.users (id) on delete cascade;
  end if;
end $$;

-- 4-1) id 컬럼에 Primary Key가 없는 경우(직전 버그로 지워진 경우 포함) 다시 추가
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.conrelid = 'public.profiles'::regclass
      and c.contype = 'p'
      and a.attname = 'id'
  ) then
    alter table public.profiles add primary key (id);
  end if;
end $$;

commit;

-- 5) 신규 가입 시 profiles 행 자동 생성 트리거
--    배경: 회원가입(auth.users insert) 시 profiles 행을 만드는 코드가 없어서
--    saveNotionToken()의 .update()가 대상 행 없이 "0행 성공"으로 조용히 실패하던 문제를 해결합니다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) RLS 정책 재적용 (id 컬럼 기준으로 재생성)
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- 검증 쿼리 (실행 후 결과 확인용)
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'profiles'
-- order by ordinal_position;
