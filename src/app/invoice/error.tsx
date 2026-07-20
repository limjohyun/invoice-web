'use client'

import { ErrorFallback } from '@/components/error-fallback'

export default function InvoiceError({
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
      title="견적서 정보를 불러오지 못했습니다"
    />
  )
}
