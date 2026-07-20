import { Container } from '@/components/layout/container'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LayoutDashboard,
  FileText,
  Download,
  Building2,
  LayoutTemplate,
  RefreshCw,
} from 'lucide-react'

// 실제 제품 기능 카드 6개 (제네릭 개발자 도구 자랑 대신 서비스 핵심 기능 소개)
const features = [
  {
    icon: LayoutDashboard,
    title: '대시보드',
    description:
      '작성 중인 견적서 현황과 최근 활동을 한눈에 확인할 수 있습니다.',
  },
  {
    icon: FileText,
    title: '견적서 작성',
    description:
      '품목을 추가하면 수량과 단가에 따라 합계 금액이 자동으로 계산됩니다.',
  },
  {
    icon: Download,
    title: 'PDF 다운로드',
    description:
      '한글 폰트를 완벽히 지원하는 PDF로 견적서를 바로 내려받을 수 있습니다.',
  },
  {
    icon: Building2,
    title: '거래처 관리',
    description:
      '자주 거래하는 업체 정보를 등록해두고 견적서 작성 시 바로 불러옵니다.',
  },
  {
    icon: LayoutTemplate,
    title: '템플릿 관리',
    description:
      '자주 쓰는 품목 구성을 템플릿으로 저장해 반복 작업을 줄여줍니다.',
  },
  {
    icon: RefreshCw,
    title: 'Notion 완전 동기화',
    description:
      '작성한 모든 견적서 데이터는 연결된 Notion 데이터베이스에 실시간으로 반영됩니다.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-muted/50 py-20">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">주요 기능</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            견적서 작성부터 거래처·템플릿 관리까지, 필요한 기능을 모두
            제공합니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <Card
              key={feature.title}
              className="bg-background border-0 shadow-none"
            >
              <CardHeader>
                <feature.icon className="text-primary mb-2 h-10 w-10" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
