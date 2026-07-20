import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SignupForm } from './signup-form'
import { signUp } from '@/lib/actions/auth'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/actions/auth', () => ({
  signUp: vi.fn(),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    vi.mocked(signUp).mockReset()
  })

  it('이름/이메일/비밀번호 입력 필드와 회원가입 버튼을 렌더링한다', () => {
    render(<SignupForm />)

    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('필수 필드를 비운 채 제출하면 유효성 검증 에러를 표시하고 signUp을 호출하지 않는다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    expect(
      await screen.findByText('이름은 최소 2자 이상이어야 합니다.')
    ).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('비밀번호와 비밀번호 확인이 다르면 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'user@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password456')
    await user.click(screen.getByLabelText('이용약관에 동의합니다'))
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    expect(
      await screen.findByText('비밀번호가 일치하지 않습니다.')
    ).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('정상 입력 후 제출하면 signUp Server Action을 호출한다', async () => {
    vi.mocked(signUp).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'user@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')
    await user.click(screen.getByLabelText('이용약관에 동의합니다'))
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '홍길동',
          email: 'user@example.com',
          password: 'password123',
        })
      )
    })
  })
})
