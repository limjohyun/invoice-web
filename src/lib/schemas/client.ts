import { z } from 'zod'

/** 거래처 등록/수정 폼 검증 스키마 (F012) */
export const clientSchema = z.object({
  name: z.string().min(1, '거래처명을 입력해 주세요.'),
  contactPerson: z.string().optional(),
  email: z
    .union([
      z.literal(''),
      z.string().email('올바른 이메일 주소를 입력해 주세요.'),
    ])
    .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  registrationNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
