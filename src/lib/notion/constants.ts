/**
 * Notion API 호출 관련 설정 상수
 *
 * 도메인 값(Currency/Status 옵션)은 types.ts에서 관리하고,
 * 여기서는 네트워크/재시도/버전 등 인프라 설정만 관리합니다.
 */

/** 개별 요청 타임아웃 (요구사항: 5초) */
export const NOTION_TIMEOUT_MS = 5000

/** 재시도 최대 횟수 (요구사항: 최대 3회) */
export const NOTION_MAX_RETRIES = 3

/** 지수 백오프 초기 지연 (ms). 재시도마다 2배씩 증가합니다. */
export const NOTION_INITIAL_RETRY_DELAY_MS = 500

/**
 * 사용할 Notion API 버전 고정
 * 2025-09-03부터 데이터베이스는 "data source" 단위로 쿼리됩니다.
 * (SDK v5의 기본값과 동일하지만 재현성을 위해 명시적으로 고정)
 */
export const NOTION_API_VERSION = '2025-09-03'
