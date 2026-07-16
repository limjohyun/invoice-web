import { createBrowserClient } from '@supabase/ssr'
import { clientEnv } from '@/lib/env.client'

/**
 * 클라이언트 컴포넌트(브라우저)에서 사용하는 Supabase 클라이언트
 * 세션을 쿠키에 저장하므로 서버(미들웨어, Server Action)와 인증 상태를 공유합니다.
 * NEXT_PUBLIC_ 접두사가 붙은 값만 브라우저 번들에 포함될 수 있어 별도 env 값을 사용합니다.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
