'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { confirmarPagamento, estenderTrial, reverterParaTrial, toggleCredorAtivo } from '@/app/admin/actions'
import { fmtData } from '@/lib/utils'
import { estadoConta, trialDiasRestantes, type Ciclo, type EstadoConta } from '@/lib/planos'
import { MessageCircle, Search } from 'lucide-react'

export type CredorAdmin = {
  id: string
  nome: string
  email: string
  telefone: string | null
  plano: string
  ciclo_plano: string | null
  data_vencimento: string | null
  pagamento_confirmado: boolean
  ativo: boolean
  created_at: string
  clientes: { count: number }[]
  emprestimos: { count: number }[]
}

type FiltroEstado = 'todos' | 'trial' | 'ativo' | 'expirado'

function StatusBadge({ estado, dias }: { estado: EstadoConta; dias: number | null }) {
  if (estado === 'ativo') return <Badge className="bg-[var(--success)]/15 text-[var(--success)] border-transparent">Ativo</Badge>
  if (estado === 'trial') return <Badge variant="secondary" className="gap-1">Teste{dias !== null && <span className="text-muted-foreground">· {dias}d</span>}</Badge>
  return <Badge variant="destructive">Expirado</Badge>
}

function AcoesPlano({ credor, estado }: { credor: CredorAdmin; estado: EstadoConta }) {
  const [pending, startTransition] = useTransition()

  function ativar(ciclo: Ciclo) {
    startTransition(async () => {
      await confirmarPagamento(credor.id, ciclo)
      toast.success(estado === 'ativo' ? `Renovado +${ciclo === 'anual' ? '1 ano' : '30 dias'}` : 'Conta ativada')
    })
  }

  function reverter() {
    startTransition(async () => {
      await reverterParaTrial(credor.id)
      toast.success('Revertido para teste')
    })
  }

  function extender() {
    startTransition(async () => {
      await estenderTrial(credor.id)
      toast.success('+15 dias de acesso concedidos')
    })
  }

  if (estado === 'trial') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button size="sm" variant="outline" disabled={pending} onClick={extender} className="h-7 text-xs px-2">
          +15d
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => ativar('mensal')} className="h-7 text-xs px-2">
          Ativar mensal
        </Button>
        <Button size="sm" disabled={pending} onClick={() => ativar('anual')} className="h-7 text-xs px-2">
          Ativar anual
        </Button>
      </div>
    )
  }

  if (estado === 'expirado') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button size="sm" variant="outline" disabled={pending} onClick={extender} className="h-7 text-xs px-2">
          +15d
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => ativar('mensal')} className="h-7 text-xs px-2">
          Reativar mensal
        </Button>
        <Button size="sm" disabled={pending} onClick={() => ativar('anual')} className="h-7 text-xs px-2">
          Reativar anual
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => ativar('mensal')} className="h-7 text-xs px-2">
        +30d
      </Button>
      <Button size="sm" disabled={pending} onClick={() => ativar('anual')} className="h-7 text-xs px-2">
        +1 ano
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={reverter} className="h-7 text-xs px-2 text-muted-foreground">
        Reverter
      </Button>
    </div>
  )
}

function ToggleAtivoBtn({ credorId, ativo }: { credorId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      className={`h-7 text-xs px-2 ${ativo ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground'}`}
      onClick={() => startTransition(async () => {
        await toggleCredorAtivo(credorId, !ativo)
        toast.success(ativo ? 'Conta bloqueada' : 'Conta desbloqueada')
      })}
    >
      {pending ? '...' : ativo ? 'Bloquear' : 'Desbloquear'}
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
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')

  const contagens: Record<FiltroEstado, number> = {
    todos: credores.length,
    trial: credores.filter(c => estadoConta(c.plano, c.created_at, c.data_vencimento) === 'trial').length,
    ativo: credores.filter(c => estadoConta(c.plano, c.created_at, c.data_vencimento) === 'ativo').length,
    expirado: credores.filter(c => estadoConta(c.plano, c.created_at, c.data_vencimento) === 'expirado').length,
  }

  const lista = credores.filter(c => {
    const estado = estadoConta(c.plano, c.created_at, c.data_vencimento)
    if (filtro !== 'todos' && estado !== filtro) return false
    if (busca) {
      const q = busca.toLowerCase()
      return c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    }
    return true
  })

  const filtroLabels: Record<FiltroEstado, string> = {
    todos: 'Todos',
    trial: 'Teste',
    ativo: 'Ativos',
    expirado: 'Expirados',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['todos', 'trial', 'ativo', 'expirado'] as FiltroEstado[]).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filtro === f ? 'default' : 'outline'}
              className="h-8 text-xs"
              onClick={() => setFiltro(f)}
            >
              {filtroLabels[f]}
              <span className="ml-1 opacity-60">{contagens[f]}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="text-center">Clientes</TableHead>
              <TableHead className="text-center">Empréstimos</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
            {lista.map(c => {
              const estado = estadoConta(c.plano, c.created_at, c.data_vencimento)
              const diasTrial = estado === 'trial' ? trialDiasRestantes(c.created_at) : null
              return (
                <TableRow key={c.id} className={!c.ativo ? 'opacity-50' : ''}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {c.nome}
                      {!c.ativo && <Badge variant="secondary" className="text-[10px] px-1">bloqueado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="space-y-0.5">
                      <div>{c.email}</div>
                      {c.telefone && (
                        <a
                          href={`https://wa.me/55${c.telefone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-green-600 hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {c.telefone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge estado={estado} dias={diasTrial} /></TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{vencimentoLabel(estado, c.data_vencimento, c.ciclo_plano)}</TableCell>
                  <TableCell><AcoesPlano credor={c} estado={estado} /></TableCell>
                  <TableCell className="text-center">{c.clientes[0]?.count ?? 0}</TableCell>
                  <TableCell className="text-center">{c.emprestimos[0]?.count ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{fmtData(c.created_at)}</TableCell>
                  <TableCell><ToggleAtivoBtn credorId={c.id} ativo={c.ativo} /></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
