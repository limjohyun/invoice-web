'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteInvoice } from '@/lib/actions/notion'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

/** 견적서 상세 페이지의 삭제 버튼 (F005). Notion 페이지는 실제 삭제 대신 보관 처리된다. */
export function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteInvoice(invoiceId)
      if (!result.success) {
        toast.error(result.error?.message ?? '견적서 삭제에 실패했습니다.')
        return
      }
      toast.success('견적서를 삭제했습니다.')
      router.push('/invoice')
      router.refresh()
    } catch (error) {
      console.error('견적서 삭제 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="size-4" aria-hidden="true" />
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>견적서를 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            삭제된 견적서는 Notion에서 보관 처리되며 목록에 더 이상 표시되지
            않습니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
