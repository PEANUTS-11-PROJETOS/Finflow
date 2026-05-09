'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { pagarJuros, pagarTudo } from '@/app/(dashboard)/emprestimos/actions'
import { fmtMoeda, fmtData } from '@/lib/utils'
import type { Parcela } from '@/types'

interface Props {
  parcelaAberta: Parcela
  valorPrincipal: number
  quitado: boolean
}

export function CardCobrancaRenovavel({ parcelaAberta, valorPrincipal, quitado }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const hoje     = new Date().toISOString().split('T')[0]
  const vencida  = parcelaAberta.vencimento < hoje
  const valorJuros = Number(parcelaAberta.valor_juros ?? 0)

  function handlePagarJuros() {
    startTransition(async () => {
      const result = await pagarJuros(parcelaAberta.id)
      if (result?.error) { toast.error('Erro ao registrar pagamento'); return }
      toast.success(`Juros de ${fmtMoeda(valorJuros)} registrados. Principal rolou para o próximo mês.`)
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
            {vencida ? (
              <><AlertTriangle className="mr-1 h-3 w-3" />Vencida</>
            ) : 'Em aberto'}
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
            <span className="text-muted-foreground">Principal</span>
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

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            disabled={pending}
            onClick={handlePagarJuros}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-medium">Pagou só os juros</span>
            <span className="text-xs text-muted-foreground">{fmtMoeda(valorJuros)}</span>
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

        {vencida && (
          <p className="text-xs text-destructive">
            Esta cobrança está em atraso. Registre o pagamento ou rolar para o próximo mês.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
