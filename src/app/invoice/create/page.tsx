import { Metadata } from 'next'

import { InvoiceForm } from '@/components/invoice/invoice-form'

export const metadata: Metadata = {
  title: '견적서 작성',
  description: '새 견적서를 작성하고 Notion에 저장하세요',
}

export default function InvoiceCreatePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">견적서 작성</h1>
        <p className="text-muted-foreground text-sm">
          거래처 정보와 품목을 입력해 새 견적서를 만드세요
        </p>
      </div>
      <InvoiceForm mode="create" />
    </div>
  )
}
