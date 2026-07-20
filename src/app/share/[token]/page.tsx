import { Metadata } from 'next'
import { FileWarning } from 'lucide-react'

import { getInvoiceByShareToken } from '@/lib/actions/share'
import { PublicInvoiceDetail } from '@/components/invoice/public-invoice-detail'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '공유된 견적서',
  robots: { index: false, follow: false },
}

/** 링크 유효성은 매 요청 확인해야 하므로(비활성화 반영) 캐시하지 않는다. */
export const dynamic = 'force-dynamic'

interface SharedInvoicePageProps {
  params: Promise<{ token: string }>
}

export default async function SharedInvoicePage({
  params,
}: SharedInvoicePageProps) {
  const { token } = await params
  const result = await getInvoiceByShareToken(token)

  if (!result.success || !result.data) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-full">
              <FileWarning
                className="text-muted-foreground size-8"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">
                유효하지 않거나 만료된 링크입니다
              </p>
              <p className="text-muted-foreground text-sm">
                링크를 발급한 담당자에게 새 링크를 요청해 주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PublicInvoiceDetail invoice={result.data} shareToken={token} />
    </div>
  )
}
