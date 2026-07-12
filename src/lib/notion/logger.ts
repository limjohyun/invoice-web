/**
 * Notion 모듈 전용 경량 로거
 *
 * CLAUDE.md 규칙("console.log 대신 적절한 로깅 라이브러리 사용")을 지키기 위한
 * 최소 래퍼입니다. 별도 의존성(pino/winston 등) 없이 콘솔 출력을 한 곳으로
 * 모아 네임스페이스/구조화 로그를 남깁니다. 추후 실제 로깅 라이브러리로
 * 교체할 때 이 파일만 수정하면 됩니다.
 *
 * - 서버 환경에서만 사용 (Notion 호출은 Server Action/Route Handler 전용)
 * - production에서는 debug/info 로그를 억제해 노이즈를 줄입니다.
 */

type NotionLogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_SEVERITY: Record<NotionLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

// production에서는 warn 이상만 출력, 그 외 환경에서는 debug부터 출력
const MIN_SEVERITY =
  process.env.NODE_ENV === 'production'
    ? LEVEL_SEVERITY.warn
    : LEVEL_SEVERITY.debug

/**
 * 구조화된 로그 한 줄을 출력합니다.
 * @param level 로그 레벨
 * @param message 사람이 읽을 메시지
 * @param context 추가 컨텍스트(직렬화 가능한 값)
 */
function log(
  level: NotionLogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  if (LEVEL_SEVERITY[level] < MIN_SEVERITY) return

  const payload = {
    ts: new Date().toISOString(),
    scope: 'notion',
    level,
    message,
    ...(context ? { context: sanitize(context) } : {}),
  }

  // 콘솔 채널을 레벨에 맞게 선택 (여기 한 곳에서만 console 직접 사용)
  const line = JSON.stringify(payload)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.info(line)
  }
}

/**
 * 로그 컨텍스트에서 민감 정보(토큰 등)를 마스킹합니다.
 * Notion 토큰이 실수로 로그에 남지 않도록 방어합니다.
 */
function sanitize(context: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    if (/token|secret|authorization|api[_-]?key/i.test(key)) {
      result[key] = '***redacted***'
    } else if (value instanceof Error) {
      // Error 객체는 message/name만 남겨 순환 참조/스택 과다 노출 방지
      result[key] = { name: value.name, message: value.message }
    } else {
      result[key] = value
    }
  }
  return result
}

export const notionLogger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    log('error', message, context),
}

export type { NotionLogLevel }
