/**
 * Notion API 에러 정규화 및 재시도 유틸리티
 *
 * - normalizeNotionError: SDK가 던지는 다양한 에러를 사용자 친화적(한국어)
 *   메시지와 안정적인 코드로 변환합니다. Server Action은 이 코드를 보고
 *   적절히 분기(예: unauthorized면 재연동 안내)할 수 있습니다.
 * - withRetry: 타임아웃/네트워크 등 "일시적 전송 계층 오류"에 한해 지수
 *   백오프로 재시도합니다. 429/5xx는 SDK 클라이언트의 내장 retry가 처리하므로
 *   중복 재시도를 피하기 위해 여기서는 다루지 않습니다.
 */

import {
  APIErrorCode,
  APIResponseError,
  ClientErrorCode,
  isNotionClientError,
  RequestTimeoutError,
} from '@notionhq/client'
import { NOTION_INITIAL_RETRY_DELAY_MS, NOTION_MAX_RETRIES } from './constants'
import { notionLogger } from './logger'

/** Server Action 계층이 분기에 사용할 수 있는 안정적인 에러 코드 */
export type NotionErrorCode =
  | 'unauthorized' // 토큰 만료/권한 없음 → 재연동 안내
  | 'not_found' // 대상 페이지/DB 없음
  | 'rate_limited' // 요청 한도 초과
  | 'validation_error' // 요청 형식/입력값 오류
  | 'conflict' // 동시 수정 충돌
  | 'timeout' // 요청 시간 초과
  | 'network_error' // 네트워크 연결 실패
  | 'server_error' // Notion 서버 내부 오류
  | 'config_error' // 환경설정(DB ID 등) 누락
  | 'unknown'

/**
 * Notion 작업 실패를 표현하는 표준 에러
 * 원본 에러는 cause에 보관하고, message는 사용자에게 노출 가능한 한국어입니다.
 */
export class NotionOperationError extends Error {
  readonly code: NotionErrorCode
  override readonly cause?: unknown

  constructor(code: NotionErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'NotionOperationError'
    this.code = code
    this.cause = cause
  }
}

/**
 * 알 수 없는 에러(unknown)를 NotionOperationError로 정규화합니다.
 * @param error try/catch로 잡은 원본 에러
 * @returns 코드와 사용자 메시지를 가진 NotionOperationError
 */
export function normalizeNotionError(error: unknown): NotionOperationError {
  // 이미 정규화된 에러는 그대로 전달
  if (error instanceof NotionOperationError) {
    return error
  }

  // 요청 타임아웃 (timeoutMs 초과)
  if (
    error instanceof RequestTimeoutError ||
    (isNotionClientError(error) &&
      error.code === ClientErrorCode.RequestTimeout)
  ) {
    return new NotionOperationError(
      'timeout',
      'Notion 서버 응답이 지연되어 요청이 시간 초과되었습니다. 잠시 후 다시 시도해주세요.',
      error
    )
  }

  // Notion API가 반환한 HTTP 에러
  if (error instanceof APIResponseError) {
    return new NotionOperationError(
      mapApiErrorCode(error.code),
      messageForApiError(error.code),
      error
    )
  }

  // 그 외 Error는 대개 네트워크 계층 실패(fetch failed 등)
  if (error instanceof Error) {
    return new NotionOperationError(
      'network_error',
      'Notion 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      error
    )
  }

  return new NotionOperationError(
    'unknown',
    'Notion 작업 중 알 수 없는 오류가 발생했습니다.',
    error
  )
}

