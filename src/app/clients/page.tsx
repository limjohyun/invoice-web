import { Metadata } from 'next'
import Link from 'next/link'
import { Building2, UserPlus } from 'lucide-react'

import { getClients } from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClientList } from '@/components/clients/client-list'

export const metadata: Metadata = {
  title: '거래처 관리',
  description: '견적서 작성에 사용할 거래처를 관리하세요',
}

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const result = await getClients()
  const clients = result.success ? (result.data ?? []) : []

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">거래처 관리</h1>
          <p className="text-muted-foreground text-sm">
            견적서 작성에 사용할 거래처를 등록하고 관리하세요
          </p>
        </div>
        <Link href="/clients/create">
          <Button className="gap-2">
            <UserPlus className="size-4" aria-hidden="true" />
            거래처 추가
          </Button>
        </Link>
      </div>

      {!result.success && (
        <Card>
          <CardContent className="text-destructive py-10 text-center text-sm">
            {result.error?.message ?? '거래처 목록을 불러오지 못했습니다.'}
          </CardContent>
        </Card>
      )}

      {result.success && clients.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <Building2
                  className="text-muted-foreground size-8"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium">등록된 거래처 없음</p>
                <p className="text-muted-foreground text-sm">
                  거래처를 등록하면 견적서 작성 시 바로 불러올 수 있습니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.success && clients.length > 0 && <ClientList clients={clients} />}
    </div>
  )
}
