'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { clientSchema, type ClientFormData } from '@/lib/schemas/client'
import { createClient, updateClient } from '@/lib/actions/notion'
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

type ClientFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; clientId: string; defaultValues: ClientFormData }

/** 거래처 등록(F012)/수정 공용 폼. */
export function ClientForm(props: ClientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues:
      props.mode === 'edit'
        ? props.defaultValues
        : {
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            registrationNumber: '',
            notes: '',
          },
    mode: 'onChange',
  })

  async function onSubmit(data: ClientFormData) {
    setIsSubmitting(true)
    try {
      const input = {
        name: data.name,
        contactPerson: data.contactPerson || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        registrationNumber: data.registrationNumber || undefined,
        notes: data.notes || undefined,
      }

      const result =
        props.mode === 'create'
          ? await createClient(input)
          : await updateClient(props.clientId, input)

      if (!result.success || !result.data) {
        toast.error(result.error?.message ?? '저장에 실패했습니다.')
        return
      }

      toast.success(
        props.mode === 'create'
          ? '거래처를 등록했습니다.'
          : '거래처를 수정했습니다.'
      )
      router.push('/clients')
      router.refresh()
    } catch (error) {
      console.error('거래처 저장 에러:', error)
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
            <CardTitle>거래처 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>거래처명</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC 주식회사" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당자</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@abc.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input placeholder="02-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사업자등록번호</FormLabel>
                  <FormControl>
                    <Input placeholder="123-45-67890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input placeholder="서울시 강남구 ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea placeholder="메모 (선택)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                ? '거래처 등록'
                : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
