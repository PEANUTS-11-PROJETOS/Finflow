import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminTable, type CredorAdmin } from '@/components/admin/admin-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtMoeda } from '@/lib/utils'
import { precoPlano } from '@/lib/planos'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  // --- MOCK para visualização (remover quando houver dados reais) ---
  const MOCK = true

  const credores: CredorAdmin[] = MOCK ? [
    { id: '1', nome: 'Carlos Mendes',   email: 'carlos@email.com',   plano: 'pro',     ciclo_plano: 'mensal', data_vencimento: new Date(Date.now() + 3  * 86400000).toISOString().split('T')[0], pagamento_confirmado: true,  ativo: true,  created_at: '2026-01-10', clientes: [{ count: 8  }], emprestimos: [{ count: 12 }] },
    { id: '2', nome: 'Ana Paula',       email: 'ana@email.com',      plano: 'premium', ciclo_plano: 'anual',  data_vencimento: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], pagamento_confirmado: true,  ativo: true,  created_at: '2026-02-05', clientes: [{ count: 24 }], emprestimos: [{ count: 38 }] },
    { id: '3', nome: 'Roberto Lima',    email: 'roberto@email.com',  plano: 'free',    ciclo_plano: null,     data_vencimento: null,                                                              pagamento_confirmado: false, ativo: true,  created_at: '2026-03-18', clientes: [{ count: 3  }], emprestimos: [{ count: 4  }] },
    { id: '4', nome: 'Fernanda Costa',  email: 'fernanda@email.com', plano: 'pro',     ciclo_plano: 'anual',  data_vencimento: new Date(Date.now() + 6  * 86400000).toISOString().split('T')[0], pagamento_confirmado: false, ativo: true,  created_at: '2026-03-22', clientes: [{ count: 15 }], emprestimos: [{ count: 21 }] },
    { id: '5', nome: 'Marcos Oliveira', email: 'marcos@email.com',   plano: 'free',    ciclo_plano: null,     data_vencimento: null,                                                              pagamento_confirmado: false, ativo: false, created_at: '2026-04-01', clientes: [{ count: 0  }], emprestimos: [{ count: 0  }] },
  ] : []

  const totalFree    = MOCK ? 2 : 0
  const totalPro     = MOCK ? 2 : 0
  const totalPremium = MOCK ? 1 : 0
  const vencendoEm7  = MOCK ? 2 : 0
  const emprestimosAtivos = MOCK ? 75 : 0
  const totalCredores = MOCK ? 5 : 0

  if (!MOCK) {
    const admin = createAdminClient()
    void admin
  }
  // --- fim MOCK ---

  const receitaLicencas = credores
    .filter(c => c.pagamento_confirmado)
    .reduce((s, c) => s + precoPlano(c.plano, c.ciclo_plano), 0)

  const kpis = [
    { label: 'Total usuários', value: totalCredores },
    { label: 'Free', value: totalFree ?? 0 },
    { label: 'Pro', value: totalPro ?? 0 },
    { label: 'Premium', value: totalPremium ?? 0 },
    { label: 'Vencendo em 7 dias', value: vencendoEm7 ?? 0, alert: (vencendoEm7 ?? 0) > 0 },
    { label: 'Empréstimos ativos', value: emprestimosAtivos },
    { label: 'Receita de licenças', value: fmtMoeda(receitaLicencas) },
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
        <AdminTable credores={(credores ?? []) as CredorAdmin[]} />
      </div>
    </div>
  )
}
