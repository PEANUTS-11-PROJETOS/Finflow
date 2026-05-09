import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClientesTable } from '@/components/dashboard/clientes-table'
import { BannerLimite } from '@/components/dashboard/banner-limite'
import { checkLimitePlano } from '@/lib/plano-guard'
import { Plus } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: clientes }, limite] = await Promise.all([
    supabase.from('clientes').select('*').order('nome'),
    checkLimitePlano(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {limite.totalClientes} {limite.limite === -1 ? '' : `/ ${limite.limite}`} clientes ativos
          </p>
        </div>
        <Button asChild disabled={!limite.permitido}>
          <Link href="/clientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      {!limite.permitido && (
        <BannerLimite plano={limite.plano} totalClientes={limite.totalClientes} />
      )}

      <ClientesTable clientes={clientes ?? []} />
    </div>
  )
}
