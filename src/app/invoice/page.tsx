import { Metadata } from 'next'
import Link from 'next/link'
import { FilePlus2, FileText } from 'lucide-react'

import { getInvoices } from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InvoiceList } from '@/components/invoice/invoice-list'

export const metadata: Metadata = {
  title: '견적서 목록',
  description: '작성 중인 견적서 현황을 확인하세요',
}

/** 매 요청마다 최신 Notion 데이터를 반영 (mutation 후 revalidatePath만으로는 캐시 신선도를 보장하기 애매함) */
export const dynamic = 'force-dynamic'

export default async function InvoiceListPage() {
  const result = await getInvoices()
  const invoices = result.success ? (result.data ?? []) : []

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">견적서 목록</h1>
          <p className="text-muted-foreground text-sm">
            작성 중인 견적서 현황을 한눈에 확인하세요
          </p>
        </div>
        <Link href="/invoice/create">
          <Button className="gap-2">
            <FilePlus2 className="size-4" aria-hidden="true" />새 견적서 작성
          </Button>
        </Link>
      </div>

      {!result.success && (
        <Card>
          <CardContent className="text-destructive py-10 text-center text-sm">
            {result.error?.message ?? '견적서 목록을 불러오지 못했습니다.'}
          </CardContent>
        </Card>
      )}

      {result.success && invoices.length === 0 && (
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
      )}

      {result.success && invoices.length > 0 && (
        <InvoiceList invoices={invoices} />
      )}
    </div>
  )
}
