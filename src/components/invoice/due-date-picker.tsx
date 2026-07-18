'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface DueDatePickerProps
  extends Omit<React.ComponentProps<typeof Button>, 'value' | 'onChange'> {
  /** 'yyyy-MM-dd' 형식 문자열 */
  value?: string
  onChange: (value: string | undefined) => void
}

/**
 * 견적서 기한(Due Date) 선택용 날짜 선택기.
 * FormControl이 id/aria-* 속성을 이 컴포넌트가 렌더링하는 실제 버튼에 전달할 수 있도록
 * 나머지 props를 그대로 트리거 버튼에 스프레드한다(로그인 폼 접근성 버그와 동일한 문제 방지).
 */
export function DueDatePicker({
  value,
  onChange,
  disabled,
  className,
  ...buttonProps
}: DueDatePickerProps) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          {...buttonProps}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selected ? selected.toLocaleDateString('ko-KR') : '기한 선택 (선택)'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={date => onChange(date ? toDateInputValue(date) : undefined)}
        />
      </PopoverContent>
    </Popover>
  )
}
