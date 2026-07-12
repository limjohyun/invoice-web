import { z } from 'zod'
import { CURRENCY_VALUES, INVOICE_STATUS_VALUES } from '@/lib/notion/types'

/** 견적서 내 품목 1건에 대한 입력 검증 스키마 */
export const invoiceItemSchema = z.object({
  name: z.string().min(1, '품목명을 입력해 주세요.'),
  description: z.string().optional(),
  quantity: z
    .number({ error: '수량을 입력해 주세요.' })
    .min(1, '수량은 1개 이상이어야 합니다.'),
  unitPrice: z
    .number({ error: '단가를 입력해 주세요.' })
    .min(0, '단가는 0 이상이어야 합니다.'),
  taxRate: z
    .number()
    .min(0, '세율은 0% 이상이어야 합니다.')
    .max(100, '세율은 100%를 초과할 수 없습니다.')
    .optional(),
  sortOrder: z.number().optional(),
})

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>

/** 견적서 작성/수정 페이지 폼 검증 스키마 (F002, F004) */
export const invoiceSchema = z.object({
  title: z.string().min(1, '견적서 제목을 입력해 주세요.'),
  clientName: z.string().min(1, '거래처명을 입력해 주세요.'),
  clientEmail: z
    .union([
      z.literal(''),
      z.string().email('올바른 이메일 주소를 입력해 주세요.'),
    ])
    .optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientRegistrationNumber: z.string().optional(),
  currency: z.enum(CURRENCY_VALUES, { error: '통화를 선택해 주세요.' }),
  status: z.enum(INVOICE_STATUS_VALUES, { error: '상태를 선택해 주세요.' }),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(invoiceItemSchema)
    .min(1, '품목을 최소 1개 이상 추가해 주세요.'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
