import { Header } from '@/components/layout/header'

/**
 * 거래처 관리 페이지 전용 레이아웃 (dashboard/settings/invoice 레이아웃과 동일한 패턴)
 */
export default function ClientsLayout({
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
