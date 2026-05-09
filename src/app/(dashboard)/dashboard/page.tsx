import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtMoeda } from '@/lib/utils'
import { Users, HandCoins, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: totalClientes },
    { data: emprestimos },
    { data: parcelasVencidas },
  ] = await Promise.all([
    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true),
    supabase
      .from('emprestimos')
      .select('valor_principal, status')
      .eq('status', 'ativo'),
    supabase
      .from('parcelas')
      .select('valor')
      .eq('pago', false)
      .lt('vencimento', new Date().toISOString().split('T')[0]),
  ])

  const totalEmprestado = emprestimos?.reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0
  const totalVencido    = parcelasVencidas?.reduce((s, p) => s + Number(p.valor), 0) ?? 0

  const cards = [
    { title: 'Clientes ativos',    value: String(totalClientes ?? 0),    icon: Users,          desc: 'cadastrados' },
    { title: 'Empréstimos ativos', value: String(emprestimos?.length ?? 0), icon: HandCoins,    desc: 'em aberto' },
    { title: 'Total emprestado',   value: fmtMoeda(totalEmprestado),     icon: TrendingUp,     desc: 'em carteira' },
    { title: 'Parcelas vencidas',  value: fmtMoeda(totalVencido),        icon: AlertTriangle,  desc: 'a cobrar', danger: totalVencido > 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, desc, danger }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${danger ? 'text-destructive' : ''}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
