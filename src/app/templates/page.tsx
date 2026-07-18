import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutTemplate, Plus } from 'lucide-react'

import { getTemplates } from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TemplateList } from '@/components/templates/template-list'

export const metadata: Metadata = {
  title: '템플릿 관리',
  description: '자주 쓰는 품목 구성을 템플릿으로 관리하세요',
}

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const result = await getTemplates()
  const templates = result.success ? (result.data ?? []) : []

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">템플릿 관리</h1>
          <p className="text-muted-foreground text-sm">
            자주 쓰는 품목 구성을 템플릿으로 저장하고 불러오세요
          </p>
        </div>
        <Link href="/templates/create">
          <Button className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            템플릿 추가
          </Button>
        </Link>
      </div>

      {!result.success && (
        <Card>
          <CardContent className="text-destructive py-10 text-center text-sm">
            {result.error?.message ?? '템플릿 목록을 불러오지 못했습니다.'}
          </CardContent>
        </Card>
      )}

      {result.success && templates.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="bg-muted flex size-16 items-center justify-center rounded-full">
                <LayoutTemplate
                  className="text-muted-foreground size-8"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium">등록된 템플릿 없음</p>
                <p className="text-muted-foreground text-sm">
                  템플릿을 등록하면 견적서 작성 시 품목을 한 번에 불러올 수
                  있습니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.success && templates.length > 0 && (
        <TemplateList templates={templates} />
      )}
    </div>
  )
}
