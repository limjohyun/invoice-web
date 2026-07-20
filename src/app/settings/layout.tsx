import { AppShell } from '@/components/layout/app-shell'

/**
 * 설정 페이지 전용 레이아웃
 * 좌측 사이드바 + 상단 바를 포함한 앱 셸 레이아웃
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
