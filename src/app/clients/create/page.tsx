import { Metadata } from 'next'

import { ClientForm } from '@/components/clients/client-form'

export const metadata: Metadata = {
  title: '거래처 등록',
  description: '새 거래처를 등록하세요',
}

export default function ClientCreatePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">거래처 등록</h1>
        <p className="text-muted-foreground text-sm">
          새 거래처 정보를 입력하세요
        </p>
      </div>
      <ClientForm mode="create" />
    </div>
  )
}
