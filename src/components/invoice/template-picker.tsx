'use client'

import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'

import type { Template } from '@/lib/notion/types'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TemplatePickerProps {
  templates: Template[]
  onSelect: (template: Template) => void
}

/** 견적서 작성 폼에서 저장된 템플릿을 검색해 품목 목록을 한 번에 채우는 콤보박스 (F013 연동). */
export function TemplatePicker({ templates, onSelect }: TemplatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={templates.length === 0}
          className="gap-1"
        >
          템플릿 불러오기
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="템플릿 검색..." />
          <CommandList>
            <CommandEmpty>등록된 템플릿이 없습니다.</CommandEmpty>
            <CommandGroup>
              {templates.map(template => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={() => {
                    onSelect(template)
                    setOpen(false)
                  }}
                >
                  {template.name}
                  <span className="text-muted-foreground ml-auto text-xs">
                    품목 {template.items.length}개
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