/** Notion APIErrorCode → 내부 NotionErrorCode 매핑 */
function mapApiErrorCode(code: APIResponseError['code']): NotionErrorCode {
  switch (code) {
    case APIErrorCode.Unauthorized:
    case APIErrorCode.RestrictedResource:
      return 'unauthorized'
    case APIErrorCode.ObjectNotFound:
      return 'not_found'
    case APIErrorCode.RateLimited:
      return 'rate_limited'
    case APIErrorCode.ValidationError:
    case APIErrorCode.InvalidJSON:
    case APIErrorCode.InvalidRequest:
    case APIErrorCode.InvalidRequestURL:
      return 'validation_error'
    case APIErrorCode.ConflictError:
      return 'conflict'
    case APIErrorCode.InternalServerError:
    case APIErrorCode.ServiceUnavailable:
    case APIErrorCode.ServiceOverload:
    case APIErrorCode.GatewayTimeout:
      return 'server_error'
    default:
      return 'unknown'
  }
}

/** Notion APIErrorCode → 사용자 노출용 한국어 메시지 */
function messageForApiError(code: APIResponseError['code']): string {
  switch (code) {
    case APIErrorCode.Unauthorized:
      return 'Notion 인증에 실패했습니다. 토큰이 만료되었거나 유효하지 않습니다. 설정에서 Notion 연동을 다시 진행해주세요.'
    case APIErrorCode.RestrictedResource:
      return '해당 Notion 데이터베이스에 접근 권한이 없습니다. Integration 공유(Full access) 설정을 확인해주세요.'
    case APIErrorCode.ObjectNotFound:
      return '요청한 Notion 데이터를 찾을 수 없습니다. 삭제되었거나 접근 권한이 없을 수 있습니다.'
    case APIErrorCode.RateLimited:
      return 'Notion API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    case APIErrorCode.ValidationError:
    case APIErrorCode.InvalidJSON:
    case APIErrorCode.InvalidRequest:
    case APIErrorCode.InvalidRequestURL:
      return '요청 형식이 올바르지 않습니다. 입력값을 확인해주세요.'
    case APIErrorCode.ConflictError:
      return '동시에 여러 변경이 발생해 충돌이 났습니다. 잠시 후 다시 시도해주세요.'
    case APIErrorCode.InternalServerError:
    case APIErrorCode.ServiceUnavailable:
    case APIErrorCode.ServiceOverload:
    case APIErrorCode.GatewayTimeout:
      return 'Notion 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    default:
      return 'Notion 작업 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}

/**
 * 정규화된 에러 코드가 재시도 가능한 전송 계층 오류인지 판별합니다.
 * 429/5xx는 SDK 내장 retry가 처리하므로 여기서는 timeout/network만 재시도합니다.
 * (config_error·validation_error·unauthorized 등은 재시도해도 동일 실패)
 */
function isRetryableCode(code: NotionErrorCode): boolean {
  return code === 'timeout' || code === 'network_error'
}

/** 지정한 ms만큼 대기 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 타임아웃/네트워크 등 일시적 전송 오류에 대해 지수 백오프로 재시도합니다.
 * 성공 시 결과를 반환하고, 재시도 소진 또는 비일시적 오류면 정규화한 에러를 던집니다.
 *
 * @param operation 재시도할 비동기 작업 (멱등한 읽기/쓰기여야 안전)
 * @param label 로깅용 작업 이름
 * @returns operation의 결과
 * @throws NotionOperationError 정규화된 에러
 *
 * @example
 * const invoices = await withRetry(() => queryInvoices(client, dbId), 'queryInvoices')
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  label = 'notion-operation'
): Promise<T> {
  let attempt = 0

  for (;;) {
    try {
      return await operation()
    } catch (error) {
      const normalized = normalizeNotionError(error)
      attempt += 1

      if (attempt > NOTION_MAX_RETRIES || !isRetryableCode(normalized.code)) {
        throw normalized
      }

      // 지수 백오프: 500ms → 1000ms → 2000ms ...
      const backoff = NOTION_INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1)
      notionLogger.warn('Notion 요청 재시도', {
        label,
        attempt,
        maxRetries: NOTION_MAX_RETRIES,
        backoffMs: backoff,
        code: normalized.code,
        error: normalized,
      })
      await delay(backoff)
    }
  }
}
