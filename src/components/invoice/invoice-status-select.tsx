'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { updateInvoice } from '@/lib/actions/notion'
import { INVOICE_STATUS_VALUES, type InvoiceStatus } from '@/lib/notion/types'
import { INVOICE_STATUS_LABEL } from '@/components/invoice/invoice-status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InvoiceStatusSelectProps {
  invoiceId: string
  status: InvoiceStatus
}

/** 견적서 상세 페이지에서 상태만 단독으로 변경할 때 쓰는 Select (Nice-to-have, 자동 알림 없음). */
export function InvoiceStatusSelect({
  invoiceId,
  status,
}: InvoiceStatusSelectProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleChange(next: string) {
    const nextStatus = next as InvoiceStatus
    if (nextStatus === status) return

    setIsUpdating(true)
    try {
      const result = await updateInvoice(invoiceId, { status: nextStatus })
      if (!result.success) {
        toast.error(result.error?.message ?? '상태 변경에 실패했습니다.')
        return
      }
      toast.success(
        `상태를 "${INVOICE_STATUS_LABEL[nextStatus]}"(으)로 변경했습니다.`
      )
      router.refresh()
    } catch (error) {
      console.error('견적서 상태 변경 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-32" aria-label="상태 변경">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {INVOICE_STATUS_VALUES.map(value => (
          <SelectItem key={value} value={value}>
            {INVOICE_STATUS_LABEL[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
