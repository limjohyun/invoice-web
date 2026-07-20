import { AppShell } from '@/components/layout/app-shell'

/**
 * 템플릿 관리 페이지 전용 레이아웃 (dashboard/settings/invoice/clients 레이아웃과 동일한 패턴)
 */
export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
