import { Metadata } from 'next'

import { getClient } from '@/lib/actions/notion'
import type { ClientFormData } from '@/lib/schemas/client'
import { ClientForm } from '@/components/clients/client-form'

export const metadata: Metadata = {
  title: '거래처 수정',
}

export const dynamic = 'force-dynamic'

interface ClientEditPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientEditPage({ params }: ClientEditPageProps) {
  const { id } = await params
  const result = await getClient(id)

  if (!result.success || !result.data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-destructive text-sm">
          {result.error?.message ?? '거래처를 불러오지 못했습니다.'}
        </p>
      </div>
    )
  }

  const client = result.data
  const defaultValues: ClientFormData = {
    name: client.name,
    contactPerson: client.contactPerson ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    address: client.address ?? '',
    registrationNumber: client.registrationNumber ?? '',
    notes: client.notes ?? '',
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">거래처 수정</h1>
        <p className="text-muted-foreground text-sm">
          거래처 정보를 수정하세요
        </p>
      </div>
      <ClientForm
        mode="edit"
        clientId={client.id}
        defaultValues={defaultValues}
      />
    </div>
  )
}
