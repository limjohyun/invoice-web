'use server'

/**
 * 견적서 클라이언트 공유 링크(Phase 6, F015) Server Actions
 *
 * 설계 결정(docs/roadmaps/ROADMAP_V1.md Phase 6 참고): Notion 페이지 ID를 URL에
 * 직접 노출하지 않고, Supabase `invoice_share_links` 테이블에 견적서별 랜덤 토큰을
 * 발급·관리한다. 발급/비활성화는 로그인 세션(RLS) 기반으로, 토큰으로 조회하는
 * 공개 라우트(/share/[token])는 Service Role 클라이언트로 처리한다.
 */

import { randomBytes } from 'node:crypto'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createNotionClient } from '@/lib/notion/client'
import { normalizeNotionError, withRetry } from '@/lib/notion/errors'
import { notionLogger } from '@/lib/notion/logger'
import { retrieveInvoice, queryItemsByInvoice } from '@/lib/notion/queries'
import type { InvoiceWithItems } from '@/lib/notion/types'
import type { NotionResult } from '@/lib/actions/notion'

const SHARE_LINK_TABLE = 'invoice_share_links'

/** 32바이트(43자, base64url) 랜덤 토큰 — 무차별 대입을 사실상 불가능하게 하는 엔트로피 */
function generateShareToken(): string {
  return randomBytes(32).toString('base64url')
}

type AuthenticatedResult =
  | {
      ok: true
      userId: string
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
    }
  | { ok: false; result: NotionResult<never> }

/** 로그인 사용자 ID + 세션 기반(RLS 적용) Supabase 클라이언트를 확인합니다. */
async function getAuthenticatedUser(): Promise<AuthenticatedResult> {
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

/** 만료되지 않은 링크 조건 (expires_at이 없거나 아직 지나지 않음) */
function notExpiredFilter(): string {
  return `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`
}

/**
 * 견적서의 활성 공유 링크 토큰을 반환합니다. 이미 발급된 활성 토큰이 있으면 재사용하고,
 * 없으면 새로 발급합니다 (F015). 견적서 목록의 "링크 복사" 액션에서 호출됩니다.
 */
export async function createOrGetShareLink(
  invoiceId: string
): Promise<NotionResult<{ token: string }>> {
  const auth = await getAuthenticatedUser()
  if (!auth.ok) return auth.result

  try {
    const { data: existing, error: selectError } = await auth.supabase
      .from(SHARE_LINK_TABLE)
      .select('token')
      .eq('owner_user_id', auth.userId)
      .eq('invoice_id', invoiceId)
      .eq('is_active', true)
      .or(notExpiredFilter())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (selectError) throw selectError

    if (existing?.token) {
      return { success: true, data: { token: existing.token } }
    }

    const token = generateShareToken()
    const { error: insertError } = await auth.supabase
      .from(SHARE_LINK_TABLE)
      .insert({ invoice_id: invoiceId, owner_user_id: auth.userId, token })

    if (insertError) throw insertError

    return { success: true, data: { token } }
  } catch (error) {
    notionLogger.error('공유 링크 발급 실패', { error })
    return {
      success: false,
      error: {
        code: 'server_error',
        message: '공유 링크를 발급하지 못했습니다. 다시 시도해주세요.',
      },
    }
  }
}

/** 견적서에 발급된 활성 공유 링크를 전부 비활성화합니다 (소유자가 직접 회수, F015). */
export async function revokeShareLink(
  invoiceId: string
): Promise<NotionResult> {
  const auth = await getAuthenticatedUser()
  if (!auth.ok) return auth.result

  try {
    const { error } = await auth.supabase
      .from(SHARE_LINK_TABLE)
      .update({ is_active: false })
      .eq('owner_user_id', auth.userId)
      .eq('invoice_id', invoiceId)
      .eq('is_active', true)

    if (error) throw error

    return { success: true }
  } catch (error) {
    notionLogger.error('공유 링크 비활성화 실패', { error })
    return {
      success: false,
      error: {
        code: 'server_error',
        message: '공유 링크를 비활성화하지 못했습니다. 다시 시도해주세요.',
      },
    }
  }
}

/**
 * 견적서 삭제(F005) 시 연결된 공유 링크를 함께 비활성화합니다.
 * `deleteInvoice`가 이미 소유자 인증을 마친 뒤 호출하므로 Service Role로 확실히 정리하며,
 * 실패해도 견적서 삭제 자체를 막지 않도록 예외를 여기서 흡수합니다.
 */
export async function deactivateShareLinksForInvoice(
  invoiceId: string,
  ownerUserId: string
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient()
    const { error } = await admin
      .from(SHARE_LINK_TABLE)
      .update({ is_active: false })
      .eq('owner_user_id', ownerUserId)
      .eq('invoice_id', invoiceId)
      .eq('is_active', true)

    if (error) {
      notionLogger.error('견적서 삭제에 따른 공유 링크 비활성화 실패', {
        error,
      })
    }
  } catch (error) {
    notionLogger.error('견적서 삭제에 따른 공유 링크 비활성화 에러', {
      error,
    })
  }
}

/**
 * 공유 토큰으로 견적서 상세(+품목)를 조회합니다 (F015).
 * 로그인 세션이 없는 공개 라우트(/share/[token], /api/share/[token]/pdf)에서만 호출되며,
 * Service Role 클라이언트로 토큰 소유자의 Notion 연동 정보를 조회한 뒤 그 권한으로
 * Notion API를 직접 호출합니다. RLS를 완전히 우회하므로 이 함수 밖에서
 * invoice_share_links/profiles를 Service Role로 직접 조회하지 마세요.
 */
export async function getInvoiceByShareToken(
  token: string
): Promise<NotionResult<InvoiceWithItems>> {
  const invalidLinkError: NotionResult<never> = {
    success: false,
    error: {
      code: 'not_found',
      message: '유효하지 않거나 만료된 링크입니다.',
    },
  }

  if (!token.trim()) return invalidLinkError

  try {
    const admin = createSupabaseAdminClient()

    const { data: link, error: linkError } = await admin
      .from(SHARE_LINK_TABLE)
      .select('invoice_id, owner_user_id')
      .eq('token', token)
      .eq('is_active', true)
      .or(notExpiredFilter())
      .maybeSingle()

    if (linkError || !link) return invalidLinkError

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('notion_access_token, notion_items_db_id')
      .eq('id', link.owner_user_id)
      .single()

    if (
      profileError ||
      !profile?.notion_access_token ||
      !profile.notion_items_db_id
    ) {
      return invalidLinkError
    }

    const client = createNotionClient(profile.notion_access_token)
    const invoice = await withRetry(
      () => retrieveInvoice(client, link.invoice_id),
      'getInvoiceByShareToken'
    )
    const items = await withRetry(
      () =>
        queryItemsByInvoice(
          client,
          profile.notion_items_db_id,
          link.invoice_id
        ),
      'getInvoiceByShareToken.items'
    )

    return { success: true, data: { ...invoice, items } }
  } catch (error) {
    // Notion 쪽 실패 원인(권한 만료, 잘못된 페이지 ID, 일시적 오류 등)을 공개 라우트의
    // 익명 방문자에게 그대로 노출하지 않는다 — 항상 "유효하지 않은 링크"로만 보여주고
    // 실제 원인은 서버 로그로만 남긴다.
    notionLogger.error('공유 링크로 견적서 조회 실패', {
      error: normalizeNotionError(error),
    })
    return invalidLinkError
  }
}
