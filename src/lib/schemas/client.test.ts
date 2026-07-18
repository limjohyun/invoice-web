import { describe, expect, it } from 'vitest'
import { clientSchema } from '@/lib/schemas/client'

/** 검증을 통과하는 기본 거래처 데이터 */
const validClient = {
  name: '주식회사 테스트',
  contactPerson: '홍길동',
  email: 'contact@example.com',
  phone: '010-1234-5678',
  address: '서울특별시 강남구',
  registrationNumber: '123-45-67890',
  notes: '비고',
}

describe('clientSchema', () => {
  it('정상 입력을 통과시킨다', () => {
    const result = clientSchema.safeParse(validClient)
    expect(result.success).toBe(true)
  })

  it('name이 빈 문자열이면 실패한다', () => {
    const result = clientSchema.safeParse({ ...validClient, name: '' })
    expect(result.success).toBe(false)
  })

  it('email 형식이 잘못되면 실패한다', () => {
    const result = clientSchema.safeParse({
      ...validClient,
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })

  it('email이 빈 문자열이면 통과한다', () => {
    const result = clientSchema.safeParse({ ...validClient, email: '' })
    expect(result.success).toBe(true)
  })

  it('선택 필드를 모두 생략해도 통과한다', () => {
    const result = clientSchema.safeParse({ name: '주식회사 테스트' })
    expect(result.success).toBe(true)
  })
})
