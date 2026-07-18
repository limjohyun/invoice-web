import { Metadata } from 'next'

import { getInvoice } from '@/lib/actions/notion'
import { InvoiceDetail } from '@/components/invoice/invoice-detail'

export const metadata: Metadata = {
  title: '견적서 상세',
}

export const dynamic = 'force-dynamic'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params
  const result = await getInvoice(id)

  if (!result.success || !result.data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-destructive text-sm">
          {result.error?.message ?? '견적서를 불러오지 못했습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <InvoiceDetail invoice={result.data} />
    </div>
  )
}
