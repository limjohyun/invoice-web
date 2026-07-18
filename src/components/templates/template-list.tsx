import Link from 'next/link'
import { Pencil } from 'lucide-react'

import type { Template } from '@/lib/notion/types'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DeleteTemplateButton } from '@/components/templates/delete-template-button'

/** 템플릿 목록 테이블 (F013) */
export function TemplateList({ templates }: { templates: Template[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>템플릿명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="text-right">품목 수</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map(template => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {template.description ?? '-'}
                </TableCell>
                <TableCell className="text-right">
                  {template.items.length}
                </TableCell>
                <TableCell className="flex justify-end gap-1">
                  <Link href={`/templates/${template.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="템플릿 수정"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <DeleteTemplateButton templateId={template.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
