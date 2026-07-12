'use server'

import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { LoginFormData, SignupFormData } from '@/lib/schemas/auth'

export type AuthError = {
  code: string
  message: string
}

export type AuthResult = {
  success: boolean
  error?: AuthError
  redirect?: string
}

export async function signUp(formData: SignupFormData): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'unknown_error',
          message: getErrorMessage(error.message),
        },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: {
          code: 'user_creation_failed',
          message: '회원가입에 실패했습니다. 다시 시도해주세요.',
        },
      }
    }

    return { success: true }
  } catch (error) {
    console.error('회원가입 에러:', error)
    return {
      success: false,
      error: {
        code: 'server_error',
        message: '서버 오류가 발생했습니다. 다시 시도해주세요.',
      },
    }
  }
}

/**
 * 사용자의 Notion 토큰 상태 확인
 * 로그인 직후 발급된 세션이 반영된 클라이언트를 그대로 재사용해
 * profiles 테이블의 RLS 정책("본인 프로필만 조회 가능")을 통과합니다.
 * @param supabase 로그인 세션이 반영된 Supabase 클라이언트
 * @param userId 사용자 ID
 * @returns Notion 토큰 존재 여부
 */
async function getUserNotionStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notion_access_token')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('프로필 조회 실패:', profileError)
      return false
    }

    return !!profile?.notion_access_token
  } catch (error) {
    console.error('Notion 상태 확인 에러:', error)
    return false
  }
}

/**
 * 로그인 Server Action
 * Supabase 인증 및 Notion 토큰 상태 확인
 */
export async function signIn(formData: LoginFormData): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'unknown_error',
          message: getSignInErrorMessage(error.message),
        },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: {
          code: 'login_failed',
          message: '로그인에 실패했습니다. 다시 시도해주세요.',
        },
      }
    }

    // Notion 토큰 상태 확인 (같은 세션의 클라이언트를 재사용해 RLS 통과)
    const hasNotionToken = await getUserNotionStatus(supabase, data.user.id)
    const redirectPath = hasNotionToken ? '/dashboard' : '/settings'

    return {
      success: true,
      redirect: redirectPath,
    }
  } catch (error) {
    console.error('로그인 에러:', error)
    return {
      success: false,
      error: {
        code: 'server_error',
        message: '서버 오류가 발생했습니다. 다시 시도해주세요.',
      },
    }
  }
}

function getSignInErrorMessage(error: string): string {
  if (error.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }
  if (error.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
  }
  if (error.includes('Too many requests')) {
    return '너무 많은 로그인 시도를 했습니다. 잠시 후 다시 시도해주세요.'
  }
  if (error.includes('Network')) {
    return '네트워크 연결을 확인해주세요.'
  }
  return error || '로그인에 실패했습니다. 다시 시도해주세요.'
}

function getErrorMessage(error: string): string {
  if (error.includes('already registered')) {
    return '이미 등록된 이메일입니다.'
  }
  if (error.includes('password')) {
    return '비밀번호가 너무 약합니다. 8자 이상의 복잡한 비밀번호를 사용해주세요.'
  }
  if (error.includes('invalid email')) {
    return '올바른 이메일 주소를 입력해주세요.'
  }
  return error || '회원가입에 실패했습니다. 다시 시도해주세요.'
}

/**
 * 로그아웃 Server Action
 * 사용자의 세션을 종료하고 로그인 페이지로 리다이렉트
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('로그아웃 에러:', error)
    // 에러 발생해도 로그인 페이지로 리다이렉트
  } finally {
    redirect('/login')
  }
}
