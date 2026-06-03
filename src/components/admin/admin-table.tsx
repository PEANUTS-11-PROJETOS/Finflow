'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { confirmarPagamento, reverterParaTrial, toggleCredorAtivo } from '@/app/admin/actions'
import { fmtData } from '@/lib/utils'
import { estadoConta, trialDiasRestantes, type Ciclo, type EstadoConta } from '@/lib/planos'

export type CredorAdmin = {
  id: string
  nome: string
  email: string
  plano: string
  ciclo_plano: string | null
  data_vencimento: string | null
  pagamento_confirmado: boolean
  ativo: boolean
  created_at: string
  clientes: { count: number }[]
  emprestimos: { count: number }[]
}

function StatusBadge({ estado, dias }: { estado: EstadoConta; dias: number | null }) {
  if (estado === 'ativo') {
    return <Badge className="bg-[var(--success)]/15 text-[var(--success)] border-transparent">Ativo</Badge>
  }
  if (estado === 'trial') {
    return (
      <Badge variant="secondary" className="gap-1">
        Teste
        {dias !== null && <span className="text-muted-foreground">· {dias}d</span>}
      </Badge>
    )
  }
  return <Badge variant="destructive">Expirado</Badge>
}

function AcoesPlano({ credor, estado }: { credor: CredorAdmin; estado: EstadoConta }) {
  const [pending, startTransition] = useTransition()

  function ativar(ciclo: Ciclo) {
    startTransition(async () => {
      await confirmarPagamento(credor.id, ciclo)
      toast.success(estado === 'ativo' ? `Renovado +${ciclo === 'anual' ? '1 ano' : '30 dias'}` : `Ativado (${ciclo})`)
    })
  }

  function reverter() {
    startTransition(async () => {
      await reverterParaTrial(credor.id)
      toast.success('Revertido para teste')
    })
  }

  const labelMensal = estado === 'ativo' ? '+30d' : 'Mensal'
  const labelAnual  = estado === 'ativo' ? '+1 ano' : 'Anual'

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => ativar('mensal')} className="h-7 text-xs px-2">
        {labelMensal}
      </Button>
      <Button size="sm" disabled={pending} onClick={() => ativar('anual')} className="h-7 text-xs px-2">
        {labelAnual}
      </Button>
      {estado === 'ativo' && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={reverter} className="h-7 text-xs px-2 text-muted-foreground">
          Reverter
        </Button>
      )}
    </div>
  )
}

function ToggleAtivoBtn({ credorId, ativo }: { credorId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button size="sm" variant={ativo ? 'destructive' : 'outline'} disabled={pending}
      onClick={() => startTransition(async () => {
        await toggleCredorAtivo(credorId, !ativo)
        toast.success(ativo ? 'Conta desativada' : 'Conta reativada')
      })}
    >
      {pending ? '...' : ativo ? 'Desativar' : 'Reativar'}
    </Button>
  )
}

function vencimentoLabel(estado: EstadoConta, data: string | null, ciclo: string | null) {
  if (estado === 'trial') return <span className="text-muted-foreground">—</span>
  if (estado === 'expirado') return <span className="text-destructive font-medium">Expirado</span>
  if (!data) return <span className="text-muted-foreground">—</span>
  const diff = Math.ceil((new Date(data + 'T12:00:00').getTime() - Date.now()) / 86400000)
  const cicloLabel = ciclo ? <span className="text-xs text-muted-foreground ml-1">({ciclo})</span> : null
  if (diff <= 7) return <span className="text-yellow-600 font-medium">{fmtData(data)} ({diff}d){cicloLabel}</span>
  return <span>{fmtData(data)}{cicloLabel}</span>
}

export function AdminTable({ credores }: { credores: CredorAdmin[] }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead className="text-center">Clientes</TableHead>
            <TableHead className="text-center">Empréstimos</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {credores.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                Nenhum credor cadastrado.
              </TableCell>
            </TableRow>
          )}
          {credores.map(c => {
            const estado = estadoConta(c.plano, c.created_at, c.data_vencimento)
            const diasTrial = estado === 'trial' ? trialDiasRestantes(c.created_at) : null
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium whitespace-nowrap">{c.nome}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                <TableCell><StatusBadge estado={estado} dias={diasTrial} /></TableCell>
                <TableCell className="text-sm whitespace-nowrap">{vencimentoLabel(estado, c.data_vencimento, c.ciclo_plano)}</TableCell>
                <TableCell><AcoesPlano credor={c} estado={estado} /></TableCell>
                <TableCell className="text-center">{c.clientes[0]?.count ?? 0}</TableCell>
                <TableCell className="text-center">{c.emprestimos[0]?.count ?? 0}</TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{fmtData(c.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={c.ativo ? 'default' : 'secondary'}>
                    {c.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell><ToggleAtivoBtn credorId={c.id} ativo={c.ativo} /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
