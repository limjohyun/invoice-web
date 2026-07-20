import { Metadata } from 'next'

import { getInvoices, getClients } from '@/lib/actions/notion'
import { Card, CardContent } from '@/components/ui/card'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const metadata: Metadata = {
  title: '대시보드',
  description: '견적서 관리 현황을 한눈에 확인하세요',
}

/** 매 요청마다 최신 Notion 데이터를 반영 (mutation 후 revalidatePath만으로는 캐시 신선도를 보장하기 애매함) */
export const dynamic = 'force-dynamic'

/** 최근 활동 목록에 보여줄 최대 건수 */
const RECENT_ACTIVITY_LIMIT = 5

export default async function DashboardPage() {
  const [invoicesResult, clientsResult] = await Promise.all([
    getInvoices(),
    getClients(),
  ])

  if (!invoicesResult.success || !clientsResult.success) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground text-sm">
            견적서 관리 현황을 한눈에 확인하세요
          </p>
        </div>
        <Card>
          <CardContent className="text-destructive py-10 text-center text-sm">
            {invoicesResult.error?.message ??
              clientsResult.error?.message ??
              '대시보드 데이터를 불러오지 못했습니다.'}
          </CardContent>
        </Card>
      </div>
    )
  }

  const invoices = invoicesResult.data ?? []
  const clients = clientsResult.data ?? []

  const recentActivity = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    )
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(invoice => ({
      id: invoice.id,
      title: invoice.title,
      clientName: invoice.clientName,
      status: invoice.status,
      modifiedAt: invoice.modifiedAt,
    }))

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          견적서 관리 현황을 한눈에 확인하세요
        </p>
      </div>

      <OverviewCards
        invoiceCount={invoices.length}
        clientCount={clients.length}
      />

      <RecentActivity items={recentActivity} />
    </div>
  )
}
