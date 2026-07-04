import { z } from 'zod'

const envSchema = z.object({
  // 기본 설정
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Supabase (필수)
  SUPABASE_URL: z.string().url('Supabase URL이 유효한 URL 형식이어야 합니다'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key는 필수입니다'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase Service Role Key는 필수입니다'),

  // Notion API (필수 - 서버에서만 사용)
  NOTION_API_KEY: z
    .string()
    .min(1, 'Notion API Key는 필수입니다')
    .startsWith('noti_', 'Notion API Key는 "noti_"로 시작해야 합니다'),

  // Notion 데이터베이스 ID (선택사항 - 사용자 설정 후)
  NOTION_CLIENTS_DB_ID: z.string().optional(),
  NOTION_INVOICES_DB_ID: z.string().optional(),
  NOTION_TEMPLATES_DB_ID: z.string().optional(),
})

/**
 * 환경 변수 검증 및 파싱
 * 서버 구동 시 필수 환경 변수 확인, 형식 검증
 */
export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_CLIENTS_DB_ID: process.env.NOTION_CLIENTS_DB_ID,
  NOTION_INVOICES_DB_ID: process.env.NOTION_INVOICES_DB_ID,
  NOTION_TEMPLATES_DB_ID: process.env.NOTION_TEMPLATES_DB_ID,
})

export type Env = z.infer<typeof envSchema>
