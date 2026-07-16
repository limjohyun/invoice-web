import { isFullDatabase, isFullDataSource, isFullPage } from '@notionhq/client'
import type {
  Client,
  CreatePageParameters,
  PageObjectResponse,
  QueryDataSourceParameters,
} from '@notionhq/client'
import { NotionOperationError, withRetry } from './errors'
import { extractPlainText, mapPageToInvoice, mapPageToItem } from './mappers'
import type {
  CreateInvoiceInput,
  CreateItemInput,
  Invoice,
  Item,
  UpdateInvoiceInput,
  UpdateItemInput,
} from './types'

/** Notion 페이지 생성/수정 요청의 properties 값 타입 (SDK 내부 타입 재사용) */
type NotionPropertyValue = NonNullable<
  CreatePageParameters['properties']
>[string]
type NotionProperties = Record<string, NotionPropertyValue>

/**
 * 데이터 소스를 끝까지 페이지네이션하며 모든 결과를 수집합니다.
 *
 * `@notionhq/client`가 제공하는 `collectPaginatedAPI` 헬퍼는 `QueryDataSourceParameters`의
 * `start_cursor`(string | null | undefined)가 제네릭 제약 `PaginatedArgs`(string | undefined)와
 * 구조적으로 맞지 않아 타입 에러가 발생하므로, 동일한 동작을 하는 루프를 직접 구현합니다.
 */
async function collectAllDataSourcePages(
  client: Client,
  args: QueryDataSourceParameters
): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await client.dataSources.query({
      ...args,
      start_cursor: cursor,
    })
    pages.push(...response.results.filter(isFullPage))
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return pages
}

/**
 * database_id → data_source_id 캐시
 * 하나의 데이터베이스가 갖는 data_source_id는 불변이므로 프로세스 메모리에 캐싱해
 * 요청마다 databases.retrieve를 호출하는 비용을 절약합니다.
 * (동일 DB의 data source ID는 어떤 사용자 토큰으로 조회해도 같습니다.)
 */
const dataSourceIdCache = new Map<string, string>()

/**
 * 데이터베이스 ID로 내부 Data Source ID를 조회합니다.
 * Notion API(2025-09-03~)는 조회/생성 시 데이터베이스가 아닌 "데이터 소스" 단위로 동작하지만,
 * 사용자 설정(F011)과 문서(docs/guides/notion-schema.md)는 단순화를 위해 데이터베이스 ID만 다룹니다.
 * 우리가 사용하는 Invoices/Items DB는 단일 데이터 소스 구조이므로 첫 번째 데이터 소스를 사용합니다.
 *
 * @param client Notion 클라이언트
 * @param databaseId Notion 데이터베이스 ID
 * @returns 해당 데이터베이스의 data_source_id
 * @throws NotionOperationError data source를 찾지 못한 경우(config_error)
 */
async function resolveDataSourceId(
  client: Client,
  databaseId: string
): Promise<string> {
  const cached = dataSourceIdCache.get(databaseId)
  if (cached) {
    return cached
  }

  const database = await withRetry(
    () => client.databases.retrieve({ database_id: databaseId }),
    'databases.retrieve'
  )

  if (!isFullDatabase(database) || database.data_sources.length === 0) {
    throw new NotionOperationError(
      'config_error',
      'Notion 데이터베이스 정보를 찾을 수 없습니다. 설정 페이지에서 데이터베이스 ID와 Integration 공유(Full access) 설정을 확인해주세요.'
    )
  }

  const dataSourceId = database.data_sources[0].id
  dataSourceIdCache.set(databaseId, dataSourceId)
  return dataSourceId
}

/**
 * Invoice 입력값을 Notion Invoices DB 속성 요청 객체로 변환합니다.
 * 값이 `undefined`인 필드는 변경하지 않음(부분 업데이트)을 의미하므로 생략합니다.
 */
