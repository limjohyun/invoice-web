import { describe, expect, it } from 'vitest'
import { templateItemSchema, templateSchema } from '@/lib/schemas/template'

/** 검증을 통과하는 기본 템플릿 품목 데이터 */
const validItem = {
  name: '웹사이트 개발',
  quantity: 1,
  unitPrice: 100000,
  taxRate: 10,
}

/** 검증을 통과하는 기본 템플릿 데이터 */
const validTemplate = {
  name: '기본 템플릿',
  description: '자주 쓰는 견적 템플릿',
  items: [validItem],
}

describe('templateItemSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    const result = templateItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('quantity가 0이면 실패한다', () => {
    const result = templateItemSchema.safeParse({
      ...validItem,
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('unitPrice가 음수면 실패한다', () => {
    const result = templateItemSchema.safeParse({
      ...validItem,
      unitPrice: -1,
    })
    expect(result.success).toBe(false)
  })

  it('unitPrice가 0이면 통과한다', () => {
    const result = templateItemSchema.safeParse({
      ...validItem,
      unitPrice: 0,
    })
    expect(result.success).toBe(true)
  })
})

describe('templateSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    const result = templateSchema.safeParse(validTemplate)
    expect(result.success).toBe(true)
  })

  it('name이 빈 문자열이면 실패한다', () => {
    const result = templateSchema.safeParse({ ...validTemplate, name: '' })
    expect(result.success).toBe(false)
  })

  it('items가 0개이면 실패한다', () => {
    const result = templateSchema.safeParse({ ...validTemplate, items: [] })
    expect(result.success).toBe(false)
  })

  it('items가 20개이면 통과한다', () => {
    const items = Array.from({ length: 20 }, () => ({ ...validItem }))
    const result = templateSchema.safeParse({ ...validTemplate, items })
    expect(result.success).toBe(true)
  })

  it('items가 21개(20개 초과)이면 실패한다', () => {
    const items = Array.from({ length: 21 }, () => ({ ...validItem }))
    const result = templateSchema.safeParse({ ...validTemplate, items })
    expect(result.success).toBe(false)
  })
})
