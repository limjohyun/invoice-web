/**
 * Notion 기반 견적서/품목 도메인 타입 정의
 * docs/guides/notion-schema.md의 Invoices / Items 데이터베이스 스키마를 그대로 반영합니다.
 */

/** 견적서 통화 (Notion Currency Select 옵션) */
export const CURRENCY_VALUES = ['KRW', 'USD', 'JPY', 'EUR'] as const
export type Currency = (typeof CURRENCY_VALUES)[number]

/** 견적서 상태 (Notion Status Select 옵션) */
export const INVOICE_STATUS_VALUES = [
  'Draft',
  'Sent',
  'Approved',
  'Paid',
  'Rejected',
  'Cancelled',
] as const
export type InvoiceStatus = (typeof INVOICE_STATUS_VALUES)[number]

/** 견적서 (Invoices DB 1개 페이지) */
export interface Invoice {
  id: string
  title: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  clientAddress: string | null
  clientRegistrationNumber: string | null
  /** Notion Rollup(Sum)으로 자동 계산되는 값 (서버에서 재계산하지 않음) */
  totalAmount: number
  currency: Currency
  status: InvoiceStatus
  dueDate: string | null
  notes: string | null
  createdAt: string
  modifiedAt: string
}

/** 견적서 상세 조회 시 품목 목록을 포함한 형태 */
export interface InvoiceWithItems extends Invoice {
  items: Item[]
}

/** 품목 (Items DB 1개 페이지) */
export interface Item {
  id: string
  /** 소속 견적서(Invoices) 페이지 ID (Relation) */
  invoiceId: string
  name: string
  description: string | null
  quantity: number
  unitPrice: number
  taxRate: number | null
  sortOrder: number | null
  /** Notion Formula(Quantity × Unit Price)로 자동 계산되는 값 */
  amount: number
  createdAt: string
  modifiedAt: string
}

/** 견적서 생성 입력 (Server Action / react-hook-form에서 전달) */
export interface CreateInvoiceInput {
  title: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  clientRegistrationNumber?: string
  currency: Currency
  status: InvoiceStatus
  dueDate?: string
  notes?: string
}

/** 견적서 수정 입력 (부분 업데이트 허용) */
export type UpdateInvoiceInput = Partial<CreateInvoiceInput>

/** 품목 생성 입력 */
export interface CreateItemInput {
  invoiceId: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  taxRate?: number
  sortOrder?: number
}

/** 품목 수정 입력 (소속 견적서는 변경 불가) */
export type UpdateItemInput = Partial<Omit<CreateItemInput, 'invoiceId'>>

/**
 * 사용자별 Notion 연동 정보
 * profiles 테이블(Supabase)에 저장되며, 사용자가 F011 설정 페이지에서 등록합니다.
 */
export interface NotionConnection {
  accessToken: string
  invoiceDatabaseId: string
  itemsDatabaseId: string
}
