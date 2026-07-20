import { AppShell } from '@/components/layout/app-shell'

/**
 * 대시보드 페이지 전용 레이아웃
 * 좌측 사이드바 + 상단 바를 포함한 앱 셸 레이아웃 (invoice/clients/templates/settings 레이아웃과 동일한 패턴)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
