'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { alterarPlano, toggleCredorAtivo } from '@/app/admin/actions'
import { fmtData } from '@/lib/utils'

type CredorAdmin = {
  id: string
  nome: string
  email: string
  plano: string
  ativo: boolean
  created_at: string
  clientes: { count: number }[]
  emprestimos: { count: number }[]
}

const PLANOS = ['free', 'pro', 'premium']

function PlanoSelect({ credorId, planoAtual }: { credorId: string; planoAtual: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Select
      value={planoAtual}
      disabled={pending}
      onValueChange={(novoPlano) =>
        startTransition(async () => {
          if (!novoPlano) return
          await alterarPlano(credorId, novoPlano)
          toast.success('Plano atualizado')
        })
      }
    >
      <SelectTrigger className="w-28 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLANOS.map(p => (
          <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ToggleAtivoBtn({ credorId, ativo }: { credorId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant={ativo ? 'destructive' : 'outline'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleCredorAtivo(credorId, !ativo)
          toast.success(ativo ? 'Conta desativada' : 'Conta reativada')
        })
      }
    >
      {pending ? '...' : ativo ? 'Desativar' : 'Reativar'}
    </Button>
  )
}

export function AdminTable({ credores }: { credores: CredorAdmin[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plano</TableHead>
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
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Nenhum credor cadastrado.
              </TableCell>
            </TableRow>
          )}
          {credores.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nome}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
              <TableCell>
                <PlanoSelect credorId={c.id} planoAtual={c.plano} />
              </TableCell>
              <TableCell className="text-center">{c.clientes[0]?.count ?? 0}</TableCell>
              <TableCell className="text-center">{c.emprestimos[0]?.count ?? 0}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{fmtData(c.created_at)}</TableCell>
              <TableCell>
                <Badge variant={c.ativo ? 'default' : 'secondary'}>
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <ToggleAtivoBtn credorId={c.id} ativo={c.ativo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