function buildInvoiceProperties(
  input: Partial<CreateInvoiceInput>
): NotionProperties {
  const properties: NotionProperties = {}

  if (input.title !== undefined) {
    properties['Title'] = { title: [{ text: { content: input.title } }] }
  }
  if (input.clientName !== undefined) {
    properties['Client Name'] = {
      rich_text: [{ text: { content: input.clientName } }],
    }
  }
  if (input.clientEmail !== undefined) {
    properties['Client Email'] = { email: input.clientEmail || null }
  }
  if (input.clientPhone !== undefined) {
    properties['Client Phone'] = { phone_number: input.clientPhone || null }
  }
  if (input.clientAddress !== undefined) {
    properties['Client Address'] = {
      rich_text: [{ text: { content: input.clientAddress } }],
    }
  }
  if (input.clientRegistrationNumber !== undefined) {
    properties['Client Registration#'] = {
      rich_text: [{ text: { content: input.clientRegistrationNumber } }],
    }
  }
  if (input.currency !== undefined) {
    properties['Currency'] = { select: { name: input.currency } }
  }
  if (input.status !== undefined) {
    properties['Status'] = { select: { name: input.status } }
  }
  if (input.dueDate !== undefined) {
    properties['Due Date'] = input.dueDate
      ? { date: { start: input.dueDate } }
      : { date: null }
  }
  if (input.notes !== undefined) {
    properties['Notes'] = { rich_text: [{ text: { content: input.notes } }] }
  }

  return properties
}

/** Item 입력값을 Notion Items DB 속성 요청 객체로 변환합니다. */
function buildItemProperties(
  input: Partial<CreateItemInput>
): NotionProperties {
  const properties: NotionProperties = {}

  if (input.name !== undefined) {
    properties['Name'] = { title: [{ text: { content: input.name } }] }
  }
  if (input.invoiceId !== undefined) {
    properties['Invoice'] = { relation: [{ id: input.invoiceId }] }
  }
  if (input.description !== undefined) {
    properties['Description'] = {
      rich_text: [{ text: { content: input.description } }],
    }
  }
  if (input.quantity !== undefined) {
    properties['Quantity'] = { number: input.quantity }
  }
  if (input.unitPrice !== undefined) {
    properties['Unit Price'] = { number: input.unitPrice }
  }
  if (input.taxRate !== undefined) {
    properties['Tax Rate'] = { number: input.taxRate ?? null }
  }
  if (input.sortOrder !== undefined) {
    properties['Sort Order'] = { number: input.sortOrder ?? null }
  }

  return properties
}

/**
 * 견적서 목록 조회 (최근 생성 순)
 * collectPaginatedAPI로 100건이 넘는 결과도 모두 수집합니다.
 * @param client Notion 클라이언트
 * @param invoiceDatabaseId Invoices 데이터베이스 ID
 */
export async function queryInvoices(
  client: Client,
  invoiceDatabaseId: string
): Promise<Invoice[]> {
  const dataSourceId = await resolveDataSourceId(client, invoiceDatabaseId)

  const queryArgs: QueryDataSourceParameters = {
    data_source_id: dataSourceId,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  }
  const pages = await withRetry(
    () => collectAllDataSourcePages(client, queryArgs),
    'dataSources.query(invoices)'
  )

  return pages.map(mapPageToInvoice)
}

/** 견적서 단건 조회 */
export async function retrieveInvoice(
  client: Client,
  invoiceId: string
): Promise<Invoice> {
  const response = await withRetry(
    () => client.pages.retrieve({ page_id: invoiceId }),
    'pages.retrieve(invoice)'
  )
  return mapPageToInvoice(response)
}

/** 견적서 생성 */
export async function createInvoicePage(
  client: Client,
  invoiceDatabaseId: string,
  input: CreateInvoiceInput
): Promise<Invoice> {
  const dataSourceId = await resolveDataSourceId(client, invoiceDatabaseId)

  const response = await withRetry(
    () =>
      client.pages.create({
        parent: { data_source_id: dataSourceId },
        properties: buildInvoiceProperties(input),
      }),
    'pages.create(invoice)'
  )

  return mapPageToInvoice(response)
}

/** 견적서 수정 (부분 업데이트) */
export async function updateInvoicePage(
  client: Client,
  invoiceId: string,
  input: UpdateInvoiceInput
): Promise<Invoice> {
  const response = await withRetry(
    () =>
      client.pages.update({
        page_id: invoiceId,
        properties: buildInvoiceProperties(input),
      }),
    'pages.update(invoice)'
  )

  return mapPageToInvoice(response)
}

/**
 * 견적서 삭제
 * Notion API는 실제 삭제 대신 보관(archived) 처리를 사용합니다.
 */
