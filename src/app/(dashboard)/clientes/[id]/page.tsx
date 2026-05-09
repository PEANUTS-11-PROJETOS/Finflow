import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormCliente } from '@/components/dashboard/form-cliente'
import { EmprestimosTable } from '@/components/dashboard/emprestimos-table'
import { ArrowLeft, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { Emprestimo } from '@/types'

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cliente }, { data: emprestimos }] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', id).eq('credor_id', user.id).single(),
    supabase.from('emprestimos').select('*, clientes(id, nome)').eq('cliente_id', id).order('created_at', { ascending: false }),
  ])

  if (!cliente) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/clientes" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{cliente.nome}</h1>
            <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
              {cliente.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {[cliente.cpf, cliente.telefone, cliente.email].filter(Boolean).join(' · ') || 'Sem informações de contato'}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-medium mb-4">Editar dados</h2>
        <FormCliente cliente={cliente} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Empréstimos</h2>
          <Button size="sm" render={<Link href={`/emprestimos/novo?cliente=${id}`} />}>
            <Plus className="mr-2 h-4 w-4" />
            Novo empréstimo
          </Button>
        </div>
        <EmprestimosTable emprestimos={(emprestimos ?? []) as Emprestimo[]} />
      </div>
    </div>
  )
}
