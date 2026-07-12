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
