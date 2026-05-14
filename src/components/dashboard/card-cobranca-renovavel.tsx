// src/components/dashboard/card-cobranca-renovavel.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, RefreshCw, AlertTriangle, SplitSquareHorizontal, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Money } from '@/components/ui/money'
import { pagarJuros, pagarTudo, pagarParcial } from '@/app/(dashboard)/emprestimos/actions'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Parcela } from '@/types'

const INPUT_CLS =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm tabular-nums outline-none transition-colors focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10'

interface Props {
  parcelaAberta: Parcela
  valorPrincipal: number
  quitado: boolean
}

export function CardCobrancaRenovavel({ parcelaAberta, valorPrincipal, quitado }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modoParcial, setModoParcial] = useState(false)
  const [valorPago, setValorPago] = useState('')

  const hoje       = new Date().toISOString().split('T')[0]
  const vencida    = parcelaAberta.vencimento < hoje
  const valorJuros = Number(parcelaAberta.valor_juros ?? 0)
  const total      = Number(parcelaAberta.valor)

  // Cálculo em tempo real do pagamento parcial (lógica intacta)
  const vp         = parseFloat(valorPago) || 0
  const abatimento = Math.max(0, vp - valorJuros)
  const novoSaldo  = Math.max(0, valorPrincipal - abatimento)
  const taxa       = valorPrincipal > 0 ? valorJuros / valorPrincipal : 0
  const proxJuros  = Number((novoSaldo * taxa).toFixed(2))
  const proxTotal  = Number((novoSaldo + proxJuros).toFixed(2))
  const parcialValido = vp >= valorJuros && vp > 0

  function handlePagarJuros() {
    startTransition(async () => {
      const result = await pagarJuros(parcelaAberta.id)
      if (result?.error) { toast.error('Erro ao registrar pagamento'); return }
      toast.success(`Juros de ${fmtMoeda(valorJuros)} registrados. Principal rolou.`)
      router.refresh()
    })
  }

  function handlePagarTudo() {
    startTransition(async () => {
      const result = await pagarTudo(parcelaAberta.id)
      if (result?.error) { toast.error('Erro ao registrar pagamento'); return }
      toast.success('Empréstimo quitado!')
      router.refresh()
    })
  }

  function handlePagarParcial() {
    startTransition(async () => {
      const result = await pagarParcial(parcelaAberta.id, vp)
      if (result?.error) { toast.error(String(result.error)); return }
      if (result.quitado) toast.success('Empréstimo quitado com pagamento parcial!')
      else toast.success(`Pagamento registrado. Novo saldo: ${fmtMoeda(result.novoSaldo ?? 0)}`)
      setModoParcial(false); setValorPago('')
      router.refresh()
    })
  }

  if (quitado) {
    return (
      <Card className="border-[var(--success)]/30 bg-[var(--success)]/5">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-[var(--success)] shrink-0" />
          <div>
            <p className="font-semibold">Empréstimo quitado</p>
            <p className="text-sm text-muted-foreground">O principal foi pago integralmente.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      'overflow-hidden p-0',
      vencida ? 'border-destructive/40' : 'border-foreground',
    )}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/40">
        <div>
          <p className="eyebrow">Cobrança em aberto</p>
          <p className="text-sm font-medium mt-1">
            Vence {fmtData(parcelaAberta.vencimento)}
          </p>
        </div>
        {vencida ? (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Vencida
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1.5 bg-[var(--warning)]/15 text-[var(--warning-foreground)] border-transparent">
            <Calendar className="h-3 w-3" /> Hoje
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Hero: total devido */}
        <div>
          <p className="eyebrow">Total devido</p>
          <p className="mt-1 leading-none text-5xl">
            <Money value={total} display />
          </p>
        </div>

        {/* Decomposição principal / juros */}
        <div className="border-y py-4 space-y-3">
          <div className="flex h-2 gap-1 overflow-hidden rounded-full">
            <div className="bg-foreground" style={{ flex: valorPrincipal }} />
            <div className="bg-[var(--warning)]" style={{ flex: valorJuros }} />
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                <span className="eyebrow">Principal</span>
              </div>
              <p className="mt-1.5 text-lg"><Money value={valorPrincipal} /></p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                <span className="eyebrow">Juros ({(taxa * 100).toFixed(1)}%)</span>
              </div>
              <p className="mt-1.5 text-lg"><Money value={valorJuros} tone="warning" /></p>
            </div>
          </div>
        </div>

        {/* Ações OU modo parcial */}
        {modoParcial ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Quanto o cliente pagou?</p>
            <input
              type="number"
              step="0.01"
              min={valorJuros}
              placeholder={`Mín. ${fmtMoeda(valorJuros)} (juros)`}
              value={valorPago}
              onChange={e => setValorPago(e.target.value)}
              className={INPUT_CLS}
              autoFocus
            />

            {vp > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cobre juros</span>
                  <Money value={Math.min(vp, valorJuros)} tone="warning" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abate do principal</span>
                  <Money value={abatimento} tone="success" />
                </div>
                <div className="flex justify-between font-medium border-t pt-1.5 mt-1.5">
                  <span>Novo saldo devedor</span>
                  <Money value={novoSaldo} />
                </div>
                {novoSaldo > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Próximo ciclo</span>
                    <span><Money value={proxTotal} tone="muted" /> ({fmtMoeda(proxJuros)} juros)</span>
                  </div>
                )}
                {!parcialValido && vp > 0 && (
                  <p className="text-destructive">Valor mínimo: {fmtMoeda(valorJuros)} (cobre os juros)</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={pending || !parcialValido} onClick={handlePagarParcial} className="flex-1">
                {pending ? 'Registrando...' : 'Confirmar'}
              </Button>
              <Button size="sm" variant="outline" disabled={pending}
                onClick={() => { setModoParcial(false); setValorPago('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="eyebrow">Como o cliente pagou?</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" disabled={pending} onClick={handlePagarJuros}
                className="flex h-auto flex-col items-start gap-1.5 py-3 px-3 text-left">
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs font-medium">Só os juros</span>
                <span className="text-[11px] text-muted-foreground"><Money value={valorJuros} /></span>
              </Button>
              <Button variant="outline" disabled={pending} onClick={() => setModoParcial(true)}
                className="flex h-auto flex-col items-start gap-1.5 py-3 px-3 text-left">
                <SplitSquareHorizontal className="h-4 w-4" />
                <span className="text-xs font-medium">Valor parcial</span>
                <span className="text-[11px] text-muted-foreground">abate saldo</span>
              </Button>
              <Button disabled={pending} onClick={handlePagarTudo}
                className="flex h-auto flex-col items-start gap-1.5 py-3 px-3 text-left bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold">Pagou tudo</span>
                <span className="text-[11px] opacity-85"><Money value={total} /></span>
              </Button>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Pagar só os juros rola o principal para o próximo mês.
            </p>
          </>
        )}

        {vencida && !modoParcial && (
          <p className="text-xs text-destructive">
            Esta cobrança está em atraso. Registre o pagamento ou role para o próximo mês.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
