'use client'

import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'

import type { Client } from '@/lib/notion/types'
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

interface ClientPickerProps {
  clients: Client[]
  onSelect: (client: Client) => void
}

/** 견적서 작성 폼에서 등록된 거래처를 검색해 거래처 필드를 한 번에 채우는 콤보박스 (F012 연동). */
export function ClientPicker({ clients, onSelect }: ClientPickerProps) {
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
          disabled={clients.length === 0}
          className="gap-1"
        >
          거래처 불러오기
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="거래처 검색..." />
          <CommandList>
            <CommandEmpty>등록된 거래처가 없습니다.</CommandEmpty>
            <CommandGroup>
              {clients.map(client => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onSelect(client)
                    setOpen(false)
                  }}
                >
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
