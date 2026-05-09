'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { alterarPlano, toggleCredorAtivo, togglePagamento } from '@/app/admin/actions'
import { fmtData } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

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

const PLANOS = ['free', 'pro', 'premium']
const CICLOS = ['mensal', 'anual']

function vencimentoLabel(data: string | null) {
  if (!data) return <span className="text-muted-foreground">—</span>
  const diff = Math.ceil((new Date(data + 'T12:00:00').getTime() - Date.now()) / 86400000)
  if (diff < 0)  return <span className="text-destructive font-medium">Vencido</span>
  if (diff <= 7) return <span className="text-yellow-600 font-medium">{fmtData(data)} ({diff}d)</span>
  return <span>{fmtData(data)}</span>
}

function PlanoEditor({ credor }: { credor: CredorAdmin }) {
  const [pending, startTransition] = useTransition()
  const [plano, setPlano] = useState(credor.plano)
  const [ciclo, setCiclo] = useState<string>(credor.ciclo_plano ?? '')
  const dirty = plano !== credor.plano || ciclo !== (credor.ciclo_plano ?? '')

  function salvar() {
    if (plano !== 'free' && !ciclo) {
      toast.error('Selecione o ciclo')
      return
    }
    startTransition(async () => {
      await alterarPlano(credor.id, plano, plano === 'free' ? null : ciclo)
      toast.success('Plano atualizado')
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Select value={plano} disabled={pending} onValueChange={(v) => { if (v) setPlano(v) }}>
        <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PLANOS.map(p => <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>)}
        </SelectContent>
      </Select>
      {plano !== 'free' && (
        <Select value={ciclo} disabled={pending} onValueChange={(v) => { if (v) setCiclo(v) }}>
          <SelectTrigger className="w-20 h-7 text-xs"><SelectValue placeholder="ciclo" /></SelectTrigger>
          <SelectContent>
            {CICLOS.map(c => <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      {dirty && (
        <Button size="sm" disabled={pending} onClick={salvar} className="h-7 text-xs px-2">
          {pending ? '...' : 'Salvar'}
        </Button>
      )}
    </div>
  )
}

function PagamentoBtn({ credorId, pago, plano }: { credorId: string; pago: boolean; plano: string }) {
  const [pending, startTransition] = useTransition()
  if (plano === 'free') return <span className="text-muted-foreground text-xs">—</span>
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await togglePagamento(credorId, !pago)
        toast.success(pago ? 'Pagamento desmarcado' : 'Pagamento confirmado')
      })}
      className="flex items-center gap-1 text-sm disabled:opacity-50"
    >
      {pago
        ? <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-600 font-medium">Pago</span></>
        : <><XCircle className="h-4 w-4 text-destructive" /><span className="text-destructive">Pendente</span></>
      }
    </button>
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

export function AdminTable({ credores }: { credores: CredorAdmin[] }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plano / Ciclo</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-center">Clientes</TableHead>
            <TableHead className="text-center">Empréstimos</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Status</TableHead>
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
          {credores.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium whitespace-nowrap">{c.nome}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
              <TableCell><PlanoEditor credor={c} /></TableCell>
              <TableCell className="text-sm whitespace-nowrap">{vencimentoLabel(c.data_vencimento)}</TableCell>
              <TableCell><PagamentoBtn credorId={c.id} pago={c.pagamento_confirmado} plano={c.plano} /></TableCell>
              <TableCell className="text-center">{c.clientes[0]?.count ?? 0}</TableCell>
              <TableCell className="text-center">{c.emprestimos[0]?.count ?? 0}</TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{fmtData(c.created_at)}</TableCell>
              <TableCell>
                <Badge variant={c.ativo ? 'default' : 'secondary'}>
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell><ToggleAtivoBtn credorId={c.id} ativo={c.ativo} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
