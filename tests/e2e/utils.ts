import { expect, type Page } from '@playwright/test'

/**
 * 로그인 폼에 이메일/비밀번호를 입력하고 제출합니다.
 * 리다이렉트 대기는 호출부에서 expect(page).toHaveURL(...)로 검증합니다.
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('이메일').fill(email)
  await page.getByLabel('비밀번호').fill(password)
  await page.getByRole('button', { name: '로그인하기' }).click()
}

/**
 * 헤더의 로그아웃 버튼을 클릭합니다.
 * signOut Server Action이 내부적으로 /login으로 리다이렉트합니다.
 */
export async function logout(page: Page) {
  await page.getByRole('button', { name: '로그아웃' }).click()
  await expect(page).toHaveURL(/\/login$/)
}
