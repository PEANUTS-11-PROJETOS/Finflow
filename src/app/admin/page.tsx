import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminTable, type CredorAdmin } from '@/components/admin/admin-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtMoeda } from '@/lib/utils'
import { PLANO, estadoConta } from '@/lib/planos'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'
const TEST_EMAIL = 'soaresvinicius1112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const { data: credores } = await admin
    .from('credores')
    .select(`id, nome, email, telefone, plano, ciclo_plano, data_vencimento, pagamento_confirmado, ativo, created_at, clientes(count), emprestimos(count)`)
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

  const comEstado = lista.map(c => ({
    ...c,
    estado: estadoConta(c.plano, c.created_at, c.data_vencimento),
  }))

  const totalCredores = comEstado.length
  const emTrial       = comEstado.filter(c => c.estado === 'trial').length
  const ativos        = comEstado.filter(c => c.estado === 'ativo').length
  const expirados     = comEstado.filter(c => c.estado === 'expirado').length
  const vencendoEm7   = comEstado.filter(c =>
    c.estado === 'ativo' && c.data_vencimento && c.data_vencimento <= em7
  ).length
  const emprestimosAtivos = emprestimosData?.filter(e => e.status === 'ativo').length ?? 0
  const receitaCentavos = comEstado
    .filter(c => c.estado === 'ativo' && c.ciclo_plano)
    .reduce((s, c) => s + (c.ciclo_plano === 'anual' ? PLANO.preco_anual : PLANO.preco_mensal), 0)

  const kpis = [
    { label: 'Total usuários',      value: totalCredores },
    { label: 'Em teste',            value: emTrial },
    { label: 'Ativos',              value: ativos },
    { label: 'Expirados',           value: expirados, alert: expirados > 0 },
    { label: 'Vencendo em 7 dias',  value: vencendoEm7, alert: vencendoEm7 > 0 },
    { label: 'Empréstimos ativos',  value: emprestimosAtivos },
    { label: 'Receita comprometida', value: fmtMoeda(receitaCentavos / 100) },
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
