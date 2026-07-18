'use client'

import { useWatch, type Control } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import type { TemplateFormData } from '@/lib/schemas/template'
import { calculateItemAmount } from '@/lib/invoice/calculate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface TemplateItemRowProps {
  control: Control<TemplateFormData>
  index: number
  onRemove: () => void
  removable: boolean
}

/** 템플릿 작성/수정 폼의 품목 1행. Invoice의 invoice-item-row.tsx와 동일한 패턴이다. */
export function TemplateItemRow({
  control,
  index,
  onRemove,
  removable,
}: TemplateItemRowProps) {
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` })
  const amount = calculateItemAmount(
    Number(quantity) || 0,
    Number(unitPrice) || 0
  )

  return (
    <TableRow>
      <TableCell className="align-top whitespace-normal">
        <FormField
          control={control}
          name={`items.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="품목명" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top whitespace-normal">
        <FormField
          control={control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="설명 (선택)"
                  rows={1}
                  className="min-h-9"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...field}
                  onChange={event =>
                    field.onChange(
                      event.target.value === ''
                        ? ''
                        : event.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                  onChange={event =>
                    field.onChange(
                      event.target.value === ''
                        ? ''
                        : event.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`items.${index}.taxRate`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={event =>
                    field.onChange(
                      event.target.value === ''
                        ? undefined
                        : event.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="pt-4 text-right align-top whitespace-nowrap">
        {amount.toLocaleString('ko-KR')}
      </TableCell>
      <TableCell className="pt-2 align-top">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!removable}
          aria-label="품목 삭제"
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
