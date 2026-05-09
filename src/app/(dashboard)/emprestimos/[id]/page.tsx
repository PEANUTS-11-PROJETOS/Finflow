import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ParcelasTable } from '@/components/dashboard/parcelas-table'
import { CardCobrancaRenovavel } from '@/components/dashboard/card-cobranca-renovavel'
import { ArrowLeft } from 'lucide-react'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import type { Parcela } from '@/types'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ativo: 'default', quitado: 'secondary', inadimplente: 'destructive',
}

export default async function EmprestimoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: emprestimo }, { data: parcelas }] = await Promise.all([
    supabase.from('emprestimos').select('*, clientes(id, nome)').eq('id', id).eq('credor_id', user.id).single(),
    supabase.from('parcelas').select('*').eq('emprestimo_id', id).order('numero'),
  ])

  if (!emprestimo) notFound()

  const totalPago = parcelas?.filter(p => p.pago || p.rolado).reduce((s, p) => {
    // para rolado, só o juros foi pago
    if (p.rolado) return s + Number(p.valor_juros ?? 0)
    return s + Number(p.valor)
  }, 0) ?? 0

  const nomeCliente = (emprestimo.clientes as { nome: string })?.nome

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/emprestimos" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              Empréstimo de {nomeCliente}
            </h1>
            <Badge variant={statusVariant[emprestimo.status] ?? 'secondary'} className="capitalize">
              {emprestimo.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {emprestimo.tipo === 'renovavel' ? 'Renovável' : 'Parcelas fixas'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Criado em {fmtData(emprestimo.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Valor principal', value: fmtMoeda(Number(emprestimo.valor_principal)) },
          { label: 'Taxa de juros',   value: `${emprestimo.taxa_juros}% a.m.` },
          emprestimo.tipo === 'price'
            ? { label: 'Parcelas', value: `${emprestimo.num_parcelas}x` }
            : { label: 'Tipo', value: 'Renovável' },
          { label: 'Total pago', value: fmtMoeda(totalPago) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xl font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {emprestimo.observacoes && (
        <p className="text-sm text-muted-foreground border rounded-md px-4 py-3">
          {emprestimo.observacoes}
        </p>
      )}

      <Separator />

      {emprestimo.tipo === 'renovavel' ? (
        <div className="space-y-6">
          {/* Cobrança atual: última parcela não rolada e não paga */}
          {(() => {
            const parcelaAberta = (parcelas ?? [])
              .filter(p => !p.pago && !p.rolado)
              .sort((a, b) => b.numero - a.numero)[0]

            return parcelaAberta ? (
              <div className="max-w-sm">
                <h2 className="text-lg font-medium mb-4">Situação atual</h2>
                <CardCobrancaRenovavel
                  parcelaAberta={parcelaAberta as Parcela}
                  valorPrincipal={Number(emprestimo.valor_principal)}
                  quitado={emprestimo.status === 'quitado'}
                />
              </div>
            ) : (
              <div className="max-w-sm">
                <h2 className="text-lg font-medium mb-4">Situação atual</h2>
                <CardCobrancaRenovavel
                  parcelaAberta={(parcelas ?? [])[0] as Parcela}
                  valorPrincipal={Number(emprestimo.valor_principal)}
                  quitado={emprestimo.status === 'quitado'}
                />
              </div>
            )
          })()}

          {/* Histórico de cobranças */}
          <div>
            <h2 className="text-lg font-medium mb-4">Histórico de cobranças</h2>
            <div className="rounded-md border divide-y text-sm">
              {(parcelas ?? []).map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium">Venc. {fmtData(p.vencimento)}</span>
                    {p.data_pagamento && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        · pago em {fmtData(p.data_pagamento)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{fmtMoeda(Number(p.valor))}</span>
                    {p.pago && <Badge variant="secondary">Quitado</Badge>}
                    {p.rolado && <Badge variant="outline">Rolou — juros {fmtMoeda(Number(p.valor_juros ?? 0))}</Badge>}
                    {!p.pago && !p.rolado && <Badge variant="outline">Em aberto</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-medium mb-4">Parcelas</h2>
          <ParcelasTable parcelas={(parcelas ?? []) as Parcela[]} emprestimoId={id} />
        </div>
      )}
    </div>
  )
}
