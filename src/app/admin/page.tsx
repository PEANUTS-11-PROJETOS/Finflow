import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminTable, type CredorAdmin } from '@/components/admin/admin-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtMoeda } from '@/lib/utils'
import { precoPlano } from '@/lib/planos'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'
const TEST_EMAIL = 'soaresvinicius1112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const { data: credores } = await admin
    .from('credores')
    .select(`id, nome, email, plano, ciclo_plano, data_vencimento, pagamento_confirmado, ativo, created_at, clientes(count), emprestimos(count)`)
    .neq('email', ADMIN_EMAIL)
    .neq('email', TEST_EMAIL)
    .order('created_at', { ascending: false })

  const lista = (credores ?? []) as CredorAdmin[]
  const credorIds = lista.map(c => c.id)

  const { data: emprestimosData } = credorIds.length > 0
    ? await admin.from('emprestimos').select('status').in('credor_id', credorIds)
    : { data: [] }

  const hoje = new Date()
  const em7 = new Date(hoje.getTime() + 7 * 86400000).toISOString().split('T')[0]

  const totalCredores = lista.length
  const totalFree     = lista.filter(c => c.plano === 'free').length
  const totalPro      = lista.filter(c => c.plano === 'pro').length
  const totalPremium  = lista.filter(c => c.plano === 'premium').length
  const vencendoEm7   = lista.filter(c => c.data_vencimento && c.data_vencimento <= em7 && c.ativo).length
  const emprestimosAtivos = emprestimosData?.filter(e => e.status === 'ativo').length ?? 0
  const receitaLicencas = lista
    .filter(c => c.pagamento_confirmado)
    .reduce((s, c) => s + precoPlano(c.plano, c.ciclo_plano), 0)

  const kpis = [
    { label: 'Total usuários',      value: totalCredores },
    { label: 'Free',                value: totalFree },
    { label: 'Pro',                 value: totalPro },
    { label: 'Premium',             value: totalPremium },
    { label: 'Vencendo em 7 dias',  value: vencendoEm7, alert: vencendoEm7 > 0 },
    { label: 'Empréstimos ativos',  value: emprestimosAtivos },
    { label: 'Receita de licenças', value: fmtMoeda(receitaLicencas / 100) },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin FinFlow</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${k.alert ? 'text-yellow-600' : ''}`}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Credores cadastrados</h2>
        <AdminTable credores={lista} />
      </div>
    </div>
  )
}
