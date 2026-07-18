import Link from 'next/link'
import { Download, Pencil } from 'lucide-react'

import type { InvoiceWithItems } from '@/lib/notion/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge'
import { DeleteInvoiceButton } from '@/components/invoice/delete-invoice-button'

function formatAmount(amount: number, currency: string): string {
  return `${new Intl.NumberFormat('ko-KR').format(amount)} ${currency}`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR')
}

/** 견적서 상세 페이지(F003) 본문. 수정(F004)/삭제(F005) 진입점도 함께 표시한다. */
export function InvoiceDetail({ invoice }: { invoice: InvoiceWithItems }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{invoice.title}</h1>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoice/${invoice.id}/pdf`} download>
            <Button variant="outline" className="gap-2">
              <Download className="size-4" aria-hidden="true" />
              PDF 다운로드
            </Button>
          </a>
          <Link href={`/invoice/${invoice.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="size-4" aria-hidden="true" />
              수정
            </Button>
          </Link>
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래처 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">거래처명 </span>
            {invoice.clientName}
          </div>
          {invoice.clientEmail && (
            <div>
              <span className="text-muted-foreground">이메일 </span>
              {invoice.clientEmail}
            </div>
          )}
          {invoice.clientPhone && (
            <div>
              <span className="text-muted-foreground">연락처 </span>
              {invoice.clientPhone}
            </div>
          )}
          {invoice.clientRegistrationNumber && (
            <div>
              <span className="text-muted-foreground">사업자등록번호 </span>
              {invoice.clientRegistrationNumber}
            </div>
          )}
          {invoice.clientAddress && (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">주소 </span>
              {invoice.clientAddress}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">기한 </span>
            {formatDate(invoice.dueDate)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>품목</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>품목명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead className="text-right">단가</TableHead>
                <TableHead className="text-right">세율</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.taxRate ? `${item.taxRate}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="flex justify-end">
            <div className="flex w-56 justify-between text-base font-semibold">
              <span>합계</span>
              <span>{formatAmount(invoice.totalAmount, invoice.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>메모</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">
            {invoice.notes}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
