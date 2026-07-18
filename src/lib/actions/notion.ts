'use server'

/**
 * Notion 기반 견적서/품목 CRUD Server Actions
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 이 파일을 호출하는(호출할 예정인) 라우트 구조 설계 (구현은 T8 / Phase 2에서 진행)
 * ─────────────────────────────────────────────────────────────────────────
 *   /dashboard              → getInvoices()                (F001, F006)
 *   /invoice/[id]            → getInvoice(id)                (F003, F006)
 *   /invoice/create          → createInvoice(input)          (F002, F006, F012, F013)
 *   /invoice/[id]/edit        → getInvoice(id) + updateInvoice(id, input) (F004, F006)
 *   견적서 상세 페이지 내 삭제 버튼 → deleteInvoice(id)        (F005, F006)
 *   견적서 작성/수정 페이지 내 품목 편집 → getItems / createItem / updateItem / deleteItem
 * (거래처/템플릿 라우트는 F012/F013 구현 시점인 Phase 3에서 별도 설계)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 공통 패턴 (src/lib/actions/auth.ts와 동일한 구조를 따름):
 *   1. getNotionContext()로 로그인 사용자 확인 + Notion 연동 정보(profiles) 조회
 *   2. try/catch로 Notion API 호출을 감싸고, 실패 시 사용자 친화적 한국어 메시지로 변환
 *   3. 모든 함수는 NotionResult<T> 형태로 성공/실패를 반환 (throw 하지 않음)
 */

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createNotionClient } from '@/lib/notion/client'
import { normalizeNotionError, withRetry } from '@/lib/notion/errors'
import { notionLogger } from '@/lib/notion/logger'
import {
  archiveInvoicePage,
  archiveItemPage,
  createInvoicePage,
  createItemPage,
  queryInvoices,
  queryItemsByInvoice,
  retrieveInvoice,
  searchAccessibleDatabases,
  updateInvoicePage,
  updateItemPage,
} from '@/lib/notion/queries'
import type {
  CreateInvoiceInput,
  CreateItemInput,
  Invoice,
  InvoiceWithItems,
  Item,
  UpdateInvoiceInput,
  UpdateItemInput,
} from '@/lib/notion/types'

export type NotionError = {
  code: string
  message: string
}

export type NotionResult<T = undefined> = {
  success: boolean
  error?: NotionError
  data?: T
}

type NotionContext = {
  userId: string
  accessToken: string
  invoiceDbId: string
  itemsDbId: string
}

type NotionContextResult =
  | { ok: true; context: NotionContext }
  | { ok: false; result: NotionResult<never> }

/**
 * 로그인 사용자 확인 + Notion 연동 정보(Access Token, DB ID) 조회
 * 모든 Notion Server Action의 공통 진입점으로 사용합니다.
 * profiles 테이블의 notion_access_token / notion_invoice_db_id / notion_items_db_id는
 * F011 (Notion 연동 설정 페이지)에서 사용자가 직접 등록합니다.
 */
async function getNotionContext(): Promise<NotionContextResult> {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        ok: false,
        result: {
          success: false,
          error: { code: 'unauthenticated', message: '로그인이 필요합니다.' },
        },
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notion_access_token, notion_invoice_db_id, notion_items_db_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.notion_access_token) {
      return {
        ok: false,
        result: {
          success: false,
          error: {
            code: 'notion_not_connected',
            message: 'Notion 연동이 필요합니다. 설정 페이지에서 연동해 주세요.',
          },
        },
      }
    }

    if (!profile.notion_invoice_db_id || !profile.notion_items_db_id) {
      return {
        ok: false,
        result: {
          success: false,
          error: {
            code: 'notion_db_not_configured',
            message:
              '연동된 Notion 데이터베이스를 찾을 수 없습니다. 설정 페이지에서 데이터베이스를 다시 선택해 주세요.',
          },
        },
      }
    }

    return {
      ok: true,
      context: {
        userId: user.id,
        accessToken: profile.notion_access_token,
        invoiceDbId: profile.notion_invoice_db_id,
        itemsDbId: profile.notion_items_db_id,
      },
    }
  } catch (error) {
    notionLogger.error('Notion 연동 정보 확인 에러', { error })
    return {
      ok: false,
      result: {
        success: false,
        error: {
          code: 'server_error',
          message: '서버 오류가 발생했습니다. 다시 시도해주세요.',
        },
      },
    }
  }
}

/**
 * Notion 작업 실패를 로깅하고 NotionResult 형태의 에러로 변환합니다.
 * 실제 에러 정규화(코드/한국어 메시지 매핑)는 src/lib/notion/errors.ts에서 담당합니다.
 */
