'use client'

import { ErrorFallback } from '@/components/error-fallback'

export default function TemplatesError({
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
      title="템플릿 정보를 불러오지 못했습니다"
    />
  )
}
