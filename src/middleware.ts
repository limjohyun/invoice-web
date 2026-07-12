import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js 루트 미들웨어
 * 모든 요청에서 Supabase 세션을 갱신하고 보호된 라우트(/dashboard, /settings)의
 * 접근을 제어합니다. 자세한 로직은 src/lib/supabase/middleware.ts 참고.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에서 미들웨어 실행:
     * - _next/static (정적 자산)
     * - _next/image (이미지 최적화 결과)
     * - favicon.ico
     * - 이미지 파일 확장자
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
