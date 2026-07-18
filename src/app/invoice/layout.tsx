import { Header } from '@/components/layout/header'

/**
 * 견적서 관련 페이지 전용 레이아웃 (dashboard/settings 레이아웃과 동일한 패턴)
 */
export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>{children}</main>
    </div>
  )
}
