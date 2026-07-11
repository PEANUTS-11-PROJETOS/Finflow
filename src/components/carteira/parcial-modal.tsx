'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { pagarParcial } from '@/app/(dashboard)/emprestimos/actions'
import { fmtMoeda } from '@/lib/utils'

const INPUT_CLS =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm tabular-nums outline-none transition-colors focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10'

interface Props {
  parcelaId: string
  valorJuros: number
  valorPrincipal: number
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone: () => void
}

export function ParcialModal({ parcelaId, valorJuros, valorPrincipal, open, onOpenChange, onDone }: Props) {
  const [pending, startTransition] = useTransition()
  const [valorPago, setValorPago] = useState('')

  const vp = parseFloat(valorPago) || 0
  const abatimento = Math.max(0, vp - valorJuros)
  const novoSaldo = Math.max(0, valorPrincipal - abatimento)
  const valido = vp >= valorJuros && vp > 0

  function confirmar() {
    startTransition(async () => {
      const r = await pagarParcial(parcelaId, vp)
      if (r?.error) { toast.error(String(r.error)); return }
      if (r.quitado) toast.success('Empréstimo quitado com pagamento parcial!')
      else toast.success(`Pagamento registrado. Novo saldo: ${fmtMoeda(r.novoSaldo ?? 0)}`)
      setValorPago('')
      onOpenChange(false)
      onDone()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quanto o cliente pagou?</DialogTitle>
        </DialogHeader>
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
              <span className="text-muted-foreground">Abate do principal</span>
              <Money value={abatimento} tone="success" />
            </div>
            <div className="flex justify-between font-medium border-t pt-1.5">
              <span>Novo saldo devedor</span>
              <Money value={novoSaldo} />
            </div>
            {!valido && (
              <p className="text-destructive">Valor mínimo: {fmtMoeda(valorJuros)} (cobre os juros)</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button disabled={pending || !valido} onClick={confirmar} className="flex-1">
            {pending ? 'Registrando...' : 'Confirmar'}
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
