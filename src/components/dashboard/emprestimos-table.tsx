// src/components/dashboard/emprestimos-table.tsx
'use client'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Money } from '@/components/ui/money'
import { fmtData } from '@/lib/utils'
import { avatarColor, iniciais } from '@/lib/avatar-color'
import type { Emprestimo } from '@/types'

const statusChip: Record<string, React.ReactNode> = {
  ativo: (
    <Badge variant="secondary" className="gap-1.5 bg-[var(--success)]/10 text-[var(--success)] border-transparent">
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> Ativo
    </Badge>
  ),
  quitado:      <Badge variant="secondary">Quitado</Badge>,
  inadimplente: <Badge variant="destructive">Inadimplente</Badge>,
}

interface Props {
  emprestimos: Emprestimo[]
}

export function EmprestimosTable({ emprestimos }: Props) {
  if (emprestimos.length === 0) {
    return (
      <div className="rounded-xl border py-16 text-center text-muted-foreground bg-card">
        Nenhum empréstimo cadastrado.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Principal</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {emprestimos.map(e => {
            const nome = e.clientes?.nome ?? '—'
            return (
              <TableRow key={e.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/emprestimos/${e.id}`} className="flex items-center gap-3 -my-2 py-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-foreground shrink-0"
                      style={{ background: avatarColor(nome) }}
                    >
                      {iniciais(nome)}
                    </span>
                    <span className="font-medium truncate">{nome}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Money value={Number(e.valor_principal)} />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{e.taxa_juros}%<span className="text-muted-foreground text-xs ml-1">a.m.</span></span>
                </TableCell>
                <TableCell>
                  {e.tipo === 'renovavel' ? (
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <RefreshCw className="h-3 w-3" /> Renovável
                    </span>
                  ) : (
                    <span className="text-sm">{e.num_parcelas}× Price</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtData(e.data_inicio)}
                </TableCell>
                <TableCell>{statusChip[e.status] ?? statusChip.quitado}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" render={<Link href={`/emprestimos/${e.id}`} />}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
