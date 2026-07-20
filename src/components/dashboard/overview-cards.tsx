import Link from 'next/link'
import { FileText, Building2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OverviewCardsProps {
  invoiceCount: number
  clientCount: number
}

/** 대시보드 개요 페이지의 견적서/클라이언트 현황 카드 2개 */
export function OverviewCards({
  invoiceCount,
  clientCount,
}: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 견적서관리 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">견적서 관리</CardTitle>
          <FileText
            className="text-muted-foreground h-5 w-5"
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">
            {invoiceCount}
            <span className="text-muted-foreground ml-1 text-base font-normal">
              건
            </span>
          </div>
          <Link href="/invoice">
            <Button variant="outline" size="sm" className="w-full">
              견적서 목록 보기
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 클라이언트관리 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">클라이언트 관리</CardTitle>
          <Building2
            className="text-muted-foreground h-5 w-5"
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">
            {clientCount}
            <span className="text-muted-foreground ml-1 text-base font-normal">
              건
            </span>
          </div>
          <Link href="/clients">
            <Button variant="outline" size="sm" className="w-full">
              거래처 관리로 이동
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
