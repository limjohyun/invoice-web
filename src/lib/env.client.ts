import { z } from 'zod'

/**
 * 브라우저 번들에 포함되어도 안전한 공개(NEXT_PUBLIC_) 환경 변수만 검증합니다.
 * src/lib/env.ts는 서버 전용 변수(SUPABASE_SERVICE_ROLE_KEY 등)까지 파싱하므로,
 * 클라이언트 컴포넌트에서 import하면 브라우저에 undefined인 값 때문에 파싱이 실패합니다.
 * 클라이언트 코드에서는 반드시 이 파일을 사용하세요.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL이 유효한 URL 형식이어야 합니다'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY는 필수입니다'),
})

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})
