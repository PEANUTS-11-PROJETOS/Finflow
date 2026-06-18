import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Money } from '@/components/ui/money'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function InadimplentesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date().toISOString().split('T')[0]

  const { data: parcelas } = await supabase
    .from('parcelas')
    .select('valor, vencimento, emprestimos(id, tipo, clientes(id, nome))')
    .eq('pago', false)
    .eq('rolado', false)
    .lt('vencimento', hoje)
    .order('vencimento', { ascending: true })

  type AtrasadoItem = {
    clienteId: string
    clienteNome: string
    empId: string
    tipo: string
    total: number
    numParcelas: number
    maisAntiga: string
  }

  const map = new Map<string, AtrasadoItem>()
  for (const p of parcelas ?? []) {
    const emp = p.emprestimos as unknown as { id: string; tipo: string; clientes: { id: string; nome: string } | null } | null
    if (!emp?.clientes) continue
    const existing = map.get(emp.id)
    if (existing) {
      existing.total += Number(p.valor)
      existing.numParcelas++
    } else {
      map.set(emp.id, {
        clienteId: emp.clientes.id,
        clienteNome: emp.clientes.nome,
        empId: emp.id,
        tipo: emp.tipo,
        total: Number(p.valor),
        numParcelas: 1,
        maisAntiga: p.vencimento as string,
      })
    }
  }

  const atrasados = Array.from(map.values())
  const totalGeral = atrasados.reduce((s, a) => s + a.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Em atraso
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Parcelas vencidas não pagas
          </p>
        </div>
        {atrasados.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total inadimplente</p>
            <p className="text-2xl font-mono text-destructive"><Money value={totalGeral} tone="danger" /></p>
          </div>
        )}
      </div>

      {atrasados.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <p className="text-4xl">✅</p>
            <p className="text-sm font-medium">Nenhum atraso</p>
            <p className="text-xs text-muted-foreground">Todos os empréstimos estão em dia.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {atrasados.map((a) => {
            const diasAtraso = Math.floor((Date.now() - new Date(a.maisAntiga + 'T12:00:00').getTime()) / 86400000)
            return (
              <Link key={a.empId} href={`/emprestimos/${a.empId}`}
                className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-card px-4 py-4 hover:border-destructive/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-semibold flex-none">
                  {a.clienteNome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.clienteNome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.tipo === 'price' ? 'Tabela Price' : 'Renovável'}
                    {' · '}
                    {a.numParcelas} {a.numParcelas === 1 ? 'parcela vencida' : 'parcelas vencidas'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-destructive"><Money value={a.total} tone="danger" /></p>
                  <Badge variant="destructive" className="mt-1 text-[10px]">
                    {diasAtraso}d em atraso
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-none" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
