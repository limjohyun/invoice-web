import { z } from 'zod'

/** 템플릿 품목 1건 (invoiceItemSchema와 달리 id/sortOrder 없음 — Notion 페이지가 아닌 JSON 스냅샷) */
export const templateItemSchema = z.object({
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
})

export type TemplateItemFormData = z.infer<typeof templateItemSchema>

/** 템플릿 등록/수정 폼 검증 스키마 (F013) */
export const templateSchema = z.object({
  name: z.string().min(1, '템플릿명을 입력해 주세요.'),
  description: z.string().optional(),
  items: z
    .array(templateItemSchema)
    .min(1, '품목을 최소 1개 이상 추가해 주세요.')
    .max(20, '품목은 최대 20개까지 등록할 수 있습니다.'),
})

export type TemplateFormData = z.infer<typeof templateSchema>
