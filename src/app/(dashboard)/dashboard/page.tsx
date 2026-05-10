import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fmtMoeda, fmtData } from '@/lib/utils'
import { Users, HandCoins, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date().toISOString().split('T')[0]

  const [
    { count: totalClientes },
    { data: emprestimos },
    { data: parcelasVencidas },
    { data: parcelasPagas },
    { data: vencimentosHoje },
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
      .eq('rolado', false)
      .lt('vencimento', hoje),
    supabase
      .from('parcelas')
      .select('valor, valor_juros, emprestimos(tipo, valor_principal, num_parcelas)')
      .eq('pago', true),
    supabase
      .from('parcelas')
      .select('id, valor, vencimento, emprestimos(id, tipo, clientes(id, nome))')
      .eq('vencimento', hoje)
      .eq('pago', false)
      .eq('rolado', false),
  ])

  const totalEmprestado = emprestimos?.reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0
  const totalVencido    = parcelasVencidas?.reduce((s, p) => s + Number(p.valor), 0) ?? 0

  // Calcula juros ganhos: renovável usa valor_juros, price estima pela diferença
  const jurosGanhos = parcelasPagas?.reduce((sum, p) => {
    const emp = p.emprestimos as unknown as { tipo: string; valor_principal: number; num_parcelas: number | null } | null
    if (!emp) return sum
    if (emp.tipo === 'renovavel') return sum + Number(p.valor_juros ?? 0)
    const principalPorcao = emp.num_parcelas ? emp.valor_principal / emp.num_parcelas : 0
    return sum + Math.max(0, Number(p.valor) - principalPorcao)
  }, 0) ?? 0

  const cards = [
    { title: 'Clientes ativos',    value: String(totalClientes ?? 0),       icon: Users,          desc: 'cadastrados' },
    { title: 'Empréstimos ativos', value: String(emprestimos?.length ?? 0), icon: HandCoins,      desc: 'em aberto' },
    { title: 'Total emprestado',   value: fmtMoeda(totalEmprestado),        icon: TrendingUp,     desc: 'em carteira' },
    { title: 'Juros ganhos',       value: fmtMoeda(jurosGanhos),            icon: DollarSign,     desc: 'já recebidos', highlight: jurosGanhos > 0 },
    { title: 'Parcelas vencidas',  value: fmtMoeda(totalVencido),           icon: AlertTriangle,  desc: 'a cobrar', danger: totalVencido > 0 },
  ]

  // Agrupa vencimentos de hoje por cliente
  type VencHoje = {
    clienteId: string
    clienteNome: string
    empId: string
    tipo: string
    valor: number
  }

  const vencHojeAgrupados = (vencimentosHoje ?? []).reduce<VencHoje[]>((acc, p) => {
    const emp = p.emprestimos as unknown as { id: string; tipo: string; clientes: { id: string; nome: string } | null } | null
    if (!emp?.clientes) return acc
    acc.push({
      clienteId: emp.clientes.id,
      clienteNome: emp.clientes.nome,
      empId: emp.id,
      tipo: emp.tipo,
      valor: Number(p.valor),
    })
    return acc
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ title, value, icon: Icon, desc, danger, highlight }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${danger ? 'text-destructive' : highlight ? 'text-green-600' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${danger ? 'text-destructive' : highlight ? 'text-green-600' : ''}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vencimentos de hoje */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Vencimentos hoje</h2>
        {vencHojeAgrupados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma parcela vence hoje.</p>
        ) : (
          <div className="space-y-2">
            {vencHojeAgrupados.map((v, i) => (
              <Link
                key={i}
                href={`/emprestimos/${v.empId}`}
                className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{v.clienteNome}</p>
                    <p className="text-xs text-muted-foreground capitalize">{v.tipo === 'price' ? 'Tabela Price' : 'Renovável'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{fmtMoeda(v.valor)}</span>
                  <Badge variant="secondary">Vence hoje</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
