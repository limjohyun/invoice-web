import { describe, expect, it } from 'vitest'
import {
  calculateInvoiceTotal,
  calculateItemAmount,
  calculateItemTax,
} from '@/lib/invoice/calculate'

describe('calculateItemAmount', () => {
  it('수량과 단가를 곱한 금액을 반환한다', () => {
    expect(calculateItemAmount(3, 1000)).toBe(3000)
  })

  it('수량이 0이면 금액도 0이다', () => {
    expect(calculateItemAmount(0, 1000)).toBe(0)
  })

  it('단가가 0이면 금액도 0이다', () => {
    expect(calculateItemAmount(5, 0)).toBe(0)
  })

  it('소수점 단가도 정확히 계산한다', () => {
    expect(calculateItemAmount(3, 10.5)).toBeCloseTo(31.5)
  })
})

describe('calculateItemTax', () => {
  it('세율이 적용된 세액을 계산한다', () => {
    expect(calculateItemTax(1000, 10)).toBe(100)
  })

  it('세율이 0이면 세액도 0이다', () => {
    expect(calculateItemTax(1000, 0)).toBe(0)
  })

  it('세율이 100이면 금액 전체가 세액이 된다', () => {
    expect(calculateItemTax(1000, 100)).toBe(1000)
  })

  it('세율이 undefined이면 세액은 0이다', () => {
    expect(calculateItemTax(1000, undefined)).toBe(0)
  })

  it('세율 미지정(인자 생략) 시에도 세액은 0이다', () => {
    expect(calculateItemTax(1000)).toBe(0)
  })
})

describe('calculateInvoiceTotal', () => {
  it('단일 품목의 subtotal/tax/total을 정확히 계산한다', () => {
    const result = calculateInvoiceTotal([
      { quantity: 2, unitPrice: 5000, taxRate: 10 },
    ])

    expect(result).toEqual({ subtotal: 10000, tax: 1000, total: 11000 })
  })

  it('여러 품목의 합계를 정확히 계산한다', () => {
    const result = calculateInvoiceTotal([
      { quantity: 2, unitPrice: 5000, taxRate: 10 },
      { quantity: 1, unitPrice: 3000, taxRate: 0 },
      { quantity: 3, unitPrice: 1000 },
    ])

    // subtotal: 10000 + 3000 + 3000 = 16000
    // tax: 1000 + 0 + 0 = 1000 (세율 미지정 품목은 세액 0)
    expect(result).toEqual({ subtotal: 16000, tax: 1000, total: 17000 })
  })

  it('품목이 없으면 모든 값이 0이다', () => {
    expect(calculateInvoiceTotal([])).toEqual({
      subtotal: 0,
      tax: 0,
      total: 0,
    })
  })

  it('소수점 단가가 섞여도 subtotal/tax/total을 정확히 계산한다', () => {
    const result = calculateInvoiceTotal([
      { quantity: 2, unitPrice: 10.5, taxRate: 10 },
    ])

    expect(result.subtotal).toBeCloseTo(21)
    expect(result.tax).toBeCloseTo(2.1)
    expect(result.total).toBeCloseTo(23.1)
  })
})
