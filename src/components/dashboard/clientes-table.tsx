'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { avatarColor, iniciais } from '@/lib/avatar-color'
import type { Cliente } from '@/types'

interface Props {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: Props) {
  const router = useRouter()
  const [busca, setBusca] = useState('')

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf?.includes(busca) ||
    c.telefone?.includes(busca)
  )

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
              <TableHead className="w-8" />
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
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onMouseEnter={() => router.prefetch(`/clientes/${c.id}`)}
                onClick={() => router.push(`/clientes/${c.id}`)}
              >
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
