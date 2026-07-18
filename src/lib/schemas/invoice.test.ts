import { describe, expect, it } from 'vitest'
import { invoiceItemSchema, invoiceSchema } from '@/lib/schemas/invoice'

/** 검증을 통과하는 기본 품목 데이터 */
const validItem = {
  name: '웹사이트 개발',
  quantity: 1,
  unitPrice: 100000,
  taxRate: 10,
}

/** 검증을 통과하는 기본 견적서 데이터 */
const validInvoice = {
  title: '2026년 7월 견적서',
  clientName: '주식회사 테스트',
  clientEmail: 'client@example.com',
  currency: 'KRW',
  status: 'Draft',
  items: [validItem],
}

describe('invoiceItemSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    const result = invoiceItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('quantity가 0이면 실패한다', () => {
    const result = invoiceItemSchema.safeParse({ ...validItem, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('quantity가 음수면 실패한다', () => {
    const result = invoiceItemSchema.safeParse({ ...validItem, quantity: -1 })
    expect(result.success).toBe(false)
  })

  it('unitPrice가 음수면 실패한다', () => {
    const result = invoiceItemSchema.safeParse({
      ...validItem,
      unitPrice: -100,
    })
    expect(result.success).toBe(false)
  })

  it('unitPrice가 0이면 통과한다', () => {
    const result = invoiceItemSchema.safeParse({ ...validItem, unitPrice: 0 })
    expect(result.success).toBe(true)
  })

  it('taxRate가 100을 초과하면 실패한다', () => {
    const result = invoiceItemSchema.safeParse({
      ...validItem,
      taxRate: 101,
    })
    expect(result.success).toBe(false)
  })

  it('taxRate가 정확히 100이면 통과한다', () => {
    const result = invoiceItemSchema.safeParse({
      ...validItem,
      taxRate: 100,
    })
    expect(result.success).toBe(true)
  })

  it('taxRate를 생략해도 통과한다', () => {
    const itemWithoutTaxRate = {
      name: validItem.name,
      quantity: validItem.quantity,
      unitPrice: validItem.unitPrice,
    }
    const result = invoiceItemSchema.safeParse(itemWithoutTaxRate)
    expect(result.success).toBe(true)
  })
})

describe('invoiceSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    const result = invoiceSchema.safeParse(validInvoice)
    expect(result.success).toBe(true)
  })

  it('title이 빈 문자열이면 실패한다', () => {
    const result = invoiceSchema.safeParse({ ...validInvoice, title: '' })
    expect(result.success).toBe(false)
  })

  it('clientName이 빈 문자열이면 실패한다', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      clientName: '',
    })
    expect(result.success).toBe(false)
  })

  it('clientEmail 형식이 잘못되면 실패한다', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      clientEmail: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('clientEmail이 빈 문자열이면 통과한다', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      clientEmail: '',
    })
    expect(result.success).toBe(true)
  })

  it('items가 빈 배열이면 실패한다', () => {
    const result = invoiceSchema.safeParse({ ...validInvoice, items: [] })
    expect(result.success).toBe(false)
  })

  it('currency가 허용되지 않은 값이면 실패한다', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      currency: 'GBP',
    })
    expect(result.success).toBe(false)
  })

  it('status가 허용되지 않은 값이면 실패한다', () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      status: 'Unknown',
    })
    expect(result.success).toBe(false)
  })
})