function toActionError(label: string, error: unknown): NotionError {
  const normalized = normalizeNotionError(error)
  notionLogger.error(label, { error: normalized })
  return { code: normalized.code, message: normalized.message }
}

// ───────────────────────── Notion 연동 설정 (F011) ─────────────────────────

type AuthenticatedUserResult =
  | { ok: true; userId: string; supabase: SupabaseClient }
  | { ok: false; result: NotionResult<never> }

/**
 * 로그인 사용자 ID만 확인합니다. getNotionContext()와 달리 Notion 연동(profiles의
 * notion_access_token 등) 여부는 확인하지 않습니다. Notion 연동 설정(F011)은 아직
 * 연동되지 않은 사용자도 최초로 호출해야 하는 화면이기 때문입니다.
 */
async function getAuthenticatedUserId(): Promise<AuthenticatedUserResult> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      result: {
        success: false,
        error: { code: 'unauthenticated', message: '로그인이 필요합니다.' },
      },
    }
  }

  return { ok: true, userId: user.id, supabase }
}

/**
 * Notion Integration Token의 유효성을 테스트합니다 (F011).
 * DB 접근 권한이 없어도 통과하는 최소 권한 호출(users.me)로 검증하므로,
 * 아직 어떤 데이터베이스도 공유되지 않은 토큰도 "유효함"으로 판단할 수 있습니다.
 *
 * @returns success는 테스트 자체의 수행 여부, data는 토큰 유효성(true/false)입니다.
 *   일시적 오류(타임아웃/네트워크 등)로 검증 자체를 완료하지 못한 경우 success: false를 반환합니다.
 */
export async function testNotionConnection(
  token: string
): Promise<NotionResult<boolean>> {
  if (!token.trim()) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'Integration Token을 입력해 주세요.',
      },
    }
  }

  try {
    const client = createNotionClient(token)
    await withRetry(() => client.users.me({}), 'testNotionConnection')
    return { success: true, data: true }
  } catch (error) {
    const normalized = normalizeNotionError(error)

    if (normalized.code === 'unauthorized') {
      notionLogger.info('Notion 토큰 검증 결과: 유효하지 않은 토큰', {
        code: normalized.code,
      })
      return { success: true, data: false }
    }

    notionLogger.error('Notion 연동 테스트 실패', { error: normalized })
    return {
      success: false,
      error: { code: normalized.code, message: normalized.message },
    }
  }
}

/**
 * 로그인 사용자가 (Integration Token으로) 접근 가능한 Notion 데이터베이스 목록을 조회합니다 (F011).
 * 설정 페이지에서 견적서/품목 데이터베이스를 선택하는 드롭다운에 사용됩니다.
 */
export async function queryNotionDatabases(
  token: string
): Promise<NotionResult<Array<{ id: string; title: string }>>> {
  if (!token.trim()) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'Integration Token을 입력해 주세요.',
      },
    }
  }

  try {
    const client = createNotionClient(token)
    const databases = await withRetry(
      () => searchAccessibleDatabases(client),
      'queryNotionDatabases'
    )
    return { success: true, data: databases }
  } catch (error) {
    return {
      success: false,
      error: toActionError('Notion 데이터베이스 목록 조회 실패', error),
    }
  }
}

/**
 * 사용자의 Notion Integration Token과 대상 데이터베이스(견적서/품목) ID를 저장합니다 (F011).
 * profiles 테이블은 RLS로 본인 행만 수정 가능하므로, 로그인 세션이 반영된 Supabase
 * 클라이언트(getAuthenticatedUserId)를 그대로 재사용해 정책을 통과합니다.
 *
 * 보안 참고: token은 Server Action 인자로만 전달되며, 어떤 로그에도 원문으로
 * 남기지 않습니다(notionLogger가 token/secret 등의 키를 자동 마스킹합니다).
 */
export async function saveNotionToken(
  token: string,
  invoicesDbId: string,
  itemsDbId: string
): Promise<NotionResult<void>> {
  if (!token.trim() || !invoicesDbId.trim() || !itemsDbId.trim()) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message:
          'Integration Token과 견적서/품목 데이터베이스를 모두 선택해 주세요.',
      },
    }
  }

  const auth = await getAuthenticatedUserId()
  if (!auth.ok) return auth.result

  try {
    const { error } = await auth.supabase
      .from('profiles')
      .update({
        notion_access_token: token,
        notion_invoice_db_id: invoicesDbId,
        notion_items_db_id: itemsDbId,
      })
      .eq('id', auth.userId)

    if (error) {
      notionLogger.error('Notion 연동 정보 저장 실패', { error })
      return {
        success: false,
        error: {
          code: 'server_error',
          message: 'Notion 연동 정보를 저장하지 못했습니다. 다시 시도해주세요.',
        },
      }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    notionLogger.error('Notion 연동 정보 저장 에러', { error })
    return {
      success: false,
      error: {
        code: 'server_error',
        message: '서버 오류가 발생했습니다. 다시 시도해주세요.',
      },
    }
  }
}

