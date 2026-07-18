'use client'

import { useWatch, type Control } from 'react-hook-form'

import type { InvoiceFormData } from '@/lib/schemas/invoice'
import type { Currency } from '@/lib/notion/types'
import { calculateInvoiceTotal } from '@/lib/invoice/calculate'

const formatAmount = (value: number) =>
  new Intl.NumberFormat('ko-KR').format(value)

interface InvoiceTotalsProps {
  control: Control<InvoiceFormData>
  currency: Currency
}

/** 저장 전 미리보기용 합계. 실제 값은 Notion의 Formula/Rollup이 저장 시 계산한다. */
export function InvoiceTotals({ control, currency }: InvoiceTotalsProps) {
  const items = useWatch({ control, name: 'items' }) ?? []
  const totals = calculateInvoiceTotal(
    items.map(item => ({
      quantity: Number(item?.quantity) || 0,
      unitPrice: Number(item?.unitPrice) || 0,
      taxRate: item?.taxRate,
    }))
  )

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <div className="flex w-56 justify-between">
        <span className="text-muted-foreground">공급가액</span>
        <span>
          {formatAmount(totals.subtotal)} {currency}
        </span>
      </div>
      <div className="flex w-56 justify-between">
        <span className="text-muted-foreground">세액</span>
        <span>
          {formatAmount(totals.tax)} {currency}
        </span>
      </div>
      <div className="flex w-56 justify-between border-t pt-1 font-semibold">
        <span>합계</span>
        <span>
          {formatAmount(totals.total)} {currency}
        </span>
      </div>
    </div>
  )
}
