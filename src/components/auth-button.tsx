'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

/**
 * 인증 상태에 따라 로그인/로그아웃 버튼을 표시하는 컴포넌트
 */
export function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setIsLoading(false)
    })

    // 다른 탭에서의 로그인/로그아웃 등 인증 상태 변경 시 즉시 버튼 상태를 갱신합니다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * 로그아웃 핸들러
   */
  async function handleLogout() {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null
  }

  return isLoggedIn ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      로그아웃
    </Button>
  ) : (
    <Link href="/login">
      <Button variant="outline" size="sm">
        로그인
      </Button>
    </Link>
  )
}
