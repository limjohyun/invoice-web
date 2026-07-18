import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '@/lib/notion/types'

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  Draft: '초안',
  Sent: '발송됨',
  Approved: '승인됨',
  Paid: '결제완료',
  Rejected: '거절됨',
  Cancelled: '취소됨',
}

const STATUS_VARIANT: Record<
  InvoiceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  Draft: 'secondary',
  Sent: 'default',
  Approved: 'default',
  Paid: 'default',
  Rejected: 'destructive',
  Cancelled: 'outline',
}

export { STATUS_LABEL as INVOICE_STATUS_LABEL }

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
