/**
 * 견적서 금액 계산 순수 함수
 * Notion 쪽 실제 값(Item.amount = Formula, Invoice.totalAmount = Rollup)은
 * 저장 후 Notion이 자동 계산하므로 서버에서 재계산해 저장하지 않는다.
 * 이 함수들은 저장 전 폼 화면에 동일한 값을 실시간으로 미리 보여주기 위한 용도다.
 */

export interface InvoiceItemAmountInput {
  quantity: number
  unitPrice: number
  taxRate?: number
}

/** Notion Item.Amount 포뮬러(Quantity × Unit Price)와 동일한 계산 */
export function calculateItemAmount(
  quantity: number,
  unitPrice: number
): number {
  return quantity * unitPrice
}

/** 세율(%)이 적용된 세액 계산 */
export function calculateItemTax(amount: number, taxRate?: number): number {
  if (!taxRate) return 0
  return amount * (taxRate / 100)
}

export interface InvoiceTotals {
  subtotal: number
  tax: number
  total: number
}

/** 품목 목록으로부터 Notion Invoice.Total Amount 롤업과 동일한 합계를 계산 */
export function calculateInvoiceTotal(
  items: InvoiceItemAmountInput[]
): InvoiceTotals {
  return items.reduce<InvoiceTotals>(
    (totals, item) => {
      const amount = calculateItemAmount(item.quantity, item.unitPrice)
      const tax = calculateItemTax(amount, item.taxRate)
      return {
        subtotal: totals.subtotal + amount,
        tax: totals.tax + tax,
        total: totals.total + amount + tax,
      }
    },
    { subtotal: 0, tax: 0, total: 0 }
  )
}
