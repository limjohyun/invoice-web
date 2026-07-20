import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'

import { getInvoiceByShareToken } from '@/lib/actions/share'
import { InvoicePdfDocument } from '@/lib/pdf/invoice-pdf'

interface RouteParams {
  params: Promise<{ token: string }>
}

/**
 * 공유 링크(F015)로 견적서 PDF를 다운로드합니다. 로그인 없이 접근하는 공개 라우트이므로
 * 견적서 조회는 세션이 아닌 공유 토큰으로 인증하는 getInvoiceByShareToken을 사용합니다.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { token } = await params
  const result = await getInvoiceByShareToken(token)

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error?.message ?? '유효하지 않거나 만료된 링크입니다.' },
      { status: result.error?.code === 'not_found' ? 404 : 500 }
    )
  }

  const invoice = result.data
  const buffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />)
  const fileName = `${invoice.title || 'invoice'}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  })
}
