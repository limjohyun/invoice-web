import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Service Role 키를 사용하는 관리자용 Supabase 클라이언트
 * Row Level Security(RLS)를 완전히 우회하므로, 사용자 세션과 무관하게
 * 시스템이 직접 데이터를 다뤄야 하는 신뢰된 서버 로직에서만 사용하세요.
 * (예: Webhook 처리, 배치 작업 등 - 일반적인 사용자 요청 처리에는 server.ts를 사용)
 */
export function createSupabaseAdminClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
