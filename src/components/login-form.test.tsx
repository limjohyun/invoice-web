import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LoginForm } from './login-form'
import { signIn } from '@/lib/actions/auth'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/actions/auth', () => ({
  signIn: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset()
  })

  it('이메일/비밀번호 입력 필드와 로그인 버튼을 렌더링한다', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '로그인하기' })
    ).toBeInTheDocument()
  })

  it('필수 필드를 비운 채 제출하면 유효성 검증 에러를 표시하고 signIn을 호출하지 않는다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: '로그인하기' }))

    expect(
      await screen.findByText('이메일을 입력해 주세요.')
    ).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('정상 입력 후 제출하면 signIn Server Action을 호출한다', async () => {
    vi.mocked(signIn).mockResolvedValue({
      success: true,
      redirect: '/dashboard',
    })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('이메일'), 'user@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '로그인하기' }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
        })
      )
    })
  })
})
