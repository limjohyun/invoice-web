import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

export function CTASection() {
  return (
    <section className="py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Notion 계정만 있으면 바로 시작할 수 있습니다. 복잡한 설정 없이
            견적서 관리를 시작해보세요.
          </p>

          <div className="flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 text-base">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
