import { Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  maxWidthClassName?: string
  rows?: number
}

/** 대시보드/거래처/템플릿처럼 "헤더 + 버튼 + 목록" 형태 페이지의 공용 로딩 스켈레톤. */
export function ListSkeleton({
  maxWidthClassName = 'max-w-5xl',
  rows = 5,
}: ListSkeletonProps) {
  return (
    <div
      className={`mx-auto w-full ${maxWidthClassName} space-y-8 px-4 py-12 sm:px-6 lg:px-8`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}
