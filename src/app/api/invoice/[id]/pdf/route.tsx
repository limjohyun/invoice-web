import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'

import { getInvoice } from '@/lib/actions/notion'
import { InvoicePdfDocument } from '@/lib/pdf/invoice-pdf'

interface RouteParams {
  params: Promise<{ id: string }>
}

/** 견적서 상세 데이터를 PDF로 렌더링해 다운로드 응답으로 반환합니다 (F007). */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const result = await getInvoice(id)

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error?.message ?? '견적서를 불러오지 못했습니다.' },
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
