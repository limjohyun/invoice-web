'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { templateSchema, type TemplateFormData } from '@/lib/schemas/template'
import { createTemplate, updateTemplate } from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TemplateItemRow } from '@/components/templates/template-item-row'

const EMPTY_ITEM = {
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: undefined,
} satisfies TemplateFormData['items'][number]

type TemplateFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; templateId: string; defaultValues: TemplateFormData }

/** 템플릿 등록(F013)/수정 공용 폼. invoice-form.tsx의 useFieldArray 패턴을 그대로 따른다. */
export function TemplateForm(props: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues:
      props.mode === 'edit'
        ? props.defaultValues
        : {
            name: '',
            description: '',
            items: [EMPTY_ITEM],
          },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const itemsError = form.formState.errors.items?.message

  async function onSubmit(data: TemplateFormData) {
    setIsSubmitting(true)
    try {
      const input = {
        name: data.name,
        description: data.description || undefined,
        items: data.items.map(item => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
      }

      const result =
        props.mode === 'create'
          ? await createTemplate(input)
          : await updateTemplate(props.templateId, input)

      if (!result.success || !result.data) {
        toast.error(result.error?.message ?? '저장에 실패했습니다.')
        return
      }

      toast.success(
        props.mode === 'create'
          ? '템플릿을 등록했습니다.'
          : '템플릿을 수정했습니다.'
      )
      router.push('/templates')
      router.refresh()
    } catch (error) {
      console.error('템플릿 저장 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>템플릿 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>템플릿명</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 정기 유지보수 견적" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea placeholder="설명 (선택)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>품목</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => append({ ...EMPTY_ITEM })}
            >
              <Plus className="size-4" />
              품목 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">품목명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-24">수량</TableHead>
                  <TableHead className="w-32">단가</TableHead>
                  <TableHead className="w-24">세율(%)</TableHead>
                  <TableHead className="w-28 text-right">금액</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TemplateItemRow
                    key={field.id}
                    control={form.control}
                    index={index}
                    onRemove={() => remove(index)}
                    removable={fields.length > 1}
                  />
                ))}
              </TableBody>
            </Table>
            {itemsError && (
              <p className="text-destructive text-sm">{itemsError}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? '저장 중...'
              : props.mode === 'create'
                ? '템플릿 등록'
                : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
