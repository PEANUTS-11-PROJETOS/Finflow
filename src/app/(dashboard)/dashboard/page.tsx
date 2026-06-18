// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Money } from '@/components/ui/money'
import { fmtData } from '@/lib/utils'
import { Users, HandCoins, AlertTriangle, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
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
    supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('emprestimos').select('valor_principal, tipo, status').eq('status', 'ativo'),
    supabase.from('parcelas').select('valor, vencimento, emprestimos(id, tipo, clientes(id, nome))').eq('pago', false).eq('rolado', false).lt('vencimento', hoje).order('vencimento', { ascending: true }),
    supabase.from('parcelas').select('valor, valor_juros, emprestimos(tipo, valor_principal, num_parcelas)').eq('pago', true),
    supabase.from('parcelas').select('id, valor, vencimento, emprestimos(id, tipo, clientes(id, nome))')
      .eq('vencimento', hoje).eq('pago', false).eq('rolado', false),
  ])

  // Totais
  const totalEmprestado = emprestimos?.reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0
  const totalVencido    = parcelasVencidas?.reduce((s, p) => s + Number(p.valor), 0) ?? 0
  const totalHoje       = vencimentosHoje?.reduce((s, p) => s + Number(p.valor), 0) ?? 0

  // Composição da carteira
  const carteiraRenovavel = emprestimos?.filter(e => e.tipo === 'renovavel').reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0
  const carteiraPrice     = emprestimos?.filter(e => e.tipo === 'price').reduce((s, e) => s + Number(e.valor_principal), 0) ?? 0

  // Juros ganhos
  const jurosGanhos = parcelasPagas?.reduce((sum, p) => {
    const emp = p.emprestimos as unknown as { tipo: string; valor_principal: number; num_parcelas: number | null } | null
    if (!emp) return sum
    if (emp.tipo === 'renovavel') return sum + Number(p.valor_juros ?? 0)
    const principalPorcao = emp.num_parcelas ? emp.valor_principal / emp.num_parcelas : 0
    return sum + Math.max(0, Number(p.valor) - principalPorcao)
  }, 0) ?? 0

  // Inadimplentes agrupados por empréstimo
  type AtrasadoItem = { clienteId: string; clienteNome: string; empId: string; tipo: string; total: number; numParcelas: number; maisAntiga: string }
  const atrasadosMap = new Map<string, AtrasadoItem>()
  for (const p of parcelasVencidas ?? []) {
    const emp = p.emprestimos as unknown as { id: string; tipo: string; clientes: { id: string; nome: string } | null } | null
    if (!emp?.clientes) continue
    const existing = atrasadosMap.get(emp.id)
    if (existing) {
      existing.total += Number(p.valor)
      existing.numParcelas++
    } else {
      atrasadosMap.set(emp.id, {
        clienteId: emp.clientes.id,
        clienteNome: emp.clientes.nome,
        empId: emp.id,
        tipo: emp.tipo,
        total: Number(p.valor),
        numParcelas: 1,
        maisAntiga: (p as unknown as { vencimento: string }).vencimento,
      })
    }
  }
  const atrasados = Array.from(atrasadosMap.values())

  // Cobranças de hoje agrupadas
  type VencHoje = { clienteId: string; clienteNome: string; empId: string; tipo: string; valor: number }
  const vencHojeAgrupados = (vencimentosHoje ?? []).reduce<VencHoje[]>((acc, p) => {
    const emp = p.emprestimos as unknown as { id: string; tipo: string; clientes: { id: string; nome: string } | null } | null
    if (!emp?.clientes) return acc
    acc.push({ clienteId: emp.clientes.id, clienteNome: emp.clientes.nome, empId: emp.id, tipo: emp.tipo, valor: Number(p.valor) })
    return acc
  }, [])

  const dataExtenso = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const kpis = [
    { label: 'Carteira ativa',  value: totalEmprestado, sub: `${emprestimos?.length ?? 0} ativos`,          tone: 'default' as const },
    { label: 'Juros ganhos',    value: jurosGanhos,     sub: 'acumulado',                                    tone: 'success' as const, dot: 'var(--success)' },
    { label: 'A receber hoje',  value: totalHoje,       sub: `${vencHojeAgrupados.length} cobranças`,        tone: 'default' as const, dot: 'var(--warning)' },
    { label: 'Em atraso',       value: totalVencido,    sub: `${parcelasVencidas?.length ?? 0} vencidas`,    tone: 'danger' as const,  dot: 'var(--destructive)' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Painel</h1>
        <p className="text-sm text-muted-foreground mt-1 first-letter:uppercase">{dataExtenso} · visão geral da carteira</p>
      </div>

      {/* HERO — Carteira ativa */}
      <Card className="p-7">
        <CardContent className="p-0 space-y-5">
          <div>
            <p className="eyebrow">Carteira ativa</p>
            <div className="flex items-baseline gap-3 mt-2 flex-wrap">
              <span className="leading-none text-5xl"><Money value={totalEmprestado} display /></span>
              <Badge variant="secondary" className="gap-1.5 bg-[var(--success)]/10 text-[var(--success)] border-transparent">
                <TrendingUp className="h-3 w-3" /> em carteira
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl">
              Total emprestado em <b className="text-foreground">{emprestimos?.length ?? 0} empréstimos ativos</b> distribuídos
              entre <b className="text-foreground">{totalClientes ?? 0} clientes</b>.
            </p>
          </div>

          {/* Composição */}
          {totalEmprestado > 0 && (
            <div>
              <p className="eyebrow mb-2">Composição</p>
              <div className="flex h-2.5 gap-0.5 rounded-full overflow-hidden">
                <div className="bg-foreground"        style={{ flex: carteiraRenovavel }} />
                <div className="bg-[var(--success)]"  style={{ flex: carteiraPrice }} />
                <div className="bg-destructive"       style={{ flex: totalVencido || 0.001 }} />
              </div>
              <div className="flex gap-5 mt-2.5 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  Renováveis · <Money value={carteiraRenovavel} tone="muted" />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Tabela Price · <Money value={carteiraPrice} tone="muted" />
                </span>
                {totalVencido > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    Inadimplente · <Money value={totalVencido} tone="muted" />
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="eyebrow">Clientes ativos</span>
            </div>
            <p className="text-3xl font-mono mt-3">{totalClientes ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1.5">cadastrados</p>
          </CardContent>
        </Card>

        {kpis.slice(1).map(k => {
          const isAtrasado = k.label === 'Em atraso' && totalVencido > 0
          const inner = (
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.dot }} />
                <span className="eyebrow">{k.label}</span>
              </div>
              <p className="text-3xl mt-3"><Money value={k.value} tone={k.tone} /></p>
              <p className="text-xs text-muted-foreground mt-1.5">{k.sub}</p>
              {isAtrasado && <p className="text-xs text-destructive mt-2">Ver detalhes →</p>}
            </CardContent>
          )
          return isAtrasado
            ? <Link key={k.label} href="#em-atraso" scroll={true}><Card className="hover:border-destructive/50 transition-colors cursor-pointer">{inner}</Card></Link>
            : <Card key={k.label}>{inner}</Card>
        })}
      </div>

      {/* Cobranças de hoje */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg">Cobranças de hoje</h2>
          {vencHojeAgrupados.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />{fmtData(hoje)}
            </Badge>
          )}
        </div>

        {vencHojeAgrupados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma parcela vence hoje. ☕
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {vencHojeAgrupados.map((v, i) => (
              <Link key={i} href={`/emprestimos/${v.empId}`}
                className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 hover:border-foreground/40 transition-colors">
                <div className="w-9 h-9 rounded-full bg-muted text-foreground/80 flex items-center justify-center text-xs font-semibold flex-none">
                  {v.clienteNome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.clienteNome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.tipo === 'price' ? 'Tabela Price' : 'Renovável'} · vence hoje
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm"><Money value={v.valor} /></p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-none" />
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* Em atraso */}
      {atrasados.length > 0 && (
        <div id="em-atraso">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Em atraso
            </h2>
            <Badge variant="destructive" className="gap-1">
              {atrasados.length} {atrasados.length === 1 ? 'empréstimo' : 'empréstimos'}
            </Badge>
          </div>
          <div className="space-y-2">
            {atrasados.map((a) => {
              const diasAtraso = Math.floor((Date.now() - new Date(a.maisAntiga + 'T12:00:00').getTime()) / 86400000)
              return (
                <Link key={a.empId} href={`/emprestimos/${a.empId}`}
                  className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-card px-4 py-3.5 hover:border-destructive/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-semibold flex-none">
                    {a.clienteNome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.clienteNome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.tipo === 'price' ? 'Tabela Price' : 'Renovável'} · {a.numParcelas} {a.numParcelas === 1 ? 'parcela' : 'parcelas'} · há {diasAtraso}d
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-destructive font-medium"><Money value={a.total} tone="danger" /></p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-none" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
