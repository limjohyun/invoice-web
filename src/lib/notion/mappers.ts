import { isFullPage } from '@notionhq/client'
import type {
  GetPageResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client'
import type {
  Client,
  Currency,
  Invoice,
  InvoiceStatus,
  Item,
  Template,
  TemplateItem,
} from './types'

/**
 * Notion 리치 텍스트 배열을 순수 문자열로 변환합니다.
 * queries.ts(예: 데이터베이스 검색 결과의 title)에서도 재사용하기 위해 export합니다.
 */
export function extractPlainText(
  richText: RichTextItemResponse[] | undefined
): string {
  return (richText ?? []).map(item => item.plain_text).join('')
}

/**
 * Notion API 응답(GetPageResponse 등)이 전체 페이지 정보를 담고 있는지 확인 후 반환합니다.
 * Integration 권한이 부족하면 Partial 응답만 오는데, 이 경우 매핑이 불가능하므로 에러로 처리합니다.
 */
function assertFullPage(
  response: GetPageResponse | PageObjectResponse
): PageObjectResponse {
  if (isFullPage(response)) {
    return response
  }
  throw new Error(
    'Notion 페이지 정보를 불러올 수 없습니다. Integration 권한(Full access) 설정을 확인해주세요.'
  )
}

/**
 * Notion Invoices DB의 한 페이지(PageObjectResponse)를 Invoice 도메인 타입으로 변환합니다.
 * 속성명은 docs/guides/notion-schema.md의 Invoices 스키마를 기준으로 합니다.
 */
export function mapPageToInvoice(
  response: GetPageResponse | PageObjectResponse
): Invoice {
  const page = assertFullPage(response)
  const props = page.properties

  const titleProp = props['Title']
  const title =
    titleProp?.type === 'title' ? extractPlainText(titleProp.title) : ''

  const clientNameProp = props['Client Name']
  const clientName =
    clientNameProp?.type === 'rich_text'
      ? extractPlainText(clientNameProp.rich_text)
      : ''

  const clientEmailProp = props['Client Email']
  const clientEmail =
    clientEmailProp?.type === 'email' ? clientEmailProp.email : null

  const clientPhoneProp = props['Client Phone']
  const clientPhone =
    clientPhoneProp?.type === 'phone_number'
      ? clientPhoneProp.phone_number
      : null

  const clientAddressProp = props['Client Address']
  const clientAddress =
    clientAddressProp?.type === 'rich_text'
      ? extractPlainText(clientAddressProp.rich_text) || null
      : null

  const clientRegistrationProp = props['Client Registration#']
  const clientRegistrationNumber =
    clientRegistrationProp?.type === 'rich_text'
      ? extractPlainText(clientRegistrationProp.rich_text) || null
      : null

  const totalAmountProp = props['Total Amount']
  let totalAmount = 0
  if (
    totalAmountProp?.type === 'rollup' &&
    totalAmountProp.rollup.type === 'number'
  ) {
    totalAmount = totalAmountProp.rollup.number ?? 0
  }

  const currencyProp = props['Currency']
  const currency: Currency =
    currencyProp?.type === 'select' && currencyProp.select
      ? (currencyProp.select.name as Currency)
      : 'KRW'

  const statusProp = props['Status']
  const status: InvoiceStatus =
    statusProp?.type === 'select' && statusProp.select
      ? (statusProp.select.name as InvoiceStatus)
      : 'Draft'

  const dueDateProp = props['Due Date']
  const dueDate =
    dueDateProp?.type === 'date' ? (dueDateProp.date?.start ?? null) : null

  const notesProp = props['Notes']
  const notes =
    notesProp?.type === 'rich_text'
      ? extractPlainText(notesProp.rich_text) || null
      : null

  return {
    id: page.id,
    title,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    clientRegistrationNumber,
    totalAmount,
    currency,
    status,
    dueDate,
    notes,
    createdAt: page.created_time,
    modifiedAt: page.last_edited_time,
  }
}

/**
 * Notion Items DB의 한 페이지(PageObjectResponse)를 Item 도메인 타입으로 변환합니다.
 * 속성명은 docs/guides/notion-schema.md의 Items 스키마를 기준으로 합니다.
 */
export function mapPageToItem(
  response: GetPageResponse | PageObjectResponse
): Item {
  const page = assertFullPage(response)
  const props = page.properties

  const nameProp = props['Name']
  const name =
    nameProp?.type === 'title' ? extractPlainText(nameProp.title) : ''

  const invoiceProp = props['Invoice']
  const invoiceId =
    invoiceProp?.type === 'relation' && invoiceProp.relation.length > 0
      ? invoiceProp.relation[0].id
      : ''

  const descriptionProp = props['Description']
  const description =
    descriptionProp?.type === 'rich_text'
      ? extractPlainText(descriptionProp.rich_text) || null
      : null

  const quantityProp = props['Quantity']
  const quantity =
    quantityProp?.type === 'number' ? (quantityProp.number ?? 0) : 0

  const unitPriceProp = props['Unit Price']
  const unitPrice =
    unitPriceProp?.type === 'number' ? (unitPriceProp.number ?? 0) : 0

  const taxRateProp = props['Tax Rate']
  const taxRate = taxRateProp?.type === 'number' ? taxRateProp.number : null

  const sortOrderProp = props['Sort Order']
  const sortOrder =
    sortOrderProp?.type === 'number' ? sortOrderProp.number : null

  const amountProp = props['Amount']
  let amount = 0
  if (amountProp?.type === 'formula' && amountProp.formula.type === 'number') {
    amount = amountProp.formula.number ?? 0
  }

  return {
    id: page.id,
    invoiceId,
    name,
    description,
    quantity,
    unitPrice,
    taxRate,
    sortOrder,
    amount,
    createdAt: page.created_time,
    modifiedAt: page.last_edited_time,
  }
}

/**
 * Notion Clients DB의 한 페이지(PageObjectResponse)를 Client 도메인 타입으로 변환합니다.
 */
export function mapPageToClient(
  response: GetPageResponse | PageObjectResponse
): Client {
  const page = assertFullPage(response)
  const props = page.properties

  const nameProp = props['거래처명']
  const name =
    nameProp?.type === 'title' ? extractPlainText(nameProp.title) : ''

  const contactPersonProp = props['담당자']
  const contactPerson =
    contactPersonProp?.type === 'rich_text'
      ? extractPlainText(contactPersonProp.rich_text) || null
      : null

  const emailProp = props['이메일']
  const email = emailProp?.type === 'email' ? emailProp.email : null

  const phoneProp = props['전화번호']
  const phone =
    phoneProp?.type === 'phone_number' ? phoneProp.phone_number : null

  const addressProp = props['주소']
  const address =
    addressProp?.type === 'rich_text'
      ? extractPlainText(addressProp.rich_text) || null
      : null

  const registrationProp = props['사업자등록번호']
  const registrationNumber =
    registrationProp?.type === 'rich_text'
      ? extractPlainText(registrationProp.rich_text) || null
      : null

  const notesProp = props['메모']
  const notes =
    notesProp?.type === 'rich_text'
      ? extractPlainText(notesProp.rich_text) || null
      : null

  return {
    id: page.id,
    name,
    contactPerson,
    email,
    phone,
    address,
    registrationNumber,
    notes,
    createdAt: page.created_time,
    modifiedAt: page.last_edited_time,
  }
}

/**
 * 템플릿의 품목(JSON 직렬화된 rich_text)을 안전하게 파싱합니다.
 * 파싱에 실패하거나 형식이 배열이 아니면 빈 배열로 폴백합니다.
 */
function parseTemplateItems(raw: string): TemplateItem[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is TemplateItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.quantity === 'number' &&
        typeof item.unitPrice === 'number'
    )
  } catch {
    return []
  }
}

/**
 * Notion Templates DB의 한 페이지(PageObjectResponse)를 Template 도메인 타입으로 변환합니다.
 * 품목은 Notion 페이지가 아니라 rich_text에 JSON 문자열로 직렬화되어 저장됩니다.
 */
export function mapPageToTemplate(
  response: GetPageResponse | PageObjectResponse
): Template {
  const page = assertFullPage(response)
  const props = page.properties

  const nameProp = props['템플릿명']
  const name =
    nameProp?.type === 'title' ? extractPlainText(nameProp.title) : ''

  const descriptionProp = props['설명']
  const description =
    descriptionProp?.type === 'rich_text'
      ? extractPlainText(descriptionProp.rich_text) || null
      : null

  const itemsProp = props['품목']
  const items =
    itemsProp?.type === 'rich_text'
      ? parseTemplateItems(extractPlainText(itemsProp.rich_text))
      : []

  return {
    id: page.id,
    name,
    description,
    items,
    createdAt: page.created_time,
    modifiedAt: page.last_edited_time,
  }
}
