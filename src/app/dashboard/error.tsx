'use client'

import { ErrorFallback } from '@/components/error-fallback'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="대시보드를 불러오지 못했습니다"
    />
  )
}
