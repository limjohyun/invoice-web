import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 테스트 설정
 * 로그인 분기 플로우(대시보드 vs 설정 페이지 리다이렉트)를 검증하기 위한 최소 구성입니다.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',

  // 테스트 계정(test1/test2)을 공유하므로 파일/워커 간 경쟁을 피하기 위해 순차 실행합니다.
  fullyParallel: false,
  workers: 1,

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  retries: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
