import { Header } from '@/components/layout/header'

/**
 * 설정 페이지 전용 레이아웃
 * 상단 헤더 네비게이션을 포함한 기본 레이아웃 구조
 */
export default function SettingsLayout({
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
