/**
 * E2E 테스트 전용 계정 상수
 * global-setup.ts에서 생성/초기화하고, 각 테스트 spec에서 로그인 시 재사용합니다.
 */
export const TEST_PASSWORD = 'TestPass123!'

export const TEST_USER_WITH_NOTION = {
  email: 'e2e-test1@invoice-web.test',
  password: TEST_PASSWORD,
  /** profiles.notion_access_token에 저장할 더미 토큰 (실제 Notion API 호출은 하지 않음) */
  notionAccessToken: 'ntn_e2e_dummy_token_for_testing_only',
}

export const TEST_USER_WITHOUT_NOTION = {
  email: 'e2e-test2@invoice-web.test',
  password: TEST_PASSWORD,
}
