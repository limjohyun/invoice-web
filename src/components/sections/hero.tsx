import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Building2, Calculator } from 'lucide-react'

// 핵심 기능 하이라이트 4개 (기술스택 자랑 대신 실제 제품 가치 전달)
const highlights = [
  {
    icon: RefreshCw,
    title: '실시간 Notion 동기화',
    description: '데이터베이스 그대로',
  },
  {
    icon: Download,
    title: 'PDF 다운로드',
    description: '클릭 한 번으로 발급',
  },
  {
    icon: Building2,
    title: '거래처/템플릿 관리',
    description: '반복 작업 최소화',
  },
  {
    icon: Calculator,
    title: '자동 금액 계산',
    description: '수기 계산 실수 없이',
  },
]

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            Notion 기반 견적서 관리
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Notion으로 관리하는
            <span className="text-primary mt-2 block">가장 쉬운 견적서</span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            별도의 서버·데이터베이스 구축 없이, 이미 쓰고 있는 Notion을 백엔드로
            활용해 견적서를 작성하고 관리하고 공유하세요.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full px-8 text-base sm:w-auto"
              >
                로그인
              </Button>
            </Link>
          </div>

          {/* 핵심 기능 하이라이트 그리드 */}
          <div className="mt-16 grid grid-cols-2 gap-6 text-left md:grid-cols-4">
            {highlights.map(item => (
              <div key={item.title} className="flex flex-col items-start">
                <item.icon
                  className="text-primary mb-2 h-6 w-6"
                  aria-hidden="true"
                />
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-muted-foreground text-xs">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