// ───────────────────────── 견적서 (Invoice) ─────────────────────────

/** 로그인 사용자의 견적서 목록 조회 (F001) */
export async function getInvoices(): Promise<NotionResult<Invoice[]>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const invoices = await withRetry(
      () => queryInvoices(client, context.context.invoiceDbId),
      'getInvoices'
    )
    return { success: true, data: invoices }
  } catch (error) {
    return {
      success: false,
      error: toActionError('견적서 목록 조회 실패', error),
    }
  }
}

/** 특정 견적서 + 연결된 품목 목록 조회 (F003) */
export async function getInvoice(
  invoiceId: string
): Promise<NotionResult<InvoiceWithItems>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const invoice = await withRetry(
      () => retrieveInvoice(client, invoiceId),
      'getInvoice'
    )
    const items = await withRetry(
      () => queryItemsByInvoice(client, context.context.itemsDbId, invoiceId),
      'getInvoice.items'
    )
    return { success: true, data: { ...invoice, items } }
  } catch (error) {
    return {
      success: false,
      error: toActionError('견적서 상세 조회 실패', error),
    }
  }
}

/** 새 견적서 생성 (F002, F006) */
export async function createInvoice(
  input: CreateInvoiceInput
): Promise<NotionResult<Invoice>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const invoice = await createInvoicePage(
      client,
      context.context.invoiceDbId,
      input
    )
    revalidatePath('/dashboard')
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: toActionError('견적서 생성 실패', error) }
  }
}

/** 기존 견적서 수정 (F004, F006) */
export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput
): Promise<NotionResult<Invoice>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const invoice = await updateInvoicePage(client, invoiceId, input)
    revalidatePath('/dashboard')
    revalidatePath(`/invoice/${invoiceId}`)
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: toActionError('견적서 수정 실패', error) }
  }
}

/** 견적서 삭제 (F005, F006) */
export async function deleteInvoice(invoiceId: string): Promise<NotionResult> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    await archiveInvoicePage(client, invoiceId)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: toActionError('견적서 삭제 실패', error) }
  }
}

// ───────────────────────── 품목 (Item) ─────────────────────────

/** 특정 견적서에 속한 품목 목록 조회 */
export async function getItems(
  invoiceId: string
): Promise<NotionResult<Item[]>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const items = await withRetry(
      () => queryItemsByInvoice(client, context.context.itemsDbId, invoiceId),
      'getItems'
    )
    return { success: true, data: items }
  } catch (error) {
    return {
      success: false,
      error: toActionError('품목 목록 조회 실패', error),
    }
  }
}

/** 새 품목 생성 (F002 견적서 작성 중 품목 추가) */
export async function createItem(
  input: CreateItemInput
): Promise<NotionResult<Item>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const item = await createItemPage(client, context.context.itemsDbId, input)
    revalidatePath(`/invoice/${input.invoiceId}`)
    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: toActionError('품목 생성 실패', error) }
  }
}

/** 기존 품목 수정 (F004 견적서 수정 중 품목 편집) */
export async function updateItem(
  itemId: string,
  input: UpdateItemInput
): Promise<NotionResult<Item>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    const item = await updateItemPage(client, itemId, input)
    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: toActionError('품목 수정 실패', error) }
  }
}

/** 품목 삭제 */
export async function deleteItem(itemId: string): Promise<NotionResult> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  try {
    const client = createNotionClient(context.context.accessToken)
    await archiveItemPage(client, itemId)
    return { success: true }
  } catch (error) {
    return { success: false, error: toActionError('품목 삭제 실패', error) }
  }
}

// ──────────────────── 조합 액션: 견적서 + 품목 한번에 처리 (F002/F004) ────────────────────

/** 폼에서 제출하는 품목 1건 (invoiceId는 서버에서 채움) */
export type InvoiceItemDraft = Omit<CreateItemInput, 'invoiceId'>

