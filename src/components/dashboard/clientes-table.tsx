// src/components/dashboard/clientes-table.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, UserX, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { desativarCliente } from '@/app/(dashboard)/clientes/actions'
import { avatarColor, iniciais } from '@/lib/avatar-color'
import type { Cliente } from '@/types'

interface Props {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: Props) {
  const router    = useRouter()
  const [pending, startTransition] = useTransition()
  const [busca, setBusca]           = useState('')
  const [confirmId, setConfirmId]   = useState<string | null>(null)

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf?.includes(busca) ||
    c.telefone?.includes(busca)
  )

  function handleDesativar(id: string) {
    startTransition(async () => {
      const result = await desativarCliente(id)
      setConfirmId(null)
      if (result?.error) toast.error('Erro ao desativar cliente')
      else { toast.success('Cliente desativado'); router.refresh() }
    })
  }

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou telefone…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-foreground shrink-0"
                      style={{ background: avatarColor(c.nome) }}
                    >
                      {iniciais(c.nome)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.nome}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.cpf ?? '—'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{c.telefone ?? '—'}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[240px]">
                  {c.email ?? '—'}
                </TableCell>
                <TableCell>
                  {c.ativo ? (
                    <Badge variant="secondary" className="gap-1.5 bg-[var(--success)]/10 text-[var(--success)] border-transparent">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/clientes/${c.id}`} />}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      {c.ativo && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setConfirmId(c.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Desativar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar cliente?</DialogTitle>
            <DialogDescription>
              O cliente não aparecerá mais na lista de ativos, mas seus empréstimos serão preservados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => confirmId && handleDesativar(confirmId)}
            >
              {pending ? 'Desativando...' : 'Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