export async function archiveInvoicePage(
  client: Client,
  invoiceId: string
): Promise<void> {
  await withRetry(
    () => client.pages.update({ page_id: invoiceId, archived: true }),
    'pages.archive(invoice)'
  )
}

/**
 * 특정 견적서에 속한 품목 목록 조회
 * Notion Relation은 역방향 필터를 지원하지 않으므로 Items DB의 Invoice Relation을
 * 대상 견적서 ID로 필터링하고, Sort Order로 정렬해 표시 순서를 보장합니다.
 * @param client Notion 클라이언트
 * @param itemsDatabaseId Items 데이터베이스 ID
 * @param invoiceId 소속 견적서 페이지 ID
 */
export async function queryItemsByInvoice(
  client: Client,
  itemsDatabaseId: string,
  invoiceId: string
): Promise<Item[]> {
  const dataSourceId = await resolveDataSourceId(client, itemsDatabaseId)

  const queryArgs: QueryDataSourceParameters = {
    data_source_id: dataSourceId,
    filter: { property: 'Invoice', relation: { contains: invoiceId } },
    sorts: [{ property: 'Sort Order', direction: 'ascending' }],
  }
  const pages = await withRetry(
    () => collectAllDataSourcePages(client, queryArgs),
    'dataSources.query(items)'
  )

  return pages.map(mapPageToItem)
}

/** 품목 생성 */
export async function createItemPage(
  client: Client,
  itemsDatabaseId: string,
  input: CreateItemInput
): Promise<Item> {
  const dataSourceId = await resolveDataSourceId(client, itemsDatabaseId)

  const response = await withRetry(
    () =>
      client.pages.create({
        parent: { data_source_id: dataSourceId },
        properties: buildItemProperties(input),
      }),
    'pages.create(item)'
  )

  return mapPageToItem(response)
}

/** 품목 수정 (부분 업데이트) */
export async function updateItemPage(
  client: Client,
  itemId: string,
  input: UpdateItemInput
): Promise<Item> {
  const response = await withRetry(
    () =>
      client.pages.update({
        page_id: itemId,
        properties: buildItemProperties(input),
      }),
    'pages.update(item)'
  )

  return mapPageToItem(response)
}

/** 품목 삭제 (보관 처리) */
export async function archiveItemPage(
  client: Client,
  itemId: string
): Promise<void> {
  await withRetry(
    () => client.pages.update({ page_id: itemId, archived: true }),
    'pages.archive(item)'
  )
}

// ───────────────────────── Notion 연동 설정 (F011) ─────────────────────────

/**
 * 사용자가 접근 가능한(Integration에 공유된) 모든 Notion 데이터베이스 목록을 검색합니다.
 *
 * Notion API(2025-09-03~)의 검색은 데이터베이스가 아닌 "데이터 소스" 단위로 결과를
 * 반환하므로, 각 데이터 소스의 parent에서 실제 데이터베이스 ID를 추출합니다.
 * (DatabaseParentResponse/DataSourceParentResponse 모두 database_id 필드를 가집니다.)
 * 이 프로젝트가 다루는 Invoices/Items DB는 단일 데이터 소스 구조를 가정하므로,
 * 같은 데이터베이스에 속한 데이터 소스가 여러 개 검색되더라도 첫 번째 항목만 사용합니다.
 *
 * @param client 사용자의 Notion Integration Token으로 생성한 클라이언트
 * @returns 데이터베이스 ID와 제목 목록 (제목이 비어있으면 "(제목 없음)")
 */
export async function searchAccessibleDatabases(
  client: Client
): Promise<Array<{ id: string; title: string }>> {
  const seen = new Set<string>()
  const databases: Array<{ id: string; title: string }> = []
  let cursor: string | undefined

  do {
    const response = await client.search({
      filter: { property: 'object', value: 'data_source' },
      page_size: 100,
      start_cursor: cursor,
    })

    for (const result of response.results) {
      if (!isFullDataSource(result)) continue

      const databaseId = result.parent.database_id
      if (seen.has(databaseId)) continue
      seen.add(databaseId)

      databases.push({
        id: databaseId,
        title: extractPlainText(result.title) || '(제목 없음)',
      })
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return databases
}
