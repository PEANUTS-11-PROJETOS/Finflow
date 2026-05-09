import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminTable } from '@/components/admin/admin-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtMoeda } from '@/lib/utils'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const [
    { count: totalCredores },
    { count: creditoresAtivos },
    { data: emprestimosData },
    { data: credores },
  ] = await Promise.all([
    admin.from('credores').select('*', { count: 'exact', head: true }),
    admin.from('credores').select('*', { count: 'exact', head: true }).eq('ativo', true),
    admin.from('emprestimos').select('valor_principal, status'),
    admin.from('credores').select(`
      id, nome, email, plano, ativo, created_at,
      clientes(count),
      emprestimos(count)
    `).order('created_at', { ascending: false }),
  ])

  const totalEmprestado = emprestimosData?.reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0
  const emprestimosAtivos = emprestimosData?.filter(e => e.status === 'ativo').length ?? 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin FinFlow</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total credores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredores ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credores ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditoresAtivos ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empréstimos ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emprestimosAtivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total emprestado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoeda(totalEmprestado)}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Credores cadastrados</h2>
        <AdminTable credores={(credores ?? []) as Parameters<typeof AdminTable>[0]['credores']} />
      </div>
    </div>
  )
}
