'use client'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { fmtMoeda, fmtData } from '@/lib/utils'
import type { Emprestimo } from '@/types'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ativo:        'default',
  quitado:      'secondary',
  inadimplente: 'destructive',
}

interface Props {
  emprestimos: Emprestimo[]
}

export function EmprestimosTable({ emprestimos }: Props) {
  if (emprestimos.length === 0) {
    return (
      <div className="rounded-md border py-16 text-center text-muted-foreground">
        Nenhum empréstimo cadastrado.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {emprestimos.map(e => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.clientes?.nome ?? '—'}</TableCell>
              <TableCell>{fmtMoeda(Number(e.valor_principal))}</TableCell>
              <TableCell>{e.taxa_juros}% a.m.</TableCell>
              <TableCell>{e.tipo === 'renovavel' ? 'Renovável' : `${e.num_parcelas}x`}</TableCell>
              <TableCell>{fmtData(e.data_inicio)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[e.status] ?? 'secondary'} className="capitalize">
                  {e.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" render={<Link href={`/emprestimos/${e.id}`} />}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
