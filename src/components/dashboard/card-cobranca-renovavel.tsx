'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, RefreshCw, AlertTriangle, SplitSquareHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { pagarJuros, pagarTudo, pagarParcial } from '@/app/(dashboard)/emprestimos/actions'
import { fmtMoeda, fmtData } from '@/lib/utils'
import type { Parcela } from '@/types'

const INPUT_CLS = "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

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

  // Cálculo em tempo real do pagamento parcial
  const vp         = parseFloat(valorPago) || 0
  const abatimento = Math.max(0, vp - valorJuros)
  const novoSaldo  = Math.max(0, valorPrincipal - abatimento)
  const novoJuros  = Number((novoSaldo * (Number(parcelaAberta.valor_juros ?? 0) / valorPrincipal * valorPrincipal / valorPrincipal)).toFixed(2))

  // Calcula taxa implícita para projeção do próximo ciclo
  const taxa        = valorPrincipal > 0 ? valorJuros / valorPrincipal : 0
  const proxJuros   = Number((novoSaldo * taxa).toFixed(2))
  const proxTotal   = Number((novoSaldo + proxJuros).toFixed(2))

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
      if (result.quitado) {
        toast.success('Empréstimo quitado com pagamento parcial!')
      } else {
        toast.success(`Pagamento registrado. Novo saldo: ${fmtMoeda(result.novoSaldo ?? 0)}`)
      }
      setModoParcial(false)
      setValorPago('')
      router.refresh()
    })
  }

  if (quitado) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
          <div>
            <p className="font-semibold">Empréstimo quitado</p>
            <p className="text-sm text-muted-foreground">O principal foi pago integralmente.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={vencida ? 'border-destructive/40 bg-destructive/5' : 'border-primary/30'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cobrança atual</CardTitle>
          <Badge variant={vencida ? 'destructive' : 'outline'}>
            {vencida ? <><AlertTriangle className="mr-1 h-3 w-3" />Vencida</> : 'Em aberto'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vencimento</span>
            <span className={`font-medium ${vencida ? 'text-destructive' : ''}`}>
              {fmtData(parcelaAberta.vencimento)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Principal em aberto</span>
            <span className="font-medium">{fmtMoeda(valorPrincipal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Juros do período</span>
            <span className="font-medium text-amber-600">{fmtMoeda(valorJuros)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total devido</span>
            <span className="text-lg">{fmtMoeda(Number(parcelaAberta.valor))}</span>
          </div>
        </div>

        {/* Modo pagamento parcial */}
        {modoParcial ? (
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <p className="text-sm font-medium">Quanto o cliente pagou?</p>
            <input
              type="number"
              step="0.01"
              min={valorJuros}
              placeholder={`Mín. ${fmtMoeda(valorJuros)} (juros)`}
              value={valorPago}
              onChange={e => setValorPago(e.target.value)}
              className={INPUT_CLS}
            />

            {vp > 0 && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Cobre juros</span>
                  <span className="text-amber-600">{fmtMoeda(Math.min(vp, valorJuros))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Abate do principal</span>
                  <span className="text-blue-600">{fmtMoeda(abatimento)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Novo saldo devedor</span>
                  <span>{fmtMoeda(novoSaldo)}</span>
                </div>
                {novoSaldo > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Próximo ciclo</span>
                    <span>{fmtMoeda(proxTotal)} ({fmtMoeda(proxJuros)} juros)</span>
                  </div>
                )}
                {!parcialValido && vp > 0 && (
                  <p className="text-destructive">Valor mínimo: {fmtMoeda(valorJuros)} (cobre os juros)</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={pending || !parcialValido}
                onClick={handlePagarParcial}
                className="flex-1"
              >
                {pending ? 'Registrando...' : 'Confirmar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => { setModoParcial(false); setValorPago('') }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button
              variant="outline"
              disabled={pending}
              onClick={handlePagarJuros}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-medium">Só os juros</span>
              <span className="text-xs text-muted-foreground">{fmtMoeda(valorJuros)}</span>
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setModoParcial(true)}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium">Valor parcial</span>
              <span className="text-xs text-muted-foreground">abate saldo</span>
            </Button>
            <Button
              disabled={pending}
              onClick={handlePagarTudo}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Pagou tudo</span>
              <span className="text-xs opacity-80">{fmtMoeda(Number(parcelaAberta.valor))}</span>
            </Button>
          </div>
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
