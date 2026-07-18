import Link from 'next/link'

import type { Invoice } from '@/lib/notion/types'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge'

function formatAmount(amount: number, currency: string): string {
  return `${new Intl.NumberFormat('ko-KR').format(amount)} ${currency}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** 대시보드(F001) 견적서 목록 테이블. 마지막 동기화 시각은 Notion 페이지의 최종 수정 시각을 그대로 사용한다. */
export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>거래처</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">합계</TableHead>
              <TableHead>마지막 동기화</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/invoice/${invoice.id}`}
                    className="hover:underline"
                  >
                    {invoice.title}
                  </Link>
                </TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(invoice.totalAmount, invoice.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDateTime(invoice.modifiedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
