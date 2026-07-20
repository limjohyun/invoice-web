'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}

/** 라우트 세그먼트 error.tsx에서 공통으로 쓰는 에러 화면. Notion 연동 문제일 가능성이 높으므로 설정 페이지 재연결 동선을 기본 제공한다. */
export function ErrorFallback({ error, reset, title }: ErrorFallbackProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
            <AlertTriangle
              className="text-destructive size-8"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">
              {title ?? '문제가 발생했습니다'}
            </p>
            <p className="text-muted-foreground text-sm">
              {error.message ||
                '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              다시 시도
            </Button>
            <Link href="/settings">
              <Button>Notion 연동 설정에서 재연결</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
