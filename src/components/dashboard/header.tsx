// src/components/dashboard/header.tsx
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { iniciais, avatarColor } from '@/lib/avatar-color'
import { estadoConta, trialDiasRestantes } from '@/lib/planos'
import { fmtData } from '@/lib/utils'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: credor } = user
    ? await supabase
        .from('credores')
        .select('nome, plano, created_at, data_vencimento')
        .eq('id', user.id)
        .single()
    : { data: null }

  const nome = credor?.nome ?? user?.email ?? '?'
  const cor  = avatarColor(nome)

  const estado = credor
    ? estadoConta(credor.plano, credor.created_at, credor.data_vencimento)
    : 'trial'

  const label =
    estado === 'ativo' && credor?.data_vencimento
      ? `Ativo até ${fmtData(credor.data_vencimento)}`
      : estado === 'trial' && credor?.created_at
        ? `Trial · ${trialDiasRestantes(credor.created_at)}d restantes`
        : 'Trial'

  return (
    <header className="flex flex-1 items-center justify-end bg-background px-6 gap-3">
      <Badge
        variant="secondary"
        className="gap-1.5 bg-[var(--success)]/10 text-[var(--success)] border-transparent"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {label}
      </Badge>
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-foreground"
          style={{ background: cor }}
        >
          {iniciais(nome)}
        </span>
        <span className="text-sm font-medium">{credor?.nome ?? user?.email}</span>
      </div>
    </header>
  )
}
