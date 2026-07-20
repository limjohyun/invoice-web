'use client'

import { useState } from 'react'
import { Link2, Link2Off, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { createOrGetShareLink, revokeShareLink } from '@/lib/actions/share'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * 견적서 목록(F014)의 행별 공유 링크 액션. 클라이언트에게 보낼 공개 열람 링크를
 * 복사하거나(F015), 발급된 링크를 회수(비활성화)할 수 있다.
 */
export function ShareLinkActions({ invoiceId }: { invoiceId: string }) {
  const [isBusy, setIsBusy] = useState(false)

  async function handleCopyLink() {
    setIsBusy(true)
    try {
      const result = await createOrGetShareLink(invoiceId)
      if (!result.success || !result.data) {
        toast.error(result.error?.message ?? '공유 링크 발급에 실패했습니다.')
        return
      }
      const shareUrl = `${window.location.origin}/share/${result.data.token}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('클라이언트에게 보낼 링크를 복사했습니다.')
    } catch (error) {
      console.error('공유 링크 복사 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRevokeLink() {
    setIsBusy(true)
    try {
      const result = await revokeShareLink(invoiceId)
      if (!result.success) {
        toast.error(
          result.error?.message ?? '공유 링크 비활성화에 실패했습니다.'
        )
        return
      }
      toast.success('공유 링크를 비활성화했습니다.')
    } catch (error) {
      console.error('공유 링크 비활성화 에러:', error)
      toast.error('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isBusy}
          aria-label="공유 링크 관리"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleCopyLink}>
          <Link2 className="size-4" aria-hidden="true" />
          링크 복사
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleRevokeLink} variant="destructive">
          <Link2Off className="size-4" aria-hidden="true" />
          링크 비활성화
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
