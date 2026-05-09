'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Circle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { marcarParcela, atualizarStatusEmprestimo } from '@/app/(dashboard)/emprestimos/actions'
import type { Parcela } from '@/types'

interface Props {
  parcelas: Parcela[]
  emprestimoId: string
}

export function ParcelasTable({ parcelas, emprestimoId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const totalPago   = parcelas.filter(p => p.pago).reduce((s, p) => s + Number(p.valor), 0)
  const totalAberto = parcelas.filter(p => !p.pago).reduce((s, p) => s + Number(p.valor), 0)
  const hoje        = new Date().toISOString().split('T')[0]

  function handleMarcar(parcelaId: string, pago: boolean) {
    startTransition(async () => {
      const result = await marcarParcela(parcelaId, pago)
      if (result?.error) {
        toast.error('Erro ao atualizar parcela')
        return
      }
      await atualizarStatusEmprestimo(emprestimoId)
      toast.success(pago ? 'Parcela marcada como paga!' : 'Pagamento removido')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          Pago: <strong className="text-foreground">{fmtMoeda(totalPago)}</strong>
        </span>
        <span className="text-muted-foreground">
          Em aberto: <strong className="text-foreground">{fmtMoeda(totalAberto)}</strong>
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Nº</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pago em</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcelas.map(p => {
              const vencida = !p.pago && p.vencimento < hoje
              return (
                <TableRow key={p.id} className={vencida ? 'bg-destructive/5' : ''}>
                  <TableCell className="font-mono text-sm">{p.numero}</TableCell>
                  <TableCell className={vencida ? 'text-destructive font-medium' : ''}>
                    {fmtData(p.vencimento)}
                  </TableCell>
                  <TableCell>{fmtMoeda(Number(p.valor))}</TableCell>
                  <TableCell>
                    {p.pago ? (
                      <Badge variant="secondary">Pago</Badge>
                    ) : vencida ? (
                      <Badge variant="destructive">Vencida</Badge>
                    ) : (
                      <Badge variant="outline">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.data_pagamento ? fmtData(p.data_pagamento) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => handleMarcar(p.id, !p.pago)}
                      title={p.pago ? 'Desmarcar pagamento' : 'Marcar como pago'}
                    >
                      {p.pago
                        ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                        : <Circle className="h-5 w-5 text-muted-foreground" />
                      }
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