/** 수정 폼에서 제출하는 품목 1건 (id가 있으면 기존 품목 수정, 없으면 신규 생성) */
export type InvoiceItemDraftWithId = InvoiceItemDraft & { id?: string }

/**
 * 새 견적서와 품목을 한 번에 생성합니다 (F002, F006).
 * Notion에는 여러 페이지 생성을 묶는 트랜잭션이 없으므로, 품목 생성 중 하나라도
 * 실패하면 이미 만든 항목(견적서 + 생성된 품목)을 모두 archive해 되돌립니다.
 */
export async function createInvoiceWithItems(
  invoiceInput: CreateInvoiceInput,
  items: InvoiceItemDraft[]
): Promise<NotionResult<InvoiceWithItems>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  const client = createNotionClient(context.context.accessToken)
  let invoice: Invoice | undefined
  const createdItems: Item[] = []

  try {
    invoice = await createInvoicePage(
      client,
      context.context.invoiceDbId,
      invoiceInput
    )

    for (const item of items) {
      const created = await createItemPage(client, context.context.itemsDbId, {
        ...item,
        invoiceId: invoice.id,
      })
      createdItems.push(created)
    }

    revalidatePath('/dashboard')
    return { success: true, data: { ...invoice, items: createdItems } }
  } catch (error) {
    // 보상 처리: 이미 생성된 품목/견적서를 archive해 부분 생성 상태로 남지 않게 한다.
    await Promise.allSettled(
      createdItems.map(item => archiveItemPage(client, item.id))
    )
    if (invoice) {
      await Promise.allSettled([archiveInvoicePage(client, invoice.id)])
    }
    return { success: false, error: toActionError('견적서 생성 실패', error) }
  }
}

/**
 * 기존 견적서와 품목을 한 번에 수정합니다 (F004, F006).
 * 품목은 id 유무로 생성/수정/삭제를 구분합니다: id 없음 → 신규 생성,
 * id 있고 기존에 존재 → 수정, 기존 품목 중 폼에서 빠진 것 → archive(삭제).
 * 품목 저장 중 일부가 실패해도 나머지는 계속 진행하고, 실패 개수를 알려 재시도를 유도합니다.
 */
export async function updateInvoiceWithItems(
  invoiceId: string,
  invoiceInput: UpdateInvoiceInput,
  items: InvoiceItemDraftWithId[]
): Promise<NotionResult<InvoiceWithItems>> {
  const context = await getNotionContext()
  if (!context.ok) return context.result

  const client = createNotionClient(context.context.accessToken)

  try {
    await updateInvoicePage(client, invoiceId, invoiceInput)

    const existingItems = await queryItemsByInvoice(
      client,
      context.context.itemsDbId,
      invoiceId
    )
    const existingIds = new Set(existingItems.map(item => item.id))
    const formIds = new Set(items.filter(item => item.id).map(item => item.id))

    const toCreate = items.filter(item => !item.id)
    const toUpdate = items.filter(
      (item): item is InvoiceItemDraftWithId & { id: string } =>
        Boolean(item.id) && existingIds.has(item.id as string)
    )
    const toDelete = existingItems.filter(item => !formIds.has(item.id))

    let failureCount = 0

    for (const item of toCreate) {
      try {
        await createItemPage(client, context.context.itemsDbId, {
          ...item,
          invoiceId,
        })
      } catch (error) {
        failureCount += 1
        notionLogger.error('품목 생성 실패(견적서 수정 중)', { error })
      }
    }
    for (const item of toUpdate) {
      try {
        const { id, ...input } = item
        await updateItemPage(client, id, input)
      } catch (error) {
        failureCount += 1
        notionLogger.error('품목 수정 실패(견적서 수정 중)', { error })
      }
    }
    for (const item of toDelete) {
      try {
        await archiveItemPage(client, item.id)
      } catch (error) {
        failureCount += 1
        notionLogger.error('품목 삭제 실패(견적서 수정 중)', { error })
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/invoice/${invoiceId}`)

    const [invoice, finalItems] = await Promise.all([
      retrieveInvoice(client, invoiceId),
      queryItemsByInvoice(client, context.context.itemsDbId, invoiceId),
    ])

    if (failureCount > 0) {
      return {
        success: false,
        error: {
          code: 'partial_item_failure',
          message: `품목 ${failureCount}건 저장에 실패했습니다. 다시 시도해 주세요.`,
        },
        data: { ...invoice, items: finalItems },
      }
    }

    return { success: true, data: { ...invoice, items: finalItems } }
  } catch (error) {
    return { success: false, error: toActionError('견적서 수정 실패', error) }
  }
}
