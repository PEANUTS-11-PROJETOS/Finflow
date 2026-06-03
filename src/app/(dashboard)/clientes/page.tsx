import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClientesTable } from '@/components/dashboard/clientes-table'
import { Plus } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientes } = await supabase.from('clientes').select('*').order('nome')
  const total = clientes?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} cliente{total === 1 ? '' : 's'} cadastrado{total === 1 ? '' : 's'}
          </p>
        </div>
        <Button render={<Link href="/clientes/novo" />}>
          <Plus className="mr-2 h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <ClientesTable clientes={clientes ?? []} />
    </div>
  )
}
