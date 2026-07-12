import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

/** 인증이 필요한 경로 - 미인증 사용자는 /login으로 리다이렉트 */
const PROTECTED_PATHS = ['/dashboard', '/settings']

/** 인증된 사용자는 접근할 수 없는 경로 - 로그인 상태면 /settings로 리다이렉트 */
const AUTH_ONLY_PATHS = ['/login']

/**
 * Supabase 세션 쿠키를 검증/갱신하고, 인증 상태에 따라 라우트 접근을 제어합니다.
 * src/middleware.ts에서 호출되어 매 요청마다 실행됩니다.
 */
export async function updateSession(request: NextRequest) {
  // 기본 응답: 요청을 그대로 통과시키되, 아래에서 세션 쿠키가 갱신되면 재생성됩니다.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        // 요청 객체에도 반영해 이후 로직에서 최신 쿠키를 읽을 수 있도록 합니다.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
        // 인증 쿠키 응답은 캐시되면 안 되므로 관련 헤더를 함께 설정합니다.
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        )
      },
    },
  })

  // 중요: getSession()은 쿠키에 담긴 토큰을 검증 없이 디코딩만 하므로,
  // 인가(authorization) 판단에는 반드시 getUser()로 Auth 서버에 재검증해야 합니다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtectedPath = PROTECTED_PATHS.some(path =>
    pathname.startsWith(path)
  )
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(path => pathname.startsWith(path))

  // 미인증 사용자가 보호된 라우트에 접근하면 로그인 페이지로 리다이렉트
  if (!user && isProtectedPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 인증된 사용자가 로그인 페이지에 접근하면 설정 페이지로 리다이렉트
  if (user && isAuthOnlyPath) {
    const settingsUrl = request.nextUrl.clone()
    settingsUrl.pathname = '/settings'
    settingsUrl.search = ''
    return NextResponse.redirect(settingsUrl)
  }

  // 중요: supabaseResponse를 그대로 반환해야 갱신된 세션 쿠키가 브라우저에 전달됩니다.
  return supabaseResponse
}
