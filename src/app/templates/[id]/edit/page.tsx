import { Metadata } from 'next'

import { getTemplate } from '@/lib/actions/notion'
import type { TemplateFormData } from '@/lib/schemas/template'
import { TemplateForm } from '@/components/templates/template-form'

export const metadata: Metadata = {
  title: '템플릿 수정',
}

export const dynamic = 'force-dynamic'

interface TemplateEditPageProps {
  params: Promise<{ id: string }>
}

export default async function TemplateEditPage({
  params,
}: TemplateEditPageProps) {
  const { id } = await params
  const result = await getTemplate(id)

  if (!result.success || !result.data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-destructive text-sm">
          {result.error?.message ?? '템플릿을 불러오지 못했습니다.'}
        </p>
      </div>
    )
  }

  const template = result.data
  const defaultValues: TemplateFormData = {
    name: template.name,
    description: template.description ?? '',
    items:
      template.items.length > 0
        ? template.items.map(item => ({
            name: item.name,
            description: item.description ?? '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
          }))
        : [
            {
              name: '',
              description: '',
              quantity: 1,
              unitPrice: 0,
              taxRate: undefined,
            },
          ],
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">템플릿 수정</h1>
        <p className="text-muted-foreground text-sm">
          템플릿 정보와 품목을 수정하세요
        </p>
      </div>
      <TemplateForm
        mode="edit"
        templateId={template.id}
        defaultValues={defaultValues}
      />
    </div>
  )
}
