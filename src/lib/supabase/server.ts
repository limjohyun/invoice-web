import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

/**
 * 서버 컴포넌트 / 서버 액션 / 라우트 핸들러에서 사용하는 Supabase 클라이언트
 * next/headers의 쿠키 스토어를 읽고 써서 사용자 인증 세션을 유지합니다.
 *
 * 주의: Server Component 렌더링 중에는 쿠키를 쓸 수 없어 setAll이 실패할 수 있습니다.
 * 이 경우 미들웨어(src/middleware.ts)가 매 요청마다 세션 갱신을 대신 처리합니다.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component에서 호출된 경우 쿠키 쓰기가 불가능합니다.
          // 미들웨어가 매 요청마다 세션을 갱신하므로 무시해도 안전합니다.
        }
      },
    },
  })
}
