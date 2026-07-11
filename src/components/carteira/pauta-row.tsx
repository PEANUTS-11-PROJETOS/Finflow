'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, RefreshCw, SplitSquareHorizontal, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { fmtMoeda, cn } from '@/lib/utils'
import { linkCobranca } from '@/lib/whatsapp-link'
import { pagarTudo, pagarJuros, marcarParcela } from '@/app/(dashboard)/emprestimos/actions'
import { ParcialModal } from './parcial-modal'

export interface PautaItem {
  parcelaId: string
  tipo: 'price' | 'renovavel'
  clienteNome: string
  clienteTelefone: string | null
  valorPego: number      // principal do empréstimo
  valorParcela: number   // total do vencimento
  valorJuros: number     // juros da parcela (0 no price)
  vencimento: string
  baixa: 'tudo' | 'parcial' | 'juros' | null
  pago: boolean
  rolado: boolean
}

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function PautaRow({ item }: { item: PautaItem }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmar, setConfirmar] = useState<'tudo' | 'juros' | null>(null)
  const [parcialOpen, setParcialOpen] = useState(false)

  const baixado = item.pago || item.rolado
  const renovavel = item.tipo === 'renovavel'
  const wa = linkCobranca(item.clienteTelefone, item.clienteNome, item.valorParcela, item.vencimento)

  function aplicar(acao: 'tudo' | 'juros') {
    startTransition(async () => {
      const r = acao === 'tudo'
        ? (renovavel ? await pagarTudo(item.parcelaId) : await marcarParcela(item.parcelaId, true))
        : await pagarJuros(item.parcelaId)
      if (r?.error) { toast.error('Erro ao registrar pagamento'); return }
      toast.success(acao === 'tudo' ? 'Pagamento registrado!' : 'Juros registrados. Principal rolou.')
      setConfirmar(null)
      router.refresh()
    })
  }

  const rotuloBaixa = item.rolado
    ? 'Rolou só os juros'
    : item.baixa === 'parcial'
      ? 'Pagou parcial'
      : 'Pagou tudo'

  return (
    <div className={cn(
      'flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4',
      baixado && 'opacity-60',
    )}>
      {/* Cliente + valores */}
      <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
        <div className="h-10 w-10 flex-none rounded-full bg-muted text-foreground/80 flex items-center justify-center text-sm font-semibold">
          {iniciais(item.clienteNome)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{item.clienteNome}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pegou <Money value={item.valorPego} /> · Parcela <Money value={item.valorParcela} />
          </p>
        </div>
      </div>

      {/* Ações / estado */}
      {baixado ? (
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
            <CheckCircle2 className="h-4 w-4" /> {rotuloBaixa}
          </span>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon-sm" className="text-[var(--success)]">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      ) : confirmar ? (
        <div className="flex items-center gap-2 sm:justify-end">
          <span className="text-xs text-muted-foreground">
            Confirmar {confirmar === 'tudo' ? fmtMoeda(item.valorParcela) : `juros de ${fmtMoeda(item.valorJuros)}`}?
          </span>
          <Button size="sm" disabled={pending} onClick={() => aplicar(confirmar)}>
            {pending ? '...' : 'Confirmar'}
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setConfirmar(null)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button size="sm" disabled={pending} onClick={() => setConfirmar('tudo')} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Tudo
          </Button>
          {renovavel && (
            <>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => setParcialOpen(true)} className="gap-1.5">
                <SplitSquareHorizontal className="h-4 w-4" /> Parcial
              </Button>
              <Button size="sm" variant="outline" disabled={pending} onClick={() => setConfirmar('juros')} className="gap-1.5">
                <RefreshCw className="h-4 w-4" /> Só juros
              </Button>
            </>
          )}
          <a href={wa ?? undefined} target={wa ? '_blank' : undefined} rel="noopener noreferrer" aria-disabled={!wa}>
            <Button variant="outline" size="icon-sm" disabled={!wa} className="text-[var(--success)]">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </a>
        </div>
      )}

      {renovavel && (
        <ParcialModal
          parcelaId={item.parcelaId}
          valorJuros={item.valorJuros}
          valorPrincipal={item.valorPego}
          open={parcialOpen}
          onOpenChange={setParcialOpen}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  )
}
