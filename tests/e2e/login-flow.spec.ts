import { test, expect } from '@playwright/test'
import { login, logout } from './utils'
import { TEST_USER_WITH_NOTION, TEST_USER_WITHOUT_NOTION } from './test-users'

test.describe('로그인 분기 플로우', () => {
  test('Notion 토큰이 있는 사용자는 로그인 후 대시보드로 이동한다', async ({
    page,
  }) => {
    await login(
      page,
      TEST_USER_WITH_NOTION.email,
      TEST_USER_WITH_NOTION.password
    )

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
  })

  test('Notion 토큰이 없는 사용자는 로그인 후 설정 페이지로 이동한다', async ({
    page,
  }) => {
    await login(
      page,
      TEST_USER_WITHOUT_NOTION.email,
      TEST_USER_WITHOUT_NOTION.password
    )

    await expect(page).toHaveURL(/\/settings$/)
    await expect(
      page.getByRole('heading', { name: 'Notion 연동 설정' })
    ).toBeVisible()
    await expect(page.getByLabel('Notion Integration Token')).toBeVisible()
  })

  test('로그인 세션은 새로고침 후에도 유지되고, 로그아웃하면 로그인 페이지로 이동한다', async ({
    page,
  }) => {
    await login(
      page,
      TEST_USER_WITH_NOTION.email,
      TEST_USER_WITH_NOTION.password
    )
    await expect(page).toHaveURL(/\/dashboard$/)

    // 새로고침 후에도 /dashboard에 남아 있어야 함 (세션 쿠키 유지 확인)
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()

    // 로그아웃 후 로그인 페이지로 리다이렉트
    await logout(page)
  })
})
