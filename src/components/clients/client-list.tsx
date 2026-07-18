import Link from 'next/link'

import type { Client } from '@/lib/notion/types'
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
import { Pencil } from 'lucide-react'
import { DeleteClientButton } from '@/components/clients/delete-client-button'

/** 거래처 목록 테이블 (F012) */
export function ClientList({ clients }: { clients: Client[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>거래처명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>전화번호</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.contactPerson ?? '-'}</TableCell>
                <TableCell>{client.email ?? '-'}</TableCell>
                <TableCell>{client.phone ?? '-'}</TableCell>
                <TableCell className="flex justify-end gap-1">
                  <Link href={`/clients/${client.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="거래처 수정"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <DeleteClientButton clientId={client.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
