-- profiles 테이블에 Clients/Templates Notion DB ID 컬럼 추가 (Phase 3: F012/F013)
-- 배경: 기존에는 notion_invoice_db_id / notion_items_db_id 2개만 저장했는데,
-- 거래처(Clients) 관리, 템플릿(Templates) 관리 기능을 위해 DB 2개를 추가로 연동한다.
--
-- 적용 방법: Supabase 대시보드 → SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
-- 이 스크립트는 멱등성(idempotent)이 있어 여러 번 실행해도 안전합니다.

begin;

alter table public.profiles
  add column if not exists notion_clients_db_id text;

alter table public.profiles
  add column if not exists notion_templates_db_id text;

commit;

-- 검증 쿼리 (실행 후 결과 확인용)
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'profiles'
-- order by ordinal_position;
