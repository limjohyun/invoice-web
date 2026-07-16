import { Header } from '@/components/layout/header'

/**
 * 대시보드 페이지 전용 레이아웃
 * 상단 헤더 네비게이션을 포함한 기본 레이아웃 구조 (settings 레이아웃과 동일한 패턴)
 */
export default function DashboardLayout({
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
