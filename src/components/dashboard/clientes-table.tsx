'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, UserX } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { desativarCliente } from '@/app/(dashboard)/clientes/actions'
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
      if (result?.error) {
        toast.error('Erro ao desativar cliente')
      } else {
        toast.success('Cliente desativado')
        router.refresh()
      }
    })
  }

  return (
    <>
      <Input
        placeholder="Buscar por nome, CPF ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell className="text-muted-foreground">{c.cpf ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{c.telefone ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={c.ativo ? 'default' : 'secondary'}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
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
