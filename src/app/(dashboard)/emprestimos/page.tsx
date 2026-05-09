import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmprestimosTable } from '@/components/dashboard/emprestimos-table'
import { Plus } from 'lucide-react'
import type { Emprestimo } from '@/types'

export default async function EmprestimosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: emprestimos } = await supabase
    .from('emprestimos')
    .select('*, clientes(id, nome)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empréstimos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {emprestimos?.length ?? 0} empréstimos no total
          </p>
        </div>
        <Button asChild>
          <Link href="/emprestimos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo empréstimo
          </Link>
        </Button>
      </div>

      <EmprestimosTable emprestimos={(emprestimos ?? []) as Emprestimo[]} />
    </div>
  )
}
