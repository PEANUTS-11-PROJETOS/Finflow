'use client'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PLANOS, type Plano } from '@/lib/planos'

interface Props {
  plano: Plano
  totalClientes: number
}

export function BannerLimite({ plano, totalClientes }: Props) {
  const router = useRouter()
  const limite = PLANOS[plano].clientes

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-sm">Limite do plano atingido</p>
        <p className="text-xs text-muted-foreground">
          Você atingiu {totalClientes} de {limite} clientes no plano {PLANOS[plano].nome}.
        </p>
      </div>
      <Button size="sm" onClick={() => router.push('/configuracoes')}>
        Fazer upgrade
      </Button>
    </div>
  )
}
