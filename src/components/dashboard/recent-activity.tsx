import Link from 'next/link'
import { History } from 'lucide-react'

import type { InvoiceStatus } from '@/lib/notion/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge'

interface RecentActivityItem {
  id: string
  title: string
  clientName: string
  status: InvoiceStatus
  modifiedAt: string
}

interface RecentActivityProps {
  items: RecentActivityItem[]
}

/** 대시보드 개요 페이지의 최근 활동(견적서 수정 이력) 리스트 */
export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          // 빈 상태: 원형 아이콘 배경 + 안내 문구 (기존 empty-state 패턴 참고)
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
              <History
                className="text-muted-foreground size-8"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">아직 활동 내역이 없습니다</p>
              <p className="text-muted-foreground text-sm">
                견적서를 작성하면 최근 활동에 표시됩니다
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map(item => (
              <li key={item.id}>
                <Link
                  href={`/invoice/${item.id}`}
                  className="hover:bg-muted/50 -mx-6 flex flex-col gap-1 px-6 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.clientName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <InvoiceStatusBadge status={item.status} />
                    <span className="text-muted-foreground text-xs">
                      {new Date(item.modifiedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
