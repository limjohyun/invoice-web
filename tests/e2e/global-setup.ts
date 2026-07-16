import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  TEST_USER_WITH_NOTION,
  TEST_USER_WITHOUT_NOTION,
  TEST_PASSWORD,
} from './test-users'

// Playwright는 Next.js 앱과 별개의 Node 프로세스로 실행되므로,
// .env.local이 자동으로 로드되지 않습니다. 여기서 직접 로드합니다.
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * E2E 테스트용 Supabase 사용자를 만들 때 사용하는 최소 관리자 클라이언트
 * src/lib/env.ts 전체 스키마(Notion 키 등)에 의존하지 않도록 별도로 구성합니다.
 */
function createTestAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'E2E 테스트 실행에는 .env.local에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.'
    )
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * 이메일로 기존 Auth 사용자를 찾아 삭제합니다.
 * 이전 테스트 실행에서 남은 계정을 정리해 매 실행마다 동일한 초기 상태를 보장합니다.
 */
async function deleteExistingUserByEmail(
  supabase: ReturnType<typeof createTestAdminClient>,
  email: string
) {
  let page = 1
  const perPage = 200

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error) {
      throw new Error(`기존 테스트 사용자 조회 실패: ${error.message}`)
    }

    const found = data.users.find(user => user.email === email)
    if (found) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        found.id
      )
      if (deleteError) {
        throw new Error(`기존 테스트 사용자 삭제 실패: ${deleteError.message}`)
      }
      return
    }

    if (data.users.length < perPage) return
    page += 1
  }
}

/**
 * 테스트 계정을 생성하고 profiles 테이블 상태(Notion 토큰 유무)를 초기화합니다.
 * service_role 키로 RLS를 우회하므로, 앱의 회원가입 플로우나 DB 트리거 유무와
 * 무관하게 항상 원하는 상태를 보장할 수 있습니다.
 */
async function setUpTestUser(
  supabase: ReturnType<typeof createTestAdminClient>,
  email: string,
  notionAccessToken: string | null
) {
  await deleteExistingUserByEmail(supabase, email)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(
      `E2E 테스트 사용자 생성 실패(${email}): ${error?.message ?? '알 수 없는 오류'}`
    )
  }

  const { error: upsertError } = await supabase.from('profiles').upsert(
    {
      id: data.user.id,
      notion_access_token: notionAccessToken,
    },
    { onConflict: 'id' }
  )

  if (upsertError) {
    throw new Error(
      `E2E 테스트 프로필 초기화 실패(${email}): ${upsertError.message}`
    )
  }
}

/**
 * Playwright 전역 셋업
 * 모든 테스트 실행 전 1회 호출되어, 로그인 분기 테스트에 필요한
 * 두 종류의 계정(Notion 연동 O/X)을 결정론적으로 준비합니다.
 */
export default async function globalSetup() {
  const supabase = createTestAdminClient()

  await setUpTestUser(
    supabase,
    TEST_USER_WITH_NOTION.email,
    TEST_USER_WITH_NOTION.notionAccessToken
  )
  await setUpTestUser(supabase, TEST_USER_WITHOUT_NOTION.email, null)
}
