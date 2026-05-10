import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FormEmprestimo } from '@/components/dashboard/form-emprestimo'

export default async function NovoEmprestimoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  if (!clientes || clientes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Novo empréstimo</h1>
        <p className="text-muted-foreground">
          Você precisa ter ao menos um cliente ativo antes de criar um empréstimo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo empréstimo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          As parcelas serão geradas automaticamente pela Tabela Price.
        </p>
      </div>
      <FormEmprestimo clientes={clientes} />
    </div>
  )
}
