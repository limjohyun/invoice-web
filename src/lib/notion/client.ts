import 'server-only'
import { Client, LogLevel, type Logger } from '@notionhq/client'
import { env } from '@/lib/env'
import {
  NOTION_API_VERSION,
  NOTION_INITIAL_RETRY_DELAY_MS,
  NOTION_MAX_RETRIES,
  NOTION_TIMEOUT_MS,
} from './constants'
import { notionLogger } from './logger'

/**
 * Notion SDK 내부 로그를 프로젝트 로거로 연결하는 어댑터
 * (SDK Logger 시그니처: (level, message, extraInfo) => void)
 */
const sdkLogger: Logger = (level, message, extraInfo) => {
  if (level === LogLevel.ERROR) {
    notionLogger.error(message, extraInfo)
  } else if (level === LogLevel.WARN) {
    notionLogger.warn(message, extraInfo)
  } else {
    notionLogger.debug(message, extraInfo)
  }
}

/**
 * 사용자의 Notion Integration Token으로 Notion 클라이언트를 생성합니다.
 *
 * 사용자마다 자신의 Notion 워크스페이스에 연동하므로(F011), 전역 싱글톤 대신
 * 요청마다 사용자 토큰 기반으로 새 클라이언트를 생성합니다. 인자를 생략하면
 * 서버 환경변수(NOTION_API_KEY)를 폴백으로 사용합니다(단일 워크스페이스/개발용).
 *
 * 이 모듈은 'server-only'로 표시되어 브라우저 번들에서 제외됩니다.
 * (NOTION_API_KEY 및 사용자 토큰이 클라이언트에 노출되지 않도록 보장)
 *
 * 타임아웃/재시도:
 * - timeoutMs로 개별 요청에 5초 제한을 둡니다.
 * - retry 옵션으로 429(rate limit) 및 5xx 서버 오류에 대해 지수 백오프로
 *   최대 3회 재시도하며, 응답의 Retry-After 헤더를 존중합니다.
 * - 타임아웃/네트워크 등 전송 계층 오류는 errors.ts의 withRetry로 보완합니다.
 *
 * @param accessToken 사용자의 Notion Integration Token (profiles.notion_access_token)
 * @returns 설정이 적용된 Notion Client 인스턴스
 */
export function createNotionClient(accessToken?: string): Client {
  const auth = accessToken ?? env.NOTION_API_KEY

  return new Client({
    auth,
    timeoutMs: NOTION_TIMEOUT_MS,
    notionVersion: NOTION_API_VERSION,
    logger: sdkLogger,
    // production에서는 경고 이상만 SDK 로그로 출력
    logLevel:
      process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO,
    retry: {
      maxRetries: NOTION_MAX_RETRIES,
      initialRetryDelayMs: NOTION_INITIAL_RETRY_DELAY_MS,
    },
  })
}
