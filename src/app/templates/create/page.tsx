import { Metadata } from 'next'

import { TemplateForm } from '@/components/templates/template-form'

export const metadata: Metadata = {
  title: '템플릿 등록',
  description: '자주 쓰는 품목 구성을 템플릿으로 저장하세요',
}

export default function TemplateCreatePage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">템플릿 등록</h1>
        <p className="text-muted-foreground text-sm">
          자주 쓰는 품목 구성을 입력해 템플릿으로 저장하세요
        </p>
      </div>
      <TemplateForm mode="create" />
    </div>
  )
}
