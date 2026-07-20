import { AppSidebar } from '@/components/layout/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AuthButton } from '@/components/auth-button'
import { ThemeToggle } from '@/components/theme-toggle'

interface AppShellProps {
  children: React.ReactNode
}

/** 로그인 후 5개 라우트(대시보드/견적서/거래처/템플릿/설정)에서 공통으로 사용하는 사이드바 레이아웃 셸 */
export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* 상단 바: 모바일용 사이드바 토글 + 우측 인증/테마 버튼 */}
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur sm:px-6">
          <SidebarTrigger />

          <div className="flex items-center gap-4">
            <AuthButton />
            <ThemeToggle />
          </div>
        </header>

        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
