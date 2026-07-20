import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="bg-muted flex size-16 items-center justify-center rounded-full">
            <FileQuestion
              className="text-muted-foreground size-8"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">페이지를 찾을 수 없습니다</p>
            <p className="text-muted-foreground text-sm">
              주소가 잘못되었거나 삭제된 페이지일 수 있습니다.
            </p>
          </div>
          <Link href="/dashboard">
            <Button>대시보드로 이동</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
