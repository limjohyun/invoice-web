import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InvoiceForm } from './invoice-form'
import { createInvoiceWithItems } from '@/lib/actions/notion'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/lib/actions/notion', () => ({
  createInvoiceWithItems: vi.fn(),
  updateInvoiceWithItems: vi.fn(),
}))

describe('InvoiceForm', () => {
  beforeEach(() => {
    vi.mocked(createInvoiceWithItems).mockReset()
  })

  it('견적서 정보/품목 입력 필드와 생성 버튼을 렌더링한다', () => {
    render(<InvoiceForm mode="create" clients={[]} templates={[]} />)

    expect(screen.getByLabelText('제목')).toBeInTheDocument()
    expect(screen.getByLabelText('거래처명')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('품목명')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '견적서 생성' })
    ).toBeInTheDocument()
  })

  it('제목/거래처명을 비운 채 제출하면 유효성 검증 에러를 표시하고 저장 액션을 호출하지 않는다', async () => {
    const user = userEvent.setup()
    render(<InvoiceForm mode="create" clients={[]} templates={[]} />)

    await user.click(screen.getByRole('button', { name: '견적서 생성' }))

    expect(
      await screen.findByText('견적서 제목을 입력해 주세요.')
    ).toBeInTheDocument()
    expect(screen.getByText('거래처명을 입력해 주세요.')).toBeInTheDocument()
    expect(createInvoiceWithItems).not.toHaveBeenCalled()
  })

  it('필수 필드를 입력하고 제출하면 createInvoiceWithItems를 호출한다', async () => {
    vi.mocked(createInvoiceWithItems).mockResolvedValue({
      success: true,
      data: { id: 'inv_1' },
    } as Awaited<ReturnType<typeof createInvoiceWithItems>>)

    const user = userEvent.setup()
    render(<InvoiceForm mode="create" clients={[]} templates={[]} />)

    await user.type(screen.getByLabelText('제목'), '2026-07-INV-100')
    await user.type(screen.getByLabelText('거래처명'), 'ABC 주식회사')
    await user.type(screen.getByPlaceholderText('품목명'), '컨설팅')
    await user.click(screen.getByRole('button', { name: '견적서 생성' }))

    await waitFor(() => {
      expect(createInvoiceWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '2026-07-INV-100',
          clientName: 'ABC 주식회사',
        }),
        expect.arrayContaining([expect.objectContaining({ name: '컨설팅' })])
      )
    })
  })
})
