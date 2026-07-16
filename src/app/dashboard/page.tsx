import { Metadata } from 'next'
import Link from 'next/link'
import { FilePlus2, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '대시보드',
  description: '작성 중인 견적서 현황을 확인하세요',
}

/**
 * 대시보드 페이지 (임시 마크업)
 * T9 E2E 테스트를 위한 목업 페이지로, 실제 Notion 데이터 연동은 Phase 2에서 구현 예정
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          작성 중인 견적서 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 메인 영역: 빈 상태 */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
              <FileText
                className="text-muted-foreground size-8"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">
                현재 작성 중인 견적서 없음
              </p>
              <p className="text-muted-foreground text-sm">
                새 견적서를 작성하면 이곳에 목록이 표시됩니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 액션 버튼 */}
      <div className="flex justify-end">
        {/* TODO: 실제 견적서 작성 페이지 라우트로 연결 필요 (Phase 2) */}
        <Link href="/invoices/new">
          <Button className="gap-2">
            <FilePlus2 className="size-4" aria-hidden="true" />새 견적서 작성
          </Button>
        </Link>
      </div>
    </div>
  )
}
