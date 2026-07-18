'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { invoiceSchema, type InvoiceFormData } from '@/lib/schemas/invoice'
import { CURRENCY_VALUES, INVOICE_STATUS_VALUES } from '@/lib/notion/types'
import {
  createInvoiceWithItems,
  updateInvoiceWithItems,
  type InvoiceItemDraftWithId,
} from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { INVOICE_STATUS_LABEL } from '@/components/invoice/invoice-status-badge'
import { InvoiceItemRow } from '@/components/invoice/invoice-item-row'
import { InvoiceTotals } from '@/components/invoice/invoice-totals'
import { DueDatePicker } from '@/components/invoice/due-date-picker'

const EMPTY_ITEM = {
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: undefined,
  sortOrder: 0,
} satisfies InvoiceFormData['items'][number]

type InvoiceFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; invoiceId: string; defaultValues: InvoiceFormData }

/**
 * 견적서 작성(F002)/수정(F004) 공용 폼.
 * items는 useFieldArray로 반복 입력을 받고, 제출 시 조합 Server Action
 * (createInvoiceWithItems/updateInvoiceWithItems)으로 견적서 헤더+품목을 한 번에 저장한다.
 */
export function InvoiceForm(props: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues:
      props.mode === 'edit'
        ? props.defaultValues
        : {
            title: '',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            clientAddress: '',
            clientRegistrationNumber: '',
            currency: 'KRW',
            status: 'Draft',
            dueDate: '',
            notes: '',
            items: [EMPTY_ITEM],
          },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const itemsError = form.formState.errors.items?.message

  async function onSubmit(data: InvoiceFormData) {
    setIsSubmitting(true)
    try {
      const invoiceInput = {
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        clientAddress: data.clientAddress || undefined,
        clientRegistrationNumber: data.clientRegistrationNumber || undefined,
        currency: data.currency,
        status: data.status,
        dueDate: data.dueDate || undefined,
        notes: data.notes || undefined,
      }

      const items: InvoiceItemDraftWithId[] = data.items.map((item, index) => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        sortOrder: index,
      }))

      const result =
        props.mode === 'create'
          ? await createInvoiceWithItems(invoiceInput, items)
          : await updateInvoiceWithItems(props.invoiceId, invoiceInput, items)

      if (!result.data) {
        toast.error(result.error?.message ?? '저장에 실패했습니다.')
        return
      }

      if (!result.success) {
        // partial_item_failure: 견적서 헤더는 저장됐지만 일부 품목 처리에 실패한 경우
        toast.error(result.error?.message ?? '일부 품목 저장에 실패했습니다.')
      } else {
        toast.success(
          props.mode === 'create'
            ? '견적서를 생성했습니다.'
            : '견적서를 수정했습니다.'
        )
      }

      router.push(`/invoice/${result.data.id}`)
      router.refresh()
    } catch (error) {
      console.error('견적서 저장 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>견적서 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 2026-07-INV-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>거래처명</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC 주식회사" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>거래처 이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@abc.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>거래처 연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="02-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사업자등록번호</FormLabel>
                  <FormControl>
                    <Input placeholder="123-45-67890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>거래처 주소</FormLabel>
                  <FormControl>
                    <Input placeholder="서울시 강남구 ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>통화</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_VALUES.map(currency => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVOICE_STATUS_VALUES.map(status => (
                        <SelectItem key={status} value={status}>
                          {INVOICE_STATUS_LABEL[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기한</FormLabel>
                  <FormControl>
                    <DueDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea placeholder="메모 (선택)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>품목</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => append({ ...EMPTY_ITEM })}
            >
              <Plus className="size-4" />
              품목 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">품목명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-24">수량</TableHead>
                  <TableHead className="w-32">단가</TableHead>
                  <TableHead className="w-24">세율(%)</TableHead>
                  <TableHead className="w-28 text-right">금액</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <InvoiceItemRow
                    key={field.id}
                    control={form.control}
                    index={index}
                    onRemove={() => remove(index)}
                    removable={fields.length > 1}
                  />
                ))}
              </TableBody>
            </Table>
            {itemsError && (
              <p className="text-destructive text-sm">{itemsError}</p>
            )}
            <InvoiceTotals
              control={form.control}
              currency={form.watch('currency')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? '저장 중...'
              : props.mode === 'create'
                ? '견적서 생성'
                : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
