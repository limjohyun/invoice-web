import { Metadata } from 'next'

import { getInvoice } from '@/lib/actions/notion'
import type { InvoiceFormData } from '@/lib/schemas/invoice'
import { InvoiceForm } from '@/components/invoice/invoice-form'

export const metadata: Metadata = {
  title: '견적서 수정',
}

export const dynamic = 'force-dynamic'

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceEditPage({
  params,
}: InvoiceEditPageProps) {
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

  const invoice = result.data
  const defaultValues: InvoiceFormData = {
    title: invoice.title,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail ?? '',
    clientPhone: invoice.clientPhone ?? '',
    clientAddress: invoice.clientAddress ?? '',
    clientRegistrationNumber: invoice.clientRegistrationNumber ?? '',
    currency: invoice.currency,
    status: invoice.status,
    dueDate: invoice.dueDate ?? '',
    notes: invoice.notes ?? '',
    items: invoice.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate ?? undefined,
      sortOrder: item.sortOrder ?? 0,
    })),
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">견적서 수정</h1>
        <p className="text-muted-foreground text-sm">
          견적서 정보와 품목을 수정하세요
        </p>
      </div>
      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        defaultValues={defaultValues}
      />
    </div>
  )
}
