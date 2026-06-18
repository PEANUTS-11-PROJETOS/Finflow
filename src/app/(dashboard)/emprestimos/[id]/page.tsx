// src/app/(dashboard)/emprestimos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { ParcelasTable } from '@/components/dashboard/parcelas-table'
import { CardCobrancaRenovavel } from '@/components/dashboard/card-cobranca-renovavel'
import { ArrowLeft, RefreshCw, Phone } from 'lucide-react'
import { fmtData } from '@/lib/utils'
import type { Parcela } from '@/types'

const statusChip: Record<string, React.ReactNode> = {
  ativo: (
    <Badge variant="secondary" className="gap-1.5 bg-foreground text-background border-transparent">
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> Ativo
    </Badge>
  ),
  quitado: (
    <Badge variant="secondary" className="gap-1.5 bg-[var(--success)]/10 text-[var(--success)] border-transparent">
      Quitado
    </Badge>
  ),
  inadimplente: <Badge variant="destructive">Inadimplente</Badge>,
}

export default async function EmprestimoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: emprestimo }, { data: parcelas }] = await Promise.all([
    supabase.from('emprestimos').select('*, clientes(id, nome, telefone)').eq('id', id).eq('credor_id', user.id).single(),
    supabase.from('parcelas').select('*').eq('emprestimo_id', id).order('numero'),
  ])

  if (!emprestimo) notFound()

  const totalPago = parcelas?.filter(p => p.pago || p.rolado).reduce((s, p) => {
    if (p.rolado) return s + Number(p.valor_juros ?? 0)
    return s + Number(p.valor)
  }, 0) ?? 0

  const jurosGerados = parcelas?.filter(p => p.pago || p.rolado).reduce((s, p) => {
    if (emprestimo.tipo === 'renovavel') return s + Number(p.valor_juros ?? 0)
    const principalPorcao = emprestimo.num_parcelas ? Number(emprestimo.valor_principal) / emprestimo.num_parcelas : 0
    return s + (p.pago ? Math.max(0, Number(p.valor) - principalPorcao) : 0)
  }, 0) ?? 0

  const cliente   = emprestimo.clientes as { nome: string; telefone: string | null } | null
  const nomeCliente = cliente?.nome ?? ''
  const renovavel = emprestimo.tipo === 'renovavel'
  const ciclosPagos = parcelas?.filter(p => p.pago || p.rolado).length ?? 0

  // WhatsApp link — wa.me funciona no app mobile e no WhatsApp Web
  const proximaParcela = (parcelas ?? []).find(p => !p.pago && !p.rolado)
  const waLink = (() => {
    if (!cliente?.telefone) return null
    const valor = proximaParcela ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proximaParcela.valor)) : ''
    const venc  = proximaParcela ? fmtData(proximaParcela.vencimento) : ''
    const msg = proximaParcela
      ? `Olá ${nomeCliente}! Passando para lembrar da parcela do seu empréstimo 📋\n\nValor: ${valor}\nVencimento: ${venc}\n\nQualquer dúvida estou à disposição! 😊`
      : `Olá ${nomeCliente}! Tudo bem? Passando para falar sobre o seu empréstimo. 😊`
    return `https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
  })()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="icon" render={<Link href="/emprestimos" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Link href="/emprestimos" className="hover:text-foreground">Empréstimos</Link>
        <span>/</span>
        <span className="text-foreground/80 font-mono text-xs">#{id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-7 space-y-4">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {statusChip[emprestimo.status] ?? statusChip.ativo}
                <Badge variant="outline" className="gap-1.5">
                  {renovavel ? <><RefreshCw className="h-3 w-3" />Renovável</> : `${emprestimo.num_parcelas}× Tabela Price`}
                </Badge>
                <Badge variant="outline">{emprestimo.taxa_juros}% a.m.</Badge>
              </div>
              <h1 className="font-serif-display text-3xl md:text-4xl leading-[1.1]">
                Empréstimo de <i>{nomeCliente}</i>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Aberto em {fmtData(emprestimo.created_at)}
                {renovavel && ciclosPagos > 0 && ` · ${ciclosPagos} ${ciclosPagos === 1 ? 'ciclo pago' : 'ciclos pagos'}`}
              </p>
            </div>
          </div>
          {waLink && (
            <div>
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Phone className="h-4 w-4" /> Cobrar via WhatsApp
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow">Principal</p>
            <p className="text-2xl mt-2"><Money value={Number(emprestimo.valor_principal)} /></p>
            <p className="text-xs text-muted-foreground mt-1.5">{renovavel ? 'em aberto' : 'emprestado'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow">Taxa de juros</p>
            <p className="text-2xl font-mono mt-2">
              {emprestimo.taxa_juros}%
              <span className="text-xs text-muted-foreground ml-1.5">a.m.</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">mensal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow">Juros gerados</p>
            <p className="text-2xl mt-2"><Money value={jurosGerados} tone="success" /></p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {renovavel ? `${ciclosPagos} ciclos` : `${parcelas?.filter(p => p.pago).length ?? 0} parcelas pagas`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow">Total pago</p>
            <p className="text-2xl mt-2"><Money value={totalPago} /></p>
            <p className="text-xs text-muted-foreground mt-1.5">recebido</p>
          </CardContent>
        </Card>
      </div>

      {emprestimo.observacoes && (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          <span className="font-medium">Anotações: </span>
          <span className="text-muted-foreground">{emprestimo.observacoes}</span>
        </div>
      )}

      {renovavel ? (
        <div className="space-y-6 grid lg:grid-cols-2 gap-6 lg:space-y-0">
          {/* Coluna esquerda: cobrança atual */}
          <div>
            <h2 className="text-lg mb-3">Situação atual</h2>
            {(() => {
              const parcelaAberta = (parcelas ?? [])
                .filter(p => !p.pago && !p.rolado)
                .sort((a, b) => b.numero - a.numero)[0]
                ?? (parcelas ?? [])[0]

              return (
                <CardCobrancaRenovavel
                  parcelaAberta={parcelaAberta as Parcela}
                  valorPrincipal={Number(emprestimo.valor_principal)}
                  quitado={emprestimo.status === 'quitado'}
                />
              )
            })()}
          </div>

          {/* Coluna direita: histórico de ciclos */}
          <div>
            <h2 className="text-lg mb-3">Histórico de cobranças</h2>
            <Card>
              <CardContent className="p-4">
                <div className="divide-y">
                  {(parcelas ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground py-6 text-center">Sem cobranças ainda.</p>
                  )}
                  {(parcelas ?? []).map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-3">
                      <span
                        className={
                          'inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0 ' +
                          (p.pago ? 'bg-[var(--success)]/10 text-[var(--success)]'
                          : p.rolado ? 'bg-[var(--warning)]/15 text-[var(--warning-foreground)]'
                          : 'bg-muted text-muted-foreground')
                        }
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Venc. {fmtData(p.vencimento)}</p>
                        {p.data_pagamento && (
                          <p className="text-xs text-muted-foreground">pago em {fmtData(p.data_pagamento)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Money value={Number(p.valor)} />
                        <div className="mt-1">
                          {p.pago && <Badge variant="secondary" className="text-[10px] bg-[var(--success)]/10 text-[var(--success)] border-transparent">Quitado</Badge>}
                          {p.rolado && <Badge variant="outline" className="text-[10px]">Rolou</Badge>}
                          {!p.pago && !p.rolado && <Badge variant="outline" className="text-[10px]">Em aberto</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg mb-3">Parcelas</h2>
          <ParcelasTable parcelas={(parcelas ?? []) as Parcela[]} emprestimoId={id} />
        </div>
      )}
    </div>
  )
}
